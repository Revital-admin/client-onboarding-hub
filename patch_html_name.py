import re

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Replace Ronald with Loading...
html = re.sub(r'<span id="userEmail"[^>]*>Ronald</span>', '<span id="userEmail" style="font-size: 13px; font-weight: 500; color: var(--color-text);">Loading...</span>', html)
# Replace R with ?
html = re.sub(r'<div id="userAvatar"[^>]*>R</div>', '<div id="userAvatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">?</div>', html)

with open(filepath, 'w') as f:
    f.write(html)
print("Patched HTML initial loading state")

