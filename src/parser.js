const MAX_SOURCE_LENGTH = 65_536;
const MAX_NODES = 4_096;
const MAX_DEPTH = 128;
const FUNCTIONS = new Map([
  ['add', [2]], ['sub', [2]], ['mul', [2]], ['mult', [2]],
  ['div', [2]], ['pow', [2]], ['exp', [2]], ['log', [1, 2]], ['ln', [1]],
]);

export function parseExpression(source) {
  if (typeof source !== 'string') throw new TypeError('Expression must be a string.');

  function fail(message, position) {
    const error = new SyntaxError(`${message} at character ${position + 1}.`);
    error.position = position;
    throw error;
  }

  if (source.length > MAX_SOURCE_LENGTH) {
    fail(`Expression exceeds ${MAX_SOURCE_LENGTH} characters`, MAX_SOURCE_LENGTH);
  }

  let cursor = 0;
  let nodeCount = 0;
  let recursionDepth = 0;
  const depths = new WeakMap();
  const numberPattern = /(?:0[bB][01]+|0[xX][\da-fA-F]+|\d+(?:\.\d*)?|\.\d+)/y;
  const namePattern = /[A-Za-z_][A-Za-z_\d]*/y;

  function nextToken() {
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
    const start = cursor;
    if (cursor === source.length) return { type: 'end', start, end: start };
    numberPattern.lastIndex = cursor;
    const number = numberPattern.exec(source);
    if (number) {
      cursor = numberPattern.lastIndex;
      return { type: 'number', raw: number[0], start, end: cursor };
    }
    namePattern.lastIndex = cursor;
    const name = namePattern.exec(source);
    if (name) {
      cursor = namePattern.lastIndex;
      return { type: 'name', name: name[0], start, end: cursor };
    }
    const symbol = source[cursor++];
    if ('+-*/^(),'.includes(symbol)) return { type: symbol, start, end: cursor };
    fail(`Unexpected character ${JSON.stringify(symbol)}`, start);
  }

  let token = nextToken();
  function consume(type) {
    if (token.type !== type) fail(`Expected '${type}'`, token.start);
    const consumed = token;
    token = nextToken();
    return consumed;
  }

  function node(value, children = []) {
    const depth = 1 + Math.max(0, ...children.map(child => depths.get(child)));
    if (depth > MAX_DEPTH) fail(`Expression exceeds ${MAX_DEPTH} levels`, value.start);
    if (++nodeCount > MAX_NODES) fail(`Expression exceeds ${MAX_NODES} nodes`, value.start);
    depths.set(value, depth);
    return value;
  }

  function primary() {
    if (token.type === 'number') {
      const number = consume('number');
      return node(number);
    }
    if (token.type === '(') {
      const start = consume('(').start;
      const inner = expression();
      const end = consume(')').end;
      inner.start = start;
      inner.end = end;
      return inner;
    }
    if (token.type === 'name') {
      const identifier = consume('name');
      const arities = FUNCTIONS.get(identifier.name);
      if (!arities) fail(`Unknown function '${identifier.name.slice(0, 32)}'`, identifier.start);
      consume('(');
      const args = [];
      if (token.type !== ')') {
        args.push(expression());
        while (token.type === ',') {
          consume(',');
          if (args.length >= Math.max(...arities)) {
            fail(`Function '${identifier.name}' expects ${arities.join(' or ')} arguments`, identifier.start);
          }
          args.push(expression());
        }
      }
      const end = consume(')').end;
      if (!arities.includes(args.length)) {
        fail(`Function '${identifier.name}' expects ${arities.join(' or ')} arguments`, identifier.start);
      }
      return node({ type: 'call', name: identifier.name, args, start: identifier.start, end }, args);
    }
    fail('Expected a number, function, or parenthesized expression', token.start);
  }

  function power() {
    const left = primary();
    if (token.type !== '^') return left;
    consume('^');
    const right = unary();
    return node({ type: 'binary', op: '^', left, right, start: left.start, end: right.end }, [left, right]);
  }

  function unary() {
    if (++recursionDepth > MAX_DEPTH) fail(`Expression exceeds ${MAX_DEPTH} levels`, token.start);
    let result;
    if (token.type === '+' || token.type === '-') {
      const operator = consume(token.type);
      const arg = unary();
      result = node({ type: 'unary', op: operator.type, arg, start: operator.start, end: arg.end }, [arg]);
    } else {
      result = power();
    }
    recursionDepth--;
    return result;
  }

  function binary(operand, operators) {
    let left = operand();
    while (operators.includes(token.type)) {
      const op = consume(token.type).type;
      const right = operand();
      left = node({ type: 'binary', op, left, right, start: left.start, end: right.end }, [left, right]);
    }
    return left;
  }

  function product() {
    return binary(unary, ['*', '/']);
  }

  function expression() {
    return binary(product, ['+', '-']);
  }

  const result = expression();
  if (token.type !== 'end') fail('Expected an arithmetic operator or end of expression', token.start);
  return result;
}
