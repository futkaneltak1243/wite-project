import { gsap } from 'gsap';

export function createFlowers(svg: SVGSVGElement, count: number = 25) {
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width;
  const height = viewBox.height;

  // Create SVG defs element for gradients
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);

  // Create linear gradient for flower petals
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'flower-gradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '100%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#F89B9B');
  gradient.appendChild(stop1);

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#D94A4A');
  gradient.appendChild(stop2);

  defs.appendChild(gradient);

  const petalPathData = 'M0,0 C10,20 40,20 50,0 C40,-20 10,-20 0,0 Z';
  const fillUrl = 'url(#flower-gradient)';

  for (let i = 0; i < count; i++) {
    const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    flowerGroup.setAttribute('class', 'flower');

    for (let j = 0; j < 6; j++) {
      const petal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      petal.setAttribute('class', 'petal');
      petal.setAttribute('d', petalPathData);
      petal.setAttribute('fill', fillUrl);
      petal.setAttribute('transform', `rotate(${j * 60})`);
      flowerGroup.appendChild(petal);
    }

    const randomX = Math.random() * width;
    const randomY = Math.random() * height;
    const randomScale = 0.5 + Math.random() * 0.7; // between 0.5 and 1.2

    // Set initial state using GSAP
    gsap.set(flowerGroup, {
      opacity: 0,
      x: randomX,
      y: randomY,
      scale: randomScale,
    });

    // Set initial state for individual petals within the flower group
    gsap.set(flowerGroup.querySelectorAll('.petal'), {
      scale: 0,
      transformOrigin: '0 0', // Scale from the pivot point of the petal
    });

    svg.appendChild(flowerGroup);
  }
}
