let lenis = null;

export const setLenis = (instance) => { lenis = instance; };
export const getLenis = () => lenis;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export function scrollToElement(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function stopScroll() { lenis?.stop(); }
export function startScroll() { lenis?.start(); }
