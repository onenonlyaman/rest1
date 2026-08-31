import { initDb, isDbConfigured } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const force = Boolean(body.force || req.query?.force === 'true')

    const result = await initDb(force)
    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error('API Error in /api/init-db:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
      configured: isDbConfigured(),
    })
  }
}
