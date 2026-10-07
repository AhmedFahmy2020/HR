import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  // Deterministic neutral background for initials
  const getInitialsBg = (str: string) => {
    const colors = [
      'bg-slate-200 text-slate-800',
      'bg-zinc-200 text-zinc-800',
      'bg-stone-200 text-stone-800',
      'bg-neutral-200 text-neutral-800',
      'bg-blue-100 text-blue-900',
      'bg-teal-100 text-teal-900',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 border border-neutral-200/80 shadow-xs ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeClasses[size]} ${getInitialsBg(name)} rounded-full flex items-center justify-center shrink-0 font-medium tracking-tight border border-neutral-200/80 shadow-xs select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
