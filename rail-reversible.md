# R: Reversible or Contained

A reversible action has a tested way to restore the relevant state. When true undo is impossible, containment can reduce the consequences—but it is not the same as reversal.

## Choose a recovery mechanism

| Mechanism | Useful for | Limit |
|---|---|---|
| Version control or snapshots | Local artifacts and supported state | Does not reverse external side effects |
| Database transactions | Changes within supported transactional scope | External calls and some operations lie outside it |
| Staging and delayed commitment | Checking before publication or submission | After commitment, recovery may disappear |
| Compensating actions | Distributed workflows | Compensation may not undo every consequence |
| Disposable environments | Exploration and testing | Sensitive output can still escape through permitted channels |

A send delay provides time to cancel an email before delivery. It is not a reliable undo afterward. A software rollback may restore code while leaving a data migration or user-visible effect intact.

## Design before execution

Record the starting state, recovery owner, maximum delay and effects that cannot be undone. Keep backups outside the agent’s destructive scope and test restoration. A backup that has never been restored is an unproven recovery plan.

Use idempotency and reconciliation for retries. If the service committed an action but the response was lost, repeating it can create another effect.

## Check the risk reduction

Recovery can lower a consequence grade only when it covers the relevant harm within an acceptable time. Restoring a file does not undo a secret disclosure.

Test partial failure, cancellation, corrupted checkpoints and dependencies that remain changed after rollback. Verify final state, not only that the recovery command exited successfully.

The [saga references](codex-loops.html#ref-FR-7) explain compensation across distributed work. See [failure recovery](article-failure-recovery-agent-loops.html), the [grading rule](framework.html#2-grade-the-action) and the [Kit](kit.html).
