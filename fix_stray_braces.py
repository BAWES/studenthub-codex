with open('src/app/styles.css') as f:
    lines = f.readlines()

# Find and flag duplicate braces
remove_indices = set()
i = 0
while i < len(lines):
    stripped = lines[i].strip()
    if stripped == '}':
        # Look at next non-blank, non-comment line
        nxt = i + 1
        while nxt < len(lines) and (lines[nxt].strip() == '' or lines[nxt].strip().startswith('/*')):
            nxt += 1
        if nxt < len(lines):
            nxt_stripped = lines[nxt].strip()
            if nxt_stripped and not nxt_stripped.startswith('/') and not nxt_stripped.startswith('@') and not nxt_stripped.startswith('&') and not nxt_stripped.startswith('}') and not nxt_stripped.startswith('void'):
                # Check previous non-blank line also ended with '}'
                prev = i - 1
                while prev >= 0 and lines[prev].strip() == '':
                    prev -= 1
                if prev >= 0 and lines[prev].strip() == '}':
                    remove_indices.add(i)
    i += 1

print(f'Found {len(remove_indices)} stray braces to remove')
# Remove from highest to lowest to preserve indices
new_lines = [lines[i] for i in range(len(lines)) if i not in remove_indices]
with open('src/app/styles.css', 'w') as f:
    f.writelines(new_lines)
print(f'Removed. New total lines: {len(new_lines)}')
