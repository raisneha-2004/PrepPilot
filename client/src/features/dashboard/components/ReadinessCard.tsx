import React from 'react';
import { ReadinessRing } from '../../../components/ui/ReadinessRing';

interface ReadinessCardProps {
  score?: number;
  breakdown?: Record<string, any>;
  disclaimer?: string;
  className?: string;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({
  score = 78,
  breakdown,
  disclaimer,
  className = ''
}) => {
  return (
    <ReadinessRing
      score={score}
      size={175}
      showBreakdown={true}
      breakdown={breakdown}
      disclaimer={disclaimer}
      className={className}
    />
  );
};
