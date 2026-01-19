import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	createUser,
	authenticateUser,
	verifyApiKey,
	getUserByEmail,
	createSessionCookie,
	getSessionFromCookie,
	clearSessionCookie,
	type User,
} from "./auth";
import { landingPage, signupPage, loginPage, dashboardPage } from "./html";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Backpack",
		version: "1.0.0",
	});

	async init() {
		// About Backpack tool
		this.server.tool(
			"about-backpack",
			"Get information about the Backpack MCP server and its capabilities",
			async () => ({
				content: [
					{
						type: "text",
						text: `Backpack 🎒 — Your Universal AI Assistant Augmentation Platform

Backpack is an MCP server that lets you augment any AI assistant (Claude, ChatGPT, Gemini) with:

📚 Personal Knowledge: Store and retrieve facts, notes, and context
🔗 External Integrations: Connect to Google Docs, financial APIs, and more
🛠️ Custom Tools: Build your own capabilities tailored to your needs
🔒 Privacy First: Your data stays under your control

Current Status: MVP - Basic authentication and connection infrastructure
Coming Soon: Knowledge management, Google Docs integration, financial data access

Visit your dashboard to get started and connect your favorite AI assistant!`,
					},
				],
			}),
		);

		// Get user info tool
		this.server.tool(
			"get-user-info",
			"Get information about the authenticated user",
			async () => {
				const user = (this.env as any).CURRENT_USER as User | undefined;
				if (!user) {
					return {
						content: [
							{
								type: "text",
								text: "Error: Not authenticated. Please check your API key configuration.",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: `User Information:
Email: ${user.email}
Account Created: ${user.created_at}
API Key: ${user.api_key.substring(0, 8)}...

You are successfully connected to Backpack! More tools will be available soon.`,
						},
					],
				};
			},
		);
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

// Parse form data from request
async function parseFormData(
	request: Request,
): Promise<Record<string, string>> {
	const contentType = request.headers.get("content-type") || "";
	if (!contentType.includes("application/x-www-form-urlencoded")) {
		return {};
	}

	const text = await request.text();
	const params = new URLSearchParams(text);
	const data: Record<string, string> = {};
	for (const [key, value] of params.entries()) {
		data[key] = value;
	}
	return data;
}

// HTML response helper
function htmlResponse(
	html: string,
	status = 200,
	headers: Record<string, string> = {},
): Response {
	return new Response(html, {
		status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...headers,
		},
	});
}

// Redirect helper
function redirect(
	location: string,
	headers: Record<string, string> = {},
): Response {
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
			...headers,
		},
	});
}

// Get current user from session cookie
async function getCurrentUser(
	request: Request,
	env: Env,
): Promise<User | null> {
	const cookieHeader = request.headers.get("cookie");
	const sessionToken = getSessionFromCookie(cookieHeader);

	if (!sessionToken) {
		return null;
	}

	return await verifyApiKey(env.DB, sessionToken);
}

// Main worker export
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// Handle OPTIONS preflight requests
		if (request.method === "OPTIONS") {
			return addCorsHeaders(new Response(null, { status: 200 }));
		}

		// Web App Routes
		if (url.pathname === "/" && request.method === "GET") {
			return htmlResponse(landingPage());
		}

		if (url.pathname === "/signup") {
			if (request.method === "GET") {
				return htmlResponse(signupPage());
			}

			if (request.method === "POST") {
				const data = await parseFormData(request);
				const { email, password } = data;

				if (!email || !password) {
					return htmlResponse(
						signupPage("Please provide both email and password"),
						400,
					);
				}

				if (password.length < 8) {
					return htmlResponse(
						signupPage("Password must be at least 8 characters"),
						400,
					);
				}

				// Check if user already exists
				const existingUser = await getUserByEmail(env.DB, email);
				if (existingUser) {
					return htmlResponse(
						signupPage("An account with this email already exists"),
						400,
					);
				}

				// Create user
				const user = await createUser(env.DB, email, password);
				if (!user) {
					return htmlResponse(
						signupPage("Failed to create account. Please try again."),
						500,
					);
				}

				// Set session cookie and redirect to dashboard
				return redirect("/dashboard", {
					"Set-Cookie": createSessionCookie(user.api_key),
				});
			}
		}

		if (url.pathname === "/login") {
			if (request.method === "GET") {
				return htmlResponse(loginPage());
			}

			if (request.method === "POST") {
				const data = await parseFormData(request);
				const { email, password } = data;

				if (!email || !password) {
					return htmlResponse(
						loginPage("Please provide both email and password"),
						400,
					);
				}

				const user = await authenticateUser(env.DB, email, password);
				if (!user) {
					return htmlResponse(loginPage("Invalid email or password"), 401);
				}

				// Set session cookie and redirect to dashboard
				return redirect("/dashboard", {
					"Set-Cookie": createSessionCookie(user.api_key),
				});
			}
		}

		if (url.pathname === "/dashboard" && request.method === "GET") {
			const user = await getCurrentUser(request, env);
			if (!user) {
				return redirect("/login");
			}

			return htmlResponse(dashboardPage(user));
		}

		if (url.pathname === "/logout" && request.method === "POST") {
			return redirect("/", {
				"Set-Cookie": clearSessionCookie(),
			});
		}

		// MCP Routes - require authentication via API key
		if (url.pathname === "/message") {
			return addCorsHeaders(
				Response.redirect(new URL("/sse/message", url).toString(), 302),
			);
		}

		// SSE endpoints handle Server-Sent Events
		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			// Extract API key from environment variable in request headers
			// The mcp-remote proxy will pass through environment variables
			const apiKey =
				request.headers.get("x-backpack-api-key") ||
				request.headers.get("authorization")?.replace("Bearer ", "") ||
				url.searchParams.get("api_key");

			if (!apiKey) {
				return addCorsHeaders(
					new Response("API key required. Please provide BACKPACK_API_KEY.", {
						status: 401,
					}),
				);
			}

			const user = await verifyApiKey(env.DB, apiKey);
			if (!user) {
				return addCorsHeaders(new Response("Invalid API key", { status: 401 }));
			}

			// Store user in env for tools to access
			(env as any).CURRENT_USER = user;

			return MyMCP.serveSSE("/sse")
				.fetch(request, env, ctx)
				.then(addCorsHeaders);
		}

		// MCP endpoint provides direct protocol access
		if (url.pathname === "/mcp") {
			// Same authentication as SSE
			const apiKey =
				request.headers.get("x-backpack-api-key") ||
				request.headers.get("authorization")?.replace("Bearer ", "") ||
				url.searchParams.get("api_key");

			if (!apiKey) {
				return addCorsHeaders(
					new Response("API key required. Please provide BACKPACK_API_KEY.", {
						status: 401,
					}),
				);
			}

			const user = await verifyApiKey(env.DB, apiKey);
			if (!user) {
				return addCorsHeaders(new Response("Invalid API key", { status: 401 }));
			}

			// Store user in env for tools to access
			(env as any).CURRENT_USER = user;

			return MyMCP.serve("/mcp").fetch(request, env, ctx).then(addCorsHeaders);
		}

		// All other routes return 404
		return new Response("Not found", { status: 404 });
	},
};
