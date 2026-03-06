/**
 * SQLite schema for VibeCoder (replaces Supabase).
 * DB file: .vibecoder/vibecoder.db (or DATABASE_PATH env).
 */

export const SQL = {
  createUsers: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `,
  createPlaygrounds: `
    CREATE TABLE IF NOT EXISTS playgrounds (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      template TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
  createTemplateFiles: `
    CREATE TABLE IF NOT EXISTS template_files (
      playground_id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      FOREIGN KEY (playground_id) REFERENCES playgrounds(id) ON DELETE CASCADE
    )
  `,
  createStarMarks: `
    CREATE TABLE IF NOT EXISTS star_marks (
      user_id TEXT NOT NULL,
      playground_id TEXT NOT NULL,
      is_marked INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (user_id, playground_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (playground_id) REFERENCES playgrounds(id) ON DELETE CASCADE
    )
  `,
  createIndexPlaygroundsUserId: `CREATE INDEX IF NOT EXISTS idx_playgrounds_user_id ON playgrounds(user_id)`,
  createIndexStarMarksUser: `CREATE INDEX IF NOT EXISTS idx_star_marks_user_id ON star_marks(user_id)`,
};

export function getAllCreateStatements(): string[] {
  return [
    SQL.createUsers,
    SQL.createPlaygrounds,
    SQL.createTemplateFiles,
    SQL.createStarMarks,
    SQL.createIndexPlaygroundsUserId,
    SQL.createIndexStarMarksUser,
  ];
}
