import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Add to HAS_IFRAME
has_iframe_marker = '  "tab-copywriting": true,'
has_iframe_new = """  "tab-meetingnotes": true,
  "tab-reportarchive": true,
  "tab-brandassetkit": true,
  "tab-budgetpacing": true,
"""
if "tab-meetingnotes" not in content:
    content = content.replace(has_iframe_marker, has_iframe_marker + "\n" + has_iframe_new)

# 2. Add to the switch statement
switch_marker = """    case "tab-copywriting":
      renderCopywriting();
      break;"""
switch_new = """    case "tab-meetingnotes":
      setIframeAbsoluteSrc('#tab-meetingnotes iframe', "meeting-notes-logger/index.html");
      break;
    case "tab-reportarchive":
      setIframeAbsoluteSrc('#tab-reportarchive iframe', "monthly-report-archive/index.html");
      break;
    case "tab-brandassetkit":
      setIframeAbsoluteSrc('#tab-brandassetkit iframe', "brand-asset-kit/index.html");
      break;
    case "tab-budgetpacing":
      setIframeAbsoluteSrc('#tab-budgetpacing iframe', "budget-pacing-tracker/index.html");
      break;
"""
if "tab-meetingnotes\":" not in content:
    content = content.replace(switch_marker, switch_marker + "\n" + switch_new)

with open('app.js', 'w') as f:
    f.write(content)

print("Done patching app.js tabs")
