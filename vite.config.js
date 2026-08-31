import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import url from 'node:url'
import menuHandler from './api/menu.js'
import highlightsHandler from './api/highlights.js'
import initDbHandler from './api/init-db.js'

function localApiPlugin() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url, true)
        const pathname = parsedUrl.pathname

        if (pathname && pathname.startsWith('/api/')) {
          req.query = parsedUrl.query

          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }
            try {
              req.body = body ? JSON.parse(body) : {}
            } catch {
              req.body = body
            }
          }

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return res
          }

          try {
            if (pathname === '/api/menu' || pathname === '/api/menu/') {
              return await menuHandler(req, res)
            }
            if (pathname === '/api/highlights' || pathname === '/api/highlights/') {
              return await highlightsHandler(req, res)
            }
            if (pathname === '/api/init-db' || pathname === '/api/init-db/') {
              return await initDbHandler(req, res)
            }
          } catch (err) {
            console.error('Local API Plugin Error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
})
