---
title: "Anatomy of a Real DeepEval Project: Test Cases, Goldens, and What Your LLM App Must Expose"
description: "Structure a real DeepEval project: LLMTestCase anatomy, goldens vs test cases, versioned datasets, and the contract your LLM app must expose for evaluation."
pubDate: 2026-07-15
heroImage: "https://images.unsplash.com/photo-1754548930550-be9fa88874f4?w=750&h=422&fit=crop"
category: "qa"
tags:
  - DeepEval
  - LLM Evaluation
  - RAG
  - Pytest
badge: "New"
series: "DeepEval for QA Engineers"
seriesOrder: 2
---

## Table of Contents

1. [The contract: what DeepEval needs from your application](#the-contract-what-deepeval-needs-from-your-application)
2. [Repository structure](#repository-structure)
3. [LLMTestCase: all nine fields and what they're actually for](#llmtestcase-all-nine-fields-and-what-theyre-actually-for)
4. [Goldens and datasets: separating "what to ask" from "what happened"](#goldens-and-datasets-separating-what-to-ask-from-what-happened)
5. [The test suite](#the-test-suite)
6. [Practices that only show up in real projects](#practices-that-only-show-up-in-real-projects)

---

*Written against DeepEval v4.1.0 (July 2026). Part 1 covered LLM-as-judge fundamentals and setup.*

Every DeepEval tutorial shows the same ten lines: a hardcoded `LLMTestCase`, one metric, `assert_test`. Useful for a demo; useless as a repo. A real evaluation project has a versioned dataset, a boundary between "the app under test" and "the tests," judge configuration that differs between laptop and CI, and test cases whose outputs are generated *at run time* by the actual application.

This post builds that project. The example app is the classic case: a customer-support RAG bot that retrieves policy documents and answers user questions.

## The contract: what DeepEval needs from your application

This is the part most tutorials skip. DeepEval cannot evaluate what your application does not expose. For a RAG app, your app-side interface must return not just the answer, but the retrieved context — otherwise the most important metrics (Faithfulness, Contextual Precision/Recall) are unusable.

Concretely, when a user asks the bot a question, your app internally does something like:

**Request to your LLM provider** (simplified):

```json
{
  "model": "gpt-4.1-mini",
  "messages": [
    {"role": "system", "content": "You are ShoeStore's support assistant. Answer ONLY from the provided context."},
    {"role": "user", "content": "Context:\n- All customers are eligible for a 30 day full refund at no extra cost.\n- Exchanges are processed within 5 business days.\n\nQuestion: What if these shoes don't fit?"}
  ]
}
```

**Response**:

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "If they don't fit, you can return them within 30 days for a full refund at no extra cost, or request an exchange, which we process within 5 business days."
    }
  }]
}
```

For evaluation you need a function that surfaces three things from that flow — the user input, the final answer, and the retrieved chunks *before* they were stuffed into the prompt:

```python
# src/support_bot/app.py
from pydantic import BaseModel

class BotResult(BaseModel):
    answer: str
    retrieved_chunks: list[str]

def answer_question(question: str) -> BotResult:
    chunks = retriever.search(question, top_k=3)         # your vector store
    answer = generate(question, chunks)                   # your LLM call
    return BotResult(answer=answer, retrieved_chunks=chunks)
```

If your application only returns the final string, refactor it to return this structure first. This is genuine QA work: making the system observable enough to test. (A pydantic model isn't required — but typed boundaries pay off the moment eval code and app code are maintained by different people.)

## Repository structure

A layout that has worked well in practice, using standard Python tooling — [uv](https://docs.astral.sh/uv/) (or pip) for dependencies, pytest as the runner, python-dotenv-style `.env` files (which DeepEval [loads automatically](https://deepeval.com/docs/getting-started)):

```
support-bot/
├── pyproject.toml            # deps: deepeval, pytest, pydantic; pin deepeval!
├── .env.local                # OPENAI_API_KEY=... (gitignored)
├── src/
│   └── support_bot/
│       ├── app.py            # answer_question() — the app under test
│       └── retriever.py
├── evals/
│   ├── datasets/
│   │   └── goldens.json      # versioned eval dataset (see below)
│   ├── metrics.py            # shared, centrally-tuned metric definitions
│   └── test_rag_quality.py   # the DeepEval test suite
└── .github/workflows/evals.yml   # Part 4
```

Three deliberate choices:

1. **Evals live apart from unit tests.** They cost money and minutes per run; you want `pytest tests/` fast and `deepeval test run evals/` deliberate.
2. **Metrics are defined once**, in `evals/metrics.py`, so thresholds are tuned in one place instead of drifting across files.
3. **Pin `deepeval` in `pyproject.toml`.** Seven releases shipped between May and July 2026; v4.0 included breaking API changes (e.g., `LLMTestCaseParams` became `SingleTurnParams` — old tutorials still show the former).

## LLMTestCase: all nine fields and what they're actually for

The [`LLMTestCase`](https://deepeval.com/docs/evaluation-test-cases) is the unit of evaluation for single-turn interactions. Only two of its nine parameters are mandatory:

| Field | Required | What it holds | Who produces it |
|---|---|---|---|
| `input` | yes | The user's message (not your prompt template) | dataset |
| `actual_output` | yes | What your app answered | **your app, at eval time** |
| `expected_output` | no | The ideal answer, incl. tone/phrasing | dataset (human-written) |
| `retrieval_context` | no | What your retriever *actually* returned | **your app, at eval time** |
| `context` | no | The ideal, ground-truth chunks for this input | dataset |
| `tools_called` | no | `ToolCall` objects your agent invoked | your app (agents) |
| `expected_tools` | no | `ToolCall` objects it *should* have invoked | dataset (agents) |
| `token_cost` | no | Cost logging | your app |
| `completion_time` | no | Latency logging | your app |

The pair everyone confuses: **`context` vs `retrieval_context`**. The docs put it precisely: "context is the ideal retrieval results for a given input and typically come from your evaluation dataset, whereas retrieval_context is your LLM application's actual retrieval results." `context` is what a perfect retriever *would* fetch (curated by you); `retrieval_context` is what yours *did* fetch (observed at runtime). Faithfulness judges the answer against `retrieval_context`; the Hallucination metric judges against `context`. Similarly, `expected_output` is the ideal *answer* (tone included), while `context` is strictly factual reference material.

A fully-populated test case for our bot:

```python
from deepeval.test_case import LLMTestCase

result = answer_question("What if these shoes don't fit?")

test_case = LLMTestCase(
    input="What if these shoes don't fit?",
    actual_output=result.answer,                      # generated now, never hardcoded
    retrieval_context=result.retrieved_chunks,        # observed now
    expected_output="You can return them within 30 days for a full refund at no extra cost.",
    context=["All customers are eligible for a 30 day full refund at no extra cost."],
)
```

## Goldens and datasets: separating "what to ask" from "what happened"

Hardcoding test cases couples your dataset to one run of the app. DeepEval's answer is the **Golden** — per the [datasets docs](https://deepeval.com/docs/evaluation-datasets), goldens are "pending test cases": they carry the stable parts (`input`, `expected_output`, `context`) and *lack* the dynamic parts (`actual_output`, `retrieval_context`), which your app fills in at evaluation time. An [`EvaluationDataset`](https://deepeval.com/docs/evaluation-datasets) is a collection of goldens.

`evals/datasets/goldens.json`:

```json
[
  {
    "input": "What if these shoes don't fit?",
    "expected_output": "You can return them within 30 days for a full refund at no extra cost.",
    "context": ["All customers are eligible for a 30 day full refund at no extra cost."]
  },
  {
    "input": "How long do exchanges take?",
    "expected_output": "Exchanges are processed within 5 business days.",
    "context": ["Exchanges are processed within 5 business days."]
  }
]
```

Load it and convert goldens to test cases by *running your app*:

```python
from deepeval.dataset import EvaluationDataset

dataset = EvaluationDataset()
dataset.add_goldens_from_json_file(file_path="evals/datasets/goldens.json")
# CSV works too (add_goldens_from_csv_file, with column-name mapping args),
# and dataset.pull(alias="...") fetches a versioned dataset from Confident AI.
```

## The test suite

Putting it together with pytest parametrization — one golden, one test, individually reported:

```python
# evals/test_rag_quality.py
import pytest
from deepeval import assert_test
from deepeval.dataset import EvaluationDataset
from deepeval.test_case import LLMTestCase
from support_bot.app import answer_question
from evals.metrics import answer_relevancy, faithfulness   # defined once, imported everywhere

dataset = EvaluationDataset()
dataset.add_goldens_from_json_file(file_path="evals/datasets/goldens.json")

@pytest.mark.parametrize("golden", dataset.goldens)
def test_support_bot(golden):
    result = answer_question(golden.input)
    test_case = LLMTestCase(
        input=golden.input,
        actual_output=result.answer,
        retrieval_context=result.retrieved_chunks,
        expected_output=golden.expected_output,
        context=golden.context,
    )
    assert_test(test_case, [answer_relevancy, faithfulness])
```

```bash
deepeval test run evals/test_rag_quality.py
```

For notebook-style bulk runs outside pytest, the same test cases work with `evaluate(test_cases=..., metrics=...)`; `assert_test` is the pytest-native path you'll use in CI.

Multi-turn note: conversations use `ConversationalTestCase` with `ConversationalGolden` (which starts from a `scenario` instead of an `input`), and multimodal cases embed `MLLMImage` objects — same architecture, different test case class. This series stays single-turn.

## Practices that only show up in real projects

- **Never store `actual_output` in the dataset.** The moment you do, you're testing last month's app. Goldens hold inputs and ideals; outputs are always fresh. (Corollary: eval runs must be able to reach your app or a faithful staging build.)
- **Write `expected_output` by hand, not by GPT.** If the same model family generates your ideal answers and judges against them, you've built a self-grading exam.
- **Start small.** 15-30 goldens covering your top intents plus known failure cases beats 500 scraped ones you never review.
- **Watch for stale imports.** If a tutorial shows `LLMTestCaseParams`, it predates v4.x — the current enum is `SingleTurnParams` ([getting started](https://deepeval.com/docs/getting-started)).

The suite above asserts two metrics without justifying them. Choosing metrics — which of DeepEval's 50+ actually matter for a QA practitioner, how each score is computed, and how to build custom ones — is Part 3.
