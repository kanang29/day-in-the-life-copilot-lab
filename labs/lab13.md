---
title: "A2A Concepts with Copilot CLI ACP"
lab_number: 13
tier: advanced
surface: cli
pace:
  presenter_minutes: 10
  self_paced_minutes: 35
registry: docs/_meta/registry.yaml
---

# 13 — A2A Concepts with Copilot CLI ACP

> **Two ways to work with this lab**
> - **In Copilot CLI:** run the single-session and multi-process exercises
>   below; the live ACP-style process work is CLI-specific.
> - **In VS Code:** use the editor for the shared files and Copilot Chat for
>   supported subagent concepts. VS Code does not provide the lab's
>   multi-process CLI workflow.

In this lab you'll learn what **agent-to-agent (A2A)** orchestration is
using Copilot CLI's local primitives (`task`, `write_agent`,
`read_agent`), drive a concrete **two-agent task** (an *implementer*
and a *critic* working on the same Node app), inspect the resulting
transcript, and rehearse the three failure modes every A2A system runs
into in production. Along the way you'll meet **ACP (Agent Client
Protocol)** — a real Copilot CLI feature — and see exactly how it
differs from the A2A pattern this lab teaches.

> ⏱️ Presenter pace: 10 minutes | Self-paced: 35 minutes

> 💰 **Cost Budget**
> - Expected token footprint: ~50k in / ~15k out for the full
>   two-agent loop. The implementer + critic exchange is the
>   single most expensive pattern in the lab suite because each
>   peer re-reads the shared workspace every turn.
> - Cheaper alternative: keep the **critic** on `claude-haiku-4.5`
>   (criticism is mostly pattern-matching against a rubric) and
>   reserve `claude-opus-5` (registry `models.premium`) for the
>   **implementer** when the task is non-trivial. For the warm-up two-agent task in
>   Part A, both peers can run on `gpt-5-mini` to learn the
>   protocol without paying for premium reasoning.
> - Compaction trigger: cap each peer at the turn limit you set
>   in §13's failure-modes section, then `/clear` between Part A
>   (warm-up) and Part B (failure-mode rehearsal).
> - See [`docs/token-and-model-guide.md`](../docs/token-and-model-guide.md).

> 🛤️ **Choose your path** before you start:
>
> - **Live multi-process path** — you have a second terminal pane (or
>   tmux split) available. You'll spawn the critic as its own
>   `copilot` process and relay messages between the two over the
>   shared hand-off file from §B.2 — the same mechanism
>   [Lab 14](lab14.md) goes on to automate.
> - **Concept / simulated path** — single terminal, restricted
>   environment, or air-gapped review. You'll run the same two-agent
>   flow using only the in-process `task` tool to dispatch sub-agents.
>   Same learning outcomes, no separate process tree.
>
> Both paths use the **Phase 3 Node app** (`node/`) as the working
> codebase so the lab series stays cumulative.

References:

- [`AGENTS.md`](../AGENTS.md) — agent suite (orchestrator, code-reviewer, planner, …)
- [`.github/agents/code-reviewer.agent.md`](../.github/agents/code-reviewer.agent.md)
- [`.copilot/lessons/`](../.copilot/lessons/) — markdown wiki agents use to preserve decisions across phase boundaries (cited in §13.4)
- [Lab 07 — Multi-Agent Orchestration](lab07.md) — the orchestrator → dev → QA → review flow you'll extend here
- [Lab 10 — Agent Memory: Personalities, Lessons, and Consolidation](lab10.md) — the wiki + schema primitives Lab 13 builds on
- [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml) — CLI version floor (general currency baseline for this lab)
- [Copilot CLI ACP server](https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server) — the real `--acp` flag referenced in §13.0's aside; not the mechanism this lab's A2A pattern uses

---

## Copilot CLI currency (2026 refresh)

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

## 13.0 What is A2A — and what is ACP?

| Term | What it means here |
|------|--------------------|
| **A2A (agent-to-agent)** | A pattern where two or more agents — each with its own context window, tool allowlist, and system prompt — collaborate on one task by exchanging messages. This lab's `task` / `write_agent` / `read_agent` tools (concept path) and separate `copilot` processes (live path) are both local mechanisms for A2A; neither runs over ACP. |
| **ACP (Agent Client Protocol)** | A *different*, real Copilot CLI feature (the `--acp` flag, public preview) that turns a single `copilot` process into a server an *external programmatic client* — an editor, IDE, or custom frontend — connects to as its agent backend. It's a client↔agent protocol, not a peer↔peer one, so it isn't the mechanism behind this lab's two-agent pattern. See the [Copilot CLI ACP server docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server). |
| **Peer agent** | An agent reachable over A2A. It's a peer (not a child) because it owns its own context and can refuse, push back, or disconnect. |
| **Sub-agent** | An agent dispatched *inside* the parent's context via the `task` tool. Cheaper than A2A, but the parent owns the transcript and the trust boundary is shared. |

