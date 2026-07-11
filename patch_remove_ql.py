import re

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

# Remove the call
call_target = '  try { initQuickLinks(); } catch(e) { console.error("QuickLinks Error:", e); }\n'
if call_target in js:
    js = js.replace(call_target, '')

# Remove the function using regex
# Look for: // ── Team Quick Links Logic ── up to the end of the initQuickLinks function
pattern = re.compile(r'// ── Team Quick Links Logic ──.*?function initQuickLinks\(\) \{.*?\n\}\n\n', re.DOTALL)
js = re.sub(pattern, '', js)

with open(filepath, 'w') as f:
    f.write(js)
print("Removed initQuickLinks")
