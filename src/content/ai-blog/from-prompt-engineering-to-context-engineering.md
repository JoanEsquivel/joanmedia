---
title: "From Prompt Engineering to Context Engineering"
description: "Explore how context engineering expands prompt engineering by optimizing what information LLMs see, covering compaction, sub-agents, and production strategies."
pubDate: 2026-03-09
heroImage: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Prompt Engineering
  - Context Engineering
  - Agentic AI
  - LLM
badge: "New"
series: "Prompt Engineering in the Agentic Era"
seriesOrder: 4
---

## Table of Contents

1. [The Expansion](#the-expansion)
2. [Why Context Matters More Than Prompting](#why-context-matters-more-than-prompting)
3. [The Production Context Stack](#the-production-context-stack)
4. [Key Context Strategies](#key-context-strategies)
5. [Context Budget Planning](#context-budget-planning)
6. [Anthropic's Five Workflow Patterns](#anthropics-five-workflow-patterns)
7. [Context Engineering Checklist](#context-engineering-checklist)
8. [Tradeoffs and Limitations](#tradeoffs-and-limitations)
9. [The Guiding Principle](#the-guiding-principle)

---

"Building with language models is becoming less about finding the right words and phrases for your prompts, and more about answering the broader question of what configuration of context is most likely to generate our model's desired behavior." --- Anthropic Engineering

This reframing signals the most significant conceptual shift in the field since prompt engineering became a recognized discipline. The era of context engineering has begun.

---

## The Expansion

For three years, prompt engineering has been the dominant framework: write better instructions, add examples, structure your output. This is true, and it remains true. But it is incomplete.

As models have grown more capable and agentic systems have become production realities, a new challenge has emerged: managing not just what you say to the model, but *everything the model can see*. System prompts, tool definitions, conversation history, retrieved documents, memory stores, environmental data --- all compete for space in a finite context window, and all influence behavior.

Context engineering is the discipline that addresses this challenge. It refers to "the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference."

The shift is not a replacement but an *expansion*. Prompt engineering optimizes *how to write instructions*. Context engineering optimizes *what information to include* across all sources.

---

## Why Context Matters More Than Prompting

The transformer architecture creates n-squared pairwise relationships between tokens. As context grows, this attention budget stretches thin. Research on "context rot" shows accuracy degrades with token count --- not because the model cannot read the tokens, but because it cannot attend to all of them equally.

This means stuffing more context into the window is counterproductive past a point. The goal is not maximum context; it is *optimal context* --- high signal, low noise.

Schulhoff's research underscores this: context (relevant background information) is "underrated and massively impactful," while role prompting has "little to no effect on improving correctness." What information you provide matters more than how you frame your request.

---

## The Production Context Stack

In a production agentic system, context is assembled from multiple sources at runtime:

```
Context Window Contents:
1. System prompt        (identity, instructions, behavioral rules)
2. Tool definitions     (names, descriptions, parameters)
3. Few-shot examples    (curated demonstrations)
4. Retrieved documents  (RAG / search results)
5. Conversation history (user messages + agent responses)
6. Tool results         (outputs from previous tool calls)
7. Memory / notes       (persistent state from prior sessions)
8. Environmental data   (current date, file system state, etc.)
```

Context engineering decides how much of each component to include, when to retrieve it, and when to discard it --- all while staying within the token budget and maximizing the model's ability to produce the desired output.

---

## Key Context Strategies

### 1. The Goldilocks Zone for System Prompts

Anthropic identifies a calibration challenge:

- **Too brittle**: hardcoding complex logic creates fragility. Engineers scripting detailed conditional behavior that breaks when edge cases arise.
- **Too vague**: generic instructions fail to provide concrete behavioral signals.
- **Just right**: start minimal, observe failures, add instructions that address specific observed problems.

This is the opposite of the common approach of front-loading every possible instruction.

### 2. Just-in-Time Context Retrieval

Traditional approaches pre-load all potentially relevant information. Context engineering favors "just-in-time": agents maintain lightweight identifiers (file paths, URLs, stored queries) and dynamically retrieve needed information using tools.

This mirrors human cognition --- we maintain external indexing systems and look things up when needed.

**Benefits:**
- Reduces working memory burden
- Enables progressive disclosure through exploration
- Scales to information volumes that would overflow any context window

**Example**: Claude Code analyzes large databases using targeted queries and Bash commands without loading entire datasets into context.

**Tradeoff**: adds latency (each retrieval is a tool call) and can miss information the agent does not know to look for. Hybrid approach --- pre-retrieving some data, enabling exploration for the rest --- often works best.

### 3. Context Compaction

When conversations approach the limit, compaction becomes necessary:

1. **Maximize recall first**: capture all relevant information in the initial summary
2. **Iterate to improve precision**: eliminate superfluous content
3. **Preserve critical elements**: architectural decisions, unresolved bugs, implementation details
4. **Discard safely**: redundant tool outputs are the safest to remove

**Tool result clearing** is the lightest form --- removing verbose tool outputs while preserving the agent's reasoning about those outputs.

**Alternative**: starting fresh. Claude 4.6 is effective at discovering state from the filesystem, so sometimes a clean context window with instructions to "review progress.txt, tests.json, and the git logs" outperforms a compressed summary.

### 4. Structured Note-Taking (Agentic Memory)

For tasks spanning many steps or sessions, agents write persistent notes outside the context window and retrieve them later. This is the agentic equivalent of a researcher's lab notebook.

**Use cases:**
- Tracking progress across complex multi-step tasks
- Maintaining dependencies across dozens of tool calls
- Building knowledge bases that persist across sessions

**Key insight**: structured formats (JSON) work well for state data (test results, task status), while unstructured text works better for progress notes and reasoning context. Use both.

In Anthropic's testing, a Claude agent playing Pokemon maintained precise tallies across thousands of steps, developing maps and strategic notes without explicit prompting to do so.

### 5. Sub-Agent Architectures

Complex tasks can be decomposed into subtasks handled by specialized sub-agents, each with a clean, focused context window:

1. A coordinating main agent identifies subtasks
2. Each subtask assigned to a sub-agent with fresh context containing only relevant information
3. Sub-agents return condensed summaries (1,000-2,000 tokens)
4. The main agent synthesizes results

**Benefits:**
- Each sub-agent has maximum attention for its specific task
- Detailed search context stays separated from synthesis work
- Parallel execution is natural

**When to use**: tasks requiring deep investigation of multiple independent areas.

### 6. Few-Shot Examples as Context Engineering

The context engineering framework reframes few-shot examples. Rather than "demonstrations," they become high-signal context elements that "effectively portray the expected behavior of the agent."

The shift: instead of listing exhaustive edge cases in instructions, curate diverse canonical examples that show what good behavior looks like. More token-efficient and often more effective than verbose rule lists.

---

## Context Budget Planning

| Component | Typical Size | Priority |
|-----------|-------------|----------|
| System prompt | 2K-10K tokens | High (always present) |
| Tool definitions | 1K-5K tokens | High (always present) |
| Few-shot examples | 1K-3K tokens | High (always present) |
| Conversation history | Variable | Medium (compactable) |
| Retrieved documents | Variable | Medium (just-in-time) |
| Tool results | Variable | Low (clearable) |
| Memory/notes | 500-2K tokens | Medium (retrievable) |

### Decision Framework: Pre-Load vs Just-in-Time

**Pre-load when:**
- Information is always needed (system prompt, tool definitions)
- Speed matters more than token efficiency
- Total pre-loaded context fits comfortably in the window

**Retrieve just-in-time when:**
- Information is conditionally needed
- Corpus is too large to pre-load
- Agent can identify what it needs through exploration

---

## Anthropic's Five Workflow Patterns

From Anthropic's research on building effective agents:

### 1. Prompt Chaining
Sequential LLM calls where each step processes the output of the previous. Best for tasks with clear sequential dependencies.

### 2. Routing
Classifying inputs and directing them to specialized prompts or models. Best when different input types require fundamentally different handling.

### 3. Parallelization
Running multiple LLM calls simultaneously, either for independent subtasks or for generating multiple perspectives on the same task. Best for tasks decomposable into independent parts.

### 4. Orchestrator-Workers
A central LLM dynamically coordinates specialized worker agents, delegating subtasks and synthesizing results. Best for complex tasks requiring adaptive decomposition.

### 5. Evaluator-Optimizer
One LLM generates output while another evaluates and provides feedback in an iterative loop. Best for tasks with clear quality criteria where iteration improves output.

**Anthropic's guiding principle**: "Start with the simplest solution, and only add complexity when it demonstrably improves outcomes."

---

## Context Engineering Checklist

1. Is every token in the context window earning its place?
2. Are tool definitions clear enough that a human engineer could choose the right tool?
3. Are examples diverse enough to cover edge cases without creating unintended patterns?
4. Is conversation history being managed (compacted or cleared) before it crowds out useful context?
5. Does the agent have a mechanism to persist and retrieve state across context windows?
6. Are tool results being cleared after the agent has processed them?

---

## Tradeoffs and Limitations

**Architectural complexity.** Managing context across multiple sources, implementing compaction, and orchestrating sub-agents requires more engineering than writing a single prompt. Justified only when the task demands it.

**Compaction is lossy.** Every summarization step discards information. Critical details can be lost. Preserving key elements requires careful design.

**Attention is not uniform.** Models attend more to the beginning and end of context than the middle. Place critical instructions and context accordingly.

**Token costs scale.** Larger context windows mean higher costs. Context engineering is partly economic optimization --- finding the minimum viable context.

---

## The Guiding Principle

"Find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome."

This applies to every component: system prompts, tools, examples, retrieved documents, conversation history, and memory.

Prompt engineering is not dead. It has grown up. And its adult name is context engineering.
