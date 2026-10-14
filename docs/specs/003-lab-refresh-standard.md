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

Each phase appends its own dated section below rather than editing an
earlier phase's.

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

## Phase 2 — Beginner track

### What "VS Code Copilot" actually covers (verified 2026-10-14)

An explore-agent audit of `setup.md`, `lab01`–`lab05`, `lab07` and their
dotnet/node appendices found the required path in all six numbered labs
assumes the **standalone Copilot CLI** throughout (interactive `copilot`
REPL, `copilot --agent ... --prompt ...`, `copilot plugin ...`), not VS
Code. Before rewriting, verified primary sources on what VS Code's own
Copilot agent mode actually supports, since "no terminal command" is not
the bar — "no dependency on the separate CLI product" is:

| Mechanism | VS Code support | Source |
|---|---|---|
| Custom agents (`.github/agents/*.agent.md`) | ✓ — same file format as CLI/github.com; invoked via an **agent dropdown** in the Chat view, not a `--agent` flag | `docs.github.com/en/copilot/reference/custom-agents-configuration` ("configure... in GitHub.com, the Copilot CLI, and supported IDEs"); `.../reference/customization-cheat-sheet` ("select from the agent dropdown in your IDE, on GitHub, or in Copilot CLI") |
| Agent skills (`.github/skills/*/SKILL.md`) | ✓ — "work with ... agent mode in Visual Studio Code"; auto-activated, no CLI-specific invocation | `docs.github.com/en/copilot/concepts/agents/about-agent-skills` |
| Subagents (delegating to a sub-agent mid-session) | ✓ | `.../reference/copilot-feature-matrix` IDE table: Subagents = ✓ for VS Code (✗ for GitHub.com, ✓ for CLI) |
| MCP servers | ✓ — but a **different config path** than the CLI: project-level is `.vscode/mcp.json`, not `~/.copilot/mcp-config.json` / `.copilot/mcp-config.json` | `.../how-tos/copilot-in-your-ide/.../extend-copilot-chat-with-mcp` ("create a `.vscode/mcp.json` file in the root of your repository") |
| Prompt files (`.github/prompts/*.prompt.md`) | ✓ VS Code only — **not** Copilot CLI (lab04 already states this correctly) | `.../reference/copilot-feature-matrix`; `.../tutorials/customization-library/prompt-files/your-first-prompt-file` |
| Hooks | Unsupported-to-preview, not a solid beginner-tier foundation | `.../concepts/agents/about-hooks` lists only "Copilot cloud agent on GitHub" and "GitHub Copilot CLI" (no VS Code); `.../reference/customization-cheat-sheet`'s IDE table separately marks VS Code `P` (preview). Both sources agree VS Code hooks support is, at best, not GA — consistent with Lab 06 staying Advanced · CLI (Phase 1) |
| Plugins / marketplace (`copilot plugin ...`) | No entry in either IDE-support table | Absent from both `customization-cheat-sheet` and `copilot-feature-matrix` — treated as Copilot-CLI-specific, no VS Code equivalent exists to teach as a beginner-tier required step |

**Refinement to the Phase 1 "`memory` MCP server" note:** checking
`.vscode/mcp.json` (not just `.copilot/mcp-config.json`) shows the real
state is more precise than "this repo removed its memory server" — the
**CLI** config (`.copilot/mcp-config.json`) dropped `memory`, but the
**VS Code** config (`.vscode/mcp.json`) still ships it. Phase 3 (Lab 10)
must describe this surface-specific split accurately rather than repeating
the issue text's blanket "removed" framing verbatim.

### Rewrite approach

For each required step that only *inspects* a repo file (`cat`, `ls`,
`head` equivalents), the VS Code-compliant version asks Copilot Chat in
Agent mode to show the file, rather than instructing the learner to open a
terminal. For steps that *invoke* the standalone CLI product specifically
(`copilot`, `copilot --agent`, `copilot plugin ...`), the fix is either (a)
a direct VS Code equivalent per the table above (agent dropdown, prompt
file picker, automatic skill loading), or (b) — only for plugins/marketplace,
which have no VS Code equivalent — moving the step into an
**Advanced (optional): Copilot CLI** callout. Bash/PowerShell terminal
blocks are kept only where a lab's *appendix* step genuinely creates a
file no editor affordance in the lab covers (e.g. heredoc file creation),
since creating a file is surface-agnostic groundwork, not a CLI-only act;
VS Code users can create the same file through the editor instead, which
the lab now says explicitly.

### Execution log — per-lab changes and two load-bearing bug fixes

Beyond surface rephrasing, two edits were **factual-accuracy fixes**, not
just VS Code-preference changes:

1. **`labs/lab03.md` §3.3** — the lab's primary flow added MCP access to a
   custom agent via `mcp-servers: ["context7"]` in the agent's YAML
   frontmatter. The property table at
   `docs.github.com/en/copilot/reference/custom-agents-configuration`
   states `mcp-servers` is "Not used in VS Code and other IDE custom
   agents" — it is cloud-agent/CLI-only. This was wrong for a
   VS-Code-primary lab regardless of the Phase 2 rewrite; the lab now
   leads with VS Code's **"Configure Tools..."** button (adds tool names
   like `context7/*` to the agent's `tools:` list) and keeps
   `mcp-servers:` as an explicitly-labeled cloud/CLI-only alternative.
2. **`labs/lab05.md` §5.1** — the lab claimed the repo "ships with 6 MCP
   servers," matching `docs/_meta/registry.yaml`'s `mcp_servers:` list.
   Neither actual config file has all 6: `.vscode/mcp.json` and
   `.copilot/mcp-config.json` both omit `fabric`, which `labs/lab12.md`
   confirms is deliberately added later as Lab 12's own exercise. Fixed to
   say 5 (the Labs 1–11 baseline) and added the config schema difference
   (`.vscode/mcp.json` uses `servers`/`stdio`; `.copilot/mcp-config.json`
   uses `mcpServers`/`local`) as an explicit teaching point. The stale
   solution file `solutions/lab05-mcp-config/.mcp.json` (old schema) was
   replaced with `solutions/lab05-mcp-config/mcp.json` (correct schema).

