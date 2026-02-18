# Project Definition — “AMANI Bloom Reveal” (Web)

## 1) One-line summary
A premium, magical single-page website that auto-plays a ~6-second animation: a night-sky scene where many detailed red-gradient flowers bloom and the name “AMANI” is revealed in a handwritten style—always fitting on one line with no wrapping (including iPhone Safari).

## 2) Experience goal (what it should feel like)
Romantic, elegant, “wow”. Smooth, professional motion (no jank), rich gradients, subtle glow, high polish.

## 3) Target users
- Primary: my wife (viewer)
- Secondary: me (sharer)

## 4) Must-have constraints
- The name is exactly: AMANI (English)
- Font vibe: handwritten
- Auto-start (no click needed)
- Total animation: ~6 seconds
- Flowers: “a lot”, detailed, visually unique, red-side palette with gradients
- Background mood: night sky
- Must work well on iPhone Safari
- **IMPORTANT:** Name must fit screen perfectly with **no wrap** (ever)

## 5) Non-goals
- No flowers visible at the start
- No cheap/flat-looking assets
- No heavy UI, no menus, no distractions

## 6) Core flow
Open link → clean night-sky background (empty) → subtle magical ambience begins → flowers bud + bloom in → name “AMANI” reveals in-sync with bloom → final composed scene holds (optionally with replay).

## 7) Visual direction
### Background
- Night sky gradient (deep navy → near-black)
- Subtle stars (tiny points + a few soft glows)
- Very light ambient particles (slow drift) or faint nebula haze
- Avoid heavy blur filters that lag on iPhone Safari; keep it efficient

### Flowers
- Many flowers (target peak: 18–40 depending on device)
- Each flower looks distinct (shape + petal count + size + rotation + gradient variation)
- Palette: reds, crimson, burgundy, rose; gradients with subtle highlights
- Bloom animation: bud → petals unfold → gentle settle/bounce → slight sway
- Composition preference: flowers “integrate into the name itself” (complex look), not just around it

### Name
- Handwritten style, elegant
- Appears as part of the bloom: flowers can sprout along/near strokes, petals can “carry” the reveal
- **Must remain one single line** on all viewports (no wrap)

## 8) Animation timeline (~6 seconds)
- 0.0–0.6s: Background fades in + stars appear subtly
- 0.6–1.2s: First buds appear (still minimal, quiet)
- 1.2–3.8s: Main bloom sequence (many flowers bloom in waves)
- 2.0–4.5s: Name reveal phase (handwritten reveal synced to blooming)
- 4.5–6.0s: Final polish (soft shimmer/glow pass, then settle/hold)

## 9) Functional requirements
- Inputs:
  - Name text: "AMANI"
  - (Optional) A short message line under the name (default off)
- Outputs:
  - A single-page animated experience
- Rules:
  - Start with no flowers visible
  - Bloom is smooth + layered (not everything at once)
  - Name reveal is the focal point, flowers support it
  - Provide a “Replay” control (small, subtle) OR allow refresh restart cleanly
- Edge cases:
  - Very small screens: reduce flower count + particle count automatically
  - prefers-reduced-motion: show static final scene (or simplified fade-in)

## 10) “No wrap” name fitting requirement (hard requirement)
The name must always render on one line without wrapping, including iPhone Safari.

Implementation requirement:
- Use a dynamic fitting system that measures available width and scales the name accordingly.
- Recommended approach:
  - Render name as SVG (or HTML text), measure its width, then apply scale so it fits:
    - font-size using `clamp()` + a JS fine-fit pass:
      - measure text width
      - compute scale factor = (availableWidth / measuredWidth) * safetyMargin (e.g., 0.98)
      - apply transform scale or reduce font-size until it fits
  - Disable wrapping explicitly:
    - CSS: `white-space: nowrap;`
  - Handle safe areas on iPhone:
    - use `padding: env(safe-area-inset-*)`

Acceptance rule:
- In portrait mobile and desktop widths, “AMANI” never wraps and never clips.

## 11) Tech approach (recommended)
Goal: premium visuals + iPhone Safari performance.

Recommended stack:
- Vite + vanilla JS (or small framework-free)
- SVG for flowers + gradients (inline SVG symbols/components)
- GSAP for timeline animation (or Web Animations API if avoiding deps)
- Minimal CSS, no heavy runtime shaders

Why SVG:
- Crisp, scalable, gradient-friendly
- Easier to animate petals and keep performance reasonable on iPhone Safari

## 12) Performance requirements
- Target: smooth animation on modern phones (iPhone Safari included)
- Use requestAnimationFrame-friendly animations (transform/opacity)
- Avoid expensive filters (large blur/drop-shadow on many elements)
- Adaptive quality:
  - On low power / small screens: fewer particles, fewer flowers, simpler glow

## 13) Project folder deliverable
- /index.html
- /src/
  - main.js (animation timeline + fit-to-screen logic)
  - scene.js (create background, stars, particles)
  - flowers.js (flower templates + variations + bloom animations)
  - typography.js (name rendering + no-wrap fitting algorithm)
  - styles.css
- /assets/ (optional)
  - svg/ (if separating flower SVGs)
- README.md
  - how to run locally
  - how to build and deploy (Vercel/Netlify/GitHub Pages)

## 14) Acceptance criteria (definition of done)
- AC1: Opening shows night-sky scene with zero flowers visible.
- AC2: Flowers bloom in smoothly in waves; they look detailed and varied; palette is red/gradient-heavy.
- AC3: Name “AMANI” reveals in a handwritten style synchronized with bloom.
- AC4: Runs smoothly on iPhone Safari (no major stutters).
- AC5: “AMANI” **never wraps** and fits the screen width cleanly (no clipping), across common viewport sizes.
- AC6: Refresh/replay works without glitches.

## 15) Open questions 
- Add a “tap to replay” hint after it finishes