import { createRef, useMemo, useRef } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { usePreviewI18n } from '../i18n';
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

function ProtocolStage({ item, index, total, stageRef }) {
  const shouldReduceMotion = useReducedMotion();
  const { copy } = usePreviewI18n();

  // Scroll tracked against this specific card to trigger its scaling and darkening
  // "start start" means when this card hits the top of the viewport (roughly when it sticks).
  // "end start" means when the next element (after the 60vh margin) reaches the top.
  const { scrollYProgress: recedeProgress } = useScroll({
    target: stageRef,
    offset: ['start 10%', 'end start'],
  });

  const { scrollYProgress: entryProgress } = useScroll({
    target: stageRef,
    offset: ['start 90%', 'start 30%'],
  });

  const entryY = useTransform(entryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [100, 0]);
  const entryOpacity = useTransform(entryProgress, [0, 1], [0.1, 1]);

  const scale = useTransform(recedeProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 0.90]);
  const blur = useTransform(recedeProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 8]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  
  const overlayOpacity = useTransform(recedeProgress, [0, 1], [0, 0.65]);

  const dynamicTop = `calc(12vh + ${index * 3}vh)`;

  // Add margin-bottom so that scrolling continues while this card is stuck,
  // pushing the next card down so it reveals gradually.
  // The last card doesn't need huge margin-bottom unless we want it to stay stuck longer.
  const isLast = index === total - 1;

  return (
    <motion.article
      ref={stageRef}
      className="protocol-card overflow-hidden shadow-2xl"
      style={{
        y: entryY,
        opacity: entryOpacity,
        scale,
        filter,
        top: dynamicTop,
        transformOrigin: 'top center',
        zIndex: index,
        position: 'sticky',
        // Rimuoviamo il marginBottom esagerato per farle stare vicine
        // Così la carta successiva inizia subito sotto e scorre sopra immediatamente
        marginBottom: isLast ? '0' : '5vh',
      }}
    >
      <motion.div 
        className="absolute inset-0 bg-[#06060c] pointer-events-none rounded-[2.5rem]"
        style={{ opacity: overlayOpacity, zIndex: 10 }}
      />

      <div className="relative z-0 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: springEase }}
        >
          <div className="mb-4 font-mono text-sm uppercase tracking-[0.35em] text-plasma">
            {copy.ui.stepLabel(item.step)}
          </div>
          <h3 className="text-3xl font-semibold text-ghost md:text-5xl lg:text-5xl">{item.title}</h3>
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
  );
}

export default function ProtocolSection() {
  const sectionRef = useRef(null);
  const { copy } = usePreviewI18n();
  const stageRefs = useMemo(
    () => copy.protocol.map(() => createRef()),
    [copy.protocol]
  );

  return (
    <section id="protocol" ref={sectionRef} className="section-shell relative">
      <SectionHeading
        eyebrow={copy.sections.protocol.eyebrow}
        title={copy.sections.protocol.title}
        initial={{ opacity: 0, y: 48, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: springEase }}
      />
      
      <div className="relative pb-32 pt-8">
        {copy.protocol.map((item, index) => (
          <ProtocolStage
            key={item.step}
            item={item}
            index={index}
            total={copy.protocol.length}
            stageRef={stageRefs[index]}
          />
        ))}
      </div>
    </section>
  );
}
