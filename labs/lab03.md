---
title: "Creating a .NET Development Agent"
lab_number: 3
tier: beginner
surface: vscode
pace:
  presenter_minutes: 4
  self_paced_minutes: 15
registry: docs/_meta/registry.yaml
---

# 3 — Creating a .NET Development Agent

> **Two ways to follow this lab**
> - **In VS Code:** create the agent file, configure its tools, and select it
>   from the Copilot Chat agent picker.
> - **In Copilot CLI:** use the same `.agent.md` file from a CLI session in
>   the repository; configure CLI tool access using the CLI-specific notes
>   below rather than VS Code's tool configuration.

In this lab you will create a custom agent specialized for .NET development with ContosoUniversity.

> ⏱️ Presenter pace: 4 minutes | Self-paced: 15 minutes

References:
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [MCP servers in agents](https://docs.github.com/en/copilot/reference/custom-agents-configuration#mcp-servers)

## 3.1 Understand Agent Anatomy

Before creating your own agent, let's understand what makes up an agent file.

🖥️ **In your terminal (From the repository root):**

1. Look at an existing agent to understand the structure:

**WSL/Bash:**
```bash
head -30 .github/agents/planner.agent.md
```

**PowerShell:**
```powershell
Get-Content .github/agents/planner.agent.md -Head 30
```

2. An agent file has two parts:

**YAML Frontmatter** (between `---` markers):
```yaml
---
name: "agent-name"           # How users invoke: @agent-name
description: "What it does"  # Copilot uses this for routing
tools: ["read", "edit", "execute", "search"]  # Available tools
---
```

**Markdown Body**: The system prompt — personality, expertise, instructions, patterns.

3. Available tools:

| Tool | Purpose |
|------|---------|
| `read` | Read files from the workspace |
| `edit` | Create and modify files |
| `execute` | Run shell commands |
| `search` | Search across files with grep/glob |
| `agent` | Delegate to other agents |
| `web` | Search the web |

## 3.2 Create the Agent File (per track)

The exercise here is to create a **track-specific** dev agent — one that knows your codebase's project layout, build commands, and conventions. The full agent body lives in your track's appendix:

- **.NET track:** [`labs/appendices/dotnet/lab03.md`](appendices/dotnet/lab03.md) — `dotnet-dev` agent with EF Core / xUnit conventions
- **Node track:** [`labs/appendices/node/lab03.md`](appendices/node/lab03.md) — `node-dev` agent with Fastify / Drizzle conventions

All paths in the appendices are relative to the repository root — `cd` there before running any of the appendix commands.

Both appendices walk through:

1. Creating **`.github/agents/<track>-dev.agent.md`** — note the **`.agent.md`** suffix is **mandatory** (not stylistic). *Copilot CLI globs `**/*.agent.md` to discover agents; a plain `.md` file will not be picked up.*
2. A system prompt that names the project layout, coding standards, and review checklist.
3. Verifying the agent loads with `head -5` (or `Get-Content -Head 5`).

> 🔄 **Restart required after creating the agent file**
>
> Copilot CLI and the VS Code Copilot extension discover `.github/agents/*.agent.md` files **once at session start** — agent definitions are **not** hot-reloaded when you save. Skip the restart and `@<track>-dev` will return *"unknown agent"* even though the file is on disk.
>
> After creating (or editing) the agent file:
>
> 1. **In VS Code:** run **Developer: Reload Window** from the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) so the extension re-reads `.github/agents/` and the new agent shows up in the agent picker.
> 2. **Using the Copilot CLI too?** Exit the session (type `exit` or press <kbd>Ctrl</kbd>+<kbd>D</kbd>) and restart it with `copilot`.

> 💡 **Verify the agent loads:** After reloading, open the agent picker at the bottom of the Chat view — `<track>-dev` should now be listed. Select it and ask `What files are in this project?`. If the agent responds, it's working. If it's missing from the picker, confirm the filename ends in `.agent.md` (not `.md`) and lives under `.github/agents/`.

## 3.3 Configure Tools and MCP Servers

The agent we created uses basic tools. Let's understand how to add MCP server access.

> 📚 **This section is a preview.** [Lab 05](lab05.md) is the canonical MCP configuration lab — it covers per-server scoping, credential handling, and the centralized `mcp-configs/` source of truth. The snippet below shows just enough to wire an MCP server into an agent, deferring the full setup walkthrough to Lab 05.

