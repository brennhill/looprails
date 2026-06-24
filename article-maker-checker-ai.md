# Maker-Checker (Four-Eyes) for AI Agents

Maker-checker (also called the four-eyes principle) for AI agents is a control where one party proposes an action and a different, independent party must approve it before it takes effect. For AI agents, the agent is the maker: it drafts the change, the transaction, the deletion. A human or a second, independent system is the checker: it reviews and either approves or rejects before anything happens in the real world. The point is structural. No single actor, human or machine, can both originate a high-stakes action and put it into effect.

This article covers where maker-checker comes from, why proposer ≠ approver matters specifically for AI, which agent actions actually need it, how to implement it without it becoming theater, and the failure modes that quietly turn a two-person control back into a one-person rubber stamp.

## What maker-checker is, and where it comes from

The four-eyes principle is old. Finance has used it for decades: a payment, a wire, a journal entry above a threshold requires two sets of eyes before it clears. The same idea appears in high-consequence settings as the two-person rule, where no single individual can carry out a critical action alone. Both are instances of separation of duties: split a sensitive operation so that initiating it and authorizing it are different jobs held by different people.

The control works because it does not depend on any one person being careful, honest, or awake. It assumes mistakes and bad intent are possible and structures the work so a single failure is not enough to cause harm. That assumption is exactly the one you want when an AI agent is involved.

