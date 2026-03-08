---
title: "Building an Agent with Playwright CLI"
description: "Learn three approaches to give your Claude Code agent browser automation: custom CLI skills, community skills, and Playwright test agents."
pubDate: 2026-03-12
heroImage: "https://images.unsplash.com/photo-1675495666895-9091741bfd78?w=750&h=422&fit=crop"
category: "qa"
tags:
  - Playwright
  - Browser Automation
  - Claude Code
  - Test Agents
badge: "New"
series: "Playwright CLI"
seriesOrder: 3
---

## Table of Contents

1. [Context: Three Integration Approaches](#context-three-integration-approaches)
2. [Approach 1: Playwright CLI with a Custom Skill](#approach-1-playwright-cli-with-a-custom-skill)
3. [Approach 2: Using Community Skills](#approach-2-using-community-skills)
4. [Approach 3: Playwright Test Agents](#approach-3-playwright-test-agents)
5. [CI/CD Integration](#cicd-integration)
6. [Tradeoffs and Limitations](#tradeoffs-and-limitations)
7. [Conclusion](#conclusion)

---

You have a Claude Code agent that writes code, runs tests, and manages your repository. Now you want it to open a browser, navigate your application, validate that the UI works, and generate test files --- all without burning through your token budget. Here is how to set it up.

## Context: Three Integration Approaches

There are three ways to give a Claude Code agent browser automation capabilities using Playwright:

1. **Playwright CLI as a skill** --- Install `@playwright/cli` and create a SKILL.md that teaches the agent how to use it
2. **Community-built skills** --- Use pre-built skills like lackeyjb/playwright-skill or testdino-hq/playwright-skill
3. **Playwright test agents** --- Use Playwright's built-in Planner, Generator, and Healer subagents

Each approach serves different use cases. This post covers all three.

## Approach 1: Playwright CLI with a Custom Skill

### Installation

Install the CLI globally:

```bash
npm install -g @playwright/cli@latest
```

Verify the installation:

```bash
playwright-cli --help
```

If you need a specific browser:

```bash
playwright-cli install-browser --browser=chromium
playwright-cli install-browser --browser=firefox
```

### Configuration

Create a `playwright-cli.json` in your project root:

```json
{
  "browser": {
    "browserName": "chromium",
    "launchOptions": {
      "headless": true
    }
  },
  "network": {
    "allowedOrigins": ["https://your-app.com", "http://localhost:*"]
  },
  "timeouts": {
    "action": 5000,
    "navigation": 30000
  },
  "outputDir": "./test-output"
}
```

For local development with a visible browser, set `headless: false`. For CI/CD, keep it `true`.

### Creating the Skill

Create the skill directory:

```bash
mkdir -p .claude/skills/playwright-cli
```

Create `.claude/skills/playwright-cli/SKILL.md`:

```markdown
---
name: playwright-cli
description: Browser automation using Playwright CLI. Use this skill when the user asks to test a web page, validate UI behavior, take screenshots, fill forms, or generate Playwright tests from browser sessions.
---

# Playwright CLI Skill

You have access to browser automation through the `playwright-cli` command. Use it to interact with web pages, validate UI behavior, and generate test code.

## Core Workflow

1. Open a browser session: `playwright-cli open <url> --headed`
2. Take a snapshot to see elements: `playwright-cli snapshot`
3. Read the snapshot file to find element references (e.g., e15, e20)
4. Interact using element refs: `playwright-cli click e15`
5. Take screenshots for visual validation: `playwright-cli screenshot`
6. Close when done: `playwright-cli close`

## Key Commands

### Navigation
- `playwright-cli open <url>` --- Open URL in new browser
- `playwright-cli goto <url>` --- Navigate current page
- `playwright-cli go-back` / `playwright-cli go-forward`
- `playwright-cli reload`

### Interaction
- `playwright-cli click <ref>` --- Click element
- `playwright-cli fill <ref> "<text>"` --- Fill input field
- `playwright-cli type <ref> "<text>"` --- Type character by character
- `playwright-cli press <key>` --- Press keyboard key
- `playwright-cli check <ref>` / `playwright-cli uncheck <ref>`
- `playwright-cli select <ref> "<value>"`
- `playwright-cli hover <ref>`
- `playwright-cli upload <ref> <filepath>`

### Observation
- `playwright-cli snapshot` --- Save page structure as YAML
- `playwright-cli screenshot` --- Save screenshot as PNG
- `playwright-cli console` --- View console messages
- `playwright-cli network` --- View network requests
- `playwright-cli pdf` --- Generate PDF of page

### Session Management
- `playwright-cli -s=<name> open <url>` --- Named session
- `playwright-cli list` --- List active sessions
- `playwright-cli state-save <file>` --- Save auth state
- `playwright-cli state-load <file>` --- Restore auth state

### Debugging
- `playwright-cli tracing-start` / `playwright-cli tracing-stop`
- `playwright-cli video-start` / `playwright-cli video-stop`

## Important Guidelines

- Always run `playwright-cli snapshot` after navigation or significant page changes to get updated element references
- Read the snapshot YAML file to find the correct element reference before interacting
- Use `--headed` during development so the user can see the browser
- Use headless mode (default) for CI/CD and automated testing
- Save authentication state with `state-save` for reuse across sessions
- Screenshots are saved to `.playwright-cli/` by default
- When generating tests, walk through the user flow first, then use the recorded session to produce test code
```

### Agent Configuration (CLAUDE.md)

Add browser automation instructions to your project's `CLAUDE.md`:

```markdown
## Browser Automation

This project uses Playwright CLI for browser automation. When asked to:
- Test a page or UI flow: use the playwright-cli skill
- Validate visual appearance: take screenshots with playwright-cli
- Generate E2E tests: walk through the flow with playwright-cli, then generate a test file
- Debug a frontend issue: open the page with --headed and inspect

The dev server runs on http://localhost:3000. Start it with `npm run dev` before opening the browser.

Always close browser sessions when done to free resources.
```

### Example Session

Here is what a typical agent interaction looks like:

```
User: "Test the login flow on our app"

Agent actions:
1. npm run dev                                          # Start dev server
2. playwright-cli open http://localhost:3000 --headed   # Open browser
3. playwright-cli snapshot                              # See page structure
4. [reads YAML: e12=input "Email", e15=input "Password", e18=button "Sign In"]
5. playwright-cli fill e12 "test@example.com"           # Fill email
6. playwright-cli fill e15 "password123"                # Fill password
7. playwright-cli click e18                             # Click sign in
8. playwright-cli snapshot                              # See result
9. [reads YAML: confirms dashboard loaded]
10. playwright-cli screenshot                           # Visual evidence
11. playwright-cli close                                # Clean up
```

Total token cost: approximately 500 tokens of commands + one snapshot read (~800 tokens). Compare to MCP's approximately 8,000+ tokens for the same flow.

## Approach 2: Using Community Skills

### lackeyjb/playwright-skill (1.9k stars)

This is the most popular community skill. It takes a different approach --- instead of wrapping the CLI, it has Claude write and execute Playwright scripts directly through a custom executor.

**Installation:**

```bash
# Global installation
git clone https://github.com/lackeyjb/playwright-skill.git /tmp/pw-skill
mkdir -p ~/.claude/skills
cp -r /tmp/pw-skill/skills/playwright-skill ~/.claude/skills/
cd ~/.claude/skills/playwright-skill
npm run setup
rm -rf /tmp/pw-skill
```

Or project-specific:

```bash
mkdir -p .claude/skills
cp -r /tmp/pw-skill/skills/playwright-skill .claude/skills/
cd .claude/skills/playwright-skill
npm run setup
```

**How it works:**
- Claude receives a browser automation request
- Claude writes custom Playwright JavaScript/TypeScript code
- The skill's `run.js` executor runs the code with proper module resolution
- Browser launches visibly (headless: false, slowMo: 100ms by default)
- Results return as screenshots and console output

**Key differences from CLI approach:**
- Model-invoked (Claude decides when to use it)
- Writes full Playwright scripts rather than issuing individual CLI commands
- Includes an API_REFERENCE.md that loads only when needed (progressive disclosure)
- 314 lines of instructions vs. a persistent server

### testdino-hq/playwright-skill

This skill focuses on teaching the agent to write production-quality tests. It contains 70+ guides organized into 5 skill packs covering locators, assertions, page object models, fixtures, and CI/CD configuration.

**Installation:**

```bash
npx skills add testdino-hq/playwright-skill --skill playwright-cli
```

**Best for:** Teams that want their agent to generate tests following specific patterns and best practices, rather than ad-hoc automation.

## Approach 3: Playwright Test Agents

Playwright v1.56 (October 2025) introduced three specialized subagents that integrate directly with Claude Code. These are not replacements for CLI or MCP --- they are higher-level orchestrators that use Playwright underneath.

### Setup

```bash
npx playwright init-agents --loop=claude
```

This creates agent definition files in your project. Regenerate whenever you update Playwright to get access to new tools and instructions.

### The Three Agents

**Planner Agent** explores your application and produces Markdown test plans:

```
Input: "Generate a plan for guest checkout flow"
Output: specs/guest-checkout.md (detailed test scenarios with steps, data, and assertions)
```

The Planner navigates your live application through a real browser, identifies user paths and edge cases, and produces structured plans that both humans and the Generator agent can read.

**Generator Agent** transforms plans into executable tests:

```
Input: specs/guest-checkout.md
Output: tests/checkout/guest-checkout.spec.ts
```

The Generator does not just translate Markdown to code. It actively interacts with your application to verify that selectors work and assertions are valid. It applies best practices --- semantic locators, proper wait strategies, readable test names.

**Healer Agent** fixes failing tests:

```
Input: A failing test file
Process: Replays steps, inspects current UI, patches locators/waits
Output: Updated test file that passes
```

The Healer handles real-world maintenance --- when a button's text changes, a loading spinner gets added, or a layout shifts. It re-runs the test until it passes, or marks it as skipped if the underlying functionality is genuinely broken.

### Project Structure with Agents

```
your-project/
  .github/                    # Agent definitions (Markdown files)
  specs/                      # Human-readable test plans (Planner output)
    guest-checkout.md
    user-registration.md
  tests/                      # Generated Playwright tests
    seed.spec.ts              # Bootstrap test with environment setup
    checkout/
      guest-checkout.spec.ts  # Generator output
    auth/
      registration.spec.ts
  playwright.config.ts
```

### Using Agents in Practice

The workflow is sequential:

```
1. "Plan tests for the checkout flow"
   -> Planner explores the app, writes specs/checkout.md

2. "Generate tests from the checkout plan"
   -> Generator reads specs/checkout.md, writes tests/checkout/

3. [Tests fail because a button changed]
   "Heal the failing checkout tests"
   -> Healer debugs, patches, re-runs until green
```

### Customization

Agent definitions are Markdown files, making them easy to modify:

- Adjust the Planner's exploration strategy with sample user stories
- Configure the Generator's code style to match your naming conventions
- Tune the Healer's fix strategies based on common failure patterns in your app

## CI/CD Integration

### Headless Mode for Pipelines

For CI/CD, run CLI in headless mode (the default):

```bash
# In your CI script
playwright-cli open https://staging.your-app.com
playwright-cli snapshot
playwright-cli screenshot
playwright-cli close
```

Or use the configuration file:

```json
{
  "browser": {
    "launchOptions": { "headless": true }
  }
}
```

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm install -g @playwright/cli@latest
      - run: npx playwright install --with-deps chromium
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-output/
```

### Combining Approaches

The most effective CI/CD setup combines Playwright test agents for test generation and maintenance with CLI for token-efficient execution:

1. Developers use Planner/Generator agents during development to create tests
2. Healer agent runs post-merge to fix tests broken by UI changes
3. Standard `npx playwright test` runs the generated tests in CI
4. CLI is used by agents during code review to validate UI changes

## Tradeoffs and Limitations

### Security Considerations

When using Playwright CLI or skills with Claude Code, be aware that:
- Console output and page content may reach Anthropic's servers during the agent session
- Screenshots remain local (saved to disk)
- Target development environments with dummy data, not production systems with sensitive information

### Complexity Limits

Community feedback (from Hacker News discussions) identifies scenarios where AI-driven browser automation struggles:
- OAuth and complex authentication flows
- Long action chains requiring deep context
- Edge cases like date pickers, drag-and-drop, and complex file uploads
- These limitations apply to both CLI and MCP approaches

### Learning Curve

LLMs may not be trained on Playwright CLI commands since the tool launched in early 2026. The skill definition is essential --- without it, agents may hallucinate commands or use incorrect arguments. This is why community skills exist: they bridge the gap between the model's training data and the tool's actual API.

## Conclusion

Building a Claude Code agent with Playwright CLI is straightforward:

1. Install `@playwright/cli` globally
2. Create a SKILL.md that teaches the agent the command set
3. Add browser automation guidelines to your CLAUDE.md
4. Use headless mode for CI/CD, headed mode for development

For teams that want pre-built solutions, lackeyjb/playwright-skill provides a battle-tested skill with 1.9k GitHub stars. For teams focused on comprehensive test generation, Playwright's built-in test agents (Planner, Generator, Healer) offer a higher-level workflow that handles the full lifecycle from planning through maintenance.

The key insight across all three approaches: browser automation for AI agents works best when it operates through the tools the agent already knows --- shell commands, file reads, and Markdown instructions --- rather than through a separate protocol layer.
