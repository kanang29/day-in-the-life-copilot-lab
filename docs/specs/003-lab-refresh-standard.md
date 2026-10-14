---
id: "003"
title: "Lab refresh standard: Phase 1 decisions and verification ledger"
status: draft
created: 2026-10-14
depends_on:
  - "001"
related_issue: "kanang29/day-in-the-life-copilot-lab#3"
---

# 003 — Lab refresh standard: Phase 1 decisions and verification ledger

## Purpose and scope

Issue [#3](https://github.com/kanang29/day-in-the-life-copilot-lab/issues/3)
("Brother Hackathon: Lab curriculum refresh") asks every phase's PR
description to carry a Decisions log, a verification ledger (claim →
primary-source URL → status), a command-verification table and a per-lab
change summary. The `report_progress` tooling this session runs under
restricts the PR description itself to a plain checklist, so this document
is the durable, in-repo home for that richer record — not something the
issue text asked for by this filename, but the most direct way to satisfy
its intent given that constraint. It is not a new research spec like `001`;
it is a running decision log, updated once per phase rather than rewritten.

Only **Phase 1** content is recorded below. Later phases append their own
dated sections rather than editing Phase 1's.

## Phase 1 — Standard and guardrails

### Tier / surface assignments

Every in-scope lab now carries `tier: beginner | advanced` and
`surface: vscode | cli | github` frontmatter. Final assignments versus the
issue's starting proposal:

| Tier · surface | Labs | Change from starting proposal |
|---|---|---|
| Beginner · VS Code | `setup`, 01, 02, 03, 04, 05, 07, 10 | none |
| Advanced · CLI | 06, 11, 12, 13, 14, 15, `lab-hardening`, `lab-copilot-cli-extensions`, `lab-gh-extensions` | 06 resolved to CLI (see below) |
| Advanced · github.com | 08, 09, 16, 17, 18, 19, 20 | none |

**Lab 06 (Hooks) resolved to Advanced · CLI.** The issue left this
conditional on whether hooks are verified to work in VS Code. Fetched
`https://docs.github.com/en/copilot/concepts/agents/about-hooks` directly
(2026-10-14): "Hooks are available for use with: Copilot cloud agent on
GitHub. GitHub Copilot CLI in your terminal." VS Code is not in that list.
`labs/lab06.md` itself currently links the old
`.../using-github-copilot/using-hooks` path, which 404s, and contains a
"Verifying hooks in VS Code" callout that is therefore incorrect — tracked
for Phase 6 (advanced CLI cluster), not fixed here since Phase 1 only
assigns tier/surface, it doesn't rewrite lab bodies.

### Merge map

All seven overlap clusters the issue lists were reviewed by comparing each
lab's headers and stated scope. Conclusion: **no lab needs to merge into
another; every cluster keeps its members with explicit boundaries.** The
`merged_into: labNN` stub mechanism in Constraints will not be used.

| Cluster | Verdict | Reasoning |
|---|---|---|
| 07 ↔ 13 ↔ 14 (orchestration/A2A/tmux) | Keep all | Distinct depth levels: single-session custom-agent delegation (07) → cross-process A2A/ACP protocol concepts (13) → tmux pane-based "Deep-Dive" implementation (14, says so in its own title) |
| 11 ↔ 16 ↔ `lab-copilot-cli-extensions` (plugins/governance/CLI ext) | Keep all | Distinct personas/artifacts: author a plugin (11) vs. admin governs the marketplace (16) vs. author a CLI extension triggered by a hook (`lab-copilot-cli-extensions`) |
| 16 ↔ 17 ↔ 20 (admin controls/model policy/usage reporting) | Keep all | Distinct admin mechanisms, each backed by a separate registry key (`enterprise_managed_settings`, `model_default_availability_policy`); add cross-links in their phase (5) |
| 08 ↔ 18 ↔ 19 ↔ `lab-gh-extensions` (gh-aw basics/spec→PRD/self-improving/gh CLI ext) | Keep all | `lab-gh-extensions` teaches a different GitHub product (`gh extension create`, plain GitHub CLI extensions) than gh-aw (GitHub Agentic Workflows) — naming-confusion risk, not content redundancy. Lab 18 already says "Extends Lab 08." Add disambiguation callouts in Phase 4 |
| 09 ↔ 18 (code review setup) | Already resolved | Lab 18 §18.4 already says "This is the piece that closes the loop with Lab 09... exactly as in Lab 09." No action |
| 03 ↔ 06 ↔ `lab-hardening` (custom agents/hooks/tool gating) | Keep all | `lab-hardening` is the explicit synthesis/capstone combining a custom agent (03) with a `preToolUse` hook (06). It currently has **zero cross-links** to either — a real gap, tracked for Phase 6 |
| 02 ↔ 10 (instruction precedence) | Already resolved by issue text | "Lab 02 owns it; Lab 10 links to it" — verify the link exists in Phase 3 |

### Model lineup refresh

Re-verified live against
`https://docs.github.com/en/copilot/reference/ai-models/supported-models`
(2026-10-14), full GA table read end to end:

| Claim | Status | Evidence |
|---|---|---|
| `gpt-5.2` is GA | **False — removed from registry** | Absent from the live GA table (spec 001 claim 15 confirmed) |
| `claude-opus-4.7` is GA | **False — removed from registry** | Absent from the live GA table; Opus line now tops out at 4.8 / 5 / 5.5 |
| `gpt-5.4` (bare, not `-mini`) is GA | **True — added to registry** | Present in the live GA table; was already cited bare in `labs/lab10.md:59` pending its Phase 3 rebuild, but missing from `registry.yaml` entirely |

`docs/_meta/registry.yaml`'s `models.standard`/`models.premium` lists are
updated accordingly. Full before/after is in the Phase 1 commit diff.

**New finding beyond spec 001: `claude-opus-4.6` is also not GA**, and is
not a registry entry at all — it's an *operational* pin in `AGENTS.md`:

> "Pin `task`-tool sub-agent dispatches to `claude-opus-4.6` (per
> `copilot-instructions.md`)." — `AGENTS.md:86`

