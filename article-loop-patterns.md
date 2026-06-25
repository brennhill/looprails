# Loop Patterns for Engineering and Data Science

A loop prompts an agent, checks the output, decides the next step, and runs until a goal and a "done" condition are met. The part that decides whether a loop is worth running is the verifier: an automated check, not a human's gut, that says whether each iteration improved things. Without it you have an agent making changes fast and you hoping they are good. With it you have a system that can tell on its own whether it is making progress.

This article is a set of recipes. Each one is a loop I have built or watched work, in the same compact shape: what it does, when it is done, what verifies it, and the guardrail that keeps it honest. Some are software engineering loops, some are data science loops, and they share a spine. If you want the why behind the shape, read [loop engineering](article-loop-engineering.html) first, or [how to build your first agent loop](article-build-agent-loop.html) if you have not built one yet. This piece assumes you have, and you want patterns you can copy.

Two ideas recur, so I will say them once up front. The done-condition is what makes a loop terminate. The verifier is what makes it trustworthy. And when the agent can see the thing that grades it, it will optimize the grader instead of the work, so the strongest verifiers are the ones the loop cannot reach.

## Engineering loops

### Test-fixing loop

**What it does:** takes a suite with failing tests and edits the code until the suite is green.

**Done when:** the full suite passes and no test that passed before now fails.

**Verifier:** the test runner, plus a regression check that compares the current pass set against the pass set from before the loop started. The runner alone is not enough. A bare "make the tests pass" instruction has an obvious shortcut: delete the failing test, or weaken its assertions until nothing fails. The regression check is what closes that door. It says the loop must not reduce the number of passing tests and must not modify the tests at all. If the agent touches a test file, that iteration is rejected regardless of the exit code.

**Guardrail:** the test files are read-only to the loop. Freeze them. The agent fixes product code; it does not get to renegotiate the contract it is graded against. Cap iterations too, because a loop that cannot find a fix will keep rewriting the same three lines forever and burn your budget. On the last failed pass, hand the diff to a human instead of declaring victory.

### Refactor loop

**What it does:** restructures code (extract a function, collapse duplication, rename across a module) without changing what the code does.

**Done when:** the existing suite is still green and observable behavior is identical to before.

**Verifier:** the existing test suite catches gross regressions, but a refactor that passes the existing tests can still change behavior the tests never exercised. So before the loop runs, you add characterization tests: tests that pin down the current behavior, including the weird edges, by recording what the code actually does today rather than what it should do. The refactor must leave those green. Together the two suites say the structure changed and the behavior did not.

**Guardrail:** same as the test-fixing loop, and it matters more here, because the loop is being graded by tests and is editing code right next to them. It must not edit the tests it is being graded by. Freeze both the existing suite and the characterization tests. The day you let a refactor loop adjust a test "because the new structure made it cleaner" is the day your verifier stops meaning anything. If a characterization test genuinely encoded a bug, a human pulls it out of the frozen set deliberately, before the run, with a note saying why.

### Dependency-upgrade loop

**What it does:** bumps a dependency to a newer version and fixes whatever breaks: changed APIs, removed functions, new required arguments.

**Done when:** the project builds and the full test suite passes against the new version.

**Verifier:** CI. The real build, the real test run, in the environment that matters, not a local "works on my machine" pass. Dependency upgrades break in ways that depend on the platform, the lockfile, and transitive versions, so the check has to be the pipeline that gates your merges.

**Guardrail:** one dependency at a time, in an isolated worktree. This is the rule people skip and regret. If you let the loop bump five packages at once and the build breaks, you cannot tell which bump caused it, and neither can the agent, so it flails. One dependency per run gives a clean attribution: this version, this break, this fix, or this version is not viable yet, revert and move on. The isolated worktree keeps a failed upgrade from contaminating your working tree or another run in parallel. Cap the loop on spend, because some upgrades cascade (a major version pulls a peer dependency that pulls another) and you want it to stop and ask rather than chase the chain to the bottom.

### Plan-in-simulation loop

**What it does:** before it commits to a consequential action, the loop predicts the outcome with a model of the environment (a world model) or a dry-run, compares a few candidate actions, and runs the one with the best predicted result.

**Done when:** the chosen action runs and the real check confirms the predicted outcome held.

**Verifier:** the real environment, after the fact. The prediction only picks the candidate; the actual check still decides whether the step counts. Compare the predicted outcome against the observed one and log the gap, because a widening gap means the predictor is drifting and the preview is getting less trustworthy.

**Guardrail:** the world model is a model, so its prediction is a claim, not a result you can bank. Never let a predicted-good outcome auto-approve an irreversible action. A simulation lowers how often a reversible action needs a human; it does not remove the human at a G3 action. Cap how far ahead the loop plans, since prediction error compounds over a long rollout. For the full treatment see [world models for agent loops](article-world-models-agent-loops.html).

