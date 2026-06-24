# LoRA vs Fine-Tuning vs Pre-Training: When Each Makes Sense

When an AI agent does not behave the way you want, the reflex is to reach for the model's weights. The output is off, so the instinct is to retrain. Most of the time that instinct is premature. Changing weights is the most expensive and least reversible way to change a model's behavior, and there is a ladder of cheaper moves you can exhaust first. This article is about that ladder, with the three weight-level rungs (LoRA, full fine-tuning, pre-training) explained in enough detail that you can tell which one your problem actually needs.

This is part of LoopRails, a framework for building agent loops that are fast to build and safe to run. Adapting the model is an upstream decision in that build, and it does not remove the need for a verifier and rails around the result. That is where the article lands.

## The adaptation ladder

Order the ways to change what a model does from cheapest and most reversible to most expensive and most permanent:

1. **Better prompting.** Rewrite the instructions, add examples, state the output format. Free, instant, reversible by editing a string.
2. **Context engineering and retrieval (RAG).** Put the right information in front of the model at inference time: relevant documents, recent records, the user's history, pulled into the context window. No training, and the facts stay current because you fetch them live.
3. **Tools.** Give the model functions it can call: a calculator, a database query, an API. This extends what it can *do* rather than what it knows, and keeps it honest about facts it should look up rather than guess.
4. **Parameter-efficient fine-tuning (LoRA and friends).** Train small adapters on top of a frozen base model.
5. **Full fine-tuning.** Continue training and update all of the model's weights on your data.
6. **Pre-training from scratch.** Train a new model on a very large corpus.

The first three rungs touch no weights. They are where most adaptation should happen: cheap, fast to iterate on, and reversible in seconds when they make things worse. A surprising amount of "we need to fine-tune" turns out to be "our prompt was vague" or "we never gave the model the document it needed." Work the top of the ladder until it genuinely runs out before you touch the bottom three. The rest of this article assumes you have done that and the problem persists.

## Pre-training: almost never your job

Pre-training is building the model. You take a very large corpus, mostly general text and code, and train from random initialization to predict tokens until the model has absorbed general language, reasoning patterns, and broad world knowledge. This is what produces a base model in the first place.

It is expensive in a way the other rungs are not. The data requirement is enormous, the compute bill is large enough that very few organizations sign up for it, and the skill required (data curation, distributed training, handling instability across a long run) belongs to a specialized team. The economics only work at the scale of an organization whose product *is* the model. So for a product team, you do not pre-train.

You start from someone else's base model, open-weight families like Llama, Mistral, Gemma, or Qwen, or a hosted model behind an API, and adapt from there. Building a foundation model to power a feature is like smelting your own steel to build a bookshelf.

One middle option is worth naming so you can rule it out on purpose. **Continued pre-training**, also called domain-adaptive pre-training, keeps pre-training an existing base model on a large domain corpus (legal text, medical literature, a specific codebase ecosystem) before any task-specific tuning. It can help when your domain's language is genuinely far from what the base model saw and you have a large unlabeled corpus to feed it. It still costs real compute and skill, just less than starting from zero. Most teams will not need it.

## Full fine-tuning: update every weight

Full fine-tuning continues training on your data and updates all of the model's parameters. You start from a base (or instruction-tuned) model and run more training steps on examples of the behavior you want, until the weights shift toward your task.

To do this you need the weights. That means an open-weight model you can train yourself, or a provider's managed fine-tuning service that does it behind the API. Whether a given provider offers managed fine-tuning, and for which models, changes over time, so check your provider's current docs rather than assuming.

What you get out is a full-size copy of the model, specialized to your task. That is also the first cost: every fine-tuned task is another full model to store and serve. The deeper risks are in the training itself.

- **Catastrophic forgetting.** Push the weights hard toward your narrow task and the model can lose general ability, getting worse at everything around the one thing you trained.
- **Overfitting.** A small dataset teaches your specific examples rather than the general pattern behind them. The model memorizes, then fails on inputs that differ from the training set.
- **Real infra and skill cost.** Doing it well takes data preparation, a training setup, hyperparameter choices, and the evaluation discipline to tell whether any of it worked.

Full fine-tuning earns its cost when you have a large, high-quality, stable dataset and a task that prompting genuinely cannot reach: a consistent behavior, format, or narrow skill the model should perform by default. "Large, high-quality, stable" is the operative phrase. Small datasets overfit. Low-quality ones teach the model your noise. Data that changes every week means retraining forever, and you probably wanted retrieval instead.

## LoRA and PEFT: train the adapters, freeze the base

