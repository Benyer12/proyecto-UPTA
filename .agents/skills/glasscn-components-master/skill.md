---
name: glasscn-components
description: >-
  Reference library and optical LiquidGlass implementation from glasscn (shadcn/ui glassmorphism components).
  Use this skill when building, customizing, or debugging LiquidGlass surfaces, SVG feDisplacementMap refraction,
  specular rim bevels, frosted fallbacks, or glasscn UI components (buttons, cards, inputs, dialogs, badges, switches).
---

# Glasscn Components & LiquidGlass Reference

This skill contains the full source code and optical reference documentation for **glasscn**, a glassmorphism and Apple-style Liquid Glass component library built on top of `shadcn/ui`.

## When to Use

Activate and consult the files in this skill directory whenever you need to:
- Build or refine `LiquidGlass` surfaces, optical refraction (`feDisplacementMap`), SDF displacement maps, frosted fallbacks, or specular rim overlays.
- Copy, adapt, or inspect glassmorphism UI primitives (`GlassButton`, `GlassCard`, `GlassInput`, `GlassPopover`, `GlassSelect`, `LiquidBadge`, `LiquidSwitch`, etc.).
- Debug performance, Chromium `backdrop-filter: url(#...)` capability gating, texture caching, or border/rim masking issues.

## Key Files in This Skill

1. **Overview & Component Catalog**: [README.md](./README.md)
2. **Core Optical Primitive (`LiquidGlass`)**: [components/ui/glasscn/liquid-glass.tsx](./components/ui/glasscn/liquid-glass.tsx)
   - Generates cached rounded-rect SDF displacement maps (`MAX_TEXTURE_SIZE = 480`), applies Chromium capability detection (`supportsSvgBackdropFilter`), and renders frosted glass fallback + dual-axis specular rim overlays.
   - Avoid animating `width`/`height` directly (thrashes the displacement map cache); animate `transform: scale` instead.
3. **Glass Variants & Tokens**: [components/ui/glasscn/glass-variants.ts](./components/ui/glasscn/glass-variants.ts)
4. **All Glass UI Components**: `components/ui/glasscn/*.tsx` and registry JSON definitions in [registry.json](./registry.json).
5. **Optical & SVG Filter Deep-Dive Docs**:
   - [learning/RESOURCES.md](./learning/RESOURCES.md)
   - [learning/lessons/](./learning/lessons/) (SVG filter graphs, displacement maps, backdrop-filter window model, and `mask-composite` rim carving).
