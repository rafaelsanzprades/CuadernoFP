import os
import re

app_dir = r"c:\GD-rsp\APP-CuadernoFP\frontend\src\app"

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            
            # Reemplazar TabsList con clases raras por la estándar
            new_content = re.sub(
                r'<TabsList className="[^"]*border-[^"]*">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="bg-foreground/5 border border-foreground/10 p-1 flex-wrap h-auto gap-1">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="mb-4 max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide border-b border-\[var\(--glass-border\)\] rounded-none bg-transparent">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="mb-2 max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide border-b border-\[var\(--glass-border\)\] rounded-none bg-transparent">',
                r'<TabsList className="mb-2 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide rounded-none bg-transparent h-auto p-0">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="bg-foreground/5 border border-\[var\(--glass-border\)\] w-full justify-start h-auto p-1 rounded-xl flex-wrap">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            new_content = re.sub(
                r'<TabsList className="mb-4 max-w-full overflow-x-auto justify-start">',
                r'<TabsList className="mb-4 max-w-full">',
                new_content
            )
            
            # Reemplazar TabsTrigger con clases raras
            new_content = re.sub(
                r'<TabsTrigger key={tab\.id} value={tab\.id} className="text-sm flex-1 whitespace-nowrap min-w-\[100px\]">',
                r'<TabsTrigger key={tab.id} value={tab.id}>',
                new_content
            )
            new_content = re.sub(
                r'<TabsTrigger key={tab\.id} value={tab\.id} className="whitespace-nowrap shrink-0">',
                r'<TabsTrigger key={tab.id} value={tab.id}>',
                new_content
            )
            new_content = re.sub(
                r'<TabsTrigger key={tab\.id} value={tab\.id} className="flex-1 whitespace-nowrap shrink-0 px-2 py-3">',
                r'<TabsTrigger key={tab.id} value={tab.id}>',
                new_content
            )
            new_content = re.sub(
                r'<TabsTrigger key={tab\.id} value={tab\.id} className="text-sm flex-1 whitespace-nowrap px-4 py-2">',
                r'<TabsTrigger key={tab.id} value={tab.id}>',
                new_content
            )
            new_content = re.sub(
                r'<TabsTrigger key={tab\.id} value={tab\.id} className="text-sm whitespace-nowrap flex-1 text-left justify-start">',
                r'<TabsTrigger key={tab.id} value={tab.id}>',
                new_content
            )

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
