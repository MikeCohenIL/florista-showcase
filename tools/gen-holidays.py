#!/usr/bin/env python3
"""Fetch Israel-mode holiday dates from Hebcal and write the delivery-calendar
data files. Companion: check-holidays.py, which re-derives every date with an
independent implementation and fails loudly on any disagreement.

    python3 docs/tools/gen-holidays.py            # fetch from hebcal.com, write all files
    python3 docs/tools/gen-holidays.py --from-raw # regenerate outputs from the raw snapshot

Writes (paths relative to the repo root):
    docs/_raw/hebcal-il-2026-2036.json   raw API responses, untouched (audit trail)
    docs/holidays-il.json                curated machine-readable calendar
    docs/holidays-il.md                  the same data as a human-readable table,
                                         for the owner to eyeball against a wall calendar

Why fetch-once instead of a live API call in the storefront: the cart must
never depend on a third-party site being up. The data changes never (the
Hebrew calendar is fixed arithmetic), so a committed snapshot is both safer
and reviewable.

Curation: only days that can plausibly change how a flower shop delivers are
kept. Known-irrelevant days (Chanukah nights, flag days like Herzl Day…) are
dropped by an explicit list; a title this script has never seen is KEPT and
flagged `review` rather than silently discarded.
"""

import json
import sys
import time
import urllib.request
from datetime import date, timedelta
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
RAW_PATH = REPO / "docs/_raw/hebcal-il-2026-2036.json"
JSON_PATH = REPO / "docs/holidays-il.json"
MD_PATH = REPO / "docs/holidays-il.md"
ASSET_PATH = REPO / "theme/assets/florista-holidays.js"

# Behavior per kind — decided by the owner, 2026-09-01:
#   chag / Yom HaAtzmaut  -> fully closed, like Shabbat
#   erev chag             -> exactly like Friday
#   chol hamoed, memorial -> normal working days (not in the asset at all)
#   peak flower days      -> the two weekday slots merge into one long slot
#                            (on a Friday the Friday logic wins — decided in JS)
KIND_BEHAVIOR = {
    "yomtov": "closed",
    "atzmaut": "closed",
    "erev": "friday",
    "retail": "peak",
    "cholhamoed": None,
    "memorial": None,
}

YEAR_FROM, YEAR_TO = 2026, 2036

API = ("https://www.hebcal.com/hebcal?v=1&cfg=json&year={year}"
       "&i=on&maj=on&min=on&mod=on&nx=off&mf=off&ss=off&c=off")

# Hebrew weekday names, keyed by date.weekday() (Mon=0 … Sun=6).
WEEKDAYS_HE = ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"]

KIND_LABEL_HE = {
    "yomtov": "חג (שבתון)",
    "erev": "ערב חג",
    "cholhamoed": "חול המועד",
    "memorial": "יום זיכרון",
    "atzmaut": "יום העצמאות",
    "retail": "יום שיא מכירות",
    "review": "לא מסווג — לבדוק",
}

# The five eves of a yom tov. "Erev Purim" is deliberately NOT here.
EREV_TITLES = ("Erev Rosh Hashana", "Erev Yom Kippur", "Erev Sukkot",
               "Erev Pesach", "Erev Shavuot")

# Kept without being yomtov/erev/CH"M: days a florist plans around.
RETAIL_TITLES = ("Tu BiShvat", "Purim", "Tu B'Av", "Family Day")

# Explicitly irrelevant to deliveries — dropped. Anything not matched by any
# rule is kept as `review` so new API titles surface instead of vanishing.
DROP_PREFIXES = (
    "Chanukah", "Shushan Purim", "Pesach Sheni", "Lag BaOmer",
    "Yom Yerushalayim", "Erev Tish'a B'Av", "Tish'a B'Av",
    "Rosh Hashana LaBehemot", "Leil Selichot", "Chag HaBanot",
    "Hebrew Language Day", "Yom HaAliyah", "Herzl Day", "Jabotinsky Day",
    "Yitzhak Rabin Memorial Day", "Sigd", "Ben-Gurion Day", "Erev Purim",
    "Purim Katan",
)


def strip_niqqud(s):
    return "".join(ch for ch in s if not ("֑" <= ch <= "ׇ"))


def classify(item):
    """Return a kind for a Hebcal item, or None to drop it."""
    # The API's English titles use the typographic apostrophe (U+2019);
    # normalize so the match lists can use plain ASCII.
    title = item["title"].replace("’", "'")
    if any(title.startswith(p) for p in DROP_PREFIXES):
        return None
    if title.startswith(EREV_TITLES):
        return "erev"
    if item.get("yomtov"):
        return "yomtov"
    if "(CH''M)" in title or "Hoshana Raba" in title:
        return "cholhamoed"
    if title.startswith(("Yom HaShoah", "Yom HaZikaron")):
        return "memorial"
    if title.startswith("Yom HaAtzma"):
        return "atzmaut"
    if title in RETAIL_TITLES:  # exact: startswith would catch Purim Katan
        return "retail"
    return "review"


def fetch_raw():
    raw = {}
    for year in range(YEAR_FROM, YEAR_TO + 1):
        url = API.format(year=year)
        with urllib.request.urlopen(url, timeout=30) as r:
            raw[str(year)] = json.load(r)
        time.sleep(1)  # be polite to a free API
    return raw


