---
name: qa-in-the-browser
description: Drive every finished brick in a real browser with Playwright before telling the owner it is done. Use this skill immediately AFTER building or changing anything a customer sees — a component, a page, a style, a copy string, an interaction — and before writing the design-log entry or reporting the result. Also use it when asked to "check it works", "QA this", "does it actually render", "test it in the browser", or when a change is suspected of breaking a layout. It is the verification half of design-step-by-step: that skill decides what gets built, this one proves the built thing works.
---

# QA it in the browser

A brick is not finished when the code compiles. It is finished when it has been **loaded in a
real browser, at real widths, and looked at**.

> **The rule: nothing gets reported as done until Playwright has driven it and the checks below
> have passed. "The build passed" is not evidence. "It should work" is not evidence.**

`npm run build` proves the TypeScript parses. `npm run lint` proves no physical `left`/`right`
slipped in. Neither one has ever caught a footer column sitting 16px low, a 39px tap target, a
hero that scrolls sideways at 320px, or an English string left in a Hebrew page. Those are found
by looking.

This skill runs **after** the build step of `design-step-by-step`, and before its step 8 (show
the result and record it). What you show the owner in step 8 must be what the browser actually did.

## Setup — check once per session, not once per brick

**1. Is the dev server up?**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ --max-time 20
```

`200` means go. Anything else, start it (it takes ~20s to be ready, and it must run from
`storefront/`):

```bash
npx shopify theme dev --path theme
```

Run it in the background and poll the curl above until it returns 200. Never QA a page the
server has not finished compiling — you will screenshot a blank body and believe it.

**2. Can Playwright launch?**

This machine has no system Chrome, and no sudo. Both are already worked around in
`.claude/settings.json`, which sets:

- `PLAYWRIGHT_MCP_BROWSER=chromium` — use the bundled Chromium in `~/.cache/ms-playwright/`,
  not the `chrome` channel the MCP server defaults to (it looks for `/opt/google/chrome`).
- `LD_LIBRARY_PATH=~/.local/playwright-libs/usr/lib/x86_64-linux-gnu` — the five shared
  libraries Chromium needs and Ubuntu does not ship here.

**`sudo npx playwright install-deps` is not needed and should not be suggested.** Headless
Chromium needs exactly three packages (`libnspr4`, `libnss3`, `libasound2t64`); the other sixteen
that `install-deps` installs are fonts and xvfb. Those three were unpacked into the home directory
with no root at all:

```bash
apt-get download libasound2t64 libnspr4 libnss3      # no root needed
dpkg-deb -x <each>.deb ~/.local/playwright-libs/     # no root needed
```

If that prefix is ever lost, `ldd ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome |
grep "not found"` names exactly what to re-fetch. Rebuild it rather than reaching for sudo.

**If the MCP tools still fail**, the session predates the settings file — the env vars are read at
startup. Either restart, or drive Playwright straight from Node with `LD_LIBRARY_PATH` set on the
command; both reach the same browser.

Do not work around a broken browser by inspecting HTML with `curl` and calling that a QA pass.
Curl gets you the server-rendered markup; every bug listed above lives in layout, which curl
cannot see. If the browser genuinely cannot launch, say so plainly and report the brick as
**built but unverified**.

## The loop

Run this for every brick. It is about six tool calls and takes under a minute.

**1. Navigate at mobile width first.** Mobile is the primary target, so it is the first thing you
look at — same order as the design.

```
browser_resize   → width 375, height 812
browser_navigate → http://localhost:3000/<the route the brick lives on>
```

Resize *before* navigate so the first paint happens at the real width; layout bugs that only
appear on a cold load at 375px are otherwise missed.

**2. Run the audit.** One `browser_evaluate` call, copy-paste, returns everything at once — see
*The audit script* below. Read the JSON it returns before looking at anything else.

**3. Look at it.** `browser_take_screenshot` with `fullPage: true` and a real filename
(`qa-<brick>-375.png`). Then actually read the image back and look at it — the audit script
catches measurable defects, not ugly ones. A wordmark crushed to 210px, a heading colliding with
a photo, and a card with lopsided padding are all invisible to a script.

**4. Check the console and the network.**

```
browser_console_messages  → level "error"
browser_network_requests  → filter for failures
```

Zero console errors. Zero failed requests. Pay particular attention to the **Heebo font files** —
a 404 there is silent in the layout but drops the whole page to a fallback face, and the Hebrew
will still render, so nothing looks broken until you compare weights.

**5. Repeat at 320px, then at desktop.** `browser_resize` to 320×568, re-run the audit (the
overflow check is the one that matters here), then 1280×800 and the full audit again. Three
widths, because `design-step-by-step` promises the owner all three and a promise you did not check is
a guess.

**6. Drive the interaction, if the brick has one.** A button gets clicked. A link gets followed
and its destination confirmed. A form field gets typed into. Then the keyboard path: `browser_press_key`
with `Tab` until focus reaches the control, and check the focus ring is visible — see *Keyboard
check* below. A control that only works with a mouse is not finished.

**7. Fix what failed, then run the loop again from step 1.** A fix is not verified by reasoning
about it. Re-run.

## The audit script

One call, all the measurable checks. Pass this to `browser_evaluate` as `function`:

```js
() => {
  const vw = window.innerWidth;
  const out = {viewport: vw, dir: document.documentElement.dir, lang: document.documentElement.lang};

  // Is this element actually presented to a user and a screen reader?
  // The options are NOT optional: bare checkVisibility() ignores visibility:hidden
  // and opacity:0, so a closed drawer reads as visible and poisons every check.
  // NOT offsetParent either: that is null for position:fixed, i.e. drawers and modals.
  const VIS = {visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true};
  const shown = (el) => (el.checkVisibility ? el.checkVisibility(VIS) : el.getClientRects().length > 0);

  // 1. Horizontal overflow — the single most common RTL layout bug.
  out.pageScrollWidth = document.documentElement.scrollWidth;
  out.overflows = [];
  if (document.documentElement.scrollWidth > vw + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (!shown(el)) continue;   // an off-canvas closed drawer is not an overflow bug
      if (r.right > vw + 1 || r.left < -1) {
        out.overflows.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    }
    out.overflows = out.overflows.slice(0, 10);
  }

  // 2. Tap targets under 44x44.
  out.smallTargets = [];
  const interactive = 'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  for (const el of document.querySelectorAll(interactive)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!shown(el)) continue;   // controls inside a closed drawer are not tap targets yet
    if (r.width < 44 || r.height < 44) {
      out.smallTargets.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 24),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  // 3. Latin text where Hebrew belongs — catches English placeholder copy.
  out.latinText = [];
  // A TreeWalker descends into <script> and <style>: their source is text nodes too.
  const NOT_COPY = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.parentElement && NOT_COPY.has(n.parentElement.tagName)) continue;
    const t = (n.textContent || '').trim();
    if (t.length < 3) continue;
    if (/[\u0590-\u05FF]/.test(t)) continue;         // has Hebrew: fine
    if (!/[A-Za-z]{3,}/.test(t)) continue;            // digits, ₪, punctuation: fine
    const host = n.parentElement;
    if (!host) continue;
    // Hidden copy is reported, not dropped: a closed cart drawer is still shipped
    // copy, one tap away. It just is not an outline problem, so it is tagged.
    out.latinText.push({text: t.slice(0, 60), visible: shown(host)});
  }

  // 3b. English in attributes a screen reader reads aloud. The text walk above
  //     cannot see these, and the Hydrogen starter is full of them.
  out.latinLabels = [];
  for (const el of document.querySelectorAll('[aria-label], [placeholder], [title]')) {
    for (const attr of ['aria-label', 'placeholder', 'title']) {
      const v = el.getAttribute(attr);
      if (v && /[A-Za-z]{3,}/.test(v) && !/[\u0590-\u05FF]/.test(v)) {
        out.latinLabels.push({tag: el.tagName.toLowerCase(), attr, value: v.slice(0, 40)});
      }
    }
  }

  // 4. Images: missing alt, or no intrinsic size (causes layout shift).
  out.imageProblems = [];
  for (const img of document.images) {
    const problems = [];
    // img.alt returns '' for BOTH alt="" and a missing attribute — ask the attribute itself.
    if (!img.hasAttribute('alt')) problems.push('no alt attribute');
    const sized = (img.hasAttribute('width') && img.hasAttribute('height'))
      || getComputedStyle(img).aspectRatio.includes('/');
    if (!sized) problems.push('no width+height/aspect-ratio');
    if (img.complete && img.naturalWidth === 0) problems.push('failed to load');
    if (problems.length) {
      out.imageProblems.push({src: img.currentSrc.split('/').pop().slice(0, 40), problems});
    }
  }

  // 5. Heading order — h1 present, no skipped levels. Visible headings only:
  //    a closed drawer's heading is not in the outline a screen reader reads.
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(shown)
    .map((h) => +h.tagName[1]);
  out.headings = levels;
  out.headingProblems = [];
  if (levels.filter((l) => l === 1).length !== 1) out.headingProblems.push('expected exactly one h1');
  if (levels.length && levels[0] !== 1) out.headingProblems.push(`document starts at h${levels[0]}, not h1`);
  levels.forEach((l, i) => {
    if (i && l > levels[i - 1] + 1) out.headingProblems.push(`h${levels[i - 1]} -> h${l} skips a level`);
  });

  return out;
}
```

**Reading the result — what is a defect and what is not:**

| Field | Fails when | Known-fine exceptions |
|---|---|---|
| `dir` / `lang` | not `rtl` / not `he` | none — this is absolute |
| `overflows` | non-empty at any width | none at 320/375. A deliberate horizontal scroller reports itself; confirm it is the one you built |
| `smallTargets` | any row **at 375px or 320px** | at 1280px the pointer is a mouse and the bar drops to 24×24, so a 27px-tall nav link is fine there and a defect on a phone. Inline text links inside a paragraph are exempt at every width; standalone nav, footer and CTA controls never are |
| `latinText` | any row, **including `visible: false`** | a phone number, a price, `₪`, or a brand name that is genuinely Latin. English UI copy: never — see CLAUDE.md. `visible: false` means it sits in a closed drawer, which makes it lower priority, not acceptable |
| `latinLabels` | any row | same exceptions. These are read aloud and never seen, so they rot unnoticed |
| `imageProblems` | any row | a decorative image carrying `alt=""` passes — that is a deliberate empty alt. A *missing* alt attribute never passes |
| `headingProblems` | any row | a modal drawer open at audit time legitimately puts its own heading first — close it and re-run before believing a "starts at hN" row |

## Keyboard check

After the audit, walk the focus ring through the brick:

```
browser_press_key → Tab   (repeat until focus lands inside the brick)
```

then read where focus is and whether you can see it:

```js
() => {
  const el = document.activeElement;
  if (!el || el === document.body) return {focus: 'nothing focused'};
  const s = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').trim().slice(0, 30),
    outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
    boxShadow: s.boxShadow,
    visible: (s.outlineStyle !== 'none' && s.outlineWidth !== '0px') || s.boxShadow !== 'none',
  };
}
```

`visible: false` is a defect. Tab order must also follow visual order — in RTL that is usually
automatic, but absolute positioning breaks it, so check the order you actually landed in.

## Project-specific things that are not bugs

Do not report these as regressions; they are the current known state of the build.

- **`/collections/*` returns 404.** The store has zero collections — that is Phase 2 catalog
  work. A CTA pointing at `/collections/bouquets` is correct code hitting an empty catalog.
- **The 17:00 cutoff is static text, not a live countdown.** Deliberate. The live indicator is
  its own unbuilt brick.
- **No legal links in the footer.** Deliberate — those pages do not exist yet.

If a check fails for one of these reasons, say which, rather than silently passing it.

## What to report to the owner

Not a wall of JSON. Say what you drove and what came back:

> QA'd the footer at 375 / 320 / 1280. No horizontal overflow at any width, no console errors,
> all four link rows measure 44px+, focus ring visible on every link, one h1. Screenshot:
> `qa-footer-375.png`. One thing to look at — the שעות פתיחה column sits ~8px lower than the
> others at 768px; the fix is in `Footer.tsx:41`. Want me to fix it now or log it as the next brick?

Rules for that report:
- **Name the widths you actually tested.** If you skipped one, say you skipped it.
- **Give the screenshot filename** so the owner can open it.
- **Report failures you already fixed**, not just the ones you left. The owner is learning dev; the
  bugs are the interesting part.
- **Never claim a check you did not run.** "Looks fine on desktop" when you never resized to
  1280 is the exact failure this skill exists to prevent.

## Never do these

- **Never QA against `florista.co.il`.** That is the live Wix shop. Localhost only, unless the owner
  explicitly points you at an Oxygen preview URL.
- **Never drive a real checkout.** Checkout is Shopify-hosted and reaching it can create real
  orders. Stop at the cart. Anything past it is a Phase 6 dry run the owner schedules himself.
- **Never take one screenshot and call it QA.** The audit script exists because a screenshot at
  one width hides exactly the bugs that get shipped.
- **Never let a green audit stand in for the owner's approval.** Passing means it works, not that it
  is right. `design-step-by-step` owns whether it is right.
- **Never fix something adjacent because you noticed it while QA-ing.** Report it; it is the next
  brick, not this one.
- **Never report "done" when the browser could not launch.** Say "built, not verified", and say why.

## Done, per brick

- [ ] Loaded in a real browser at 375px, 320px, and desktop
- [ ] Audit script clean at all three, or every remaining row explained
- [ ] Zero console errors, zero failed network requests
- [ ] Interaction driven — clicked, typed, followed
- [ ] Keyboard reaches it, focus ring visible
- [ ] Screenshot taken, read back, and named in the report to the owner
