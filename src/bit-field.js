const MAX_BITS = 16384;
const MAX_MAGNITUDE = (1n << BigInt(MAX_BITS)) - 1n;
const PADDING = 20;
const HEADER = 28;
const REGISTER_GAP = 26;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function layoutRegisters(registers, { columns = 32, cellSize = 24, widths = new Map() } = {}) {
  columns = clamp(Math.round(columns), 4, 256);
  cellSize = clamp(cellSize, 4, 40);
  const gap = Math.max(1, cellSize / 12);
  const pitch = cellSize + gap;
  let top = PADDING;
  const blocks = registers.map(register => {
    const magnitude = register.value < 0n ? -register.value : register.value;
    if (magnitude > MAX_MAGNITUDE) throw new RangeError(`The field supports up to ${MAX_BITS} bits per register.`);
    const bits = magnitude.toString(2);
    const width = Math.max(bits.length, Math.min(MAX_BITS, (register.activeBit ?? -1) + 1), widths.get(register.id) ?? 0);
    widths.set(register.id, width);
    const rows = Math.max(1, Math.ceil(width / columns));
    const block = { register, bits, rows, top, cellsTop: top + HEADER, bottom: top + HEADER + rows * pitch - gap };
    top = block.bottom + REGISTER_GAP;
    return block;
  });
  return { blocks, columns, cellSize, gap, pitch, width: 2 * PADDING + columns * pitch - gap, height: blocks.length ? top - REGISTER_GAP + PADDING : 2 * PADDING };
}

export function visibleCells(layout, block, viewport) {
  const { pitch, columns, cellSize } = layout;
  const left = viewport.x;
  const right = left + viewport.width;
  const top = viewport.y;
  const bottom = top + viewport.height;
  if (bottom <= block.cellsTop || top >= block.bottom || right <= PADDING || left >= layout.width - PADDING) return null;
  return {
    firstColumn: clamp(Math.floor((left - PADDING - cellSize) / pitch) + 1, 0, columns - 1),
    lastColumn: clamp(Math.ceil((right - PADDING) / pitch) - 1, 0, columns - 1),
    firstRow: clamp(Math.floor((top - block.cellsTop - cellSize) / pitch) + 1, 0, block.rows - 1),
    lastRow: clamp(Math.ceil((bottom - block.cellsTop) / pitch) - 1, 0, block.rows - 1),
  };
}

export function inspectPoint(layout, x, y) {
  const column = Math.floor((x - PADDING) / layout.pitch);
  if (column < 0 || column >= layout.columns || (x - PADDING) % layout.pitch >= layout.cellSize) return null;
  for (const block of layout.blocks) {
    const row = Math.floor((y - block.cellsTop) / layout.pitch);
    if (row < 0 || row >= block.rows || (y - block.cellsTop) % layout.pitch >= layout.cellSize) continue;
    const bitIndex = (block.rows - row) * layout.columns - column - 1;
    const bitValue = block.bits[block.bits.length - bitIndex - 1] === '1' ? 1 : 0;
    return { label: block.register.label, value: block.register.value.toString(), bitIndex, bitValue, role: block.register.role };
  }
  return null;
}

export function backingSize(width, height, devicePixelRatio = 1) {
  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));
  const ratio = Math.min(Math.max(1, devicePixelRatio || 1), 2, 4096 / width, 4096 / height, Math.sqrt(8_388_608 / (width * height)));
  return { width: Math.max(1, Math.floor(width * ratio)), height: Math.max(1, Math.floor(height * ratio)), ratio };
}

export function isConsumedBit(register, bitIndex, bitLength) {
  const consumed = register.consumedBits ?? 0;
  return register.consumedFrom === 'msb'
    ? bitIndex < bitLength && bitIndex >= Math.max(0, bitLength - consumed)
    : bitIndex < consumed;
}

