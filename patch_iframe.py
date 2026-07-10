import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

bad_iframe = """      <!-- ── SECTION: CLIENT PORTAL MANAGER ── -->
      <section id="tab-portal" class="tab-section">
        <iframe src="client-portal-manager/index.html" class="app-iframe"></iframe>
      </section>"""

good_iframe = """      <!-- ── SECTION: CLIENT PORTAL MANAGER ── -->
      <section id="tab-portal" class="tab-section" style="width: 100%; height: 100vh; padding: 0;">
        <iframe src="client-portal-manager/index.html" style="width: 100%; height: 100%; border: none;"></iframe>
      </section>"""

if bad_iframe in html:
    html = html.replace(bad_iframe, good_iframe)
    print("Patched iframe.")
else:
    print("Could not find bad iframe.")

with open(filepath, 'w') as f:
    f.write(html)
