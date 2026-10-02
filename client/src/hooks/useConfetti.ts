import confetti from 'canvas-confetti';

export function useConfetti() {
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch (_) {}
  };

  const triggerStars = () => {
    try {
      confetti({
        shapes: ['star'],
        particleCount: 40,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ffaa00', '#ffffff']
      });
    } catch (_) {}
  };

  return { triggerConfetti, triggerStars };
}
