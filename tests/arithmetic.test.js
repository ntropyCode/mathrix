import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputation } from '../src/arithmetic.js';

function compute(source, options, inspect) {
  const iterator = createComputation(source, options);
  let step;
  let count = 0;
  do {
    step = iterator.next();
    if (!step.done) {
      assert.equal(step.value.index, count++);
      for (const register of step.value.registers) assert.equal(typeof register.value, 'bigint');
      inspect?.(step.value);
    }
  } while (!step.done);
  return step.value;
}

function equalValue(source, numerator, denominator = 1n) {
  const result = compute(source).value;
  assert.equal(result.numerator, numerator, source);
  assert.equal(result.denominator, denominator, source);
  assert.equal(result.approximate, false, source);
}

test('exact signed rational arithmetic and composed formulas', () => {
  for (const [source, numerator, denominator] of [
    ['3*4', 12n], ['0*912', 0n], ['31+1', 32n], ['5-9', -4n],
    ['-3*-4', 12n], ['-3*4', -12n], ['7/2', 7n, 2n], ['7/-2', -7n, 2n],
    ['-7/-2', 7n, 2n], ['0/7', 0n], ['1/3+1/6', 1n, 2n],
    ['1/3-1/2', -1n, 6n], ['(2/3)*(9/4)', 3n, 2n], ['(2/3)/(4/9)', 3n, 2n],
    ['0.125+0.25', 3n, 8n], ['.5*1.5', 3n, 4n], ['(3+5)*7', 56n],
    ['2^10', 1024n], ['2^-3', 1n, 8n], ['(-2)^-3', -1n, 8n],
    ['(2/3)^-2', 9n, 4n], ['0^0', 1n], ['5^0', 1n], ['0^4', 0n],
    ['pow(2,3)+exp(3,2)', 17n], ['div(mult(add(2,3),4),sub(9,5))', 5n],
    ['0b101+0xF', 20n],
  ]) equalValue(source, numerator, denominator);
});

test('small integer arithmetic exhaustively agrees with independent integer oracle', () => {
  for (let a = -16n; a <= 16n; a++) {
    for (let b = -16n; b <= 16n; b++) {
      equalValue(`(${a})+(${b})`, a + b);
      equalValue(`(${a})-(${b})`, a - b);
      equalValue(`(${a})*(${b})`, a * b);
      if (b) {
        const result = compute(`(${a})/(${b})`).value;
        assert.equal(result.numerator * b, a * result.denominator);
        assert.ok(result.denominator > 0n);
      }
    }
  }
});

test('carry and borrow transitions preserve their arithmetic invariants', () => {
  for (const source of ['255+1', '128-1', '1-128', '37*23', '-32+1', '(17/3)+(19/7)']) {
    let previous = null;
    compute(source, {}, frame => {
      const values = Object.fromEntries(frame.registers.map(item => [item.id, item.value]));
      if (previous?.operation === frame.operation && previous.title === frame.title && ['add', 'sub'].includes(frame.operation)) {
        const old = previous.values;
        if (frame.operation === 'add') {
          assert.equal(values.sum, old.sum ^ old.carry);
          assert.equal(values.carry, (old.sum & old.carry) << 1n);
          assert.equal(values.sum + values.carry, old.sum + old.carry);
        } else {
          assert.equal(values.difference, old.difference ^ old.borrow);
          assert.equal(values.borrow, (~old.difference & old.borrow) << 1n);
          assert.equal(values.difference - values.borrow, old.difference - old.borrow);
        }
      }
      previous = { operation: frame.operation, title: frame.title, values };
    });
  }
});

test('multiplication starts at zero and selects exactly the shifted contributions', () => {
  for (let a = 0n; a < 20n; a++) for (let b = 0n; b < 20n; b++) {
    let previous;
    compute(`${a}*${b}`, {}, frame => {
      if (frame.operation !== 'mult') return;
      const values = Object.fromEntries(frame.registers.map(item => [item.id, item.value]));
      if (!previous) assert.equal(values.accumulator, 0n);
      else {
        assert.equal(values.accumulator, previous.accumulator + ((previous.remaining & 1n) ? previous.shifted : 0n));
        assert.equal(values.remaining, previous.remaining >> 1n);
      }
      assert.equal(values.accumulator + values.shifted * values.remaining, a * b);
      previous = values;
    });
    assert.equal(previous.accumulator, a * b);
  }
});

