# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Backpack** is a universal MCP (Model Context Protocol) server that lets users augment any AI assistant (Claude, ChatGPT, Gemini, etc.) with personal knowledge, context, and integrations. It reduces platform lock-in by providing a single, user-controlled backend that works with multiple AI assistants.

### Vision & Goals

- **Universal Compatibility**: Work with Claude, ChatGPT, Gemini, and future AI assistants
- **User Ownership**: Users control their data, tools, and integrations
- **Personal Augmentation**: Create a personalized "tool belt" for AI assistants
- **Two-Tier Authentication**: User accounts + third-party service credentials (OAuth, API keys)

### Planned Features

1. **Knowledge Management** (Coming Soon)
   - Create, retrieve, update, and delete personal facts and notes
   - Query knowledge with semantic search

2. **External Integrations** (Coming Soon)
   - Google Docs (read/write)
   - Financial data (Plaid or similar)
   - Extensible architecture for adding more services

3. **Current Features** (MVP)
   - User authentication and account management
   - Web app for signup/login and connection instructions
   - Basic MCP server with authentication
   - Connection support for Claude Desktop (ChatGPT & Gemini coming soon)

## Architecture

### Tech Stack

- **Cloudflare Workers**: Serverless compute platform
- **Cloudflare D1**: SQLite-based SQL database for user accounts
- **Durable Objects**: Stateful MCP sessions
- **TypeScript**: Type-safe development
- **MCP SDK**: Model Context Protocol implementation
- **Agents Library**: Cloudflare's agent framework

### Project Structure

```
backpack/
├── src/
│   ├── index.ts           # Main worker: web app + MCP routing
│   ├── auth.ts            # Authentication utilities
│   └── html.ts            # Web UI templates
├── migrations/
│   └── 0001_initial.sql   # Database schema
├── wrangler.jsonc         # Cloudflare Worker configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── CLAUDE.md             # This file
```

### Key Components

#### 1. Web Application (`src/index.ts`)

Routes:
- `GET /` - Landing page
- `GET /signup` - Signup form
- `POST /signup` - Create account
- `GET /login` - Login form
- `POST /login` - Authenticate user
- `GET /dashboard` - User dashboard with API key and connection instructions
- `POST /logout` - Clear session

Authentication: Cookie-based sessions using HttpOnly cookies

#### 2. MCP Server (`src/index.ts`)

Routes:
- `GET /sse` - Server-Sent Events endpoint (primary)
- `GET /sse/message` - Alternative SSE endpoint
- `GET /mcp` - Direct MCP protocol access

Authentication: API key via:
- `X-Backpack-API-Key` header
- `Authorization: Bearer <api-key>` header
- `?api_key=<api-key>` query parameter

Tools:
- `about-backpack` - Information about Backpack
- `get-user-info` - Current user information

#### 3. Authentication System (`src/auth.ts`)

Functions:
- `hashPassword(password)` - SHA-256 password hashing
- `generateApiKey()` - Cryptographically secure API key generation
- `createUser(db, email, password)` - Create new user account
- `authenticateUser(db, email, password)` - Login validation
- `verifyApiKey(db, apiKey)` - MCP authentication
- `getUserByEmail(db, email)` - User lookup
- Session cookie management

#### 4. Web UI (`src/html.ts`)

Templates:
- `landingPage()` - Homepage
- `signupPage(error?)` - Account creation
- `loginPage(error?)` - User login
- `dashboardPage(user)` - User dashboard with connection instructions

## Database Schema

### `users` Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Indexes:
- `idx_users_email` on `email`
- `idx_users_api_key` on `api_key`

### `service_connections` Table

```sql
CREATE TABLE service_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    credentials TEXT NOT NULL,  -- JSON blob
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Indexes:
- `idx_service_connections_user_id` on `user_id`
- `idx_service_connections_user_service` on `(user_id, service_name)` (unique)

## Common Development Commands

```bash
# Start development server (http://localhost:8787)
npm run dev

# Deploy to Cloudflare Workers
npm run deploy

