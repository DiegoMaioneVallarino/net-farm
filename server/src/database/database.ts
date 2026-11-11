import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.cwd(), "data");

mkdirSync(dataDir, { recursive: true });

export const db = new Database(
  resolve(dataDir, "netfarm.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS meta_sessions (
    id TEXT PRIMARY KEY,
    oauth_state TEXT,
    user_token_encrypted TEXT,
    token_expires_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meta_accounts (
    session_id TEXT NOT NULL,
    id TEXT NOT NULL,
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    username TEXT,
    page_id TEXT,
    page_token_encrypted TEXT,
    PRIMARY KEY (session_id, platform, id),
    FOREIGN KEY (session_id)
      REFERENCES meta_sessions(id)
      ON DELETE CASCADE
  );
`);