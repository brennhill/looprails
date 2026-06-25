# RAG Retrieval Patterns: A Recipe Book

A language model answers from two places: what it memorized during training, and what you put in the prompt. The memorized part is frozen, often stale, and has no idea what is in your wiki, your support tickets, or last week's incident report. Retrieval-augmented generation (RAG) fixes that by fetching relevant passages from your own documents at answer time and pasting them into the prompt. The model then writes its answer from those passages instead of from memory, and it can point back to a source. That is the whole idea: ground the answer in your data, and make it citable.

Here is the pipeline once, so the recipes below share a map. You ingest documents. You split them into chunks. You turn each chunk into an embedding, a vector of numbers that captures its meaning. You store those vectors in an index. At query time you embed the question, find the nearest chunks in the index, optionally rerank them with a stronger model, and hand the top few to the language model to answer. Seven stages, and almost every recipe in this chapter is one stage or one upgrade to it.

The reason to learn the stages separately is that they fail separately, and the fixes are different. A bad chunking strategy and a bad embedding model both show up as "the answer is wrong," but you repair them in different places. Knowing which stage is leaking saves you from rewriting the part that already works.

Keep one thing in front of you as you read: most RAG problems are retrieval problems. The model can only answer from what you actually put in front of it. If the right passage never makes it into the prompt, no amount of clever prompting will conjure the fact, and a confident, wrong answer is the usual result. So when an answer is bad, suspect retrieval first.

### Chunking

**What it is:** Splitting documents into smaller pieces so each one can be embedded, indexed, and retrieved on its own. The main styles are fixed-size (every N tokens or characters), recursive (split on natural boundaries like paragraphs, then sentences, then words, falling back as needed to stay under a size limit), semantic (split where the topic actually shifts), and parent-document, also called small-to-big (index small precise chunks for matching, but feed the model the larger passage they came from).

**When to reach for it:** Every RAG system chunks, so the real question is which style. Reach for recursive as a sane default because it respects paragraph and sentence boundaries. Reach for semantic when documents wander across topics without clean headings. Reach for parent-document when a single sentence is the best match for a query but the model needs the surrounding paragraph to make sense of it.

**How it fails:** Fixed-size splitting cuts facts in half. "The refund window is" ends one chunk and "30 days" starts the next, so neither chunk answers "how long is the refund window." Chunks that are too big dilute the signal: one paragraph is relevant and four are noise, and the embedding averages out to something bland that matches nothing well. Chunks that are too small carry no context, so a chunk that says "this applies to enterprise customers" retrieves with no clue what "this" is.

**How to fix it:** Start with recursive chunking that splits on paragraphs and keeps chunks in a moderate range, a few hundred tokens, with a small overlap between neighbors so a fact straddling a boundary survives in at least one chunk. If chunks still feel topically muddled, move to semantic splitting. If small chunks match well but answer poorly, switch to parent-document: match on the small chunk, then expand to the parent paragraph or section before handing it to the model. Whatever you pick, look at your actual chunks. Print twenty of them and read them. Half of all chunking bugs are visible to the naked eye.

### Embeddings and vector search

**What it is:** Turning each chunk into a vector with an embedding model, so that chunks with similar meaning land near each other in vector space. At query time you embed the question the same way and pull back the nearest neighbors by cosine similarity or a similar distance measure. This is the dense-retrieval core of RAG: matching on meaning rather than on exact words.

**When to reach for it:** This is the default first-stage retriever for almost every RAG system. It shines when the user phrases a question differently from how the document phrases the answer, because "how do I reset my password" and "credential recovery procedure" can land close together even though they share no words.

**How it fails:** The biggest failure is a domain mismatch. An embedding model trained mostly on general web text may not know that, in your world, "the cluster" and "the fleet" mean the same thing, so two passages you consider near-identical land far apart. Legal, medical, and code corpora are where this bites hardest. A second failure is query-document asymmetry: a short keyword-style query embeds into a different region than a long, prose answer, so the match is weaker than it should be even when the meaning lines up.

**How to fix it:** Pick an embedding model trained on or adapted to text like yours, and test it on real queries from your domain before committing. Measure recall directly: take a set of questions whose correct passage you know, retrieve, and check how often the right passage shows up in the top results. If recall is poor on in-domain jargon, consider a model fine-tuned for your field, or fine-tune embeddings on your own query-passage pairs if you have them. For the asymmetry problem, use a model designed for retrieval that embeds queries and documents with the right framing, and consider query transformation (below) to reshape terse queries into something closer to the answer's form.

