import re

filepath = 'portal/index.html'
with open(filepath, 'r') as f:
    html = f.read()

handler = """
<script>
window.addEventListener('error', function(e) {
  document.getElementById('loader').innerHTML = '<h2 style="color:red;">Error</h2><p>' + e.message + ' at line ' + e.lineno + '</p>';
});
</script>
"""

if "window.addEventListener('error'" not in html:
    html = html.replace('<head>', '<head>' + handler)

with open(filepath, 'w') as f:
    f.write(html)
print("Injected global error handler into portal/index.html")

