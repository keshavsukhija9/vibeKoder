import Database from "better-sqlite3";
import path from "path";
import { getAllCreateStatements } from "./schema";

const DEFAULT_DB_DIR = ".vibecoder";
const DEFAULT_DB_FILE = "vibecoder.db";

function getDbPath(): string {
  const base = process.env.DATABASE_PATH || path.join(process.cwd(), DEFAULT_DB_DIR, DEFAULT_DB_FILE);
  if (path.isAbsolute(base)) return base;
  return path.join(process.cwd(), base);
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    try {
      const fs = require("fs");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      // ignore
    }
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  const statements = getAllCreateStatements();
  for (const sql of statements) {
    database.exec(sql);
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type PlaygroundRow = {
  id: string;
  title: string;
  description: string | null;
  template: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};
