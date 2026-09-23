import test from 'node:test';
import assert from 'node:assert/strict';
import { BitField, layoutRegisters, inspectPoint, visibleCells, backingSize, isConsumedBit } from '../src/bit-field.js';

const register = (value, extra = {}) => ({ id: 'state', label: 'State', value, role: 'state', ...extra });
const center = (layout, block, row, column) => ({ x: 20 + column * layout.pitch + layout.cellSize / 2, y: block.cellsTop + row * layout.pitch + layout.cellSize / 2 });

test('wrapping retains binary place values across rows, signs, and registers', () => {
  const layout = layoutRegisters([register(-0b100000001n), register(0b101n, { id: 'other', label: 'Other', role: 'input' })], { columns: 4 });
  assert.equal(layout.blocks[0].rows, 3);
  for (let bit = 0; bit < 12; bit++) {
    const row = 2 - Math.floor(bit / 4);
    const point = center(layout, layout.blocks[0], row, 3 - bit % 4);
    const inspection = inspectPoint(layout, point.x, point.y);
    assert.equal(inspection.bitIndex, bit);
    assert.equal(inspection.bitValue, bit === 0 || bit === 8 ? 1 : 0);
    assert.equal(inspection.value, '-257');
  }
  const other = center(layout, layout.blocks[1], 0, 1);
  assert.deepEqual(inspectPoint(layout, other.x, other.y), { label: 'Other', value: '5', bitIndex: 2, bitValue: 1, role: 'input' });
  assert.equal(inspectPoint(layout, 19, 50), null);
  assert.equal(inspectPoint(layout, 20 + layout.cellSize + 0.5, 50), null);
  assert.equal(inspectPoint(layout, 25, layout.blocks[0].top), null);
});

test('register capacity remains stable when a value shrinks', () => {
  const widths = new Map();
  const expanded = layoutRegisters([register(1n << 95n)], { columns: 32, widths });
  const shrunk = layoutRegisters([register(1n)], { columns: 32, widths });
  assert.equal(expanded.height, shrunk.height);
  assert.equal(shrunk.blocks[0].rows, 3);
  assert.equal(layoutRegisters([register(0n, { activeBit: 32 })]).blocks[0].rows, 2);
});

test('division consumption dims the most significant processed bits, excluding leading padding', () => {
  const dividend = register(0b1101n, { consumedBits: 1, consumedFrom: 'msb' });
  assert.equal(isConsumedBit(dividend, 3, 4), true);
  assert.equal(isConsumedBit(dividend, 0, 4), false);
  assert.equal(isConsumedBit(dividend, 2, 4), false);
  assert.equal(isConsumedBit(dividend, 4, 4), false);
  assert.equal(isConsumedBit({ ...dividend, consumedBits: 0 }, 3, 4), false);
  const lsb = register(0b1101n, { consumedBits: 1 });
  assert.equal(isConsumedBit(lsb, 0, 4), true);
  assert.equal(isConsumedBit(lsb, 3, 4), false);
});

test('viewport culling excludes offscreen registers and includes only intersecting rows and columns', () => {
  const layout = layoutRegisters([register(1n << 1000n), register(3n, { id: 'next' })]);
  const block = layout.blocks[0];
  const viewport = { x: 20 + 8 * layout.pitch, y: block.cellsTop + 3 * layout.pitch, width: layout.cellSize, height: layout.cellSize };
  assert.deepEqual(visibleCells(layout, block, viewport), { firstColumn: 8, lastColumn: 8, firstRow: 3, lastRow: 3 });
  assert.equal(visibleCells(layout, layout.blocks[1], viewport), null);
  const gap = { ...viewport, x: viewport.x + layout.cellSize, width: 1 };
  const range = visibleCells(layout, block, gap);
  assert.ok(!range || range.firstColumn > range.lastColumn);
});

