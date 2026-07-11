import os

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

# Remove lines 6 to 30 completely
import re
js = re.sub(r'// ── Firebase Configuration ──.*?const db = firebase\.firestore\(\);\n', '', js, flags=re.DOTALL)

# Replace db.collection("hub").doc("settings").set with window.firebaseSetDoc
target1 = """  if (db && db.collection) {
    db.collection("hub").doc("settings").set({ admins: globalAdmins })
      .catch(err => console.error("Error saving admins:", err));
  }"""
new_target1 = """  if (window.firebaseSetDoc && window.firebaseDb && window.firebaseDoc) {
    window.firebaseSetDoc(window.firebaseDoc(window.firebaseDb, "hub", "settings"), { admins: globalAdmins })
      .catch(err => console.error("Error saving admins:", err));
  }"""
js = js.replace(target1, new_target1)

target2 = """    if (db && db.collection) {
      db.collection("hub").doc("quickLinks").set({ links: savedLinks })
        .catch(err => console.error("Error saving quick links:", err));
    }"""
new_target2 = """    if (window.firebaseSetDoc && window.firebaseDb && window.firebaseDoc) {
      window.firebaseSetDoc(window.firebaseDoc(window.firebaseDb, "hub", "quickLinks"), { links: savedLinks })
        .catch(err => console.error("Error saving quick links:", err));
    }"""
js = js.replace(target2, new_target2)

target3 = """  if (db && db.collection) {
    db.collection("hub").doc("quickLinks").onSnapshot((doc) => {
      if (doc.exists) {
        savedLinks = doc.data().links || [];
        renderQuickLinks();
      }
    });
  }"""
new_target3 = """  if (window.firebaseOnSnapshot && window.firebaseDb && window.firebaseDoc) {
    window.firebaseOnSnapshot(window.firebaseDoc(window.firebaseDb, "hub", "quickLinks"), (docSnap) => {
      if (docSnap.exists()) {
        savedLinks = docSnap.data().links || [];
        renderQuickLinks();
      }
    });
  }"""
js = js.replace(target3, new_target3)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched app.js db references")
