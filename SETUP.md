# Setup

Ten minutes, three things.

## 1. Claude Code

The course runs in Claude Code, the terminal agent from Anthropic. Install instructions: https://docs.claude.com/en/docs/claude-code/overview

Check it works:

```bash
cd ai-pm-evals-course
claude
```

Then type `/status`. If it answers, you're set.

You need a Claude subscription or an API key with credit. Module 2 runs a judge over 30 short traces and then over 20 more, which is a few cents of usage, not dollars.

## 2. Python

Only for the code assertions in module 2 and the odd scoring script. Any Python 3.9 or newer works, standard library only, nothing to install.

```bash
python3 --version
```

## 3. The apps

Everything in `apps/` is a single HTML file with no build step and no network calls. Start at `apps/index.html`, which links all six and shows what you have done so far:

```bash
open apps/index.html        # macOS
xdg-open apps/index.html    # Linux
```

Your work autosaves in the browser's local storage, so use the same browser and don't run the module in a private window. Each app has an export button that downloads a JSON file. Save those into `workbook/` and tell Claude Code where they are.

Some apps read a results file that Claude Code writes back (the judge scores in module 2, for example). Those have a "load results" button that opens a file picker, because a page opened from a local file cannot read your disk on its own.

## How the pieces fit

- **You** decide. Labels, category names, the wording of a judge prompt, the ship call.
- **The apps** hold everything you read, judge, sort and write by hand.
- **Claude Code** runs anything that calls a model, scores, counts, or writes a file into `workbook/`.

If you find yourself asking Claude to make a judgment call for you, that's the course going wrong. Ask it to argue with yours instead.

## Working offline

Every app works offline. The pre-reads are links, so grab them beforehand if you plan to work on a plane. Claude Code needs a connection.
