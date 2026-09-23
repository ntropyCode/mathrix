# Answers, recoverability, and entropy

Synthesis from 2026-09-18. The examples below are explicit logical models;
thermodynamic claims additionally require a physical implementation and stated
statistical assumptions. Existing arithmetic context lives in
[retained information and physical carriers](../intents/research.md#retained-information-and-physical-carriers).

## An answer can omit its causal inputs

XOR with only its answer retained merges `00` with `11`, and `01` with `10`.
It preserves "equal versus unequal" while omitting which pair occurred.
For independent, equally likely inputs, the two input bits separate into one
bit carried by the answer and one bit still needed to recover the input given
that answer:

    H(a,b) = H(c) + H(a,b|c) = 1 + 1, where c = a XOR b.

The reversible transformation `(a,b) → (a,a XOR b)` retains an original input
alongside the answer. Its inverse recovers b by XORing the two retained values.
This recovers logical inputs under the specified rule, not an arbitrary physical
history. Reversibility depends on the complete retained configuration.

## Learning can add correlation without erasure

With an initially prepared record bit, `(a,b,0) → (a,b,a XOR b)` preserves all
four input alternatives and makes the answer available in the record. The
observer gains information through correlation. Across equally likely inputs,
the answer remains equally likely to be zero or one; learning it does not mean
forcing it to a universal constant.

Resetting an unknown bit and acquiring a faithful record are different operations.
General computation can preserve recoverability, and intermediate work can be
undone while retaining specified inputs and outputs. Logical reversibility does
not guarantee a thermodynamically reversible implementation. See
[Bennett on reversible computation](https://www.cs.princeton.edu/courses/archive/fall04/cos576/papers/bennett73.html)
and [the thermodynamics of measurement and erasure](https://doi.org/10.1007/BF02084158).

Preparing, controlling, reading, and reusing the apparatus belong in the resource
account. There is no universal exchange rate of one bit learned for one bit lost.

## Relationships can carry locally invisible information

Compare equally likely joint configurations `{00,01,10,11}` with equally likely
`{00,11}`. In both cases, either component alone is equally likely to be zero or
one. Only the second case lets one component identify the other. Individual
statistics do not determine the information in their relationship.

For initially independent systems A and B with finite classical configuration
sets undergoing a reversible joint evolution, their joint Shannon entropy is preserved and
`ΔH(A)+ΔH(B)=I_final(A:B)≥0`. An analogous result holds for quantum von Neumann
entropy under unitary evolution. Reversing the process starts with correlations;
the independence assumption no longer applies.

With an initially thermal reservoir uncorrelated with the system and unitary
joint evolution, microscopic accounting yields Landauer's bound. For resetting
an equiprobable bit, the average heat delivered to the reservoir is at least
`k_B T ln 2`. See [Reeb and Wolf](https://arxiv.org/abs/1306.4352).
The second law does not require every atom's entropy to increase at every
interaction; small systems exhibit fluctuations, including negative trajectory
entropy production. See the
[single-electron experiment](https://www.nature.com/articles/nphys2711).

Information omitted from a view is not automatically physically erased, and
inaccessible correlations are not automatically heat. The costs of implementing
a relationship and erasing information must be accounted for separately.

## Determinism and reversibility impose different requirements

The rule `0 → 0; 1 → 0` is deterministic but irreversible. A unique consequence
does not imply a recoverable origin. An actual execution can have a definite
past even when its result cannot identify that past.

The open physical question is whether an apparent merger of configurations is
complete or occurs only within an observation boundary, with differences
remaining elsewhere or in correlations. Determinism alone does not settle this.
Neither the determinism nor the global irreversibility of the universe was
established in the discussion.
