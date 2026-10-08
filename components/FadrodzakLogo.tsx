import React from 'react';
import Link from 'next/link';

interface FadrodzakLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'compact' | 'full';
  showLink?: boolean;
}

export default function FadrodzakLogo({
  className = '',
  size = 'md',
  variant = 'compact',
  showLink = false,
}: FadrodzakLogoProps) {
  // Dimensions based on size
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 52,
    xl: 72,
  };

  const currentIconSize = iconSizes[size];

  const EmblemSVG = (
    <svg
      width={currentIconSize}
      height={currentIconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      aria-label="Logo Fadrodzak"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C85A32" />
          <stop offset="60%" stopColor="#AD4620" />
          <stop offset="100%" stopColor="#7E2D11" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="bookPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#F3ECE0" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#C85A32" floodOpacity="0.28" />
        </filter>
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#F59E0B" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Outer Decorative Ring: Orbit Kosmik Aksara (Rotasi sangat halus & lambat) */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#terracottaGrad)"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="url(#goldGrad)"
        strokeWidth="1.1"
        strokeDasharray="4 4"
        strokeOpacity="0.65"
        className="animate-orbit-slow"
      />

      {/* Stylized Open Book Wings / Aksara Base */}
      <path
        d="M50 78 C35 70 20 74 15 76 C15 54 22 46 36 44 C42 43 47 47 50 51 C53 47 58 43 64 44 C78 46 85 54 85 76 C80 74 65 70 50 78 Z"
        fill="url(#bookPageGrad)"
        stroke="url(#terracottaGrad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className="transition-transform duration-700 ease-out group-hover:scale-[1.01]"
      />

      {/* Page lines texture */}
      <g opacity="0.4" className="transition-opacity duration-300 group-hover:opacity-60">
        <path
          d="M23 60 C32 58 40 61 46 64"
          stroke="#7A6B63"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M24 67 C32 65 40 67 46 70"
          stroke="#7A6B63"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M77 60 C68 58 60 61 54 64"
          stroke="#7A6B63"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M76 67 C68 65 60 67 54 70"
          stroke="#7A6B63"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* Central Fountain Pen Nib (Pena Sastra dengan Gerak Bernapas Alami) */}
      <g filter="url(#softGlow)" className="animate-nib-breathe">
        {/* Main Nib Blade */}
        <path
          d="M50 14 L62 42 C64 47 62 55 58 58 L50 63 L42 58 C38 55 36 47 38 42 L50 14 Z"
          fill="url(#terracottaGrad)"
          stroke="#7E2D11"
          strokeWidth="1"
        />

        {/* Nib Gold Center Filigree */}
        <path
          d="M50 20 L58 42 C59 45 57 51 54 53 L50 56 L46 53 C43 51 41 45 42 42 L50 20 Z"
          fill="url(#goldGrad)"
          opacity="0.95"
        />

        {/* Nib Slit and Breather Hole */}
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="37"
          stroke="#2A1002"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="50" cy="37" r="2.2" fill="#2A1002" />
      </g>

      {/* Top Inspiring Spark / Aksara Star (Kilau Ilham Sastra) */}
      <g filter="url(#starGlow)" className="animate-star-pulse">
        <path
          d="M50 7 L51.5 10.5 L55 12 L51.5 13.5 L50 17 L48.5 13.5 L45 12 L48.5 10.5 Z"
          fill="url(#goldGrad)"
        />
      </g>
    </svg>
  );

  const LogoText = (
    <div className="flex flex-col leading-tight select-none">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-serif font-black tracking-tight bg-gradient-to-r from-[#C85A32] via-[#B84E27] to-[#8C3214] bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-normal ${
            size === 'sm'
              ? 'text-lg'
              : size === 'md'
              ? 'text-2xl'
              : size === 'lg'
              ? 'text-3xl'
              : 'text-4xl'
          }`}
        >
          fadrodzak
        </span>
        <span className="relative flex h-2 w-2 mb-0.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-60 duration-1000" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D97706]" />
        </span>
      </div>
      {(variant === 'compact' || variant === 'full') && (
        <span
          className={`font-serif tracking-widest uppercase text-[#736B63] font-semibold transition-colors duration-300 group-hover:text-[#5C544F] ${
            size === 'sm'
              ? 'text-[9px]'
              : size === 'md'
              ? 'text-[10px]'
              : size === 'lg'
              ? 'text-xs'
              : 'text-sm'
          }`}
        >
          Ruang Sastra &amp; Komunitas Aksara
        </span>
      )}
      {variant === 'full' && (
        <span className="text-[11px] font-serif italic text-[#998A7F] mt-0.5">
          &ldquo;Tempat di mana kata-kata menemukan rumahnya&rdquo;
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {EmblemSVG}
      {variant !== 'icon' && LogoText}
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-block hover:opacity-95 transition-opacity" aria-label="Beranda Fadrodzak">
        {content}
      </Link>
    );
  }

  return content;
}
