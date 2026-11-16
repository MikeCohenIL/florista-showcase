#!/usr/bin/env python3
"""
Prove that no row in docs/redirects-shopify.csv 301s into a 404.

    python3 docs/tools/check-redirects.py        # from the repo root
    # exit 0 = every target resolves, exit 1 = at least one would 404

Every /products/ and /collections/ and /pages/ and /blogs/ target is checked
against the real handles of the live store, snapshotted in
docs/_raw/new-catalog-handles-*.json (newest file wins).

**Re-snapshot after any catalog change.** The snapshot is what makes this
check meaningful; a stale one will happily bless a redirect into a product
that has since been renamed or deleted. Regenerate with the Shopify MCP or:

    shopify store execute --store <store> \\
      'query { products(first: 250) { nodes { title handle productType } } }'

and rewrite the JSON as [{"t": title, "h": handle, "p": productType}, ...].

Collections, pages and blog articles are listed inline below rather than
snapshotted — there are few enough of them to read at a glance, and a wrong
one is obvious. Keep them in step with the store.
"""
import csv
import json
import pathlib
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
REDIRECTS = ROOT / "docs" / "redirects-shopify.csv"

# `all` is Shopify's built-in every-product collection, not one of ours.
COLLECTIONS = {"frontpage", "bouquets", "box-arrangements", "basket-arrangements",
               "birthday", "drinks", "balloons", "best-sellers", "chocolate",
               "rosh-hashana", "all"}
PAGES = {"contact", "privacy-policy", "about", "weddings", "delivery", "bridal"}
ARTICLES = {"orchid-care", "five-flower-care-tips", "five-reasons-to-buy-flowers",
            "origin-of-valentines-day", "why-you-need-flowers-at-home",
            "guide-to-event-floral-design"}


def load_products():
    snaps = sorted((ROOT / "docs" / "_raw").glob("new-catalog-handles-*.json"))
    if not snaps:
        sys.exit("no catalog snapshot in docs/_raw/ — see this file's docstring")
    print(f"catalog snapshot: {snaps[-1].name}")
    return {c["h"] for c in json.load(snaps[-1].open(encoding="utf-8"))}


def check(target, products):
    if target == "/":
        return True, "homepage"
    if target == "/blogs/flora":
        return True, "blog index"
    parts = target.strip("/").split("/")
    kind, handle = parts[0], (parts[-1] if len(parts) > 1 else None)
    if kind == "products":
        return handle in products, f"product {handle}"
    if kind == "collections":
        return handle in COLLECTIONS, f"collection {handle}"
    if kind == "pages":
        return handle in PAGES, f"page {handle}"
    if kind == "blogs":
        return handle in ARTICLES, f"article {handle}"
    return False, "unrecognised target shape"


def main():
    products = load_products()
    rows = list(csv.reader(REDIRECTS.open(encoding="utf-8")))[1:]
    targets = Counter(r[1] for r in rows)
    sources = [r[0] for r in rows]

    bad = [(t, n, why) for t, n in targets.items()
           for ok, why in [check(t, products)] if not ok]
    dupes = len(sources) - len(set(sources))
    selfs = sum(1 for r in rows if r[0] == r[1])
    chains = set(sources) & set(targets)

    print(f"rows              : {len(rows)}")
    print(f"distinct targets  : {len(targets)}")
    print(f"targets that 404  : {len(bad)}")
    for t, n, why in bad:
        print(f"   !! {t}  ({n} rows)  {why}")
    print(f"duplicate sources : {dupes}")
    print(f"self-redirects    : {selfs}")
    print(f"redirect chains   : {len(chains)}  {sorted(chains) or ''}")

    failed = bool(bad or dupes or selfs or chains)
    print("FAIL" if failed else "OK — every redirect resolves in one hop")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
