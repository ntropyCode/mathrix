# Verification

## Intent

A change is done when its checks hold against the environment, not when
the actor believes it. Verification is how the unobservable desired state
becomes partially observable: it checks the environment against the
expressed portion of intent — documented intent plus the resolved prompt.

A **check** is an observable predicate over the environment derived from
intent. State it before the change, as the exit condition, and make sure it
can fail. **Evidence** is the environment observation that decides a check.
It comes from the real artifact — run the command, drive the flow, read the
value back, replay the input, compare the trace — never from a proxy ("it
compiles"), a self-report, or a delegate's summary.

The check matches the change: same surface, same grain. Its cost must stay
proportional to the change, not to the repository ([change](change.md)), so
verification knowledge lives at the node it proves, in that node's
interface. A check that would require loading unrelated interiors is a
[locality](locality.md) failure, not a verification requirement.

Prefer the strongest mechanical rung the situation allows: a state that
cannot be represented, then a type, lint, or CI gate, then a script, then a
runtime check, then a prose instruction. A check repeated by hand is a
signal to encode it structurally.

Verification knowledge is documented intent. It rots as the interior
changes, is owned like any other intent, and is never edited to make a
failing check pass. Evidence that contradicts documented intent is a
mismatch for the human, not a choice for the actor.

Evidence crosses a boundary [compressed](compression.md): which checks ran,
whether they held, and where the artifact is — not the transcript.

## Why

The desired state is unobservable, so without a check the loop is open:
every change moves the state in a direction nobody observed, and drift
accumulates silently; see [change](change.md). An actor's belief about its
own change is not an observation — agents report what they intended, not
what happened — so only the environment can close the loop.

Checks that cost less than the change they decide are what make a bounded
loop converge and autonomy safe: the exit condition is checkable, so
retrying is bounded and a wrong change is caught before it compounds.
Because cost is paid per fact held, a check must be local to the node it
proves and its evidence must return compressed; that is why verification
knowledge sits in node interfaces and crosses as an answer. A mechanical
check holds without the actor's cooperation or memory; a prose instruction
holds only while it is read.
