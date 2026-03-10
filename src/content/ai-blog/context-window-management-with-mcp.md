---
title: "Context Window Management with MCP"
description: "Learn how MCP tools consume your context window and practical strategies to reclaim tokens using Tool Search, deferred loading, and server optimization."
pubDate: 2026-03-10
heroImage: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=750&h=422&fit=crop"
category: "ai"
tags:
  - MCP
  - Context Window
  - Claude Code
  - Token Optimization
badge: "New"
series: "MCP Servers in Claude Code"
seriesOrder: 2
---

## Table of Contents

1. [The Hidden Cost of MCP Servers](#the-hidden-cost-of-mcp-servers)
2. [How MCP Tools Consume Tokens](#how-mcp-tools-consume-tokens)
3. [Tool Search: Claude Code's Answer to Context Bloat](#tool-search-claude-codes-answer-to-context-bloat)
4. [Deferred Tools: The Technical Mechanism](#deferred-tools-the-technical-mechanism)
5. [How Many MCP Servers Is Too Many?](#how-many-mcp-servers-is-too-many)
6. [Practical Strategies for Context Efficiency](#practical-strategies-for-context-efficiency)
7. [MCP Server Authors: Optimizing for Context](#mcp-server-authors-optimizing-for-context)
8. [Quick Reference: Context Management Settings](#quick-reference-context-management-settings)
9. [What is Next](#what-is-next)

---

## The Hidden Cost of MCP Servers

You added twelve MCP servers to Claude Code. GitHub, Sentry, Playwright, a database connector, Slack, Notion, a few more. Each one sounded useful. Then you noticed Claude Code struggling --- responses felt less sharp, conversations ran out of room faster, and the model occasionally forgot earlier parts of your discussion.

The cause: every MCP tool definition gets loaded into the context window. And with 200,000 tokens available on Claude Sonnet 4, those tool definitions can quietly consume 30-40% of your usable space before you type a single prompt.

Understanding this cost --- and the strategies Claude Code provides to manage it --- is the difference between an effective MCP setup and one that fights itself.

---

## How MCP Tools Consume Tokens

Every MCP server exposes one or more tools, and each tool has a definition that includes its name, description, and parameter schema. These definitions are loaded into the context window so the model knows what tools are available.

### Real-World Token Measurements

Research by developer Scott Spence measured actual token consumption across MCP servers:

| Configuration | Tools | Tokens Consumed | % of 200K Window |
|--------------|-------|-----------------|-------------------|
| Single server (mcp-omnisearch, original) | 20 tools | 14,214 tokens | 7.1% |
| Single server (mcp-omnisearch, optimized) | 8 tools | 5,663 tokens | 2.8% |
| All MCP servers enabled simultaneously | Many | 82,000 tokens | 41% |
| GitHub MCP server alone | 91 tools | ~46,000 tokens | 23% |

The average token cost is roughly **710 tokens per tool definition**. That means:

- 10 tools = ~7,000 tokens consumed
- 50 tools = ~35,000 tokens consumed
- 100 tools = ~70,000 tokens consumed (35% of the window, gone)

When your MCP setup hits 82,000 tokens, you have used 41% of the context window on tool definitions alone, leaving only about 118,000 tokens for your actual conversation, code, file contents, and model responses.

---

## Tool Search: Claude Code's Answer to Context Bloat

Claude Code includes a feature called **Tool Search** that fundamentally changes how MCP tools are loaded. Instead of loading all tool definitions upfront, Tool Search creates a lightweight search index and fetches tool details on-demand.

### How It Works

1. When Tool Search is active, MCP tools are **deferred** --- their full definitions are not loaded into context
2. Claude uses a search tool to discover relevant MCP tools when it needs them
3. Only the 3-5 tools Claude actually needs for the current task are loaded
4. From your perspective, MCP tools work exactly the same way

### The Numbers

The context savings are dramatic:

| Metric | Without Tool Search | With Tool Search | Reduction |
|--------|-------------------|------------------|-----------|
| Initial context for MCP tools | ~46,000 tokens (GitHub alone) | ~500 tokens (search index) | 99% |
| Typical multi-server setup | ~72,000 tokens | ~8,700 tokens | 88% |
| Percentage of 200K window used | 36% | 4.4% | 85% fewer tokens |

### When It Activates

Tool Search runs in **auto** mode by default. It activates when your MCP tool definitions would consume more than 10% of the context window (approximately 20,000 tokens). If you have only a few tools, they load normally without Tool Search.

### Configuration Options

Control Tool Search behavior with the `ENABLE_TOOL_SEARCH` environment variable:

| Value | Behavior |
|-------|----------|
| `auto` | Activates when MCP tools exceed 10% of context (default) |
| `auto:5` | Activates at a custom 5% threshold |
| `true` | Always enabled, regardless of tool count |
| `false` | Disabled; all MCP tools loaded upfront |

```bash
# Use a lower threshold (activate sooner)
ENABLE_TOOL_SEARCH=auto:5 claude

# Always use tool search
ENABLE_TOOL_SEARCH=true claude

# Disable entirely (load all tools upfront)
ENABLE_TOOL_SEARCH=false claude
```

You can also set this in your `settings.json` `env` field for persistence.

### Model Requirements

Tool Search requires models that support `tool_reference` blocks:
- **Supported**: Sonnet 4 and later, Opus 4 and later
- **Not supported**: Haiku models

---

## Deferred Tools: The Technical Mechanism

Under the hood, Tool Search uses a concept called **deferred loading**. Tools marked with `"defer_loading": true` stay out of context until discovered through search.

For developers building or customizing MCP servers, the implementation looks like this:

```json
{
  "name": "github_create_issue",
  "description": "Creates a new issue in a GitHub repository",
  "defer_loading": true,
  "input_schema": { ... }
}
```

Key rules for deferred tools:
- The search tool itself must **never** have `defer_loading: true`
- Keep 3-5 frequently-used tools as non-deferred (always loaded)
- At least one tool must always be loaded in context

For batch configuration of an entire MCP server:

```json
{
  "type": "mcp_toolset",
  "mcp_server_name": "github-server",
  "default_config": { "defer_loading": true },
  "configs": {
    "search_issues": { "defer_loading": false }
  }
}
```

This sets all GitHub tools to deferred by default, except `search_issues` which stays always-loaded.

---

## How Many MCP Servers Is Too Many?

There is no single answer, but research and community experience converge on practical guidelines:

### The Rule of Thumb

- **20-30 MCP servers**: Reasonable to configure globally (across your user scope)
- **Under 10**: Keep under 10 enabled per project
- **Under 80 tools active**: Stay under 80 tools actively loaded at any time

### Why More Is Not Always Better

Research indicates LLMs start struggling with 10-20+ active tools. The failure modes include:

1. **Confusion between similar tools**: When two tools do similar things (e.g., `web_search` and `tavily_search`), the model wastes tokens deciding which to use
2. **Poor tool selection**: With too many options, the model picks suboptimal tools more often
3. **Hallucinated tools**: Occasionally, the model invents tool names that do not exist

With Tool Search enabled, you can configure more servers globally because they are not all loaded at once. But even with Tool Search, having 50+ tools *available* means more search overhead per task.

---

## Practical Strategies for Context Efficiency

### Strategy 1: Per-Project Server Selection

Only enable the servers relevant to your current project. Use scopes to manage this:

```bash
# Global utilities (user scope --- always available)
claude mcp add --scope user --transport http notion https://mcp.notion.com/mcp
claude mcp add --scope user --transport http github https://api.githubcopilot.com/mcp/

# Project-specific (project scope --- shared with team)
claude mcp add --scope project --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/app"
```

### Strategy 2: Monitor Token Usage

Use the `/context` command inside Claude Code to see a breakdown of token usage. This shows you exactly how much space MCP tool definitions are consuming.

### Strategy 3: Consolidate Overlapping Servers

If you have multiple search tools (Brave, Tavily, Perplexity), pick one. If you have both a general filesystem MCP and Desktop Commander, decide which you need. Overlapping tools waste context and confuse the model.

### Strategy 4: Use Tool Search Proactively

If you know you need many MCP servers, force Tool Search on:

```bash
ENABLE_TOOL_SEARCH=true claude
```

This ensures deferred loading even if your tool definitions are below the 10% threshold.

### Strategy 5: Manage MCP Output Size

Large MCP tool outputs also consume context. Claude Code warns at 10,000 tokens and caps at 25,000 tokens by default.

```bash
# Increase for data-heavy workflows
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```

For servers that regularly produce large outputs (database queries, log analysis), consider configuring the server to paginate or filter responses.

---

## MCP Server Authors: Optimizing for Context

If you are building MCP servers, your design decisions directly impact how many tokens each tool consumes:

### Write Concise Descriptions

A verbose 87-token description like "Search the web using Tavily search engine. This tool provides comprehensive web search capabilities including factual lookups, academic research with citations, and real-time information retrieval..." can be reduced to a 12-token version: "Search using Tavily. Best for factual/academic topics with citations."

### Consolidate Related Tools

Instead of exposing four separate search tools, expose one tool with a `provider` parameter:

```json
{
  "name": "web_search",
  "description": "Search the web using the specified provider",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "provider": { "type": "string", "enum": ["tavily", "brave", "perplexity"] }
    }
  }
}
```

This reduces four tool definitions (~2,800 tokens) to one (~710 tokens).

### Add Server Instructions for Tool Search

When Tool Search is enabled, the server's `instructions` field helps Claude know *when* to search for your tools:

```
"instructions": "This server provides database querying and schema inspection tools. Search for these tools when the user asks about database operations, SQL queries, or schema analysis."
```

---

## Quick Reference: Context Management Settings

| Setting | Environment Variable | Default | Purpose |
|---------|---------------------|---------|---------|
| Tool Search mode | `ENABLE_TOOL_SEARCH` | `auto` | Controls when deferred loading activates |
| Tool Search threshold | `ENABLE_TOOL_SEARCH=auto:N` | `auto:10` | Percentage of context that triggers Tool Search |
| MCP output warning | --- | 10,000 tokens | Warns when tool output is large |
| MCP output max | `MAX_MCP_OUTPUT_TOKENS` | 25,000 tokens | Caps tool output size |
| Startup timeout | `MCP_TIMEOUT` | Varies | Time allowed for server startup |

---

## What is Next

Your context window is under control. Now the question becomes: which MCP servers are actually worth enabling? The answer depends heavily on what kind of work you do.

Part 3 provides curated recommendations organized by developer role.
