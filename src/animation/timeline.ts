import gsap from 'gsap';

export function createMainTimeline(nameText: SVGTextElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Flower bloom animation
  tl.to(".flower", { opacity: 1, duration: 1, stagger: 0.1 }, 1);

  // Petal animation
  tl.to(".petal", { scale: 1, duration: 3.5, stagger: 0.05 }, 1);

  // Name reveal animation
  tl.to(nameText, { "stroke-dashoffset": 0, duration: 2 }, 3);

  return tl;
}
