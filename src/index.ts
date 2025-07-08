import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Backpack",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"add",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			}),
		);

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);

		// About Backpack tool
		this.server.tool("about-backpack", {}, async () => ({
			content: [
				{
					type: "text",
					text: `Backpack 🎒 — An MCP Playground for Shape-Shifting Tools

Backpack is an experimental MCP server that lets you build, tweak, and share AI tools inside the server—no IDE or code pushes required. Using handy meta-tools, you can spin up new "plastic-tools," adjust them on the fly, and decide whether each one stays private or goes public—all through the same chat interface that uses them. 🛠️✨

We're treating Backpack as a learning adventure, so expect rapid iterations, a few bumps, and plenty of room for your ideas to steer where we head next. Dive in, pack your favorite tools, and help us see what an MCP toolbox can become!`,
				},
			],
		}));
	}
}

// CORS headers function - minimal and working configuration
function addCorsHeaders(response: Response): Response {
	const headers = new Headers(response.headers);
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	headers.set("Access-Control-Max-Age", "86400");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// Handle OPTIONS preflight requests
		if (request.method === "OPTIONS") {
			return addCorsHeaders(new Response(null, { status: 200 }));
		}

		// Root paths redirect to SSE endpoints
		if (url.pathname === "/") {
			return addCorsHeaders(
				Response.redirect(new URL("/sse", url).toString(), 302),
			);
		}

		if (url.pathname === "/message") {
			return addCorsHeaders(
				Response.redirect(new URL("/sse/message", url).toString(), 302),
			);
		}

		// SSE endpoints handle Server-Sent Events
		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse")
				.fetch(request, env, ctx)
				.then(addCorsHeaders);
		}

		// MCP endpoint provides direct protocol access
		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx).then(addCorsHeaders);
		}

		// All other routes return 404
		return addCorsHeaders(new Response("Not found", { status: 404 }));
	},
};
