# Gifting flow: dates, recipients, messages

The patterns here are what separate a working florist storefront from a generic product catalogue. Read this for anything involving delivery timing, recipient data, card messages, or sympathy products.

## 1. Delivery date selection

**Where it lives.** On the product page, above Add to Cart. Not in the cart, not at checkout. A customer who picks a bouquet and then discovers it can't arrive Thursday has wasted the whole session, and that discovery must happen before emotional investment, not after.

**How it behaves.**

- Show a calendar, not a text field. Dates are chosen visually.
- Unavailable dates are visibly disabled with a reason on focus/hover ("אין משלוחים בשבת"), never selectable-then-rejected.
- Default to the soonest available date rather than empty. An empty picker is a decision the customer has to make before they know the options.
- Delivery *window* (morning / afternoon / evening) is a second, smaller choice — offer it only if the shop actually honors windows. Never offer a promise the operation can't keep.
- The chosen date travels with the line item and is visible in the cart, the mini-cart, and the order confirmation. A customer must never have to remember what they picked.

**Israeli calendar rules the picker must encode:**

- **Sunday–Thursday**: standard delivery days. Same-day cutoff is **17:00** (`site-structure.md` §7).
- **Friday**: short day and one of the biggest flower-buying days of the week. Deliveries end **30 minutes before Shabbat entry**, with the cutoff earlier in proportion. Shabbat entry in Haifa moves across the year from roughly 16:00 in late December to roughly 19:30 in June — so this is *never* a fixed clock time. Derive it per week from candle-lighting times for Haifa specifically. A hardcoded "early afternoon" is wrong for half the year, in both directions: it refuses orders the shop could have delivered in summer, and promises ones it cannot in winter.
- **Saturday**: no delivery. Block it, and say why on hover.
- **Holiday eves (ערבי חג)**: behave like Friday — cutoff tied to חג entry, high demand, capacity-limited.
- **Holidays themselves**: blocked.

**Jewish holidays are lunisolar — there is no static list that stays correct.** Their Gregorian dates move by several weeks year to year. Use a Hebrew-calendar source (Hebcal or equivalent) and regenerate annually; a hand-typed list of dates rots silently after one year and the failure mode is accepting orders on a day the shop is shut.

**Peak dates for *this* shop.** The old Wix site tells you which occasions Florista actually trades on — it ran dedicated campaign pages for them:

- **ט"ו באב** — the Israeli romantic holiday and the local equivalent of Valentine's Day. The old site ran `/tubav`.
- **ראש השנה** — a major gifting occasion. The old site ran `/roshhashana`.
- **שבועות** — the old site ran `/shavuot2020`.
- **ערב פסח**.
- **יום המשפחה** (Family Day, in Shvat) — this is Israeli Mother's Day. The international May date is not the relevant one; do not plan capacity around it.
- **Valentine's Day** (14 February) — observed in Israel, but secondary to ט"ו באב.

These need capacity caps per date, and the picker should show a date as full rather than accepting an order the shop can't fulfil. Note that the campaign *pages* above are out of scope per `CLAUDE.md` (they 301 to `/`) — it's the demand peaks that carry over, not the URLs.

Encode all of this as data (a delivery-rules config), never as hardcoded conditionals scattered through templates. The shop owner needs to change cutoffs without a code deploy.

## 2. Same-day cutoff

Same-day delivery is a major driver in flower buying — a large share of orders are late, urgent, and apologetic.

- The cutoff is **17:00 Sunday–Thursday**. Friday and holiday eves are earlier and derived from Shabbat/חג entry, not a fixed time — see the calendar rules above. Read the value from the delivery-rules config, never from a literal in a template.
- Show remaining time to cutoff on the collection page and the product page, computed live from the real cutoff. Format: "הזמינו בתוך 2 שעות ו-14 דקות למשלוח היום".
- When the cutoff passes, the message changes to the next available day — it does not disappear silently and it does not reset. A countdown that restarts is a dark pattern; it destroys trust the moment a customer notices, and they do notice.
- If capacity for today is full before the cutoff, say so plainly and offer tomorrow.

