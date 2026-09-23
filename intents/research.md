# Research intent

## Look beneath arithmetic

Mathrix explores mathematics one implementation level below familiar arithmetic.
Bits are a working basis for examining how calculations happen, without claiming
that bits are the ultimate constituents of mathematics or physical reality. The
aim is to make arithmetic visible as transformations of state: which information
is present, how operations move or combine it, and what an interface hides.

The long-term visualization goal is to "simulate" a function such as the Riemann
zeta function and see what its computation looks like in Mathrix. The function's
evaluation runs in the foreground; Mathrix exposes the underlying binary
algorithms and state transitions in the background. The initial arithmetic
visualizer is a step toward this goal. The particular evaluation algorithm,
representation, and visual layout remain open choices.

The visualization must make the underlying computation visually comprehensible
to a human. A cell grid is one possible approach, not a requirement. Choose the
visual form for how clearly it exposes the relevant states, transitions, and
relationships.

The ambition is to use this understanding to address difficult mathematical
problems. The motivating hypothesis is that some obstacles encountered at an
arithmetic interface may become tractable when its underlying representations,
rules, or assumptions are exposed. The programming analogy is an error whose
cause lies inside an opaque library: rearranging the caller cannot reveal what
the interface conceals. This motivates investigation; it does not establish that
conventional mathematics is faulty or that a particular unsolved problem has
such a cause. A proposed solution still needs an argument under explicit
assumptions.

Even school arithmetic teaches procedures for manipulating representations.
Mathrix makes those procedures objects of study. Addition and multiplication
provide the starting point; subtraction and division bring inverse-operation
questions and their domain restrictions. Bits are a practical level at which to
inspect these processes, while the question of an ultimate atom remains open.

Quake III's inverse square root illustrates why representation matters. It uses
the floating-point bit pattern to
construct an initial estimate, then refines that estimate with a Newton step.
The arithmetic interface alone does not reveal this route. The
[original implementation](https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/q_math.c)
is motivation to inspect representations and algorithms, not evidence that all
arithmetic has an analogous shortcut.
Its appeal is the possibility of reducing computational cost while meeting an
accuracy requirement. Both error and cost must be measured for any proposed
shortcut and the setting in which it is used.

Keep three objects distinct: a number, its representation, and the process that
transforms representations. Equivalent numerical results can arise through
different state trajectories. A useful investigation exposes those differences
without mistaking a property of one encoding or algorithm for a property of the
number itself.

## A common basis of differences

