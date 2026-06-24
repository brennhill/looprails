# L is for Logged: the deep dive

*Part of the **RAIL** standard. Every governed agent action should stay Reversible · Authorized · Interruptible · **Logged**. This page goes deep on the last one. It is the property that makes the other three auditable: without a trustworthy record you cannot tell whether your reversibility, authorization, or interruptibility ever actually worked.*

---

## What "Logged" really means

A dump of model outputs does not count. **Logged** means an inspectable, trustworthy record of *what happened, who or what did it, on whose authority, why, and what resulted*, detailed enough to **prove the oversight catches mistakes rather than merely that a human was nominally present** [D-14].

A confirmation click is not oversight if you can't later answer: *which* identity approved *what* action, on *whose* behalf, based on *what* the agent showed them, and whether the outcome was correct. "Logged" turns "we have a human in the loop" from a claim into something you can verify [C-20, D-13].

## Why a human in the loop is worthless without a real record

Four things become impossible without it:

- **You can't validate it.** The only honest test of oversight is whether humans actually *catch and correct* errors, which is the intervention-success rate. Gates reduce bad actions but barely improve catching them [A-17]. You only find out which is happening by measuring it, and you can only measure it from the record.
- **You can't attribute it.** "The agent did it" is not an answer when something goes wrong. You need to trace the action to an identity and, ultimately, to an accountable human.
- **You can't learn from it.** Incident review, evals, and policy updates all feed on the trail.
- **You can't be accountable.** Meaningful human control requires *tracing*, meaning outcomes that trace back to an informed human [C-20, D-13], and felt accountability itself measurably reduces automation bias [F-11]. Regulation is catching up too: the EU AI Act's human-oversight duties presume records exist to oversee against [D-1].

## What to log (per consequential action)

For every action that matters (roughly G1 and up), capture:

- **Actor identity**: who or what performed it (see below).
- **Authority used**: which permission/scope/grant authorized it.
- **Inputs and outputs**: what it acted on and produced.
- **Rationale + confidence**: why the agent chose it, and how certain it was.
- **Approval, if any**: and *which identity* gave it (proposer ≠ approver for high grades).
- **Outcome/effect**: what actually changed.
- **Correlation / trace IDs**: to stitch the above into one story.

The classic failure is logging only final outputs. Log the **authority and the chain**, not just the result.

## Identity: tie every action to an authenticated principal

"The agent did it" is unattributable. Make every consequential action carry an **authenticated identity**:

- Authenticate through an **identity provider** (SSO / OIDC), not ad-hoc keys. Every action is stamped with a real principal.
- **Distinguish the principals**: the human user, the agent's own **workload/service-account identity**, and *each individual sub-agent*. Not one shared "assistant" identity.
- Record **"on behalf of"**: the human the agent is acting for (delegated authority), e.g. via OAuth on-behalf-of / token exchange. An action has both an *actor* (the agent) and a *principal* (the human whose authority it borrows).
- This is the audit-time face of **zero-trust**: authorize and identify **per request**, in context, not once at session start [O-13].

With identity in place you can answer *who acted* and *on whose behalf*, the precondition for everything else.

## Sub-agent provenance and delegation chains (the hard part)

Multi-agent systems are where logging usually breaks. When an orchestrator spawns sub-agents, a flat list of tool calls tells you nothing about *who did what under whose authority*. You need **provenance**:

- **Record the delegation tree** (who spawned whom) and **propagate a correlation/trace ID plus the authorizing principal down the chain.** A sub-agent's actions inherit the trace, not a fresh anonymous context.
- **Don't let sub-agents inherit authority silently.** Each delegation is an explicit, logged, scoped grant. (An agent acting on ambient authority it was handed implicitly is the confused-deputy problem, the same structural flaw behind prompt-injection data exfiltration [O-11, O-12]. The log should show exactly which scoped grant each sub-agent held.)
- **Model it with W3C PROV** [Q-11, Q-13]. PROV's three node types map cleanly onto agentic systems:
  - **Entities**: artifacts, data, files, messages.
  - **Activities**: steps, tool calls, model invocations.
  - **Agents**: the identities (human, orchestrator, sub-agent) responsible.
  - and the relations that make it queryable: `used`, `wasGeneratedBy`, `wasAttributedTo`, `wasAssociatedWith`, `wasDerivedFrom`.
  So you can answer a real question: *"this pull request was generated by sub-agent X, acting on user U's delegated authority, derived from issue #42 and the repo at commit abc."*
