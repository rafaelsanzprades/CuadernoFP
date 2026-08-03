# Auditoría de datos — /catalogo (todas las pestañas) — 2026-08-03

Auditoría automatizada de la base de datos que alimenta las 5 pestañas de `/catalogo`
(Familias · Títulos · Módulos · RA → CE · ECP INCUAL). Hecha consultando directamente
`backend/cdd_pro.db` (no revisión manual campo a campo — inviable a este volumen, ver
"Alcance" abajo) más lectura del código real de `frontend/src/app/catalogo/page.tsx` y
`backend/routers/catalogs.py`.

**Volumen de datos**: 27 familias · 141 títulos · 2.372 módulos · 12.310 RA · 82.270 CE.

## Alcance y método

Con 82.270 CE no es viable ni útil revisar el contenido de cada frase contra el BOE una
a una. La auditoría comprueba en su lugar **integridad estructural**: campos vacíos,
tipos/formatos incorrectos, IDs duplicados o con huecos, filas huérfanas, JSON mal
formado, y patrones de texto que delatan un fallo de scraping (dobles espacios,
fragmentos de frase cortados, saltos de línea sueltos, códigos de placeholder sin
resolver). Cada hallazgo de abajo está verificado leyendo las filas reales de la BD, no
inferido por regex a ciegas — la primera pasada tuvo falsos positivos (ver nota) que se
descartaron tras comprobar el dato real.

**Nota metodológica**: mi primera pasada marcó ~140 RA/CE como "placeholder text" por
contener la palabra "todo" (regex mal diseñada — "todo" es una palabra española normal,
no un marcador de placeholder). Ya descartado; no aparece en la lista de abajo.

---

## 1. Bugs de código (no de datos) — encontrados leyendo `routers/catalogs.py`

### 1.1 Los módulos de "3º curso" se clasifican mal como "1º" — bug real, con impacto
`get_curriculum()` y `get_module_curriculum()` (ambas duplican la misma lógica) hacen:
```python
curso_str = "1º"
if m.curso:
    if "1" in str(m.curso) and "2" in str(m.curso): curso_str = "Ambos"
    elif "2" in str(m.curso): curso_str = "2º"
```
No hay ninguna rama para `"3º"` → cualquier módulo marcado 3º en la BD cae al valor por
defecto `"1º"`. Afecta a **34 módulos** (Dual Intensiva y programas de 3 años: Proyecto
Intermodular, Tutoría III, Itinerario personal para la empleabilidad II, y módulos
específicos de FME/HOT/SAN/SSC/TMV con curso 3º). Consecuencias reales:
- En la pestaña **Módulos**, estos módulos aparecen en el bloque "1º curso" en vez de
  tener su propio lugar — se mezclan con módulos de primero.
- Al pulsar "Nueva programación" sobre uno de ellos, el campo `curso` de la programación
  creada se guarda como `"1º"` (falso) en vez de `"3º"`.
- El cálculo de horas FEOE (`h_feoe = is2nd ? 360 : 140`) les aplica 140h (primero) en
  vez de la cifra que les correspondería como módulo avanzado.

**Fix**: añadir una rama `elif "3" in str(m.curso): curso_str = "3º"` en ambos sitios
(o mejor, extraer la función a un único helper compartido — está literalmente duplicada).

### 1.2 `unidades_formativas` — el frontend lo espera, el backend nunca lo manda
`TabCursos` en `catalogo/page.tsx` (línea ~683) renderiza un bloque "Unidades Formativas"
si `mod.unidades_formativas?.length > 0`. Pero `get_curriculum()` construye
`modulos_data` sin esa clave en ningún punto:
```python
modulos_data.append({"codigo":..., "nombre":..., "horas":..., "curso":..., "ra":..., "competencias":...})
```
Resultado: ese bloque de UI está **muerto permanentemente** — no hay ninguna combinación
de datos que lo haga aparecer, para ningún módulo, nunca. O se implementa en el backend
(si hay datos de UF en algún sitio) o se retira el bloque muerto del frontend.

### 1.3 Iconos rotos y degradado CSS inválido para 4 familias sin `icon_url`/`color_hex`
`AAT`, `IAD`, `MAP`, `VIC` (las 4 familias más nuevas: Transversales, IA y Datos,
Marítimo-Pesquera, Vidrio y Cerámica) tienen `icon_url` y `color_hex` a `NULL`. El JSX:
```jsx
{(family.icon_url && ...) ? <i .../> : <img src={family.icon_url} .../>}
style={{ background: `linear-gradient(to bottom, ${family.color_hex}15, transparent)` }}
```
con `icon_url=null` cae en la rama `<img src={null}>` (icono roto visible) y con
`color_hex=null` genera `background: linear-gradient(to bottom, null15, transparent)`
(CSS inválido, la tarjeta pierde el acento de color). Visible ahora mismo en la pestaña
Familias para esas 4 tarjetas.