## 3. Delivery area

Check early, cheaply, and without a form.

- A city/area selector in the header or on the collection page, remembered for the session.
- Once set, collection and product pages reflect it: availability, cutoff, and delivery fee all become concrete rather than hypothetical.
- If the recipient's area isn't served, say it immediately and offer what is served nearby — don't just fail.

## 4. Buyer vs recipient

This is where generic e-commerce templates break. Two different people with two different data needs:

| Data | Belongs to | Used for |
| --- | --- | --- |
| Email | Buyer | Order confirmation, receipt, delivery confirmation |
| Billing address | Buyer | Payment |
| Phone | Buyer **and** recipient | Buyer for order issues, recipient for the courier |
| Delivery address | Recipient | Delivery |
| Name | Both, separately | Card ("To"), account, courier |

Rules:

- Never send order confirmation or pricing to the recipient. The recipient must not learn what the gift cost.
- Recipient phone is required — couriers need it — but explain why in one short line, or customers hesitate to give someone else's number.
- Default "delivery address same as billing" to **off**. In gifting, they are usually different; a checked-by-default box causes real misdeliveries.
- Offer "I don't know the recipient's full address" gracefully if the shop supports calling the recipient. If it doesn't, don't imply it.

## 5. Card message

The message is the gift. Treat it as a first-class input, not an optional textarea.

- Live character counter against the real limit the card stock allows.
- A preview that shows the message as it will actually appear on the card, in the card's typeface and line breaks. This is the single highest-value micro-feature on a florist site.
- Hebrew RTL rendering in the preview, with correct line breaking. Test with mixed Hebrew/English/numbers ("יום הולדת שמח, אמא ❤️ 2026").
- Never required. A blocking required field on a gift message loses orders from people sending anonymously or in person.
- Offer 3–5 short suggested messages per occasion as one-tap fills, and let them be edited. Suggestions help the large fraction of buyers who freeze at a blank field.
- Emoji: allow them, but check they render on the card preview and warn if the print process can't reproduce them.

## 6. Sympathy and condolence

Held to a different standard than the rest of the shop.

- Separate collection with its own restrained layout: muted tones, more whitespace, smaller type scale contrast, no promotional badges.
- No cross-sells, no "add chocolate", no "customers also bought", no discount banners, no urgency countdown.
- Copy is plain and short. No exclamation marks, no "perfect gift" language.
- Card message suggestions for this collection are appropriate condolence phrasings, reviewed by the shop owner — not generated on the fly.
- Delivery timing here is often to a shiva address for a limited window. Make the date and window choice prominent, and allow a note to the courier.

If a task asks for a change that would apply site-wide, check whether it should be suppressed on this collection. Usually it should.

## 7. Product truth: substitution, size, vase

Flowers are seasonal and hand-made; the delivered arrangement is never pixel-identical to the photo. Handling this honestly is what prevents disputes.

- **Substitution policy**: one sentence, next to the price. Something like: seasonal availability may lead to substitution of individual stems with equal or greater value, keeping the style and color palette. Link to the fuller policy for those who want it.
- **Size variants**: each variant gets its own photograph at true relative scale. A dropdown reading small / medium / large with a single shared photo is the most common source of "this isn't what I ordered" complaints. If only one photo exists, show a scale reference and state stem counts.
- **Vase**: state clearly on every product whether a vase is included, and price the vase option visibly. Ambiguity here generates complaints at a rate out of all proportion to the price difference.
- **Stem count or size in cm** where it's meaningful — concrete numbers reduce disappointment more than adjectives do.

## 8. Post-purchase

The gifting transaction isn't finished at payment; the buyer is anxious until they know it landed.

- Confirmation email to the buyer restating recipient name, delivery date, and card message — the three things they worry they got wrong.
- Delivery confirmation to the buyer when it arrives. This is the highest-value message the shop sends and the main driver of repeat orders.
- A visible route to change or cancel before the cutoff, with the deadline stated. Customers will contact the shop regardless; a self-serve path costs less than a phone call.
