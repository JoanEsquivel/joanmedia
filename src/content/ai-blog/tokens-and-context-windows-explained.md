---
title: "Tokens and Context Windows Explained: The Foundation of Context Engineering"
description: "Understand tokens, tokenization, context windows, and pricing -- the foundational knowledge that everything in context engineering builds upon."
pubDate: 2026-03-08
heroImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Context Engineering
  - Tokens
  - LLM
  - Context Windows
  - AI Pricing
badge: ""
series: "Context Engineering"
seriesOrder: 2
---

## Table of Contents

1. [Before You Can Engineer Context, You Need to Understand Tokens](#before-you-can-engineer-context-you-need-to-understand-tokens)
2. [What Is a Token?](#what-is-a-token)
3. [What Is a Context Window?](#what-is-a-context-window)
4. [Context Window Sizes Across Providers (March 2026)](#context-window-sizes-across-providers-march-2026)
5. [Token Pricing: The Economics of Context](#token-pricing-the-economics-of-context)
6. [How Different Content Types Tokenize](#how-different-content-types-tokenize)
7. [The Token Budget Mental Model](#the-token-budget-mental-model)
8. [Key Takeaways](#key-takeaways)

---

## Before You Can Engineer Context, You Need to Understand Tokens

Every interaction with an AI model -- every question, every tool call, every agent step -- is measured in tokens. Tokens are the fundamental unit of AI. They determine what the model can process, how much it costs, and how fast it responds. Yet most developers have only a vague understanding of what tokens actually are.

This post breaks down tokens, tokenization, context windows, and pricing -- the foundational knowledge that everything in context engineering builds upon.

---

## What Is a Token?

A token is a chunk of text that the model processes as a single unit. Tokens are not words. They are not characters. They are subword units determined by a tokenization algorithm.

### How Tokenization Works

Modern LLMs use **Byte Pair Encoding (BPE)** or similar subword tokenization algorithms (like SentencePiece). The process works roughly like this:

1. Start with individual characters as the initial vocabulary
2. Count the most frequent pair of adjacent tokens in the training data
3. Merge that pair into a new token and add it to the vocabulary
4. Repeat until the vocabulary reaches a target size (typically 50,000-100,000+ tokens)

The result is a vocabulary where:
- Common words are single tokens: "the", "is", "and"
- Common subwords are single tokens: "ing", "tion", "pre"
- Uncommon words are split into multiple tokens: "counterintuitive" → "counter" + "intu" + "itive"
- Very rare strings become individual characters or bytes

### The Practical Rules of Thumb

For English text:
- **1 token ≈ 4 characters** (or roughly 0.75 words)
- **1 word ≈ 1.3 tokens** on average
- **100 tokens ≈ 75 words**
- **1,000 tokens ≈ 750 words** (about 1.5 pages of text)

These are approximations. Actual token counts vary by:
- **Language**: Non-Latin scripts (Chinese, Japanese, Korean, Arabic) often require more tokens per character
- **Content type**: Code tends to use more tokens than prose due to special characters, indentation, and camelCase splitting
- **Vocabulary**: Technical jargon and rare words consume more tokens than common words

### Why Tokens Matter for Context Engineering

Tokens are the currency of context engineering. Every component of your context -- system prompt, conversation history, tool definitions, retrieved documents, the model's response -- is measured in tokens. Understanding token counts lets you:

1. **Budget context effectively**: Know how much space each component consumes
2. **Predict costs**: Calculate the dollar cost of each API call
3. **Optimize efficiency**: Identify where tokens are being wasted
4. **Avoid silent degradation**: Know when you're approaching limits that affect quality

---

## What Is a Context Window?

The context window is the maximum number of tokens a model can process in a single inference call. It is the model's entire working memory -- everything it can "see" and reason about at the moment of generating a response.

The context window includes:
- **Input tokens**: Everything you send to the model (system prompt, conversation history, tool definitions, retrieved content, the current message)
- **Output tokens**: Everything the model generates (its response, tool call requests, reasoning tokens)

Both input and output tokens share the same window. If a model has a 200K context window and you send 180K tokens of input, the model can only generate up to 20K tokens of output.

### How It Works Mechanically

When you make an API call:

1. Your entire input is tokenized
2. The model processes all input tokens through its attention mechanism
3. The model generates output tokens one at a time, each attending to all previous tokens (input + already-generated output)
4. Generation stops when the model produces a stop token, hits `max_tokens`, or reaches the context window limit

Because LLMs are **stateless**, there is no persistent memory between API calls. Every call must include the entire conversation history. A 10-turn conversation means the full history is resent on every message -- turn 1 is processed 10 times, turn 2 is processed 9 times, and so on.

This statelesness is why context management is so important. The model literally forgets everything between calls unless you explicitly include it in the next request.

### What Happens When You Exceed It

When input tokens exceed the context window:
- **Anthropic (Claude)**: Returns an error before processing. You must reduce input to fit.
- **OpenAI (GPT)**: Returns an error. Some older models silently truncated, but current models reject oversized inputs.
- **Google (Gemini)**: Returns an error for inputs exceeding the limit.

There is no graceful degradation -- you either fit within the window or the request fails.

---

## Context Window Sizes Across Providers (March 2026)

The context window race has been one of the most visible competitions in AI. Here's where things stand:

### Anthropic (Claude)

| Model | Context Window | Max Output |
|-------|---------------|------------|
| Claude Opus 4.6 | 200K tokens (1M beta) | 32K tokens |
| Claude Sonnet 4.6 | 200K tokens (1M beta) | 16K tokens |
| Claude Haiku 4.5 | 200K tokens | 8K tokens |

Claude models support extended thinking, where reasoning tokens are billed as output tokens. With interleaved thinking (Claude 4+ models), the thinking budget can extend up to the entire context window.

### OpenAI (GPT)

| Model | Context Window | Max Output |
|-------|---------------|------------|
| GPT-5.4 | 1M tokens (Codex) | 100K tokens |
| GPT-4.1 | 1M tokens | 32K tokens |
| GPT-4o | 128K tokens | 16K tokens |
| o3 / o4-mini | 200K tokens | 100K tokens |

OpenAI's reasoning models (o-series) generate internal reasoning tokens that consume context but are not shown to the user.

### Google (Gemini)

| Model | Context Window | Max Output |
|-------|---------------|------------|
| Gemini 2.5 Pro | 1M tokens (2M coming) | 65K tokens |
| Gemini 2.5 Flash | 1M tokens | 65K tokens |

Google leads on raw context window size, with a 2M token window announced for Gemini 2.5 Pro.

### Open Source

| Model | Context Window |
|-------|---------------|
| Llama 3.1 405B | 128K tokens |
| Qwen3-Coder 480B | 256K tokens |
| Mistral Large | 128K tokens |

### The Reality Behind the Numbers

These are *advertised* maximums. The *effective* context -- where the model still performs reliably -- is significantly lower:

- **Gemini 2.5 Pro**: Effective up to ~200K tokens
- **GPT-5**: Effective up to ~200K tokens
- **Claude Sonnet 4 (Thinking)**: Effective in the 60-120K range

As a rule of thumb: **plan for 60-70% of the advertised context window as your practical ceiling.** Performance degrades gradually before that point, but the degradation becomes pronounced beyond it.

---

## Token Pricing: The Economics of Context

Token pricing directly impacts context engineering decisions. Understanding the cost structure helps you optimize where it matters most.

### Current Pricing (March 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Cached Input |
|-------|----------------------|------------------------|--------------|
| **Claude Opus 4.6** | $5.00 | $25.00 | $0.50 (90% off) |
| **Claude Sonnet 4.6** | $3.00 | $15.00 | $0.30 (90% off) |
| **Claude Haiku 4.5** | $0.80 | $4.00 | $0.08 (90% off) |
| **GPT-5.4** | $2.50 | $10.00 | $1.25 (50% off) |
| **GPT-4.1** | $2.00 | $8.00 | $1.00 (50% off) |
| **GPT-4o** | $2.50 | $10.00 | $1.25 (50% off) |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | ~$0.05 (~96% off) |
| **Gemini 2.5 Flash** | $0.15 | $0.60 | ~$0.01 (~96% off) |

*Prices have dropped approximately 80% from mid-2025 to early 2026.*

### The Critical Insight: Output Tokens Cost 4-6x More Than Input

This asymmetry has major implications for context engineering:

- A 500-token response at Claude Opus 4.6 costs $0.0125
- A 100-token response costs $0.0025 -- **5x cheaper** for the same information if constrained effectively
- Constraining output is often the **highest-ROI optimization** because output tokens are so much more expensive

### Cost at Scale: A Real Example

Consider an agentic coding assistant processing 10,000 requests per month:

**Without optimization:**
- Average input: 50,000 tokens/request → $250/month (Sonnet 4.6)
- Average output: 2,000 tokens/request → $300/month
- **Total: $550/month**

**With prompt caching (90% of input is stable):**
- Cached input: 45,000 tokens at $0.30/MTok → $13.50/month
- Non-cached input: 5,000 tokens at $3.00/MTok → $15/month
- Output (constrained): 800 tokens/request → $120/month
- **Total: $148.50/month -- 73% reduction**

---

## How Different Content Types Tokenize

Understanding how different content types consume tokens helps you make informed context engineering decisions.

### Text

Standard English prose: ~1 token per 4 characters. A typical blog post of 1,500 words ≈ 2,000 tokens.

### Code

Code is generally more token-dense than prose due to:
- Special characters (`{}`, `[]`, `()`, `=>`) each consuming 1-2 tokens
- Indentation (spaces/tabs) consuming tokens
- camelCase and snake_case identifiers being split: `getUserProfile` → `get`, `User`, `Profile`
- Comments adding tokens without functional value

A 100-line Python file typically consumes 500-1,500 tokens depending on complexity.

### JSON

JSON is notably verbose in tokens:
- `{"temperature": 72, "unit": "fahrenheit"}` consumes significantly more tokens than `temperature: 72F`
- JSON's structural characters (`{`, `}`, `"`, `:`, `,`) all consume tokens
- For internal processing, compact formats (YAML, CSV, custom) can reduce token usage by 18-40%

### Structured Data

Tables, lists, and structured data consume tokens proportional to their character count. Markdown formatting characters (`|`, `-`, `*`, `#`) all consume tokens.

---

## The Token Budget Mental Model

Think of your context window as a budget. Every component has a cost:

```
┌─────────────────────────────────────────────────┐
│                 CONTEXT WINDOW                   │
│                 (e.g., 200K tokens)              │
│                                                  │
│  ┌──────────────┐  Fixed costs (every call)      │
│  │ System Prompt │  ~2,000-3,000 tokens          │
│  ├──────────────┤                                │
│  │ Tool Defs    │  ~5,000-55,000 tokens          │
│  ├──────────────┤                                │
│  │ Safety Buffer│  ~30,000-40,000 tokens         │
│  ├──────────────┤                                │
│  │              │                                │
│  │ Conversation │  Variable (grows each turn)    │
│  │ History      │                                │
│  │              │                                │
│  ├──────────────┤                                │
│  │ Tool Outputs │  Variable (can be huge)        │
│  ├──────────────┤                                │
│  │ Retrieved    │                                │
│  │ Documents    │                                │
│  ├──────────────┤                                │
│  │ Current Msg  │  Small                         │
│  ├──────────────┤                                │
│  │ Model Output │  Shares the same window        │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘
```

In a typical agentic session (like Claude Code), the budget breaks down approximately:

| Component | Tokens | % of 200K |
|-----------|--------|-----------|
| System prompt | ~2,600 | 1.3% |
| Built-in tools | ~17,600 | 8.8% |
| MCP tools | 900-51,000 | 0.5-25% |
| Compaction buffer | ~33,000 | 16.5% |
| **Available for work** | **~114,000** | **~57%** |

**You start with roughly 57% of the advertised window for actual work.** Add MCP servers, and that drops further. This is why context engineering matters -- the window is already half-consumed before you type a single message.

---

## Key Takeaways

1. **Tokens are subword units, not words.** 1 token ≈ 4 characters, 1 word ≈ 1.3 tokens. Code and JSON are more token-dense than prose.

2. **The context window is shared between input and output.** Large inputs leave less room for the model's response.

3. **LLMs are stateless.** Every API call resends the entire conversation. Context costs compound with each turn.

4. **Effective context is 60-70% of advertised.** Plan for performance degradation well before the limit.

5. **Output tokens cost 4-6x more than input tokens.** Constraining output length is often the highest-ROI optimization.

6. **Prompt caching can reduce costs by 50-90%.** This is the single most impactful optimization for applications with repetitive context patterns.

7. **Your actual working space may be only ~57% of the window** after system prompts, tools, and safety buffers.