---

## 2. Bugs de datos — confirmados por muestra directa

### 2.1 Frases de RA/CE partidas en dos filas (bug de scraping)
Varias RA/CE tienen media frase en una fila y la otra mitad en la fila "siguiente",
consumiendo un ID que no debería existir. Ejemplo real (`evaluation_criteria`,
módulo IFC201 "Sistemas Microinformáticos y Redes"):

| id | ce_code | description |
|---|---|---|
| 55425 | CE3b. | "Se ha identificado la estructura y función de los directorios del sistema" |
| 55426 | **CE3c.** | **"operativo."** ← esto es el final de la frase anterior, no un criterio nuevo |
| 55427 | CE3d. | "Se han utilizado herramientas en entorno gráfico..." |

Esto no es solo una frase fea: **desplaza la numeración/letras de todos los criterios
siguientes de ese RA** respecto al BOE real, porque se ha colado un criterio fantasma.
Mismo patrón confirmado en `lo_id=8585` (CE3h. = "información." — final de "...para
intercambiar" de CE3g.) y en varias RA (ids 13296/13305/13319/14389/14397/14405
empiezan literalmente con `".\n\nReconoce..."`, el punto y salto de línea colgando del
final de la frase anterior). **19 RA + 104 CE** tienen doble espacio como síntoma
acompañante del mismo problema de scraping.

