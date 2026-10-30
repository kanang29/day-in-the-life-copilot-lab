# 3N — Creating a Node.js Development Agent (Node track)

> This is the Node.js walkthrough for [Lab 03](lab03.md). Follow it instead of
> the .NET steps if you are using the Node track (`node/` folder, Fastify +
> Drizzle + Vitest). The concepts are the same; only the agent file, commands,
> and test prompts differ.

> ⏱️ Self-paced: ~15 minutes

References:
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Node appendix for Lab 03](appendices/node/lab03.md)

## 3N.1 Set up and verify the Node project

🖥️ **In your terminal (from the repository root):**

```powershell
pnpm -C node install
pnpm -C node build
pnpm -C node test
```

Build and tests should pass before you continue. If `pnpm` is missing, run `npm i -g pnpm`.

## 3N.2 Understand agent anatomy

1. Look at an existing agent:

**WSL/Bash:**
```bash
head -30 .github/agents/planner.agent.md
```

**PowerShell:**
```powershell
Get-Content .github/agents/planner.agent.md -Head 30
```

2. An agent file has two parts:
   - **YAML frontmatter** (between `---` markers): `name`, `description`, `tools`.
   - **Markdown body:** the system prompt — expertise, instructions, patterns.

3. Available tools: `read`, `edit`, `execute`, `search`, `agent`, `web`.

## 3N.3 Create the Node agent file

> The repository already contains `.github/agents/node-dev.agent.md`. You can
> keep it, or overwrite it with the version below to practise.

The file name **must** end in `.agent.md`. Copilot discovers agents by globbing
`**/*.agent.md`; a plain `.md` file is ignored.

**WSL/Bash** (full version with layout, standards, and checklist):

````bash
mkdir -p .github/agents
cat > .github/agents/node-dev.agent.md << 'AGENT'
---
name: "node-dev"
description: "Specialized Node.js development agent for ContosoUniversity (Node track). Expertise in Fastify, Drizzle ORM (SQLite), clean architecture, Vitest, and TypeScript best practices."
tools: ["read", "edit", "execute", "search"]
---

# Node.js Development Agent

You are a Node.js development specialist working on the ContosoUniversity application (Node track). You implement features following clean architecture and Node.js best practices.

## When Invoked

1. Verify the workspace builds: `pnpm -C node build`
2. Review the relevant layer before making changes
3. Follow the architecture: `core/` → `infra/` → `web/`
4. Implement with proper dependency injection (factory functions) and async/await

## ContosoUniversity Architecture (Node track)

```
node/core/   # Domain entities (Student, Course, Instructor) + repository interfaces
node/infra/  # Drizzle schema, SQLite repos, seed data
node/web/    # Fastify app, plugins, routes, ApiResponse<T> envelope
node/tests/  # Vitest unit + integration tests
node/e2e/    # Playwright end-to-end specs
```

## Coding Standards

- **Immutability**: spread objects, never mutate (`return { ...x, name }`)
- **Factory functions**: `createStudentRepo(db)` returns the repo; never `new` services
- **Async all the way**: every repo + route handler is `async`
- **ApiResponse envelope**: `{ success, data?, error?, meta? }` for every JSON response
- **Validation**: Zod schemas at the route boundary
- **No `console.log`**: use Fastify's Pino logger via `request.log.info()`

## Development Commands

```bash
pnpm -C node install             # Install workspace deps
pnpm -C node test                # Vitest unit + integration
pnpm -C node e2e                 # Playwright E2E
pnpm -C node dev                 # Run Fastify dev server
```

## Review Checklist

- [ ] `pnpm -C node test` passes
- [ ] No object mutation
- [ ] Factory function injection
- [ ] Async/await + try/catch
- [ ] Zod validation on inputs
- [ ] No hardcoded secrets
AGENT
````

**PowerShell** (minimal version — this is what the repo currently ships):

```powershell
New-Item -ItemType Directory -Path ".github\agents" -Force | Out-Null

@'
---
name: "Node Developer"
description: "Use when implementing, debugging, testing, or reviewing Node.js and JavaScript applications."
tools: [read, edit, search, execute]
user-invocable: true
---

You are a Node.js development specialist.

## Approach

1. Inspect the relevant code and configuration.
2. Follow existing project conventions.
3. Make focused and type-safe changes.
4. Run the relevant tests, lint checks, and build commands.
5. Summarize the changes and validation results.

## Constraints

- Do not expose secrets.
- Do not suppress errors.
- Do not modify unrelated code.
- Do not introduce unnecessary dependencies.
'@ | Set-Content -Path ".github\agents\node-dev.agent.md" -Encoding utf8
```

