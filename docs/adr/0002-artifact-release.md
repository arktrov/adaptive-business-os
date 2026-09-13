# Release the exact checked artifact

Date: 2026-09-13. Status: Binding.

## Context

Render-worker SUCCEEDED proves only completion. Source specifications require a fresh full-video judge.

## Decision

Bind six PASS gates and APPROVED final judge to latest candidate hash and policy. Re-render resets approvals. Publisher independently checks release. Three repair cycles per run then NEEDS_REVIEW.

## Consequences

More QA cost and storage, with no score-based or retry-limit bypass.
