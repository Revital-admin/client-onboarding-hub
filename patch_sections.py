import re

with open('index.html', 'r') as f:
    content = f.read()

# Remove the bad iframes I accidentally inserted earlier, if any.
content = content.replace('''        <div class="iframe-wrapper full-height" id="view-meetingnotes" style="display: none;">
          <iframe src="meeting-notes-logger/index.html"></iframe>
        </div>
        <div class="iframe-wrapper full-height" id="view-reportarchive" style="display: none;">
          <iframe src="monthly-report-archive/index.html"></iframe>
        </div>
        <div class="iframe-wrapper full-height" id="view-brandassetkit" style="display: none;">
          <iframe src="brand-asset-kit/index.html"></iframe>
        </div>
        <div class="iframe-wrapper full-height" id="view-budgetpacing" style="display: none;">
          <iframe src="budget-pacing-tracker/index.html"></iframe>
        </div>''', '')

# Insert the correct <section> wrappers
section_marker = '      <!-- ── SECTION 8: COPYWRITING ASSISTANT ── -->\n      <section id="tab-copywriting"'
sections_new = """      <!-- ── NEW MODULES ── -->
      <section id="tab-meetingnotes" class="tab-section" style="width: 100%;">
        <iframe src="meeting-notes-logger/index.html" style="width: 100%; height: 90vh; border: none; border-radius: var(--radius-lg); background: transparent;"></iframe>
      </section>
      <section id="tab-reportarchive" class="tab-section" style="width: 100%;">
        <iframe src="monthly-report-archive/index.html" style="width: 100%; height: 90vh; border: none; border-radius: var(--radius-lg); background: transparent;"></iframe>
      </section>
      <section id="tab-brandassetkit" class="tab-section" style="width: 100%;">
        <iframe src="brand-asset-kit/index.html" style="width: 100%; height: 90vh; border: none; border-radius: var(--radius-lg); background: transparent;"></iframe>
      </section>
      <section id="tab-budgetpacing" class="tab-section" style="width: 100%;">
        <iframe src="budget-pacing-tracker/index.html" style="width: 100%; height: 90vh; border: none; border-radius: var(--radius-lg); background: transparent;"></iframe>
      </section>
"""

content = content.replace(section_marker, sections_new + section_marker)

with open('index.html', 'w') as f:
    f.write(content)

print("Done patching index.html sections.")
