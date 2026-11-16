---
name: seo-geo-haifa
description: The search gate for every customer-facing string on Florista — the Haifa flower shop. Use this skill BEFORE writing or changing ANY text a customer or a crawler will see — page titles, meta descriptions, h1/h2 headings, collection and category names, product titles and descriptions, alt text, blog posts, FAQ answers, delivery copy, button and nav labels, URL handles, and JSON-LD. Also use it when asked "will this rank", "is this good for SEO", "why aren't we showing up in Google", "what should this page be called", "write the meta description", or when adding structured data. It answers one question for every string — does this earn a search a real customer in Haifa actually types? Covers classic SEO, local/map-pack SEO, and GEO (AI Overviews, AI Mode, assistant answers).
---

# The search gate: does this string earn a Haifa search?

Florista is one flower shop in one city. It does not win on domain strength, budget, or
catalogue size — it wins by being the most obviously *correct answer* to a small number of
Hebrew queries typed by people who are within delivery range and want flowers today.

So every string on this site has a job. Before you write one, you name the job.

> **The gate:** for any text a customer or a crawler will see, you must be able to say which
> real query it serves, and which page owns that query. If you cannot, the string is either
> UI chrome (fine — move on) or it is filler (rewrite it or cut it).

This skill governs **what the words are**. `florista-commerce-ux/references/content-seo.md`
governs the page-level obligations (the `/delivery` page, redirects, legal pages, the schema
inventory). `design-step-by-step` still governs *how* the work happens — copy is a customer-facing
element, so it is decided with the owner before it ships, same as pixels. This skill does not license
writing copy unasked.

## The five checks — run these on every string

1. **Which query?** Name it. `זר פרחים ליום הולדת`, `משלוח פרחים בחיפה מהיום להיום`, `פרחים לאבל`.
   Take it from the keyword map (private research, not included in this repo), which holds the researched demand — not from
   instinct, and not from English translated into Hebrew.
2. **Who owns it?** One query, one page. If another page already owns it, this string must not
   compete for it. Repeating the head term on all sixteen pages is the single biggest defect in
   the current site — see *The mistake the live site makes* below.
3. **Is it true?** Cutoffs, hours, delivery areas, fees, prices, "25 years" — every factual claim
   comes from `CLAUDE.md` or from the owner. Never from an example in this skill, never invented to
   fill a sentence. A false fact in a Hebrew heading is worse than a missing one: it gets quoted
   verbatim into an AI answer and into the map pack.
4. **Would a customer say it out loud?** Read it aloud in Hebrew. `חנות פרחים בחיפה משלוחי פרחים
   בחיפה` is not speech, it is two keywords in a trench coat. If it reads as assembly, rewrite it
   as a sentence a florist would actually say.
5. **Can a machine read it?** The fact must be in crawlable text — not baked into an image, not
   only in a tooltip, not rendered exclusively behind an interaction. Delivery fees inside a JPEG
   are invisible to Google, to AI Overviews, and to a screen reader alike.

A string that passes all five ships. A string that fails #3 stops the work — go ask.

## What this shop is actually competing for

The head term is **`חנות פרחים בחיפה`** and its sibling **`משלוחי פרחים בחיפה`**. Everything else
is a tail off those two. But the tails are where an independent shop wins, because the national
chains cannot answer them honestly:

- **Same-day intent.** `משלוח פרחים מהיום להיום`, `משלוח פרחים היום`. Florista has a real 17:00
  cutoff. Say the number. A chain says "מהיר"; a real shop says "עד 17:00".
- **Open-now intent.** `פרחים בחיפה פתוח עכשיו`, `פרחים בחיפה בשבת`, `משלוח פרחים בחיפה 24 שעות`.
  See the honesty trap below — this demand is real and Florista can only serve part of it.
- **Neighborhood intent.** `נווה שאנן`, `מרכז הכרמל`, `הדר`, `כרמל`. The shop is physically in
  נווה שאנן. That is a fact worth stating in prose, and it is already in the live meta description.
- **Occasion intent.** `ליום הולדת`, `ללידה`, `לאבל`, `לכלה`, `ליום נישואין`. These map to
  collections, one each.
- **Bundle intent.** `משלוח פרחים ושוקולד חיפה`, `משלוח פרחים ובלונים חיפה`. The old Wix site had
  `/chocolate`, `/ballons` and `/wines` pages — that demand is documented, not hypothetical.
