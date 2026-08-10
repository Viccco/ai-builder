# Module 2. LLM-as-judge and eval-driven development

Requires module 1's outputs: your 30 labels and the failure taxonomy.

## Pre-read (before the session, ~15 min)

Hamel Husain, A field guide to rapidly improving AI products.
https://hamel.dev/blog/posts/field-guide/

Read for the operating rhythm: error analysis as the engine, experiments over feature dates, why teams that read their data outrun teams that buy eval tools. Skim the case-study numbers, they come up in interviews as ammunition.

## Primer (~20 min)

### The judge is a product

An LLM judge is a model prompted to grade outputs the way your principal expert would. It's the only way to scale subjective grading, and it fails in its own ways: too lenient, biased toward long answers, biased toward its own model family, confidently wrong at edge cases. So you never trust it on faith. You build it against human labels and measure the agreement.

### Anatomy of a judge prompt

Four parts (Aman Khan's structure, matching what Anthropic and Hamel do):
1. Role: who the judge is and whose standard it applies.
2. Context: what the customer asked, what the bot replied, any policy that applies, and what the bot could and could not have known.
3. What to measure: the one failure mode this judge checks. One judge per failure mode beats one judge for "quality".
4. Labels, defined precisely: what pass means, what fail means, with 2 or 3 worked examples pulled from your module 1 critiques. Output format: verdict plus critique, always both.

The few-shot examples are why the critiques from module 1 mattered. Your written judgments become the judge's taste.

### One judge per failure mode

This is the rule people nod at and then break. A single "is this reply good" judge collapses several independent questions into one verdict, so when the number moves you can't tell what moved. Worse, the modes disagree: a reply can be perfectly grounded and tonally offensive. Forced into one label, the judge picks whichever mode the examples emphasised, and its errors look random.

Split it, and each judge gets a sharp definition, its own few-shot set, and its own precision and recall you can actually act on. You'll build two in this session and feel the difference.

### Validating the judge

The loop, from Hamel's llm-judge post:
1. Hold your human labels as ground truth.
2. Run the judge on the same traces.
3. Compare. Not just raw agreement: with imbalanced data (say 24 pass, 6 fail) a judge that says "pass" every time scores 80% agreement and is useless. Look at precision and recall on the failure class.
4. Read every disagreement. Either the judge prompt is missing a rule (fix the prompt) or your own label was inconsistent (fix the label, it happens and it's informative).
5. Iterate until agreement converges. Hamel's Honeycomb case reached over 90%. Then, and only then, you let the judge run on unlabeled traffic.

### Why you split before you start

If you tune the judge against all 30 labels, you end up with a judge that agrees with those 30 labels. That is not the same thing as a judge that grades well, and you cannot tell the two apart from the inside.

So before writing a word of the prompt, you split: about two thirds to develop against, one third held out and untouched. You iterate on the development set until the numbers stop moving, then you run the held-out set exactly once. If the held-out numbers hold, the judge learned your rule. If they collapse, it memorised your examples, and the gap between the two runs is the size of your self-deception.

Real teams do this with more data and refresh the held-out set periodically, because a set you keep looking at stops being held out.

### Agents make it statistical

Two concepts from Anthropic's agent-evals post that interviewers love because most candidates don't know them:
- pass@k vs pass^k. pass@k: at least one of k attempts succeeds (fine for a coding assistant where the user picks the best run). pass^k: all k attempts succeed (what you need for an autonomous agent nobody double-checks). Same system, wildly different numbers. Which one matters is a product decision, not a modeling one.
- Outcome vs trajectory grading. Grade the end state ("was the refund actually issued") rather than the exact tool sequence, because agents find valid alternative paths. Grade the trajectory only for what must hold on the way (no policy violations, no destructive calls).

And because agents are stochastic: run multiple trials per case. A single run is an anecdote.

### Eval-driven development

The OpenAI receipt-inspection cookbook treats the eval suite as the spec: define what pass means before building, then every change (prompt, model, retrieval) is judged by the same suite. Two habits from it worth quoting:
- Prioritize failures by business impact, not frequency. Their merchant-name field failed 85% of the time and was left alone, because a wrong merchant name cost nothing. An audit-decision error cost real money.
- Decompose the pipeline and evaluate stages separately, so you know where errors enter instead of arguing about the final number.

### Keeping the suite honest

From Anthropic's operational guidance: evals saturate (100% pass means the eval stopped teaching you anything, so retire it or harden it), suites need an owner, and offline evals are one layer of Swiss cheese. Production monitoring and A/B tests cover the holes offline evals can't see, like drift and real user behaviour. That half is beyond this course, and it is the next thing to read about once you have built one of these.

## Exercise (~75 min)

Continue as Northline's AI PM. Yesterday you found the dominant failure mode. Today you automate its detection and use the result to make a ship call.

1. **Split first.** Tell Claude Code to split your 30 labeled traces into 20 development and 10 held-out. It writes the split into the app and never shows you which is which. (~2 min)

2. **Calibrate the mode.** Open `apps/02-judge/index.html` and pick the failure mode this judge is for. Then go through all 30 traces and answer one question about each: does this fail *this mode*. (~8 min)

   This step feels redundant and is not. Your module 1 verdict answered "would I post this", and a draft can be rude, useless and perfectly honest about what it knows. If you score a grounding judge against a verdict that also punished tone, every trace that failed for another reason looks like a miss when the judge did its job correctly. Traces you put in this category during clustering start as fails so you are confirming rather than starting cold.

   While you go, star the clearest failure and the pass that sits closest to the line. Both appear beside the prompt editor, and separating those two is the whole job in step 3.

3. **Write judge one.** Four fields, one per part of the prompt, because a missing role or a fuzzy label definition is invisible in a wall of text. Add 2 or 3 few-shot examples with the picker, which shows you every trace in full so you never choose by number. Anything you use as an example is excluded from the score, because a trace the judge was shown is not evidence about that trace. You write the label definitions yourself, and that is the PM part. Then click **Copy prompt for Claude Code** and paste it into the chat. (~15 min)

4. **Score and read.** Claude Code grades the development traces one at a time, so the judge never sees your labels or the other traces, then writes the results into the page. Reload the tab and the scoreboard fills in: confusion matrix, agreement, precision and recall on the failure class, with every exclusion named. Work the disagreement queue and decide each one. The prompt is missing a rule, your calibration was wrong, it fails a different mode entirely, or it is genuinely ambiguous. Copy the triage when you are through. (~15 min)

5. **Iterate.** Amend the prompt, paste it again, watch the run history. Two or three rounds. Stop when the numbers stop moving, not when they hit a round number. (~15 min)

6. **The held-out run.** Once. Claude Code runs the frozen judge over the 10 traces you never tuned against and reports the same metrics. Compare the two. Write down the gap and what you think caused it, in `workbook/02-judge-notes.md`. This is the most honest number you will produce today. (~8 min)

7. **Judge two, fast.** Pick the second failure mode from your taxonomy and build its judge in one pass, reusing what you learned. Calibrate it, write it, run it. The point is felt rather than explained: notice how much sharper a definition gets when it only has one job, and check whether any trace now fails both judges. (~10 min)

8. **Code assertions.** Two mechanical rules from your taxonomy that never need a model (candidates: reply asks for credentials in public, reply contains an unverified link, reply exceeds a length cap). You define the rules and the constants, Claude Code writes `workbook/checks.py`. Run it. (~5 min)

9. **The ship call.** Claude Code generates replies for 10 fresh customer messages from `data/support_tweets_200.json` with two different bot system prompts, A and B. Your suite (both judges plus the assertions) scores both. You write the decision memo, five sentences max, into `workbook/02-ship-call.md`: which variant, on what evidence, what the suite can't see, and what you'd monitor in production. (~10 min)

Kickoff prompt for a fresh Claude Code session:

```
Module 2 of the AI PM evals course. Read modules/02-llm-judge.md and RUNNING.md, plus my
module 1 outputs (workbook/01-taxonomy.md and workbook/01-labels.json). Run the exercise with
me. Start by splitting my 30 labels into 20 dev and 10 held-out, inject the split into the
judge workbench, and never tell me which ids are held out. I write the judge prompts, do the
per-mode calibration, and decide every disagreement. You grade one trace at a time, write the
results back into the page, and tell me to reload. Push back if a label definition is vague,
and especially if I am about to move a calibration just to make a number go up. End with the
two-variant ship call.
```

## Interview drill (~15 min)

1. How do you know your LLM judge is right?
2. Your eval suite says 95% pass but users keep complaining. Name three explanations. (Saturation, judge misalignment, the offline set doesn't match real traffic.)
3. pass@k vs pass^k: which one for a coding assistant, which for an autonomous refund agent, and why?
4. When do you grade the trajectory instead of the outcome?
5. An engineer proposes fixing the most frequent failure mode first. When is that wrong?
6. Why one judge per failure mode instead of one judge for quality?
7. What does it mean when your held-out numbers are much worse than your development numbers?

## Done when

- You've validated a judge against your own labels and can quote its agreement, precision and recall from the exercise.
- You can explain why raw agreement misleads on imbalanced labels.
- You can say what your held-out run showed and what you concluded from the gap.
- You can define pass@k vs pass^k and pick the right one for a given product without hesitation.
- There's a ship-call memo in `workbook/` that cites eval evidence and names what the evals can't see.

Worked versions: `reference/02-judge-prompt.md`, `reference/02-checks.py`, `reference/02-ship-call.md`.
