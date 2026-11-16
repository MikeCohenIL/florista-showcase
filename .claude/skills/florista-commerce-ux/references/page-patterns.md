# Page patterns

Patterns for each storefront surface. Read the section for the page you're building.

## Homepage

The homepage's job is routing by occasion, not merchandising everything.

- Lead with occasion entry points — birthday, love, thanks, new baby, condolence, hostess — as large tappable cards with real photography. Occasion is how gift buyers think; flower type is how florists think.
- Include the delivery-area selector and the same-day cutoff indicator in the first screen. These are the two facts that determine whether the visitor can buy at all.
- One seasonal or peak-date feature at most. A homepage carrying four competing promotions routes nobody.
- Anything shown in an inspirational or lifestyle image must be directly clickable to the product it depicts. A beautiful un-shoppable image is a dead end.
- Trust signals belong here in a quiet form: delivery areas served, phone number, freshness guarantee. Not badges — plain text.

## Collection page (PLP)

Where most of the decision happens. Optimize for scanning and comparison.

**Grid and cards**
- Two columns on mobile, three or four on desktop. One column on mobile wastes the comparison advantage of a grid; five columns shrink the flowers past recognition.
- Card contains: photo, name, price, size indicator, and — critically — availability for the selected date. A card that can't arrive when needed should be visually de-emphasized or filtered out, not silently included.
- Second image on hover/swipe showing a different angle or scale reference.
- Don't overlay text on the arrangement itself. Photography is the information; a badge across it destroys the thing being evaluated.
- Badges only for real facts: new, same-day available, seasonal. Never invented ("popular!") unless it's computed from real data.

**Filtering and sorting**
- Price filter with the shop's actual price bands, not an abstract slider with unclear endpoints. Budget is the primary constraint in gifting.
- Filter by: price, color, occasion, flower type, same-day availability. Color matters more here than in most retail — people buy "something white" or "something bright".
- Filters stay visible while browsing on desktop (sticky sidebar) and open in a full-height sheet on mobile with an explicit apply and a live result count.
- Applied filters render as removable chips above the grid. A customer must always be able to see why the grid looks the way it does.
- Sort control is always visible and never disguised as a filter.

**Paging**
- Pagination or an explicit "load more" — not pure infinite scroll, which makes the footer unreachable and destroys the customer's sense of position.
- Preserve scroll position and filter state on back-navigation from a product. Losing it is the most common and most infuriating PLP bug.

**Intermediary category pages**
When a category splits into subcategories, give the landing page real content — subcategory thumbnails with descriptions — rather than dumping every product from every child category into one undifferentiated grid.

## Search

- Autocomplete showing product suggestions with thumbnails, plus category suggestions. A thumbnail in autocomplete lets people identify what they want before the results page loads.
- Handle Hebrew properly: plurals and singulars (ורד / ורדים), spelling with and without matres lectionis (כלנית / כלניות, סחלב / סחלבים), common misspellings, and English brand or flower names typed in Latin script. A search engine that only matches exact strings fails constantly in Hebrew.
- Support occasion and recipient queries ("יום הולדת", "לאמא", "ניחומים") — these are searched more than flower names.
- Zero results is a routing opportunity, never a dead end: show what was searched, suggest corrections, and offer the occasion categories. Never a bare "no results".
- Search should respect the selected delivery date and area if they're set.

## Product page (PDP)

Structure, in order, mobile:

1. **Photography** — gallery, swipeable, with at least one image showing scale (in a room, held, or next to a known object) and one close detail. The gallery is the single largest determinant of conversion on this page.
2. **Name, price, size selector** — sizes as visual options with their own photos and prices, not a plain dropdown.
3. **Vase / add-ons** — clearly priced, visually shown, never pre-selected.
4. **Delivery date picker** — with cutoff indicator and area awareness.
5. **Card message** — with counter and preview.
6. **Add to cart** — sticky on mobile once the fold is passed, showing price and the chosen date.
7. **Substitution note and what's included** — stem composition, approximate dimensions, care instructions.
8. **Reviews** — real ones, with the date of purchase. Photo reviews from customers are extremely persuasive for flowers because they answer the "will it look like this" question better than any studio shot.
9. **Related products** — same occasion, different price band. Suppress entirely on sympathy products.

Rules:
- No accordion hiding the substitution policy or what's included. Those are decision inputs, not fine print.
- Price changes when a variant or add-on changes must be visible and animated subtly enough to be noticed.
- Never require sign-in for anything on this page.

## Cart and mini-cart

- Adding to cart opens a confirmation — a mini-cart panel — that shows the item, the delivery date, and two clear next actions: continue shopping, or go to checkout. Never a silent add, never a jarring full-page redirect.
- Each line item displays its own delivery date and recipient, because a customer may be sending two gifts on different days in the same order. If the shop can't fulfil multi-date orders, enforce one date per order at the point of adding the second item and explain why then — not at checkout.
- Delivery fee shown in the cart, calculated from the selected area. Fees revealed for the first time at checkout are the largest single cause of abandonment.
- Editing the delivery date or card message must be possible from the cart without removing and re-adding the item.
- Cart persists across sessions on the same device.

## Checkout adjacency

Shopify controls the checkout itself, so effort goes into the surfaces feeding it:

- Everything the customer needs to decide is already decided before checkout: date, area, fee, message, add-ons. Checkout should contain no surprises, only payment and addresses.
- **Whether there is a self-serve checkout at all is still open** (`site-structure.md` §11). The site currently promises a callback to schedule the courier. If that model stays, this section describes a *request* flow rather than a purchase flow: the same information is gathered at the same points, but nothing may be worded as a completed order. Confirm before building either.
- Guest checkout, assuming self-serve checkout is adopted. Offer account creation on the thank-you page, never before the order.
- Pass the delivery date, window, recipient details, and card message through as line-item properties so they appear on the order and on the packing slip. Verify they survive to the order confirmation — losing a card message between cart and fulfilment is a shop-level failure, not a cosmetic one.
