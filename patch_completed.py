import os

# 1. Patch app.js schema
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

if 'completedWorkUrl:' not in js:
    js = js.replace('campaignBriefUrl: "",', 'campaignBriefUrl: "",\n      completedWorkUrl: "",')
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js schema")

# 2. Patch client-portal-manager/index.html
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target_html = """        <div class="form-group">
          <label for="campaignBriefUrl">Campaign Briefs (ClickUp/GDoc Embed)</label>
          <input type="text" id="campaignBriefUrl" placeholder="https://sharing.clickup.com/.../">
        </div>"""

new_html = target_html + """

        <div class="form-group">
          <label for="completedWorkUrl">Completed Work (ClickUp/GDoc Embed)</label>
          <input type="text" id="completedWorkUrl" placeholder="https://sharing.clickup.com/.../">
        </div>"""

if "completedWorkUrl" not in html:
    html = html.replace(target_html, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

# 3. Patch client-portal-manager/js/app.js
filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    cjs = f.read()

if 'completedWorkUrl:' not in cjs:
    cjs = cjs.replace('campaignBriefUrl: document.getElementById("campaignBriefUrl"),', 'campaignBriefUrl: document.getElementById("campaignBriefUrl"),\n  completedWorkUrl: document.getElementById("completedWorkUrl"),')
    cjs = cjs.replace('campaignBriefUrl: "",', 'campaignBriefUrl: "",\n      completedWorkUrl: "",')
    with open(filepath, 'w') as f:
        f.write(cjs)
    print("Patched client-portal-manager/js/app.js")

# 4. Patch portal/index.html
filepath = 'portal/index.html'
with open(filepath, 'r') as f:
    phtml = f.read()

nav_target = """        <button class="nav-btn" data-target="view-assets" id="navAssets" style="display:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          Brand Assets
        </button>"""

nav_new = nav_target + """
        <button class="nav-btn" data-target="view-completed" id="navCompleted" style="display:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Completed Work
        </button>"""

section_target = """      <!-- ASSETS VIEW -->
      <section id="view-assets" class="view-section">"""

section_new = """      <!-- COMPLETED WORK VIEW -->
      <section id="view-completed" class="view-section">
        <header class="view-header">
          <h2>Completed Work</h2>
          <p>An archive of final deliverables and completed tasks.</p>
        </header>
        <div class="iframe-wrapper full-height">
          <iframe id="completedIframe" src="" frameborder="0"></iframe>
        </div>
      </section>

""" + section_target

if 'id="navCompleted"' not in phtml:
    phtml = phtml.replace(nav_target, nav_new)
    phtml = phtml.replace(section_target, section_new)
    with open(filepath, 'w') as f:
        f.write(phtml)
    print("Patched portal/index.html")

# 5. Patch portal/js/app.js
filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    pjs = f.read()

if 'navCompleted' not in pjs:
    target_iframe = """  setupIframe("navCampaign", "campaignIframe", config.campaignBriefUrl);"""
    
    new_iframe = target_iframe + """
  setupIframe("navCompleted", "completedIframe", config.completedWorkUrl);"""
    
    pjs = pjs.replace(target_iframe, new_iframe)
    with open(filepath, 'w') as f:
        f.write(pjs)
    print("Patched portal/js/app.js")

