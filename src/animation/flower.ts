import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';

// 6 unique magical flower shapes
const TYPES = [
  { // Rose
    outer: 'M0,0 C-10,-6 -14,-20 -8,-32 C-4,-40 4,-40 8,-32 C14,-20 10,-6 0,0Z',
    inner: 'M0,0 C-7,-4 -10,-14 -5,-22 C-2,-28 2,-28 5,-22 C10,-14 7,-4 0,0Z',
    oRange: [6, 8] as [number, number],
    iRange: [5, 7] as [number, number],
    iScale: 0.55, cR: 4, gR: 34,
  },
  { // Star
    outer: 'M0,0 C-2,-8 -3,-24 0,-34 C3,-24 2,-8 0,0Z',
    inner: 'M0,0 C-1.5,-6 -2,-16 0,-22 C2,-16 1.5,-6 0,0Z',
    oRange: [5, 7] as [number, number],
    iRange: [5, 6] as [number, number],
    iScale: 0.45, cR: 4.5, gR: 30,
  },
  { // Crystal
    outer: 'M0,0 L-6,-16 L0,-36 L6,-16 Z',
    inner: 'M0,0 L-4,-11 L0,-25 L4,-11 Z',
    oRange: [6, 8] as [number, number],
    iRange: [4, 6] as [number, number],
    iScale: 0.5, cR: 3.5, gR: 28,
  },
  { // Spirit Orb
    outer: 'M0,0 C-1,-6 -1.5,-14 0,-20 C1.5,-14 1,-6 0,0Z',
    inner: null,
    oRange: [10, 14] as [number, number],
    iRange: [0, 0] as [number, number],
    iScale: 0, cR: 6, gR: 38,
  },
  { // Wildflower
    outer: 'M0,0 C-9,-4 -14,-16 -6,-28 C-2,-34 2,-34 6,-28 C14,-16 9,-4 0,0Z',
    inner: 'M0,0 C-6,-3 -9,-12 -4,-20 C-1,-24 1,-24 4,-20 C9,-12 6,-3 0,0Z',
    oRange: [5, 7] as [number, number],
    iRange: [4, 5] as [number, number],
    iScale: 0.6, cR: 3, gR: 32,
  },
  { // Bell
    outer: 'M0,0 C-7,-3 -14,-12 -11,-24 C-9,-32 -3,-38 0,-40 C3,-38 9,-32 11,-24 C14,-12 7,-3 0,0Z',
    inner: null,
    oRange: [5, 6] as [number, number],
    iRange: [0, 0] as [number, number],
    iScale: 0, cR: 4.5, gR: 36,
  },
];

// Magical color palettes
const PALETTES = [
  { light: '#FF8AAE', dark: '#8B0020', center: '#FFD700', glow: '#FF4081', shift: '#FFB0D0' },
  { light: '#FF6B9D', dark: '#AD1457', center: '#FFC107', glow: '#FF6B9D', shift: '#E0A0FF' },
  { light: '#E080FB', dark: '#7B1FA2', center: '#E1BEE7', glow: '#D040FB', shift: '#FF90C0' },
  { light: '#FF7272', dark: '#B71C1C', center: '#FFEB3B', glow: '#FF5252', shift: '#FFD0A0' },
  { light: '#F4A0C0', dark: '#C2185B', center: '#FFF9C4', glow: '#F48FB1', shift: '#D0B0FF' },
  { light: '#D093E8', dark: '#6A1B9A', center: '#F3E5F5', glow: '#CE93D8', shift: '#FF90A0' },
  { light: '#FF8A80', dark: '#C62828', center: '#FFD54F', glow: '#EF5350', shift: '#E0C0FF' },
  { light: '#FF9EC0', dark: '#880E4F', center: '#FFFFFF', glow: '#F06292', shift: '#FFD0E0' },
];

const SPARKLE_COLORS = ['#ffffff', '#ffe0f0', '#e0e0ff', '#fff0d0'];