The foundational proposal is that entities, states, and change may be understood
through organizations of differences. Binary provides a minimal vocabulary for
two distinguishable alternatives; the symbols `0` and `1` name those alternatives.
Different entities can occupy equal states, and a single entity can contain many
distinguishable components. Difference includes possible alternatives, not a
requirement that every current value be unequal; see the [shared vocabulary](../CONTEXT.md#vocabulary).

An entity at one level may be part of a larger entity's state at another. Two
switches each have an on/off state; viewed as a panel, their joint configuration
is one state. A persisting pattern may likewise be identified across changes in
the elements carrying it. The research question is how entity boundaries and
identity arise from this organization, rather than assuming that the entities
must be primitive.

The stronger conjecture extends this common basis to space and time: spatial
arrangements and temporal histories may be different organizations of differences
and relations. For an observer with access only to local differences, their
classification as different entities or different states may be unavailable.
Mathrix aims to investigate whether and how the familiar roles can arise from a
common description. Observational indistinguishability is one tractable starting
point; establishing that common origin would require an account of the relations
that generate the different roles.

## State, observation, and identity

The working state of arithmetic includes more than the displayed result. Operand
registers, carry information, intermediate values, and control state can determine
what happens next. Exposing these dependencies should make it possible to ask
which apparent operations become simple transformations when their hidden state
is made explicit.

Choose a level, a boundary, and an identity criterion for each question. Make
changes of level explicit. Grouping components into one state does not impose
dependence among their values: `(x,y)` may vary freely, or a constraint such as
`x=y` may reduce the possible configurations. A change of coordinates can expose
such structure without changing the represented object.

Translation, recurrence, and rotation are useful subjects only when their meaning
is specified. What moves, relative to which coordinates? What returns: a displayed
pattern, a register value, the complete machine state, or an equivalence class?
When are two patterns the same under translation, rotation, relabeling, or another
transformation? Identify the map and the proposed invariant before interpreting
an animation.

A rectangle of units makes multiplication's commutativity visible: a quarter
turn exchanges rows and columns while preserving the total and the shape up to
rotation. An observer seeing the whole array can recognize this at once; a local
observer must accumulate evidence or exploit a known rule. Mathrix asks how an
entity's identity and its changing states can be described through the same
underlying differences, and which observation boundaries make those descriptions
appear different.

Observation introduces a separate ambiguity. The same local sequence can be
recorded by scanning different sites or by watching a single site change. A
record alone may not distinguish these mechanisms. Investigate what an observer
retains and what additional information would resolve that ambiguity. Such
examples do not, by themselves, derive physical space or time from observations.

For example, reading `0,1,0,1` from four fixed sites and recording `0,1,0,1` at
one changing site produce the same value record if source and movement information
are excluded. Here an "atomic observer" means locally restricted access, not a
settled physical particle size. Memory makes comparison possible; a single value
without retained differences cannot establish change or persistence. Physical
size alone does not determine which relations an observer can access.

Coexistence, succession, and a stored record of succession must remain explicit
in an experiment's model. A list of entities supplies no geometry by itself;
different state values supply neither their order nor elapsed duration. A model
that supplies coordinates, an update order, or a clock must expose those as
assumptions when investigating their possible origin.

Equivalence depends on the differences the question requires. A total can agree
while histories differ; equal observations can conceal different sources. A
general proof about rectangles and evidence that a particular collection forms
a rectangle are different tasks. Local inspection may require traversal, memory,
or a supported construction invariant. Readings gathered while a system changes
must refer to a consistent configuration or a specified history. These connect
the research to [locality](locality.md), [compression](compression.md), and
[verification](verification.md): a compact description helps only when it retains
the required differences and its claims are supported.

## Translation, recurrence, and growth

The motivating difference is between recurrence, where an orientation, phase,
or chosen state returns, and translation into positions not previously visited.
Mixtures can combine recurring internal behavior with continuing displacement.
Which description applies depends on the tracked pattern, coordinates, and
boundaries; recurrence alone does not establish geometric rotation.

The sequence \(2^k\) appears in binary as a single one moving through successive
positions: \(100,1000,10000,\ldots\). Multiplication by two shifts an unsigned
binary representation left, provided sufficient space is available. A pattern
can persist while its occupied positions change. On a finite ring a shift can
return to its starting configuration; on an unbounded line it need not. Boundary
conditions are therefore part of any claim about translation or recurrence.

Addition of two \(w\)-bit nonnegative integers needs at most one extra result
bit, rather than always growing by one. For a positive integer \(a\) and positive
integer exponent \(k\), the binary width is

\[
L(a^k)=\lfloor k\log_2 a\rfloor+1\leq kL(a).
\]

Squaring and cubing thus scale the required width approximately by two and three;
they do not always do so exactly. The exponent parameter also need not equal the
number of execution steps: repeated multiplication and exponentiation by squaring
have different traces. A changing intermediate result is not by itself a
rotation. Recurring phase and changing amplitude offer a more specific model to
test when growth and recurrence occur together.

## Addition as a concrete starting point

Why does the adder occupy such a central role in arithmetic hardware? Investigate
how its local combination of differences supports larger arithmetic procedures,
and how storing or propagating carries distributes their work across positions
and execution steps.

For single-bit inputs, the half adder produces

\[
s=a\mathbin{\mathrm{XOR}}b,\qquad c=a\mathbin{\mathrm{AND}}b,
\qquad a+b=s+2c.
\]

XOR retains an unpaired one at the current weight; AND identifies a coincident
pair, whose contribution belongs at the next weight. This is a precise entry
point for studying the relationship between local Boolean rules and arithmetic.
[MIT's computation structures material](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/pages/c8/c8s1/)
provides the digital-arithmetic context.

The discussion's temporal intuition is also a research question: can the gate
inputs be interpreted as records of earlier differences, with XOR and AND
expressing useful relationships between those records? XOR directly detects
unequal current bit values; AND directly detects two current ones. To give either
output a historical meaning, specify what the inputs record and which prior
events that encoding preserves. This keeps the proposed "different now / different
before" reading available for examination with explicit semantics.

Neither gate supplies past history unless its inputs encode that history. In
particular, a carry bit should not silently become a memory of everything that
produced it. For nonnegative integers, the simultaneous update

\[
(a,b)\longmapsto
\bigl(a\mathbin{\mathrm{XOR}}b,
      (a\mathbin{\mathrm{AND}}b)\ll1\bigr)
\]

preserves the sum and terminates with \(b=0\). Both outputs use the previous
inputs. The invariant is \(a+b\); preservation of the individual input identities
does not follow. Fixed-width machine implementations also require explicit
overflow semantics. These considerations make addition a tractable place to compare
exact state evolution with what a visualization chooses to show.

## Retained information and physical carriers

Preserving a sum is weaker than preserving its inputs. Recoverability depends on
the whole retained state: XOR alone merges different input pairs, while
`(x,y) → (x,x XOR y)` is reversible, with the same transformation recovering
the original pair. This gives a concrete way to study which transformations
reorganize differences and which discard them. Computation need not be logically
irreversible; see [Bennett's reversible computation](https://www.cs.princeton.edu/courses/archive/fall04/cos576/papers/bennett73.html).

Logical inputs and outputs name roles. A result can replace a register's previous
value; a third physical entity is not logically required. A truth table specifies
neither the carriers nor the timing, persistence, or consumption of signals.
Similarly, omitting a value from a view, logically discarding information, and
physically resetting a memory are different operations. Any claim about physical
propagation or energy cost needs an implementation model in addition to the
arithmetic rule.

## Multiplication: exchanging amount and repetition

Repeated addition gives the motivating state/algorithm example. Treat `3` as
the amount held for each addition and `4` as the repetition count:
`0 → 3 → 6 → 9 → 12`. Exchanging the roles gives
`0 → 4 → 8 → 12`. The common output is `12`; the histories and work differ.
The rectangle makes the preserved count visible, while the two traces show how
the same result can be organized differently between amount and repetition.

Both operands remain inputs to the complete procedure. Calling the repetition
count its "algorithmic" or "time" part identifies an operational role, not an
intrinsic property of that number. The research aim is to understand which such
exchanges preserve which outcomes. They do not hold for every operation:
`2^3` and `3^2` already differ. Multiplication's commutativity is a specific
symmetry whose relationship to more general state/process exchanges is open.

## Histories represented as configurations

Fourier analysis provides a precise example of reorganizing a history. A complete
discrete Fourier transform represents `N` samples by `N` complex coefficients;
the inverse reconstructs every sample in exact arithmetic. The coefficients'
amplitudes and phases together retain the history under a known synthesis rule.
For example, with the usual forward-transform sign convention,
`[1,0,0,0]` transforms to `[1,1,1,1]`, while `[0,1,0,0]` transforms to
`[1,-i,-1,i]`. Both spectra have unit magnitudes; phase preserves the pulse's
position. Discarding it loses that difference. See the
[DFT definition](https://numpy.org/doc/stable/reference/routines.fft.html#implementation-details).

Interpreting indices as time and frequency assumes equally spaced samples.
Extending a finite DFT representation periodically does not establish that the
observed process repeats. A full transform is not automatically compression, and
physical synthesis requires dynamics in addition to stored coefficients. This
is the useful bridge to the zeta question: a fixed rule acting on a configuration
of component values can recover a structured output. Identify what information
and computation moved when changing descriptions. Invertible representation,
literal commutativity, and physical interchange of space and time are distinct
claims to investigate.

Compact specifications raise a related question about availability. A finite
definition or algorithm for pi determines more digits than it explicitly stores;
computing a certified approximation makes selected consequences available to a
bounded observer. A finite prefix alone does not determine the continuation.
The [BBP algorithm](https://www.davidhbailey.com/dhbpapers/bbp-alg.pdf) can extract
hexadecimal or binary digits at selected positions without producing the entire
preceding string. This makes access method, computation, and retained storage
part of the inquiry. Required accuracy determines when an approximation suffices;
agreement on a value does not imply identical histories or costs.

## Multiplication, primes, and spectral reconstruction

A prime is an integer \(p>1\) outside the image of multiplication restricted to
natural-number factors \(a,b>1\). This gives a relational description of primes
without assuming that a particular bit pattern explains primality. Investigate
which representations make this exclusion clearer and which merely relocate the
work.

A longer-term direction compares a direct arithmetic route to

\[
\psi(x)=\sum_{p^k\leq x}\ln p
\]

with a spectral reconstruction using nontrivial zeta zeros
\(\rho=\beta+i\gamma\). Here \(x>1\), \(p\) ranges over primes, and \(k\) over
positive integers. The arithmetic route applies a primality procedure to natural
numbers, then accumulates the weighted prime powers. The spectral route supplies
zero data to a fixed reconstruction procedure. Their shared target is \(\psi\),
whose jumps encode primes and their powers. This makes the proposed comparison
between the organizations of state and algorithm concrete.

In the motivating analogy, the prime distribution takes the role of `12` in
the two multiplication histories. Natural-number inputs with a primality rule
provide one organization; zero data with harmonic synthesis provide another.
The conjectural direction is to explain how the same arithmetic information is
distributed between the supplied state and its interpreting process, and whether
a concrete correspondence captures the proposed exchange.

A conjugate pair contributes to the zero sum through

\[
H_\rho(x)=\frac{2x^\beta}{|\rho|}
\cos\bigl(\gamma\ln x-\arg\rho\bigr).
\]

This expression comes from pairing \(x^\rho/\rho\) with its conjugate. The zero
sum is subtracted in the usual explicit formula; the harmonics alone are not
\(\psi\). Baseline and correction terms, summation conventions, and the treatment
of jumps matter. At a prime-power discontinuity, the conventional explicit
formula reconstructs the midpoint of the left and right limits. See the
[DLMF prime-number formulas](https://dlmf.nist.gov/25.16) and
[zeta definitions](https://dlmf.nist.gov/25.2).

In the logarithmic coordinate \(u=\ln x\), the phase rotates with frequency
\(\gamma\) while the amplitude scales as \(e^{\beta u}\). This motivates a Fourier
analogy, with attention to the amplitude and convergence differences. Complete
zero data with the required normalizations and limiting procedures must be
distinguished from finite, approximate lists of zeros. The latter require an
error budget for truncation, numerical accuracy, and sampling.

## Questions and standards of evidence

Can a useful correspondence exchange what is treated as state with what is
treated as algorithm? This remains a conjectural direction. The arithmetic and
spectral routes currently present fixed procedures acting on varying state;
their comparison does not prove an exchange, an equivalence of implementations,
or commutativity. Identify the domains, maps, and invariants needed to make each
proposed relation testable.

Likewise, characterize admissible spectra rather than assuming arbitrary waves
produce primes. Distinguish an exact arithmetic identity, a numerical
approximation, an empirical regularity, and a proof. Every useful visualization
should be tied to truthful computation and make its retained and omitted
differences inspectable.

The separate prototypes `binary_visualizer`, `universe_simulator`, and
`riemann_zeta` provide prior explorations of bit traces, neighboring Boolean
cellular automata, and prime-counting harmonics, respectively. They are sources
of questions and examples, not established answers or an instruction to import
their implementations. Mathrix begins by clarifying the research and the
evidence needed to pursue it.

Their investigations already establish useful constraints for implementation.
`binary_visualizer` separates arithmetic values, intermediate traces, and playback;
its multiplication trace was found to start from the wrong accumulator, and its
exponentiation could report a correct final value despite incorrect intermediate
frames. `universe_simulator` supplies neighborhood rules, boundaries, and update
time explicitly; these are assumptions of that model. A local propagation bound
requires both bounded rule reach and a timing rule. `riemann_zeta` explores
weighted prime powers and zero-based reconstruction, but its different scripts
need separate mathematical checks: a Dirichlet series or Euler product outside
its convergence domain is not an evaluation of the continued zeta function.
These are reasons to verify actual histories and formulas before reusing code.
