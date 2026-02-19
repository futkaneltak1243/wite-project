import { gsap } from 'gsap';
import { startTwinkle, startParticleFloat, startStarDrift, startDustFloat, startMeteors } from './scene.ts';
import { startFlowerGlow, startSparkleGlow, startGradientAnimation, startPetalDrift, startFlowerCycle } from './flower.ts';
import type { NameResult } from './name.ts';

let stoppers: (() => void)[] = [];

/** Kill all running continuous effects (twinkle, glow, drift…). */
export function killContinuousEffects() {
  stoppers.forEach((s) => s());
  stoppers = [];
}

export function createMainTimeline(vine: NameResult): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Clean up all continuous effects on every play/restart
  tl.call(() => {
    stoppers.forEach((s) => s());
    stoppers = [];
  }, [], 0);

  // === Phase 1: Stars + particles (0.0s – 0.6s) ===
  tl.to('.star', {
    opacity: () => 0.2 + Math.random() * 0.5,
    duration: 0.6,
    stagger: { amount: 0.5, from: 'random' as const },
    ease: 'power1.out',
  }, 0);

  tl.to('.particle', {
    opacity: () => 0.15 + Math.random() * 0.3,
    duration: 0.8,
    stagger: { amount: 0.6, from: 'random' as const },
  }, 0.2);

  // Space dust fades in gently behind everything
  tl.to('.space-dust', {
    opacity: () => 0.3 + Math.random() * 0.4,
    duration: 1.5,
    stagger: { amount: 1.0, from: 'random' as const },
    ease: 'power1.out',
  }, 0.1);

  tl.call(() => {
    stoppers.push(startTwinkle());
    stoppers.push(startParticleFloat());
    stoppers.push(startStarDrift());
    stoppers.push(startDustFloat());
    stoppers.push(startMeteors());
  }, [], 0.7);

  // === Phase 2: Flowers bloom (0.5s – 3.5s) ===
  tl.to('.flower', {
    opacity: 1,
    duration: 0.5,
    stagger: { amount: 2.5, from: 'random' as const },
    ease: 'power1.in',
  }, 0.5);

  tl.to('.outer-petal', {
    scale: 1,
    duration: 2.5,
    stagger: { amount: 2, from: 'random' as const },
    ease: 'back.out(1.4)',
  }, 1.0);

  tl.to('.inner-petal', {
    scale: 1,
    duration: 2.0,
    stagger: { amount: 1.5, from: 'random' as const },
    ease: 'back.out(1.2)',
  }, 1.3);

  tl.to('.flower-center', {
    scale: 1,
    duration: 0.8,
    stagger: { amount: 1.5, from: 'random' as const },
    ease: 'elastic.out(1, 0.5)',
  }, 2.0);

  // Sparkles fade in
  tl.to('.sparkle', {
    opacity: () => 0.4 + Math.random() * 0.6,
    duration: 0.5,
    stagger: { amount: 1.5, from: 'random' as const },
  }, 2.5);

  // Start living flower effects
  tl.call(() => {
    stoppers.push(startFlowerGlow());
    stoppers.push(startSparkleGlow());
    stoppers.push(startGradientAnimation());
    stoppers.push(startPetalDrift());
    stoppers.push(startFlowerCycle());
  }, [], 3.0);

  // === Phase 3: Vine-letter outlines grow (1.5s – 4.5s) ===
  // Each vinePath is one glyph outline – staggered so letters appear left→right
  vine.vinePaths.forEach((vp, idx) => {
    tl.to(vp, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 2.5,
      ease: 'power2.inOut',
    }, 1.5 + idx * 0.35);
  });

  vine.glowPaths.forEach((gp, idx) => {
    tl.to(gp, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 2.5,
      ease: 'power2.inOut',
    }, 1.6 + idx * 0.17);
  });

  // === Phase 3b: Tendrils curl out (2.8s – 4.8s) ===
  vine.tendrilPaths.forEach((tp, idx) => {
    tl.to(tp, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 1.2,
      ease: 'power2.out',
    }, 2.8 + idx * 0.08);
  });

  vine.tendrilGlows.forEach((tg, idx) => {
    tl.to(tg, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 1.2,
      ease: 'power2.out',
    }, 2.9 + idx * 0.08);
  });

  // === Phase 4: Vine decorations bloom (3.2s – 5.0s) ===
  vine.leaves.forEach((leaf, idx) => {
    tl.to(leaf, {
      scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
    }, 3.2 + idx * 0.04);
  });

  vine.tinyFlowers.forEach((f, idx) => {
    tl.to(f, {
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    }, 3.4 + idx * 0.08);
  });

  // === Phase 5: Fill solidifies the letter shapes (4.5s – 6.0s) ===
  vine.fillPaths.forEach((fp, idx) => {
    tl.to(fp, {
      opacity: 1,
      duration: 1.2,
      ease: 'power1.in',
    }, 4.5 + idx * 0.15);
  });

  return tl;
}
