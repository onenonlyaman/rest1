import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { DEFAULT_MENU_ITEMS } from './defaultMenu.js'

// Load environment variables for local dev / Node environments
try {
  dotenv.config()
} catch {}

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  )
}

export function isDbConfigured() {
  return Boolean(getConnectionString())
}

export function getSqlClient() {
  const conn = getConnectionString()
  if (!conn) return null
  return neon(conn)
}

function mapRowToItem(row) {
  return {
    id: row.item_id !== undefined && row.item_id !== null ? Number(row.item_id) : Number(row.id),
    name: row.name || '',
    subtitle: row.subtitle || '',
    description: row.description || '',
    price: Number(row.price || 0),
    category: row.category || 'Dosa',
    spiceLevel: Number(row.spice_level || 0),
    tags: Array.isArray(row.tags) ? row.tags : typeof row.tags === 'string' ? row.tags.split(',').filter(Boolean) : [],
    zone: row.zone || 'cream',
    image: row.image || '',
    prep: row.prep || '',
    isHighlight: Boolean(row.is_highlight),
    highlightOrder: Number(row.highlight_order || 0),
    isAvailable: row.is_available !== false,
    sortOrder: Number(row.sort_order || 0),
  }
}

/**
 * Ensures table exists and optionally seeds it with default menu items
 */
