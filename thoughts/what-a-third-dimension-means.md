# What a third dimension means

Notes from 2026-09-23 on moving the bit visualization from a 2D field to a 3D
cube whose cells all start at 0. They record a working position and prototype
observations; they do not change [research intent](../intents/research.md).

## The computation has no dimension

The engine's state is a set of registers whose bits are indexed by weight; a
trace is a sequence of such states. Neither supplies coordinates. A picture
assigns them through a layout, a map from storage cells to positions. Moving
from two to three dimensions changes that map, not the arithmetic.

The axes of one layout can mean different kinds of things. In a cube that
stacks registers and wraps long ones:

- the weight axis is intrinsic: one position toward higher weight doubles a
  bit's value, and shifts and carries move along it;
- the register axis is a label: the vertical order of registers is chosen,
  not measured;
- the wrap axis is an artifact: bit 0 and bit 12 become neighbours although
  their weights differ by a factor of 2^12.

A bit appearing to move vertically rather than horizontally says something
about the algorithm only along an intrinsic axis. Direction in a picture is
subject to the same caution as similarity: a layout can create it.

## Change is not cause

A record of flips shows which cells changed, not why. `11 → 110` is bit 0
turning off and bit 2 turning on; reading it as one pattern moving one place
is an identity judgment by the observer, as in
[state, observation, and identity](../intents/research.md#state-observation-and-identity).
The direction of influence belongs to the rule: new bit i is computed from old
bit i−1. Showing causality requires each written cell to name the cells it was
computed from.

Declared dependencies make direction measurable:

- addition: sums stay at their weight and carries move one weight up;
- shift-and-add multiplication: the multiplicand moves up in weight, the
  multiplier down, and one multiplier bit gates a whole addition, a control
  dependency that no layout makes local;
- long division: each comparison depends on the entire remainder, most
  significant bit first.

A trace runs forward in time. The addition step
`(a,b) ↦ (a XOR b, (a AND b) ≪ 1)` is not injective: `1+2` and `3+0` both map
to `(3,0)`. Stepping backward through a timeline uses retained history, not an
inverse of the dynamics; `(x,y) ↦ (x, x XOR y)` is a step that could be
inverted.

## When a third axis is intrinsic

A third axis carries meaning when the algorithm has a third independent index,
or when a sequence of stages is retained in space.

- School multiplication: the partial product `a_i AND b_j` has weight `i+j`.
  The `(i,j)` table is the rectangle from the research intent, and exchanging
  the operands transposes it. Aligning its rows by weight is a shear, a change
  of coordinates that leaves the represented terms unchanged. Reducing columns
  with full adders is local in weight: sums stay, carries move one weight up.
- A product of three factors indexes its partial products by `(i,j,k)` with
  weight `i+j+k`; bits of equal weight lie on diagonal planes of a cube.
- A radix-2 FFT on 2^d points combines index `n` with `n XOR 2^s` in stage `s`.
  For `d = 3` the indices are the corners of a cube and each stage acts along
  one axis.

## Prototype observations

A prototype on 2026-09-23 drew three multiplication algorithms in such a cube.
Shift-and-add came from the engine trace with its sum stored in place; school
multiplication wrote one new layer per step and kept earlier layers. The one-row
version loads the operands once and only reads them afterward. It adds the
multiplicand into a single accumulator row starting at weight `j` for each set
multiplier bit `j`, one bit position per step, with one carry cell.

| 16-bit × 16-bit | steps | bits turned on | bits turned off | peak lit | cells used |
| --- | --- | --- | --- | --- | --- |
| one row, offset addition | 272 | 78 | 30 | 48 | 65 |
| shift-and-add, in place | 80 | 604 | 588 | 63 | — |
| school, layers kept | 35 | 1,992 | 0 | 1,992 | 2,671 |

The one-row version needs no copies, but its reads are not local. Reading
`a_k` into weight `j+k` spans `j` positions, and a fixed carry cell is read at
every weight, up to 32 positions away here. Its loop position is control state
held outside the displayed bits. The school version keeps its history as layers,
so its shift appears as a visible copy. The one-row version turns that shift
into an offset in its control state.

The school version writes 2,671 cells, many holding 0, and never erases one.
The shift-and-add version reuses a small set of cells, and its apparent motion
comes from pairing flips. A school step writes a whole layer at once, so equal
step counts would not mean equal work.

The school version's dependencies were checked on 311 products. Every edge runs
from one layer to the next. After the alignment layer, every edge moves 0 or +1
in weight. Every written bit recomputes from its declared sources, and every
layer from the alignment onward has a weighted sum equal to the product. The
operand broadcast, `b_j` to row `j` and `a_i` to column `i`, has reach up to the
operand width.

This gives the proposed exchange between state and process a concrete
accounting. One algorithm keeps its history as layers of retained cells; the
other overwrites cells over more steps. Which differences each retains, and at
what cost, can be measured rather than asserted; compare
[restoration and its records](restoration-and-its-records.md).

## Tracing causes

A later iteration drew each step's dependencies as arcs from cause to effect.
It could also trace a selected bit's causes back through earlier versions of
cells overwritten in place, with time drawn as depth. Checking these traces by
flipping operand bits gave two results.

Data dependencies alone are incomplete. In the one-row version, a multiplier
bit `b_j = 0` causes no accumulator write, yet flipping it changes the product.
The loop counters were therefore represented as bits, so that every step writes
control state. A product bit's full causes are then the causes of its last write
together with those of the final counter state. The absence of a later write is
also decided by control. Across all pairs of 4-bit operands, flipping an operand
bit outside those full causes never changed the product bit (512 flips). Tracing
data dependencies alone missed a real cause 2,518 times.

Control makes nearly every operand bit a cause. For those products, a product
bit's full causes contained 7.8 of the 8 operand bits on average; its data causes
contained 2.2. School multiplication is not exempt. Its final addition stops when
no carry remains, and in the tested cases that decision made every tested operand
bit a cause of every product bit. A fixed-length circuit without data-dependent
stopping remains the case to test for narrow full causes.

## Open questions

- Which criterion should a layout meet? One candidate: every declared
  dependency spans at most one cell along an intrinsic axis, and exceptions are
  drawn rather than hidden.
- Should the engine's frames carry dependencies, and at what granularity: bit,
  register, or step?
- Is a stage axis a spatial reading of time, or a record of it?
