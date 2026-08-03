# Worked example. Monitoring plan for the Northline support assistant

One page, written after a day in the console. The numbers in the first section come from that day, so treat them as an example of what a plan sits on rather than as facts about your run.

## What the day showed

60 exchanges, 12 read. A third of the traffic had something wrong with it, and four of those were policy incidents rather than quality misses. The regression that mattered arrived with a prompt deploy in the middle of the morning, and the rate of one failure mode (unbacked assertions) roughly tripled. The aggregate "how good were we today" number would have moved by a few points and told nobody anything.

The policy that found it sampled the newest prompt version deliberately. The policy that missed it spent the whole budget on escalations, which is a sample selected on a symptom that lags.

## Signals, in priority order

1. **Escalation to a human, and abandonment.** Cheap to log, dense, and they move when quality moves. If we instrument one thing, it's this.
2. **Outcome: did the contact close without a second contact in 72 hours.** Slower and harder to attribute, and worth more than everything else once it exists.
3. **Human review of a sample.** 12 a day, run to the policy below. The only signal that finds something we didn't already suspect.
4. **The offline judge, running online on a slice.** Roughly a third of traffic, scored for the assertion mode. Not a verdict, a pointer to what to read.
5. **Thumbs.** Kept, because it's cheap, and read as a queue of traces rather than as a metric.

## Sampling policy

Twelve reviews a day. Four random, eight targeted.

The four random are non-negotiable and go first, because they are the only part of the sample that can surface a mode nobody has named. The eight targeted go, in order: anything a guardrail flagged, anything on a prompt version less than 48 hours old, anything the judge scored below 0.5, anything that escalated, and priority accounts.

The deploy clause is the one that came out of the day. New versions get sampled harder for their first hours, because that is when a regression is both most likely and cheapest to reverse.

If a week goes by where the random four never surface anything new, that's a signal to widen the targeted list, not to cut the random slice.

## Guardrails

| Rule | Decision | Why |
|---|---|---|
| Reply requests a password, card number, date of birth or full address | block | Never a judgement call, and one occurrence is an incident |
| Reply announces a credit, a refund or a waived fee | route to a human | The action may be right, the authority is not the bot's |
| Reply asserts a system state ("no outage", "our records show") | flag | Too common to block without gutting the product, and it's the mode we're tracking |

The middle row is the interesting one. Blocking it would stop the bot helping anyone who came about money, which is a large share of contacts. Routing costs a human a minute and keeps the customer moving.

## Alarms

- Any credential rule trip: alarm immediately, named owner, treated as an incident with a write-up. Not a percentage.
- Assertion-mode rate over a rolling 100 exchanges, above 30%: alarm to the product owner. The rate of one named mode, not an aggregate score.
- Escalation rate up by half week on week: a look, not an alarm.

## The weekly ritual

One hour, Thursday, same slot, owned by the PM and not delegated. Read the traces the policy surfaced during the week. Anything that failed gets named with the taxonomy from module 1, and anything that doesn't fit a category is a new category. Every named failure becomes an eval case in the suite that week, while the detail is still fresh.

Once a quarter, retire the cases that have passed every run for three months, and add hard ones. A suite that passes everything has stopped being an instrument.

## What this plan still cannot see

Customers who never contact us because they gave up, drift in what people ask about, and anything that only becomes visible over weeks of use. The first of those is the one to instrument next, and product analytics rather than eval work is where it would come from.
