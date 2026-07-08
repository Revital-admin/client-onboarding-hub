with open('app.js', 'r') as f:
    js = f.read()

old = 'document.addEventListener("DOMContentLoaded", () => {'

new_boot = """document.addEventListener("DOMContentLoaded", () => {
  try { initTabNavigation(); } catch(e) { console.error("TabNav Error:", e); }
  try { initMobileNavigation(); } catch(e) { console.error("MobileNav Error:", e); }
  try { initParentEventListeners(); } catch(e) { console.error("ParentListeners Error:", e); }
  try { initQuickLinks(); } catch(e) { console.error("QuickLinks Error:", e); }
  try { refreshAllViews(); } catch(e) { console.error("Refresh Error:", e); }"""

js = js.replace(old, new_boot, 1)

with open('app.js', 'w') as f:
    f.write(js)
print("Boot sequence restored")
