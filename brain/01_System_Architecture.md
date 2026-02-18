# System Architecture: AMANI Bloom Reveal

## 1. Overview
This project aims to create a single-page website for 'AMANI Bloom Reveal'. The core feature is a captivating ~6-second, auto-playing, premium animation designed to introduce the 'AMANI' brand with a visual flourish of blooming flowers.

## 2. Technology Stack
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Animation Library:** GSAP (GreenSock Animation Platform)
*   **Graphics:** Inline SVG for all graphical elements to ensure scalability, crispness, and performance across various devices and resolutions.

## 3. Project Structure
```
. 
├── index.html
└── src/
    ├── main.ts
    ├── styles.css
    ├── animation/
    │   ├── timeline.ts
    │   ├── flower.ts
    │   └── name.ts
    └── assets/
```

*   `index.html`: The single HTML entry point for the application.
*   `src/`: Main source code directory.
*   `src/main.ts`: The primary application script, responsible for initializing the animation and setting up the main scene.
*   `src/styles.css`: Contains global CSS for styling the page background, general layout, and base styles for SVG elements.
*   `src/animation/`: A dedicated module for all animation-related logic.
    *   `src/animation/timeline.ts`: Defines the main GSAP animation timeline, orchestrating the sequence of events.
    *   `src/animation/flower.ts`: Encapsulates logic for creating, positioning, and animating individual flower SVG elements.
    *   `src/animation/name.ts`: Handles the creation and animation of the 'AMANI' name SVG element.
*   `src/assets/`: Intended for static assets, though most graphics (flowers, name) will be generated programmatically via TypeScript and SVG.

## 4. Animation Timeline (6 Seconds)

*   **0.0s - 1.0s: Scene Setup**
    *   A calm, empty night-sky background is displayed. This phase establishes the initial mood and visual context before the main action begins.
*   **1.0s - 4.5s: Flowers Bloom**
    *   Multiple flower elements appear and animate from a bud state to full bloom. Each flower will have slightly different start times, durations, and scales to create a natural, organic, and visually rich blooming effect.
*   **3.0s - 5.0s: 'AMANI' Name Reveal**
    *   The 'AMANI' name, rendered in a distinctive handwritten style, animates into view. This reveal is carefully synchronized to coincide with the peak of the flower blooming sequence, creating a harmonious visual climax.
*   **5.0s - 6.0s: Final Composition**
    *   The animation concludes, and the final scene holds. This includes the fully bloomed flowers and the revealed 'AMANI' name, presenting the complete brand aesthetic.

## 5. Asset Strategy

*   **Flowers:** A single, detailed flower design will be defined either as an SVG `<symbol>` within `index.html` or programmatically generated in TypeScript. This approach allows for efficient reuse. Multiple instances of this flower will be created using `<use>` tags (referencing the symbol) or by dynamically appending SVG paths, and then positioned and scaled across the screen to form a diverse floral arrangement.
*   **Name ('AMANI'):** The name 'AMANI' will be rendered as an SVG `<text>` element. This provides granular control over its typography, styling, and animation properties, ensuring it integrates seamlessly with the overall design.

## 6. Responsive Design & No-Wrap Constraint

To ensure the 'AMANI' name never wraps and the animation scales correctly across different screen sizes, the following strategy will be employed:

*   **Main Container:** The entire visual experience will be contained within a single SVG element that is styled to fill the entire browser viewport (`width: 100%; height: 100%;`).
*   **Dynamic `viewBox`:** The `viewBox` attribute of this main SVG element will be dynamically updated via JavaScript. On page load and any subsequent browser window resize events, the `viewBox` will be set to match the current viewport dimensions (e.g., `0 0 viewportWidth viewportHeight`). This ensures that all internal SVG elements scale proportionally to the available screen space.
*   **'AMANI' Text Scaling:** For the 'AMANI' SVG `<text>` element, the `textLength` and `lengthAdjust='spacingAndGlyphs'` attributes will be utilized. By setting `textLength` to a percentage of the `viewBox` width (e.g., `textLength='90%'`), the text will be forced to scale horizontally to fit within 90% of the available SVG width. This critical technique guarantees that the 'AMANI' name will always fit on a single line, stretching or compressing as needed, thereby satisfying the core project constraint of preventing text wrapping.