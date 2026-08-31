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
        className="px-3.5 py-1.5 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md border border-white/20 tracking-tight select-none"
        style={{ backgroundColor: primaryColor }}
      >
        {brandName}
      </div>
    );
  }

  return (
    <div
      className="h-10 sm:h-12 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-center min-w-[48px] max-w-[160px] sm:max-w-[200px] shrink-0 overflow-hidden"
      title={`${brandName} logo`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${brandName} logo`}
        className="max-h-7 sm:max-h-8 max-w-full w-auto h-auto object-contain block mx-auto"
        style={{
          objectFit: 'contain',
          maxHeight: '30px',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
