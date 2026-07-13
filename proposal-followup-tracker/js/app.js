/* ============================================================
   PROPOSAL FOLLOW-UP SEQUENCE TRACKER — APP LOGIC
   (cross-client: reads/writes every client's proposalFollowUp record)
   ============================================================ */

let isEmbedded = false;
try {
  if (window.parent && typeof window.parent.getAllClients === 'function') {
    isEmbedded = true;
  }
} catch (e) {
  console.warn("CORS prevented parent access:", e);
}

const SANDBOX_NAME = "Quick Sandbox (One-Offs)";
const STAGE_SEQUENCE = ['Sent', 'Day 3 Sent', 'Day 7 Sent', 'Day 12 Sent'];
const ALL_STAGES = ['Sent', 'Day 3 Sent', 'Day 7 Sent', 'Day 12 Sent', 'Closed Won', 'Closed Lost', 'Expired'];
const EXPIRY_DAYS = 14;

function el(id) { return document.getElementById(id); }

function getClients() {
  if (isEmbedded) {
    try { return window.parent.getAllClients() || {}; } catch (e) { return {}; }
  }
  try {
    const saved = localStorage.getItem('proposal-followup-tracker-clients');
    return saved ? JSON.parse(saved) : {};
  } catch (e) { return {}; }
}

function persist() {
  if (isEmbedded) {
    window.parent.saveDatabase();
  } else {
    try { localStorage.setItem('proposal-followup-tracker-clients', JSON.stringify(getClients())); } catch (e) {}
  }
}

