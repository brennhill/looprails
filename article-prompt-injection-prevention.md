# Reducing Prompt-Injection Risk in AI Agents

Prompt injection puts malicious instructions inside material an agent treats as task data: web pages, emails, documents, code or tool results. The goal is to redirect its actions or expose information.

No prompt-based defense establishes universal prevention. Design so a successful instruction attack still encounters limited permissions and execution checks.

## Keep authority separate from content

Only trusted task instructions and policy can authorize actions. Retrieved text cannot grant permission, change the recipient of a transfer or disable a control. Preserve provenance so the agent and reviewer can see where information came from.

Where possible, use structured extraction for untrusted data and keep it away from components with broad effectful tools. Structured output reduces ambiguity; it does not prove the extracted content is benign.

## Bound the executor

Restrict filesystem access, credentials, network destinations and payloads. Check actual tool arguments against the authorized task. Require an appropriate decision before sensitive uploads or irreversible actions.

Input screening and model reviewers can add coverage, but attackers can evade them. Combine them with controls whose enforcement does not depend on interpreting the malicious text correctly.

## Evaluate the whole attack path

Test instructions hidden in retrieved documents, tool output, dependencies and persistent memory. Include encoded data, multi-step attacks and attempts to bypass a denied action. Measure harmful effects, not only whether the final answer repeats the injected instruction.

[NIST’s hijacking-evaluation work](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations) supports testing indirect attacks against real agent workflows. Its security analysis does not imply that one filter or benchmark score closes the risk.

Use [least privilege](article-least-privilege-ai-agents.html), [sandboxing](article-ai-agent-sandboxing.html) and the [guardrails checklist](kit.html) together.
