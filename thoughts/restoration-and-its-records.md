# Restoration and its records

An argument retained from 2026-09-18 about the scope of reconstructing a past
configuration. It does not establish physical travel to an earlier event.

## Restoration has a boundary

Separate a target S from an apparatus R, including its relevant surroundings:

    (S0,R0) → (S1,R1) → (S0,R2).

The target has been restored. The complete configuration is restored only if
R2=R0 too. If the apparatus retains a newly added record of the restoration,
that record itself makes R2 different from R0.

Under a deterministic model, restoring the complete relevant configuration and
the same driving conditions reproduces its evolution. An observer whose memory
is restored exactly cannot also retain a newly added internal memory of the
restoration. Preserving that memory puts something outside the exact restoration
boundary.

> An earlier configuration can be restored within a boundary while the history
> of that restoration remains outside it.

Reconstructing a configuration, replaying its evolution, and undoing every
consequence of the replay are different tasks.

## Expanding the boundary does not prove an infinite regress

Including the reconstruction machinery enlarges what must be restored. Another
controller may introduce further records and effects. This motivates investigating
the cost of enlarging the boundary, but does not establish an unavoidable infinite
hierarchy of controllers.

Restoration need not involve separately simulating the restoration procedure.
An inverse operation may suffice, and reversible computation can undo intermediate
work with trade-offs between operations and storage. See
[Bennett's reversible simulation](https://research.ibm.com/publications/timespace-trade-offs-for-reversible-computation).

If the available information admits several past configurations, additional
computation alone cannot identify the actual one without further evidence or
constraints. If sufficient information is available, resource cost remains a
separate question. These are among the
[different kinds of limits](descriptions-implementations-and-formal-limits.md#three-different-obstacles).

The argument does not show that every system is unable to reconstruct its own
past. Known reversible rules can permit recovery of earlier configurations;
the scope of the configuration, implementation resources, and records must all
be explicit.
