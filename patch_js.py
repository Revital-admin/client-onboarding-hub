import os

filepath = 'client-portal-manager/js/app.js'
with open(filepath, 'r') as f:
    js = f.read()

# 1. Update inputs object
js = js.replace('clientLogoUrl: document.getElementById("clientLogoUrl"),', 'clientLogoUrlInput: document.getElementById("clientLogoUrl"),')

# 2. Add DOM elements and logic
dom_target = """const secondaryColorInput = document.getElementById("secondaryColor");
const colorHexSecondaryText = document.getElementById("colorHexSecondary");"""
dom_new = dom_target + """
const logoDropZone = document.getElementById("logoDropZone");
const dropZoneText = document.getElementById("dropZoneText");
const logoPreview = document.getElementById("logoPreview");
const logoFileInput = document.getElementById("logoFileInput");
const btnEyedropper = document.getElementById("btnEyedropper");
const btnEyedropperSec = document.getElementById("btnEyedropperSec");
"""
js = js.replace(dom_target, dom_new)

init_target = """  Object.keys(inputs).forEach(key => {"""
init_new = """  // Load Logo
  if (config.clientLogoUrl) {
    logoPreview.src = config.clientLogoUrl;
    logoPreview.style.display = "block";
    dropZoneText.style.display = "none";
    if (window.EyeDropper) {
      btnEyedropper.style.display = "flex";
      btnEyedropperSec.style.display = "flex";
    }
  }

  // Setup Drag and Drop
  logoDropZone.addEventListener("click", () => logoFileInput.click());
  
  logoDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    logoDropZone.classList.add("dragover");
  });
  
  logoDropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    logoDropZone.classList.remove("dragover");
  });
  
  logoDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    logoDropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });
  
  logoFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  });

  // Setup Eyedroppers
  if (window.EyeDropper) {
    btnEyedropper.addEventListener("click", async () => {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        primaryColorInput.value = result.sRGBHex;
        colorHexText.textContent = result.sRGBHex;
        updateConfig("primaryColor", result.sRGBHex);
      } catch (e) {
        console.log("Eyedropper cancelled");
      }
    });

    btnEyedropperSec.addEventListener("click", async () => {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        secondaryColorInput.value = result.sRGBHex;
        colorHexSecondaryText.textContent = result.sRGBHex;
        updateConfig("secondaryColor", result.sRGBHex);
      } catch (e) {
        console.log("Eyedropper cancelled");
      }
    });
  }

""" + init_target
js = js.replace(init_target, init_new)

functions_target = """function updateConfig(key, value) {"""
functions_new = """function handleImageUpload(file) {
  if (!file.type.match('image.*')) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Compress image
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL("image/png");
      
      // Show Preview
      logoPreview.src = dataUrl;
      logoPreview.style.display = "block";
      dropZoneText.style.display = "none";
      
      // Show Eyedroppers if supported
      if (window.EyeDropper) {
        btnEyedropper.style.display = "flex";
        btnEyedropperSec.style.display = "flex";
      }
      
      // Save
      updateConfig("clientLogoUrl", dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

""" + functions_target

js = js.replace(functions_target, functions_new)

with open(filepath, 'w') as f:
    f.write(js)
print("Patched client-portal-manager/js/app.js")
