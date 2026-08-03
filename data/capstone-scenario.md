# Fallback scenario for module 5

Use this only if you have no real product to point the method at. A product you actually work on is worth more, because the reference answers will be honest.

## The product

A meeting-notes assistant inside a work chat tool. It joins recurring meetings, transcribes them, and afterwards posts a short summary plus a list of action items, each with an owner and, where one was mentioned, a due date. Owners get a direct message with their items.

It's live for 400 teams. Adoption is good and nobody knows whether it's any good, which is the situation this course exists for.

## What it does under the hood

A transcript comes in. One call summarises. A second extracts action items as structured output (text, owner, due date, a quote from the transcript that supports it). Owner names are matched against the team directory. Anything unmatched is posted with no owner.

It's a workflow rather than an agent. The steps were known at design time.

## What people complain about

Collected from support and from the team's own Slack, unsorted, as it actually arrives:

- "It gave me an action item I never agreed to."
- "It assigned Marta something Jakub said he'd do."
- "Half the list is stuff we explicitly decided not to do."
- "It missed the only real decision in the meeting."
- "The due date is wrong, we said end of quarter and it wrote the 30th."
- "It quoted me saying something I didn't say."
- "Fine, but I still read the whole transcript, so what did it save me."
- "It posted a summary of a performance conversation into the team channel."

That last one is not the same kind of complaint as the others. Working out why is part of the exercise.

## What you know about the business

The team wants to charge for it next quarter. The exec sponsor wants a number that says it works. The engineering lead wants to swap the extraction model for a cheaper one and needs to know if quality drops.

Three different decisions, and they don't want the same metric.

## What you don't have

No labeled data. No eval suite. Logs hold the transcript, the output and a timestamp, and nothing about what happened afterwards. Thumbs exist on the summary, at a 2% response rate, running 78% positive.

## Where to start

Module 1's method still applies with no eval suite in the building. There are transcripts and outputs sitting in the logs, and there is a support backlog full of failures somebody already collected. That is your first 30 traces.