**Key property:** an A2A peer is a *trust boundary*. It runs with its own
tool allowlist and its own system prompt. A sub-agent is *inside* your
trust boundary — anything it can do, you implicitly authorised.

### When to reach for A2A vs a single agent with sub-agents

Use the lighter pattern unless you actually need the heavier one. Most
"I need multi-agent!" intuitions are better served by a single agent
calling `task` with a tightly scoped prompt.

| Choose **single agent + sub-agents (`task`)** when… | Choose **A2A peers** when… |
|---|---|
| The work is one logical task with parallelisable research threads | Two roles must hold *opposing* incentives (e.g. implementer vs. critic) |
| You want a single transcript / session state | You need separate context windows so one peer's reasoning can't bias the other |
| You trust every tool the dispatched agent will call | You want a stricter tool allowlist on one of the peers (e.g. critic is read-only) |
| Latency and token cost matter | Determinism, audit trail, and role isolation matter more than tokens |

The single-agent-with-sub-agents pattern is what Lab 07 already teaches.
This lab is about the cases the Lab 07 pattern can't cleanly cover.

> 🪞 **Trust boundaries, restated.** When you call `task`, the sub-agent
> inherits your environment (cwd, env vars, MCP allowlist). When you
> spawn a peer as its own process, the peer is configured *separately*
> — it can be read-only, can be on a different model, and can even
> live in a different repo. That separation is the whole point.

---

## 13.1 Prerequisites

> 📎 **Background (not hard prerequisites).** [Lab 11](lab11.md) and
> [Lab 12](lab12.md) are useful context: Lab 11 for the plugin /
> distribution mindset, Lab 12 for a concrete MCP integration you can
> hand to a peer agent in the A2A pattern introduced below.

| Path | Prerequisite |
|------|--------------|
| Both | Copilot CLI installed and authenticated (Lab 01 setup) |
| Both | The Phase 3 Node app builds locally: `make test-node` is green |
| Both | Node dependencies installed: `pnpm -C node install` (first time only) |
| Live | Copilot CLI version `>= copilot_cli_version_floor` from the registry (run `copilot --version` to check) — general currency baseline, not an ACP-specific gate |
| Live | A second terminal pane (or tmux split) so you can watch the peer agent's pane |
| Concept | No extra setup — uses only the in-process `task` tool |

Quick check:

```bash
pnpm -C node install         # first time only — installs vitest, etc.
copilot --version            # compare against docs/_meta/registry.yaml
copilot --help | grep -q -- '--agent' && echo "ok: --agent flag present" || echo "missing — bump CLI"
make test-node               # confirm baseline
```

---

## Part A — A two-agent task: implementer + critic

You will modify a small piece of the Node app (the Students JSON list
endpoint at `node/web/routes/students-api.ts`) using two agents:

| Peer | Role | Tool allowlist | Model hint |
|------|------|---------------|------------|
| `implementer` | Reads the failing test, edits the route, runs `vitest`. Owns write access. | full file edit + `bash` (scoped to `npm`/`pnpm`/`vitest`) | a coding-strong model (e.g. `claude-opus-5`, registry `models.premium`) |
| `critic` | Reviews the diff, questions design choices, demands tests for edge cases. **Read-only**. | `view`, `grep`, `glob` only — no `edit` | a reasoning-strong model |

### A.1 Pick a target change

Use this contract for the worked example. (You can substitute any small
slice of the Node app; the pedagogy is the same.)

> Add a `?limit=N` query parameter to `GET /api/students` (the JSON
> list endpoint in `node/web/routes/students-api.ts` — **not** the
> `GET /students` HTML page route). Cap at 100. If `N` is non-numeric
> or negative, return `400` with a JSON error body matching the
> existing error shape. Keep existing tests green; add at least one
> new test per branch.

### A.2 Drive the flow from your main Copilot CLI session (concept path)

In the **concept / simulated** path you stay in one Copilot CLI session
and use the `task` tool to dispatch the two peers as sub-agents. The
trust boundary is fuzzy here — that's an *intentional* trade-off so
learners on locked-down environments can still complete the lab.

```text
You (driver) → task(name="implementer", agent_type="general-purpose",
                    mode="background", model="claude-opus-5",
                    prompt="<contract from A.1 +
                    'edit code, run vitest, report when green'>")
            → task(name="critic", agent_type="rubber-duck",
                    mode="background", model="claude-haiku-4.5",
                    prompt="<contract from A.1 +
                    'review the implementer's diff; demand tests for
                    every branch; you may NOT edit files'>")
```

