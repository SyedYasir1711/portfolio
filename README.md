# Syed Yasir — Portfolio

A static, one-page portfolio in teal, blue and lime. It has a particle intro and automatic light and dark modes, and needs no build step.

```
index.html   page markup and content
styles.css   theme tokens and styles
script.js    intro, nav, particle icons, FAQ
assets/      photos and Devicon logos
CLAUDE.md    design rules and context for Claude Code
```

## Run locally
```bash
npx serve .
# or
python3 -m http.server 8000
```
Use a local server rather than opening the file directly, because the intro portrait needs it.

## Deploy
- **GitHub Pages:**
  1. Push the folder to a repo.
  2. Go to Settings → Pages → Deploy from branch.
- **Netlify or Vercel:** drag and drop the folder, or import the repo. No build command is needed.
