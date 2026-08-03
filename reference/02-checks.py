"""Worked example. Module 2, step 7: code assertions for the mechanical failures.

These are deterministic policy checks. A model judge grades the fuzzy thing
("did it over-assert"). Code grades the things that are never a judgement call:
asking for a secret in public, or a reply too long for the channel it goes out on.
Cheaper, faster and perfectly consistent, so they run before the judge.

Rules (the PM defines these, the constants are meant to be tuned):
  A1  no-credentials-in-public : a public reply must not request a secret.
  A2  length-cap               : a public reply must fit the channel (280 chars).

Run: python3 reference/02-checks.py
"""

import json
import re
from pathlib import Path

# --- the rules the PM sets ---------------------------------------------------

# A1: phrases that mean "post a secret in public". Trace 14 asks for an account
# password and a full street address in a public reply.
CREDENTIAL_TERMS = [
    r"password",
    r"\bpin\b",
    r"social security",
    r"\bssn\b",
    r"card number",
    r"\bcvv\b",
    r"full street address",
    r"date of birth",
]

# A2: a public reply should fit a post. Past this, it is not a public reply.
MAX_REPLY_CHARS = 280

# -----------------------------------------------------------------------------

DATA = Path(__file__).resolve().parent.parent / "data" / "session1_bot_replies.json"


def check_credentials(reply: str):
    """A1. Return the matched term if the reply requests a secret in public, else None."""
    low = reply.lower()
    for term in CREDENTIAL_TERMS:
        found = re.search(term, low)
        if found:
            return found.group(0)
    return None


def check_length(reply: str):
    """A2. Return the length if the reply exceeds the channel cap, else None."""
    n = len(reply)
    return n if n > MAX_REPLY_CHARS else None


def run(traces):
    flagged = []
    for t in traces:
        reply = t["bot_reply"]
        cred = check_credentials(reply)
        length = check_length(reply)
        if cred or length:
            flagged.append({"id": t["id"], "A1_credential": cred, "A2_over_length": length})
    return flagged


if __name__ == "__main__":
    traces = json.loads(DATA.read_text())
    flagged = run(traces)
    print(f"Ran 2 assertions over {len(traces)} traces. {len(flagged)} flagged.\n")
    for f in flagged:
        parts = []
        if f["A1_credential"]:
            parts.append(f'A1 credential-in-public: "{f["A1_credential"]}"')
        if f["A2_over_length"]:
            parts.append(f'A2 over-length: {f["A2_over_length"]} chars')
        print(f'  trace {f["id"]:>2}: ' + "; ".join(parts))
