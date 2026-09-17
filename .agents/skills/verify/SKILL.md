---
name: verify
description: State checks, gather evidence, and decide whether a change is done. Use when turning intent into an exit condition, choosing how to prove a change, capturing evidence, or judging delegated work.
---

# Verify

Operationalizes [verification](../../../intents/verification.md). Use when stating
what done means, choosing how to prove a change, capturing evidence, or
deciding whether a change or a child's answer is done.

Goal: close the loop against the environment with checks proportional to
the change.

## Before

- Turn the resolved intent into checks: observable predicates that can fail.
  State them before changing; they are the exit condition.
- Name which checks exist — the node's Verification section, tests, CI,
  harnesses — and which are new for this change.
- If no check can be stated, that is uncertainty to surface, not a reason to
  skip verification.

## Choose

Match the check to the change; scale to risk and scope, not ritual.

- Command or script — run it on real input.
- Interface or flow — drive the changed path as a user would.
- Data or storage — read the written value back.
- Parser, migration, or transform — replay a saved input.
- Performance — compare before and after on the same measurement.
- Documented intent — resolve links, confirm single ownership, confirm the
  interior still matches.

Prefer the strongest mechanical rung available; encode a check
structurally when it recurs.

## Observe

- Run against the real artifact, not a proxy or a cached view. Build passing
  is necessary, not sufficient.
- Capture evidence a reviewer can inspect or re-run: commands and outputs,
  diffs, read-back values, screenshots, traces.
- Keep files written for verification outside the repository unless the
  node's intent says to commit them. Clean up only what verification
  started; never the evidence.
- When a check fails, suspect the observation before the system, once.

## Decide

- Checks hold — report at interface grain: which checks, outcome, where the
  evidence is.
- Checks fail — make the next change; the retry is bounded by the exit
  condition, not by patience.
- Checks contradict documented intent — stop and surface the mismatch. Do
  not edit intent to make the check pass.
- A check could not run — say inconclusive. A confident claim without
  evidence is a defect.

## Delegation

- A child returns evidence, not a summary of what it intended. The parent
  judges the artifact.
- For high-risk work, prefer a judge that did not make the change.

## Don't

- Treat compiling, linting, or a green build as proof of behavior.
- Add tests by default; see [`code`](../code/SKILL.md). Add the check the
  change needs, and persist it when it will be needed again.
- Load unrelated interiors to verify; that is a [locality](../../../intents/locality.md)
  failure to fix, not a check to run.
- Return a transcript across a boundary; return the compressed answer.
