# I: Interruptible

An interruptible system can stop scheduling new actions, cancel supported running work and check which actions completed already committed. The stop mechanism must operate outside the model’s willingness to cooperate.

“Stop everything instantly” is not a defensible promise for distributed services. Define scope and measure latency.

## Use the right stop

| Control | Behavior |
|---|---|
| Pause | Blocks new steps and preserves state |
| Graceful cancel | Requests a safe stop from running operations |
| Hard stop | Terminates execution or revokes access |
| Circuit breaker | Stops automatically at a measured threshold |

A local process can end while an external request continues. A submitted transfer or delivered message may already be irreversible.

## Propagate cancellation

Use shared stop state checked before tool execution and checkpoint resume. Reach child agents, workers, queues, retry schedulers and long-running processes. Revoke credentials or block egress when needed.

Preserve a record of completed, canceled and uncertain effects. Reconcile with authoritative service state before restarting. Critical stops need deliberate reauthorization; transient availability breakers may use bounded probes.

## Make intervention usable

Give authorized users an accessible pause and operators the broader controls they need. Support stopping before the operator has diagnosed the cause, without social penalty. Protect the mechanism against unauthorized disruption.

Handoffs need the goal, completed actions, current state, unresolved decision and remaining time. Model steerability is a separate capability: changing an instruction does not guarantee reliable replanning.

## Test it

Stop during a long call, a child-agent task, an external submission and checkpoint resume. Measure when new effects cease and inspect orphaned work.

The [SEC’s Knight Capital account](https://www.sec.gov/newsroom/press-releases/2013-222) documents failed deployment and risk controls. It motivates layered response, not a single-cause “no kill switch” story.

See [kill switches](article-ai-kill-switch.html), [circuit breakers](article-circuit-breaker-ai-agents.html) and the [Kit](kit.html).
