"""Build data/production_stream.json for module 4.

One day of traffic for the Northline support assistant, three months after the
module 2 ship call. Everything in this file is written here, including the
customer messages, so module 4 carries no upstream licence. They are written to
sound like the real ones in module 1: short, unpunctuated, angry, sometimes
barely parseable.

Replies are picked to match what the customer is actually complaining about,
because the learner reads these and a reply about a router under a complaint
about a missing parcel teaches nothing except that the data is fake.

Two things are planted in the day, and both are meant to be findable only if the
learner's sampling policy is any good:

  1. A quality regression. A new prompt version ships mid-morning and the rate of
     unbacked assertions jumps from roughly one in ten to more than half.
  2. Policy incidents, rare, spread across the day, and expensive when they land.

Deterministic: fixed seed, no timestamps taken from the clock.

Run: python3 tools/make_stream.py
"""

import json
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = 20260803
N = 60
REGRESSION_AT = 34  # 1-indexed trace where prompt v4 starts
INCIDENTS = {11: "credentials_in_public", 27: "unauthorised_credit",
             41: "other_user_data", 52: "credentials_in_public"}

INTENT_PATTERNS = [
    ("billing", r"bill|charg|pay|paid|refund|price|invoice|fee|£|\$|money|cost"),
    ("delivery", r"packag|deliver|order|shipp|courier|arriv|parcel|box"),
    ("connection", r"internet|wifi|signal|connect|outage|network|data|speed|slow|drop|router|modem"),
    ("account", r"account|login|log in|password|app|contract|cancel|upgrade|plan|sim"),
]

# Replies that state nothing they could not know, and hand the customer a next step.
CLEAN = {
    "billing": [
        "That's worth checking properly. DM us the email on the account and we'll go through the billing history line by line.",
        "We can look at what was charged and why. Send the account number in a DM and we'll come back with the breakdown.",
        "If a charge is wrong we'll fix it. DM us the account number and the date on the charge.",
    ],
    "delivery": [
        "Send us the order number in a DM and we'll find where it is and what happened to it.",
        "That shouldn't happen. DM us the order number and we'll chase it with the courier and come back to you.",
        "We can check the delivery record on our side. DM us the order number and the address it was going to.",
    ],
    "connection": [
        "DM us the account number and the modem model and we'll run a line test while you're connected.",
        "Worth checking whether it's the line or the equipment. DM us the account number and we'll look at the drop history.",
        "Send us your postcode in a DM and we'll check what's happening on the network there.",
    ],
    "account": [
        "DM us the account email and we'll look at what's actually set on the account.",
        "We can sort that. DM us the account number and tell us what you want changed.",
        "Send us the account email in a DM and we'll check what state the request is in.",
    ],
    "support": [
        "That's a poor experience and we'd like to see what happened. DM us the ticket number and we'll read the whole thread.",
        "Sorry it took that long. DM us the reference and we'll find where it stalled.",
        "Thanks for saying so. If it comes back, reply here and we'll pick it up straight away.",
    ],
}

# Replies that state a cause, a system state, a promise, or a remedy with nothing behind it.
ASSERT = {
    "billing": [
        "That charge is from the plan change on the account in March, which is why it looks higher this month.",
        "The credit was already applied last month, so there's nothing outstanding on our side.",
        "We've gone ahead and waived this month's fee for the trouble, you'll see it on the next bill.",
    ],
    "delivery": [
        "It's out for delivery now and will be with you before 11am.",
        "The parcel was signed for at the address on Tuesday, so it's been delivered.",
        "The courier is running a day behind in your area, it will arrive tomorrow.",
    ],
    "connection": [
        "We can see the issue, your line was provisioned on the old profile. We've pushed the fix, you'll be stable within the hour.",
        "There's no outage in your area, so this is a device problem. Restart the router and it will clear.",
        "We're rolling out a firmware update tonight that fixes this exact issue, nothing needed on your side.",
        "The engineer is booked for tomorrow morning and will have you back up before noon.",
    ],
    "account": [
        "The request went through this morning, the account is already updated on our side.",
        "That flag was set when the account was migrated in January, and we've cleared it now.",
        "Your contract ended in June, so nothing further is due.",
    ],
    "support": [
        "The case is with the technical team and they'll call you back within two hours.",
        "The agent followed the correct process, so there's nothing that went wrong on the call.",
    ],
}