Per-lab summary:

| Lab | Change |
|---|---|
| `setup.md` | Already compliant (redirect stub to README); no edit |
| `lab01.md` | Moved CLI marketplace/plugin content to new "Advanced (optional)" section; `1.1`/`1.4` reframed for Chat + agent picker |
| `lab02.md` | Restart callout reordered VS Code-first; CLI-specific wording genericized |
| `lab03.md` | `mcp-servers:` cloud/CLI-only bug fixed (see above); restart order; agent-picker testing flow |
| `lab04.md` | Removed CLI REPL step from skill-activation test |
| `lab05.md` | "6 servers" bug fixed to 5 (see above); CLI-currency content moved to Advanced section; `.vscode/mcp.json` made primary |
| `lab07.md` | Stale `claude-opus-4.6` cost-budget mention fixed to `claude-opus-5` (registry `models.premium`); CLI-currency table moved to Advanced section; §7.4 delegation test reframed to the VS Code agent picker |
| Appendices (`dotnet`/`node` lab03) | Already compliant, no edit |
| Appendices (`dotnet`/`node` lab04) | Already compliant (explicitly notes prompt files are IDE-only), no edit |
| Appendices (`dotnet`/`node` lab05) | Genericized "inside Copilot CLI" phrasing; fixed incorrect `@context7` agent-mention syntax (MCP servers are tools Copilot calls, not `@`-invocable chat participants) |

The `claude-opus-4.6`/lab07.md entry was removed from
`tests/content-currency/model-ids-in-registry.test.ts`'s `KNOWN_MODEL_DRIFT`
allow-list since it is now fixed; the `lab10.md` entries remain for Phase 3.

Full targeted suite (`tests/content-currency`, `tests/lab-structure`,
`tests/meta`) and the full `npx vitest run` both pass after these changes,
modulo the same 2 pre-existing sandbox-network failures from the Phase 0
baseline (`gh aw compile` blocked by a 403 on the GitHub releases API,
unrelated to lab content).

## Phase 3 — Lab 10 rebuild

