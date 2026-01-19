/**
 * Authentication utilities for Backpack
 */

export interface User {
	id: number;
	email: string;
	api_key: string;
	oauth_client_id?: string;
	oauth_client_secret?: string;
	created_at: string;
}

/**
 * Simple password hashing using Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Generate a random API key for MCP authentication
 */
export function generateApiKey(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Create a new user account
 */
export async function createUser(
	db: D1Database,
	email: string,
	password: string,
): Promise<User | null> {
	try {
		const passwordHash = await hashPassword(password);
		const apiKey = generateApiKey();
		const oauthClientId = generateApiKey();
		const oauthClientSecret = generateApiKey();

		const result = await db
			.prepare(
				"INSERT INTO users (email, password_hash, api_key, oauth_client_id, oauth_client_secret) VALUES (?, ?, ?, ?, ?) RETURNING id, email, api_key, oauth_client_id, oauth_client_secret, created_at",
			)
			.bind(email, passwordHash, apiKey, oauthClientId, oauthClientSecret)
			.first<User>();

		return result;
	} catch (error) {
		console.error("Error creating user:", error);
		return null;
	}
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(
	db: D1Database,
	email: string,
	password: string,
): Promise<User | null> {
	try {
		const passwordHash = await hashPassword(password);
		const user = await db
			.prepare(
				"SELECT id, email, api_key, oauth_client_id, oauth_client_secret, created_at FROM users WHERE email = ? AND password_hash = ?",
			)
			.bind(email, passwordHash)
			.first<User>();

		return user;
	} catch (error) {
		console.error("Error authenticating user:", error);
		return null;
	}
}

/**
 * Verify API key for MCP authentication
 */
export async function verifyApiKey(
	db: D1Database,
	apiKey: string,
): Promise<User | null> {
	try {
		const user = await db
			.prepare(
				"SELECT id, email, api_key, created_at FROM users WHERE api_key = ?",
			)
			.bind(apiKey)
			.first<User>();

		return user;
	} catch (error) {
		console.error("Error verifying API key:", error);
		return null;
	}
}

/**
 * Get user by email
 */
export async function getUserByEmail(
	db: D1Database,
	email: string,
): Promise<User | null> {
	try {
		const user = await db
			.prepare(
				"SELECT id, email, api_key, created_at FROM users WHERE email = ?",
			)
			.bind(email)
			.first<User>();

		return user;
	} catch (error) {
		console.error("Error getting user:", error);
		return null;
	}
}

/**
 * Simple session management using cookies
 */
export function createSessionCookie(apiKey: string): string {
	return `session=${apiKey}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`; // 30 days
}

export function getSessionFromCookie(
	cookieHeader: string | null,
): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(";").map((c) => c.trim());
	for (const cookie of cookies) {
		const [name, value] = cookie.split("=");
		if (name === "session") {
			return value;
		}
	}
	return null;
}

export function clearSessionCookie(): string {
	return "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

/**
 * OAuth token management
 */
export async function createOAuthToken(
	db: D1Database,
	userId: number,
): Promise<{ access_token: string; expires_in: number } | null> {
	try {
		const accessToken = generateApiKey();
		const expiresIn = 3600; // 1 hour
		const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

		await db
			.prepare(
				"INSERT INTO oauth_tokens (user_id, access_token, expires_at) VALUES (?, ?, ?)",
			)
			.bind(userId, accessToken, expiresAt)
			.run();

		return { access_token: accessToken, expires_in: expiresIn };
	} catch (error) {
		console.error("Error creating OAuth token:", error);
		return null;
	}
}

export async function verifyOAuthToken(
	db: D1Database,
	accessToken: string,
): Promise<User | null> {
	try {
		const result = await db
			.prepare(
				`SELECT u.id, u.email, u.api_key, u.oauth_client_id, u.oauth_client_secret, u.created_at
				FROM users u
				INNER JOIN oauth_tokens t ON u.id = t.user_id
				WHERE t.access_token = ? AND t.expires_at > datetime('now')`,
			)
			.bind(accessToken)
			.first<User>();

		return result;
	} catch (error) {
		console.error("Error verifying OAuth token:", error);
		return null;
	}
}

export async function verifyOAuthClientCredentials(
	db: D1Database,
	clientId: string,
	clientSecret: string,
): Promise<User | null> {
	try {
		const user = await db
			.prepare(
				"SELECT id, email, api_key, oauth_client_id, oauth_client_secret, created_at FROM users WHERE oauth_client_id = ? AND oauth_client_secret = ?",
			)
			.bind(clientId, clientSecret)
			.first<User>();

		return user;
	} catch (error) {
		console.error("Error verifying OAuth client credentials:", error);
		return null;
	}
}
