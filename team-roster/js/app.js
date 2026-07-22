/* ============================================================
   TEAM ROSTER & CAPACITY — APP LOGIC
   Agency-wide (not tied to a single client): stores its own list at
   agency/teamRoster, same optimistic-concurrency version-guard pattern
   as Change Order Generator / Subscription Tracker. Unlike Subscription
   Tracker (admin/leadership only, whole page), this one is viewable by
   everyone - same partial-gate model as Email Template Library and SOP
   Wiki: New/Edit/Delete are hidden for restricted teammates, but the
   roster itself (who's on the team, who has room for new client work)
   is useful for anyone doing onboarding/assignment.
   ============================================================ */

let isEmbedded = false;
try {
  if (window.parent && typeof window.parent.firebaseDb === 'object') {
    isEmbedded = true;
  }
} catch (e) {
  console.warn("CORS prevented parent access:", e);
}

let members = [];
let editingId = null;
let docVersion = 0; // optimistic-concurrency guard, see persist() below
let isRestrictedUser = false;

function el(id) { return document.getElementById(id); }

function getDocRef() {
  if (!isEmbedded || !window.parent.firebaseDoc || !window.parent.firebaseDb) return null;
  return window.parent.firebaseDoc(window.parent.firebaseDb, "agency", "teamRoster");
}

async function loadMembers() {
  if (isEmbedded && window.parent.firebaseGetDoc) {
    try {
      const ref = getDocRef();
      const snap = await window.parent.firebaseGetDoc(ref);
      const data = snap && snap.exists ? snap.data() : null;
      members = (data && data.list) || [];
      docVersion = (data && data.version) || 0;
      return;
    } catch (e) {
      console.error("Couldn't load team roster from the cloud:", e);
      if (window.parent.showBanner) window.parent.showBanner('error', "Couldn't load the team roster: " + e.message);
      members = [];
      return;
    }
  }
  try {
    const saved = localStorage.getItem('team-roster-list');
    members = saved ? JSON.parse(saved) : [];
  } catch (e) { members = []; }
}

async function persist() {
  if (isEmbedded && window.parent.firebaseSetDocFromJSON && window.parent.firebaseGetDoc) {
    try {
      const ref = getDocRef();
      const freshSnap = await window.parent.firebaseGetDoc(ref);
      const freshData = freshSnap && freshSnap.exists ? freshSnap.data() : null;
      const freshVersion = (freshData && freshData.version) || 0;

      if (freshVersion !== docVersion) {
        if (window.parent.showBanner) {
          window.parent.showBanner('error', "Someone else updated the roster while you had it open. Reload the page to see their changes, then redo your edit.");
        }
        return false;
      }

      docVersion = freshVersion + 1;
      // A plain object literal built in this iframe's own JS realm gets
      // rejected by Firestore ("a custom Object object") when handed
      // straight to a Firestore call bound to the parent page - pass a
      // JSON string instead so the parent parses it in its own realm.
      await window.parent.firebaseSetDocFromJSON(ref, JSON.stringify({ list: members, version: docVersion }));
      return true;
    } catch (e) {
      console.error("Couldn't save team roster:", e);
      if (window.parent.showBanner) window.parent.showBanner('error', "Couldn't save — your change may be lost: " + e.message);
      return false;
    }
  }
  try { localStorage.setItem('team-roster-list', JSON.stringify(members)); } catch (e) {}
  return true;
}

