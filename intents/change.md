# Change

## Need

A repository holds state. Some entity wants that state in a
desired shape, and the desired shape moves. Closeness to that
shape is the purpose of every change.

The desired state lives only partly in the repository and is
revealed incrementally, so closeness is never measured, only
estimated. Two distances matter: the estimate's distance to
the desired state, and the repository's distance to the
estimate. Tighten the estimate with whatever can make it more
precise for this change — requirements, documented intent,
tests, runtime observation. Then move the repository until
the estimate is satisfied
([verification](verification.md)). Volume or rate of change
is not a substitute for either distance.

## Constraint

Every actor that changes a repository — human or agent — reasons within a
bounded context. A change costs whatever must be held in that context to
resolve intent, make the change, and verify it. That cost must stay
proportional to the change, not to the repository.

Because the desired state is unobservable, closeness can only be checked
against the environment, never assumed
([verification](verification.md)). Because documented intent is the
persisted portion of the desired state, a prompt that contradicts it leaves
the actor unable to know which is current; the mismatch is information for
the human, not a choice for the actor. Because cost is paid per fact held,
the change that satisfies the resolved outcome while holding least is the
one to make.
