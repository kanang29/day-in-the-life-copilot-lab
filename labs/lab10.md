---
title: "Agent Memory: Personalities, Lessons, and Consolidation"
lab_number: 10
tier: beginner
surface: vscode
pace:
  presenter_minutes: 6
  self_paced_minutes: 35
registry: docs/_meta/registry.yaml
---

# 10 — Agent Memory: Personalities, Lessons, and Consolidation

> **Two ways to follow this lab**
> - **In VS Code:** use Copilot Chat and the `.github/prompts/` files for the
>   main consolidation flow.
> - **In Copilot CLI:** work with the shared markdown memory files and use
>   CLI-supported skills where noted. User-authored prompt files and their
>   slash commands are VS Code-only; the lab calls out the CLI alternative.

This lab teaches **how Copilot remembers things across sessions — without
a knowledge-graph server, without embeddings, without anything that isn't
already plain markdown in git.**

Andrej Karpathy observed that LLMs compound knowledge dramatically better
when they maintain **their own notes** instead of re-deriving context on
every session via retrieval. The model already knows how to read and
write markdown; give it a wiki and memory becomes a file you can `cat`,
diff, revert, and commit — not a database you have to host. This lab
teaches that pattern in three layers:

| Layer | Name | Surface | Lifetime |
|-------|------|---------|----------|
| 1 | **Raw sources** | This chat's context (plus `plan.md`, SQL todos on Copilot CLI) | This session |
| 2 | **The Wiki** | `.copilot/lessons/` (project) + `~/.copilot/lessons/` (global) | Across sessions, in markdown |
| 3 | **The Schema** | `AGENTS.md`, `.github/instructions/*.md`, agent personalities | Forever, binding |

Layer 1 is raw signal. Layer 2 is the curated wiki the agent writes *to
itself*. Layer 3 is the rulebook that governs how Layer 2 gets written.
Promotion goes upward: raw → wiki → schema. Nothing lives in two layers
at once.

Two disciplines extend this pattern rather than replacing it:
**graph engineering** — structuring the wiki itself as a navigable graph
of hub notes, typed links, and backlinks (§10.2e), plus the knowledge-graph
*server* model this repo deliberately doesn't use for memory (§10.2d) —
and **loop engineering** — the properties that make a memory-promotion
cycle safe to run repeatedly (§10.5a). You'll practice both hands-on below
using artifacts this repo already ships, not just meet them by name.

> 🖥️ **Surface:** every required step below works entirely inside **VS
> Code's Copilot Chat** — no standalone Copilot CLI install needed. An
> **Advanced (optional)** section (§10.1a) covers the CLI-only
> session-state surface (`plan.md`, the SQL `todos` store, `/fleet`) for
> learners who also use Copilot CLI.

> ⏱️ Presenter pace: 6 minutes | Self-paced: 35 minutes

> 💰 **Cost Budget** — ~18k in / ~6k out across the three layers plus the
> new graph/loop/vault exercises. Markdown round-trips are cheap; no
> knowledge-graph server chews tokens on every turn. Use the registry's
> `models.cheap` tier (e.g. `claude-haiku-4.5`, `gpt-5-mini`) for Layer 1–2
> mechanical edits and log/index appends; `auto` is a fine default
> throughout. Upshift to `models.premium` only for the §10.4 consolidation
> pass, where cross-document reconciliation benefits from the stronger
> tier. Start a new chat (or `/clear` on Copilot CLI) between §10.3 and
> §10.4. Full guidance, including the
> current `models.cheap|standard|premium` membership:
> [`docs/token-and-model-guide.md`](../docs/token-and-model-guide.md) and
> [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml).
>
> | Tier (registry key) | When to use it here |
> |------|--------------------|
> | `models.cheap` | §10.1–10.3 schema + log appends, file reads, the typed-link and vault exercises |
> | `models.standard` | Mid-complexity edits, schema drafting, the bounded loop iteration (§10.5a) |
> | `models.premium` | §10.4 interactive consolidation pass only |
>
> This lab names registry tiers, not model IDs — see
> [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml)'s `models:`
> block for which specific models back each tier today; that list changes
> independently of this lab text.

