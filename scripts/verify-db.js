import { getSqlClient, getMenuItems } from '../api/db.js'
import dotenv from 'dotenv'

dotenv.config()

async function verify() {
  const url = process.env.DATABASE_URL
  console.log('🔗 Current DATABASE_URL Endpoint:', url ? url.split('@')[1]?.split('/')[0] : 'None')
  
  const sql = getSqlClient()
  const dbInfo = await sql`SELECT current_database(), current_user;`
  console.log('📍 Connected Database:', dbInfo[0].current_database, '| User:', dbInfo[0].current_user)

  const { items, source, configured } = await getMenuItems()
  console.log(`✅ Status: Configured=${configured}, Source=${source}, Total Items=${items.length}`)

  console.log('\n--- 📂 Categories Breakdown ---')
  const categories = {}
  items.forEach(i => {
    categories[i.category] = (categories[i.category] || 0) + 1
  })
  console.table(categories)

  console.log('\n--- 🌟 3 Highlight Dishes ---')
  items.filter(i => i.isHighlight).forEach(h => {
    console.log(`[Order #${h.highlightOrder}] ${h.name} - ₹${h.price} (${h.subtitle})`)
  })
}

verify().catch(console.error)
