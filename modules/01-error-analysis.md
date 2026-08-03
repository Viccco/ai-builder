# Module 1. Error analysis and the failure taxonomy

The foundation. Everything later in the course consumes what you produce here.

## Pre-read (before the session, ~15 min)

Aman Khan, Beyond vibe checks: a PM's complete guide to evals.
https://www.lennysnewsletter.com/p/beyond-vibe-checks-a-pms-complete

Read it for the framing, not the details. The one idea to bring into the session: an eval defines what "good" means for your product, the way a driving test defines what a safe driver means. Kevin Weil (OpenAI CPO) calls writing evals a core PM skill. You'll form your own opinion on whether that's hype by the end of module 2.

## Primer (~20 min)

### What an eval is

An eval is a repeatable measurement of AI quality. Formally: a task (what the system should do), an environment (the input and state it runs against), and a grader (the thing that decides if the output was good). That trio is from Anthropic's agent-evals post and it scales from a one-line assertion to a full agent benchmark.

The word covers two different activities and people mix them up:
- Building a labeled dataset and grading outputs against it (offline evals). This is what "eval suite" means.
- Watching quality in production through feedback, sampling, A/B tests (online evals).

You need both eventually. Modules 1 to 3 build the offline kind because that's the one you build with your hands. Module 4 covers the online half.

### Three kinds of graders

1. Code-based. String match, regex, JSON schema check, "did it include a link". Cheap, fast, brittle. Great for mechanical failures.
2. LLM-as-judge. A model grades the output against a written rubric. Scales to subjective quality, but the judge is itself an AI product that can be wrong, so it must be validated (module 2).
3. Human. The gold standard and the most expensive. Its main job is to calibrate the other two.

### Hamel's three levels

Match the machinery to product maturity:
- Level 1: unit tests and assertions. Run on every change. Minutes to write.
- Level 2: human and model evals over logged traces. Periodic. This is where most of the value is and where this session lives.
- Level 3: A/B tests. Only when you have traffic worth splitting.

Most teams skip to wanting a dashboard. The dashboard without the groundwork is what Hamel calls a false sense of measurement.

### The method: look at your data

The single strongest consensus across every source in this course: quality work starts with reading real traces one by one, not with picking metrics. The workflow, from Hamel and Shreya Shankar's error-analysis school:

1. Collect traces of the system doing real work.
2. Remove all friction from reading them. Purpose-built viewer, one trace per screen. Teams that do this review an order of magnitude more data.
3. One principal domain expert labels. Not a committee, not outsourced to engineers who don't know the domain. One person whose taste defines the bar.
4. Open coding: for each trace, a binary pass/fail plus a short written critique in free form. No categories yet, just honest notes.
5. Axial coding: cluster the critiques into named failure modes. This is your failure taxonomy.
6. Count. A few failure modes will dominate (in the NurtureBoss case study, 3 categories explained over 60% of all failures). Those counts, weighted by business impact, are your roadmap.

### Why binary and not 1 to 5

Because nobody knows what to do with a 3. A Likert score hides the decision. Pass/fail forces the question "would I ship this exact output" and the critique captures the nuance the number would have hidden. The critiques aren't ceremony either: in module 2 they become few-shot examples inside the judge prompt.

### Where evals come from

Not from brainstorming. From failures. Anthropic's guidance: start with 20 to 50 cases converted from real bug reports and the manual checks you already run by hand. Don't wait until you can build hundreds. A small suite built from real failures beats a large synthetic one.

### If your product has no traces yet

Most teams have less logging than they think, and "we can't do error analysis, we don't have traces" is the most common way this work never starts. Four ways to get 30 traces this week, roughly in order of how honest the signal is:

