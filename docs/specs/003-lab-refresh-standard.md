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
   are intentionally left for Phase 6 (workshop asset reconciliation) — the
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

## Status and next step

`status: draft`. Phases 2 (beginner track), 3 (Lab 10 rebuild), and 4
(GitHub platform cluster) are complete. Phase 5 (appendix reconciliation)
appends its own section below this one rather than replacing it.
