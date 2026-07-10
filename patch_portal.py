import os

filepath = 'portal/index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Add to sidebar
target = """      <!-- Account Manager Widget -->"""

new_widget = """      <!-- Quick Actions Widget -->
      <div class="sidebar-widget" id="quickActionsWidget" style="display:none;">
        <h3>Quick Actions</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
          <a href="#" id="btnRevision" class="btn-secondary" target="_blank" style="display:none; text-align:left; justify-content: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Submit a Revision
          </a>
          <a href="#" id="btnContentRequest" class="btn-secondary" target="_blank" style="display:none; text-align:left; justify-content: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Submit Content Request
          </a>
        </div>
      </div>

""" + target

if target in html:
    html = html.replace(target, new_widget)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched portal/index.html")

# Patch portal/js/app.js
filepath = 'portal/js/app.js'
with open(filepath, 'r') as f:
    js = f.read()

js_target_1 = """const btnBookCall = document.getElementById("btnBookCall");"""
js_new_1 = js_target_1 + """
const btnRevision = document.getElementById("btnRevision");
const btnContentRequest = document.getElementById("btnContentRequest");
const quickActionsWidget = document.getElementById("quickActionsWidget");
"""
js = js.replace(js_target_1, js_new_1)

js_target_2 = """  const btnFeedback = document.getElementById("btnFeedback");
  if (config.feedbackFormUrl) {
    btnFeedback.style.display = "inline-flex";
    btnFeedback.href = config.feedbackFormUrl;
  }"""
js_new_2 = js_target_2 + """

  let hasQuickActions = false;
  if (config.revisionFormUrl) {
    btnRevision.style.display = "inline-flex";
    btnRevision.href = config.revisionFormUrl;
    hasQuickActions = true;
  }
  if (config.contentRequestFormUrl) {
    btnContentRequest.style.display = "inline-flex";
    btnContentRequest.href = config.contentRequestFormUrl;
    hasQuickActions = true;
  }
  if (hasQuickActions) {
    quickActionsWidget.style.display = "block";
  }
"""
js = js.replace(js_target_2, js_new_2)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched portal/js/app.js")
