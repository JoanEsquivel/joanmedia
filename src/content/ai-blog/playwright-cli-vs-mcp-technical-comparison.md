---
title: "CLI vs MCP: The Technical Comparison for Playwright Browser Automation"
description: "A data-driven comparison of Playwright CLI and MCP architectures, covering token efficiency, command coverage, determinism, and when to use each approach."
pubDate: 2026-03-12
heroImage: "https://images.unsplash.com/photo-1429743305873-d4065c15f93e?w=750&h=422&fit=crop"
category: "qa"
tags:
  - Playwright
  - CLI
  - MCP
  - Browser Automation
  - Token Efficiency
badge: "New"
series: "Playwright CLI"
seriesOrder: 2
---

## Table of Contents

1. [Context: Two Approaches to the Same Problem](#context-two-approaches-to-the-same-problem)
2. [Core Idea: Context Window vs. Disk](#core-idea-context-window-vs-disk)
3. [Deep Dive: Token Efficiency](#deep-dive-token-efficiency)
4. [Command Set Comparison](#command-set-comparison)
5. [Determinism and Reliability](#determinism-and-reliability)
6. [Session Length and Scalability](#session-length-and-scalability)
7. [Test Generation](#test-generation)
8. [Decision Matrix](#decision-matrix)
9. [Tradeoffs](#tradeoffs)
10. [Conclusion](#conclusion)

---

## Context: Two Approaches to the Same Problem

Microsoft maintains both `@playwright/mcp` and `@playwright/cli`. They share the same Playwright core but expose it through fundamentally different architectures. Understanding when to use each requires looking past the feature lists and into the data flow.

## Core Idea: Context Window vs. Disk

The central architectural difference is a single question: **where does the browser state live?**

| | MCP | CLI |
|---|---|---|
| Page snapshots | Returned inline to the model | Saved as YAML files on disk |
| Screenshots | Base64-encoded in context | Saved as PNG files on disk |
| Console output | Streamed into conversation | Written to log files |
| Element references | Part of inline response | Part of YAML snapshot file |

With MCP, every interaction grows the conversation. With CLI, every interaction updates files on disk that the agent can choose to read or ignore.

## Deep Dive: Token Efficiency

### The Numbers

Multiple independent benchmarks converge on consistent figures:

| Metric | CLI | MCP |
|--------|-----|-----|
| Total tokens per session | ~27,000 | ~114,000 |
| Upfront schema cost | ~68 tokens | ~3,600 tokens |
| Per-action page state cost | Minimal (file path) | ~800+ tokens (accessibility tree) |
| Context utilization (200k window) | 16% | 18% |

The 4x gap comes from two compounding factors.

### Factor 1: Schema Overhead

When an MCP server connects, it sends a complete schema definition for every tool it exposes. The Playwright MCP server defines approximately 26 tools, each with parameter descriptions, type definitions, and usage instructions. This costs approximately 3,600 tokens before the agent performs a single action.

Playwright CLI has no schema. Each command is described in the skill's SKILL.md file at approximately 68 tokens total. The model learns the commands once and invokes them as shell strings.

### Factor 2: Cumulative Context Bloat

This is where the gap widens from 4x to 10x on longer sessions.

Consider an agent navigating through five pages of an e-commerce site:

**MCP (5 page navigations):**
- Page 1 snapshot: ~1,000 tokens (returned inline)
- Page 2 snapshot: ~1,200 tokens (returned inline, page 1 still in context)
- Page 3 snapshot: ~900 tokens (pages 1-2 still in context)
- Page 4 snapshot: ~1,100 tokens (pages 1-3 still in context)
- Page 5 snapshot: ~800 tokens (pages 1-4 still in context)
- Total accumulated: ~5,000 tokens of page state, most of it stale

**CLI (5 page navigations):**
- Page 1: `playwright-cli goto ...` --- returns file path (~20 tokens)
- Page 2: `playwright-cli goto ...` --- returns file path, page 1 YAML overwritten
- Pages 3-5: same pattern
- Agent reads current snapshot when needed: ~800 tokens on demand
- Total accumulated: ~100 tokens of commands + one current snapshot when read

By step 10 of a workflow, the MCP approach has consumed 7,000+ tokens of stale browser state. The CLI approach has consumed approximately 200 tokens of command output.

### Practical Benchmark: Shopping Cart Flow

TestDino documented a concrete comparison --- adding three products to a cart and proceeding to checkout on a demo e-commerce site:

- **MCP**: 7 interactions, each returning full accessibility trees. Total context consumed: ~7,400+ tokens of browser state.
- **CLI**: 7 shell commands producing minimal responses. Total context consumed: ~150 tokens of commands plus one current snapshot read on demand.

## Command Set Comparison

| Category | CLI Commands | MCP Tools |
|----------|-------------|-----------|
| Core actions | open, close, goto, click, dblclick, fill, type, drag, hover, select, upload, check, uncheck, snapshot, eval | browser_navigate, browser_click, browser_type, browser_snapshot, browser_select_option, browser_check, browser_upload_file |
| Keyboard | press, keydown, keyup | browser_press_key |
| Mouse | mousemove, mousedown, mouseup, mousewheel | (limited) |
| Screenshots/PDF | screenshot, pdf | browser_screenshot, browser_pdf |
| Tabs | tab-list, tab-new, tab-close, tab-select | browser_tab_list, browser_tab_new, browser_tab_close, browser_tab_select |
| Storage | state-save, state-load, cookie-*, localstorage-*, sessionstorage-* | browser_save_state, browser_load_state |
| Network | route, route-list, unroute | browser_route |
| DevTools | console, network, tracing-start, tracing-stop, video-start, video-stop | browser_console, browser_network |
| Dialogs | dialog-accept, dialog-dismiss | browser_dialog_accept, browser_dialog_dismiss |
| **Total** | **50+** | **~26** |

The CLI's larger command set exists because adding a shell command has zero schema overhead. Each command is a simple executable with flags. MCP tools require JSON schema definitions, parameter types, and descriptions that all get loaded into context.

## Determinism and Reliability

CLI provides higher determinism for two reasons:

1. **Explicit commands**: Each CLI invocation is a discrete, stateless operation. `playwright-cli click e15` does exactly one thing. There is no ambiguity about which tool to select from a schema.

2. **Versioned page state**: Snapshots save to timestamped files. The agent always knows which version of the page it is working with. MCP returns state inline, which can drift as the conversation accumulates stale data.

The Better Stack benchmark found that CLI achieved a 100% task success rate while MCP had partial failures (a screenshot operation failed during their test).

## Session Length and Scalability

MCP sessions degrade as they grow. The context window fills with accumulated browser state, leaving less room for the model's reasoning. Community reports describe sessions becoming unreliable after 15-20 browser interactions.

CLI sessions have no practical length limit. Since browser state lives on disk, the context window remains available for reasoning regardless of how many interactions have occurred. The agent reads the current snapshot when it needs page context and discards it after acting.

This matters significantly for test automation, where an agent might need to navigate through 30-50 pages in a single session to validate a complete user flow.

## Test Generation

CLI has a built-in capability that MCP lacks entirely: automatic test code generation from browser sessions.

As the agent navigates and interacts with a page through CLI commands, the tool records the sequence. After the session, it can generate a complete Playwright test file:

```javascript
test('add products to cart and checkout', async ({ page }) => {
  await page.goto('https://storedemo.testdino.com/');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  // ... auto-generated selectors and actions
});
```

With MCP, the agent must write tests manually based on the accumulated context in the conversation.

## Decision Matrix

| Your Situation | Recommended Approach |
|----------------|---------------------|
| Coding agent with shell access (Claude Code, Copilot, Cursor) | **CLI** |
| Sandboxed chat interface (Claude Desktop, custom chatbot) | **MCP** |
| Sessions with 5+ page interactions | **CLI** |
| Short exploratory inspection (1-3 pages) | Either; MCP is simpler to set up |
| Token cost is a primary concern | **CLI** |
| Zero-config setup priority | **MCP** |
| Generating test code from sessions | **CLI** (built-in) |
| Self-healing test workflows | **MCP** (continuous state monitoring) |
| CI/CD headless automation | **CLI** |
| Multi-user parallel testing | **CLI** (named sessions) |

## Tradeoffs

### Where MCP Still Wins

- **Sandboxed environments**: If the agent cannot run shell commands, MCP is the only option
- **Rich inline reasoning**: For tasks requiring the agent to reason extensively about page structure in a single step, having the full accessibility tree in context avoids an extra read call
- **Plug-and-play setup**: One JSON line in your MCP config vs. npm installation and skill configuration
- **Protocol standardization**: MCP is a standard protocol supported by multiple AI platforms; CLI is shell-specific

### Where CLI Has Clear Advantages

- **Token efficiency**: 4--10x reduction is not marginal; it translates directly to cost savings and longer sessions
- **Determinism**: Explicit commands with versioned state vs. schema-based tool selection
- **Command coverage**: 50+ commands vs. ~26 tools
- **Test generation**: Built-in capability vs. manual
- **Session durability**: No degradation over time
- **Shell composability**: Commands can be piped, chained with `&&`, and combined with other tools

## Conclusion

For the majority of AI coding agent workflows --- where the agent has shell access, sessions involve multiple page interactions, and token efficiency matters --- Playwright CLI is the superior choice. The architectural decision to save state to disk instead of streaming it into context is not a minor optimization. It fundamentally changes what is possible in a single agent session.

MCP remains the right tool for sandboxed environments and short exploratory tasks. But as coding agents become the primary interface for browser automation, the shift toward CLI-based approaches is clear.
