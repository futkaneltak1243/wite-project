import { createFlowers } from './animation/flower.ts';
import { createName } from './animation/name.ts';
import { createMainTimeline } from './animation/timeline.ts';

function init() {
  const svg = document.getElementById('animation-canvas') as SVGSVGElement;

  if (!svg) {
    console.error('SVG element with ID "animation-canvas" not found.');
    return;
  }

  const setupCanvas = (svgElement: SVGSVGElement) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  };

  // Set initial size
  setupCanvas(svg);

  // Add resize listener
  window.addEventListener('resize', () => setupCanvas(svg));

  // Create flowers
  createFlowers(svg, 25);

  // Create name
  const nameText = createName(svg);

  // Create and play main timeline
  const mainTimeline = createMainTimeline(nameText);
  mainTimeline.play();
}

// Start the application
init();
