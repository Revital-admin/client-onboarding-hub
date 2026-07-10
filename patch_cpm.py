import os

filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    js = f.read()

target = """// Connect to parent Hub state
const parentDb = window.parent.clientsDb;
const parentSave = window.parent.saveDatabase;
const getActiveClient = window.parent.getActiveClient;
const activeClientName = window.parent.activeClientName;"""

new_target = """// Connect to parent Hub state safely
let parentDb, parentSave, getActiveClient, activeClientName;
try {
  parentDb = window.parent.clientsDb;
  parentSave = window.parent.saveDatabase;
  getActiveClient = window.parent.getActiveClient;
  activeClientName = window.parent.activeClientName;
} catch (e) {
  console.log("CORS blocked parent access");
}"""

if target in js:
    js = js.replace(target, new_target)
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched client-portal-manager/js/app.js")

