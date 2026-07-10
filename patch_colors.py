import os

# 1. Patch app.js schema
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()
if 'secondaryColor:' not in js:
    js = js.replace('primaryColor: "#10b981",', 'primaryColor: "#10b981",\n      secondaryColor: "#6366f1",')
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js")

# 2. Patch client-portal-manager/index.html
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target_html = """        <div class="form-group">
        <label for="primaryColor">Client Brand Primary Color</label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="color" id="primaryColor" value="#10b981" style="width: 50px; height: 40px; padding: 0; border: none; border-radius: 8px; cursor: pointer; background: transparent;">
          <span id="colorHex" style="font-family: var(--font-mono); color: var(--color-text-secondary);">#10b981</span>
        </div>
      </div>"""

new_html = """        <div class="form-group" style="display: flex; gap: 24px;">
        <div>
          <label for="primaryColor">Primary Color</label>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="color" id="primaryColor" value="#10b981" style="width: 50px; height: 40px; padding: 0; border: none; border-radius: 8px; cursor: pointer; background: transparent;">
            <span id="colorHex" style="font-family: var(--font-mono); color: var(--color-text-secondary);">#10b981</span>
          </div>
        </div>
        <div>
          <label for="secondaryColor">Secondary Color</label>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="color" id="secondaryColor" value="#6366f1" style="width: 50px; height: 40px; padding: 0; border: none; border-radius: 8px; cursor: pointer; background: transparent;">
            <span id="colorHexSecondary" style="font-family: var(--font-mono); color: var(--color-text-secondary);">#6366f1</span>
          </div>
        </div>
      </div>"""

if target_html in html:
    html = html.replace(target_html, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

# 3. Patch client-portal-manager/js/app.js
filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    cjs = f.read()

if 'secondaryColorInput =' not in cjs:
    cjs = cjs.replace('const primaryColorInput = document.getElementById("primaryColor");\nconst colorHexText = document.getElementById("colorHex");', 
    'const primaryColorInput = document.getElementById("primaryColor");\nconst colorHexText = document.getElementById("colorHex");\nconst secondaryColorInput = document.getElementById("secondaryColor");\nconst colorHexSecondaryText = document.getElementById("colorHexSecondary");')
    
    cjs = cjs.replace('primaryColor: "#10b981",', 'primaryColor: "#10b981",\n      secondaryColor: "#6366f1",')
    
    load_color_target = """  primaryColorInput.value = config.primaryColor || "#10b981";
  colorHexText.textContent = config.primaryColor || "#10b981";"""
    load_color_new = load_color_target + """
  secondaryColorInput.value = config.secondaryColor || "#6366f1";
  colorHexSecondaryText.textContent = config.secondaryColor || "#6366f1";"""
    cjs = cjs.replace(load_color_target, load_color_new)

    event_target = """  primaryColorInput.addEventListener("input", (e) => {
    colorHexText.textContent = e.target.value;
    updateConfig("primaryColor", e.target.value);
  });"""
    event_new = event_target + """
  secondaryColorInput.addEventListener("input", (e) => {
    colorHexSecondaryText.textContent = e.target.value;
    updateConfig("secondaryColor", e.target.value);
  });"""
    cjs = cjs.replace(event_target, event_new)
    
    with open(filepath, 'w') as f:
        f.write(cjs)
    print("Patched client-portal-manager/js/app.js")

# 4. Patch portal/js/app.js
filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    pjs = f.read()

if 'config.secondaryColor' not in pjs:
    target = """  if (config.primaryColor) {
    document.documentElement.style.setProperty("--color-primary", config.primaryColor);
    document.documentElement.style.setProperty("--color-primary-glow", hexToRgba(config.primaryColor, 0.2));
  }"""
    new_target = target + """
  if (config.secondaryColor) {
    document.documentElement.style.setProperty("--color-secondary", config.secondaryColor);
    document.documentElement.style.setProperty("--color-secondary-glow", hexToRgba(config.secondaryColor, 0.2));
  } else {
    document.documentElement.style.setProperty("--color-secondary", "#6366f1");
    document.documentElement.style.setProperty("--color-secondary-glow", hexToRgba("#6366f1", 0.2));
  }"""
    pjs = pjs.replace(target, new_target)
    
    target_confetti = """const colors = [clientData.portalConfig.primaryColor || '#10b981', '#ffffff', '#a1a1aa'];"""
    new_confetti = """const colors = [clientData.portalConfig.primaryColor || '#10b981', clientData.portalConfig.secondaryColor || '#6366f1', '#ffffff'];"""
    pjs = pjs.replace(target_confetti, new_confetti)

    with open(filepath, 'w') as f:
        f.write(pjs)
    print("Patched portal/js/app.js")

# 5. Patch portal/css/style.css
filepath = 'portal/css/style.css'
with open(filepath, 'r') as f:
    css = f.read()

if '--color-secondary:' not in css:
    css = css.replace('--color-primary: #10b981;', '--color-primary: #10b981;\n  --color-secondary: #6366f1;\n  --color-secondary-glow: rgba(99, 102, 241, 0.2);')
    css = css.replace('radial-gradient(circle, var(--color-primary-glow) 0%, transparent 60%);', 'radial-gradient(circle at 30% 30%, var(--color-primary-glow) 0%, transparent 50%), radial-gradient(circle at 70% 70%, var(--color-secondary-glow) 0%, transparent 50%);')
    css = css.replace('.social-chart .bar:hover {\n  background: var(--color-primary);\n}', '.social-chart .bar:hover {\n  background: var(--color-secondary);\n}')
    css = css.replace('.btn-secondary {\n  background: var(--color-surface);', '.btn-secondary {\n  background: var(--color-surface);') # No change here, just reference
    css = css.replace('.sidebar-header h1 {\n  font-family: var(--font-heading);\n  font-size: 1.25rem;\n  font-weight: 700;\n  margin-bottom: 32px;\n  background: linear-gradient(to right, #fff, var(--color-text-secondary));', '.sidebar-header h1 {\n  font-family: var(--font-heading);\n  font-size: 1.25rem;\n  font-weight: 700;\n  margin-bottom: 32px;\n  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));')

    with open(filepath, 'w') as f:
        f.write(css)
    print("Patched portal/css/style.css")

