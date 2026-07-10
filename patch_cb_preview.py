import os

filepath = 'creative-brief-generator/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target = 'id="previewContainer" class="preview-panel"'
new_target = 'id="previewContainer" class="preview-panel markdown-preview"'

if target in html:
    html = html.replace(target, new_target)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched creative-brief-generator/index.html")