`.github/copilot-instructions.md` has **zero** mentions of any model name,
so that cross-reference is itself dangling. `claude-opus-4.6` is also
cited directly (not just via the AGENTS.md policy) in `labs/lab07.md`,
`labs/lab10.md`, `labs/lab13.md` and `labs/lab14.md`. This is now tracked
as **known-drift item 16** (extending the issue's own numbered list):

> 16. **Sub-agent-dispatch model pin (`AGENTS.md:86`) is stale.**
>     `claude-opus-4.6` is not on the current Supported AI models page and
>     its "(per copilot-instructions.md)" cross-reference is dangling
>     (that file never mentions a model). Needs a replacement model choice
>     (a reasoning-tier pick, e.g. from `models.premium`) and a fix to
>     every lab that cites the old pin. Not fixed in Phase 1 — deciding the
>     new pin is a judgment call belonging to the phase that actually
>     touches each citing lab (07 → Phase 2, 10 → Phase 3, 13/14 → Phase 6)
>     and to Phase 7 for `AGENTS.md` itself.

### New guardrail test

Added `tests/content-currency/model-ids-in-registry.test.ts`: every
`claude-*` / `gpt-*` / `grok-*` / `gemini-*` token mentioned in any
in-scope lab must be in `registry.yaml`'s flattened model list, **or** be
listed in that test's `KNOWN_MODEL_DRIFT` allow-list with the phase that
will remove the entry. Current allow-list entries (all pre-existing,
discovered by this audit, not introduced by it):

| Lab | Model ID | Fixed in |
|---|---|---|
| `lab07.md` | `claude-opus-4.6` | Phase 2 |
| `lab10.md` | `claude-opus-4.6`, `claude-opus-4.7` | Phase 3 |
| `lab13.md` | `claude-opus-4.6`, `claude-opus-4.7` | Phase 6 |
| `lab14.md` | `claude-opus-4.6`, `claude-opus-4.7` | Phase 6 |

The test also asserts every allow-list entry is still a real, current
violation, so a future phase that fixes a lab but forgets to delete its
allow-list entry fails loudly instead of silently masking new drift.

### Registry `labs:` entries added

`setup`, `lab-hardening`, `lab-gh-extensions` and `lab-copilot-cli-extensions`
had no `docs/_meta/registry.yaml` `labs:` entry before Phase 1. Titles are
copied verbatim from each file's frontmatter `title:`. `pace_workshop_minutes`
is a registry-only field (never mirrored into lab frontmatter — confirmed
by grepping all 24 labs for `workshop_minutes`, zero hits); it is set equal
to `pace_presenter_minutes` for these four, since none are scheduled inside
`workshop/curriculum.md`'s 4-hour module map and so have no separate
rehearsed "live demo" slot to size against — the same no-extra-buffer
convention `lab13`/`lab14` already use for the same reason.

### Deferred (not Phase 1 scope, recorded so later phases don't re-discover them)

- **`memory` MCP server inconsistency (known-drift item 8).** Confirmed
  directly: `.copilot/mcp-config.json` has no `memory` entry (only
  `context7`, `sequential-thinking`, `workiq`, `microsoft-learn`), while
  `registry.yaml`'s `mcp_servers` list and `AGENTS.md`'s MCP server table
  both still list it. This matches the repo's own stated position in
  `docs/memory-decision-tree.md:132-141` and `labs/lab05.md:129-138`: the
  `memory` server is a pinned-but-unused primitive — persistence is
  markdown lessons, not a knowledge-graph MCP server. Resolution belongs to
  Phase 3 (Lab 10's graph-engineering section must not claim a server that
  isn't shipped) and Phase 7 (remove the stale `registry.yaml` /
  `AGENTS.md` listings once Lab 10 no longer teaches it as shipped).
- **Pace/duration re-derivation (known-drift item 12).** Deliberately not
  started in Phase 1: inventing new `pace_*_minutes` numbers without a
  corresponding content change to justify them would be guessing. The "one
  stated heuristic" will be defined against each cluster's actual rewritten
  content, starting in Phase 2.

### Baseline (Phase 0, for reference)

`npm test`, `make test-dotnet` and `make test-node` were run before any
edits. Two failures, both sandbox-caused (this sandbox has no network
egress to `api.github.com`, so `gh extension install github/gh-aw` 403s):
`tests/workflows/weekly-audit-dry-run.test.ts` and
`tests/workflows/weekly-audit-schema.test.ts`. Both still fail identically
after the Phase 1 changes in this document — confirmed unrelated.
`make test-dotnet` (60/60) and `make test-node` (36/36) passed clean.

## Status and next step

`status: draft`. Phase 2 (beginner track) appends its own section below
this one rather than replacing it.
