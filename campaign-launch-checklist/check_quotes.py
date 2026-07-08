def check(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for quote in ['"', "'", "`"]:
        count = content.count(quote)
        if count % 2 != 0:
            print(f"Unclosed {quote} in {filepath}")

check('js/app.js')
