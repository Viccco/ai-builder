# Evals for AI product managers, a working course

Two modules, about ninety minutes each. You finish able to build an eval with your own hands, defend a quality number to an engineer, and say why most teams' eval dashboards are measuring nothing.

This is not a reading course. In every session you do the judgment yourself. You label real bot replies one at a time, you name the ways the product fails, you write the prompt that grades them, and you make the ship call. Claude Code does the plumbing around you, meaning the scripts, the scoring, the counting and the file writing, and it argues with you when your reasoning is thin.

## Who it is for

A product manager moving into AI products who can already ship software with a team, but has never personally built an eval or defended a quality number to an engineer. No coding required. You read code and decide rules, and Claude Code writes it.

## How to start

1. Clone or download this repo.
2. Open the folder in [Claude Code](https://docs.claude.com/en/docs/claude-code/overview).
3. Type anything. Hello, start, or a question.
4. Pick where to begin when it asks.

Nothing to install and no commands to run. Claude Code reads the repo and takes it from there.

## The two modules

**Module 1, error analysis and the failure taxonomy.** You label 30 real traces by hand, cluster your own critiques into named failure modes, and count them. You walk out with a taxonomy you built and can defend, and with the number that starts every conversation about whether the thing is safe to ship.

**Module 2, LLM as judge and eval-driven development.** You take those labels and build a judge that grades the way you do, then validate it, because a judge is itself an AI product that can be wrong. You measure its agreement with you, fix what disagrees, and only then run it on traces it has never seen. Ends with a ship memo backed by evidence you produced.

They are one continuous build. Module 2 consumes what you make in module 1, so the order is fixed.

## How the pieces move

You work in two places. Browser pages under `apps/` hold everything you read, sort and decide. The chat with Claude Code is where the counting and arguing happen.

When Claude Code needs your work, you click **Copy for Claude Code** and paste it into the chat. That is the only manual step in the course. When Claude Code has something for you, it writes straight into the page and you reload the tab. The apps pass work to each other on their own.

## Files

| File | What it is | Where it is used |
|---|---|---|
| `CLAUDE.md` | The greeting and router Claude Code reads first | Every session |
| `RUNNING.md` | Operating rules for Claude Code | Loaded once you pick a starting point |
| `modules/` | The two sessions, with their pre-reads and exercises | Read with Claude Code as you go |
| `apps/` | The browser pages where your judgment happens | Start at `apps/index.html` |
| `data/` | The scenario data, with provenance in `data/PROVENANCE.md` | Loaded into the apps |
| `workbook/` | Empty. Your own outputs land here | Written by Claude Code as you work |
| `reference/` | Worked versions, from one real run through the course | Open after you finish a module |
| `tools/` | Small scripts for running a judge and rebuilding the apps | Mostly maintenance |

`reference/` will spoil the exercises. It exists so you can compare your judgment to someone else's after you have committed to your own, which is the point of the debrief.

## Requirements

Claude Code, and a Claude subscription or an API key with credit. Module 2 grades 30 short traces, which is a few cents of usage rather than dollars. A recent Chrome, Edge, Firefox or Safari for the app pages. Nothing else.

Python is optional. One script uses it if you have an API key, and Claude Code can do that work without it.

## Sources

The course is built on public writing from people who do this work.

- Aman Khan, Beyond vibe checks, a PM's complete guide to evals. https://www.lennysnewsletter.com/p/beyond-vibe-checks-a-pms-complete
- Hamel Husain, Your AI product needs evals. https://hamel.dev/blog/posts/evals/
- Hamel Husain, Creating an LLM as a judge that drives business results. https://hamel.dev/blog/posts/llm-judge/
- Hamel Husain, A field guide to rapidly improving AI products. https://hamel.dev/blog/posts/field-guide/
- Anthropic, Demystifying evals for AI agents. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- OpenAI Cookbook, Eval driven system design. https://developers.openai.com/cookbook/examples/partners/eval_driven_system_design/receipt_inspection

Licence and data attribution: [LICENSE.md](LICENSE.md) and [data/PROVENANCE.md](data/PROVENANCE.md).

---

I'm Wiktor, I built this course. www.linkedin.com/in/wiktorsobolak
