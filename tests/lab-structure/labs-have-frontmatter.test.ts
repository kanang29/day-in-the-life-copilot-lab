import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const LABS_DIR = join(process.cwd(), "labs");
const REQUIRED_KEYS = [
  "title",
  "lab_number",
  "tier",
  "surface",
  "pace",
] as const;
const VALID_TIERS = ["beginner", "advanced"] as const;
const VALID_SURFACES = ["vscode", "cli", "github"] as const;

// Numbered labs (lab01.md .. lab20.md) plus the non-numbered extras that are
// still part of the curriculum surface/tier contract (spec 003).
const NON_NUMBERED_LAB_FILES = [
  "setup.md",
  "lab-hardening.md",
  "lab-gh-extensions.md",
  "lab-copilot-cli-extensions.md",
] as const;

function listLabFiles(): string[] {
  if (!existsSync(LABS_DIR)) return [];
  const entries = readdirSync(LABS_DIR);
  const numbered = entries.filter((f) => /^lab\d+\.md$/.test(f));
  const extras = entries.filter((f) =>
    (NON_NUMBERED_LAB_FILES as readonly string[]).includes(f),
  );
  return [...numbered, ...extras].sort();
}

function listAppendixFiles(): string[] {
  const appendixDir = join(LABS_DIR, "appendices");
  if (!existsSync(appendixDir)) return [];
  return readdirSync(appendixDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readdirSync(join(appendixDir, entry.name))
        .filter((file) => file.endsWith(".md"))
        .map((file) => join("appendices", entry.name, file)),
    )
    .sort();
}

describe("lab-structure: labs have required frontmatter", () => {
  const labs = listLabFiles();

  it("discovers lab files", () => {
    expect(labs.length).toBeGreaterThan(0);
  });

  it("discovers every non-numbered extra lab file", () => {
    for (const extra of NON_NUMBERED_LAB_FILES) {
      expect(labs, `${extra} should be discovered`).toContain(extra);
    }
  });

  it.each(labs)("%s has YAML frontmatter with required keys", (lab) => {
    const raw = readFileSync(join(LABS_DIR, lab), "utf8");
    const parsed = matter(raw);
    expect(
      parsed.matter.length,
      `${lab} is missing frontmatter block`,
    ).toBeGreaterThan(0);

    for (const key of REQUIRED_KEYS) {
      expect(
        parsed.data[key],
        `${lab} is missing frontmatter key "${key}"`,
      ).toBeDefined();
    }

    const numberMatch = lab.match(/^lab(\d+)\.md$/);
    if (numberMatch) {
      const expectedNumber = Number(numberMatch[1]);
      expect(
        parsed.data.lab_number,
        `${lab} lab_number should equal ${expectedNumber}`,
      ).toBe(expectedNumber);
    } else {
      // Non-numbered labs (setup, hardening, gh-extensions, cli-extensions)
      // use a slug lab_number instead of an integer.
      expect(
        typeof parsed.data.lab_number,
        `${lab} lab_number should be a non-empty slug string`,
      ).toBe("string");
    }
  });

  it.each(labs)("%s declares a valid tier", (lab) => {
    const raw = readFileSync(join(LABS_DIR, lab), "utf8");
    const parsed = matter(raw);
    expect(
      VALID_TIERS as readonly string[],
      `${lab} tier "${parsed.data.tier}" must be one of ${VALID_TIERS.join(", ")}`,
    ).toContain(parsed.data.tier);
  });

  it.each(labs)("%s declares a valid surface", (lab) => {
    const raw = readFileSync(join(LABS_DIR, lab), "utf8");
    const parsed = matter(raw);
    expect(
      VALID_SURFACES as readonly string[],
      `${lab} surface "${parsed.data.surface}" must be one of ${VALID_SURFACES.join(", ")}`,
    ).toContain(parsed.data.surface);
  });

  it.each(labs)(
    '%s: tier "beginner" implies surface "vscode" (surface-appropriate bar)',
    (lab) => {
      const raw = readFileSync(join(LABS_DIR, lab), "utf8");
      const parsed = matter(raw);
      if (parsed.data.tier === "beginner") {
        expect(
          parsed.data.surface,
          `${lab} is tier:beginner so it must be surface:vscode (completable entirely in VS Code Copilot)`,
        ).toBe("vscode");
      }
    },
  );

  it.each([...labs, ...listAppendixFiles()])(
    "%s documents both Copilot CLI and VS Code paths",
    (lab) => {
      const raw = readFileSync(join(LABS_DIR, lab), "utf8");
      expect(raw, `${lab} must state the VS Code path`).toContain(
        "**In VS Code:**",
      );
      expect(raw, `${lab} must state the Copilot CLI path`).toContain(
        "**In Copilot CLI:**",
      );
    },
  );
});
