---
title: "MCP Server Configuration"
lab_number: 5
tier: beginner
surface: vscode
pace:
  presenter_minutes: 3
  self_paced_minutes: 15
registry: docs/_meta/registry.yaml
---

# 5 — MCP Server Configuration

> **Two ways to follow this lab**
> - **In VS Code:** follow the main walkthrough using `.vscode/mcp.json` and
>   Copilot Chat.
> - **In Copilot CLI:** configure the CLI's separate MCP config as shown in
>   the optional CLI section; the two clients do not share a config file.

In this lab you will explore and configure Model Context Protocol (MCP) servers.

> ⏱️ Presenter pace: 3 minutes | Self-paced: 15 minutes

References:
- [MCP specification changelog (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [Using MCP servers with Copilot](https://docs.github.com/en/copilot/using-github-copilot/using-mcp-servers-with-copilot)

> 🧭 **Track appendices** — track-specific MCP server picks live in
> [`labs/appendices/dotnet/lab05.md`](appendices/dotnet/lab05.md) and
> [`labs/appendices/node/lab05.md`](appendices/node/lab05.md).

> 🖥️ **Surface:** every required step below works entirely inside **VS
> Code's Copilot Chat** — this lab reads and edits `.vscode/mcp.json`
> rather than the Copilot CLI's `~/.copilot/mcp-config.json`. An
> **Advanced (optional)** section at the end covers the CLI-only
> equivalents.

> 🆕 **MCP protocol revision (2026-07-28, confirmed breaking change):** the
> servers below now speak the stateless MCP spec pinned at
> `mcp_protocol_spec_version` in [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml).
> Protocol-level sessions and the `initialize` handshake are gone — every
> request now carries its protocol version/capabilities inline, and a new
> `server/discover` RPC replaces the old handshake for version negotiation.
> This is transparent to you as a Copilot user (the client handles it), but
> if you ever read raw MCP traffic or write your own server, don't expect
> an `Mcp-Session-Id` header or a stateful `initialize` call — see
> [the official changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog).

## 5.1 Examine Existing MCP Configuration

MCP servers extend Copilot's capabilities with external tools — documentation lookup, knowledge persistence, structured reasoning, and more.

💬 **Ask Copilot Chat (Agent mode):**

```text
Show me the contents of .vscode/mcp.json and list each configured server.
```

<details>
<summary>Prefer the terminal?</summary>

**WSL/Bash:**
```bash
cat .vscode/mcp.json
```

**PowerShell:**
```powershell
Get-Content .vscode/mcp.json
```

</details>

This repository's **VS Code** config (`.vscode/mcp.json`) ships with 5 MCP
servers (kept in sync with [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml)
`mcp_servers:`, minus `fabric`, which Lab 12 adds on top of this baseline):

| Server | Type | Purpose |
|--------|------|---------|
| `context7` | local (stdio) | Third-party library documentation lookup |
| `memory` | local (stdio) | Knowledge-graph persistence primitive — see §5.3 for why this repo does **not** rely on it for cross-session memory |
| `sequential-thinking` | local (stdio) | Structured chain-of-thought reasoning |
| `workiq` | local (stdio) | Microsoft Work IQ for productivity |
| `microsoft-learn` | http | Azure/Microsoft official documentation |

> ⚠️ **The Copilot CLI's config is a different file with one fewer server:**
> `.copilot/mcp-config.json` has no `memory` entry — only `context7`,
> `sequential-thinking`, `workiq`, `microsoft-learn`. If you're following
> along in the CLI instead of VS Code, your server list is one shorter and
> the top-level JSON key is `mcpServers` with `"type": "local"`, not
> `.vscode/mcp.json`'s `servers` key with `"type": "stdio"` — same servers,
> different schema per surface.

Notice the two server types:
- **stdio** (`"type": "stdio"`): Runs as a subprocess via `npx`. Communicates over standard input/output.
- **http** (`"type": "http"`): Connects to a remote URL. No local process needed.

```json
{
  "servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

> 💡 Omitting a `tools` filter (as `.vscode/mcp.json` does above) exposes
> every tool the server offers. The Copilot CLI's schema supports an
> explicit `"tools": ["*"]` (all) or a named allow-list for the same effect.

## 5.2 Use Context7 for Documentation Lookup

Context7 provides up-to-date documentation for libraries and frameworks. Let's use it to look up .NET documentation.

💬 **In VS Code's Copilot Chat (Agent mode):**

1. Ask a question that requires library documentation:
```
Using Context7, look up how to configure WebApplicationFactory for integration testing in ASP.NET Core.
```

2. Behind the scenes, Copilot calls two Context7 tools:
   - `resolve-library-id` — finds the Context7 library ID for "ASP.NET Core"
   - `query-docs` — queries documentation with the resolved ID

3. Try another lookup:
```
Use Context7 to find Entity Framework Core migration best practices.
```

> 💡 Context7 is especially useful for staying current with library documentation — it fetches real-time docs rather than relying on training data.

> 💡 **What you should see:** Copilot responds with up-to-date documentation from the library. If it says "Context7 not available" or ignores the tool, the MCP server may not have started — check that `npx` is available and Node.js is installed.

## 5.3 Cross-session persistence — markdown lessons, not a server

MCP gives you live tools (docs, search, structured reasoning); this repo
intentionally does **not** treat any MCP server as cross-session memory —
including the `memory` server listed above, which implements the generic
knowledge-graph *primitive* but isn't wired into this repo's persistence
story. Instead, this repo solves persistence with plain markdown files the
agent maintains itself, governed by [`.github/instructions/lessons.instructions.md`](../.github/instructions/lessons.instructions.md).
That's the pattern Lab 10 unpacks in full — here you just see it
working alongside MCP.

> 🆕 **Why this distinction matters more since 2026-07-28:** the MCP spec
> revision removed protocol-level sessions entirely (no `initialize`
> handshake, no `Mcp-Session-Id`). Any cross-call state an MCP server needs
> is now an explicit, server-minted handle passed back as an ordinary tool
> argument — never an implicit session. That makes app-layer persistence
> (like this repo's `.copilot/lessons/` markdown wiki) even more clearly a
> *client/application* concern, not something the protocol does for you.

💬 **In VS Code's Copilot Chat (Agent mode), unless noted:**

1. Inspect the wiki that ships with the repo:

```text
List the files in .copilot/lessons/, then show me the first 20 lines of
.copilot/lessons/index.md.
```

<details>
<summary>Prefer the terminal?</summary>

**WSL/Bash:**
```bash
ls .copilot/lessons/
head -20 .copilot/lessons/index.md
```

**PowerShell:**
```powershell
Get-ChildItem .copilot/lessons
Get-Content .copilot/lessons/index.md | Select-Object -First 20
```

</details>

2. Ask Copilot to record a project fact as a lesson:
```
Append a lesson to .copilot/lessons/log.md: ContosoUniversity uses
Entity Framework Core 8 with SQL Server and follows the repository
pattern; the main DbContext is SchoolContext. Follow the schema in
.github/instructions/lessons.instructions.md and leave "Promoted to"
blank.
```

3. Verify the append landed in git-tracked markdown:

**WSL/Bash:**
```bash
head -30 .copilot/lessons/log.md
```

**PowerShell:**
```powershell
Get-Content .copilot/lessons/log.md | Select-Object -First 30
```

4. Open a new chat session (the **+** / **New Chat** control at the top of
   the Chat view) and ask:
```
What does this repo use for data access? Check .copilot/lessons/
before answering.
```

The agent reads the lesson you just wrote — no knowledge-graph server,
no embeddings, no cross-session database. Just markdown the agent
wrote to itself, committed alongside the code.

> 💡 **Why markdown, not a server?** Files are diffable, reviewable,
> revertable, and ship with the repo. Lab 10 walks through the full
> three-layer model (raw sources → wiki → schema) and the
> `/consolidate-lessons` command that promotes durable lessons.

## 5.4 Add a New MCP Server

Let's add a new MCP server to the configuration. We'll add a fetch server for web content.

💬 **In VS Code:**

1. Open `.vscode/mcp.json` in the editor.

2. Add a new server entry under `servers`. For example, to add a fetch server for web content:

```json
{
  "servers": {
    "context7": { "...": "..." },
    "memory": { "...": "..." },
    "sequential-thinking": { "...": "..." },
    "workiq": { "...": "..." },
    "microsoft-learn": { "...": "..." },
    "fetch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-fetch"]
    }
  }
}
```

3. The fetch server provides a `fetch` tool that can retrieve web pages, API responses, and other HTTP content.

4. After saving, open the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> / <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) and run **MCP: List Servers** to confirm `fetch` shows up, starting it if prompted.

5. Test the new server:
```
Fetch the README from https://raw.githubusercontent.com/dotnet/aspnetcore/main/README.md
```

> ⚠️ **Security note**: Be careful with MCP servers that have broad access — by default a server's full tool set is available to Copilot. The Copilot CLI's schema lets you restrict this explicitly with `"tools": [...]`; in production, restrict to only the tools you need.

> 💡 **Verify the server loaded:** After **MCP: List Servers** shows it running, test with a query the new server should handle. If it responds with relevant data, the server is working.

## 5.5 Final

<details>
<summary>Key Takeaways</summary>

| Concept | Details |
|---------|---------|
| **Config location** | `.vscode/mcp.json` (VS Code, this repo's workspace scope) — key `servers`, type `stdio`/`http`. Copilot CLI uses `~/.copilot/mcp-config.json` (user scope) — key `mcpServers`, type `local`/`http`. |
| **Server types** | `stdio`/`local` (subprocess) or `http` (remote URL) — naming differs by surface, concept is the same |
| **Tool filtering** | CLI schema: `"tools": ["*"]` for all, or list specific tool names |
| **Agent access** | Use `mcp-servers` in agent frontmatter to grant server access |

**Available MCP servers in this repo (`.vscode/mcp.json` baseline):**

| Server | Tools | Use Case |
|--------|-------|----------|
| context7 | `resolve-library-id`, `query-docs` | Library documentation |
| memory | knowledge-graph primitive | Available but not used for this repo's persistence story — see §5.3 |
| sequential-thinking | `sequentialthinking` | Structured reasoning |
| workiq | Microsoft Work IQ tools | Productivity |
| microsoft-learn | `microsoft_docs_search`, `microsoft_docs_fetch` | Microsoft documentation |
| fabric *(added in Lab 12, not in the baseline above)* | Fabric/OneLake tools | Local Fabric MCP for Lab 12 (see registry `note` for remote-vs-local distinction) |

**Best practices:**
- Use `context7` for up-to-date library docs instead of guessing from training data
- Use `sequential-thinking` for complex multi-step reasoning
- Restrict `tools` to only what's needed for security
- For cross-session persistence, write a lesson to `.copilot/lessons/` (see §5.3) — MCP is intentionally not the memory layer in this repo

</details>

<details>
<summary>Solution: mcp.json with fetch server</summary>

See [`solutions/lab05-mcp-config/mcp.json`](../solutions/lab05-mcp-config/mcp.json)

</details>

## Advanced (optional): Copilot CLI power features for MCP

> 🔧 Everything below needs the standalone **Copilot CLI** installed. Nothing
> here is required for this lab; skip to [Lab 06](lab06.md) if you're staying
> VS Code-only.

| Capability | Command / surface | Use when |
|------------|-------------------|----------|
| **Install a plugin** | `/plugin install owner/repo` | Pulling an MCP-bundling plugin from a private or public registry. |
| **Parallel subagents** | `/fleet` | Querying multiple MCP servers in parallel (e.g. `context7` + `microsoft-learn`). |
| **Plan mode vs autopilot mode** | `Shift+Tab` (plan mode) vs autopilot mode | Plan mode when wiring a new MCP server; autopilot mode when re-running well-known MCP queries. |
| **Mid-session model switch** | `/model <tier-or-id>` | Downshift to `models.cheap` in the registry when the answer is already in MCP-retrieved context. |
| **Local tool discovery** | `extensions_manage` operation `list` | Seeing which MCP-backed tools are loaded right now. |

> 💡 Commands are current as of this refresh; versions, model tiers, and MCP
> pins live in [`docs/_meta/registry.yaml`](../docs/_meta/registry.yaml).

**Next:** [Lab 06 — Hooks](lab06.md)
