# Module 5. Capstone: your product, end to end

No pre-read. Bring modules 1 to 4 and everything in your `workbook/`.

Until now you worked on a scenario built to teach. Today you point the whole method at a product where the answer matters, and you find out which parts you can do without the scaffolding.

Bring a real product: the AI feature you own, one your company is about to build, or one you want to be hired to run. If you have none, use the fallback in `data/capstone-scenario.md`, which is a meeting-notes assistant that extracts action items and assigns owners. It's deliberately ordinary, and it fails in every way this course has covered.

## Part 1. The decision metric (~15 min)

Before a golden set, before a grader, one sentence: what does "the answer was good" mean for this product, and what decision does the measurement feed.

This is the step people skip, and skipping it is how a team spends a quarter measuring something nobody acts on. Two tests to run on your sentence, with Claude Code arguing:

- **Does it measure what it pretends to measure?** Usage is not value. Thumbs are not correctness. A proxy for a proxy is not a metric.
- **Whose decision does it change?** If no plausible number changes what anyone does next week, it's a dashboard, not an eval.

Write the sentence into `workbook/05-eval-plan.md` before moving on. If you can't write it, that's the finding, and the fix is upstream of evals.

## Part 2. The eval plan (~40 min)

Open `apps/05-canvas/index.html`. Five fields, one page, exports clean markdown. Claude Code works through it with you and pushes on anything vague.

1. **Decision metric.** The sentence from part 1, plus the decision it feeds.

2. **Golden set.** 10 to 15 real cases you would actually put in front of this product. For each: the input, your reference answer, and what evidence a good answer would cite. You write the reference answers. You are the principal domain expert for your own product, literally, and if you can't write 12 reference answers, you don't yet know what good means.

3. **Graders.** Split the quality bar three ways. What's code-checkable (format holds, citations resolve, no empty fields, amount within a ceiling), what needs a judge (is the recommendation supported by the evidence, is the tone right for this audience), and what's a trajectory invariant that must hold on every run regardless of outcome (it never invents a quote, it never takes a money-moving action without confirmation, it never touches another user's data).

4. **What the suite cannot see.** Name it before someone else does. Distribution shift, the cases you have no reference answer for, the failure that only shows up at week three of use.

5. **The production half.** From module 4: the signals you'd instrument in priority order, a sampling policy sized to a real review budget, and the ritual that turns reviewed failures into new eval cases.

Export to `workbook/05-eval-plan.md`.

## Part 3. Build one grader for real (~20 min)

A plan nobody has tested is a document. Pick the single highest-impact grader from part 2 and make it exist.

- If it's code-checkable, write the assertion and run it over your golden set inputs.
- If it needs a judge, write the judge prompt in `apps/02-judge/index.html`, run it over 10 of your cases, and look at the disagreements with your own reference answers.

You will find that one of your reference answers was wrong, or that your definition of pass had a hole in it. That discovery is the deliverable of this part. Note it in the plan.

## Part 4. Tell it (~25 min)

Ask Claude Code to play a skeptical interviewer for a senior AI PM role and run the whole thing cold.

1. "Tell me about an AI product you worked on." Two minutes, no rambling.
2. "You say you've built evals. Walk me through one, concretely. What did pass mean? Who labeled? How did you know the judge was right?"
3. "What's the hardest practical constraint of agentic systems you've hit?"
4. Follow-ups designed to hurt: how many labels, what was the agreement number, why binary, what did your held-out run show, what broke in production, what would you do differently.
5. The curveball: "how would you evaluate an AI that builds automation workflows from a text prompt?" You have the whole toolkit for this. A golden set of prompt-to-workflow cases, outcome grading by executing the workflow against expected results, pass^k because users run it unattended, a judge for structural quality, an error taxonomy mined from failed generations.

One honesty rule stands above all of it. Where engineers executed, say so. "I owned the eval design, engineering built the pipeline" is a strong sentence and it survives follow-up questions. Claimed execution that didn't happen does not, and the follow-ups in this course are the same ones a good interviewer asks.

Debrief: Claude names where answers went vague or long. Redo those cold.

## Done when

- `workbook/05-eval-plan.md` exists for a real product, and you can present it in 90 seconds.
- At least one grader from it runs, and you can say what it taught you about your own reference answers.
- You survived part 4 without using "we had evals" as an unexamined phrase. Every eval claim now carries a who-labeled, what-pass-meant, how-validated with it.

## After the course

The method is the deliverable, not the artifacts. Three things worth doing in the first month back at work:

- Book the weekly hour for reviewing production traces and never give it away. Everything else here is downstream of someone actually looking at the data.
- Convert the next three bug reports into eval cases the day they arrive, while the detail is still there.
- The next time a team argues about whether a change made quality better, ask what would have to be true for the measurement to answer that. Most of the time the honest answer is "we'd need a control group", and being the person who says so early is most of this job.
