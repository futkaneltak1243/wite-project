import { gsap } from 'gsap';
import opentype from 'opentype.js';

const NS = 'http://www.w3.org/2000/svg';
const FONT_URL = 'https://fonts.gstatic.com/s/allura/v23/9oRPNYsQpS4zjuAPjA.ttf';

const LEAF_PATH = 'M0,-8 C-3,-6 -5,-2 -4,1 C-3,4 0,6 0,6 C0,6 3,4 4,1 C5,-2 3,-6 0,-8Z';
const TINY_FLOWER_COLORS = ['#FF6B9D', '#E040FB', '#FF8AAE', '#FFD700', '#F48FB1', '#CE93D8'];
const LEAF_COLORS = ['#3a9a3a', '#2d7a2d', '#4aaa4a', '#228B22', '#3d8b3d'];

// ---------------------------------------------------------------------------
// Font loading (cached after first fetch so resize rebuilds are instant)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fontCache: any = null;

async function loadFont() {
  if (fontCache) return fontCache;
  const res = await fetch(FONT_URL);
  const buf = await res.arrayBuffer();
  fontCache = opentype.parse(buf);
  return fontCache;
}

// ---------------------------------------------------------------------------
// Catmull-Rom spline for smooth tendril curves
// ---------------------------------------------------------------------------

interface Pt { x: number; y: number }