- **Distinguish provenance types** [Q-12]: *data lineage* (where the data came from) vs *interaction history* (what the agent did) vs *decision rationale* (why). An overseer needs all three, kept separable.
- **Practical backbone: distributed tracing.** Use something like OpenTelemetry, with one **trace per task** and a **span per agent / tool call**, carrying the principal, the authority/scope, and the grade as span attributes. Correlation IDs then link the structured trace to the human-readable logs, the approval record, and the final outcome.

## Make the record trustworthy

A log you can quietly edit is not evidence, and for G2/G3 actions you may need evidence.

- **Append-only / immutable / WORM storage**: you can add, never silently rewrite.
- **Tamper-evidence**: sign each entry, or hash-chain entries to the previous one, so any alteration is detectable.
- **Reliable ordering and clocks**: so the timeline can be reconstructed and trusted.

The bar scales with consequence. A G0 read needs a cheap audit line; a G3 production action needs a signed, append-only entry tying the act to an identity, an authority, and an approval.

## Close the loop: logs are how you *prove* oversight works

"Logged" exists to power the framework's fourth move, **Prove**. From the record you compute the metrics that tell you whether oversight is real or theater:

- **Intervention-success rate**: when the agent was wrong, how often did the human actually catch *and fix* it? (Correctness of approvals, not approval rate.) This is the number [A-17] shows is usually poor, and you can only get it from the log.
- **Override rate + override correctness**, and **time-to-detect vs. time-to-harm**.
- **Red-team through the record**: plant errors and adversarial actions, then check the log to see whether the human or monitor caught them.

Without logs you can only *assert* oversight exists. With them you can *demonstrate* it catches mistakes, which is exactly the evidence good governance demands [D-14].

## Privacy, access control, and retention

The log is itself a sensitive, high-value asset, so treat it like one:

- **Redact secrets and PII** at write time, never log credentials, and consider field-level redaction for sensitive inputs/outputs.
- **Access-control the logs.** Who can read them is its own permission. An audit trail that anyone can read (or alter) is a liability.
- **Set retention windows** that balance audit/learning needs against privacy and regulation. Don't keep everything forever, and don't make the record so noisy no one can use it. A queryable, prioritized trail beats an un-searchable firehose [H-20].

## Maturity checklist

- [ ] **L0**: raw text logs of outputs only.
- [ ] **L1**: every consequential action logged with an **authenticated actor identity** + inputs/outputs.
- [ ] **L2**: **authority used + approvals (and who approved) + outcomes** recorded; **correlation IDs** link them into one story.
- [ ] **L3**: **sub-agent provenance**, meaning delegation chains, propagated principal + trace, a PROV-style graph, distributed tracing across agents.
- [ ] **L4**: **tamper-evident** (append-only + signed/hash-chained), **access-controlled**, retention-policied, and you compute oversight-effectiveness metrics from it.

## Common mistakes

- **Outputs only.** Logging what the agent produced, not the authority it used or the decision it made.
- **No identity.** "The agent did it," unattributable to any human principal.
- **No cross-agent provenance.** A flat blob of tool calls with no who-spawned-whom or on-whose-authority.
- **Mutable logs.** Editable records aren't evidence.
- **Leaky logs.** Secrets/PII logged unredacted, or no access control on the trail.
- **The firehose.** Everything logged, nothing queryable, so no one can actually reconstruct what happened.

---

## Sources

- **[Q-11]** Moreau et al.: provenance confers authority/interpretability; the case for queryable provenance-aware systems.
- **[Q-12]** Ragan et al.: provenance *types* (data lineage vs interaction history vs rationale) and purposes.
- **[Q-13]** Moreau & Groth: the W3C **PROV** model (entities / activities / agents; wasGeneratedBy, wasAttributedTo, wasDerivedFrom).
- **[C-20] / [D-13]** Santoni de Sio & van den Hoven: *meaningful human control* = tracking + **tracing** (outcomes trace to an informed human).
- **[D-14]** Green: treat oversight as a claim to **prove with evidence**, not a checkbox.
- **[A-17]** Chen et al.: the recognition bottleneck; **intervention-success** is the metric that matters, and it must be measured.
- **[F-11]** Skitka et al.: **felt accountability** measurably reduces automation bias.
- **[O-13]** NIST Zero Trust: authorize/identify **per request**, in context.
- **[O-11] / [O-12]** Hardy; CSA: the **confused-deputy** problem = prompt injection; sub-agents must not inherit ambient authority.
- **[D-1]** EU AI Act, Article 14: human-oversight duties presuppose records to oversee against.
- **[H-20]** Three Mile Island: the firehose, an unprioritized flood disables oversight.

*LoopRails · RAIL series · L is for Logged. Companion to [`framework.md`](framework.md) and [`codex.md`](codex.md).*
