-- Initial database schema for Backpack

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on api_key for MCP authentication
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- Service connections table for future integrations
CREATE TABLE IF NOT EXISTS service_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    credentials TEXT NOT NULL, -- JSON blob containing OAuth tokens, API keys, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for looking up connections by user
CREATE INDEX IF NOT EXISTS idx_service_connections_user_id ON service_connections(user_id);

-- Composite index for user + service lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_connections_user_service
    ON service_connections(user_id, service_name);
