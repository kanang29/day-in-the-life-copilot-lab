---
title: "Exploring Copilot Configuration"
lab_number: 1
tier: beginner
surface: vscode
pace:
  presenter_minutes: 4
  self_paced_minutes: 10
registry: docs/_meta/registry.yaml
---

# 1 — Exploring Copilot Configuration

In this lab you will discover and understand the Copilot configuration files that ship with this repository.

> ⏱️ Presenter pace: 4 minutes | Self-paced: 10 minutes

References:
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- [Prompt files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files)
- [Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)

> 🖥️ **Surface:** every required step below works entirely inside **VS Code's
> Copilot Chat** (agent mode) — no standalone Copilot CLI install needed. If
> you also have the CLI set up, an **Advanced (optional)** section at the end
> of this lab shows the CLI-only power features (plugin marketplace, `/fleet`,
> slash commands) for later reference; none of them are required for Lab 01
> or any lab through Lab 10.

## 1.1 The Configuration Ecosystem

This repository ships with a rich set of Copilot configurations. Here's the map — the rest of the labs fill it in:

| Directory | What | Count | Lab |
|-----------|------|-------|-----|
| `.github/agents/` | Specialized AI personas (`.agent.md`) | 3 (+ more in Lab 03) | Lab 03 |
| `.github/skills/` | Auto-activating knowledge packs (`SKILL.md`) | 6 | Lab 04 |
| `.github/prompts/` | Reusable command templates (`.prompt.md`) | 19 | Lab 04 |
| `.github/instructions/` | Path-specific rules (`.instructions.md`) | 4 | Lab 02 |
| `.github/copilot-instructions.md` | Repository-wide rules (always loaded) | 1 | Lab 02 |
| `AGENTS.md` | Non-obvious project context (always loaded) | 1 | Lab 02 |
| `.github/hooks/` | Lifecycle guardrails (`default.json`) | 4 lifecycle hook events (`preToolUse`, `postToolUse`, `userPromptSubmitted`, `errorOccurred`) | Lab 06 |
| `.copilot/mcp-config.json` | External tool integrations | 4 servers | Lab 05 |
| `.github/workflows/*.md` | Cloud-side AI automation (gh-aw) | 3 | Labs 08-09 |

💬 **Quick look — ask Copilot Chat (Agent mode):**

```text
List the files in .github/agents/, then show me the contents of
.github/agents/planner.agent.md so I can see the anatomy of an agent file.
```

Copilot reads both the directory and the file itself — no terminal needed.

<details>
<summary>Prefer the terminal?</summary>

**WSL/Bash:**
```bash
# See the agents
ls .github/agents/

# Read one to see the anatomy (YAML frontmatter + markdown body)
cat .github/agents/planner.agent.md
```

**PowerShell:**
```powershell
# See the agents
Get-ChildItem .github/agents/

# Read one to see the anatomy (YAML frontmatter + markdown body)
Get-Content .github/agents/planner.agent.md
```

</details>

## 1.2 The Instruction Hierarchy

Copilot loads configuration in a specific priority order. Understanding this is the single most important concept:

| Priority | Source | When Loaded |
|----------|--------|-------------|
| 1 | `.github/copilot-instructions.md` | **Always** — every interaction |
| 2 | `AGENTS.md` | **Always** — every interaction |
| 3 | `.github/instructions/*.instructions.md` | When `applyTo` glob matches files in context |
| 4 | `.github/skills/*/SKILL.md` | When description matches the conversation topic |
| 5 | Agent profile (`.agent.md`) | When explicitly invoked with `@agent-name` |
| 6 | Prompt (`.prompt.md`) | When invoked with `/prompt-name` |

> 💡 **Key insight:** Instructions cascade and stack. If `copilot-instructions.md` says "use immutable patterns" and `dotnet.instructions.md` says "use async/await", **both** apply when editing `.cs` files.

## 1.3 How Copilot Finds Your Code

Copilot doesn't just do keyword text search — it uses multiple layers of code intelligence:

| Layer | How It Works | Scope |
|-------|-------------|-------|
| **Semantic indexing** | Builds a meaning-based index of your codebase. Near-instant (seconds). Understands intent, not just keywords. | Local repo |
| **LSP integration (GA)** | When a language server is configured (project `.github/lsp.json` or personal `~/.copilot/lsp-config.json`), Copilot automatically prefers it over text search for go-to-definition, find references, hover, rename, workspace symbol search, go-to-implementation, and call hierarchy — no slash command needed. See [Lab 15 — LSP & Code Intelligence](lab15.md). | Local repo |
| **ripgrep + glob** | Fast pattern-based search for exact matches across files — the fallback when no LSP server is configured for a language | Local repo |
| **GitHub MCP** | Semantic code search across **any GitHub repo** you have access to — remotely. The agent can scan codebases it's never seen locally. | Remote (GitHub) |

