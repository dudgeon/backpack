# Backpack 🎒 — An MCP Playground for Shape-Shifting Tools

Backpack is an experimental MCP server that lets you build, tweak, and share AI tools inside the server—no IDE or code pushes required. Using handy meta-tools, you can spin up new "plastic-tools," adjust them on the fly, and decide whether each one stays private or goes public—all through the same chat interface that uses them. 🛠️✨

We're treating Backpack as a learning adventure, so expect rapid iterations, a few bumps, and plenty of room for your ideas to steer where we head next. Dive in, pack your favorite tools, and help us see what an MCP toolbox can become!

## About This Server

This is a remote MCP server that runs on Cloudflare Workers without authentication. 

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## Available Routes

Once deployed, your MCP server will be available at the following URLs:

### Production URLs (after deployment)
- **Root**: `https://remote-mcp-server-authless.<your-account>.workers.dev/` → Redirects to `/sse`
- **Message**: `https://remote-mcp-server-authless.<your-account>.workers.dev/message` → Redirects to `/sse/message`
- **SSE Endpoint**: `https://remote-mcp-server-authless.<your-account>.workers.dev/sse` → Primary Server-Sent Events endpoint
- **SSE Message**: `https://remote-mcp-server-authless.<your-account>.workers.dev/sse/message` → Alternative SSE endpoint
- **MCP Direct**: `https://remote-mcp-server-authless.<your-account>.workers.dev/mcp` → Direct MCP protocol access

### Local Development URLs
- **Root**: `http://localhost:8787/` → Redirects to `/sse`
- **Message**: `http://localhost:8787/message` → Redirects to `/sse/message`
- **SSE Endpoint**: `http://localhost:8787/sse` → Primary Server-Sent Events endpoint
- **SSE Message**: `http://localhost:8787/sse/message` → Alternative SSE endpoint
- **MCP Direct**: `http://localhost:8787/mcp` → Direct MCP protocol access

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`.

## Testing Your Endpoints

You can test your MCP server endpoints using curl:

```bash
# Test SSE endpoint (primary connection method)
curl -N https://remote-mcp-server-authless.<your-account>.workers.dev/sse

# Test root redirect
curl -I https://remote-mcp-server-authless.<your-account>.workers.dev/

# Test message redirect
curl -I https://remote-mcp-server-authless.<your-account>.workers.dev/message

# For local development
curl -N http://localhost:8787/sse
``` 

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server SSE URL: `https://remote-mcp-server-authless.<your-account>.workers.dev/sse`
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "backpack": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or https://remote-mcp-server-authless.<your-account>.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 
