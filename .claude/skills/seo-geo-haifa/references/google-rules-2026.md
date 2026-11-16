# What Google actually says right now

Sourced from Google's own documentation during the rebuild, not from SEO commentary. Where a rule
has a date attached, it is given — this area moves, and a stale rule confidently applied is worse
than no rule.

Primary sources:

- `developers.google.com/search/docs/appearance/ai-features`
- `developers.google.com/search/docs/fundamentals/creating-helpful-content`
- `developers.google.com/search/docs/appearance/structured-data/review-snippet`
- `developers.google.com/search/docs/appearance/structured-data/faqpage` (now removed)
- `support.google.com/business/answer/7091` (local ranking)

## 1. AI features: GEO is SEO

Google's position on AI Overviews and AI Mode is unusually blunt:

> "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special
> optimizations necessary."

> "You don't need to create new machine readable files, AI text files, or markup to appear in these
> features. There's also no special schema.org structured data that you need to add."

The technical bar is the ordinary one:

> "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be
> indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical
> requirements."

Consequences for this project:

- **Do not add `llms.txt`.** Do not add AI-specific markup, AI-specific pages, or "chunked for AI"
  content structures. Google says they are unnecessary, and they cost maintenance forever.
- **Do not use `nosnippet`, `data-nosnippet`, or `max-snippet` on storefront pages.** These are the
  documented controls for *limiting* appearance in AI features. On a shop that wants to be found,
  they are a self-inflicted wound.
- **The lever is retrievability, not markup.** Content in text, sensible headings, facts stated as
  complete sentences with numbers in them. That is the whole of it.

Anyone selling "GEO" as a separate discipline for this site is selling you the SEO you already
have. The one genuinely distinct habit is writing self-contained, quotable sentences — because an
extractive system takes a sentence, not a page.

## 2. Helpful content, E-E-A-T, and the "who / how / why" test

Google's self-assessment framing, applied to a florist:

- **Who** — is it self-evident who wrote this? A real Haifa shop with 25 years of trading and named
  people is a stronger signal than any keyword placement. Real photographs of the actual shop, per
  `content-seo.md`, are part of this.
- **How** — disclose automation where it is material, and explain method where it matters (how the
  substitution policy actually works, how the delivery cutoff is calculated).
- **Why** — content exists to help a customer, not to rank. Google's stated red flags include
  "mass-produced content", "thin summaries lacking original value", "artificial freshness dating",
  and automation "to produce content for the primary purpose of manipulating search rankings."

**Trust is the load-bearing letter in E-E-A-T.** For a shop that takes money and a recipient's
address, that means accurate hours, a real phone number, honest availability, a substitution
policy in plain Hebrew, and the legal pages in `content-seo.md`. None of it is decorative.

The blog earns its place under the same test: six posts that answer real customer questions
(flower care, what to send for a shiva, which flowers for a new baby) beat sixty thin ones, and
thin seasonal filler is explicitly the pattern Google names.

## 3. Structured data: current status

| Type | Status | Use it here? |
| --- | --- | --- |
| `LocalBusiness` / `Florist` | Active, and the backbone of local presence | **Yes** — homepage. Address, phone, `areaServed`, real hours. |
| `Product` + `offers` | Active | **Yes** — every product. ILS, honest availability. |
| `BreadcrumbList` | Active | **Yes** — collections and products, matching the visible breadcrumb. |
| `Article` | Active | **Yes** — blog posts. |
| `Review` / `AggregateRating` **about yourself** | Explicitly ineligible | **No.** See below. |
| `FAQPage` | Rich result gone: stopped showing May 2026, docs removed June 2026 | Content yes, markup optional and expect nothing from it. |
| `meta keywords` | Ignored by Google since 2009 | **No.** |

**On self-serving reviews**, verbatim:

> "If the entity that's being reviewed controls the reviews about itself, their pages that use
> `LocalBusiness` or any other type of `Organization` structured data are ineligible for star
> review feature."

This covers reviews you publish about yourself *and* third-party review widgets embedded on your
own site. If Florista wants stars, the route is real reviews on the Google Business Profile.

## 4. Local ranking: relevance, distance, prominence

Google names three factors for Business Profile ranking:

> "Relevance is how well a Business Profile matches what someone is searching for."
> "Distance refers to how far each business is from the customer who's searching."
> "Prominence means how well-known a business is."

And is equally clear that: *"There's no way to request or pay for a better local ranking on
Google."*

What that means in practice, for the one thing that will move the needle most:

- **Relevance** — complete categories (Florist, and any secondary that is genuinely true), full
  attributes, accurate service areas covering חיפה, נשר, קריות (כולל קרית חיים), טירת הכרמל,
  עתלית — עכו and נהריה are not served (dropped 2026-08-28); trim them from the GBP too.
- **Distance** — not controllable, but it is why neighborhood language (`נווה שאנן`, `מרכז הכרמל`,
  `הדר`) matters on the site: it is how you show relevance to searches near you.
- **Prominence** — reviews (answered, not just collected), photos, and off-site mentions. The
  `colbonews.co.il` and `kolhair.co.il` press links already in the site's `sameAs` are exactly
  this kind of asset.

**Hours are a ranking-adjacent trap here.** "Open now" filtering uses the profile's hours. The
Friday close is 30 minutes before Shabbat entry — a moving time. Whatever is published must reflect
that rather than a convenient fixed 20:00, which is what the current Wix JSON-LD wrongly claims.
Same rule for holiday eves.

The Business Profile lives outside this repo, so nothing in the codebase can fix it. Raise it with
The owner as its own piece of work: for a single-location florist competing on `חנות פרחים בחיפה`, it
plausibly outweighs every on-page change in this project combined.

## 5. Things that are no longer true

Worth knowing because they are all over older SEO advice and will surface if anyone searches:

- FAQ rich results for commercial sites — **gone** (May 2026).
- `meta keywords` as a ranking factor — gone since 2009, still shipped by the live Wix site.
- Keyword density targets — never a real thing; keyword stuffing is a documented spam policy.
- A separate "GEO" or "AEO" optimisation layer — Google's own AI-features guidance treats these as
  part of SEO, with no special markup, files, or formatting.
- Exact-match doorway pages per city — a spam policy violation, and separately banned for this
  project in `CLAUDE.md`.
