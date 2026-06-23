# How to Build a Good Human-in-the-Loop for AI Legal & Contract Work

A good **human in the loop for AI legal work** is not a lawyer skimming whatever the model produced and clicking "approve." It starts with one blunt question: can a human realistically catch this mistake in time? For a fabricated case citation buried in a fluent brief, or a contract about to be sent and signed, the honest answer is usually no — so you design the loop to prevent the dangerous outcome instead of rubber-stamping it. You grade each kind of legal action by how reversible it is, how wide its blast radius reaches, and how high the stakes are. Then you match controls to the grade: a licensed attorney reviews substantive output, every citation gets source-checked because models hallucinate, anything executed or filed runs through maker-checker, ingested documents are treated as untrusted, and everything is logged. This article shows how to build that loop for an AI legal or contract agent.

The scenario is increasingly common. A firm or in-house team points an agent at legal work: summarize a deposition, extract clauses from a stack of vendor contracts, draft an NDA, suggest a redline, research precedent, and — at the dangerous end — send a counterparty the signed agreement or submit a filing before a deadline. The agent is useful precisely because it acts and writes fluently. That fluency is also the trap. This article shows how to grade those actions, match controls to each grade, and why prevention beats review for AI contract review oversight.

## The scenario: an agent doing legal and contract work

Picture an agent wired into your matter management and document store. It reads contracts and case files. It drafts clauses and first-pass agreements. It proposes redlines against a counterparty's markup. It runs legal research and cites authority. On the riskiest end it can transmit an executed contract to the other side, or file a document with a court or agency against a hard deadline.

Each of these is a different animal, and treating them the same is the first mistake. Summarizing a document you can re-read is nothing like sending a contract that, once countersigned, binds your client. A licensed attorney must stay accountable for the legal substance throughout — the agent is a drafting and research tool, not the lawyer — and executed contracts and filings are genuinely high-stakes. Good legal AI human review starts by refusing to flatten that difference.

## Grade the actions

