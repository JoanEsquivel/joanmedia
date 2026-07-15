---
title: "Install Superpowers and Run One Feature Through It, Step by Step"
description: "Install the Superpowers plugin for Claude Code, verify it's active, and walk a real feature through its brainstorm, plan, and subagent TDD pipeline."
pubDate: 2026-07-16
heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - Superpowers
  - Test-Driven Development
  - Subagents
badge: "New"
series: "Superpowers and Claude Code Agent Skills"
seriesOrder: 2
---

## Table of Contents

1. [Installation: one command, two options](#installation-one-command-two-options)
2. [The workflow, end to end](#the-workflow-end-to-end)
3. [Driving it manually when you want to](#driving-it-manually-when-you-want-to)
4. [What to expect on your first run](#what-to-expect-on-your-first-run)

---

*Commands verified against the [obra/superpowers README](https://github.com/obra/superpowers) and v6.1.1 release notes, July 2026.*

Part 1 covered what Superpowers is: 14 skills plus a session-start bootstrap that turn Claude Code's "jump straight to code" default into a brainstorm → plan → implement-with-TDD pipeline. This post is the practical half — install it, verify it's active, and walk a real feature through the whole workflow so you know what to expect at each step.

A warning before you start: the internet is full of stale Superpowers tutorials. Anything telling you to run `/brainstorm` or `/execute-plan` predates v5.1.0 (May 2026), which removed those legacy commands. Everything below reflects v6.x.

## Installation: one command, two options

Superpowers is in Anthropic's curated official marketplace, which Claude Code registers automatically the first time you start it. So for most people, installation is a single command inside a Claude Code session:

```
/plugin install superpowers@claude-plugins-official
```

Alternatively, the author maintains his own marketplace (it carries Superpowers plus related plugins, and is where updates land first):

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Both paths are documented in the [repo README](https://github.com/obra/superpowers). If you also use other harnesses — the README lists install steps for Codex, Cursor, GitHub Copilot CLI, OpenCode, Factory Droid, Kimi Code, Antigravity, and Pi — note that each needs its own separate install.

### Verify it's active

Three checks, all grounded in [Claude Code's plugin docs](https://code.claude.com/docs/en/plugins):

1. Run `/plugin` — the interactive plugin manager should list `superpowers` as installed and enabled.
2. Run `/help` — plugin skills appear under their namespace, so you should see entries like `/superpowers:brainstorming`.
3. If you installed mid-session, run `/reload-plugins` (or restart) to load it.

The functional test is better than any menu: start a session and say "I want to build X." If Superpowers is active, Claude should respond with questions instead of code — the session-start hook has injected the `using-superpowers` bootstrap, and the `brainstorming` skill triggers on any "building something" intent.

## The workflow, end to end

Here's what the [README's seven-step basic workflow](https://github.com/obra/superpowers) looks like in practice. Suppose you open Claude Code in an existing Express API project and type a deliberately underspecified prompt:

> **You:** I want to add rate limiting to the public API.

### Step 1: Brainstorming — the agent interviews you

The `brainstorming` skill activates before any code. Per the README, it "refines rough ideas through questions, explores alternatives, presents design in sections for validation." Expect Socratic questioning: Which endpoints? Per-user or per-IP? What should a rate-limited response look like? Fixed window, sliding window, or token bucket? In-memory or Redis, and what happens on multi-instance deployments?

This continues until the design is actually pinned down, then Claude presents the design back "in chunks short enough to actually read and digest" and saves a design document once you approve. This phase is where Superpowers front-loads the token spend — and where it pays off, because every ambiguity resolved here is a rework cycle avoided later.

### Step 2: Git worktree — isolation by default

After design sign-off, `using-git-worktrees` activates: a new branch in an isolated worktree, project setup, and a verified-clean test baseline before any changes. Your main checkout stays untouched, which also means you can run parallel Superpowers sessions on different features — the use case that motivated the skill in [Vincent's original post](https://blog.fsck.com/2025/10/09/superpowers/).

### Step 3: Writing the plan — tasks a "junior engineer with poor taste" could follow

The `writing-plans` skill breaks the approved design into tasks of roughly 2–5 minutes each, with exact file paths, code, and verification steps. The README's framing of the target audience is the memorable part: the plan must be clear enough for "an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing" — because that's a fair model of a fresh subagent with no conversation history.

### Step 4: Implementation — subagents with a review gate

Say "go" and one of two execution skills takes over:

- **`subagent-driven-development`** (the default for autonomous runs): a fresh subagent per task, each followed by review. Since v6.0.0, that's a single merged reviewer checking both spec compliance and code quality against a pre-generated diff package — the rewrite that made this phase roughly twice as fast and half the token cost in the [project's evals](https://blog.fsck.com/2026/06/15/Superpowers-6/). Working files for this process live in a self-ignoring `.superpowers/sdd/` directory in your worktree (moved out of `.git/` in v6.0.3).
- **`executing-plans`**: batch execution with human checkpoints, for when you want to stay in the loop.

The README's claim for autonomous mode: "It's not uncommon for your agent to work autonomously for a couple hours at a time without deviating from the plan you put together."

### Step 5: TDD, enforced rather than suggested

Throughout implementation, `test-driven-development` enforces RED-GREEN-REFACTOR: write a failing test, watch it fail, write minimal code, watch it pass, commit. The enforcement has teeth — the README states it "deletes code written before tests." This is the skill users most often single out; even critics in the [Superpowers 6 Hacker News thread](https://news.ycombinator.com/item?id=48739459) credited it for producing code that "complies with the spec far better."

### Steps 6–7: Review and finish

Between tasks, `requesting-code-review` reviews work against the plan and reports issues by severity — critical issues block progress. When all tasks are done, `finishing-a-development-branch` verifies the test suite, offers merge/PR/keep/discard options, and cleans up the worktree.

## Driving it manually when you want to

Skills trigger automatically, but they're also directly invocable as namespaced slash commands (plugin skills are always namespaced `plugin-name:skill-name`, per the [plugin docs](https://code.claude.com/docs/en/plugins)). Useful ones:

```
/superpowers:brainstorming     # force a design session for something Claude thinks is simple
/superpowers:writing-plans     # turn an agreed design into a task plan
/superpowers:executing-plans   # execute a plan with checkpoints
/superpowers:systematic-debugging  # 4-phase root-cause discipline on a nasty bug
```

The debugging skill deserves special mention because it triggers outside the build-a-feature flow: it requires root-cause investigation before any fix, a direct counter to Claude's tendency to patch symptoms. Combined with `verification-before-completion` ("ensure it's actually fixed"), it's arguably the most broadly useful pair in the catalog for day-to-day maintenance work.

## What to expect on your first run

- **The interview is long.** A brainstorming session for a real feature can be a dozen exchanges. Answer tersely; the skill iterates until the spec is unambiguous, not until a message quota is hit.
- **You approve twice** — once for the design, once for the plan. Read both; they're the cheapest points to change direction.
- **Simple tasks feel over-processed.** Asking for a typo fix does not need a design document, and Superpowers' judgment about what counts as "building something" errs toward process. Part 4 covers when to bypass or disable it.
- **Watch your first subagent run.** The two-stage dispatch-and-review loop writes a lot of intermediate output. It's worth watching once to understand the machinery before you trust it with hours-long autonomous runs.

Next in the series: Superpowers ships 14 opinionated skills — so do you still need to write your own? Part 3 covers how plugin skills, personal skills, and project skills coexist, and when each is the right home.
