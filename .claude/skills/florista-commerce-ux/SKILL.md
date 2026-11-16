---
name: florista-commerce-ux
description: Design and build the Florista flower-shop storefront (Hebrew/RTL, Shopify backend) to professional gifting-commerce standards. Use this skill whenever building, restyling, or reviewing ANY storefront surface — homepage, collection/category pages, product pages, search, cart, mini-cart, delivery date pickers, card-message inputs, filters, or checkout-adjacent UI — and whenever the task touches product photography, layout, typography, RTL behavior, image performance, or accessibility on the shop. Also use it when asked to "make this look better", "review this page", or "why is this not converting". If the work produces something a customer will see on florista.co.il, consult this skill first.
---

# Florista storefront: gifting-commerce design patterns

Florista sells flowers online. That sounds like retail, but it is not — it is **gifting commerce**, and nearly every design decision follows from one fact:

> **The buyer is usually not the recipient, and the product is perishable and date-bound.**

A customer buying shoes asks "is this right for me?" A customer buying flowers asks three different questions: *will it arrive on the day it needs to*, *will it look like the photo when it gets there*, and *will it say the right thing*. A storefront that answers those three questions well converts. One that hides them behind checkout does not.

Read this file before writing any storefront code. Load the reference file that matches the surface you're working on.

## Source of truth — this skill does not outrank the spec

`docs/site-structure.md` is the specification for this project and `CLAUDE.md` carries the
decisions already settled with the owner. **They win.** This skill supplies craft standards the
spec doesn't cover; where the two disagree, follow the spec, then say the skill is out of date so
it can be corrected.

Two consequences that matter in practice:

- **Facts come from the spec, never from an example in this file.** Cutoff times, delivery areas,
  opening hours, option names, collection handles, and scope are all recorded there. Examples here
  are illustrative and may drift.
- **Some things read as settled here that are still open.** They are collected under *Open
  questions* below. Do not build either branch of an open question without asking.

## The three questions, and where they get answered

| Question | Must be answered by | Never defer to |
| --- | --- | --- |
| Will it arrive in time? | Collection page and product page | Checkout |
| Will it look like this? | Product page, above the fold | Policy page footer link |
| Will it say the right thing? | Product page / cart, with preview | A blank field at checkout |

If a change moves any of these later in the funnel, it is the wrong change.

## Non-negotiables

These hold on every page. If a request conflicts with one, say so and propose the alternative rather than silently shipping it.

1. **Delivery date is part of choosing the product, not part of paying.** The date picker belongs on the product page, before Add to Cart. Availability, cutoff times, and blocked dates are shown at the moment of choice.
2. **The same-day cutoff is always visible and always live.** A real remaining-time indicator ("הזמינו עד 17:00 למשלוח היום"), computed from actual cutoff logic. The cutoff is **17:00 Sunday–Thursday**; Friday and holiday eves are earlier and derived from Shabbat/חג entry rather than a fixed clock time — see `references/gifting-flow.md`. Never a fake countdown that resets, never invented scarcity.
3. **Delivery-area check happens early.** Let a customer confirm you deliver to the recipient's city before they invest in choosing a bouquet — on the collection page or the product page, not after they enter payment details.
4. **The photo is a promise.** Every product image shows the arrangement at the size that variant actually is, with a scale reference, and states plainly whether the vase is included. Substitution policy sits next to the price, in one sentence, not buried.
5. **Sympathy and condolence products get a quiet path.** No upsells, no add-ons, no cheerful microcopy, no "customers also bought". Muted layout, direct wording. Getting this wrong is worse than any conversion loss.
6. **RTL is the default, not an adaptation.** Hebrew is the primary language. Write logical CSS (`margin-inline-start`, `inset-inline-end`, `text-align: start`) — never `left`/`right`.
7. **Mobile is the primary design target.** Gifting is impulse-heavy and phone-first. Design the small screen first, then let it grow.

## Open questions — do not settle these yourself

`site-structure.md` §11 lists decisions the owner has not made yet. This skill has an opinion on
some of them. An opinion is not a decision — ask before building either branch.

- **Does checkout become self-serve, or does the shop keep calling the customer back?** Today the
  site promises a callback to schedule the courier. Much of this skill — "everything is decided
  before checkout", the cart as a committed purchase — assumes self-serve. If the callback model
  stays, the date picker still belongs on the product page, but the cart is a *request* rather
  than a purchase and every piece of copy around it has to say so honestly.
- **Guest checkout.** Recommended, and standard for gifting: account creation offered after the
  order, never required before it. But it presumes a self-serve checkout exists at all, so it
  depends on the question above.
- **Hebrew-only, or multi-language?** Everything here assumes Hebrew-only.
- **Does `/delivery/haifa` exist?** The footer links to a page that doesn't. Note the standing
  ban on per-city doorway pages in `CLAUDE.md` before proposing anything here. See
  `references/content-seo.md`.

## Working order

When building or changing a storefront surface:

