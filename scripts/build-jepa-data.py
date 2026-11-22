#!/usr/bin/env python3
"""Extract the numbers behind the "Does it matter what you predict?" figures.

Reads results/runs.csv and results/pretrain_*.csv from the graph-jepa-protein-stability
repository and writes src/data/jepa-results.json. Nothing is typed in by hand: every value
the charts show comes from these logs.

    python3 scripts/build-jepa-data.py /path/to/graph-jepa-protein-stability
"""
import csv
import glob
import json
import statistics as st
import sys
from pathlib import Path

repo = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "src/data/jepa-results.json"


def mean_sd(xs):
    return {"mean": st.mean(xs), "sd": st.stdev(xs) if len(xs) > 1 else 0.0, "seeds": xs}


runs = list(csv.DictReader(open(repo / "results/runs.csv")))


def spearman(corpus, arm):
    rows = [r for r in runs if r["corpus"] == corpus and r["arm"] == arm
            and r["finetune_mode"] == ("full" if arm == "A" else "frozen")]
    rows.sort(key=lambda r: int(r["seed"]))
    return mean_sd([float(r["test_pooled_spearman"]) for r in rows])


def logs(corpus, arm):
    files = sorted(glob.glob(str(repo / f"results/pretrain_{arm}_{corpus}_seed*.csv")))
    return [list(csv.DictReader(open(f))) for f in files]


data = {"tieThreshold": 0.012, "corpora": {}}
for key, corpus_dir in (("scope", "scope"), ("alphafold", "alphafold")):
    block = {"spearman": {}, "effectiveRank": {}, "letterAccuracy": {}, "curves": {}}
    for arm in "ABCD":
        # Arm A (no pretraining) has no pretraining corpus; its runs are stored as "none".
        block["spearman"][arm] = spearman("none" if arm == "A" else corpus_dir, arm)
    for arm in "BCD":
        runs_log = logs(corpus_dir, arm)
        last = [float(r[-1]["val_effective_rank"]) for r in runs_log]
        block["effectiveRank"][arm] = mean_sd(last)
        if arm != "B":
            acc = [float(r[-1]["val_letter_accuracy"]) for r in runs_log]
            block["letterAccuracy"][arm] = mean_sd(acc)
    for arm in "BD":
        runs_log = logs(corpus_dir, arm)
        n = len(runs_log[0])
        rank = [[float(r[e]["val_effective_rank"]) for e in range(n)] for r in runs_log]
        loss = [[float(r[e]["val_vector_loss"]) for e in range(n)] for r in runs_log]
        block["curves"][arm] = {
            "epochs": list(range(n)),
            "rank": {"mean": [st.mean(c) for c in zip(*rank)], "seeds": rank},
            "vectorLoss": {"mean": [st.mean(c) for c in zip(*loss)], "seeds": loss},
        }
    data["corpora"][key] = block

out.write_text(json.dumps(data, separators=(",", ":")))
print("wrote", out, out.stat().st_size, "bytes")
for k, b in data["corpora"].items():
    print(k, {a: round(v["mean"], 3) for a, v in b["spearman"].items()},
          {a: round(v["mean"], 1) for a, v in b["effectiveRank"].items()},
          {a: round(v["mean"], 3) for a, v in b["letterAccuracy"].items()})
