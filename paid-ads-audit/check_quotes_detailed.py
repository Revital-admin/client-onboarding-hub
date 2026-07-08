def check(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    count = content.count('`')
    print(f"Backticks count: {count}")
    if count % 2 != 0:
        print("Unclosed backtick!")
check('js/app.js')
