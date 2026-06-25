# The LoopRails Cookbook

Recipes for building AI agent loops: the ways agents are designed, the ways RAG is designed, and the failure modes that bite each one, in plain English. Every recipe follows the same shape, so you can scan it fast: what it is, when to reach for it, how it fails, and how to fix it.

This is the recipe side of LoopRails. The [Doctrine](article-loop-engineering-doctrine.html) holds the principles, the [framework](framework.html) holds the method, and this is the parts catalog. Pick the pattern that fits the task, read its failure modes before you ship, and keep a verifier and the guardrails around whatever you build.

## Chapters

### Loops

- [Loop patterns for engineering and data science](article-loop-patterns.html). Test-fixing, refactor, dependency-upgrade, data-cleaning, experiment, and plan-in-simulation loops, each with a done-condition, a verifier, and the guardrail that keeps it honest.

### Agents

- [Agent workflow patterns](article-agent-workflow-patterns.html). Prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer. The patterns where you control the path.
- [Autonomous agent patterns](article-autonomous-agent-patterns.html). ReAct, reflection, plan-and-execute, tool use, memory, and single-agent versus multi-agent. The patterns where the model decides the next step.
- [Multi-agent loops](article-multi-agent-loops.html). When more agents help, how they break, and the oversight each one needs.

### RAG

- [RAG retrieval patterns](article-rag-retrieval-patterns.html). Chunking, embeddings and vector search, hybrid search, reranking, query transformation, and metadata filtering. The core retrieval pipeline.
- [Advanced and agentic RAG](article-advanced-agentic-rag.html). Contextual retrieval, agentic RAG, corrective RAG, self-RAG, GraphRAG, and how to evaluate a RAG system.

## How to use it

Start from the task, not the pattern. Most systems begin as the simplest thing that works, a single prompt and then a workflow, and add autonomy or retrieval only when the task needs it. Read the failure modes before you build, because most of them are cheaper to design around than to debug in production. Whatever you assemble, keep an independent verifier deciding whether it worked, and keep the guardrails (graded actions, caps, a kill switch) around it.

The sources behind these recipes are collected in the [Loop Engineering Codex](codex-loops.html). For securing what you build, the [BRACE Framework](https://braceframework.org) covers the agent's configuration and infrastructure.