function ri(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function addStop(grad: Element, offset: string, color: string, opacity?: string) {
  const s = document.createElementNS(NS, 'stop');
  s.setAttribute('offset', offset);
  s.setAttribute('stop-color', color);
  if (opacity) s.setAttribute('stop-opacity', opacity);
  grad.appendChild(s);
  return s;
}

export function createFlowers(
  svg: SVGSVGElement, count: number,
  exclude?: { x1: number; y1: number; x2: number; y2: number },
): void {
  const { width: w, height: h } = svg.viewBox.baseVal;

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  // One unique gradient PER flower (so each can animate independently)
  for (let i = 0; i < count; i++) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const pi = Math.floor(Math.random() * PALETTES.length);
    const pal = PALETTES[pi];

    // Per-flower petal gradient
    const pg = document.createElementNS(NS, 'radialGradient');
    pg.setAttribute('id', `pg-${i}`);
    pg.setAttribute('cx', '30%');
    pg.setAttribute('cy', '30%');
    pg.setAttribute('r', '75%');
    addStop(pg, '0%', pal.light);
    addStop(pg, '100%', pal.dark);
    defs!.appendChild(pg);

    // Per-flower glow gradient
    const gg = document.createElementNS(NS, 'radialGradient');
    gg.setAttribute('id', `gg-${i}`);
    addStop(gg, '0%', pal.glow, '0.5');
    addStop(gg, '100%', pal.glow, '0');
    defs!.appendChild(gg);

    const flower = document.createElementNS(NS, 'g');
    flower.setAttribute('class', 'flower');
    flower.setAttribute('data-pal', String(pi));

    // Glow circle
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('r', String(type.gR));
    glow.setAttribute('fill', `url(#gg-${i})`);
    glow.setAttribute('class', 'flower-glow');
    flower.appendChild(glow);

    // Outer petals
    const oCount = ri(type.oRange[0], type.oRange[1]);
    const oStep = 360 / oCount;
    for (let j = 0; j < oCount; j++) {
      const wrap = document.createElementNS(NS, 'g');
      wrap.setAttribute('transform', `rotate(${oStep * j + Math.random() * 6 - 3})`);
      const petal = document.createElementNS(NS, 'path');
      petal.setAttribute('d', type.outer);
      petal.setAttribute('fill', `url(#pg-${i})`);
      petal.setAttribute('class', 'petal outer-petal');
      petal.setAttribute('opacity', '0.9');
      gsap.set(petal, { scale: 0, transformOrigin: '0px 0px' });
      wrap.appendChild(petal);
      flower.appendChild(wrap);
    }

    // Inner petals (solid lighter fill for depth contrast)
    if (type.inner && type.iRange[1] > 0) {
      const iCount = ri(type.iRange[0], type.iRange[1]);
      const iStep = 360 / iCount;
      const iOff = iStep / 2;
      for (let j = 0; j < iCount; j++) {
        const wrap = document.createElementNS(NS, 'g');
        wrap.setAttribute('transform', `rotate(${iStep * j + iOff + Math.random() * 4 - 2}) scale(${type.iScale})`);
        const petal = document.createElementNS(NS, 'path');
        petal.setAttribute('d', type.inner);
        petal.setAttribute('fill', pal.light);
        petal.setAttribute('class', 'petal inner-petal');
        petal.setAttribute('opacity', '0.75');
        gsap.set(petal, { scale: 0, transformOrigin: '0px 0px' });
        wrap.appendChild(petal);
        flower.appendChild(wrap);
      }
    }

    // Center
    const center = document.createElementNS(NS, 'circle');
    center.setAttribute('r', String(type.cR));
    center.setAttribute('fill', pal.center);
    center.setAttribute('class', 'flower-center');
    gsap.set(center, { scale: 0, transformOrigin: '0px 0px' });
    flower.appendChild(center);

    // Sparkle dots
    const sCount = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < sCount; j++) {
      const angle = (Math.PI * 2 * j) / sCount + Math.random() * 0.8;
      const dist = type.gR * 0.35 + Math.random() * type.gR * 0.55;
      const sp = document.createElementNS(NS, 'circle');
      sp.setAttribute('cx', String(Math.cos(angle) * dist));
      sp.setAttribute('cy', String(Math.sin(angle) * dist));
      sp.setAttribute('r', String(0.7 + Math.random() * 0.7));
      sp.setAttribute('fill', SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]);
      sp.setAttribute('class', 'sparkle');
      gsap.set(sp, { opacity: 0 });
      flower.appendChild(sp);
    }

    // Position — place in allowed regions only (top / bottom / left / right of name)
    let x: number, y: number;
    if (!exclude) {
      x = w * 0.02 + Math.random() * w * 0.96;
      y = Math.random() * h;
    } else {
      // 4 allowed zones around the exclusion rect, weighted by area (clamped to 0)
      const topA = Math.max(0, w * exclude.y1);
      const botA = Math.max(0, w * (h - exclude.y2));
      const midH = exclude.y2 - exclude.y1;
      const leftA = Math.max(0, exclude.x1 * midH);
      const rightA = Math.max(0, (w - exclude.x2) * midH);
      const total = topA + botA + leftA + rightA;

      if (total < 1) {
        // Fallback: place at random edge
        x = Math.random() * w;
        y = Math.random() > 0.5 ? Math.random() * h * 0.15 : h - Math.random() * h * 0.15;
      } else {
        const r = Math.random() * total;
        if (r < topA) {
          x = Math.random() * w;
          y = Math.random() * exclude.y1;
        } else if (r < topA + botA) {
          x = Math.random() * w;
          y = exclude.y2 + Math.random() * (h - exclude.y2);
        } else if (r < topA + botA + leftA) {
          x = Math.random() * exclude.x1;
          y = exclude.y1 + Math.random() * midH;
        } else {
          x = exclude.x2 + Math.random() * (w - exclude.x2);
          y = exclude.y1 + Math.random() * midH;
        }
      }
    }

    gsap.set(flower, {
      x, y,
      scale: 0.4 + Math.random() * 0.8,
      rotation: Math.random() * 360,
      opacity: 0,
    });

    svg.appendChild(flower);
  }
}

