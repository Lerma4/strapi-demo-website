import { motion } from 'motion/react';

export default function SectionHeading({
  eyebrow,
  title,
  children,
  className = 'section-heading',
  titleClassName = '',
  ...motionProps
}) {
  return (
    <motion.div className={className} {...motionProps}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className={titleClassName}>{title}</h2>
      {children}
    </motion.div>
  );
}
