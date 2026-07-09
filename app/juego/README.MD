# 🎲 Juego — Tablero de nivel

Ruta dinámica: `/juego/[planetId]/[levelId]` (ej: `/juego/1/1` para Nivel 1 de Numérix)

| Parámetro | Descripción |
|-----------|-------------|
| `[planetId]` | ID del planeta |
| `[levelId]` | ID del nivel a jugar |

## Diseño
- Tablero tipo juego de mesa espacial con casillas
- Dado 3D animado para avanzar
- Área de preguntas en el centro
- Barra de progreso / combustible

## Pendientes
- [ ] Integrar Dado3D component
- [ ] Sistema de preguntas
- [ ] Lógica de progreso