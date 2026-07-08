import re

with open('js/app.js', 'r') as f:
    content = f.read()

replacements = [
    ('PAID_ADS_AUDIT_DATA', 'EMAIL_AUDIT_DATA'),
    ('paidAdsAudit', 'emailAudit'),
    ('pa-input', 'em-input'),
    ('paAdSpend', 'emListSize'),
    ('paTargetRoas', 'emOpenRate'),
    ('paVulnerabilities', 'emOpportunities'),
    ('paActions', 'emActions'),
    ('adSpend', 'listSize'),
    ('roas', 'openRate'),
    ('vulnerabilities', 'opportunities'),
    ('Paid Ads', 'Email Marketing'),
    ('seo-checklist', 'email-audit')
]

for old, new in replacements:
    content = content.replace(old, new)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Done")
