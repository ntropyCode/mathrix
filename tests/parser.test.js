import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExpression } from '../src/parser.js';

function shape(node) {
  if (node.type === 'number') return node.raw;
  if (node.type === 'unary') return [node.op, shape(node.arg)];
  if (node.type === 'call') return [node.name, ...node.args.map(shape)];
  return [node.op, shape(node.left), shape(node.right)];
}

test('precedence, left-associative basic arithmetic, and right-associative power', () => {
  assert.deepEqual(shape(parseExpression('1+2*3^4^5-6/7')), ['-', ['+', '1', ['*', '2', ['^', '3', ['^', '4', '5']]]], ['/', '6', '7']]);
  assert.deepEqual(shape(parseExpression('8/4*2-1+3')), ['+', ['-', ['*', ['/', '8', '4'], '2'], '1'], '3']);
  assert.deepEqual(shape(parseExpression('8-4-2')), ['-', ['-', '8', '4'], '2']);
});

test('unary signs have standard mathematical precedence around powers', () => {
  assert.deepEqual(shape(parseExpression('-2^2')), ['-', ['^', '2', '2']]);
  assert.deepEqual(shape(parseExpression('(-2)^2')), ['^', ['-', '2'], '2']);
  assert.deepEqual(shape(parseExpression('2^-3')), ['^', '2', ['-', '3']]);
  assert.deepEqual(shape(parseExpression('-2^-3^2')), ['-', ['^', '2', ['-', ['^', '3', '2']]]]);
  assert.deepEqual(shape(parseExpression('2*-+-3')), ['*', '2', ['-', ['+', ['-', '3']]]]);
});

test('unsigned decimal, explicit binary, and hex literals preserve their source', () => {
  for (const raw of ['10', '010', '0', '.5', '5.', '00.125', '0b101', '0B101', '0xAf', '0X0F']) {
    assert.deepEqual(parseExpression(raw), { type: 'number', raw, start: 0, end: raw.length });
  }
  assert.equal(parseExpression('9'.repeat(5_000)).raw.length, 5_000);
  assert.equal(parseExpression(`0b${'1'.repeat(16_384)}`).raw.length, 16_386);
});

test('every supported function has its declared arity and calls compose', () => {
  for (const name of ['add', 'sub', 'mul', 'mult', 'div', 'pow', 'exp']) {
    assert.deepEqual(shape(parseExpression(`${name}(1,2)`)), [name, '1', '2']);
    for (const args of ['', '1', '1,2,3']) assert.throws(() => parseExpression(`${name}(${args})`), /expects 2 arguments/);
  }
  assert.deepEqual(shape(parseExpression('log(8,2)+ln(1)+log(3)')), ['+', ['+', ['log', '8', '2'], ['ln', '1']], ['log', '3']]);
  assert.deepEqual(shape(parseExpression('add(1,mult(2,3^4))')), ['add', '1', ['mult', '2', ['^', '3', '4']]]);
  for (const source of ['log()', 'log(1,2,3)', 'ln()', 'ln(1,2)']) assert.throws(() => parseExpression(source), /expects/);
});

test('source spans are exclusive, preserve whitespace boundaries, and include grouping', () => {
  const source = '  -(2 + 3) * pow(4, 2)  ';
  const root = parseExpression(source);
  assert.deepEqual([root.start, root.end], [2, 22]);
  assert.equal(source.slice(root.left.start, root.left.end), '-(2 + 3)');
  assert.equal(source.slice(root.left.arg.start, root.left.arg.end), '(2 + 3)');
  assert.equal(source.slice(root.left.arg.left.start, root.left.arg.left.end), '2');
  assert.equal(source.slice(root.right.start, root.right.end), 'pow(4, 2)');
  assert.equal(source.slice(root.right.args[0].start, root.right.args[0].end), '4');
  assert.deepEqual(parseExpression('((1))'), { type: 'number', raw: '1', start: 0, end: 5 });
});

test('malformed expressions reject without executing source', () => {
  const invalid = ['', '  ', '1+', '*2', '1 2', '2(3)', '(1', '1)', '()', '1,,2', '2**3', '.', '1..2', '0b', '0b2', '0b102', '0x', '0xG', '0x1g', '1e3', 'ln(1,)', 'add(,2)', 'x', 'sin(1)', 'LOG(1)', 'constructor(1)', '1;globalThis.x=2', '(()=>1)()', 'globalThis.alert(1)', '1/*x*/+2', '1//2'];
  for (const source of invalid) {
    assert.throws(() => parseExpression(source), error => error instanceof SyntaxError && Number.isInteger(error.position) && /character \d+/.test(error.message), source);
  }
  assert.throws(() => parseExpression('1 + @'), error => error.position === 4 && /character 5/.test(error.message));
  assert.throws(() => parseExpression(null), TypeError);
});

test('domain decisions belong to arithmetic, not the parser', () => {
  for (const source of ['1/0', 'log(-1)', 'log(4,1)', '0^-1', '2^.5']) assert.doesNotThrow(() => parseExpression(source));
});

test('source length, recursion, node depth, and node count are bounded', () => {
  assert.throws(() => parseExpression('1'.repeat(65_537)), /exceeds 65536 characters/);
  for (const source of ['('.repeat(129) + '1' + ')'.repeat(129), '-'.repeat(129) + '1', '1^'.repeat(129) + '1', '1+'.repeat(129) + '1']) {
    assert.throws(() => parseExpression(source), error => error instanceof SyntaxError && /exceeds 128 levels/.test(error.message));
  }
  let balanced = '1';
  for (let level = 0; level < 12; level++) balanced = `(${balanced}+${balanced})`;
  assert.throws(() => parseExpression(balanced), /exceeds 4096 nodes/);
  assert.doesNotThrow(() => parseExpression('('.repeat(100) + '1' + ')'.repeat(100)));
  assert.throws(() => parseExpression('a'.repeat(50_000)), error => error.message.length < 100);
});