> 💸 **Pass `model=…` explicitly.** The cost-budget block at the top
> of this lab only holds if you pin the cheap model on the critic and
> the strong model on the implementer. The `task` tool defaults to
> your **session** model, which silently routes everything through
> whatever you have selected (often a `models.premium` pick like
> `claude-opus-5`) and blows the
> budget. The example above shows the canonical pinning.

> 🚧 **Trust boundary on the concept path.** `agent_type="rubber-duck"`
> still has the full CLI tool surface for investigation (including
> `bash` and `lsp`); the "read-only" cell in the table above is
> enforced by **convention** on the concept path and by `--available-tools`
> on the live path in §A.3. Treat the concept path as a learning
> simulator, not a hardened sandbox.

After both agents are spawned, drive the conversation:

```text
read_agent(agent_id="<implementer-id>", wait=true)   # see initial diff
write_agent(agent_id="<critic-id>",
            message="Here is the implementer's diff: <paste>. Critique
                     against the contract. List blocking issues only.")
read_agent(agent_id="<critic-id>", wait=true)        # collect critique
write_agent(agent_id="<implementer-id>",
            message="Critic findings: <paste>. Address blocking items
                     only; restate any you reject and why.")
```

Iterate until the critic returns *"no blocking issues"* or you hit your
turn cap (see §13.3.1).

### A.3 Drive the flow on the live multi-process path

Spawn the **critic** as its own CLI process in Pane 2, scoped
read-only:

```bash
# Pane 2 — start the critic peer with a strict, read-only config.
copilot --agent rubber-duck --available-tools='view,grep,glob,lsp'
```

> 🪪 **Flag verification.** `--agent` picks a custom or built-in agent
> type at startup; `--available-tools` takes a comma-separated tool
> allowlist. Both are stable `copilot` startup flags — run
> `copilot --help` if your version's output differs from this. For
> scoped shell access instead of a blanket deny, see
> `--allow-tool='shell(git:*)'` syntax via
> `copilot --help | grep allow-tool`.

In your **driver** pane (Pane 1), drive the same loop as §A.2, but
instead of `write_agent`/`read_agent` passing messages in-process, you
relay them yourself between two real OS processes — using the shared
hand-off file from §B.2 as the artifact each peer re-reads:

```text
(Pane 1) write node/.a2a/handoff.md with the implementer's diff
       → (Pane 2) ask the critic to read the file and critique it
       → (Pane 2) critic appends its findings to the file
       → (Pane 1) read the findings, forward to the implementer → repeat
```

> 🔌 **This is what Lab 14 automates.** Here you relay messages
> between panes by hand; [Lab 14](lab14.md) replaces the manual relay
> with `tmux send-keys` so the hand-off file is written and read
> without you copy-pasting between panes.
>
> 📎 **Not to be confused with ACP.** The real `--acp` flag (see
> §13.0) turns a `copilot` process into a server for an *external
> programmatic client* to drive — not for a second interactive
> `copilot` session to peer with. Don't reach for `--acp` here; it
> solves a different problem (IDE/editor integration), and driving it
> requires writing a small client program, not typing into a pane.

### A.4 Inspect the transcript

**Concept path** — both peers retain their full conversation history
in-process. From the driver:

```text
list_agents()                    # shows status: running | idle | completed
read_agent(agent_id="<id>",      # since_turn=0 returns the full transcript
           since_turn=0)
```

**Live multi-process path** — each pane is its own session, so export
each one instead: run `/share file` in Pane 1 and again in Pane 2 to
write each peer's transcript to a Markdown file. The hand-off file
itself (`node/.a2a/handoff.md`) is also part of the record — it's the
one artifact both peers agreed on.

Save the transcript(s) to `node/.a2a-transcript-<date>.md` for later
review. Treat it as a first-class artifact — you'll quote it in the PR
body and again in §13.4 when you compare A2A patterns to single-agent
patterns.

---

## Part B — Failure modes and mitigations

Every A2A system runs into the same three pathologies. The point of
this part is to *deliberately* trigger each one in a controlled setting,
recognise the signature, and apply the mitigation.

### B.1 Looping (the critic that never says yes)

**Trigger.** Re-spawn the critic with this system prompt addition:
*"Always demand at least one more test, regardless of coverage."*

**What you'll see.** The implementer ships a diff. Critic demands "one
more edge case." Implementer adds it. Critic demands another. After 5
turns the diff is bloated and the actual contract from §A.1 has been
buried.

**Mitigation — turn cap.** Set a hard ceiling on rounds in the driver
contract. The driver, not the peers, owns this counter:

