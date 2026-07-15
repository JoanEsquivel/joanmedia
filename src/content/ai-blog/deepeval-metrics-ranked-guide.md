---
title: "The DeepEval Metrics That Matter: A Ranked Guide for QA Practitioners"
description: "A ranked guide to DeepEval metrics for QA: the RAG quartet, a custom G-Eval slot, situational picks, and how to read and calibrate judge scores."
pubDate: 2026-07-15
heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=750&h=422&fit=crop"
category: "qa"
tags:
  - DeepEval
  - LLM Evaluation
  - Evaluation Metrics
  - RAG
  - G-Eval
badge: "New"
series: "DeepEval for QA Engineers"
seriesOrder: 3
---

## Table of Contents

1. [Tier 1 — the RAG quartet: your first four slots](#tier-1--the-rag-quartet-your-first-four-slots)
2. [Tier 2 — one custom G-Eval metric: the slot that earns its keep](#tier-2--one-custom-g-eval-metric-the-slot-that-earns-its-keep)
3. [Tier 3 — situational picks for your remaining slot](#tier-3--situational-picks-for-your-remaining-slot)
4. [Reading the scores: thresholds and interpretation](#reading-the-scores-thresholds-and-interpretation)

---

*Written against DeepEval v4.1.0 (July 2026). Part 2 built the project structure these metrics plug into.*

DeepEval ships a lot of metrics — the [docs](https://deepeval.com/docs/metrics-introduction) say 50+ across seven categories (the GitHub README says 20+, the marketing blog says 60+; the honest answer is "more than you should use"). The official guidance is blunt and worth quoting: use **no more than 5 metrics** — "2-3 generic, system-specific metrics" plus "1-2 custom, use case-specific metrics." Capping the list forces you to decide what you actually care about.

So this is not a catalog. It's a ranked view: which metrics earn a slot in a QA practitioner's five, how each score is actually computed, and how to read the numbers.

First, the shared mechanics ([metrics introduction](https://deepeval.com/docs/metrics-introduction)):

- Every metric returns a **score from 0 to 1** and (by default) a written **reason**.
- A metric **passes when score >= threshold**; the default threshold is **0.5**. One important exception below.
- Common knobs: `threshold`, `model` (the judge), `include_reason`, `strict_mode` (binary 0-or-1 scoring), `async_mode`, `verbose_mode`.

## Tier 1 — the RAG quartet: your first four slots

If your app retrieves anything before answering (most production LLM apps do), these four metrics split the system cleanly into *generator problems* vs *retriever problems*. That decomposition is what makes eval results actionable rather than just a number.

### 1. Faithfulness — "did the answer stick to the sources?"

The highest-value metric in the framework for RAG. [Computation](https://deepeval.com/docs/metrics-faithfulness): the judge extracts every factual claim from `actual_output`, then checks each against `retrieval_context`:

```
faithfulness = claims that don't contradict the retrieval context / total claims
```

Requires `input`, `actual_output`, `retrieval_context`. A low score means your *generator* is inventing or distorting — the retrieval was whatever it was; the model failed to stay inside it. This is the closest thing to an automated "hallucination detector" for RAG, and the one metric I'd keep if forced to keep one.

```python
from deepeval.metrics import FaithfulnessMetric
faithfulness = FaithfulnessMetric(threshold=0.8, model="gpt-4.1", include_reason=True)
```

### 2. Answer Relevancy — "did it answer the question?"

[Computation](https://deepeval.com/docs/metrics-answer-relevancy): the judge extracts statements from `actual_output` and classifies each as relevant to `input` or not:

```
answer_relevancy = relevant statements / total statements
```

Requires only `input` and `actual_output`. Two caveats from the docs worth internalizing: a high score means statements *address* the input, "not that they're factually correct" — always pair it with Faithfulness — and because it ignores `retrieval_context`, a low score is a generator problem. Also note verbosity is punished: preambles, hedging, and tangents dilute the relevant-statement ratio. That can be a feature (it penalizes waffle) or noise (if your product wants friendly preambles, account for that in thresholds).

### 3. Contextual Precision — "did the retriever rank the right chunks on top?"

The first *retriever* metric, and the subtlest. [Computation](https://deepeval.com/docs/metrics-contextual-precision): weighted cumulative precision over the ranked `retrieval_context` — relevant nodes near the top of the ranking score much higher than the same nodes buried lower. The rationale from the docs: LLMs attend more to earlier context, so bad ranking causes downstream hallucination even when the right chunk is technically present.

It requires `expected_output` in addition to `input`, `actual_output`, `retrieval_context` — relevance of each chunk is judged against the *ideal* answer, not whatever your generator happened to say, which keeps the retriever evaluation independent of generator quality.

### 4. Contextual Recall — "did the retriever fetch everything needed?"

[Computation](https://deepeval.com/docs/metrics-contextual-recall): the judge takes each statement in `expected_output` and asks whether it can be attributed to something in `retrieval_context`:

```
contextual_recall = attributable statements / total statements in expected_output
```

Low recall means the answer *couldn't* have been complete — fix top-K, chunk size, or embeddings, not the prompt. Together, precision + recall + faithfulness + relevancy give you a fault-isolation matrix:

| Symptom | Likely culprit |
|---|---|
| Low faithfulness, high contextual recall | Generator inventing despite good retrieval |
| Low contextual recall | Retriever missing information |
| High contextual recall, low contextual precision | Right chunks retrieved, ranked badly (re-ranker) |
| Low answer relevancy, everything else high | Prompt/instruction problem — model rambles |

## Tier 2 — one custom G-Eval metric: the slot that earns its keep

The RAG quartet checks *mechanics*. It cannot check "is this answer correct for *our* policies" or "does it follow our tone rules." That's [G-Eval](https://deepeval.com/docs/metrics-llm-evals), DeepEval's build-your-own judge, and in practice a G-Eval "Correctness" metric is the most-used metric in the framework.

```python
from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams

correctness = GEval(
    name="Correctness",
    evaluation_steps=[
        "Check whether facts in 'actual output' contradict any facts in 'expected output'.",
        "Heavily penalize omission of critical details (refund window, costs, deadlines).",
        "Vague or hedged answers where the expected output is specific should lower the score.",
    ],
    evaluation_params=[SingleTurnParams.ACTUAL_OUTPUT, SingleTurnParams.EXPECTED_OUTPUT],
    threshold=0.6,
)
```

How the score is produced, per the docs and the [G-Eval guide](https://www.confident-ai.com/blog/g-eval-the-definitive-guide): (1) if you gave `criteria` instead of `evaluation_steps`, the judge first generates chain-of-thought steps from it; (2) steps plus your chosen `evaluation_params` are assembled into a judging prompt; (3) the judge emits an integer score; (4) when the model exposes token log-probabilities, DeepEval takes a probability-weighted sum over candidate score tokens — turning a coarse integer into a continuous value; (5) the result is normalized to 0-1.

Three practices the docs themselves push:

- **Lock your steps.** `criteria` regenerates evaluation steps each run, adding variance. The recommended workflow: prototype with `criteria`, inspect the generated steps, then hard-code them as `evaluation_steps`.
- **Only pass `evaluation_params` your steps actually reference** — unused params degrade accuracy.
- **Use `Rubric` score bands** when scores cluster: rubric objects pin score ranges to described outcomes ("0-2: factually incorrect", "9-10: fully correct and complete").

And the honest caveat, straight from the docs: **G-Eval is not deterministic.** If you need reproducible scoring for objective criteria, the [DAG metric](https://deepeval.com/docs/metrics-dag) is the escalation path — you define a decision tree where leaf nodes carry hard-coded scores and the LLM only makes classification decisions at branches ("more deterministic than G-Eval" is its whole pitch). Reach for it when your criteria decompose into checkable steps: format compliance first, then content, then tone.

## Tier 3 — situational picks for your remaining slot

- **Hallucination** ([docs](https://deepeval.com/docs/metrics-hallucination)) — for when you have curated ground-truth `context` (not live retrieval). Computed as `contradicted contexts / total contexts` and — the exception mentioned earlier — **lower is better**: 0 is perfect and the threshold is a *maximum*. Misreading this inversion is a classic first-week mistake. Use Faithfulness for RAG, Hallucination when you maintain reference material in your dataset.
- **Tool Correctness / Task Completion** — if you're testing agents, these judge `tools_called` against `expected_tools` and whether the task actually got done. Tool-use failures are among the most common agent defects, so for agent work these jump straight into Tier 1.
- **Summarization, JSON Correctness, safety metrics (Bias, Toxicity, PII Leakage)** — take them when your product's risk profile demands, but they consume a metric slot; don't add them "because they exist."

A sensible default five for a support RAG bot: Faithfulness (0.8), Answer Relevancy (0.7), Contextual Precision (0.7), Contextual Recall (0.7), G-Eval Correctness (0.6).

## Reading the scores: thresholds and interpretation

- **Don't ship the 0.5 defaults.** Thresholds are product decisions. Run your suite against a known-good build, look at the score distribution, and set thresholds just below the healthy band — that's a regression detector. Setting Faithfulness to 0.99 because "we hate hallucinations" just makes the suite red forever.
- **Scores are ratios of judged sub-decisions**, not confidence percentages. Faithfulness 0.75 means roughly one claim in four wasn't supported — go read *which* claim in the metric's `reason`, don't just tune the threshold.
- **`strict_mode=True`** collapses any metric to binary pass/fail — useful for invariants ("never contradicts context at all"), noisy for everything else.
- **Expect variance.** The same test case can score 0.78 and 0.82 on consecutive runs. What to do about that in CI — repeats, caching, gating strategy — is exactly Part 4.
