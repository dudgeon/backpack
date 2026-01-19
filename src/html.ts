/**
 * HTML templates for Backpack web app
 */

const baseStyles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }
    .container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 100%;
        padding: 40px;
    }
    h1 {
        color: #667eea;
        margin-bottom: 10px;
        font-size: 32px;
    }
    h2 {
        color: #555;
        margin-bottom: 20px;
        font-size: 20px;
        font-weight: normal;
    }
    .form-group {
        margin-bottom: 20px;
    }
    label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
    }
    input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s;
    }
    input:focus {
        outline: none;
        border-color: #667eea;
    }
    button {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .link {
        text-align: center;
        margin-top: 20px;
        color: #666;
    }
    .link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
    }
    .link a:hover {
        text-decoration: underline;
    }
    .error {
        background: #fee;
        color: #c33;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        border: 1px solid #fcc;
    }
    .success {
        background: #efe;
        color: #3c3;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        border: 1px solid #cfc;
    }
    .api-key {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        word-break: break-all;
        margin: 20px 0;
        border: 2px solid #667eea;
    }
    .instructions {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 6px;
        margin: 20px 0;
        border-left: 4px solid #667eea;
    }
    .instructions h3 {
        color: #667eea;
        margin-bottom: 10px;
    }
    .instructions pre {
        background: #2d2d2d;
        color: #f8f8f8;
        padding: 15px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 10px 0;
        font-size: 14px;
    }
    .instructions code {
        font-family: 'Courier New', monospace;
    }
    .logo {
        font-size: 48px;
        text-align: center;
        margin-bottom: 20px;
    }
    ul {
        margin: 10px 0 10px 20px;
    }
    li {
        margin: 5px 0;
    }
`;

function layout(title: string, content: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Backpack</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container">
        <div class="logo">🎒</div>
        ${content}
    </div>
</body>
</html>
    `.trim();
}

export function landingPage(): string {
	return layout(
		"Welcome",
		`
        <h1>Backpack</h1>
        <h2>Augment any AI assistant with your personal tools and knowledge</h2>
        <p style="margin: 20px 0; color: #666;">
            Backpack is a universal MCP server that lets you personalize Claude, ChatGPT, Gemini,
            and other AI assistants with your own knowledge, context, and integrations.
        </p>
        <div style="margin: 30px 0;">
            <a href="/signup" style="text-decoration: none;">
                <button>Get Started</button>
            </a>
        </div>
        <div class="link">
            Already have an account? <a href="/login">Sign in</a>
        </div>
    `,
	);
}

export function signupPage(error?: string): string {
	return layout(
		"Sign Up",
		`
        <h1>Create Your Backpack</h1>
        <h2>Start augmenting your AI assistants</h2>
        ${error ? `<div class="error">${error}</div>` : ""}
        <form method="POST" action="/signup">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required autofocus>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required minlength="8">
            </div>
            <button type="submit">Create Account</button>
        </form>
        <div class="link">
            Already have an account? <a href="/login">Sign in</a>
        </div>
    `,
	);
}

export function loginPage(error?: string): string {
	return layout(
		"Sign In",
		`
        <h1>Welcome Back</h1>
        <h2>Sign in to your Backpack</h2>
        ${error ? `<div class="error">${error}</div>` : ""}
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required autofocus>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Sign In</button>
        </form>
        <div class="link">
            Don't have an account? <a href="/signup">Sign up</a>
        </div>
    `,
	);
}

export function dashboardPage(
	user: {
		email: string;
		api_key: string;
	},
	hostname: string,
): string {
	const mcpUrl = `https://${hostname}/sse`;

	return layout(
		"Dashboard",
		`
        <h1>Your Backpack Dashboard</h1>
        <h2>Connected as ${user.email}</h2>

        <div class="api-key">
            <strong>Your API Key:</strong><br>
            <span style="user-select: all;">${user.api_key}</span>
        </div>

        <div class="instructions">
            <h3>📱 Connect to Claude Desktop</h3>
            <p><strong>Step 1:</strong> Copy your API key above</p>
            <p><strong>Step 2:</strong> In Claude Desktop, go to <strong>Settings → Developer → Edit Config</strong></p>
            <p><strong>Step 3:</strong> Add this to your config file:</p>
            <pre><code>{
  "mcpServers": {
    "backpack": {
      "url": "${mcpUrl}",
      "headers": {
        "X-Backpack-API-Key": "${user.api_key}"
      }
    }
  }
}</code></pre>
            <p><strong>Step 4:</strong> Save the config and restart Claude Desktop</p>
        </div>

        <div class="instructions">
            <h3>🤖 ChatGPT & ✨ Gemini</h3>
            <p>Support for ChatGPT and Gemini is coming soon as they add MCP compatibility.</p>
        </div>

        <div style="margin-top: 30px;">
            <form method="POST" action="/logout">
                <button type="submit" style="background: #999;">Sign Out</button>
            </form>
        </div>
    `,
	);
}