> 💡 When you ask Copilot "how does authentication work in this project?", it's using semantic search — not `grep`. It understands meaning. And with the GitHub MCP server, it can do the same across remote repos. For precise symbol-level navigation (go-to-definition, rename, call hierarchy), Copilot reaches for a configured LSP server before falling back to text search.

## 1.4 Try It

💬 **In VS Code's Copilot Chat:**

1. Open the Chat view and switch to **Agent mode**.
2. Open the **agent picker** (the agent dropdown at the bottom of the chat
   view) and select **`planner`**.
3. Ask:

   ```text
   How should I add a student search feature to ContosoUniversity?
   ```

> 💡 Notice how Copilot references the project's architecture, file structure, and conventions — all loaded from the configuration files we just explored. This is semantic search in action.

> 💡 Copilot loads workspace agents from `.github/agents/` in your open
> folder. You can also create personal agents that follow you across
> workspaces — pick **User profile** instead of **Workspace** when creating
> one from the agent picker.

## 1.5 Final

<details>
<summary>Key Takeaways</summary>

| Concept | File Location | Purpose |
|---------|--------------|---------|
| **Agents** | `.github/agents/*.agent.md` | Specialized AI personas with defined tools |
| **Skills** | `.github/skills/*/SKILL.md` | Auto-activating knowledge bases |
| **Instructions** | `.github/copilot-instructions.md` | Always-on repo-wide rules |
| **Path Instructions** | `.github/instructions/*.instructions.md` | Rules for specific file types |
| **AGENTS.md** | `AGENTS.md` (repo root) | Non-obvious project context (keep minimal) |
| **Prompts** | `.github/prompts/*.prompt.md` | Reusable prompt templates |
| **Hooks** | `.github/hooks/default.json` | Lifecycle guardrails |
| **MCP** | `.vscode/mcp.json` (VS Code) / `.copilot/mcp-config.json` (CLI) | External tool integrations |

</details>

## Advanced (optional): Copilot CLI power features

> 🔧 Everything below needs the standalone **Copilot CLI** installed — it's
> not available from VS Code's Copilot Chat. Nothing here is required for
> this lab or any lab through Lab 10; skip to [Lab 02](lab02.md) if you're
> staying VS Code-only. Lab 11 is a full CLI-and-plugins lab.

| Capability | Command / surface | Use when |
|------------|-------------------|----------|
| **Browse a plugin marketplace** | `copilot plugin marketplace list` / `browse awesome-copilot` | Finding community agents for a stack (e.g. .NET, testing) before writing your own. Lab 11 publishes a plugin using this same surface. |
| **Install a plugin** | `copilot plugin install OWNER/REPO` (or `PLUGIN-NAME@marketplace`) | Pulling a marketplace or private-registry plugin, e.g. `copilot plugin install github/awesome-copilot`. |
| **Use an installed plugin** | `copilot`, then `/plugin-name help me with my task` (interactive) or `copilot --prompt "/plugin-name ..." --allow-all-tools` (scripted) | Once installed, plugins behave like slash commands in a CLI session. |
| **Parallel subagents** | `/fleet` | Running independent research or implementation threads in one session. |
| **Plan mode vs autopilot mode** | `Shift+Tab` (plan mode, review each step) vs autopilot mode (batch execute) | Plan mode for exploratory/risky work; autopilot mode for scripted, well-understood tasks. |
| **Mid-session model switch** | `/model <tier-or-id>` | Downshift to `models.cheap` in the registry for routine edits; upshift to `models.premium` for deep reasoning. |
| **Local tool discovery** | `/skills`, `/plugin`, `/mcp` | Browse the skills, plugins, and MCP servers available to the CLI session. |

> 💡 Commands are current as of this refresh; versions, model tiers, and MCP
> pins live in [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml) so
> labs stay consistent as the CLI evolves.

References:
- [Finding and installing plugins](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing)
- [Creating custom agents for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli)
- [Creating extensions for GitHub Copilot CLI](https://docs.github.com/en/copilot/tutorials/create-an-extension)

**Next:** [Lab 02 — Custom Instructions & AGENTS.md](lab02.md)