💬 **In VS Code:**

1. View the current MCP configuration — ask Copilot Chat, or open `.vscode/mcp.json` directly in the editor.

2. Open `.github/agents/dotnet-dev.agent.md`, then click the **Configure Tools...** button in the editor toolbar. This opens a dialog listing built-in tools **and** tools from any configured MCP server (e.g. `context7`'s `resolve-library-id` and `query-docs`). Select the Context7 tools and click **OK** — VS Code adds them to the agent's `tools:` list for you:

```yaml
---
name: "dotnet-dev"
description: "..."
tools: ["read", "edit", "execute", "search", "context7/*"]
---
```

> ⚠️ **`mcp-servers` is a cloud/CLI-only field.** The reference docs for
> custom agents are explicit: `mcp-servers` is "not used in VS Code and
> other IDE custom agents." For GitHub.com-hosted Copilot cloud agent and
> Copilot CLI, the equivalent frontmatter is:
> ```yaml
> mcp-servers: ["context7"]
> ```
> In VS Code, granting MCP access is just an entry in `tools:` (via
> **Configure Tools...**, as above) — there's no separate field to add.

3. The agent can now use tools from the `context7` MCP server (e.g., `resolve-library-id` and `query-docs`).

> 💡 **Note**: MCP server access is optional. The base tools (`read`, `edit`, `execute`, `search`) are sufficient for most development tasks. Add MCP servers when the agent needs specific capabilities like documentation lookup or knowledge persistence. Cross-check that the `context7` MCP server is running if the agent can't find its tools.

## 3.4 Test the Agent

Let's test our new agent by asking it to analyze the ContosoUniversity codebase.

💬 **In VS Code's Copilot Chat:**

1. Open the Chat view, switch to **Agent mode**, and select **`dotnet-dev`** from the agent picker. If it's missing, you skipped the 🔄 restart in §3.2 — reload the window.

2. Ask:
```
Analyze the dotnet/ContosoUniversity.Core project. What models exist and what are their relationships?
```

3. The agent should:
   - Read files from `dotnet/ContosoUniversity.Core/Models/`
   - Identify: Student, Course, Instructor, Enrollment, Department, OfficeAssignment
   - Describe relationships (Student has Enrollments, Course has Enrollments, etc.)

4. Try a development task:
```
What would I need to change to add a search feature to the Students controller?
```

The agent should reference the repository pattern, async patterns, and controller conventions from its system prompt.

> 💡 **Tip**: If the agent doesn't seem to follow its instructions, check that the YAML frontmatter is valid (no syntax errors) and that the file is in `.github/agents/`.

## 3.5 Final

<details>
<summary>Key Takeaways</summary>

After this lab you should understand:

| Concept | Details |
|---------|---------|
| **Agent file location** | `.github/agents/{name}.agent.md` |
| **YAML frontmatter** | `name`, `description`, `tools`, optional `mcp-servers` (cloud/CLI only — see §3.3) |
| **Tools** | `read`, `edit`, `execute`, `search`, `agent`, `web` |
| **System prompt** | Markdown body defines agent personality and instructions |
| **Invocation** | Agent picker in VS Code's Chat view, or `@agent-name` on GitHub.com/Copilot CLI |

**Best practices for agent design:**
- Give the agent a clear, focused domain (not "general purpose")
- List specific coding standards it should follow
- Include project-specific context (file structure, patterns)
- Add a review checklist for quality assurance
- Reference other agents for handoff (e.g., "invoke @dotnet-qa for tests")

</details>

<details>
<summary>Solution: dotnet-dev.agent.md</summary>

See [`solutions/lab03-dotnet-dev-agent/dotnet-dev.agent.md`](../solutions/lab03-dotnet-dev-agent/dotnet-dev.agent.md) for the complete reference implementation.

</details>

> This agent is now available for orchestration in Lab 07, where you'll coordinate multiple agents working together. For a production-hardening pass that locks this kind of agent down to an explicit tool allow-list and backs it with a `preToolUse` hook (Lab 06), see [`lab-hardening.md`](lab-hardening.md).

**Next:** [Lab 04 — Skills & Prompts](lab04.md)