function crPath(pts: Pt[], tension = 0.3): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1.x + (p2.x - p0.x) * tension},${p1.y + (p2.y - p0.y) * tension}` +
         ` ${p2.x - (p3.x - p1.x) * tension},${p2.y - (p3.y - p1.y) * tension}` +
         ` ${p2.x},${p2.y}`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function mkPath(
  parent: SVGGElement, d: string,
  stroke: string, width: number, cls: string,
): SVGPathElement {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', stroke);
  p.setAttribute('stroke-width', String(width));
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  p.setAttribute('class', cls);
  parent.appendChild(p);
  return p;
}

function initDash(p: SVGPathElement) {
  const len = p.getTotalLength();
  gsap.set(p, { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len } });
}

// ---------------------------------------------------------------------------
// Exported interface + async factory
// ---------------------------------------------------------------------------

export interface NameResult {
  vinePaths: SVGPathElement[];
  glowPaths: SVGPathElement[];
  fillPaths: SVGPathElement[];
  tendrilPaths: SVGPathElement[];
  tendrilGlows: SVGPathElement[];
  leaves: SVGElement[];
  tinyFlowers: SVGElement[];
}

export async function createName(svg: SVGSVGElement): Promise<NameResult> {
  const { width: w, height: h } = svg.viewBox.baseVal;

  // ── Load & parse font (cached after first call) ──────────────────────
  const font = await loadFont();

  // ── Responsive font size ──────────────────────────────────────────────
  const fontSize = Math.max(80, Math.min(w * 0.32, h * 0.25, 240));

  // ── Generate glyph outlines ───────────────────────────────────────────
  // Per-glyph paths for staggered vine-growth animation
  const glyphPaths = font.getPaths('Amani', 0, 0, fontSize);
  // Combined path for the unified fill layer + bounding box
  const combined = font.getPath('Amani', 0, 0, fontSize);
  const bb = combined.getBoundingBox();

  // ── Center on viewport ────────────────────────────────────────────────
  // opentype.js already flips Y internally (font y-up → SVG y-down),
  // so bounding-box coords are in SVG space and can be used directly.
  const textCX = (bb.x1 + bb.x2) / 2;
  const textCY = (bb.y1 + bb.y2) / 2;
  const tx = w / 2 - textCX;
  const ty = h / 2 - textCY;

  const vineGroup = document.createElementNS(NS, 'g');
  vineGroup.setAttribute('class', 'vine-name');
  vineGroup.setAttribute('transform', `translate(${tx}, ${ty})`);
  svg.appendChild(vineGroup);

  const vinePaths: SVGPathElement[] = [];
  const glowPaths: SVGPathElement[] = [];
  const fillPaths: SVGPathElement[] = [];
  const tendrilPaths: SVGPathElement[] = [];
  const tendrilGlows: SVGPathElement[] = [];
  const leaves: SVGElement[] = [];
  const tinyFlowers: SVGElement[] = [];

  // ── Fill layer (behind everything, fades in after vines draw) ─────────
  const fillD = combined.toPathData(2);
  if (fillD && fillD.length > 5) {
    const fp = document.createElementNS(NS, 'path');
    fp.setAttribute('d', fillD);
    fp.setAttribute('fill', 'rgba(50, 140, 70, 0.25)');
    fp.setAttribute('stroke', 'none');
    fp.setAttribute('class', 'vine-fill');
    gsap.set(fp, { opacity: 0 });
    vineGroup.appendChild(fp);
    fillPaths.push(fp);
  }

  // ── Per-glyph vine strokes (glow + main + highlight) ──────────────────
  glyphPaths.forEach((glyph) => {
    const d = glyph.toPathData(2);
    if (!d || d.length < 5) return;

    // Wide soft glow
    glowPaths.push(mkPath(vineGroup, d, 'rgba(80, 220, 130, 0.2)', 9, 'vine-glow'));
    // Main vine stroke
    vinePaths.push(mkPath(vineGroup, d, '#2a8a4a', 2.5, 'vine-path'));
    // Thin bright highlight
    glowPaths.push(mkPath(vineGroup, d, 'rgba(140, 255, 180, 0.3)', 0.8, 'vine-glow'));
  });

  // ── Stroke-dash initialisation ────────────────────────────────────────
  [...vinePaths, ...glowPaths].forEach(initDash);

  // ── Tendrils branching perpendicular to vine curves ───────────────────
  vinePaths.forEach((vp) => {
    const len = vp.getTotalLength();
    if (len < 15) return;
    const count = Math.max(1, Math.floor(len / 55));

    for (let i = 0; i < count; i++) {
      const along = ((i + 0.25 + Math.random() * 0.5) / count) * len;
      const pt = vp.getPointAtLength(along);

      // Approximate tangent → perpendicular
      const pA = vp.getPointAtLength(Math.max(0, along - 2));
      const pB = vp.getPointAtLength(Math.min(len, along + 2));
      const tangent = Math.atan2(pB.y - pA.y, pB.x - pA.x);
      const perp = tangent + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);

      const tLen = fontSize * (0.1 + Math.random() * 0.15);
      const curl = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.5);

      const pts: Pt[] = [pt];
      for (let j = 1; j <= 5; j++) {
        const s = j / 5;
        const a = perp + curl * s * s;
        const dist = tLen * s;
        pts.push({ x: pt.x + Math.cos(a) * dist, y: pt.y + Math.sin(a) * dist });
      }
      const td = crPath(pts, 0.35);

      tendrilGlows.push(mkPath(vineGroup, td, 'rgba(100, 230, 150, 0.15)', 4, 'tendril-glow'));
      tendrilPaths.push(mkPath(vineGroup, td, '#3aaa5a', 1.4, 'tendril-path'));
    }
  });

  [...tendrilPaths, ...tendrilGlows].forEach(initDash);

  // ── Leaves & tiny flowers along vine paths ────────────────────────────
  vinePaths.forEach((vp) => {
    const len = vp.getTotalLength();
    if (len < 20) return;
    const count = Math.max(2, Math.floor(len / 45));

    for (let i = 0; i < count; i++) {
      const t = (i + 0.2 + Math.random() * 0.6) / count;
      const pt = vp.getPointAtLength(len * t);

      const wrap = document.createElementNS(NS, 'g');
      wrap.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);

      if (i % 3 === 0) {
        // Tiny flower
        const fg = document.createElementNS(NS, 'g');
        fg.setAttribute('class', 'vine-flower');
        const petalN = 4 + Math.floor(Math.random() * 3);
        const color = TINY_FLOWER_COLORS[Math.floor(Math.random() * TINY_FLOWER_COLORS.length)];

        const glow = document.createElementNS(NS, 'circle');
        glow.setAttribute('r', '5');
        glow.setAttribute('fill', color);
        glow.setAttribute('opacity', '0.2');
        fg.appendChild(glow);

        for (let p = 0; p < petalN; p++) {
          const el = document.createElementNS(NS, 'ellipse');
          el.setAttribute('rx', '2.2');
          el.setAttribute('ry', '4');
          el.setAttribute('fill', color);
          el.setAttribute('opacity', '0.85');
          el.setAttribute('transform', `rotate(${(360 / petalN) * p}) translate(0, -4)`);
          fg.appendChild(el);
        }
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', '1.4');
        c.setAttribute('fill', '#FFD700');
        fg.appendChild(c);
        gsap.set(fg, { scale: 0 });
        wrap.appendChild(fg);
        tinyFlowers.push(fg);
      } else {
        // Leaf
        const leaf = document.createElementNS(NS, 'path');
        leaf.setAttribute('d', LEAF_PATH);
        leaf.setAttribute('fill', LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]);
        leaf.setAttribute('class', 'vine-leaf');
        leaf.setAttribute('transform', `rotate(${Math.random() * 140 - 70}) scale(${0.7 + Math.random() * 0.6})`);
        gsap.set(leaf, { scale: 0, transformOrigin: '0px 0px' });
        wrap.appendChild(leaf);
        leaves.push(leaf);
      }
      vineGroup.appendChild(wrap);
    }
  });

  // Buds at tendril tips
  tendrilPaths.forEach((tp) => {
    const len = tp.getTotalLength();
    const tip = tp.getPointAtLength(len * 0.95);
    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('transform', `translate(${tip.x}, ${tip.y})`);
    const bud = document.createElementNS(NS, 'circle');
    bud.setAttribute('r', '2');
    bud.setAttribute('fill', TINY_FLOWER_COLORS[Math.floor(Math.random() * TINY_FLOWER_COLORS.length)]);
    bud.setAttribute('class', 'vine-flower');
    gsap.set(bud, { scale: 0 });
    wrap.appendChild(bud);
    tinyFlowers.push(bud);
    vineGroup.appendChild(wrap);
  });

  return { vinePaths, glowPaths, fillPaths, tendrilPaths, tendrilGlows, leaves, tinyFlowers };
}
