---
name: navigate
description: Navigate the tree–graph to the smallest sufficient context. Use when unsure whether a change aligns with documented intent, vocabulary, or architecture; when loading CONTEXT.md files or graph neighborhoods; when work spans independent nodes; or when considering subagents.
---

# Navigate

Operationalizes [scale](../../../intents/scale.md) and [locality](../../../intents/locality.md).
Use when unsure whether a change aligns with documented intent, local context,
vocabulary, or cross-cutting constraints; or when the working set may exceed
one node, the work spans independent nodes, or a subagent split is under
consideration.

Goal: move only as far as the question needs and hold only what this
reasoning step needs. Stop at the first sufficient context.

## Model

The tree–graph dual lives in root [`CONTEXT.md`](../../../CONTEXT.md). A
node's **interface** (`CONTEXT.md`) is the cheap probe. Its **interior** is
code, tests, intents, or other evidence behind that interface. The
working set is the facts that must be simultaneously true in this step.

## Moves

These moves are choices, not a pipeline. The prompt source (human or agent)
does not change them.

1. State the uncertainty as a concrete question and name the candidate nodes.
   Read interfaces first.
2. Load an interior only when its interface is insufficient. Move according
   to the question:
   - **Deeper** — local code, tests, Intent story, `intents/*.md`, schemas.
   - **Sideways** — `CONTEXT.md` links to related nodes.
   - **Upward** — the containing node's `CONTEXT.md`, one parent at a time,
     only while broader meaning is required; root is the top of that climb.
3. Re-check after every move. Stop when the question is answered.
4. Choose the smallest composition that fits:
   - **leaf** — one interior is enough; stay.
   - **sequence** — ordered work with shared live state; stay in one agent,
     load the next interior as needed, drop what is no longer live.
   - **fan-out** — units are independent *and* their interiors would have to
     be co-present; one child per independent unit. The parent keeps
     interfaces plus returned answers, not sibling interiors.
   - **bounded loop** — retry or refine with an exit condition.
5. Prompt a child with the task, the node's interface, and only facts the
   child cannot discover. Ask for an answer at interface grain, not a dump.
   Each child applies this same model.
6. If still unresolved, narrow the change, ask, or record the uncertainty. If
   sources conflict, the conflict is the task — do not silently pick a side.
7. If the task authorizes a change, make the smallest one that preserves or
   restores alignment.

If several interiors are small, one agent may hold them. If they are large or
unknown-large, treat independence as a split. A crowded window is a warning
that interiors are merging — not a token threshold to optimize for, and not
permission to split a problem that must be reasoned about together.

## Don't

- Preselect a destination or preload a tree or graph "just in case."
- Use this skill as permission for broad cleanup or speculative redesign.
- Fan out a non-splittable (complected) problem to get a bigger window.
- Pass sibling interiors into a child, or return interiors to a parent.
- Invent orchestrator/worker roles, budgets, or spawn protocols.
- Multiply agents when one working set still fits.
