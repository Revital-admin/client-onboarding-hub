import re

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

new_logic = """function fetchCloudflareProfile() {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if (data && data.email && data.email !== 'Guest') {
        const userEmailEl = document.getElementById('userEmail');
        const userAvatarEl = document.getElementById('userAvatar');
        const userRoleEl = document.getElementById('userRole');
        
        // Extract username from email
        let displayName = data.email;
        if (data.email.includes('@')) {
          const username = data.email.split('@')[0];
          // Capitalize first letter
          displayName = username.charAt(0).toUpperCase() + username.slice(1);
          
          if (displayName.toLowerCase() === 'ronald') {
            if (userRoleEl) userRoleEl.style.display = 'block';
          }
        }
        
        if (userEmailEl) userEmailEl.textContent = displayName;
        if (userAvatarEl) {
          userAvatarEl.textContent = displayName.charAt(0).toUpperCase();
        }
      }
    })
    .catch(err => console.log('Running locally or no Cloudflare Access headers present.', err));
}"""

js = re.sub(r'function fetchCloudflareProfile\(\).*?\.catch\(err => console\.log\(\'Running locally or no Cloudflare Access headers present\.\', err\)\);\n\}', new_logic, js, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched admin logic 2")

