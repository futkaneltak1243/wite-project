import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';

export function createStars(svg: SVGSVGElement, count: number): void {
  const { width: w, height: h } = svg.viewBox.baseVal;
  for (let i = 0; i < count; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', String(Math.random() * w));
    c.setAttribute('cy', String(Math.random() * h));
    c.setAttribute('r', String(0.5 + Math.random() * 1.5));
    c.setAttribute('fill', Math.random() > 0.7 ? '#b0c4ff' : '#fff');
    c.setAttribute('class', 'star');
    gsap.set(c, { opacity: 0 });
    svg.appendChild(c);
  }
}

export function createParticles(svg: SVGSVGElement, count: number): void {
  const { width: w, height: h } = svg.viewBox.baseVal;
  const colors = ['#ff9ecf', '#c4b5fd', '#93c5fd', '#fde68a', '#fff'];
  for (let i = 0; i < count; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', String(0.4 + Math.random() * 0.8));
    c.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
    c.setAttribute('class', 'particle');
    gsap.set(c, { x: Math.random() * w, y: Math.random() * h, opacity: 0 });
    svg.appendChild(c);
  }
}

// ---------------------------------------------------------------------------
// Space dust — layered nebula clouds built from radial-gradient ellipses
// ---------------------------------------------------------------------------

const NEBULA_PALETTE = [
  { r: 120, g: 50, b: 200 },   // deep purple
  { r: 180, g: 80, b: 255 },   // bright purple
  { r: 80, g: 110, b: 220 },   // blue
  { r: 60, g: 160, b: 200 },   // teal
  { r: 200, g: 60, b: 140 },   // magenta
  { r: 255, g: 120, b: 180 },  // pink
  { r: 140, g: 60, b: 200 },   // violet
  { r: 80, g: 180, b: 160 },   // cyan-green
];

function ensureDefs(svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector('defs') as SVGDefsElement | null;
  if (!defs) {
    defs = document.createElementNS(NS, 'defs') as SVGDefsElement;
    svg.insertBefore(defs, svg.firstChild);
  }
  return defs;
}

function createNebulaGradients(svg: SVGSVGElement): void {
  const defs = ensureDefs(svg);
  if (svg.querySelector('#nebula-grad-0')) return;

  NEBULA_PALETTE.forEach((c, i) => {
    const grad = document.createElementNS(NS, 'radialGradient');
    grad.setAttribute('id', `nebula-grad-${i}`);
    // Slightly off-center for asymmetry
    grad.setAttribute('cx', '45%');
    grad.setAttribute('cy', '42%');
    grad.setAttribute('r', '50%');

    const stops = [
      { off: '0%',   a: 0.45 },
      { off: '30%',  a: 0.28 },
      { off: '60%',  a: 0.12 },
      { off: '100%', a: 0 },
    ];
    stops.forEach(({ off, a }) => {
      const s = document.createElementNS(NS, 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`);
      grad.appendChild(s);
    });

    defs.appendChild(grad);
  });

  // A subtle soft-blur filter only for the small wisp layer
  if (!svg.querySelector('#dust-soft')) {
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'dust-soft');
    filter.setAttribute('x', '-40%');
    filter.setAttribute('y', '-40%');
    filter.setAttribute('width', '180%');
    filter.setAttribute('height', '180%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '8');
    filter.appendChild(blur);
    defs.appendChild(filter);
  }
}

export function createSpaceDust(svg: SVGSVGElement, count: number): void {
  const { width: w, height: h } = svg.viewBox.baseVal;
  const minDim = Math.min(w, h);

  createNebulaGradients(svg);

  const pLen = NEBULA_PALETTE.length;
  const rGrad = () => `url(#nebula-grad-${Math.floor(Math.random() * pLen)})`;

  // ── Layer 1: Large background nebula wash ────────────────────────────
  const bgCount = Math.max(2, Math.ceil(count * 0.4));
  for (let i = 0; i < bgCount; i++) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'space-dust');

    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const baseR = minDim * (0.35 + Math.random() * 0.45);

    // 2-3 very large overlapping ellipses
    const layers = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < layers; j++) {
      const el = document.createElementNS(NS, 'ellipse');
      el.setAttribute('cx', String(cx + (Math.random() - 0.5) * baseR * 0.3));
      el.setAttribute('cy', String(cy + (Math.random() - 0.5) * baseR * 0.3));
      el.setAttribute('rx', String(baseR * (0.7 + Math.random() * 0.6)));
      el.setAttribute('ry', String(baseR * (0.45 + Math.random() * 0.5)));
      el.setAttribute('fill', rGrad());
      el.setAttribute('transform',
        `rotate(${Math.random() * 360} ${cx} ${cy})`);
      el.setAttribute('opacity', '0.55');
      g.appendChild(el);
    }

    gsap.set(g, { opacity: 0 });
    svg.appendChild(g);
  }

  // ── Layer 2: Main dust clouds (clustered, multi-colour) ─────────────
  for (let i = 0; i < count; i++) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'space-dust');

    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const baseR = minDim * (0.12 + Math.random() * 0.18);

    // Pick a dominant colour family (2 adjacent palette entries)
    const famStart = Math.floor(Math.random() * pLen);
    const famGrad = () =>
      `url(#nebula-grad-${(famStart + Math.floor(Math.random() * 2)) % pLen})`;

    // 3-5 overlapping ellipses per cloud
    const layers = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < layers; j++) {
      const el = document.createElementNS(NS, 'ellipse');
      const ox = (Math.random() - 0.5) * baseR * 0.5;
      const oy = (Math.random() - 0.5) * baseR * 0.5;
      el.setAttribute('cx', String(cx + ox));
      el.setAttribute('cy', String(cy + oy));
      el.setAttribute('rx', String(baseR * (0.5 + Math.random() * 0.9)));
      el.setAttribute('ry', String(baseR * (0.3 + Math.random() * 0.7)));
      el.setAttribute('fill', famGrad());
      el.setAttribute('transform',
        `rotate(${Math.random() * 360} ${cx + ox} ${cy + oy})`);
      g.appendChild(el);
    }

    gsap.set(g, { opacity: 0 });
    svg.appendChild(g);
  }

  // ── Layer 3: Small bright wisps ─────────────────────────────────────
  const wispCount = Math.max(2, Math.ceil(count * 0.6));
  for (let i = 0; i < wispCount; i++) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'space-dust');

    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const baseR = minDim * (0.05 + Math.random() * 0.08);

    // 1-2 small elongated bright ellipses
    const layers = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < layers; j++) {
      const el = document.createElementNS(NS, 'ellipse');
      el.setAttribute('cx', String(cx));
      el.setAttribute('cy', String(cy));
      el.setAttribute('rx', String(baseR * (1.2 + Math.random() * 2.0)));
      el.setAttribute('ry', String(baseR * (0.3 + Math.random() * 0.5)));
      el.setAttribute('fill', rGrad());
      el.setAttribute('filter', 'url(#dust-soft)');
      el.setAttribute('transform',
        `rotate(${Math.random() * 360} ${cx} ${cy})`);
      g.appendChild(el);
    }

    gsap.set(g, { opacity: 0 });
    svg.appendChild(g);
  }
}

