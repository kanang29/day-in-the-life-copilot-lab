---
title: "module-b config only loads at process start"
scope: project
tags: [configuration, module-b]
created: 2026-10-14
updated: 2026-10-14
related:
  - module-b/.copilot/lessons/index.md
---

# module-b config only loads at process start

## Summary

module-b reads environment variables once at startup; changing them at
runtime has no effect until the process restarts.

## Context

Sanitized example fixture — illustrates a lesson scoped to one module in
a per-directory vault, not a real incident.

## Pattern

Restart the process after changing module-b's environment configuration;
do not expect a hot reload.

## Also applies to

- Nothing else in this fixture — module-a has no config-loading lesson,
  which is itself the point: per-directory vaults don't force every
  module to share every other module's concerns.

## Revision log

- 2026-10-14 — Created as a fixture for Lab 10's per-directory vault
  exercise.
