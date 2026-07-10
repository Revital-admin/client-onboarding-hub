import os

# 1. Patch app.js schema
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

if 'campaignBriefUrl:' not in js:
    js = js.replace('calendarEmbedUrl: "",', 'calendarEmbedUrl: "",\n      campaignBriefUrl: "",')
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js schema")

# 2. Patch client-portal-manager/index.html
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target_html = """        <div class="form-group">
          <label for="calendarEmbedUrl">Content Calendar (ClickUp Embed)</label>
          <input type="text" id="calendarEmbedUrl" placeholder="https://sharing.clickup.com/.../">
        </div>"""

new_html = target_html + """

        <div class="form-group">
          <label for="campaignBriefUrl">Campaign Briefs (ClickUp/GDoc Embed)</label>
          <input type="text" id="campaignBriefUrl" placeholder="https://sharing.clickup.com/.../">
        </div>"""

if "campaignBriefUrl" not in html:
    html = html.replace(target_html, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

# 3. Patch client-portal-manager/js/app.js
filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    cjs = f.read()

if 'campaignBriefUrl:' not in cjs:
    cjs = cjs.replace('calendarEmbedUrl: document.getElementById("calendarEmbedUrl"),', 'calendarEmbedUrl: document.getElementById("calendarEmbedUrl"),\n  campaignBriefUrl: document.getElementById("campaignBriefUrl"),')
    cjs = cjs.replace('calendarEmbedUrl: "",', 'calendarEmbedUrl: "",\n      campaignBriefUrl: "",')
    with open(filepath, 'w') as f:
        f.write(cjs)
    print("Patched client-portal-manager/js/app.js")

# 4. Patch portal/index.html
filepath = 'portal/index.html'
with open(filepath, 'r') as f:
    phtml = f.read()

nav_target = """        <button class="nav-btn" data-target="view-calendar" id="navCalendar" style="display:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Content Calendar
        </button>"""

nav_new = nav_target + """
        <button class="nav-btn" data-target="view-campaign" id="navCampaign" style="display:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Campaign Briefs
        </button>"""

section_target = """      <!-- ASSETS VIEW -->
      <section id="view-assets" class="view-section">"""

section_new = """      <!-- CAMPAIGN VIEW -->
      <section id="view-campaign" class="view-section">
        <header class="view-header">
          <h2>Campaign Briefs</h2>
          <p>Review and approve the active strategy briefs.</p>
        </header>
        <div class="iframe-wrapper full-height">
          <iframe id="campaignIframe" src="" frameborder="0"></iframe>
        </div>
      </section>

""" + section_target

if 'id="navCampaign"' not in phtml:
    phtml = phtml.replace(nav_target, nav_new)
    phtml = phtml.replace(section_target, section_new)
    with open(filepath, 'w') as f:
        f.write(phtml)
    print("Patched portal/index.html")

# 5. Patch portal/js/app.js
filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    pjs = f.read()

if 'navCampaign' not in pjs:
    target_iframe = """  setupIframe("navProjects", "projectsIframe", config.projectsEmbedUrl);
  setupIframe("navCalendar", "calendarIframe", config.calendarEmbedUrl);"""
    
    new_iframe = target_iframe + """
  setupIframe("navCampaign", "campaignIframe", config.campaignBriefUrl);"""
    
    pjs = pjs.replace(target_iframe, new_iframe)
    with open(filepath, 'w') as f:
        f.write(pjs)
    print("Patched portal/js/app.js")

