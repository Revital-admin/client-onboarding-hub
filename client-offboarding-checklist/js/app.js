/* ============================================================
   CLIENT OFFBOARDING CHECKLIST — APP LOGIC
   Per-client (active workspace), mirrors the audit-tool pattern:
   window.parent.getActiveClient() / window.parent.saveDatabase().
   ============================================================ */

let isEmbedded = false;
let parentClient = null;
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

function ensureState(client) {
  if (!client.offboarding) {
    client.offboarding = { checked: {}, notes: "", startedDate: "" };
  }
  if (!client.offboarding.checked) client.offboarding.checked = {};
  if (client.offboarding.notes === undefined) client.offboarding.notes = "";
  if (client.offboarding.startedDate === undefined) client.offboarding.startedDate = "";
  return client.offboarding;
}

function persist() {
  if (isEmbedded) {
    window.parent.saveDatabase();
    if (window.parent.renderDashboard) window.parent.renderDashboard();
  }
}

function getStats(state) {
  let total = 0;
  let done = 0;
  OFFBOARDING_CATEGORIES.forEach(cat => {
    cat.items.forEach(item => {
      total++;
      if (state.checked[item.id]) done++;
    });
  });
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function render() {
  const client = getClient();
  if (!client) {
    el('notEmbeddedState').style.display = 'block';
    el('offboardingContent').style.display = 'none';
    return;
  }
  el('notEmbeddedState').style.display = 'none';
  el('offboardingContent').style.display = '';

  const state = ensureState(client);
  el('clientNameLabel').textContent = client.name || '';
  el('startedDateInput').value = state.startedDate || '';
  el('offboardingNotes').value = state.notes || '';

  const { total, done, pct } = getStats(state);
  el('progressFill').style.width = pct + '%';
  el('progressText').textContent = `${done} of ${total} items complete`;
  el('progressPct').textContent = pct + '%';

  const container = el('categoriesList');
  container.innerHTML = OFFBOARDING_CATEGORIES.map(cat => {
    const catDone = cat.items.filter(i => state.checked[i.id]).length;
    return `
      <div class="step-card">
        <div class="category-header">
          <h3>${cat.category}</h3>
          <span class="category-progress">${catDone}/${cat.items.length}</span>
        </div>
        <div class="section-checkbox-grid vertical">
          ${cat.items.map(item => `
            <label class="checkbox-item">
              <div class="custom-checkbox">
                <input type="checkbox" class="offboarding-check" data-id="${item.id}" ${state.checked[item.id] ? 'checked' : ''}>
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.offboarding-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const c = getClient();
      const s = ensureState(c);
      s.checked[cb.getAttribute('data-id')] = cb.checked;
      persist();
      render();
    });
  });

  if (pct === 100 && window.parent.showBanner) {
    // Only fire once per full render pass at 100% - harmless if it fires
    // more than once, just a friendly nudge.
  }
}

function initListeners() {
  el('startedDateInput').addEventListener('change', () => {
    const client = getClient();
    const state = ensureState(client);
    state.startedDate = el('startedDateInput').value;
    persist();
  });

  el('offboardingNotes').addEventListener('input', () => {
    const client = getClient();
    const state = ensureState(client);
    state.notes = el('offboardingNotes').value;
    persist();
  });

  el('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset the offboarding checklist for this client back to blank?')) return;
    const client = getClient();
    client.offboarding = { checked: {}, notes: "", startedDate: "" };
    persist();
    render();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  initListeners();
});
