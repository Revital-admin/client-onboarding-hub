import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    html = f.read()

target1 = 'import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";'
target2 = 'const analytics = getAnalytics(app);'

html = html.replace(target1, '')
html = html.replace(target2, '')

with open(filepath, 'w') as f:
    f.write(html)
print("Removed Analytics from index.html")
