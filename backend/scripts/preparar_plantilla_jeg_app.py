import os
from docx import Document

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tpl_in = os.path.join(BASE, "templates", "modelo_pd_fp+.docx")
tpl_out = os.path.join(BASE, "templates", "modelo_pd_jeg_tpl.docx")

doc = Document(tpl_in)

# We want to replace the sections below with single Jinja tags.
sections_to_replace = {
    "Entorno geográfico y sociocultural": "{{ textos_pd_contexto_geografico }}",
    "Entorno socioeconómico y productivo": "{{ textos_pd_contexto_socioeconomico }}",
    "Contexto escolar": "{{ textos_pd_contexto_academico }}",
    "Marco normativo": "{{ textos_pd_procedimientos_normativos }}",
    "Estrategias y técnicas didácticas": "{{ textos_pd_metodologia_didactica }}",
    "Atención a las diferencias individuales": "{{ textos_pd_inclusion_diversidad }}",
    "Plan de contingencia": "{{ textos_pd_plan_contingencia }}",
    "Bibliografía": "{{ textos_pd_bibliografia }}",
    "Publicidad de la programación didáctica": "{{ textos_pd_publicidad }}",
}

# Find headings and delete the content below them until the next heading.
current_section = None
paragraphs_to_delete = []

for i, p in enumerate(doc.paragraphs):
    text = p.text.strip()
    
    # Check if this paragraph is one of our headings
    matched_heading = None
    for heading in sections_to_replace:
        if heading in text and len(text) < len(heading) + 5: # basic check to ensure it's the heading
            matched_heading = heading
            break
            
    if matched_heading:
        current_section = matched_heading
        # We append the jinja tag immediately after the heading
        p.insert_paragraph_before(text) # keep heading
        new_p = p.insert_paragraph_before(sections_to_replace[matched_heading])
        paragraphs_to_delete.append(p) # delete original heading paragraph as we re-inserted it
        continue
        
    if current_section:
        # Check if we hit a new heading (any bold text or specific style)
        # In this template, headings are usually styles like 'Heading 3', 'Heading 4'
        if p.style.name.startswith('Heading') or text in ["Características del alumnado", "Desarrollo curricular", "Organización", "Metodología", "Evaluación"]:
            current_section = None
        else:
            paragraphs_to_delete.append(p)

for p in paragraphs_to_delete:
    p._element.getparent().remove(p._element)

doc.save(tpl_out)
print(f"Template saved to {tpl_out}")
