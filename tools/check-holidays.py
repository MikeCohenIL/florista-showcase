#!/usr/bin/env python3
"""Independently verify docs/holidays-il.json.

gen-holidays.py takes its dates from hebcal.com. This script re-derives every
one of them from scratch using the standard Hebrew-calendar arithmetic (the
molad + four postponement rules, as documented in Calendrical Calculations and
the Rambam) — a completely separate implementation from Hebcal's codebase.
Every (date, kind) row must agree in both directions or this exits non-zero.

On top of the cross-derivation it checks:
  * classical weekday invariants (לא אד"ו ראש: Rosh Hashana never falls on
    Sunday, Wednesday or Friday; Yom Kippur never on Friday or Sunday)
  * hardcoded external anchors from public sources (see EXTERNAL_ANCHORS)
  * the fixed Gregorian retail dates (Valentine's, Women's Day) exist per year

Note on data.gov.il: the official "חגים בישראל" dataset (resource
67492cda-b36e-45f4-9ed1-0471af297e8b) was considered as a second source and
rejected — it covers only one year, and its 2026 יום השואה row says 13 May
where the true date is 14 April (27 Nisan 5786). Its rows that ARE correct
(Purim, יום הזיכרון) are kept below as anchors. That error is exactly why
this checker exists.

Run after any regeneration:  python3 docs/tools/check-holidays.py
"""

import json
import sys
from datetime import date, timedelta
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "docs/holidays-il.json"
ASSET = REPO / "theme/assets/florista-holidays.js"

# Must mirror KIND_BEHAVIOR in gen-holidays.py (the owner's table, 2026-09-01).
KIND_BEHAVIOR = {"yomtov": "closed", "atzmaut": "closed", "erev": "friday",
                 "retail": "peak", "cholhamoed": None, "memorial": None}

# Rata Die day such that EPOCH + elapsed_days(y) is 1 Tishrei of year y.
# elapsed_days() below returns 1 for year 1 (not 0), so this is one less than
# the textbook R.D. -1373427 of 1 Tishrei year 1. The first run of this
# checker had -1373427 and every derived date came out one day late — caught
# by the external anchors, which is exactly what they are for.
HEBREW_EPOCH = -1373428

# Publicly known dates, independent of both Hebcal and the math below.
# Sources: data.gov.il holidaysinisrael (2026 rows verified correct) and
# widely published 2026 dates.
EXTERNAL_ANCHORS = {
    "2026-03-03": "retail",    # פורים (data.gov.il)
    "2026-04-02": "yomtov",    # פסח א׳
    "2026-04-21": "memorial",  # יום הזיכרון (data.gov.il)
    "2026-04-22": "atzmaut",   # יום העצמאות
    "2026-09-12": "yomtov",    # ראש השנה 5787
    "2026-09-21": "yomtov",    # יום כיפור
}


def is_leap(y):
    return (7 * y + 1) % 19 < 7


