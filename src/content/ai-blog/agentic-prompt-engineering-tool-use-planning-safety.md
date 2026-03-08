---
title: "Agentic Prompt Engineering: Tool Use, Planning, Safety, and Production Patterns"
description: "Master agentic prompt engineering with proven patterns for tool design, planning strategies, state management, and multi-layered safety for production AI agents."
pubDate: 2026-03-09
heroImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Prompt Engineering
  - AI Agents
  - LLM
  - Tool Use
  - Safety
badge: "New"
series: "Prompt Engineering in the Agentic Era"
seriesOrder: 3
---

## Table of Contents

1. [From Chat to Action](#from-chat-to-action)
2. [System Prompt as Agent Constitution](#system-prompt-as-agent-constitution)
3. [Tool Design Is Prompt Engineering](#tool-design-is-prompt-engineering)
4. [Planning and Reasoning Patterns](#planning-and-reasoning-patterns)
5. [State Management](#state-management)
6. [Safety Boundaries and Security](#safety-boundaries-and-security)
7. [Common Agentic Anti-Patterns](#common-agentic-anti-patterns)
8. [Production Agent System Prompt Template](#production-agent-system-prompt-template)
9. [Key Takeaway](#key-takeaway)

---

A single system prompt with three added sentences improved GPT-4.1's autonomous coding performance by 20% on SWE-bench Verified. Those three sentences addressed persistence ("keep going until resolved"), tool calling ("do NOT guess"), and planning ("reason step by step between tool calls"). The era of agentic AI has arrived, and the rules for prompting agents are fundamentally different from prompting chatbots.

---

## From Chat to Action

AI agents are no longer a research curiosity. In 2026, 57% of organizations deploy agents for multi-stage workflows, and 83% plan agentic AI deployment. An agent differs from a chatbot in a critical way: a chatbot responds; an agent *acts*.

Three shifts define this new landscape:

**From text output to world-affecting actions.** A hallucinated tool parameter can send an email to the wrong person, overwrite a file, or execute a destructive command.

**From single-turn to multi-step reasoning.** Agent prompts must guide behavior across dozens or hundreds of steps. The prompt must encode decision-making heuristics, not just formatting preferences.

**From static context to dynamic state.** An agent accumulates context over time. The prompt must teach the agent how to manage expanding context, not just respond to what is there.

---

## System Prompt as Agent Constitution

For agentic systems, the system prompt must define identity, tool usage policies, safety boundaries, workflows, and domain-specific expertise. Organize into distinct sections:

```xml
<background_information>
  Who the agent is and what domain it operates in.
</background_information>
<instructions>
  Step-by-step behavioral rules.
</instructions>
<tool_guidance>
  When and how to use each available tool.
</tool_guidance>
<output_description>
  What the agent's responses should look like.
</output_description>
```

OpenAI's three critical components for every agentic system prompt:

1. **Persistence**: "Keep going until the user's query is completely resolved." (Prevents premature termination)
2. **Tool-calling**: "Do NOT guess or make up an answer." (Reduces hallucination)
3. **Planning**: "Reason step by step between tool calls." (+4% SWE-bench alone)

Together: ~20% SWE-bench improvement.

---

## Tool Design Is Prompt Engineering

How tools are documented matters as much as the system prompt. Anthropic's research: teams spent more time optimizing tools than prompts, yielding significant improvements.

### Principles for Effective Tools

| Principle | Description |
|-----------|-------------|
| **Self-contained** | Each tool robust to errors with clear outputs |
| **Clearly documented** | Name, description, parameters, constraints, examples |
| **Minimal overlap** | No ambiguous choices between similar tools |
| **Token-efficient** | Concise outputs; avoid bloated return values |
| **Error-aware** | Meaningful error messages, not exceptions |

### Tool Documentation Template

```
Tool Name: [clear, descriptive identifier]
Purpose: [what it does and when to use it]
When NOT to use: [explicit exclusion criteria]
Parameters:
  - param_name (type, required/optional): description
Usage Example:
  [concrete invocation example]
```

**Key findings:**
- Use the API's `tools` field exclusively (2% improvement over manual schema injection)
- Apply the "intern test": could someone unfamiliar with your system choose the right tool from the docs alone?
- Keep initial function set under 20 for higher accuracy
- Use enums to constrain values and make invalid states unrepresentable
- Distinction between similar tools must be explicit (e.g., `write_file` vs `replace_in_file`)
- Naming matters: a named `apply_patch` tool reduced failures by 35% (GPT-5.1)

---

## Planning and Reasoning Patterns

### ReAct (Reasoning + Acting)

The foundational pattern. Agent alternates between Thought (reasoning), Action (tool call), and Observation (processing result). ~85% accuracy, 2,000-3,000 tokens per task.

```
Thought: I need to find the user's order history to answer this question.
Action: search_orders(user_id="12345", limit=10)
Observation: Found 8 orders, most recent is Order #789 from March 5.
Thought: The user asked about their latest order. I have the answer.
```

### Plan-and-Execute

Separates planning from execution. A capable model decomposes the task into subtasks, then each executes sequentially (potentially by a cheaper model). ~92% accuracy, but costs more (3,000-4,500 tokens, 5-8 API calls). The plan-once-execute-many pattern can reduce costs by up to 90%.

### Plan/Act Dual Mode

Used by production agents like Cline:

- **PLAN MODE**: Gather context, ask clarifying questions, brainstorm strategies, present detailed plan
- **ACT MODE**: Execute approved plan step-by-step, using tools, minimizing errors through predetermined strategy

### Step-by-Step Confirmation

Require user confirmation between tool calls:

```
Proceed step-by-step, waiting for the user's message after each tool use
before moving forward with the task.
```

Prevents cascading failures. Tradeoff: speed for safety.

### Which Pattern When?

| Pattern | Accuracy | Cost | Best For |
|---------|----------|------|----------|
| ReAct | ~85% | Lower | Dynamic tasks, exploration |
| Plan-and-Execute | ~92% | Higher | Well-defined multi-step tasks |
| Hybrid | Highest | Variable | Production systems |

Most production systems combine both: planning at a high level, ReAct-style at the granular level.

---

## State Management

Agents operating over long horizons need explicit state tracking.

### Structured State Files

Use JSON for measurable state:
```json
{
  "tests": [
    {"id": 1, "name": "auth_flow", "status": "passing"},
    {"id": 2, "name": "user_mgmt", "status": "failing"}
  ],
  "total": 200, "passing": 150, "failing": 25
}
```

Use unstructured text for progress notes, decisions, and dependencies.

### Git as State Management

Git provides a log of what has been done and checkpoints that can be restored. Particularly effective with Claude's latest models.

### Multi-Context Window Workflows

1. First window: set up framework (tests, scripts, infrastructure)
2. Subsequent windows: iterate on a todo-list
3. Write tests before starting work
4. Create setup scripts to prevent repeated work when continuing fresh

### Context Compaction

When approaching window limits:
1. Maximize recall first (capture everything relevant)
2. Iterate to improve precision (eliminate superfluous content)
3. Preserve: architectural decisions, unresolved bugs, implementation details
4. Discard: redundant tool outputs (safest to remove)

Alternative: start fresh. Modern models discover state from the filesystem effectively.

---

## Safety Boundaries and Security

### The Reversibility Framework

Without guidance, agents may take irreversible actions. Make boundaries explicit:

```
Consider the reversibility and potential impact of your actions.

Encouraged (local, reversible): editing files, running tests, reading code
Requires confirmation: deleting files, force-pushing, dropping tables,
    commenting on PRs, sending messages, modifying shared infrastructure
```

This works because it teaches a decision-making heuristic rather than trying to enumerate every dangerous action.

### Seven Layers of Defense

Prompt injection is OWASP's #1 LLM risk. Anthropic's best result: 1% attack success rate. Defense must be architectural.

**Layer 1: System prompt hardening.** Define role, capabilities, limitations. Teach reversibility-based heuristics.

**Layer 2: Prompt scaffolding.** Wrap user inputs in structured templates. Separate trusted instructions from untrusted content. Evaluate safety before generating.

**Layer 3: Tool privilege management.** Minimum permissions. Per-tool scoping (read vs write). Human approval for high-impact operations. Allowlists:

```python
ALLOWED_TOOLS = {"search", "calculator", "file_reader"}

def validate_tool_call(tool_name, parameters):
    if tool_name not in ALLOWED_TOOLS:
        return {"error": f"Tool '{tool_name}' is not authorized"}
    return {"approved": True}
```

**Layer 4: Input/output validation.** Schema validation for tool inputs/outputs. Filter sensitive data (SSNs, API keys). Mark external content as untrusted.

**Layer 5: Multi-agent trust boundaries.** Sanitize inter-agent communications. Prevent privilege escalation. Isolated execution environments. Circuit breakers.

**Layer 6: Model-level training.** RL-based injection resistance. Content scanning classifiers.

**Layer 7: Monitoring and observability.** Audit trails, anomaly detection (>30 tool calls/minute), NIST/ISO compliance.

**The fundamental principle:** defense requires architecture, not vibes. No single prompt can substitute for layered security.

### Security Checklist

1. Treat all external data as untrusted
2. Implement instruction hierarchy (system > user > external)
3. Apply least-privilege tool access
4. Validate all tool inputs/outputs against schemas
5. Require human approval for irreversible actions
6. Monitor for anomalies
7. Regularly red-team your system
8. Use content classifiers for injection detection
9. Sanitize agent memory before persistence
10. Design for graceful failure

---

## Common Agentic Anti-Patterns

### 1. Overengineering

Claude 4.5/4.6 tends to create extra files, add unnecessary abstractions, and build unrequested flexibility. Fix: "Only make changes that are directly requested or clearly necessary."

### 2. Test-Focused Hard-Coding

Agents may hard-code values to pass tests rather than writing general solutions. Fix: "Implement solutions that work correctly for all valid inputs, not just test cases."

### 3. Unreviewed Agent Output

Simon Willison identifies this as the primary anti-pattern: filing PRs with hundreds of lines of unreviewed agent-generated code. Fix: review everything before submitting.

### 4. Hallucinated Tool Calls

Agents invoke tools with fabricated parameters. Fix: "If you don't have enough information, ask the user."

### 5. Cascading Failures

Multiple unconfirmed tool calls compounding errors. Fix: step-by-step confirmation between tool calls.

### 6. Excessive Subagent Use

Delegating when direct action is faster. Fix: explicit guidance on when to delegate vs act directly.

### 7. Code Speculation

Claiming things about code without reading it first. Fix: "Read the file before making claims about its contents."

---

## Production Agent System Prompt Template

Drawing from OpenAI's SWE-bench agent (55% solve rate), PromptHub's Cline analysis, and Anthropic's best practices:

```
# Identity and Scope
You are [role]. Your task is [objective].

# Tool Usage
[Documented tool definitions with examples]
Use the tools provided to gather information. Do NOT guess or make up answers.

# Planning
Before each action, explain your reasoning. Plan before you execute.
Keep going until the task is completely resolved.

# Safety
Consider reversibility and impact before acting.
[Reversibility framework]
[Task boundaries]

# State Management
Track progress in [structured format].
Save state before context limits are approached.

# Output
[Format requirements]
[Confirmation loop specification]
```

### Effort Calibration

| Task Type | Recommended Setting |
|-----------|-------------------|
| Simple tool calls | Low effort, no thinking |
| Multi-file code changes | Medium effort |
| Complex debugging | High effort |
| Large-scale refactoring | High effort, max context |
| Research and synthesis | Adaptive thinking |

---

## Key Takeaway

Agentic prompt engineering is a distinct discipline. It requires thinking about system prompts as constitutions, tools as carefully documented APIs, state management as a first-class concern, and safety as a design constraint rather than an afterthought.

The agents that work reliably share traits: they plan before acting, use tools instead of guessing, track state explicitly, and have clear boundaries on what they can and cannot do.
