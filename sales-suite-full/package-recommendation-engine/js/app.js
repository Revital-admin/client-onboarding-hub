/* ============================================================
   PACKAGE RECOMMENDATION ENGINE — APP LOGIC
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

const SELECT_FIELDS = ['q1Budget', 'q2Goal', 'q4Assets', 'q5Timeline', 'q6BusinessType'];
const TEXT_FIELDS = ['companyName', 'contactName'];

const BUDGET_INFO = {
  under1k: { label: 'Under $1,000', pkg: 'Starter', low: 800, high: 1000, retainerLabel: 'Under $1,000/mo (confirm this meets our minimum engagement)' },
  '1k_2k': { label: '$1,000-$2,000', pkg: 'Starter', low: 1000, high: 2000, retainerLabel: '$1,000-$2,000/mo' },
  '2k_3.5k': { label: '$2,000-$3,500', pkg: 'Professional', low: 2000, high: 3500, retainerLabel: '$2,000-$3,500/mo' },
  '3.5k_5k': { label: '$3,500-$5,000', pkg: 'Professional', low: 3500, high: 5000, retainerLabel: '$3,500-$5,000/mo' },
  '5k_plus': { label: '$5,000+', pkg: 'Elite', low: 5000, high: 7500, retainerLabel: '$5,000+/mo' },
  unknown: { label: 'Unknown', pkg: 'Professional', low: 2000, high: 3500, retainerLabel: '$2,000-$3,500/mo (estimated — confirm budget)' },
  refused: { label: 'refused to share', pkg: 'Professional', low: 2000, high: 3500, retainerLabel: '$2,000-$3,500/mo (estimated — confirm budget)' }
};

const GOAL_LABELS = { more_leads: 'more leads', brand_awareness: 'brand awareness', more_sales: 'more sales', local_presence: 'a stronger local presence', launch_new: 'a new product/service launch', all_of_above: 'leads, sales, and brand visibility' };
const ASSET_LABELS = { full_kit: 'a full brand kit already in place', partial: 'partial brand assets in place', none: 'no existing brand assets' };
const TIMELINE_LABELS = { immediate: 'wanting to start immediately', '1to3': 'looking to start in 1-3 months', '3to6': 'looking to start in 3-6 months' };
const BUSINESS_TYPE_LABELS = { local_service: 'local service businesses', ecommerce: 'e-commerce brands', b2b: 'B2B companies', restaurant: 'restaurant and hospitality businesses', personal_brand: 'personal brands', nonprofit: 'non-profits', other: 'businesses like theirs' };

const SERVICE_LABELS = { organic_social: 'Organic Social', paid_social: 'Paid Social', paid_search: 'Paid Search', seo: 'SEO', email_marketing: 'Email Marketing', website_design: 'Website Design', inbound_marketing: 'Inbound Marketing', strategy: 'Strategy' };

const BASE_SERVICES_BY_GOAL = {
  more_leads: ['paid_search', 'seo', 'website_design'],
  brand_awareness: ['organic_social', 'paid_social', 'strategy'],
  more_sales: ['paid_social', 'paid_search', 'email_marketing'],
  local_presence: ['seo', 'organic_social', 'website_design'],
  launch_new: ['strategy', 'website_design', 'organic_social'],
  all_of_above: ['organic_social', 'paid_social', 'paid_search', 'seo', 'email_marketing', 'strategy']
};

const PACKAGE_SERVICE_CAP = { Starter: 3, Professional: 5, Elite: 8, Custom: 8 };

let state = { companyName: '', contactName: '', q1Budget: '', q2Goal: '', q3Platforms: [], q4Assets: '', q5Timeline: '', q6BusinessType: '' };

function el(id) { return document.getElementById(id); }

function initState() {
  if (isEmbedded && parentClient) {
    if (!parentClient.packageRecommendation) parentClient.packageRecommendation = { data: {} };
    if (!parentClient.packageRecommendation.data) parentClient.packageRecommendation.data = {};
    state = Object.assign({}, state, parentClient.packageRecommendation.data);
    if (!Array.isArray(state.q3Platforms)) state.q3Platforms = [];
  } else {
    try {
      const saved = localStorage.getItem('package-recommendation-state');
      if (saved) state = Object.assign({}, state, JSON.parse(saved));
      if (!Array.isArray(state.q3Platforms)) state.q3Platforms = [];
    } catch (e) {}
  }
}

function saveState() {
  if (isEmbedded && parentClient) {
    parentClient.packageRecommendation.data = state;
    window.parent.saveDatabase();
  } else {
    try { localStorage.setItem('package-recommendation-state', JSON.stringify(state)); } catch (e) {}
  }
}

function applyStateToForm() {
  TEXT_FIELDS.forEach(id => { el(id).value = state[id] || ''; });
  SELECT_FIELDS.forEach(id => { el(id).value = state[id] || ''; });
  document.querySelectorAll('#q3PlatformsGroup input[type="checkbox"]').forEach(cb => {
    cb.checked = state.q3Platforms.includes(cb.value);
  });
}

function readFormIntoState() {
  TEXT_FIELDS.forEach(id => { state[id] = el(id).value; });
  SELECT_FIELDS.forEach(id => { state[id] = el(id).value; });
  state.q3Platforms = Array.from(document.querySelectorAll('#q3PlatformsGroup input[type="checkbox"]:checked')).map(cb => cb.value);
}

function hasAllCoreAnswers() {
  return !!(state.q1Budget && state.q2Goal && state.q4Assets && state.q5Timeline && state.q6BusinessType);
}

function computeRecommendation() {
  const budgetInfo = BUDGET_INFO[state.q1Budget] || BUDGET_INFO.unknown;
  let pkg = budgetInfo.pkg;

  // Override: brand-new launch with no existing assets needs a scoped, custom build.
  if (state.q4Assets === 'none' && state.q2Goal === 'launch_new') {
    pkg = 'Custom';
  }
  // Override: e-commerce/B2B at higher budgets typically need a broader stack than "Professional".
  else if ((state.q6BusinessType === 'ecommerce' || state.q6BusinessType === 'b2b') && (state.q1Budget === '3.5k_5k' || state.q1Budget === '5k_plus')) {
    pkg = 'Elite';
  }

  // Recommended services
  let services = (BASE_SERVICES_BY_GOAL[state.q2Goal] || []).slice();
  if (state.q4Assets === 'none' && !services.includes('website_design')) services.push('website_design');
  if (state.q6BusinessType === 'ecommerce') { ['paid_search', 'email_marketing'].forEach(s => { if (!services.includes(s)) services.push(s); }); }
  if (state.q6BusinessType === 'b2b') { ['inbound_marketing', 'strategy'].forEach(s => { if (!services.includes(s)) services.push(s); }); }
  const cap = PACKAGE_SERVICE_CAP[pkg] || 5;
  services = services.slice(0, cap);

  const goalLabel = GOAL_LABELS[state.q2Goal] || 'their marketing goals';
  const assetLabel = ASSET_LABELS[state.q4Assets] || 'an unclear brand foundation';
  const timelineLabel = TIMELINE_LABELS[state.q5Timeline] || 'no confirmed timeline';
  const businessLabel = BUSINESS_TYPE_LABELS[state.q6BusinessType] || 'businesses like theirs';

  const why = `Based on a budget around ${budgetInfo.label}/mo and a primary goal of ${goalLabel}, the ${pkg} package gives this ${businessLabel.replace(/s$/, '')} the right mix of services without overextending scope.`;

  const emphasis = [];
  emphasis.push(`Lead with ${goalLabel} — that's what they said matters most.`);
  if (state.q4Assets === 'none') emphasis.push('Set expectations that foundational brand/website work comes first before performance channels can really perform.');
  else if (state.q4Assets === 'partial') emphasis.push("Highlight how we'll build on what they already have rather than starting over.");
  else if (state.q4Assets === 'full_kit') emphasis.push('Emphasize how quickly we can move since brand foundations are already in place.');
  if (state.q5Timeline === 'immediate') emphasis.push('Stress onboarding speed and quick-win channels like paid, since they want to move now.');
  else if (state.q5Timeline === '3to6') emphasis.push('No urgency pressure needed — focus on long-term strategy and durable results.');

  const topService = SERVICE_LABELS[services[0]] || 'a tailored service mix';
  const pitch = `We help ${businessLabel} drive more ${goalLabel} with a ${pkg} package built around ${topService}, typically landing around ${budgetInfo.retainerLabel}.`;

  return { pkg, budgetInfo, services, why, emphasis, pitch };
}

function renderResult() {
  const card = el('resultCard');
  const pkgEl = el('resultPackage');
  const retainerEl = el('resultRetainer');
  const servicesEl = el('resultServices');
  const whyEl = el('resultWhy');
  const emphasisEl = el('resultEmphasis');
  const pitchEl = el('resultPitch');

  if (!hasAllCoreAnswers()) {
    card.className = 'result-card result-unknown';
    pkgEl.textContent = 'Answer all 6 questions to see a recommendation';
    retainerEl.textContent = '';
    servicesEl.textContent = '--';
    whyEl.textContent = '--';
    emphasisEl.innerHTML = '<li>--</li>';
    pitchEl.textContent = '--';
    return;
  }

  const rec = computeRecommendation();

  card.className = 'result-card result-ready';
  pkgEl.textContent = rec.pkg + ' Package';
  retainerEl.textContent = 'Suggested retainer: ' + rec.budgetInfo.retainerLabel;

  servicesEl.innerHTML = '';
  rec.services.forEach(s => {
    const tag = document.createElement('span');
    tag.className = 'service-tag';
    tag.textContent = SERVICE_LABELS[s] || s;
    servicesEl.appendChild(tag);
  });

  whyEl.textContent = rec.why;

  emphasisEl.innerHTML = '';
  rec.emphasis.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    emphasisEl.appendChild(li);
  });

  pitchEl.textContent = '"' + rec.pitch + '"';
}

function onAnyFieldChange() {
  readFormIntoState();
  saveState();
  renderResult();
}

function initListeners() {
  TEXT_FIELDS.forEach(id => { el(id).addEventListener('input', onAnyFieldChange); });
  SELECT_FIELDS.forEach(id => { el(id).addEventListener('change', onAnyFieldChange); });
  document.querySelectorAll('#q3PlatformsGroup input[type="checkbox"]').forEach(cb => {
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
  if (!hasAllCoreAnswers()) {
    if (window.parent.showBanner) window.parent.showBanner('error', 'Answer all 6 questions to generate a recommendation first.');
    return;
  }

  const rec = computeRecommendation();

  if (!parentClient.proposal) parentClient.proposal = {};
  if (state.companyName) parentClient.proposal.clientName = state.companyName;
  if (state.contactName) parentClient.proposal.contactName = state.contactName;
  parentClient.proposal.baseFee = Math.round((rec.budgetInfo.low + rec.budgetInfo.high) / 2);

  window.parent.saveDatabase();

  const servicesStr = rec.services.map(s => SERVICE_LABELS[s] || s).join(', ');
  if (window.parent.showBanner) {
    window.parent.showBanner('success', `${rec.pkg} package recommended (${servicesStr}). Base fee pre-filled at $${parentClient.proposal.baseFee}/mo in Proposal Calculator.`);
  }
  if (window.parent.navigateToTab) {
    window.parent.navigateToTab('tab-proposal');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  applyStateToForm();
  renderResult();
  initListeners();
});
