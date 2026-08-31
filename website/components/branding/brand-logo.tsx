'use client';

import React, { useState } from 'react';

interface BrandLogoProps {
  logoUrl?: string;
  brandName: string;
  primaryColor?: string;
}

export default function BrandLogo({ logoUrl, brandName, primaryColor = '#2563eb' }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!logoUrl || hasError) {
    return (
      <div
        className="w-11 h-11 sm:w-12 sm:h-12 aspect-square rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-md border border-white/20 tracking-tight select-none flex items-center justify-center shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        {brandName.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="w-11 h-11 sm:w-12 sm:h-12 aspect-square p-1.5 sm:p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-black/15 flex items-center justify-center shrink-0 overflow-hidden select-none"
      title={`${brandName} logo`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${brandName} logo`}
        className="w-full h-full object-contain block mx-auto transition-transform"
        style={{
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
