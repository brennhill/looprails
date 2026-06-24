# What You Can and Can't Do With Models You Don't Control

Every agent loop has a generator at the center: the model that reads the context and proposes the next action. Before you tune a single prompt or wire up a single tool, you make a choice about that generator that constrains everything after it. You either call a closed model over an API, where you send tokens and get tokens back and never hold the weights, or you run an open-weight model you downloaded and can change. The two paths feel similar from the outside (both are "use an LLM") and they diverge fast once you start building. This article lays out what each one lets you do, what it takes off the table, and how that one decision shapes the loop you end up with.

## The two categories

A closed, hosted API model is a service. You send a request, the provider runs the model on their hardware, you get a response. You never see the weights and you cannot copy them. Claude, GPT, and Gemini are the obvious examples. You are renting access to a model someone else trained, hosts, and updates.

An open-weight model is a file (a large one) that you can download and run on your own machine or in your own cloud account. Llama, Mistral, Gemma, and Qwen are common examples. You hold the actual parameters, so you can inspect them, modify them, and serve them yourself.

One thing to get straight first: "open weight" is not the same as "open source." Most open-weight models ship under the provider's own license, and those licenses carry conditions: limits on commercial scale, restrictions on what you can build, requirements about attribution or naming, sometimes a clause about using outputs to train competing models. The weights being downloadable does not mean the license lets you do what you want with them. Read the license for the specific model and version before you build a business on it. The terms differ enough between families that the wrong assumption can be expensive.

## What you can do with a model you don't control

A closed API model gives you a frontier-level generator with none of the operational burden. The provider runs the infrastructure, scales it, patches it, and keeps it up. What you get in return for not owning the weights is a wide set of levers that all sit outside the weights:

- **Prompt and system-prompt design.** The system prompt sets the model's role and standing rules; the user prompt carries the task. This is your primary steering wheel.
- **Few-shot examples.** Show the model a handful of input-output pairs and it will pattern-match toward them. Cheaper than any kind of training and often enough.
- **Context engineering and retrieval.** Fill the context window with the right files, prior decisions, and constraints. Retrieval-augmented generation (RAG) pulls relevant documents in at request time so the model answers from your data instead of its memory.
- **Tool and function calling.** Hand the model a set of callable tools and let it decide when to call them. This is the spine of most agent loops.
- **Structured output.** Constrain the model to return JSON that matches a schema, so the next step in your loop can parse it instead of guessing.
- **Sampling settings the API exposes.** Temperature, top-p, max tokens, stop sequences, and whatever else the provider surfaces. You tune the knobs they give you.
- **Prompt caching, where offered.** If the provider caches a reused prefix (a long system prompt, a fixed set of examples), you can cut cost and latency on repeated calls. Check whether your provider offers it and how it is billed.
- **Managed fine-tuning, for some models.** Some providers offer a fine-tuning service for some of their models, where you upload examples and they produce a customized variant you still call over the API. This is not the same as touching the weights yourself. Check whether your provider offers it for the model you want, because availability changes.

That is a large toolbox, and for most loops it is enough. You can take a model you have never seen the insides of and make it do specific, reliable work through prompting, context, tools, and the harness around it.

## What you cannot do with a model you don't control

The limits all come from the same fact: the weights are not yours and the model runs on someone else's machine.

You cannot see or export the weights. You cannot run the model offline, on your own hardware, or in an air-gapped environment, because every request crosses the network to the provider. You cannot do your own LoRA or full fine-tune on the raw parameters; the most a provider lets you do is whatever managed service they choose to offer. You cannot guarantee the exact version stays available. Providers deprecate old models and ship new ones, and a model that updates under you can shift its behavior in ways your prompts were quietly relying on. You cannot escape rate limits, per-token cost, or the provider's terms of service and content policies. If your traffic spikes, you are subject to their limits. If your use case brushes against their policy, you are subject to their enforcement.

And your data leaves your boundary. Every token you send goes to the provider. Whether that is acceptable depends entirely on the contract and the deployment tier: some providers offer enterprise or VPC arrangements with stronger data handling, retention, and residency terms. This is a contractual and compliance question you verify with the provider and your own legal and security people, not an assumption you make from the marketing page. For a healthcare, financial, or government workload, the answer to "where does my data go and who can see it" is often the whole decision.