# Register mismatched to the customer's state, in both directions.
TONE = [
    "Yikes! 🙈 That's no fun at all. Hang in there!",
    "We appreciate your feedback! Have a wonderful day! 😊",
    "Great question! 🎉 We're always happy to help!",
    "We are so, so sorry. We sincerely apologise for the inconvenience, and we apologise for any frustration this has caused.",
    "Thanks so much for reaching out, we love hearing from our customers!",
]

# Nowhere to go from here.
NO_NEXT = [
    "You can find answers to common questions in our FAQ: help.northline.com/faq",
    "Our support team is available Mon to Fri, 8am to 8pm.",
    "Please refer to the terms of service for details on this policy.",
    "This is handled by a different department.",
]

VIOLATION = {
    "credentials_in_public": [
        "Happy to fix that. Reply here with your account password and the last four digits of your card and we'll update it now.",
        "Post your full street address and your date of birth in this thread and we'll correct the record.",
    ],
    "unauthorised_credit": [
        "We've applied a $75 credit to the account for the trouble, it's done.",
        "We've cancelled the contract and waived the early termination fee, nothing more to pay.",
    ],
    "other_user_data": [
        "Looking at the account, the other person on it (Maria S, number ending 4417) reported the same fault last week, so it's the building.",
    ],
}


MESSAGES = [
    "third outage this week and nobody tells us anything",
    "why am I paying for 500mb when I get 40 on a good day",
    "still waiting for the engineer who was booked for tuesday. nobody came. nobody called.",
    "my bill went up £14 this month and no one can tell me why",
    "the router you sent is dead out of the box. flashing red, nothing else.",
    "cancelled in august, still being charged. this is the fourth time I've asked",
    "wifi drops every evening around 8. every single evening.",
    "Can someone explain what the “equipment fee” on my invoice is for",
    "I have been on hold 47 minutes. FORTY SEVEN.",
    "the app just spins when I try to log in. android, latest version",
    "signal in the whole street has been down since 6am, what's going on",
    "you took two payments this month. I want one of them back today",
    "moved house 3 weeks ago and the transfer still hasn't happened",
    "yr website says my area has fibre. the engineer says it doesn't. who's right",
    "why does my speed drop to nothing every time it rains",
    "sent my old modem back in september and you're still billing me for it",
    "the new plan is worse than the old plan and nobody warned me",
    "can I get a refund for the days I had no service last week",
    "your chat bot is useless. I want a human.",
    "SIM stopped working overnight. no signal at all, tried another phone",
    "I was promised a callback yesterday. Nothing.",
    "charged for roaming when I never left the country",
    "how long does a fault ticket normally take, mine is 9 days old",
    "the engineer turned up and left because 'wrong equipment'. now what",
    "installation was supposed to be today between 8 and 12. it's 2pm.",
    "does anyone actually read these messages or is it all automated now",
    "my mum is 82 and has had no phone line for a week. this is not acceptable",
    "billing says one thing, the app says another, which one do I pay",
    "why is upload 2mb when I'm paying for symmetric",
    "you disconnected the wrong line. my neighbour has service, I don't.",
    "3 different agents, 3 different answers about the same charge",
    "when is the outage in the city centre being fixed, it's been 5 hours",
    "I need a copy of my contract and nobody will send it",
    "the price rise letter arrived after the price rose. helpful.",
    "my broadband has been 'being provisioned' for 11 days",
    "can you confirm whether my cancellation went through, I got no email",
    "your app logged me out and now says my account doesn't exist",
    "getting texts about a service I never signed up to",
    "line noise so bad I can't hear anyone. reported twice.",
    "why do I need to call to cancel but signing up took 30 seconds online",
    "no service since the storm on friday, no updates, nothing",
    "you've charged an early termination fee on a contract that ended",
    "the technician was great but the fault is back the next day",
    "how do I stop these marketing texts, STOP doesn't work",
    "I've been quoted 3 different install dates by 3 different people",
    "internet fine, tv box says no signal since the update last night",
    "£60 for a 'missed appointment' I was home for. I have doorbell footage.",
    "speed test attached. this is a joke for the money.",
    "still no answer on the complaint I raised on the 4th",
    "does the new plan include the hub or is that extra",
    "phone line works, broadband doesn't, same socket",
    "I want to escalate this. who is above the support team.",
    "keep getting cut off mid call, both directions",
    "sold me a package that doesn't work at my address. now what.",
    "my final bill is higher than my monthly bill was. explain that",
    "outage map says everything is fine, my street disagrees",
    "took a day off work for the install and no one came",
    "why is my data being throttled at 4pm every day",
    "asked for a paper bill 4 times, still getting emails only",
    "the compensation you offered doesn't cover the days we lost",
    "third router in six months. maybe it isn't the router.",
    "can I pause my service while I'm abroad for 3 months",
    "your engineer left a hole in the wall and no explanation",
    "who do I speak to about a formal complaint, the form is broken",
]


