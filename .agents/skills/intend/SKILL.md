---
name: intend
description: Intent ownership, placement, and context-node authoring rules. Use when creating or changing comments, CONTEXT.md files, intents, or how documented intent is structured.
---

# Intend

Code is the primary documentation: it defines intended executable behavior. Add
prose only for knowledge that code cannot express directly.

## Ownership

- Code owns how behavior works.
- Comments own small, local, non-obvious reasons.
- `CONTEXT.md` owns semantic identity, responsibility, boundaries, vocabulary,
  relationships, a short **Intent** story that links to named intents,
  and a short **Verification** section stating how the node's
  responsibility is proved.
- `intents/*.md` owns detailed documented intent (need, constraint, or preserve).

Keep each fact in one owning artifact. Link instead of restating. Do not create
module-local `docs/` trees for intent; use `intents/<name>.md`.

Root `CONTEXT.md` owns cross-cutting vocabulary, the tree–graph model, and
the links to the cross-cutting intents.

Intents orient; they do not authorize work. See Ownership in
[AGENTS.md](../../../AGENTS.md#ownership).

## Intents

Detailed intent lives at the node-local `intents/<name>.md` path. Create the
directory only when an intent exists. No provenance or
legacy ADR/PRD framing. `CONTEXT.md` links to intents; it stays skim-friendly
and does not duplicate their detail.

Do not invent Intent stories or named intents where no attributable intent
source exists.

## Verification section

Declares, at interface grain, what proves this node's responsibility
([verification](../../../intents/verification.md)): how to bring the interior into
an observable state, the read-only probe that says it is worth exercising,
how to exercise it, what evidence proves it, and what to clean up. Link to
the commands, tests, or harness in the interior; do not inline more than a
line. Add the section only when the proof path is not obvious from the
interior; otherwise name the existing check or omit it. Children inherit the
parent's verification unless they narrow it.

A Verification section that no longer matches the interior is drift: fix the
section, or report the regression — never edit it to make a failing check
pass.

## Tree and graph

The tree–graph model lives in root [`CONTEXT.md`](../../../CONTEXT.md).
Create a context node only for a semantic responsibility boundary — not for
generated, mechanical, asset, build, platform, or tiny-helper folders.

## Authoring

- Start with identity, responsibility, boundaries, and direct relationships.
- Add Intent story and linked intents when attributable intent exists.
- Add a Verification section when the proof path is non-obvious.
- Link sideways to another node's `CONTEXT.md` and state why; link downward with
  one-line purpose summaries.
- Place an edge at the nodes whose responsibilities are constrained; do not
  copy it onto descendants that only inherit it, and do not hoist it to an
  ancestor that does not itself depend. Shared meaning that is not a
  dependency lives at the nearest common ancestor; it is not an edge.
- Let parents index and constrain children; do not duplicate child detail.
- Treat links as curated edges: include only relationships agents must preserve.

## Restraint

Create and expand docs lazily. Do not document behavior already obvious from
code, create placeholders, or redefine established terms. When changing
structure, check for broken links, stale interfaces, and duplicate ownership.

Use [`navigate`](../navigate/SKILL.md) when placement, terminology, ownership, or
relationships remain uncertain.
