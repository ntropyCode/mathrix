# Mathrix

Mathrix explores the bits and algorithms beneath arithmetic. Its aim is to
make the structure hidden by familiar operations inspectable, and use that
understanding to address difficult mathematical problems through new explanations,
algorithms, and mathematical arguments. The long-term research target is the
relationship between multiplication, primes, the Riemann zeta function, and its
harmonics.

The name combines mathematics with *The Matrix*: Neo sees a world, but
understanding it requires seeing the code beneath its appearance. That is
the project's motivation for looking below an abstraction. Bits are the
chosen working level, without a claim that they are the ultimate atoms of
mathematics or reality.

Start with the [research intent](intents/research.md) for the motivation,
mathematical starting points, open hypotheses, and standards of evidence.
[CONTEXT.md](CONTEXT.md) is the repository's semantic interface;
[AGENTS.md](AGENTS.md) defines how agents work within the intent.

[Thought notes](thoughts/README.md) preserve exploratory arguments, examples,
and unresolved questions separately from research intent.

## Current scope

The browser application executes arithmetic formulas and displays their working
registers as a growing, wrapped bit field. It carries forward the visual language
of `binary_visualizer`, with corrected arithmetic traces, multiple registers,
incremental execution, and a viewport that supports pan and zoom. The earlier
projects remain independent; the app has no package dependencies.

## Run

With Node.js 22 or newer:

```sh
npm start
```

Open [Mathrix](http://127.0.0.1:5173). Set `PORT` to change the local port.
Run the syntax and behavior checks with `npm run check`.

Enter a formula, select **Run**, and use **Play**, individual steps, or **Finish**.
The timeline inspects the retained history. Drag the field to pan; use the zoom
buttons or scroll within the field to zoom. The executing subexpression is
highlighted above it. Register values are also available as text below the field.

## Arithmetic and limits

- `+`, `-`, `*`, `/`, parentheses, decimal fractions, explicit `0b` binary and
  `0x` hexadecimal literals. Plain `10` means decimal ten.
- `^`, `pow(base, exponent)`, and `exp(base, exponent)` use integer exponents,
  including negative exponents. This evaluator defines `0^0` as `1`.
- `log(x)` and `ln(x)` mean natural logarithm; `log(x, base)` selects a base.
  Inputs must be positive; the base must be positive and unequal to one.
- Integer and rational arithmetic is exact. Logarithms use range reduction and
  the [logarithm series](https://dlmf.nist.gov/4.6.E4), evaluated with fixed-point
  working bits and rounded to the selected 16–48 fractional output bits.
  Approximation provenance propagates through subsequent operations. Precision
  is a numerical setting, not a certified error bound.

Registers use signed magnitude with an explicit sign; fractions retain numerator
and denominator. Carry/borrow and nested control registers remain inspectable.
Division frames show quotient and remainder, which reconstruct the exact rational
result. Rational reduction and representation changes are explicitly labeled;
their Euclidean normalization is not expanded into bit steps.

Computation runs in a worker and yields steps on demand. The most recent 512
states are retained; **Restart** regenerates the beginning. The current app limits
registers to 16,384 bits and runs to 200,000 states, reporting a clear error on
either limit. Canvas allocation depends on the viewport, and only visible cells
are drawn. These are practical limits, not claims of arbitrary computational
capacity. The Riemann zeta evaluator is not implemented yet.

The working conventions are adapted from
[kernel](https://github.com/ntropyCode/kernel). They keep intent, changes, and
verification local without prescribing an application framework or research
outcome.