export async function initDb(forceSeed = false) {
  const sql = getSqlClient()
  if (!sql) {
    return {
      success: false,
      configured: false,
      message: 'DATABASE_URL is not set. Running in local fallback mode.',
    }
  }

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      item_id INTEGER UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      price NUMERIC(10, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      spice_level INTEGER DEFAULT 0,
      tags TEXT[] DEFAULT '{}',
      zone VARCHAR(50) DEFAULT 'cream',
      image VARCHAR(500) DEFAULT '',
      prep TEXT DEFAULT '',
      is_highlight BOOLEAN DEFAULT FALSE,
      highlight_order INTEGER DEFAULT 0,
      is_available BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const existingCountResult = await sql`SELECT COUNT(*)::int as count FROM menu_items;`
  const count = existingCountResult[0]?.count || 0

  if (count === 0 || forceSeed) {
    if (forceSeed) {
      await sql`DELETE FROM menu_items;`
    }

    for (const item of DEFAULT_MENU_ITEMS) {
      await sql`
        INSERT INTO menu_items (
          item_id, name, subtitle, description, price, category,
          spice_level, tags, zone, image, prep, is_highlight,
          highlight_order, is_available, sort_order
        ) VALUES (
          ${item.id}, ${item.name}, ${item.subtitle}, ${item.description},
          ${item.price}, ${item.category}, ${item.spiceLevel}, ${item.tags},
          ${item.zone}, ${item.image}, ${item.prep}, ${item.isHighlight || false},
          ${item.highlightOrder || 0}, ${item.isAvailable !== false}, ${item.sortOrder || item.id}
        )
        ON CONFLICT (item_id) DO UPDATE SET
          name = EXCLUDED.name,
          subtitle = EXCLUDED.subtitle,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          spice_level = EXCLUDED.spice_level,
          tags = EXCLUDED.tags,
          zone = EXCLUDED.zone,
          image = EXCLUDED.image,
          prep = EXCLUDED.prep,
          is_highlight = EXCLUDED.is_highlight,
          highlight_order = EXCLUDED.highlight_order,
          is_available = EXCLUDED.is_available,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW();
      `
    }
  }

  return {
    success: true,
    configured: true,
    message: forceSeed ? 'Database seeded successfully with default items.' : 'Database initialized.',
  }
}

/**
 * Fetch all menu items from Neon PostgreSQL
 */
export async function getMenuItems() {
  const sql = getSqlClient()
  if (!sql) {
    return {
      items: DEFAULT_MENU_ITEMS,
      configured: false,
      source: 'local-defaults',
    }
  }

  try {
    const rows = await sql`
      SELECT * FROM menu_items
      ORDER BY sort_order ASC, item_id ASC;
    `

    if (!rows || rows.length === 0) {
      // Auto seed if empty
      await initDb(true)
      const freshRows = await sql`
        SELECT * FROM menu_items
        ORDER BY sort_order ASC, item_id ASC;
      `
      return {
        items: freshRows.map(mapRowToItem),
        configured: true,
        source: 'postgres-seeded',
      }
    }

    return {
      items: rows.map(mapRowToItem),
      configured: true,
      source: 'postgres',
    }
  } catch (err) {
    // If table doesn't exist yet, init and retry
    if (err.message && err.message.includes('relation "menu_items" does not exist')) {
      await initDb(true)
      const rows = await sql`
        SELECT * FROM menu_items
        ORDER BY sort_order ASC, item_id ASC;
      `
      return {
        items: rows.map(mapRowToItem),
        configured: true,
        source: 'postgres-initialized',
      }
    }
    throw err
  }
}

/**
 * Save / Update a single menu item
 */
export async function saveMenuItem(item) {
  const sql = getSqlClient()
  if (!sql) {
    return { success: true, item, source: 'local-memory' }
  }

  const itemId = Number(item.id)
  const sortOrder = Number(item.sortOrder || item.id)

  const rows = await sql`
    INSERT INTO menu_items (
      item_id, name, subtitle, description, price, category,
      spice_level, tags, zone, image, prep, is_highlight,
      highlight_order, is_available, sort_order, updated_at
    ) VALUES (
      ${itemId}, ${item.name || ''}, ${item.subtitle || ''}, ${item.description || ''},
      ${Number(item.price || 0)}, ${item.category || 'Dosa'}, ${Number(item.spiceLevel || 0)},
      ${item.tags || []}, ${item.zone || 'cream'}, ${item.image || ''}, ${item.prep || ''},
      ${Boolean(item.isHighlight)}, ${Number(item.highlightOrder || 0)},
      ${item.isAvailable !== false}, ${sortOrder}, NOW()
    )
    ON CONFLICT (item_id) DO UPDATE SET
      name = EXCLUDED.name,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      category = EXCLUDED.category,
      spice_level = EXCLUDED.spice_level,
      tags = EXCLUDED.tags,
      zone = EXCLUDED.zone,
      image = EXCLUDED.image,
      prep = EXCLUDED.prep,
      is_highlight = EXCLUDED.is_highlight,
      highlight_order = EXCLUDED.highlight_order,
      is_available = EXCLUDED.is_available,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
    RETURNING *;
  `

  return { success: true, item: mapRowToItem(rows[0]), source: 'postgres' }
}

/**
 * Bulk save / update entire menu items array
 */
export async function saveAllMenuItems(items) {
  const sql = getSqlClient()
  if (!sql) {
    return { success: true, count: items.length, source: 'local-memory' }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemId = Number(item.id)
    const sortOrder = Number(item.sortOrder !== undefined ? item.sortOrder : i + 1)

    await sql`
      INSERT INTO menu_items (
        item_id, name, subtitle, description, price, category,
        spice_level, tags, zone, image, prep, is_highlight,
        highlight_order, is_available, sort_order, updated_at
      ) VALUES (
        ${itemId}, ${item.name || ''}, ${item.subtitle || ''}, ${item.description || ''},
        ${Number(item.price || 0)}, ${item.category || 'Dosa'}, ${Number(item.spiceLevel || 0)},
        ${item.tags || []}, ${item.zone || 'cream'}, ${item.image || ''}, ${item.prep || ''},
        ${Boolean(item.isHighlight)}, ${Number(item.highlightOrder || 0)},
        ${item.isAvailable !== false}, ${sortOrder}, NOW()
      )
      ON CONFLICT (item_id) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        spice_level = EXCLUDED.spice_level,
        tags = EXCLUDED.tags,
        zone = EXCLUDED.zone,
        image = EXCLUDED.image,
        prep = EXCLUDED.prep,
        is_highlight = EXCLUDED.is_highlight,
        highlight_order = EXCLUDED.highlight_order,
        is_available = EXCLUDED.is_available,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
    `
  }

  return { success: true, count: items.length, source: 'postgres' }
}

/**
 * Delete a menu item by ID
 */
export async function deleteMenuItem(id) {
  const sql = getSqlClient()
  if (!sql) {
    return { success: true, id, source: 'local-memory' }
  }

  await sql`DELETE FROM menu_items WHERE item_id = ${Number(id)};`
  return { success: true, id, source: 'postgres' }
}

/**
 * Update the 3 highlights configuration
 * highlightIds: array of up to 3 item IDs in order [id1, id2, id3]
 */
export async function updateHighlights(highlightIds) {
  const sql = getSqlClient()
  if (!sql) {
    return { success: true, highlightIds, source: 'local-memory' }
  }

  // Reset all highlights
  await sql`UPDATE menu_items SET is_highlight = FALSE, highlight_order = 0;`

  // Set the 3 highlights
  for (let i = 0; i < highlightIds.length; i++) {
    const id = Number(highlightIds[i])
    const order = i + 1
    await sql`
      UPDATE menu_items
      SET is_highlight = TRUE, highlight_order = ${order}, updated_at = NOW()
      WHERE item_id = ${id};
    `
  }

  return { success: true, highlightIds, source: 'postgres' }
}
