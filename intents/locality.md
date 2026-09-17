# Locality

## Intent

A reasoning step's working set stays local to the smallest sufficient node
set. Independent node interiors do not co-occupy one agent.

The node interface — a `CONTEXT.md` — is the cheap probe, a boundary
[compression](compression.md): identity, responsibility, boundaries, and
links. Load an interior only when that interface is insufficient. Depth does
not change the rule; see [scale](scale.md).

Fan-out is not a second composition primitive. It is the composition form
used when independent interiors would otherwise merge. A parent keeps
interfaces and returned answers, not sibling interiors. Do not split a
problem that is intrinsically interleaved — subagents cannot undo
[complecting](simplicity.md). Do not multiply agents when several interiors
fit in one working set: at most one child per independent unit, not one
child per node by default.

Operational moves belong to the
[`navigate`](../.agents/skills/navigate/SKILL.md) skill.

## Why

Cost of change is what must be held in one context; see
[change](change.md). The scarce resource in a reasoning step is
the working set: the facts that must be simultaneously true. Separable
structure in the artifact ([simplicity](simplicity.md)) only
scales if each step holds one concern, or a small jointly-needed set, and
composes the rest across the graph. Dumping independent interiors into one
context re-merges state spaces that the tree and graph were built to keep
apart. A token count is a symptom of that merge, not the rule. The bound is
the same for any traversal of a node interface.
