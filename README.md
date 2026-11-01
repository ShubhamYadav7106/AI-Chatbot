# AI Chatbot

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` to a new Gemini API key.
3. Start the app with `npm run dev`.

The browser calls the local `/api/gemini` endpoint. Vite forwards the request
server-side, so the Gemini key is never included in the client bundle. The
previous key was exposed in source control and should be revoked in Google AI
Studio; do not reuse it.

Requests have a 30-second timeout and display API, configuration, and network
failures in the chat UI instead of leaving the loading indicator active.