- **Price intent.** `זר פרחים מחיר`, `החל מ־`. Competitors put a price floor in the title tag.
  Hiding prices does not protect margin, it loses the click.

Full researched data, with the query→page ownership table: the keyword map (private research, not included in this repo).

## The mistake the live site makes — do not carry it over

Every page on `florista.co.il` today is titled `פלוריסטה | חנות פרחים בחיפה | {page}`. The head
term appears on the homepage, the about page, the box-arrangements page and the basket page alike.

This does not multiply the signal, it splits it. Google has to guess which of sixteen pages is the
Haifa flower shop page, and the ones that lose the guess are still spending their title on a term
they will never win. `CLAUDE.md` already settles that **the homepage is the Haifa page** — so the
homepage says it, and no other page does.

The same file also ships a `meta name="keywords"` tag. That tag has been ignored by Google since
2009. Do not port it.

## Title and description formulas

Hebrew, always. Titles get truncated by pixel width, so aim ~55–60 characters and put the
distinctive words first — Hebrew reads right-to-left but truncation still cuts the tail.

| Surface | Pattern | Example |
| --- | --- | --- |
| Homepage | `{head term} — {differentiator} \| פלוריסטה` | `חנות פרחים בחיפה — משלוח עד הבית מ־17:00 \| פלוריסטה` |
| Delivery | `{delivery term} \| {areas}` | `משלוחי פרחים בחיפה והקריות — אזורים ומחירים` |
| Collection | `{collection name} \| {qualifier}` | `זרי פרחים ליום הולדת \| משלוח בחיפה והסביבה` |
| Product | `{product name} — {form} \| פלוריסטה` | `אפרודיטה — זר ורדים \| פלוריסטה` |
| Blog | `{the question the post answers}` | `איך שומרים על זר פרחים טרי יותר זמן?` |

The brand goes **last** except on the homepage. A collection page that opens with `פלוריסטה` has
spent its most valuable characters on a word nobody searched for.

**Meta descriptions** (~150–160 chars) are ad copy, not a summary. One concrete differentiator —
the cutoff, the area list, or a price floor — plus a reason to click. They do not rank the page;
they earn the click on a page that already ranks.

## GEO — AI Overviews, AI Mode, and assistant answers

Google's own position, current as of this skill's research: **there is nothing special to do.**
No `llms.txt`, no AI-specific markup, no content chunking, no separate schema. Google's
documentation calls AEO and GEO part of SEO, not a separate discipline. A page is eligible for
AI features if it is indexed and snippet-eligible — that is the whole technical bar.

So the GEO work here is not a new checklist, it is a bias in how the words are written:

- **Answer in self-contained sentences.** A model quoting your page takes one or two sentences
  with it. `אנחנו מבצעים משלוחים עד השעה 17:00 באותו יום, בימים א׳–ה׳` survives extraction.
  `כן, בהחלט — ראו פירוט למטה` does not.
- **Put the number in the sentence.** Fees, cutoffs, hours, delivery areas, price floors. Numbers
  are what gets cited.
- **Keep the entity consistent.** `פלוריסטה` + `חיפה` + `נווה שאנן` + one phone number + one
  address, spelled identically on the site, in the JSON-LD, and on the Google Business Profile.
  The live Wix site has two `LocalBusiness` blocks that disagree with each other — one Hebrew
  (`חניתה 40, חיפה`), one English (`40 Khanita Street, Haifa`) — **and both have the wrong street
  number.** The shop is at **חניתה 34** (confirmed by the owner 2026-08-30; the Google Business
  Profile has always been right). The canonical NAP lives in `docs/off-page-seo.md` §0 — use it,
  and do not take a street number from the old site or from a directory.
- **Never suppress snippets.** `nosnippet`, `max-snippet`, and `data-nosnippet` remove the page
  from AI features too. There is no reason to use them on a storefront.

For a local shop the highest-leverage GEO asset is not on the website at all — it is the **Google
Business Profile**, because relevance, distance and prominence are what drive the map pack and
what assistants lean on for "flower shop near me" style questions. Complete categories, accurate
hours (including the variable Friday close), photos, and answered reviews. That work is outside
this repo but it belongs in the same conversation.

Details and sourcing: `references/google-rules-2026.md`.

## Structured data: two things everybody gets wrong

Both are things the Haifa competition is doing right now, and both are worth *not* copying.
The full teardown is in the competitor teardown (private, not included); the schema inventory itself lives in
`florista-commerce-ux/references/content-seo.md`.

