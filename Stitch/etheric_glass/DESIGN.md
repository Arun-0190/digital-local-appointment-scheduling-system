# Design System Strategy: The Ethereal Scheduler

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Nebula."** 

We are moving away from the "flat box" aesthetic of traditional scheduling tools. This system treats the interface as a deep, spatial environment where information floats in a state of weightless clarity. By utilizing high-contrast editorial typography against a background of infinite depth, we create an experience that feels premium, calm, and authoritative. 

The design breaks the "template" look through **intentional asymmetry**—offsetting grid elements to create a sense of motion—and **tonal depth**, where elements aren't just placed on top of a background, but exist within it.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep space navies (`#0c1324`) and vibrant, kinetic accents. 

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. To separate a sidebar from a main feed, transition from `surface` to `surface-container-low`. Use the `20` (7rem) spacing token to create "air" rather than a line to create a "fence."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of frosted glass.
*   **Base:** `surface` (#0c1324) – The infinite void.
*   **Sections:** `surface-container-low` (#151b2d) – Large structural areas.
*   **Interactive Containers:** `surface-container-high` (#23293c) – Elevated interactive zones.
*   **The "Glass & Gradient" Rule:** Floating elements (Modals, Popovers) must use `bg-white/10` with a `backdrop-blur-xl`. To add "soul," apply a subtle diagonal gradient from `primary` (#7c3aed) to `secondary` (#22d3ee) at 5% opacity across the glass surface.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) for its geometric modernism with **Inter** (Body/Labels) for its clinical legibility.

*   **Display (Manrope):** Use `display-lg` (3.5rem) for hero moments. Tracking should be set to -2% to feel tight and "designed."
*   **Headlines (Manrope):** `headline-md` (1.75rem) should be Bold. Use these to anchor glass cards.
*   **Body (Inter):** `body-md` (0.875rem) in `on-surface-variant` (#ccc3d8) for secondary info. The slight desaturation ensures the eye is drawn to the vibrant headings first.
*   **Labels (Inter):** `label-md` (0.75rem) should be All-Caps with +5% letter spacing to provide a "technical" feel to timestamps and metadata.

---

## 4. Elevation & Depth: The Layering Principle
Depth is achieved through **Tonal Layering** rather than structural lines.

*   **Ambient Shadows:** For "floating" glass cards, use an extra-diffused shadow: `0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft glow of darkness rather than a hard edge.
*   **The "Ghost Border" Fallback:** If a card requires a border for accessibility, use the `outline-variant` token at 15% opacity. It should act as a catch-light on the edge of the glass, not a container.
*   **Focus States:** Never use a standard blue ring. Use a `0 0 15px` outer glow using the `secondary` (#22d3ee) token at 40% opacity.

---

## 5. Components

### Glass Cards
*   **Visuals:** `rounded-xl` (1.5rem), `bg-white/10`, `backdrop-blur-xl`.
*   **Content:** Forbid divider lines. Use `spacing-4` (1.4rem) to separate header from body content.

### Buttons
*   **Primary:** A vibrant gradient from `primary` (#7c3aed) to `secondary` (#22d3ee). 
*   **Animation:** On hover, scale to `1.05` and increase the `backdrop-blur` of the elements behind it.
*   **Tertiary:** No background. Use `title-sm` typography in `secondary` color with a subtle underline that expands from the center on hover.

### Input Fields
*   **Base:** `surface-container-highest` (#2e3447) with a 10% white overlay. 
*   **Interaction:** On focus, the background shifts to `surface-bright` (#33394c) and the `outline-variant` glows with the `secondary_fixed_dim` color.

### Selection Chips
*   **Style:** `rounded-full`. Unselected: `surface-container-high`. Selected: `primary_container` (#7c3aed) with `on_primary_container` text.
*   **Context:** Use these for appointment types or time-slot filtering.

### Appointment Lists
*   **Structure:** No dividers. Each list item is a `surface-container-low` block. Use a `2px` vertical accent bar of `primary` (#7c3aed) on the far left of the "Active" appointment to denote status without cluttering the UI.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., more padding on the left than the right) for hero sections to create an editorial feel.
*   **Do** use `framer-motion` "Spring" transitions (stiffness: 300, damping: 30) for all glass card entries.
*   **Do** leverage the `secondary` cyan color for "Actionable" elements only (CTAs, Toggles).

### Don’t:
*   **Don’t** use pure black (#000000). Always use `surface` (#0c1324) to maintain the "Navy Depth" of the nebula.
*   **Don’t** use 100% opaque borders. It breaks the glass metaphor and makes the UI feel "cheap."
*   **Don’t** use standard "Drop Shadows." Use tonal shifts or high-blur ambient glows.
*   **Don't** crowd the interface. If you are unsure, add more `spacing-8` (2.75rem).