from selenium import webdriver
from selenium.webdriver.safari.options import Options
import time

driver = webdriver.Safari()
driver.get("http://localhost:8000/campaign-launch-checklist/index.html")
time.sleep(2)
for entry in driver.get_log('browser'):
    print(entry)
driver.quit()