# Format code using Biome
npm run format

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Generate TypeScript types for Cloudflare
npm run cf-typegen
```

## Setup Instructions

### Initial Setup

1. **Clone and Install**
   ```bash
   cd backpack
   npm install
   ```

2. **Create D1 Database**
   ```bash
   # Create the database
   wrangler d1 create backpack

   # Copy the database_id from the output and update wrangler.jsonc
   # Replace "placeholder-create-with-wrangler-d1-create" with your actual database_id
   ```

3. **Run Migrations**
   ```bash
   # For local development
   wrangler d1 execute backpack --local --file=./migrations/0001_initial.sql

   # For production
   wrangler d1 execute backpack --remote --file=./migrations/0001_initial.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:8787` to see the web app.

### Deploying to Production

1. **Update wrangler.jsonc**
   - Ensure `database_id` is set correctly
   - The worker name will determine your URL: `backpack.YOUR-ACCOUNT.workers.dev`

2. **Deploy**
   ```bash
   npm run deploy
   ```

3. **Run Production Migrations** (if not done yet)
   ```bash
   wrangler d1 execute backpack --remote --file=./migrations/0001_initial.sql
   ```

## Connecting AI Assistants

### Claude Desktop

1. Sign up at `https://backpack.YOUR-ACCOUNT.workers.dev`
2. Get your API key from the dashboard
3. Edit Claude Desktop config (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "backpack": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://backpack.YOUR-ACCOUNT.workers.dev/sse"
      ],
      "env": {
        "BACKPACK_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

4. Restart Claude Desktop

**Note**: The API key is passed via the `BACKPACK_API_KEY` environment variable. The mcp-remote proxy will include it in the request headers.

### ChatGPT & Gemini

Support coming soon. The infrastructure is ready; waiting for official MCP support from these platforms.

## Adding New Features

### Adding a New MCP Tool

1. **Edit `src/index.ts`**
2. **Add tool inside `MyMCP.init()` method**:

```typescript
this.server.tool(
    "tool-name",
    "Description of what this tool does",
    {
        // Zod schema for parameters (optional)
        param1: z.string().describe("Description"),
        param2: z.number().optional(),
    },
    async ({ param1, param2 }) => {
        // Access current user
        const user = this.env.CURRENT_USER as User;

        // Your tool logic here

        return {
            content: [
                {
                    type: "text",
                    text: "Tool response",
                },
            ],
        };
    }
);
```

3. **Access Database**:
   - Database is available at `this.env.DB`
   - Current authenticated user at `this.env.CURRENT_USER`

### Adding a New Web Route

1. **Edit `src/index.ts`**
2. **Add route handler in the `fetch` function**:

```typescript
if (url.pathname === "/your-route" && request.method === "GET") {
    const user = await getCurrentUser(request, env);
    if (!user) {
        return redirect("/login");
    }

    // Your logic here
    return htmlResponse("<html>...</html>");
}
```

3. **Add HTML template in `src/html.ts`** if needed

### Adding External Service Integration

1. **Design OAuth/API key flow**
2. **Store credentials in `service_connections` table**:

```typescript
await env.DB.prepare(
    "INSERT INTO service_connections (user_id, service_name, credentials) VALUES (?, ?, ?)"
).bind(userId, "google_docs", JSON.stringify({
    access_token: "...",
    refresh_token: "...",
    expires_at: "..."
})).run();
```

3. **Create MCP tools that use the integration**
4. **Add connection UI in dashboard**

## Code Style & Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Biome (4 spaces, 100 char lines)
- **Linting**: Biome rules
- **No test framework**: Currently not configured (add if needed)

### Best Practices

- Always hash passwords (never store plaintext)
- Validate user input on both client and server
- Use prepared statements for all database queries (prevents SQL injection)
- Keep API keys secure (HttpOnly cookies, environment variables)
- CORS headers are minimal but working - do not modify without testing

## Critical Configuration - DO NOT MODIFY

The routing and CORS handling in `src/index.ts` follows a proven pattern for Claude Desktop compatibility:

1. **CORS Headers** (minimal & working):
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`
   - `Access-Control-Max-Age: 86400`

2. **Routing Pattern**:
   - `/` → Landing page (web app)
   - `/signup`, `/login`, `/dashboard` → Web app routes
   - `/sse`, `/sse/message` → SSE endpoints (MCP)
   - `/mcp` → Direct MCP protocol access
   - OPTIONS requests → Handled with CORS headers

**WARNING**: Do NOT add MCP-specific headers like `mcp-session-id` or `mcp-protocol-version`. Any modifications may break Claude Desktop connectivity.

## Security Considerations

### Current Security Measures

1. **Password Hashing**: SHA-256 (consider bcrypt/Argon2 for production)
2. **API Keys**: Cryptographically random (32 bytes)
3. **SQL Injection**: Protected via prepared statements
4. **Session Cookies**: HttpOnly, SameSite=Lax
5. **HTTPS**: Enforced by Cloudflare Workers in production

### Future Security Enhancements

- Rate limiting for login/signup
- Email verification
- Password reset flow
- 2FA/MFA support
- API key rotation
- Audit logging

## Troubleshooting

### Database Issues

```bash
# List databases
wrangler d1 list

# Query database (local)
wrangler d1 execute backpack --local --command "SELECT * FROM users"

# Query database (remote)
wrangler d1 execute backpack --remote --command "SELECT * FROM users"
```

### MCP Connection Issues

1. **Check API key**: Verify in dashboard
2. **Test SSE endpoint**: `curl -N https://backpack.YOUR-ACCOUNT.workers.dev/sse?api_key=YOUR-KEY`
3. **Check Claude Desktop logs**: Look for connection errors
4. **Verify mcp-remote**: Ensure `npx mcp-remote` is working

### Development Server Issues

```bash
# Clear local D1 database
rm -rf .wrangler/state/v3/d1

# Restart development server
npm run dev
```

## Roadmap

### MVP (Current)
- [x] User authentication
- [x] Web app (signup/login/dashboard)
- [x] MCP server with auth
- [x] Claude Desktop connection instructions

### Phase 2 (Next)
- [ ] Knowledge management (CRUD operations)
- [ ] Knowledge search and retrieval
- [ ] Basic knowledge organization (tags/categories)

### Phase 3 (Future)
- [ ] Google Docs integration
- [ ] Financial data integration (Plaid)
- [ ] ChatGPT support
- [ ] Gemini support
- [ ] Tool marketplace (share tools with others)

## Contributing

When making changes:

1. Test locally with `npm run dev`
2. Run linter with `npm run lint:fix`
3. Format code with `npm run format`
4. Type check with `npm run type-check`
5. Test MCP connection with Claude Desktop
6. Deploy to production with `npm run deploy`

## Contact

Project maintained by dudgeon@gmail.com
