---
name: git-hygiene
description: >
  The git working agreement for the Florista repo — keeps parallel sessions, worktrees, GitHub
  PRs and theme pushes from clobbering each other. Use this skill BEFORE creating a worktree or
  starting repo work, BEFORE any `shopify theme push`, WHEN finishing a branch or merging a PR,
  and WHENEVER something on the site "came back", "reverted", "disappeared again", or two
  branches disagree. Also use when the owner says git is a mess, asks to sync/clean up branches, or
  asks why a change he made is gone.
---

# Git hygiene — Florista

One page, four moments. The repo has three places state lives — **local `main`**, **GitHub
`origin/main`**, and **the live Shopify theme** — and every disaster so far came from letting
two of them drift apart. Both incidents to date are recorded at the bottom.

## The invariant

**`origin/main` is the meeting point.** Worktree sessions PR into it on GitHub — but nothing
ever pulls those merges back into local `main` by itself. Local `main` is what every new
worktree forks from and what theme pushes ship. A `theme push` uploads the **entire tree and
deletes remote-only files** — it is a full overwrite of the theme by your branch, not a diff of
your work. So a branch that is behind `origin/main` doesn't just miss changes when pushed — it
**actively resurrects everything other sessions deleted**.

Therefore: **fetch first, and never push a theme from a branch that doesn't contain
`origin/main`.**

## Moment 1 — session start / before forking a worktree

```bash
git fetch origin
git rev-list --left-right --count main...origin/main   # "A B" = local-ahead  remote-ahead
```

- **Remote-ahead ≠ 0** → local main is stale. From the main checkout, with `git status` clean:
  `git merge origin/main` (resolve, commit) before basing any work on main.
- **`git status` not clean on main** → commit it (even as WIP) before forking. Untracked files
  are invisible to every safety net git has (see the 2026-08-21 incident in CLAUDE.md).
- Only then `EnterWorktree` / branch.

## Moment 2 — before ANY `shopify theme push`

Run all four, in order. Two minutes, every time.

```bash
git fetch origin
git merge-base --is-ancestor origin/main HEAD && echo SAFE || echo "STALE — merge main first"
git status --short        # everything the theme needs must be committed
npx shopify theme list --store <store>.myshopify.com   # read the [live] role — never trust an id in docs
```

- **STALE** → merge `main` (itself freshly synced, Moment 1) into the branch, resolve, commit.
  Only then push.
- Pushing to the **[live]** theme additionally requires the two conditions in CLAUDE.md
  (storefront `302 → /password`; `florista.co.il` still answering with Wix headers) — re-check
  both, then `--allow-live`, never `--force`.

## Moment 2b — don't clobber the OTHER branches

Being up to date with `origin/main` protects *finished* work. Other sessions' *unfinished* work
lives on the other `worktree-*` branches, and neither git nor Shopify will warn you before you
trample it. Two checks:

**1. File overlap — are we editing the same things?** Before deep work, and again before a PR:

```bash
git fetch origin
ME=$(git merge-base origin/main HEAD)
git diff --name-only $ME HEAD > /tmp/mine.txt
for b in $(git branch -r --format='%(refname:short)' | grep 'origin/worktree-' ); do
  [ "$b" = "origin/$(git branch --show-current)" ] && continue
  BASE=$(git merge-base origin/main $b)
  comm -12 <(sort /tmp/mine.txt) <(git diff --name-only $BASE $b | sort) | sed "s|^|OVERLAP with $b: |"
done
```

Any `OVERLAP` line = a file both branches changed. Don't silently proceed: check `ListAgents`
and message the owning session to agree who lands first, or flag it to the owner. Docs like
`design-log.md` and `status.md` overlap constantly and merge fine (append-append) — the
dangerous overlaps are theme files, especially `templates/*.json`.

**2. Live-theme trample — did someone else push since I last looked?** A theme push replaces
the *whole* theme, including files your branch never touched. Before a live push, check the
theme's `updatedAt` (Admin API) or `theme list`; if the live theme changed more recently than
the last push *you* know about, pull `templates/index.json` from it and diff against your
branch before overwriting. If another session pushed WIP there, coordinate — don't race pushes.

## Moment 3 — finishing a branch

1. `git status` **clean** — every file the work needs is committed (a `.json` template
   referencing an uncommitted section is the classic failure).
2. Push the branch, open the PR, merge on GitHub.
3. **The merge now exists only on `origin/main` — local main just became stale.** Immediately,
   in the main checkout: `git fetch origin && git merge origin/main` (needs clean status).
   Skipping this step is exactly what resurrected the deleted homepage sections.
4. Delete the merged branch (`git push origin --delete <branch>`, `git branch -D <branch>`)
   and remove its worktree (`git worktree remove <path>`). Dead branches are where stale
   pushes come from.
5. **No follow-up pushes after the merge.** A push to a merged PR's branch *succeeds* — git
   reports no error — but the commit lands on a dead branch, invisible to `main`, and nothing
   warns you. Before any follow-up push, confirm the PR is still open (`gh pr view <n>
   --json state`); if it merged, cherry-pick onto a fresh branch off `origin/main` and open a
   new PR. Better: land a brick's code, QA and docs in one commit so there is no follow-up.
   (Bit us 2026-08-29: a docs commit pushed to the merged #40 branch had to be rescued as #41.)

## Moment 4 — "it came back / it's gone again"

Something a session deleted has reappeared (or vice versa). Diagnose, don't guess:

```bash
git log --all --oneline -G'<pattern>' -- <file>     # every commit that touched it, any branch
git branch -a --contains <commit>                   # which branches have the fix/removal
git rev-list --left-right --count main...origin/main
npx shopify theme pull --store <store>.myshopify.com --theme <live-id> \
  --path /tmp/live-check --only templates/index.json   # what is ACTUALLY live
```

Almost always the answer is: the change lives on one side of a `main`/`origin/main` divergence,
and a theme push shipped the other side. Fix the divergence (merge), re-push once from the
merged tree, and bring every **active** worktree branch up to date with
`git merge main` so the next push from it is safe.

## Incidents this skill exists because of

- **2026-08-21 — dirty-trunk worktrees:** three parallel homepage sessions forked from a trunk
  with untracked files; every branch was unbuildable alone and one `git clean` from disaster.
  (Full account in CLAUDE.md.)
- **2026-08-23 — the resurrected homepage sections:** lifestyle band + newsletter were removed
  via PRs #9 and #10 to `origin/main`, but local main never pulled the merges. Theme pushes
  from local-main-based branches restored the deleted sections to the live theme **three
  times** (01:34, ~02:00, 12:13) before the divergence was found and merged.
