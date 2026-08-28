---
name: mockup-to-figma
description: Traslada un mockup HTML/CSS ya aprobado (generado por $research-mockup) a un archivo de Figma reutilizando los tokens del proyecto, importando las capturas de referencia (PNG) y dejando los componentes maquetados con auto-layout y variables para que el equipo los edite. Use cuando el usuario pida "pasar el mockup a Figma", "llevar esto a Figma", "crear la versión Figma del mockup", o cuando $research-mockup ofrezca el paso opcional final de traslado a Figma tras la aprobación del plan.
---

# Mockup to Figma

## Rol

Esta skill **nunca investiga ni diseña desde cero**. Solo traslada un mockup ya
terminado y **aprobado por el usuario** desde el studio HTML/CSS al archivo de Figma.
Si el mockup no existe o no está aprobado, remite a `$research-mockup` y detente.

## Precondiciones

- Existe `<instance>/mockups/<feature>/index.html` (o `<feature>/captures/*.png`).
- El usuario aprobó el mockup/plan en el chat.
- (Opcional) `<instance>/mockups/<feature>/reference.json` y el plan viewer
  `<instance>/mockups/plans/<id>/index.html`.

## Pasos

1. **Cargar contexto** (igual que `$research-mockup`): resuelve el instance activo,
   lee `instance/project-context.md`, `instance/project-rules.md` y el
   `design-foundation-audit.md` de la feature si existe. Nunca inventes tokens.
2. **Descubrir el sistema de diseño en Figma** siguiendo el hard gate de
   `figma-generate-design`: Code Connect primero (`*.figma.ts`), luego pantallas
   existentes en el archivo, luego búsqueda en librerías
   (`get_libraries` + `search_design_system`). Solo después toca el lienzo.
3. **Crear o reutilizar el archivo de Figma de la feature.** Una vez por proyecto:
   importa las variables del proyecto (colores, spacing, radius, tipografía) con
   `importVariableByKeyAsync`, o conviértelas desde `mockups/assets/tokens.css`.
   Guarda `figma: <fileUrl>` + nodeIds en `mockups/<feature>/figma.json`.
4. **Importar las capturas de referencia como guía visual**: sube los PNG
   (`mockups/<feature>/captures/`) o los del plan viewer a una capa de referencia
   (lockeada, fuera de la zona de diseño) para no "dibujar de memoria". No se copian
   los píxeles: el mockup es la guía de estructura, los tokens son la fuente de verdad.
5. **Construir pantalla por pantalla** con auto-layout, variables y los componentes
   reales de la librería (nunca hex sueltos ni primitivas donde hay componente).
   Icons desde los SVG del codebase con `createNodeFromSvg`, coloreados con token.
6. **Validar**: screenshot de cada frame en claro/oscuro vía Figma MCP, comparar con
   los PNG del mockup (modlens si el modelo no ve imágenes), y actualizar
   `figma.json` con nodeIds finales.
7. **Entregar**: link `figma: <fileUrl>`, nodeIds por pantalla y un resumen de qué se
   trasladó y qué quedó como placeholder. Actualiza `instance/project-context.md`
   (decisión log + figma URL).

## Reglas

- No rediseñar: si algo del mockup no se puede representar, déjalo como placeholder
  y anótalo. Nunca "mejores" el diseño por tu cuenta.
- No depender de Figma para el flujo principal: si el MCP de Figma no está disponible
  o falla, di exactamente qué parte no se pudo trasladar y deja el resto del plan en
  `reference.json` — el entregable offline sigue siendo válido.
- Un feature = un archivo Figma (o una sección con nombre) por sesión; no mezcles
  proyectos.
- El mockup HTML/CSS y sus capturas siguen siendo la fuente de verdad; Figma es una
  copia editable para el equipo.

## Referencias

- Carga `figma-generate-design` (y sus referencias `figma-use`,
  `discover-product-font`, `componentization`, `working-with-design-systems`) antes de
  cualquier llamada `use_figma`.