def intent_of(text: str) -> str:
    low = text.lower()
    for name, pattern in INTENT_PATTERNS:
        if re.search(pattern, low):
            return name
    return "support"


def build():
    rng = random.Random(SEED)
    pool = list(MESSAGES)
    rng.shuffle(pool)
    assert len(pool) >= N, "not enough messages written"

    stream = []
    for n in range(1, N + 1):
        customer = pool[n - 1]
        intent = intent_of(customer)
        v4 = n >= REGRESSION_AT
        roll = rng.random()

        assert_rate = 0.55 if v4 else 0.12
        failure = None
        if roll < assert_rate:
            failure, reply = "asserts_unbacked", rng.choice(ASSERT[intent])
        elif roll < assert_rate + 0.10:
            failure, reply = "tone_mismatch", rng.choice(TONE)
        elif roll < assert_rate + 0.16:
            failure, reply = "no_next_step", rng.choice(NO_NEXT)
        else:
            reply = rng.choice(CLEAN[intent])

        policy = INCIDENTS.get(n)
        if policy:
            # the incident replaces the reply, so whatever the roll produced is gone
            reply = rng.choice(VIOLATION[policy])
            failure = "asserts_unbacked" if policy == "unauthorised_credit" else None

        hour = 8 + (n - 1) * 10 // 60
        minute = ((n - 1) * 10) % 60
        bad = failure is not None or policy is not None

        stream.append({
            "id": n,
            "time": f"{hour:02d}:{minute:02d}",
            "customer": customer,
            "reply": reply,
            "meta": {
                "prompt_version": "v4" if v4 else "v3",
                "intent": intent,
                "new_intent": rng.random() < 0.12,
                "turns": rng.choice([1, 1, 2, 2, 3, 4, 6, 8]),
                "account_tier": "priority" if rng.random() < 0.18 else "standard",
                # implicit behaviour: worse replies produce worse behaviour, noisily
                "user_followup": rng.choices(
                    ["none", "negative", "positive"],
                    weights=[6, 5, 1] if bad else [7, 1, 3])[0],
                "escalated_to_human": rng.random() < (0.30 if bad else 0.06),
                "abandoned": rng.random() < (0.22 if bad else 0.05),
                "mentions_money": policy == "unauthorised_credit" or intent == "billing" or rng.random() < 0.10,
                # the module 2 judge, running online on a third of traffic
                "judge_score": None if rng.random() < 0.67 else round(
                    rng.uniform(0.1, 0.55) if bad else rng.uniform(0.45, 0.99), 2),
            },
            "hidden": {
                "failure": failure,
                "policy_violation": policy,
                "severity": 3 if policy else (2 if failure == "asserts_unbacked" else 1 if failure else 0),
            },
        })
    return stream


if __name__ == "__main__":
    stream = build()
    out = ROOT / "data" / "production_stream.json"
    out.write_text(json.dumps(stream, indent=1, ensure_ascii=False))
    bad = [s for s in stream if s["hidden"]["failure"] or s["hidden"]["policy_violation"]]
    before = [s for s in stream if s["meta"]["prompt_version"] == "v3" and s["hidden"]["failure"] == "asserts_unbacked"]
    after = [s for s in stream if s["meta"]["prompt_version"] == "v4" and s["hidden"]["failure"] == "asserts_unbacked"]
    print(f"wrote {out.relative_to(ROOT)}: {len(stream)} traces, {len(bad)} with a problem")
    print(f"  unbacked assertions: {len(before)}/{REGRESSION_AT - 1} on v3, {len(after)}/{N - REGRESSION_AT + 1} on v4")
    print(f"  policy incidents: {sum(1 for s in stream if s['hidden']['policy_violation'])}")
