---
title: "Building Your First Custom Agent"
description: "A hands-on guide to creating custom Claude Code agents and skills, from defining the agent file and prompt to configuring permissions and persistent memory."
pubDate: 2026-03-11
heroImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=750&h=422&fit=crop"
category: "ai"
tags:
  - Claude Code
  - Custom Agents
  - Prompt Engineering
  - Skills
  - AI Automation
badge: "New"
series: "Building Custom Agents in Claude Code"
seriesOrder: 2
---

## Table of Contents

1. [From Repeated Prompts to Reusable Agents](#from-repeated-prompts-to-reusable-agents)
2. [Step 1: Define the Problem](#step-1-define-the-problem)
3. [Step 2: Create the Agent File](#step-2-create-the-agent-file)
4. [Step 3: Create the Skill File](#step-3-create-the-skill-file)
5. [Step 4: Set Up Persistent Memory](#step-4-set-up-persistent-memory)
6. [Step 5: Configure Permissions](#step-5-configure-permissions)
7. [Step 6: Test Your Agent](#step-6-test-your-agent)
8. [The Complete Checklist](#the-complete-checklist)
9. [What's Next](#whats-next)

---

## From Repeated Prompts to Reusable Agents

You just learned that Claude Code has a built-in system for custom agents and skills. Now the question is: how do you actually build one?

This post is the hands-on companion. We'll walk through creating a custom agent from scratch, write an effective agent prompt, define a skill with a structured workflow, set up persistent memory, and configure the permissions. By the end, you'll have a pattern you can replicate for any domain.

## Step 1: Define the Problem

Before writing any configuration, answer three questions:

1. **What role does this agent play?** (e.g., QA Engineer, DevOps Specialist, Technical Writer)
2. **What workflows does it follow?** (e.g., "Given a feature description, produce test cases")
3. **What tools does it need?** (e.g., file reading, web search, Jira API, browser automation)

These answers directly map to:
- Question 1 → The **agent file** (role, personality, constraints)
- Question 2 → The **skill file(s)** (workflow phases, output format)
- Question 3 → The **settings file** (tool permissions)

## Step 2: Create the Agent File

Create a new file at `.claude/agents/{agent-name}.md`. The file has two parts: YAML frontmatter for configuration and markdown body for the system prompt.

### The Frontmatter

```yaml
---
name: my-agent
description: "A clear description of WHEN to use this agent. This text appears in the Agent tool registry and helps Claude decide whether to invoke this agent."
model: opus
color: green
memory: project
skills: my-skill-name
---
```

**Tips for the `description` field:**
- Write it as a trigger condition: "Use this agent when..."
- Be specific about the types of tasks it handles
- Mention the inputs it expects (e.g., "when the user provides a feature description")
- This description is what the main Claude Code session uses to decide whether to launch your agent

### The System Prompt (Body)

The markdown body after the frontmatter is the agent's system prompt. This is where you define:

1. **Role identity** --- who the agent is
2. **Task description** --- what it does
3. **Input placeholders** --- where user inputs go
4. **Skill references** --- which skills to follow
5. **Requirements** --- quality constraints
6. **Output expectations** --- what to produce
7. **Memory instructions** --- how to use persistent memory

Here's the template:

```markdown
You are a [role description].

Your task is to [primary task] using the `[skill-name]` skill.

Input:
{USER_INPUT}

Goal:
[What the agent should produce]

Instructions:

1. Use the `[skill-name]` skill and follow its workflow exactly:
   - Phase 1: [phase name]
   - Phase 2: [phase name]
   - Phase 3: [phase name]
2. [Additional instruction]
3. [Additional instruction]

Requirements:

- [Quality constraint]
- [Accuracy constraint]
- [Format constraint]

Output:

[Describe exactly what files or output to produce]

# Persistent Agent Memory

You have a persistent memory directory at `[path]`.
[Memory guidelines...]
```

### Prompt Engineering Best Practices

Writing effective agent prompts is both art and science. Here are the patterns that work:

#### 1. Lead with Identity, Not Instructions

**Good:**
```markdown
You are a senior QA engineer with expertise in test automation,
test design patterns, and risk-based testing strategies.
```

**Less effective:**
```markdown
You need to create test cases for the user.
```

Why: Identity framing activates relevant knowledge and reasoning patterns. A "senior QA engineer" naturally considers edge cases, boundary values, and negative testing without being told to.

#### 2. Use Explicit Skill References

**Good:**
```markdown
Use the `test-case-creation` skill and follow its workflow exactly:
- Phase 1: Analysis
- Phase 2: Test Design
- Phase 3: Output
```

**Less effective:**
```markdown
Follow the testing workflow.
```

Why: Explicit references ensure the agent loads and follows the right skill definition. Listing the phases acts as a checklist.

#### 3. Define Input Placeholders Clearly

```markdown
Input:
{FEATURE_DESCRIPTION}

Additional Context (if provided):
{ACCEPTANCE_CRITERIA}
```

The `{PLACEHOLDER}` syntax tells Claude Code to substitute user-provided values when the agent is invoked.

#### 4. Set Hard Constraints

```markdown
Requirements:
- Every test case MUST have: ID, title, preconditions, steps, expected result
- Cover at minimum: happy path, error handling, boundary values, security
- Do NOT fabricate test data --- use realistic but generic examples
- Output must be valid markdown
```

Hard constraints prevent drift. Without them, the agent might skip fields, ignore edge cases, or produce inconsistent formats.

#### 5. Specify Output Explicitly

```markdown
Output:
Write the test cases to `./test-cases/{feature-slug}.md` following
the format defined in the skill.
```

Explicit output paths prevent the agent from dumping results into the conversation instead of creating files.

#### 6. Include Memory Instructions

Memory lets agents learn across sessions. Include a standard memory section:

```markdown
# Persistent Agent Memory

You have a persistent memory directory at
`/path/to/project/.claude/agent-memory/{agent-name}/`.

Guidelines:
- MEMORY.md is loaded into your system prompt (max 200 lines)
- Create topic files for detailed notes, link from MEMORY.md
- Save: stable patterns, user preferences, recurring solutions
- Don't save: session-specific context, speculative conclusions
```

## Step 3: Create the Skill File

Create the skill directory and file at `.claude/skills/{skill-name}/SKILL.md`.

### Skill Structure

Every skill follows this pattern:

```yaml
---
name: skill-name
description: When to use this skill. Trigger keywords.
---

# Skill Name

[1-2 sentence description of what the skill does]

## Workflow

### Phase 1: [Verb] (e.g., Research, Analyze, Gather)
[Detailed steps for the first phase]
[Data sources, inputs, what to look for]

### Phase 2: [Verb] (e.g., Structure, Design, Evaluate)
[How to process the Phase 1 inputs]
[Decision criteria, frameworks, patterns]

### Phase 3: Output
[Exact output format, file structure, naming]

## Output Format
[Detailed specification with examples]

## Constraints
[Hard rules and limitations]
```

### Skill Design Principles

#### 1. Three-Phase Workflow

The three-phase pattern (Gather, Process, Output) is battle-tested. It works because:
- **Phase 1** ensures the agent has all the information before making decisions
- **Phase 2** applies structure and judgment to raw inputs
- **Phase 3** produces consistent, predictable output

#### 2. Exhaustive Output Specification

Define every field, every format, every constraint. The more specific your output format, the more consistent the results.

**Good:**
```markdown
### Per-Test-Case Fields

| Field | Required | Format |
|-------|----------|--------|
| `id` | Yes | `TC-{NNN}` where NNN is zero-padded |
| `title` | Yes | Imperative verb + expected behavior |
| `priority` | Yes | `P0` (critical), `P1` (high), `P2` (medium), `P3` (low) |
```

**Less effective:**
```markdown
Each test case should have an ID, title, and priority.
```

#### 3. Include an Example

Always include a complete example of the expected output. This removes ambiguity better than any amount of specification text.

### Advanced Skill Features

#### String Substitutions

Skills support variable substitution for dynamic content:

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing the SKILL.md |

#### Dynamic Context Injection

The `` !`command` `` syntax runs shell commands before skill content is sent to Claude:

```yaml
---
name: pr-review
description: Review changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`

Review the PR above and provide feedback on code quality, security, and best practices.
```

#### Running Skills in a Subagent

Use `context: fork` to run a skill in an isolated subagent:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly and summarize findings.
```

## Step 4: Set Up Persistent Memory

Create the memory directory:

```
.claude/agent-memory/{agent-name}/
└── MEMORY.md
```

Initialize `MEMORY.md` with a minimal structure:

```markdown
# {Agent Name} - Agent Memory

## Preferences
<!-- User preferences learned across sessions -->

## Patterns
<!-- Recurring patterns, conventions, decisions -->

## Lessons
<!-- What worked, what didn't, debugging insights -->
```

The agent will populate this file as it works. Over time, it becomes a knowledge base that improves the agent's performance.

## Step 5: Configure Permissions

In `.claude/settings.local.json`, ensure the tools your agent needs are in the allowlist:

```json
{
  "permissions": {
    "allow": [
      "Bash",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "WebFetch",
      "WebSearch",
      "Agent",
      "Skill",
      "mcp__atlassian__*"
    ]
  }
}
```

If your agent uses MCP servers (like a Jira integration), add the MCP tool patterns here too.

## Step 6: Test Your Agent

Invoke your agent from Claude Code:

```
Use the qa-engineer agent to create test cases for the login feature.
```

Or, if your skill is set up as a slash command:

```
/test-case-creation Login feature with email and password authentication
```

### Debugging Tips

1. **Agent doesn't follow your instructions** --- Check the agent name. Names like `code-reviewer` or `test-writer` trigger built-in behaviors that override your custom prompt. Use neutral names like `qa-engineer` or `my-reviewer`
2. **Agent doesn't follow the skill** --- Check that the skill name in the agent's frontmatter matches the skill directory name exactly
3. **Agent can't use a tool** --- Check `settings.local.json` permissions and the `tools` field in frontmatter
4. **Memory isn't loading** --- Verify the memory path in the agent prompt matches the actual directory
5. **Output format is wrong** --- Add more examples to the skill's output format section. SKILL.md should stay under 500 lines; move detailed reference material to separate files
6. **Agent is too verbose** --- Add constraints like "Be concise" or "Skip explanations, produce output directly"
7. **Agent uses too many tokens** --- Restrict tools with `tools:` or `disallowedTools:` in frontmatter. Each unnecessary tool wastes context
8. **Custom agent not detected** --- Recreate via `/agents` command (known issue with manual file creation in some versions)

## The Complete Checklist

When creating a new agent + skill, verify:

- [ ] Agent file exists at `.claude/agents/{name}.md`
- [ ] Agent frontmatter has: `name`, `description`, `model`, `skills`
- [ ] Agent body has: role, task, input placeholder, skill reference, requirements, output, memory
- [ ] Skill directory exists at `.claude/skills/{skill-name}/`
- [ ] Skill file exists at `.claude/skills/{skill-name}/SKILL.md`
- [ ] Skill has: frontmatter (name, description), workflow phases, output format, constraints
- [ ] Memory directory exists at `.claude/agent-memory/{agent-name}/`
- [ ] Memory directory has `MEMORY.md` (can be minimal)
- [ ] Tool permissions are configured in `settings.local.json`
- [ ] Skill name in agent frontmatter matches skill directory name

## What's Next

In Part 3, we put everything together with a real-world example: a QA Engineer agent with two production-ready skills --- one for test case creation and one for user story point evaluation.
