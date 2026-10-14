# Lessons — Index (module-a)

Hub note for lessons scoped to **module-a only**. This is a per-directory
vault, not the repo-root wiki — see
[`labs/fixtures/lab10/scns-vault/README.md`](../../../README.md) for why
this module gets its own vault instead of sharing the project-wide one.

## Reliability

- [retry-policy](retry-policy.md) — module-a calls flaky downstream APIs;
  always wrap with exponential backoff, not a fixed-delay retry.
