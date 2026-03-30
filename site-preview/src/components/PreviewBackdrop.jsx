import { motion } from 'motion/react';

export default function PreviewBackdrop({ orbOneY, orbTwoY }) {
  return (
    <>
      <svg className="absolute h-0 w-0">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      <div className="noise-layer" />
      <motion.div className="floating-orb orb-one" style={{ y: orbOneY }} />
      <motion.div className="floating-orb orb-two" style={{ y: orbTwoY }} />
    </>
  );
}
