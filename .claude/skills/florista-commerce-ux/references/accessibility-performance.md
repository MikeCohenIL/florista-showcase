# Accessibility and performance

Read before shipping any page. These are a quality floor, not a phase-two task — retrofitting either one costs several times what building it in costs.

## Accessibility

### Contrast and color
- Body text ≥ 4.5:1 against its background; large text (24px+, or 19px+ bold) ≥ 3:1.
- Interactive controls and their focus indicators ≥ 3:1 against adjacent colors.
- Text over photography needs a solid scrim or a plate behind it — flower photography has unpredictable local contrast, and a headline that's legible over one bouquet will vanish over the next.
- Never encode meaning in color alone. "Available" vs "unavailable" dates need a shape, icon, or text difference too, not just a lighter shade.

### Keyboard
Every one of these must be completable with a keyboard alone, with a visible focus indicator at every step:
- Browsing and filtering a collection
- Opening and operating the delivery date picker
- Selecting a size variant and add-ons
- Entering a card message
- Adding to cart and reaching checkout

Focus rules:
- Never remove focus outlines without replacing them with something at least as visible.
- Modals and sheets (filter panel, mini-cart, date picker) trap focus while open, return focus to the trigger when closed, and close on Escape.
- Focus order follows visual order. In RTL this is usually automatic — but check, because absolute positioning can break it.

### The date picker
The single highest-risk component on the site for accessibility, and the one most often shipped broken.

- Use a native `<input type="date">` or a well-tested accessible calendar library. Do not hand-roll a calendar from divs; correct calendar keyboard and screen-reader semantics are genuinely hard and rarely got right from scratch.
- Arrow keys move between dates, Page Up/Down between months, Home/End to week boundaries.
- Disabled dates are announced as disabled *with the reason* where possible, not silently skipped.
- The currently selected date is announced on change.
- Label it explicitly: "תאריך משלוח", not just a calendar icon.

### Screen readers and semantics
- Real semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, headings in order without skipping levels.
- Form inputs have persistent visible labels. Placeholder-only labeling fails as soon as the field is filled and fails screen readers entirely.
- Live regions announce cart additions, filter result counts, and validation errors.
- Errors are associated with their field programmatically and describe the fix.

### Alt text
Product images need meaningful Hebrew alt text describing the arrangement: "זר ורדים אדומים וגיפסנית לבנה בכד זכוכית" — not a filename, not "תמונת מוצר", and not the product name repeated. Decorative images get empty alt.

Alt text has commercial value beyond accessibility here: it is what appears when images fail to load on a weak mobile connection, and it feeds image search, which matters for a florist.

## Performance

Flower buying is mobile, often urgent, often on cellular. A slow page loses orders that a fast one keeps.

### Targets
- Largest Contentful Paint under 2.5s on a mid-range Android over 4G
- Cumulative Layout Shift under 0.1
- Interaction to Next Paint under 200ms
- Total page weight on a collection page under roughly 1.5MB

Test on a throttled mid-range device, not a desktop over office wifi. The difference is large enough to hide every real problem.

### Images — the whole game
A florist site is almost entirely photography, so image handling determines whether the targets are met.

- Serve AVIF with WebP fallback. The saving over JPEG on flower photography is substantial.
- Responsive `srcset` and `sizes` for every product image, sized to the actual rendered dimensions at each breakpoint. Shipping a 2000px image into a 400px card is the most common cause of a slow collection page.
- Always set explicit `width` and `height` (or `aspect-ratio`) so nothing shifts as images arrive. Layout shift on a product grid is both a metric failure and an active annoyance — customers tap the wrong bouquet.
- Above-the-fold hero image: `fetchpriority="high"`, not lazy-loaded, preloaded. Everything below the fold: `loading="lazy"`.
- Cap the number of images rendered in the initial collection view; load the rest as the customer scrolls.

### Fonts
- Preload the Hebrew webfont files actually used, subset to Hebrew plus Latin plus digits.
- `font-display: swap` with a fallback metrically close enough not to cause a visible reflow.
- Two weights is usually enough. Each additional weight is another blocking download.

### Everything else
- Third-party scripts are the second-largest cost after images. Every analytics, chat, or review widget needs a justification and should load deferred or on interaction.
- Don't ship JavaScript for things CSS can do — carousels, accordions, and sticky elements rarely need it.
- Cache aggressively; product photography rarely changes once published.
