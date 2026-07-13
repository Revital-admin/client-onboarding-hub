/* ============================================================
   CLIENT INTAKE PRE-QUALIFIER — APP LOGIC
   ============================================================ */

let isEmbedded = false;
let parentClient = null;
try {
  if (window.parent && typeof window.parent.getActiveClient === 'function') {
    isEmbedded = true;
    parentClient = window.parent.getActiveClient();
  }
} catch (e) {
  console.warn("CORS prevented parent access:", e);
}

const SELECT_FIELDS = ['leadSource', 'budgetRange', 'businessAge', 'previousAgencyExperience', 'decisionMakerOnCall', 'timelineToStart', 'socialMediaPresence', 'websiteQuality'];
const TEXT_FIELDS = ['companyName', 'contactName', 'notes'];

// Point values per selection. Budget, timeline and decision authority are
// weighted heaviest since they're the hardest blockers to work around.
const SCORES = {
  budgetRange: { under1k: 0, '1k_2k': 1, '2k_3.5k': 2, '3.5k_5k': 3, '5k_plus': 3, unknown: 1, refused: 0 },
  timelineToStart: { immediately: 3, '1to3': 2, '3to6': 1, exploring: 0, unknown: 1 },
  decisionMakerOnCall: { yes_sole: 3, yes_partner: 2, no_gathering: 0 },
  businessAge: { lt1: 0, '1to3': 1, '3to5': 2, '5plus': 2 },
  previousAgencyExperience: { no: 1, yes_positive: 2, yes_negative: 0, multiple_negative: -1 },
  socialMediaPresence: { strong: 2, inconsistent: 1, minimal: 1, none: 0 },
  websiteQuality: { professional: 2, outdated: 1, poor: 0 }
};

const RED_FLAG_RULES = [
  { field: 'budgetRange', value: 'under1k', text: 'Budget under $1,000/mo — may not support meaningful results.' },
  { field: 'budgetRange', value: 'refused', text: 'Refused to share budget — proceed carefully.' },
  { field: 'timelineToStart', value: 'exploring', text: 'No real timeline — may just be browsing.' },
  { field: 'timelineToStart', value: 'unknown', text: 'Timeline unknown — confirm urgency on the call.' },
  { field: 'decisionMakerOnCall', value: 'no_gathering', text: 'Not speaking with the decision maker — info may not reach the right person.' },
  { field: 'previousAgencyExperience', value: 'multiple_negative', text: 'Multiple negative agency experiences — high trust-rebuilding required.' },
  { field: 'previousAgencyExperience', value: 'yes_negative', text: 'Had a negative agency experience — address this directly on the call.' },
  { field: 'businessAge', value: 'lt1', text: 'Business is less than 1 year old — may have limited budget stability.' },
  { field: 'websiteQuality', value: 'poor', text: 'Website is poor or missing — may need to budget for a website project alongside marketing.' }
];

let state = {
  companyName: '', contactName: '', leadSource: '',
  servicesInquired: [],
  budgetRange: '', businessAge: '', previousAgencyExperience: '', decisionMakerOnCall: '', timelineToStart: '',
  socialMediaPresence: '', websiteQuality: '', notes: ''
};

function el(id) { return document.getElementById(id); }

function initState() {
  if (isEmbedded && parentClient) {
    if (!parentClient.intakeQualifier) parentClient.intakeQualifier = { data: {} };
    if (!parentClient.intakeQualifier.data) parentClient.intakeQualifier.data = {};
    state = Object.assign({}, state, parentClient.intakeQualifier.data);
    if (!Array.isArray(state.servicesInquired)) state.servicesInquired = [];
  } else {
    try {
      const saved = localStorage.getItem('intake-prequalifier-state');
      if (saved) state = Object.assign({}, state, JSON.parse(saved));
      if (!Array.isArray(state.servicesInquired)) state.servicesInquired = [];
    } catch (e) {}
  }
}

function saveState() {
  if (isEmbedded && parentClient) {
    parentClient.intakeQualifier.data = state;
    window.parent.saveDatabase();
  } else {
    try { localStorage.setItem('intake-prequalifier-state', JSON.stringify(state)); } catch (e) {}
  }
}

function applyStateToForm() {
  TEXT_FIELDS.forEach(id => { el(id).value = state[id] || ''; });
  SELECT_FIELDS.forEach(id => { el(id).value = state[id] || ''; });
  document.querySelectorAll('#servicesInquiredGroup input[type="checkbox"]').forEach(cb => {
    cb.checked = state.servicesInquired.includes(cb.value);
  });
}

