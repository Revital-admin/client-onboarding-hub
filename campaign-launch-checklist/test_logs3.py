from playwright.sync_api import sync_playwright

def get_logs():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        files = [
            "js/data.js", "js/app.js",
            "../email-marketing-audit/js/data.js", "../email-marketing-audit/js/app.js",
            "../onboarding-checklist/js/data.js", "../onboarding-checklist/js/app.js",
            "../brand-vault/js/data.js", "../brand-vault/js/app.js",
            "../uxui-audit/js/data.js", "../uxui-audit/js/app.js",
            "../seo-audit/js/data.js", "../seo-audit/js/app.js",
            "../social-audit/js/data.js", "../social-audit/js/app.js",
            "../content-audit/js/data.js", "../content-audit/js/app.js"
        ]
        
        for file in files:
            page = browser.new_page()
            page.on("pageerror", lambda err, f=file: print(f"ERROR in {f}: {err.message}"))
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head><script src="{file}"></script></head>
            <body></body>
            </html>
            """
            with open("temp.html", "w") as f:
                f.write(html_content)
                
            page.goto("http://localhost:8081/paid-ads-audit/temp.html")
            page.wait_for_timeout(200)
            page.close()
            
        browser.close()

get_logs()
