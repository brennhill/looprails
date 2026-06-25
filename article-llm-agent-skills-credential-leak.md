# Study: How AI Agent "Skills" Leak Your Credentials

A 2026 empirical study found that the reusable "skills" we plug into AI agents leak credentials at scale, usually during ordinary use, with no exploit required and no human positioned to notice. The researchers analyzed 17,022 agent skills and found 520 of them carrying 1,708 distinct security issues, the most common being secrets quietly written into debug logs and the model's own context window. ([Chen et al., 2026, arXiv:2604.03070](https://arxiv.org/abs/2604.03070))

An AI agent credential leak is rarely a model behaving badly. It is the *plumbing* around the model handing out keys. You cannot review your way out of it, because nothing surfaces for a human to review. This is a prevention problem, and a textbook case for treating agent extensions as untrusted code with least privilege and disciplined logging.

## Key takeaways

- An empirical study of **17,022 LLM agent skills** found **520 affected skills** with **1,708 security issues**. Credential leaks are common, not rare.
- The leading vector was **debug logging** (the study attributes ~73.5% of issues to it): secrets land in logs and in the LLM's context window, where they spread.
- The study reports **~89.6% of leaked credentials were immediately exploitable**, and **~92.5% leaked during routine execution**: no elevated privileges, no special exploit.
- Detection usually required reading **both the skill's natural-language description and its code** (~76.3% of cases). Scanning code alone misses most of it.
- Secrets removed from **107 upstream repositories persisted across 50+ forks**. The supply chain does not forget.
- The fix is design, not review: **least privilege, scoped/short-lived credentials, redacted logs, sandboxing, and rotation**, the [Authorized](rail-authorized.html) and [Logged](rail-logged.html) properties of [RAIL](framework.html).

## What the study looked at

The researchers sampled 17,022 skills from a large skills marketplace (drawn from a population of roughly 170,000 artifacts) and combined three analyses: static analysis (regex- and AST-based secret extraction), dynamic testing in a sandbox with mock credentials, and intent verification that cross-referenced what a skill *said* it did against what it actually did at runtime. That last step carries weight. A lot of leaks only become visible when you compare the skill's friendly description to its real behavior, which is why the authors report that **~76.3% of cases required jointly analyzing the natural-language description and the code**.

In total they found **520 affected skills containing 1,708 security issues**, and after responsible disclosure, malicious skills were removed and the authors report **~91.6% of hardcoded cases were remediated**. (Figures here are as reported in the [paper](https://arxiv.org/abs/2604.03070); read it directly for exact methodology and definitions.)

## The findings that should change how you build

### Debug logging is the number-one leak

The single biggest vector was not a clever exploit. It was **logging**. The study attributes roughly **73.5% of vulnerabilities** to debug logging, where credentials get written into log streams and, worse, into the **LLM's context window**, then propagate wherever that context goes.

This is the dark side of "just log everything." Logging matters for oversight, the **L** in RAIL, but a log that contains live secrets is itself the breach. The lesson is to *log without leaking*: redact secrets at the boundary, never put raw credentials in the model's context, and keep verbose debug output out of production. See [Logged: identity, provenance, and proof](rail-logged.html) for how to log in a way that helps oversight instead of becoming the vulnerability.

### The leaks happen during normal use, so no human catches them

The study reports that **~92.5% of leaks occurred during routine execution without elevated privileges**, and **~89.6% of leaked credentials were immediately exploitable**. Read those together and the failure mode is invisible. No approval prompt fires, nothing looks unusual, and the leaked key works immediately.

This is the exact situation LoopRails is built around. The useful question is never "did a human approve this?" but [can a human realistically catch this in time?](article-hitl-ai-safety.html) Here the answer is plainly no. A credential leaking into a log during a normal run is not something a reviewer spots, and bolting an approval step onto a skill will not change that. When the mistake is uncatchable, you [prevent it](guide-g3.html) instead of reviewing it.

### The supply chain doesn't forget

One of the more sobering findings: secrets scrubbed from **107 upstream repositories still lived on in 50+ independent forks**. Removing a secret from the original does not remove it from every copy someone made. A leaked credential must be treated as **compromised and rotated**, not merely deleted, and installing agent skills is a supply-chain decision rather than a convenience.

## What to do about it

A skill is third-party code that runs with your agent's privileges and sees your agent's context. Treat it like any other untrusted dependency, and apply the LoopRails controls.

### 1. Least privilege: the skill should never hold a powerful, long-lived secret

Give a skill only the access the task needs, scoped and short-lived. Prefer brokered, just-in-time credentials that expire in minutes over a long-lived API key pasted into config. If a leak can only expose a narrow, short-TTL token, the [89.6%-immediately-exploitable](https://arxiv.org/abs/2604.03070) statistic stops being catastrophic. This is the [Authorized](rail-authorized.html) property of RAIL and the [least-privilege](article-least-privilege-ai-agents.html) discipline applied to extensions.

### 2. Keep secrets out of logs and out of the context window

Redact credentials before anything is logged, disable verbose debug logging in production, and never inject raw secrets into the prompt/context the model can see. If the model does not need to *see* a key to *use* a tool, do not show it one. (See [how to log without leaking](rail-logged.html).)

### 3. Sandbox skills and cut the network leg

Run skills in a contained environment with egress control. A skill that can read your secrets but cannot reach the open internet cannot exfiltrate them. That is the [lethal trifecta](article-lethal-trifecta.html) defense (private data + untrusted content + an outbound channel) applied here, and it is the core idea behind [AI agent sandboxing](article-ai-agent-sandboxing.html) and a broader [guardrails checklist](article-ai-agent-guardrails.html).

### 4. Treat any exposed credential as compromised: rotate, don't just delete

Because forks persist, deletion is not remediation. Rotate the secret, revoke the old one, and assume copies exist. Build rotation in from the start so it stays cheap.

### 5. Vet skills before you install them

Review the skill's actual behavior, not just its description. The study's own detection needed both. Pin versions, prefer audited sources, and do not fork-and-forget.

## Why this is a LoopRails problem, end to end

This study is a clean illustration of the framework's core claim. The danger is rarely a model "deciding" to do something bad. It is ordinary actions (logging, using a credential, calling out to the network) that no human is positioned to catch. Adding a person "in the loop" does nothing here, because there is no moment where a person sees the leak. The defenses that work are all preventive and structural: least privilege, redacted logs, sandboxing, and rotation, which is [Reversible, Authorized, Interruptible, Logged](framework.html).

Want to pressure-test your own setup? [Grade an action your agent takes](index.html#grader), say "a third-party skill reads a stored API key," and you will land in the high-consequence, low-controllability corner where review is a trap and prevention is the only real answer. For the full method, start with the [playbook](playbook.html); for the evidence base behind these patterns, see the [research codex](codex.html).

**Read the study:** [How Your Credentials Are Leaked by LLM Agent Skills: An Empirical Study (Chen et al., 2026)](https://arxiv.org/abs/2604.03070).
