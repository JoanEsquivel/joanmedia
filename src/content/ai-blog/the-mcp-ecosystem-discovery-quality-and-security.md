---
title: "The MCP Ecosystem: Discovery, Quality, and Security"
description: "Navigate the 15,000+ MCP server ecosystem with practical guidance on where to find servers, how to evaluate them, and what the security landscape looks like."
pubDate: 2026-03-10
heroImage: "https://images.unsplash.com/photo-1639503547276-90230c4a4198?w=750&h=422&fit=crop"
category: "ai"
tags:
  - MCP
  - Claude Code
  - Security
  - AI Tooling
badge: "New"
series: "MCP Servers in Claude Code"
seriesOrder: 5
---

## Table of Contents

1. [A 15,000-Server Ecosystem With No App Store](#a-15000-server-ecosystem-with-no-app-store)
2. [Where to Find MCP Servers](#where-to-find-mcp-servers)
3. [How to Evaluate an MCP Server Before Installing](#how-to-evaluate-an-mcp-server-before-installing)
4. [The Security Landscape: What Audits Reveal](#the-security-landscape-what-audits-reveal)
5. [Security Best Practices](#security-best-practices)
6. [Evaluation Tools](#evaluation-tools)
7. [The Maturity Spectrum](#the-maturity-spectrum)
8. [Series Conclusion](#series-conclusion)

---

## A 15,000-Server Ecosystem With No App Store

The MCP ecosystem grew from a handful of reference implementations in late 2024 to over 15,000 publicly available servers by early 2026. There is no single, authoritative app store. Instead, servers are scattered across GitHub repositories, npm packages, community lists, and commercial platforms.

This is both the ecosystem's strength --- anyone can build and publish a server --- and its greatest risk. Unlike browser extensions or mobile apps, MCP servers are not reviewed, sandboxed, or signed by default. When you install one, you are giving an AI agent access to tools that can read your files, query your databases, and make API calls on your behalf.

This post covers how to navigate that landscape effectively.

---

## Where to Find MCP Servers

### Official Sources

| Source | URL | What You Get |
|--------|-----|-------------|
| **MCP Official Servers Repo** | [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Reference implementations maintained by the MCP project. The closest thing to "official" servers. |
| **Anthropic MCP Registry** | Accessible via `/mcp` in Claude Code or the [registry API](https://api.anthropic.com/mcp-registry/docs) | Curated list of servers verified to work with Claude Code. Includes install commands. |
| **Vendor-Published Servers** | Various (GitHub, Supabase, Sentry, etc.) | Servers maintained by the service provider. Usually the most reliable option for that service. |

### Community-Curated Lists

| Source | URL | Servers Listed | Distinguishing Feature |
|--------|-----|---------------|----------------------|
| **Awesome MCP Servers (punkpeye)** | [github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | Largest GitHub list | Community-maintained, regularly updated |
| **MCP Awesome** | [mcp-awesome.com](https://mcp-awesome.com/) | 1,200+ quality-verified | Verification process filters low-quality entries |
| **mcp.so** | [mcp.so](https://mcp.so/) | Large directory | Fast, minimalist interface with verified badges |
| **MCPServers.org** | [mcpservers.org](https://mcpservers.org/) | Comprehensive | Categorization and search |
| **MCPList.ai** | [mcplist.ai](https://www.mcplist.ai/) | Growing | Learning resource alongside discovery |
| **PulseMCP** | [pulsemcp.com](https://www.pulsemcp.com/) | Curated | Real-time monitoring and community insights |

### Specialized Lists

- **DevOps**: [awesome-devops-mcp-servers](https://github.com/rohitg00/awesome-devops-mcp-servers) --- curated specifically for DevOps tools
- **Microsoft**: [10 Microsoft MCP Servers](https://developer.microsoft.com/blog/10-microsoft-mcp-servers-to-accelerate-your-development-workflow) --- official Microsoft offerings

### Discovery Within Claude Code

Claude Code itself helps with discovery:

```bash
# List servers available in the Anthropic registry
# (accessible through the /mcp command inside Claude Code)
/mcp
```

The Anthropic registry dynamically loads servers that work with Claude Code and provides one-click install commands.

---

## How to Evaluate an MCP Server Before Installing

Not all MCP servers are created equal. Before adding a server to your workflow, evaluate it across five dimensions:

### 1. Publisher and Maintenance

| Signal | Good | Concerning |
|--------|------|-----------|
| Publisher | Official vendor (GitHub, Sentry, etc.) or MCP project | Unknown individual, no org affiliation |
| Last commit | Within last 3 months | Over 6 months ago |
| Open issues | Actively triaged | Hundreds of stale issues |
| License | MIT, Apache 2.0, or similar | No license, or restrictive license |
| Stars / usage | 100+ stars or listed in curated directories | Under 10 stars, no community adoption |

### 2. Security Posture

Questions to ask:
- Does the server use array-based command execution (safe) or shell string interpolation (dangerous)?
- Does it validate file paths against traversal attacks?
- Does it scope access to specific directories or resources?
- Does it require more permissions than its stated purpose needs?

### 3. Tool Count and Description Quality

- Fewer, well-described tools are better than many vague ones
- Each tool costs ~710 tokens of context
- A server with 91 tools (like GitHub MCP) consumes ~46,000 tokens --- make sure you need that breadth

### 4. Transport Type

- **HTTP/SSE**: Remote servers. Check the URL and verify the operator
- **stdio**: Local servers. The npm package or binary runs on your machine --- review what it installs

### 5. Authentication Model

| Method | Security Level | Notes |
|--------|---------------|-------|
| OAuth 2.0/2.1 | High | Short-lived tokens, scoped permissions |
| API key via environment variable | Moderate | Long-lived but scoped; keep out of version control |
| Hardcoded credentials | Dangerous | 3% of published servers contain hardcoded credentials |
| No authentication | Varies | Acceptable for read-only public data; dangerous for anything else |

---

## The Security Landscape: What Audits Reveal

### Trust Scores From Independent Audits

AgentAudit scanned the top 20 MCP servers using multiple LLM models (Gemini 2.5 Flash, Claude Opus 4, GPT-4o, Claude Haiku 4.5). Each server received a trust score out of 100:

**High Trust (99-100)**:
- Playwright MCP, Slack MCP, SQLite MCP, Fetch MCP (Anthropic)
- Stripe Agent Toolkit, Supabase MCP, Linear, Sentry, Cloudflare, Firebase

**Moderate Trust (65-94)**:
- MongoDB (94), Qdrant (85), Git-MCP (80), Grafana (80), GitHub (78), Notion (65)

**Low Trust (15-50)**:
- Terraform MCP (50): Shell injection in build arguments, downloads unverified binaries
- Chrome DevTools MCP (33): Unsanitized file writes enabling path traversal, command injection through Chrome launch arguments
- Kubernetes MCP (15): Arbitrary command execution via `KUBECONFIG_COMMAND`, unauthenticated HTTP transport. **Recommendation: do not use in production.**

### Ecosystem-Wide Vulnerability Patterns

Broader research across thousands of MCP servers reveals systemic issues:

| Vulnerability | Prevalence | Impact |
|--------------|-----------|--------|
| Path traversal susceptibility | 82% of implementations | Arbitrary file read/write |
| Code injection via sensitive APIs | 67% of implementations | Remote code execution |
| Command injection | 34% of implementations | System compromise |
| Hardcoded credentials in source | 3% of published servers | Credential exposure |
| No authentication at all | 38% of scanned servers | Unauthorized access |
| Insecure long-lived static secrets | 53% of credential-using servers | Token theft |
| Modern OAuth adoption | Only 8.5% | Most rely on less secure methods |

### Real-World Incidents

- **Supabase/Cursor breach (mid-2025)**: A Cursor agent running with privileged service-role access processed support tickets containing user-supplied input. Attackers embedded SQL instructions that exfiltrated sensitive integration tokens.
- **Anthropic Git MCP vulnerabilities (2025-2026)**: Three CVEs found in Anthropic's own official Git MCP server --- path validation bypass, unauthorized repo creation, and file overwrite through a read-only tool.
- **Claude Code project file exploitation (CVE-2025-59536, CVE-2026-21852)**: Researchers demonstrated remote code execution and API token exfiltration through malicious project configuration files exploiting hooks and MCP server definitions.

These incidents underscore that even official, well-maintained servers can have vulnerabilities. The ecosystem is still maturing.

---

## Security Best Practices

### Before Installing

1. **Check the trust score** if available (AgentAudit or similar tools)
2. **Review the source code** --- at minimum, check how commands are executed and whether paths are validated
3. **Prefer official vendor servers** over community alternatives for critical services
4. **Check for recent security advisories** on the server's GitHub repository

### When Configuring

1. **Start read-only**: If a server supports read-only mode, use it until you are confident in the integration
2. **Scope access narrowly**: Use the most restrictive permissions possible
3. **Use environment variables for credentials**: Never hardcode API keys in `.mcp.json` or configuration files checked into version control

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_URL}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

4. **Separate risky servers**: If you must use a lower-trust server (like Kubernetes MCP), isolate it in a local scope and disable it when not actively needed

### For Organizations

Claude Code supports managed MCP configurations for enterprise control:

- **`managed-mcp.json`**: Deploy a fixed set of approved servers. Users cannot add, modify, or use any other servers.
- **Allowlists/denylists**: Allow users to add their own servers within policy constraints.

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverCommand": ["npx", "-y", "approved-package"] }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" },
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

Managed configuration files go in system-wide directories:
- macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
- Linux/WSL: `/etc/claude-code/managed-mcp.json`
- Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

---

## Evaluation Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **AgentAudit** | Various | Scans MCP servers with multiple LLM models for 12 vulnerability patterns |
| **mcpserver-finder** | [GitHub](https://github.com/ModelContextProtocol-Security/mcpserver-finder) | Cloud Security Alliance project for quality, security, and safety evaluation |
| **MCP Security Checklist** | [GitHub (SlowMist)](https://github.com/slowmist/MCP-Security-Checklist) | Comprehensive checklist for evaluating MCP-based AI tools |

---

## The Maturity Spectrum

The MCP ecosystem sits at an interesting inflection point. On one end, you have production-grade servers from major vendors --- GitHub, Sentry, Stripe, Cloudflare --- with professional security practices, OAuth support, and active maintenance. On the other end, you have thousands of community servers of wildly varying quality, some with hardcoded credentials in their source code.

The practical approach:

1. **For critical workflows** (database access, cloud infrastructure, payment systems): Use only official vendor servers or servers with trust scores above 90.
2. **For convenience tools** (documentation lookup, web search): Community servers with moderate trust scores are acceptable, especially if they are read-only.
3. **For experimentation**: Try anything, but in a sandboxed environment or with minimal permissions.

The ecosystem will mature. Security tooling will improve. But right now, the responsibility for evaluation falls on you. The tools and frameworks in this post give you a systematic way to make that evaluation.

---

## Series Conclusion

Across these five posts, we have covered the full lifecycle of MCP servers in Claude Code:

1. **Configuration**: CLI commands, transport types, scopes, and how it differs from Cursor
2. **Context management**: How tools consume tokens, Tool Search, and optimization strategies
3. **Server selection**: Role-specific recommendations to start with what matters
4. **Comparisons**: Head-to-head analysis when multiple servers solve the same problem
5. **Ecosystem**: Discovery, evaluation, and security

The MCP ecosystem is moving fast. New servers appear weekly, security practices are improving, and Claude Code's Tool Search makes it practical to work with large numbers of servers without sacrificing context. The key is to be deliberate about what you install, understand the tradeoffs, and evaluate security before granting access to your tools and data.
