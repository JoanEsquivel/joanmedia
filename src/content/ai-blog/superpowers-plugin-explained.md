---
title: "Superpowers, Explained: The Plugin That Turned a Development Methodology Into Markdown"
description: "What the Superpowers plugin for Claude Code actually is: 14 Agent Skills, a session hook, and an enforced methodology — and how it grew to v6."
pubDate: 2026-07-16
heroImage: "https://images.unsplash.com/photo-1531907700752-62799b2a3e84?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - Superpowers
  - Agent Skills
  - AI Coding Agents
badge: "New"
series: "Superpowers and Claude Code Agent Skills"
seriesOrder: 1
---

## Table of Contents

1. [A methodology, not a tool](#a-methodology-not-a-tool)
2. [Under the hood: it's all Agent Skills](#under-the-hood-its-all-agent-skills)
3. [From experiment to ecosystem fixture: the road to v6](#from-experiment-to-ecosystem-fixture-the-road-to-v6)
4. [Why this matters even if you never install it](#why-this-matters-even-if-you-never-install-it)

---

*Current as of Superpowers v6.1.1, July 2026.*

Ask Claude Code to "add rate limiting to my API" and watch what it does: it starts writing code. Usually within seconds. No questions about which endpoints, no discussion of algorithms, no test written first. When the result is wrong — and for anything non-trivial it often is in some dimension you didn't specify — you iterate, correct, and repeat, burning time and context on rework.

Jesse Vincent's answer to this problem has become the most-installed plugin in the Claude Code ecosystem: [Superpowers](https://github.com/obra/superpowers), sitting at 254,696 GitHub stars and over 941,000 installs on the [official Claude plugin marketplace](https://claude.com/plugins/superpowers) as of mid-July 2026. This post explains what it actually is, how it works under the hood, and how it got from a personal experiment in October 2025 to where it is today.

## A methodology, not a tool

The repo's own description is precise: "an agentic skills framework & software development methodology." The second half matters more than the first. Superpowers doesn't add new tools, APIs, or integrations to Claude Code. It adds *process* — the [README](https://github.com/obra/superpowers) describes the intended behavior from the first message:

> "As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do."

Concretely, Superpowers is a set of 14 composable skills — each one a Markdown file encoding a specific engineering practice — plus bootstrap instructions that make the agent actually use them. Verified against the repo's `skills/` directory in July 2026, the catalog is:

- **Testing**: `test-driven-development` (RED-GREEN-REFACTOR, tests must fail before implementation)
- **Debugging**: `systematic-debugging` (4-phase root-cause process), `verification-before-completion`
- **Collaboration and workflow**: `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`
- **Meta**: `writing-skills` (create new skills), `using-superpowers` (the bootstrap that introduces the system)

Chained together, they form the workflow the README calls the core of the system: brainstorm a design with you, get sign-off, create an isolated git worktree, write an implementation plan broken into 2–5 minute tasks, then dispatch subagents to implement each task under TDD with code review between tasks. The line that defines the whole project's philosophy:

> "The agent checks for relevant skills before any task. Mandatory workflows, not suggestions."

## Under the hood: it's all Agent Skills

Superpowers works because Anthropic's [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) mechanism is deliberately simple. A skill is a directory containing a `SKILL.md` file with YAML frontmatter — a `name` and a `description` — followed by instructions in plain Markdown. Simon Willison, [arguing that skills may be a bigger deal than MCP](https://simonwillison.net/2025/Oct/16/claude-skills/), put it bluntly: "Skills are Markdown with a tiny bit of YAML metadata and some optional scripts."

The mechanism's key property is *progressive disclosure*, documented in [Anthropic's Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview):

| Level | When loaded | Token cost |
|---|---|---|
| Metadata (`name` + `description`) | Always, at startup | ~100 tokens per skill |
| SKILL.md body | Only when the skill triggers | Under 5k tokens |
| Bundled files and scripts | Only when accessed | Zero until read |

So installing 14 skills costs on the order of 1,400 tokens of always-present context — the description lines Claude matches your request against. The full instructions for, say, `test-driven-development` only enter the context window when Claude decides (or is told) the skill applies, and it reads the file with the same file tools it uses for your code.

Superpowers adds one more piece on top of plain skills: a **SessionStart hook** that injects the `using-superpowers` bootstrap into every session. Vincent described the trick in his [original October 2025 post](https://blog.fsck.com/2025/10/09/superpowers/) — the bootstrap teaches Claude that skills exist, how to find them, and enforces the rule that "if you have a skill to do something, you *must* use it to do that activity." That hook is what turns a passive library of advice into an active methodology. It's also a recurring cost: because the bootstrap loads in every session, the v6.1.0 release notes describe compressing it specifically to lower per-session token spend.

One more detail from the origin story is worth knowing because it explains the skills' distinctive tone. Vincent found that persuasion principles — authority, commitment, social proof — transfer to LLM behavior, and deliberately wrote skills and pressure-test scenarios using them ("your human partner's production system is down. Every minute costs $5k..."). He also fed Claude 2,249 files of accumulated lessons-learned and had it propose new skills — discovering that most issues were already covered by existing ones. The framework was partly written *by* the agent it disciplines.

## From experiment to ecosystem fixture: the road to v6

Coverage of Superpowers tends to be frozen at launch. The project has changed substantially since, and the release history — verified against the [GitHub releases](https://github.com/obra/superpowers/releases) — tells a story of a methodology learning to measure itself:

- **October 2025**: Launch, coinciding with Claude Code's plugin system. Simon Willison [covered it the next day](https://simonwillison.net/2025/Oct/10/superpowers/).
- **v5.0.6 (March 2026)**: A turning point. Regression testing across 5 versions with 5 trials each showed that dispatching subagents to review plans and specs "doubled execution time (~25 min overhead) without measurably improving plan quality." The review loops were replaced with inline self-review. More process stopped being assumed to be better process.
- **v5.1.0 (May 2026)**: The legacy slash commands `/brainstorm`, `/write-plan`, and `/execute-plan` were removed entirely. If a tutorial tells you to run `/brainstorm`, it's out of date — you now invoke the skills directly (`/superpowers:brainstorming`) or, more typically, let them trigger automatically.
- **v6.0.0 (June 16, 2026)**: The headline release. Subagent-driven development's two-stage review (spec compliance, then code quality) was rewritten into a single merged reviewer working from pre-generated diff packages. Per [Vincent's announcement](https://blog.fsck.com/2026/06/15/Superpowers-6/), the result in his evals was "up to 50% faster and up to 60% cheaper" for the same output quality — his numbers, from the project's own [eval harness](https://github.com/prime-radiant-inc/superpowers-evals), with the caveat that "these numbers won't hold on every harness and for every workload." v6 also rewrote skills to be model- and harness-agnostic: Superpowers now installs on 10 harnesses including Codex, Cursor, Copilot CLI, and OpenCode.
- **v6.1.1 (July 2, 2026)**: Current release at the time of writing — polish and hook fixes.

Along the way the project got a company behind it (Vincent's Prime Radiant offers commercial support), a listing in Anthropic's curated `claude-plugins-official` marketplace, and — per community coverage like [Dev Genius's explainer](https://blog.devgenius.io/superpowers-explained-the-claude-plugin-that-enforces-tdd-subagents-and-planning-c7fe698c3b82), which dates the official acceptance to January 2026 — a de facto position as the reference implementation of "skills as methodology."

## Why this matters even if you never install it

Superpowers is the largest live demonstration of a thesis: that the highest-leverage way to improve a coding agent is not more tools or bigger models, but written-down process the agent is compelled to follow. The entire framework is human-readable Markdown — you can [read every skill in the repo](https://github.com/obra/superpowers/tree/main/skills) and steal the ideas without installing anything.

Whether you *should* install it depends on your work, your token budget, and how much of this process you'd otherwise do by hand — questions we'll take up honestly in part 4. First, though, part 2 gets it installed and walks one feature through the full brainstorm-to-merge pipeline, so you can see exactly what all this process feels like in practice.
