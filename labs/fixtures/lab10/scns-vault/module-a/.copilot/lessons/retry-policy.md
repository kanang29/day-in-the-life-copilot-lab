---
title: "Wrap module-a's downstream calls in exponential backoff"
scope: project
tags: [reliability, retries, module-a]
created: 2026-10-14
updated: 2026-10-14
related:
  - module-a/.copilot/lessons/index.md
---

# Wrap module-a's downstream calls in exponential backoff

## Summary

module-a's downstream APIs fail intermittently under load; a fixed-delay
retry makes it worse (thundering herd). Use exponential backoff with
jitter instead.

## Context

Sanitized example fixture — illustrates a lesson scoped to one module in
a per-directory vault, not a real incident.

## Pattern

Exponential backoff, capped, with jitter — not a fixed-interval retry
loop.

## Also applies to

- Any module in this fixture calling the same shared downstream
  dependency (there are none here — this is a sanitized, single-module
  example).

## Revision log

- 2026-10-14 — Created as a fixture for Lab 10's per-directory vault
  exercise.