def months_elapsed(y):
    return (235 * ((y - 1) // 19)
            + 12 * ((y - 1) % 19)
            + (7 * ((y - 1) % 19) + 1) // 19)


def elapsed_days(y):
    """Days from the Hebrew epoch to Rosh Hashana of Hebrew year y,
    including the molad-based postponements."""
    me = months_elapsed(y)
    parts = 204 + 793 * (me % 1080)
    hours = 5 + 12 * me + 793 * (me // 1080) + parts // 1080
    day = 1 + 29 * me + hours // 24
    parts = (hours % 24) * 1080 + parts % 1080
    if (parts >= 19440
            or (day % 7 == 2 and parts >= 9924 and not is_leap(y))
            or (day % 7 == 1 and parts >= 16789 and is_leap(y - 1))):
        day += 1
    # לא אד"ו ראש — push off Sunday, Wednesday, Friday
    if day % 7 in (0, 3, 5):
        day += 1
    return day


def rh_ordinal(y):
    return HEBREW_EPOCH + elapsed_days(y)


def year_length(y):
    return elapsed_days(y + 1) - elapsed_days(y)


def month_lengths(y):
    """[(name, length)] from Tishrei, per the year's type."""
    L = year_length(y)
    cheshvan = 30 if L % 10 == 5 else 29
    kislev = 29 if L % 10 == 3 else 30
    months = [("Tishrei", 30), ("Cheshvan", cheshvan), ("Kislev", kislev),
              ("Tevet", 29), ("Shvat", 30)]
    if is_leap(y):
        months.append(("Adar I", 30))
    months += [("Adar", 29), ("Nisan", 30), ("Iyar", 29), ("Sivan", 30),
               ("Tammuz", 29), ("Av", 30), ("Elul", 29)]
    assert sum(n for _, n in months) == L, f"month table != year length for {y}"
    return months


def h2g(y, month, day):
    """Gregorian date of the given Hebrew year / month name / day."""
    off = 0
    for name, length in month_lengths(y):
        if name == month:
            assert day <= length, f"{day} {month} {y} does not exist"
            return date.fromordinal(rh_ordinal(y) + off + day - 1)
        off += length
    raise KeyError(month)


def derive(hyear):
    """All delivery-relevant days of one Hebrew year, as {date: kind}."""
    out = {}

    def put(d, kind):
        out[d] = kind

    rh1 = h2g(hyear, "Tishrei", 1)
    put(rh1 - timedelta(days=1), "erev")
    put(rh1, "yomtov")
    put(h2g(hyear, "Tishrei", 2), "yomtov")
    put(h2g(hyear, "Tishrei", 9), "erev")
    put(h2g(hyear, "Tishrei", 10), "yomtov")
    put(h2g(hyear, "Tishrei", 14), "erev")
    put(h2g(hyear, "Tishrei", 15), "yomtov")
    for d in range(16, 22):  # Sukkot CH"M incl. Hoshana Raba
        put(h2g(hyear, "Tishrei", d), "cholhamoed")
    put(h2g(hyear, "Tishrei", 22), "yomtov")  # Shmini Atzeret

    put(h2g(hyear, "Shvat", 15), "retail")   # Tu BiShvat
    put(h2g(hyear, "Shvat", 30), "retail")   # Family Day
    put(h2g(hyear, "Adar", 14), "retail")    # Purim (Adar II in leap years)

    put(h2g(hyear, "Nisan", 14), "erev")
    put(h2g(hyear, "Nisan", 15), "yomtov")
    for d in range(16, 21):  # Pesach CH"M (Israel)
        put(h2g(hyear, "Nisan", d), "cholhamoed")
    put(h2g(hyear, "Nisan", 21), "yomtov")   # Pesach VII

    # Yom HaShoah: 27 Nisan; Friday -> Thursday, Sunday -> Monday
    shoah = h2g(hyear, "Nisan", 27)
    if shoah.weekday() == 4:
        shoah -= timedelta(days=1)
    elif shoah.weekday() == 6:
        shoah += timedelta(days=1)
    put(shoah, "memorial")

    # Yom HaAtzmaut: 5 Iyar; Fri -> Thu(-1), Sat -> Thu(-2), Mon -> Tue(+1).
    # Yom HaZikaron is always the day before.
    atz = h2g(hyear, "Iyar", 5)
    wd = atz.weekday()
    if wd == 4:
        atz -= timedelta(days=1)
    elif wd == 5:
        atz -= timedelta(days=2)
    elif wd == 0:
        atz += timedelta(days=1)
    put(atz - timedelta(days=1), "memorial")
    put(atz, "atzmaut")

    put(h2g(hyear, "Sivan", 5), "erev")
    put(h2g(hyear, "Sivan", 6), "yomtov")    # Shavuot
    put(h2g(hyear, "Av", 15), "retail")      # Tu B'Av
    return out


def main():
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    lo, hi = doc["range"]["from"], doc["range"]["to"]
    window = (date(lo, 1, 1), date(hi, 12, 31))

    theirs = {}   # from the Hebcal-derived file
    fixed_retail = set()
    for d in doc["days"]:
        dd = date.fromisoformat(d["date"])
        if d["name_en"] in ("Valentine's Day", "International Women's Day"):
            fixed_retail.add((dd, d["name_en"]))
            continue
        theirs[dd] = d["kind"]

    ours = {}
    for hyear in range(lo + 3760, hi + 3761 + 1):
        for dd, kind in derive(hyear).items():
            if window[0] <= dd <= window[1]:
                ours[dd] = kind

    failures = []

    for dd in sorted(set(ours) | set(theirs)):
        a, b = ours.get(dd), theirs.get(dd)
        if a != b:
            failures.append(f"MISMATCH {dd}: independent={a} file={b}")

    # Classical weekday invariants
    for hyear in range(lo + 3760, hi + 3761 + 1):
        rh = date.fromordinal(rh_ordinal(hyear))
        if not (window[0] <= rh <= window[1]):
            continue
        if rh.weekday() in (6, 2, 4):  # Sun, Wed, Fri
            failures.append(f"INVARIANT: RH {hyear} on forbidden weekday ({rh})")
        yk = h2g(hyear, "Tishrei", 10)
        if yk.weekday() in (4, 6):     # Fri, Sun
            failures.append(f"INVARIANT: YK {hyear} on forbidden weekday ({yk})")

    for iso, kind in EXTERNAL_ANCHORS.items():
        dd = date.fromisoformat(iso)
        if theirs.get(dd) != kind:
            failures.append(f"ANCHOR: {iso} expected {kind}, file has {theirs.get(dd)}")
        if ours.get(dd) != kind:
            failures.append(f"ANCHOR: {iso} expected {kind}, independent derivation has {ours.get(dd)}")

    for year in range(lo, hi + 1):
        for mmdd, name in ((f"{year}-02-14", "Valentine's Day"),
                           (f"{year}-03-08", "International Women's Day")):
            if (date.fromisoformat(mmdd), name) not in fixed_retail:
                failures.append(f"RETAIL: {name} missing for {year}")

    # The theme asset must be exactly the JSON pushed through KIND_BEHAVIOR.
    n_asset = 0
    if not ASSET.exists():
        failures.append(f"ASSET: {ASSET} missing — run gen-holidays.py")
    else:
        txt = ASSET.read_text(encoding="utf-8")
        try:
            asset = json.loads(txt[txt.index("{"): txt.rindex("}") + 1])
        except ValueError:
            asset, _ = {}, failures.append("ASSET: could not parse the JS object")
        expect = {}
        for d in doc["days"]:
            b = KIND_BEHAVIOR[d["kind"]]
            if b is not None:
                expect[d["date"]] = b
        for k in sorted(set(expect) | set(asset or {})):
            got = (asset or {}).get(k)
            want = expect.get(k)
            if got is None or want is None or got[0] != want:
                failures.append(f"ASSET: {k} behavior is {got and got[0]}, "
                                f"kind-map says {want}")
        n_asset = len(asset or {})

    if failures:
        print(f"FAIL — {len(failures)} problem(s):")
        for f in failures:
            print(" ", f)
        sys.exit(1)
    print(f"OK — {len(theirs)} Hebrew-calendar rows match the independent "
          f"derivation exactly ({lo}–{hi}), {len(fixed_retail)} fixed retail "
          f"rows present, weekday invariants and "
          f"{len(EXTERNAL_ANCHORS)} external anchors hold, theme asset "
          f"consistent ({n_asset} entries).")


if __name__ == "__main__":
    main()
