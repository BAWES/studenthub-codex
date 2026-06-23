with open('src/app/styles.css') as f:
    lines = f.readlines()

# Find all lines where stripped == '}' and the next non-blank, 
# non-comment line starts with '.' or '#' (a CSS rule) 
# but is NOT inside a media query or other nested context
issues = []
for i in range(len(lines)):
    stripped = lines[i].strip()
    if stripped == '}':
        # Look at next non-blank line
        nxt = i + 1
        while nxt < len(lines) and lines[nxt].strip() in ('', '/*'):
            nxt += 1
        if nxt < len(lines):
            nxt_stripped = lines[nxt].strip()
            # If next line is a CSS selector, check if previous was also a close
            if nxt_stripped and not nxt_stripped.startswith('/') and not nxt_stripped.startswith('@'):
                prev = i - 1
                while prev >= 0 and lines[prev].strip() == '':
                    prev -= 1
                if prev >= 0 and lines[prev].strip() == '}':
                    issues.append((i+1, nxt_stripped))

if issues:
    print(f'Found {len(issues)} stray braces:')
    for line_num, next_rule in issues:
        print(f'  Line {line_num}: stray }} before "{next_rule}"')
else:
    print('No stray braces found')
