"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * The page's one entrance rhythm.
 *
 * Every section that reveals on scroll should pull its curve, distance and timing from
 * here rather than declaring its own, so the page reads as one document being scrolled
 * through instead of a stack of separately-authored blocks. The numbers live in this
 * file precisely so that retuning the feel is one edit, not fifteen.
 */

/** Smooth ease-out. Shared by the framer variants below AND by RevealOnScroll's CSS. */
export const EASE = [0.25, 0.1, 0.25, 1] as const;

/**
 * amount 0.15: a section commits once a sixth of it is on screen. Low enough that a tall
 * section starts moving as it arrives rather than after it has already filled the
 * viewport; high enough that a sliver at the very bottom edge does not fire it early.
 *
 * once: true, because a section re-playing its entrance every time it is scrolled back
 * past is the thing that makes a long page feel restless.
 */
export const SECTION_VIEWPORT = { once: true, amount: 0.15 } as const;

/**
 * The section shell. Its own move is the whole block easing up 40px; the transition on
 * `visible` also seeds the stagger that any motion descendants inherit through context,
 * which is why children need no delays of their own.
 */
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE,
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

/**
 * A child inside a revealing section. Shorter travel than the shell on purpose: the
 * section is already carrying everything up 40px, so a child that also moved 40px would
 * read as double motion rather than as sequence.
 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay before this block starts, for staggering sibling shells. */
  delay?: number;
}

/**
 * Wraps a section's content. Renders a plain motion.div, so it can take the layout
 * classes the element it replaces was carrying and add no box of its own.
 *
 * Reduced motion starts at the end state rather than animating to it: with once: true
 * there is no second chance to reveal the content, so skipping the animation must not
 * mean skipping the content.
 *
 * One hazard worth naming, because it is why not every section on this page uses this:
 * an animated `y` leaves a transform on the element, and a transformed ancestor becomes
 * the containing block for any `position: sticky` descendant - which silently breaks
 * pinning. Never wrap a section that pins something (About's horizontal track, the globe
 * range, ServicesScrollStory) in one of these.
 */
export const SectionReveal: React.FC<RevealProps> = ({ children, className, delay = 0 }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={sectionVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
};

/**
 * One staggered child. Takes its cue from the nearest SectionReveal through framer's
 * context - no whileInView of its own, so it can never fire independently of its section.
 */
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.div className={className} variants={itemVariants}>
    {children}
  </motion.div>
);

export default SectionReveal;
