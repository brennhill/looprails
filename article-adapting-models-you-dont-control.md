# Adapting Models You Do Not Control

A hosted API gives access to inference and sometimes managed fine-tuning. An open-weight model gives access to parameters, subject to its license. Deployment method and weight access are separate choices: open-weight models can also be hosted by a provider.

## What you can change

| Lever | Hosted API | Open weights |
|---|---|---|
| Instructions, context and retrieval | Usually supported | Supported by your harness |
| Tools, checks and action limits | Your application controls these | Your application controls these |
| Managed fine-tuning | Depends on provider and model | May be available through a host |
| Local adapters or full-weight training | Usually unavailable without weights | Possible with compatible tooling and resources |
| Serving stack and quantization | Provider-defined options | More control, more operational responsibility |

Open weights do not automatically mean open training data, unrestricted licensing or reproducible training. Check the actual terms and artifacts.

## Improve the surrounding system first

Clarify the task, retrieve relevant evidence, simplify tools and strengthen the verifier. Evaluate those changes before assuming model training is necessary.

If the failure is a stable learned behavior, fine-tuning may help. If it is stale knowledge, retrieval is often a more direct remedy. Neither replaces authorization and isolation.

## Count the operational trade

Owning deployment adds hardware planning, patching, monitoring and reliability work. A hosted provider adds dependency, data-handling and version-change considerations. Privacy depends on the complete data flow; it is not guaranteed by either label.

Use representative cases to compare quality, latency, cost and control requirements. Record the exact model version and settings, and retest on changes. Historical capability claims should not substitute for current model documentation.

The [adaptation guide](article-lora-vs-fine-tuning-vs-pre-training.html) explains training methods. Use the [worksheet](kit.html) to capture the decision and evidence.