## Data science loops

The engineering loops above lean on tests most teams already have. Data science loops need verifiers you usually have to build on purpose, and the temptation to skip them is stronger because the work feels exploratory. Resist that. An exploratory loop with no verifier is an expensive way to fool yourself. This is the heart of [evaluation-driven development](article-evaluation-driven-development.html): the check comes first, and the loop runs against it.

### Data-cleaning loop

**What it does:** takes a messy dataset (inconsistent types, nulls where there should not be any, duplicate keys, values out of range) and transforms it until it meets a schema and a quality bar.

**Done when:** every validation rule passes and the row count is still in a sane range relative to the input.

**Verifier:** a data-validation suite that runs after each transform. It checks the schema (column names, types, required fields), value ranges (an age is not negative, a percentage is not 1{,}300), null rates (this column may be at most 2{%} null), uniqueness (the primary key has no duplicates), and referential checks (every foreign key points at a row that exists). The suite returns a pass or fail per rule, and the loop iterates until all of them pass.

**Guardrail:** the row-count check is the one that saves you. The easy way to make every validation rule pass is to drop every row that violates one. A loop told only "satisfy the schema" will happily hand you a clean dataset of forty rows out of a million and report success. So you bound the row count: the output may lose at most some small fraction of the input, and a larger loss fails the run and goes to a human. Clean the data, do not delete the data. Keep a sample of the rows that were dropped or modified too, so a person can spot a transform that is "fixing" values by quietly corrupting them.

### Feature and experiment loop

**What it does:** tries to improve a model metric by adding features, changing the model, or tuning it, one experiment per iteration.

**Done when:** the evaluation metric beats the baseline on a held-out test set by a margin you decided in advance.

**Verifier:** an eval harness that scores the model on a frozen test set the loop cannot see or touch. This is the rule the whole pattern stands on. If the loop can see the test set, it will overfit to it. Not because it is malicious, but because that is what optimization does: given a target it can observe, it shapes itself to that target, and a test set it can read becomes part of the training signal whether you meant it to or not. You get a number that looks great and a model that fails the moment it meets data it has not memorized. So split the data three ways: train (the loop learns on it), validation (the loop may look at this to decide what to try next), and test (frozen, scored only at the end, never exposed to the loop). The test number is the only one that counts as "done."

**Guardrail:** hold the test set out, mechanically, not by trusting the loop to behave. Put it behind an interface that returns a score and nothing else, so the loop gets a number and never the rows or the labels. Cap the number of times the loop may score against the test set, too, because even a black-box score, queried a thousand times, leaks enough signal to overfit by selection. A handful of final evaluations, not a tight loop against the held-out number. The validation set is where the loop iterates; the test set is where it is judged once.

### Labeling and active-learning loop

**What it does:** runs a model over unlabeled data, routes the items it is least confident about to a human for labels, folds those labels back in, retrains, and repeats. The human spends their time on exactly the examples that teach the model the most.

**Done when:** agreement or accuracy crosses a threshold you set, or you run out of labeling budget, whichever comes first.

**Verifier:** a held-out gold set, labeled carefully by people, that the loop is measured against after each retrain. You also track inter-rater agreement on the human labels themselves, because if your labelers do not agree with each other, no amount of retraining will push accuracy past the noise in the labels. The gold set tells you whether the model is getting better. The agreement number tells you whether "better" even means anything yet.

**Guardrail:** keep the gold set out of the training data, the same way you keep a test set out of an experiment loop. If gold examples leak into training, your accuracy number is measuring memorization again. And watch the confidence routing: a model can be confidently wrong, so do not let "high confidence" auto-accept its way into the training set without spot-checks from a human. The loop should route uncertain items to people, not quietly teach itself on its own guesses.

## The pattern under the patterns

Read those six back to back and the shape is the same every time. A done-condition that makes the loop stop. A verifier that makes the result mean something. A guardrail that almost always comes down to one move: keep the thing that grades the loop out of its reach.

Frozen tests, a held-out test set, a gold set the training never sees, a row-count floor the cleaning cannot dodge. Different names, one idea. An agent optimizes whatever it can observe, so the verifier you can trust is the one it cannot touch, edit, see, or argue with. The done-condition makes the loop terminate. The verifier makes it trustworthy. And the independence of that verifier is why the number it reports is worth believing.

Build the loop, then build the thing that keeps it honest, and make sure that thing sits where the loop cannot reach it. When you move from one loop to many running unattended, the next concern is keeping them inside their bounds: that is the subject of [keeping an autonomous loop on the rails](article-loop-engineering-oversight.html). For how the whole approach fits together, including where a human still belongs, start with the [LoopRails framework](framework.html).
