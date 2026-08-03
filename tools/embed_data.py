"""Embed a data file into an app's HTML.

The apps are opened straight from disk, and a page on file:// cannot fetch a
JSON file next to it. So each app carries its data inline, in one line that
looks like this:

    const DATA = [];  // embedded by tools/embed_data.py from data/foo.json

Run this script after changing anything under data/ and every app picks the
change up. It rewrites that line in place and keeps the source path in the
comment, so it stays idempotent.

Run: python3 tools/embed_data.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINE = re.compile(
    r"^const DATA = .*;\s*// embedded by tools/embed_data\.py from (\S+)$",
    re.MULTILINE,
)


def main() -> None:
    apps = sorted(ROOT.glob("apps/*/index.html"))
    for app in apps:
        html = app.read_text()
        match = LINE.search(html)
        if not match:
            print(f"  skip  {app.relative_to(ROOT)} (no data line)")
            continue
        src = ROOT / match.group(1)
        payload = json.dumps(json.loads(src.read_text()), ensure_ascii=False)
        line = f"const DATA = {payload};  // embedded by tools/embed_data.py from {match.group(1)}"
        app.write_text(LINE.sub(lambda _: line, html, count=1))
        print(f"  ok    {app.relative_to(ROOT)} <- {match.group(1)} ({len(payload) // 1024} KB)")


if __name__ == "__main__":
    main()
