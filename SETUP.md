# Setup

There is almost nothing to set up.

## What you need

**Claude Code**, and a Claude subscription or an API key with credit. Install instructions: https://docs.claude.com/en/docs/claude-code/overview

Module 2 grades 30 short traces and then a few more, which is a few cents of usage rather than dollars.

**A browser.** Chrome, Edge, Firefox or Safari. The app pages run offline with no build step and no network calls.

That is the whole list. Nothing to install, no commands to type, no Python required.

## Starting

Open this folder in Claude Code and type anything. It greets you, asks where you want to start, and opens the pages for you when you get there.

If you would rather look around first, the pages are in `apps/`, starting at `apps/index.html`. Opening one directly works fine.

## How your work moves around

Three things happen, and only one of them needs you.

**Between the pages, automatically.** The pages share your work through the browser's own storage. Label the traces, open the clustering board, and your labels are already there.

**From a page to Claude Code, one click.** When Claude Code needs your work, click **Copy for Claude Code** and paste it into the chat. That is the only manual step in the course. Each page also has a **Download a copy** button if you want a file, but nothing depends on it.

**From Claude Code back to a page, automatically.** Claude Code writes into the page itself and tells you. Reload the tab and your results are there.

## If a page looks empty

Some browsers keep each local page separate, so work done in one may not appear in another. Nothing is lost. Tell Claude Code and it can write your work back into the page.

Use the same browser throughout, and do not work in a private window, since that throws your work away when you close it.

## Who does what

- **You** decide. Labels, category names, the wording of a judge prompt, the ship call.
- **The pages** hold everything you read, judge, sort and write by hand.
- **Claude Code** runs anything that calls a model, scores, counts, or writes a file.

If you find yourself asking Claude Code to make a judgment call for you, that is the course going wrong. Ask it to argue with yours instead.

## Working offline

Every page works offline. The pre-reads are links, so grab them beforehand if you plan to work on a plane. Claude Code needs a connection.

## For maintainers

The apps are self-contained files with the scenario data and shared code copied into them, because a page opened from disk cannot fetch a file next to it. After editing anything in `data/` or `tools/shared/`, run:

```bash
python3 tools/build_apps.py
python3 tools/build_apps.py --check   # fails if an app is out of date
```

Each app also carries a self-test. Add `#selftest` to its URL and it prints the result on the page.
