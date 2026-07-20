CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS birth_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  date TEXT,
  time TEXT,
  place TEXT,
  latitude REAL,
  longitude REAL,
  timezone TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chart_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  profile_id TEXT,
  chart_type TEXT,
  chart_data TEXT,
  calculated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  messages TEXT,
  model TEXT,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
