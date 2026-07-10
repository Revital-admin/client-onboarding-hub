import os
import glob

# Find all app.js or script.js in subdirectories
for filepath in glob.glob("*/js/app.js") + glob.glob("*/script.js"):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace the risky block
    target1 = """let isEmbedded = (window.parent && typeof window.parent.getActiveClient === 'function');
let parentClient = null;
if (isEmbedded) {
  parentClient = window.parent.getActiveClient();
}"""
    
    target2 = """let isEmbedded = (window.parent && typeof window.parent.getActiveClient === 'function');
let parentClient = null;
if (isEmbedded) {
    parentClient = window.parent.getActiveClient();
}"""

    safe_block = """let isEmbedded = false;
let parentClient = null;
try {
  if (window.parent && typeof window.parent.getActiveClient === 'function') {
    isEmbedded = true;
    parentClient = window.parent.getActiveClient();
  }
} catch (e) {
  console.log("Embedded check bypassed due to CORS");
}"""

    if target1 in content:
        content = content.replace(target1, safe_block)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
    elif target2 in content:
        content = content.replace(target2, safe_block)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

