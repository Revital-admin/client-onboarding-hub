import os

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

target = """  document.getElementById("dashHeroTargetUrl").textContent = client.targetUrl || "No website logged yet";
  document.getElementById("dashHeroCreatedDate").textContent = client.createdDate || "N/A";"""

new_target = """  const heroUrl = document.getElementById("dashHeroTargetUrl"); if (heroUrl) heroUrl.textContent = client.targetUrl || "No website logged yet";
  const heroDate = document.getElementById("dashHeroCreatedDate"); if (heroDate) heroDate.textContent = client.createdDate || "N/A";"""

js = js.replace(target, new_target)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched renderDashboard safeties")
