import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const SPECS_DIR = join(process.cwd(), "docs", "specs");
const REQUIRED_KEYS = ["id", "title", "status"] as const;
const VALID_STATUSES = new Set(["draft", "reviewed", "verified"]);

function listSpecFiles(): string[] {
  if (!existsSync(SPECS_DIR)) return [];
  return readdirSync(SPECS_DIR)
    .filter((f) => /^\d{3}-[\w-]+\.md$/.test(f))
    .sort();
}

describe("lab-structure: specs have required frontmatter", () => {
  const specs = listSpecFiles();

  it("discovers spec files", () => {
    expect(specs.length).toBeGreaterThan(0);
  });

  it.each(specs)("%s has YAML frontmatter with required keys", (spec) => {
    const raw = readFileSync(join(SPECS_DIR, spec), "utf8");
    const parsed = matter(raw);
    expect(
      parsed.matter.length,
      `${spec} is missing frontmatter block`,
    ).toBeGreaterThan(0);

    for (const key of REQUIRED_KEYS) {
      expect(
        parsed.data[key],
        `${spec} is missing frontmatter key "${key}"`,
      ).toBeDefined();
    }

    const expectedId = (spec.match(/^(\d{3})-/) ?? [])[1];
    expect(
      String(parsed.data.id),
      `${spec} frontmatter "id" should equal "${expectedId}" (from filename)`,
    ).toBe(expectedId);

    expect(
      VALID_STATUSES.has(parsed.data.status),
      `${spec} "status" must be one of ${[...VALID_STATUSES].join(", ")}, got "${parsed.data.status}"`,
    ).toBe(true);
  });
});
