import re

path = r'c:\GD-rsp\APP\frontend\src\app\catalogo\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The old block to replace
old = """                    <div className="p-6 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {content}
                      {artKey === 'article_5' && (selectedTituloObj as any).competencias_cpps && (
                        <div className="mt-6 space-y-2">
                          {(selectedTituloObj as any).competencias_cpps.map((cpp: any) => (
                            <div key={cpp.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                              <span className="font-mono font-bold text-[#14a085] shrink-0 mt-0.5">CPPS {cpp.id}.</span>
                              <span className="text-sm text-foreground">{cpp.descripcion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>"""

new = """                    <div className="p-6 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {content}
                      {/* CPPS rows (Article 5) */}
                      {artKey === 'article_5' && Array.isArray(selectedTituloObj.boa_articles?.article_5_cpps) && (
                        <div className="mt-6 space-y-2">
                          {(selectedTituloObj.boa_articles as any).article_5_cpps.map((cpp: any) => (
                            <div key={cpp.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                              <span className="font-mono font-bold text-[#14a085] shrink-0 mt-0.5">CPPS{cpp.id}.</span>
                              <span className="text-sm text-foreground">{cpp.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* OG rows (Article 9) */}
                      {artKey === 'article_9' && Array.isArray(selectedTituloObj.boa_articles?.article_9_og) && (
                        <div className="mt-6 space-y-2">
                          {(selectedTituloObj.boa_articles as any).article_9_og.map((og: any) => (
                            <div key={og.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                              <span className="font-mono font-bold text-info shrink-0 mt-0.5">OG{og.id}.</span>
                              <span className="text-sm text-foreground">{og.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>"""

if old in content:
    content = content.replace(old, new, 1)
    print("OK: replaced competencias_cpps block with CPPS + OG structured rows")
else:
    print("ERROR: old block not found!")
    # Debug: find the line
    idx = content.find('competencias_cpps')
    if idx >= 0:
        print(f"  competencias_cpps found at char {idx}")
        snippet = content[idx-100:idx+300]
        print(f"  Context: {repr(snippet)}")
    else:
        print("  competencias_cpps not found at all!")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File saved")