// ---------------------------------------------------------------------------
// Meteors — bright streaks that shoot across the sky
// ---------------------------------------------------------------------------

export function createMeteors(svg: SVGSVGElement, count: number): void {
  const defs = ensureDefs(svg);
  if (!svg.querySelector('#meteor-glow')) {
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'meteor-glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '2.5');
    filter.appendChild(blur);
    defs.appendChild(filter);
  }

  const colors = ['#fff', '#ffe4b5', '#b0c4ff', '#ffd0e0', '#c4b5fd'];

  for (let i = 0; i < count; i++) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'meteor');

    const color = colors[Math.floor(Math.random() * colors.length)];

    // Glow trail — wide soft stroke
    const glow = document.createElementNS(NS, 'line');
    glow.setAttribute('x1', '0'); glow.setAttribute('y1', '0');
    glow.setAttribute('x2', '0'); glow.setAttribute('y2', '0');
    glow.setAttribute('stroke', color);
    glow.setAttribute('stroke-width', '4');
    glow.setAttribute('stroke-linecap', 'round');
    glow.setAttribute('filter', 'url(#meteor-glow)');
    glow.setAttribute('opacity', '0.5');
    glow.setAttribute('class', 'meteor-trail');
    g.appendChild(glow);

    // Core streak — thin bright centre
    const core = document.createElementNS(NS, 'line');
    core.setAttribute('x1', '0'); core.setAttribute('y1', '0');
    core.setAttribute('x2', '0'); core.setAttribute('y2', '0');
    core.setAttribute('stroke', '#fff');
    core.setAttribute('stroke-width', '1.5');
    core.setAttribute('stroke-linecap', 'round');
    core.setAttribute('class', 'meteor-trail');
    g.appendChild(core);

    // Bright head dot
    const head = document.createElementNS(NS, 'circle');
    head.setAttribute('cx', '0'); head.setAttribute('cy', '0');
    head.setAttribute('r', '2');
    head.setAttribute('fill', '#fff');
    head.setAttribute('class', 'meteor-head');
    g.appendChild(head);

    gsap.set(g, { opacity: 0 });
    svg.appendChild(g);
  }
}

