# Where the data comes from

## support_tweets_200.json

200 real customer messages to telecom and tech support accounts on X, with the human agent reply that followed. Only the customer messages are used in the course. Sampled from the Customer Support on Twitter dataset (945k pairs), Hugging Face: `MohammadOthman/mo-customer-support-tweets-945k`.

Licence: CC-BY-NC-SA. Attribution required, share-alike, **non-commercial only**.

That last part is a real constraint. This repo can be given away and taught from freely. It cannot be sold with this file in it. Replacing these 200 messages with synthetic ones written in the same register removes the constraint, and nothing in the course depends on the messages being real beyond the texture they carry.

Brand names appear in the raw messages because customers wrote them (Verizon, Spectrum, TMobile). The course scenario renames the company to the fictional Northline. Where a real brand shows through in a trace, treat it as noise in a customer message, which is what it is.

## session1_bot_replies.json

30 bot drafts written for this course, paired with the first 30 customer messages above. The failure modes were seeded deliberately, so the file is the answer key's other half. Generated material, no upstream licence, covered by this repo's MIT terms.

`session1_seed_notes.md` holds the seeded verdicts. It is the instructor key for the module 1 debrief, and it is not the ground truth. The labeler's own calls are.

## taubench_retail_failed.json

8 failed runs of a GPT-4o retail support agent, taken from tau-bench's published historical trajectories. Each record holds the agent policy as the system prompt, the full conversation with tool calls and results, a reward of 0.0, and an `info` block with the user's actual goal and the ground truth actions.

Source: https://github.com/sierra-research/tau-bench/tree/main/historical_trajectories
Licence: MIT. Attribution is enough.

## production_stream.json

Written from scratch by `tools/make_stream.py`, customer messages included, so module 4 carries no upstream licence at all. A day of traffic for the support assistant, with a quality regression planted partway through and four policy incidents scattered across it. Regenerate it with `python3 tools/make_stream.py`, which is deterministic.

## capstone-scenario.md

Written for module 5. The fallback product for anyone who arrives without one of their own.
