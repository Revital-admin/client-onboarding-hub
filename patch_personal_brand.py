import os

# 1. Patch app.js schema
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()
if 'clientLogoUrl:' not in js:
    js = js.replace('primaryColor: "#10b981",', 'clientLogoUrl: "",\n      clientContactName: "",\n      primaryColor: "#10b981",')
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js schema")

# 2. Patch client-portal-manager/index.html
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target_html = """    <div class="step-card">
      <div class="section-title" style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
        <h2 style="font-family: var(--font-heading); color: var(--color-primary);">Client Access</h2>
      </div>"""

new_html = target_html + """
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="form-group">
          <label for="clientContactName">Client Contact Name (e.g. Sarah)</label>
          <input type="text" id="clientContactName" placeholder="Welcome back, Sarah!">
        </div>
        <div class="form-group">
          <label for="clientLogoUrl">Client Logo URL (Transparent PNG)</label>
          <input type="text" id="clientLogoUrl" placeholder="https://example.com/logo.png">
        </div>
      </div>
"""

if "clientContactName" not in html:
    html = html.replace(target_html, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

# 3. Patch client-portal-manager/js/app.js
filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    cjs = f.read()

if 'clientLogoUrl:' not in cjs:
    cjs = cjs.replace('const inputs = {', 'const inputs = {\n  clientContactName: document.getElementById("clientContactName"),\n  clientLogoUrl: document.getElementById("clientLogoUrl"),')
    cjs = cjs.replace('primaryColor: "#10b981",', 'clientLogoUrl: "",\n      clientContactName: "",\n      primaryColor: "#10b981",')
    with open(filepath, 'w') as f:
        f.write(cjs)
    print("Patched client-portal-manager/js/app.js")

# 4. Patch portal/index.html
filepath = 'portal/index.html'
with open(filepath, 'r') as f:
    phtml = f.read()

if 'id="welcomeHeader"' not in phtml:
    phtml = phtml.replace('<h1 id="brandName">Client Portal</h1>', '<img id="brandLogo" src="" alt="Client Logo" style="display:none; max-width: 100%; max-height: 40px; margin-bottom: 32px;"><h1 id="brandName">Client Portal</h1>')
    phtml = phtml.replace('<h2>Welcome back!</h2>', '<h2 id="welcomeHeader">Welcome back!</h2>')
    with open(filepath, 'w') as f:
        f.write(phtml)
    print("Patched portal/index.html")

# 5. Patch portal/js/app.js
filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    pjs = f.read()

if 'brandLogo' not in pjs:
    pjs = pjs.replace('const brandName = document.getElementById("brandName");', 'const brandName = document.getElementById("brandName");\nconst brandLogo = document.getElementById("brandLogo");\nconst welcomeHeader = document.getElementById("welcomeHeader");')
    
    target_branding = """  brandName.textContent = clientName + " Portal";"""
    new_branding = target_branding + """
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
"""
    pjs = pjs.replace(target_branding, new_branding)
    with open(filepath, 'w') as f:
        f.write(pjs)
    print("Patched portal/js/app.js")

