# How to use VibeCoder

## Quick start (no account)

1. Open the app (e.g. `http://localhost:3000`).
2. Click **Try the editor** on the landing page (or go to **Dashboard** → **Try the editor (no sign-in)**).
3. You’ll land in the **Demo playground** with a React + Vite project; the first file opens automatically.
4. **Edit code**: click files in the left sidebar, edit in the center. Save with **Ctrl+S** (demo keeps changes in memory; sign in to persist).
5. **Run the app**: the **Preview** panel will auto-mount files, run `npm install`, and start the dev server (`npm run start` or `npm run dev`). You’ll see the app in the iframe.
6. **AI suggestions** (optional): install [Ollama](https://ollama.com), run `ollama run codellama`, then in the editor press **Ctrl+Space** or **Double Enter** for suggestions; **Tab** to accept.

---

## With an account (save projects)

1. **Sign in** with email and password (or create an account) from the sign-in page.
2. Click **Add New**, pick a template (React, Next.js, Express, etc.), create the project.
3. You’re in the playground: edit files, use the terminal, toggle **AI** for completions.
4. Use **Save** / **Save All** to persist; projects appear on your Dashboard.

---

## In the editor

| Action | How |
|--------|-----|
| Open a file | Click it in the file tree (left). |
| Save | **Ctrl+S** or the Save button. |
| Run / install | Open the terminal, run `npm install`, `npm run dev`, etc. |
| AI suggestion | **Ctrl+Space** or **Double Enter** (needs Ollama + codellama). |
| Accept suggestion | **Tab**. |
| Index for AI (RAG) | Settings (gear) → **Index codebase for AI**. |
| Check dependencies | Settings (gear) → **Check dependency structure**. |

---

## Requirements

- **Browser**: modern Chrome/Edge (WebContainers need a supported browser).
- **AI**: [Ollama](https://ollama.com) installed and `ollama run codellama` (or another code model) if you want in-editor completions.
- **Saving projects**: SQLite DB is created automatically; sign in to save. Use **Try the editor** for a no-account demo.
