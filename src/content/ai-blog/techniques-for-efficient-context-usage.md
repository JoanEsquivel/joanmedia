---
title: "Techniques for Efficient Context Usage: The Engineering Toolkit"
description: "Explore 11 proven techniques for managing LLM context efficiently, from prompt caching and compaction to RAG, sub-agents, and memory architectures."
pubDate: 2026-03-08
heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Context Engineering
  - Token Optimization
  - RAG
  - Prompt Caching
  - AI Agents
badge: "New"
series: "Context Engineering"
seriesOrder: 4
---

## Table of Contents

1. [The Toolkit](#the-toolkit)
2. [Prompt Caching: The Lowest-Hanging Fruit](#1-prompt-caching-the-lowest-hanging-fruit)
3. [Compaction: Summarizing to Survive](#2-compaction-summarizing-to-survive)
4. [Observation Masking: The Surprisingly Effective Simple Approach](#3-observation-masking-the-surprisingly-effective-simple-approach)
5. [Sub-Agent Architecture: Multiplying Your Context](#4-sub-agent-architecture-multiplying-your-context)
6. [Context Compression and Summarization](#5-context-compression-and-summarization)
7. [RAG: Retrieval as Context Efficiency](#6-rag-retrieval-as-context-efficiency)
8. [Chunking Strategies](#7-chunking-strategies)
9. [Progressive Tool Disclosure](#8-progressive-tool-disclosure)
10. [Memory Architectures](#9-memory-architectures)
11. [KV-Cache Optimization (Infrastructure Level)](#10-kv-cache-optimization-infrastructure-level)
12. [Context-Aware Models](#11-context-aware-models)
13. [Summary: Choosing the Right Technique](#summary-choosing-the-right-technique)

---

## The Toolkit

Parts 1-3 established what context engineering is, how tokens and context windows work, and where tokens actually go (and how they fail). This post is about solutions — the concrete techniques that production AI systems use to manage context efficiently.

These techniques are organized from simplest to most complex. Most applications will see significant improvement from the first few alone.

---

## 1. Prompt Caching: The Lowest-Hanging Fruit

Prompt caching is the single most impactful optimization for applications with repetitive context. The idea: if the beginning of your prompt is the same across requests, the provider stores the computed representation and reuses it.

### Anthropic's Implementation

Anthropic offers explicit caching through a `cache_control` field in the API request.

**Economics:**
- Cache writes (first request): 125% of base input price
- Cache reads (subsequent): **10% of base input price — a 90% discount**
- Cache lifetime: 5 minutes, refreshed on each use
- Latency reduction: Up to 85% (a 100K-token book dropped from 11.5s to 2.4s)

**Important:** Requires the Anthropic native Messages API. OpenAI compatibility mode does not support it.

**Supported models:** Claude Opus 4.1, Opus 4, Sonnet 4.5, Sonnet 4, Sonnet 3.7, Haiku 4.5, Haiku 3.5, Haiku 3.

### OpenAI's Implementation

OpenAI's caching is fully automatic. Any call with prompts over 1,024 tokens benefits from caching with no code changes.

**Economics:**
- Cached tokens: **50% discount**
- Minimum prefix: 1,024 tokens
- Increments: 128 tokens
- Lifetime: 5-10 minutes of inactivity, always cleared within 1 hour

### Google's Implementation

Google offers the most aggressive caching discount:
- Cached tokens: **~96% discount**
- Particularly effective for Gemini's large context windows

### When to Use It

Prompt caching is most effective for:
- **Conversational agents** with long system prompts
- **RAG systems** where base documents are queried repeatedly
- **Tool-heavy agents** where tool definitions form a stable prefix
- **Multi-turn conversations** where system instructions stay constant

**To maximize cache hits:** Put stable content (system prompt, tool definitions, examples) *before* dynamic content (conversation history, retrieved documents). The cache only works on matching prefixes.

In 2025, enterprises reported **42% reductions** in monthly token costs from prompt caching alone.

---

## 2. Compaction: Summarizing to Survive

Compaction is the most widely adopted strategy for managing context in long-running agent sessions. When context approaches a threshold, older content is summarized to free space.

### How It Works

1. System monitors context usage
2. At 64-80% capacity, compaction triggers
3. A separate LLM call summarizes conversation history, preserving key decisions and unresolved issues
4. The compressed summary replaces full history
5. The agent continues with a smaller context

### Implementation Across Tools

**Claude Code:** Auto-compacts at 64-75% capacity. Users can manually trigger with `/compact` at logical breakpoints (which produces better summaries than automatic compaction).

The Claude API now offers **server-side compaction** for Claude Opus 4.6, handling summarization at the API level for long-running conversations.

**Goose (Block):** Auto-compacts at 80% of context window (customizable via `GOOSE_AUTO_COMPACT_THRESHOLD`).

**Google's ADK:** Triggers asynchronous compaction using an LLM to summarize older events over a sliding window.

### What to Preserve vs. Discard

**Preserve:**
- Architectural decisions and their rationale
- Unresolved bugs and open questions
- Key file paths and implementation details
- Current task state and next steps

**Discard:**
- Redundant tool outputs (especially old file reads)
- Intermediate reasoning that led to dead ends
- Verbose error messages that have been resolved

### The Tradeoff

Compaction is lossy. You can never fully replace raw context with a summary. Manual compaction at logical breakpoints (between features, after completing a subtask) produces significantly better results than automatic compaction that interrupts mid-task.

---

## 3. Observation Masking: The Surprisingly Effective Simple Approach

JetBrains Research presented findings at NeurIPS 2025 showing that hiding older tool outputs with placeholders — while preserving the reasoning and action history — is surprisingly effective.

### Results (500 benchmark instances, SWE-agent and OpenHands)

- Both masking and summarization reduced costs by **50%+** vs. unconstrained growth
- Masking **matched or exceeded** summarization in 4 of 5 scenarios
- With Qwen3-Coder 480B: masking achieved **2.6% better solve rates at 52% lower cost**
- Summarization added 13-15% trajectory elongation, negating its efficiency gains

### Why It Works Better Than Summarization

Summarization has hidden costs:
- API calls for generating summaries
- 15% longer trajectories (compressed summaries provide poor stopping signals)
- Cache invalidation (summaries change the prefix, breaking caching)

Observation masking is simpler, cheaper, and preserves the action/decision trail that the model needs most. It removes the *data* while keeping the *narrative*.

### When to Use Each

**Observation masking:** Agent workflows with lots of tool outputs. Simplest implementation.
**Summarization:** Very long conversations where full history nuance matters.
**Sliding window:** Only recent context matters; predictable, bounded costs.

---

## 4. Sub-Agent Architecture: Multiplying Your Context

Sub-agents solve context consumption by isolating complex subtasks into separate context windows.

### The Architecture

An orchestrator agent delegates tasks to sub-agents, each running in their own clean context. Each sub-agent reads files, runs searches, analyzes code — then returns a **1,000-2,000 token summary** to the orchestrator. The orchestrator never sees the raw tool outputs.

### Claude Code's Implementation

Claude Code's subagents (invoked with `@`) each get their own 200K-token context window. A complex task can effectively access **multiple context windows** worth of information, with each sub-agent maintaining focused, clean context.

**Example:** Instead of the main agent reading 20 files (40,000-200,000 tokens), it dispatches a sub-agent to read, analyze, and return a 1,500-token summary. The main agent gains high-signal information at a fraction of the context cost.

### When to Use Sub-Agents

- Task requires reading large data that only needs summarization
- Main agent's context is already 50%+ full
- Subtask is self-contained and clearly specifiable
- Multiple independent subtasks can run in parallel

### The Tradeoff

Sub-agents add latency and cost (each is a separate inference call). They also require decomposable tasks — the orchestrator must specify what it needs without providing all context.

---

## 5. Context Compression and Summarization

Context compression reduces token count while preserving essential information.

### Extractive vs. Abstractive

**Extractive:** Selects the most important sentences verbatim. Simpler, preserves exact wording, but may miss nuance.

**Abstractive:** Generates new, condensed text capturing the original meaning. Higher compression but risks information loss.

Production systems combining relevance filtering, semantic deduplication, extractive summarization, and pruning achieve **50-80% token reduction** while preserving output quality.

### LLMLingua

A prompt compression library that uses a smaller model to identify removable tokens. Particularly effective for RAG systems with long retrieved contexts and tight budgets.

### Compression Results

Three core techniques — summarization, keyphrase extraction, and semantic chunking — can achieve **5-20x compression** while maintaining accuracy, translating to **70-94% cost savings**.

---

## 6. RAG: Retrieval as Context Efficiency

RAG is fundamentally a context efficiency technique. Instead of loading everything into context, it retrieves only what's relevant.

### RAG vs. Long Context: The 2026 Consensus

ICML 2025 benchmarks (LaRA) found **no universal winner.** The choice depends on:

| Factor | Favor RAG | Favor Long Context |
|--------|-----------|-------------------|
| Corpus size | >200K tokens | <200K tokens |
| Task type | Factual retrieval across many docs | Holistic single-document analysis |
| Latency needs | <2 seconds | Acceptable 30-60 seconds |
| Cost sensitivity | High | Lower |
| Architecture simplicity | Lower priority | High priority |

### The Hybrid Approach (Best Practice)

The 2026 consensus is to combine both:
- **RAG for facts:** Retrieve specific, current information from large corpora
- **Long context for reasoning:** Use the full window for holistic understanding
- **Prompt caching for stable context:** Cache system prompts and tool definitions; retrieve dynamic content via RAG

### Semantic Caching

Redis documented a **73% cost reduction** by converting queries to embeddings and returning cached responses for semantically similar questions — avoiding LLM calls entirely for repeated patterns.

---

## 7. Chunking Strategies

Chunking — how you break documents into pieces for retrieval — significantly affects both accuracy and efficiency.

### Fixed-Size Chunking
- Split at predetermined size (200-500 tokens)
- Typical config: 512 tokens, 50-100 token overlap
- Fast but ignores semantic boundaries

### Semantic Chunking
- Split based on meaning using embedding similarity
- Each chunk focuses on a single theme
- Significantly better retrieval precision

### Choosing a Strategy

| Content Type | Best Approach |
|-------------|---------------|
| Legal contracts, specs | Respect document structure |
| Conversations | Keep Q&A pairs together |
| Code | Chunk at function/class boundaries |
| Unstructured prose | Semantic chunking |

---

## 8. Progressive Tool Disclosure

Instead of loading all tools upfront, load them on demand.

### The Three-Level Hierarchy

1. **Catalog metadata:** Minimal descriptions (~500 tokens total)
2. **Detailed playbook:** Full schema for selected tools (loaded on demand)
3. **On-demand appendix:** Extended docs accessed only when needed

### The Impact

| Approach | Tokens | Tool Accuracy |
|----------|--------|---------------|
| All tools loaded | 134,000 | 49% |
| Tool search | ~500 baseline | 74% |
| Programmatic calling | 27,297 (37% less) | Higher |

---

## 9. Memory Architectures

Memory bridges volatile context (short-term) and persistent storage (long-term), allowing agents to maintain knowledge without consuming context tokens.

### The Three-Tier Model

**Tier 1: Context Window (Working Memory)**
Everything the model can reason about right now. Finite, expensive, volatile.

**Tier 2: Session Memory (Short-Term)**
Accumulated session state. Persists within a session but lost on compaction or session end.

**Tier 3: Persistent Memory (Long-Term)**
Survives across sessions. Requires external storage — databases, vector stores, or files. Three types:
- **Episodic:** Past experiences ("Last time we refactored this, the auth tests broke")
- **Semantic:** Facts ("This project uses PostgreSQL 15 with pgvector")
- **Procedural:** Patterns ("Always run migrations before health checks in staging")

### Framework Implementations

- **LangChain:** `ConversationBufferWindowMemory` + `ConversationSummaryMemory` + `VectorStoreRetrieverMemory`
- **LlamaIndex:** `BaseMemory` class with autonomous retrieval decisions
- **Claude Code:** `CLAUDE.md` files as persistent memory + memory tool for multi-session workflows
- **Mem0:** 91% lower p95 latency, 90%+ token savings through scalable long-term memory

---

## 10. KV-Cache Optimization (Infrastructure Level)

For teams operating at scale, KV-cache optimization provides infrastructure-level gains.

### Five Approaches

1. **KV cache selection:** Retain only the most important states (H2O keeps top-k by attention scores)
2. **Budget allocation:** Distribute cache across layers based on benefit (SqueezeAttention)
3. **Merging:** Combine similar cached states
4. **Quantization:** Reduce precision (CSR achieves 1-bit key-value caching)
5. **Low-rank decomposition:** Approximate with lower-dimensional representations

### Notable Results

- **KVTC:** Up to **20x KV-cache compression** while maintaining accuracy
- **RocketKV:** Two-stage approach (permanent eviction + dynamic selection)
- **FlashInfer:** Block-Sparse Row format with fine-grained sparsity control

---

## 11. Context-Aware Models

Newer Claude models (Sonnet 4.6, Sonnet 4.5, Haiku 4.5) feature built-in context awareness — the model tracks its remaining token budget throughout a conversation.

At the start: `<budget:token_budget>200000</budget:token_budget>`
After each tool call: `<system_warning>Token usage: 35000/200000; 165000 remaining</system_warning>`

This enables the model to:
- Prioritize critical work when context is low
- Use thorough approaches when context is plentiful
- Avoid starting subtasks that can't complete within budget

Anthropic describes the pre-awareness state as "competing in a cooking show without a clock."

---

## Summary: Choosing the Right Technique

| Technique | Best For | Savings | Complexity |
|-----------|----------|---------|------------|
| Prompt caching | Repetitive prefixes | 50-90% cost | Low |
| Compaction | Long agent sessions | Variable | Low-Medium |
| Observation masking | Agent tool outputs | 52%+ cost | Low |
| Sub-agents | Complex multi-step tasks | High (isolated contexts) | Medium |
| Compression | Accumulated history | 50-80% tokens | Medium |
| RAG | Large knowledge bases | High | Medium-High |
| Semantic chunking | Document retrieval | Better precision | Medium |
| Progressive disclosure | Many tools | 74% accuracy gain | Medium |
| Memory tiers | Cross-session knowledge | High | Medium-High |
| KV-cache optimization | High-throughput infra | Up to 20x | High |

**The best production systems combine multiple techniques.** A typical stack: prompt caching for stable prefixes, RAG for knowledge retrieval, observation masking for agent history, sub-agents for complex subtasks, and tiered memory for cross-session knowledge.
