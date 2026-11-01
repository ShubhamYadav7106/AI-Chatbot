import process from 'node:process'
import { Buffer } from 'node:buffer'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const createGeminiProxy = (apiKey) => ({
  name: 'gemini-proxy',
  configureServer(server) {
    addGeminiRoute(server.middlewares, apiKey)
  },
  configurePreviewServer(server) {
    addGeminiRoute(server.middlewares, apiKey)
  },
})

function addGeminiRoute(middlewares, apiKey) {
  middlewares.use('/api/gemini', async (request, response, next) => {
    if (request.method !== 'POST') {
      next()
      return
    }

    if (!apiKey) {
      response.statusCode = 503
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }))
      return
    }

    try {
      const chunks = []
      for await (const chunk of request) {
        chunks.push(chunk)
      }
      const body = Buffer.concat(chunks).toString('utf8')
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)
      let geminiResponse
      try {
        for (const model of ['gemini-3.8-flash', 'gemini-3-flash-preview']) {
          const attemptController = new AbortController()
          const attemptTimeout = setTimeout(() => attemptController.abort(), 15000)
          try {
            try {
              geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body,
                  signal: AbortSignal.any([controller.signal, attemptController.signal]),
                },
              )
            } catch (error) {
              if (controller.signal.aborted) {
                throw error
              }
              continue
            }
          } finally {
            clearTimeout(attemptTimeout)
          }
          if (geminiResponse.ok || ![429, 503].includes(geminiResponse.status)) {
            break
          }
        }
        if (!geminiResponse) {
          throw new Error('Gemini models did not respond within the retry window.')
        }
      } finally {
        clearTimeout(timeout)
      }
      response.statusCode = geminiResponse.status
      response.setHeader('Content-Type', 'application/json')
      response.end(await geminiResponse.text())
    } catch (error) {
      response.statusCode = error.name === 'AbortError' ? 504 : 502
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({
        error: error.name === 'AbortError'
          ? 'Gemini took too long to respond.'
          : error.message || 'Gemini proxy request failed.',
      }))
    }
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), createGeminiProxy(env.GEMINI_API_KEY)],
  }
})
