import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { TraceBuffer } from '../src/session.js';

async function runtime(t) {
  const url = new URL('../src/worker.js', import.meta.url).href;
  const worker = new Worker(`
    const { parentPort } = require('node:worker_threads');
    globalThis.self = { postMessage: data => parentPort.postMessage(data) };
    import(${JSON.stringify(url)}).then(() => {
      parentPort.on('message', data => self.onmessage({ data }));
      parentPort.postMessage({ type: 'boot' });
    });
  `, { eval: true });
  t.after(() => worker.terminate());
  const queue = [];
  let waiting = null;
  worker.on('message', message => {
    if (waiting) { const resolve = waiting; waiting = null; resolve(message); }
    else queue.push(message);
  });
  const receive = () => queue.length ? Promise.resolve(queue.shift()) : new Promise(resolve => { waiting = resolve; });
  assert.equal((await receive()).type, 'boot');
  return { worker, receive, send: async message => { worker.postMessage(message); return receive(); } };
}

test('real worker computes progressively and retains a bounded replay window', { timeout: 15000 }, async t => {
  const { send } = await runtime(t);
  assert.equal((await send({ type: 'start', runId: 1, expression: 'log(8,2)', precisionBits: 24 })).type, 'ready');
  const first = await send({ type: 'pull', runId: 1, count: 1 });
  assert.equal(first.frames.length, 1);
  assert.equal(first.done, false);
  const buffer = new TraceBuffer(32);
  buffer.append(first.frames);
  let packet;
  do {
    packet = await send({ type: 'pull', runId: 1, count: 10000 });
    assert.equal(packet.type, 'frames');
    assert.ok(packet.frames.length <= 128);
    buffer.append(packet.frames);
    assert.ok(buffer.frames.length <= 32);
  } while (!packet.done);
  assert.equal(packet.result.text, '≈ 3');
  assert.ok(buffer.firstIndex > 0);
  assert.equal(buffer.get(buffer.lastIndex).operation, 'result');
});

test('worker restart isolates runs, and domain errors stop without a fabricated result', { timeout: 10000 }, async t => {
  const { worker, send } = await runtime(t);
  await send({ type: 'start', runId: 1, expression: '2^10000', precisionBits: 24 });
  const first = await send({ type: 'pull', runId: 1, count: 2 });
  assert.equal(first.frames.length, 2);
  await send({ type: 'start', runId: 2, expression: '3*4', precisionBits: 24 });
  worker.postMessage({ type: 'pull', runId: 1, count: 128 });
  const result = await send({ type: 'pull', runId: 2, count: 128 });
  assert.equal(result.runId, 2);
  assert.equal(result.result.text, '12');
  await send({ type: 'start', runId: 3, expression: '1/0', precisionBits: 24 });
  const error = await send({ type: 'pull', runId: 3, count: 128 });
  assert.equal(error.type, 'error');
  assert.match(error.message, /zero/);
  assert.equal(error.result, undefined);
});
