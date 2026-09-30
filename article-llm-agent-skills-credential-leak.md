# Study: Credential Leaks in AI Agent Skills

A 2026 study sampled **17,022 skills** from SkillsMP and identified **520 affected skills containing 1,708 security issues**. Debug logging accounted for **73.5% of vulnerabilities** in the authors’ analysis. The [paper’s June revision](https://arxiv.org/abs/2604.03070v2) reports the methods and definitions.

These are findings about one sampled marketplace, not a universal prevalence estimate for every agent extension. The important failure path is concrete: frameworks can feed tool stdout into model context, carrying credentials along with it.

## What the study adds

The researchers combined static analysis, sandbox testing with mock credentials and comparison of skill descriptions with code behavior. Most cases required examining both descriptions and program logic. Removing a secret from an upstream repository did not remove every forked copy.

The paper was accepted to ASE 2026. Its reported security findings support reviewing skills as dependencies, including how their outputs move through the agent harness.

## Controls to apply

Keep raw credentials outside model-visible text where possible. Broker tool access with narrow, short-lived grants. Redact secrets before logging and before tool output enters context.

Review both instructions and executable resources. Pin reviewed versions, restrict filesystem and network access, and record the source of installed skills. A friendly description is not a permission boundary.

If a real credential is exposed, revoke or rotate it. Deleting the original text cannot invalidate copied credentials. Check logs, prompts and retained artifacts for further exposure.

## Verify the fix

Use mock secrets to exercise normal execution and failure paths. Inspect stdout, logs, model-visible results and allowed outbound requests. Network restrictions help, but logs and permitted output channels can still disclose data.

See [Authorized](rail-authorized.html) and [Logged](rail-logged.html) for the access and record controls.
