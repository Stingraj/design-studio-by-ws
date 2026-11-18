import { gsap, ScrollTrigger } from './gsap';

// Shared velocity proxy for all distortion canvases: v = signed, s = strength (0..1)
export const velocityProxy = { v: 0, s: 0 };

const clamp = gsap.utils.clamp(-2000, 2000);
let trigger = null;
let users = 0;

export function acquireVelocity() {
  users += 1;
  if (!trigger) {
    trigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate(self) {
        const raw = clamp(self.getVelocity());
        const norm = raw / 1000;
        const strength = Math.min(1, Math.abs(norm));

        if (Math.abs(strength) > Math.abs(velocityProxy.s)) {
          velocityProxy.v = norm;
          velocityProxy.s = strength;
          gsap.to(velocityProxy, {
            v: 0,
            s: 0,
            duration: 0.8,
            ease: 'sine.inOut',
            overwrite: true,
          });
        }
      },
    });
  }
}

export function releaseVelocity() {
  users = Math.max(0, users - 1);
  if (!users && trigger) {
    trigger.kill();
    trigger = null;
    gsap.killTweensOf(velocityProxy);
    velocityProxy.v = 0;
    velocityProxy.s = 0;
  }
}
