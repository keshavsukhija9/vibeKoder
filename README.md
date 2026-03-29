# VibeCoder – Local-AI Integrated Development Environment

![VibeCoder Thumbnail](public/vibe-code-editor-thumbnaail.svg)

**VibeCoder** is a browser-native IDE that fuses local code execution with on-device Large Language Model (LLM) assistance. Built as a privacy-first, high-performance alternative to cloud-dependent AI coding tools, it runs in the browser using **StackBlitz WebContainers**, **Monaco Editor**, **local LLMs (Ollama)**, **LanceDB** for per-project codebase RAG, and **AST analysis** for structure checks — see the [PRD](docs/PRD-VibeCoder.md) for full scope.

---

## 🚀 Features

- 🔐 **Email/password auth** – Sign in and register; sessions stored in SQLite with JWT.
- 🎨 **Modern UI** – Built with TailwindCSS & ShadCN UI.
- 🌗 **Dark/Light Mode** – Seamlessly toggle between themes.
- 🧱 **Project Templates** – Choose from React, Next.js, Express, Hono, Vue, or Angular.
- 🗂️ **Custom File Explorer** – Create, rename, delete, and manage files/folders easily.
- 🖊️ **Enhanced Monaco Editor** – Syntax highlighting, formatting, keybindings, and AI autocomplete.
- 💡 **AI Suggestions with Ollama** – Local models give you code completion on `Ctrl + Space` or double `Enter`. Accept with `Tab`.
- ⚙️ **WebContainers Integration** – Instantly run frontend/backend apps right in the browser.
- 💻 **Terminal with xterm.js** – Fully interactive embedded terminal experience.
- 🤖 **AI Chat Assistant** – Share files with the AI and get help, refactors, or explanations.

---

## 🧱 Tech Stack (aligned with [PRD](docs/PRD-VibeCoder.md))

| Layer              | Technology              | Purpose                          |
|--------------------|-------------------------|----------------------------------|
| Frontend           | Next.js 15 + TypeScript | App shell, routing                |
| Editor             | Monaco Editor           | VS Code–grade editing            |
| Styling            | Tailwind CSS, ShadCN UI | Design system                    |
| Animations         | Framer Motion           | Transitions and feedback (PRD)   |
| Local runtime      | StackBlitz WebContainers| Node.js (and Python roadmap)     |
| AI / LLM           | Ollama (local)          | Code completion and chat        |
| Vector / RAG       | LanceDB                 | Per-playground codebase context   |
| Terminal           | xterm.js                | In-browser shell                 |
| Persistence        | SQLite                  | Projects, users, and auth        |

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/keshavsukhija9/vibeKoder.git
cd vibeKoder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file using the template:

```bash
cp .env.example .env
```

Then, set a JWT secret for auth (optional for dev; required for production):

```env
JWT_SECRET=your-secret-at-least-32-chars-long
```

The app uses **SQLite** for all data (users, playgrounds, template files, star marks). The database file is created automatically at `.vibecoder/vibecoder.db` (or set `DATABASE_PATH`).

### 4. Models (Ollama) — required for AI features

The app **does use models**: all AI features (code completion, RAG indexing) call **Ollama** on your machine. If AI seems to do nothing, it’s usually because Ollama isn’t running or the models aren’t pulled.

| Feature | Model | Env variable | Default |
|--------|--------|--------------|---------|
| Code completion (Ctrl+Space, etc.) | LLM | `VIBECODER_LLM_MODEL` | `codellama:latest` |
| RAG / “Index codebase for AI” | Embedding | `VIBECODER_EMBED_MODEL` | `nomic-embed-text` |

**One-time setup:** Install [Ollama](https://ollama.com/), then pull and run the models:

```bash
# Code completion (required for in-editor AI)
ollama pull codellama

# RAG / codebase indexing (optional)
ollama pull nomic-embed-text
```

Keep Ollama running (e.g. `ollama run codellama` or the Ollama app). To use different models, set in `.env`:

```env
VIBECODER_LLM_MODEL=your-model:tag
VIBECODER_EMBED_MODEL=your-embed-model
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 6. Use the app

- **No sign-in:** Click **Try the editor** on the home page → you get a demo React project. Edit, run `npm install` and `npm run dev` in the terminal, use the preview panel. Sign in to save projects.
- **With sign-in:** Go to **Dashboard** → **Add New** → pick a template → open the playground. Save with Ctrl+S.
- **AI:** Run `ollama run codellama`, then in the editor use **Ctrl+Space** or **Double Enter** for suggestions; **Tab** to accept.

See **[How to use](docs/HOW-TO-USE.md)** for a full walkthrough.

---

## 📁 Project structure

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router: pages, layouts, API routes (`/api/auth/*`, `/api/rag/*`, `/api/template/*`, etc.) |
| `modules/` | Feature modules: `auth`, `dashboard`, `landing`, `playground`, `webcontainers` |
| `lib/` | Shared logic: `db` (SQLite), `auth` (JWT, password), `rag`, `ast`, `demo-template` |
| `components/ui/` | ShadCN UI components |
| `.vibecoder/` | Local data: SQLite DB (`vibecoder.db`), LanceDB (RAG index); gitignored |

---

## 🎯 Keyboard Shortcuts

* `Ctrl + Space` or `Double Enter`: Trigger AI suggestions
* `Tab`: Accept AI suggestion
* `Ctrl + S`: Save current file

---

## 📚 Documentation

- **[Contributing](CONTRIBUTING.md)** – Setup, commands, where code lives, test expectations.
- **[How to use](docs/HOW-TO-USE.md)** – Step-by-step: try the editor (no sign-in), run projects, use AI, save with an account.
- **[VibeCoder PRD](docs/PRD-VibeCoder.md)** – Project requirements, scope, functional/non-functional requirements, milestones, and acceptance criteria.
- **[Architecture](docs/ARCHITECTURE.md)** – System architecture (WebContainers, RAG, Monaco), tech stack, and directory map.
- **[Implementation status](docs/IMPLEMENTATION-STATUS.md)** – PRD requirement → implementation status (Done / Partial / Planned).
- [Database schema summary](DATABASE_SCHEMA_SUMMARY.md) · [Quick start (DB)](QUICK_START_DATABASE.md) · [Setup (DB)](SETUP_DATABASE.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

* [Monaco Editor](https://microsoft.github.io/monaco-editor/)
* [Ollama](https://ollama.com/) – for offline LLMs
* [WebContainers](https://webcontainers.io/)
* [xterm.js](https://xtermjs.org/)
* [jose](https://github.com/panva/jose) – JWT for session auth
