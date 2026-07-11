import re

filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    js = f.read()

robust_render = """function renderChecklist() {
  checklistContainer.innerHTML = "";
  
  // Backwards compatibility for older schema
  const checklistSource = clientData.onboardingChecklist || clientData.onboarding;
  
  if (!checklistSource || !Array.isArray(checklistSource) || checklistSource.length === 0) return;
  
  let allItems = [];
  checklistSource.forEach(cat => {
    if (cat && cat.items && Array.isArray(cat.items)) {
      cat.items.forEach(item => {
        // Only show items that start with "Client:" or we can just show all phase 1.
        if ((cat.category && cat.category.includes("Phase 1")) || (item.label && item.label.toLowerCase().includes("client"))) {
          allItems.push(item);
        }
      });
    }
  });

  // If we couldn't filter easily, just grab the first 4 tasks.
  if (allItems.length === 0 && checklistSource[0] && checklistSource[0].items) {
    allItems = checklistSource[0].items.slice(0, 4);
  }

  let completedCount = 0;

  allItems.forEach(item => {
    if (item.checked) completedCount++;

    const div = document.createElement("label");
    div.className = "check-item";
    
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!item.checked;
    
    cb.addEventListener("change", (e) => {
      item.checked = e.target.checked;
      updateFirebaseChecklist();
    });

    const span = document.createElement("span");
    span.textContent = item.label ? item.label.replace("Client: ", "") : "Task"; 

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
  }
}
"""

# Replace the whole function
js = re.sub(r'function renderChecklist\(\).*?function updateFirebaseChecklist', robust_render + '\n\nfunction updateFirebaseChecklist', js, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(js)
print("Made renderChecklist robust")

