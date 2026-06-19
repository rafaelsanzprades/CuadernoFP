"""Extract text from RF 01 TodoFP PDFs."""
import pymupdf
import os
import sys

pdf_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'RF 01 TodoFP')
pdf_dir = os.path.abspath(pdf_dir)

for f in sorted(os.listdir(pdf_dir)):
    if not f.endswith('.pdf'):
        continue
    path = os.path.join(pdf_dir, f)
    try:
        doc = pymupdf.open(path)
        text = ''
        for page in doc:
            text += page.get_text()
        out = os.path.join(pdf_dir, f.replace('.pdf', '.txt'))
        with open(out, 'w', encoding='utf-8') as fh:
            fh.write(text)
        print(f'OK: {f} -> {len(text)} chars, {len(doc)} pages')
    except Exception as e:
        print(f'ERROR: {f} -> {e}', file=sys.stderr)
