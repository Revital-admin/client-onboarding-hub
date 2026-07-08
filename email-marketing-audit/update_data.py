import re

with open('js/data.js', 'r') as f:
    content = f.read()

content = content.replace('EMAIL_AUDIT_DATA =', 'STEPS =')
content = content.replace('categoryId:', 'step:')
content = content.replace('items:', 'subs:')

with open('js/data.js', 'w') as f:
    f.write(content)

print("Updated data.js")
