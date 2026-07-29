import sys

with open('frontend/src/app/magia/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = '<Card className="p-6 border-t-4 border-t-blue-500">'
end_marker = '</Card>'

idx1 = code.find(start_marker)
if idx1 == -1:
    print('Start marker not found')
    sys.exit(1)

# Find the end of that specific card.
# Wait, this card contains nested divs, but no nested Cards.
# So the first </Card> after idx1 is the end of this card!
idx2 = code.find(end_marker, idx1)
if idx2 == -1:
    print('End marker not found')
    sys.exit(1)

code = code[:idx1] + code[idx2 + len(end_marker):]

with open('frontend/src/app/magia/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Successfully removed Secuenciacion card from magia!')
