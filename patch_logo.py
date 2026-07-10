import os

# 1. Patch HTML
filepath = 'client-portal-manager/index.html'
with open(filepath, 'r') as f:
    html = f.read()

target = """        <div class="form-group">
          <label for="clientLogoUrl">Client Logo URL (Transparent PNG)</label>
          <input type="text" id="clientLogoUrl" placeholder="https://example.com/logo.png">
        </div>"""

new_html = """        <div class="form-group">
          <label>Client Logo (Drag & Drop)</label>
          <div id="logoDropZone" class="drop-zone">
            <div id="dropZoneText">Drop transparent PNG here<br><small>or click to upload</small></div>
            <img id="logoPreview" src="" alt="Logo Preview" style="display:none; max-width: 100%; max-height: 80px; pointer-events: none;">
            <input type="file" id="logoFileInput" accept="image/png, image/jpeg, image/webp" style="display:none;">
          </div>
          <button id="btnEyedropper" class="btn-secondary" style="margin-top: 12px; width: 100%; display:none; justify-content: center; align-items: center; gap: 6px; padding: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            Pick Primary Color
          </button>
          <button id="btnEyedropperSec" class="btn-secondary" style="margin-top: 8px; width: 100%; display:none; justify-content: center; align-items: center; gap: 6px; padding: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            Pick Secondary Color
          </button>
          <input type="hidden" id="clientLogoUrl">
        </div>"""

if target in html:
    html = html.replace(target, new_html)
    with open(filepath, 'w') as f:
        f.write(html)
    print("Patched HTML")
else:
    print("Target HTML not found.")

# 2. Patch CSS
filepath = 'client-portal-manager/css/style.css'
with open(filepath, 'a') as f:
    f.write("""
/* Drag and Drop Zone */
.drop-zone {
  width: 100%;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 24px 12px;
  text-align: center;
  color: var(--color-text-secondary);
  background: rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drop-zone:hover, .drop-zone.dragover {
  border-color: var(--color-primary);
  background: rgba(16, 185, 129, 0.1);
}
.drop-zone small {
  font-size: 0.75rem;
  opacity: 0.7;
}
""")
print("Patched CSS")