function readFormIntoState() {
  TEXT_FIELDS.forEach(id => { state[id] = el(id).value; });
  SELECT_FIELDS.forEach(id => { state[id] = el(id).value; });
  state.servicesInquired = Array.from(document.querySelectorAll('#servicesInquiredGroup input[type="checkbox"]:checked')).map(cb => cb.value);
}

function computeScore() {
  let total = 0;
  Object.keys(SCORES).forEach(field => {
    const val = state[field];
    if (val && SCORES[field][val] !== undefined) total += SCORES[field][val];
  });
  return total;
}

function computeRedFlags() {
  return RED_FLAG_RULES.filter(rule => state[rule.field] === rule.value).map(rule => rule.text);
}

function hasAnyCoreAnswer() {
  return !!(state.budgetRange || state.timelineToStart || state.decisionMakerOnCall || state.businessAge || state.previousAgencyExperience || state.socialMediaPresence || state.websiteQuality);
}

function renderScore() {
  const card = el('fitScoreCard');
  const emojiEl = el('fitScoreEmoji');
  const numberEl = el('fitScoreNumber');
  const labelEl = el('fitScoreLabel');
  const noteEl = el('fitScoreNote');

  if (!hasAnyCoreAnswer()) {
    card.className = 'fit-score-card fit-score-unknown';
    emojiEl.textContent = '⚪';
    numberEl.textContent = '--';
    labelEl.textContent = 'Fill in the core qualifiers';
    noteEl.textContent = 'Score updates live as you fill in the form.';
  } else {
    const total = computeScore();
    let emoji, label, note, cls;
    if (total >= 11) { emoji = '🟢'; label = 'STRONG FIT'; note = 'Priority lead. Move fast.'; cls = 'fit-score-good'; }
    else if (total >= 6) { emoji = '🟡'; label = 'POSSIBLE FIT'; note = 'Proceed with caution. Address red flags on the call.'; cls = 'fit-score-maybe'; }
    else { emoji = '🔴'; label = 'NOT A FIT'; note = 'Do not pursue. Decline gracefully.'; cls = 'fit-score-poor'; }

    card.className = 'fit-score-card ' + cls;
    emojiEl.textContent = emoji;
    numberEl.textContent = total;
    labelEl.textContent = label;
    noteEl.textContent = note;
  }

  const flags = computeRedFlags();
  const list = el('redFlagsList');
  list.innerHTML = '';
  if (flags.length === 0) {
    const li = document.createElement('li');
    li.className = 'redflags-empty';
    li.textContent = 'No red flags detected yet.';
    list.appendChild(li);
  } else {
    flags.forEach(text => {
      const li = document.createElement('li');
      li.textContent = '🚩 ' + text;
      list.appendChild(li);
    });
  }
}

function onAnyFieldChange() {
  readFormIntoState();
  saveState();
  renderScore();
}

function initListeners() {
  TEXT_FIELDS.forEach(id => { el(id).addEventListener('input', onAnyFieldChange); });
  SELECT_FIELDS.forEach(id => { el(id).addEventListener('change', onAnyFieldChange); });
  document.querySelectorAll('#servicesInquiredGroup input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', onAnyFieldChange);
  });

  const openBtn = el('openProposalBtn');
  if (openBtn) openBtn.addEventListener('click', openProposalCalculator);
}

function openProposalCalculator() {
  if (!isEmbedded || !parentClient) {
    if (window.alert) alert('Open this from within a client workspace to hand off to the Proposal Calculator.');
    return;
  }

  if (!parentClient.proposal) parentClient.proposal = {};
  if (state.companyName) parentClient.proposal.clientName = state.companyName;
  if (state.contactName) parentClient.proposal.contactName = state.contactName;
  window.parent.saveDatabase();

  const total = computeScore();
  let label = 'NOT A FIT';
  if (total >= 11) label = 'STRONG FIT 🟢';
  else if (total >= 6) label = 'POSSIBLE FIT 🟡';
  else label = 'NOT A FIT 🔴';

  if (window.parent.showBanner) {
    window.parent.showBanner('success', `Pre-Qualifier score: ${total} (${label}). Client & contact name sent to Proposal Calculator.`);
  }
  if (window.parent.navigateToTab) {
    window.parent.navigateToTab('tab-proposal');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  applyStateToForm();
  renderScore();
  initListeners();
});
