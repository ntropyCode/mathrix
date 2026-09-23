export class TraceBuffer {
  constructor(capacity = 512) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('History capacity must be positive.');
    this.capacity = capacity;
    this.frames = [];
  }

  append(frames) {
    for (const frame of frames) {
      if (this.frames.length && frame.index !== this.lastIndex + 1) throw new Error('Trace frames must be consecutive.');
      this.frames.push(frame);
    }
    const overflow = this.frames.length - this.capacity;
    if (overflow > 0) this.frames.splice(0, overflow);
  }

  get firstIndex() { return this.frames[0]?.index ?? 0; }
  get lastIndex() { return this.frames.at(-1)?.index ?? -1; }
  get(index) { return this.frames[index - this.firstIndex] ?? null; }
}

export function takeFrames(iterator, count) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    const next = iterator.next();
    if (next.done) return { frames, done: true, result: next.value };
    frames.push(next.value);
  }
  return { frames, done: false };
}
