# PopSage design system

Status: v1 foundation · 3 November 2026

This document defines the visual and interaction foundation for PopSage. Product requirements remain authoritative for behavior; this file governs how those behaviors look and feel.

## Design direction

PopSage should feel calm, trustworthy, and quietly intelligent. The interface is not trying to make AI feel magical or autonomous. It should make evidence, limits, and human continuity feel obvious.

The landing-page expression uses monochrome liquid glass over organic motion. Product surfaces may become more restrained and utilitarian, but they must retain the same typography, neutral palette, precise spacing, and confidence hierarchy.

### Principles

1. **Trust before spectacle.** Effects support legibility and hierarchy; they never obscure provenance, state, or controls.
2. **Human continuity is visible.** AI and teammate states should feel like one conversation rather than separate products.
3. **Limits are designed states.** Uncertainty, waiting, handoff, and degraded realtime are first-class—not errors hidden behind generic messaging.
4. **Grayscale is expressive enough.** Establish hierarchy with luminance, opacity, blur, scale, and typography instead of decorative color.
5. **Primitives compound.** Extend shadcn/ui components and tokens; do not build parallel buttons, cards, dialogs, sheets, badges, or form controls.

## Foundations

### Color

The v1 palette is strictly achromatic. All theme variables use zero-chroma HSL values.

| Role | Token | Intended use |
|---|---|---|
| Canvas | `--background` | Deep neutral page and product background |
| Primary text | `--foreground` | Headings and high-confidence content |
| Surface | `--card`, `--popover` | Product panels and overlays |
| Primary action | `--primary` / `--primary-foreground` | Highest-emphasis action pairing |
| Secondary surface | `--secondary` | Supporting actions and grouped controls |
| Muted content | `--muted-foreground` | Descriptions, metadata, inactive states |
| Structural line | `--border` | Quiet separation where glass is not used |
| Focus | `--ring` | Keyboard focus indication |

On photographic or video backgrounds, use white at 100%, 80%, 60%, 50%, and 45% opacity for hierarchy. Do not introduce branded accent colors without updating this document and checking contrast in every state.

### Typography

- **Poppins:** display, navigation, body, labels, controls, and product UI.
- **Source Serif 4:** italic emphasis inside display headings or short editorial statements only.
- Headings use weight 500 by default. Brand wordmarks may use 600.
- Hero tracking may tighten to `-0.055em`; ordinary product headings should stay closer to normal tracking.
- Body copy favors comfortable line lengths and 1.5–1.75 line height.
- Fonts are self-hosted through `@fontsource/poppins` and `@fontsource/source-serif-4` to avoid a remote build dependency.

### Shape and spacing

- Base radius: `1rem`.
- Pills and primary hero CTAs: full radius.
- Hero panels: `1.5rem` to `2.5rem`, derived from the shadcn radius scale.
- Use Tailwind spacing tokens and `gap-*`; do not use `space-x-*` or `space-y-*`.
- Equal width/height uses `size-*`.

## Liquid glass

Two reusable surface tiers live in `src/app/globals.css`:

### Light glass — `.liquid-glass`

Use for compact controls, badges, small cards, and secondary panels. It combines a 4px backdrop blur, minimal luminosity fill, an inset highlight, and a masked grayscale gradient edge.

### Strong glass — `.liquid-glass-strong`

Use for primary panels, menus, and high-emphasis CTA surfaces. It uses a 50px backdrop blur, slightly stronger inset light, and a brighter masked edge.

Do not add conventional borders on top of either glass tier. Keep enough darkening behind text to maintain contrast when the background frame changes.

## Component policy

| Need | Foundation | PopSage treatment |
|---|---|---|
| Action | shadcn `Button` | Use semantic variants; `glass` and `glass-strong` are approved landing variants |
| Content panel | shadcn `Card` | Always use Header/Title/Description/Content composition; glass variants inherit description contrast |
| Compact label | shadcn `Badge` | Use the `glass` variant for capability pills |
| Structural division | shadcn `Separator` | Use `tone="glass"` on media/glass surfaces |
| Overlay navigation | shadcn `Sheet` | Must include a visible or screen-reader title and description; preserve focus management |
| Icons | Lucide | Use the configured icon library; icons in buttons use `data-icon` and inherit sizing |
| Brand mark | `PopSageMark` | Code-native monochrome speech/leaf mark; remains crisp without a raster asset |

When a component needs a new visual state, add a named variant to the primitive. Avoid one-off color overrides at call sites.

## Motion

- Motion must provide feedback, explain state, or preserve spatial continuity.
- Button press: scale to `0.97` over roughly 150ms.
- Pointer hover: subtle scale up only on devices with a fine pointer and hover support.
- Use the shared strong ease-out curve: `cubic-bezier(0.23, 1, 0.32, 1)`.
- Animate transform and opacity where possible. Avoid `transition: all`.
- Respect `prefers-reduced-motion`. The decorative background video is omitted for reduced-motion users; the fallback remains a complete dark composition.
- Frequent keyboard-driven product actions should not animate.

## Landing-page composition

- Full-viewport monochrome video with a dark grayscale vignette.
- Left primary panel: 52% on desktop and full width on mobile.
- Right product-preview rail: 48% on desktop and intentionally hidden below `lg`.
- The message hierarchy is: category → product promise → evidence → CTA → capabilities → principle.
- Copy must describe grounded support, live chat, and human handoff. Never reuse Bloom’s plant-design language or generic “intelligence that evolves” positioning.

## Accessibility and resilience

- Maintain visible focus rings and semantic buttons/links.
- Decorative media and marks are hidden from assistive technology; meaningful marks receive labels.
- The mobile experience cannot depend on the desktop preview rail.
- Text contrast must remain readable against the brightest video frame.
- The page remains coherent if the remote video fails or is disabled.
- Interactive targets should be approximately 44px on touch layouts where density allows.

## Do / don’t

| Do | Don’t |
|---|---|
| Explain what the AI knows and when a human enters | Present AI as unlimited or autonomous |
| Extend shadcn variants and semantic tokens | Create isolated custom button/card systems |
| Use grayscale opacity and typography for hierarchy | Add arbitrary colored accents |
| Keep glass behind short, high-value content | Put long dense product workflows on translucent media |
| Validate motion and video fallbacks | Make autoplay motion necessary to understand the page |
| Keep accepted product copy concise and factual | Use vague claims such as “intelligence designed to evolve” |

## Known gaps

- The current background video is an external creative reference supplied for the landing page; a PopSage-owned optimized asset and poster should replace it before production deployment.
- The initial code-native mark is a working brand asset, not a finalized trademark or visual identity.
- Dashboard, inbox, knowledge, and widget state matrices will be added as those product slices are designed.
- Light-mode product tokens are not defined yet; v1 marketing and early product work use the dark neutral foundation.
