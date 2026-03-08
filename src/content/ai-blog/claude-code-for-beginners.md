---
title: "Claude Code CLI: The Complete Beginner's Guide"
description: "Everything you need to go from zero to productive with Claude Code — installation, commands, shortcuts, context management, and best practices."
pubDate: 2026-03-07
heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - CLI
  - Developer Tools
badge: ""
---

## Table of Contents

1. [What Is Claude Code, Really?](#1-what-is-claude-code-really)
2. [Installation & First Launch](#2-installation--first-launch)
3. [Core Commands — The Essential Cheat Sheet](#3-core-commands--the-essential-cheat-sheet)
4. [Keyboard Shortcuts — Your Survival Kit](#4-keyboard-shortcuts--your-survival-kit)
5. [The One Concept That Changes Everything: Context](#5-the-one-concept-that-changes-everything-context)
6. [Permission Modes — Understanding the Safety Net](#6-permission-modes--understanding-the-safety-net)
7. [CLAUDE.md — Your Project's Memory](#7-claudemd--your-projects-memory)
8. [The Four-Phase Workflow](#8-the-four-phase-workflow)
9. [Prompting Best Practices](#9-prompting-best-practices)
10. [Essential Workflows](#10-essential-workflows)
11. [Session Management — Don't Get Lost](#11-session-management--dont-get-lost)
12. [Configuration Files](#12-configuration-files)
13. [Models & Thinking](#13-models--thinking)
14. [Extending Claude Code](#14-extending-claude-code)
15. [Quick Reference Card](#15-quick-reference-card)

---

## You Just Installed Claude Code. Now What?

You've heard the buzz. Claude Code is Anthropic's agentic coding tool that lives in your terminal, reads your codebase, edits files, runs commands, and handles git workflows -- all through natural language. It has 75k+ stars on GitHub and developers swear by it.

But here's the thing: it's a terminal-based tool with dozens of commands, shortcuts, modes, and configuration options. Without a guide, it's easy to feel overwhelmed, burn through your context window, and wonder why Claude seems to "forget" what you told it five minutes ago.

This guide is designed to get you from zero to productive. We'll cover installation, core concepts, every command and shortcut you need, and the best practices that separate frustrated users from power users.

---

## 1. What Is Claude Code, Really?

Claude Code is **not** a chatbot. It's an **agentic coding environment**. The difference matters.

A chatbot answers questions and waits. Claude Code can:
- **Read your files** and understand your entire codebase
- **Edit files** across multiple directories
- **Run shell commands** (builds, tests, linters)
- **Manage git** (commits, branches, PRs)
- **Connect to external tools** via MCP (Slack, Jira, databases, Figma)
- **Spawn subagents** that work in parallel on different tasks

You describe what you want in plain English. Claude figures out how to build it -- exploring, planning, and implementing autonomously while you watch, redirect, or step away entirely.

### Where Can You Use It?

| Surface | Description |
|---------|-------------|
| **Terminal CLI** | The full-featured command line tool |
| **VS Code / Cursor** | Extension with inline diffs and @-mentions |
| **JetBrains IDEs** | Plugin for IntelliJ, PyCharm, WebStorm, etc. |
| **Desktop App** | Standalone app for visual diff review and multiple sessions |
| **Web (claude.ai/code)** | Browser-based, no local setup needed |
| **Slack** | Tag @Claude with a bug report, get a PR back |

All surfaces share the same engine, so your CLAUDE.md files, settings, and MCP servers work everywhere.

---

## 2. Installation & First Launch

### Install (Recommended Methods)

**macOS / Linux / WSL:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Homebrew (macOS/Linux):**
```bash
brew install --cask claude-code
```

**Windows PowerShell:**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**WinGet (Windows):**
```powershell
winget install Anthropic.ClaudeCode
```

> **Note:** The npm installation (`npm install -g @anthropic-ai/claude-code`) is **deprecated**. Use the native installer for auto-updates and the best experience.

### Your First Session

```bash
cd your-project
claude
```

That's it. You'll be prompted to log in on first use (Claude Pro/Max subscription or Anthropic Console API key required). After authentication, you're in an interactive session.

### Authentication Options

| Method | Best For |
|--------|----------|
| Claude Pro/Max subscription | Regular usage with monthly billing |
| Anthropic Console API key | Pay-as-you-go, CI/CD automation |

---

## 3. Core Commands -- The Essential Cheat Sheet

### Starting & Resuming Sessions

| Command | What It Does |
|---------|-------------|
| `claude` | Start a new interactive session |
| `claude "query"` | Start a session with an initial prompt |
| `claude -p "query"` | Run a single query non-interactively, then exit |
| `claude -c` | Resume the most recent conversation |
| `claude --resume` | Pick from recent sessions to resume |
| `claude -r "name"` | Resume a specific named session |
| `cat file \| claude -p "query"` | Pipe content into Claude |

### In-Session Quick Prefixes

| Prefix | What It Does |
|--------|-------------|
| `/` | Access slash commands and skills |
| `!` | Run a shell command directly (output added to context) |
| `@` | Reference a file or directory for context |

### The Most Important Slash Commands

| Command | What It Does |
|---------|-------------|
| `/help` | Show all available commands |
| `/init` | Generate a starter CLAUDE.md for your project |
| `/clear` | Reset conversation context (use between unrelated tasks!) |
| `/compact [focus]` | Compress context, optionally focusing on specific topics |
| `/context` | Visualize current context usage as a colored grid |
| `/cost` | Show token usage statistics |
| `/model` | Switch AI model mid-session |
| `/config` | Open settings interface |
| `/permissions` | View or update permission rules |
| `/vim` | Toggle vim-style editing mode |
| `/theme` | Change the color theme |
| `/diff` | Interactive diff viewer for uncommitted changes |
| `/rewind` | Restore conversation/code to a previous checkpoint |
| `/rename [name]` | Name your session for easy resumption |
| `/resume` | Open the session picker |
| `/copy` | Copy last response to clipboard |
| `/export` | Export conversation as plain text |
| `/agents` | Manage subagent configurations |
| `/hooks` | Manage hook configurations |
| `/mcp` | Manage MCP server connections |
| `/skills` | List available skills |
| `/plugin` | Browse the plugin marketplace |
| `/fast` | Toggle fast mode (same model, faster output) |
| `/plan` | Enter plan mode from the prompt |
| `/doctor` | Diagnose installation and settings issues |
| `/stats` | Visualize daily usage, sessions, and streaks |
| `/feedback` | Submit feedback or bug reports |

---

## 4. Keyboard Shortcuts -- Your Survival Kit

These are the shortcuts that keep you in flow. Learn the top 10 and you'll feel at home.

### General Controls

| Shortcut | What It Does |
|----------|-------------|
| `Esc` | Stop Claude mid-action (context preserved, redirect freely) |
| `Esc + Esc` | Open rewind menu (restore code/conversation to a checkpoint) |
| `Ctrl+C` | Cancel current input or generation |
| `Ctrl+D` | Exit the session |
| `Ctrl+L` | Clear terminal screen (keeps conversation) |
| `Ctrl+O` | Toggle verbose output (see Claude's thinking) |
| `Ctrl+R` | Reverse search through command history |
| `Ctrl+G` | Open current prompt/plan in your default text editor |
| `Ctrl+B` | Background a running command (continue working while it runs) |
| `Ctrl+T` | Toggle the task list view |
| `Shift+Tab` | Cycle permission modes (Normal -> Auto-Accept -> Plan) |
| `Option+T` / `Alt+T` | Toggle extended thinking on/off |
| `Option+P` / `Alt+P` | Switch model without clearing your prompt |

### Multiline Input

| Method | How |
|--------|-----|
| Backslash + Enter | `\` then `Enter` (works everywhere) |
| Option+Enter | Default on macOS |
| Shift+Enter | Works in iTerm2, WezTerm, Ghostty, Kitty |
| Ctrl+J | Line feed character |
| Paste directly | For code blocks and logs |

> **Tip:** If Shift+Enter doesn't work in your terminal, run `/terminal-setup` to install the binding.

### Text Editing

| Shortcut | What It Does |
|----------|-------------|
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete entire line |
| `Ctrl+Y` | Paste deleted text |
| `Alt+B` | Move cursor back one word |
| `Alt+F` | Move cursor forward one word |

> **macOS Note:** Option/Alt shortcuts require configuring "Option as Meta" in your terminal settings. In iTerm2: Settings -> Profiles -> Keys -> set Left/Right Option key to "Esc+".

---

## 5. The One Concept That Changes Everything: Context

Here's the single most important thing to understand about Claude Code:

> **Claude's context window is your most precious resource. Everything you do should protect it.**

The context window holds your entire conversation: every message, every file Claude reads, every command output. It fills up fast. When it fills, Claude starts "forgetting" earlier instructions and making more mistakes.

### How to Manage Context Like a Pro

| Strategy | How |
|----------|-----|
| **Clear between tasks** | Run `/clear` when switching to an unrelated task |
| **Use `/compact`** | Compress context with optional focus: `/compact Focus on the API changes` |
| **Delegate to subagents** | Say "use subagents to investigate X" -- they explore in separate context windows |
| **Monitor usage** | Use `/context` to see how full your window is |
| **Name sessions** | Use `/rename oauth-migration` so you can resume later with clean context |
| **Start fresh when stuck** | After 2+ failed corrections, `/clear` and write a better prompt |

### Context Anti-Patterns to Avoid

1. **The Kitchen Sink Session** -- Jumping between unrelated tasks in one session. Fix: `/clear` between tasks.
2. **The Correction Loop** -- Correcting Claude repeatedly on the same issue. Fix: After 2 failures, `/clear` and write a better initial prompt.
3. **The Infinite Exploration** -- Asking Claude to "investigate" without scoping it. Fix: Scope narrowly or use subagents.

---

## 6. Permission Modes -- Understanding the Safety Net

Claude Code asks for permission before modifying your system. There are three modes you cycle through with `Shift+Tab`:

| Mode | Indicator | What Claude Can Do |
|------|-----------|-------------------|
| **Normal Mode** | (default) | Claude asks before each file write, shell command, or tool use |
| **Auto-Accept Mode** | `accept edits on` | Claude executes without asking (faster, less safe) |
| **Plan Mode** | `plan mode on` | Claude can only read and analyze -- no writes, no commands |

### Permission Configuration

You can pre-approve safe commands to reduce interruptions:

```json
// .claude/settings.json
{
  "permissions": {
    "allowedTools": [
      "Read",
      "Write(src/**)",
      "Bash(git *)",
      "Bash(npm test *)",
      "Bash(npm run lint)"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm *)",
      "Bash(sudo *)"
    ]
  }
}
```

Use `/permissions` to manage these interactively. Use `/sandbox` for OS-level isolation.

> **Warning:** `--dangerously-skip-permissions` bypasses ALL checks. Only use in sandboxed environments without internet access.

---

## 7. CLAUDE.md -- Your Project's Memory

`CLAUDE.md` is a markdown file that Claude reads at the start of every session. It's your project's persistent memory.

### Quick Setup

```bash
claude
> /init
```

This analyzes your codebase and generates a starter CLAUDE.md.

### File Hierarchy

| Location | Scope | Share? |
|----------|-------|--------|
| `~/.claude/CLAUDE.md` | All projects globally | Personal |
| `./CLAUDE.md` | Project-wide | Check into git |
| `./CLAUDE.local.md` | Project-wide (personal) | .gitignore it |
| `./src/CLAUDE.md` | Component-specific | Check into git |

### What to Include

```markdown
# Code Style
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports when possible

# Workflow
- Always typecheck after code changes: `npm run typecheck`
- Run single tests, not the whole suite, for performance
- Branch naming: feature/TICKET-description

# Architecture
- API routes live in src/api/
- Auth uses JWT with refresh tokens in src/auth/
```

### What NOT to Include

- Things Claude can figure out by reading code
- Standard language conventions Claude already knows
- Detailed API docs (link to them instead)
- Information that changes frequently
- Self-evident practices like "write clean code"

> **Pro tip:** If Claude keeps ignoring a rule, your CLAUDE.md is probably too long. Prune ruthlessly. Add "IMPORTANT" or "YOU MUST" for critical rules.

---

## 8. The Four-Phase Workflow

The most effective pattern for using Claude Code on real tasks:

### Phase 1: Explore (Plan Mode)

Switch to Plan Mode (`Shift+Tab` twice or `--permission-mode plan`). Claude reads files and answers questions without making changes.

```
read /src/auth and understand how we handle sessions and login.
also look at how we manage environment variables for secrets.
```

### Phase 2: Plan (Still Plan Mode)

Ask Claude to create a detailed implementation plan.

```
I want to add Google OAuth. What files need to change?
What's the session flow? Create a plan.
```

Press `Ctrl+G` to open the plan in your text editor for direct editing.

### Phase 3: Implement (Normal Mode)

Switch back to Normal Mode and let Claude code.

```
implement the OAuth flow from your plan. write tests for the
callback handler, run the test suite and fix any failures.
```

### Phase 4: Commit

```
commit with a descriptive message and open a PR
```

> **When to skip the plan:** If you can describe the diff in one sentence (fixing a typo, renaming a variable, adding a log line), just ask Claude to do it directly.

---

## 9. Prompting Best Practices

### Be Specific, Not Vague

| Instead of... | Say... |
|---------------|--------|
| "add tests for foo.py" | "write a test for foo.py covering the edge case where the user is logged out. avoid mocks." |
| "fix the login bug" | "users report login fails after session timeout. check the auth flow in src/auth/, especially token refresh. write a failing test, then fix it." |
| "add a calendar widget" | "look at how existing widgets are implemented (HotDogWidget.php is a good example). follow that pattern to implement a calendar widget." |
| "make the dashboard look better" | "[paste screenshot] implement this design. take a screenshot and compare to the original." |

### Give Claude Verification Criteria

This is the **highest-leverage thing you can do**. Claude performs dramatically better when it can verify its own work.

```
write a validateEmail function. test cases:
- user@example.com -> true
- "invalid" -> false
- user@.com -> false
run the tests after implementing.
```

### Reference Files with @

```
Review accessibility @./src/components/Button.tsx
Fix all API routes @./src/api/
Compare implementations @./src/old.js @./src/new.js
```

### Let Claude Interview You for Big Features

```
I want to build [brief description]. Interview me in detail
using the AskUserQuestion tool. Ask about technical
implementation, UI/UX, edge cases, and tradeoffs.
Keep interviewing until we've covered everything,
then write a complete spec to SPEC.md.
```

Then start a fresh session to implement the spec.

---

## 10. Essential Workflows

### Exploring a New Codebase

```bash
cd /path/to/project
claude
> give me an overview of this codebase
> explain the main architecture patterns used here
> how is authentication handled?
> trace the login process from front-end to database
```

### Fixing Bugs

```
I'm seeing this error when I run npm test:
[paste error]
Fix it and verify the build succeeds.
Address the root cause, don't suppress the error.
```

### Writing Tests

```
find functions in NotificationsService.swift not covered by tests
> add tests for the notification service
> add test cases for edge conditions
> run the new tests and fix any failures
```

### Creating Pull Requests

```
commit my changes with a descriptive message
> create a pr
```

When you create a PR with `gh pr create`, the session is automatically linked. Resume later with `claude --from-pr 123`.

### Git Worktrees for Parallel Work

```bash
# Start Claude in an isolated worktree
claude --worktree feature-auth

# Start another session in a separate worktree
claude --worktree bugfix-123
```

Each worktree gets its own branch and files. No collisions between sessions.

### Using Claude as a Unix Utility

```bash
# Pipe data through Claude
cat build-error.txt | claude -p 'explain the root cause' > output.txt

# Use as a linter
claude -p 'look at changes vs. main and report typos'

# Fan out across files
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue" \
    --allowedTools "Edit,Bash(git commit *)"
done
```

---

## 11. Session Management -- Don't Get Lost

### Resuming Conversations

| Command | When to Use |
|---------|-------------|
| `claude -c` | Quick resume of your most recent session |
| `claude --resume` | Browse and pick from recent sessions |
| `claude -r "auth-refactor"` | Resume a specific named session |
| `claude --from-pr 123` | Resume sessions linked to a PR |

### Session Picker Shortcuts

| Key | Action |
|-----|--------|
| `Up/Down` | Navigate sessions |
| `Enter` | Select and resume |
| `P` | Preview session content |
| `R` | Rename a session |
| `/` | Search/filter sessions |
| `A` | Toggle between current dir and all projects |
| `B` | Filter to current git branch |

### Rewinding

Double-tap `Esc` or run `/rewind` to go back to any checkpoint. You can restore conversation only, code only, or both. Checkpoints persist across sessions.

---

## 12. Configuration Files

| File | Scope | Purpose |
|------|-------|---------|
| `~/.claude/settings.json` | Global (user) | Default settings for all projects |
| `.claude/settings.json` | Project | Team-shared project settings |
| `.claude/settings.local.json` | Project (personal) | Personal overrides, .gitignore this |
| `~/.claude/CLAUDE.md` | Global | Instructions for all sessions |
| `./CLAUDE.md` | Project | Project-specific instructions |
| `.claude/commands/*.md` | Project | Custom slash commands |
| `.claude/agents/*.md` | Project | Custom subagent definitions |
| `.claude/skills/*/SKILL.md` | Project | Skills for domain knowledge |

---

## 13. Models & Thinking

### Available Models

| Model | Best For |
|-------|----------|
| **Sonnet** | Best default; strong general performance, fast |
| **Opus** | Complex multi-step planning, deep reasoning |
| **Haiku** | Fastest and most token-efficient for simpler tasks |

Switch models with `/model` or `Alt+P` / `Option+P`.

### Extended Thinking

Enabled by default. Claude reasons through complex problems before responding.

- Toggle with `Option+T` / `Alt+T`
- View thinking with `Ctrl+O` (verbose mode)
- Adjust effort level in `/model` (low, medium, high)
- Use "ultrathink" in a prompt for one-off deep reasoning

---

## 14. Extending Claude Code

### Skills

Skills are reusable workflows in `.claude/skills/*/SKILL.md`. Claude loads them on demand.

```markdown
<!-- .claude/skills/fix-issue/SKILL.md -->
---
name: fix-issue
description: Fix a GitHub issue
---
Analyze and fix the GitHub issue: $ARGUMENTS.
1. Use `gh issue view` to get details
2. Search codebase for relevant files
3. Implement fix, write tests, commit, push, create PR
```

Invoke with `/fix-issue 1234`.

### Hooks

Hooks run scripts automatically at specific points in Claude's workflow. Unlike CLAUDE.md instructions, hooks are deterministic.

```
Write a hook that runs eslint after every file edit
```

Use `/hooks` for interactive configuration.

### MCP Servers

Connect external tools: databases, Slack, Jira, Figma, and more.

```bash
claude mcp add
```

### Plugins

Browse the marketplace with `/plugin`. Plugins bundle skills, hooks, and integrations in one installable package.

---

## 15. Quick Reference Card

```
STARTING UP
  claude                    Start new session
  claude "prompt"           Start with initial prompt
  claude -p "prompt"        Non-interactive query
  claude -c                 Resume last session
  claude --resume           Pick a session
  claude -w name            Start in isolated worktree

DURING A SESSION
  /clear                    Reset context (USE THIS OFTEN)
  /compact                  Compress context
  /context                  See context usage
  /model                    Switch model
  /plan                     Enter plan mode
  /diff                     View uncommitted changes
  /rewind                   Go back to a checkpoint
  /rename name              Name this session
  /copy                     Copy last response
  Esc                       Stop Claude mid-action
  Esc+Esc                   Rewind menu
  Shift+Tab                 Cycle permission modes
  Ctrl+O                    Toggle verbose output
  Ctrl+G                    Open in text editor
  Ctrl+R                    Search command history
  !command                  Run shell command directly
  @file.ts                  Reference a file

PROMPTING
  Be specific, not vague
  Give verification criteria (tests, screenshots)
  Use @ to reference files
  Scope investigations narrowly
  Use subagents for research

STAYING ORGANIZED
  /clear between unrelated tasks
  /rename sessions descriptively
  /compact when context gets heavy
  Start fresh after 2 failed corrections
  Use Plan Mode for exploration
```

---

## Conclusion: Your First Week Game Plan

1. **Day 1:** Install Claude Code, run `/init` in your project, explore your codebase with questions.
2. **Day 2:** Learn `/clear`, `Esc`, and `Shift+Tab`. Practice the explore-plan-implement-commit workflow.
3. **Day 3:** Set up your CLAUDE.md with project-specific commands, code style, and architecture notes.
4. **Day 4:** Configure permissions for commands you use often (`git`, `npm test`, your linter).
5. **Day 5:** Try subagents for code review, parallel worktrees for multi-tasking, and piping data through Claude.
6. **Weekend:** Browse `/plugin`, set up an MCP server, create a custom skill for your most repeated workflow.

The terminal doesn't have to be intimidating. Claude Code is designed to meet you where you are. Start with simple questions, build up to complex workflows, and use `/clear` liberally. You'll find your rhythm faster than you think.