test('division quotient decisions reconstruct each consumed prefix', () => {
  for (let a = 0n; a < 50n; a++) for (let b = 1n; b < 13n; b++) {
    let last;
    compute(`${a}/${b}`, {}, frame => {
      if (frame.operation !== 'div') return;
      const registers = Object.fromEntries(frame.registers.map(item => [item.id, item]));
      const consumed = registers.dividend.consumedBits ?? 0;
      const prefix = a >> BigInt(a.toString(2).length - consumed);
      const quotient = registers.quotient.value, remainder = registers.remainder.value;
      assert.equal(quotient * b + remainder, prefix);
      assert.ok(remainder >= 0n && remainder < b);
      last = { quotient, remainder };
    });
    assert.equal(last.quotient, a / b);
    assert.equal(last.remainder, a % b);
  }
});

test('exact division results are reconstructed from computed quotient and remainder', () => {
  for (const source of ['7/2', '7/-2', '-7/-2', '0/7', '(2/3)/(4/9)']) {
    let division;
    let reconstructed;
    const result = compute(source, {}, frame => {
      const values = Object.fromEntries(frame.registers.map(item => [item.id, item.value]));
      if (frame.operation === 'div') division = values;
      if (frame.title === 'Division / exact rational reconstruction') {
        assert.equal(values.quotient, division.quotient);
        assert.equal(values.remainder, division.remainder);
        assert.equal(values.divisor, division.divisor);
        const magnitude = values.numerator < 0n ? -values.numerator : values.numerator;
        assert.equal(magnitude, values.quotient * values.divisor + values.remainder);
        reconstructed = values;
      }
    });
    assert.ok(reconstructed);
    assert.equal(result.value.numerator * reconstructed.divisor, reconstructed.numerator * result.value.denominator);
  }
});

test('partial additions retain multiplication state and nested multiplication retains power state', () => {
  let nestedFrames = 0;
  compute('3^5', {}, frame => {
    assert.equal(new Set(frame.registers.map(item => item.id)).size, frame.registers.length);
    if (frame.operation === 'mult' || frame.operation === 'add') {
      assert.ok(frame.registers.some(item => /^exp-\d+-exponent$/.test(item.id) && item.value > 0n));
      assert.ok(frame.registers.some(item => /^exp-\d+-base-numerator$/.test(item.id)));
    }
    if (frame.title !== 'Multiplication / partial addition') return;
    nestedFrames++;
    const parent = Object.fromEntries(frame.registers.filter(item => /^mult-\d+-/.test(item.id)).map(item => [item.id.replace(/^mult-\d+-/, ''), item.value]));
    const current = Object.fromEntries(frame.registers.map(item => [item.id, item.value]));
    assert.ok(parent.remaining & 1n);
    assert.equal(current.sum + current.carry, parent.accumulator + parent.shifted);
  });
  assert.ok(nestedFrames > 0);
});

test('integer input and unchanged representations do not add normalization frames', () => {
  const frames = [];
  compute('3*4', {}, frame => frames.push(frame));
  assert.equal(frames[0].operation, 'mult');
  assert.equal(frames[0].registers.length, 3);
  assert.ok(!frames.some(frame => frame.operation === 'normalize'));
  assert.equal(frames.at(-1).registers.length, 1);
  const fractionFrames = [];
  compute('6/4', {}, frame => fractionFrames.push(frame));
  assert.ok(fractionFrames.some(frame => frame.operation === 'normalize'));
  assert.equal(fractionFrames.at(-1).registers.length, 2);
});

test('signed magnitude arithmetic retains sign selection and emits the sign application', () => {
  const frames = [];
  compute('-3+-4', {}, frame => frames.push(frame));
  for (const frame of frames.filter(item => item.operation === 'add')) {
    assert.equal(frame.registers.find(item => item.id === 'signed-0-left').value, -3n);
    assert.equal(frame.registers.find(item => item.id === 'signed-0-right').value, -4n);
    assert.equal(frame.registers.find(item => item.id === 'signed-0-sign').value, -1n);
    assert.equal(frame.registers[0].id, 'sum');
  }
  const application = frames.find(item => item.title === 'Apply result sign');
  assert.equal(application.registers.find(item => item.id === 'result').value, -7n);
  assert.equal(application.registers.find(item => item.id === 'magnitude').value, 7n);
  compute('-3*4', {}, frame => {
    if (frame.operation === 'mult') assert.equal(frame.registers.find(item => item.id === 'sign').value, -1n);
  });
});