function uid() { return 'tm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }

const FORM_FIELDS = ['memberName', 'role', 'employmentType', 'email', 'currentClientCount', 'maxClientCount', 'notes'];

function resetForm() {
  editingId = null;
  el('memberName').value = '';
  el('role').value = 'Account Manager';
  el('employmentType').value = 'Full-Time';
  el('email').value = '';
  el('currentClientCount').value = '';
  el('maxClientCount').value = '';
  el('notes').value = '';
  el('formTitle').textContent = 'New Team Member';
  el('saveMemberBtn').textContent = 'Add Team Member';
  el('cancelEditBtn').style.display = 'none';
  el('formCard').style.display = 'none';
}

function gatherForm() {
  const entry = { id: editingId || uid() };
  FORM_FIELDS.forEach(id => {
    const field = el(id);
    if (id === 'currentClientCount' || id === 'maxClientCount') {
      entry[id] = Math.max(0, parseInt(field.value) || 0);
    } else {
      entry[id] = field.value.trim ? field.value.trim() : field.value;
    }
  });
  return entry;
}

function saveMember() {
  const name = el('memberName').value.trim();
  if (!name) {
    if (window.parent.showBanner) window.parent.showBanner('error', 'Give this team member a name first.');
    return;
  }

  const entry = gatherForm();
  if (editingId) {
    const idx = members.findIndex(m => m.id === editingId);
    if (idx >= 0) members[idx] = entry;
  } else {
    members.unshift(entry);
  }

  persist().then(ok => {
    if (!ok) return;
    resetForm();
    renderTable();
    if (window.parent.showBanner) window.parent.showBanner('success', `Saved ${name}.`);
  });
}

function startEdit(id) {
  const entry = members.find(m => m.id === id);
  if (!entry) return;
  editingId = id;
  FORM_FIELDS.forEach(fieldId => { el(fieldId).value = entry[fieldId] || ''; });
  el('formTitle').textContent = 'Edit Team Member';
  el('saveMemberBtn').textContent = 'Update Team Member';
  el('cancelEditBtn').style.display = 'inline-block';
  el('formCard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeMember(id) {
  const entry = members.find(m => m.id === id);
  if (!entry) return;
  if (!confirm(`Remove ${entry.memberName} from the roster?`)) return;
  members = members.filter(m => m.id !== id);
  persist().then(ok => {
    if (!ok) return;
    if (editingId === id) resetForm();
    renderTable();
  });
}

function capacityInfo(entry) {
  const current = parseInt(entry.currentClientCount) || 0;
  const max = parseInt(entry.maxClientCount) || 0;
  if (max <= 0) return { label: '—', cls: 'capacity-unknown' };
  if (current >= max) return { label: 'At Capacity', cls: 'capacity-full' };
  if (current >= max * 0.8) return { label: 'Near Capacity', cls: 'capacity-near' };
  return { label: 'Has Room', cls: 'capacity-room' };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function updateSummary() {
  let hasRoom = 0, nearCapacity = 0, atCapacity = 0;
  members.forEach(m => {
    const info = capacityInfo(m);
    if (info.cls === 'capacity-room') hasRoom++;
    else if (info.cls === 'capacity-near') nearCapacity++;
    else if (info.cls === 'capacity-full') atCapacity++;
  });
  el('summaryTeamCount').textContent = members.length;
  el('summaryHasRoom').textContent = hasRoom;
  el('summaryNearCapacity').textContent = nearCapacity;
  el('summaryAtCapacity').textContent = atCapacity;
}

function renderTable() {
  updateSummary();

  const filter = (el('filterInput').value || '').trim().toLowerCase();
  const rows = members.filter(m => {
    if (!filter) return true;
    return (m.memberName || '').toLowerCase().includes(filter) || (m.role || '').toLowerCase().includes(filter);
  });

  const tbody = el('rosterTableBody');
  el('emptyState').style.display = rows.length === 0 ? 'block' : 'none';

  tbody.innerHTML = rows.map(m => {
    const info = capacityInfo(m);
    const current = parseInt(m.currentClientCount) || 0;
    const max = parseInt(m.maxClientCount) || 0;
    const loadText = max > 0 ? `${current} / ${max}` : (current || '—');
    const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
    const barFillClass = info.cls === 'capacity-unknown' ? '' : info.cls;
    const loadCell = max > 0
      ? `<div class="capacity-bar-cell">
           <div class="capacity-bar-wrap" title="${percent}% of capacity">
             <div class="capacity-bar-fill ${barFillClass}" style="width:${percent}%;"></div>
           </div>
           <span class="capacity-bar-label">${loadText}</span>
         </div>`
      : loadText;
    return `<tr>
      <td class="client-cell">${escapeHtml(m.memberName)}</td>
      <td>${escapeHtml(m.role)}${m.employmentType === 'Contractor' ? ' <span class="section-tag" style="margin-left:4px;">Contractor</span>' : ''}</td>
      <td>${escapeHtml(m.employmentType)}</td>
      <td>${loadCell}</td>
      <td><span class="section-tag ${info.cls}">${info.label}</span></td>
      <td>${escapeHtml(m.notes) || '—'}</td>
      <td class="roster-actions-cell" style="display:${isRestrictedUser ? 'none' : ''};">
        <div class="row-actions">
          <button class="edit-btn" data-id="${m.id}">Edit</button>
          <button class="remove-btn" data-id="${m.id}">Remove</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => startEdit(btn.getAttribute('data-id'))));
  tbody.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', () => removeMember(btn.getAttribute('data-id'))));
}

// Same partial gate as Email Template Library/SOP Wiki: everyone can view
// the roster (useful for anyone assigning new client work), but only
// admin/leadership can add, edit, or remove team members.
function applyEditPermission() {
  if (!window.parent || !window.parent.firebaseDoc || !window.parent.firebaseDb || !window.parent.firebaseOnSnapshot) return;
  const ref = window.parent.firebaseDoc(window.parent.firebaseDb, "agency", "teamAccess");
  window.parent.firebaseOnSnapshot(ref, (docSnap) => {
    const data = docSnap && docSnap.exists ? docSnap.data() : null;
    const users = (data && data.users) ? data.users : {};
    const currentEmail = (window.parent.currentAdminEmail || "").toLowerCase();
    isRestrictedUser = !!(currentEmail && Object.prototype.hasOwnProperty.call(users, currentEmail));

    el('newMemberBtn').style.display = isRestrictedUser ? 'none' : '';
    el('actionsHeader').style.display = isRestrictedUser ? 'none' : '';
    if (isRestrictedUser) el('formCard').style.display = 'none';
    renderTable();
  }, (err) => {
    console.error("Edit-permission listener error:", err);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  applyEditPermission();
  resetForm();
  await loadMembers();
  renderTable();

  el('newMemberBtn').addEventListener('click', () => {
    resetForm();
    el('formCard').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  el('saveMemberBtn').addEventListener('click', saveMember);
  el('cancelEditBtn').addEventListener('click', resetForm);
  el('filterInput').addEventListener('input', renderTable);
});
