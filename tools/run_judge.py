"""Run a judge prompt over traces and write the results file the workbench reads.

The judge has to see one trace at a time, with nothing but the prompt and that
trace in its context. That isolation is the point: a judge that can see your
labels, your taxonomy, or the other 29 traces is not grading, it is agreeing.

Usage:
    export ANTHROPIC_API_KEY=sk-ant-...
    python3 tools/run_judge.py workbook/02-judge-prompt.md --ids 1-20 --round 1 --set dev

Writes workbook/02-results-round<N>.json in the shape the app expects:

    {"round": 1, "set": "dev", "judge": "...", "results": [{"id": 1, "verdict": "pass", "critique": "..."}]}

No dependencies beyond the standard library. If you have no API key, Claude Code
can do the same job: it reads the prompt, grades each trace in a fresh subagent
so the isolation holds, and writes the same file.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-5"

INSTRUCTION = """You are grading one output against the rubric above.

Customer message:
{customer}

Bot reply:
{reply}

Answer with a single JSON object and nothing else:
{{"verdict": "pass" or "fail", "critique": "one sentence"}}"""


def parse_ids(spec: str, available):
    if not spec:
        return list(available)
    out = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            out.extend(range(int(a), int(b) + 1))
        else:
            out.append(int(part))
    return [i for i in out if i in available]


def call(prompt: str, key: str) -> dict:
    body = json.dumps({
        "model": MODEL,
        "max_tokens": 300,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    req = urllib.request.Request(API, data=body, headers={
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        payload = json.loads(r.read())
    text = "".join(b.get("text", "") for b in payload.get("content", []))
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        return {"verdict": "", "critique": "judge did not return JSON: " + text[:120]}
    return json.loads(match.group(0))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", help="the judge prompt, markdown, as exported by the workbench")
    ap.add_argument("--traces", default="data/session1_bot_replies.json")
    ap.add_argument("--ids", default="", help="e.g. 1-20 or 1,4,7. Default: all")
    ap.add_argument("--round", type=int, default=1)
    ap.add_argument("--set", default="dev", help="dev or holdout")
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        print("No ANTHROPIC_API_KEY. Ask Claude Code to grade instead, one trace per subagent.")
        return 1

    rubric = Path(args.prompt).read_text()
    traces = json.loads((ROOT / args.traces).read_text())
    by_id = {t["id"]: t for t in traces}
    ids = parse_ids(args.ids, by_id)

    results = []
    for n, tid in enumerate(ids, 1):
        t = by_id[tid]
        prompt = rubric + "\n\n---\n\n" + INSTRUCTION.format(customer=t["customer"], reply=t["bot_reply"])
        try:
            verdict = call(prompt, key)
        except urllib.error.HTTPError as e:
            print(f"  trace {tid}: HTTP {e.code} {e.read()[:200]!r}")
            return 1
        results.append({"id": tid, "verdict": str(verdict.get("verdict", "")).lower(),
                        "critique": verdict.get("critique", "")})
        print(f"  [{n}/{len(ids)}] trace {tid}: {results[-1]['verdict']}")

    out = Path(args.out) if args.out else ROOT / "workbook" / f"02-results-round{args.round}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "round": args.round,
        "set": args.set,
        "judge": Path(args.prompt).stem,
        "results": results,
    }, indent=1))
    print(f"\nWrote {out}. Load it in apps/02-judge.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
