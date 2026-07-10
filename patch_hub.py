import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

iframe_target = """      <!-- ── SECTION 2: CLIENT ONBOARDING CHECKLIST ── -->
      <section id="tab-onboarding" class="tab-section">"""

iframe_new = """      <!-- ── SECTION: CLIENT PORTAL MANAGER ── -->
      <section id="tab-portal" class="tab-section">
        <iframe src="client-portal-manager/index.html" class="app-iframe"></iframe>
      </section>

""" + iframe_target

if iframe_target in html:
    html = html.replace(iframe_target, iframe_new)
    print("Patched iframe section")
else:
    print("Could not find iframe target")

with open(filepath, 'w') as f:
    f.write(html)
print("Done patching index.html")
