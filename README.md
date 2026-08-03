# Evals and harness literacy: a working course for AI PMs

Five sessions, about 1.5 hours each. You finish able to build evals with your own hands, read and diagnose an agent system, and talk about both from practice instead of from articles.

This is not a reading course. In every session you do the judgment work yourself: you label real traces, you name the failure modes, you write the judge prompt, you make the ship call. Claude Code does the plumbing around you (running scripts, scoring, counting, writing files) and argues with you when your reasoning is thin.

## Who it's for

A product manager who is moving into AI products and can already ship software with a team, but has never personally built an eval, read an agent trace, or defended a quality number to an engineer. No coding required. You will read code and decide rules, and Claude Code writes it.

## Why these two skills

Every serious AI product team runs the same loop: ship something, look at what it actually does, name the failures, measure them, fix the biggest one, repeat. Evals are how you make that loop measurable. The harness is the thing being measured, meaning the model plus its tools, prompts, memory, and control flow. A PM who can run the loop personally is rare and gets hired for it.

## The five modules

| # | Module | What you walk out with |
|---|---|---|
| 1 | [Error analysis and the failure taxonomy](modules/01-error-analysis.md) | 30 traces you labeled yourself and a named, counted taxonomy of how the product fails |
| 2 | [LLM-as-judge and eval-driven development](modules/02-llm-judge.md) | A validated judge, code assertions, and a ship memo backed by eval evidence |
| 3 | [Harness literacy: agent loops, tools, context](modules/03-harness-literacy.md) | A failure log from real failed agent runs and a ranked list of harness fixes |
| 4 | [After ship: online evals, guardrails, the flywheel](modules/04-after-ship.md) | A monitoring and triage plan that survives contact with production traffic |
| 5 | [Capstone: your product, end to end](modules/05-capstone.md) | An eval plan for a product you actually work on, plus a cold mock interview |

Modules 1 and 2 are one continuous build. Module 2 uses the labels you produce in module 1, so don't swap the order. Modules 3, 4 and 5 build on the vocabulary from 1 and 2.

## How to run a module

1. Do the pre-read before you sit down. Fifteen minutes, one link.
2. Open the module file in a fresh Claude Code session and paste its kickoff prompt.
3. Work through the exercise. The interactive apps in `apps/` are where your judgment happens. Claude Code runs everything that needs a model or a script.
4. End with the interview drill. Answer out loud and let Claude push back.
5. Check the "done when" list. If something is fuzzy, say so and drill it again.

Setup takes about ten minutes: [SETUP.md](SETUP.md).

## What's in here

```
modules/     the five sessions
apps/        the interactive tools, plain HTML, start at apps/index.html
data/        the scenario data, with provenance in data/PROVENANCE.md
workbook/    empty, your own outputs land here
reference/   worked solutions, open only after you've done the module
tools/       small scripts: run a judge, rebuild the data
```

`reference/` will spoil the exercises. It exists so you can compare your judgment to someone else's after you've committed to your own, which is the point of the debrief.

## Sources

The course is built on public writing from people who do this work.

Evals:
- Aman Khan, Beyond vibe checks: a PM's complete guide to evals. https://www.lennysnewsletter.com/p/beyond-vibe-checks-a-pms-complete
- Hamel Husain, Your AI product needs evals. https://hamel.dev/blog/posts/evals/
- Hamel Husain, Creating an LLM-as-a-judge that drives business results. https://hamel.dev/blog/posts/llm-judge/
- Hamel Husain, A field guide to rapidly improving AI products. https://hamel.dev/blog/posts/field-guide/
- Anthropic, Demystifying evals for AI agents. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- OpenAI Cookbook, Eval driven system design. https://developers.openai.com/cookbook/examples/partners/eval_driven_system_design/receipt_inspection

Harness:
- Anthropic, Building effective agents. https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, Effective context engineering for AI agents. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, Writing effective tools for agents. https://www.anthropic.com/engineering/writing-tools-for-agents

Licence and data attribution: [LICENSE.md](LICENSE.md) and [data/PROVENANCE.md](data/PROVENANCE.md).