1. **The support and sales backlog.** Complaints, refund threads, escalations, and the "the AI did something weird" screenshots in Slack are traces someone already collected for you. Biased toward failure, which is fine, since you're hunting failure.
2. **Your own hands.** Sit down and use the product for an hour like a real user with real tasks. Save every output. Painful, fast, and the quality of your bar goes up because you felt the friction.
3. **Session replays and logs you already keep.** Usually the input and output exist somewhere even when nobody calls it a trace. Ask an engineer for a dump of 50 rows and a way to see the prompt that produced each one.
4. **Synthetic inputs from real shapes.** Take the queries you know users send, vary them across the dimensions that matter (persona, task, tone, length, edge cases), and generate the inputs. Never generate the outputs and never generate the labels, or you're grading fiction.

If nothing exists, the first eval deliverable is a logging request, and it's a small one: the input, the output, the prompt version, the model, a timestamp, and an id you can join on later.

## Exercise (~50 min)

Scenario. You're the AI PM at Northline, a fictional telecom. The team piloted an AI bot that drafts public replies to customer complaints on X. Human agents currently approve every draft. Leadership wants to know if the bot can run with less oversight. Before anyone argues about that, you do what an AI PM does first, which is error analysis on real traces.

The customer messages are real. The bot replies were generated for this exercise with realistic failure modes seeded in. You don't know which or how many.

Steps:

1. Open `apps/01-labeler/index.html` in a browser. 30 traces, one per screen, autosaves as you go.
2. Label all 30. Binary verdict plus one honest sentence per trace. You are the principal domain expert, so the bar is yours: "would I let this go out under the company name, unedited". Target pace is under a minute per trace, and the app shows you when you're stalling. Don't deliberate, your first read is the data. (~30 min)
3. Export the labels (button, downloads `01-labels.json`) into `workbook/` and tell Claude Code where it is.
4. Axial coding. Open `apps/01-clusters/index.html`, load your labels, and drag the critiques into buckets until the shape of the failure surface appears. You name the categories, you pin one example trace to each. Rule of thumb: 3 to 6 categories, each defined by one sentence. Export when it holds together. (~10 min)
5. Give the export to Claude Code. It counts, checks whether any category is doing two jobs, argues with the definitions that are vague, and writes `workbook/01-taxonomy.md` with you. Finish it with one decision sentence: "the dominant failure mode is X, it appears in N of 30 traces, and the next fix is Y". (~5 min)
6. Only now open `data/session1_seed_notes.md` and compare against what was seeded. Disagreement is fine and it's the interesting part. Your labels are the ground truth, the seed key is just the debrief.

Kickoff prompt for a fresh Claude Code session:

```
Module 1 of the AI PM evals course. Read modules/01-error-analysis.md and run the exercise
with me. I'll label 30 traces in apps/01-labeler first, then cluster them in apps/01-clusters,
then hand you both exports. Your job afterwards: count, challenge weak category definitions,
push me when a category is named after a fix instead of a cause, and write
workbook/01-taxonomy.md with me. Do not open data/session1_seed_notes.md until I say the
labeling is done.
```

## Interview drill (~15 min)

Answer out loud. Ask Claude to play a skeptical hiring manager for an AI PM role and push on vague spots.

1. Walk me through how you'd build evals for a new AI feature from zero. (Expected shape: traces first, expert labels, taxonomy, then automate the top failure modes. Not "we'd define metrics".)
2. Why binary pass/fail instead of a 1 to 5 scale?
3. Who should label the data and why not crowdsource it?
4. You have 30 labeled examples. Is that enough to be useful? What would you do with 300?
5. What's the difference between an eval and a metric on a dashboard?
6. Your team has no traces and no logging. What do you do in week one?

## Done when

- You can describe the trace-to-taxonomy workflow from memory, with the open and axial coding names attached.
- You have a taxonomy you built yourself in `workbook/01-taxonomy.md` and can defend its categories.
- You can say why binary plus critique beats Likert without reaching for the article.
- You can answer "we have no data" with four concrete moves instead of a shrug.

A worked version of this module is in `reference/01-taxonomy.md`. Read it after step 6, not before.
