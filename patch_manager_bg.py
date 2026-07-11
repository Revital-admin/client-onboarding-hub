import re

filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Make body transparent
if '<body style="background: transparent;">' not in html:
    html = html.replace('<body>', '<body style="background: transparent;">')

with open(filepath, 'w') as f:
    f.write(html)
print("Made portal manager body transparent")