def fixed_retail_rows(year):
    """Gregorian-fixed retail dates Hebcal does not carry."""
    return [
        {"date": f"{year}-02-14", "name_he": "ולנטיין", "name_en": "Valentine's Day"},
        {"date": f"{year}-03-08", "name_he": "יום האישה", "name_en": "International Women's Day"},
    ]


def curate(raw):
    days = []
    for year in sorted(raw):
        for item in raw[year]["items"]:
            kind = classify(item)
            if kind is None:
                continue
            days.append({
                "date": item["date"],
                "kind": kind,
                "name_he": strip_niqqud(item.get("hebrew", "")) or item["title"],
                "name_en": item["title"],
            })
        for row in fixed_retail_rows(int(year)):
            days.append({**row, "kind": "retail"})
    days.sort(key=lambda d: d["date"])
    for d in days:
        d["weekday_he"] = WEEKDAYS_HE[date.fromisoformat(d["date"]).weekday()]
    return days


def write_json(days):
    JSON_PATH.write_text(json.dumps({
        "source": "hebcal.com (Israel mode) + fixed retail dates; see docs/tools/gen-holidays.py",
        "verified_by": "docs/tools/check-holidays.py — independent re-derivation, run it after regenerating",
        "range": {"from": YEAR_FROM, "to": YEAR_TO},
        "kinds": KIND_LABEL_HE,
        "days": days,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def write_md(days):
    out = []
    out.append("# לוח חגים ומועדים לישראל — נתוני משלוחים\n")
    out.append(f"טווח: {YEAR_FROM}–{YEAR_TO} · מקור: Hebcal (מצב ישראל) · "
               "נוצר על ידי `docs/tools/gen-holidays.py` · "
               "מאומת באופן בלתי־תלוי על ידי `docs/tools/check-holidays.py`\n")
    out.append("**הקובץ הזה נועד לבדיקה בעין** — להשוות מול לוח שנה רגיל. "
               "הוא רק רשימת תאריכים: מה קורה בכל סוג יום (סגור / יום קצר / רגיל) "
               "יוחלט בנפרד ואינו כתוב כאן.\n")
    year = None
    for d in days:
        y = d["date"][:4]
        if y != year:
            year = y
            out.append(f"\n## {year}\n")
            out.append("| תאריך | יום | מועד | סוג |")
            out.append("|---|---|---|---|")
        dd = date.fromisoformat(d["date"])
        pretty = f"{dd.day:02d}/{dd.month:02d}/{dd.year}"
        out.append(f"| {pretty} | {d['weekday_he']} | {d['name_he']} | "
                   f"{KIND_LABEL_HE[d['kind']]} |")
    MD_PATH.write_text("\n".join(out) + "\n", encoding="utf-8")


def write_theme_asset(days):
    """The scheduler's calendar: {iso date: [behavior, display name]}."""
    import re
    entries = {}
    for d in days:
        behavior = KIND_BEHAVIOR[d["kind"]]
        if behavior is None:
            continue
        # "ראש השנה 5787" -> "ראש השנה"
        name = re.sub(r"\s+\d{4}$", "", d["name_he"])
        entries[d["date"]] = [behavior, name]
    body = json.dumps(entries, ensure_ascii=False, indent=0, sort_keys=True)
    ASSET_PATH.write_text(
        "/* GENERATED by docs/tools/gen-holidays.py — do not edit by hand.\n"
        "   Israel holiday calendar for the cart delivery scheduler\n"
        f"   ({YEAR_FROM}–{YEAR_TO}). Values: [behavior, Hebrew display name].\n"
        "   behavior: 'closed' = no deliveries (like Shabbat);\n"
        "             'friday' = Friday rules (short 09:00–15:00 slot; same-day\n"
        "                        allowed until it ends, since 2026-09-04);\n"
        "             'peak'   = one merged all-day slot on Sun–Thu\n"
        "                        (florista-delivery.js applies Friday rules\n"
        "                        when a peak day falls on a Friday).\n"
        "   Days absent from this map are normal working days; chol hamoed\n"
        "   and memorial days are normal on purpose (the owner, 2026-09-01).\n"
        "   Verified by docs/tools/check-holidays.py. */\n"
        "window.FLORISTA_HOLIDAYS = " + body + ";\n",
        encoding="utf-8")
    return len(entries)


def main():
    if "--from-raw" in sys.argv:
        raw = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    else:
        raw = fetch_raw()
        RAW_PATH.parent.mkdir(parents=True, exist_ok=True)
        RAW_PATH.write_text(json.dumps(raw, ensure_ascii=False, indent=1) + "\n",
                            encoding="utf-8")
    days = curate(raw)
    write_json(days)
    write_md(days)
    n_asset = write_theme_asset(days)
    kinds = {}
    for d in days:
        kinds[d["kind"]] = kinds.get(d["kind"], 0) + 1
    print(f"{len(days)} days over {YEAR_FROM}–{YEAR_TO}:",
          ", ".join(f"{k}={v}" for k, v in sorted(kinds.items())))
    review = [d for d in days if d["kind"] == "review"]
    for d in review:
        print("REVIEW:", d["date"], d["name_en"])
    print("wrote", JSON_PATH.name + ",", MD_PATH.name + ",", RAW_PATH.name
          + f", {ASSET_PATH.name} ({n_asset} scheduler entries)")


if __name__ == "__main__":
    main()