// Animated gradient highlights – each flower's gradient center slowly drifts
export function startGradientAnimation(): () => void {
  const tweens: gsap.core.Tween[] = [];

  // Move the gradient highlight position on each flower
  document.querySelectorAll('radialGradient[id^="pg-"]').forEach((grad) => {
    tweens.push(gsap.to(grad, {
      attr: {
        cx: `${40 + Math.random() * 30}%`,
        cy: `${40 + Math.random() * 30}%`,
      },
      duration: 2.5 + Math.random() * 2.5,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 2,
    }));
  });

  // Shift the gradient highlight color on each flower
  document.querySelectorAll('radialGradient[id^="pg-"]').forEach((grad) => {
    const firstStop = grad.querySelector('stop');
    if (firstStop) {
      const flowerEl = document.querySelector(`[fill="url(#${grad.id})"]`)?.closest('.flower');
      const pi = Number(flowerEl?.getAttribute('data-pal') ?? 0);
      const targetColor = PALETTES[pi].shift;
      tweens.push(gsap.to(firstStop, {
        attr: { 'stop-color': targetColor },
        duration: 3 + Math.random() * 3,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: Math.random() * 3,
      }));
    }
  });

  return () => tweens.forEach((t) => t.kill());
}

// Glow halo pulse
export function startFlowerGlow(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.flower-glow').forEach((g) => {
    tweens.push(gsap.to(g, {
      scale: 1.15 + Math.random() * 0.2,
      duration: 2 + Math.random() * 2,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 2,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

// Sparkle twinkling
export function startSparkleGlow(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.sparkle').forEach((s) => {
    tweens.push(gsap.to(s, {
      opacity: 0.3 + Math.random() * 0.7,
      duration: 0.5 + Math.random() * 0.8,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 2,
    }));
  });
  return () => tweens.forEach((t) => t.kill());
}

// Flower lifecycle — random flowers close then different ones rebloom
export function startFlowerCycle(): () => void {
  const flowers = Array.from(document.querySelectorAll('.flower'));
  if (flowers.length < 4) return () => {};

  let running = true;
  const activeTweens: gsap.core.Timeline[] = [];
  let timer: number;

  function cycle() {
    if (!running) return;

    const f = flowers[Math.floor(Math.random() * flowers.length)];
    const outerP = f.querySelectorAll('.outer-petal');
    const innerP = f.querySelectorAll('.inner-petal');
    const center = f.querySelector('.flower-center');
    const sparkles = f.querySelectorAll('.sparkle');

    const tl = gsap.timeline();

    // ── Close ──
    tl.to(sparkles, { opacity: 0, duration: 0.6 }, 0);
    tl.to(outerP, {
      scale: 0, duration: 1.4,
      stagger: { amount: 0.3, from: 'random' as const },
      ease: 'power2.in',
    }, 0);
    tl.to(innerP, {
      scale: 0, duration: 1.1,
      stagger: { amount: 0.2, from: 'random' as const },
      ease: 'power2.in',
    }, 0.2);
    if (center) tl.to(center, { scale: 0, duration: 0.7, ease: 'power2.in' }, 0.5);

    // ── Pause while closed ──
    // ── Rebloom ──
    tl.to(outerP, {
      scale: 1, duration: 2,
      stagger: { amount: 0.4, from: 'random' as const },
      ease: 'back.out(1.4)',
    }, '+=1.5');
    tl.to(innerP, {
      scale: 1, duration: 1.5,
      stagger: { amount: 0.3, from: 'random' as const },
      ease: 'back.out(1.2)',
    }, '<0.3');
    if (center) tl.to(center, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, '<0.5');
    tl.to(sparkles, {
      opacity: () => 0.4 + Math.random() * 0.6,
      duration: 0.5,
      stagger: { amount: 0.3, from: 'random' as const },
    }, '<0.3');

    activeTweens.push(tl);
    timer = window.setTimeout(cycle, 2000 + Math.random() * 3000);
  }

  timer = window.setTimeout(cycle, 3000 + Math.random() * 2000);

  return () => {
    running = false;
    clearTimeout(timer);
    activeTweens.forEach((t) => t.kill());
  };
}

// Subtle petal drift – some petals slowly rotate a few degrees
export function startPetalDrift(): () => void {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll('.outer-petal').forEach((p) => {
    if (Math.random() > 0.4) {
      tweens.push(gsap.to(p, {
        rotation: `+=${1.5 + Math.random() * 3}`,
        duration: 3 + Math.random() * 4,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: Math.random() * 3,
      }));
    }
  });
  return () => tweens.forEach((t) => t.kill());
}
