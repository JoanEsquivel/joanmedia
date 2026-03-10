---
title: "What Is Context Engineering? The Skill That Replaced Prompt Engineering"
description: "Learn what context engineering is, why it replaced prompt engineering, and how managing the full context lifecycle produces reliable AI behavior in agentic systems."
pubDate: 2026-03-08
heroImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Context Engineering
  - Prompt Engineering
  - LLM
  - AI Agents
badge: ""
series: "Context Engineering"
seriesOrder: 1
---

## Table of Contents

1. [The Shift Nobody Expected](#the-shift-nobody-expected)
2. [The Definition](#the-definition)
3. [Why Prompt Engineering Wasn't Enough](#why-prompt-engineering-wasnt-enough)
4. [Why It Matters Now](#why-it-matters-now)
5. [The Core Principle](#the-core-principle)
6. [The Evolution: A Timeline](#the-evolution-a-timeline)
7. [Real-World Impact](#real-world-impact)
8. [What's Next](#whats-next)

---

## The Shift Nobody Expected

In early 2025, "prompt engineering" was the hottest skill in AI. By mid-2025, the industry's most influential voices were already declaring it insufficient.

On June 18, 2025, Shopify CEO Tobi Lutke posted: "I really like the term 'context engineering' over prompt engineering." One week later, Andrej Karpathy — former Director of AI at Tesla and co-founder of OpenAI — endorsed the shift with a post that crystallized the idea:

> "+1 for 'context engineering'... the delicate art and science of filling the context window with just the right information for the next step."

By June 27, Simon Willison — one of the most respected voices in applied AI — wrote a blog post declaring that "context engineering" would stick as a term, conceding that prompt engineering had always had an image problem.

Three months later, Anthropic's engineering team published what became the definitive industry reference: "Effective Context Engineering for AI Agents." The post accumulated over 500,000 views and established the formal framework the industry now uses.

What happened? Why did the entire AI industry pivot from prompt engineering to context engineering in a matter of months?

---

## The Definition

Anthropic's engineering team defines context engineering as:

> "The set of strategies for curating and maintaining the optimal set of tokens during LLM inference."

But to understand what that means, you need to understand what "context" actually is. When you interact with an AI model, everything it sees in a single request is the context. This includes:

1. **The system prompt** — Instructions that define behavior, personality, and constraints
2. **Conversation history** — All previous messages in the session
3. **Tool definitions** — Schemas for every tool the model can use
4. **Tool outputs** — Results from tool calls (file reads, API responses, search results)
5. **Retrieved documents** — Content fetched via RAG or other retrieval systems
6. **The user's current message** — The latest input
7. **The model's own reasoning** — Chain-of-thought or extended thinking tokens

Context engineering is the discipline of managing *all of this* — deciding what goes in, what stays out, when information should be added, when it should be removed, and how it should be structured.

### Karpathy's Seven Components

Andrej Karpathy identified seven specific components that context engineering encompasses:

1. Task instructions and goals
2. Relevant context and background information
3. Available tools and API references
4. Conversation history
5. Relevant examples (few-shot)
6. Output format constraints
7. Chain-of-thought structure

He likened the LLM to a CPU and the context window to RAM — the model can only reason about what is loaded into its working memory at the moment of inference.

### Philipp Schmid's Framework

Philipp Schmid, a prominent AI engineer, expanded this into a seven-component framework:

1. **System Prompt** — The agent's persistent instructions
2. **User Prompt** — The current request
3. **Conversation State** — The evolving history
4. **Retrieved Knowledge** — Information pulled from external sources
5. **Tool Definitions** — What the agent can do
6. **Structured Output** — Format constraints for responses
7. **Long-term Memory** — Persistent knowledge across sessions

Both frameworks emphasize the same core insight: **the context is a system, not just a prompt.** Engineering that system is what produces reliable AI behavior.

---

## Why Prompt Engineering Wasn't Enough

Prompt engineering focuses on crafting better instructions — how you ask the model to do something. It treats the model as a stateless function: input goes in, output comes out.

This worked reasonably well for simple, single-turn interactions. "Summarize this article." "Write a function that sorts an array." "Translate this paragraph to Spanish."

But as AI systems became more complex — multi-turn conversations, tool-using agents, RAG pipelines, multi-step workflows — the prompt became a small fraction of what the model actually processes. In a production agentic system:

- The system prompt might be 2,000 tokens
- Tool definitions might consume 17,000-55,000 tokens
- Conversation history might accumulate 50,000+ tokens
- Tool outputs might inject 100,000+ tokens
- Retrieved documents might add 10,000-50,000 tokens

The user's actual prompt — the thing prompt engineering focuses on — might represent less than 1% of what the model sees. Optimizing that 1% while ignoring the other 99% is like tuning the radio while the engine is on fire.

### The Three Key Differences

| Dimension | Prompt Engineering | Context Engineering |
|-----------|-------------------|---------------------|
| **Scope** | The instruction text | Everything the model sees |
| **Timeframe** | Single turn | Across the entire session lifecycle |
| **Focus** | How to ask | What information to provide, when, and how much |

Prompt engineering is a *subset* of context engineering. Writing good prompts still matters — but it is one component of a much larger system.

### What Practitioners Say

The Hacker News discussion on context engineering revealed a practical consensus:

- Experienced developers noted that effective context limits are often ~10K tokens, far below advertised maximums
- Multi-agent architectures were recommended specifically to overcome single-context limitations
- Skeptics called it "buzzword inflation," but even skeptics agreed that managing what goes into context is fundamentally different from just writing better prompts

The OpenAI community forum produced an even more provocative take: that context engineering itself will eventually be superseded by "automated workflow architecture" where systems automatically decide what context to assemble. But for now, context engineering is the skill that separates effective AI developers from those who hit walls they don't understand.

---

## Why It Matters Now

Three converging trends made context engineering essential in 2025-2026:

### 1. The Rise of Agentic AI

AI agents — systems that take multi-step actions using tools — consume context at an extraordinary rate. A single coding agent session can burn through 100,000+ tokens across 20 tool calls, with each step resending all previous context. Without deliberate context management, agents degrade, stall, or silently lose critical information mid-task.

Gartner reported a **1,445% surge in multi-agent AI inquiries** in 2025-2026, signaling massive enterprise adoption of agentic systems. Every one of these systems faces the context management challenge.

### 2. Context Windows Got Bigger — But Not Better

Context windows grew from 4K tokens (GPT-3.5) to 1M+ tokens (Gemini 2.5 Pro, GPT-4.1) in under three years. The marketing message was simple: more context means better results.

The research tells a different story. Chroma's study of 18 state-of-the-art models found that **performance degrades at every length increment**, not just near the limit. The NoLiMa benchmark found that at 32K tokens, 11 of 12 tested models dropped below 50% of their short-context performance. Stanford's "Lost in the Middle" paper showed 30%+ accuracy drops when relevant information sits in the middle of long contexts.

Bigger windows created an illusion of unlimited memory. Context engineering is the antidote — the recognition that more tokens is not the same as better tokens.

### 3. Cost and Latency Scale With Context

Every token you send costs money. Every token adds latency. In agentic workflows where the entire context is resent with every API call, costs compound quadratically with the number of steps. A 20-step agent workflow doesn't cost 20x a single step — it costs the sum of an arithmetic series as each step includes all previous context.

Production teams reported that unoptimized agentic systems can cost **$255,000+ annually** from context mismanagement alone. Context engineering directly addresses the economics of AI deployment.

---

## The Core Principle

Everything in context engineering flows from a single principle, articulated by Anthropic:

> **"Find the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."**

This is elegant in its simplicity and radical in its implications:

- **Every token that doesn't serve the goal is not neutral — it is actively harmful.** Irrelevant information dilutes the model's attention and degrades performance.
- **Context is a curated resource, not a dumping ground.** The best systems are not the ones that load the most information — they are the ones that load the *right* information.
- **Removal is as important as addition.** Knowing when to take information out of context is as valuable as knowing when to put it in.

This principle governs everything that follows in this series: from understanding tokens and context windows (Part 2), to analyzing where tokens actually go in agentic systems (Part 3), to the specific techniques for efficient context usage (Part 4), to the practical playbook for building context-efficient applications (Part 5).

---

## The Evolution: A Timeline

| Period | Paradigm | Focus |
|--------|----------|-------|
| 2022-2023 | **Prompt Engineering** | Writing better instructions for single-turn interactions |
| 2023-2024 | **Advanced Prompting** | Chain-of-thought, few-shot, system prompts, RAG pipelines |
| 2025 | **Context Engineering** | Managing the full context lifecycle: what goes in, when, and what gets removed |
| 2026+ | **Automated Context** | Systems that dynamically assemble optimal context without manual engineering |

We are in the transition from manual context engineering to partially automated approaches. Tools like Claude Code already implement automatic compaction, progressive tool disclosure, and context-aware token budgeting. But understanding the underlying principles remains essential — you cannot effectively evaluate or debug automated systems without understanding what they are trying to optimize.

---

## Real-World Impact

The shift to context engineering is not theoretical. Case studies demonstrate measurable results:

- **Five Sigma Insurance**: Reduced AI errors by 80% through systematic context engineering — structuring what information the model received at each decision point
- **Block/Square**: Integrated MCP (Model Context Protocol) to standardize how context flows between tools and agents
- **Microsoft**: Achieved 26% productivity gains through context-aware AI workflows
- **Academic SaaS platform**: Two developers produced 220,000+ lines of code in 15 weeks using systematic context engineering practices
- **Healthcare virtual assistants**: Context engineering enabled compliant, accurate medical information delivery by precisely controlling what knowledge was available at each interaction point

These results come not from better prompts, but from better systems for managing what the model sees.

---

## What's Next

This series covers context engineering from foundations to practice:

- **Part 2: Tokens and Context Windows Explained** — What tokens actually are, how they work, context window sizes and pricing across providers
- **Part 3: Where Do All the Tokens Go?** — The anatomy of context consumption in agentic AI, and the five failure modes that degrade performance
- **Part 4: Techniques for Efficient Context Usage** — Prompt caching, compression, RAG, chunking, pruning, sub-agents, and architectural patterns
- **Part 5: The Practitioner's Playbook** — Decision frameworks, monitoring, common mistakes, and a quick-start checklist
