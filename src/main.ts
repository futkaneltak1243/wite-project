import { createFlowers } from './animation/flower.ts';
import { createName } from './animation/name.ts';
import { createStars, createParticles, createSpaceDust, createMeteors } from './animation/scene.ts';
import { createMainTimeline, killContinuousEffects } from './animation/timeline.ts';

let currentTl: gsap.core.Timeline | null = null;
let resizeTimer = 0;

/**
 * Build (or rebuild) every layer in the SVG scene.
 * Stores the new paused timeline in `currentTl`.
 *
 * NOTE: we intentionally do NOT return the GSAP timeline because
 * GSAP timelines are "thenable" — returning one from an async function
 * would cause `await buildScene()` to hang until the animation completes.
 */
async function buildScene(svg: SVGSVGElement): Promise<void> {
  const w = window.innerWidth;
  const h = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // Tear down previous scene
  if (currentTl) {
    currentTl.kill();
    currentTl = null;
  }
  killContinuousEffects();
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Responsive element counts
  const isSmall = w < 600;
  const isMedium = w < 1024;
  const flowerCount = isSmall ? 15 : isMedium ? 22 : 30;
  const starCount = isSmall ? 30 : 50;
  const particleCount = isSmall ? 12 : 20;

  // Approximate name exclusion zone so flowers don't overlap the text.
  // Use the actual text proportions (~2.6× wide, ~0.7× tall) plus padding,
  // and clamp to viewport so the zone never exceeds the screen.
  const fontSize = Math.max(80, Math.min(w * 0.32, h * 0.25, 240));
  const pad = 50;
  const nameW = Math.min(fontSize * 3.0 + pad * 2, w * 0.92);
  const nameH = Math.min(fontSize * 1.4 + pad * 2, h * 0.55);
  const exclude = {
    x1: Math.max(0, w / 2 - nameW / 2),
    y1: Math.max(0, h / 2 - nameH / 2),
    x2: Math.min(w, w / 2 + nameW / 2),
    y2: Math.min(h, h / 2 + nameH / 2),
  };

  // Responsive counts for new effects
  const dustCount = isSmall ? 6 : isMedium ? 8 : 10;
  const meteorCount = isSmall ? 3 : 5;

  // Build scene layers (DOM order = z-stacking)
  createStars(svg, starCount);
  createSpaceDust(svg, dustCount);
  createParticles(svg, particleCount);
  createFlowers(svg, flowerCount, exclude);
  createMeteors(svg, meteorCount);
  const vineElements = await createName(svg);

  currentTl = createMainTimeline(vineElements);
}

async function init() {
  await document.fonts.ready;

  const svg = document.getElementById('animation-canvas') as unknown as SVGSVGElement;
  if (!svg) return;

  const replayBtn = document.getElementById('replay-btn');

  // Initial build
  await buildScene(svg);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    currentTl!.progress(1);
  } else {
    currentTl!.play();
  }

  currentTl!.eventCallback('onComplete', () => {
    replayBtn?.classList.add('visible');
  });

  replayBtn?.addEventListener('click', () => {
    replayBtn.classList.remove('visible');
    currentTl?.restart();
  });

  // Debounced resize – rebuilds the entire scene for the new viewport
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(async () => {
      const wasDone = currentTl ? currentTl.progress() >= 1 : false;
      replayBtn?.classList.remove('visible');

      await buildScene(svg);

      if (wasDone || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        currentTl!.progress(1);
        replayBtn?.classList.add('visible');
      } else {
        currentTl!.play();
      }

      currentTl!.eventCallback('onComplete', () => {
        replayBtn?.classList.add('visible');
      });
    }, 300);
  });
}

init();
