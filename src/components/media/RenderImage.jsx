import React from 'react';
import { renderBase } from '../../data/projects';

/** Responsive client render: WebP 800/1400 with the 2000px JPG as fallback. */
export default function RenderImage({ project, slide, alt, eager = false, sizes = '100vw', className, imgClassName }) {
  const base = renderBase(project, slide);
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={`${base}-800.webp 800w, ${base}-1400.webp 1400w`} sizes={sizes} />
      <img
        className={imgClassName}
        src={`${base}.jpg`}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        width="2000"
        height="1125"
      />
    </picture>
  );
}
