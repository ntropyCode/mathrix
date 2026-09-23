# When rotation computes

A concrete test case from 2026-09-18 for the proposed account of
[problem, solution, and access](configurations-histories-and-access.md#problem-and-solution-are-roles-relative-to-a-question).

## Motion and a computational task

A rotor alternating between two readable orientations exhibits periodic behavior.
That observation alone does not establish a computational task. Prepare it at
zero, couple each input event to one half-turn, supply n events, and read the
final orientation. Under that encoding, it computes `n mod 2`.

The relevant organization includes preparation, input coupling, input delimitation,
and readout. These cannot be left out of the apparatus or cost merely because
the displayed logical value needs only one bit. A rule may be embodied in
physical interactions rather than stored as a separate bit string.

The working criterion is that a mechanism reliably realizes a specified
input/output relationship across admissible inputs under a fixed encoding.
One matching result or a pattern interpreted after the fact does not establish
this capability. This is an operational proposal, not a universally settled
definition of physical computation; compare
[Horsman and colleagues](https://arxiv.org/abs/1309.7979).

## Reversible turns can yield an answer with an ambiguous origin

Each half-turn is reversible. The final orientation nevertheless cannot recover
the number of input events: zero, two, four, and further even counts share one
answer. The input history may remain encoded in the event source or elsewhere;
the rotor alone does not preserve it.

This separates the reversibility of an elementary transformation from the
recoverability of the task's input given its answer. See
[answers and recoverability](answers-recoverability-and-entropy.md#an-answer-can-omit-its-causal-inputs).

An experiment should vary input histories, verify parity, and identify the
resources supporting preparation, control, and observation. It should then ask
which differences between equal-parity histories remain recoverable in the
complete setup. No experiment has yet been implemented here.
