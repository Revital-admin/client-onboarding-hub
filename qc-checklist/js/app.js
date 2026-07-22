/* ============================================================
   QC CHECKLIST — APP LOGIC
   Per-client (active workspace). Universal QC + a service-specific
   checklist for the deliverable, then logs a Pass/Fail record to
   client.qcLog — mirrors the "QC LOG" format in the QC SOP.
   ============================================================ */

let isEmbedded = false;
try {
  if (window.parent && typeof window.parent.getActiveClient === 'function') {
    isEmbedded = true;
  }
} catch (e) {
  console.warn("CORS prevented parent access:", e);
}

function el(id) { return document.getElementById(id); }

function getClient() {
  if (isEmbedded) {
    try { return window.parent.getActiveClient(); } catch (e) { return null; }
  }
  return null;
}

function persist() {
  if (isEmbedded) {
    window.parent.saveDatabase();
  }
}

// Current in-progress review (not persisted until logged)
let currentChecked = {}; // { itemKey: boolean }

function serviceTypeByKey(key) {
  return QC_SERVICE_TYPES.find(t => t.key === key);
}

function allCurrentItems() {
  const items = [];
  QC_UNIVERSAL.forEach((cat, ci) => {
    cat.items.forEach((label, ii) => items.push({ key: `u-${ci}-${ii}`, label, group: cat.category }));
  });
  const type = serviceTypeByKey(el('checklistTypeSelect').value);
  if (type) {
    type.items.forEach((label, ii) => items.push({ key: `s-${ii}`, label, group: type.label }));
  }
  return items;
}

function populateTypeSelect() {
  const select = el('checklistTypeSelect');
  select.innerHTML = QC_SERVICE_TYPES.map(t => `<option value="${t.key}">${t.label}</option>`).join('');
}

function renderChecklist() {
  const items = allCurrentItems();
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  const container = el('checklistGroups');
  container.innerHTML = Object.keys(grouped).map(groupName => `
    <div class="step-card">
      <div class="category-header">
        <h3>${groupName}</h3>
        <span class="category-progress">${grouped[groupName].filter(i => currentChecked[i.key]).length}/${grouped[groupName].length}</span>
      </div>
      <div class="section-checkbox-grid vertical">
        ${grouped[groupName].map(item => `
          <label class="checkbox-item">
            <div class="custom-checkbox">
              <input type="checkbox" class="qc-check" data-key="${item.key}" ${currentChecked[item.key] ? 'checked' : ''}>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span>${item.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.qc-check').forEach(cb => {
    cb.addEventListener('change', () => {
      currentChecked[cb.getAttribute('data-key')] = cb.checked;
      updateProgress();
    });
  });

  updateProgress();
}

function updateProgress() {
  const items = allCurrentItems();
  const done = items.filter(i => currentChecked[i.key]).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  el('progressFill').style.width = pct + '%';
  el('progressText').textContent = `${done} of ${items.length} items complete`;
  el('progressPct').textContent = pct + '%';
  el('resultSelect').value = pct === 100 ? 'Passed' : 'Failed';
}

function resetCurrentReview() {
  currentChecked = {};
  el('deliverableInput').value = '';
  el('roundInput').value = '1';
  el('notesInput').value = '';
  renderChecklist();
}

function logQcResult() {
  const client = getClient();
  if (!client) return;
  const reviewer = el('reviewerInput').value.trim();
  const deliverable = el('deliverableInput').value.trim();
  if (!reviewer) {
    if (window.parent.showBanner) window.parent.showBanner('error', 'Enter the reviewer name first.');
    return;
  }
  if (!deliverable) {
    if (window.parent.showBanner) window.parent.showBanner('error', 'Describe the deliverable first.');
    return;
  }

  const items = allCurrentItems();
  const done = items.filter(i => currentChecked[i.key]).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  const type = serviceTypeByKey(el('checklistTypeSelect').value);

  if (!client.qcLog) client.qcLog = [];
  client.qcLog.unshift({
    date: new Date().toISOString().slice(0, 10),
    reviewer,
    deliverable,
    round: Number(el('roundInput').value) || 1,
    type: type ? type.label : '',
    result: el('resultSelect').value,
    pct,
    notes: el('notesInput').value.trim()
  });

  persist();
  renderLog();
  resetCurrentReview();

  if (window.parent.showBanner) {
    window.parent.showBanner('success', `QC logged for "${deliverable}" — ${el('resultSelect').value}.`);
  }
}

function renderLog() {
  const client = getClient();
  const log = (client && client.qcLog) ? client.qcLog : [];
  const tbody = el('qcLogBody');
  tbody.innerHTML = '';
  el('qcLogEmpty').style.display = log.length === 0 ? 'block' : 'none';

  log.forEach(entry => {
    const tr = document.createElement('tr');
    const resultClass = entry.result === 'Passed' ? 'result-pass' : 'result-fail';
    tr.innerHTML = `
      <td class="date-cell">${entry.date}</td>
      <td>${entry.deliverable}</td>
      <td>${entry.type}</td>
      <td>${entry.round}</td>
      <td>${entry.reviewer}</td>
      <td><span class="section-tag ${resultClass}">${entry.result} (${entry.pct}%)</span></td>
      <td>${entry.notes || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initListeners() {
  el('checklistTypeSelect').addEventListener('change', () => {
    currentChecked = {};
    renderChecklist();
  });
  el('logQcBtn').addEventListener('click', logQcResult);
}

document.addEventListener('DOMContentLoaded', () => {
  const client = getClient();
  if (!client) {
    el('notEmbeddedState').style.display = 'block';
    el('qcContent').style.display = 'none';
    return;
  }
  el('notEmbeddedState').style.display = 'none';
  el('qcContent').style.display = '';
  el('clientNameLabel').textContent = client.name || '';

  populateTypeSelect();
  renderChecklist();
  renderLog();
  initListeners();
});
