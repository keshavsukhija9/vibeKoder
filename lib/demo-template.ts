/**
 * Shared demo template – used by /api/template/demo and as fallback when disk templates are missing.
 * fileExtension must have no leading dot (matches path-to-json convention).
 */
export const DEMO_TEMPLATE = {
  folderName: "Root",
  items: [
    {
      filename: "package",
      fileExtension: "json",
      content: `{
  "name": "demo-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
`,
    },
    {
      filename: "tsconfig",
      fileExtension: "json",
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
`,
    },
    {
      filename: "index",
      fileExtension: "html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VibeCoder Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      filename: "vite.config",
      fileExtension: "ts",
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    },
    {
      folderName: "src",
      items: [
        {
          filename: "main",
          fileExtension: "tsx",
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
        },
        {
          filename: "App",
          fileExtension: "tsx",
          content: `export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Hello from VibeCoder</h1>
      <p>Edit this file and run <code>npm run dev</code> in the terminal.</p>
    </div>
  )
}
`,
        },
        {
          filename: "index",
          fileExtension: "css",
          content: `* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
`,
        },
      ],
    },
  ],
};