export class BitField {
  constructor(canvas, { onInspect = () => {} } = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('A 2D canvas is required to display the bit field.');
    this.onInspect = onInspect;
    this.options = { columns: 32, cellSize: 24 };
    this.widths = new Map();
    this.frame = null;
    this.layout = layoutRegisters([], this.options);
    this.panX = 0;
    this.panY = 0;
    this.width = 1;
    this.height = 1;
    this.drawnCells = 0;
    this.drag = null;
    this.window = canvas.ownerDocument?.defaultView ?? globalThis;
    this.handlers = {
      pointerdown: event => this.pointerDown(event),
      pointermove: event => this.pointerMove(event),
      pointerup: event => this.pointerUp(event),
      pointercancel: event => this.pointerUp(event),
      lostpointercapture: () => { this.drag = null; this.canvas.style.cursor = 'grab'; },
      pointerleave: () => this.onInspect(null),
      wheel: event => { event.preventDefault(); const point = this.pointerPosition(event); this.zoomAt(Math.exp(-event.deltaY * 0.002), point.x, point.y); },
    };
    for (const [name, handler] of Object.entries(this.handlers)) canvas.addEventListener(name, handler, name === 'wheel' ? { passive: false } : undefined);
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    this.onResize = () => this.resize();
    const Observer = this.window.ResizeObserver;
    if (Observer) {
      this.observer = new Observer(this.onResize);
      this.observer.observe(canvas.parentElement ?? canvas);
    } else this.window.addEventListener?.('resize', this.onResize);
    this.resize();
  }

  setFrame(frame) {
    const restart = !this.frame || (frame?.index === 0 && this.frame.index !== 0);
    if (!frame || restart) this.widths.clear();
    this.frame = frame;
    this.relayout();
    if (restart) {
      this.panX = Math.min(0, this.width - this.layout.width);
      this.panY = 0;
    }
    this.clampPan();
    this.onInspect(null);
    this.draw();
  }

  setOptions(options) {
    if (options.columns !== undefined && (!Number.isFinite(options.columns) || options.columns < 1)) throw new RangeError('Columns must be a positive number.');
    if (options.cellSize !== undefined && (!Number.isFinite(options.cellSize) || options.cellSize <= 0)) throw new RangeError('Cell size must be a positive number.');
    this.options = { columns: clamp(Math.round(options.columns ?? this.options.columns), 4, 256), cellSize: clamp(options.cellSize ?? this.options.cellSize, 4, 40) };
    this.relayout();
    this.clampPan();
    this.draw();
  }

  relayout() {
    this.layout = layoutRegisters(this.frame?.registers ?? [], { ...this.options, widths: this.widths });
  }

  resetView() {
    this.options.cellSize = 24;
    this.relayout();
    this.panX = Math.min(0, this.width - this.layout.width);
    this.panY = 0;
    this.clampPan();
    this.draw();
  }

  zoom(factor) {
    this.zoomAt(factor, this.width / 2, this.height / 2);
  }

  zoomAt(factor, x, y) {
    if (!Number.isFinite(factor) || factor <= 0) return;
    const previous = this.layout;
    const nextSize = clamp(this.options.cellSize * factor, 4, 40);
    if (nextSize === this.options.cellSize) return;
    this.options.cellSize = nextSize;
    this.relayout();
    const ratio = this.layout.pitch / previous.pitch;
    this.panX = x - (x - this.panX - PADDING) * ratio - PADDING;
    const oldY = y - this.panY;
    const blockIndex = previous.blocks.findIndex(block => oldY >= block.top && oldY <= block.bottom + REGISTER_GAP);
    if (blockIndex >= 0) this.panY = y - this.layout.blocks[blockIndex].cellsTop - (oldY - previous.blocks[blockIndex].cellsTop) * ratio;
    else this.panY = y - oldY * ratio;
    this.clampPan();
    this.onInspect(null);
    this.draw();
  }

