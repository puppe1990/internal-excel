// ===== Utilitários =====
const ABC = (n) => {
  // 0 -> A, 25 -> Z, 26 -> AA ...
  let s = ""; n = Number(n);
  while (n >= 0) { s = String.fromCharCode(n % 26 + 65) + s; n = Math.floor(n / 26) - 1; }
  return s;
};
const A1 = (r, c) => `${ABC(c)}${r+1}`;
const idxFromA1 = (ref) => {
  const m = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase());
  if (!m) return null;
  const letters = m[1]; const row = parseInt(m[2], 10) - 1;
  let col = 0; for (let i = 0; i < letters.length; i++) { col = col * 26 + (letters.charCodeAt(i) - 64); }
  return { r: row, c: col - 1 };
};

const grid = document.getElementById('grid');
const thead = grid.querySelector('thead');
const tbody = grid.querySelector('tbody');

let ROWS = 20, COLS = 10;

function buildHeader() {
  thead.innerHTML = '';
  const tr = document.createElement('tr');
  const corner = document.createElement('th');
  corner.className = 'corner'; corner.textContent = '';
  tr.appendChild(corner);
  for (let c = 0; c < COLS; c++) {
    const th = document.createElement('th');
    th.textContent = ABC(c);
    th.dataset.col = c;
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.addEventListener('mousedown', startColResize);
    th.appendChild(resizer);
    tr.appendChild(th);
  }
  thead.appendChild(tr);
}

function buildBody() {
  tbody.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.className = 'rowhdr'; th.textContent = r + 1;
    tr.appendChild(th);
    for (let c = 0; c < COLS; c++) {
      const td = document.createElement('td');
      const div = document.createElement('div');
      div.className = 'cell'; div.contentEditable = true; div.spellcheck = false;
      div.dataset.r = r; div.dataset.c = c; div.addEventListener('keydown', onKey);
      div.addEventListener('input', onInput);
      td.appendChild(div); tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function newSheet() { buildHeader(); buildBody(); }

// ===== Edição & Navegação =====
function focusCell(r, c) {
  r = Math.max(0, Math.min(ROWS-1, r)); c = Math.max(0, Math.min(COLS-1, c));
  const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if (cell) { cell.focus(); placeCaretAtEnd(cell); }
}
function placeCaretAtEnd(el) {
  const range = document.createRange(); range.selectNodeContents(el); range.collapse(false);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
}

function onKey(e) {
  const r = +this.dataset.r, c = +this.dataset.c;
  if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) focusCell(r-1,c); else focusCell(r+1,c); return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); focusCell(r+1, c); return; }
  if (e.key === 'ArrowUp') { e.preventDefault(); focusCell(r-1, c); return; }
  if (e.key === 'ArrowLeft' && !this.textContent) { e.preventDefault(); focusCell(r, c-1); return; }
  if (e.key === 'ArrowRight' && !this.textContent) { e.preventDefault(); focusCell(r, c+1); return; }
  if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); toggleBold(this); }
}

function onInput(e) {
  // manter fórmula original num atributo
  const txt = this.textContent.trim();
  if (txt.startsWith('=')) {
    this.dataset.formula = txt;
  } else {
    delete this.dataset.formula;
  }
}

function toggleBold(el) { el.classList.toggle('bold'); }

// ===== Somar seleção com mouse (drag) =====
let isSelecting = false; let selStart = null; let selEnd = null;
tbody.addEventListener('mousedown', (e) => {
  const target = e.target.closest('.cell'); if (!target) return;
  isSelecting = true; selStart = { r: +target.dataset.r, c: +target.dataset.c };
  clearHighlights(); target.parentElement.classList.add('sel');
  updateSelection(target);
});
tbody.addEventListener('mouseover', (e) => { if (!isSelecting) return; const target = e.target.closest('.cell'); if (target) updateSelection(target); });
document.addEventListener('mouseup', () => { isSelecting = false; });

function updateSelection(target) {
  selEnd = { r: +target.dataset.r, c: +target.dataset.c };
  highlightRange(selStart, selEnd);
}
function highlightRange(a, b) {
  clearHighlights();
  const r1 = Math.min(a.r, b.r), r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c), c2 = Math.max(a.c, b.c);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      if (cell) cell.classList.add('sum-highlight');
    }
  }
}
function clearHighlights() { tbody.querySelectorAll('.sum-highlight').forEach(el => el.classList.remove('sum-highlight')); }

function sumSelection() {
  if (!selStart || !selEnd) return alert('Selecione um intervalo com o mouse.');
  const r1 = Math.min(selStart.r, selEnd.r), r2 = Math.max(selStart.r, selEnd.r);
  const c1 = Math.min(selStart.c, selEnd.c), c2 = Math.max(selStart.c, selEnd.c);
  let s = 0; let count = 0;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const v = getNumericValue(r,c); if (!Number.isNaN(v)) { s += v; count++; }
    }
  }
  alert(`Soma: ${s}\nMédia: ${count? (s/count).toFixed(4) : '—'}`);
}

