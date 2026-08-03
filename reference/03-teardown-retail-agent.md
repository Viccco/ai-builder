# Worked teardown 1: the tau-bench retail agent

The agent you spent module 3 reading. Everything below comes from the data in `data/taubench_retail_failed.json`, so you can check every claim against the file.

## What it is

A customer support agent for an online retailer. It talks to one user at a time and can cancel or modify pending orders, return or exchange delivered ones, change an address, and answer questions about a profile, an order or a product.

## The harness

**System prompt.** A written policy, about two pages, in three layers: what the agent may do, hard rules of procedure (authenticate first, confirm before anything that writes to the database, never invent information, one tool call at a time, transfer to a human only when the request is out of scope), then a domain section explaining orders, items, statuses and payment methods, and finally a per-action section with the rules for cancelling, modifying, returning and exchanging.

**Tools.** Ten, in three groups you can read off the names: lookups (`find_user_id_by_email`, `find_user_id_by_name_zip`, `get_user_details`, `get_order_details`, `get_product_details`), writes (`cancel_pending_order`, `modify_pending_order_items`, `return_delivered_order_items`, `exchange_delivered_order_items`, `modify_user_address`), and the human handoff.

**The loop.** Model turn, one tool call, tool result, next model turn, with a user in the loop who answers questions and confirms actions. The runs in this file are 22 to 34 turns.

**Stop conditions.** The task ends when the user is satisfied, or the agent transfers to a human. There is no automatic verifier at the end, which is exactly why these eight runs could return a reward of 0.0 while the transcript reads like a competent, polite conversation.

**Context.** Everything stays in the window. No compaction, no retrieval, no notes. At this length it works, and it is also why an assumption made at turn 5 survives to turn 30 unchallenged.

## The grader

Outcome grading against a ground truth action list. tau-bench stores the actions that would have satisfied the user's real goal, and compares the database state the agent produced against the state those actions would have produced. The exact tool sequence is not graded, which is the right call: several orderings reach the same end state.

Note what that means for reading a transcript. A run can contain no rudeness, no hallucination and no visible error, and still score zero, because the customer wanted one item cancelled and got the whole order cancelled. Quality that a human reviewer would pass, and an outcome that is wrong.

## Where a judge would live

Not on the outcome, which is already checkable in code. A judge belongs on the parts the reward cannot see:

- Was the disclosure before a consequential action complete? The policy says list the action detail and get an explicit yes. "Shall I cancel that for you?" gets a yes without telling the user that three items and two thousand dollars are going away. Code can check that a confirmation happened. Only a judge can check that it was honest.
- Did the agent invent a procedure the policy never gave it?
- Did it hand off to a human when it should have?

## The invariants

Three things must hold on every run, whatever the outcome, and these are trajectory checks rather than quality grades: authentication happens before any account data is shown, no write tool is called without a confirmation turn in front of it, and no data from another user ever appears.

## The failure surface in these eight runs

Read them and the same shapes recur. Goal misread, where the agent hears "cancel the air purifier from that order" and cancels the order. Confusable tools, where cancel and modify sit next to each other and only one of them is reversible. Hollow confirmation, where a yes is obtained without disclosing what is being agreed to. A wrong assumption carried forward from an early turn. And `Error: user not found` early on, which is the tool being honest and the agent not always adapting well to it.

## The cheapest fixes, in order

1. **A line in the policy at the right altitude.** "A pending order can only be cancelled in full. To remove or change a single item, use `modify_pending_order_items`. Before cancelling, list every item and the total refund, and get an explicit yes." That is one edit against the most expensive failure class in the set.
2. **Tool descriptions that name the blast radius.** `cancel_pending_order` should say in its own description that it cancels every item in the order and cannot be undone. Descriptions are prompts, and this one is doing no work.
3. **A verifier before any write.** The evaluator-optimizer pattern, applied narrowly: a second call that reads the pending action against the user's stated goal and blocks if they disagree. More expensive than the first two, so it goes third, and only if they are not enough.

Note the shape of that ranking. Two prompt edits before any new machinery. When you propose the machinery first, an engineer will ask what the prompt edit costs, and the honest answer is almost nothing.
