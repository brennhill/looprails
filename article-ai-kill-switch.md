# Kill Switches for AI Agents

A kill switch blocks new work and tries to stop work already running. It must work even if the model ignores it. Test what it stops and how long that takes.

It cannot unsend an email, undo a settled payment or guarantee cancellation of a request already accepted by another service.

## Decide what the stop must do

| Control | Purpose |
|---|---|
| Pause | Stop scheduling new steps while preserving state |
| Graceful cancellation | Ask running operations to finish or abort safely |
| Hard stop | Terminate processes or revoke execution access |
| Circuit breaker | Trigger a stop when a measured condition crosses a limit |

Decide which control applies to each tool. Some external operations continue after the local process exits.

## Implement the stop

Check a shared cancellation state before every action and when resuming a checkpoint. Propagate it to child agents, workers, queues and scheduled jobs. Cancel requests where the provider supports it. Revoke credentials or block egress when needed.

Preserve enough state to reconcile completed, canceled and uncertain effects. Require a deliberate restart after a critical stop, with a named owner and a fresh scope check.

Give authorized users an accessible pause and trained operators the appropriate broader stop. Keep stopping socially cheap, while protecting the control against unauthorized disruption.

## Test the worst moment

Stop during a long tool call, after a payment submission, while a child agent is running and during resume. Measure time until no further permitted effects can occur. Check for orphaned processes and queued jobs.

The [SEC’s Knight Capital findings](https://www.sec.gov/newsroom/press-releases/2013-222) describe deployment and risk-control failures. Use the incident as a lesson in layered prevention and response, not as proof that one button would have prevented every loss.

See [Interruptible](rail-interruptible.html) and [circuit breakers](article-circuit-breaker-ai-agents.html) for related controls.
