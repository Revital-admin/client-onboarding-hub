// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDszpFkygCjr8ktkPe0ILxbLNHxRkb0bIY",
  authDomain: "revitalhub-895c1.firebaseapp.com",
  projectId: "revitalhub-895c1",
  storageBucket: "revitalhub-895c1.appspot.com",
  messagingSenderId: "367204555811",
  appId: "1:367204555811:web:1ec1e2fcb02db7dae4c7ba"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Globals
let clientName = "";
let clientToken = "";
let clientData = null;

// DOM Elements
const loader = document.getElementById("loader");
const appLayout = document.getElementById("app");
const brandName = document.getElementById("brandName");
const brandLogo = document.getElementById("brandLogo");
const welcomeHeader = document.getElementById("welcomeHeader");
const checklistContainer = document.getElementById("checklistContainer");
const amInitial = document.getElementById("amInitial");
const amName = document.getElementById("amName");
const amEmail = document.getElementById("amEmail");
const btnBookCall = document.getElementById("btnBookCall");
const btnRevision = document.getElementById("btnRevision");
const btnContentRequest = document.getElementById("btnContentRequest");
const quickActionsWidget = document.getElementById("quickActionsWidget");


// Nav and Views
const navBtns = document.querySelectorAll(".nav-btn");
const viewSections = document.querySelectorAll(".view-section");

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  clientName = params.get("c") || "";
  clientToken = params.get("t") || "";
}

function init() {
  getUrlParams();
  
  if (!clientName || !clientToken) {
    loader.innerHTML = "<h2>Access Denied</h2><p>Invalid or missing magic link.</p>";
    return;
  }

  const docRef = db.collection("agency").doc("clientsDb");
  
  // Real-time listener
  docRef.onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data[clientName] && data[clientName].portalConfig && data[clientName].portalConfig.magicToken === clientToken) {
        clientData = data[clientName];
        renderPortal();
        
        // Hide loader on first success
        if (loader.style.display !== "none") {
          loader.style.display = "none";
          appLayout.style.display = "flex";
        }
      } else {
        loader.innerHTML = "<h2>Access Denied</h2><p>Link expired or invalid token.</p>";
      }
    }
  });
}

function renderPortal() {
  const config = clientData.portalConfig;
  
  // Branding
  brandName.textContent = clientName + " Portal";
  if (config.clientLogoUrl) {
    brandLogo.src = config.clientLogoUrl;
    brandLogo.style.display = "block";
    brandName.style.display = "none";
  } else {
    brandLogo.style.display = "none";
    brandName.style.display = "block";
  }
  
  if (config.clientContactName) {
    welcomeHeader.textContent = "Welcome back, " + config.clientContactName + "!";
  } else {
    welcomeHeader.textContent = "Welcome back!";
  }

  if (config.primaryColor) {
    document.documentElement.style.setProperty("--color-primary", config.primaryColor);
    document.documentElement.style.setProperty("--color-primary-glow", hexToRgba(config.primaryColor, 0.2));
  }
  if (config.secondaryColor) {
    document.documentElement.style.setProperty("--color-secondary", config.secondaryColor);
    document.documentElement.style.setProperty("--color-secondary-glow", hexToRgba(config.secondaryColor, 0.2));
  } else {
    document.documentElement.style.setProperty("--color-secondary", "#6366f1");
    document.documentElement.style.setProperty("--color-secondary-glow", hexToRgba("#6366f1", 0.2));
  }

  // Account Manager
  if (config.accountManagerName) {
    amName.textContent = config.accountManagerName;
    amInitial.textContent = config.accountManagerName.charAt(0).toUpperCase();
  }
  if (config.accountManagerEmail) {
    amEmail.textContent = "Email " + config.accountManagerName.split(' ')[0];
    amEmail.href = "mailto:" + config.accountManagerEmail;
  }
  if (config.calendlyLink) {
    btnBookCall.style.display = "inline-flex";
    btnBookCall.href = config.calendlyLink;
  }

  // Iframes setup
  setupIframe("navProjects", "projectsIframe", config.projectsEmbedUrl);
  setupIframe("navCalendar", "calendarIframe", config.calendarEmbedUrl);
  setupIframe("navCampaign", "campaignIframe", config.campaignBriefUrl);
  setupIframe("navCompleted", "completedIframe", config.completedWorkUrl);
  setupIframe("navAssets", "assetsIframe", config.brandAssetsUrl);

  const analyticsEmbed = document.getElementById("analyticsEmbedContainer");
  if (config.liveAnalyticsUrl) {
    analyticsEmbed.style.display = "block";
    document.getElementById("analyticsIframe").src = config.liveAnalyticsUrl;
  }

  const btnFeedback = document.getElementById("btnFeedback");
  if (config.feedbackFormUrl) {
    btnFeedback.style.display = "inline-flex";
    btnFeedback.href = config.feedbackFormUrl;
  }

  let hasQuickActions = false;
  if (config.revisionFormUrl) {
    btnRevision.style.display = "inline-flex";
    btnRevision.href = config.revisionFormUrl;
    hasQuickActions = true;
  }
  if (config.contentRequestFormUrl) {
    btnContentRequest.style.display = "inline-flex";
    btnContentRequest.href = config.contentRequestFormUrl;
    hasQuickActions = true;
  }
  if (hasQuickActions) {
    quickActionsWidget.style.display = "block";
  }


  // Checklist
  renderChecklist();
}

