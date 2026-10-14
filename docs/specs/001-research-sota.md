---
id: "001"
title: "Research: State of the GitHub Copilot Surface (SOTA)"
status: draft
created: 2026-10-14
updated: 2026-10-14
depends_on: []
blocks:
  - docs/specs/002-lab10-memory.md
related_issue: "kanang29/day-in-the-life-copilot-lab#3"
---

# 001 — Research: State of the GitHub Copilot Surface (SOTA)

> 📁 **Path note:** this document lives at `docs/specs/001-research-sota.md`,
> not a bare `specs/` directory, for two concrete reasons: this repo's own
> `scripts/hooks/pre-tool-use-doc-blocker.sh` only allows new Markdown files
> under `docs/`, `.github/`, `labs/`, `solutions/`, or `plugin-template/`;
> and Lab 18 already establishes `docs/specs/*.md` as this repo's
> spec-writing convention (see `labs/lab18.md` §18.1, which has a learner
> save a spec to `docs/specs/course-prerequisites.md`). The `001-`, `002-`,
> … numbering follows that same convention.

## Purpose and scope

Issue [#3 "Brother Hackathon: Lab curriculum refresh"](https://github.com/kanang29/day-in-the-life-copilot-lab/issues/3)
asks the curriculum to be **correct** (every command runs, every path
resolves, every version matches `docs/_meta/registry.yaml`) and **current**
(agents, skills, prompt files, instruction precedence, CLI extensions,
plugins, gh-aw, MCP, coding agent, code review, memory, and the model
lineup have all moved in 2026). **Nothing in this document proposes lab
edits.** Its only job is to answer, with cited primary sources, "what is
actually true right now" for those twelve areas, so that any lab-by-lab
correctness pass — starting with Lab 10, which the issue singles out for
[its own spec](002-lab10-memory.md) — has verified facts to work from
instead of re-deriving them.

Every claim below is tagged with how it was established (see
[Method](#method--how-claims-were-verified)); a search-engine summary alone
is treated as a lead, not a source, so unconfirmed leads are marked
`UNVERIFIED — blocked` rather than stated as fact (see claim 16 for a
concrete example of why that distinction matters).

## Method — how claims were verified

Three tiers of confidence are used:

| Tag | Meaning |
|-----|---------|
| **VERIFIED** | A primary source (a `docs.github.com` page, or a GitHub repository itself) was opened directly in this session and the claim below reflects what that fetch returned. The URL is the citation. |
| **PARTIALLY VERIFIED** | A primary source was opened, but it only confirms part of the claim, or the claim required reconciling two primary sources that disagree. |
| **UNVERIFIED — blocked** | A search-engine summary surfaced a lead, but the sandbox this research ran in could not reach the primary source to confirm it (DNS/network block). These do **not** count as facts and must not be copied into a lab until re-verified from an environment that can reach the source. |

Two domains were unreachable from this session's sandbox for every attempt:
`github.blog` and `modelcontextprotocol.io` (both failed DNS resolution).
`docs.github.com`, `github.com`, and `raw.githubusercontent.com` were
reachable. This is itself a finding: **whoever re-runs this research later
needs network egress to `github.blog` and `modelcontextprotocol.io`, or
they cannot verify changelog- and MCP-spec-sourced claims at all** — a
meaningful fraction of this repo's existing citations (e.g.
`docs/_meta/registry.yaml`'s MCP spec note, several `github.blog/changelog/...`
links already in labs) point at exactly those two domains.

## Baseline this repo already pins

`docs/_meta/registry.yaml` is this repo's single source of truth for
versions (per `CONTRIBUTING.md`); this spec does not re-litigate it, only
notes where live research agrees or disagrees with it so a future
correctness pass doesn't have to re-derive the same checks:

| Registry key | Current pin |
|---|---|
| `copilot_cli_version_floor` | `1.0.82` |
| `gh_aw_schema_version` | `0.86.2` (registry's own note: upstream latest was `v0.88.2` as of 2026-09-04) |
| `mcp_protocol_spec_version` | `2026-07-28` |
| `models.standard` | `claude-sonnet-4.6`, `claude-sonnet-5`, `gpt-5.2` |
| `models.premium` | `claude-opus-4.7`, `claude-opus-5`, `gpt-5.3-codex`, `grok-4.6` |

## Findings by topic

### 1. Agents (custom agents)

- **VERIFIED** — [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration):
  the `infer` frontmatter property is now **"Retired"**. The replacement is
  two separate properties: `disable-model-invocation` (equivalent to
  `infer: false`) and `user-invocable`. If both `disable-model-invocation`
  and the retired `infer` are set, `disable-model-invocation` wins.
  - This repo's own [`docs/accuracy-ledger-decisions.md`](../accuracy-ledger-decisions.md)
    already checked this exact claim and found no lab currently teaches
    `infer:`, so there is no in-bounds correction pending — but any
    *future* lab content that introduces agent auto-delegation should teach
    `disable-model-invocation`/`user-invocable`, not `infer`.
  - Custom agent `target:` is documented as `vscode` or `github-copilot`
    (unset = both); custom agents are explicitly "in public preview for
    JetBrains IDEs, Eclipse, and Xcode."
- **VERIFIED** — The agent config file's name (minus `.md`/`.agent.md`) is
  used for deduplication between levels, and **"the lowest level
  configuration takes precedence."** This confirms (without contradicting)
  the precedence model this repo's Lab 10 already teaches for instructions.

### 2. Skills

- **VERIFIED** — [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills):
  Agent Skills is described as "an [open standard](https://github.com/agentskills/agentskills),
  used by a range of different AI systems" (not a GitHub-only format).
  Supported project-scope storage paths are **`.github/skills`,
  `.claude/skills`, or `.agents/skills`**; personal-scope paths are
  **`~/.copilot/skills` or `~/.agents/skills`**. This repo's
  `.github/skills/` layout matches the first option.
  - **New, not yet reflected anywhere in this repo:** `gh skill` is now a
    GitHub CLI command for discovering and installing skills from GitHub
    repositories, documented under "Managing skills with GitHub CLI." No
    lab currently mentions `gh skill`.

### 3. Prompt files

- **VERIFIED** — [Your first prompt file](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file):
  "Prompt files are only available in VS Code, Visual Studio, and JetBrains
  IDEs" and remain in **public preview**. This directly confirms the finding
  already recorded and **applied** in this repo's
  [`docs/accuracy-ledger-decisions.md`](../accuracy-ledger-decisions.md)
  (the "prompt files work in Copilot CLI" claim was corrected in four files).
  No further action needed here — recorded for completeness since issue #3
  names "prompt files" explicitly.

### 4. Instruction hierarchy and precedence

- **VERIFIED** — [Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions):
  three distinct instruction types are current:
  1. **Repository-wide** — `.github/copilot-instructions.md`.
  2. **Path-specific** — one or more `NAME.instructions.md` files in or
     below `.github/instructions/`. Docs state explicitly: *"If the path
     you specify matches a file that Copilot is working on, and a
     repository-wide custom instructions file also exists, then the
     instructions from both files are used"* — i.e. these two types are
     **additive**, not override-each-other.
  3. **Agent instructions** — one or more `AGENTS.md` files anywhere in the
     repo; **"the nearest `AGENTS.md` file in the directory tree will take
     precedence"** when Copilot is working on a file. A single root
     `CLAUDE.md` or `GEMINI.md` is also accepted as an alternative to
     `AGENTS.md`.
  - This repo's layout (root `AGENTS.md` + `.github/copilot-instructions.md`
    + `.github/instructions/*.instructions.md`) matches current docs
    exactly, and Lab 10 §10.3 already teaches this layering correctly.

### 5. CLI extensions (Copilot CLI surface)

- **VERIFIED** — [GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-cli)
  (this URL is itself a finding — see [§9](#9-coding-agent)):
  - Plan mode is confirmed current, toggled with `Shift+Tab` — matches what
    Lab 10 §10.0 already teaches.
  - **Not yet taught anywhere in this repo:** local sandboxing via
    `/sandbox enable` inside a session, and **cloud sandboxing** via
    `copilot --cloud` (public preview) — "cloud sandbox policies inherit
    from Copilot cloud agent policies."
- **VERIFIED** — [Adding MCP servers for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers):
  current management surfaces are the `/mcp add` interactive command, the
  `copilot mcp add` subcommand, and direct edits to
  `~/.copilot/mcp-config.json`. A **GitHub MCP server ships built into
  Copilot CLI already** — no configuration needed for it specifically.

### 6. Plugins

- **PARTIALLY VERIFIED — likely drift** — [About GitHub Copilot plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins)
  describes **two current plugin manifest formats**:
  - **Agent Plugins 1.0** — manifest file is `plugin.json` (JSON) at the
    plugin root, with `$schema: https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.
    Skills live under `skills/`, MCP config in `mcp.json` at the plugin
    root; Copilot-specific components (agents, hooks, commands, rules, LSP)
    live under a `com.github.copilot/` subdirectory. These discovery paths
    are fixed and not configurable.
  - **Legacy Copilot plugins** — no `$schema`; configurable component
    paths; MCP configuration in `.mcp.json`, `.github/mcp.json`, or an
    `mcpServers` manifest field.
  - This repo's `plugin-template/manifest.yaml` and
    `modernization-bundle/manifest.yaml` use neither name exactly: the
    manifest file is `manifest.yaml` (YAML, not `plugin.json`), has no
    `$schema`, and declares an `mcp_servers:` key (underscore, not
    camel-case `mcpServers`) directly in the manifest. **This needs a
    maintainer decision, not a unilateral fix**: either (a) the
    `manifest.yaml` convention predates and is simply a custom in-repo
    illustrative format for Lab 11/16 that was never meant to match a real
    Copilot CLI manifest 1:1, in which case Lab 11 should say so
    explicitly, or (b) it was meant to track the real format and has
    drifted, in which case a future lab-correctness pass should scope a
    Lab 11/16 update. Flagging only — **no lab or template file is changed
    by this spec.**
  - Current CLI plugin commands confirmed live: `copilot plugin marketplace
    list/browse/add/remove`, `copilot plugin install/list/update/uninstall/
    disable/enable`, default marketplace `awesome-copilot`. These match
    what Lab 11/16 already teach.

### 7. gh-aw (GitHub Agentic Workflows)

- **VERIFIED** — `https://github.com/githubnext/gh-aw` now **redirects** to
  `https://github.com/github/gh-aw` — the project has moved from the
  `githubnext` incubation org to the official `github` org.
  - **Drift found:** `labs/lab-gh-extensions.md` still installs via
    `gh extension install githubnext/gh-aw` and states *"no canonical
    `docs.github.com` page. Source: `https://github.com/githubnext/gh-aw`"*
    — both the org name and the "no docs" claim are stale. A canonical docs
    site now exists at `https://github.github.com/gh-aw/` (referenced from
    the `github/gh-aw` repo's own README), distinct from `docs.github.com`.
    `labs/lab08.md` already cites the current `github/gh-aw` URL, so the
    drift is isolated to `lab-gh-extensions.md`.
  - The `github/gh-aw` README also discloses a published security advisory
    ([GHSA-8h78-hpm7-29gg](https://github.com/github/gh-aw/security/advisories/GHSA-8h78-hpm7-29gg))
    affecting versions `>= 0.83.3, < 0.85.4`, retired as a precaution. This
    repo's pinned `gh_aw_schema_version: "0.86.2"` in `registry.yaml` is
    outside that affected range — no action needed, noted for completeness.
- **UNVERIFIED — blocked**: the exact current upstream `gh-aw` release
  number (registry.yaml's own comment estimates `v0.88.2` as of
  2026-09-04) could not be confirmed this session — the GitHub REST
  releases API returned `403 Forbidden` in this sandbox (the same failure
  mode already visible in `tests/workflows/weekly-audit-*.test.ts`, which
  call `gh aw compile` and fail for the identical reason), and the
  `github.com/github/gh-aw/releases` HTML page did not return a parseable
  release list via fetch. This is an environment limitation, not a claim
  about the real value — do not treat "0.88.2" as confirmed.

### 8. MCP (Model Context Protocol)

- **VERIFIED** — [Adding MCP servers for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)
  confirms **SSE is explicitly labelled deprecated**: *"SSE uses the legacy
  HTTP with Server-Sent Events transport, which is deprecated in the MCP
  specification but still supported for backwards compatibility."* This
  matches the finding already **applied** in this repo's accuracy ledger
  (`workshop/slides/20-module-2.md`).
- **UNVERIFIED — blocked**: `docs/_meta/registry.yaml`'s claim that the
  **2026-07-28 MCP spec revision** removed protocol-level sessions
  (no `Mcp-Session-Id`, no stateful `initialize` handshake) could not be
  independently re-opened this session — `modelcontextprotocol.io` failed
  DNS resolution from this sandbox on every attempt. This claim is already
  treated as load-bearing by Lab 05 and Lab 10 (`mcp_protocol_spec_version`
  in the registry). It should be the **first** item re-checked from an
  environment with access to that domain, precisely because so much
  downstream content depends on it and this session could not re-confirm it
  from a primary source.

### 9. Coding agent

- **VERIFIED** — `https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent`
  (the exact URL cited today by `labs/lab18.md`'s References section)
  returns **404**. The content now lives under a renamed concept: fetching
  `https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli`
  (a different, but related, page) returned an automatic redirect to
  `https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-cli`,
  confirming GitHub's docs IA reorganized the `copilot/concepts/agents/*`
  tree into `copilot/concepts/copilot-surfaces/*` for at least the CLI page.
  Independently, [Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review)
  and the MCP CLI docs both now say **"Copilot cloud agent"**, not
  "Copilot coding agent," when referring to the autonomous PR-creating
  agent (e.g. *"compatible with VS Code, the Copilot cloud agent, and other
  MCP clients"*; *"passing suggestions to Copilot cloud agent"*).
  - **Conclusion, drift confirmed:** the product has been renamed
    **"Copilot coding agent" → "Copilot cloud agent"**, and at least one
    citation this repo relies on (`labs/lab18.md`'s "About Copilot Coding
    Agent" reference) now 404s. `registry.yaml`'s `labs:` block and several
    lab titles (e.g. Lab 09 "Copilot Coding Agent & Code Review") still use
    the old name. Renaming the *lab title* is a judgment call for whoever
    next revises Lab 09 — this spec only confirms the underlying docs fact
    and the specific broken link.

### 10. Code review

- **VERIFIED** — [About GitHub Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review):
  availability has grown to GitHub.com, GitHub CLI, GitHub Mobile, VS Code,
  Visual Studio, Xcode, JetBrains IDEs, **and Azure DevOps (public
  preview)** — the last one is not mentioned in any lab today. Also
  current: organizations can now let members **without a Copilot license**
  use Copilot code review (two policies, enterprise-gated), and review
  "effort levels" (Lite vs. Balanced) have published cost ranges ($0.05–$1
  Lite, $0.25–$5 Balanced, in AI credits). None of this contradicts
  anything currently taught in Lab 09; it is additive content for a future
  Lab 09 pass to scope as an enhancement, not a correction.

### 11. Memory

- No external primary source applies here beyond what Lab 10 already cites
  correctly (the `.copilot/lessons/` pattern is this repo's own
  application-layer convention, not a protocol feature). The MCP-spec
  caveat in [§8](#8-mcp-model-context-protocol) is the one piece of this
  area that remains **UNVERIFIED — blocked** rather than confirmed.
  Issue #3 asks Lab 10's dedicated spec to additionally cover **loop
  engineering** and **graph engineering**, and optionally to use "the local
  SCNS project" as a per-directory-vault example. This session confirmed by
  search that **no file, directory, or reference to "SCNS" exists anywhere
  in this repository** (`grep -ri SCNS` across the full tree returns
  nothing) and that, at the time this claim was checked, **neither "loop
  engineering" nor "graph engineering" appeared anywhere in this repo**.
  [`docs/specs/002-lab10-memory.md`](002-lab10-memory.md) could not assume
  either existed and had to source or define both terms from this repo's
  own artifacts rather than adapt prior art.

### 12. Model lineup

- **VERIFIED** — [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models),
  fetched live, lists the current GA model table. Cross-referencing it
  against `docs/_meta/registry.yaml`'s `models:` block:

  | Registry entry | On current GA list? | Note |
  |---|---|---|
  | `claude-haiku-4.5` | ✅ yes | — |
  | `claude-sonnet-4.6` | ✅ yes | — |
  | `claude-sonnet-5` | ✅ yes | — |
  | `gpt-5-mini` | ✅ yes | — |
  | `gpt-5.4-mini` | ✅ yes | — |
  | `gpt-5.3-codex` | ✅ yes | also named the Auto-selection long-term-support (LTS) fallback model |
  | `claude-opus-5` | ✅ yes | — |
  | `grok-4.6` | ✅ yes | — |
  | `gpt-5.2` | ❌ **not found** | the live list has no plain "GPT-5"/"GPT-5.2" entry at all |
  | `claude-opus-4.7` | ❌ **not found** | the live list has Opus 4.8, 5, and 5.5, but no 4.7 |

  Additionally, models **not yet in `registry.yaml` at all** are already
  GA: Claude Sonnet 5.5, Claude Opus 4.8 (+ fast mode preview), Claude Opus
  5.5, Claude Haiku 5.5, Claude Fable 5 / 5.1, GPT-5.5, GPT-5.6 (Luna/Sol/
  Terra), GPT-6 (Astra/Luna/Sol), GPT-6.1 Sol, Gemini 3.7/3.8 Flash, Gemini
  4 Argon, MAI-Code-1.1-Flash, Kimi K3, Grok 4.5, Grok 4.7.
  - **Caution on this finding:** absence from a "Supported AI models" table
    is strong evidence a model name is retired or never existed under that
    exact name, but this spec does not assert a specific retirement date
    for `gpt-5.2` or `claude-opus-4.7` because no explicit deprecation
    notice (unlike the Claude Fable footnote, which *is* explicit) was
    found for either. Whoever next refreshes `registry.yaml`'s `models:`
    block should treat it as needing a maintainer-driven pass, informed by
    this table, rather than this spec silently rewriting it.
  - **UNVERIFIED — blocked**: a web search claimed Claude Sonnet 4.5 and
    4.6 were both deprecated on 2026-09-01 in favor of Sonnet 5/5.5. The
    live GA table directly **contradicts half of that claim** — Sonnet 4.6
    is still listed as GA. The source changelog URL the search cited
    (`github.blog/changelog/...`) could not be opened from this sandbox to
    resolve the discrepancy. This is the clearest example this session
    produced of why a search-engine summary is treated as a lead, not a
    source, throughout this document: treating that summary as fact would
    have put a wrong claim in front of the next reader.

## Verification ledger

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | `infer:` is retired; use `disable-model-invocation` + `user-invocable` | [custom-agents-configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration) | VERIFIED |
| 2 | Agent skills storage paths (`.github/skills` etc.) and `gh skill` CLI command | [about-agent-skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) | VERIFIED |
| 3 | Prompt files are IDE-only (VS Code/VS/JetBrains), public preview | [your-first-prompt-file](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file) | VERIFIED (already applied in this repo) |
| 4 | `AGENTS.md` nearest-file-wins; repo-wide + path-specific instructions are additive | [add-repository-instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions) | VERIFIED |
| 5 | Plan mode (`Shift+Tab`), local `/sandbox enable`, cloud `copilot --cloud` | [copilot-cli](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-cli) | VERIFIED |
| 6 | MCP server management (`/mcp add`, `copilot mcp add`, built-in GitHub MCP server) | [add-mcp-servers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) | VERIFIED |
| 7 | Two plugin manifest formats (`plugin.json` Agent Plugins 1.0 vs. legacy); this repo's `manifest.yaml` matches neither exactly | [about-plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins) | PARTIALLY VERIFIED |
| 8 | `githubnext/gh-aw` → `github/gh-aw` move; `lab-gh-extensions.md` not updated | [github/gh-aw](https://github.com/github/gh-aw) (redirect observed directly) | VERIFIED |
| 9 | Upstream `gh-aw` exact latest release number | GitHub releases API / HTML | UNVERIFIED — blocked (403 / unparseable) |
| 10 | SSE transport deprecated in MCP spec | [add-mcp-servers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) | VERIFIED (already applied in this repo) |
| 11 | 2026-07-28 MCP spec revision removed protocol-level sessions | `modelcontextprotocol.io` (unreachable) | UNVERIFIED — blocked |
| 12 | "Copilot coding agent" docs URL cited by `lab18.md` now 404s; product renamed "Copilot cloud agent" | direct fetch of the cited URL + [code-review](https://docs.github.com/en/copilot/concepts/agents/code-review) | VERIFIED |
| 13 | Copilot code review now available on Azure DevOps (preview) and to unlicensed org members | [code-review](https://docs.github.com/en/copilot/concepts/agents/code-review) | VERIFIED |
| 14 | No "SCNS", "loop engineering", or "graph engineering" content exists anywhere in this repo today | full-tree `grep` run in this session | VERIFIED |
| 15 | `gpt-5.2` and `claude-opus-4.7` absent from the current Supported AI Models GA table | [supported-models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) | VERIFIED |
| 16 | Claude Sonnet 4.5 **and** 4.6 both deprecated 2026-09-01 | web search only, citing an unreachable `github.blog` changelog | UNVERIFIED — blocked; contradicted in part by claim 15's own source (4.6 still GA) |

## Handoff — inputs for Lab 10's spec and future lab passes

This section is advisory input, not a decision.
[`docs/specs/002-lab10-memory.md`](002-lab10-memory.md) consumes claim 14
directly. The remaining claims below aren't blocking anything today, but
they're recorded here so a future correctness pass on the affected labs
doesn't have to re-derive them:

- **gh-aw org rename (claim 8) and "Copilot coding agent" rename
  (claim 12):** concrete, dated drift in `labs/lab-gh-extensions.md` and
  `labs/lab18.md`'s References section respectively (the latter cites a
  URL that now 404s). Whoever next touches those labs should fix the
  specific broken link and installation command; the lab title / naming
  decision for Lab 09 is a separate judgment call.
- **`infer:` retirement (claim 1) and plugin manifest format (claim 7):**
  concrete, dated, primary-sourced facts a lab could get wrong silently if
  rewritten without checking this spec first.
- **Claim 14 (no prior SCNS/loop-engineering/graph-engineering content):**
  addressed directly by `docs/specs/002-lab10-memory.md`, which had to
  source or define those terms from this repo's own artifacts rather than
  adapt prior art.
- **Claims 9, 11, and 16** are explicitly **not** resolved by this document
  and must not be copied into any lab as fact until re-checked from an
  environment that can reach `github.blog` and `modelcontextprotocol.io`.

## Status and next step

This document is `status: draft`. The next action on it is human review —
either confirming the findings above are acceptable as `verified`, or
sending any of the `UNVERIFIED — blocked` items back for re-research from
an environment that can reach `github.blog` and `modelcontextprotocol.io`.
Nothing in this repository currently gates other work behind that review;
it exists so facts stay traceable to a primary source rather than being
re-asserted from memory.
