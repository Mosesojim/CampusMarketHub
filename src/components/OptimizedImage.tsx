import React, { useState } from "react";

export function OptimizedImage({
  src,
  alt,
  className = "",
  referrerPolicy,
  style
}: {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
