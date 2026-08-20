import type { Transition, Variants } from 'motion/react';

// Shared motion primitives — keep every animation in the app on the same
// "snappy, restrained" feel (short springs, small offsets) rather than long
// eased tweens. See the animation-pass plan for the reasoning: this is a
// productivity tool, not a meditation app — calm visuals, quick motion.

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 8, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: springSnappy },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};
