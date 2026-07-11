import re

# Remove from index.html
filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Remove the button
html = re.sub(r'\s*<button class="btn btn-secondary" id="adminSettingsBtn" onclick="openAdminSettings\(\)".*?</button>\n', '\n', html, flags=re.DOTALL)

# Remove the modal
html = re.sub(r'\s*<!-- Admin Settings Modal -->.*?<div class="modal-overlay" id="adminModal" style="display: none;">.*?</div>\s*</div>\s*</div>\n', '\n', html, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(html)
print("Removed Admin UI from index.html")

# Remove from app.js
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

js = re.sub(r'let isAdmin = false;\n?', '', js)
js = re.sub(r'let adminEmails = \[.*?\];\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function checkAdminStatus\(\).*?\n\}\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function openAdminSettings\(\).*?\n\}\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function closeAdminSettings\(\).*?\n\}\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function renderAdminList\(\).*?\n\}\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function addAdminEmail\(\).*?\n\}\n?', '', js, flags=re.DOTALL)
js = re.sub(r'function removeAdminEmail\(email\).*?\n\}\n?', '', js, flags=re.DOTALL)

js = js.replace('  checkAdminStatus();\n', '')

with open(filepath, 'w') as f:
    f.write(js)
print("Removed Admin Logic from app.js")

