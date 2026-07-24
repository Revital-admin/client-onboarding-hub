/* ============================================================
   MOOD BOARD BUILDER — APP LOGIC
   Per-client, own client-select dropdown (same pattern as Brand
   Asset Kit) rather than the global "active client" - lets you jump
   between clients' mood boards without switching what's active
   elsewhere in the Hub. Data lives at clients[name].moodBoards, an
   array of board objects, saved through the parent Hub's own
   clientsDb + saveDatabase() (same mechanism as Brand Asset Kit).
   Boards marked "shared with client" render in their Portal.
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

function el(id) { return document.getElementById(id); }

function getClients() {
  if (isEmbedded) {
    try { return window.parent.getAllClients() || {}; } catch (e) { return {}; }
  }
  return {};
}

function persist() {
  if (isEmbedded) window.parent.saveDatabase();
}

function populateClientSelect() {
  const clients = getClients();
  const select = el('clientSelect');
  const prevValue = select.value;
  select.innerHTML = '<option value="">Select a client...</option>';
  Object.keys(clients).sort().forEach(name => {
    if (name === SANDBOX_NAME) return;
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  if (prevValue && clients[prevValue]) select.value = prevValue;
}

let editingBoardId = null;
let draftEmbedLinks = [];

function uid() { return 'mb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }

function currentClientName() { return el('clientSelect').value; }

function currentClient() {
  const name = currentClientName();
  if (!name) return null;
  const clients = getClients();
  return clients[name] || null;
}

function resetForm() {
  editingBoardId = null;
  draftEmbedLinks = [];
  el('mbTitle').value = '';
  el('mbCategory').value = 'Website Design';
  el('mbIdeaSummary').value = '';
  el('mbVisualDirection').value = '';
  el('mbKeyElements').value = '';
  el('mbShared').checked = false;
  el('embedLabel').value = '';
  el('embedUrl').value = '';
  renderEmbedLinksList();
  el('formTitle').textContent = 'New Mood Board';
  el('saveBoardBtn').textContent = 'Save Mood Board';
  el('cancelEditBtn').style.display = 'none';
}

function addDraftEmbedLink() {
  const label = el('embedLabel').value.trim();
  const url = el('embedUrl').value.trim();
  if (!url) {
    if (isEmbedded && window.parent.showBanner) window.parent.showBanner('error', 'Enter a URL for this reference link.');
    return;
  }
  draftEmbedLinks.push({ id: uid(), label: label || url, url });
  el('embedLabel').value = '';
  el('embedUrl').value = '';
  renderEmbedLinksList();
}

let imageDropCounter = 0;

// Dropping/uploading an image adds it straight to the reference list as
// a thumbnail - no need to also fill in the label/URL fields and click
// "+ Add Link" separately. Stored as a compressed data URL (see
// shared-dropzone.js) so it lives inline in the client doc, same as
// Client Portal Manager's logo.
function handleDroppedImage(file) {
  processImageFile(file, { maxWidth: 800 }).then(dataUrl => {
    imageDropCounter++;
    const label = (file.name || `Image ${imageDropCounter}`).replace(/\.[^.]+$/, '');
    draftEmbedLinks.push({ id: uid(), label, url: dataUrl, isImage: true });
    renderEmbedLinksList();
    if (isEmbedded && window.parent.showBanner) window.parent.showBanner('success', `Added "${label}" as a reference image.`);
  }).catch(errMsg => {
    if (isEmbedded && window.parent.showBanner) window.parent.showBanner('error', errMsg);
  });
}

function removeDraftEmbedLink(id) {
  draftEmbedLinks = draftEmbedLinks.filter(l => l.id !== id);
  renderEmbedLinksList();
}

function renderEmbedLinksList() {
  const list = el('embedLinksList');
  if (draftEmbedLinks.length === 0) {
    list.innerHTML = '<p style="color:var(--color-text-secondary); font-size:13px; margin:0;">No reference links added yet.</p>';
    return;
  }
  list.innerHTML = draftEmbedLinks.map(l => {
    const isImage = l.isImage || (l.url || '').startsWith('data:image');
    const main = isImage
      ? `<img class="embed-thumb" src="${l.url}" alt=""><span><strong>${escapeHtml(l.label)}</strong> — uploaded image</span>`
      : `<span><strong>${escapeHtml(l.label)}</strong> — ${escapeHtml(l.url)}</span>`;
    return `
    <li class="embed-link-chip">
      <div class="embed-link-main">${main}</div>
      <button data-id="${l.id}" class="remove-embed-btn">✕</button>
    </li>
  `;
  }).join('');
  document.querySelectorAll('.remove-embed-btn').forEach(btn => {
    btn.addEventListener('click', () => removeDraftEmbedLink(btn.getAttribute('data-id')));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function saveBoard() {
  const client = currentClient();
  if (!client) return;

  const title = el('mbTitle').value.trim();
  if (!title) {
    if (isEmbedded && window.parent.showBanner) window.parent.showBanner('error', 'Give this mood board a title first.');
    return;
  }

  if (!Array.isArray(client.moodBoards)) client.moodBoards = [];

  const board = {
    id: editingBoardId || uid(),
    title,
    category: el('mbCategory').value,
    ideaSummary: el('mbIdeaSummary').value.trim(),
    visualDirection: el('mbVisualDirection').value.trim(),
    keyElements: el('mbKeyElements').value.trim(),
    embedLinks: draftEmbedLinks,
    sharedWithClient: el('mbShared').checked,
    createdDate: editingBoardId
      ? (client.moodBoards.find(b => b.id === editingBoardId) || {}).createdDate || new Date().toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  };

  if (editingBoardId) {
    const idx = client.moodBoards.findIndex(b => b.id === editingBoardId);
    if (idx >= 0) client.moodBoards[idx] = board;
  } else {
    client.moodBoards.unshift(board);
  }

  persist();
  resetForm();
  renderBoardsList();

  if (isEmbedded && window.parent.showBanner) {
    window.parent.showBanner('success', `Saved mood board "${title}".`);
  }
}

function startEditBoard(id) {
  const client = currentClient();
  if (!client) return;
  const board = (client.moodBoards || []).find(b => b.id === id);
  if (!board) return;

  editingBoardId = id;
  el('mbTitle').value = board.title || '';
  el('mbCategory').value = board.category || 'Website Design';
  el('mbIdeaSummary').value = board.ideaSummary || '';
  el('mbVisualDirection').value = board.visualDirection || '';
  el('mbKeyElements').value = board.keyElements || '';
  el('mbShared').checked = !!board.sharedWithClient;
  draftEmbedLinks = (board.embedLinks || []).map(l => ({ ...l }));
  renderEmbedLinksList();

  el('formTitle').textContent = 'Edit Mood Board';
  el('saveBoardBtn').textContent = 'Update Mood Board';
  el('cancelEditBtn').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeBoard(id) {
  const client = currentClient();
  if (!client) return;
  const board = (client.moodBoards || []).find(b => b.id === id);
  if (!board) return;
  if (!confirm(`Delete the mood board "${board.title}"? This can't be undone.`)) return;
  client.moodBoards = (client.moodBoards || []).filter(b => b.id !== id);
  persist();
  if (editingBoardId === id) resetForm();
  renderBoardsList();
}

function toggleShare(id) {
  const client = currentClient();
  if (!client) return;
  const board = (client.moodBoards || []).find(b => b.id === id);
  if (!board) return;
  board.sharedWithClient = !board.sharedWithClient;
  persist();
  renderBoardsList();
  if (isEmbedded && window.parent.showBanner) {
    window.parent.showBanner('success', board.sharedWithClient ? `"${board.title}" is now visible in the client's Portal.` : `"${board.title}" is now hidden from the client.`);
  }
}

function renderBoardsList() {
  const client = currentClient();
  const container = el('boardsList');
  const boards = client && Array.isArray(client.moodBoards) ? client.moodBoards : [];

  el('boardsEmptyState').style.display = boards.length === 0 ? 'block' : 'none';
  container.innerHTML = boards.map(board => `
    <div class="board-card">
      <div class="board-card-header">
        <div>
          <strong>${escapeHtml(board.title)}</strong>
          <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
            <span class="board-category-badge">${escapeHtml(board.category || 'Other')}</span>
            ${board.sharedWithClient ? '<span class="board-shared-badge">Shared with client</span>' : ''}
          </div>
        </div>
        <div class="board-actions">
          <button class="share-board-btn" data-id="${board.id}">${board.sharedWithClient ? 'Unshare' : 'Share with Client'}</button>
          <button class="edit-board-btn" data-id="${board.id}">Edit</button>
          <button class="remove-board-btn" data-id="${board.id}">Delete</button>
        </div>
      </div>
      ${board.ideaSummary ? `<p style="margin:12px 0 0; font-size:13px; color:var(--color-text-secondary);">${escapeHtml(board.ideaSummary)}</p>` : ''}
      ${(board.embedLinks || []).length ? `<p style="margin:8px 0 0; font-size:12px; color:var(--color-text-secondary);">${board.embedLinks.length} reference link${board.embedLinks.length === 1 ? '' : 's'}</p>` : ''}
    </div>
  `).join('');

  document.querySelectorAll('.edit-board-btn').forEach(btn => btn.addEventListener('click', () => startEditBoard(btn.getAttribute('data-id'))));
  document.querySelectorAll('.remove-board-btn').forEach(btn => btn.addEventListener('click', () => removeBoard(btn.getAttribute('data-id'))));
  document.querySelectorAll('.share-board-btn').forEach(btn => btn.addEventListener('click', () => toggleShare(btn.getAttribute('data-id'))));
}

function renderState() {
  const clientName = currentClientName();
  if (!clientName) {
    el('emptyState').style.display = 'flex';
    el('moodBoardInterface').style.display = 'none';
    return;
  }
  el('emptyState').style.display = 'none';
  el('moodBoardInterface').style.display = 'block';
  resetForm();
  renderBoardsList();
}

document.addEventListener('DOMContentLoaded', () => {
  populateClientSelect();
  el('clientSelect').addEventListener('change', renderState);
  el('saveBoardBtn').addEventListener('click', saveBoard);
  el('cancelEditBtn').addEventListener('click', resetForm);
  el('addEmbedBtn').addEventListener('click', addDraftEmbedLink);
  wireDropZone(el('imageDropZone'), el('imageFileInput'), handleDroppedImage);

  // Same iframe-race fix used across the other client-aware modules: the
  // parent Hub's client database loads asynchronously, so poll briefly
  // and re-populate the dropdown once real data shows up.
  let clientPollAttempts = 0;
  const clientPoll = setInterval(() => {
    clientPollAttempts++;
    const hasClients = Object.keys(getClients()).length > 0;
    if (hasClients || clientPollAttempts > 30) {
      clearInterval(clientPoll);
      if (hasClients) populateClientSelect();
    }
  }, 250);
});
