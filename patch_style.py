import os

filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target = '<h1 class="site-title">Portal Manager</h1>'
new_html = '<h1 class="site-title">Portal <em>Manager</em></h1>'

if target in html:
    html = html.replace(target, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched client-portal-manager/index.html")

filepath_css = 'client-portal-manager/css/style.css'
with open(filepath_css, 'a') as f:
    f.write("""
/* Extra Color Pop for Portal Manager */
.step-card {
  position: relative;
  overflow: hidden;
}
.step-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent, #f68d5f), transparent);
  opacity: 0.5;
}
""")
print("Patched CSS")

