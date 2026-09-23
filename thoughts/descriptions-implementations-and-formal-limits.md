# Descriptions, implementations, and formal limits

Lessons retained from the discussion on 2026-09-18, including the resolution of
the proposed objection to the halting proof.

## A description depends on an implementation

Source text is an information pattern; execution requires an interpreting
mechanism. The changing logical state, the description of its rule, and the
physical apparatus implementing that rule are different quantities.

Calling a program "D" supplies no behavior without a fixed interpretation. If
an interpreter supplies the missing behavior, information and cost have moved
into that interpreter. A complete physical account must include it. This does
not prevent a specified mechanism from processing descriptions as inputs.

Input-port width is not total input length: a narrow interface can read a longer
description through successive accesses, with the required storage and control.
The three port values of a two-input, one-output gate do not specify its rule;
an arbitrary Boolean function of that interface has four truth-table entries.

## Self-input does not require a physical duplicate

The halting proof uses finite program descriptions with fixed, effective semantics.
Turing explicitly encodes machine transition tables and supplies a universal
machine's interpreting rules. An implementation can receive a description of
its own computational rules as data. That description does not have to contain
another copy of itself: the data is supplied at execution. See
[Turing, sections 5–8](https://theory.stanford.edu/~trevisan/cs172-07/turing36.pdf).

The contradiction assumes a detector that always terminates and correctly decides
termination for every program/input description. It constructs a procedure that,
on its own description, does the opposite of the detector's prediction. It does
not assume an actual universally correct detector already exists.

Demanding a description of the complete physical apparatus, including every
microscopic detail, changes the question. The theorem applies to its specified
abstract model; extending its scope to all possible physics requires a separate
argument. The input-size objection raised in the discussion does not invalidate
the formal self-input construction.

## Three different obstacles

- **Missing information:** several histories fit the available configuration.
- **Resource requirements:** a result is obtainable but costly to obtain.
- **Formal limits:** no single algorithm or fixed proof system settles every
  question in the relevant unrestricted class.

Gödel's incompleteness theorems concern consistent, effectively axiomatized
theories with sufficient arithmetic. Such a theory is incomplete; under the
standard conditions and formalization, it cannot prove its own consistency.
These are not merely bounds on search time or memory. See
[Aaronson's exposition](https://www.scottaaronson.com/incompleteness.pdf).

Self-reference connects these results to the question of including an observer
and its reasoning in the system being studied. It does not prove that every
system is unable to model itself or replay a known finite history. Nor does it
establish an infinite resource regress for
[restoration](restoration-and-its-records.md).

For a closed deterministic model with a fixed finite configuration set and an
effective transition rule, termination is decidable in principle by detecting a
halt or a repeated configuration. The unrestricted halting theorem concerns a
different scope. Keeping these scopes explicit prevents a physical resource
limit from being mistaken for either a proof or a refutation of undecidability.
