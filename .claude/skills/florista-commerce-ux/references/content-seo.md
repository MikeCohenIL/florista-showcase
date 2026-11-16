# Content pages, SEO, and launch obligations

The rest of this skill covers commerce surfaces. This file covers everything else in scope: the
`/delivery` page, the blog, what happens to visitors arriving on retired URLs, the structured data
and local SEO that carry a Haifa flower shop, and the legal pages the site cannot launch without.

Scope reminder from `CLAUDE.md`: ~16 pages — 11 commerce/collection, 4 content, 1 delivery — plus
6 blog posts. The commerce pages are the shop; these are what make it findable and trustworthy.

## 1. The `/delivery` page

This page exists because four per-city pages (`/nesher`, `/atlit`, `/krayot`, `/tira`) were cut
and consolidated into it. It now has to do the job all four were doing, honestly.

**Read the doorway-page trap in `CLAUDE.md` before touching this.** Do not build a
`/delivery/{city}` route. Do not build a template with a city name interpolated into otherwise
identical copy — that is the same doorway page the consolidation was meant to remove.

What the page must actually answer, because these are the questions that made people land on the
city pages in the first place:

- **Where does the shop deliver?** The served areas, named plainly: חיפה, טירת הכרמל, עתלית, נשר,
  קריות, עכו, נהריה. Take the list from `CLAUDE.md`, not from memory.
- **What does it cost to each?** A real table of areas and fees. This is the single most common
  reason someone visits this page and the most common thing florist sites hide.
- **When does it arrive?** The 17:00 same-day cutoff, the Friday rule, and the days with no
  delivery. Link the mechanics to `gifting-flow.md` rather than restating them — one source.
- **What happens if the recipient isn't home?** Every florist gets this question. Answer it.

Structure it so a customer can find their own city in under a second — a table or a list of named
areas, not prose. A map image is decoration unless it is accurate and accessible; the table is the
content.

If per-city pages are ever revisited, each one needs genuinely unique material — real fees, real
cutoffs, venues actually served, local reviews — driven by Search Console data. That is a content
project, not a template.

## 2. Blog

Six posts are in scope. They are a real asset for a florist — flower-care and occasion queries are
high-volume and low-competition in Hebrew — but only if they are written for readers.

- Each post earns its place by answering a question a customer actually asks: how to keep a bouquet
  alive, what to send for a shiva, which flowers suit a new baby. Thin seasonal filler is worse
  than no blog.
- Every post routes to a collection. A post that ends without an obvious next step is a leak.
- Hebrew headings in a real hierarchy (`h1` once, then `h2`/`h3` in order) — this is both
  accessibility and how the page gets parsed for search.
- Publication and update dates visible. Stale-looking content on a florist site reads as an
  abandoned shop.
- Post images follow the same pipeline as product images (`accessibility-performance.md`): AVIF
  with fallback, explicit dimensions, meaningful Hebrew alt text.
- Blog URLs are Latin/ASCII handles like everything else, with Hebrew titles and content.

## 3. 404 and redirect landings

`docs/redirects-shopify.csv` carries 191 mappings. People will arrive from Google, from old links,
and from bookmarks on URLs that no longer exist. This is a designed surface, not an error state.

- **The 404 page is a routing page.** Occasion categories, a search box, the phone number, the
  delivery-area summary. Never a bare "עמוד לא נמצא" with a link to the homepage.
- **Redirects go to the closest equivalent, never in bulk to `/`.** This is a standing decision in
  `CLAUDE.md`: each of the 160 retired product URLs 301s to the nearest new collection. A visitor
  who searched for a specific bouquet and lands on the homepage is a lost sale.
- Retired seasonal campaign pages (`/tubav`, `/shavuot2020`, `/spring`, `/roshhashana`,
  `/יום-האישה`) 301 to `/`. That is deliberate and already decided.
- Hebrew paths appear in the redirect file twice, raw and percent-encoded. Both forms must work —
  verify after any URL change.
- After launch, check Search Console for 404s arriving on URLs not in the map, and add them. The
  redirect file is maintained by hand and drifts; treat it as living.