## What you can do with a model you control

Hold the weights and a different set of doors opens, all about ownership.

You can run the model on your own hardware or inside your own VPC, which puts privacy, data residency, and air-gapped operation back on the table. Nothing has to leave your boundary. You can fine-tune and LoRA the model freely, subject to its license, to bend its behavior toward your domain in a way no prompt can. You can quantize it, trading a little quality for a smaller memory footprint so it fits on cheaper hardware. You can distill a large model down into a smaller one tuned for your specific task. You can pin an exact version forever, so the model your evals passed against last year is the same model running in production today, because you are the one holding the file. And you can shape cost as a fixed infrastructure bill (the machines you run) rather than a per-token meter that scales with traffic. At high, steady volume that math can swing hard in your favor.

You own the whole stack. That is the upside and, read from the other side, the catch.

## The trade-offs of owning it

"You control it" and "you have to operate it" are the same fact seen from two angles. The moment you hold the weights, you also hold serving, scaling, evaluation, security patching, and ops. You decide how many GPUs, you handle the traffic spike, you keep the serving stack patched, you build the harness that catches bad output, and you do it with no provider on call when it breaks at 2am.

The strongest frontier capability is often, though not always, on the closed side, because the providers training the largest models tend to keep their best work behind an API. The gap narrows and shifts, so do not treat it as permanent, but on a hard reasoning task the closed frontier is usually the safer bet for raw capability. And you need the skill on your team to actually run and tune an open-weight model. Fine-tuning you do badly is worse than prompting you do well. Serving you do badly is an outage.

None of this makes open weight the wrong call. It means the bill for control is paid in operational work, and you should know the size of that bill before you sign up for it.

## Choosing

The decision is not about which model is "better." It is about which set of constraints you want to live inside.

**Choose a closed API model when** you want maximum capability with the least setup, your data policy allows tokens to leave your boundary (or the provider's enterprise terms cover your requirements), your volume is moderate or spiky, and you would rather spend your team's time on the loop than on running a model. This is the default for most teams getting started, and it is a good default.

**Choose an open-weight model when** you need privacy, data residency, or true air-gapped operation; when you need a version that will not change under you; when you need deep customization through fine-tuning that a managed service cannot give you; or when you have high, steady volume and a per-token bill that has become the dominant cost. You are paying in operational work to buy control, and these are the cases where the control is worth it.

Hybrid setups are common and often the right answer. Route the hard, low-volume steps to a frontier API model and the cheap, high-volume steps to a smaller model you self-host. A loop that classifies ten thousand tickets an hour and escalates the tricky ones can run a small local model for the triage and call the expensive API only for the cases that earn it. You do not have to pick one generator for the whole loop.

## Where this lands in the loop

The control question sets your adaptation budget. If you cannot change the weights, every bit of adaptation goes into prompting, context, tools, and the harness: better system prompts, sharper retrieval, tighter tool definitions, stricter output schemas. That is real engineering and it gets you a long way. If you can change the weights, fine-tuning and LoRA join the toolbox, and the tradeoffs between those and prompting are their own topic (see the companion piece on LoRA versus fine-tuning versus pre-training for when each one earns its cost). Model choice decides which kinds of adaptation you are even allowed to attempt.

What it does not change is the need for rails around the generator. A model you do not control can change under you when the provider updates it, which is the exact argument for an independent verifier and for pinning expected behavior in your evals: when the model shifts, your evals catch it instead of your users. A model you do control can still be confidently wrong, so the caps, the action grading from G0 to G3, and a human at the consequential steps still apply. Owning the weights buys you privacy, version stability, and customization. It does not buy you a generator that never errs, and no such generator exists.

Model choice changes the generator. It does not change the loop's need for a verifier that decides whether each pass improved things, or for guardrails on the actions a verifier cannot judge. Pick the generator that fits your constraints, then build the rails either way. For how those rails fit together, start with the [LoopRails framework](framework.html).