### 2.2 `ce_code = "CE2.x"` — placeholder sin resolver, 1.150 filas
1.150 CE tienen literalmente el código `"CE2.x"` (una "x" de plantilla, no un código
real). Investigando el contenido: estas filas no son criterios de evaluación al uso
("Se ha... / Se han...") sino **el temario (contenidos) de los Ámbitos de FP Básica**
almacenado en la misma tabla — mezcla de encabezados de sección ("Comunicación.",
"Reflexión sobre la lengua.") y viñetas de contenido ("— Aspectos básicos de la
propiedad intelectual."). Es decir: para los módulos de Ámbito de FP Básica, la tabla
`evaluation_criteria` no contiene criterios de evaluación reales, contiene el índice de
contenidos con un código de fila sin terminar de generar. Esto probablemente viene de
cómo esos títulos concretos estructuran el "Artículo 6" en el BOE (Ámbitos, no RA/CE
convencionales) — no lo he tocado sin más contexto, pero conviene que lo sepas: si
alguien abre esos módulos en la pestaña **RA → CE** esperando criterios evaluables, va
a ver un índice de temario en su lugar.

### 2.3 Objetivos generales (Art. 9) con letras duplicadas / numeración inconsistente
3 títulos tienen el listado de OG con una letra repetida y otra saltada:
- **AGA302**: hay dos objetivos con `id: 'o'` (contenidos distintos); falta la letra `p`.
- **EOC201**: dos objetivos con `id: 'j'`; falta la letra `h`.
- **MSP304**: mezcla dígitos y letras sin patrón (`1,2,a,b,c,d,3,4,5,a,b,6`) — el más
  roto de los tres, probablemente el Art. 9 de este título no se scrapeó bien del todo.

### 2.4 14 RA con dos CE idénticos bajo el mismo RA (letras distintas, mismo texto)
Ej.: RA con `lo_id=3468` tiene `CE5f.` y `CE5i.` con la frase exactamente igual ("se han
representado esquemas de principio."). Puede ser un copy-paste del scraper o que el BOE
realmente repita el criterio para dos apartados — no lo puedo distinguir sin mirar el
BOE original, lo dejo listado para que lo decidas tú (14 casos, lista completa en el
log de la auditoría si la quieres).

---

## 3. Campos vacíos / con formato incorrecto

| Tabla | Campo | Problema | Alcance |
|---|---|---|---|
| `professional_families` | `icon_url`, `color_hex` | vacíos | 4/27 familias (AAT, IAD, MAP, VIC) — ver §1.3 |
| `degrees` | `hours` | siempre `NULL` | 139/141 títulos — **campo muerto**: ni el backend lo expone en `/api/families` ni el frontend lo pinta en ningún sitio. No rompe nada, pero es basura en el esquema. |
| `degrees` | `boa_articles` | vacío del todo (`{}`) | 4 títulos: `HOT304-305`, `MAM202`, `SEA202`, `SEA304` — sin currículo cargado, la pestaña Títulos ya muestra el aviso correcto para estos casos |
| `degrees` | `boa_articles` | incompleto (faltan algunos de los 8 artículos) | 12 títulos, sobre todo FP Básica (`FPB115/116/117/119/121/122/124/125/126/128`) + `SAN201`, `SAN302` |
| `degrees` | `boa_articles.article_6_cps` | el texto plano del art. 6 existe pero la versión estructurada (tabla de cualificaciones/unidades de competencia) no | **127 de 141 títulos** — es decir, la mayoría de títulos solo tiene el art. 6 en texto libre, no en la tabla estructurada que sabe pintar `TabTitulo` (CP/UC con badges). No es un dato roto, es contenido que nunca se estructuró. |
| `incual_family_data` | `description` | vacío | **27/27 — el 100%**, pese a que `scrape_status = 'complete'` en todos. El scraper marca éxito pero nunca guardó la descripción. |
| `incual_family_data` | `oferta_grado_*`, `crn_centers`, `ecp_nivel_*` | vacíos | 4/27 familias (AAT, IAD, MAP, VIC otra vez) con **todos** los campos INCUAL vacíos — probablemente porque INCUAL no tiene página propia para estas categorías nuevas, no necesariamente un fallo del scraper. |
| `modules` | `curso` | `NULL` | 15 módulos sin curso asignado |
| `modules` | `hours` | `0` | 15 módulos (todos con código `AOP...`, aparentan ser módulos de oferta parcial/certificado de profesionalidad más que ciclo ordinario) |
| `modules` | `is_dual` | siempre `NULL` salvo 51 casos en `True` | Campo igual de muerto que `degree.hours`: no aparece en la respuesta de `/api/catalog/curriculum/*` ni se usa en el frontend. |

---

## 4. Cosas que parecen raras pero **no** son bugs (verificado)

- **Dos formatos de código de CE conviven** (`CE1.1` numérico ~12.184 filas vs.
  `CE1a.`/`CE1b.`... con letra ~1.500 filas cada una): esto es el reflejo real de dos
  generaciones de currículo oficial (LOMLOE con RA/CE numerado vs. LOE con letras) — no
  hay que "unificarlo", ambos son formatos oficiales legítimos.
- Los acentos que en mi terminal aparecían como `Inform�tica` son un problema de la
  consola de Windows al mostrarlos, no corrupción real en la BD — comprobado byte a
  byte (`0xe1` = `á`, UTF-8 correcto). Ningún nombre de familia está corrupto de verdad
  (0 casos con el carácter de reemplazo Unicode real).
- 0 códigos de familia duplicados, 0 pares (código,región) de título duplicados, 0
  módulos duplicados dentro del mismo título, 0 CE huérfanos (sin RA padre), 0 RA con
  numeración con huecos o duplicados dentro de un módulo.

---

## 5. Resumen priorizado

| # | Qué | Gravedad | Tipo | Acción sugerida |
|---|---|---|---|---|
| 1 | Módulos de "3º" mal clasificados como "1º" | Alta (datos y cálculo de horas FEOE incorrectos) | Bug de código | Fix de 2 líneas en `routers/catalogs.py`, 2 sitios |
| 2 | 1.150 CE con código placeholder `CE2.x` (temario de Ámbitos FPB en la tabla de criterios) | Media (confunde al ver RA→CE de FP Básica) | Estructura de datos | Decidir si se remodela o se documenta como "así es para Ámbitos" |
| 3 | INCUAL `description` vacía en el 100% de familias | Media (la pestaña ECP INCUAL pierde su texto principal) | Dato faltante | Revisar el scraper de INCUAL, marca éxito sin guardar el campo |
| 4 | Frases de RA/CE partidas en dos filas (~6 RA + ~10-15 CE confirmados, con efecto cascada en la numeración) | Media (contenido incorrecto en módulos concretos de Telecomunicaciones sobre todo) | Dato roto | Corregir manualmente esas filas puntuales |
| 5 | `unidades_formativas` — bloque de UI muerto, el backend nunca lo manda | Baja (nadie lo ve nunca, tampoco rompe nada) | Bug de código / feature incompleta | Implementar o retirar el bloque |
| 6 | 4 familias nuevas sin icono/color (icono roto visible) | Baja-Media (visual, en producción) | Dato faltante | Añadir `icon_url`/`color_hex` para AAT/IAD/MAP/VIC |
| 7 | 3 títulos con letras de Objetivos Generales duplicadas/saltadas | Baja (solo 3 títulos) | Dato roto | Corregir manualmente `article_9_og` de AGA302/EOC201/MSP304 |
| 8 | 127/141 títulos sin la tabla estructurada de Art. 6 (CP/UC) | Baja (degrada con gracia a texto plano) | Contenido incompleto | Opcional, trabajo de estructuración futuro |
| 9 | `degree.hours` y `module.is_dual` siempre `NULL`, no expuestos en ningún sitio | Cosmético | Campo muerto en el esquema | Ignorar o limpiar en una futura migración |

**No he tocado ningún dato ni código todavía** — esto es el informe que pediste. Dime
cuáles de estos quieres que arregle y en qué orden; el #1 (bug de código, 3º→1º) es el
más barato y con más impacto real, lo dejaría primero si hay que elegir.