Lab 10 is rebuilt against [`004-memory-lab.md`](004-memory-lab.md)'s spec
(the issue's own embedded Lab 10 section, carried verbatim). This phase
touches only `labs/lab10.md` and its directly-coupled files — not the
retire-and-merge map (Phase 4) or the appendices (Phase 5).

### Load-bearing bug fixes (beyond VS Code-preference rephrasing)

1. **Prompt-file slash commands reframed as VS Code-only, everywhere in
   the lab.** Known-drift item 5 (issue #3) and
   [`001-research-sota.md`](001-research-sota.md) claim 3 both establish
   that `.prompt.md` files are a VS Code/Visual Studio/JetBrains surface
   with no Copilot CLI slash-command equivalent. The pre-rewrite lab told
   learners to type `/consolidate-lessons`, `/checkpoint`, and
   `/handoff_prompt` "in the Copilot prompt" — ambiguous wording that an
   attendee on Copilot CLI could easily misread as "the CLI's interactive
   prompt." Worse, §10.4d's "Autopilot" subsection showed
   `copilot --prompt '/consolidate-lessons --scope both' --allow-all-tools`
   as a working example — a **direct violation** of the known-drift rule,
   since the CLI has no slash command for a user-authored prompt file and
   that command does not do what it appears to do. Every instance across
   §10.1, §10.4a/b/d, and §10.5/10.5a now explicitly says "VS Code's
   Copilot Chat," and §10.4d now states plainly that scheduled/unattended
   consolidation via the CLI isn't supported today, with "run it
   interactively in VS Code" and "convert the prompt into a skill first"
   (skills *are* CLI-invocable) as the two honest alternatives — matching
   the known-drift note's own suggested fixes.
2. **Stale slash-command name `/handoff_prompt`.** The prompt file is
   `.github/prompts/handoff.prompt.md`; VS Code invokes prompt files by
   filename-minus-extension, so the command is `/handoff`, not
   `/handoff_prompt`. This stale name also appeared in
   `solutions/lab10-session-management/README.md` and `sample-handoff.md`
   (the lab's own referenced reference-implementation) and was fixed in
   all three files for consistency. (`docs/_meta/accuracy-ledger-exclusions.md`
   excludes these same files from an earlier, unrelated, already-completed
   automated sweep dated 2026-04-24 — that exclusion does not apply to
   this issue's explicitly-scoped Lab 10 rebuild.)
3. **Duplicate section number.** The new CLI-only "Advanced" subsection
   was first added as `### 10.1 Advanced`, colliding with the existing
   `## 10.1 Layer 1` heading. Renumbered to `### 10.1a` (matching the
   `10.2a`–`10.2e` / `10.3a`–`10.3c` lettered-subsection convention already
   in use), and the one internal link to it was fixed to match.
4. **Stale anchor in `docs/memory-decision-tree.md`.** Pointed at a
   "Lab 10 §10.0" that no longer exists post-rewrite; replaced with a link
   to the actual reindex source cited in Lab 10's own references list.

### Content additions (per `004-memory-lab.md` "Must cover")

- **`AGENTS.md` conventions** — new `### 10.3a` (root vs. nested,
  nearest-wins, `CLAUDE.md`/`GEMINI.md` alternatives), explicitly linking
  back to Lab 02 for precedence mechanics rather than re-teaching them.
  Hands-on: add a nested `dotnet/AGENTS.md`, observe nearest-wins, clean up.
- **Loop engineering, practiced not just named** — new hands-on (c) in
  `§10.5a`: a bounded, one-iteration read→plan→act→verify→record exercise
  with an explicit stop condition, ending in a real `log.md` entry.
- **Graph engineering, practiced not just named** — new `### 10.2e`
  (hub notes, typed links `relates-to`/`supersedes`/`contradicts`,
  backlinks-by-convention, per-directory vaults), kept distinct from the
  existing `§10.2d` "road not taken" (the knowledge-graph MCP server this
  repo deliberately doesn't use for memory). `.github/instructions/lessons.instructions.md`
  gained an additive "Optional typed links" subsection documenting the
  three new front-matter keys, consistent with the issue's "Keep: the
  schema" instruction.
- **Per-directory vault worked example** — `labs/fixtures/lab10/scns-vault/`
  (README + two module directories, each with its own `.copilot/lessons/`).
  The issue names "the local SCNS project" as a possible worked example;
  that project's own folder tree is still an unfilled placeholder in this
  repo, so a generic, repo-owned fixture was built instead of forcing a
  reference to content that doesn't exist yet.

### Verification

- Spec 001 claim 11 (MCP 2026-07-28 session-removal) flipped
  `UNVERIFIED` → `VERIFIED`: `modelcontextprotocol.io` is DNS-blocked in
  this sandbox, but its source repo
  (`raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol`)
  mirrors the same changelog verbatim and is reachable — a primary-source
  substitute, not a search-engine summary. Claims 9 and 16 remain out of
  Phase 3 scope.
- `docs/_meta/registry.yaml` and `docs/token-and-model-guide.md` both had
  the pre-rewrite Lab 10 title ("Session & Memory Management"); fixed to
  match the title this lab has actually carried since the last rewrite
  ("Agent Memory: Personalities, Lessons, and Consolidation").
- The model-tier cost-budget block no longer names specific model IDs —
  it cites `models.cheap|standard|premium` and links
  `docs/_meta/registry.yaml`, matching known-drift item 11 and the
  `lab07.md` precedent from Phase 2. The two now-stale `lab10.md` entries
  (`claude-opus-4.6`, `claude-opus-4.7`) were removed from
  `tests/content-currency/model-ids-in-registry.test.ts`'s
  `KNOWN_MODEL_DRIFT` allow-list.
- Pace bumped (presenter 5→6 min, self-paced 25→35 min) to reflect the
  added hands-on content; synced across the lab's frontmatter, its `⏱️`
  callout, and `docs/_meta/registry.yaml`. `pace_workshop_minutes` (7)
  was left unchanged — `tests/workshop/time-budget.test.ts` only requires
  `pace_workshop_minutes >= pace_presenter_minutes` (7 ≥ 6 still holds)
  and does not couple individual lab pace fields to
  `workshop/curriculum.md`'s module-level minutes, so the workshop
  deck (out of Phase 3 scope, and listed in the pre-existing, unrelated
  `accuracy-ledger-exclusions.md`) did not need a change.

### Test results

Targeted: `tests/content-currency/model-ids-in-registry.test.ts`,
`tests/workshop/time-budget.test.ts`, `tests/memory/*`,
`tests/lab-structure/*` all pass. Full `npx vitest run` pass recorded in
the Phase 3 `report_progress` commit, modulo the same 2 pre-existing
sandbox-network failures noted in Phase 0/2 (unrelated to lab content).

## Phase 4 — GitHub platform cluster (08, 09, 18, 19, `lab-gh-extensions`)

Per the Phase 1 merge map, this cluster is **keep-all** — no lab merges.
This phase (a) renames the renamed Copilot product across the cluster,
(b) fixes two real, previously-undiscovered reference bugs found during
verification, and (c) adds the disambiguation callouts the merge map
deferred here.

### Decisions

1. **"Copilot Coding Agent" → "Copilot Cloud Agent."** Fetched
   `https://docs.github.com/en/copilot/concepts/agents/code-review` and
   corroborating pages directly (2026-10-14) and confirmed GitHub renamed
   the product; Lab 09 is the cluster's only lab that names it as a
   proper noun throughout. Renamed case-preserving ("Coding Agent" →
   "Cloud Agent", "Coding agent" → "Cloud agent", "coding agent" →
   "cloud agent") across `labs/lab09.md`'s title, heading, and body (34
   occurrences), plus the one stale mention each in `labs/lab10.md`'s
   recap bullet, `README.md` (capability table, progress checklist,
   concept glossary, lab table — 4 occurrences), `workshop/curriculum.md`,
   `workshop/site/agenda.json`, and `workshop/site/hackathon.html`'s nav
   list. `docs/_meta/registry.yaml`'s `labs.lab09.title` synced to match.
   `docs/specs/001-research-sota.md` (a dated research record of the drift
   itself) and the deeper narrative prose in `docs/workshop/presenter-script.md`
   are intentionally left for the later workshop-asset-reconciliation phase
   (item 6 of the epic's Approach list) — the
   latter already uses correct "(formerly Copilot coding agent)"
   historical framing in most places, so it isn't actively wrong, just
   out of this phase's narrow title-sync scope.
2. **gh-aw docs domain bug: `github.github.io` → `github.github.com`.**
   Previously undiscovered. Fetched `github/gh-aw`'s own README via
   `raw.githubusercontent.com` and confirmed the canonical docs domain is
   `.com`, not `.io` (`.io` is also DNS-blocked in this sandbox, which is
   itself informative but secondary — `.com` is simply the correct
   domain). Fixed 5 occurrences in `labs/lab08.md` and 1 each in
   `workshop/slides/40-module-4.md` and
   `workshop/speaker-scripts/module-04-gh-aw.md`. Confirmed via
   `github-mcp-server-get_file_contents` against `github/gh-aw`'s
   `docs/src/content/docs/reference/` directory that every specific
   sub-path already cited (`frontmatter`, `workflow-structure`, `auth`,
   `safe-outputs`, `engines`, `faq`) genuinely exists, so only the domain
   needed fixing, not the paths.
3. **Dead URL `docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent`.**
   404s. Replaced with three live, directly-fetched URLs used for
   different purposes (see Verification ledger): the "About" replacement
   in `labs/lab09.md` and `labs/lab18.md`'s References sections, a
   narrower enablement/policy page added as a second `lab09.md`
   reference, and an access-governance page used for `lab09.md`'s inline
   firewall-rules callout.
4. **Disambiguation callouts added (deferred here by the Phase 1 merge
   map).** `labs/lab-gh-extensions.md`'s existing §6 "Accuracy sidebar"
   table already structurally satisfied this requirement but carried two
   stale facts — fixed, not rewritten (see Decision 5). Added a short,
   one-line pointer in `labs/lab08.md` clarifying that `gh-aw`, although
   installed via `gh extension install`, is a different product from the
   `gh extension create` this cluster's sibling lab teaches, cross-linking
   to `lab-gh-extensions.md`'s sidebar for the fuller comparison.
   `labs/lab18.md` and `labs/lab19.md` needed no equivalent addition —
   both already read cleanly downstream of Lab 08's anchor framing.
5. **`githubnext/gh-aw` → `github/gh-aw` (the org move itself).** Grepped
   the full repo: every file except `labs/lab-gh-extensions.md` (table
   + References, 2 occurrences) and `workshop/slides/55-module-5b-gh-extensions.md`
   (mirrored table, 1 occurrence) already used the correct `github/gh-aw`
   org. Fixed both, and corrected the attached claim in
   `lab-gh-extensions.md`'s sidebar that gh-aw has "no canonical
   `docs.github.com` page" — true as stated (it still isn't on that
   domain) but written in a way that read as "no docs exist at all,"
   which is now false given Decision 2's domain. Reworded to state
   precisely: docs exist, just on `github.github.com/gh-aw/`, not
   `docs.github.com`. Also added `gh_aw_schema_version` registry-pin
   guidance (`gh extension install github/gh-aw --pin v<version>`,
   matching the exact syntax already documented in
   `docs/_meta/registry.yaml`) to `lab-gh-extensions.md`'s References,
   since that lab's sidebar is the only place in the cluster that
   mentions installing `gh-aw` without pointing at the registry pin.

### Verification ledger

| Claim | Primary source fetched | Status |
|---|---|---|
| `githubnext/gh-aw` → `github/gh-aw` org move | `https://github.com/githubnext/gh-aw` returns HTTP 301 → `https://github.com/github/gh-aw` (fetched directly) | VERIFIED |
| gh-aw canonical docs domain is `github.github.com`, not `.io` | `github/gh-aw` README fetched via `raw.githubusercontent.com` | VERIFIED |
| `/reference/{frontmatter,workflow-structure,auth,safe-outputs,engines,faq}` sub-paths exist | `github-mcp-server-get_file_contents` directory listing of `github/gh-aw`'s `docs/src/content/docs/reference/` | VERIFIED |
| `using-copilot-coding-agent` URL is dead | direct fetch, 404 | VERIFIED |
| `copilot-surfaces/copilot-on-github` is the real redirect target of the old coding-agent "about" URL | direct fetch of `.../concepts/agents/coding-agent/about-coding-agent`, observed redirect | VERIFIED |
| Code Review: Azure DevOps support is public preview | direct fetch, `https://docs.github.com/en/copilot/concepts/agents/code-review` | VERIFIED |
| Code Review: unlicensed-member access needs both "AI credits paid usage" and "Allow members without a Copilot license to use Copilot code review in GitHub.com" policies, enterprise-set values become read-only at org level | same page, paginated fetch | VERIFIED |
| Code Review effort costs: Lite $0.05–$1, Balanced $0.25–$5 (AI credits) | same page | VERIFIED |
| Code Review can hand a suggestion to Copilot Cloud Agent to open a follow-up PR (public preview) | same page | VERIFIED |

### Test results

Targeted: `tests/content-currency/*`, `tests/workshop/time-budget.test.ts`,
`tests/meta/enumeration-parity.test.ts`, `tests/lab-structure/*` — 307
tests pass. Full `npx vitest run` — 564 of 566 pass; the 2 failures
(`tests/workflows/weekly-audit-dry-run.test.ts`,
`tests/workflows/weekly-audit-schema.test.ts`) reproduce identically on
the pre-Phase-4 baseline (`git stash` + re-run) — a sandbox-network 403
installing the `gh aw` CLI extension, unrelated to this phase's content.
`runtime-tools-secret_scanning` clean on all 13 changed files.

## Phase 5 — Extensibility & enterprise cluster (11, 16, 17, 20, `lab-copilot-cli-extensions`)

Per the Phase 1 merge map, both sub-clusters here are **keep-all**: 11 ↔ 16
↔ `lab-copilot-cli-extensions` (distinct personas — author a plugin vs.
admin governs the marketplace vs. author a CLI extension) and 16 ↔ 17 ↔ 20
(distinct admin mechanisms, each backed by its own registry key). This
phase (a) resolves the plugin-manifest-format drift the issue names
explicitly, (b) fixes real bugs found during verification, and (c) adds
the cross-links the merge map deferred here.

### Decisions

1. **Plugin manifest format drift (issue "Known drift" item 9) — labeled
   illustrative, not migrated.** Fetched
   `https://docs.github.com/en/copilot/concepts/agents/about-plugins` and
   the CLI plugin reference directly. Confirmed two current formats exist,
   **both** named `plugin.json` (never `manifest.yaml`): Agent Plugins 1.0
   (requires `$schema`; only `name` + metadata are top-level; Copilot
   components live under `com.github.copilot/`) and Legacy (no `$schema`;
   flat optional fields `agents`/`skills`/`commands`/`hooks`/`mcpServers`/
   `lspServers`, `hooks` being a path to a hooks config file or inline
   object, not a raw script list). This repo's `plugin-template/manifest.yaml`
   and `modernization-bundle/manifest.yaml` match neither — wrong
   filename/extension, no `$schema`, `mcp_servers:` (snake_case) instead of
   `mcpServers`, a nested `entrypoints:` wrapper neither format has, and an
   invented `minimum_cli_version` field. Spec 001 flagged this as "needs a
   maintainer decision, not a unilateral fix" and the issue itself offers
   two options: migrate the manifest format for real, or label it
   illustrative and show the real shape. **Chose the label option**: a full
   migration would rename the manifest file, flatten `entrypoints:` away,
   remap `prompts:` (no home in either real schema — closest real analogue
   is `commands`), and rewrite `install.mjs`/`policy.mjs`/all 4
   `tests/plugin-template/*` suites plus `modernization-bundle/`'s copy —
   exactly the scale of change spec 001 said needed maintainer sign-off,
   not an AI unilateral call, and out of proportion to a lab-content
   refresh. Added a callout in `labs/lab11.md` §11.1 labeling
   `manifest.yaml` as this lab's own illustrative schema and showing both
   real formats' field names side-by-side, so a learner packaging a real
   plugin doesn't copy the wrong shape. `plugin-template/manifest.yaml`,
   `modernization-bundle/manifest.yaml`, `install.mjs`, `policy.mjs`, and
   the plugin-template test suites are unchanged.
2. **`copilot plugin install --ref v0.1.0` — confirmed-nonexistent flag,
   fixed.** `labs/lab11.md` §11.3 used a `--ref` flag on
   `copilot plugin install` to pin a release tag. The CLI plugin
   reference's "Plugin specification for `install` command" table lists
   only 5 forms (`plugin@marketplace`, `OWNER/REPO`, `OWNER/REPO:PATH`, a
   Git URL, a local path) and `install`'s options table lists only the
   deprecated `--config-dir` — no ref/tag flag exists for a direct install.
   `copilot plugin marketplace add SOURCE` **does** document a
   `owner/repo#ref` form. Rewrote the example to register the org repo as
   a pinned marketplace (`copilot plugin marketplace add
   contoso-internal/contoso-copilot-plugins#v0.1.0`) then install the
   named plugin from it — consistent with Lab 16's own
   `extraKnownMarketplaces` + `enabledPlugins` pattern for the same repo.
3. **`agent_session.task` — confirmed-nonexistent field, fixed in two
   labs.** `labs/lab17.md` §17.3 and `labs/lab20.md` §20.2 both claimed an
   `agent_session.task` field with "lifecycle events (session start/end,
   task completion)". Fetched
   `https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/agentic-audit-log-events`
   directly: the real schema has exactly four key fields —`action`,
   `actor_is_agent`, `agent_session_id` (an identifier, not a lifecycle
   event stream), and `user`. No `agent_session.task` field, and no
   documented "lifecycle events" concept. Corrected both labs to describe
   the real four fields and added the reference URL to Lab 17.
4. **"Coding-agent" → "Cloud-agent" in Lab 17.** Same product rename from
   Phase 4, found recurring in a lab outside that phase's cluster (Lab 17
   wasn't in Phase 4's list). Fixed the 3 descriptive-prose occurrences in
   `labs/lab17.md` (§17.1 nav bullet, §17.3 audit-event bullet, §17.3
   discuss/answer) — these are prose labels, not literal frozen API/event
   names, so the rename applies cleanly.
5. **`lab-hardening.md` no longer "upcoming."** `labs/lab-copilot-cli-extensions.md`
   §6 and its solution `README.md`'s forward-link both called
   `labs/lab-hardening.md` "the upcoming ... lab (Workstream B of the
   materials-gap branch)" — but the file already exists, fully written,
   with its own dotnet/node appendices and solution scaffold. Reworded
   both to a plain cross-link; the internal "Workstream B"/"materials-gap
   branch" jargon added nothing a reader could act on.
6. **Cross-links added (deferred here by the Phase 1 merge map).** Lab 16
   already linked to/from Lab 11 and Lab 17; Lab 20 already linked to Lab
   16 and Lab 17. The real gap was **Lab 17 had zero links back** to any
   cluster sibling, and the 11 ↔ `lab-copilot-cli-extensions` pair (a
   plugin's `extensions` field can bundle a Copilot CLI extension) had no
   link either direction. Added: Lab 17's References block now links Lab
   16 and Lab 20, plus inline links on its two prose mentions of Lab 16;
   Lab 11's References block links `lab-copilot-cli-extensions.md`;
   `lab-copilot-cli-extensions.md`'s References block links Lab 11 and Lab
   16. The `03 ↔ 06 ↔ lab-hardening` cross-link gap noted in the Phase 1
   merge map is explicitly tracked for Phase 6 (advanced CLI cluster) and
   is out of this phase's scope.
7. **Known-drift items 3 (`infer:`) and 8 (MCP syntax) — scanned, clean.**
   Grepped all five cluster files for `infer:`, SSE, and MCP config-path
   mentions; none found, no action needed.

### Verification ledger

| Claim | Primary source fetched | Status |
|---|---|---|
| Two current plugin manifest formats, both named `plugin.json`; Agent Plugins 1.0 requires `$schema`, Legacy doesn't | `https://docs.github.com/en/copilot/concepts/agents/about-plugins` (fetched directly, field tables read) | VERIFIED |
| Legacy format's `hooks` field is a path to a hooks config file or inline object, not a raw script list; `mcpServers` is camelCase | same page | VERIFIED |
| `copilot plugin install` has no ref/tag/version-pin flag or specification suffix | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference` (fetched directly, 3 passes) — "Plugin specification for `install` command" and "`copilot plugin install` options" tables | VERIFIED |
| `copilot plugin marketplace add SOURCE` accepts `owner/repo#ref` | same page — `marketplace` subcommand table: "`add SOURCE` ... (`owner/repo`, `owner/repo#ref`, a URL, or a local path)" | VERIFIED |
| Agentic audit-log events carry exactly `action`, `actor_is_agent`, `agent_session_id`, `user` — no `agent_session.task` field | `https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/agentic-audit-log-events` (fetched directly) | VERIFIED |
| Enterprise audit log excludes local CLI/IDE conversation content; 180-day retention; SIEM streaming | `https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs` (fetched directly) | VERIFIED |
| `enterprise_managed_settings` registry block (keys, precedence, GA date) matches the published schema reference | partial direct fetch of `https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/enterprise-managed-settings` — spot-checked `permissions.disableBypassPermissionsMode`/`.deny`/`.ask` rows, no discrepancy found in the portion checked | SPOT-CHECKED, no discrepancy |
| `labs/lab-hardening.md` already exists (not "upcoming") | direct repo read: `labs/lab-hardening.md`, its dotnet/node appendices, and `solutions/lab-hardening/` all present and populated | VERIFIED |

### Test results

Targeted: `tests/lab-structure/*`, `tests/content-currency/*`,
`tests/plugin-template/*` — 242 tests pass (plugin-template suites
confirm `manifest.yaml`/`install.mjs`/`policy.mjs` are unchanged and still
green, since Decision 1 chose not to touch them). Full `npx vitest run` —
564 of 566 pass; the same 2 pre-existing sandbox-network failures from
Phases 0/2/4 (`tests/workflows/weekly-audit-dry-run.test.ts`,
`tests/workflows/weekly-audit-schema.test.ts`, HTTP 403 installing the
`gh aw` CLI extension) reproduce, unrelated to this phase's content.
`runtime-tools-secret_scanning` clean on all 5 changed files.

## Phase 6 — Advanced CLI cluster (06, 12, 13, 14, 15, `lab-hardening`)

Per the Phase 1 merge map, this cluster is **keep-all** — no lab merges. This
phase (a) fixes a hook-semantics factual reversal carried over from an
interrupted prior work-in-progress, (b) fixes two confirmed-nonexistent
model IDs, (c) corrects a significant terminology/mechanism error in Lab 13's
A2A/ACP framing, (d) fixes a false-negative CLI-surface claim in the shared
currency partial (11 labs), and (e) fixes several smaller factual/path bugs
found during a full-file read of the cluster.

### Decisions

1. **Hook `permissionDecision` three-way-switch correction (inherited,
   verified).** An interrupted prior session left an uncommitted change
   (later committed as `5c7e686`) reversing a factual error: `preToolUse`'s
   `permissionDecision` is a genuine three-way switch (`allow`/`deny`/`ask`),
   not deny-only — only this repo's own hardening posture chooses to emit
   `deny`-or-silent by convention. Verified directly against
   `https://docs.github.com/en/copilot/reference/hooks-reference` before
   building on it. Touched `docs/copilot-config-reference.md`,
   `labs/lab06.md`, `labs/lab03.md`, `labs/lab-hardening.md`,
   `labs/lab-copilot-cli-extensions.md`, and their paired solutions/workshop
   files. Also fixed one remaining stale hooks-reference URL in
   `solutions/lab-copilot-cli-extensions/.github/hooks/userpromptsubmitted-auto-summarize.json`
   found while verifying the carried-over change.
2. **`claude-opus-4.6` / `claude-opus-4.7` — confirmed-nonexistent model
   IDs, fixed (4 + N occurrences).** Neither ID appears in
   `docs/_meta/registry.yaml`'s `models` block. Replaced with
   `claude-opus-5` (registry `models.premium`) in `labs/lab13.md` and
   `labs/lab14.md`, and removed the now-stale `KNOWN_MODEL_DRIFT` allow-list
   entries from `tests/content-currency/model-ids-in-registry.test.ts`
   (now empty — the test's own doc-comment requires entries to name the
   phase that fixes them, and this is that phase).
3. **`claude-sonnet-4.5` — confirmed-nonexistent model ID, fixed in a
   solution file the content-currency test doesn't scan.** The model-ID
   test only walks `labs/`; `solutions/lab-hardening/tight-reviewer.agent.md`
   pinned `model: claude-sonnet-4.5` (2 occurrences, frontmatter + prose)
   un-caught by that test. `docs/token-and-model-guide.md` independently
   documents `claude-sonnet-4.5` as "previous Sonnet generation; pin to it
   if a workflow regressed on 4.6" — not a registry-tier model and not an
   appropriate default for a new reference solution. Replaced with
   `claude-sonnet-4.6` (registry `models.standard`, "current Sonnet
   default" per the same guide), matching the guide's own "normal coding,
   you want predictability" recommendation that fits this read-only
   reviewer's reproducibility requirement.
4. **Lab 13's core ACP premise was wrong — rewritten.** The lab defined
   "ACP (Agent Communication Protocol)" as the wire-level contract that
   Copilot CLI's `task`/`write_agent`/`read_agent` map onto, and its "live"
   path told readers to spawn a peer with `COPILOT_AGENT_NAME=critic copilot
   --agent rubber-duck --available-tools='...' --acp` then "register peer...
   exchange ACP commands." Fetched
   `https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server`
   directly: **ACP = "Agent Client Protocol"**, a real `--acp` flag (public
   preview) that turns one `copilot` process into a server an *external
   programmatic client* (IDE, custom frontend via the ACP TypeScript SDK)
   drives over stdio/TCP — a client↔agent protocol, not a peer↔peer one
   between two interactive `copilot` sessions. There is no CLI subcommand
   for "registering a peer" or exchanging "ACP commands." Cross-checked
   against Lab 14's real tmux + hand-off-file mechanism (confirmed via grep,
   no `--acp` dependency) to confirm what the corrected "live path" should
   describe instead. Rewrote, in `labs/lab13.md`: the intro paragraph; the
   §13.0 concept table (ACP row now states the real client↔agent mechanism
   and explicitly disclaims the peer↔peer framing); the "Trust boundaries,
   restated" callout ("spawn a peer over ACP" → "spawn a peer as its own
   process"); the Prerequisites `--acp`-flag quick-check (→ `--agent`-flag
   check, with the CLI-version-floor requirement reframed as general
   currency hygiene, not an ACP gate); §A.3 (renamed "Drive the flow on the
   live ACP path" → "...live multi-process path"; replaced the fictional
   flags/subcommands with real `--agent`/`--available-tools` plus manual
   relay through the §B.2 hand-off file, foreshadowing Lab 14's tmux
   automation of the same mechanism); and §A.4 (transcript inspection now
   splits concept-path `list_agents()`/`read_agent()` from live-path
   `/share file` per-pane export). Also fixed a second, smaller error in the
   same area: a callout claimed "the orchestrator agent in `AGENTS.md`
   already enforces this gate when you use the `/orchestrate` command" —
   confirmed via direct fetch of
   `https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands`
   that `/orchestrate` is a GitHub Copilot **app** (desktop) slash command,
   not a CLI command, and confirmed no `.github/agents/orchestrator.agent.md`
   exists in this repo; reworded the callout to state plainly that nothing
   in the repo enforces this automatically.
5. **`docs/_partials/currency.md`'s `/extensions manage` claim was
   backwards — fixed and re-synced to 11 labs.** The partial said
   `/extensions manage` / `/extensions mode` "are **not** [real]." Extensive
   direct-fetch verification of
   `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference`
   (paginated, ~10 chunks) confirmed `/extensions [manage|mode]` **is**
   real, gated behind `/experimental on`. Fixed the partial's text, then
   synced the corrected wording into all 11 including labs (`lab06`,
   `lab08`, `lab09`, `lab10`, `lab11`, `lab12`, `lab13`, `lab15`,
   `lab-copilot-cli-extensions`, `lab-gh-extensions`, `lab-hardening`) —
   manually restoring `lab15.md`'s deliberate self-link-avoidance wording in
   the LSP row afterward, since a blind sync would have clobbered it.
6. **Lab 14 path/count bugs, found during a full-file read.** (a) The
   "meta callout" claimed hand-off contracts live at
   `.orchestrator/session.md`; `scripts/orchestrator/handoff.sh`'s actual
   default output directory is `.copilot/orchestrator-handoffs/` (verified
   by reading the script) — fixed. (b) "Save the plan to
   `.copilot/session-state/<id>/plan.md`" was missing the `~/` prefix;
   cross-checked against `labs/lab10.md`, `docs/memory-decision-tree.md`,
   and `labs/lab-copilot-cli-extensions.md`, all of which confirm this is a
   **per-user home-directory** path (`~/.copilot/session-state/<id>/...`),
   not repo-relative — fixed, with a cross-link to Lab 10 §10.1a added. (c)
   The wrap-up checklist said "recognise the **four** stop-and-ask
   triggers" — §14.6 lists **five** — fixed.
7. **Lab 06 hook-inventory bugs, found during a full-file read.** The lab
   twice (§6.1 intro, Key Takeaways table) stated "the configuration
   defines hooks for" a 5-event list including `sessionStart` — read
   `.github/hooks/default.json` directly: it configures exactly 4 event
   types (`userPromptSubmitted`, `preToolUse`, `postToolUse`,
   `errorOccurred`); `sessionStart` is not configured anywhere in this
   repo's hook files. Reworded both to describe what's actually registered,
   pointing to the lab's own §6.2.1 (and the hooks-reference docs) for the
   complete event-type taxonomy rather than re-asserting a specific count —
   the real taxonomy is 8 events (confirmed via the same direct fetch:
   `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`,
   `postToolUse`, `agentStop`, `subagentStop`, `errorOccurred`), which the
   lab's own §6.2.1 already enumerates correctly — only the §6.1/Key-Takeaways
   framing was wrong. Also found the "Hooks in this repository" table
   listed a `typecheck` postToolUse hook as if active; its script exists at
   `scripts/hooks/post-tool-use-typecheck.{sh,ps1}` but is **not** wired
   into `default.json` — added a "Registered in `default.json`?" column
   disclosing this instead of silently implying it runs.
8. **Spec self-consistency: a stale forward phase-reference.** Phase 4's
   Decision 1 (written before this phase was scoped) deferred some
   workshop-prose cleanup to "Phase 6 (workshop asset reconciliation)" —
   but this document's own "Status and next step" section (written earlier
   still) already reserves Phase 6 for this advanced-CLI cluster. Reworded
   Phase 4's cross-reference to name the deferred target descriptively
   ("the later workshop-asset-reconciliation phase, item 6 of the epic's
   Approach list") instead of committing to a specific phase number that
   this phase would then contradict.
9. **Known-drift items scanned, clean; cross-link gap confirmed already
   closed.** Grepped the full cluster for `infer:` (one correctly-labeled
   "retired" mention, not a bug), MCP `"sse"` config (none), stale
   `githubnext/gh-aw` org (none), and stale "coding agent" naming (none).
   The `03 ↔ 06 ↔ lab-hardening` triangular cross-link gap Phase 5 deferred
   here was already fully satisfied in both directions on all three edges
   (via the Phase-5-era / carried-over hook-semantics commit) — no action
   needed.
10. **Out of scope, confirmed.** Stale `claude-opus-4.7` mentions in
    `workshop/slides/30-module-3.md` and
    `workshop/speaker-scripts/module-06-a2a-tmux.md` were found during the
    solutions/workshop model-ID sweep (item 2 above), but both files anchor
    to Lab 07 / the tmux-pattern narrative generally, not this cluster, and
    the model-ID content-currency test only scans `labs/` by design —
    workshop-asset model-ID drift is explicitly the later
    workshop-asset-reconciliation phase's job (see Decision 8). Left
    unchanged here to avoid scope creep into another phase's cluster.

### Verification ledger

| Claim | Primary source fetched | Status |
|---|---|---|
| `preToolUse`'s `permissionDecision` is a real three-way switch (`allow`/`deny`/`ask`) | `https://docs.github.com/en/copilot/reference/hooks-reference` (fetched directly, prior session) | VERIFIED |
| ACP = "Agent Client Protocol"; `--acp` is a client↔agent server flag, not a peer↔peer mechanism | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server` (fetched directly, this phase) | VERIFIED |
| `/orchestrate` is a GitHub Copilot app (desktop) slash command, absent from the CLI | `https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands` (fetched directly) | VERIFIED |
| No `.github/agents/orchestrator.agent.md` exists in this repo | direct repo read: only `agentic-workflows.agent.md`, `code-reviewer.agent.md`, `planner.agent.md` exist under `.github/agents/` | VERIFIED |
| `/extensions [manage\|mode]` is real, gated behind `/experimental on` | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference` (fetched directly, ~10 paginated chunks) | VERIFIED |
| `claude-opus-4.6`, `claude-opus-4.7`, `claude-sonnet-4.5` are not in `docs/_meta/registry.yaml`'s `models` block | direct read of `docs/_meta/registry.yaml` | VERIFIED |
| `claude-sonnet-4.5` is "previous Sonnet generation," not a current default | direct read of `docs/token-and-model-guide.md` | VERIFIED |
| `scripts/orchestrator/handoff.sh`'s default hand-off directory is `.copilot/orchestrator-handoffs/`, not `.orchestrator/session.md` | direct read of `scripts/orchestrator/handoff.sh` | VERIFIED |
| Copilot CLI session-state is per-user (`~/.copilot/session-state/<id>/`), not repo-relative | direct read of `labs/lab10.md`, `docs/memory-decision-tree.md`, `labs/lab-copilot-cli-extensions.md` (concordant) | VERIFIED |
| `.github/hooks/default.json` configures exactly 4 event types; `sessionStart` and `typecheck` are not wired in | direct read of `.github/hooks/default.json` and `scripts/hooks/` directory listing | VERIFIED |
| Full hook event taxonomy is 8 types (`sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `agentStop`, `subagentStop`, `errorOccurred`) | `https://docs.github.com/en/copilot/concepts/agents/hooks` (fetched directly, 2 paginated chunks) | VERIFIED |
| `docs.github.com/en/copilot/concepts/agents/copilot-cli/lsp-servers` content matches `labs/lab15.md` verbatim (table, benefits, framing) | fetched directly | VERIFIED |
| `03 ↔ 06 ↔ lab-hardening` cross-links already exist in all 3×2 directions | grep of all three files | VERIFIED |

### Test results

Targeted: `tests/content-currency/*` — 62 tests pass (26 in
`model-ids-in-registry.test.ts` alone, `KNOWN_MODEL_DRIFT` now empty).
Full `npx vitest run` — 564 of 566 pass; the same 2 pre-existing
sandbox-network failures from every prior phase
(`tests/workflows/weekly-audit-dry-run.test.ts`,
`tests/workflows/weekly-audit-schema.test.ts`, HTTP 403 installing the
`gh aw` CLI extension) reproduce, unrelated to this phase's content.
`runtime-tools-secret_scanning` clean on all 17 files changed in this
phase's final commit (the hook-semantics carry-over was committed
separately as `5c7e686` by the interrupted prior session).

## Status and next step

`status: draft`. Phases 1–6 are complete: 1 (standard and guardrails), 2
(beginner track), 3 (Lab 10 rebuild), 4 (GitHub platform cluster), 5
(extensibility & enterprise cluster), and 6 (advanced CLI cluster: 06, 12,
13, 14, 15, `lab-hardening`). Every in-scope lab's known-drift items
flagged in Phase 1's merge-map and tier/surface audit are now resolved.

**The epic's "retire-and-merge execution" item (Approach list item 4) is a
no-op.** Phase 1's merge map (§"Merge map" above) reviewed all seven overlap
clusters the issue names and concluded **no lab needs to retire or merge** —
every cluster keeps its members with explicit, now-cross-linked boundaries.
The `merged_into: labNN` stub mechanism this spec's Constraints section
defines is consequently unused; there is nothing to point it at. No further
phase should revisit this unless a future spec amendment identifies a new
overlap the original seven clusters didn't cover.

Remaining work, not yet started:

- **`AGENTS.md`'s own stale model pin** (known-drift item 16, logged in
  Phase 1): `claude-opus-4.6` at `AGENTS.md:86` is not GA and its
  "per `copilot-instructions.md`" cross-reference is dangling (that file
  never mentions a model). Every lab citing the old pin is now fixed
  (07 → Phase 2, 10 → Phase 3, 13/14 → Phase 6); only `AGENTS.md` itself
  remains, deliberately held back since it's a repo-wide operational
  policy file, not a lab.
- **Appendix reconciliation** (epic Approach item 5) — the dotnet and node
  appendices under `labs/appendices/` have not yet had a dedicated
  currency/accuracy pass in this spec's phase sequence.
- **Workshop asset reconciliation** (epic Approach item 6) — module map,
  timing plan, facilitator guide, plus the specific deferred items already
  logged against it: stale `claude-opus-4.7` in
  `workshop/slides/30-module-3.md` and
  `workshop/speaker-scripts/module-06-a2a-tmux.md` (Phase 6, Decision 10),
  and the Phase 4-era workshop-prose cleanup (Phase 4, Decision 1).
