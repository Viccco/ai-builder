# Module 4. After ship: online evals, guardrails, and the flywheel

Modules 1 to 3 built the offline half. This is the half that runs every day after launch, and it's where most AI PMs are actually spending their time.

## Pre-read (before the session, ~15 min)

Hamel Husain, Your AI product needs evals.
https://hamel.dev/blog/posts/evals/

Read the part about the three levels again, and this time pay attention to what he says about logging, curation, and the fact that the eval set is never finished.

## Primer (~25 min)

### The offline suite is a filter, not a guarantee

Your suite grades the cases you thought of, on inputs that existed when you built it. Production sends inputs nobody wrote down, from users who adapt to the product, through a stack whose model, prompt, retrieval index and tool APIs all change under you. A green suite means "the failures I already know about did not come back". It never means "it works".

So the question after ship isn't "what's our score". It's "what would I have to see to know quality moved, and would I see it".

### The signals, ranked by how honest they are

1. **Outcome signals.** Did the task actually complete. Refund issued, ticket resolved without a human, workflow ran, the user shipped what they came to do. Hardest to instrument, worth more than everything below it combined.
2. **Implicit behaviour.** Retry, rephrase, edit the output, abandon mid-task, escalate to a human, copy the answer out. These are dense, unbiased by who bothers to complain, and they arrive for free if you log them.
3. **Human review of a sample.** Your module 1 method, run weekly on production traffic instead of a static file. Expensive per trace, and the only signal that tells you something new rather than confirming what you measured.
4. **Explicit feedback.** Thumbs, star ratings, a comment box. Sparse, self-selected, ambiguous (a thumbs-down on a correct answer the user didn't like is not the same failure as a hallucination), and the first thing every team builds. Useful as a pointer to traces worth reading, weak as a metric.

If you only get to instrument one thing before launch, instrument the escalation or abandonment path. It's cheap and it moves when quality moves.

### Sampling is a policy, not a leftover

You cannot review production. You can review a slice of it, and which slice is a product decision with a real cost attached. A workable policy has two parts:

- **A random slice**, small and constant, so you can compare weeks and catch things nobody thought to flag. Random is the only part of the sample that finds unknown unknowns.
- **Targeted slices**, where the risk is. High-value accounts, money-moving actions, first sessions, new intents, unusually long trajectories, anything your judges scored near the boundary, anything a guardrail flagged without blocking.

Then size it against the review capacity you actually have. A policy that needs 200 reviews a week from a team that can do 20 is a policy that quietly becomes zero.

### Guardrails are a different layer from quality

Quality evals ask "was this good". Guardrails ask "is this allowed". Keep them separate, because they behave differently:

- A guardrail runs in the request path, so it costs latency and it can block. A judge usually runs after the fact on a sample.
- A guardrail is deterministic where it can be. Regex, allowlists, schema checks, an amount ceiling. Model-based guardrails exist and they carry their own false-positive tax.
- A guardrail failure is an incident, not a data point. One password requested in public is not "3% of traces", it's a thing that happened and gets a name and an owner.
- Every guardrail has a false-positive cost that lands on real users. "Block anything that mentions a refund" is a great way to stop helping the people who came about refunds.

The design question is never "should we add a guardrail". It's "block, flag, or route to a human", and the answer follows from what the failure costs when it lands.

### Regressions and the version you forgot to write down

The suite is a filter against known failures, so most production regressions arrive with a change: a new prompt, a new model, a retrieval index rebuilt, a tool whose API drifted. Three habits catch them:

- **Version everything that touches an output** and log the version on the trace. Prompt version, model id, index build, tool schema version. Without this you can see the number move and never learn why.
- **Watch failure-mode rates, not the aggregate.** An aggregate quality score is an average of things that fail for unrelated reasons, so it moves late and vaguely. The rate of one named failure mode moves early and points at a cause.
- **Roll out so you can compare.** A canary or a holdback gives you a control group. Without one, every regression argument becomes a story about seasonality.

### The flywheel

Every production failure you review is a new eval case, and this is the mechanism by which the offline suite stops rotting. The loop:

Production failure → labeled and named with the module 1 taxonomy → added to the eval set → the fix is developed against it → the suite now permanently protects against that failure.

A suite that only grows from brainstorming saturates and stops teaching. A suite fed by production keeps failing you in useful ways, which is what a good eval set does. Retire cases that have passed for months, keep the ones that still hurt, and give the whole thing an owner with a weekly slot in the calendar. Unowned suites die within a quarter.

## Exercise (~50 min)

Same fictional telecom, three months later. The bot from module 2 shipped with a human in the loop on high-risk replies, and volume is now higher than anyone can read. `data/production_stream.json` holds one day of traffic: 60 exchanges in the order they happened, each with the customer message, the bot reply, and the metadata your logging captures. Partway through the day someone deployed a new prompt version.

You will not read all 60. That's the point.

1. **Set the policy.** Open `apps/04-console/index.html`. You have a review budget of 12 traces for the day. Define your sampling policy: how much of the budget goes to a random slice, and which targeted conditions claim the rest. The conditions on offer are the ones your logging can actually see. (~10 min)

2. **Write the guardrails.** Two or three rules, each with a decision attached: block, flag for review, or route to a human. Reuse what you learned in module 2 about mechanical rules. Watch the false-positive counter as you tighten them. (~10 min)

3. **Run the day.** The console replays the stream against your policy. You review the traces your policy surfaced, in the app, verdict plus critique, the same move as module 1. At the end it shows you what you caught, what leaked, what your guardrails blocked correctly, and what they blocked wrongly. (~15 min)

4. **Did you catch the regression?** A quality regression enters the stream partway through. If your policy found it, say at which trace and on what evidence. If it didn't, work out what signal would have caught it, change the policy, and rerun the day. Rerunning is allowed here and impossible in real life, which is the lesson. (~10 min)

5. **Write the plan.** `workbook/04-monitoring-plan.md`, one page: the signals you'd instrument in priority order, your sampling policy in one paragraph, your guardrails with their block-flag-route decision, what alarms and who they wake, and the ritual that turns reviewed failures into eval cases. Claude Code stress-tests it by naming a failure your plan would miss. (~5 min)

Kickoff prompt for a fresh Claude Code session:

```
Module 4 of the AI PM evals course. Read modules/04-after-ship.md and run the exercise with me.
I'm setting a sampling policy and guardrails in apps/04-console and reviewing the traces it
surfaces. Afterwards: challenge my policy by naming failures it would miss, make me justify the
review budget split between random and targeted, and help me write workbook/04-monitoring-plan.md.
Do not tell me where the regression is until I've made my own call.
```

## Interview drill (~15 min)

1. You shipped an AI feature last week. What do you look at on Monday morning, and in what order?
2. Thumbs-up rate went from 82% to 79%. What do you do first, and what would make that number meaningless?
3. Which is worth more, a thumbs-down or an abandoned session? Defend it.
4. How do you decide whether a guardrail blocks or flags?
5. Your offline suite is at 96% and support tickets are climbing. Walk me through the diagnosis.
6. How does a production failure become an eval case, concretely, in your team's week?
7. You can review 20 traces a week. How do you choose them?

## Done when

- You can name four production signals and say which one you'd instrument first with a reason.
- You have a sampling policy that fits a real review budget, written down.
- You can explain the difference between a quality miss and a policy incident, and say why they get handled differently.
- You know whether your policy caught the planted regression, and why.
- You can describe the flywheel as a weekly ritual with an owner, not as a diagram.

Worked version: `reference/04-monitoring-plan.md`.