test('consumption metadata follows the side bits are consumed from', () => {
  compute('11*13', {}, frame => {
    for (const item of frame.registers.filter(item => item.id.endsWith('remaining'))) assert.equal(item.consumedBits, undefined);
  });
  let decisions = 0;
  compute('43/7', {}, frame => {
    if (frame.operation !== 'div') return;
    const dividend = frame.registers.find(item => item.id === 'dividend');
    if (dividend.consumedBits) {
      decisions++;
      assert.equal(dividend.consumedFrom, 'msb');
      assert.equal(dividend.consumedBits, 6 - dividend.activeBit);
    }
  });
  assert.equal(decisions, 6);
});

test('fixed-point logarithms match bounded independent oracles at 24 and 48 bits', () => {
  for (const precisionBits of [24, 48]) {
    for (const [source, expected] of [
      ['log(8,2)', 3], ['ln(2)', Math.log(2)], ['log(1/2)', Math.log(0.5)],
      ['log(10)', Math.log(10)], ['log(0.5,0.25)', 0.5], ['log(1)', 0],
      ['log(3/2)', Math.log(1.5)], ['log(1.00000000001)', Math.log(1.00000000001)],
    ]) {
      let seriesFrames = 0;
      const result = compute(source, { precisionBits }, frame => {
        if (frame.title === 'Logarithm / atanh series') seriesFrames++;
      });
      const actual = Number(result.value.numerator) / Number(result.value.denominator);
      assert.ok(Math.abs(actual - expected) <= 2 ** -precisionBits, `${source} at ${precisionBits}: ${actual} versus ${expected}`);
      assert.ok(result.value.approximate);
      assert.match(result.text, /^≈ /);
      if (source !== 'log(1)' && !source.includes('1.00000000001')) assert.ok(seriesFrames > 0);
    }
  }
});

test('approximation provenance propagates and tiny nonzero values remain visible', () => {
  const result = compute('(log(2)+1)*2/3');
  assert.equal(result.value.approximate, true);
  assert.ok(Math.abs(Number(result.value.numerator) / Number(result.value.denominator) - ((Math.log(2) + 1) * 2 / 3)) < 2 ** -24);
  assert.notEqual(compute('log(1.00000000001)', { precisionBits: 48 }).text, '≈ 0');
  assert.notEqual(compute('log(2)/2^1000').text, '≈ 0');
});

test('domain and resource limits fail explicitly', () => {
  for (const [source, message] of [
    ['1/0', /zero/], ['0^-1', /negative exponent/], ['2^(1/2)', /integer exponent/],
    ['2^log(8,2)', /exact integer exponent/], ['log(0)', /positive/],
    ['log(-2)', /positive/], ['log(2,1)', /equal one/], ['log(2,-1)', /positive/],
  ]) assert.throws(() => compute(source), message);
  assert.throws(() => compute('31+1', { maxSteps: 3 }), /step limit/);
  assert.throws(() => compute('2^1000', { maxBits: 64 }), /bit register limit/);
  assert.throws(() => compute('1', { precisionBits: 1 }), /precisionBits/);
  assert.throws(() => compute('log(2)', { maxBits: 64 }), /working bits/);
});

test('large multiplication yields immediately without an expanded history or bit arrays', () => {
  const source = `0b${'1'.repeat(4097)}*0b${'1'.repeat(4097)}`;
  const iterator = createComputation(source);
  const frames = Array.from({ length: 8 }, () => iterator.next());
  assert.ok(frames.every(step => !step.done));
  assert.ok(frames.some(step => step.value.operation === 'mult'));
  assert.ok(frames.flatMap(step => step.value.registers).some(item => item.value.toString(2).length >= 4097));
  iterator.return();
});

test('frame spans identify the subexpression that actually executes', () => {
  const source = '(3+5)*7';
  const spans = [];
  compute(source, {}, frame => {
    assert.ok(frame.sourceRange[0] >= 0 && frame.sourceRange[1] <= source.length);
    if (frame.operation === 'add' || frame.operation === 'mult') spans.push([frame.operation, source.slice(...frame.sourceRange)]);
  });
  assert.ok(spans.some(([operation, text]) => operation === 'add' && text.includes('3+5')));
  assert.ok(spans.some(([operation, text]) => operation === 'mult' && text === source));
});
