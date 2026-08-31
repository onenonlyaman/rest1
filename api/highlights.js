import { updateHighlights, getMenuItems, isDbConfigured } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const data = await getMenuItems()
      const highlights = (data.items || [])
        .filter(item => item.isHighlight)
        .sort((a, b) => (a.highlightOrder || 0) - (b.highlightOrder || 0))

      return res.status(200).json({
        highlights,
        configured: data.configured,
      })
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const highlightIds = body.highlightIds || body.ids || []

      if (!Array.isArray(highlightIds)) {
        return res.status(400).json({ error: 'highlightIds must be an array of numbers' })
      }

      const result = await updateHighlights(highlightIds)
      return res.status(200).json(result)
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API Error in /api/highlights:', error)
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
      configured: isDbConfigured(),
    })
  }
}
