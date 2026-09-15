# Lingua AI

A polished frontend prototype for an AI-powered English learning platform.

## Run
Open `index.html` in a browser.

## Included
- Responsive dashboard
- Practice scenarios
- AI-style conversation demo
- Grammar feedback demo
- Browser speech recognition when supported
- Progress and vocabulary screens

## Turning it into a real AI product
The next step is to connect the chat and feedback functions to a backend API. Keep API keys on the server, not in `app.js`.

Suggested architecture:
- Frontend: Next.js/React
- Backend: Node.js or Python
- AI: OpenAI API
- Speech-to-text: browser/Web Speech API or a server transcription service
- Text-to-speech: browser speech synthesis or a TTS API
- Database: PostgreSQL
- Auth: secure email/social login
