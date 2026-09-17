# Simplicity

## Intent

Prefer simplicity over ease. Simplicity is the absence of avoidable
interleaving: separable entities, boundaries, relations, and rules so each part
can be understood, changed, and tested without dragging unrelated concerns into
the same reasoning step.

Complexity is interleaving that makes one concern depend on another that could
have remained separate. Some complexity is intrinsic; incidental complexity is
coupling added by representation, naming, process, or convenience.

Ease is nearness to an actor's habits or tools. It may justify a path into a
system; it must not justify avoidable complexity inside the artifact.

Apply Occam's razor: do not multiply entities beyond necessity. Among designs
that satisfy the need, prefer the one with the fewest concepts, parts, and
assumptions; every additional entity must earn its existence.

Preserve separable concerns. Do not braid independent who/what/why/how/state
concerns together (“complect”) for familiarity or short-term convenience.
Minimize coupling; prefer composition, explicit boundaries, and the least
structure the problem needs.

## Why

Cost of change is bounded by what one actor holds; see
[change](change.md). Concerns kept separate add their state
spaces: each is reasoned about alone. Interleaving merges state spaces, and
merged states multiply — every configuration of one concern must be
considered against every configuration of the other — so what must be held
grows exponentially with each coupling instead of linearly with each part,
until a change costs more context than any actor has. Simplicity is what
keeps local reasoning sufficient — and local reasoning is the only kind that
scales. [Locality](locality.md) is that bound applied to a
reasoning step.
