#!/usr/bin/env python3
"""
Regenerate docs/redirects-shopify.csv from docs/url-map.csv.

CLAUDE.md warns that the two CSVs "drift apart easily" because both were
maintained by hand. They did drift. This script makes url-map.csv the single
source of truth: edit that, run this, and the redirect file follows.

    python3 docs/tools/gen-redirects.py          # from the repo root

Shopify's URL Redirects importer takes two columns, "Redirect from" and
"Redirect to". Every Hebrew path is emitted TWICE — raw and percent-encoded —
because a browser may send either form and Shopify matches the path literally.

Two kinds of row are deliberately NOT emitted:

  * `410 Gone` targets. A Shopify redirect can only 301 to a path; it cannot
    return a 410. Redirecting a dead Wix demo URL to a real page is a
    soft-404 pattern, so the row stays in url-map.csv as documentation and the
    URL is left to 404 honestly.
  * self-redirects. url-map.csv carries `/ -> /` to record that the homepage
    does not move. Emitted as a redirect that is a loop on the single most
    valuable URL on the site.

Run docs/tools/check-redirects.py afterwards — it proves no target 404s.
"""
import csv
import pathlib
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "url-map.csv"
DST = ROOT / "docs" / "redirects-shopify.csv"


def main():
    rows = list(csv.reader(SRC.open(encoding="utf-8")))[1:]

    out, seen, skipped = [], set(), []
    for typ, old_url, heb, new_url, price, conf in rows:
        if not new_url.startswith("/"):
            skipped.append((old_url, new_url, "not a path"))
            continue
        if old_url == new_url:
            skipped.append((old_url, new_url, "self-redirect, documentation only"))
            continue
        for path in (old_url, quote(old_url, safe="/-_.~")):
            if path in seen:
                continue
            seen.add(path)
            out.append([path, new_url])

    with DST.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["Redirect from", "Redirect to"])
        w.writerows(out)

    print(f"wrote {len(out)} rows -> {DST.relative_to(ROOT)}")
    for old, new, why in skipped:
        print(f"  skipped {old} -> {new}  ({why})")


if __name__ == "__main__":
    main()