  resize() {
    const rectangle = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rectangle.width);
    this.height = Math.max(1, rectangle.height);
    const size = backingSize(this.width, this.height, this.window.devicePixelRatio);
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.clampPan();
    this.draw();
  }

  clampPan() {
    this.panX = this.width >= this.layout.width
      ? (this.width - this.layout.width) / 2
      : clamp(this.panX, this.width - this.layout.width, 0);
    this.panY = clamp(this.panY, Math.min(0, this.height - this.layout.height), 0);
  }

  pointerPosition(event) {
    const rectangle = this.canvas.getBoundingClientRect();
    return { x: (event.clientX - rectangle.left) * this.width / rectangle.width, y: (event.clientY - rectangle.top) * this.height / rectangle.height };
  }

  pointerDown(event) {
    if (event.button !== 0 || this.drag) return;
    const point = this.pointerPosition(event);
    this.drag = { pointerId: event.pointerId, x: point.x, y: point.y, panX: this.panX, panY: this.panY };
    this.canvas.setPointerCapture?.(event.pointerId);
    this.canvas.style.cursor = 'grabbing';
    this.onInspect(null);
  }

  pointerMove(event) {
    const point = this.pointerPosition(event);
    if (this.drag?.pointerId === event.pointerId) {
      this.panX = this.drag.panX + point.x - this.drag.x;
      this.panY = this.drag.panY + point.y - this.drag.y;
      this.clampPan();
      this.draw();
    } else if (!this.drag) this.onInspect(inspectPoint(this.layout, point.x - this.panX, point.y - this.panY));
  }

  pointerUp(event) {
    if (this.drag?.pointerId !== event.pointerId) return;
    this.drag = null;
    if (this.canvas.hasPointerCapture?.(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.canvas.style.cursor = 'grab';
  }

  draw() {
    const context = this.context;
    const { cellSize, pitch, columns } = this.layout;
    context.setTransform(this.canvas.width / this.width, 0, 0, this.canvas.height / this.height, 0, 0);
    context.fillStyle = '#0d111e';
    context.fillRect(0, 0, this.width, this.height);
    context.font = '12px ui-monospace, SFMono-Regular, monospace';
    context.textBaseline = 'middle';
    this.drawnCells = 0;
    for (const block of this.layout.blocks) {
      if (block.bottom + this.panY < 0 || block.top + this.panY > this.height) continue;
      const register = block.register;
      const sign = register.value < 0n ? '−' : '+';
      const decimal = register.value.toString().replace('-', '');
      const valueLabel = decimal.length > 34 ? `${decimal.slice(0, 16)}…${decimal.slice(-12)} (${block.bits.length} bits)` : decimal;
      const fixed = register.fractionalBits ? ` / 2^${register.fractionalBits}` : '';
      context.fillStyle = register.role === 'carry' ? '#ff75b4' : '#a7b5cf';
      const labelX = PADDING + Math.max(0, this.panX);
      context.fillText(`${register.label}   ${sign}${valueLabel}${fixed}`, labelX, block.top + this.panY + 9, Math.max(1, this.width - PADDING - labelX));
      const visible = visibleCells(this.layout, block, { x: -this.panX, y: -this.panY, width: this.width, height: this.height });
      if (!visible) continue;
      for (let row = visible.firstRow; row <= visible.lastRow; row++) {
        const y = block.cellsTop + row * pitch + this.panY;
        for (let column = visible.firstColumn; column <= visible.lastColumn; column++) {
          const x = PADDING + column * pitch + this.panX;
          const bitIndex = (block.rows - row) * columns - column - 1;
          const one = block.bits[block.bits.length - bitIndex - 1] === '1';
          const consumed = isConsumedBit(register, bitIndex, block.bits.length);
          context.fillStyle = one ? (register.role === 'carry' ? '#ff007f' : register.role === 'input' ? '#167482' : '#00f0ff') : '#151a2e';
          context.globalAlpha = consumed ? 0.3 : 1;
          const radius = Math.max(1, cellSize * 0.15);
          if (context.roundRect) {
            context.beginPath();
            context.roundRect(x, y, cellSize, cellSize, radius);
            context.fill();
          } else context.fillRect(x, y, cellSize, cellSize);
          context.globalAlpha = 1;
          if (bitIndex === register.activeBit) {
            context.strokeStyle = '#ff007f';
            context.lineWidth = Math.max(1, cellSize * 0.09);
            context.strokeRect(x + 1, y + 1, Math.max(1, cellSize - 2), Math.max(1, cellSize - 2));
          }
          this.drawnCells++;
        }
      }
    }
  }

  getStats() {
    return { registers: this.layout.blocks.length, bits: this.layout.blocks.reduce((sum, block) => sum + block.bits.length, 0), drawnCells: this.drawnCells, columns: this.options.columns, cellSize: this.options.cellSize, logicalWidth: this.layout.width, logicalHeight: this.layout.height, viewportWidth: this.width, viewportHeight: this.height, canvasWidth: this.canvas.width, canvasHeight: this.canvas.height, panX: this.panX, panY: this.panY };
  }

  destroy() {
    this.observer?.disconnect();
    this.window.removeEventListener?.('resize', this.onResize);
    for (const [name, handler] of Object.entries(this.handlers)) this.canvas.removeEventListener(name, handler);
    this.drag = null;
    this.onInspect(null);
  }
}