In LoopRails terms, maker-checker is a named pattern. It is the concrete shape that the **Authorized** rail takes for the riskiest actions: for high-stakes operations, whoever proposes is not the one who approves. See [the RAIL model's Authorized rail](rail-authorized.html) for how this fits the broader framework.

## Why proposer ≠ approver matters for AI agents

With a human worker, separation of duties guards against error and fraud. With an AI agent, it guards against something additional. The agent has no skin in the game, no fear of consequences, and a well-documented tendency to be confidently wrong. An agent that proposes and executes its own actions is a single point of failure with superhuman speed.

The core LoopRails question is simple: can a human realistically catch this mistake in time? When the agent both decides and acts, the answer for fast, irreversible actions is no. There is no window. Maker-checker manufactures that window. It forces the agent to stop at "here is what I want to do" and hand the decision to an independent checker before the action becomes real.

This is also why the checker should be independent of the maker. If the same model, same context, and same prompt that produced the action also reviews it, you have not added eyes, you have added a mirror. Independence means a different identity, ideally different reasoning, and a human with authority in the loop for the highest stakes.

## Which agent actions need maker-checker

You do not put four eyes on everything. That is how you train people to click "approve" without reading. Maker-checker is for the top of the risk scale.

Use the [LoopRails grader](index.html#grader) to assign each action a grade by reversibility, blast radius, and stakes:

- **G0 to G1:** Low risk, reversible, small blast radius. Let the agent run. No checker needed.
- **G2:** Meaningful but recoverable. Often handled with guardrails, logging, and post-hoc review rather than a blocking second approval. See the [G2 playbook](guide-g2.html).
- **G3:** Irreversible, high blast radius, or high stakes. This is where maker-checker is recommended. See the [G3 playbook](guide-g3.html).

Concrete G3 examples that warrant a separate checker: deleting production data, sending money or moving funds above a value threshold, deploying to production, sending external communications on behalf of the organization, modifying access controls or credentials, and signing or submitting anything legally binding.

Value thresholds make this practical. You do not need a human to approve a $2 refund. You do need one for a $20,000 wire. Set explicit thresholds per action type so the control fires exactly where the cost of being wrong exceeds the cost of a second pair of eyes. The [framework overview](framework.html) and the [grading cheatsheet](cheatsheet.html) walk through setting these lines.

## How to implement maker-checker for agents

Getting the intent right is half the work. The implementation is where most maker-checker controls quietly fail.

**Separate identities.** The maker and the checker must be distinct, authenticated principals. The agent acts under its own identity with permission to *propose* but not to *commit* G3 actions. The approval is granted by a separate human or system identity. If the agent holds the credentials that finalize the action, you have separation in name only.

**Server-bound approval that cannot be forged or replayed.** The approval must be enforced where the action actually executes, not in the agent's own reasoning or in client-side UI. An agent that can talk itself into believing it was approved, or that can reuse a stale approval token for a new action, has defeated the control. Bind each approval to a specific action, a specific payload, and a single use. Tie it to a signed, server-side record so it cannot be replayed against a different request. This is also what makes the action auditable; see the [Logged rail](rail-logged.html) for why every proposal, approval, and rejection should be recorded.

**Show the real diff, not a summary.** The checker must approve what will actually happen, not the agent's description of what will happen. If the agent both performs the action and writes the summary of it for the approver, the agent controls both sides of the conversation. Present the literal diff: the exact rows to be deleted, the exact recipient and amount, the exact files to be changed. The whole value of a second set of eyes evaporates if those eyes only see the maker's own marketing copy.

For more on building approval into agent workflows end to end, see [the approval-design article](article-ai-agent-approval.html) and the hands-on [LoopRails playbook](playbook.html).

## Failure modes: when four eyes see nothing

Maker-checker is easy to implement badly. These are the ways it reverts to a one-person rubber stamp.

**Both parties rubber-stamping.** Automation bias means a lone approver tends to approve. When the maker is an AI that is fluent, fast, and usually right, the checker's default drifts toward "looks fine, approve." Over time the human becomes a clicker. Separation of duties only helps if the checker has real authority, awareness, ability, and accountability, the four A's, and is not just clicking yes. Design for those: give the checker the information, the time, and the standing to say no.

**The checker lacks real authority: the moral crumple zone.** If the human can technically reject but is measured on throughput, has no time to actually review, or will be blamed when they block a deployment but never credited for catching a problem, you have built a moral crumple zone. The human absorbs accountability for a decision the system did not really let them make. That is worse than no checker, because it launders the agent's actions through a person who could not meaningfully refuse. A checker without genuine authority is a liability shield, not a control.

**AI-checks-AI collusion.** Using a second AI as the checker is tempting and sometimes appropriate for lower grades, but it is fragile at G3. Two models drawn from similar training, given similar context, tend to make correlated errors and miss the same things. They can also be jointly manipulated by the same crafted input. AI-checks-AI gives you two instances of the same failure mode, not independence. For irreversible actions, the checker should be a human with authority, or at minimum a genuinely independent system with different inputs and assumptions.

None of these are hypothetical. Research on AI coding agents found that plan-approval steps reduced attacks, but human intervention success stayed only 9 to 26 percent (see the [LoopRails codex](codex.html)). In other words, even when a human was placed in the loop, they caught the bad action only a small fraction of the time. That is the gap maker-checker has to overcome through real authority and real diffs, not through the mere existence of an approve button.

## Key takeaways

- **Maker-checker (four-eyes) for AI agents** means the agent proposes and a separate, independent party approves before the action takes effect. Proposer ≠ approver is the whole point.
- It descends from the four-eyes principle, the two-person rule, and separation of duties. It works because it does not rely on any single actor being careful.
- Apply it to G3 actions: irreversible, high blast radius, or high stakes, plus value thresholds for money. Skip it for G0 to G1; use lighter controls for G2.
- Implement with separate identities, server-bound single-use approvals that cannot be forged or replayed, and the real diff shown to the checker, never the agent's own summary.
- Watch the failure modes: mutual rubber-stamping driven by automation bias, a checker without real authority (the moral crumple zone), and AI-checks-AI collusion that only looks like independence.
- A checker needs the four A's: authority, awareness, ability, and accountability. Without them, four eyes see nothing.

## Get started

Maker-checker is one pattern in a complete system for human-in-the-loop oversight. Start with the [LoopRails framework](framework.html) to grade your agent's actions, then use the [G3 playbook](guide-g3.html) to put real separation of duties around the irreversible ones. If you only have five minutes, the [cheatsheet](cheatsheet.html) and the [automation-bias article](article-automation-bias.html) are the fastest way in.

LoopRails is free and built for practitioners. Grade · Guard · Show · Prove.