### Hybrid search

**What it is:** Running dense vector search and keyword (lexical) search side by side, then merging the two result lists. Keyword search, classically BM25, scores documents by exact term overlap. Vector search scores by meaning. Hybrid search takes both and combines them so you get the strengths of each.

**When to reach for it:** Reach for hybrid whenever exact tokens carry meaning that embeddings smear away: product codes, error codes like "ERR_2043," function names, SKUs, person names, acronyms, and rare technical terms. A vector model may decide "ERR_2043" and "ERR_2049" are basically the same, which is exactly wrong when a user is hunting one specific error. Keyword search treats them as the distinct strings they are.

**How it fails:** Relying on only one side is the failure. Pure vector search misses the exact-term cases above. Pure keyword search misses paraphrases, so "car won't start" never matches a document about "vehicle ignition failure." The other failure is a sloppy merge: the two retrievers produce scores on completely different scales, so you cannot just add them, and a naive combination lets one retriever dominate and drown out the other.

**How to fix it:** Run both retrievers and fuse the results. A simple, dependable fusion is Reciprocal Rank Fusion, which combines lists by rank position rather than raw score, sidestepping the scale problem entirely. If you want to weight one retriever more heavily, normalize each retriever's scores into a common range first, then take a weighted sum. Either way, retrieve a healthy number of candidates from each side before fusing, then let the next stage trim. A practical default: dense search for meaning, BM25 for the literals, fuse, and you catch both the paraphrase and the part number.

### Reranking

**What it is:** Taking the top N chunks from first-stage retrieval and re-scoring them with a stronger model that reads the query and each chunk together, then keeping only the best few. First-stage retrieval (vector or hybrid) is fast because it compares precomputed vectors. A cross-encoder reranker is slower but sharper because it actually reads the query and the chunk as a pair and judges relevance directly.

**When to reach for it:** Reach for reranking when first-stage retrieval is fast but imprecise, which is the normal situation. Vector search casts a wide net and brings back roughly relevant chunks; the reranker sorts the genuinely relevant from the merely nearby. It is especially worth it when you can only fit a handful of chunks in the final prompt and need those few to be the best few.

**How it fails:** The first failure is skipping it and feeding the model whatever first-stage retrieval returned, junk included. Irrelevant chunks crowd out the good ones, eat your context budget, and pull the model toward wrong answers or distract it into hedging. The second failure is reranking too few candidates. If you retrieve 5 and rerank 5, the reranker has nothing to work with: the right passage was probably never in those 5 to begin with. Reranking only helps if the right answer is somewhere in the candidate pool.

**How to fix it:** Retrieve wide and rerank down. Pull 50 to 100 candidates from the first stage, rerank them with a cross-encoder, and pass the top 3 to 10 to the model. The wide first stage protects recall (the right passage is in the pool); the reranker protects precision (it floats to the top). Tune the two numbers against measured retrieval quality, not vibes: widen the candidate pool until recall stops improving, then tighten the final count until the model has clean, relevant context and nothing more.

### Query transformation

**What it is:** Rewriting the user's query before you retrieve, because the raw query is often a poor search query. Several flavors cover different problems. Rewriting cleans up a vague or conversational query into something searchable. Multi-query generates several different phrasings of the question and unions their results. HyDE (Hypothetical Document Embeddings) has the model write a hypothetical answer to the question and retrieves against that answer instead of the question, since a fake answer often looks more like the real passage than the question does. Step-back asks a broader question first to pull in background context before the specific one.

**When to reach for it:** Reach for rewriting when users type fragments or chat-style questions. Reach for multi-query when a question can be phrased many ways and you do not want to bet on one phrasing. Reach for HyDE when questions and answers are worded very differently, which is the asymmetry problem again. Reach for step-back when answering well needs general grounding the specific question alone would not retrieve.

**How it fails:** The core failure is that the raw user query is simply a bad search query, and you retrieved against it anyway. "Why doesn't it work" has nothing to match on. The sharper version is conversational follow-ups: a user asks "what about the enterprise tier?" and the query, taken alone, is meaningless because "what about" refers to the previous turn. Embed that in isolation and you retrieve noise.

