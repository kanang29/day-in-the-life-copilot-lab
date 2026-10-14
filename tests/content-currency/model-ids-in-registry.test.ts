import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

/**
 * Phase 1 — every model ID a lab mentions must exist in
 * docs/_meta/registry.yaml's `models` block (cheap | standard | premium).
 *
 * This is a guardrail against labs re-hardcoding a model name that later
 * falls out of the registry (or was never in it), per issue #3's "no
 * hardcoded versions, pins or model IDs in labs" bar.
 *
 * KNOWN_MODEL_DRIFT is a short, explicit, expiring allow-list for mentions
 * already tracked for a fix in a later phase of the curriculum-refresh
 * epic (see docs/specs/003-lab-refresh-standard.md). Entries must name the
 * phase that removes them; do not add an entry here to silence a new,
 * unrelated finding — fix the lab instead.
 */

const ROOT = process.cwd();
const LABS_DIR = join(ROOT, "labs");
const REGISTRY_PATH = join(ROOT, "docs", "_meta", "registry.yaml");

const NON_NUMBERED_LAB_FILES = [
  "setup.md",
  "lab-hardening.md",
  "lab-gh-extensions.md",
  "lab-copilot-cli-extensions.md",
] as const;

interface KnownDrift {
  file: string;
  modelId: string;
  reason: string;
  fixedInPhase: string;
}

const KNOWN_MODEL_DRIFT: KnownDrift[] = [
  {
    file: "lab07.md",
    modelId: "claude-opus-4.6",
    reason:
      "Cites the repo's AGENTS.md sub-agent-dispatch pin, itself stale (claude-opus-4.6 is not on the current Supported AI models page).",
    fixedInPhase: "Phase 2 (beginner track)",
  },
  {
    file: "lab10.md",
    modelId: "claude-opus-4.6",
    reason:
      "Same stale AGENTS.md pin, plus Lab 10 hardcodes model IDs instead of registry tiers (known drift item 11).",
    fixedInPhase: "Phase 3 (Lab 10 rebuild)",
  },
  {
    file: "lab10.md",
    modelId: "claude-opus-4.7",
    reason:
      "Pre-refresh model name; Lab 10 hardcodes model IDs instead of registry tiers (known drift item 11).",
    fixedInPhase: "Phase 3 (Lab 10 rebuild)",
  },
  {
    file: "lab13.md",
    modelId: "claude-opus-4.6",
    reason:
      "Stale AGENTS.md sub-agent-dispatch pin, repeated in this lab's model-tier discussion.",
    fixedInPhase: "Phase 6 (advanced CLI cluster)",
  },
  {
    file: "lab13.md",
    modelId: "claude-opus-4.7",
    reason: "Pre-refresh model name in this lab's model-tier discussion.",
    fixedInPhase: "Phase 6 (advanced CLI cluster)",
  },
  {
    file: "lab14.md",
    modelId: "claude-opus-4.6",
    reason:
      "Stale AGENTS.md sub-agent-dispatch pin, repeated in this lab's model-tier discussion.",
    fixedInPhase: "Phase 6 (advanced CLI cluster)",
  },
  {
    file: "lab14.md",
    modelId: "claude-opus-4.7",
    reason: "Pre-refresh model name in this lab's model-tier discussion.",
    fixedInPhase: "Phase 6 (advanced CLI cluster)",
  },
];

function listLabFiles(): string[] {
  if (!existsSync(LABS_DIR)) return [];
  const entries = readdirSync(LABS_DIR);
  const numbered = entries.filter((f) => /^lab\d+\.md$/.test(f));
  const extras = entries.filter((f) =>
    (NON_NUMBERED_LAB_FILES as readonly string[]).includes(f),
  );
  return [...numbered, ...extras].sort();
}

function findModelMentions(body: string): string[] {
  const pattern =
    /`?\b(?:claude|gpt|grok|gemini)-[a-zA-Z0-9][a-zA-Z0-9.-]*\b`?/g;
  const found = body.match(pattern) ?? [];
  return [...new Set(found.map((m) => m.replace(/`/g, "")))];
}

describe("content-currency: every model ID mentioned in a lab exists in registry.yaml", () => {
  const registry = yaml.load(readFileSync(REGISTRY_PATH, "utf8")) as {
    models: { cheap: string[]; standard: string[]; premium: string[] };
  };
  const registryModels = new Set([
    ...registry.models.cheap,
    ...registry.models.standard,
    ...registry.models.premium,
  ]);
  const labs = listLabFiles();

  it("discovers lab files and a non-empty registry model list", () => {
    expect(labs.length).toBeGreaterThan(0);
    expect(registryModels.size).toBeGreaterThan(0);
  });

  it.each(labs)(
    "%s only mentions model IDs that are in registry.yaml (or are tracked drift)",
    (lab) => {
      const body = readFileSync(join(LABS_DIR, lab), "utf8");
      const mentions = findModelMentions(body);
      const unexplained = mentions.filter((modelId) => {
        if (registryModels.has(modelId)) return false;
        const tracked = KNOWN_MODEL_DRIFT.some(
          (d) => d.file === lab && d.modelId === modelId,
        );
        return !tracked;
      });
      expect(
        unexplained,
        `${lab} mentions model ID(s) not in registry.yaml and not in KNOWN_MODEL_DRIFT: ${unexplained.join(", ")}`,
      ).toEqual([]);
    },
  );

  it("every KNOWN_MODEL_DRIFT entry is still an actual violation (no stale allow-list entries)", () => {
    for (const drift of KNOWN_MODEL_DRIFT) {
      const body = readFileSync(join(LABS_DIR, drift.file), "utf8");
      const mentions = findModelMentions(body);
      const stillPresent = mentions.includes(drift.modelId);
      const stillMissingFromRegistry = !registryModels.has(drift.modelId);
      expect(
        stillPresent && stillMissingFromRegistry,
        `KNOWN_MODEL_DRIFT entry for ${drift.file}/${drift.modelId} is stale — ` +
          `either the lab no longer mentions it or it is now in registry.yaml. ` +
          `Remove this entry (${drift.fixedInPhase} is done).`,
      ).toBe(true);
    }
  });
});
