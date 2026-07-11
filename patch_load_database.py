import os

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

# 1. Add loadLocalState() before loadDatabase()
target_load_func = """function loadDatabase() {
  const stored = localStorage.getItem("REVITAL_HUB_CLIENTS");
  if (stored) {
    try {
      clientsDb = JSON.parse(stored);
    } catch (e) {
      clientsDb = {};
    }
  }

  // Set active client
  const storedActive = localStorage.getItem("REVITAL_HUB_ACTIVE_CLIENT");
  if (storedActive && clientsDb[storedActive]) {
    activeClientName = storedActive;
  } else if (Object.keys(clientsDb).length > 0) {
    activeClientName = Object.keys(clientsDb)[0];
  } else {
    // Seed default if empty
    const defaultName = "Nexus Productions";
    clientsDb[defaultName] = createClientBlankState(defaultName);
    activeClientName = defaultName;
  }

  // 2. Setup Firebase real-time listener"""

new_target_load_func = """function loadLocalState() {
  const stored = localStorage.getItem("REVITAL_HUB_CLIENTS");
  if (stored) {
    try {
      clientsDb = JSON.parse(stored);
    } catch (e) {
      clientsDb = {};
    }
  }
  // Set active client
  const storedActive = localStorage.getItem("REVITAL_HUB_ACTIVE_CLIENT");
  if (storedActive && clientsDb[storedActive]) {
    activeClientName = storedActive;
  } else if (Object.keys(clientsDb).length > 0) {
    activeClientName = Object.keys(clientsDb)[0];
  } else {
    // Seed default if empty
    const defaultName = "Nexus Productions";
    clientsDb[defaultName] = createClientBlankState(defaultName);
    activeClientName = defaultName;
  }
}

// Run synchronous local state load so iframes have data immediately
loadLocalState();

function loadDatabase() {
  // 1. Setup Firebase real-time listener"""

js = js.replace(target_load_func, new_target_load_func)

# 2. Change global loadDatabase() at the end of the file to be inside DOMContentLoaded
target_dom_ready = """  // Reset Sandbox Button listener
  const resetSandboxBtn = document.getElementById("resetSandboxBtn");
  if (resetSandboxBtn) {
    resetSandboxBtn.addEventListener("click", () => {
      const sandboxName = "Quick Sandbox (One-Offs)";
      if (!confirm("Are you sure you want to clear all data in the Quick Sandbox? This will reset all checklist audits and competitor sheets back to blank templates.")) return;
      clientsDb[sandboxName] = createClientBlankState(sandboxName);
      saveDatabase();
      refreshAllViews();
      showBanner("success", "Quick Sandbox data cleared and reset successfully!");
    });
  }
});

// Run database load immediately to populate state before child iframes execute their scripts
loadDatabase();"""

new_target_dom_ready = """  // Reset Sandbox Button listener
  const resetSandboxBtn = document.getElementById("resetSandboxBtn");
  if (resetSandboxBtn) {
    resetSandboxBtn.addEventListener("click", () => {
      const sandboxName = "Quick Sandbox (One-Offs)";
      if (!confirm("Are you sure you want to clear all data in the Quick Sandbox? This will reset all checklist audits and competitor sheets back to blank templates.")) return;
      clientsDb[sandboxName] = createClientBlankState(sandboxName);
      saveDatabase();
      refreshAllViews();
      showBanner("success", "Quick Sandbox data cleared and reset successfully!");
    });
  }
  
  // Call loadDatabase AFTER DOM is ready and Module scripts are loaded
  loadDatabase();
});"""

js = js.replace(target_dom_ready, new_target_dom_ready)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched loadDatabase synchronously")
