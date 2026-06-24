# A: Authorized

> Part of the **RAIL** series. Every governed agent action should be **R**eversible, **A**uthorized,
> **I**nterruptible, and **L**ogged. This page goes deep on **A**, Authorized.
>
> See the [`framework.md`](./framework.md) for the full LoopRails method (Grade · Guard · Show ·
> Prove) and [`codex.md`](./codex.md) for the evidence. Bracket tags like `[O-11]` point to the codex.

---

## What "Authorized" means

An action is **authorized** when two things are true at the moment it executes:

1. **The agent holds exactly the permissions this action's grade requires, and no more.** A G0 read
   needs read scope; a G3 payment needs a payment capability that the agent should not be carrying
   around the rest of the time. Authority is matched to consequence (see the grading model in
   [`framework.md`](./framework.md) §2), enforced as *least privilege* and *deny-by-default* [O-10].
2. **For high-stakes (G2 to G3) actions, the proposer is not the approver.** The party that decides to
   take an irreversible step must not be the same party that authorizes it. This is *separation of
   duties*, the maker-checker rule [O-1, N-15].

Authorized is not "the agent felt confident" or "a human clicked yes." It is a property of the
system's permission state: *can this principal, in this context, legitimately do this thing?* If the
answer would be "no" had the request been scrutinized, then the action was never authorized. It was
merely *unblocked*.

---

## Why "a human approved it" is not the same as "it was authorized"

A click is an *event*. Authorization is a *standing, enforced property*.

The codex's central oversight finding is that humans are unreliable approvers. Approval gates cut bad
*actions* but barely improve a human's ability to *catch* a bad one (the exposure-vs-correction gap
[A-17]), and habituation to a repeated prompt sets in neurologically by the *second* exposure [O-16].
So "a human approved it" is a weak signal. It can be rubber-stamped, fatigued through, or, worse,
forged. Several production HITL gates are, by their own documentation, *UX affordances and not
security boundaries*: the Vercel AI SDK warns that its default `needsApproval` is forgeable by
replaying message history unless bound with a server-side secret [A-12].

Authorization answers a different question: *was the capability to do this
ever in the agent's hands, and was it scoped to this task?* That property holds (or fails) whether or
not anyone looked. A correctly authorized system can be safe even when the human glazes over, because
the agent simply never possessed the authority to do the dangerous thing. An approval-only system is
safe only as long as every human stays sharp forever, which the research says they will not [F-9,
A-21, D-18].

To state it directly: **a click that grants ambient, lasting, broad power is a security hole with a human
attached. A scoped, short-lived, revocable grant is authorization even if no human watched it.**

---

## How to implement authorization properly: concrete mechanisms

**1. Least privilege + deny-by-default + complete mediation.** The Saltzer-Schroeder charter [O-10]:
grant only the scopes the task needs, deny by default (fail-safe defaults), and **mediate *every*
action**, not the first one in a session but every one. "Complete mediation" is the load-bearing part.
A check that runs once and then trusts the rest of the session is not mediation, it's a turnstile.
Keep the guard small enough to audit (economy of mechanism) and require two conditions for the most
dangerous actions (separation of privilege).

**2. Scoped, short-lived credentials.** Replace standing API keys with capabilities that are narrow
(this bucket, read-only), time-boxed (minutes, not forever), and audience-bound: OAuth scopes,
workload identity, signed per-task tokens. The economic mirror is exact. Control is exercised
through *selective intervention* (the ability to halt or withdraw access), not an exhaustive rulebook
[J-9]. A credential you can revoke mid-task is authorization; a key the agent memorized is not.

