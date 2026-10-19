// Use the CSS layout viewport so the scene fits mobile screens without cropping.
export const viewportWidth = () => document.documentElement.clientWidth || innerWidth;
export const viewportHeight = () => document.documentElement.clientHeight || innerHeight;
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarsePointer = matchMedia('(hover: none)').matches;
export const lowQuality = coarsePointer;
export const useShadows = !lowQuality;
export const pixelRatioCap = lowQuality ? 1.4 : 1.8;
export const select = (selector) => document.querySelector(selector);
export const selectAll = (selector) => Array.from(document.querySelectorAll(selector));
export function aspectFix() {
  return Math.max(0, Math.min(1, (1.62 - viewportWidth() / viewportHeight()) / 1.05));
}
