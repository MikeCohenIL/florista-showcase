# Visual design

Read this for any styling task, any new component, and any request phrased as "make this look better".

## The governing principle

**The flowers are the color. The interface is not.**

Product photography of flowers arrives at maximum saturation across the whole spectrum — that is the product. Any interface color of comparable intensity competes with it and makes the page feel cheap and busy. So:

- Backgrounds: near-white, warm off-white, or a very light neutral. Large fields of brand color behind product grids are the most common florist-site mistake.
- The brand accent is spent on interactive elements — primary buttons, active states, links — and on small identity moments. Not on section backgrounds, not on card fills.
- Neutrals do the structural work: borders, dividers, secondary text, disabled states.
- Keep the palette below. It is the owner's palette, chosen deliberately — do not introduce another new scheme or "modernize" it unasked.

When a page feels flat, the fix is almost always better photography, more whitespace, or a stronger type hierarchy — not more color.

## The palette

**Replaced 2026-08-20 — this is the owner's new palette, not the Wix-derived one.** The wine stays (it
is the logo colour and was never in question); pink is retired and replaced by an earthy
sage/ivory/sand scheme. If you find a reference to the old pink secondary or to pure white as the
page ground anywhere in the codebase, it is stale — fix it rather than treating it as intentional.

### Primary — wine

| Token | Hex | On white | Use |
| --- | --- | --- | --- |
| `wine-900` | `#4C0023` | 15.77:1 | Text sitting on a wine tint |
| `wine-700` | `#6C0032` | 12.47:1 | Hover and active states for primary actions |
| `wine-500` | `#8A0040` | 9.75:1 | **The brand colour.** Primary buttons, links, logo |
| `wine-100` | `#F3E6EC` | — | Tinted section or card background |
| `wine-050` | `#FAF4F6` | — | The lightest tint; selected rows, subtle fills |

White text on `wine-500` is 9.75:1 and on `wine-700` is 12.47:1 — both clear AA and AAA, so the
primary button needs no special handling.

### Secondary — sage

| Token | Hex | On white | Use |
| --- | --- | --- | --- |
| `sage-700` | `#5A6552` | 6.1:1 | Derived dark variant — links, small headings, anything carrying text |
| `sage-500` | `#828C7E` | 3.5:1 | Decorative fills, borders, large headings — **never body text** |
| `willow` | `#B4BDB1` | 1.9:1 | Subtle fills, selected rows — background/tint only, never text |

`#828C7E` ("Earthy Sage") and `#B4BDB1` ("Soft Willow") are the owner's colours. `sage-700` is a derived
shade, not one of his named hexes — it exists solely because sage-500 fails the 4.5:1 body-text
floor, the same problem pink-500 had. Keep the same hue when deriving further shades; don't drift
toward grey.

### Neutrals

The grey scale is carried over unchanged. The warm background pair is new as of 2026-08-20.

| Token | Hex | On white | Use |
| --- | --- | --- | --- |
| `ink` | `#2F2E2E` | 13.54:1 | Body text |
| `grey-600` | `#595858` | 7.09:1 | Secondary text — the last step still safe for small type. On `sand` this drops to ~4.5:1 — stays AA but has no margin, check before pairing |
| `grey-500` | `#828181` | 3.88:1 | Icons and placeholders only, **never body text** |
| `grey-400` | `#ACABAB` | 2.29:1 | Borders, dividers, disabled controls |
| `ivory` | `#F9F6F0` | ink 12.5:1 · wine-500 9.03:1 | **The page ground — replaces pure white.** Resolves the "open" question below |
| `sand` | `#DBCBBF` | ink 8.6:1 · wine-500 6.2:1 | Tinted section/card surface — replaces `grey-100` |
| `white` | `#FFFFFF` | — | No longer the default ground; keep only where a surface genuinely needs neutral white (e.g. product photo mats) |