> 💡 The two variants use different `name` values (`node-dev` vs
> `Node Developer`). Pick whichever name you created in the agent picker.

Verify:

```powershell
Get-Content .github/agents/node-dev.agent.md -Head 5
```

> 🔄 **Restart required.** Agent files are discovered once at session start.
> - **VS Code:** <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → **Developer: Reload Window**.
> - **Copilot CLI:** type `exit`, then run `copilot` again.

## 3N.4 Configure tools and MCP servers (optional)

> 📚 [Lab 05](lab05.md) is the canonical MCP lab. This is a short preview.

💬 **In VS Code:**

1. Open `.github/agents/node-dev.agent.md` and click **Configure Tools...** in the editor toolbar.
2. Select the `context7` tools (`resolve-library-id`, `query-docs`) and click **OK**. The `tools:` line becomes:

```yaml
tools: [read, edit, search, execute, "context7/*"]
```

> ⚠️ `mcp-servers` is a cloud/CLI-only frontmatter field. In VS Code, MCP
> access is just an entry in `tools:`. For Copilot CLI or the cloud agent use
> `mcp-servers: ["context7"]`.

## 3N.5 Test the agent

💬 **In VS Code's Copilot Chat:**

1. Switch to **Agent mode** and select **`node-dev`** (or **Node Developer**) in the agent picker. If it's missing, reload the window (§3N.3).

2. Ask:
```
Analyze the node/core project. What entities exist and what are their relationships?
```

The agent should read `node/core/entities/` and `node/core/repos/` and report:
   - **Entities:** `Student`, `Course`, `Instructor` (all `readonly` fields, plus `New*` / `StudentPatch` input types).
   - **Repository interfaces:** `IStudentRepo` (list, getById, create, update, delete), `ICourseRepo` and `IInstructorRepo` (list, getById, create).
   - **Relationships:** the entities are independent. The only link is `Course.departmentId` (a nullable FK to a Department that has no entity in `core`). There is no Enrollment, Department, or OfficeAssignment in the Node track.

3. Try a development task:
```
What would I need to change to add a search feature to the students API?
```

The agent should point to:
   - `node/core/repos/student-repo.ts` (add a search method to `IStudentRepo`)
   - `node/infra/repos/student-repo.ts` (Drizzle query implementation)
   - `node/web/routes/students-api.ts` (route + Zod query schema)
   - `node/tests/` (unit and integration tests)

> 💡 If the agent ignores its instructions, check that the frontmatter is valid
> YAML and that the file is in `.github/agents/` and ends in `.agent.md`.

## 3N.6 Test the agent in Copilot CLI

🖥️ **In your terminal (from the repository root):**

1. Start from a fresh session so the agent file is discovered (§3N.3):

```powershell
copilot
```

2. **Interactive:** type `/agent` and pick `node-dev` (or `Node Developer`) from the list. Slash commands like `/agent` work only in an interactive session.

3. Ask the same prompts as §3N.5:
```
Analyze the node/core project. What entities exist and what are their relationships?
```
```
What would I need to change to add a search feature to the students API?
```
The expected answers are the same as in VS Code.

4. **Non-interactive (one-shot):** select the agent with a flag instead of `/agent`:

```powershell
copilot --agent node-dev -p "Analyze the node/core project. What entities exist and what are their relationships?"
```

Pass the agent's file name without `.agent.md` (here `node-dev`). If the agent is missing, confirm the file ends in `.agent.md`, lives in `.github/agents/`, and that you restarted `copilot`. Check that your CLI supports the flag with `copilot --help` (look for `--agent`).

> 💡 CLI tool access is configured separately from VS Code's **Configure Tools...** dialog. For MCP in the CLI, use the `mcp-servers: ["context7"]` frontmatter field from §3N.4.

## 3N.7 Final

<details>
<summary>Key Takeaways</summary>

| Concept | Details |
|---------|---------|
| **Agent file location** | `.github/agents/{name}.agent.md` |
| **YAML frontmatter** | `name`, `description`, `tools`, optional `mcp-servers` (cloud/CLI only) |
| **Tools** | `read`, `edit`, `execute`, `search`, `agent`, `web` |
| **System prompt** | Markdown body defines expertise and instructions |
| **Invocation** | Agent picker in VS Code, or `@agent-name` on GitHub.com / Copilot CLI |

**Best practices:**
- Give the agent a clear, focused domain.
- List specific coding standards.
- Include project context (layout, patterns, commands).
- Add a review checklist.

</details>

> The reference solution in [`solutions/lab03-dotnet-dev-agent/`](../solutions/lab03-dotnet-dev-agent/dotnet-dev.agent.md) is .NET-flavoured; use it only to compare structure.

**Next:** [Lab 04 — Skills & Prompts](lab04.md)
