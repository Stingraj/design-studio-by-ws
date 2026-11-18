import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Observer } from 'gsap/Observer';
import { ExpoScaleEase } from 'gsap/EasePack';

gsap.registerPlugin(ScrollTrigger, Flip, SplitText, MorphSVGPlugin, Observer, ExpoScaleEase);

// Legacy home-page sections read GSAP from window; keep a single shared instance.
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, Flip, SplitText, MorphSVGPlugin, Observer };
