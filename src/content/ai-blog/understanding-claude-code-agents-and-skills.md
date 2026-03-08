---
title: "Understanding Claude Code Agents & Skills"
description: "Learn how custom agents and skills extend Claude Code, turning repetitive prompts into reusable workflows with persistent memory and composable architecture."
pubDate: 2026-03-11
heroImage: "https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - Agents
  - Skills
  - Prompt Engineering
  - AI Tools
badge: "New"
series: "Building Custom Agents in Claude Code"
seriesOrder: 1
---

## Table of Contents

1. [The Problem with One-Size-Fits-All AI Assistants](#the-problem-with-one-size-fits-all-ai-assistants)
2. [Where Agents Fit in the Claude Code Ecosystem](#where-agents-fit-in-the-claude-code-ecosystem)
3. [The Agent System: How It Works](#the-agent-system-how-it-works)
4. [The Skill System: Reusable Workflows](#the-skill-system-reusable-workflows)
5. [The `.claude/` Directory Structure](#the-claude-directory-structure)
6. [Agent Configuration: The Frontmatter](#agent-configuration-the-frontmatter)
7. [Skill Configuration: The Frontmatter](#skill-configuration-the-frontmatter)
8. [How Skills Are Invoked](#how-skills-are-invoked)
9. [What's Next](#whats-next)

---

## The Problem with One-Size-Fits-All AI Assistants

You've been using Claude Code for a few weeks. It writes great code, debugs efficiently, and handles most tasks you throw at it. But then you notice a pattern: every time you need a specific workflow --- generating test cases, evaluating story points, researching a topic --- you find yourself typing the same long prompts over and over. You're essentially re-teaching Claude the same role, the same constraints, the same output format, every single time.

What if you could define that role once and invoke it with a single command?

That's exactly what custom agents and skills solve.

## Where Agents Fit in the Claude Code Ecosystem

Claude Code is Anthropic's CLI tool for AI-assisted software engineering. Out of the box, it provides a powerful conversational interface backed by Claude's reasoning capabilities. But its real power lies in its extensibility: agents, skills, hooks, MCP servers, and settings form a composable system that lets you tailor Claude Code to your exact workflow.

Here's how the key concepts relate:

- **Claude Code** is the runtime --- the CLI that manages the conversation, context window, and tool execution
- **Agents** are specialized personas with defined roles, tools, and memory --- launched as subprocesses via the `Agent` tool
- **Skills** are reusable workflow definitions that agents (or the main conversation) can invoke --- think of them as documented procedures
- **MCP Servers** provide external tool access (databases, APIs, browsers) that agents can use
- **Hooks** are event-driven shell commands that trigger before or after tool calls
- **Settings** control permissions, model selection, and feature flags

Agents and skills sit at the center of this architecture. They're how you encode your team's domain expertise into Claude Code.

## The Agent System: How It Works

When you define a custom agent, you're creating a **specialized subprocess** that Claude Code can launch. Each agent:

1. **Runs in its own context window** --- isolated from the main conversation
2. **Has a defined role and instructions** --- the agent prompt shapes its behavior
3. **Can access specific tools** --- you control what it can do
4. **Has persistent memory** --- it learns from previous interactions
5. **Returns results to the caller** --- the main session or another agent

### Agent Types

Claude Code supports several agent types, each configured for different purposes:

| Type | Model | Tools | Typical Use |
|------|-------|-------|-------------|
| `general-purpose` | Inherits | All tools | Complex multi-step tasks, research |
| `Explore` | Haiku | Read-only | Finding files, searching code, codebase questions |
| `Plan` | Inherits | Read-only | Codebase research for planning mode |
| `Bash` | Inherits | Terminal commands | Running commands in separate context |
| `Claude Code Guide` | Haiku | None | Questions about Claude Code features |
| Custom agents | Configurable | Configurable | Domain-specific workflows |

Custom agents are the focus of this guide. They're defined as markdown files and registered automatically when placed in the `.claude/agents/` directory.

### The Agent Lifecycle

```
User invokes agent (via Agent tool or slash command)
    │
    ▼
Claude Code reads the agent's .md file
    │
    ▼
A new subprocess launches with:
  - The agent's system prompt (from the .md file)
  - Access to its assigned skill(s)
  - Its persistent memory loaded
  - Tool permissions from settings
    │
    ▼
The agent works autonomously
  - Uses tools, reads files, searches the web
  - Follows its skill workflow
  - Updates its memory if needed
    │
    ▼
Returns results to the caller
```

## The Skill System: Reusable Workflows

While agents define *who* does the work (role, personality, constraints), skills define *how* the work gets done (workflow, phases, output format).

A skill is a markdown file that describes a structured procedure. It answers:
- **When** should this skill be used?
- **What** are the steps?
- **What** does the output look like?
- **What** are the constraints?

### Skills vs. Agents: The Distinction

| Aspect | Agent | Skill |
|--------|-------|-------|
| What it is | A persona with a role | A workflow procedure |
| Where it lives | `.claude/agents/{name}.md` | `.claude/skills/{name}/SKILL.md` |
| Has memory | Yes (persistent) | No |
| Has a model | Yes (configurable) | No (uses the invoking agent's model) |
| Can be invoked by users | Via slash commands or Agent tool | Via slash commands or referenced by agents |
| Relationship | An agent *uses* skills | A skill *is used by* agents or directly |

Think of it this way: an agent is like a team member, and a skill is like a standard operating procedure (SOP) that team member follows.

> **Key architecture insight**: Skills use a "context injection" pattern. When Claude invokes a skill, the system loads `SKILL.md`, expands it into detailed instructions, and injects them as new user messages in the conversation. This is fundamentally different from traditional tools --- skills *prepare* Claude to solve a problem rather than solving it directly. Claude decides which skills to invoke based on their textual descriptions, not through algorithmic selection.

## The `.claude/` Directory Structure

Agents and skills live in two scopes: **user-level** (`~/.claude/`) applies to all projects, and **project-level** (`.claude/` in repo root) applies to one project. Project agents take priority over user agents.

### Project Scope (in repo root)

```
.claude/
├── settings.json                # Project settings (commit to git)
├── settings.local.json          # Local overrides (gitignored)
├── CLAUDE.md                    # Project memory file
├── agents/                      # Agent definitions
│   ├── qa-engineer.md           # One file per agent
│   ├── blog-researcher.md
│   └── ai-blog-publisher.md
├── skills/                      # Skill definitions
│   ├── test-case-creation/
│   │   ├── SKILL.md             # Main instructions (required)
│   │   ├── template.md          # Optional template for Claude to fill
│   │   └── examples/            # Optional example outputs
│   ├── story-point-evaluation/
│   │   └── SKILL.md
│   └── research-for-posts/
│       └── SKILL.md
├── agent-memory/                # Project-scope agent memory
│   ├── qa-engineer/
│   │   ├── MEMORY.md            # Main memory (loaded in system prompt)
│   │   └── patterns.md          # Supplementary topic files
│   └── blog-researcher/
│       └── MEMORY.md
└── agent-memory-local/          # Local-scope memory (gitignored)
    └── ...
```

### User Scope (global)

```
~/.claude/
├── settings.json                # User settings
├── CLAUDE.md                    # User memory file
├── agents/                      # User-level agents (all projects)
├── skills/                      # User-level skills (all projects)
└── agent-memory/                # User-scope agent memory
```

### Priority Order (highest to lowest)

1. `--agents` CLI flag (session only)
2. `.claude/agents/` (project scope)
3. `~/.claude/agents/` (user scope)
4. Plugin's `agents/` directory

### Key Rules

1. **Agent files** are markdown with YAML frontmatter --- the frontmatter configures the agent, the body is the system prompt
2. **Skill files** must be named `SKILL.md` inside a directory matching the skill name
3. **Memory files** are automatically loaded --- `MEMORY.md` goes into the system prompt (max 200 lines)
4. **Settings** control which tools agents can use --- `settings.local.json` defines the allowlist

## Agent Configuration: The Frontmatter

Every agent file starts with YAML frontmatter that configures its behavior:

```yaml
---
name: qa-engineer
description: "Use this agent when the user needs QA-related tasks such as test case creation, test planning, story point evaluation, or quality assessment of code changes."
model: opus
color: blue
memory: project
skills: test-case-creation, story-point-evaluation
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase letters and hyphens) |
| `description` | Yes | When to use this agent --- Claude uses this to decide when to delegate |
| `tools` | No | Tools the agent can use (inherits all if omitted). Use `Agent(worker, researcher)` syntax to restrict subagent spawning |
| `disallowedTools` | No | Tools to deny (removed from inherited or specified list) |
| `model` | No | `opus`, `sonnet`, `haiku`, or `inherit` (default: `inherit`) |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan` |
| `maxTurns` | No | Maximum agentic turns before stopping |
| `skills` | No | Skills to preload into context at startup |
| `mcpServers` | No | MCP servers available to this agent |
| `hooks` | No | Lifecycle hooks scoped to this agent |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local` |
| `background` | No | Set `true` to always run as a background task |
| `isolation` | No | Set to `worktree` for isolated git worktree copy |

> **Important pitfall**: Agent names can trigger built-in behaviors. A name like `code-reviewer` may cause Claude to override your custom instructions with generic review rules. Use neutral, non-descriptive names when your custom instructions matter.

## Skill Configuration: The Frontmatter

Skills also have YAML frontmatter that controls their behavior:

```yaml
---
name: test-case-creation
description: Generate comprehensive test cases from feature descriptions or code changes.
allowed-tools: Read, Glob, Grep, Write
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name (defaults to directory name). Max 64 chars |
| `description` | Recommended | What the skill does --- Claude uses this for auto-invocation |
| `argument-hint` | No | Hint for autocomplete, e.g. `[feature-description]` |
| `allowed-tools` | No | Tools Claude can use without permission when skill is active |
| `model` | No | Model to use when skill is active |
| `context` | No | Set to `fork` to run in a forked subagent context |
| `agent` | No | Which subagent type when `context: fork` is set |
| `disable-model-invocation` | No | `true` = only user can invoke (manual `/name` only) |
| `user-invocable` | No | `false` = hidden from `/` menu, only Claude can invoke |

### Invocation Control

| Frontmatter | User can invoke | Claude can invoke |
|-------------|----------------|-------------------|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

## How Skills Are Invoked

Skills can be invoked in three ways:

### 1. By an Agent (Automatic)

When an agent's frontmatter lists a skill via `skills:`, the skill is preloaded into the agent's context at startup:

```markdown
Your task is to generate test cases using the `test-case-creation` skill.

Instructions:
1. Use the `test-case-creation` skill.
2. Follow the skill workflow exactly.
```

### 2. By the User (Slash Command)

Skills with a `name` become available as slash commands. Users type `/skill-name` to invoke them directly. You can pass arguments that get substituted via `$ARGUMENTS`.

### 3. By Claude (Auto-invocation)

When a skill has a `description`, Claude can decide to invoke it automatically based on the user's request. The description text is always present in Claude's context, so write it carefully --- it's what Claude uses to decide whether to load the full skill.

## What's Next

Now that you understand the architecture, the next post walks through building your first custom agent step by step --- from writing the prompt to testing the output.

---

*This is Part 1 of a 3-part series on building custom agents and skills in Claude Code.*

- **Part 1: Understanding Claude Code Agents & Skills** (you are here)
- Part 2: Building Your First Custom Agent
- Part 3: QA Engineer Agent --- A Complete Example
