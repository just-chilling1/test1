"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import {
  scrollRevealTransition,
  scrollRevealVariants,
  scrollRevealViewport,
  type ScrollRevealVariant,
} from "@/lib/scroll-reveal";

type ScrollRevealProps = HTMLMotionProps<"div"> & {
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
};

export function ScrollReveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  duration,
  once = scrollRevealViewport.once,
  amount = scrollRevealViewport.amount,
  ...rest
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={scrollRevealVariants[variant]}
      transition={{
        ...scrollRevealTransition,
        duration: duration ?? scrollRevealTransition.duration,
        delay,
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
};

export function ScrollRevealGroup({
  children,
  className,
  stagger = 0.12,
  delayChildren = 0,
  once = scrollRevealViewport.once,
  amount = scrollRevealViewport.amount,
}: ScrollRevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealItemProps = HTMLMotionProps<"div"> & {
  variant?: ScrollRevealVariant;
};

export function ScrollRevealItem({
  children,
  className,
  variant = "fadeUp",
  ...rest
}: ScrollRevealItemProps) {
  return (
    <motion.div
      variants={scrollRevealVariants[variant]}
      transition={scrollRevealTransition}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
