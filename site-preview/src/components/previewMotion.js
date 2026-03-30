export const springEase = [0.22, 1, 0.36, 1];

export const heroGroupVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.14,
    },
  },
};

export const heroItemVariants = {
  hidden: { opacity: 0, y: 42, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: springEase,
    },
  },
};

export const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

export const sectionItemVariants = {
  hidden: { opacity: 0, y: 52, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: springEase,
    },
  },
};

export const wordVariants = {
  hidden: { opacity: 0, y: '115%', filter: 'blur(12px)' },
  visible: (index) => ({
    opacity: 1,
    y: '0%',
    filter: 'blur(0px)',
    transition: {
      duration: 0.95,
      delay: 0.18 + index * 0.06,
      ease: springEase,
    },
  }),
};
