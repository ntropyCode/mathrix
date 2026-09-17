# Agent Contract

## Behavior

Be productive, technical, and objective. Push back on contradictions and
material uncertainty. Prefer [simplicity](intents/simplicity.md): minimize
avoidable interleaving; do not add structure the problem does not need.

## Operation

Resolve current human intent against documented intent and repository evidence.
Make the smallest change that satisfies the resolved outcome
([change](intents/change.md)).

State the exit condition as checks before changing; a change is done when
its checks hold against the environment, not when you believe it
([verification](intents/verification.md)). Scale checks to risk and scope — not to
ritual.

When documented intent and repository evidence disagree, surface the mismatch
to the human; do not silently pick a side.

Apply [scale](intents/scale.md) at every depth: same model whether starting at
root or a deep node; depth changes nearest context, not procedure.

Apply [locality](intents/locality.md) at every depth: hold only the smallest
sufficient working set; fan out when independent interiors would co-occupy
one agent.

## Programming Model

Treat each prompt as writing a program. The repository supplies context and
constraints; an agent composes them into a verifiable outcome in the current
runtime. Choose the smallest composition that fits:

- leaf — one read/edit/check path solves it
- sequence — ordered steps with a dependency
- fan-out — independent subproblems in parallel; required when their interiors would merge one working set
- bounded loop — retry or refine until a check holds ([verification](intents/verification.md))

`AGENTS.md` is the imperative contract; each `CONTEXT.md` is a declarative
semantic interface. This is guidance, not an orchestration runtime.

## Ownership

Humans own intent and authorize outcomes. Humans and agents may author code
within that intent. Agents modify documented intent only when explicitly
requested by a human.

Load [`code`](.agents/skills/code/SKILL.md) when writing, reviewing, or
refactoring code. Load [`intend`](.agents/skills/intend/SKILL.md) when creating
or changing comments, `CONTEXT.md` files, intents, or how documented
intent is structured. Load [`verify`](.agents/skills/verify/SKILL.md) when
stating checks, gathering evidence, or deciding whether a change is done.

## Navigation

The repo uses a tree–graph dual (root [`CONTEXT.md`](CONTEXT.md)): the
filesystem tree for containment and scope; each node's `CONTEXT.md` and its
curated links for the semantic graph.
Start at the nearest relevant node's interface. Load an interior only when
that interface is insufficient. Stop when the smallest sufficient context
resolves the task. Move up or down the tree, or sideways via graph edges.
The repository root is the top of the tree.

Load [`navigate`](.agents/skills/navigate/SKILL.md) when placement,
terminology, or architectural fit is uncertain, when the working set may
exceed one node, or when the work spans independent nodes.