The logo mark uses `#222622`, a near-black with a faint green cast, rather than pure black. Keep it
in the logo; use `ink` for text.

### Semantic colours

Separate from the brand accent by design — a customer must be able to tell an error from a button.
Note that the error red sits at a different hue from the wine so the two never read as the same
signal.

| Token | Hex | On white | Use |
| --- | --- | --- | --- |
| `success` | `#1F6B4A` | 6.44:1 | Confirmations, in-stock, delivery available |
| `warning` | `#8A5A00` | 5.93:1 | Approaching cutoff, limited capacity |
| `error` | `#C0271D` | 5.92:1 | Validation failures, unavailable dates |

Never encode a state in colour alone — pair every one of these with an icon or a word
(`accessibility-performance.md`).

### Seasonal — honey (Rosh Hashana, added 2026-08-25)

A campaign accent for festive CTAs, chosen with the owner for the ראש השנה hero. Revised the same
day from a dark gold (`#96610A`) to "liquid honey" — the owner picked the jar's own colour from a
three-swatch comparison. Honey is **light**, so text on it is ink, not white (ratios below are
vs ink `#2F2E2E`). In the amber family but deliberately **not** the warning value — a buy
button must never read as a cutoff warning, so the two stay distinct hexes.

| Token | Hex | On ink | Use |
| --- | --- | --- | --- |
| `honey-500` | `#E39B1F` | 5.79:1 | Festive/seasonal CTA fill (ink text) |
| `honey-700` | `#D68E12` | 4.99:1 | Hover/active for festive actions |

Scope it to campaign surfaces (the seasonal hero CTA); everyday actions stay wine and sage.

### Retired — do not use

The Wix theme's coral ramp is gone: `#E84A43`, `#9B312D`, `#4D1916`, `#F09E9A`, `#F7BFBD`. So is the
pink secondary this rebuild started with: `#DF388C` (`pink-500`), `#A72A69` (`pink-700`) — replaced
2026-08-20 by the sage/ivory/sand scheme above. If you find any of these in markup or an old asset,
replace it with the current equivalent rather than keeping it "just here".

Also ignore the navy, yellow, and green ramps and the stock `#ED1C24` / `#0088CB` / `#FFCB05` in the
old site's CSS. They are Wix template defaults, referenced zero times in the rendered page, and were
never Florista's colours.

## What to avoid

These read as amateur florist-site design and should not appear:

- Script or handwriting fonts for anything but, at most, a logo.
- Decorative floral borders, watercolor splashes, or vine dividers. The actual flowers are the decoration.
- Gradient overlays on product photography.
- Heavy drop shadows on cards. If separation is needed, use a hairline border or a tonal background.
- Full-bleed carousels that auto-advance.
- Stock photography of generic flowers alongside real product photography — the mismatch is instantly visible and undermines trust in the real photos.

## Typography (Hebrew-first)

- **The typeface is Heebo, self-hosted.** Settled with the owner — do not re-open, and do not add a
  second family without asking. Variable 100–900, covering Hebrew and Latin as one system, so
  prices, `S/M/L`, and Latin brand names come from the same face as the Hebrew. Files, the
  `@font-face` CSS with `unicode-range` splits, and the OFL licence live in `docs/brand/fonts/`.
  **Never link the Google Fonts CDN** — self-host from the frontend's own assets. Weight split:
  400 body, 500 UI labels and buttons, 700 headings; the lighter end is display-only and unused
  below 32px.
- Hebrew fallback rendering is visibly poor and immediately signals a low-quality site — which is
  exactly what the old Wix site did, styling Hebrew with Latin-only faces (DIN Neuzeit Grotesk,
  Avenir, DIN Next) that have no Hebrew glyphs at all. Preload the Hebrew subset; it renders first
  on every page and is only 12 KB.
