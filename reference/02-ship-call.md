# Worked example. Ship call: Northline support bot, variant A vs B

## Evidence

Two system prompts scored by the module 2 suite (the "asserts what it can't back" judge plus the two code assertions) over 10 fresh customer messages the bot had never seen.

- **Variant A ("Resolver", no guardrail):** assertion fail rate 9 of 10, plus one hard policy block (message 46 requested a password in a public reply, caught by assertion A1).
- **Variant B ("Grounded", the assertion guardrail written into the system prompt):** assertion fail rate 0 of 10, no policy blocks, nothing over length.

## Decision memo

We ship variant B. It's the duller bot, but variant A asserted causes, promised dated fixes and handed out credits it had no basis for, and once it asked for a password in public it stopped being a quality problem and became an incident. On 10 fresh messages the suite failed A on 9 for unbacked assertions and hard-blocked 1 for requesting a password in public, while B failed 0 and tripped no check. What the suite cannot see is that B is over-constrained: it hedges even when a confident answer would have been correct, so we are paying a generic-reply tax that no offline metric here captures. The fix is not to loosen B, it is to build the known-issues lookup behind it, so the bot can be confident when it actually has grounds and keep hedging when it doesn't. In production I'd track the DM-only deflection rate and the repeat-contact rate to size that tax, treat any A1 policy trip as a zero-tolerance alarm, and audit a weekly sample of hedged replies to count how many a known-issues database would have let us answer directly.

## Why this memo is the shape it is

Five sentences, and every one of them does a job.

- The verdict comes first, with the cost of the choice admitted in the same breath.
- The evidence is numbers from a suite, with the denominator visible. "9 of 10" is checkable. "Mostly failed" is not.
- The incident is separated from the quality miss, because they are different kinds of thing and get different treatment.
- The limitation is named by the author, not by the reader. Anyone who read the judge prompt would have found it in a minute, and finding it yourself is worth more than being caught.
- The last sentence is what happens after ship, which is what an exec actually wants to know and what module 4 is about.
