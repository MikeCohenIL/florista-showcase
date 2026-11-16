---
name: design-step-by-step
description: The working agreement for building the Florista storefront — one element at a time, each one designed WITH the owner before any code is written, and every element decided on mobile first. Use this skill for ANY work that creates or changes something a customer sees: a component, a page, a layout, a colour, a spacing value, a piece of copy, an interaction. Triggers on "build the header", "design the product card", "let's do the homepage", "make the cart", "add a date picker", and on any request to style, restyle, lay out, or lay down markup for a customer-facing surface. If the task would produce pixels, this skill governs how the work happens; florista-commerce-ux governs what good looks like.
---

# Design step by step

The owner is building this shop brick by brick, on purpose. He wants to see and decide **every
element** before it exists. This skill is the working agreement that makes that happen.

> **The rule: nothing customer-facing gets built until the owner has chosen it — and every choice is
> shown on mobile first.**

This is not a speed problem to be optimised away. Going slowly *is* the requirement. A finished
page that the owner did not shape is worse than an unfinished page he did, because he cannot maintain
or extend a shop he never designed.

## What counts as one brick

One brick is **the smallest thing that can be looked at and judged on its own.** Not a page. Not
a "component library". One thing.

| One brick ✅ | Not one brick ❌ |
| --- | --- |
| The header logo placement | "The header" |
| The product card's price row | "The product card" |
| The date picker's blocked-day styling | "The date picker" |
| The primary button, all states | "Buttons, badges and forms" |
| The homepage hero's layout | "The homepage" |

If you cannot show it in one screenshot or one short mockup, it is too big — split it and ask
about the first piece.

**One brick per exchange.** Never open a second question before the first is answered and built.

## The loop

Run this for every brick, in order. Do not skip steps, do not reorder them.

**1. Name the brick and its job.**
One sentence, in plain language: *"The product card price row — it has to make the price
obvious and show that a size is selected, without shouting over the photo."*

**2. Design the mobile version first.**
Always. Mobile is the primary target — gifting is phone-first and impulse-heavy. Work out the
~375px layout completely before you think about desktop. Check it does not break at 320px.

**3. Show what desktop does with the same brick.**
Every brick gets *both*, in the same exchange. Never present a desktop design and leave mobile
"for later" — later is where mobile goes to die. If the brick is identical on both, say so
explicitly: *"desktop is the same, just wider."* That is a valid answer, but it has to be said,
not assumed.

**4. Offer 2–3 real options, with a preview of each.**
Use `AskUserQuestion` with ASCII mockups in the `preview` field. Options must be genuinely
different approaches, not the same idea three times. Put your recommendation first and say why
in one line. If there is honestly only one sensible option, say that and ask for a yes rather
than inventing filler alternatives.

**5. Explain it so a learner can judge it.**
The owner is learning dev. Any term that is jargon gets a short gloss the first time it appears in a
proposal — *"sticky (it stays put while the page scrolls under it)"*. Never make him accept a
design he does not understand. If he asks "explain for a noob", the `teacher` skill handles it.

**6. Stop. Wait for the answer.**
Do not write code while the question is open. Do not "start on the safe part". The waiting is
the point.

**7. Build exactly what was chosen — and nothing adjacent.**
No "while I was in there". If you spot something else that needs fixing, note it in the design
log and raise it as the *next* brick.

**8. QA it in a real browser, then show the result and record it.**
Before you claim anything about how it looks, drive it with Playwright — the
**`qa-in-the-browser`** skill. Then say what you built, what it looks like at 375px and at
desktop, and append the decision to `docs/design-log.md`. What you tell the owner about the result
must be what the browser actually did, not what the code should do. If the decision is durable and settled, also record it where settled
decisions live — `CLAUDE.md`.

## Mobile is not a step you can defer

This is the part that decays first, so it is stated separately.

- **Every** proposal covers mobile. Every one. A proposal that only describes desktop is
  incomplete and must not be sent.
- Design at ~375px, verify at 320px, then let it grow.
- Say out loud what changes between the two: what stacks, what hides, what reflows, what gets a
  bigger tap target. "It's responsive" is not an answer — name the change.
- Tap targets are at least 44×44px. Hebrew is RTL, so check that thumbs reach the controls on
  the side they actually land on.
- If a design only works on desktop, it is the wrong design — flowers get bought on phones.

## Never do these

- **Never batch.** Two bricks in one message is a violation, even if they are small.
- **Never build ahead.** Do not "get a head start" on the next brick while waiting.
- **Never decide taste alone.** Colour, spacing, wording, ordering, and emphasis are all the owner's
  calls. Technical correctness is yours.
- **Never present one option as if it were inevitable** unless it genuinely is, and say so.
- **Never let a passing build stand in for approval.** `npm run build` passing means the code
  compiles, not that the design is right — and not that it renders. Both need checking, by
  different means.
- **Never quietly widen scope.** A brick that turns out to need three sub-bricks gets reported,
  not absorbed.

## Where the answers come from

This skill governs *how* the work happens. It does not override:

- **`docs/site-structure.md`** — the spec: pages, data model, business rules.
- **`CLAUDE.md`** — decisions already settled with the owner. Do not re-open these; re-litigating
  them wastes his time.
- **`.claude/skills/florista-commerce-ux/`** — the craft standards: palette, type scale, RTL
  mechanics, gifting patterns, accessibility. Load the reference that matches the surface.

When you propose options, they must all be *inside* those standards. Do not offer the owner a choice
that breaks the palette or the RTL rule and let him pick it unknowingly — if an option violates
a standard, either drop it or flag the conflict plainly.

## The design log

`docs/design-log.md` is the brick-by-brick record: what is decided, what is next, and why. It is
a repo file so it can be read back in a later session — never track this in an artifact, a
checklist in chat, or anywhere that cannot be re-read.

Append to it as each brick lands. One entry per brick: what it is, what was chosen, what mobile
does, what desktop does, and anything deferred.

## Done, per brick

A brick is finished when all of these are true:

- [ ] the owner chose it — not inferred, not assumed from silence
- [ ] Mobile is designed, and 320px does not break
- [ ] Desktop is designed, and the difference from mobile was stated
- [ ] It uses tokens from `tokens.css` — no raw hex, no off-scale spacing
- [ ] Zero physical `left`/`right` CSS — `npm run lint` passes
- [ ] Real Hebrew copy, not English placeholder and not lorem ipsum
- [ ] Keyboard reachable with visible focus
- [ ] Driven in a browser at 375/320/desktop — `qa-in-the-browser` passed
- [ ] Recorded in `docs/design-log.md`

## If the owner says go faster

He can suspend this at any time — "just build it", "don't ask, go". Then go, and say what you
decided on his behalf so he can push back. **The default is slow.** Speed is something he asks
for; it is never something you assume because a brick seemed obvious.
