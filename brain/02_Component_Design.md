# Component Design

## 1. Overview
This document specifies the visual design, SVG structure, and animation details for the core components of the 'AMANI Bloom Reveal' animation.

## 2. Flower Component

### Visual Style
Flowers should be detailed and elegant, using a palette of deep reds, pinks, and subtle oranges. They must use SVG gradients to achieve a rich, smooth look.

### SVG Structure
Each flower will be constructed from multiple layers of petals to create depth. A single flower definition will be created as an SVG `<symbol>` for efficient reuse. The structure should be something like `<g class='flower'><g class='petals'>...</g><g class='center'>...</g></g>`.

### Animation (Bloom Effect)
The bloom animation will be controlled by GSAP. It will involve scaling and rotating individual petals from a small, closed state to a large, open state over approximately 3.5 seconds (from 1.0s to 4.5s in the main timeline). Each flower instance will have a slightly different delay and scale to create an organic, non-uniform appearance.

## 3. Name ('AMANI') Component

### Visual Style
The name 'AMANI' will be rendered in a flowing, elegant, handwritten script font. The color will be a soft, glowing white to contrast with the dark background.

### SVG Structure
The name will be an SVG `<text>` element. A `<filter>` element will be used to apply a subtle `feGaussianBlur` effect, creating the soft glow.

### Animation (Reveal Effect)
The name will be revealed using a 'drawing' effect. This will be achieved by animating the `stroke-dashoffset` property of the text path from its full length to 0. This animation will occur between 3.0s and 5.0s in the main timeline, synchronized with the flowers reaching their full bloom.

## 4. Background Component

### Visual Style
The background will be a smooth, vertical linear gradient representing a night sky, transitioning from a deep navy blue at the top to a dark purple at the bottom.

### Ambiance
To create a 'magical ambience', a few small, circular SVG shapes representing stars will be scattered across the background. These stars will have a subtle, slow-pulsing opacity animation (e.g., fading from 20% to 70% opacity and back) to create a twinkling effect. This animation will loop for the duration of the experience.
