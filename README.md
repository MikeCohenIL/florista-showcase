# Florista: a Wix-to-Shopify rebuild, built with AI agents

**Live site: [florista.co.il](https://florista.co.il)**

Florista is a flower shop in Haifa, Israel. Its online store ran on Wix and took orders by phone
callback. I rebuilt it as a custom Shopify theme, moved the business over without losing its search
traffic, and launched it publicly in September 2026.

The build was done through an AI development workflow I designed in Claude Code: a set of
specialised agents and skills, connected to the store and a real browser through MCP, with every
change going through a written spec, a pull request and a browser test.

<p>
  <img src="screenshots/home-mobile.jpg" width="200" alt="Homepage on mobile">
  <img src="screenshots/collection-mobile.jpg" width="200" alt="Collection page on mobile">
  <img src="screenshots/product-mobile.jpg" width="200" alt="Product page on mobile">
</p>

## What was built

- **A Hebrew-first, right-to-left storefront**, designed mobile first, with its own design tokens
  and a self-hosted variable font.
- **Self-serve checkout** replacing phone-callback ordering: the cart collects a delivery date and
  time slot, applies same-day cutoffs, and skips Shabbat and Israeli holidays from a generated,
  independently verified calendar.
- **A search-safe migration**: 191 old Wix URLs mapped to 301 redirects, with a script that
  proves no redirect lands on a 404, plus structured data, Merchant Center and Search Console.
- **A fresh catalog** with a fixed set of product options, replacing 18 inconsistent ones.

## How it was built: the AI workflow

The project ran on a simple rule: **the AI builds, but every customer-facing decision is made by a
human first, and nothing is reported done until it has been seen working in a browser.**

### Agents (`.claude/agents/`)

Each agent has one job and only the tools that job needs.

| Agent | Job |
|---|---|
| `browser-qa` | Tests every change in a real browser at 375px, 320px and desktop. Returns pass/fail and a defect list |
| `pre-push-check` | Safety gate before any deploy: stale branches, missing templates, linting, which theme is live |
| `catalog-admin` | Creates and edits products, variants, collections and images in the Shopify admin |
| `copy-seo-gate` | Reviews every customer-facing string against local-SEO rules before it ships. Read-only |
| `mayan-copy-writer` | Rewrites Hebrew copy so it doesn't read as AI-written |
| `wix-research` | Crawled the old Wix site for URLs and product data during the migration |

### Skills (`.claude/skills/`)

Skills are working agreements the AI loads before a type of task.

| Skill | What it enforces |
|---|---|
| `design-step-by-step` | One element at a time, designed with the owner on mobile before any code |
| `qa-in-the-browser` | No "done" without a browser check at three screen sizes |
| `florista-commerce-ux` | Gifting-commerce standards: RTL, accessibility, image performance, palette |
| `seo-geo-haifa` | Every string must earn a search a real customer in Haifa types, for Google and AI answers |
| `git-hygiene` | Keeps parallel AI sessions, worktrees and deploys from overwriting each other |

### MCP integrations

- **Shopify Admin**: agents read and write the live catalog, orders and store settings.
- **Playwright**: agents drive a real Chromium browser to test pages and take screenshots.
- **Documentation lookup**: current Shopify and library docs instead of the model's memory.

### Process

1. Decide the element with the owner, on mobile first.
2. Build it on a branch.
3. QA it in the browser (`browser-qa`), review copy (`copy-seo-gate`).
4. Merge through a GitHub pull request (110+ merged).
5. Run the deploy gate (`pre-push-check`), then push with the owner's approval.

## What's in this repo

```
theme/       The custom sections, snippets, CSS and JS written for Florista
.claude/     The agents and skills described above
tools/       Redirect and holiday-calendar generators with their verifiers
docs/        The generated holiday calendar
```

This is a curated showcase. The working repo, with business data, search analytics and the
full history, is private, so some files the agents mention (the spec, the design log) are not here.

## Stack

Shopify (Liquid, Online Store 2.0) · vanilla JavaScript · CSS · Python · Shopify CLI ·
Claude Code · MCP · Playwright · GitHub · Cloudflare