// ---------------------------------------------------------------------------
// Continuous effects
// ---------------------------------------------------------------------------

export function startTwinkle(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.star').forEach((s) => {
    tweens.push(gsap.to(s, {
      opacity: 0.15 + Math.random() * 0.55,
      duration: 1.5 + Math.random() * 2.5,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 3,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

export function startParticleFloat(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.particle').forEach((p) => {
    tweens.push(gsap.to(p, {
      x: `+=${-20 + Math.random() * 40}`,
      y: `+=${-25 + Math.random() * 10}`,
      opacity: 0.15 + Math.random() * 0.35,
      duration: 4 + Math.random() * 4,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 3,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

/** Slow star drift for a living-sky feel. */
export function startStarDrift(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.star').forEach((s) => {
    tweens.push(gsap.to(s, {
      x: `+=${-30 + Math.random() * 60}`,
      y: `+=${-25 + Math.random() * 50}`,
      duration: 8 + Math.random() * 10,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 4,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

/** Space dust slowly drifts and breathes. */
export function startDustFloat(): () => void {
  const tweens: gsap.core.Tween[] = [];
  const dusts = document.querySelectorAll('.space-dust');
  const total = dusts.length;

  dusts.forEach((d, i) => {
    // Larger background clouds drift slower and more broadly
    const isBackground = i < total * 0.3;
    const range = isBackground ? 50 : 25 + Math.random() * 25;
    const dur = isBackground ? 20 + Math.random() * 15 : 12 + Math.random() * 14;

    tweens.push(gsap.to(d, {
      x: `+=${-range + Math.random() * range * 2}`,
      y: `+=${-range * 0.6 + Math.random() * range * 1.2}`,
      rotation: `+=${-15 + Math.random() * 30}`,
      duration: dur,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 5,
    }));
    tweens.push(gsap.to(d, {
      opacity: `random(0.35, 0.8)`,
      duration: 5 + Math.random() * 7,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 4,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

/** Meteors fire across the sky at random intervals. */
export function startMeteors(): () => void {
  const meteors = Array.from(document.querySelectorAll('.meteor'));
  if (!meteors.length) return () => {};

  const svg = document.getElementById('animation-canvas') as unknown as SVGSVGElement;
  if (!svg) return () => {};
  const w = svg.viewBox.baseVal.width;
  const h = svg.viewBox.baseVal.height;

  let running = true;
  const activeTweens: gsap.core.Timeline[] = [];
  let timer: number;

  function fire() {
    if (!running) return;

    const m = meteors[Math.floor(Math.random() * meteors.length)];
    const trails = m.querySelectorAll('.meteor-trail');
    const head = m.querySelector('.meteor-head')!;

    // Angle 120-160° (standard math) → moves left & down in SVG
    const theta = 120 + Math.random() * 40;
    const rad = theta * Math.PI / 180;

    const sx = w * 0.3 + Math.random() * w * 0.65;
    const sy = -20 + Math.random() * h * 0.2;
    const dist = 300 + Math.random() * 400;
    const ex = sx + Math.cos(rad) * dist;
    const ey = sy + Math.sin(rad) * dist;

    const dur = 0.3 + Math.random() * 0.3;
    const tailLag = dur * 0.22; // tail follows the head with this delay

    const tl = gsap.timeline();

    // Show the meteor group
    tl.set(m, { opacity: 1 });

    // ── Head (circle) travels start → end ──
    tl.fromTo(head,
      { attr: { cx: sx, cy: sy } },
      { attr: { cx: ex, cy: ey }, duration: dur, ease: 'none' },
      0);
    tl.set(head, { opacity: 1 }, 0);

    // ── Line front end (x1, y1) follows the head exactly ──
    tl.fromTo(trails,
      { attr: { x1: sx, y1: sy } },
      { attr: { x1: ex, y1: ey }, duration: dur, ease: 'none' },
      0);

    // ── Line back end (x2, y2) follows with a lag ──
    // This creates: no tail → grows → full → shrinks → gone
    tl.fromTo(trails,
      { attr: { x2: sx, y2: sy } },
      { attr: { x2: ex, y2: ey }, duration: dur, ease: 'none' },
      tailLag);

    // Fade head dot near the end
    tl.to(head, { opacity: 0, duration: dur * 0.15 }, dur * 0.8);

    // Hide the group once the tail catches up
    tl.set(m, { opacity: 0 }, dur + tailLag + 0.02);

    activeTweens.push(tl);
    timer = window.setTimeout(fire, 500 + Math.random() * 1200);
  }

  timer = window.setTimeout(fire, 200 + Math.random() * 600);

  return () => {
    running = false;
    clearTimeout(timer);
    activeTweens.forEach((t) => t.kill());
  };
}
