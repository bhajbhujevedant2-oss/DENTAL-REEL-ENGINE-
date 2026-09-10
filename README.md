# Dental Reel Engine — AI MVP

This is the working AI-powered MVP. The browser never receives the OpenAI API key. The Node.js server keeps the key in an environment variable and sends Reel-generation requests to the OpenAI Responses API.

## Easiest Windows setup
1. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
2. Double-click `setup-windows.bat`.
3. Paste your OpenAI API key when asked. It is saved locally in `.env` and is not put in the HTML.
4. The app starts automatically.
5. Open http://localhost:3000 in your browser.

After the first setup, double-click `start-windows.bat` whenever you want to run the app.

## Important
Never commit, upload, or share `.env`. Never put the API key into `public/index.html`.

## Cloud deployment
The included `Dockerfile` and `render.yaml` are ready for a Docker-based deployment. Set `OPENAI_API_KEY` as a secret environment variable on the hosting provider.

## What the AI generates
- 3 original hooks
- recommended hook
- complete spoken script
- 4 scene plan with matching dialogue
- camera/action directions
- on-screen text and B-roll
- caption
- CTA
- cover
- clinical safety review

The model is set to `gpt-5.6-luna` by default, which OpenAI describes as optimized for cost-sensitive, high-volume workloads. Change `OPENAI_MODEL` in `.env` if you want another supported model.