Parameter-efficient fine-tuning (PEFT) is the answer to "I want fine-tuning's effect without fine-tuning's cost." LoRA, Low-Rank Adaptation, is the method most teams reach for first. The idea: freeze the base model's weights entirely, and insert small low-rank adapter matrices into its layers. During training you update only those adapters, which hold a tiny fraction of the model's parameters. The base never moves.

That one change cascades into several wins:

- **Cheaper and faster to train.** Far fewer trainable parameters means less compute and memory per run, so you iterate faster.
- **Small artifact.** The output is the adapter, measured in megabytes rather than the full model. No fresh full-size copy per task.
- **Swappable and stackable at serving time.** Because the base is shared and frozen, you can load different adapters on one base model, swapping or composing them per request. One served base, many specializations.

**QLoRA** extends this: it applies LoRA on top of a *quantized* base model (the base stored in lower precision), so the whole thing fits on smaller, cheaper hardware. It is how people fine-tune sizable open-weight models without a fleet of high-end GPUs. LoRA is not the only PEFT method (prefix tuning, prompt tuning, and bottleneck adapters take related approaches), but LoRA and QLoRA are the ones you are most likely to use.

The trade-off against full fine-tuning is favorable more often than not. For many tasks LoRA lands close in quality at a fraction of the cost. Occasionally, on the hardest adaptations, full fine-tuning reaches a ceiling LoRA does not. Try the cheaper thing first and measure whether it got you there, which means you need a way to measure.

## When to reach for each

Four rules, in the order you should consider them.

**Prompt and retrieve first, and stay there for facts.** This distinction saves the most wasted training runs: fine-tuning teaches *behavior, format, style, and narrow skills*, and it is a poor way to inject facts, especially facts that change. "The model does not know our latest pricing" is a retrieval problem. Fine-tuning facts in bakes a snapshot that goes stale and is expensive to update; retrieval keeps the facts live and the model general. Tune when the issue is *how* the model behaves, not *what* it currently knows.

**Reach for LoRA when prompting has run out and you need a weight-level change.** When the model will not reliably produce a consistent behavior or format from instructions alone, and you have a decent set of examples, LoRA is the right first step into weights. It is cheap enough to be an experiment rather than a commitment, and you can throw it away without disturbing the base. Most teams that need weight-level adaptation stop here.

**Reach for full fine-tuning when LoRA hits a ceiling and the dataset justifies it.** If you have measured LoRA against your evaluation set, found it short, and have a large, high-quality, stable dataset behind a task worth paying for, full fine-tuning is the next rung. Expect to manage forgetting and overfitting, and to store and serve a full model per task.

**Reach for pre-training basically never.** Continued pre-training is the only flavor a non-foundation team should consider, and only with a large domain corpus and a clear reason the base model falls short. Pre-training from scratch is a foundation-model company's job.

## You cannot tell if it worked without a verifier

Here is the part teams skip and then regret. Before you tune anything, build an evaluation set and pick a metric: inputs with known-good outputs, a scoring function, or a benchmark that reflects the actual task, decided up front.

Without it, you are tuning blind. You run a fine-tune, look at a few outputs, feel like they improved, and ship a model you cannot prove is better, sometimes one that is quietly worse on cases your spot check missed. Every rung above, prompting included, is an experiment, and an experiment without a measurement is a vibe with a GPU bill. The evaluation set tells you whether prompting was already enough, whether LoRA closed the gap, or whether full fine-tuning beat LoRA by enough to justify its cost. The verifier decides, the same principle that governs the rest of the loop.

## A tuned model is still a model

Suppose you do it. You fine-tune, or train a LoRA adapter, and the model is now measurably better at your task. You changed the generator. You did not remove the need for everything around it.

A fine-tuned model is still a model. It can still be wrong, still hallucinate, still take a confidently bad action. Tuning shifts the distribution of its behavior; it does not make that behavior safe by construction. The verifier that checks output against the goal still has to run, and still has to be independent of the generator. You do not get to trust the output more just because you spent compute producing it. The rails still apply: caps on blast radius, grading actions by consequence, a human at the steps that are consequential and irreversible.

Pre-training, full fine-tuning, and LoRA are all ways to build a better generator, and a better generator is worth having. In a loop, the generator proposes and the verifier disposes. Adapting the model makes the proposals better. What ships is decided by the check and the rails.

## Where to go next

If you have not built the check yet, start there: [evaluation-driven development](article-evaluation-driven-development.html) covers letting the verifier decide, and [maker-checker for AI agents](article-maker-checker-ai.html) covers keeping that check independent of the generator. For how the adapted model fits the larger picture, see [loop engineering](article-loop-engineering.html) and the full method, Grade · Guard · Show · Prove, in the [LoopRails framework](framework.html). Adapt the generator at the lowest rung your problem needs, and keep the rails on regardless.
