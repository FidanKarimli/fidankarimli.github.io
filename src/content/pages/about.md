---
title: "About"
description: "About Fidan Karimli: ML engineer and researcher."
---

Hey, I'm Fidan. ML engineer based in Baku (for now). I write about things I learn.

My work so far sits between applied ML and research: adapting language models and retrieval systems to Azerbaijani legal text, self-supervised graph models for proteins, and graph-based recommender systems. I am applying to master's programs in machine learning.

## Education

**BSc in Process Automation Engineering**, Baku Higher Oil School, 2021–2026. Presidential Scholarship.

## Research

- Research collaborator with Prof. Yusuf Yaslan's group, Istanbul Technical University (2026–present): GNN-based cross-market recommendation on the XMarket dataset, focusing on fairness for non-overlapping users.
- A. Najafli, K. Oghuz, **F. Karimli**, Y. Mammadli, R. Khidirov, E. Abdullayev. "Intelligent Structural Hazard Detection and Adaptive Hydraulic Response for Underground Coal Mines." _IEEE AICT 2026_, Baku. Accepted.
- Petnica Summer Institute of Machine Learning (PSI:ML), Serbia, 2026: self-supervised GNN for predicting protein destabilization ([notes](/posts/jepa-for-proteins/)).

## Experience

**Junior AI Engineer**, National AI Center of Azerbaijan (2025–present): LLM fine-tuning (SFT, LoRA), vision-language models for document extraction, and the retrieval stack behind LEGALENS.

## Projects

**Self-supervised GNN for protein stability (PSI:ML 2026).**

- _Problem:_ predict whether a single amino-acid mutation destabilizes a protein, when labelled data is small compared to the number of known structures.
- _What I did:_ pretrained a graph neural network with a JEPA objective on 6,782 protein structures, then fine-tuned it on 271,231 single mutations from MegaScale.
- _Result:_ TODO. ([notes](/posts/jepa-for-proteins/) · TODO: repository link)

**LEGALENS retrieval stack (National AI Center of Azerbaijan).**

- _Problem:_ find the relevant documents among about 1.6M Azerbaijani legal texts for search and RAG.
- _What I did:_ built dense retrieval in Vespa with cross-encoder re-ranking on top, informed by a survey of legal IR methods (SAILER, LegalDuet, DELTA, SEMDR).
- _Result:_ TODO. ([notes](/posts/retrieval-for-rag/))

## Contact

[Email](mailto:fidankarimli152004@gmail.com) · [GitHub](https://github.com/FidanKarimli) · [CV](/cv.pdf) · [LinkedIn](https://www.linkedin.com/in/fidan--karimli/)
