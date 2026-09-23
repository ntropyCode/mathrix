import { BitField } from './bit-field.js';
import { TraceBuffer } from './session.js';

const ids = ['formula-form','formula','examples','result','result-kind','error','operation','active-expression','field','tooltip','loading','detail','restart','previous','play','next','speed','finish','timeline','step-index','history-note','columns','zoom-out','zoom-in','fit','precision','register-count','register-values','run-status'];
const ui = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const field = new BitField(ui.field, { onInspect: cell => {
  ui.tooltip.hidden = !cell;
  if (cell) ui.tooltip.textContent = `${cell.label} · bit ${cell.bitIndex} · ${cell.bitValue} · ${cell.role}`;
}});
let worker;
let runId = 0;
let history = new TraceBuffer();
let cursor = -1;
let expression = '';
let precisionBits = 24;
let playing = false;
let finishing = false;
let pending = false;
let done = false;
let failed = false;
let result = null;
let timer = null;
let busyTimer = null;
let requestedGoal = 0;
let navigationRevision = 0;
let requestedRevision = 0;

function edited() {
  return ui.formula.value !== expression || Number(ui.precision.value) !== precisionBits;
}

function syncControls() {
  const unavailable = cursor < 0 || failed || edited();
  ui.previous.disabled = unavailable || cursor <= history.firstIndex;
  ui.next.disabled = unavailable || (done && cursor >= history.lastIndex) || pending;
  ui.play.disabled = unavailable || (done && cursor >= history.lastIndex);
  ui.play.textContent = playing ? 'Pause' : 'Play';
  ui.finish.disabled = unavailable || (done && cursor >= history.lastIndex);
  ui.finish.textContent = finishing ? 'Finishing…' : 'Finish';
  ui.timeline.disabled = unavailable || history.frames.length < 2;
  ui.timeline.min = history.firstIndex;
  ui.timeline.max = Math.max(0, history.lastIndex);
  ui.timeline.value = Math.max(0, cursor);
  ui['step-index'].textContent = cursor < 0 ? '—' : cursor.toLocaleString();
  if (history.firstIndex > 0) ui['history-note'].textContent = `Recent ${history.frames.length} states · restart for earlier steps`;
  else ui['history-note'].textContent = done ? `${history.frames.length.toLocaleString()} recorded states` : `${history.frames.length.toLocaleString()} states generated`;
  ui['run-status'].textContent = failed ? 'Stopped with an error' : edited() ? 'Formula edited' : playing ? 'Running' : done && cursor === history.lastIndex ? 'Complete' : 'Paused';
  ui.detail.setAttribute('aria-live', playing ? 'off' : 'polite');
}

function showFrame(index) {
  const frame = history.get(index);
  if (!frame) return;
  cursor = index;
  field.setFrame(frame);
  ui.operation.textContent = frame.title || frame.operation;
  ui.detail.textContent = frame.detail;
  const [start, end] = frame.sourceRange ?? [0, expression.length];
  const mark = document.createElement('mark');
  mark.textContent = expression.slice(start, end);
  ui['active-expression'].replaceChildren(document.createTextNode(expression.slice(0, start)), mark, document.createTextNode(expression.slice(end)));
  ui['register-count'].textContent = `(${frame.registers.length})`;
  ui['register-values'].replaceChildren(...frame.registers.map(register => {
    const row = document.createElement('div');
    row.className = 'register-item';
    const name = document.createElement('strong');
    name.textContent = `${register.label} · ${register.role}`;
    const value = document.createElement('span');
    value.textContent = `${register.value}${register.fractionalBits ? ` / 2^${register.fractionalBits} (fixed point)` : ''}`;
    row.append(name, value);
    return row;
  }));
  ui.field.setAttribute('aria-label', `${frame.title}. ${frame.detail} ${frame.registers.map(register => `${register.label}: ${register.value}${register.fractionalBits ? ` divided by 2 to the ${register.fractionalBits}` : ''}`).join('; ')}`);
  syncControls();
}

function pause() {
  playing = false;
  finishing = false;
  clearTimeout(timer);
  timer = null;
  if (!result && cursor >= 0 && !failed && !edited()) ui.result.textContent = 'Paused · result pending';
  syncControls();
}

function reportError(message) {
  failed = true;
  pending = false;
  pause();
  clearTimeout(busyTimer);
  ui.loading.hidden = true;
  ui.error.textContent = message;
  ui.error.hidden = false;
  ui.result.textContent = 'Computation stopped';
  ui.result.title = '';
  ui['result-kind'].textContent = '';
  if (cursor < 0) {
    ui.operation.textContent = 'Unable to run this formula';
    ui.detail.textContent = 'Edit the expression and run it again.';
  }
}

function schedule() {
  clearTimeout(timer);
  if (!playing || pending || failed) return;
  const speed = ui.speed.value;
  timer = setTimeout(tick, finishing || speed === 'fast' ? 0 : 1000 / Number(speed));
}

function tick() {
  if (!playing || pending || failed) return;
  if (done && cursor >= history.lastIndex) { pause(); return; }
  advance(finishing || ui.speed.value === 'fast' ? 128 : 1);
}

