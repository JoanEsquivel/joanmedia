---
title: "Configuring MCP Servers in Claude Code"
description: "A step-by-step guide to adding, managing, and scoping MCP servers in Claude Code, with a migration cheat sheet for developers coming from Cursor."
pubDate: 2026-03-10
heroImage: "https://images.unsplash.com/photo-1506399309177-3b43e99fead2?w=750&h=422&fit=crop"
category: "ai"
tags:
  - MCP
  - Claude Code
  - Developer Tools
  - Configuration
badge: "New"
series: "MCP Servers in Claude Code"
seriesOrder: 1
---

## Table of Contents

1. [The Setup That Changes Everything](#the-setup-that-changes-everything)
2. [What MCP Servers Give You in Claude Code](#what-mcp-servers-give-you-in-claude-code)
3. [Transport Types: How Claude Code Talks to MCP Servers](#transport-types-how-claude-code-talks-to-mcp-servers)
4. [Adding Your First MCP Server](#adding-your-first-mcp-server)
5. [Managing MCP Servers](#managing-mcp-servers)
6. [Configuration Scopes: Where Your Config Lives](#configuration-scopes-where-your-config-lives)
7. [Cursor vs. Claude Code: A Migration Cheat Sheet](#cursor-vs-claude-code-a-migration-cheat-sheet)
8. [Environment Variables in .mcp.json](#environment-variables-in-mcpjson)
9. [OAuth Authentication](#oauth-authentication)
10. [Practical Tips](#practical-tips)
11. [What is Next](#what-is-next)

---

## The Setup That Changes Everything

You have been using MCP servers in Cursor for months. Your `.cursor/mcp.json` file is dialed in --- GitHub, Postgres, maybe a documentation server or two. Then you start using Claude Code and realize: the configuration model is completely different. No JSON file to edit in your IDE settings. No GUI toggle. Instead, you get a CLI-first workflow that is more powerful but less obvious.

This guide bridges that gap. If you already understand what MCP servers do, this post focuses entirely on *how* to configure them in Claude Code --- and how that differs from what you already know in Cursor.

---

## What MCP Servers Give You in Claude Code

Before diving into configuration, here is what becomes possible once MCP servers are connected. Claude Code can:

- **Implement features from issue trackers**: "Add the feature described in JIRA issue ENG-4521 and create a PR on GitHub."
- **Query databases directly**: "Find users who signed up in the last 30 days from our PostgreSQL database."
- **Analyze monitoring data**: "Check Sentry for the most common errors in the last 24 hours."
- **Integrate designs**: "Update our email template based on the new Figma designs."
- **Automate multi-tool workflows**: "Create Gmail drafts inviting these users to a feedback session."

The key difference from Cursor: Claude Code runs in the terminal, so MCP configuration happens through CLI commands rather than editor settings.

---

## Transport Types: How Claude Code Talks to MCP Servers

Claude Code supports three transport types. Understanding these is essential because they determine how you write your `add` commands.

### HTTP (Recommended for Remote Servers)

HTTP is the recommended transport for cloud-based services. Most major SaaS MCP servers --- GitHub, Sentry, Notion, Slack --- use this transport.

```bash
claude mcp add --transport http <name> <url>
```

### SSE (Server-Sent Events --- Deprecated)

SSE was the original remote transport but has been deprecated in favor of HTTP. Some older servers still use it.

```bash
claude mcp add --transport sse <name> <url>
```

### stdio (Local Process Servers)

stdio servers run as local processes on your machine. They are ideal for tools that need direct system access --- filesystem operations, local database connections, custom scripts.

```bash
claude mcp add --transport stdio <name> -- <command> [args...]
```

**Important syntax rule**: All options (`--transport`, `--env`, `--scope`, `--header`) must come *before* the server name. The `--` (double dash) separates the server name from the command and arguments passed to the MCP server process. This prevents conflicts between Claude's flags and the server's flags.

---

## Adding Your First MCP Server

### Remote HTTP Server (Most Common)

```bash
# Connect to GitHub
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Connect to Sentry
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Connect to Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp

# With a Bearer token
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

### Local stdio Server

```bash
# Airtable with API key
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server

# PostgreSQL via DBHub
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"

# Playwright for browser automation
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```

### From JSON Configuration

If you have a JSON config (perhaps exported from another tool), you can add it directly:

```bash
# HTTP server with headers
claude mcp add-json weather-api \
  '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# stdio server with environment variables
claude mcp add-json local-db \
  '{"type":"stdio","command":"/path/to/db-cli","args":["--readonly"],"env":{"DB_URL":"postgres://..."}}'
```

### Import from Claude Desktop

If you already have servers configured in Claude Desktop, import them directly:

```bash
claude mcp add-from-claude-desktop
```

This opens an interactive dialog to select which servers to import. It works on macOS and WSL.

---

## Managing MCP Servers

Once configured, management happens through the CLI:

```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get github

# Remove a server
claude mcp remove github

# Check status of all servers (inside Claude Code)
/mcp
```

The `/mcp` command inside Claude Code is especially useful --- it shows connection status, lets you authenticate with OAuth servers, and displays which servers come from plugins versus manual configuration.

---

## Configuration Scopes: Where Your Config Lives

This is one of the biggest conceptual differences from Cursor. Claude Code uses three scope levels, each stored in a different location:

### Local Scope (Default)

- **Stored in**: `~/.claude.json` (under your project's path)
- **Visible to**: Only you, only in this project
- **Use for**: Personal API keys, experimental servers, credentials

```bash
# Local is the default --- no flag needed
claude mcp add --transport http stripe https://mcp.stripe.com

# Explicit local scope
claude mcp add --transport http stripe --scope local https://mcp.stripe.com
```

### Project Scope

- **Stored in**: `.mcp.json` at your project root
- **Visible to**: Everyone on the team (checked into version control)
- **Use for**: Shared tools, project-specific servers

```bash
claude mcp add --transport http sentry --scope project https://mcp.sentry.dev/mcp
```

The resulting `.mcp.json` file:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

### User Scope

- **Stored in**: `~/.claude.json` (global section)
- **Visible to**: Only you, across all projects
- **Use for**: Personal utilities you need everywhere

```bash
claude mcp add --transport http notion --scope user https://mcp.notion.com/mcp
```

### Scope Precedence

When servers with the same name exist at multiple scopes: **Local > Project > User**. This means your personal credentials can override shared configurations.

---

## Cursor vs. Claude Code: A Migration Cheat Sheet

If you are coming from Cursor, here is how the concepts map:

| Concept | Cursor | Claude Code |
|---------|--------|-------------|
| **Config file** | `~/.cursor/mcp.json` | `~/.claude.json` (local/user) or `.mcp.json` (project) |
| **Config format** | `{ "mcpServers": { ... } }` | Same JSON format, but primarily managed via CLI |
| **Adding servers** | Edit JSON file manually | `claude mcp add` CLI command |
| **Transport types** | stdio, SSE | stdio, HTTP (recommended), SSE (deprecated) |
| **Remote servers** | SSE transport | HTTP transport (preferred) |
| **Tool limit** | Hard 40-tool limit | No hard limit; Tool Search handles scale |
| **Tool loading** | All tools loaded at start | Tool Search defers loading automatically |
| **Per-project config** | One JSON file | Three scopes (local, project, user) |
| **Server discovery** | Curated list with one-click install | CLI-based or import from Claude Desktop |
| **OAuth authentication** | Varies | Built-in via `/mcp` command |

### Key Differences to Watch

1. **No GUI**: Claude Code is CLI-first. You add servers with commands, not by editing a JSON file in your IDE. You *can* edit `.mcp.json` directly for project-scoped servers, but the CLI is the primary interface.

2. **HTTP over SSE**: Cursor leans on SSE for remote servers. Claude Code recommends HTTP and has deprecated SSE.

3. **No tool limit**: Cursor caps at 40 tools. Claude Code has no hard limit --- instead it uses Tool Search to dynamically load tools when you have many configured (more on this in Part 2).

4. **Scope system**: Cursor has one config file. Claude Code has three scopes, making it easier to separate team-shared configs from personal credentials.

---

## Environment Variables in .mcp.json

For project-scoped servers shared via version control, Claude Code supports environment variable expansion. This lets teams share configurations without exposing secrets:

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

Supported syntax:
- `${VAR}` --- expands to the value of environment variable `VAR`
- `${VAR:-default}` --- uses `default` if `VAR` is not set

Variables can be used in `command`, `args`, `env`, `url`, and `headers` fields. If a required variable is not set and has no default, Claude Code will fail to parse the config.

---

## OAuth Authentication

Many cloud-based MCP servers require OAuth. Claude Code handles this through a browser-based flow:

1. Add the server: `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp`
2. Inside Claude Code, run: `/mcp`
3. Select the server and choose "Authenticate"
4. Complete the login in your browser

Tokens are stored securely and refreshed automatically. Use "Clear authentication" in the `/mcp` menu to revoke access.

For servers that require pre-configured OAuth credentials (when you see "does not support dynamic client registration"):

```bash
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

---

## Practical Tips

- **Startup timeout**: Set `MCP_TIMEOUT=10000 claude` for servers that take longer to initialize (default varies)
- **Output limits**: Claude Code warns when MCP tool output exceeds 10,000 tokens. Increase with `MAX_MCP_OUTPUT_TOKENS=50000`
- **Windows users**: Wrap `npx` commands with `cmd /c` to avoid "Connection closed" errors: `claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package`
- **Dynamic updates**: Claude Code supports MCP `list_changed` notifications --- servers can update their tools without requiring a reconnection
- **Plugin MCP servers**: Claude Code plugins can bundle MCP servers that start automatically when the plugin is enabled

---

## What is Next

Your servers are configured. But how many is too many? How do MCP tools affect your context window? And what is this "Tool Search" feature that makes Claude Code handle large numbers of servers without breaking a sweat?

That is covered in Part 2: Context Window Management with MCP.
