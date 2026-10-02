import React from 'react';

export const ShimmerCard: React.FC<{ className?: string }> = ({ className = 'h-36' }) => (
  <div className={`glass-card p-4 rounded-2xl overflow-hidden shimmer ${className}`} />
);

export const ShimmerList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-16 rounded-xl glass-card shimmer" />
    ))}
  </div>
);

export const ShimmerGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-44 rounded-2xl glass-card shimmer" />
    ))}
  </div>
);
