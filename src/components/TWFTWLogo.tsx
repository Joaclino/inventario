import React from 'react';

interface TWFTWLogoProps {
  className?: string;
  size?: number;
}

export default function TWFTWLogo({ className = 'w-10 h-10', size }: TWFTWLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo Exterior */}
      <path
        d="M250 20C122.975 20 20 122.975 20 250c0 127.025 102.975 230 230 230 127.025 0 230-102.975 230-230 0-127.025-102.975-230-230-230zm0 395c-91.122 0-165-73.878-165-165 0-91.122 73.878-165 165-165 91.122 0 165 73.878 165 165 0 91.122-73.878 165-165 165z"
        fill="#F5B800"
      />
      {/* Raios / Páginas da Bíblia Radiais */}
      <path
        d="M250 310L125 160l25-15 100 125L380 180l20 15L250 310z"
        fill="#F5B800"
      />
      <path
        d="M250 310L350 90l30 15-130 205z"
        fill="#F5B800"
      />
      {/* Linha Terrestre / Ondas da Base */}
      <path
        d="M100 330c40-10 80 15 150 10s120-15 150-10l-10 25c-30-5-80 15-140 10s-100-20-150-10l-10-25z"
        fill="#F5B800"
      />
    </svg>
  );
}
