import re

filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

# Remove bg-grid
html = re.sub(r'<div class="bg-grid"></div>\s*', '', html)

# Change container to main-content
html = re.sub(r'<main class="container" style="[^"]*">', '<main class="main-content" style="max-width: 100%;">', html)
html = re.sub(r'<main class="container">', '<main class="main-content" style="max-width: 100%;">', html)

with open(filepath, 'w') as f:
    f.write(html)
print("Patched client-portal-manager")

