import os

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

target = """  // 3. Save to Firebase
  if (window.firebaseSetDoc && window.firebaseDoc && window.firebaseDb) {
    const docRef = window.firebaseDoc(window.firebaseDb, "agency", "clientsDb");
    // Parse/stringify to clean iframe prototypes so Firebase doesn't crash on "custom Object"
    const cleanDb = JSON.parse(JSON.stringify(clientsDb));
    window.firebaseSetDoc(docRef, cleanDb).then(() => {
      if (indicator) {
        indicator.innerHTML = "Saved to Cloud ✅";
        setTimeout(() => { indicator.style.opacity = "0"; }, 2000);
      }
    }).catch(err => {
      console.error("Firebase save failed:", err);
      if (indicator) {
        indicator.innerHTML = "Cloud Error ❌";
        setTimeout(() => { indicator.style.opacity = "0"; }, 3000);
      }
    });
  }"""

new_target = """  // 3. Save to Firebase
  if (window.firebaseSetDoc && window.firebaseDoc && window.firebaseDb) {
    const docRef = window.firebaseDoc(window.firebaseDb, "agency", "clientsDb");
    const cleanDb = JSON.parse(JSON.stringify(clientsDb));
    
    // Add a manual timeout to detect hanging
    let resolved = false;
    setTimeout(() => {
      if (!resolved && indicator) {
        indicator.innerHTML = "Cloud Timeout ❌";
        setTimeout(() => { indicator.style.opacity = "0"; }, 3000);
      }
    }, 10000);

    window.firebaseSetDoc(docRef, cleanDb).then(() => {
      resolved = true;
      if (indicator) {
        indicator.innerHTML = "Saved to Cloud ✅";
        setTimeout(() => { indicator.style.opacity = "0"; }, 2000);
      }
    }).catch(err => {
      resolved = true;
      console.error("Firebase save failed:", err);
      if (indicator) {
        indicator.innerHTML = "Cloud Error ❌: " + err.message;
        setTimeout(() => { indicator.style.opacity = "0"; }, 5000);
      }
    });
  } else {
    // Firebase is not loaded!
    if (indicator) {
      indicator.innerHTML = "Firebase Not Loaded ❌";
      setTimeout(() => { indicator.style.opacity = "0"; }, 3000);
    }
  }"""

if target in js:
    js = js.replace(target, new_target)
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched app.js with debug logic for saveDatabase")
else:
    print("Could not find target string in app.js")