function pull(count, goal) {
  if (pending || done || failed) return;
  pending = true;
  requestedGoal = goal;
  requestedRevision = navigationRevision;
  clearTimeout(busyTimer);
  busyTimer = setTimeout(() => { ui.loading.textContent = 'Computing next states…'; ui.loading.hidden = false; }, 180);
  worker.postMessage({ type: 'pull', runId, count });
  syncControls();
}

function advance(count = 1) {
  const goal = cursor + count;
  if (goal <= history.lastIndex || done) {
    showFrame(Math.min(goal, history.lastIndex));
    if (done && cursor >= history.lastIndex) pause();
    else schedule();
    return;
  }
  pull(Math.min(128, goal - history.lastIndex), goal);
}

function start(autoPlay = false) {
  pause();
  clearTimeout(busyTimer);
  worker?.terminate();
  runId++;
  expression = ui.formula.value.trim();
  ui.formula.value = expression;
  precisionBits = Number(ui.precision.value);
  history = new TraceBuffer(512);
  cursor = -1;
  pending = false;
  done = false;
  failed = false;
  result = null;
  navigationRevision++;
  playing = autoPlay;
  finishing = false;
  field.setFrame(null);
  field.resetView();
  ui.tooltip.hidden = true;
  ui.error.hidden = true;
  ui.result.textContent = 'Computing…';
  ui.result.title = '';
  ui['result-kind'].textContent = '';
  ui.operation.textContent = 'Preparing computation';
  ui['active-expression'].textContent = expression;
  ui.detail.textContent = 'Loading the first algorithm state.';
  ui['register-values'].replaceChildren();
  ui['register-count'].textContent = '';
  ui.loading.textContent = 'Preparing the first state…';
  ui.loading.hidden = false;
  syncControls();
  try {
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.onerror = event => reportError(event.message || 'The computation worker could not start.');
    worker.onmessage = ({ data }) => {
      if (data.runId !== runId) return;
      if (data.type === 'ready') { pull(1, 0); return; }
      if (data.type === 'error') { reportError(data.message); return; }
      if (data.type !== 'frames') return;
      pending = false;
      clearTimeout(busyTimer);
      ui.loading.hidden = true;
      try { history.append(data.frames); }
      catch (error) { reportError(error.message); return; }
      done = data.done;
      if (data.result) {
        result = data.result;
        ui.result.textContent = `${result.value.approximate && !result.text.startsWith('≈') ? '≈ ' : ''}${result.text}`;
        ui.result.title = result.exactText;
        ui['result-kind'].textContent = result.value.approximate ? `Approximate · log precision ${precisionBits} bits` : 'Exact';
      } else if (!result) {
        ui.result.textContent = playing ? 'Computing…' : 'Paused · result pending';
      }
      if (edited()) {
        ui.result.textContent = 'Run to evaluate';
        ui.result.title = '';
        ui['result-kind'].textContent = '';
      }
      const goal = requestedRevision === navigationRevision ? requestedGoal : cursor;
      if (history.frames.length) showFrame(Math.max(history.firstIndex, Math.min(goal, history.lastIndex)));
      if (done && cursor >= history.lastIndex) pause();
      else schedule();
      syncControls();
    };
    worker.postMessage({ type: 'start', runId, expression, precisionBits });
  } catch (error) { reportError(error.message); }
}

ui['formula-form'].addEventListener('submit', event => { event.preventDefault(); start(true); });
ui.examples.addEventListener('change', () => {
  if (!ui.examples.value) return;
  ui.formula.value = ui.examples.value;
  start(true);
});
function edit() {
  pause();
  navigationRevision++;
  if (ui.examples.value !== ui.formula.value) ui.examples.value = '';
  if (edited()) {
    ui.result.textContent = 'Run to evaluate';
    ui.result.title = '';
    ui['result-kind'].textContent = '';
    ui.error.hidden = true;
  } else if (result) {
    ui.result.textContent = result.text;
    ui['result-kind'].textContent = result.value.approximate ? `Approximate · log precision ${precisionBits} bits` : 'Exact';
  }
  syncControls();
}
ui.formula.addEventListener('input', edit);
ui.precision.addEventListener('change', edit);
ui.restart.addEventListener('click', () => start(false));
ui.previous.addEventListener('click', () => { pause(); navigationRevision++; showFrame(Math.max(history.firstIndex, cursor - 1)); });
ui.next.addEventListener('click', () => { pause(); navigationRevision++; advance(); });
ui.play.addEventListener('click', () => {
  if (playing) { pause(); return; }
  playing = true;
  finishing = false;
  syncControls();
  tick();
});
ui.finish.addEventListener('click', () => { playing = true; finishing = true; syncControls(); tick(); });
ui.speed.addEventListener('change', () => { if (playing) schedule(); });
ui.timeline.addEventListener('input', () => {
  const index = Number(ui.timeline.value);
  pause();
  navigationRevision++;
  showFrame(index);
});
ui.columns.addEventListener('change', () => field.setOptions({ columns: Number(ui.columns.value) }));
ui['zoom-in'].addEventListener('click', () => field.zoom(1.25));
ui['zoom-out'].addEventListener('click', () => field.zoom(.8));
ui.fit.addEventListener('click', () => field.resetView());
window.addEventListener('pagehide', () => { clearTimeout(timer); clearTimeout(busyTimer); worker?.terminate(); field.destroy(); });
start(false);
