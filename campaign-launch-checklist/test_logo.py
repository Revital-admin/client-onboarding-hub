from playwright.sync_api import sync_playwright
def get_logs():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.on("pageerror", lambda err: print(f"ERROR: {err.message}"))
        
        html_content = """
        <!DOCTYPE html>
        <html>
        <head><script src="js/logo.js"></script></head>
        <body></body>
        </html>
        """
        with open("temp.html", "w") as f:
            f.write(html_content)
            
        page.goto("http://localhost:8081/paid-ads-audit/temp.html")
        page.wait_for_timeout(200)
        browser.close()
get_logs()
