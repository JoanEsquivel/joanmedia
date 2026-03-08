---
title: "Where Do All the Tokens Go? The Anatomy of Context Consumption and Failure"
description: "Explore the six sources of token consumption in AI agents, why costs compound quadratically, and five failure modes that degrade performance as context grows."
pubDate: 2026-03-08
heroImage: "https://images.unsplash.com/photo-1616957348089-3814b5e9c5aa?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Context Engineering
  - Token Optimization
  - AI Agents
  - LLM
badge: "New"
series: "Context Engineering"
seriesOrder: 3
---

## Table of Contents

1. [The Invisible Cost of Intelligence](#the-invisible-cost-of-intelligence)
2. [The Six Sources of Token Consumption](#the-six-sources-of-token-consumption)
3. [The Compounding Problem](#the-compounding-problem)
4. [The Five Ways Context Fails](#the-five-ways-context-fails)
5. [Why Bigger Windows Don't Solve This](#why-bigger-windows-dont-solve-this)
6. [The Compounding Error Spiral](#the-compounding-error-spiral)
7. [Key Takeaways](#key-takeaways)

---

## The Invisible Cost of Intelligence

You ask an AI agent to refactor a module in your codebase. It reads files, searches for references, calls a linter, writes new code, runs tests, reads the output, fixes a bug, and runs the tests again. Eight tool calls later, the agent has consumed over 100,000 tokens — and you haven't typed a second message.

This is the reality of agentic AI. The context window fills up fast, and most of that consumption is invisible to the user. Understanding where tokens actually go — and what happens when they accumulate — is the core of context engineering.

---

## The Six Sources of Token Consumption

In an agentic system, tokens are consumed by six distinct sources. Each one eats into the same finite budget.

### 1. System Prompts (~1-3% of context)

The system prompt defines the agent's identity, behavior, and constraints. It is sent with every API call.

- **Minimal**: 200-500 tokens
- **Production**: 1,000-2,500 tokens
- **Claude Code**: ~2,600 tokens (1.3% of 200K)

This is a fixed cost per call. It seems small, but it's paid on *every single inference call* — and in multi-turn agent sessions, that adds up.

### 2. Tool Definitions (~5-25% of context)

When an agent has tools, every tool's schema — name, description, parameters, usage instructions — is included in context. OpenAI confirms that "callable function definitions count against the model's context limit and are billed as input tokens."

The cost scales dramatically with tool count:

| Configuration | Tokens Consumed |
|---------------|----------------|
| Simple agent (5 tools) | ~2,000-5,000 |
| Claude Code built-in tools | ~17,600 (8.8%) |
| Single MCP server (e.g., Playwright) | ~11,700 |
| Enterprise agent (58 tools) | ~55,000 |
| Multiple MCP servers (worst case) | 134,000 (67% of 200K!) |

In one documented case, loading multiple MCP servers consumed **134,000 tokens — 67% of the context window — before any conversation began.**

And it's not just about space. Agenteer's research found that tool selection accuracy **dropped from 74% to 49%** when all tools were loaded versus using dynamic tool search. More tools in context literally makes the agent worse at choosing the right tool.

### 3. Conversation History (grows linearly per turn)

Every message persists in context. In standard chat, this is manageable. In agentic workflows, it compounds rapidly.

A ReAct-style agent cycle adds:
- The agent's reasoning (thought): 100-500 tokens
- The tool call request (action): 50-200 tokens
- The tool response (observation): 500-5,000+ tokens
- The agent's interpretation: 100-500 tokens

**A single cycle: 1,000-5,000 tokens.** An agent that takes 20 reasoning steps accumulates **20,000-100,000 tokens** of conversation history — and every subsequent API call must resend all of it.

### 4. Tool Outputs (the biggest variable cost)

This is where context consumption explodes. When an agent calls a tool, the result is injected directly into context and persists for every subsequent call.

| Tool Output | Typical Tokens |
|-------------|---------------|
| Single file read | 2,000-10,000 |
| Web search results | 3,000-5,000 |
| Database query (multiple rows) | 1,000-10,000+ |
| Meeting transcript | 50,000+ |
| Jira tool definition alone | ~17,000 |
| 20 web searches accumulated | 40,000+ |

The OpenReview research paper on coding agent token consumption found that **input tokens dominate overall cost in agentic workflows, even with caching.** This is the opposite of chat use cases. In agents, accumulated tool outputs eat the budget.

The same paper found that some runs consume **up to 10x more tokens than others** on identical tasks — making agentic costs extremely unpredictable.

### 5. RAG Retrieved Documents (600-10,000 tokens per query)

When agents use RAG, retrieved chunks consume context. A typical RAG system retrieves 3-10 chunks of 200-1,000 tokens each: **600-10,000 tokens per retrieval.**

In agentic RAG where the agent performs multiple retrieval steps, these chunks accumulate just like tool outputs.

| Approach | Response Time | Cost Structure |
|----------|--------------|----------------|
| RAG | ~1 second | Per-chunk (few thousand tokens) |
| Long context | 30-60 seconds | Per-token (entire window) |

### 6. Reasoning Tokens (Extended Thinking)

When models use chain-of-thought or extended thinking, reasoning tokens consume context and cost money.

Claude's extended thinking specifics:
- Thinking tokens are billed as **output tokens** (the expensive kind)
- Minimum budget: 1,024 tokens
- Typical overhead: 20-50% more tokens when enabled
- Previous thinking blocks are **automatically stripped** from subsequent turns (so they don't accumulate)
- Adaptive thinking (Claude 4.6) dynamically decides how much to think based on task complexity

---

## The Compounding Problem

What makes agentic context consumption uniquely expensive is that it compounds. Every API call resends the entire accumulated context.

If each step adds 3,000 tokens of tool output, across 20 steps:

| Step | Tokens Sent |
|------|-------------|
| 1 | 3,000 |
| 2 | 6,000 |
| 3 | 9,000 |
| ... | ... |
| 20 | 60,000 |
| **Total across all steps** | **630,000** |

The agent generated 60,000 tokens of new content but *paid for* 630,000 tokens of input. This arithmetic progression is why input tokens dominate agentic costs.

---

## The Five Ways Context Fails

Bigger context windows do not solve these problems. Research reveals five distinct failure modes that intensify as context grows.

### Failure Mode 1: Context Rot

**What it is:** Gradual performance degradation as the context window fills.

**The research:** Chroma tested 18 models and found performance degrades at *every* length increment — not just near the limit. A model with a 1M-token window still exhibits context rot at 50K tokens.

**The key finding:** Stanford's "Lost in the Middle" paper showed that models perform well on information at the beginning and end of context, but accuracy drops **30%+** when relevant information sits in the middle. This mirrors the human primacy and recency effects, but in LLMs it's architectural — the attention mechanism, position encoding, and training data distribution all contribute.

**Practical impact:**
- Below 50% capacity: Classic U-shaped attention (beginning and end favored)
- Above 50% capacity: Shifts to recency bias (only recent tokens get reliable attention)
- Claude Code degrades at ~147K-152K tokens (~75% of 200K)
- Llama 3.1 405B degrades at ~32K tokens

**A surprising finding:** Shuffled haystacks consistently outperform logically structured ones across all 18 tested models. Randomizing document order *improved* retrieval accuracy compared to logical ordering.

### Failure Mode 2: Context Poisoning

**What it is:** A hallucination or error enters context and gets repeatedly referenced, compounding with each step.

**The example:** Google DeepMind's Gemini agent playing Pokemon developed incorrect beliefs about the game state. Because these errors were embedded in the context's summary sections, the agent treated them as ground truth. Each new step reinforced the error rather than correcting it.

**Why it's dangerous in agents:** In chat, poisoning affects one response. In agentic loops:
1. The incorrect information persists in history
2. New tool calls are based on the wrong information
3. Results are interpreted through the lens of the error
4. Compaction may preserve the error while discarding the original correct information

### Failure Mode 3: Context Distraction

**What it is:** The agent accumulates so much history that it over-relies on patterns from its own past actions rather than using its trained capabilities.

**The research:** Gemini 2.5 agent research found that beyond ~100K tokens, the agent favored "repeating actions from its vast history rather than synthesizing novel plans." The accumulated history became a gravitational well that pulled attention away from creative problem-solving.

**The mechanism:** When context contains hundreds of examples of past actions, those examples create strong statistical patterns. The model's attention gravitates toward these in-context patterns because they are immediately present and numerous. Pre-trained knowledge receives proportionally less weight.

### Failure Mode 4: Context Confusion

**What it is:** Irrelevant information forces the model to spend attention on content that doesn't help with the current task.

**The data:** Berkeley's Function-Calling Leaderboard found that **every model performs worse with more than one tool in context.** A quantized Llama 3.1 8B failed on a 46-tool benchmark but succeeded with only 19 tools. The extra tools weren't harmful individually — they just consumed attention needed elsewhere.

**The example:** An enterprise agent processing invoices loads payment history, vendor details, account terms, and technical specs. If the task is compliance checking, only the technical specs matter. The other 49,000+ tokens are pure noise that degrades performance.

### Failure Mode 5: Context Clash

**What it is:** Accumulated context contains contradictory information that the model must resolve — often incorrectly.

**The research:** Microsoft and Salesforce studied this by splitting benchmark tasks across conversation turns:
- **Average performance drop: 39%** across all tested models
- **O3's score fell from 98.1 to 64.1** when information was sharded across turns

**Why agents are vulnerable:** Over many turns, agents accumulate:
- Stale information (a file read 20 turns ago, since modified)
- Contradictory instructions (early guidance vs. later clarifications)
- Conflicting tool outputs (different tools reporting different states)
- Self-contradictions (earlier reasoning conflicting with current understanding)

---

## Why Bigger Windows Don't Solve This

### Quadratic Cost Scaling

Computational costs scale quadratically with context length. Doubling the window quadruples the computation. At 100K tokens, each request costs ~$0.20 in input alone (GPT-4.1 pricing). At 400K tokens, each request costs ~$0.80 — and latency increases from ~1 second to 30-60 seconds.

### Performance Doesn't Scale Linearly

Chroma's research found performance grows "increasingly unreliable" as input grows. A 400K window does not give you twice the reliable performance of 200K. The degradation curve means marginal value per additional token decreases.

### The Real Constraint Is Attention, Not Capacity

As Anthropic puts it: the constraint isn't how many tokens you can fit — it's how much attention the model can meaningfully distribute. The "middle" of a 1M-token context is a vast space where information can be effectively invisible.

---

## The Compounding Error Spiral

All five failure modes interact in multi-turn agent sessions:

1. Context rot makes earlier information less accessible
2. Context poisoning introduces persistent errors
3. Context distraction causes over-reliance on historical patterns
4. Context confusion dilutes attention with noise
5. Context clash creates unresolvable contradictions

The result: "If an AI interaction does not resolve the problem quickly, the likelihood of successful resolution drops with each additional interaction." Each correction attempt consumes more tokens, filling context with the original error, the failed fix, and the debugging conversation around both.

This is why experienced users of coding agents learn to **start fresh sessions** when a task goes off track, rather than trying to debug within a degraded context.

---

## Key Takeaways

1. **Tool outputs are the largest variable cost.** System prompts are small and fixed; tool outputs can inject thousands of tokens per call and persist forever.

2. **Agentic costs compound quadratically.** Each step resends all previous context, creating an arithmetic progression.

3. **Input tokens drive agentic costs.** The opposite of chat — in agents, it's the accumulated history, not the generated responses.

4. **Performance degrades before the limit.** Plan for 60-80% of the advertised window as your practical ceiling.

5. **Position matters as much as content.** Information at the beginning and end gets the most attention. The middle is a blind spot.

6. **More context can mean worse performance.** Every model performs worse with more tools, more irrelevant documents, and more accumulated history.

7. **Errors compound in agentic loops.** A single hallucination cascades through dozens of subsequent steps.
