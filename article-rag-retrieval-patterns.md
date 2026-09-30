# RAG Retrieval Patterns

Retrieval-augmented generation (RAG) supplies external evidence to a model before it answers. Retrieval quality, source access and answer grounding are separate problems; improving one does not automatically solve the others.

## Choose the retrieval stages

| Stage | Useful for | Failure to watch |
|---|---|---|
| Chunking | Searchable units with enough context | Splitting claims from qualifiers or source identity |
| Embeddings | Semantic matches and paraphrases | Missing exact identifiers or domain distinctions |
| Keyword search | Names, error codes and literal terms | Missing paraphrases |
| Hybrid search | Combining lexical and semantic evidence | Poor fusion or duplicate candidates |
| Reranking | Selecting stronger matches from candidates | Cannot recover evidence absent from the candidate pool |
| Query rewriting | Resolving vague questions and follow-ups | Changing the user’s intent |
| Metadata and access filtering | Current, authorized, relevant sources | Stale metadata or leaking across tenants |

Tune chunk size, candidate count and final context against your corpus. Fixed recipes such as “retrieve 100, return 5” are starting experiments, not universal optima.

## Enforce access before generation

Apply permissions from the authenticated principal at retrieval. Do not trust a model- or client-supplied tenant identifier. Preserve dates, versions and source locations. When no authorized evidence exists, abstain or ask for clarification rather than filling the gap from memory.

## Evaluate retrieval and answers separately

Measure whether needed evidence was retrieved, whether the answer follows it and whether citations support the claim. Include unanswerable questions, stale documents, conflicting versions and exact-match queries.

A [2026 agentic-RAG survey](https://arxiv.org/abs/2603.07379) highlights trajectory and reliability problems in iterative retrieval. Start with a simple pipeline; add [agentic RAG](article-advanced-agentic-rag.html) only when failures justify extra steps.

Use the [RAG research references](codex-loops.html#ref-RAG-1) and [evals guide](evals.html) to design the comparison.
