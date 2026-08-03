# Module 3. Harness literacy: agent loops, tools, context

## Pre-read (before the session, ~15 min)

Anthropic, Building effective agents.
https://www.anthropic.com/engineering/building-effective-agents

The canonical piece. Read the whole thing, it's short. Everything in this primer extends it.

## Primer (~25 min, the densest of the course)

### Workflow vs agent

The distinction the whole field converged on:
- A workflow is LLM calls orchestrated through code paths you predefined. You know the steps at design time.
- An agent is a model directing its own process: it decides which tool to call next, based on what came back, until it decides it's done.

The engineering advice attached to it: use the simplest thing that works. Many "agent" products are workflows, and should be. Agents buy flexibility on open-ended tasks and pay for it in cost, latency, and compounding error. That tradeoff is a product decision, which is why a PM needs to hold it.

### The augmented LLM and the five workflow patterns

The atomic unit is one LLM call augmented with tools, retrieval, and memory. Compose it into:
1. Prompt chaining: fixed sequence of calls, each consuming the last output. Use when the task decomposes cleanly.
2. Routing: classify the input, send it down a specialized path.
3. Parallelization: run pieces simultaneously, or run the same task several times and vote.
4. Orchestrator-workers: a lead model breaks the task down and delegates to workers dynamically.
5. Evaluator-optimizer: one model generates, another critiques, loop until good enough.

Being able to name these, and say which one a given product needs, is most of what "harness literacy" means in a screening interview.

### Anatomy of the agent loop

Every agent harness is the same skeleton: system prompt (the policy), tool definitions, then a loop of model turn, tool call, tool result, next model turn, until a stop condition (task done, max turns, budget, or human handoff). Practical constraints that bite in production:
- Errors compound. A wrong assumption at turn 3 quietly poisons turn 20.
- Stop conditions are product decisions. When does it ask a human? When must it?
- Agents are stochastic, so reliability is measured pass^k, not by one demo.
- Cost and latency scale with loop length, and nobody notices until the bill.

### Tools are an interface, and descriptions are prompts

Anthropic calls it the agent-computer interface, and the advice mirrors UX design:
- Fewer, higher-level tools beat one wrapper per API endpoint. A `schedule_event` tool beats four calendar primitives the model must compose.
- Namespace related tools with consistent prefixes so the model picks the right one.
- Tool descriptions are prompt engineering. Write them like onboarding a new colleague. Small wording changes measurably move eval scores.
- Returns should be high-signal and token-cheap: names instead of UUIDs, pagination, truncation with a hint about how to get more.

### Context is a finite budget

The model's attention degrades as the window fills. Anthropic calls it context rot. Consequences:
- Context engineering is curation: what earns a place in the window at this moment. It's a superset of prompt engineering.
- System prompts have an altitude problem: too low and you get brittle if-then rules, too high and you get vague platitudes. Aim between.
- Just-in-time retrieval beats pre-loading: keep lightweight identifiers, let the agent fetch details through tools when needed.
- Long tasks need machinery: compaction (summarize the window and restart), structured note-taking (external memory the agent writes as it works), or sub-agents that explore and return condensed summaries.

If you've watched a coding agent summarize a long conversation and keep working, you've seen compaction in production.

### Evaluating agents, one loop back

Module 2's concepts apply directly: grade outcomes not tool sequences, check trajectory only for invariants (no policy violations), run multiple trials, report pass^k for autonomy. Hold onto this, the exercise uses it.

## Exercise (~55 min)

Real failure analysis on real agent transcripts. `data/taubench_retail_failed.json` holds 8 runs of a GPT-4o retail support agent from tau-bench (Sierra's benchmark). Each has the agent policy as system prompt, the full conversation with tool calls and results, a reward of 0.0 (it failed the task), and an `info` block with the user's actual goal and the ground-truth actions.

1. Open `apps/03-replayer/index.html`. It steps through one run at a time, turn by turn, with the ground truth withheld. Read run 1 top to bottom, out loud where it helps. Mark the turn where it first went wrong and pick a failure class. Then reveal the ground truth and see whether you called it at the right turn. (~15 min)

2. Do three more. The discipline the app enforces is earliest wrong step, not last visible symptom, because the last symptom is where you notice and the earliest step is where you fix. Build failure classes as you go, the same axial-coding move as module 1, now applied to trajectories. Classes you may find: wrong tool arguments, skipped policy step (authentication, confirmation), wrong assumption carried forward, gave up too early, user goal misread. (~20 min)

3. The PM move: for each dominant failure class, pick the cheapest lever that addresses it. A tool description edit, consolidating two confusable tools, a policy line moved to a better altitude in the system prompt, an added verifier step (evaluator-optimizer), or a forced confirmation before destructive actions. The app makes you name which pattern from the primer each fix instantiates, and Claude Code argues about whether your lever is really the cheapest one that works. Export to `workbook/03-failure-log.md`. (~15 min)

4. Teardown to close (~5 min). Pick an agent product you actually use and map it to the vocabulary out loud: what's the harness, what are the tools, where does the loop stop, what's the grader, where would a judge live, what does it do about context rot. Claude Code plays the person who has never heard of it and asks for the parts you skipped. Two worked teardowns sit in `reference/` if you want a model first.

Kickoff prompt for a fresh Claude Code session:

```
Module 3 of the AI PM evals course. Read modules/03-harness-literacy.md and run the exercise
with me. I'm working through the failed tau-bench trajectories in apps/03-replayer, calling
the earliest wrong step myself before revealing ground truth. Your job: after each run, argue
with my failure class if it names a symptom instead of a cause, and challenge my proposed
harness fixes by making me say which lever is cheapest and why. Then help me write
workbook/03-failure-log.md. Close by playing a skeptic while I tear down an agent product
I use.
```

## Interview drill (~15 min)

1. What actually breaks agents in production? Give three failure classes you've seen in real transcripts. (You'll have them from today.)
2. Workflow or agent for generating an automation workflow from a text prompt? Defend the choice, then argue the other side.
3. A team wants to add a tool per API endpoint, 40 tools total. What do you tell them?
4. What is context rot and what are the standard countermeasures for long-running tasks?
5. Your agent passes the demo every time and fails for customers. What's your first diagnostic step? (Read failed trajectories. Always.)
6. Where does a confirmation step belong, and what does it cost you when you add one everywhere?

## Done when

- You can sketch the agent loop on a whiteboard and name where errors compound and where stop conditions live.
- You can name the five workflow patterns and pick one for a described product.
- You've read real failed trajectories and can tell a concrete story about the earliest-wrong-step discipline.
- You can tear down an agent product you use in this vocabulary, without notes.

Worked teardowns: `reference/03-teardown-retail-agent.md` and `reference/03-teardown-coding-agent.md`.
