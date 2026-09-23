# Spatial relations as temporal reconstruction

An exploratory thought from the discussion on 2026-09-18, extending
[atomic observers, space, time, and complexity](atomic-observers-space-time-and-complexity.md).

> What is available as a spatial relationship to one observer may require a
> temporal process of reconstruction for another.

## The visualization supplies an observer with uncounted capabilities

In a binary animation of successive powers of two, a human sees a bit moving:

```text
0001
0010
0100
1000
```

That reading combines access to multiple positions, memory across frames, and
an identity criterion that treats successive ones as one moving pattern. The
configurations do not by themselves establish a persisting object traveling
between cells.

An observer restricted to one cell might instead record `0 → 0 → 1 → 0`.
That record alone cannot distinguish a passing pattern from a locally generated
pulse. Additional access, retained observations, or knowledge of the update
rule may make reconstruction possible. Some observation boundaries may leave
the alternatives indistinguishable however long the observer watches.

The motivating intuition is that a human is "large" enough to see the screen
"simultaneously." The operational question is what relations the observer can
access and retain. Treating a whole configuration as one observation leaves
the cost of gathering and integrating its local states outside the model.

This proposes a relationship between observation and resource cost; it does
not establish that physical space and time are identical. It connects to
[state, observation, and identity](../intents/research.md#state-observation-and-identity).

## Question to test

How much of an algorithm's apparent simplicity belongs to the algorithm, how
much to its representation, and how much to the observer?

A possible experiment would show the full animation alongside the record
available to a single-cell observer. Specify access, memory, prior knowledge,
and observation timing, then vary them to determine when the observer can
distinguish translation from a local pulse. Count the reconstruction operations
separately from the operations producing the displayed sequence.
