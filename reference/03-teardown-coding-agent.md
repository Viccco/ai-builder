# Worked teardown 2: a terminal coding agent

The second teardown is of something you can watch while you read this. Claude Code is a coding agent that runs in a terminal, and everything below is observable from using it for an hour, which is the point. You should be able to do this to any agent product you use.

Do this yourself with a product you know before you read further. The value is in producing the map, not in reading someone else's.

## What it is

An agent that works inside a codebase. You describe an outcome, it reads files, edits them, runs commands, and reports back. There is no fixed pipeline, because the steps depend on what it finds.

## Workflow or agent

Agent, and unavoidably so. "Fix the failing test" cannot be decomposed at design time, because which file is wrong is the thing being discovered. Compare it to a code formatter, which is a workflow and should stay one.

The tell is in the loop: the next tool call depends on the previous tool result, and nobody wrote that branch in advance.

## The tools, and what they teach

Read, edit, search, run a command, fetch a page. A small set of high-level tools rather than one per operation, which is the advice from module 3 in the wild. There is no `open_file` and `read_lines` and `close_file`, there is a read tool that takes a path and gives you back the content with line numbers.

Two details worth stealing:

- **Returns are shaped for a model, not for a disk.** A read comes back with line numbers because the next thing the agent does is edit by line. A search comes back with matches and paths rather than a dump of every file.
- **The dangerous tool is the general one.** Running a shell command can do anything, which is why it is the one wrapped in a permission prompt.

## Stop conditions, which are the product

This is where the product design actually lives, and it's a good example to have in your pocket for an interview.

The loop stops when the task is done, but it also stops when it wants to do something the user has not allowed: edit a file outside the working directory, run a command with real consequences. The permission prompt is a stop condition dressed as a UI, and the modes that relax it are the product's answer to "how much autonomy does this user want today".

Note the eval consequence. If the agent runs unattended, you care about pass^k, because the run nobody watched has to be right every time. If a human approves each step, pass@k is closer to the truth, because a person filters the bad attempts. Same system, different number, and the difference is a permission setting.

## Context management, visible in the product

Long sessions fill the window, and you can watch every countermeasure from module 3 happen:

- **Compaction.** The conversation gets summarised and the work continues from the summary.
- **Just-in-time retrieval.** It does not preload the repository. It holds paths and reads files when it needs them, which is the lightweight-identifier pattern.
- **External memory.** Instructions files in the project act as durable notes that survive the window.
- **Sub-agents.** A task can be handed to a separate agent that explores and returns a condensed answer, so the exploration never enters the main window.

## How you would evaluate it

- **Outcome grading, mostly.** Did the tests pass, does the code build, does the diff do what was asked. This is why coding agents produced good benchmarks early: the grader was already sitting in the repository.
- **Trajectory invariants.** No writes outside the working directory. No destructive command without approval. Nothing sent anywhere the user did not ask for.
- **A judge for the parts tests miss.** Is the change minimal, does it match the conventions of the surrounding code, did it silently weaken a test to make it pass. That last one is a real failure mode and no test suite will report it, because the suite is green.
- **Multiple trials.** Same prompt, five runs, and the spread matters as much as the mean.

## The teardown in five sentences

If you can say this much about any agent product, out loud, you have the literacy the module is named for.

It's an agent rather than a workflow, because the steps depend on what it finds. Its tools are few and high level, and their returns are shaped for a model's next move. Its stop conditions are a product decision about autonomy, surfaced as permissions. It manages context by compacting, retrieving late, writing notes and delegating to sub-agents. It's graded on outcomes, with invariants for the things that must never happen, and a judge for the quality a passing test cannot see.
