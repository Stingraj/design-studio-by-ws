import React from 'react';

export default function VelocityImage({ src, alt, className = '', eager = false }) {
  return (
    <div className={`frame ${className}`.trim()} data-img={src}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  );
}
