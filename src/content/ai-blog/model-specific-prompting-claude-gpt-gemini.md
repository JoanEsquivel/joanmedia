---
title: "Model-Specific Prompting: How Claude, GPT, and Gemini Differ"
description: "Learn how to tailor prompts for Claude, GPT, and Gemini models. Covers formatting preferences, reasoning modes, and agentic configurations for each."
pubDate: 2026-03-09
heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Prompt Engineering
  - LLM
  - Claude
  - GPT
  - Gemini
series: "Prompt Engineering in the Agentic Era"
seriesOrder: 2
badge: "New"
---

## Table of Contents

1. [Why Model Differences Matter](#why-model-differences-matter)
2. [Google Gemini 3](#google-gemini-3)
3. [OpenAI GPT-4.1 / GPT-5.x](#openai-gpt-41--gpt-5x)
4. [Anthropic Claude 4.x](#anthropic-claude-4x)
5. [Cross-Model Comparison](#cross-model-comparison)
6. [Practical Guidance](#practical-guidance)

---

## Why Model Differences Matter

As of early 2026, three model families dominate: Google's Gemini 3 series, OpenAI's GPT-4.1/5.x and reasoning models (o3, o4-mini), and Anthropic's Claude 4.x (Opus 4.6, Sonnet 4.6, Haiku 4.5). Each has published detailed prompting guides, and the differences reflect fundamentally different design choices in training, instruction following, and reasoning architecture.

"The way you write prompts is often specific to the model you're using." This is not speculation --- it is backed by measurable performance differences. A prompt formatted in XML may outperform Markdown by 30% on one model and underperform on another. The universal principles get you 80% of the way. The remaining 20% comes from understanding your model.

---

## Google Gemini 3

**Key characteristics:**

- **Literal and direct**: prefers direct, well-structured prompts. Google advises: "State your goal clearly and concisely. Avoid unnecessary or overly persuasive language."
- **Default conciseness**: provides "direct and efficient answers" unless you explicitly ask for detail
- **Temperature sensitivity**: keep at default 1.0 --- lower temperatures "may lead to unexpected behavior, such as looping or degraded performance"

**Formatting preferences:**

- Works well with both XML tags and Markdown headings
- Place critical instructions, roles, and format requirements first (priority ordering)
- For long context: supply all context first, then place instructions at the end
- Use anchor phrases like "Based on the information above..."

**Gemini 3 Flash-specific tactics:**

- **Date awareness**: add "Remember it is [current year] this year"
- **Knowledge cutoff**: explicitly state "Your knowledge cutoff date is [date]"
- **Grounding**: "You are a strictly grounded assistant limited to the information provided"

**Multimodal**: Gemini treats text, images, audio, and video as equal first-class inputs.

**Agentic configuration**: Three behavioral dimensions for steering agents:
1. Reasoning and Strategy: logical decomposition depth, information exhaustiveness
2. Execution and Reliability: adaptability, persistence, risk assessment
3. Interaction and Output: ambiguity handling, verbosity, output precision

---

## OpenAI GPT-4.1 / GPT-5.x

The most important change: **GPT-4.1 follows instructions more literally and infers intent less liberally.** This requires more explicit specification of desired behaviors.

**Key characteristics:**

- **Highly steerable**: "A single sentence firmly clarifying your desired behavior is almost always sufficient"
- **Instruction priority**: when instructions conflict, GPT-4.1 follows instructions closer to the **end** of the prompt
- **Two model types**: GPT models (fast, cost-efficient, explicit instructions) vs reasoning models (internal CoT, multi-step planning)

**Recommended prompt structure:**

```
# Role and Objective
# Instructions
## Sub-categories for detailed instructions
# Reasoning Steps
# Output Format
# Examples
# Context
# Final instructions
```

**Three critical agentic components** (~20% SWE-bench improvement combined):

1. **Persistence**: "Keep going until the user's query is completely resolved"
2. **Tool-calling**: "Do NOT guess or make up an answer"
3. **Planning**: "Reason step by step between tool calls" (+4% alone)

**Long context (1M tokens):**

- Place instructions at both beginning and end
- If choosing one, above-context outperforms below
- Specify whether to rely solely on provided context or supplement with internal knowledge

**Delimiter performance:**

| Format | Performance | Notes |
|--------|-------------|-------|
| Markdown | Good (recommended start) | Headers, backticks, lists |
| XML | Strong | Precise wrapping, metadata, nesting |
| JSON | Poor in multi-document | Verbose, escaping overhead |
| Delimited text (ID: 1 / TITLE: X) | Strong | Simple, effective |

**GPT-5/5.1/5.2 specifics:**

- Contradictory instructions are more damaging --- model wastes reasoning tokens reconciling
- `reasoning_effort` parameter (low/medium/high) controls depth-vs-speed
- `verbosity` parameter for output length
- GPT-5.1: user updates spec, solution persistence, apply_patch tool (35% fewer failures)
- Does not use Markdown by default; must be explicitly requested

**Reasoning models (o3, o4-mini):**

| Do | Don't |
|----|-------|
| Keep prompts simple and direct | Ask for chain-of-thought |
| State constraints explicitly | Over-engineer with examples |
| Use XML-style delimiters | Provide elaborate formatting |
| Start zero-shot (no examples) | Use system messages (use developer) |

---

## Anthropic Claude 4.x

Claude's latest models represent the most opinionated approach to prompt engineering.

**Key characteristics:**

- **More proactive**: Claude 4.6 is significantly more proactive than predecessors. **Dial back aggressive language** ("CRITICAL: You MUST...") --- it now overtriggers
- **Prefilled responses deprecated**: starting with 4.6. Migrate to structured outputs or direct instructions
- **More concise and natural**: provides fact-based progress reports rather than self-celebratory updates

**XML tags --- strong documented preference:**

```xml
<instructions>
  Your task description here.
</instructions>
<context>
  Background information here.
</context>
<examples>
  <example>
    Input: ...
    Output: ...
  </example>
</examples>
```

**Adaptive thinking** (replaces manual `budget_tokens`):

- Model dynamically decides when and how much to think
- `effort` parameter: low/medium/high/max
- Higher effort = more thinking; complex queries = more thinking
- Anthropic's evaluations: adaptive thinking "reliably drives better performance than extended thinking"
- Thinking guidance: "Prefer general instructions ('think thoroughly') over prescriptive step-by-step plans. Claude's reasoning frequently exceeds what a human would prescribe."

**Parallel tool calling:**

- Excels at parallel execution --- will proactively run multiple searches, read several files, execute commands simultaneously
- Steerable to near-100% parallel or reduced to sequential mode

**Overeagerness management:**

Claude 4.6 tends to overengineer --- creating extra files, adding unnecessary abstractions, building unrequested flexibility. Control with:

```
Avoid over-engineering. Only make changes that are directly requested
or clearly necessary. Keep solutions simple and focused.
```

**Subagent orchestration:**

- Proactively delegates to subagents when tasks benefit from parallel/isolated execution
- May overuse them --- provide explicit guidance on when direct action is preferred

**Prompt caching:**

- Two approaches: automatic and explicit
- Cache hits at 10% of base input price
- 20-block lookback window (non-obvious limitation)
- 1-hour cache at 2x cost recommended for agentic/thinking workflows
- Place static content first, variable content last

---

## Cross-Model Comparison

| Dimension | Gemini 3 | GPT-4.1 | Claude 4.x |
|-----------|----------|---------|------------|
| **Instruction following** | Direct, precision-oriented | Literal, highly steerable | Proactive, may overtrigger |
| **Preferred format** | Markdown or XML | Markdown (start), XML (complex) | XML (strong preference) |
| **Reasoning** | External via prompting | Visible CoT or hidden (reasoning) | Adaptive thinking (dynamic) |
| **Temperature** | Keep at 1.0 (lower causes loops) | Standard adjustment | Standard adjustment |
| **Conflict resolution** | Priority ordering (first wins) | End of prompt wins | System prompt responsive |
| **Agentic behavior** | Configured via behavioral dimensions | Three critical system prompt components | Native subagent orchestration |
| **Long context** | Multimodal first-class | 1M tokens, dual placement | 200K (1M beta), queries at end +30% |

---

## Practical Guidance

### Adapting a Code Review Task

**For Gemini 3:**
```
Review this Python function for bugs, performance issues, and readability.
List each issue with its line reference and severity (critical/warning/info).
Provide a corrected version of the function.
```

**For GPT-4.1:**
```
# Role and Objective
You are a senior Python code reviewer.

# Instructions
Review the following function. Identify bugs, performance issues,
and readability concerns.

# Output Format
For each issue:
- Line reference
- Severity: critical, warning, or info
- Description
- Suggested fix

Then provide the corrected function.

# Context
[function code here]
```

**For Claude 4.x:**
```xml
<role>Senior Python code reviewer</role>
<instructions>
Review the function below for bugs, performance issues, and readability concerns.
For each issue, provide the line reference, severity (critical/warning/info),
and a suggested fix. Then provide the corrected function.
</instructions>
<code>
[function code here]
</code>
```

### Model Selection Guide

| Choose This | When |
|-------------|------|
| **Gemini 3** | Multimodal tasks, direct Q&A, concise responses by default |
| **GPT-4.1** | Agentic coding, long-context document analysis, literal instruction following |
| **Reasoning models (o3)** | Ambiguous multi-step tasks, complex planning, accuracy over speed |
| **Claude 4.x** | Complex agentic systems, parallel tool orchestration, adaptive reasoning depth |

### Key Warnings

- **Model-specific advice is volatile.** Different snapshots within the same family produce different results. Build evaluation frameworks, not static templates.
- **Over-optimization creates lock-in.** Consider a model-agnostic core prompt with model-specific wrappers.
- **Read the official guide.** Every provider has published one. They contain advice no generic guide can replace.