**How to fix it:** For follow-ups, resolve the query against the chat history first: rewrite "what about the enterprise tier?" into "what is the refund window for the enterprise tier?" using the prior turns, then retrieve on the standalone version. For vague queries, have a model rewrite them into explicit search queries. Add multi-query when one phrasing is too narrow, and dedupe the unioned results. Try HyDE when query and document vocabularies diverge. These techniques cost an extra model call and add latency, so reach for them where plain retrieval measurably misses, not everywhere by reflex.

### Metadata filtering

**What it is:** Attaching structured metadata to each chunk, things like date, source, author, document type, and access permissions, and filtering on it before or alongside the similarity search. The vector search finds what is relevant; the metadata filter enforces what is allowed or appropriate.

**When to reach for it:** Reach for it whenever something beyond raw relevance matters. Freshness: only retrieve from documents updated this year. Access control: only retrieve chunks this user is permitted to see. Source: restrict to official documentation and exclude scratch notes. Scope: this customer's records, not everyone's. If your corpus mixes content with different recency, ownership, or sensitivity, you need filtering.

**How it fails:** Two failures, opposite directions. Under-filtering returns stale or unauthorized content: an old policy that was superseded, or worse, a document the user has no right to see, which is a security incident, not just a bad answer. Over-filtering returns nothing: filters so strict that no chunk survives, and the model, handed an empty context, either says it cannot help or, worse, fills the gap from memory and makes something up.

**How to fix it:** Index the metadata you will filter on at ingestion time, and apply permission filters at query time from the user's actual identity, never trusting a value passed in from the client. Prefer filtering during retrieval so the vector search still has a large enough pool to rank within, rather than retrieving first and discarding after, which can leave you with too few results. Handle the empty-result case explicitly: if filtering leaves nothing, the system should say it has no relevant authorized information, not improvise. And keep the index fresh; a filter on "current policy" is only as good as how recently you re-indexed.

## When nothing relevant comes back

Two failure modes cut across every recipe above and deserve naming on their own.

The first is lost-in-the-middle. Models attend well to the start and end of a long context and under-use what is buried in the middle. So even when you retrieve the right passage, parking it as chunk 7 of 14 can mean the model glosses over it. The fix is to pass fewer chunks and to order them deliberately: put the strongest chunks where the model looks hardest, at the beginning and the end, and trim the marginal ones. This is why reranking and tight final counts matter beyond raw retrieval, fewer, better-placed chunks beat a big undifferentiated pile.

The second is hallucination on empty retrieval. When nothing relevant comes back, whether because the index is stale, the query was bad, or a filter removed everything, the model will often answer anyway from its frozen memory, and that answer arrives with the same confident tone as a grounded one. A person reading the output cannot tell the difference. The system should detect the case (low retrieval scores, no chunks above a relevance threshold) and respond with "I do not have information on that" instead of guessing. Make "I do not know" a first-class outcome, not a failure of the prompt.

## Measure retrieval, do not eyeball it

Notice how often the fixes above ended in "measure recall" or "check whether the right passage was retrieved." That is not a coincidence. Retrieval quality is a verifier problem: you can and should measure whether the right passage came back, separately from whether the final answer reads well. Build a small set of questions whose correct passages you know, and track two numbers as you change chunking, embeddings, fusion, and reranking: how often the right passage is in the retrieved set (recall) and how much of the retrieved set is actually relevant (precision). Move those numbers, not your gut feel.

This matters because the dangerous failure is silent. Garbage retrieved context produces a confident, wrong answer, and a human reading that answer has no way to catch it, the missing passage is invisible from the output side. The only place to catch it is at retrieval, by measuring whether the right context was ever fetched. Eyeballing a handful of answers tells you the system works on the cases you happened to check; measuring retrieval tells you where it leaks.

The companion chapter [Advanced Agentic RAG](article-advanced-agentic-rag.html) takes this further, covering agentic and corrective RAG (where the system critiques its own retrieval and retries) and how to evaluate a RAG pipeline end to end. For the broader picture of what belongs in a model's context window and why, see [Context Engineering for Agent Loops](article-context-engineering-agent-loops.html), and for how retrieval fits the LoopRails approach to verifiable AI systems, see the [framework](framework.html). The thread running through all of them is the same one this chapter opened with: the model can only answer from what you put in front of it, so put the right thing there, and measure whether you did.
