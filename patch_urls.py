import os

# 1. Patch app.js
filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

old_config = """      feedbackFormUrl: "",
      brandAssetsUrl: "”"""

new_config = """      feedbackFormUrl: "",
      revisionFormUrl: "",
      contentRequestFormUrl: "",
      brandAssetsUrl: \"\"\""""

if "feedbackFormUrl:" in js and "brandAssetsUrl:" in js:
    # Just replacing exactly is tricky, let's use replace instead
    js = js.replace('feedbackFormUrl: "",', 'feedbackFormUrl: "",\n      revisionFormUrl: "",\n      contentRequestFormUrl: "",')
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js")

# 2. Patch client-portal-manager/index.html
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

old_html = """        <div class="form-group">
          <label for="feedbackFormUrl">Feedback Form (ClickUp Form)</label>
          <input type="text" id="feedbackFormUrl" placeholder="https://forms.clickup.com/.../">
        </div>"""

new_html = old_html + """
        
        <div class="form-group">
          <label for="revisionFormUrl">Submit a Revision Form (ClickUp Form)</label>
          <input type="text" id="revisionFormUrl" placeholder="https://forms.clickup.com/.../">
        </div>

        <div class="form-group">
          <label for="contentRequestFormUrl">Content Request Form (ClickUp Form)</label>
          <input type="text" id="contentRequestFormUrl" placeholder="https://forms.clickup.com/.../">
        </div>"""

if old_html in html:
    html = html.replace(old_html, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

# 3. Patch client-portal-manager/js/app.js
filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    cjs = f.read()

cjs = cjs.replace('feedbackFormUrl: document.getElementById("feedbackFormUrl"),', 'feedbackFormUrl: document.getElementById("feedbackFormUrl"),\n  revisionFormUrl: document.getElementById("revisionFormUrl"),\n  contentRequestFormUrl: document.getElementById("contentRequestFormUrl"),')
cjs = cjs.replace('feedbackFormUrl: "",', 'feedbackFormUrl: "",\n      revisionFormUrl: "",\n      contentRequestFormUrl: "",')

with open(filepath, 'w') as f:
    f.write(cjs)
print("Patched client-portal-manager/js/app.js")
