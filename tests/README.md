# Tests

Critical-path tests for RAG chunking, hashing, AST cycles/parsing, API errors, Ollama config, and UI components (RAGContextChip, AIWaveform).

**Run tests:** `npm run test` (watch) or `npm run test:run` (single run).  
**Coverage:** `npm run test:coverage`

Tests are run via Vitest with the `tsx` loader (`node --import tsx`) so they work on Node 20+ without hitting ESM loader issues. Requires `tsx` in devDependencies.
