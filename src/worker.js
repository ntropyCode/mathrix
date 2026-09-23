import { createComputation } from './arithmetic.js';
import { takeFrames } from './session.js';

let iterator = null;
let runId = 0;
let finished = false;
self.onmessage = ({ data }) => {
  try {
    if (data.type === 'start') {
      runId = data.runId;
      finished = false;
      iterator = createComputation(data.expression, { precisionBits: data.precisionBits });
      self.postMessage({ type: 'ready', runId });
      return;
    }
    if (data.type !== 'pull' || data.runId !== runId || finished || !iterator) return;
    const count = Math.max(1, Math.min(128, Number(data.count) || 1));
    const packet = takeFrames(iterator, count);
    finished = packet.done;
    self.postMessage({ type: 'frames', runId, ...packet });
  } catch (error) {
    finished = true;
    self.postMessage({ type: 'error', runId, message: error instanceof Error ? error.message : String(error) });
  }
};
