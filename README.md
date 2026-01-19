# Backpack 🎒

**Augment any AI assistant with your personal tools and knowledge**

Backpack is a universal MCP (Model Context Protocol) server that lets you personalize Claude, ChatGPT, Gemini, and other AI assistants with your own knowledge, context, and integrations—reducing platform lock-in and putting you in control.

## Features

### Current (MVP)
- 🔐 **User Authentication** - Secure account creation and login
- 🌐 **Web Dashboard** - Simple UI for managing your Backpack
- 🔌 **Claude Desktop Support** - Connect your Backpack to Claude Desktop
- 🛠️ **Basic Tools** - Information and user verification tools

### Coming Soon
- 📚 **Knowledge Management** - Store and retrieve personal facts and notes
- 🔗 **Google Docs Integration** - Read and write to your documents
- 💳 **Financial Data** - Connect to your credit card for spending insights
- 🤖 **ChatGPT & Gemini Support** - Use Backpack with other AI assistants
- 🎨 **Custom Tools** - Build your own capabilities

## Quick Start

### For Users

1. **Visit your deployed Backpack**
   - Go to `https://backpack.YOUR-ACCOUNT.workers.dev`
   - Sign up for an account
   - Get your API key from the dashboard

2. **Connect Claude Desktop**
   - Open Claude Desktop → Settings → Developer → Edit Config
   - Add this configuration:

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
           "BACKPACK_API_KEY": "your-api-key-from-dashboard"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Your Backpack tools will now be available in Claude!

### For Developers

#### Automated Setup (Recommended)

The repository includes GitHub Actions workflows that automatically handle D1 database creation and deployment:

1. **Add GitHub Secrets**

   Go to your repository → Settings → Secrets and variables → Actions → New repository secret

   Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token ([create one here](https://dash.cloudflare.com/profile/api-tokens))
     - Permissions needed: D1 Edit, Workers Scripts Edit, Account Settings Read
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (found in dashboard URL or Workers overview)

2. **Push to GitHub**
   ```bash
   git push origin your-branch
   ```

   The workflows will automatically:
   - ✅ Create the D1 database
   - ✅ Update `wrangler.jsonc` with the database ID
   - ✅ Run migrations
   - ✅ Deploy to Cloudflare Workers

#### Manual Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd backpack
   npm install
   ```

2. **Create D1 Database**
   ```bash
   # Create the database
   wrangler d1 create backpack

   # Copy the database_id from output and update wrangler.jsonc
   ```

3. **Run Migrations**
   ```bash
   # Local development
   wrangler d1 execute backpack --local --file=./migrations/0001_initial.sql

   # Production
   wrangler d1 execute backpack --remote --file=./migrations/0001_initial.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:8787` to see your local Backpack.

5. **Deploy to Production**
   ```bash
   npm run deploy
   ```

## Architecture

Backpack runs on Cloudflare's edge network:

- **Cloudflare Workers** - Serverless compute
- **Cloudflare D1** - SQLite database for user accounts
- **Durable Objects** - Stateful MCP sessions
- **TypeScript** - Type-safe development

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive guide for AI assistants and developers
- **MCP Protocol** - [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **Cloudflare Workers** - [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/)

## Security

- Passwords are hashed (SHA-256)
- API keys are cryptographically random
- SQL injection protection via prepared statements
- HTTPS enforced on all connections
- HttpOnly cookies for web sessions

**Note**: This is an MVP. For production use, consider additional security measures like rate limiting, email verification, and 2FA.

## Roadmap

- [x] Basic authentication and MCP server
- [x] Web dashboard and connection instructions
- [ ] Knowledge management system
- [ ] Google Docs integration
- [ ] Financial data integration
- [ ] Multi-AI assistant support (ChatGPT, Gemini)
- [ ] Tool marketplace

## Contributing

Contributions welcome! Please see [CLAUDE.md](./CLAUDE.md) for development guidelines.

## License

MIT

## Contact

Maintained by dudgeon@gmail.com
