import test from 'node:test';
import assert from 'node:assert/strict';
import { TraceBuffer, takeFrames } from '../src/session.js';

test('retained trace stays bounded and indexes survive eviction', () => {
  const buffer = new TraceBuffer(8);
  for (let i = 0; i < 100; i++) buffer.append([{ index: i, registers: [{ value: BigInt(i) }] }]);
  assert.equal(buffer.frames.length, 8);
  assert.equal(buffer.firstIndex, 92);
  assert.equal(buffer.lastIndex, 99);
  assert.equal(buffer.get(91), null);
  assert.equal(buffer.get(99).registers[0].value, 99n);
  assert.throws(() => buffer.append([{ index: 102 }]), /consecutive/);
});

test('requests advance only the requested number of frames and preserve generator return', () => {
  let generated = 0;
  function* source() {
    for (let i = 0; i < 10000; i++) { generated++; yield { index: i }; }
    return { value: 42n };
  }
  const iterator = source();
  assert.equal(takeFrames(iterator, 2).frames.length, 2);
  assert.equal(generated, 2);
  assert.equal(takeFrames(iterator, 9998).done, false);
  assert.deepEqual(takeFrames(iterator, 2), { frames: [], done: true, result: { value: 42n } });
});
