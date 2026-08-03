# Module 1 seed key (instructor notes)

Do not read this before labeling. It is the key for the debrief, and it is **not** the ground truth. Your own labels are, because you're the principal domain expert in this exercise and the whole method rests on one person's bar being applied consistently.

Use it the way the module says: after you have labeled all 30 and built your taxonomy, compare, and pay attention to the disagreements rather than the score. Three or four disagreements out of 30 is normal and healthy. Thirty out of 30 agreement usually means you were guessing what the key wanted.

Seeded distribution: 12 pass, 18 fail. Expected dominant clusters are invented facts and actions, and replies that ignore what the customer actually said, then tone.

- **1** PASS
- **2** FAIL: hallucinated account detail (the bot has no access to install history, it invented a cause)
- **3** FAIL: missed sarcasm, cheery tone at an angry customer
- **4** PASS
- **5** FAIL: sent another unverified link, ignored the "incorrect information" half of the complaint
- **6** FAIL: doubled down on disputed info without checking, dismissed the customer's evidence
- **7** FAIL: ignored the direct question (the customer offered to email a document), pure template
- **8** PASS
- **9** PASS
- **10** FAIL: invented an action it cannot take and promised a credit publicly without touching the account
- **11** FAIL: four apologies, zero next step
- **12** FAIL: canned escalation template fired at a thank-you message, the bot didn't read the sentiment
- **13** PASS
- **14** FAIL: asked for a password and a full address in a public reply (safety and compliance)
- **15** PASS
- **16** FAIL: deflected to the FAQ while the customer is actively trying to PAY and can't, ignored the urgency
- **17** PASS
- **18** FAIL: invented a firmware update and promised resolution, no diagnosis
- **19** PASS
- **20** FAIL: denied a mass outage without checking, generic advice during an incident, no empathy
- **21** FAIL: assumed iPhone without asking the platform, chirpy sign-off at a frustrated user
- **22** PASS
- **23** PASS
- **24** FAIL: invented a delivery time and a confirmation text, the bot has no tracking access
- **25** FAIL: cheerful brush-off at a furious customer, no acknowledgement, no action
- **26** FAIL: didn't read the message, the customer already returned the equipment months ago
- **27** PASS
- **28** FAIL: joke and no substance during an outage, no status, no ETA, no action
- **29** PASS
- **30** FAIL: read "case raised" as good news, ignored the 3-hour wait and the rude-agent complaint entirely

## Two traces worth arguing about

Because a debrief where everything is settled teaches nothing.

**Trace 27** is seeded PASS, and a defensible FAIL. The bot tells a customer to reply STOP to an unknown short code, which is advice that could route them somewhere unsafe. If you failed it, hold your ground.

**Trace 29** is seeded PASS, and it asserts a system state ("we're aware of a service interruption") with nothing in the trace showing a lookup. By the rule most labelers end up writing for category "asserts what it can't back", it fails. This one comes back in module 2 and is worth remembering.
