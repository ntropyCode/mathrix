---
name: code
description: Code posture, practical simplicity rules, and complexity radar. Use when writing, reviewing, or refactoring code in this repository.
---

# Code

## Posture

Code is the executed behavior. Cross-cutting constraint:
[simplicity](../../../intents/simplicity.md). This skill operationalizes that
intent for implementation choices.

Use when choices become tangled around simplicity, coupling, composition, or
naming.

## Before coding

- Surface material assumptions and trade-offs.
- Do not silently choose between meaningfully different interpretations.
- Say when a simpler approach exists.
- Ask when unresolved uncertainty would materially change the result.

Use judgment for trivial work; caution must not become ceremony.

## Scope

- Touch only lines required by the user's request.
- Do not refactor or reformat unrelated code.
- Match local style unless changing that style is the task.
- Remove imports, variables, and functions made obsolete by your change.
- Mention unrelated problems instead of silently expanding scope.

Every changed line should trace to the requested outcome.

## Naming

Use the same name for the same concept across types, variables, functions,
files, and schemas. Different concepts need different names. Avoid abbreviations
and synonym drift; use documented user-facing wording where it intentionally
differs from internal names.

For domain terms, use the owning node's `CONTEXT.md` when one exists.
Cross-cutting vocabulary and the durable intents are owned by root
[`CONTEXT.md`](../../../CONTEXT.md). Use
[`navigate`](../navigate/SKILL.md) when terminology or ownership is unclear.

## Practical rules

Apply these as heuristics, not mandatory constructs. Every abstraction must earn
its existence for the problem at hand.

- Use **values by default**: immutable data and collections where practical.
- Prefer **functions over methods** when behavior does not require object state.
- Use **namespaces/modules** to organize behavior instead of binding logic to
  class hierarchies.
- Keep information as **plain data** unless behavior is essential.
- Replace inheritance or switch-heavy branching with composable interfaces when
  that reduces coupling.
- Keep mutation local and explicit; isolate required shared state behind a
  managed boundary.
- Prefer **set/collection operations** when they express data transformations
  more clearly than imperative loops.
- Use **queues** when asynchronous buffering removes actual timing or location
  coupling between producers and consumers.
- Prefer **declarative data manipulation** when it keeps storage representation
  from driving domain logic.
- Express business policy as explicit **rules** when conditionals would
  otherwise be scattered.
- Preserve consistency with transactions and immutable values; accept eventual
  consistency only when explicitly required.

## Complexity radar (what to avoid)

- State that leaks across boundaries.
- Objects that mix identity, mutable state, and value semantics.
- Methods tied to hidden state and poor namespacing.
- Syntax-heavy modeling where plain data would work.
- Inheritance trees, large switch/match blocks, and conditionals spread across
  modules.
- ORM-centric architecture that couples domain logic to storage representation.

## Errors and nullability

Handle an error at the boundary that can recover or add useful context; otherwise
propagate it. Provide user-friendly messages in UI code and log non-sensitive
diagnostic context at operational boundaries. Never silently swallow errors or
dodge error handling with a default value. Defaults belong only where they are
part of business logic. Fail fast on violated invariants, not expected runtime
conditions.

Nullability expresses deliberate absence. It is not error handling.

## Comments

If code needs a comment to explain what it does, improve its names or structure.
Comments explain non-obvious local reasons that cannot be derived from code and
are too small for an intent.

## Checks

A test is one encoding of a check
([verification](../../../intents/verification.md)). Which encoding to
persist follows the change: use whatever makes the estimate decidable
([change](../../../intents/change.md)).

Do not add tests by default. Persist a check in the node it proves when
the user asks, when existing checks cannot decide the change, or when a
hand check will recur. Follow the nearest node's Verification section
when one exists. Do not weaken a check to make a change pass.

How to state checks and gather evidence belongs to
[`verify`](../verify/SKILL.md).