test('canvas backing allocation depends on viewport, with explicit pixel budget', () => {
  assert.deepEqual(backingSize(800, 600, 2), { width: 1600, height: 1200, ratio: 2 });
  assert.deepEqual(backingSize(800, 600, 4), backingSize(800, 600, 2));
  const huge = backingSize(12000, 12000, 3);
  assert.ok(huge.width <= 4096 && huge.height <= 4096);
  assert.ok(huge.width * huge.height <= 8_388_608);
});

function canvasStub(width = 360, height = 300) {
  const listeners = new Map();
  const labels = [];
  const context = { setTransform() {}, fillRect() {}, strokeRect() {}, fillText(text) { labels.push(text); } };
  const canvas = {
    style: {}, width: 0, height: 0, ownerDocument: { defaultView: { devicePixelRatio: 2 } },
    getContext: () => context,
    getBoundingClientRect: () => ({ width, height, left: 10, top: 20 }),
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: name => listeners.delete(name),
    setPointerCapture() {},
  };
  return { canvas, listeners, labels };
}

test('large field keeps narrow viewport bounded, starts at low bits, and permits pan/zoom inspection', () => {
  const { canvas, listeners, labels } = canvasStub();
  const inspections = [];
  const field = new BitField(canvas, { onInspect: value => inspections.push(value) });
  field.setFrame({ index: 0, registers: [register(-(1n << 16383n), { fractionalBits: 24 })] });
  const stats = field.getStats();
  assert.equal(stats.canvasWidth, 720);
  assert.equal(stats.canvasHeight, 600);
  assert.ok(stats.logicalHeight > 13000);
  assert.ok(stats.drawnCells < 200);
  assert.ok(stats.panX < 0);
  assert.match(labels.at(-1), /−.*16384 bits.*2\^24/);
  const point = center(field.layout, field.layout.blocks[0], 0, 31);
  listeners.get('pointermove')({ clientX: point.x + field.panX + 10, clientY: point.y + 20, pointerId: 1 });
  assert.equal(inspections.at(-1).bitIndex, 16352);
  listeners.get('pointerdown')({ clientX: 100, clientY: 100, pointerId: 1, button: 0 });
  listeners.get('pointermove')({ clientX: 400, clientY: -200, pointerId: 1 });
  assert.equal(field.panY, -300);
  assert.ok(field.panX > stats.panX);
  listeners.get('pointerup')({ pointerId: 1 });
  let prevented = false;
  listeners.get('wheel')({ clientX: 100, clientY: 100, deltaY: 400, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.ok(field.getStats().cellSize < 24);
  field.zoom(0.001);
  assert.equal(field.getStats().cellSize, 4);
  field.zoom(1000);
  assert.equal(field.getStats().cellSize, 40);
  field.resetView();
  assert.equal(field.getStats().cellSize, 24);
  assert.equal(field.getStats().panY, 0);
  field.destroy();
  assert.equal(listeners.size, 0);
});

test('new computations clear retained widths and oversized registers fail explicitly', () => {
  const { canvas } = canvasStub(1200, 500);
  const field = new BitField(canvas);
  field.setFrame({ index: 0, registers: [register(1n << 100n)] });
  field.setFrame({ index: 1, registers: [register(1n)] });
  assert.equal(field.layout.blocks[0].rows, 4);
  field.setFrame({ index: 0, registers: [register(1n)] });
  assert.equal(field.layout.blocks[0].rows, 1);
  assert.throws(() => layoutRegisters([register(1n << 16384n)]), /16384 bits/);
  field.destroy();
});

test('field stays centered in wider viewports, including after zoom and reset', () => {
  const { canvas } = canvasStub(1212, 500);
  const field = new BitField(canvas);
  field.setFrame({ index: 0, registers: [register(13n)] });
  assert.equal(field.panX, (1212 - field.layout.width) / 2);
  field.zoom(0.5);
  assert.equal(field.panX, (1212 - field.layout.width) / 2);
  field.resetView();
  assert.equal(field.panX, (1212 - field.layout.width) / 2);
  field.destroy();
});
