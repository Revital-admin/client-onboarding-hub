/* ============================================================
   RED FLAG CHECKLIST — APP LOGIC
   Active-client pattern (like Creative Brief Generator, Content Strategy
   Builder): window.parent.getActiveClient() returns clientsDb[activeClient]
   by reference, this tool mutates client.redFlagChecklist directly, then
   window.parent.saveDatabase() persists it. The iframe gets a hard reload
   whenever the active client changes (see setIframeAbsoluteSrc in root
   app.js), so DOMContentLoaded always sees the right client fresh.
   ============================================================ */

let isEmbedded = false;
let parentClient = null;
try {
  if (window.parent && typeof window.parent.getActiveClient === 'function') {
    isEmbedded = true;
    parentClient = window.parent.getActiveClient();
  }
} catch (e) {
  console.log("Embedded check bypassed due to CORS");
}

function el(id) { return document.getElementById(id); }

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getChecklistState() {
  if (!parentClient.redFlagChecklist) {
    parentClient.redFlagChecklist = { items: {}, reviewedBy: "", reviewedDate: "" };
  }
  if (!parentClient.redFlagChecklist.items) {
    parentClient.redFlagChecklist.items = {};
  }
  return parentClient.redFlagChecklist;
}

function getItemState(key) {
  const state = getChecklistState();
  if (!state.items[key]) {
    state.items[key] = { flagged: false, notes: "" };
  }
  return state.items[key];
}

function updateFlagBanner() {
  const state = getChecklistState();
  const flaggedItems = RED_FLAG_ITEMS.filter(item => (state.items[item.key] || {}).flagged);
  const banner = el('flagSummaryBanner');
  const text = el('flagSummaryText');
  if (flaggedItems.length > 0) {
    banner.style.display = 'flex';
    text.textContent = `${flaggedItems.length} flag${flaggedItems.length === 1 ? '' : 's'} found (${flaggedItems.map(i => i.label).join(', ')}) — notify leadership before proceeding.`;
  } else {
    banner.style.display = 'none';
  }
}

function renderChecklist() {
  const container = el('checklistItems');
  container.innerHTML = '';

  RED_FLAG_ITEMS.forEach(item => {
    const itemState = getItemState(item.key);

    const row = document.createElement('div');
    row.className = 'rf-item' + (itemState.flagged ? ' is-flagged' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'rf-item-checkbox';
    checkbox.checked = !!itemState.flagged;
    checkbox.title = 'Flag this as a concern';

    const body = document.createElement('div');
    body.className = 'rf-item-body';

    const label = document.createElement('div');
    label.className = 'rf-item-label';
    label.textContent = item.label;

    const hint = document.createElement('div');
    hint.className = 'rf-item-hint';
    hint.textContent = item.hint;

    const notes = document.createElement('textarea');
    notes.className = 'rf-item-notes';
    notes.placeholder = 'Notes (optional unless flagged)...';
    notes.value = itemState.notes || '';

    checkbox.addEventListener('change', () => {
      itemState.flagged = checkbox.checked;
      row.classList.toggle('is-flagged', itemState.flagged);
      label.classList.toggle('is-flagged', itemState.flagged);
      updateFlagBanner();
    });

    notes.addEventListener('input', () => {
      itemState.notes = notes.value;
    });

    body.appendChild(label);
    body.appendChild(hint);
    body.appendChild(notes);

    row.appendChild(checkbox);
    row.appendChild(body);
    container.appendChild(row);
  });

  updateFlagBanner();
}

function showSaveStatus(message, type) {
  const status = el('saveStatus');
  status.textContent = message;
  status.className = 'save-status' + (type ? ' ' + type : '');
  if (message) {
    setTimeout(() => {
      status.textContent = '';
      status.className = 'save-status';
    }, 3500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isEmbedded || !parentClient) {
    el('noClientState').style.display = '';
    el('checklistInterface').style.display = 'none';
    return;
  }

  el('noClientState').style.display = 'none';
  el('checklistInterface').style.display = '';

  const state = getChecklistState();
  el('reviewedBy').value = state.reviewedBy || '';
  el('reviewedDate').value = state.reviewedDate || todayStr();

  renderChecklist();

  el('saveChecklistBtn').addEventListener('click', () => {
    const state = getChecklistState();
    state.reviewedBy = el('reviewedBy').value.trim();
    state.reviewedDate = el('reviewedDate').value || todayStr();

    if (window.parent && typeof window.parent.saveDatabase === 'function') {
      window.parent.saveDatabase();
      showSaveStatus('Saved.', 'success');
      if (window.parent.showBanner) {
        const flaggedCount = RED_FLAG_ITEMS.filter(item => (state.items[item.key] || {}).flagged).length;
        window.parent.showBanner(
          flaggedCount > 0 ? 'error' : 'success',
          flaggedCount > 0
            ? `Red flag review saved for ${parentClient.name} — ${flaggedCount} flag(s) found. Notify leadership before proceeding.`
            : `Red flag review saved for ${parentClient.name} — no flags found.`
        );
      }
    } else {
      showSaveStatus("Couldn't reach the Hub's database.", 'error');
    }
  });
});
