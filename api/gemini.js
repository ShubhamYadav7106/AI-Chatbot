import process from 'node:process'

const MODELS = ['gemini-3.8-flash', 'gemini-3-flash-preview']
const TOTAL_TIMEOUT_MS = 45000
const ATTEMPT_TIMEOUT_MS = 15000

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json').send(body)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    sendJson(response, 503, { error: 'GEMINI_API_KEY is not configured on the server.' })
    return
  }

  const body = typeof request.body === 'string'
    ? request.body
    : JSON.stringify(request.body || {})
  const totalController = new AbortController()
  const totalTimeout = setTimeout(() => totalController.abort(), TOTAL_TIMEOUT_MS)

  try {
    let geminiResponse

    for (const model of MODELS) {
      const attemptController = new AbortController()
      const attemptTimeout = setTimeout(() => attemptController.abort(), ATTEMPT_TIMEOUT_MS)

      try {
        try {
          geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
              signal: AbortSignal.any([totalController.signal, attemptController.signal]),
            },
          )
        } catch (error) {
          if (totalController.signal.aborted) {
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
      sendJson(response, 504, { error: 'Gemini took too long to respond.' })
      return
    }

    response.status(geminiResponse.status)
      .setHeader('Content-Type', 'application/json')
      .send(await geminiResponse.text())
  } catch (error) {
    const status = error.name === 'AbortError' ? 504 : 502
    const message = error.name === 'AbortError'
      ? 'Gemini took too long to respond.'
      : error.message || 'Gemini proxy request failed.'
    sendJson(response, status, { error: message })
  } finally {
    clearTimeout(totalTimeout)
  }
}
