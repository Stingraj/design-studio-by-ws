import { useEffect, useRef } from 'react';

export default function use3DTilt(maxTilt = 7, scale = 1.015) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * maxTilt * 2;
      targetY = -y * maxTilt * 2;
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      const isHovered = Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05;
      el.style.transform = `perspective(1000px) rotateY(${currentX.toFixed(2)}deg) rotateX(${currentY.toFixed(2)}deg) scale3d(${isHovered ? scale : 1}, ${isHovered ? scale : 1}, 1)`;
      
      rafId = requestAnimationFrame(update);
    };

    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave, { passive: true });
    rafId = requestAnimationFrame(update);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
      if (el) el.style.transform = '';
    };
  }, [maxTilt, scale]);

  return ref;
}