// ===== Fórmulas =====
function getCellText(r, c) {
  const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  return cell ? cell.textContent.trim() : '';
}
function getNumericValue(r, c) {
  const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if (!cell) return NaN;
  const raw = cell.textContent.trim();
  if (raw.startsWith('=')) return evaluateFormula(raw.substring(1));
  const n = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function evaluateFormula(expr) {
  // substitui referências A1 por valores numéricos (NaN -> 0)
  const replaced = expr.replace(/([A-Z]+\d+)/gi, (m) => {
    const idx = idxFromA1(m); if (!idx) return '0';
    const val = getNumericValue(idx.r, idx.c); return Number.isFinite(val) ? String(val) : '0';
  });
  // segurança: apenas números, operadores e parênteses
  if (/[^0-9+\-*/().\s]/.test(replaced)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${replaced});`)();
    return Number(result);
  } catch { return NaN; }
}

function recalcAll() {
  tbody.querySelectorAll('.cell').forEach(cell => {
    const txt = cell.textContent.trim();
    if (txt.startsWith('=')) {
      const v = evaluateFormula(txt.substring(1));
      if (Number.isFinite(v)) {
        cell.dataset.formula = txt; // guarda original
        cell.textContent = String(v);
        // mostra pequena indicação visual
        cell.animate([{ background: 'rgba(163,230,53,.15)' }, { background: 'transparent' }], { duration: 600 });
      } else {
        cell.animate([{ background: 'rgba(239,68,68,.15)' }, { background: 'transparent' }], { duration: 800 });
      }
    }
  });
}

// ===== CSV Import/Export =====
function toCSV() {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      let t = cell?.dataset.formula || cell?.textContent || '';
      t = t.replaceAll('"', '""');
      if (/[",\n]/.test(t)) t = '"' + t + '"';
      cols.push(t);
    }
    rows.push(cols.join(','));
  }
  return rows.join('\n');
}
function downloadCSV() {
  const blob = new Blob([toCSV()], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'planilha.csv'; a.click();
  URL.revokeObjectURL(url);
}
function parseCSV(text) {
  const rows = []; let row = []; let cur = ''; let inside = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]; const nxt = text[i+1];
    if (inside) {
      if (ch === '"' && nxt === '"') { cur += '"'; i++; }
      else if (ch === '"') { inside = false; }
      else cur += ch;
    } else {
      if (ch === '"') inside = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (cur || row.length || ch === '\n') { row.push(cur); rows.push(row); row = []; cur=''; } if (ch==='\r' && nxt==='\n') i++; }
      else cur += ch;
    }
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function loadCSV(text) {
  const data = parseCSV(text);
  ROWS = Math.max(20, data.length);
  COLS = Math.max(10, Math.max(...data.map(r=>r.length)) || 0);
  newSheet();
  data.forEach((rArr, r) => rArr.forEach((val, c) => {
    const cell = tbody.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!cell) return; cell.textContent = val;
    if (val.trim().startsWith('=')) cell.dataset.formula = val;
  }));
}

// ===== Colunas: redimensionar =====
let resizing = null;
function startColResize(e) {
  const th = e.target.parentElement; const startX = e.clientX; const startW = th.offsetWidth; const col = +th.dataset.col;
  resizing = { th, startX, startW, col };
  document.addEventListener('mousemove', onColResize);
  document.addEventListener('mouseup', stopColResize, { once: true });
}
function onColResize(e) {
  if (!resizing) return; const dx = e.clientX - resizing.startX; const w = Math.max(80, resizing.startW + dx);
  // aplica ao cabeçalho e às células
  const index = resizing.col + 2; // + corner + rowhdr
  grid.querySelectorAll(`tr > :nth-child(${index})`).forEach(el => { el.style.width = w + 'px'; });
}
function stopColResize() { resizing = null; document.removeEventListener('mousemove', onColResize); }

// ===== Linhas/Colunas: adicionar/remover =====
function addRow() { ROWS++; const r = ROWS-1; const tr = document.createElement('tr');
  const th = document.createElement('th'); th.className='rowhdr'; th.textContent = ROWS; tr.appendChild(th);
  for (let c = 0; c < COLS; c++) { const td = document.createElement('td'); const div = document.createElement('div'); div.className='cell'; div.contentEditable=true; div.spellcheck=false; div.dataset.r=r; div.dataset.c=c; div.addEventListener('keydown', onKey); div.addEventListener('input', onInput); td.appendChild(div); tr.appendChild(td);} tbody.appendChild(tr);
}
function addCol() { COLS++; buildHeader(); // atualiza índices
  // adicionar célula em cada linha
  [...tbody.rows].forEach((tr, r) => { const td=document.createElement('td'); const div=document.createElement('div'); div.className='cell'; div.contentEditable=true; div.spellcheck=false; div.dataset.r=r; div.dataset.c=COLS-1; div.addEventListener('keydown', onKey); div.addEventListener('input', onInput); td.appendChild(div); tr.appendChild(td); });
}
function delRow() { if (ROWS<=1) return; tbody.deleteRow(ROWS-1); ROWS--; }
function delCol() { if (COLS<=1) return; // remove última coluna
  const index = COLS + 1; // + row header
  [...tbody.rows].forEach(tr => tr.deleteCell(index));
  COLS--; buildHeader(); // reetiqueta cabeçalhos
}

// ===== Ligações da UI =====
document.getElementById('newSheet').addEventListener('click', () => { ROWS=20; COLS=10; newSheet(); });
document.getElementById('addRow').addEventListener('click', addRow);
document.getElementById('addCol').addEventListener('click', addCol);
document.getElementById('delRow').addEventListener('click', delRow);
document.getElementById('delCol').addEventListener('click', delCol);
document.getElementById('bold').addEventListener('click', () => { const el = document.activeElement?.classList?.contains('cell') ? document.activeElement : null; if (el) toggleBold(el); else alert('Selecione uma célula primeiro.'); });
document.getElementById('sumSel').addEventListener('click', sumSelection);
document.getElementById('recalc').addEventListener('click', recalcAll);
document.getElementById('exportCsv').addEventListener('click', downloadCSV);
document.getElementById('importCsv').addEventListener('change', (e) => { const f=e.target.files[0]; if (!f) return; const reader=new FileReader(); reader.onload = () => loadCSV(reader.result); reader.readAsText(f); e.target.value=''; });

// init
newSheet();
  
