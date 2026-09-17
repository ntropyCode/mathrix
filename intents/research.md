# Research intent

## Look beneath arithmetic

Mathrix explores mathematics one implementation level below familiar arithmetic.
Bits are a working basis for examining how calculations happen, without claiming
that bits are the ultimate constituents of mathematics or physical reality. The
aim is to make arithmetic visible as transformations of state: which information
is present, how operations move or combine it, and what an interface hides.

An arithmetic operation can resemble an opaque library: its result is useful
while its internal choices remain unexplored. Quake III's inverse square root
illustrates why representation matters. It uses the floating-point bit pattern to
construct an initial estimate, then refines that estimate with a Newton step.
The arithmetic interface alone does not reveal this route. The
[original implementation](https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/q_math.c)
is motivation to inspect representations and algorithms, not evidence that all
arithmetic has an analogous shortcut.

Keep three objects distinct: a number, its representation, and the process that
transforms representations. Equivalent numerical results can arise through
different state trajectories. A useful investigation exposes those differences
without mistaking a property of one encoding or algorithm for a property of the
number itself.

## State, observation, and identity

The working state of arithmetic includes more than the displayed result. Operand
registers, carry information, intermediate values, and control state can determine
what happens next. Exposing these dependencies should make it possible to ask
which apparent operations become simple transformations when their hidden state
is made explicit.

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
underlying distinctions, and which observation boundaries make those descriptions
appear different.

Observation introduces a separate ambiguity. The same local sequence can be
recorded by scanning different sites or by watching a single site change. A
record alone may not distinguish these mechanisms. Investigate what an observer
retains and what additional information would resolve that ambiguity. Such
examples do not, by themselves, derive physical space or time from observations.

## Translation, recurrence, and growth

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
overflow semantics. These distinctions make addition a tractable place to compare
exact state evolution with what a visualization chooses to show.

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
distinctions inspectable.

The separate prototypes `binary_visualizer`, `universe_simulator`, and
`riemann_zeta` provide prior explorations of bit traces, neighboring Boolean
cellular automata, and prime-counting harmonics, respectively. They are sources
of questions and examples, not established answers or an instruction to import
their implementations. Mathrix begins by clarifying the research and the
evidence needed to pursue it.
