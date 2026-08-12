# Worked example. Northline reply bot: failure taxonomy

Error analysis on the 30 traces. One labeler, binary verdict plus a written critique per trace, open coding first, then axial coding into the categories below.

**Result: 19 of 30 drafts fail the bar "would I let this go out under the company name, unedited." 63% failure rate.**

## The bar

A pass means the draft ships as written. Not "close enough after an agent tweaks it." Human agents currently approve every draft, and the question on the table is whether that oversight can be reduced. Any draft that needs a human to touch it is a fail.

## Two rules settled during coding

**On confident diagnosis.** The bot may not name an account-specific cause, or state something as fact, when nothing shows it checked anything. A hedged, class-level hypothesis followed by a real request for data is fine. "Sounds like a line or modem issue, DM us your account number and we'll run a line test" is fine (trace 17). "Your router was installed with an outdated configuration profile" is not (trace 2). Neither is "we're not showing any outages in your area" during what looks like an incident (trace 20).

The product fix behind this rule is a known-issues lookup: the bot answers confidently only when the issue matches a known pattern. That is not gradable here. This bot has no lookup at all, and even for a bot that had one, the trace would not show whether it ran. The gradable version is the rule above.

**On "should have asked for a DM."** That is a remedy, not a failure mode. Traces that earned that note failed for different reasons (arguing, apologising in a loop, asking for a password in public, brushing the customer off). Categories are named after the cause, not the fix.

## The taxonomy

One primary failure mode per trace. Secondary symptoms noted, not counted.

### 1. Asserts what it can't back (6 of 30)

The bot states a cause, a system state, a promise, or a remedy with no basis and no authority. Covers invented diagnoses, unverified facts, fixes promised with a date, and compensation applied unilaterally.

- Traces: 2, 3, 5, 10, 20, 24
- Example (10). Customer complains about paying $171/month for a broken picture. Bot: "We've gone ahead and applied a $40 loyalty credit to your account." Nobody authorised that.

### 2. Tone doesn't match the customer's state (6 of 30)

The bot's emotional register is out of sync with the person it's replying to. Both directions count: chirpy at someone furious, and an apology loop at someone who just wants the problem fixed.

- Traces: 11, 18, 21, 25, 28, 30
- Example (25). Customer: "Way to drop the ball on customer service so pissed right now!" Bot: "We appreciate your feedback! Have a wonderful day! 😊"

### 3. Answers something the customer didn't say (3 of 30)

The bot replies to a message it invented. It misreads the sentiment, or answers a question that wasn't asked.

- Traces: 7, 12, 26
- Example (12). Customer: "I finally got someone that helped me, thanks!" Bot: "We're sorry for the trouble you've experienced. Please DM us your account number..."

### 4. Breaks a hard rule (3 of 30)

Policy violations, not quality misses. Each is an incident on its own terms regardless of how helpful the rest of the reply is: personal data requested in public, a dispute argued in public, advice that puts the customer at risk.

- Traces: 6, 14, 27
- Example (14). Bot: "reply here with your full street address and your account password." Asking for an account password in a public tweet.

### 5. No next steps (1 of 30)

The customer is left with nowhere to go. Deflection to an FAQ, or a canned line that closes the conversation without a path forward.

- Trace: 16
- Example (16). Customer can't be found in the system and is trying to pay. Bot: "You can find answers to common account questions in our FAQ."

Shows up as a secondary symptom in 7, 11 and 25, but in each of those something else broke first. Real gap, not a roadmap item at n=1.

## The decision

The dominant failure mode is the bot asserting things it can't back: invented causes, unverified system states, promises and credits it has no authority to give. It appears in 6 of 30 traces and 32% of failures. It ties tone on count and beats it on impact, because a wrong credit costs money and a false promise generates a second complaint tomorrow, while a tone miss is only embarrassing. The next fix is a guardrail on assertion: the bot may not state a cause, a system state, or a remedy unless it came from a lookup, and everything else gets hedged or handed to a human.

## Answer to the actual question

Leadership asked whether the bot can run with less oversight. No. 19 of 30 drafts would not ship unedited, and the failures include a $40 credit granted without authority, a delivery time guaranteed to a customer with no other way to get to work, and an account password requested in a public tweet.

## Debrief against the seed key

The exercise seeded 18 failures. These labels agreed on 27 of 30.

- Traces 5 and 20 were seeded as failures and initially passed here. Both are "asserts what it can't back", and both were caught during axial coding as inconsistent with the rule. The rule was right, it was under-applied. Corrected above.
- Trace 27 was seeded as a pass and failed here, for telling a customer to reply to an unknown short code. Not a seeded failure mode. It stands as a fail: the bar belongs to the labeler, and unsafe advice in a public reply is a rule break.

Three disagreements out of 30 is a normal, healthy result. If you agreed with the key on all 30, check whether you were labeling or guessing what the key wanted.

## What this taxonomy would look like after module 2

Worth knowing before you build the judge. The taxonomy assigns one *primary* failure per trace, which is what you want for prioritising. A single-mode judge asks a different question: is that mode *present at all*. Under presence rather than primary, three more traces belong to category 1 (18, 6 and 29), because a fix promised with a date, a record state asserted mid-dispute, and an outage confirmed with no visible lookup are all the same epistemic move.

That is not an error in the taxonomy. It is the difference between a prioritisation artifact and a grading artifact, and noticing it is most of what module 2 teaches.
