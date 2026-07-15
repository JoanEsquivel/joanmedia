---
title: "Superpowers Plus Your Own Skills: Who Triggers, Who Wins, and When to Write Your Own"
description: "How Superpowers coexists with personal and project Claude Code skills: locations, namespacing, precedence, triggering, and when to write your own."
pubDate: 2026-07-16
heroImage: "https://images.unsplash.com/photo-1644175897056-50f4d3a9a827?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - Superpowers
  - Agent Skills
  - Custom Skills
badge: "New"
series: "Superpowers and Claude Code Agent Skills"
seriesOrder: 3
---

## Table of Contents

1. [Where skills live in Claude Code](#where-skills-live-in-claude-code)
2. [Why Superpowers can't collide with your skills](#why-superpowers-cant-collide-with-your-skills)
3. [When the bundled 14 are enough](#when-the-bundled-14-are-enough)
4. [When to write your own](#when-to-write-your-own)
5. [A worked example of the layering](#a-worked-example-of-the-layering)

---

*Skill locations and precedence verified against the [Claude Code skills docs](https://code.claude.com/docs/en/skills), July 2026.*

A question comes up almost immediately after installing Superpowers: *do I still need to write my own skills?* The framework ships 14 of them and claims to be a complete methodology. And yet it also ships a `writing-skills` skill — the authors clearly expect you to write more.

The answer falls out of a distinction the previous post hinted at: Superpowers encodes **process** knowledge (how to build software), while your highest-value custom skills encode **domain** knowledge (how to build *your* software). They don't compete; they occupy different layers. This post covers the mechanics of how they coexist — locations, namespacing, precedence, triggering — and a decision rule for what to write yourself.

## Where skills live in Claude Code

Per the [Claude Code skills documentation](https://code.claude.com/docs/en/skills), skills load from four places:

| Level | Location | Scope |
|---|---|---|
| Enterprise | Managed settings | Everyone in your org |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project (commit it to share) |
| Plugin | Inside the installed plugin's `skills/` dir | Wherever the plugin is enabled |

(Two refinements worth knowing: project skills also load from parent directories up to the repo root, and from nested `.claude/skills/` in monorepo subdirectories when you touch files there. And since custom commands were merged into skills, your old `.claude/commands/*.md` files still work — but a same-named skill takes precedence over a command.)

## Why Superpowers can't collide with your skills

The precedence rules, straight from the docs: when skills share a name across levels, **enterprise overrides personal, and personal overrides project**. A skill at any of those levels also overrides a same-named bundled skill — a `code-review` skill in your project's `.claude/skills/` replaces Claude Code's built-in `/code-review`.

Plugin skills sit outside this contest entirely: they're always namespaced as `plugin-name:skill-name`, "so they cannot conflict with other levels." Superpowers' brainstorming skill is `/superpowers:brainstorming`; if you create your own `brainstorming` skill in `~/.claude/skills/`, both exist side by side as `/brainstorming` and `/superpowers:brainstorming`.

That's the collision story for *invocation*. For *automatic triggering*, there's no override at all — every skill's `description` (roughly 100 tokens each, per the [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)) is loaded at startup, and Claude matches your request against all of them. Two skills with overlapping descriptions can both plausibly trigger, and which one wins is model judgment, not a rule. The practical consequences:

- **Write disjoint descriptions.** If your custom skill's description says "use when designing new features," it fights `superpowers:brainstorming`. Scope yours to what's genuinely yours: "use when designing changes to the billing service."
- **Superpowers stacks the deck for its own skills.** Its session-start bootstrap instructs the agent to check for applicable skills before any task and treats them as mandatory ([Vincent's design](https://blog.fsck.com/2025/10/09/superpowers/): "if you have a skill to do something, you *must* use it"). A side effect worth knowing: that bootstrap raises the trigger rate for *all* your skills, not just Superpowers' own — it makes the agent skill-conscious in general.
- **You can exempt a skill from auto-triggering.** Set `disable-model-invocation: true` in its frontmatter and it becomes manual-only (`/deploy`-style commands with side effects are the docs' canonical example) and costs zero always-on context.

## When the bundled 14 are enough

For process, they mostly are. Test-driven development, root-cause debugging, plan writing, code review, worktree hygiene — these are domain-independent, and the bundled versions have been through more iteration than most teams will ever give their own process docs (the v5.0.6 release notes describe regression-testing review workflows across five versions with five trials each before removing one).

You likely **don't** need to write a skill for:

- General engineering discipline — that's exactly what you installed Superpowers for.
- Anything you'd tell any competent engineer regardless of employer ("write tests first," "find the root cause").
- One-off instructions — those belong in the conversation, not the skill library.
- Stable facts about your codebase — put those in CLAUDE.md. The [skills docs](https://code.claude.com/docs/en/skills) draw the line well: CLAUDE.md is for facts, always loaded; a skill is for *procedures*, loaded on demand. "Create a skill... when a section of CLAUDE.md has grown into a procedure rather than a fact."

## When to write your own

Write a skill when you keep re-explaining a *procedure* that is specific to your world. The docs' trigger condition: "when you keep pasting the same instructions, checklist, or multi-step procedure into chat." Concretely, good candidates are:

- **Deployment and release rituals** — your exact sequence of build, migrate, verify, tag, announce. Mark it `disable-model-invocation: true` so only you can fire it.
- **Project-specific verification** — how to run *this* repo's integration tests against *that* staging environment.
- **Domain conventions** — your API error format, your migration policy, your team's PR checklist.
- **Wrapped scripts** — a skill that tells Claude to run a bundled script is dramatically cheaper than having Claude re-derive the logic; per the Agent Skills docs, script code never enters context, only its output.

The two systems then compose naturally: Superpowers' `writing-plans` produces the plan, and when a task touches deployment, your `deploy-staging` skill supplies the how. Process from the plugin, domain knowledge from your `.claude/skills/`.

And when you do write one, Superpowers itself will help: its `writing-skills` meta-skill encodes Vincent's methodology for authoring and pressure-testing skills (the project tests skill *behavior* with an eval harness, not just prose review). Anthropic's own [skill-creator](https://github.com/anthropics/skills) skill from the anthropics/skills repo is an alternative authoring aid. There's a pleasing recursion here: you use a skill to write skills, and the agent that will follow the skill helps draft it.

## A worked example of the layering

Say your team maintains a Django monolith with a gnarly data-migration policy. A sensible setup:

```
~/.claude/skills/                  # personal, follows you everywhere
  summarize-standup/SKILL.md       # your private workflow helper

.claude/skills/                    # project, committed to the repo
  run-data-migration/SKILL.md      # the 9-step migration procedure + checks
  api-error-format/SKILL.md        # how errors must be shaped, with examples

# plugin (installed once, namespaced)
/superpowers:brainstorming, /superpowers:test-driven-development, ...
```

Now "add a nullable column to invoices and backfill it" flows through Superpowers' brainstorm-plan-implement pipeline, and at the moment the plan says "run the migration," the project's `run-data-migration` skill triggers with your team's actual procedure. Nobody had to teach the plugin about Django, and nobody had to teach your migration skill about TDD.

One caution before you `git clone` anyone else's skills into this stack: skills are instructions plus executable code that Claude will follow with your permissions. Anthropic's docs are blunt — "treat like installing software," and audit anything from an untrusted source. That applies to Superpowers too; its being MIT-licensed, massively used, and fully readable in the repo is exactly why it's auditable.

So: bundled skills for process, your skills for domain procedure, CLAUDE.md for facts, and namespacing keeps the peace. What's left is the uncomfortable question — what does all this process *cost*, and when is it not worth it? That's part 4.
