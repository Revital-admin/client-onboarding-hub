/* ============================================================
   permissions.js
   Employee module-visibility permissions for the Revital Hub.

   What this does:
   - Lets you assign each employee (by email) to a "tier" that controls
     which sidebar modules they can see. Anyone with NO assignment
     defaults to Full Access, so nothing changes until you actively
     restrict someone.
   - Adds a "Employee Permissions" admin screen (visible only to the
     email addresses listed in SUPER_ADMIN_EMAILS below) where you can
     assign / change / remove an employee's tier. Assignments are
     stored in Firestore (collection "hubPermissions") so changes apply
     immediately, with no redeploy needed.
   - This is a UI-tidiness feature, not a hard security boundary: it
     hides sidebar buttons and tab content in the browser. Someone
     determined and technical could still find a hidden tool's iframe
     URL via dev tools. If you ever need a hard security boundary
     (not just a tidy sidebar), that would require server-side checks
     too - talk to me if that becomes a need.

   This file is purely additive - it does not modify app.js or
   style.css. It reuses the Hub's existing Firebase connection
   (window.firebaseDb) and existing CSS classes/variables so the new
   admin screen matches the rest of the Hub automatically.
   ============================================================ */

(function () {
  "use strict";

  // ── Who can see/manage the Employee Permissions admin screen ──
  // Add more emails here (comma-separated, lowercase) if other people
  // in leadership should be able to manage employee tiers.
  var SUPER_ADMIN_EMAILS = ["admin@revitalproductions.com"];

  // ── Tier definitions ──
  // "all" = sees every module. Otherwise, list the exact tab-* ids
  // (from index.html's data-tab attributes) this tier can see.
  // tab-dashboard and tab-sopwiki are included in every tier so
  // everyone always has a home screen and access to the SOP library.
  var TIER_LABELS = {
    full: "Full Access (Leadership)",
    salesBd: "Sales & Business Development",
    accountMgmt: "Account Management / Client Services",
    digitalMarketing: "Digital Marketing",
    sopOnly: "SOP Wiki Only"
  };

  var TIER_MODULES = {
    full: "all",
    salesBd: [
      "tab-dashboard", "tab-discoverycall", "tab-intakequalifier",
      "tab-intakerequest", "tab-packagerecommend", "tab-proposal",
      "tab-followuptracker", "tab-roiprojector", "tab-campaignlaunch",
      "tab-sopwiki"
    ],
    accountMgmt: [
      "tab-dashboard", "tab-onboarding", "tab-portal", "tab-brandvault",
      "tab-welcomeguide", "tab-emailsig", "tab-report", "tab-sopwiki"
    ],
    digitalMarketing: [
      "tab-dashboard", "tab-adaccountsetup", "tab-uxui", "tab-seo",
      "tab-socialaudit", "tab-contentaudit", "tab-paidads",
      "tab-emailstrategy", "tab-strategy", "tab-strategybuilder",
      "tab-personalbrand", "tab-webcomp", "tab-socialcomp",
      "tab-copywriting", "tab-creativebrief", "tab-campaignlaunch",
      "tab-sopwiki"
    ],
    sopOnly: ["tab-dashboard", "tab-sopwiki"]
  };

  var COLLECTION = "hubPermissions";

  // ── Keep the existing "Checking access..." gate up until we've
  // resolved and applied this user's tier, so restricted users never
  // see a flash of the full sidebar before it narrows. ──
  var gate = document.getElementById("authGate");
  var permsSettled = false;
  var gateObserver = null;

  if (gate) {
    gateObserver = new MutationObserver(function () {
      if (!permsSettled && gate.style.display === "none") {
        gate.style.display = "flex";
      }
    });
    gateObserver.observe(gate, { attributes: true, attributeFilter: ["style"] });
  }

  function releaseGate() {
    permsSettled = true;
    if (gateObserver) {
      gateObserver.disconnect();
      gateObserver = null;
    }
    if (gate && window.firebase && window.firebase.auth && firebase.auth().currentUser) {
      gate.style.display = "none";
    }
  }

  // ── Hide sidebar buttons / tab sections not in the allowed list ──
  function applyTierToDom(tier) {
    var allowed = TIER_MODULES[tier];
    if (allowed === "all" || !allowed) return;

    document.querySelectorAll(".nav-item-btn[data-tab]").forEach(function (btn) {
      var tabId = btn.getAttribute("data-tab");
      var li = btn.closest("li");
      var visible = allowed.indexOf(tabId) !== -1;
      if (li) li.style.display = visible ? "" : "none";
    });

    document.querySelectorAll(".tab-section").forEach(function (sec) {
      if (allowed.indexOf(sec.id) === -1) {
        sec.style.display = "none";
      }
    });

    // Collapse any nav-section group whose items are now all hidden.
    document.querySelectorAll("li.nav-section").forEach(function (section) {
      var items = section.querySelectorAll(".nav-section-items > li");
      if (!items.length) return;
      var anyVisible = false;
      items.forEach(function (li) {
        if (li.style.display !== "none") anyVisible = true;
      });
      section.style.display = anyVisible ? "" : "none";
    });
  }

  function switchToTab(tabId) {
    document.querySelectorAll(".nav-item-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    var targetBtn = document.querySelector('.nav-item-btn[data-tab="' + tabId + '"]');
    if (targetBtn) targetBtn.classList.add("active");

    document.querySelectorAll(".tab-section").forEach(function (sec) {
      sec.classList.remove("active");
      if (sec.id === tabId) sec.classList.add("active");
    });
  }

  // ── Admin screen: build once, only for super admins ──
  function buildAdminPanel() {
    if (document.getElementById("tab-permissions")) return;

    var navMenu = document.querySelector(".nav-menu");
    var main = document.querySelector(".main-content");
    if (!navMenu || !main) return;

    var navSection = document.createElement("li");
    navSection.className = "nav-section";
    navSection.setAttribute("data-section", "admin");
    navSection.innerHTML =
      '<button class="nav-section-toggle" type="button" aria-expanded="true">' +
        "<span>ADMIN</span>" +
        '<svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
      "</button>" +
      '<ul class="nav-section-items">' +
        "<li>" +
          '<button class="nav-item-btn" data-tab="tab-permissions" type="button">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>' +
            "<span>Employee Permissions</span>" +
          "</button>" +
        "</li>" +
      "</ul>";

    // Insert right after the last existing nav-section so it reads as
    // part of the normal nav list, not tacked on after the client
    // switcher / delete-client controls.
    var existingSections = navMenu.querySelectorAll("li.nav-section");
    if (existingSections.length) {
      var last = existingSections[existingSections.length - 1];
      last.parentNode.insertBefore(navSection, last.nextSibling);
    } else {
      navMenu.appendChild(navSection);
    }

    // Wired directly (not via app.js's initTabNavigation, which has
    // already run its one-time query by the time this button exists).
    var navBtn = navSection.querySelector(".nav-item-btn");
    navBtn.addEventListener("click", function () {
      switchToTab("tab-permissions");
      renderPermissionsTable();
    });
    // Also expand/collapse toggle for this section, matching the others.
    var toggleBtn = navSection.querySelector(".nav-section-toggle");
    toggleBtn.addEventListener("click", function () {
      var collapsed = navSection.classList.toggle("collapsed");
      toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });

    var section = document.createElement("section");
    section.id = "tab-permissions";
    section.className = "tab-section";
    section.innerHTML =
      '<div style="margin-bottom:24px;">' +
        '<h2 style="margin:0 0 6px;">Employee Permissions</h2>' +
        '<p style="margin:0;opacity:0.7;max-width:640px;">Assign each employee a tier to control which Hub modules they can see. Anyone without an assignment below defaults to Full Access. This only affects what shows in the sidebar - it is a UI-tidiness feature, not a hard security boundary.</p>' +
      "</div>" +
      '<div style="display:flex;gap:10px;align-items:center;margin-bottom:24px;flex-wrap:wrap;">' +
        '<input type="email" id="permEmailInput" placeholder="employee@revitalproductions.com" style="flex:1;min-width:260px;padding:9px 12px;border-radius:8px;border:1px solid var(--border-color);background:transparent;color:inherit;font:inherit;">' +
        '<select id="permTierSelect" style="padding:9px 12px;border-radius:8px;border:1px solid var(--border-color);background:transparent;color:inherit;font:inherit;"></select>' +
        '<button id="permAddBtn" class="btn btn-primary" type="button" style="background:var(--primary);color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;">Save</button>' +
      "</div>" +
      '<div id="permTableWrap"></div>';
    main.appendChild(section);

    var tierSelect = section.querySelector("#permTierSelect");
    Object.keys(TIER_LABELS).forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = TIER_LABELS[key];
      tierSelect.appendChild(opt);
    });

    section.querySelector("#permAddBtn").addEventListener("click", function () {
      var emailInput = section.querySelector("#permEmailInput");
      var email = emailInput.value.trim().toLowerCase();
      var tier = tierSelect.value;
      if (!email || email.indexOf("@") === -1) {
        alert("Enter a valid email address.");
        return;
      }
      window.firebaseDb
        .collection(COLLECTION)
        .doc(email)
        .set({ tier: tier, updatedAt: new Date().toISOString() })
        .then(function () {
          emailInput.value = "";
          renderPermissionsTable();
        })
        .catch(function (e) {
          alert("Could not save: " + e.message);
        });
    });

    renderPermissionsTable();
  }

  function renderPermissionsTable() {
    var wrap = document.getElementById("permTableWrap");
    if (!wrap || !window.firebaseDb) return;
    wrap.innerHTML = '<p style="opacity:0.6;">Loading...</p>';

    window.firebaseDb
      .collection(COLLECTION)
      .get()
      .then(function (snap) {
        if (snap.empty) {
          wrap.innerHTML =
            '<p style="opacity:0.6;">No employees assigned yet - everyone currently has Full Access.</p>';
          return;
        }

        var rows = [];
        snap.forEach(function (doc) {
          var data = doc.data() || {};
          var tierLabel = TIER_LABELS[data.tier] || data.tier || "Unknown";
          rows.push(
            "<tr>" +
              '<td style="padding:10px 12px;border-bottom:1px solid var(--border-color);">' +
              doc.id +
              "</td>" +
              '<td style="padding:10px 12px;border-bottom:1px solid var(--border-color);">' +
              tierLabel +
              "</td>" +
              '<td style="padding:10px 12px;border-bottom:1px solid var(--border-color);text-align:right;">' +
              '<button class="permRemoveBtn" data-email="' +
              doc.id +
              '" type="button" style="padding:5px 12px;border-radius:6px;border:1px solid var(--border-color);background:transparent;color:inherit;cursor:pointer;">Remove</button>' +
              "</td>" +
              "</tr>"
          );
        });

        wrap.innerHTML =
          '<table style="width:100%;border-collapse:collapse;">' +
            "<thead><tr>" +
              '<th style="text-align:left;padding:10px 12px;border-bottom:2px solid var(--border-color);">Email</th>' +
              '<th style="text-align:left;padding:10px 12px;border-bottom:2px solid var(--border-color);">Tier</th>' +
              '<th style="border-bottom:2px solid var(--border-color);"></th>' +
            "</tr></thead>" +
            "<tbody>" + rows.join("") + "</tbody>" +
          "</table>";

        wrap.querySelectorAll(".permRemoveBtn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var email = btn.getAttribute("data-email");
            if (!confirm("Remove tier assignment for " + email + "? They will default back to Full Access.")) return;
            window.firebaseDb
              .collection(COLLECTION)
              .doc(email)
              .delete()
              .then(renderPermissionsTable)
              .catch(function (e) {
                alert("Could not remove: " + e.message);
              });
          });
        });
      })
      .catch(function (e) {
        wrap.innerHTML = '<p style="color:#ef4444;">Could not load: ' + e.message + "</p>";
      });
  }

  // ── Resolve the signed-in user's tier and apply it ──
  function resolveAndApplyUserTier(email) {
    var lower = (email || "").toLowerCase();
    var isSuperAdmin = SUPER_ADMIN_EMAILS.indexOf(lower) !== -1;

    function finish(tier) {
      try {
        applyTierToDom(tier);
      } catch (e) {
        console.error("Permissions apply error:", e);
      }
      if (isSuperAdmin) {
        try {
          buildAdminPanel();
        } catch (e) {
          console.error("Permissions admin panel error:", e);
        }
      }
      releaseGate();
    }

    if (!window.firebaseDb) {
      finish("full");
      return;
    }

    window.firebaseDb
      .collection(COLLECTION)
      .doc(lower)
      .get()
      .then(function (doc) {
        var tier = "full";
        if (doc.exists) {
          var data = doc.data() || {};
          if (data.tier && TIER_MODULES[data.tier]) tier = data.tier;
        }
        finish(tier);
      })
      .catch(function (e) {
        console.warn("Could not load permission tier, defaulting to full access:", e);
        finish("full");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.firebase || !firebase.auth) {
      releaseGate();
      return;
    }
    firebase.auth().onAuthStateChanged(function (user) {
      if (user && user.email) {
        resolveAndApplyUserTier(user.email);
      } else {
        releaseGate();
      }
    });
  });
})();