function setupIframe(navId, iframeId, url) {
  const navBtn = document.getElementById(navId);
  const iframe = document.getElementById(iframeId);
  if (url) {
    navBtn.style.display = "flex";
    if (iframe.src !== url) iframe.src = url;
  } else {
    navBtn.style.display = "none";
  }
}

function renderChecklist() {
  checklistContainer.innerHTML = "";
  if (!clientData.onboarding || clientData.onboarding.length === 0) return;
  
  let allItems = [];
  clientData.onboarding.forEach(cat => {
    cat.items.forEach(item => {
      // Only show items that start with "Client:" or we can just show all phase 1.
      // For now, let's show all items in the first category ("Phase 1: Setup") to the client.
      if (cat.category.includes("Phase 1") || item.label.toLowerCase().includes("client")) {
        allItems.push(item);
      }
    });
  });

  // If we couldn't filter easily, just grab the first 4 tasks.
  if (allItems.length === 0) {
    allItems = clientData.onboarding[0].items.slice(0, 4);
  }

  let completedCount = 0;

  allItems.forEach(item => {
    if (item.checked) completedCount++;

    const div = document.createElement("label");
    div.className = "check-item";
    
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.checked;
    
    cb.addEventListener("change", (e) => {
      item.checked = e.target.checked;
      updateFirebaseChecklist();
    });

    const span = document.createElement("span");
    span.textContent = item.label.replace("Client: ", ""); // clean label

    div.appendChild(cb);
    div.appendChild(span);
    checklistContainer.appendChild(div);
  });

  // Check Confetti
  if (allItems.length > 0 && completedCount === allItems.length) {
    if (!window.hasFiredConfetti) {
      fireConfetti();
      window.hasFiredConfetti = true;
    }
  } else {
    window.hasFiredConfetti = false;
  }
}

function updateFirebaseChecklist() {
  const docRef = db.collection("agency").doc("clientsDb");
  
  // To avoid prototype issues, deep clone
  const purifiedData = JSON.parse(JSON.stringify(clientData));
  
  docRef.set({
    [clientName]: purifiedData
  }, { merge: true }).catch(err => {
    console.error("Error updating checklist:", err);
  });
}

// Navigation Tab Switching
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    viewSections.forEach(v => v.classList.remove("active"));
    
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// Utilities
function hexToRgba(hex, alpha) {
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
  }
  return `rgba(16, 185, 129, ${alpha})`;
}

// Confetti Effect
function fireConfetti() {
  const colors = [clientData.portalConfig.primaryColor || '#10b981', clientData.portalConfig.secondaryColor || '#6366f1', '#ffffff'];
  for (let i = 0; i < 100; i++) {
    createParticle(colors[Math.floor(Math.random() * colors.length)]);
  }
}
function createParticle(color) {
  const particle = document.createElement('div');
  particle.className = 'confetti';
  particle.style.backgroundColor = color;
  particle.style.left = Math.random() * window.innerWidth + 'px';
  particle.style.top = -10 + 'px';
  document.body.appendChild(particle);

  const animation = particle.animate([
    { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
    { transform: `translate3d(${Math.random()*200 - 100}px, ${window.innerHeight}px, 0) rotate(${Math.random()*720}deg)`, opacity: 0 }
  ], {
    duration: Math.random() * 2000 + 1500,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });

  animation.onfinish = () => particle.remove();
}

// Boot
init();
