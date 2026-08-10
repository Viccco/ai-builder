# Where the data comes from

## support_tweets_200.json

200 real customer messages to telecom and tech support accounts on X, with the human agent reply that followed. Only the customer messages are used in the course. Sampled from the Customer Support on Twitter dataset (945k pairs), Hugging Face: `MohammadOthman/mo-customer-support-tweets-945k`.

Licence: CC-BY-NC-SA. Attribution required, share-alike, **non-commercial only**.

That last part is a real constraint. This repo can be given away and taught from freely. It cannot be sold with this file in it. Replacing these 200 messages with synthetic ones written in the same register removes the constraint, and nothing in the course depends on the messages being real beyond the texture they carry.

Brand names appear in the raw messages because customers wrote them (Verizon, Spectrum, TMobile). The course scenario renames the company to the fictional Northline. Where a real brand shows through in a trace, treat it as noise in a customer message, which is what it is.

## session1_bot_replies.json

30 bot drafts written for this course, paired with the first 30 customer messages above. The failure modes were seeded deliberately, so the file is the answer key's other half. Generated material, no upstream licence, covered by this repo's MIT terms.

`session1_seed_notes.md` holds the seeded verdicts. It is the instructor key for the module 1 debrief, and it is not the ground truth. The labeler's own calls are.

