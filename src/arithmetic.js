import { parseExpression } from './parser.js';

const absolute = value => value < 0n ? -value : value;
const bitLength = value => absolute(value).toString(2).length;
const register = (id, label, value, role = 'state', extra = {}) => ({ id, label, value, role, ...extra });

export function* createComputation(source, options = {}) {
  const precisionBits = options.precisionBits ?? 24;
  const maxBits = options.maxBits ?? 16384;
  const maxSteps = options.maxSteps ?? 200000;
  for (const [name, value, low, high] of [['precisionBits', precisionBits, 8, 128], ['maxBits', maxBits, 64, 65536], ['maxSteps', maxSteps, 1, 2000000]]) {
    if (!Number.isInteger(value) || value < low || value > high) throw new Error(`${name} must be an integer from ${low} to ${high}.`);
  }
  let index = 0;
  const ast = parseExpression(source);
  const ancestors = [];

  function* retain(scope, registers, computation) {
    const prefix = `${scope}-${ancestors.length}`;
    ancestors.push(registers.map(item => ({ ...item, id: `${prefix}-${item.id}` })));
    try { return yield* computation; }
    finally { ancestors.pop(); }
  }

  function checkSize(...values) {
    if (values.some(value => bitLength(value) > maxBits)) throw new Error(`Computation exceeds the ${maxBits}-bit register limit. Reduce the operands or exponent.`);
  }

  function frame(node, operation, title, detail, registers, approximate = false) {
    if (index >= maxSteps) throw new Error(`Computation reached the ${maxSteps.toLocaleString('en-US')}-step limit. Use a smaller expression or lower precision.`);
    const visibleRegisters = [...registers, ...ancestors.flat()];
    checkSize(...visibleRegisters.map(item => item.value));
    return { index: index++, operation, title, detail, sourceRange: [node.start, node.end], registers: visibleRegisters, approximate };
  }

  function* addMagnitude(a, b, node, approximate, title = 'Addition') {
    let sum = a;
    let carry = b;
    yield frame(node, 'add', title, 'XOR gives the sum without carries; overlapping ones carry one position left.', [register('sum', 'Sum', sum), register('carry', 'Carry', carry, 'carry')], approximate);
    while (carry !== 0n) {
      const nextCarry = (sum & carry) << 1n;
      sum ^= carry;
      carry = nextCarry;
      yield frame(node, 'add', title, 'Sum and carry were computed from the same previous state. Their total stays constant.', [register('sum', 'Sum', sum), register('carry', 'Carry', carry, 'carry')], approximate);
    }
    return sum;
  }

  function* subtractMagnitude(a, b, node, approximate) {
    let difference = a;
    let borrow = b;
    yield frame(node, 'sub', 'Subtraction', 'Subtract the smaller magnitude from the larger. Borrow requests move left.', [register('difference', 'Difference', difference), register('borrow', 'Borrow', borrow, 'carry')], approximate);
    while (borrow !== 0n) {
      const nextBorrow = (~difference & borrow) << 1n;
      difference ^= borrow;
      borrow = nextBorrow;
      yield frame(node, 'sub', 'Subtraction', 'XOR flips the requested bits; missing ones request a borrow from the next position.', [register('difference', 'Difference', difference), register('borrow', 'Borrow', borrow, 'carry')], approximate);
    }
    return difference;
  }

  function* addInteger(a, b, node, approximate) {
    const aa = absolute(a), bb = absolute(b);
    const sameSign = (a < 0n) === (b < 0n);
    const negative = sameSign ? a < 0n : (aa >= bb ? a : b) < 0n;
    const computation = sameSign ? addMagnitude(aa, bb, node, approximate) : subtractMagnitude(aa >= bb ? aa : bb, aa >= bb ? bb : aa, node, approximate);
    const magnitude = a < 0n || b < 0n
      ? yield* retain('signed', [register('left', 'Signed left operand', a, 'input'), register('right', 'Signed right operand', b, 'input'), register('sign', 'Selected result sign', negative ? -1n : 1n, 'control')], computation)
      : yield* computation;
    return yield* applySign(magnitude, negative, node, approximate);
  }

  function* applySign(magnitude, negative, node, approximate) {
    const value = negative ? -magnitude : magnitude;
    if (negative && magnitude) yield frame(node, 'representation', 'Apply result sign', 'The magnitude algorithm has finished. Apply the selected negative sign using signed-magnitude representation.', [register('result', 'Signed result', value), register('magnitude', 'Computed magnitude', magnitude, 'input'), register('sign', 'Selected result sign', -1n, 'control')], approximate);
    return value;
  }

  function* multiplyInteger(a, b, node, approximate) {
    let shifted = absolute(a), remaining = absolute(b), accumulator = 0n;
    const negative = (a < 0n) !== (b < 0n);
    checkSize(a, b);
    if (a && b && bitLength(a) + bitLength(b) - 1 > maxBits) throw new Error(`Product exceeds the ${maxBits}-bit register limit.`);
    while (true) {
      const multiplierRegisters = [register('accumulator', 'Accumulator', accumulator), register('shifted', 'Shifted multiplicand', shifted, 'input'), register('remaining', 'Remaining multiplier', remaining, 'control', { activeBit: 0 }), ...(negative ? [register('sign', 'Selected result sign', -1n, 'control')] : [])];
      yield frame(node, 'mult', 'Multiplication', `Multiply magnitudes from a zero accumulator. Each set multiplier bit selects a shifted contribution.${negative ? ' Opposite operand signs make the final value negative.' : ''}`, multiplierRegisters, approximate);
      if (remaining === 0n) break;
      if (remaining & 1n) accumulator = yield* retain('mult', multiplierRegisters, addMagnitude(accumulator, shifted, node, approximate, 'Multiplication / partial addition'));
      remaining >>= 1n;
      if (remaining) shifted <<= 1n;
    }
    return yield* applySign(accumulator, negative, node, approximate);
  }

  function* divideMagnitude(dividend, divisor, node, approximate) {
    if (divisor === 0n) throw new Error('Division by zero is undefined.');
    let quotient = 0n, remainder = 0n;
    const width = bitLength(dividend);
    yield frame(node, 'div', 'Binary long division', 'Read dividend bits from left to right, retaining a quotient and remainder.', [register('dividend', 'Dividend', dividend, 'input'), register('divisor', 'Divisor', divisor, 'input'), register('quotient', 'Quotient', quotient), register('remainder', 'Remainder', remainder)], approximate);
    for (let position = width - 1; position >= 0; position--) {
      remainder = (remainder << 1n) | ((dividend >> BigInt(position)) & 1n);
      quotient <<= 1n;
      const selected = remainder >= divisor;
      if (selected) { remainder -= divisor; quotient |= 1n; }
      yield frame(node, 'div', 'Binary long division', selected ? 'Bring down one bit; subtract the divisor and append quotient bit 1.' : 'Bring down one bit; keep the remainder and append quotient bit 0.', [register('dividend', 'Dividend', dividend, 'input', { activeBit: position, consumedBits: width - position, consumedFrom: 'msb' }), register('divisor', 'Divisor', divisor, 'input'), register('quotient', 'Quotient', quotient), register('remainder', 'Remainder', remainder)], approximate);
    }
    return { quotient, remainder };
  }

  function* normalize(numerator, denominator, node, approximate = false) {
    if (denominator === 0n) throw new Error('Division by zero is undefined.');
    const signChanged = denominator < 0n;
    if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
    checkSize(numerator, denominator);
    let a = absolute(numerator), b = denominator;
    while (b) { const remainder = a % b; a = b; b = remainder; }
    numerator /= a;
    denominator /= a;
    if (a !== 1n || signChanged) yield frame(node, 'normalize', 'Normalize rational value', 'Reduce numerator and denominator by their greatest common divisor and place the sign in the numerator. This is a representation step, not an expanded bit algorithm.', [register('numerator', 'Numerator', numerator), register('denominator', 'Denominator', denominator), register('gcd', 'Common divisor', a, 'control')], approximate);
    return { numerator, denominator, approximate };
  }

  function* combine(op, left, right, node) {
    const approximate = left.approximate || right.approximate;
    let numerator, denominator;
    if (op === '+' || op === '-') {
      const a = right.denominator === 1n ? left.numerator : yield* multiplyInteger(left.numerator, right.denominator, node, approximate);
      const b = left.denominator === 1n ? right.numerator : yield* multiplyInteger(right.numerator, left.denominator, node, approximate);
      numerator = yield* addInteger(a, op === '-' ? -b : b, node, approximate);
      denominator = left.denominator === 1n ? right.denominator : right.denominator === 1n ? left.denominator : yield* multiplyInteger(left.denominator, right.denominator, node, approximate);
    } else if (op === '*') {
      numerator = yield* multiplyInteger(left.numerator, right.numerator, node, approximate);
      denominator = left.denominator === 1n ? right.denominator : right.denominator === 1n ? left.denominator : yield* multiplyInteger(left.denominator, right.denominator, node, approximate);
    } else if (op === '/') {
      if (!right.numerator) throw new Error('Division by zero is undefined.');
      numerator = right.denominator === 1n ? left.numerator : yield* multiplyInteger(left.numerator, right.denominator, node, approximate);
      denominator = left.denominator === 1n ? right.numerator : yield* multiplyInteger(left.denominator, right.numerator, node, approximate);
      const negative = (numerator < 0n) !== (denominator < 0n);
      denominator = absolute(denominator);
      const { quotient, remainder } = yield* divideMagnitude(absolute(numerator), denominator, node, approximate);
      numerator = quotient * denominator + remainder;
      if (negative) numerator = -numerator;
      yield frame(node, 'representation', 'Division / exact rational reconstruction', 'Convert the computed quotient and remainder into an exact rational: numerator = sign × (quotient × divisor + remainder). This representation conversion is not expanded into bit steps.', [register('quotient', 'Computed quotient', quotient, 'input'), register('remainder', 'Computed remainder', remainder, 'input'), register('divisor', 'Divisor', denominator, 'input'), register('numerator', 'Reconstructed numerator', numerator)], approximate);
    } else if (op === '^') {
      if (right.denominator !== 1n || right.approximate) throw new Error('Exponentiation requires an exact integer exponent. Use a decimal or rational base with an integer exponent.');
      if (left.numerator === 0n && right.numerator < 0n) throw new Error('Zero cannot be raised to a negative exponent.');
      let exponent = absolute(right.numerator);
      let base = left;
      let result = { numerator: 1n, denominator: 1n, approximate };
      const powerRegisters = () => [register('numerator', 'Power accumulator numerator', result.numerator), ...(result.denominator === 1n ? [] : [register('denominator', 'Power accumulator denominator', result.denominator)]), register('base-numerator', 'Power base numerator', base.numerator, 'input'), ...(base.denominator === 1n ? [] : [register('base-denominator', 'Power base denominator', base.denominator, 'input')]), register('exponent', 'Remaining exponent', exponent, 'control', { activeBit: 0 })];
      while (exponent) {
        yield frame(node, 'exp', 'Exponentiation by squaring', 'A set exponent bit multiplies the accumulator; square the base for the next bit.', powerRegisters(), approximate);
        if (exponent & 1n) result = yield* retain('exp', powerRegisters(), combine('*', result, base, node));
        exponent >>= 1n;
        if (exponent) base = yield* retain('exp', powerRegisters(), combine('*', base, base, node));
      }
      return yield* normalize(right.numerator < 0n ? result.denominator : result.numerator, right.numerator < 0n ? result.numerator : result.denominator, node, approximate);
    } else throw new Error(`Unsupported arithmetic operation: ${op}`);
    return yield* normalize(numerator, denominator, node, approximate);
  }

  function* fixedMultiply(a, b, bits, node) {
    const product = yield* multiplyInteger(a, b, node, true);
    const value = product >> BigInt(bits);
    yield frame(node, 'log', 'Logarithm / fixed-point rounding', `Discard ${bits} fractional product bits to restore the working scale.`, [register('product', 'Full product', product, 'input', { fractionalBits: bits * 2 }), register('fixed', 'Fixed-point value', value, 'state', { fractionalBits: bits })], true);
    return value;
  }

  function* atanhLog(numerator, denominator, bits, node) {
    const difference = yield* addInteger(numerator, -denominator, node, true);
    const total = yield* addInteger(numerator, denominator, node, true);
    const { quotient: z } = yield* divideMagnitude(difference << BigInt(bits), total, node, true);
    const square = yield* fixedMultiply(z, z, bits, node);
    let power = z, sum = 0n, odd = 1n;
    while (power) {
      const { quotient: term } = yield* divideMagnitude(power, odd, node, true);
      if (!term) break;
      sum = yield* addMagnitude(sum, term, node, true, 'Logarithm / series accumulation');
      yield frame(node, 'log', 'Logarithm / atanh series', 'ln(m) = 2(z + z³/3 + z⁵/5 + …), where z = (m−1)/(m+1). Stop when the next term rounds to zero.', [register('z', 'z', z, 'input', { fractionalBits: bits }), register('power', 'Odd power of z', power, 'state', { fractionalBits: bits }), register('term', 'Series term', term, 'state', { fractionalBits: bits }), register('sum', 'Half-log sum', sum, 'state', { fractionalBits: bits }), register('odd', 'Odd denominator', odd, 'control')], true);
      power = yield* fixedMultiply(power, square, bits, node);
      odd += 2n;
    }
    return sum << 1n;
  }

  function* naturalLog(value, bits, node) {
    let numerator = value.numerator, denominator = value.denominator;
    if (numerator <= 0n) throw new Error('Real logarithms require a positive input.');
    let exponent = bitLength(numerator) - bitLength(denominator);
    if (exponent >= 0) denominator <<= BigInt(exponent);
    else numerator <<= BigInt(-exponent);
    if (numerator < denominator) { numerator <<= 1n; exponent--; }
    yield frame(node, 'log', 'Logarithm / range reduction', 'Write x = m × 2^k with 1 ≤ m < 2; then ln(x) = ln(m) + k ln(2).', [register('numerator', 'Reduced numerator', numerator, 'input'), register('denominator', 'Reduced denominator', denominator, 'input'), register('exponent', 'Binary exponent k', BigInt(exponent), 'control')], true);
    const reduced = yield* atanhLog(numerator, denominator, bits, node);
    if (!exponent) return reduced;
    const logTwo = yield* atanhLog(2n, 1n, bits, node);
    const scaled = yield* multiplyInteger(BigInt(exponent), logTwo, node, true);
    return yield* addInteger(reduced, scaled, node, true);
  }

  function* logarithm(value, base, node) {
    if (value.numerator <= 0n || (base && base.numerator <= 0n)) throw new Error('Real logarithms require a positive input and positive base.');
    if (base && base.numerator === base.denominator) throw new Error('A logarithm base cannot equal one.');
    const sensitivity = base ? Math.max(0, bitLength(base.denominator) - bitLength(absolute(base.numerator - base.denominator))) : 0;
    const bits = precisionBits + 32 + 2 * sensitivity;
    if (bits * 2 + 4 > maxBits) throw new Error('Logarithm needs more working bits at this precision or with a base this close to one. Increase the bit limit or choose a different base.');
    let answer = yield* naturalLog(value, bits, node);
    if (base) {
      const divisor = yield* naturalLog(base, bits, node);
      if (!divisor) throw new Error('Logarithm base is too close to one for the working precision.');
      const { quotient } = yield* divideMagnitude(absolute(answer) << BigInt(bits), absolute(divisor), node, true);
      answer = (answer < 0n) !== (divisor < 0n) ? -quotient : quotient;
    }
    const discarded = BigInt(bits - precisionBits);
    const magnitude = (absolute(answer) + (1n << (discarded - 1n))) >> discarded;
    answer = answer < 0n ? -magnitude : magnitude;
    yield frame(node, 'log', 'Logarithm / output precision', `Round to ${precisionBits} fractional bits after ${bits}-bit fixed-point work. Approximate result; this is not a certified error bound.`, [register('result', 'Approximate logarithm', answer, 'state', { fractionalBits: precisionBits })], true);
    return yield* normalize(answer, 1n << BigInt(precisionBits), node, true);
  }

  function* evaluate(node) {
    if (node.type === 'number') {
      const raw = node.raw;
      let numerator, denominator = 1n;
      if (raw.includes('.')) {
        const [whole, fraction = ''] = raw.split('.');
        if (fraction.length * 3.322 > maxBits + 4) throw new Error(`Decimal exceeds the ${maxBits}-bit register limit.`);
        numerator = BigInt((whole || '0') + fraction);
        denominator = 10n ** BigInt(fraction.length);
      } else numerator = BigInt(raw);
      return yield* normalize(numerator, denominator, node);
    }
    if (node.type === 'unary') {
      const value = yield* evaluate(node.arg);
      return yield* normalize(node.op === '-' ? -value.numerator : value.numerator, value.denominator, node, value.approximate);
    }
    if (node.type === 'binary') return yield* combine(node.op, yield* evaluate(node.left), yield* evaluate(node.right), node);
    if (node.type === 'call') {
      const aliases = { add: '+', sub: '-', mul: '*', mult: '*', div: '/', pow: '^', exp: '^' };
      if (node.name === 'ln' || node.name === 'log') {
        if (node.args.length < 1 || node.args.length > (node.name === 'ln' ? 1 : 2)) throw new Error(`${node.name} expects ${node.name === 'ln' ? 'one argument' : 'one argument, or an input and base'}.`);
        const value = yield* evaluate(node.args[0]);
        const base = node.args.length === 2 ? yield* evaluate(node.args[1]) : null;
        return yield* logarithm(value, base, node);
      }
      if (!aliases[node.name]) throw new Error(`Unknown function: ${node.name}`);
      if (node.args.length !== 2) throw new Error(`${node.name} expects two arguments.`);
      return yield* combine(aliases[node.name], yield* evaluate(node.args[0]), yield* evaluate(node.args[1]), node);
    }
    throw new Error('Unsupported expression node.');
  }

  const value = yield* evaluate(ast);
  const rationalText = value.denominator === 1n ? String(value.numerator) : `${value.numerator}/${value.denominator}`;
  const exactText = `${value.approximate ? '≈ ' : ''}${rationalText}`;
  let text = exactText;
  if (value.approximate) {
    const whole = absolute(value.numerator) / value.denominator;
    const digits = Math.ceil(precisionBits * Math.LOG10E * Math.LN2) + 2;
    const fraction = ((absolute(value.numerator) % value.denominator) * 10n ** BigInt(digits) / value.denominator).toString().padStart(digits, '0').replace(/0+$/, '');
    text = `≈ ${value.numerator < 0n ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
    if (value.numerator && !whole && !fraction) text = exactText;
  }
  yield frame(ast, 'result', 'Result', value.approximate ? 'Result includes a fixed-point logarithm approximation.' : 'Exact rational result from the traced arithmetic.', [register('numerator', value.denominator === 1n ? 'Result' : 'Numerator', value.numerator), ...(value.denominator === 1n ? [] : [register('denominator', 'Denominator', value.denominator)])], value.approximate);
  return { value, text, exactText, precisionBits };
}
