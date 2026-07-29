import os
import re

app_dir = 'c:\\GD-rsp\\APP-CuadernoFP\\frontend\\src\\app'
for root, dirs, files in os.walk(app_dir):
    if 'page.tsx' in files:
        filepath = os.path.join(root, 'page.tsx')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # 1. Standardize main wrapper
        # Find <main id="main-content"... or <main className...
        # that is NOT in the layout.tsx, but in page.tsx.
        content = re.sub(r'<main\s+(?:id="main-content"\s+tabIndex=\{-1\}\s+)?className="[^"]*">',
                         r'<main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">',
                         content)

        # 2. Standardize MotionWrapper
        content = re.sub(r'<MotionWrapper(?: className="[^"]*")?>',
                         r'<MotionWrapper className="space-y-4 pb-12">',
                         content)

        # 3. Standardize h1
        content = re.sub(r'<h1 className="[^"]*">',
                         r'<h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">',
                         content)

        # 4. Standardize the p tag immediately following h1
        # It's tricky to regex across newlines safely for just THAT p tag.
        # Let's find: </h1>\s*<p className="[^"]*">
        content = re.sub(r'</h1>\s*<p className="[^"]*">',
                         r'</h1>\n              <p className="text-muted mt-2 text-sm">',
                         content)

        # 5. Standardize TabsList
        content = re.sub(r'<TabsList className="[^"]*">',
                         r'<TabsList className="max-w-full flex-wrap h-auto gap-1">',
                         content)

        # 6. Standardize TabsTrigger (inside TABS.map usually)
        content = re.sub(r'<TabsTrigger([^>]*?)className="[^"]*"([^>]*)>',
                         r'<TabsTrigger\1className="text-sm flex-1 whitespace-nowrap min-w-[100px] py-2"\2>',
                         content)

        # 7. Standardize InfoMap wrapper
        content = re.sub(r'<div className=[\'"]flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6[\'"]>',
                         r'<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-4">',
                         content)
                         
        content = re.sub(r'<div className=[\'"]flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6[\'"]>',
                         r'<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-4">',
                         content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
