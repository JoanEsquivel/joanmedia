---
title: "You Can't assertEqual an LLM: DeepEval and How LLM-as-Judge Testing Actually Works"
description: "Why assertEqual fails for LLM outputs, and how DeepEval replaces exact assertions with thresholded LLM-as-judge metric scores you can actually trust."
pubDate: 2026-07-15
heroImage: "https://images.unsplash.com/photo-1767972463877-b64ba4283cd0?w=750&h=422&fit=crop"
category: "qa"
tags:
  - DeepEval
  - LLM Evaluation
  - LLM-as-Judge
  - Pytest
badge: "New"
series: "DeepEval for QA Engineers"
seriesOrder: 1
---

## Table of Contents

1. [Where DeepEval fits](#where-deepeval-fits)
2. [LLM-as-judge, from scratch](#llm-as-judge-from-scratch)
3. [Setting up](#setting-up)
4. [Your first real test](#your-first-real-test)

---

*Written against DeepEval v4.1.0 (July 2026).*

You have spent years building test suites where `assert response == expected` is the ground truth. Then your team ships a chatbot, and your first instinct produces this:

```python
def test_refund_question():
    answer = support_bot("What if these shoes don't fit?")
    assert answer == "We offer a 30-day full refund at no extra cost."
```

It fails. Not because the bot is wrong — it answered "You have 30 days to get a full refund at no extra cost," which any human would accept. Run it again and you get a third phrasing. The output is non-deterministic, the space of correct answers is unbounded, and string equality is useless. Substring checks and regexes are barely better: they can't tell you whether the answer was *grounded in your documentation* or confidently invented.

This is the problem LLM evaluation frameworks exist to solve, and DeepEval is the one built to feel like the tool you already know: pytest.

## Where DeepEval fits

[DeepEval](https://deepeval.com/docs/getting-started) is an open-source LLM evaluation framework by Confident AI. The [GitHub repo](https://github.com/confident-ai/deepeval) describes it as working "like pytest but specialized for testing LLM applications" — Apache-2.0 licensed, roughly 16.8k stars, 57 releases, with the latest version [v4.1.0 released July 12, 2026](https://pypi.org/project/deepeval/). It is actively developed: v4.0 landed in May 2026 with an agent-focused eval harness and trace inspection TUI, per the [2026 changelog](https://deepeval.com/changelog/changelog-2026).

The core idea: instead of asserting exact strings, you assert that a **metric score** — computed by a model judging your model — clears a **threshold**. Every DeepEval metric outputs a score between 0 and 1 plus a written reason, and a test passes when the score meets the metric's threshold (default 0.5, per the [metrics introduction](https://deepeval.com/docs/metrics-introduction)). Your test suite stops asking "is the output byte-identical?" and starts asking "is the output relevant, grounded, and correct enough, per an explicit rubric?"

That mental shift — from binary assertions to thresholded scores — is the single biggest adjustment for a QA engineer, and everything else in this series builds on it.

## LLM-as-judge, from scratch

If you're new to evals, "we test the AI with another AI" sounds circular. It works because *evaluating* an answer is an easier task than *producing* one, and because DeepEval never asks the judge for a vague vibe check. It decomposes evaluation into narrow, verifiable sub-questions. Three mechanisms cover most of what you'll use:

**1. Claim/statement decomposition (QAG).** For metrics like Answer Relevancy and Faithfulness, the judge model first *extracts discrete statements or claims* from the output, then classifies each one individually. [Answer Relevancy](https://deepeval.com/docs/metrics-answer-relevancy) is literally:

```
score = relevant statements / total statements
```

and [Faithfulness](https://deepeval.com/docs/metrics-faithfulness) is:

```
score = claims consistent with retrieved context / total claims
```

The judge never emits a holistic "8/10" for these — it answers many small yes/no questions, and arithmetic produces the score. This is why the scores are explainable: DeepEval returns *which* statements failed and why.

**2. G-Eval (criteria-driven judging).** For fuzzy qualities — correctness, tone, completeness — DeepEval implements [G-Eval](https://deepeval.com/docs/metrics-llm-evals), a research-backed technique where you describe evaluation criteria in plain language, the judge expands them into chain-of-thought evaluation steps, and then scores the output. One implementation detail worth knowing: when the judge model exposes token log-probabilities, DeepEval computes a probability-weighted sum over the candidate score tokens instead of taking a single integer, producing a smoother continuous score, then normalizes to 0-1. We'll go deep on G-Eval in Part 3.

**3. DAG (deterministic decision trees).** When judge subjectivity is unacceptable, the [DAG metric](https://deepeval.com/docs/metrics-dag) restricts the LLM to making *branching decisions* in a decision tree you define, where leaf nodes carry hard-coded scores. The LLM classifies; your tree scores.

### Can you trust the judge?

Partially — and knowing the failure modes is part of the job. Judge scores are non-deterministic (same input can score 0.78 then 0.82), weaker judge models produce noisier scores (an issue the [official FAQ](https://deepeval.com/docs/faq) acknowledges), and an independent [2026 practitioner review](https://aitestingguide.com/deepeval-review/) notes that G-Eval "occasionally underscores perfect responses" and recommends periodic human auditing of scores. Treat scores as strong signals, not certainties. Part 4 covers the concrete mitigations (locked evaluation steps, strict mode, DAG, repeat runs).

## Setting up

### Requirements

- **Python >=3.9, <4.0** ([PyPI](https://pypi.org/project/deepeval/)) — though as a matter of hygiene, use a currently supported Python (3.11+) in new projects.
- **A judge model.** Either an API key for a hosted model (OpenAI is the default) or a local model via Ollama. This is the "not zero-dependency" part: DeepEval itself is free, but LLM-as-judge metrics need an LLM.

```bash
pip install -U deepeval        # or: uv add deepeval
```

### Judge model options

**Default — OpenAI.** Set `OPENAI_API_KEY` in your environment; DeepEval loads `.env` / `.env.local` files automatically (`.env.local` wins). Metrics accept a `model` argument to pick a specific judge:

```python
from deepeval.metrics import AnswerRelevancyMetric
metric = AnswerRelevancyMetric(threshold=0.7, model="gpt-4.1")
```

**Fully local — Ollama.** For privacy-sensitive work or zero API cost, point DeepEval at a local model ([Ollama integration docs](https://deepeval.com/integrations/models/ollama)):

```bash
deepeval set-ollama --model=llama3.1:8b      # deepeval unset-ollama to revert
```

or in code:

```python
from deepeval.models import OllamaModel

judge = OllamaModel(model="llama3.1:8b", base_url="http://localhost:11434", temperature=0)
metric = AnswerRelevancyMetric(model=judge)
```

Caveat: small local judges are noticeably noisier and worse at instruction-following than frontier models. A local 8B judge is fine for smoke tests and development loops; be skeptical of it as your merge gate.

**Other providers.** Azure OpenAI, Anthropic, and Gemini are supported via similar `deepeval set-*` commands or model classes, and you can wrap anything by subclassing DeepEval's base model class.

### Confident AI cloud vs fully local

DeepEval runs 100% locally with no account. Optionally, `deepeval login` (or a `CONFIDENT_API_KEY` in CI) connects it to Confident AI's cloud platform for shareable reports, dataset versioning, and score trends over time. The open-source framework is free; cloud tiers are paid (a third-party review reports a $19/month Starter tier — verify current pricing) and that same review concludes small teams "need only the free open-source version" for CI use.

Two hygiene notes for the fully-local crowd:

- DeepEval collects anonymous usage telemetry via PostHog. Opt out with `DEEPEVAL_TELEMETRY_OPT_OUT="YES"` — set it *before* the first `deepeval` import or it has no effect ([data privacy docs](https://deepeval.com/docs/data-privacy)).
- Pin your version. The project moves fast (seven releases between May and July 2026), and there have been rough edges — including a [reported issue](https://github.com/confident-ai/deepeval/issues/2497) where a 2025 release's tracing instrumentation interfered with host applications' OpenTelemetry setup. Fast iteration cuts both ways.

## Your first real test

```python
# test_smoke.py
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

def test_refund_answer_is_relevant():
    test_case = LLMTestCase(
        input="What if these shoes don't fit?",
        actual_output="You have 30 days to get a full refund at no extra cost.",
    )
    assert_test(test_case, [AnswerRelevancyMetric(threshold=0.7)])
```

Run it with DeepEval's pytest wrapper:

```bash
deepeval test run test_smoke.py
```

You get a familiar pytest-style pass/fail — plus a score and a natural-language reason for it. The paraphrased answer that broke `assertEqual` now passes, because the judge evaluates *meaning*, not bytes.

Notice what's still hardcoded here: `actual_output`. In a real project that string comes from calling your actual LLM application at test time, against a versioned dataset of inputs. That — project structure, test case anatomy, datasets, and what DeepEval actually needs from your application — is Part 2.

---

**Key takeaways:** LLM outputs break equality-based testing; DeepEval replaces assertions with thresholded 0-1 metric scores computed by an LLM judge; the judge is made trustworthy through decomposition (statement extraction, G-Eval steps, DAG trees), not blind trust; you can run everything locally (Ollama judge, telemetry off) or attach Confident AI's cloud for reporting. As of v4.1.0, Python >=3.9 and one judge model are all you need.