- Never chain redirects. One hop, always.

## 4. Structured data and local SEO

`CLAUDE.md` makes SEO focus on Haifa a settled decision, and states that **the homepage is the
Haifa page**. That decision only pays off if the machine-readable layer says so too.

**LocalBusiness / Florist schema** on the homepage: business name in Hebrew, street address in
Haifa, phone, opening hours (Sun–Thu 08:00–20:00, Fri and holiday eves 08:00 until 30 minutes
before Shabbat entry — the variable close is real and should not be flattened into a fixed time),
`areaServed` listing every delivery area, and geo coordinates.

**Product schema** on every product page: name, image, description, `offers` with price in **ILS**,
availability, and the delivery cutoff reflected honestly. Never mark something in stock that the
picker will refuse.

**BreadcrumbList** on collection and product pages, matching the visible breadcrumb.

**Article schema** on blog posts.

Beyond schema:

- One `h1` per page, in Hebrew, describing that page — not the shop name repeated site-wide.
- Unique Hebrew `title` and `meta description` per page. Collection pages carry the SEO weight now
  that the catalog is fresh, so their handles and titles are the naming decision that matters
  (`site-structure.md` §11).
- `lang="he"` and `dir="rtl"` at the document root — this is an SEO signal as much as a rendering
  one.
- Canonical URLs on everything, especially filtered collection views.
- `og:` and Twitter card tags with a real product image. Flowers are shared in chat constantly; a
  link that unfurls without a picture loses the click.
- Google Business Profile is outside the codebase but is the highest-leverage thing for a local
  florist. Make sure the NAP details (name, address, phone) on the site match it exactly.
- Sitemap and `robots.txt` generated and submitted. `docs/_gsc/` is where Search Console exports
  land once there is data.

## 5. Legal and trust pages — required before launch

**Accessibility statement (הצהרת נגישות) is a legal requirement, not a nicety.** Israeli
commercial websites are obligated under the equal-rights-for-persons-with-disabilities regulations,
with תקן ישראלי 5568 as the technical standard (which tracks WCAG 2.0 AA). The site needs a
published, linked accessibility statement naming the standard applied, the accessibility
coordinator and how to reach them, and any known limitations. The engineering work in
`accessibility-performance.md` is what makes the statement true — but the statement itself is a
separate deliverable and it is the one that carries legal exposure. Confirm the details with the
owner; do not invent a coordinator name or a compliance claim.

Also required or expected:

- **Privacy policy** covering what is collected and why — note that this site collects a *third
  party's* name, address, and phone number (the recipient), which is unusual and should be stated
  plainly.
- **Terms of sale**: substitution policy in full, delivery terms, cancellation and refund rights
  under Israeli consumer protection law. Perishable goods have particular treatment — confirm the
  shop's actual policy rather than copying boilerplate.
- **Contact page** with phone, WhatsApp, address, and hours. For a local florist the phone number
  is a primary conversion path, not a fallback — make it tappable on mobile and visible in the
  header.
- **About page**: a real Haifa flower shop with a history is a trust asset. Real photographs of the
  actual shop and the actual people beat stock imagery by a wide margin here.

## Checklist

- [ ] `/delivery` names every served area with real fees, and no `/delivery/{city}` route exists
- [ ] Delivery timings on `/delivery` match `gifting-flow.md` rather than restating them differently
- [ ] Every blog post answers a real customer question and routes to a collection
- [ ] 404 page offers occasions, search, and the phone number
- [ ] Every retired product URL 301s to its closest collection, not to `/`
- [ ] Both raw and percent-encoded Hebrew redirect paths resolve
- [ ] No redirect chains
- [ ] LocalBusiness schema on the homepage with Haifa address, hours, and `areaServed`
- [ ] Product schema with ILS pricing and honest availability on every product
- [ ] Unique Hebrew title, meta description, and single `h1` per page
- [ ] Canonicals set, including on filtered collection views
- [ ] Accessibility statement published, linked, and accurate — with a named coordinator
- [ ] Privacy policy states that recipient details are collected
- [ ] Phone number tappable and reachable from every page
