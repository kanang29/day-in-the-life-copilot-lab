---
id: "002"
title: "Lab 10 rebuild: memory, loop engineering, graph engineering"
status: draft
created: 2026-10-14
depends_on:
  - "001"
related_issue: "kanang29/day-in-the-life-copilot-lab#3"
---

# 002 — Lab 10 rebuild: memory, loop engineering, graph engineering

## Purpose and scope

Issue [#3](https://github.com/kanang29/day-in-the-life-copilot-lab/issues/3)
singles out Lab 10 as "the most out of date" and gives it its own spec. The
issue's literal ask: Lab 10 "must cover file-based memory stores,
`AGENTS.md` conventions, loop engineering and graph engineering, and may
use the local SCNS project as a worked example of a per-directory vault."

This spec covers only `labs/lab10.md` and its two direct dependents,
[`docs/memory-decision-tree.md`](../memory-decision-tree.md) (the 1-page
"which memory do I use?" reference `lab10.md` links to) and
[`docs/token-and-model-guide.md`](../token-and-model-guide.md) (which
describes Lab 10's Cost Budget sidebar). It does not touch any other lab.
The audit below (and the issue's own "Non-redundant" pillar) found that
most of `lab10.md` already satisfies the issue's ask, so this is a
targeted gap-fill, not a rewrite.

## Audit — what Lab 10 already covers vs. the gap

A full read of `labs/lab10.md` (668 lines) against the issue's four named
topics:

| Topic | Status | Where |
|---|---|---|
| File-based memory stores | ✅ already thorough | §10.1 (Layer 1: raw sources — `plan.md`, SQL `todos`), §10.2 (Layer 2: the `.copilot/lessons/` wiki, project vs. global) |
| `AGENTS.md` conventions | ✅ already thorough | §10.3 (Layer 3: the schema — `AGENTS.md`, `.github/instructions/`, agent personalities) |
| Loop engineering | ⚠️ present but unnamed | §10.4 (consolidation: dry run → live → graduation) and §10.5 (the ASCII "loop, drawn" diagram) teach the mechanics but never name "loop engineering" as a discipline or state its properties explicitly |
| Graph engineering | ❌ absent | the lab's own intro states it works "without a knowledge-graph server"; the concept is never taught, even to explain why it's being set aside |

Conclusion: two of four topics need no new content, one needs naming and
light conceptual framing, and one needs a new subsection written from
scratch.

## The tension: the repo already has a considered anti-graph, anti-autoloop stance

Before adding content, this spec had to resolve a direct tension between
the issue's literal wording and this repo's existing, deliberate design
philosophy — found independently in three places, not invented for this
spec:

1. [`docs/memory-decision-tree.md`](../memory-decision-tree.md)'s "Which
   one *isn't* the answer?" section explicitly disambiguates away
   **knowledge-graph servers** and **behaviour-capture / "instinct"
   loops** as deliberately-rejected patterns, not teachable layers, with a
   stated reason for each.
2. `labs/lab05.md` §5.3 is titled *"Cross-session persistence — markdown
   lessons, not a server"* and explicitly calls out that the `memory` MCP
   server "implements the generic knowledge-graph *primitive* but isn't
   wired into this repo's persistence story."
3. `tests/hooks/retired-observer.test.ts` asserts that
   `.github/skills/continuous-learning-v2` and
   `scripts/hooks/observe.{sh,ps1}` do **not** exist — a retired,
   automated behaviour-capture ("instinct loop") mechanism, matching the
   decision tree's note that "earlier iterations of the repo explored
   automated behaviour capture" before settling on the current, simpler,
   human-reviewed `/consolidate-lessons` pattern.

Reconciliation adopted by this spec: **"cover" means name, explain, and
deepen this repo's existing disambiguation using real in-repo artifacts —
not contradict it by bolting on a graph server or an automated loop as a
new "layer."** This keeps faith with the issue's "Non-redundant" pillar
(the lab should not grow a competing, half-taught alternative to the
pattern it already teaches well) while still teaching the two concepts by
name, what they are, when they're the right tool, and why this repo picked
differently. A learner who finishes the lab should be able to recognize
graph engineering and loop engineering elsewhere, even though this repo's
own memory system is neither.

## SCNS

Spec 001 (claim 14) confirmed by full-tree search that no file, directory,
or reference to "SCNS" exists anywhere in this repository. The issue's
own wording is permissive here ("**may** use... as a worked example"), so
this spec does not invent an SCNS project. The already-existing
`.copilot/lessons/` project-vs-global split (`lab10.md` §10.2c) is used as
the available stand-in for "a per-directory vault" example, with an
explicit note that SCNS does not exist in this repo today, so a learner
isn't left searching for a project that was never there.

## Content plan

### New §10.2d "Graph engineering" (after §10.2c, end of the Layer 2 discussion)

- Teaches the knowledge-graph *model* — entities (name, type,
  observations), directed relations (`from`/`to`/`relationType`), and
  atomic observations — using this repo's own registry-pinned `memory`
  MCP server (`docs/_meta/registry.yaml`'s `mcp_servers: memory` entry,
  package `@modelcontextprotocol/server-memory`) as the concrete,
  already-in-repo anchor. No new server is installed or activated; the
  section reads the existing registry entry and (optionally) the server's
  own tool surface (`create_entities`, `create_relations`,
  `add_observations`, `read_graph`, `search_nodes`) to show what graph
  engineering *is*, verified against the upstream server's own
  documentation rather than invented.
- States plainly when a graph is the right tool (dense, many-to-many
  relationships that don't nest cleanly in a directory tree — "which of
  these people worked on which of these projects, and which decisions
  cite which prior decisions") versus when this repo's flat, file-based
  wiki is cheaper and sufficient (the common case this lab already
  teaches: linear facts about one project, recalled by one agent, revised
  by a human-gated diff).
- Cross-links to `docs/memory-decision-tree.md` and `labs/lab05.md` §5.3
  rather than duplicating their reasoning.

### New §10.5a "Loop engineering" (within/after §10.5, "the loop, drawn")

- Names the discipline and states the properties the lab's own
  consolidation mechanics already exhibit, using them as the worked
  example instead of inventing a separate one: **direction** (raw →
  wiki → schema, never the reverse without a human step), **idempotency**
  (`/consolidate-lessons` can be re-run without duplicating promoted
  lessons), **cadence** (session-end, not continuous), and
  **drift-detection** (the dry-run step surfaces conflicts before
  anything is promoted).
- Uses the retired `continuous-learning-v2` / `observe.sh` mechanism
  (`tests/hooks/retired-observer.test.ts`) as the named cautionary
  counter-example: an earlier, fully-automated capture loop that this
  repo tried and retired in favor of the current human-reviewed one —
  teaching *why* a loop needs a human checkpoint, not just that one
  exists.

### Supporting edits

- Lightly adjust the lab's intro (currently states it works "without a
  knowledge-graph server") to foreshadow that both concepts are covered
  by name later in the lab, without weakening that framing claim — it
  remains true.
- Update the "Key Takeaways" table and "Lab Complete" checklist to list
  the two new subsections.
- Deepen (not restructure) the two relevant bullets in
  `docs/memory-decision-tree.md` to name "graph engineering" / "loop
  engineering" explicitly and cross-link to the new `lab10.md`
  subsections, so the decision tree and the lab use the same vocabulary.
- Fix `docs/token-and-model-guide.md`'s reference to Lab 10's Cost Budget
  sidebar covering "four-layer memory cost trade-offs" — both
  `memory-decision-tree.md` and `lab10.md` authoritatively describe
  **three** layers (Reindex/LSP is explicitly called out as *not* a
  numbered layer in the lab's own Key Takeaways table); this is a
  pre-existing drift bug under the issue's "Correct" pillar, not a hint to
  add a fourth layer, and is fixed as part of this same pass since it sits
  directly on the file this spec already touches.
- Bump `self_paced_minutes` in `lab10.md`'s frontmatter (and the matching
  `pace_self_minutes` in `docs/_meta/registry.yaml`) to account for two
  new subsections. `pace_presenter_minutes` and `pace_workshop_minutes`
  are left untouched — `tests/workshop/time-budget.test.ts` ties those two
  to `workshop/curriculum.md`'s fixed 240-minute budget and per-module
  slide-deck minutes, which are out of scope for a Lab 10-only pass.

## Acceptance

- [ ] `labs/lab10.md` names and teaches graph engineering and loop
      engineering without introducing a knowledge-graph server or an
      automated capture loop into the lab's own working pattern.
- [ ] Every new claim in the added sections resolves to a real, cited
      in-repo artifact (`docs/_meta/registry.yaml`'s `memory` entry,
      `tests/hooks/retired-observer.test.ts`) or a primary upstream source
      (the `@modelcontextprotocol/server-memory` README), not an invented
      example.
- [ ] `docs/memory-decision-tree.md`'s existing disambiguation is deepened,
      not restructured, and stays internally consistent with `lab10.md`.
- [ ] `docs/token-and-model-guide.md`'s "four-layer" drift is corrected to
      "three-layer."
- [ ] `tests/memory/decision-tree-coverage.test.ts`,
      `tests/labs/cost-sidebars-present.test.ts`, and
      `tests/workshop/time-budget.test.ts` all still pass.
- [ ] No SCNS project is invented; its absence is stated plainly.
