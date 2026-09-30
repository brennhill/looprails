# LoRA, Fine-Tuning and Pretraining

Model adaptation changes a model’s learned behavior. Retrieval supplies information when it answers. Execution controls limit what it can do. Choose the tool that addresses your problem.

LoRA is a parameter-efficient **fine-tuning method**, not a separate category alongside fine-tuning.

| Method | What changes | Good fit | Main cost or risk |
|---|---|---|---|
| Prompting and retrieval | Runtime instructions and evidence | Clearer tasks and fresh knowledge | Context quality and recurring inference cost |
| LoRA or other adapters | A small set of trainable parameters | Repeated domain behavior with supported weights | Data quality, base-model dependence and evaluation |
| Full fine-tuning | Many or all model parameters | Broader adaptation when resources justify it | Compute, storage and capability regressions |
| Continued pretraining | Existing weights on additional corpus data | Domain distribution adaptation | Forgetting, contamination and uncertain gains |
| Pretraining from scratch | A new model’s parameters | Exceptional scale and requirements | Large data, compute and operational burden |

The [original LoRA paper](https://arxiv.org/abs/2106.09685) describes low-rank adaptation. Actual savings and quality depend on model, implementation and task.

## Diagnose before adapting

If the failure is missing current facts, improve retrieval. If it is poor task definition, improve the contract. If it is an unauthorized action, improve execution controls. Fine-tuning is not a permission boundary.

Consider adaptation when representative failures show a repeated behavior that instructions and tools do not solve economically. Use clean training examples and a held-out comparison against the original model.

## Evaluate the whole loop

Measure target behavior, regressions, safety, latency and cost. Keep data provenance and deployment versions. A tuned generator still needs independent checks, action limits and recovery.

API providers may offer fine-tuning without exposing weights. Availability and supported methods change; verify the current model’s documentation. See [models you do not control](article-adapting-models-you-dont-control.html) and the [adaptation worksheet](kit.html).
