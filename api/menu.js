import { getMenuItems, saveMenuItem, saveAllMenuItems, deleteMenuItem, isDbConfigured } from './db.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const data = await getMenuItems()
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      if (body.items && Array.isArray(body.items)) {
        const result = await saveAllMenuItems(body.items)
        return res.status(200).json(result)
      }
      if (body.item) {
        const result = await saveMenuItem(body.item)
        return res.status(200).json(result)
      }
      return res.status(400).json({ error: 'Missing item or items in request body' })
    }

    if (req.method === 'PUT') {
      const body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      if (body.items && Array.isArray(body.items)) {
        const result = await saveAllMenuItems(body.items)
        return res.status(200).json(result)
      }
      if (body.item) {
        const result = await saveMenuItem(body.item)
        return res.status(200).json(result)
      }
      // If direct item is passed as body
      if (body.id && body.name) {
        const result = await saveMenuItem(body)
        return res.status(200).json(result)
      }
      return res.status(400).json({ error: 'Invalid payload for PUT /api/menu' })
    }

    if (req.method === 'DELETE') {
      const body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const id = req.query?.id || body?.id
      if (!id) {
        return res.status(400).json({ error: 'Missing id parameter for DELETE' })
      }
      const result = await deleteMenuItem(id)
      return res.status(200).json(result)
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API Error in /api/menu:', error)
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
      configured: isDbConfigured(),
    })
  }
}
