# Advanced and Agentic RAG

Add retrieval steps when a simpler search misses evidence you need. Repeated searches can help answer ambiguous questions or connect several sources. Each step also adds time, cost and another chance to carry bad evidence forward.

## Patterns and trade-offs

| Pattern | What changes | Where it helps | Main limitation |
|---|---|---|---|
| Contextual retrieval | Adds document context to indexed chunks | Chunks that lose meaning alone | Bad generated context can distort the index |
| Agentic RAG | Chooses and revises searches during the task | Multi-step questions | Search drift and unbounded loops |
| Corrective RAG | Checks retrieved material and changes the route | Weak initial evidence | The relevance checker can be wrong |
| Self-RAG | Uses trained retrieval and critique signals | Tasks matching the method’s setup | A prompting imitation is not the trained system |
| GraphRAG | Builds relationships or summaries over a corpus | Broad relationship and corpus-level questions | Construction cost, stale graphs and unsupported links |

These are research and implementation families, not drop-in guarantees. Graph approaches need not outperform simpler retrieval on narrow factual questions.

## Control the search loop

Keep the original question and authorized sources explicit. Cap searches, model calls and spend. Stop when sufficient evidence exists or return an evidence gap. Treat retrieved instructions as untrusted content.

Separate relevance, permission and factual support. A relevant passage may be inaccessible to the user or may not justify the generated answer.

## Evaluate the route as well as the answer

Track evidence coverage, citation support, final correctness, cost and abstention quality. Include failed first retrievals, contradictory sources, stale documents and attacks in retrieved text.

The [2026 agentic-RAG systematization](https://arxiv.org/abs/2603.07379) identifies limitations of static evaluation for sequential retrieval systems. It is a survey and framework, not proof that agentic retrieval universally improves quality.

Start with [basic retrieval patterns](article-rag-retrieval-patterns.html), then compare one addition at a time using the [evals guide](evals.html).