LoopRails grades each action G0 to G3 by three factors: reversibility, blast radius, and stakes. The [interactive grader](index.html#grader) does this for you, and the [G2 guide](guide-g2.html) and [G3 guide](guide-g3.html) cover the top of the scale in depth. Here is how a legal agent's actions typically grade.

| Action | Grade | Why |
|---|---|---|
| Summarize a document, extract clauses | G1 | Recoverable; the source still exists to re-read and correct against. |
| Flag risky or unusual clauses for review | G1–G2 | Useful triage, but a missed flag can mislead; attorney still reads. |
| Draft a clause or a full contract | G2 | Real work product, but reviewable and revisable before anyone relies on it. |
| Suggest redlines / negotiation positions | G2 | Affects strategy and terms; needs attorney judgment before it goes out. |
| Legal research with cited authority | G2 | Output looks authoritative and may be fabricated; every cite must be verified. |
| Send / file / execute a contract or filing | G3 | Effectively irreversible; an executed contract binds, a missed deadline cannot be undone. |

The line that matters most is reversibility. A draft you can revise is not a contract that has been countersigned, and a research memo you can correct is not a filing that has already gone to the court. The grade also climbs with stakes: extracting a clause from a routine NDA is not the same as extracting indemnification terms from an eight-figure deal. You grade the specific action and its context, then attach controls to the grade — not one blanket rule for "legal AI."

## Match the controls

Once an action is graded, the control follows. The method is Grade · Guard · Show · Prove: grade the action, guard it with the right pattern, show the human the real thing they are approving, and prove what happened with a log. For G1 work let the agent run and log it. The substantive controls live at G2 and G3.

**A licensed attorney reviews substantive output.** For anything that constitutes legal work product — a drafted clause, a contract, a redline, a research conclusion — an accountable, licensed attorney reviews the substance before anyone relies on it. This is not a formality. The attorney owns the legal judgment; the agent does not and cannot. The review must give the attorney the real artifact and the context to judge it, not a tidy summary that hides what changed.

**Verify every citation and source — models hallucinate.** AI models can fabricate citations and case references that read as completely legitimate, so any output that asserts authority requires source-checking against the actual source. The control is mechanical: each cited case, statute, or clause must resolve to a real, on-point source before the output is used. Showing sources and citations alongside the claim — so a human can click through and confirm — is the "Show" in Grade · Guard · Show · Prove. An unsourced legal assertion from an agent is unverified by default.

**Maker-checker for anything executed or filed.** For any G3 action — sending an executed contract, submitting a filing — the party that proposes is not the party that authorizes. The agent is the maker; a separate, accountable human is the checker, and the checker sees the literal artifact going out and the deadline it is tied to. This is the four-eyes principle, which separates proposer from approver so no single party can both originate and execute a high-consequence action. See the [maker-checker pattern for AI](article-maker-checker-ai.html) for how to implement it without it collapsing into a rubber stamp, and the [Authorized rail](rail-authorized.html) for where it sits in the framework.

**Treat ingested documents as untrusted input.** A contract, an email, or a brief that the agent ingests is untrusted content, not trusted instructions. This matters because of the "lethal trifecta": an agent that combines access to private data, exposure to untrusted content, and an external channel to act or communicate can be prompt-injected — text hidden inside an ingested document can steer the agent to leak privileged information or take a wrong action. A counterparty's contract is exactly the kind of attacker-influenced document you cannot assume is benign. See [the lethal trifecta](article-lethal-trifecta.html) for the full pattern, and keep at least one leg of it out of any privileged session.

**Log everything.** Every draft, every cited source and whether it was verified, every proposal, approval, rejection, and the exact artifact sent or filed is recorded: who, what, when. The log is what lets you reconstruct a matter, demonstrate that a human exercised real judgment, and prove the citation check and the sign-off actually happened. Without it, you cannot show that any of the above ran.

## Prevent, don't review

Here is the part teams get wrong, so it gets its own callout.

You cannot catch a fabricated citation by skimming. A hallucinated case looks exactly like a real one — proper caption, plausible reporter, confident summary — and a reviewer reading for tone and flow will sail right past it. Under automation bias, the tendency to over-trust a fluent, usually-right system, the lone reviewer approves it. The same is true of an executed contract: once it is sent and countersigned it binds your client, and once a filing deadline passes it is gone. There is no attentive moment in which a skim saves you.

So do not build the loop around "show it to a lawyer and let them confirm." Build it around prevention. Require that every citation resolve to a verified source before the output can be used, and require an accountable attorney's explicit sign-off before any execution or filing — with maker-checker so the proposer is never the approver. When you cannot catch the mistake by reading, you make the unverified or unauthorized action unable to go out. The [playbook](playbook.html) and [cheatsheet](cheatsheet.html) walk through wiring these in.

## Common mistakes

**Trusting AI citations.** Treating the model's cited authority as real because it looks real is the signature failure of legal AI. The output is fluent and formatted correctly, and the only flaw is that the case does not exist or does not say what the agent claims. Nothing about reading the text reveals this; only checking the source does. Make citation verification a required, logged step, not an optional courtesy.

**Auto-sending or auto-filing.** Letting the agent transmit an executed contract or submit a filing on its own — or behind a single rubber-stamp approver — removes the one control that matters most at G3. An executed contract is effectively irreversible and a missed or wrong filing deadline cannot be undone. These actions need two independent parties and an explicit attorney sign-off, every time, with the literal artifact and deadline in front of the checker.

**Ingesting untrusted documents into a privileged session.** Feeding a counterparty's contract or an inbound email straight into a session that holds privileged client data and can send or file is the lethal trifecta assembled by accident. Hidden instructions in that document can turn the agent against you — leaking confidential terms or taking an action you never intended. Keep untrusted ingestion separated from privileged data and from any external action channel.

## Key takeaways

- A good **human in the loop for AI legal work** prevents irreversible high-stakes actions rather than rubber-stamping them, because you cannot catch a fabricated citation or an outgoing contract by skimming.
- Grade every legal action by reversibility, blast radius, and stakes: summarizing and extracting are G1, drafting and redlining and research are G2, and sending, filing, or executing is G3.
- Match controls to grade: a licensed, accountable attorney reviews substantive output; every citation is verified against a real source; maker-checker gates anything executed or filed; ingested documents are treated as untrusted; everything is logged.
- For AI contract review oversight at G3, prevent — do not review. Require source verification and attorney sign-off so the unverified or unauthorized action cannot go out.
- The three failures that break legal AI human review: trusting AI citations, auto-sending or auto-filing, and ingesting untrusted documents into a privileged session.

## Get started

Building a human in the loop for AI legal and contract work is one application of a general method. Grade your agent's actions with the [interactive grader](index.html#grader), then put citation verification, attorney sign-off, and maker-checker around the G2 and G3 ones using the [playbook](playbook.html). If you have five minutes, the [cheatsheet](cheatsheet.html) is the fastest way in, and [automation bias](article-automation-bias.html) explains why skimming is not oversight.

LoopRails is free and built for practitioners. Grade · Guard · Show · Prove.
</content>
</invoke>
