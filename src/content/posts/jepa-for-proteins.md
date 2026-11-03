---
title: 'JEPA for proteins: notes from PSI:ML'
description: 'Predicting in representation space instead of pixel space, and why that is a good fit for learning protein structure before predicting mutation effects.'
pubDatetime: 2026-11-01T00:00:00Z
featured: true
tags: ['jepa', 'self-supervised', 'gnn', 'proteins']
---

> **Example draft.** This post shows the format. The general explanation is written to be correct; anything about my specific setup is marked TODO and needs checking before publishing.

This summer at the Petnica Summer Institute of Machine Learning (PSI:ML) I worked on a question that sounds simple: if you change one amino acid in a protein, does the protein become less stable? Labelled data for this exists, but it is small compared to the number of known structures. That gap is exactly where self-supervised pretraining helps.

## The problem

A protein's stability is usually summarised by its folding free energy. A mutation changes it by

$$
\Delta\Delta G = \Delta G_{\text{mutant}} - \Delta G_{\text{wild type}},
$$

and a positive $\Delta\Delta G$ (in the usual sign convention) means the mutant is less stable. The goal is a model $f$ that takes a structure and a mutation and returns an estimate $\hat{y} \approx \Delta\Delta G$.

## Why JEPA

Most self-supervised methods either *reconstruct* the input (masked autoencoders) or *contrast* views of it (SimCLR-style). A **Joint-Embedding Predictive Architecture** does something in between: it hides part of the input and asks the model to predict the *representation* of the hidden part, not its raw values.

There are three networks:

- a **context encoder** $E_\theta$ that sees the visible part $x_c$,
- a **target encoder** $\bar{E}$ that sees the full input and produces targets,
- a **predictor** $g_\phi$ that maps the context representation to the representation of each masked block $m_i$.

The loss is a distance in embedding space:

$$
\mathcal{L}(\theta, \phi) = \frac{1}{|M|} \sum_{i \in M} \left\| \, g_\phi\big(E_\theta(x_c),\, m_i\big) - \operatorname{sg}\big(\bar{E}(x)_{m_i}\big) \right\|_2^2 ,
$$

where $\operatorname{sg}$ is stop-gradient. The target encoder is not trained by backprop; its weights follow the context encoder as an exponential moving average,

$$
\bar{\theta} \leftarrow \tau \bar{\theta} + (1 - \tau)\, \theta, \qquad \tau \in [0.99, 1).
$$

Predicting embeddings instead of raw coordinates matters for proteins: the exact position of every side-chain atom is partly noise, while *which residues interact with which* is the part we care about.

## From a protein to a graph

A structure becomes a graph by treating residues as nodes and connecting residues that are close in space (for example, $C_\alpha$ atoms within some cutoff). A graph neural network then plays the role of the encoders above, and "masking a block" means hiding a connected patch of residues.

```python
# Sketch of one JEPA training step on a residue graph (illustrative, not the project code).
ctx_nodes, target_blocks = sample_masks(graph)          # visible residues + hidden patches
z_ctx = context_encoder(graph, ctx_nodes)               # GNN on the visible subgraph
with torch.no_grad():
    z_full = target_encoder(graph)                      # EMA copy, sees everything

loss = 0
for block in target_blocks:
    pred = predictor(z_ctx, block)                      # predict embeddings of hidden residues
    loss = loss + F.mse_loss(pred, z_full[block])
loss = loss / len(target_blocks)

loss.backward(); optimizer.step()
ema_update(target_encoder, context_encoder, tau=0.996)
```

## What I did

| Stage | Data | Objective |
| --- | --- | --- |
| Pretraining | 6,782 protein structures | JEPA loss above |
| Fine-tuning | 271,231 single mutations (MegaScale) | regression on $\Delta\Delta G$ |

TODO: describe the actual encoder (which GNN, node and edge features), the masking strategy, and how the mutation is fed to the fine-tuning head.

## Results

TODO: add the main metric (for example Spearman correlation on a held-out split) and a comparison with training from scratch. Add a figure:

<figure>
  <!-- TODO: replace with a real plot, e.g. predicted vs. measured ΔΔG -->
  <figcaption>Figure 1. TODO: predicted vs. measured ΔΔG on the test set.</figcaption>
</figure>

## What I would try next

TODO: two or three honest open questions, e.g. whether pretraining helps more for proteins far from the fine-tuning distribution.

*Code: TODO link to the project repository.*
