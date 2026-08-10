# Evals, a working course for people building with AI

Read this reply. A customer wrote in, a bot drafted the answer, and it is sitting in a queue waiting for a human to approve it or fix it.

> **Customer:** I have to be at work at 2pm tomorrow. My new phone is being overnighted but it may not be there until then. I have no other ride.
>
> **Bot:** Good news, your package is out for delivery and will arrive by 10:30 AM tomorrow, well before your shift. You'll receive a text confirmation within the hour.

Would you let that go out?

It reads well. It is warm, it is specific, and it answers the thing the customer is actually worried about. Most people pass it.

The bot has no access to delivery tracking. It invented the time, and it invented the text message. Somebody is going to stand outside at 10:30 waiting for a phone that is not coming, and then miss a shift.

That call, made thirty times in a row, is the whole first session of this course.

## What this is

Two sessions, about ninety minutes each. You are the AI PM at a telecom whose support bot drafts public replies. Leadership wants to know whether it can run with less human oversight, and you are the person who has to answer.

So you do what the answer actually requires. You read thirty real complaints and thirty drafted replies, you decide one at a time, you find out how the thing really fails, and then you build something that can make that judgment without you in the room.

You do the judging. Claude Code sits next to you, runs the scripts, does the counting, and argues with you when your reasoning is thin.

## What you walk out with

Not notes. Four things you made:

- **A failure taxonomy** for a real product, built from traces you read yourself, with counts you can defend
- **A validated LLM judge**, and the numbers proving whether it agrees with you or just looks like it does
- **A held-out result**, which is the most honest number most teams never produce
- **A ship memo** that makes a call on reducing human oversight, backed by evidence you generated

You also get the thing behind all of it, which is a working sense of why most eval dashboards measure nothing.

## Start

1. Download or clone this repo
2. Open the folder in [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)
3. Type anything. Hello works
4. It greets you and asks where to begin

No install, no commands, no setup file to edit. If you have never used a terminal, that is fine, because you never have to type one.

## What it is not

It is not a reading course. There is no video, and the pre-reads are one link each.

It is not a tour of eval tooling. You will not install a platform or configure a dashboard. The teams that do that first are the ones this course exists to argue with.

It does not require you to code. You will read code and decide rules. Claude Code writes it.

## The two sessions

**1. Error analysis.** You label thirty traces by hand, then cluster your own critiques into named failure modes and count them. Nobody hands you a list of failure types, because the whole point is that the list comes out of the data. You finish with a number for how often the product fails, and an argument about what to fix first that is not just "the most common one".

**2. LLM as judge.** You take those labels and build a prompt that grades the way you do. Then you find out whether it actually does, which is the part almost everyone skips. You measure it against your own calls, read every disagreement, fix what is broken, and only then run it on traces it has never seen. The gap between those two numbers is the size of anything you were fooling yourself about.

They are one continuous build, so the order is fixed.

## How the work moves

You work in two places. Browser pages hold everything you read, sort and decide. The chat with Claude Code is where the counting and the arguing happen.

When Claude Code needs your work, you click one button and paste. That is the only manual step in the whole course. When it has something for you, it writes into the page and you reload.

## What you need

Claude Code, and a Claude subscription or an API key with credit. The second session grades about fifty short replies, which costs cents rather than dollars.

A browser. The pages run offline with no build step.

That is the list.

## What is in here

| Path | What it is |
|---|---|
| `CLAUDE.md` | The greeting Claude Code reads first, so a cold clone knows what to do |
| `RUNNING.md` | How Claude Code is meant to teach, including where to push back on you |
| `modules/` | The two sessions |
| `apps/` | The browser pages where your judgment happens |
| `data/` | The scenario, with provenance in `data/PROVENANCE.md` |
| `workbook/` | Empty. Your own work lands here |
| `reference/` | Worked versions, from one real run through the course |
| `tools/` | Scripts for running a judge and rebuilding the pages |

`reference/` will spoil the exercises. It is there so you can compare your judgment against someone else's after you have committed to your own, which is the only comparison worth anything.

## Where this comes from

Built on public writing by people who do this work, mostly [Hamel Husain](https://hamel.dev/blog/posts/field-guide/), [Aman Khan](https://www.lennysnewsletter.com/p/beyond-vibe-checks-a-pms-complete) and [Anthropic's engineering blog](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents). Full list at the bottom of each module.

The customer messages are real. The bot replies were written for the exercise with failure modes seeded into them, and you are not told which or how many. See [data/PROVENANCE.md](data/PROVENANCE.md) and [LICENSE.md](LICENSE.md).

---

By the way, the reply above is trace 24. You will meet it again about two thirds of the way in, and by then you will have a name for what is wrong with it.

I'm Wiktor, I built this. www.linkedin.com/in/wiktorsobolak