function toDateOnly(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(dateStr, days) {
  const dt = toDateOnly(dateStr);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

function todayStr() {
  return toDateOnly(new Date()).toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStrVal) {
  const from = toDateOnly(fromStr);
  const to = toDateOnly(toStrVal);
  return Math.round((to - from) / 86400000);
}

// Sweep every client's tracked proposal and flip stale "open" rows to
// Expired once the window has passed, so the stage reflects reality
// without the AM having to notice and update it manually.
function reconcileExpiredRows(clients) {
  let changed = false;
  Object.keys(clients).forEach(name => {
    const fu = clients[name].proposalFollowUp;
    if (!fu || fu.status !== 'open') return;
    const expiryDate = addDays(fu.proposalSentDate, EXPIRY_DAYS);
    if (daysBetween(expiryDate, todayStr()) > 0 && STAGE_SEQUENCE.includes(fu.followUpStage)) {
      fu.followUpStage = 'Expired';
      changed = true;
    }
  });
  return changed;
}

function getUrgency(fu) {
  if (fu.status !== 'open') return 'closed';
  const expiryDate = addDays(fu.proposalSentDate, EXPIRY_DAYS);
  const daysToExpiry = daysBetween(todayStr(), expiryDate);
  const daysOverdueFollowUp = fu.nextFollowUpDate ? daysBetween(fu.nextFollowUpDate, todayStr()) : 0;

  if (daysOverdueFollowUp >= 3 || daysToExpiry <= 2) return 'red';
  if (daysOverdueFollowUp >= 1) return 'yellow';
  return 'green';
}

function populateClientSelect() {
  const clients = getClients();
  const select = el('newClientSelect');
  select.innerHTML = '<option value="">Select a client to track...</option>';
  Object.keys(clients).sort().forEach(name => {
    if (name === SANDBOX_NAME) return;
    const fu = clients[name].proposalFollowUp;
    if (fu && fu.status === 'open') return; // already being tracked
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function renderSummary(rows) {
  const openRows = rows.filter(r => r.fu.status === 'open');
  const expiringThisWeek = openRows.filter(r => {
    const expiryDate = addDays(r.fu.proposalSentDate, EXPIRY_DAYS);
    const d = daysBetween(todayStr(), expiryDate);
    return d >= 0 && d <= 7;
  });
  const overdue = openRows.filter(r => {
    if (!r.fu.nextFollowUpDate) return false;
    return daysBetween(r.fu.nextFollowUpDate, todayStr()) >= 1;
  });

  el('summaryOpen').textContent = openRows.length;
  el('summaryExpiring').textContent = expiringThisWeek.length;
  el('summaryOverdue').textContent = overdue.length;
}

function stageOptionsHtml(selected) {
  return ALL_STAGES.map(s => `<option value="${s}" ${s === selected ? 'selected' : ''}>${s}</option>`).join('');
}

function renderTable() {
  const clients = getClients();
  const changed = reconcileExpiredRows(clients);
  if (changed) persist();

  const showClosed = el('showClosedToggle').checked;

  const rows = Object.keys(clients)
    .filter(name => clients[name].proposalFollowUp)
    .map(name => ({ name, fu: clients[name].proposalFollowUp }))
    .filter(r => showClosed || r.fu.status === 'open')
    .sort((a, b) => {
      if (a.fu.status !== b.fu.status) return a.fu.status === 'open' ? -1 : 1;
      return (a.fu.nextFollowUpDate || '9999').localeCompare(b.fu.nextFollowUpDate || '9999');
    });

  renderSummary(Object.keys(clients).filter(n => clients[n].proposalFollowUp).map(n => ({ name: n, fu: clients[n].proposalFollowUp })));

  const tbody = el('trackerTableBody');
  tbody.innerHTML = '';
  el('emptyState').style.display = rows.length === 0 ? 'block' : 'none';

  rows.forEach(row => {
    const { name, fu } = row;
    const expiryDate = addDays(fu.proposalSentDate, EXPIRY_DAYS);
    const urgency = getUrgency(fu);
    const tr = document.createElement('tr');
    tr.className = 'urgency-' + urgency;

    tr.innerHTML = `
      <td class="client-cell">${name}</td>
      <td class="date-cell">${fu.proposalSentDate || '--'}</td>
      <td class="date-cell">${expiryDate}</td>
      <td><select class="stage-select" data-client="${name}">${stageOptionsHtml(fu.followUpStage)}</select></td>
      <td class="date-cell">${fu.lastContactDate || '--'}</td>
      <td class="date-cell">${fu.nextFollowUpDate || '--'}</td>
      <td><input type="text" class="notes-input" data-client="${name}" value="${(fu.notes || '').replace(/"/g, '&quot;')}" placeholder="Notes..."></td>
      <td>
        <div class="row-actions">
          <button class="log-followup-btn" data-client="${name}" ${fu.status !== 'open' ? 'disabled' : ''}>Log Follow-Up</button>
          <button class="win-btn" data-client="${name}" ${fu.status !== 'open' ? 'disabled' : ''}>Mark as Won</button>
          <button class="lose-btn" data-client="${name}" ${fu.status !== 'open' ? 'disabled' : ''}>Mark as Lost</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  wireRowListeners();
}

function wireRowListeners() {
  document.querySelectorAll('.stage-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const clients = getClients();
      const fu = clients[sel.getAttribute('data-client')].proposalFollowUp;
      fu.followUpStage = sel.value;
      if (sel.value === 'Closed Won') fu.status = 'won';
      else if (sel.value === 'Closed Lost') fu.status = 'lost';
      else if (STAGE_SEQUENCE.includes(sel.value)) fu.status = 'open';
      persist();
      renderTable();
      populateClientSelect();
    });
  });

  document.querySelectorAll('.notes-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const clients = getClients();
      clients[inp.getAttribute('data-client')].proposalFollowUp.notes = inp.value;
      persist();
    });
  });

  document.querySelectorAll('.log-followup-btn').forEach(btn => {
    btn.addEventListener('click', () => logFollowUp(btn.getAttribute('data-client')));
  });
  document.querySelectorAll('.win-btn').forEach(btn => {
    btn.addEventListener('click', () => closeProposal(btn.getAttribute('data-client'), 'won'));
  });
  document.querySelectorAll('.lose-btn').forEach(btn => {
    btn.addEventListener('click', () => closeProposal(btn.getAttribute('data-client'), 'lost'));
  });
}

function logFollowUp(clientName) {
  const clients = getClients();
  const fu = clients[clientName].proposalFollowUp;
  if (!fu || fu.status !== 'open') return;

  const today = todayStr();
  fu.lastContactDate = today;

  const idx = STAGE_SEQUENCE.indexOf(fu.followUpStage);
  const nextStageMap = { 'Sent': 7, 'Day 3 Sent': 12, 'Day 7 Sent': 14 };

  if (idx >= 0 && idx < STAGE_SEQUENCE.length - 1) {
    fu.followUpStage = STAGE_SEQUENCE[idx + 1];
    fu.nextFollowUpDate = addDays(fu.proposalSentDate, nextStageMap[STAGE_SEQUENCE[idx]] || (idx + 1) * 3 + 3);
  } else {
    // Already at the last active stage (Day 12 Sent) - final checkpoint is the expiry date itself.
    fu.nextFollowUpDate = addDays(fu.proposalSentDate, EXPIRY_DAYS);
  }

  persist();
  renderTable();

  if (isEmbedded && window.parent.showBanner) {
    window.parent.showBanner('success', `Logged follow-up for ${clientName} — now at "${fu.followUpStage}".`);
  }
}

function closeProposal(clientName, outcome) {
  const clients = getClients();
  const fu = clients[clientName].proposalFollowUp;
  if (!fu) return;
  fu.status = outcome;
  fu.followUpStage = outcome === 'won' ? 'Closed Won' : 'Closed Lost';
  persist();
  renderTable();
  populateClientSelect();

  if (isEmbedded && window.parent.showBanner) {
    window.parent.showBanner('success', `Marked ${clientName} as ${outcome === 'won' ? 'Won 🎉' : 'Lost'}.`);
  }
}

function addTrackedProposal() {
  const select = el('newClientSelect');
  const dateInput = el('newSentDate');
  const clientName = select.value;
  if (!clientName) {
    if (isEmbedded && window.parent.showBanner) window.parent.showBanner('error', 'Choose a client first.');
    return;
  }
  const sentDate = dateInput.value || todayStr();

  const clients = getClients();
  if (!clients[clientName]) return;

  clients[clientName].proposalFollowUp = {
    status: 'open',
    proposalSentDate: sentDate,
    followUpStage: 'Sent',
    lastContactDate: sentDate,
    nextFollowUpDate: addDays(sentDate, 3),
    notes: ''
  };

  persist();
  select.value = '';
  dateInput.value = '';
  populateClientSelect();
  renderTable();

  if (isEmbedded && window.parent.showBanner) {
    window.parent.showBanner('success', `Now tracking a proposal for ${clientName}.`);
  }
}

function initListeners() {
  el('addTrackedProposalBtn').addEventListener('click', addTrackedProposal);
  el('showClosedToggle').addEventListener('change', renderTable);
}

document.addEventListener('DOMContentLoaded', () => {
  populateClientSelect();
  renderTable();
  initListeners();
});
