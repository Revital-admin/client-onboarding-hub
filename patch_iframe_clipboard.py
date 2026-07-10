import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Replace all iframes to include allow="clipboard-write"
import re
new_html = re.sub(r'<iframe([^>]+)>', lambda m: '<iframe' + m.group(1) + ' allow="clipboard-write">' if 'allow="clipboard-write"' not in m.group(1) else m.group(0), html)

if new_html != html:
    with open(filepath, 'w') as f:
        f.write(new_html)
    print("Patched index.html with clipboard-write permissions")
else:
    print("No changes made")
