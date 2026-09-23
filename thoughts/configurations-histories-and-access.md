# Configurations, histories, and access

Exploratory synthesis from 2026-09-18, extending
[atomic observers, space, time, and complexity](atomic-observers-space-time-and-complexity.md).

## Configurations and histories can share a description

The entries `0,1,1,0` can describe values at four sites or values encountered on
four occasions. With n independent binary entries, either interpretation admits
2^n possibilities. The count does not assign spatial or temporal meaning; those
meanings require relationships such as position or order.

This is a concrete combinatorial equivalence, not proof that physical space and
time are interchangeable. Nor are 2^n possible histories of length n equivalent
to one history containing 2^n observations. Converting between representations
requires an explicit construction and an account of access costs.

For a locally restricted observer, neither a whole configuration nor a whole
history is automatically available. Both descriptions can connect observations
beyond one local encounter. See
[spatial relations as temporal reconstruction](spatial-relations-as-temporal-reconstruction.md).

## Determination does not establish accessibility

For a deterministic answer Y=f(X), Shannon conditional entropy satisfies
H(Y|X)=0: complete input information determines the answer. This does not measure
the work a bounded observer must perform to obtain it. The information-theoretic
identity follows from deterministic dependence; see
[conditional entropy and the chain rule](https://web.stanford.edu/class/ee376a/files/lecture_3.pdf).

The research question is what must be reorganized to make an already determined
difference accessible. Treating computational difficulty as a relationship
between constraints and an observer's permitted access is a proposed framework,
not a proved replacement for complexity theory.

## Problem and solution are roles relative to a question

A supplied configuration becomes a problem relative to a requested outcome.
A resulting configuration counts as a solution only under a specified correctness
relation. For example, given bits a and b, the question "Are they unequal?"
requires an accessible c satisfying c=a XOR b.

The observer supplies the question and required access; this does not make
correctness arbitrary. Once the task is fixed, the relationship constrains the
acceptable answers. Different questions can require different differences from
the same supplied configuration.

A model based on differences still needs rules of composition, allowed
transformations, an observation boundary, and a resource measure. These do not
follow from the existence of difference alone. A configuration/history exchange
must be checked for preservation of compatible combinations, initial access,
and the permitted ways of obtaining further information.
