def check(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '//' in line:
            line = line.split('//')[0]
        for char in line:
            if char == '{':
                stack.append(i+1)
            elif char == '}':
                if stack:
                    stack.pop()
    if stack:
        print("Unclosed braces at lines:", stack)

check('js/app.js')
