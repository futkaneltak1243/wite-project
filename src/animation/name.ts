import { gsap } from 'gsap';

export function createName(svg: SVGSVGElement): SVGTextElement {
  // Create <defs> element
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  // Create <filter> element with id='glow'
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'glow');

  // Create <feGaussianBlur> inside the filter
  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feGaussianBlur.setAttribute('stdDeviation', '2.5');
  feGaussianBlur.setAttribute('result', 'coloredBlur');
  filter.appendChild(feGaussianBlur);

  // Append the filter to <defs>
  defs.appendChild(filter);

  // Create SVG <text> element
  const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  nameText.setAttribute('id', 'name-text');
  nameText.textContent = 'AMANI';

  // Center the text
  nameText.setAttribute('x', '50%');
  nameText.setAttribute('y', '50%');
  nameText.setAttribute('dominant-baseline', 'middle');
  nameText.setAttribute('text-anchor', 'middle');

  // Style the text
  nameText.setAttribute('fill', 'none');
  nameText.setAttribute('stroke', 'white');
  nameText.setAttribute('stroke-width', '1');
  nameText.setAttribute('font-family', 'Brush Script MT, cursive');
  nameText.setAttribute('font-size', '100');

  // Apply the glow filter
  nameText.setAttribute('filter', 'url(#glow)');

  // Implement no-wrap constraint
  nameText.setAttribute('textLength', '90%');
  nameText.setAttribute('lengthAdjust', 'spacingAndGlyphs');

  // Append <defs> and the <text> element to the main SVG
  svg.appendChild(defs);
  svg.appendChild(nameText);

  // Get the total length of the text path
  const pathLength = (nameText as any).getTotalLength();

  // Use gsap.set() to initialize the text for the drawing animation
  gsap.set(nameText, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  return nameText;
}
