---
id: "004"
title: "Lab 10 spec — Agent memory"
status: draft
created: 2026-10-14
depends_on:
  - "001"
related_issue: "kanang29/day-in-the-life-copilot-lab#3"
---

# 004 — Lab 10 spec — Agent memory

> Saved verbatim from issue [#3](https://github.com/kanang29/day-in-the-life-copilot-lab/issues/3)'s
> "Lab 10 spec — Agent memory" section per Phase 3's instruction ("Save the
> spec below as `docs/specs/004-memory-lab.md`... then implement it").
> See `docs/specs/002-lab10-memory.md` for the earlier, independent gap
> audit of `labs/lab10.md` that was carried out against a prior revision of
> the issue — its "file-based memory stores" and "AGENTS.md conventions"
> findings (already-covered) and its loop-/graph-engineering content plan
> remain valid background and are consolidated into this spec's
> implementation rather than repeated.

**Why:** Lab 10 is the most out of date. It is framed as a Copilot CLI
capstone, runs prompt files as CLI slash commands, hardcodes model names
and relative prices, states the UNVERIFIED MCP-session claim as fact, and
its title differs from the registry's ("Agent Memory: Personalities, Lessons,
and Consolidation" vs "Context, Memory & Learning").

**Tier/surface:** core lab; the main path completes in VS Code. CLI-only
material (session-state `plan.md`, SQL todos, `/fleet`) goes into an
*Advanced (optional)* callout.

**Must cover:**

1. **File-based memory stores** — memory as markdown in git (diffable,
   reviewable, revertible). Cover the project store `.copilot/lessons/`
   (`index.md`, `log.md`, topic files; schema in
   `.github/instructions/lessons.instructions.md`), a personal store, and
   how both relate to any built-in memory features VS Code or GitHub offer
   today (verify names and status in official docs first).
2. **`AGENTS.md` conventions** — root vs nested per-directory `AGENTS.md`
   (nearest wins); additive with `.github/copilot-instructions.md` and
   `*.instructions.md`; `CLAUDE.md` / `GEMINI.md` alternatives; include
   only what agents can't discover themselves. Link to Lab 02 for
   precedence basics rather than re-teaching them.
3. **Loop engineering** — design the agent's working loop around memory:
   read memory → plan → act → verify → record a lesson → consolidate →
   promote durable rules into `AGENTS.md` / instructions. Cover explicit
   stop conditions, checkpoints, bounded iterations, and clearing context
   between iterations.
4. **Graph engineering** — structure memory as a navigable graph:
   hub/index notes, typed links (e.g. `relates-to`, `supersedes`,
   `contradicts`), backlinks and per-directory vaults, so the agent
   follows links instead of loading everything. Explain when a
   knowledge-graph MCP server is justified (this repo removed its
   `memory` server).
5. **Worked example — per-directory vault (SCNS).** SCNS is a local
   project not in this repo. Folder layout to mirror:
   `[PASTE SCNS FOLDER TREE HERE — OR DELETE THIS ITEM]`. Build a small
   sanitized fixture under `labs/fixtures/lab10/scns-vault/` that mirrors
   it (no real names or data). If the layout is still a placeholder,
   build a generic per-directory vault fixture instead and say so in the
   PR.

**Keep:** the raw → wiki → schema promotion model as the spine, the
`.copilot/lessons/` schema, `/consolidate-lessons` (on a supported
surface), and the cleanup section.

**Hands-on (VS Code):** (a) record a lesson, then recall it in a new chat;
(b) add a nested `AGENTS.md` under `dotnet/` or `node/` and observe
nearest-wins; (c) run one bounded loop iteration with an explicit stop
condition that ends in a `log.md` entry; (d) link three lessons through an
index hub with typed links, then ask a question that requires following
them; (e) explore the per-directory vault fixture.

**Done when:** titles match across the lab, registry and README; paces are
re-derived; .NET and Node appendices are updated in parity; `docs/memory-decision-tree.md`
and `tests/memory/decision-tree-coverage.test.ts` stay consistent; all
lab-structure tests pass.

## Implementation note — item 5 (SCNS)

Per spec 001 claim 14 and spec 002's independent confirmation, no file,
directory, or reference to "SCNS" exists anywhere in this repository, and
the issue's own placeholder (`[PASTE SCNS FOLDER TREE HERE — OR DELETE
THIS ITEM]`) was left unfilled. Per item 5's own fallback instruction,
this implementation builds a **generic per-directory vault fixture**
instead of inventing an SCNS layout, and states that plainly in the PR
and in the lab text itself.

## Implementation note — appendices (the "Done when" .NET/Node parity bullet)

`labs/lab10.md` has no `labs/appendices/{dotnet,node}/lab10.md` today and
none of its content is stack-specific (the three memory layers, `AGENTS.md`
precedence, loop/graph engineering, and the vault fixture are all
language-agnostic). No appendix is created by this pass; "parity" here
means *staying* language-agnostic rather than acquiring stack-specific
content that would need a split. The one place a stack choice appears
(hands-on exercise (b), "under `dotnet/` or `node/`") already reads as
an either/or in the issue's own wording.
