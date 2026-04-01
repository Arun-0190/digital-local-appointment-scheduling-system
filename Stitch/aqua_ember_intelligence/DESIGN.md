# Design System: Aqua Ember Intelligence

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Luminous Concierge."** 

This system transcends the utility of a standard scheduling tool, transforming "appointments" into a fluid, high-end digital experience. We are moving away from the rigid, boxy constraints of traditional SaaS. Instead, we embrace **Atmospheric Depth**. By utilizing wide-aperture spacing, intentional asymmetry, and "glass-on-void" layering, we create a workspace that feels like a premium physical lounge. The interface shouldn't just display data; it should radiate intelligence through soft glows and sophisticated tonal transitions.

---

## 2. Colors & Surface Philosophy
The palette balances the cool, analytical precision of **Teal (#14b8a6)** and **Cyan (#22d3ee)** with the urgent, human energy of **Coral (#fb7185)**.

### The "No-Line" Rule
To maintain the "Luminous" quality, **1px solid borders are strictly prohibited for sectioning.** We define boundaries through:
- **Tonal Shifts:** Moving from `surface` to `surface-container-low`.
- **Soft Glows:** Using `primary` or `secondary` with 5% opacity to "wash" a section.
- **Negative Space:** Relying on the Spacing Scale (8, 12, 16) to create mental groupings.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, semi-transparent layers. 
- **The Foundation:** Use `surface_dim` (#0b1326) for the global background.
- **The Stacking Logic:** 
    1. Global View: `surface`
    2. Main Work Area: `surface_container_low`
    3. Interactive Cards: `surface_container` or `surface_variant`
- **The "Glass & Gradient" Rule:** Floating elements (modals, dropdowns, hovered cards) must use **Glassmorphism**. Apply `surface_bright` at 40% opacity with a `24px` backdrop-blur.

### Signature Textures
Main CTAs and Hero backgrounds must utilize a **Linear Gradient**: `primary` (#4fdbc8) to `secondary` (#5de6ff) at a 135° angle. This provides a "liquid" feel that static hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for high-level communication with the hyper-readability of **Inter** for utility.

*   **Display & Headlines (Manrope):** These are our "Editorial" moments. Use `display-lg` for welcome screens and `headline-md` for section headers. The goal is a bold, authoritative presence that feels curated.
*   **Titles & Body (Inter):** These handle the "Intelligence." Use `title-md` for card headings to ensure clarity in dense scheduling views.
*   **Labeling:** `label-md` and `label-sm` are reserved for metadata and micro-copy, always set in `on_surface_variant` to reduce visual noise.

---

## 4. Elevation & Depth
Depth is not an effect; it is information.

*   **The Layering Principle:** Avoid shadows for static elements. A `surface_container_highest` card sitting on a `surface_container_low` background creates enough natural lift.
*   **Ambient Shadows:** For floating glass cards, use a "Luminous Shadow":
    *   *Offset:* 0px 20px | *Blur:* 40px | *Spread:* -10px
    *   *Color:* `primary` at 8% opacity. This mimics a glow from the screen rather than a heavy shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast needs), use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** All glass components must feature a 1px "Inner Glow" on the top and left edges using `primary_fixed` at 20% opacity to simulate light hitting the edge of the glass.

---

## 5. Components

### Buttons
- **Primary:** Gradient (`primary` to `secondary`), `3rem` (xl) roundedness. Text: `on_primary`. Apply a subtle `0 0 15px` outer glow on hover using the `primary` token.
- **Secondary (Action):** `tertiary_container` (Coral). Used exclusively for "Book Now" or "Delete." This is the "Ember" in the system.
- **Tertiary:** Transparent background with a `Ghost Border`.

### Cards & Lists
- **The Rule:** No dividers. Use `2.75rem` (8) or `3.5rem` (10) padding to separate list items.
- **Active State:** An active list item should transition to `surface_container_highest` with a `2px` left-accent glow in `secondary`.

### Input Fields
- **Container:** `surface_container_lowest` with a `md` (1.5rem) corner radius.
- **State:** On focus, the "Ghost Border" transitions to 100% opacity `primary`, and the background gains a 2% `primary` tint.

### The "Pulse" Component (Context Specific)
For real-time scheduling updates, use a `12px` circle with a `secondary` fill and a CSS animation creating a concentric expanding ring of `secondary` at 20% opacity. This signifies "Intelligence" is active.

---

## 6. Do’s and Don'ts

### Do:
- **Embrace Asymmetry:** Align text to the left but allow glass cards to overlap slightly or sit off-center to create a bespoke, non-templated look.
- **Use Wide Gutters:** Use the `16` (5.5rem) spacing token for margins to let the "Aqua" theme breathe.
- **Layer Text:** Use `body-sm` in `primary_fixed` for small overlines above `headline-sm` titles.

### Don’t:
- **Don't use pure black or grey shadows.** They kill the "Ember" glow.
- **Don't use sharp corners.** Everything must feel fluid (16px-24px radius).
- **Don't use Dividers.** If you feel the urge to draw a line, increase the background contrast between containers instead.
- **Don't crowd the glass.** Glassmorphism loses its effect if there isn't "negative space" for the blur to process.