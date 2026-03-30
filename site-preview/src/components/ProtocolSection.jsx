import { createRef, useMemo, useRef } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { fallbackExperience } from '../demoContent';
import SectionHeading from './SectionHeading';

const springEase = [0.22, 1, 0.36, 1];

function ProtocolVisual({ index, shouldReduceMotion }) {
  if (index === 0) {
    return (
      <motion.svg viewBox="0 0 300 300" className="h-64 w-full text-plasma/90">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 16, ease: 'linear', repeat: Infinity }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <circle cx="150" cy="150" r="84" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="150" cy="150" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M90 85C140 120 160 180 210 215" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M90 215C140 180 160 120 210 85" fill="none" stroke="currentColor" strokeWidth="3" />
        </motion.g>
      </motion.svg>
    );
  }

  if (index === 1) {
    return (
      <div className="laser-grid">
        <motion.div
          className="laser-line"
          animate={{ y: shouldReduceMotion ? 0 : [0, 168, 0] }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 3.8, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>
    );
  }

  return (
    <motion.svg viewBox="0 0 420 120" className="h-40 w-full text-plasma/90">
      <motion.path
        d="M0 70 H85 L120 30 L165 95 L205 48 L252 82 L305 18 L360 70 H420"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{
          pathLength: shouldReduceMotion ? 1 : [0.05, 1, 1],
          opacity: shouldReduceMotion ? 1 : [0.4, 1, 0.72],
        }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 3.6, ease: 'easeInOut', repeat: Infinity }}
      />
    </motion.svg>
  );
}

function ProtocolStage({ item, index, stageRef, nextStageRef }) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress: entryProgress } = useScroll({
    target: stageRef,
    offset: ['start 86%', 'start 28%'],
  });
  const { scrollYProgress: nextProgress } = useScroll({
    target: nextStageRef || stageRef,
    offset: ['start 76%', 'start 20%'],
  });

  const y = useTransform(entryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [88, 0]);
  const entryOpacity = useTransform(entryProgress, [0, 1], [0.35, 1]);
  const scale = nextStageRef
    ? useTransform(nextProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 0.92])
    : 1;
  const fadedOpacity = nextStageRef
    ? useTransform(nextProgress, [0, 1], [1, 0.55])
    : entryOpacity;
  const blur = useTransform(nextProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 18]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <div ref={stageRef} className="protocol-stage">
      <motion.article
        className="protocol-card"
        style={{
          y,
          scale,
          opacity: fadedOpacity,
          filter: nextStageRef ? filter : 'none',
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: springEase }}
          >
            <div className="mb-4 font-mono text-sm uppercase tracking-[0.35em] text-plasma">
              Step {item.step}
            </div>
            <h3 className="text-3xl font-semibold text-ghost md:text-5xl">{item.title}</h3>
            <p className="mt-6 max-w-xl text-base leading-8 text-mist/75 md:text-lg">
              {item.description}
            </p>
          </motion.div>
          <motion.div
            className="protocol-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: springEase }}
          >
            <ProtocolVisual index={index} shouldReduceMotion={shouldReduceMotion} />
          </motion.div>
        </div>
      </motion.article>
    </div>
  );
}

export default function ProtocolSection() {
  const sectionRef = useRef(null);
  const stageRefs = useMemo(
    () => fallbackExperience.protocol.map(() => createRef()),
    []
  );

  return (
    <section id="protocol" ref={sectionRef} className="section-shell">
      <SectionHeading
        eyebrow="Protocol"
        title="Sticky stacking archive for the publishing journey."
        initial={{ opacity: 0, y: 48, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: springEase }}
      />
      <div className="space-y-20">
        {fallbackExperience.protocol.map((item, index) => (
          <ProtocolStage
            key={item.step}
            item={item}
            index={index}
            stageRef={stageRefs[index]}
            nextStageRef={stageRefs[index + 1]}
          />
        ))}
      </div>
    </section>
  );
}