```text
MAX_TURNS = 4
on critic reply:
    if turn >= MAX_TURNS:
        force-resolve: ask critic to label remaining items
                       as "ship-blocking" or "follow-up", merge if no
                       ship-blocking remain.
```

This is a **maximum turns** / **iteration limit** rule. It belongs in
the driver, never the peers themselves.

### B.2 Context drift (the peer working from stale assumptions)

**Trigger.** After turn 2, edit the contract from §A.1 (e.g. raise the
cap from 100 to 500) but only update *one* peer.

**What you'll see.** The implementer codes against the new contract,
the critic reviews against the old one, and the loop never converges
because the two peers are arguing about different specs. Symptom: the
peers stop asking new questions and start repeating themselves.

**Mitigation — explicit hand-off contract / shared scratchpad.**
Promote the contract from §A.1 into a single shared doc that *both*
peers re-read at the top of every turn:

```text
node/.a2a/handoff.md
  ## phase
  ## inputs       (links to spec, failing test, current diff hash)
  ## outputs      (what the peer must return)
  ## open_questions
  ## acceptance   (the bar for "done")
```

Every driver message starts with: *"Re-read `node/.a2a/handoff.md`
first. Then: …"*. This is the **hand-off schema** mitigation — it costs
a handful of tokens per turn and pays for itself the first time
context drifts.

### B.3 Hand-off ambiguity (the under-specified contract)

**Trigger.** Replace the contract from §A.1 with the one-liner *"Make
the students endpoint better."*

**What you'll see.** Implementer picks an interpretation (caching?
pagination? validation?). Critic reviews against a *different* implicit
interpretation. The diff balloons; turn 3 is a meta-discussion about
what the task actually was.

**Mitigation — the hand-off contract from §B.2 *plus* an
acceptance-criteria gate.** Refuse to spawn peers until the
`acceptance` section of the hand-off doc is concrete. Rule of thumb:
if a junior engineer reading only the `acceptance` section can't tell
whether a PR meets the bar, the contract is too vague — fix that before
spending another A2A token.

> 💡 Nothing in this repo enforces this gate for you — there's no
> `orchestrator` agent file and `/orchestrate` isn't a Copilot CLI
> command (it belongs to the separate GitHub Copilot app). Lab 13 is
> teaching you the *why* behind the gate so you apply it as discipline:
> refuse to spawn peers yourself until the hand-off doc's `acceptance`
> section is concrete.

---

## 13.4 Where this fits in the wider toolkit

A2A is the *most expensive* coordination pattern in this repo. Reach
for the cheaper ones first:

| Pattern | When it wins |
|---|---|
| **Single agent**, well-prompted | Routine work, one role, one trust boundary |
| **Single agent + `task` sub-agents** (Lab 07) | Parallel research threads, same trust boundary |
| **Single agent + rubber-duck critique** | You want a sanity-check pass without standing up a peer (see the `rubber-duck` agent type and the `code-reviewer` custom agent) |
| **A2A peers** (this lab) | Roles must hold opposing incentives or live in different trust boundaries |
| **Orchestrator + tmux pattern** ([Lab 14](lab14.md)) | A2A made operational across many phases — long-lived orchestrator pane, short-lived workers, `/clear` between phases |

Two skills already in this repo are direct prerequisites for getting A2A
right:

- **`rubber-duck`** (built-in agent type) — the "critic without standing
  up a peer" baseline. If a rubber-duck pass would have caught the
  issue, you didn't need A2A.
- **`.copilot/lessons/`** (markdown wiki, Lab 10) — A2A burns context fast
  across both peers. Before `/clear` at a phase boundary, promote durable
  decisions into a lesson file so the next peer can recall them without
  replaying the whole transcript.

---

## 13.5 Wrap-up checklist

Before you close the lab, confirm:

- [ ] You ran the two-agent loop end-to-end on at least one path (live or concept).
- [ ] You can name the three failure modes (looping, context drift, hand-off ambiguity) and the mitigation each one demands (turn cap, shared hand-off doc, acceptance gate).
- [ ] You can articulate, in one sentence, the rule for choosing A2A over a single agent with sub-agents.
- [ ] You saved the transcript from §A.4 somewhere reviewable.
- [ ] You re-read [`AGENTS.md`](../AGENTS.md) with fresh eyes — the orchestrator and rubber-duck entries should now read as A2A primitives, not just "more agents."

### Next steps

- **[Lab 14](lab14.md)** puts this pattern on rails with a
  tmux-based orchestrator deep-dive and shipped helper scripts. The
  hand-off doc schema introduced in §B.2 is the contract Lab 14 will
  automate.
- Try the two-agent loop on a real PR in your fork. The first time it
  catches a bug a single-agent flow missed, you'll feel why the
  pattern earns its overhead.

## 13.6 Cleanup

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