1. **Self-serving review markup is ineligible.** Two competitors publish `"ratingValue": "5"` about
   themselves on their own homepage. Google's rule is explicit: if the entity being reviewed
   controls the reviews about itself, `LocalBusiness` and `Organization` pages are ineligible for
   the star feature. It does nothing. Real reviews belong on the Business Profile.
2. **FAQPage is no longer a rich-result play.** FAQ rich results were narrowed to government and
   health sites, stopped appearing in Google Search in May 2026, and the documentation was removed
   in June 2026. Write FAQ content because customers ask the question — the answers are excellent
   material for AI answers and for the page itself — but do not add the markup expecting stars,
   and do not let "we need FAQ schema" drive the content.

## Honesty traps specific to this shop

**The Shabbat query.** `פרחים בחיפה בשבת`, `פתוח בשבת`, `24 שעות` are real, repeated searches.
Florista closes Friday 30 minutes before Shabbat entry. Do not write copy that implies otherwise
to catch the traffic. Answer it straight — state the Friday cutoff and when orders resume. A page
that honestly says "we don't deliver Saturday, here is how to get flowers there Friday" serves the
searcher and cannot be caught out.

**The city queries.** `פרחים נשר`, `פרחים בקריות`, `פרחים בקריות קרית ביאליק` all have real
demand — and chasing them with per-city pages is **banned in `CLAUDE.md`**. The old city pages were
homepage clones with the name swapped, which is a doorway page under Google's spam policies, and a
template that interpolates the city is the same thing in nicer code. Serve this demand the legal
way: one `/delivery` page with genuinely per-area content — real fees, real cutoffs, real areas —
plus correct service areas on the Business Profile. If per-city pages ever come back, each needs
unique material driven by Search Console data. That is a content project, not a routing change.

**English placeholders.** Every customer-facing string is Hebrew, including option names and their
values. A Latin URL handle like `/bouquets` must never surface as the displayed name. This is a
settled decision, and it is also a search decision: an English heading on a Hebrew page ranks for
nothing anybody in Haifa types.

**Invented differentiators.** "25 שנות ניסיון" is on the live site and is presumably true. Anything
of that shape — years, counts, awards, "the leading X" — gets confirmed with the owner before it is
written. Google's helpful-content guidance puts trust at the centre of E-E-A-T, and a claim that
cannot be backed is the fastest way to lose it.

## Checklist

- [ ] Every string names the query it serves, or is deliberate UI chrome
- [ ] `חנות פרחים בחיפה` appears in exactly one page title — the homepage
- [ ] No two pages compete for the same query
- [ ] Every factual claim traces to `CLAUDE.md` or to the owner
- [ ] Titles ~55–60 chars, distinctive words first, brand last except on the homepage
- [ ] Meta descriptions carry one concrete number and a reason to click
- [ ] Hebrew everywhere customer-visible; Latin only in URL handles
- [ ] Delivery fees, hours and cutoffs exist as crawlable text, not only in images
- [ ] NAP identical across page copy, JSON-LD, and the Business Profile
- [ ] No `meta keywords`, no self-serving rating markup, no snippet suppression
- [ ] No `/delivery/{city}` route, and no city-templated copy
- [ ] Shabbat and same-day claims match the real cutoff rules

## Refreshing the research

The data in the reference files was gathered by hand and will drift. To re-run it:

```bash
# Live demand, Hebrew / Israel — the most useful signal available without a paid tool
curl -sG "https://suggestqueries.google.com/complete/search" \
  --data-urlencode "client=firefox" --data-urlencode "hl=he" --data-urlencode "gl=il" \
  --data-urlencode "q=פרחים בחיפה" -A "Mozilla/5.0" | python3 -m json.tool

# A competitor's search surface: title, description, headings, schema
curl -sL -A "Mozilla/5.0" https://www.sflower.co.il/ -o c.html
grep -oP '<title>.*?</title>|<meta[^>]*name="description"[^>]*>' c.html
grep -oP '(?s)<h[12][^>]*>.*?</h[12]>' c.html | sed -e 's/<[^>]*>//g'
grep -oP '"@type"\s*:\s*"[^"]+"' c.html | sort -u
```

Once the site is live, `docs/_gsc/` is where Search Console exports land. Real query data from the
shop's own impressions outranks everything in this skill — when it arrives, update
the keyword map (private research, not included in this repo) from it.
