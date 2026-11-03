---
title: 'Retrieval for RAG: dense retrieval, then re-ranking'
description: 'Why most retrieval-augmented systems search in two stages: a fast bi-encoder to find candidates and a slower cross-encoder to order them.'
pubDatetime: 2026-10-25T00:00:00Z
cover: '../../assets/covers/rag.svg'
subtitle: 'Retrieve fast, then re-rank carefully'
tags: ['rag', 'retrieval', 'nlp']
---

> **Example draft.** A general explainer to show the format. Check anything about work projects before publishing.

A retrieval-augmented generation (RAG) system [[1]](#ref-1) is <mark>only as good as the passages it hands to the language model</mark>. If the right document is not in the top few results, the generator cannot use it. In practice, most good retrieval stacks split the job into two stages.

## Stage 1: dense retrieval with a bi-encoder

A **bi-encoder** [[2]](#ref-2) [[5]](#ref-5) embeds the query and each document *separately*:

$$
s(q, d) = \frac{E_q(q)^\top E_d(d)}{\lVert E_q(q) \rVert \, \lVert E_d(d) \rVert}.
$$

Because $E_d(d)$ does not depend on the query, every document can be embedded once, offline, and stored in an approximate nearest-neighbour index. A query then costs one forward pass plus a vector search, which is what makes searching millions of documents fast.

Bi-encoders are usually trained with a contrastive (InfoNCE [[3]](#ref-3)) loss: for a query $q$ with a relevant document $d^+$ and a batch of other documents $d_j$,

$$
\mathcal{L} = -\log \frac{\exp\big(s(q, d^+)/\tau\big)}{\sum_{j} \exp\big(s(q, d_j)/\tau\big)} .
$$

The weakness is the same as the strength: query and document never "see" each other, so fine-grained matches (a specific article number, a negation) are easy to miss.

## Stage 2: re-ranking with a cross-encoder

A **cross-encoder** [[4]](#ref-4) reads the query and a document *together* and outputs one relevance score:

$$
s_{\text{cross}}(q, d) = w^\top \, \text{BERT}\big([\texttt{CLS}]\; q \;[\texttt{SEP}]\; d\big)_{[\texttt{CLS}]} .
$$

Every token of the query can attend to every token of the document, so it is much more accurate, and much more expensive: nothing can be precomputed. So <mark>it only runs on the top $k$ candidates from stage 1</mark>.

```text
query ──► bi-encoder ──► ANN index (all documents) ──► top-k (e.g. 100)
                                                          │
                                                          ▼
                                   cross-encoder scores each (query, doc) pair
                                                          │
                                                          ▼
                                             top-n (e.g. 5) ──► LLM prompt
```

## The trade-off in one table

|  | Bi-encoder | Cross-encoder |
| --- | --- | --- |
| Sees query and document | separately | together |
| Document embeddings precomputed | yes | no |
| Cost per query | one encoding + vector search | one forward pass **per candidate** |
| Typical role | recall: find candidates | precision: order them |

## A minimal version

```python
from sentence_transformers import SentenceTransformer, CrossEncoder, util

bi = SentenceTransformer("BAAI/bge-m3")
ce = CrossEncoder("BAAI/bge-reranker-v2-m3")

doc_emb = bi.encode(docs, normalize_embeddings=True)          # offline, once

def search(query, k=100, n=5):
    q = bi.encode(query, normalize_embeddings=True)
    hits = util.semantic_search(q, doc_emb, top_k=k)[0]        # stage 1
    pairs = [(query, docs[h["corpus_id"]]) for h in hits]
    scores = ce.predict(pairs)                                 # stage 2
    ranked = sorted(zip(scores, pairs), key=lambda x: -x[0])
    return [doc for _, (_, doc) in ranked[:n]]
```

At scale the in-memory search is replaced by a search engine such as Vespa, which handles the vector index, filtering and serving.

## Where this comes from

At the National AI Center of Azerbaijan I built the retrieval stack behind LEGALENS: dense retrieval over about 1.6M legal documents in Vespa, with cross-encoder re-ranking on top.

TODO: what was hard about legal text specifically (long documents, citations, Azerbaijani morphology), and what you measured (e.g. recall@k before and after re-ranking), if you can share it.

## Further reading

TODO: link the legal IR papers you surveyed (SAILER, LegalDuet, DELTA, SEMDR) with one line each.

## References

<ol class="references">
  <li id="ref-1">P. Lewis et al. “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.” <em>NeurIPS</em>, 2020. <a href="https://arxiv.org/abs/2005.11401">arXiv:2005.11401</a></li>
  <li id="ref-2">V. Karpukhin et al. “Dense Passage Retrieval for Open-Domain Question Answering.” <em>EMNLP</em>, 2020. <a href="https://arxiv.org/abs/2004.04906">arXiv:2004.04906</a></li>
  <li id="ref-3">A. van den Oord, Y. Li, O. Vinyals. “Representation Learning with Contrastive Predictive Coding.” 2018. <a href="https://arxiv.org/abs/1807.03748">arXiv:1807.03748</a></li>
  <li id="ref-4">R. Nogueira, K. Cho. “Passage Re-ranking with BERT.” 2019. <a href="https://arxiv.org/abs/1901.04085">arXiv:1901.04085</a></li>
  <li id="ref-5">N. Reimers, I. Gurevych. “Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks.” <em>EMNLP</em>, 2019. <a href="https://arxiv.org/abs/1908.10084">arXiv:1908.10084</a></li>
</ol>
