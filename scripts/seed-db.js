import { initDb, isDbConfigured, getMenuItems } from '../api/db.js'

async function run() {
  console.log('🚀 Initializing The Bakerman Cafe database on Neon PostgreSQL...')
  
  if (!isDbConfigured()) {
    console.error('❌ Error: DATABASE_URL is not set in environment or .env file.')
    process.exit(1)
  }

  const result = await initDb(true)
  console.log('✅ Result:', result.message)

  const { items, source } = await getMenuItems()
  console.log(`📦 Loaded ${items.length} items from source: ${source}`)
  
  const highlights = items.filter(i => i.isHighlight)
  console.log('🌟 Highlight items count:', highlights.length)
  highlights.forEach(h => console.log(`   #${h.highlightOrder}: ${h.name} (₹${h.price})`))
}

run().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
