import re

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

logout_html = """          <span id="userEmail" style="font-size: 13px; color: var(--text-muted);">Ronald</span>
          <a href="/cdn-cgi/access/logout" id="logoutBtn" title="Log Out" style="margin-left: 8px; color: var(--color-danger, #ef4444); text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: background 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </a>"""

if 'id="logoutBtn"' not in html:
    html = html.replace('<span id="userEmail" style="font-size: 13px; color: var(--text-muted);">Ronald</span>', logout_html)

with open(filepath, 'w') as f:
    f.write(html)
print("Added logout button")