**3. Capability-based security versus ambient authority, and why ambient authority *is* prompt
injection.** *Ambient authority* means the agent can act on anything its identity is allowed to
touch, and authority is selected by *naming* a target ("delete that file"). *Capability-based
security* means authority travels *bound to the request*: you can only act on a resource if you were
handed the unforgeable capability (token/handle) for it [O-11]. This distinction is the whole game
for agents. The **confused deputy** [O-11], a privileged program tricked by a less-privileged caller
into misusing its ambient authority, is *structurally identical to prompt injection* [O-12]: because
operator instructions and untrusted retrieved content flow through one inference pathway, an attacker
who can write to an inbox, an issue, a README, or a fetched page executes with the *agent's*
authority. The fix is not "detect the bad instruction" (you can't reliably). The fix is
**capability-binding**: pass scoped, request-bound capabilities so an injected instruction cannot
reach beyond the legitimate task, plus runtime mediation for irreversible actions *regardless of
where the instruction came from* [O-12].

**4. Per-tool / per-action policy, evaluated by an engine.** Risk-rate every tool (read-vs-write,
reversibility, financial impact, permission scope) and drive allow/ask/deny from that grade [A-6].
Externalize the decision to a policy engine (OPA-style: policy-as-code, evaluated per request)
rather than scattering `if` statements through tool handlers. Be warned that precedence and
inheritance are subtle and *load-bearing*: in the Claude Agent SDK the pipeline is
`Hooks → Deny → Ask → Mode → Allow → canUseTool`, an allow-list does **not** constrain a bypass
mode, and subagents silently inherit a parent's bypass/acceptEdits [A-2]. Order and scope change the
safety semantics, so treat the policy as the artifact you review.

**5. Zero trust: authorize every request in context, not once per session.** No implicit trust from
location or prior auth; make per-request, per-step decisions on identity, posture, and context, and
continuously re-verify [O-13]. For an agent this means a hijacked or *drifting* agent is re-checked
at every tool call. The action that was fine at step 3 is re-evaluated at step 30 against current
context. Session-level trust is exactly the assumption injection exploits.

**6. Just-in-time elevation and break-glass: no standing high privilege.** Agents run low-privilege
by default. Sensitive scopes are granted JIT, time-boxed, behind approval, and revoked after (zero
standing privilege); genuine emergencies use *break-glass*, which is auditable, alarmed, post-hoc reviewed
elevation [O-14]. The industrial twin is permit-to-work: scoped, time-boxed, *named* privilege
elevation [N-13]. A high-privilege token sitting in the agent's environment "just in case" is the
opposite of authorization.

**7. Two-party approval / separation of duties for irreversible actions.** For G3, the proposer must
not be the approver [O-1, N-15]. Split planning, approval, and execution across distinct principals,
and make the second check *genuinely independent* (a different model/prompt/context, not the agent
re-reading itself). An independent double-check catches more errors only when it is actually
independent [N-16]. The nuclear two-person rule [N-15] is the limiting case.

**8. Sub-agents must NOT inherit the orchestrator's authority.** This is the single most violated
rule in real systems and the codex calls it out directly: subagents inherit bypass/acceptEdits and
*cannot be re-tightened* [A-2], and the confused-deputy mitigation explicitly requires that
sub-agents do **not** auto-inherit authority [O-12]. Each delegation must be an **explicit, scoped,
revocable grant**, where the orchestrator hands down a narrow capability for the sub-task, not a copy of
its own keyring. An orchestrator with payment authority spawning a "summarize this webpage" sub-agent
that inherits payment authority is a confused deputy waiting for a poisoned page.

> **The layered authorization stack:** run low-privilege by default (1, 6) → bind authority to the
> request, not the session (3, 5) → evaluate per-tool policy at every call (4) → require two parties
> for the irreversible (7) → hand sub-agents narrow, revocable grants (8) → elevate JIT and break
> glass loudly when you must (6).

---

## Why blocklists/denylists and client-side approvals are NOT authorization

A **denylist forbids a string; authorization removes a capability.** The difference is whether the
agent *could* do the bad thing if it tried a synonym.

The empirical case is decisive. Cursor's YOLO mode shipped a `command_denylist`, and security researchers
found at least four trivial bypasses (base64-piped commands, a `bash -c` subshell, executing a
generated script, and quote variations) with the malice arriving through poisoned `rules.mdc`,
READMEs, or fetched content; the denylist was reportedly deprecated [A-14]. Pattern-matching command
guards are not a sandbox. This is **denylist theater**: it *looks* like a control, produces no
boundary, and worse, manufactures a moral crumple zone by implying safety that isn't there.

Client-side approvals fail the same way for a different reason: they're *forgeable*. The Vercel SDK
documents that its default approval is bypassable by replaying message history unless the approval is
bound with a server-side secret [A-12]. An approval enforced in the UI is a suggestion. An approval
verified server-side, against the actual request, is a control.

Two rules follow:

- **Bind approvals server-side.** The thing that *executes* the action must independently verify the
  authorization, not trust a flag the client sent.
- **Remove the capability instead of forbidding the string.** The poka-yoke principle: make the bad
  action *impossible*, not discouraged [N-6, O-10]. Don't denylist `rm -rf`; run the agent without
  write access to anything it must not delete. A bypassable denylist is policy, not a boundary [A-14].
  Where you need a hard runtime guarantee even under injection, use a *verified shield* / Simplex-style
  monitor that vetoes the action regardless of what the LLM "decides" [O-17, O-18].

---

## The legal mirror

Authorization has a precise legal twin, and it sets real liability.

- **Scope of authority.** An agent (legal sense) acts with *actual* authority granted by the
  principal. Permission scoping is the technical implementation of scope-of-authority [J-13].
- **Apparent authority + ratification.** A principal can be bound by acts it never actually authorized
  *if it created the appearance of authority*, and it *ratifies* an out-of-scope act by accepting the
  result [J-13]. The lesson for builders: a too-broad standing grant, or routinely accepting
  out-of-scope agent actions, can bind the operator beyond what they intended.
- **Liability for in-scope acts.** Under *respondeat superior*, the principal is generally liable for
  the agent's wrongful acts within the scope of agency [J-14]. Because an AI has no intent, the law
  routes responsibility to the human principal, so **narrowing scope is simultaneously a safety
  control and the primary liability lever** [J-14].
- **Non-delegable duties.** Some duties cannot be offloaded at all, and the principal stays liable
  regardless of who performs the act [J-15]. This is a hard legal floor under "a human must decide":
  certain actions are non-delegable to an AI as a matter of law, no matter how good the model is.

Scope is not just a config setting. It is the boundary of what you will be answerable
for.

---

## A maturity checklist for authorization

- [ ] Agent runs **low-privilege by default**; no standing high-stakes capability sits in its
      environment. [O-14]
- [ ] Credentials are **scoped, short-lived, and revocable** (OAuth scopes / workload identity /
      per-task tokens), not standing API keys. [J-9, O-14]
- [ ] **Every** action is mediated, not just the first per session (complete mediation). [O-10]
- [ ] Authority is **bound to the request** (capabilities), not selected by naming a target (ambient
      authority). [O-11, O-12]
- [ ] Authorization is **re-checked per request in context** (zero trust), so a drifting/hijacked
      agent is caught mid-run. [O-13]
- [ ] Per-tool policy lives in a **reviewable policy artifact**; precedence/inheritance is understood
      and tested. [A-2, A-6]
- [ ] **Two parties** for every G3 / irreversible action; the second check is genuinely independent.
      [O-1, N-15, N-16]
- [ ] Sub-agents receive **explicit, scoped, revocable grants**; they do not inherit the
      orchestrator's keyring. [A-2, O-12]
- [ ] Elevation is **just-in-time**; break-glass is auditable, alarmed, and post-hoc reviewed. [O-14]
- [ ] Approvals are **bound server-side**, not enforced client-side. [A-12]
- [ ] Hard limits are enforced by **capability removal or a verified shield**, never by a denylist
      string match. [A-14, N-6, O-17]
- [ ] Scope reflects the **legal scope of authority**; non-delegable decisions keep a human
      decision-maker. [J-13, J-15]

---

## Common mistakes

- **Broad standing tokens.** A long-lived, wide-scope credential the agent carries everywhere. The
  moment of injection, that's the attacker's credential too. Scope it down and time-box it [O-14, J-9].
- **One big API key.** A single key with every scope, shared across every tool, is ambient authority
  by another name, and it turns any confused-deputy moment into total compromise [O-11, O-12]. Split
  capabilities per tool / per task.
- **Sub-agents inheriting everything.** The orchestrator's authority silently flowing into every
  helper agent [A-2]. A web-fetch helper does not need the parent's deploy or payment rights; hand it
  a narrow grant [O-12].
- **Denylist theater.** Treating a string blocklist or a client-side "Approve?" as a security
  boundary when both are trivially bypassed or forged [A-14, A-12]. Remove the capability and bind the
  approval server-side.
- **Approval mistaken for authorization.** Believing that "a human clicked yes" means the action was
  authorized, when the underlying capability was never scoped. It's a rubber-stampable, fatigue-prone,
  sometimes forgeable click [A-17, O-16, A-12].

---

## Sources

Codex tags used: **O-10** (least privilege, fail-safe defaults, complete mediation, separation of
privilege, Saltzer & Schroeder), **O-11** (the confused deputy; capability-based security vs ambient
authority, Hardy), **O-12** (confused deputy = prompt injection; scoped credentials, sub-agents not
inheriting authority, CSA), **O-13** (zero-trust, per-request/per-session authorization, NIST SP
800-207), **O-14** (just-in-time access, zero standing privilege, break-glass), **N-15** (the
two-person rule, nuclear surety), **J-13** (actual vs apparent authority, ratification, Restatement
(Third) of Agency), **J-14** (respondeat superior / vicarious liability for in-scope acts), **J-15**
(non-delegable duty), **A-2** (permission-rule precedence/inheritance; subagents inherit
bypass/acceptEdits, Claude Agent SDK), **A-14** (denylist bypasses; string-matching guards are not a
sandbox, Cursor / The Register).

Supporting tags: **O-1** (maker-checker / four-eyes), **N-16** (independent double-checks), **N-6 /
N-13** (poka-yoke; permit-to-work), **O-17 / O-18** (runtime shields / Simplex), **A-6** (risk-tier
your tools), **A-12** (client-side approvals are forgeable unless bound server-side), **A-17**
(exposure-vs-correction gap), **O-16** (warning habituation), **J-9** (selective intervention as the
real instrument of control).

---

*Companion to [`framework.md`](./framework.md) and [`codex.md`](./codex.md). Part of the RAIL series:
Reversible · **Authorized** · Interruptible · Logged.*