- Hebrew has no italics and no small caps, and faux-italic is ugly. Use weight, size, and color for emphasis instead. If a design calls for italic, that call is wrong here.
- Hebrew has no capital letters, so all-caps styling and capitalized headlines don't exist as devices. Hierarchy must come from size, weight, and spacing.
- Hebrew glyphs have a larger x-height relative to their cap-equivalent and sit denser than Latin. Give slightly more line-height than a Latin equivalent — roughly 1.6–1.75 for body — and be careful with tight letter-spacing, which damages Hebrew legibility faster than it does Latin.
- **The type scale is 12 / 14 / 16 / 20 / 24 / 32 / 48**, implemented as `--text-xs` … `--text-3xl`
  in `storefront/app/styles/tokens.css`. Use only steps from it. Body text at 16px minimum;
  smaller Hebrew text degrades badly on mobile, so 12px is for legal microcopy and never for
  running text. The two largest steps are fluid — `--text-display` (32→48) and `--text-page-title`
  (24→32) — because a fixed 48px headline overflows at 375px.
- Line height comes from the same file: `--leading-body` 1.7, `--leading-snug` 1.45,
  `--leading-heading` 1.25. The body figure is deliberately looser than a Latin equivalent.
- Mixed Hebrew and Latin in one line (brand names, sizes, "S/M/L") needs testing — the bidi algorithm will reorder things, especially around punctuation at line boundaries.

## RTL mechanics

RTL is the default direction, not a variant to be patched in later.

- Set `dir="rtl"` and `lang="he"` at the document root.
- Use logical CSS properties exclusively: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-start-start-radius`, `text-align: start`. Physical `left`/`right` properties are a bug in this codebase.
- Flexbox and Grid follow direction automatically — do not manually reverse them, and check that `row-reverse` isn't being used to fake it.
- **Mirror**: arrows, chevrons, back and forward controls, progress indicators, carousel controls, breadcrumb separators, sliders.
- **Do not mirror**: clocks, checkmarks, logos, photographs, media play buttons, icons depicting real objects.
- Numbers, prices, and phone numbers are LTR runs inside RTL text. Wrap them appropriately and test that a price like "₪249" renders with the shekel sign on the correct side and that phone numbers don't scramble.
- Test every component in Hebrew with real strings. Hebrew text is typically shorter than English for the same content, which changes button and card proportions — layouts tuned on English placeholder text will look wrong.

## Photography standards

The photography *is* the design. Enforce these on any product added:

- Consistent background, lighting, and angle across the catalogue. Inconsistency across a grid is the most damaging visual flaw a florist site can have — it makes the shop look unreliable before a single price is read.
- One hero shot per product on the standard background, plus: one scale reference (in a room, held, or beside a familiar object), one detail close-up, and one shot of the actual size variant if variants differ.
- Consistent aspect ratio, enforced in code with `aspect-ratio` so the grid never shifts.
- No heavy filters. Color accuracy matters — a customer comparing the delivered flowers to an oversaturated photo will feel misled even when the arrangement is correct.

## Spacing and layout

- One spacing scale, based on a 4px or 8px step. Every gap comes from it.
- Whitespace is the main tool for making a product grid feel considered rather than crowded. When in doubt, increase it.
- Maximum content width on desktop so lines of Hebrew text don't run past comfortable measure (roughly 60–75 characters).
- Consistent corner radius across cards, buttons, inputs, and images — one value, maybe two.
  A third, `radius-xl` (20px), exists for large photography only — category tiles, product
  cards — added 2026-08-20 for a softer, more boutique feel than the 8px `radius-lg` reads.
- Design mobile-first at ~375px, then let the layout grow. Check 320px doesn't break.

## Motion

Restraint. Motion should confirm actions, not entertain.

- Add-to-cart confirmation, mini-cart slide-in, filter sheet, image gallery transitions — these earn animation.
- Scroll-triggered reveals on product grids do not; they delay the customer seeing the product, which is the entire purpose of the page.
- Keep durations short (150–250ms) and easing consistent.
- Respect `prefers-reduced-motion` on everything.
