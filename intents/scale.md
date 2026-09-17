# Scale

## Intent

An agent uses the same navigation and composition model whether starting at
repo root or in a deep context node. Depth changes which node is nearest, not
how the agent works.

Keep intent semantically rich and execution procedurally general. Documented
intent defines the domain outcomes, invariants, boundaries, and relations to
preserve; agents compose the program that satisfies them. Do not turn domain
knowledge into fixed, depth-specific workflows that overconstrain execution.

Operational navigation and working-set discipline belong to
[locality](locality.md) and the
[`navigate` skill](../.agents/skills/navigate/SKILL.md). Apply that model at
every depth; applicable parent context and linked intents remain
inherited constraints when relevant.

## Why

A constant procedure is how cost of change stays proportional as the
repository grows; see [change](change.md).

The repository must scale along two axes: structure grows and agents improve.
One constant, general model is the only procedure that is free on both. When
procedure varies by depth, every new node adds workflow to write and maintain,
and each workflow freezes in the capability of the agent it was written for —
growth acquires a cost and improvement a ceiling. A single general model
applied to declarative intent inverts both: unbounded depth needs nothing new,
and every gain in agent capability is realized everywhere at once.

The same constancy scales a third axis — task size. A bounded context window
recurses over an arbitrarily large problem only because the split-and-return
move is identical at every depth and every crossing returns compressed; see
[compression](compression.md) and [locality](locality.md).
