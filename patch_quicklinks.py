import re

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

target = """          savedLinks = data.links;
          renderQuickLinks();"""

new_target = """          // Migration: Remove obsolete 'tracker' link
          savedLinks = data.links.filter(link => link.id !== 'tracker');
          renderQuickLinks();"""

if target in js:
    js = js.replace(target, new_target)
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched Firebase Quick Links")

target2 = """      savedLinks = JSON.parse(saved);
      if (!Array.isArray(savedLinks)) savedLinks = defaultLinks;"""

new_target2 = """      savedLinks = JSON.parse(saved);
      if (!Array.isArray(savedLinks)) {
        savedLinks = defaultLinks;
      } else {
        // Migration: Remove obsolete 'tracker' link from local cache too
        savedLinks = savedLinks.filter(link => link.id !== 'tracker');
      }"""

if target2 in js:
    js = js.replace(target2, new_target2)
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched LocalStorage Quick Links")

