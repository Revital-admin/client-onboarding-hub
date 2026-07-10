import os

filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    js = f.read()

target = """  copyLinkBtn.addEventListener("click", () => {
    magicLinkInput.select();
    document.execCommand("copy");
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "Copied!";
    setTimeout(() => {
      copyLinkBtn.textContent = originalText;
    }, 2000);
  });"""

new_target = """  copyLinkBtn.addEventListener("click", () => {
    magicLinkInput.select();
    
    // Modern clipboard API fallback to execCommand
    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(magicLinkInput.value);
        } else {
          document.execCommand("copy");
        }
        
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = "Copied!";
        setTimeout(() => {
          copyLinkBtn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
        alert('Failed to copy. Please manually select and copy the link.');
      }
    };
    
    copyToClipboard();
  });"""

if target in js:
    js = js.replace(target, new_target)
    with open(filepath, 'w') as f:
        f.write(js)
    print("Patched client-portal-manager/js/app.js")

