-- Add OAuth support
ALTER TABLE users ADD COLUMN oauth_client_id TEXT;
ALTER TABLE users ADD COLUMN oauth_client_secret TEXT;

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_client_id ON users(oauth_client_id);

-- Create OAuth tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    access_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
