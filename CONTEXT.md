# Mathrix

Mathrix investigates arithmetic through bit configurations, representations,
and explicit algorithms. Its responsibility is to make the underlying
processes observable and test proposed relationships between them. The
long-term target is to understand the arithmetic and spectral descriptions
of prime structure through the Riemann zeta function.

## Intent

[Research](intents/research.md) owns the motivation, working scope,
mathematical starting points, and open questions. It distinguishes known
identities from interpretations and conjectures. Visualizations serve that
research by making specified differences and transitions available for
inspection.

The inquiry includes the proposal that entities, states, and their spatial or
temporal relationships share a basis in organized differences. It asks which
changes of representation or exchanges of state and process preserve the
differences a question requires. These are research directions to make precise
and test, alongside the established arithmetic identities.

The repository contains documented intent, operating guidance, and a browser
arithmetic experiment. The application evaluates formulas through explicit
algorithms and exposes their register states in a wrapped bit field. Its
execution, representation choices, and current limits are described in
[README.md](README.md#arithmetic-and-limits). Prior prototypes inform the project;
their implementations are not assumed correct or imported as dependencies.

## Vocabulary

- **difference** — how configurations or observations differ or could differ;
  an accessible difference can be detected by an observer, and a retained
  difference remains recoverable after a transformation
- **value** — the mathematical object represented, distinct from its encoding
- **representation** — an encoding with a specified interpretation
- **algorithm** — an explicit procedure implementing an operation within a
  stated domain
- **entity** — a unit the model distinguishes and, where needed, tracks
  through change
- **identity** — the criterion for treating configurations as belonging to
  the same entity; it may depend on history and relations
- **state** — the configuration within a chosen boundary; a complete process
  state includes retained inputs and control information needed to determine
  its evolution
- **observation** — the differences exposed by a specified view of a state
  or history
- **invariant** — a property preserved by a specified transformation
- **hypothesis** — a proposed relationship whose supporting argument or
  evidence remains to be established
- **intent** — the desired outcome; **documented intent** is its persisted
  portion in context files and named intents
- **actor** — a bounded human or agent making a change
- **check** — an observable predicate derived from intent;
  **evidence** is the observation that decides it
- **node** — a folder with a `CONTEXT.md`; **interface** is that file and
  **interior** is everything behind it
- **working set** — the facts that must be held together in one reasoning step

## Boundaries

Bits and algorithms are the chosen level of investigation. A claim about
physical space, time, or an ultimate substrate requires its own model and
evidence. Similar-looking pictures do not establish equivalent processes,
and a correct final answer does not certify an intermediate trace.

No particular application framework, physical theory, new arithmetic axiom,
or proof of a zeta hypothesis is presumed by the project.

## Tree and graph

The filesystem tree defines containment, scope, and ownership. Children
inherit applicable parent context unless narrowed locally. A folder without
a `CONTEXT.md` is containment, not a separate semantic node.

The semantic graph consists of curated links between context nodes. Add a
link when this node's responsibility is constrained by the target's interface
and the constraint is not already inherited from a common ancestor. Each
context file is a [compressed](intents/compression.md) interface. Search can
enter either structure; navigation then follows the smallest sufficient
context.

## Working constraints

The [change](intents/change.md) constraint keeps the cost of a change
proportional to that change rather than the whole repository. It is an
operating constraint, independent of the mathematical hypotheses under study.

- [Simplicity](intents/simplicity.md) — avoid interleaving concerns that can
  remain independently understandable.
- [Scale](intents/scale.md) — use the same navigation and composition model
  at every depth.
- [Locality](intents/locality.md) — hold the smallest sufficient working set.
- [Compression](intents/compression.md) — cross boundaries with sufficient
  interfaces and findings.
- [Verification](intents/verification.md) — state checks, observe the actual
  artifact, and distinguish evidence from an expectation.

## Relationships

- [AGENTS.md](AGENTS.md) — imperative agent contract.
- [Code](.agents/skills/code/SKILL.md) — implementation and review posture.
- [Intend](.agents/skills/intend/SKILL.md) — ownership and authoring of intent.
- [Navigate](.agents/skills/navigate/SKILL.md) — finding sufficient context.
- [Verify](.agents/skills/verify/SKILL.md) — choosing and evaluating evidence.

## Verification

Run `npm run check` for parser, arithmetic-invariant, representation, viewport,
and worker-streaming checks. Run `npm start` to inspect formula execution,
playback, history, and pan/zoom in the browser; stop that server after verification
unless it is being presented to the user. The application does not write run data
to disk.
