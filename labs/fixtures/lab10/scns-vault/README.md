# Per-directory vault fixture (generic stand-in for SCNS)

> ⚠️ **This is a generic fixture, not the real SCNS layout.** The issue
> that requested this lab named a local project called "SCNS" as a
> possible worked example of a per-directory memory vault, but left its
> actual folder tree as an unfilled placeholder
> (`[PASTE SCNS FOLDER TREE HERE — OR DELETE THIS ITEM]`) and SCNS does
> not exist anywhere in this repository (confirmed by
> [`docs/specs/001-research-sota.md`](../../../docs/specs/001-research-sota.md)
> claim 14 and [`docs/specs/002-lab10-memory.md`](../../../docs/specs/002-lab10-memory.md)).
> This fixture is a **generic**, sanitized per-directory vault built to
> teach the same pattern — one lessons vault per subdirectory instead of
> one flat project-wide wiki — without inventing details about a project
> nobody here has seen.

## The pattern this fixture demonstrates

A **per-directory vault** is the same `.copilot/lessons/`-style wiki
(`index.md` hub + topic files, per
[`.github/instructions/lessons.instructions.md`](../../../.github/instructions/lessons.instructions.md)),
but scoped to a subtree instead of the whole repo. It earns its keep when
a monorepo has modules with genuinely different conventions, owners, or
lifecycles — a lesson about `module-a`'s retry policy has no business
polluting `module-b`'s index.

```
labs/fixtures/lab10/scns-vault/
├── module-a/
│   └── .copilot/lessons/
│       ├── index.md          ← hub note, scoped to module-a only
│       └── retry-policy.md   ← one durable lesson, module-a-specific
└── module-b/
    └── .copilot/lessons/
        ├── index.md          ← a *different* hub, scoped to module-b only
        └── config-loading.md ← one durable lesson, module-b-specific
```

Each subdirectory's `index.md` is its own hub — it only ever links to
lessons inside its own vault. An agent working inside `module-a/` consults
`module-a/.copilot/lessons/index.md` first, the same way it would consult
the repo-root `.copilot/lessons/index.md` for repo-wide work. Nothing
here is wired into this repo's actual Copilot configuration — it is a
read-only example to explore, not a vault Copilot will auto-discover.

## Hands-on: explore the fixture

🖥️ **In your terminal, or ask Copilot Chat to do the same:**

**WSL/Bash:**
```bash
find labs/fixtures/lab10/scns-vault -type f | sort
cat labs/fixtures/lab10/scns-vault/module-a/.copilot/lessons/index.md
cat labs/fixtures/lab10/scns-vault/module-b/.copilot/lessons/index.md
```

**PowerShell:**
```powershell
Get-ChildItem -Recurse -File labs/fixtures/lab10/scns-vault | Sort-Object FullName
Get-Content labs/fixtures/lab10/scns-vault/module-a/.copilot/lessons/index.md
Get-Content labs/fixtures/lab10/scns-vault/module-b/.copilot/lessons/index.md
```

Notice the two `index.md` hubs never cross-link — that's the point. If
you genuinely need a lesson to apply to both modules, promote it to the
repo-root `.copilot/lessons/` (or `~/.copilot/lessons/` if it's true
beyond this repo), the same project→global promotion already in
[Lab 10 §10.2c](../../lab10.md#102c-project-vs-global-lessons).

See [Lab 10 §10.2e](../../lab10.md) for the lab's full walkthrough of
when a per-directory vault is worth the split versus when one flat wiki
is simpler.