References:
- [Repository indexing](https://docs.github.com/en/copilot/concepts/context/repository-indexing)
- [Copilot CLI docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)
- [`.copilot/lessons/README.md`](../.copilot/lessons/README.md) — the pattern, in-repo
- [`.github/instructions/lessons.instructions.md`](../.github/instructions/lessons.instructions.md) — the schema
- [`.github/prompts/consolidate-lessons.prompt.md`](../.github/prompts/consolidate-lessons.prompt.md) — the command

## 10.1 Layer 1 — Raw sources (session-scoped)

**Lifetime:** this chat session only.
**Surfaces (VS Code):** the current Copilot Chat conversation itself —
its context window, any todo/plan list the agent is tracking for you in
that chat, scratch notes you keep in an open editor tab. All of it
disappears the moment you open a new chat; none of it is written to disk
unless you explicitly ask the agent to save it.

Use this layer for the **work-in-flight**: the plan you are executing
right now, the todos you have not finished, the half-formed scratchpad.
None of it is meant to outlive the task.

🖥️ **Try it — ask the agent to track its own plan for you:**

```
Create a short plan for adding a "Department dashboard" page. Track it as
a checklist and keep me updated on progress as you work.
```

Close this chat and open a new one, then ask what the plan was — the
agent won't know. That's the point: Layer 1 dies with the session, which
is exactly why Layer 2 exists.

> 💡 **Built-in memory features, checked against official docs:** as of
> this lab's last refresh, neither VS Code nor GitHub ship a distinct,
> named, persistent **cross-session** memory product beyond the
> instructions/prompt-file mechanism this lab already covers in Layer 3.
> (Primary-source verification for this specific claim was attempted
> during this refresh and blocked by a sandboxed network — re-check
> against `code.visualstudio.com/docs` and `docs.github.com` before
> teaching otherwise.) If that changes, this is the paragraph to update —
> everything else in this lab is unaffected either way, because the wiki
> in §10.2 is plain markdown your repo owns, not a vendor feature.

> 💡 **Rule of thumb:** if a teammate joining tomorrow would need this
> information, it does *not* belong in Layer 1. Raw sources feed the wiki
> — they are not the wiki themselves. Before starting a new chat, ask the
> agent to graduate anything durable into Layer 2.

### 10.1a Advanced (optional) — Copilot CLI session state and surface

> ⚠️ Everything in this subsection requires a local Copilot CLI install.
> It is not needed to complete this lab — skip to [§10.2](#102-layer-2--the-wiki-llm-maintained-markdown)
> if you're working entirely in VS Code.

Copilot CLI gives Layer 1 a concrete on-disk shape VS Code doesn't expose
directly: a per-session `plan.md` and a SQL `todos`/`todo_deps` store.

🖥️ **Try it — todo tracking via the session SQL store:**

```
Create a small plan for adding a "Department dashboard" page. Track 3
todos in the session database with id, title, description.
```

The agent calls the `sql` tool against the per-session SQLite database
and inserts rows into the default `todos` table. Follow up:

```
Show me the in-progress todo and mark the first one done.
```

🖥️ **Try it — the persistent plan.md:**

```
Write a 5-line plan.md to my session folder describing this lab.
```

That file is real on disk — inspect it:

**WSL/Bash:**
```bash
cat ~/.copilot/session-state/*/plan.md 2>/dev/null | head -60
```

**PowerShell:**
```powershell
Get-Content $HOME/.copilot/session-state/*/plan.md -ErrorAction SilentlyContinue | Select-Object -First 60
```

<!-- @include docs/_partials/currency.md — do not edit inline; edit the partial and re-sync. -->
> 💡 Commands below reflect the current Copilot CLI surface as of this lab
> refresh (CLI floor per [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml):
> see `copilot_cli_version_floor`). Versions, model tiers, and MCP server pins
> live in the registry — labs reference it rather than hardcoding values, so a
> single registry update propagates everywhere.

> 🆕 **Terminal UX refresh (confirmed GA, ~Aug 2026):** `/plugin`, `/mcp`, and
> `/skills` are real interactive commands backed by an in-terminal dashboard —
> you can discover, install, and configure plugins, MCP servers, and skills
> without hand-editing config files. The terminal also gained tabs for
> browsing issues/PRs/gists. Config-file editing still works and is what the
> underlying `extensions_manage` MCP tool inspects, but the dashboard is now
> the primary interactive path for a human at the prompt.

| Capability | Command / surface | Use when |
|------------|-------------------|----------|
| **Install a plugin** | `/plugin install owner/repo` (or the `/plugin` dashboard) | Pulling a packaged multi-agent or skill bundle from a marketplace or org-internal plugin source. |
| **Parallel subagents** | `/fleet` | Fanning work out across multiple short-lived workers under one orchestrator (see [Lab 14 — Orchestrator + tmux](../labs/lab14.md)). |
| **Plan mode vs autopilot mode** | `Shift+Tab` toggles plan mode; autopilot mode is the default | Plan-heavy work (design, decomposition) runs in plan mode; well-scoped execution runs in autopilot mode. |
| **Mid-session model switch** | `/model <tier-or-id>` | Upshift to `models.premium` (per [`registry.yaml`](../docs/_meta/registry.yaml)) for hard reasoning; downshift to `models.cheap` for tool-heavy loops. Note: an enterprise's global model-default-availability policy (see [Lab 17](../labs/lab17.md)) may make additional models selectable here even if the registry's curated tiers don't list them. |
| **Local tool discovery (model-side)** | `extensions_manage` MCP tool, `operation: "list"` / `"inspect"` / `"guide"` / `"scaffold"` | The agent enumerating which agents, skills, hooks, and extensions are contributing to the session before wiring a handoff. Invoke as a tool call (e.g. `extensions_manage({operation: "list"})`), **not** as `/extensions_manage` — there is no such slash command. |
| **Local tool discovery (user-side)** | `/skills`, `/plugin`, `/mcp` | The human listing or managing skills, plugins, and MCP servers from the prompt via the in-terminal dashboard. `/extensions manage` / `/extensions mode` also exist, but cover CLI extensions specifically and require `/experimental on` first — the three dashboards above are the primary path for everyday skill/plugin/MCP discovery. |
| **LSP-backed code intelligence** | Automatic — no slash command | Copilot CLI transparently prefers a configured language server over text search for go-to-definition, find references, rename, and call hierarchy. See [Lab 15 — LSP & Code Intelligence](../labs/lab15.md). |
<!-- @end-include docs/_partials/currency.md -->

## 10.2 Layer 2 — The Wiki (LLM-maintained markdown)

**Lifetime:** across sessions, in git.
**Surfaces:** [`.copilot/lessons/`](../.copilot/lessons/) (project scope)
and `~/.copilot/lessons/` (global / per-workstation).

This is the new layer. It is a directory of plain markdown files the agent
writes to itself: a catalog (`index.md`), an append-only journal
(`log.md`), and one topic file per durable lesson. The shape is enforced
by [`.github/instructions/lessons.instructions.md`](../.github/instructions/lessons.instructions.md);
Copilot reads that schema automatically on every edit.

> 🆕 **This is an application-layer convention, not protocol-level MCP
> memory.** `.copilot/lessons/` is plain markdown that this repo's own
> instructions govern — it was never backed by the MCP protocol, and that's
> even more true after the breaking [MCP spec revision of 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
> (`mcp_protocol_spec_version` in [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml)),
> which removed protocol-level sessions entirely — no `Mcp-Session-Id`, no
> stateful `initialize` handshake. Any cross-call state an MCP server needs
> today is an explicit, server-minted handle passed back as an ordinary tool
> argument, never an implicit session. So the `memory` MCP server (a generic
> knowledge-graph *primitive*, see [Lab 05 §5.3](lab05.md#53-cross-session-persistence--markdown-lessons-not-a-server))
> and this wiki solve different problems: MCP gives you live tools *within*
> a call; the wiki is how this repo persists *across* calls and sessions,
> in git, with nothing implicit.

🖥️ **Inspect what ships with the repo:**

**WSL/Bash:**
```bash
ls .copilot/lessons/
head -30 .copilot/lessons/README.md
head -30 .copilot/lessons/example-lesson.md
```

**PowerShell:**
```powershell
Get-ChildItem .copilot/lessons
Get-Content .copilot/lessons/README.md | Select-Object -First 30
Get-Content .copilot/lessons/example-lesson.md | Select-Object -First 30
```

You should see:

| File | Role |
|------|------|
| `README.md` | Human-facing pattern explanation. |
| `index.md` | Hand-curated catalog grouped by topic heading. |
| `log.md` | Dated, append-only journal of newly-learned lessons. |
| `example-lesson.md` | One realistic worked lesson with full front-matter. |

### 10.2a Append a lesson to `log.md`

Learning something new mid-session is the trigger for a `log.md` entry.
The schema is short — a level-2 heading and a bullet list with
`Context`, `Lesson`, `Evidence`, `Action for future sessions`, and
`Promoted to`. Ask the agent to record a lesson without editing the
file yourself:

```
I just discovered that `dotnet test` on the Tests/ project alone misses
Web-only breakages in ContosoUniversity.Web. Append a lesson to
.copilot/lessons/log.md following the schema in
.github/instructions/lessons.instructions.md. Leave "Promoted to" blank.
```

🖥️ **Verify the append:**

**WSL/Bash:**
```bash
head -40 .copilot/lessons/log.md
```

**PowerShell:**
```powershell
Get-Content .copilot/lessons/log.md | Select-Object -First 40
```

The new entry should sit at the top (newest first), cite evidence, and
leave `Promoted to:` blank — that gets filled in by `/consolidate-lessons`
in §10.4.

### 10.2b Recall from a fresh session

This is the payoff. Close your current session (`/exit`) and start a new
one, then ask:

```
What have we learned about verifying .NET changes in this repo? Check
.copilot/lessons/ before answering.
```

The agent reads `index.md`, opens `example-lesson.md`, and answers from
the wiki — even though you never told *this* session anything. No
knowledge-graph server, no embeddings; just markdown the agent wrote to
itself last time.

### 10.2c Project vs. global lessons

- **Project lessons** live in `.copilot/lessons/` and ship with the repo
  (things that are true *here*: "run the full ContosoUniversity solution
  build").
- **Global lessons** live in `~/.copilot/lessons/` on each workstation
  (things true *across repos*: "always cite evidence in review comments").

Agents consult both. On conflict, global wins unless the project lesson
carries `scope: project-override` in its front-matter — that flag means
the author deliberately disagrees with the global rule, and consolidation
(§10.4) never auto-reconciles an override.

🖥️ **Scaffold your global wiki (first-run only):**

**WSL/Bash:**
```bash
mkdir -p ~/.copilot/lessons
[ -f ~/.copilot/lessons/index.md ] || printf '# Lessons — Global Index\n\n' > ~/.copilot/lessons/index.md
[ -f ~/.copilot/lessons/log.md ]   || printf '# Lessons — Global Log\n\n'   > ~/.copilot/lessons/log.md
ls ~/.copilot/lessons/
```

**PowerShell:**
```powershell
$lessons = Join-Path $HOME ".copilot/lessons"
New-Item -ItemType Directory -Force -Path $lessons | Out-Null
if (-not (Test-Path "$lessons/index.md")) { "# Lessons — Global Index`n" | Set-Content "$lessons/index.md" -Encoding UTF8 }
if (-not (Test-Path "$lessons/log.md"))   { "# Lessons — Global Log`n"   | Set-Content "$lessons/log.md"   -Encoding UTF8 }
Get-ChildItem $lessons
```

`~/.copilot/lessons/` is personal and is never committed from this repo.

> 💡 **Rule of thumb:** if the lesson is *useful recall* (a pattern, a
> gotcha, a decision) it belongs in Layer 2. If it's a *binding rule*
> every task must obey, it belongs in Layer 3.

### 10.2d Graph engineering — the road not taken

Layer 2 is **file-based** memory: facts live in markdown, keyed by
filename, read top-to-bottom. The other common way to model memory is a
**knowledge graph** — facts as **entities** (nodes, each with a name, a
type, and a list of observations), **relations** (directed edges between
entities — "X works_at Y"), and **observations** (atomic facts attached to
one entity). This repo already pins a real implementation of that model;
it just doesn't use it for cross-session memory.

🖥️ **Read what this repo already pins, without installing anything:**

**WSL/Bash:**
```bash
grep -A6 'name: memory' docs/_meta/registry.yaml
```

**PowerShell:**
```powershell
Select-String -Path docs/_meta/registry.yaml -Pattern 'name: memory' -Context 0,6
```

That's the `memory` MCP server (`@modelcontextprotocol/server-memory`) —
the same one [Lab 05 §5.1](lab05.md#51-examine-existing-mcp-configuration)
showed you in the MCP server table. Its tool surface —
`create_entities`, `create_relations`, `add_observations`, `read_graph`,
`search_nodes` — **is** graph engineering: you design a schema of entity
types and relation types, then query by *traversal* ("what does X relate
to?") instead of by file path.

Graph engineering earns its keep when relationships are the point and
they're dense and many-to-many — "which of these 40 people worked on
which of these 12 projects, and which decisions cite which prior
decisions" doesn't nest cleanly into a directory tree. That is **not**
this repo's problem. Layer 2's facts are mostly linear — "here is what's
true about this one project" — recalled by one agent, in one directory,
revised by a human-reviewed diff. A graph adds a server to run, a schema
to design, and a query language to learn, to solve a many-to-many problem
this lab doesn't have. [Lab 05 §5.3](lab05.md#53-cross-session-persistence--markdown-lessons-not-a-server)
and [`docs/memory-decision-tree.md`](../docs/memory-decision-tree.md) make
the same call: files, not a graph. Now you've seen the actual tool being
set aside, not just been told it exists.

> 💡 **When would a graph earn its keep?** Tracking cross-team dependency
> ownership across 50 services, or citation chains across hundreds of
> architectural decision records, fans relationships out in every
> direction — traversal queries start winning over `grep`. One project's
> lessons wiki isn't that; a services registry or a decision-record corpus
> might be.

### 10.2e File-based graph engineering — hubs, typed links, backlinks

You don't need a server to get the *navigational* benefit of a graph —
following a relationship instead of loading every file. The wiki you
already have in `.copilot/lessons/` can carry that structure directly:

- **Hub note.** `index.md` already *is* a hub note — a catalog of
  pointers grouped by topic, read before anything else. You've been
  using this pattern since §10.2b without the vocabulary for it.
- **Typed links.** The schema's `related:` front-matter key (see
  [`.github/instructions/lessons.instructions.md`](../.github/instructions/lessons.instructions.md))
  is a plain, untyped list. Three optional sibling keys add a relationship
  *type* when it matters: `relates-to` (two lessons share context but
  neither depends on the other), `supersedes` (this lesson replaces an
  older one — the superseded file should be stubbed, not deleted, so old
  links don't 404), and `contradicts` (a project lesson deliberately
  disagrees with a global one — the same situation `scope:
  project-override` already flags in §10.2c, now expressed as an edge
  instead of a flag).
- **Backlinks.** Markdown links are one-directional by default. This
  schema's convention for a backlink is: when you add a typed link from
  A to B, also add the reciprocal entry in B's own front-matter in the
  same edit. `index.md` grouping both lessons under one topic heading is
  the cheapest backlink of all — it's already there for every lesson you
  index.
- **Per-directory vaults.** One `.copilot/lessons/` per subtree instead
  of one project-wide wiki — covered hands-on below with a fixture.

🖥️ **Hands-on (d) — link three lessons through typed links, then follow them:**

Ask the agent to create two small scratch lessons alongside the existing
`example-lesson.md`, cross-linked with typed front-matter:

```
Create two new lesson files in .copilot/lessons/: "prefer-xunit-fixtures"
(tags: dotnet, testing) and "powershell-parity-for-labs" (tags: labs,
powershell). Give prefer-xunit-fixtures a relates-to link to
example-lesson.md. Give powershell-parity-for-labs a relates-to link to
prefer-xunit-fixtures. Add both to index.md under appropriate headings,
and add the reciprocal relates-to entry in example-lesson.md pointing
back to prefer-xunit-fixtures.
```

Then ask a question that **requires** the agent to follow the chain
instead of answering from one file alone:

```
Starting from powershell-parity-for-labs, what does this repo believe
about verifying .NET changes, and why does that belief also show up in
lessons about lab-writing conventions? Follow the links; don't just
summarize one file.
```

A correct answer traces `powershell-parity-for-labs` → `relates-to` →
`prefer-xunit-fixtures` → `relates-to` → `example-lesson.md`, and explains
the connection (both are about "don't trust a narrow check; verify the
whole surface"). That traversal — follow the edge, don't load everything
— is graph engineering, done without a server. Clean up the two scratch
files in [§10.6](#106-cleanup) once you've confirmed the traversal works.

🖥️ **Hands-on (e) — explore a per-directory vault fixture:**

[`labs/fixtures/lab10/scns-vault/`](../labs/fixtures/lab10/scns-vault/)
is a small, sanitized, **generic** per-directory vault fixture (not a
real project layout — see its own `README.md` for why). Ask the agent:

```
Read labs/fixtures/lab10/scns-vault/README.md, then compare
module-a/.copilot/lessons/index.md and module-b/.copilot/lessons/index.md.
Why do they never cross-link, and when would you choose this layout over
one project-wide .copilot/lessons/?
```

The answer you're looking for: a per-directory vault earns its split
when subtrees have genuinely different owners, conventions, or
lifecycles — a `module-a`-only lesson has no business cluttering
`module-b`'s hub. If everything in your repo is one team's concern, one
flat wiki stays simpler; don't split pre-emptively.

## 10.3 Layer 3 — The Schema (how the wiki gets written)

**Lifetime:** forever, in git.
**Surfaces:** [`AGENTS.md`](../AGENTS.md), [`.github/instructions/*.md`](../.github/instructions/),
`.github/copilot-instructions.md`, and the agent personalities in
[`.github/agents/*.agent.md`](../.github/agents/).

Layer 3 is the rulebook the agent follows when it writes to Layer 2. It
is not itself a memory of *what happened*; it is a memory of *how to
behave*. That distinction is what keeps the wiki consistent across
sessions and across contributors.

🖥️ **Inspect the schema in place:**

**WSL/Bash:**
```bash
ls .github/instructions/
head -60 AGENTS.md
head -60 .github/instructions/lessons.instructions.md
```

**PowerShell:**
```powershell
Get-ChildItem .github/instructions
Get-Content AGENTS.md | Select-Object -First 60
Get-Content .github/instructions/lessons.instructions.md | Select-Object -First 60
```

You should see scoped instruction files (e.g. `dotnet.instructions.md`,
`testing.instructions.md`, `lessons.instructions.md`) plus the project's
`AGENTS.md`. Copilot pulls all three into every session in this repo
without you asking.

### 10.3a `AGENTS.md` conventions — root, nested, and alternatives

[Lab 02](lab02.md) already covers how `.github/copilot-instructions.md`,
path-scoped `*.instructions.md`, and `AGENTS.md` combine and take
precedence in general — go there for the basics. What's specific to
memory is **where** an `AGENTS.md` lives and what happens when there's
more than one:

- **Additive, not a replacement.** A repo-root `AGENTS.md` and
  `.github/copilot-instructions.md` both load for every session; neither
  silences the other.
- **Nested, nearest-wins.** A subdirectory can have its own `AGENTS.md`.
  When you're working inside that subtree, the nested file's guidance
  takes precedence over the root file's for anything the two disagree
  on — the agent uses the **nearest** `AGENTS.md` to the files it's
  editing, not only the root one.
- **Accepted alternatives.** `CLAUDE.md` and `GEMINI.md` are recognized
  as equivalent to `AGENTS.md` by name, for teams already standardized on
  those filenames.
- **Only what agents can't discover themselves.** `AGENTS.md` content
  should be the non-obvious stuff — commands, conventions, gotchas — not
  a restatement of what a directory listing or a `README.md` already
  shows.

🖥️ **Hands-on (b) — add a nested `AGENTS.md` and observe nearest-wins:**

**WSL/Bash:**
```bash
test -f dotnet/AGENTS.md && echo "dotnet/AGENTS.md already exists" || \
  printf '# AGENTS.md — dotnet/\n\nScratch rule for Lab 10 §10.3a: when summarizing this directory, always mention it is .NET 8 / EF Core.\n' > dotnet/AGENTS.md
cat dotnet/AGENTS.md
```

**PowerShell:**
```powershell
if (Test-Path "dotnet/AGENTS.md") { "dotnet/AGENTS.md already exists" } else {
  "# AGENTS.md — dotnet/`n`nScratch rule for Lab 10 §10.3a: when summarizing this directory, always mention it is .NET 8 / EF Core.`n" | Set-Content "dotnet/AGENTS.md" -Encoding UTF8
}
Get-Content dotnet/AGENTS.md
```

Then, in a fresh chat, ask:

```
Summarize what's in the dotnet/ directory.
```

The summary should mention ".NET 8 / EF Core" even though you never said
that in this chat — the nested `dotnet/AGENTS.md` won, because it's
nearer to the files in question than the repo root one. Delete the
scratch file once you've confirmed it (it's not meant to become a real
convention — see [§10.6](#106-cleanup)):

**WSL/Bash:**
```bash
rm -f dotnet/AGENTS.md
```

**PowerShell:**
```powershell
Remove-Item dotnet/AGENTS.md -ErrorAction SilentlyContinue
```

> 💡 If your repo has a `node/` directory instead (or in addition), the
> same exercise works there — the point is nearest-wins, not the stack.

### 10.3b Extend the schema

Schema changes are binding on every future session. Keep them tight:

```
Append to .github/instructions/testing.instructions.md:
"Every new repository class must have a corresponding xUnit fixture in
dotnet/ContosoUniversity.Tests/Fixtures/."
```

Now open a fresh session and ask the agent to scaffold a repository — it
will follow the rule because Layer 3 is loaded automatically.

### 10.3c Agent personalities — the stewardship story

`AGENTS.md` and `.github/instructions/` apply to *all* agents. But this
repo also ships agent **personalities** — role-specialized agents with
their own voice and tool scope. Each has a different relationship with
the Layer 2 wiki.

🖥️ **Compare two personalities:**

**WSL/Bash:**
```bash
head -30 .github/agents/planner.agent.md
head -30 .github/agents/code-reviewer.agent.md
```

**PowerShell:**
```powershell
Get-Content .github/agents/planner.agent.md | Select-Object -First 30
Get-Content .github/agents/code-reviewer.agent.md | Select-Object -First 30
```

| Agent | Voice | Tools | Relationship to the wiki |
|-------|-------|-------|---------------------------|
| `planner` | Decomposes, assesses risks, never implements. | `read`, `search`, `agent` | **Reads** lessons to avoid planning around solved problems. |
| `code-reviewer` | High signal-to-noise, surfaces only real issues. | `read`, `search` | **Writes** lessons when review uncovers a durable pitfall. |

Different personalities produce different kinds of lessons — a planner's
entry is about *architecture*, a reviewer's about *pitfalls*. The wiki
gets richer when each role contributes from its vantage point, and the
schema keeps their entries shaped the same way.

> 💡 **Rule of thumb:** if a rule must apply on every task, put it in
> Layer 3. If a pattern should only surface *when relevant*, put it in
> Layer 2. Lessons are advisory; schema is binding.

## 10.4 Consolidation — promoting the wiki

The wiki accumulates entropy. Over a few weeks you get duplicate topic
files, stale lessons, and project-scoped entries that actually apply
globally. The `/consolidate-lessons` prompt is the **only** supported
way to reshape the wiki — manual reorganization is a footgun because
agents rely on stable file paths.

🖥️ **Read the command before you run it:**

**WSL/Bash:**
```bash
head -40 .github/prompts/consolidate-lessons.prompt.md
```

**PowerShell:**
```powershell
Get-Content .github/prompts/consolidate-lessons.prompt.md | Select-Object -First 40
```

### 10.4a Dry run first

Always start with `--dry-run` so you can see what would change.
`/consolidate-lessons` is a **prompt file**
([`.github/prompts/consolidate-lessons.prompt.md`](../.github/prompts/consolidate-lessons.prompt.md)),
and prompt files are a **VS Code / Visual Studio / JetBrains** surface —
type it in **VS Code's Copilot Chat** input box, not in a terminal and
not in the Copilot CLI's interactive prompt (Copilot CLI doesn't expose a
slash command for user-authored prompt files):

```text
/consolidate-lessons --dry-run --scope both
```

The agent will enumerate the wiki, decide which `log.md` entries are
ready for promotion, flag duplicates, suggest project→global moves, and
print a summary — without writing anything. Read the summary. If it
proposes to merge two files you wanted to keep separate, fix the
front-matter (`tags`, `scope`) and re-run the dry run.

### 10.4b Live consolidation

When the dry-run looks right, run for real — again, in **VS Code's
Copilot Chat**, not a terminal:

```text
/consolidate-lessons --scope both
```

Expected diff, given the seed wiki this repo ships:

- The `log.md` entry you added in §10.2a gets a `Promoted to:` value and
  either a new topic file appears or it merges into `example-lesson.md`
  with a Revision log bullet.
- A new bullet lands in `index.md` under the matching topic heading.
- If the lesson looks globally applicable, a copy moves to
  `~/.copilot/lessons/` with `scope: global` and the project file
  becomes a stub.
- Any contradiction between a project and global lesson is **flagged**,
  not auto-resolved, under `CONTRADICTION` in the summary.

🖥️ **Review the diff before staging anything:**

**WSL/Bash:**
```bash
git status .copilot/lessons/
git --no-pager diff --stat .copilot/lessons/
```

**PowerShell:**
```powershell
git status .copilot/lessons/
git --no-pager diff --stat .copilot/lessons/
```

Per `AGENTS.md`: stage files individually with `git add <path>` — never
`git add .` or `git add -A`.

### 10.4c Graduating a lesson into Layer 3

If a topic file keeps getting cited across every review and every
planning pass, promote it out of Layer 2 and into Layer 3 — append a
rule to `AGENTS.md` or a targeted `.github/instructions/*.md` file and
delete the lesson (keep the `log.md` history). The wiki stays a
*library*; the schema stays a *constitution*. Don't let them blur.

### 10.4d Autopilot — one paragraph, not a feature

You cannot schedule `/consolidate-lessons` through a cron/launchd/Task
Scheduler entry that launches a non-interactive Copilot CLI session —
prompt files are a VS Code/Visual Studio/JetBrains surface, and Copilot
CLI exposes no slash command for a user-authored `.prompt.md` file, so a
command like `copilot --prompt '/consolidate-lessons --scope both'` does
not do what it looks like it does: the CLI sees the literal text, not a
prompt-file invocation. If you want consolidation on a cadence today,
run it interactively in VS Code on whatever schedule suits you (weekly is
a reasonable default), or convert the prompt into a skill first — skills
*are* invocable from Copilot CLI, unlike prompt files, but that's a
repo customization beyond this lab. This repo does not ship a schedule;
cadences are environment-specific and belong in your personal setup.

---

## 10.5 Wrap — the loop, drawn

```
 Layer 1                   Layer 2                    Layer 3
 Raw sources  ───────────► The Wiki  ────────────►   The Schema
 (this chat's              (.copilot/lessons/,         (AGENTS.md,
  context)                 ~/.copilot/lessons/)        instructions,
                                                      agent personalities)

   session         /consolidate-lessons       hardens into a rule
  only dies        promotes log → topic       when it must apply
 at a new chat     and project → global       on every task
```

Three layers, one direction of promotion, zero servers to operate.
Your checklist for the next real task:

1. **Open the session (L1):** start a new chat. Optionally mark the start
   with the `/checkpoint create "<task>"` prompt file (VS Code Copilot
   Chat — see [§10.1a](#101a-advanced-optional--copilot-cli-session-state-and-surface)
   if you're on Copilot CLI instead, where the same session also gets a
   concrete `plan.md` and SQL `todos` row set).
2. **Consult the wiki (L2):** ask the agent to check
   `.copilot/lessons/index.md` and `~/.copilot/lessons/index.md` before
   starting.
3. **Append when you learn (L2):** any finding that will matter next
   time goes into `log.md` with evidence cited.
4. **Harden into schema (L3):** if a rule should apply on every task,
   propose it during consolidation — not mid-feature.
5. **Consolidate weekly:** `/consolidate-lessons --dry-run` first (VS
   Code Copilot Chat); commit the live run when the diff is clean.

🖥️ **End-of-lab handoff drill:** in **VS Code's Copilot Chat** (this is
a prompt file — not the Copilot CLI's interactive prompt, and not your
shell), type the slash command `/handoff` with work description
"Completed Lab 10 — three-layer agent memory" and stop reason "Lab
complete". The output is itself a Layer 1 artefact — it dies with the
next session unless you graduate durable findings into Layer 2 or 3.

### 10.5a Loop engineering

`/consolidate-lessons` is a **loop**: it reads the wiki's current state,
decides what changed, and writes a new state back. **Loop engineering**
is the discipline of making that cycle safe to run repeatedly — four
properties, all of which this lab's own loop already has:

| Property | What it means | Where you already saw it |
|---|---|---|
| **Direction** | State moves one way without a human step reversing it. | Promotion only ever runs L1 → L2 → L3 (§10.4c); nothing auto-demotes. |
| **Idempotency** | Running it again doesn't duplicate work already done. | Re-running `/consolidate-lessons` doesn't re-promote a lesson that already has a `Promoted to:` value. |
| **Cadence** | It runs on a deliberate schedule, not continuously. | §10.4d: session-end or weekly, never on every tool call. |
| **Drift detection** | Disagreements surface for a human instead of being silently resolved. | The `--dry-run` step (§10.4a) and the `CONTRADICTION` flag (§10.4b). |

🖥️ **Hands-on (c) — run one bounded loop iteration with an explicit stop condition:**

`/consolidate-lessons` is one example of this loop; you can run the same
shape by hand for a one-off check. The bound and the stop condition are
stated **before** you start, not decided afterward:

```
Run exactly one iteration of this loop, then stop regardless of what you
find — do not re-run it even if the result suggests more work:

1. Read memory: check .copilot/lessons/index.md for any existing lesson
   about shell-command parity in labs.
2. Plan: decide what one check would confirm whether labs/lab10.md itself
   follows that convention.
3. Act: run that one check (e.g. grep for ```bash fences without a
   matching ```powershell fence nearby).
4. Verify: look at the check's actual output, not your prediction of it.
5. Record a lesson: append one entry to .copilot/lessons/log.md with the
   finding either way — pass or fail — leaving "Promoted to:" blank.

Stop condition: exactly one iteration. Report the log.md entry you wrote
and stop.
```

That's all five loop-engineering ingredients in miniature: a **direction**
(read → plan → act → verify → record, never backward), an explicit
**bound** (one iteration, stated up front — not "keep going until it's
good"), a **checkpoint** (the log.md entry is the artifact that proves
the iteration happened), and a **stop condition** that ends the loop
regardless of outcome. Start a new chat (or `/clear` on Copilot CLI)
before your next task — don't let an open-ended continuation of "well,
now let's also fix it" bleed into the next session's context. If the
check found something worth fixing, that's a *new*, separately-scoped
task, planned fresh.

🖥️ **See the counter-example this repo tried and retired:**

**WSL/Bash:**
```bash
jq '.hooks | keys' .github/hooks/default.json
ls scripts/hooks/ | grep -i observe || echo "no automated observer script ships in this repo"
```

**PowerShell:**
```powershell
(Get-Content .github/hooks/default.json | ConvertFrom-Json).hooks.PSObject.Properties.Name
if (Get-ChildItem scripts/hooks | Where-Object Name -match 'observe') { "found" } else { "no automated observer script ships in this repo" }
```

An earlier iteration of this repo (`.github/skills/continuous-learning-v2`,
`scripts/hooks/observe.sh`/`.ps1`) tried capturing lessons automatically on
every tool call — a loop with no cadence and no human drift-detection
step. It's retired (`tests/hooks/retired-observer.test.ts` asserts it
stays gone) in favor of the loop above, which only writes when you
explicitly ask and only after you've read the dry-run. A loop without a
human checkpoint isn't safer for being automatic — it just fails
silently instead of loudly.

<details>
<summary>Key Takeaways</summary>

| Concept | Layer | Lifetime |
|---------|------:|----------|
| This chat's context (`/checkpoint`, `plan.md` + SQL todos on CLI) | 1 | This session |
| `.copilot/lessons/`, `~/.copilot/lessons/` | 2 | Across sessions, in markdown |
| `AGENTS.md`, `.github/instructions/`, agent personalities | 3 | Forever, binding |
| Reindex / LSP | — | Automatic; reads code, stores nothing |
| Graph engineering, MCP-server flavor (entities, relations, observations) | — | Not this repo's memory; the road not taken (§10.2d) |
| Graph engineering, file-based flavor (hubs, typed links, backlinks) | 2 | Practiced hands-on (§10.2e) |
| Loop engineering (direction, idempotency, cadence, drift-detection) | — | The properties behind `/consolidate-lessons`, practiced hands-on (§10.5a) |

Promotion: L1 → L2 when durable; L2 project → L2 global when cross-repo;
L2 → L3 when binding on every task. Nothing lives in two layers at once.
Markdown round-trips are cheap — a weekly consolidation touches a handful
of files and costs pennies.

</details>

<details>
<summary>Solution: lab10-session-management reference materials</summary>

See [`solutions/lab10-session-management/`](../solutions/lab10-session-management/) — in particular [`README.md`](../solutions/lab10-session-management/README.md), [`sample-handoff.md`](../solutions/lab10-session-management/sample-handoff.md), and [`sample-checkpoint-log.txt`](../solutions/lab10-session-management/sample-checkpoint-log.txt) — for the complete reference implementation.

</details>

## Lab Complete 🎉

You've now mapped every memory surface Copilot exposes, in VS Code and
on the CLI:

- ✅ **Lab 01–09** — agents, skills, hooks, MCP, orchestration, gh-aw,
  Cloud Agent, Code Review.
- ✅ **Lab 10** — three-layer agent memory: raw sources, the wiki, the
  schema, and the consolidation loop that keeps them clean — plus
  hands-on file-based graph engineering (§10.2e) and loop engineering
  (§10.5a), each also contrasted with the heavier pattern this repo set
  aside (a knowledge-graph MCP server, an automated observer hook).
- ⏭ **Lab 11** — building and distributing a Copilot plugin
  (enterprise marketplace pattern) so the lessons and schema you curated
  above ship to other teams.

### What's next?

- **Customize:** seed `.copilot/lessons/` in your own repo with one
  real lesson. Most teams over-rely on Layer 1 and never start Layer 2.
- **Audit:** run `extensions_manage` operation `list` and confirm
  Layer 3 in your repo is the minimum viable set, not a junk drawer.
- **Share:** commit your wiki. A PR that adds a lesson is as valuable
  as a PR that fixes a bug — it teaches every future session at once.

**Return to:** [README](../README.md)

## 10.6 Cleanup

### Lab 10–specific: prune the global lessons folder

`~/.copilot/lessons/` is a per-workstation Layer 2 surface. Across many
lab runs it accumulates topic files, `log.md` entries, and stub
indexes that other sessions wrote. Before moving on, decide whether to
**keep** the global wiki you've curated or **reset** it to a clean
state for the next learner on this workstation.

> ⚠️ Only delete files **you** created in this lab. If you share the
> workstation, list contents first and remove individual paths — never
> blanket-delete the directory.

🖥️ **Inspect, then prune:**

**WSL/Bash:**
```bash
# 1. List what's there:
ls -la ~/.copilot/lessons/ 2>/dev/null

# 2. Remove individual files this lab created (example):
rm -f ~/.copilot/lessons/<topic-file-you-added>.md

# 3. Full reset (only if this is your personal workstation and you
#    want to start the global wiki over):
rm -rf ~/.copilot/lessons
```

**PowerShell:**
```powershell
$lessons = Join-Path $HOME ".copilot/lessons"

# 1. List what's there:
Get-ChildItem $lessons -Force -ErrorAction SilentlyContinue

# 2. Remove individual files this lab created (example):
Remove-Item (Join-Path $lessons "<topic-file-you-added>.md") -ErrorAction SilentlyContinue

# 3. Full reset (only if this is your personal workstation and you
#    want to start the global wiki over):
Remove-Item $lessons -Recurse -Force -ErrorAction SilentlyContinue
```

The project-scoped `.copilot/lessons/` directory is committed to the
repo — leave it alone unless you also revert the corresponding edits
via `git restore`.

<!-- @include docs/_partials/cleanup.md — do not edit inline; edit the partial and re-sync. -->
> 🧹 **Cleanup — leave the machine the way you found it.**
> Run this checklist before moving to the next lab. Per-lab specifics (named
> agent / hook / extension files this lab created) should already have been
> reverted in the steps above; this is the generic sweep that catches the
> long-tail.

🖥️ **In your terminal:**

1. **Stop background processes.** Anything you started in the foreground with
   `&` or in another tmux pane (dev servers, watchers, `gh aw` long-runs,
   tail-follows). If you used the bash tool in async mode, make sure those
   shells are stopped.

   **WSL/Bash:**
   ```bash
   jobs -l                       # any background jobs in this shell?
   # kill them by PID — never `pkill`/`killall`
   ```

   **PowerShell:**
   ```powershell
   Get-Job                       # any background jobs?
   Get-Job | Stop-Job; Get-Job | Remove-Job
   ```

2. **Restore Copilot CLI config if you mutated it.** Some labs ask you to
   edit `~/.copilot/config.json`, `~/.copilot/mcp-config.json`, or
   `.copilot/mcp-config.json`. If you stashed the original, restore it now.
   If you edited in place without backing up, check `git status` in the lab
   repo (workspace configs) and revert anything you didn't mean to keep.

   **WSL/Bash:**
   ```bash
   # If you saved a backup like ~/.copilot/config.json.bak:
   [ -f ~/.copilot/config.json.bak ] && mv ~/.copilot/config.json.bak ~/.copilot/config.json
   ```

3. **Exit and restart `copilot` if you touched extensions or MCP.** The
   runtime caches loaded extensions and MCP servers; reloading via
   `extensions_reload` does **not** clear an extension whose source dir was
   deleted. Fully exit the `copilot` process and start a fresh session.

4. **Sweep the long-tail artifact paths.** These directories accumulate
   across labs and are safe to clean once you've finished:

   ```bash
   # Per-session scratch (safe to inspect; delete only what this lab created):
   ls ~/.copilot/lessons/        2>/dev/null
   ls node/.a2a/                  2>/dev/null
   ls node/.a2a-transcript-*.md   2>/dev/null
   ls .git/CLAB_SUMMARY.md        2>/dev/null
   ```

   Delete only files that this lab created. Do not blanket-delete
   `~/.copilot/lessons/` if other sessions wrote to it.

5. **Revert any `core.hooksPath` or other git-config mutations.** Some labs
   point git at a custom hooks dir for the duration of an exercise.

   ```bash
   git config --get core.hooksPath
   # if set to a lab path, unset:
   git config --unset core.hooksPath
   ```

6. **Confirm working tree is clean (or expected).**

   ```bash
   git status --short
   ```

   Any unexpected files (untracked agents, hooks, extensions, scratch
   notebooks) should be removed or moved out of the repo before continuing.

7. **Verify build is still green.** Optional but recommended after labs that
   touched hooks, agents, or skills:

   ```bash
   dotnet build dotnet/ContosoUniversity.sln --nologo
   ```

> ✅ Once `git status --short` is empty (or shows only files you intentionally
> kept) and the build is clean, you're ready for the next lab.
<!-- @end-include docs/_partials/cleanup.md -->
