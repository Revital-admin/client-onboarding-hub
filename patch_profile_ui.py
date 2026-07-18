import re

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

profile_html = """          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span id="userEmail" style="font-size: 13px; font-weight: 500; color: var(--color-text);">Ronald</span>
            <span id="userRole" style="font-size: 11px; color: var(--color-primary, #10b981); display: none;">Admin</span>
          </div>"""

html = re.sub(r'<span id="userEmail"[^>]*>Ronald</span>', profile_html, html)

with open(filepath, 'w') as f:
    f.write(html)
print("Patched profile UI in index.html")

