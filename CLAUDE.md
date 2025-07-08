# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Remote MCP (Model Context Protocol) Server built for Cloudflare Workers. It provides calculator tools that can be accessed by Claude Desktop or the Cloudflare AI Playground without authentication.

## Common Development Commands

```bash
# Start development server (runs on http://localhost:8787)
npm run dev

# Deploy to Cloudflare Workers
npm run deploy

# Format code using Biome
npm run format

# Fix linting issues
npm run lint:fix

# Type check without emitting files
npm run type-check

# Generate Cloudflare Workers TypeScript types
npm run cf-typegen
```

## Architecture

### Core Components

1. **MCP Agent Implementation** (`src/index.ts`)
   - Extends `McpAgent` from the `agents` library
   - Implements tools in the `init()` method using `this.server.tool()`
   - Uses Zod for parameter validation
   - Exposed via Server-Sent Events (SSE) at `/sse` and `/sse/message`
   - Alternative endpoint at `/mcp`

2. **Durable Objects**
   - The `MyMCP` class is configured as a Durable Object in `wrangler.jsonc`
   - Provides stateful execution for MCP operations

3. **Tool Definition Pattern**
   ```typescript
   this.server.tool(
       "toolName",
       { param1: z.type(), param2: z.type() },  // Zod schema
       async ({ param1, param2 }) => ({
           content: [{ type: "text", text: "result" }]
       })
   );
   ```

## Adding New Tools

To add tools to the MCP server:
1. Open `src/index.ts`
2. Add tool definitions inside the `init()` method of the `MyMCP` class
3. Use `this.server.tool()` with:
   - Tool name as first parameter
   - Zod schema for parameters as second parameter
   - Async handler function returning content array as third parameter

## Testing Connection

### Local Development
1. Start the server: `npm run dev`
2. Server runs at `http://localhost:8787/sse`
3. Test SSE connection: `curl -N http://localhost:8787/sse`
4. For Claude Desktop: Use `npx mcp-remote http://localhost:8787/sse`

### Production
1. Deploy: `npm run deploy`
2. URL format: `remote-mcp-server-authless.<your-account>.workers.dev/sse`
3. Test SSE connection: `curl -N https://remote-mcp-server-authless.<your-account>.workers.dev/sse`
4. Direct connection from Cloudflare AI Playground
5. For Claude Desktop: Use `npx mcp-remote https://remote-mcp-server-authless.<your-account>.workers.dev/sse`

### Troubleshooting Connection Issues
- Verify CORS headers are being sent correctly
- Check that no additional MCP-specific headers are included
- Ensure exact dependency versions match water-services-mcp
- Test with curl to verify SSE stream is working

## Code Style

- TypeScript with strict mode enabled
- Biome for formatting and linting (4 spaces, 100 char lines)
- No test framework currently configured

## Critical Configuration - DO NOT MODIFY

The routing and CORS handling in `src/index.ts` follows a proven pattern for Claude Desktop compatibility:

1. **CORS Headers** (minimal & working):
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`
   - `Access-Control-Max-Age: 86400`

2. **Routing Pattern**:
   - `/` → redirects to `/sse`
   - `/message` → redirects to `/sse/message`
   - `/sse`, `/sse/message` → SSE endpoints
   - `/mcp` → direct MCP protocol access
   - OPTIONS requests → handled with CORS headers

**WARNING**: Do NOT add MCP-specific headers like `mcp-session-id` or `mcp-protocol-version`. Any modifications may break Claude Desktop connectivity.