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
          let username = data.email.split('@')[0];
          // Replace dots and underscores with spaces
          username = username.replace(/[._]/g, ' ');
          // Capitalize each word
          displayName = username.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          
          if (displayName.toLowerCase() === 'ronald') {
            if (userRoleEl) userRoleEl.style.display = 'block';
          }
        }
        
        if (userEmailEl) userEmailEl.textContent = displayName;
        if (userAvatarEl) {
          userAvatarEl.textContent = displayName.charAt(0).toUpperCase();
        }
      } else {
        // Fallback for Guest
        const userEmailEl = document.getElementById('userEmail');
        const userAvatarEl = document.getElementById('userAvatar');
        if (userEmailEl) userEmailEl.textContent = "Team Member";
        if (userAvatarEl) userAvatarEl.textContent = "T";
      }
    })
    .catch(err => {
      console.log('Running locally or no Cloudflare Access headers present.', err);
      // Fallback
      const userEmailEl = document.getElementById('userEmail');
      const userAvatarEl = document.getElementById('userAvatar');
      if (userEmailEl && userEmailEl.textContent === 'Ronald') {
         userEmailEl.textContent = "Admin";
      }
    });
}"""

js = re.sub(r'function fetchCloudflareProfile\(\).*?\.catch\(err => console\.log\(\'Running locally or no Cloudflare Access headers present\.\', err\)\);\n\}', new_logic, js, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched multiple names logic")