1. **Name the surface and the customer's job on it.** "Collection page — customer knows the occasion, not the flower, and has a budget in mind." Write this down before coding; it decides the layout.
2. **Load the matching reference file** (see below) and follow its patterns.
3. **Build mobile-first, RTL-first, with real content.** Use real Hebrew product names and real photography dimensions. Lorem ipsum hides layout bugs that Hebrew will expose immediately.
4. **Run the review checklist** at the bottom of this file before calling the work done.
5. **Report deviations.** If you skipped a pattern, say which and why — don't leave it silent.

## Reference files

Load the one that matches the work. Don't load all of them.

- `references/gifting-flow.md` — delivery dates, cutoffs, blocked days and Israeli calendar, recipient vs buyer data, card messages, sympathy flows, substitution and vase policy. **Read this for anything involving dates, recipients, or messages.**
- `references/page-patterns.md` — homepage, collection/PLP, filtering, search, product page, cart and mini-cart. **Read this when building or restyling a page.**
- `references/visual-design.md` — palette discipline, Hebrew typography, photography standards, spacing, motion, RTL layout mechanics. **Read this for any styling or "make it look better" task.**
- `references/accessibility-performance.md` — contrast, keyboard and screen-reader behavior (especially date pickers), alt text in Hebrew, image pipeline, Core Web Vitals budgets. **Read this before shipping any page.**
- `references/content-seo.md` — the `/delivery` page, blog posts, 404 and redirect landings, structured data and Haifa local SEO, and the legally required Israeli accessibility statement. **Read this for any non-commerce page, any URL change, and before launch.**

## Design posture

Flowers are the color. The interface is not.

The single most common failure in florist web design is a UI that competes with the product: saturated brand colors, gradient overlays, decorative floral borders, script fonts. The photography already carries maximum chroma. So the chrome around it stays quiet — restrained neutrals, generous whitespace, one accent used sparingly for actions — and the arrangements supply every bit of the palette the page needs.

This is a discipline, not a style. It means: when a page feels flat, the fix is better photography and better spacing, not more color.

The brand colour is **wine `#8A0040`**, with **pink `#DF388C`** as the secondary. The coral the old Wix theme carried is retired. Full ramp, neutrals, and semantic colours are in `references/visual-design.md` — take values from there, never from a screenshot. Do not introduce a new palette, and do not spend the brand colour on large background fills where it will fight the bouquets.

## Copy rules

- Write in Hebrew, in the shop's voice: warm, direct, no marketing inflation. Address the customer in masculine singular unless the surface is explicitly gendered otherwise.
- Buttons name what happens: "הוספה לסל", "בחירת תאריך משלוח" — never "שלח" or "המשך" alone.
- The same action keeps the same name across the whole flow.
- Errors say what happened and what to do: "אין משלוחים לאזור זה ביום שבת. בחרו תאריך אחר." Never "שגיאה" alone, never an apology.
- Empty states are invitations: an empty cart offers the occasion categories, it doesn't just say the cart is empty.

## Review checklist

Run this before finishing. Answer each one concretely — "yes, on the product page at line N", not "yes".

**Gifting model**
- [ ] Can the customer see the delivery date and cutoff before adding to cart?
- [ ] Are blocked days (Saturday, holiday eves, sold-out dates) shown as unavailable in the picker, not rejected after submit?
- [ ] Is it clear the confirmation goes to the buyer and the flowers go to the recipient?
- [ ] Does the card message field show a live character count and a preview?
- [ ] Are sympathy products free of upsells and cheerful copy?

**Product truth**
- [ ] Does each size variant have its own photo, not just a dropdown label?
- [ ] Is "vase included / not included" stated on the product page?
- [ ] Is the substitution policy one sentence, near the price?

**Page craft**
- [ ] Does the collection page lead with occasion, with flower type as secondary navigation?
- [ ] Is price filtering available and does it use the shop's real price bands?
- [ ] Does search survive Hebrew plurals, typos, and construct forms, and does a zero-result search offer a route out?
- [ ] Does adding to cart confirm clearly and show the chosen delivery date?

**RTL and type**
- [ ] Zero `left`/`right` CSS properties in new code — all logical?
- [ ] Do directional icons (arrows, back, progress) mirror, and non-directional ones (clock, check) not?
- [ ] Do numbers, prices, and phone numbers render LTR inside RTL text without breaking?
- [ ] Is a real Hebrew webfont loaded with the weights actually used — no fallback rendering?

**Content, SEO, and launch** (see `references/content-seo.md`)
- [ ] Does the page have a unique Hebrew title, meta description, and a single `h1`?
- [ ] Is the right structured data present — Product on PDPs, LocalBusiness on the homepage, BreadcrumbList where breadcrumbs show?
- [ ] If a URL changed, is the redirect in `docs/redirects-shopify.csv`, single-hop, and pointing at the closest equivalent rather than `/`?
- [ ] Is the accessibility statement still accurate for what you just shipped?

**Quality floor**
- [ ] Text contrast ≥ 4.5:1, including text over photography?
- [ ] Full keyboard path through date picker, filters, and add-to-cart, with visible focus?
- [ ] Meaningful Hebrew alt text on product images?
- [ ] Hero image prioritized, below-fold lazy-loaded, explicit dimensions, modern format?
- [ ] LCP under 2.5s and no visible layout shift on a mid-range phone?
