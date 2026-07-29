import os
import re

app_dir = 'c:\\GD-rsp\\APP-CuadernoFP\\frontend\\src\\app'
for root, dirs, files in os.walk(app_dir):
    if 'page.tsx' in files:
        filepath = os.path.join(root, 'page.tsx')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            original = content

        # Standardize main
        content = re.sub(r'<main\s+(?:id="main-content"\s+tabIndex=\{-1\}\s+)?className="flex-1[^"]*">',
                         r'<main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">',
                         content)

        # Handle specific cases like normativa
        content = re.sub(r'<div className="flex-1 p-8 overflow-y-auto scrollbar-hide relative">',
                         r'<main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide relative">',
                         content)
                         
        content = re.sub(r'<div className="flex-1 p-8 overflow-y-auto scrollbar-hide">',
                         r'<main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">',
                         content)

        # Standardize MotionWrapper exactly: <MotionWrapper className="w-full space-y-4 pb-12">
        # Some are empty, some have space-y-4, some w-full space-y-3.
        # Find any <MotionWrapper className="..."> and replace it if it's the main wrapper.
        # It's tricky to target ONLY the first MotionWrapper.
        # Let's replace the first occurrence after `<main` or similar.
        
        # We can just replace the MotionWrapper tag entirely IF it's followed by a div and then an h1.
        # Or simply replace `<MotionWrapper className="[^"]*">` if we can assume it's the main wrapper.
        
        def replace_wrapper(m):
            return r'<MotionWrapper className="w-full space-y-6 pb-12">'
        
        content = re.sub(r'<MotionWrapper(?: className="[^"]*")?>\s*(?:<div[^>]*>\s*)?(?:<div[^>]*>\s*)?<h1 className="text-2xl font-extrabold',
                         r'<MotionWrapper className="w-full space-y-6 pb-12">\n            <div>\n              <h1 className="text-2xl font-extrabold',
                         content, count=1)

        content = re.sub(r'<MotionWrapper(?: className="[^"]*")?>\s*(?:{/\*.*?\*/}\s*)?<div(?: className="flex flex-col[^"]*")?>\s*<div>\s*<h1 className="text-2xl font-extrabold', 
                         r'<MotionWrapper className="w-full space-y-6 pb-12">\n            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">\n              <div>\n                <h1 className="text-2xl font-extrabold', 
                         content, count=1)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
