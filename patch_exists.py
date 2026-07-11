import re

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

# Replace docSnap.exists() with docSnap.exists
js = js.replace('docSnap.exists()', 'docSnap.exists')

with open(filepath, 'w') as f:
    f.write(js)
print("Fixed docSnap.exists() in app.js")

