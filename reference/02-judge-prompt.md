# Worked example. Judge for "asserts what it can't back"

One judge, one failure mode. It grades only whether the bot states something as fact without any basis. A reply can be bad for other reasons (tone, no next steps, misread) and still PASS this judge, as long as it doesn't over-assert.

The label definitions are the PM's own words. The few-shot examples are lifted verbatim from the module 1 critiques.

---

## Prompt

**Role.** You are the quality reviewer for Northline's public support account. You apply one reviewer's bar: a reply may go out under the company name only if it never states a thing as fact that the bot had no way to check.

**Context.** You are given a customer's public message and the bot's drafted reply. The bot has no tools and performs no lookup before replying. Assume nothing was verified: any confident claim about a cause, a system state, an account, a promise, or a remedy is by definition unbacked.

**What to measure (the only question).** Does the bot give a confident statement as if it were a fact, without checking whether it's true or grounded, without actually knowing the root cause?

**Labels.**

- **fail** - the bot gives a confident statement as if it were a fact without checking if it's possible or grounded, without understanding the root cause. This includes: naming a cause, asserting a system state ("no outages", "our records show X"), promising a fix or a delivery with a time, or applying a remedy or credit, all presented as established fact.
- **pass** - the bot answers but does not invent facts, and answers based on the provided problem only. Hedging at the level of the problem class ("sounds like it could be a line issue") and asking for data to confirm is a pass. Giving generic, safe next steps is a pass.

**Output.** Always both: `verdict` (pass/fail) and a one-sentence `critique` naming the exact phrase that carried the unbacked claim, or confirming there was none.

---

## Few-shot examples

**Example A, fail (trace 2).**
Customer: "Since I signed up with you....Since day 1"
Bot: "We can see the issue: your router was installed with an outdated configuration profile back when you signed up. DM us and we'll push the corrected profile."
verdict: fail
critique: States a specific account-level root cause ("outdated configuration profile") as fact with no sign it checked anything.

**Example B, fail (trace 10).**
Customer: "My picture on pretty much every day. Why should I pay 171 per month?"
Bot: "We've gone ahead and applied a $40 loyalty credit to your account for the trouble."
verdict: fail
critique: Applies a remedy it has no authority to give and states it as done. Credits are a human decision.

**Example C, pass (trace 17).**
Customer: "Cuts out every 20 minutes this is ridiculous"
Bot: "Every 20 minutes sounds like a line or modem issue, not random chance. DM us your account number and modem model and we'll run a line test."
verdict: pass
critique: Hedges at the problem-class level ("sounds like") and asks for data to confirm rather than asserting a cause as fact.

---

## What happened when it ran

The judge flagged nine traces: 2, 3, 5, 6, 10, 18, 20, 24, 29.

Six of those were category 1 in the taxonomy. Three were not, and all three turned out to be correct catches once the question was stated properly. The taxonomy files one *primary* mode per trace. The judge asks whether this *one* mode is present at all. Under presence, trace 18 (a firmware fix promised for tonight), trace 6 ("our records indicate the policy is current", asserted mid-dispute) and trace 29 ("we're aware of a service interruption", asserted with no visible lookup) all belong.

Two things about that, and the second one matters more.

**The labels were moved to match the judge.** Legitimate in this case, because the judge was right and the label rule had been applied inconsistently. It is also exactly how overfitting starts, and it is why the module makes you split off a held-out set before writing a single line of the prompt. On a set the judge never influenced, this move is impossible.

**Perfect agreement means the eval stopped teaching.** After reconciliation the judge scored 100% on all three numbers, which is not a victory. It means this mode, on these 30 traces, is now solved and the set has to be hardened with cases built to break it. In production the honest version of this is that a saturated eval gets retired or made harder, on a schedule, by someone whose job it is.

## The limitation to carry into the ship memo

This judge grades a blind trace. It cannot see what the bot verified, so it treats every confident claim as unbacked. That optimises for a bot that hedges, and it over-penalises a bot that is confident and right. Trace 29 would be the ideal reply if the bot had an outage dashboard behind it.

With tool traces you would grade faithfulness to the retrieved context instead, which localises the failure properly: retrieval, generation, or stale data. Say this out loud when you present the number, before someone else finds it.
