# The Lethal Trifecta: How Agents Can Leak Data

Private data, untrusted content and a way to send data out create a dangerous combination. An attacker can hide instructions in material the agent reads and try to make it disclose private information.

“The lethal trifecta” is a useful threat-model shorthand, not an exhaustive account of agent security. Credentials can also leak through ordinary logging or unsafe dependencies without an attacker’s prompt.

## Follow the data path

A support agent reads an account record and a customer message. The message asks it to upload “diagnostic context” to an external URL. If the agent can send arbitrary requests, the tool—not the text response alone—creates the disclosure.

Treat retrieved pages, mail, documents and tool output as data. They cannot expand the originating user’s authorization.

## Break or constrain the path

- Keep unnecessary private data outside the agent’s context.
- Restrict outbound destinations and payloads at the executor.
- Separate untrusted-content processing from sensitive capabilities.
- Use scoped credentials and redact tool results and logs.
- Require appropriate authorization for consequential disclosure.

An allowed host can still be an exfiltration destination if it accepts attacker-controlled uploads or URLs. Disabling open internet access does not inspect every remaining output channel.

## Test beyond obvious attacks

Put malicious instructions in a PDF, code comment or tool result. Try encoded payloads, redirects and an allowed service controlled by the attacker. Check whether logs and final answers expose the same data.

[NIST’s agent-hijacking work](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations) frames indirect prompt injection as an instruction–data separation problem. See [prompt-injection controls](article-prompt-injection-prevention.html) and the [skills credential-leak study](article-llm-agent-skills-credential-leak.html).
