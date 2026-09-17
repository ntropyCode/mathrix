# Compression

## Intent

Information crosses a node boundary only in compressed form. Downward, the
node interface — a `CONTEXT.md` — is the compression of the interior.
Upward, a returned answer is the compression of a traversal. Interface and answer are one operation: static and dynamic
compression of the same boundary. A `CONTEXT.md` compresses an interior
across space; an intent compresses desired state across time.

The test of a compression is sufficiency, not size: the receiver must be able
to decide — relevance, routing, integration — without decompressing, that is,
without loading the interior. A crossing fails in exactly two ways:
over-lossy, when a fact the receiver's decision needs did not survive; and
under-compressed, when interior leaks into the receiver's working set.

An interface adds no information to the system; it relocates cost from every
future reader's working set to one author's, once. Prefer deep nodes — small
surface over substantial interior. A boundary whose compression saves the
receiver nothing is not a semantic boundary; see node-creation restraint in
the [`intend` skill](../.agents/skills/intend/SKILL.md).

## Why

Cost of change is paid per fact held in a bounded context; see
[change](change.md). An agent is a token predictor whose entire
input is its context window; every loaded token conditions prediction, so
reasoning cost is paid per token held.
The window binds before it is full: attention is a finite budget paid
pairwise, and precision degrades as tokens irrelevant to the decision dilute
the ones that carry it. Compression is therefore capacity and precision at
once — the only way a bounded window hosts reasoning about an unbounded
system, and the way it stays sharp below its cap.

Compression is what makes fan-out compose ([locality](locality.md)): children
return answers, not interiors, so a bounded parent window can command
arbitrarily large total computation, and the same crossing rule at every
depth keeps that recursion free ([scale](scale.md)).
Compressing well and reasoning well are two views of one capability, so
compressed interfaces are not a concession to a weak reader; they are the
native shape of the medium, and every gain in agent capability improves both
the writing and the reading of them.
