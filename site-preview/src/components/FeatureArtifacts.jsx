import { useEffect, useRef, useState } from 'react';
import { Activity, CalendarRange, Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { usePreviewI18n } from '../i18n';

const springEase = [0.22, 1, 0.36, 1];

const schedulerSteps = [
  { kind: 'day', index: 1 },
  { kind: 'day', index: 2 },
  { kind: 'day', index: 4 },
  { kind: 'day', index: 5 },
  { kind: 'save' },
  { kind: 'reset' },
];

const revealProps = {
  initial: { opacity: 0, y: 44, filter: 'blur(12px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: springEase },
};

export function DiagnosticShuffler() {
  const { copy } = usePreviewI18n();
  const [cards, setCards] = useState(copy.featureCards.shuffler.labels);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setCards(copy.featureCards.shuffler.labels);
  }, [copy.featureCards.shuffler.labels]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCards((current) => {
        const next = [...current];
        next.unshift(next.pop());
        return next;
      });
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      {...revealProps}
      className="artifact-card"
      whileHover={{ y: -8, rotateX: shouldReduceMotion ? 0 : 2, rotateY: shouldReduceMotion ? 0 : -2 }}
    >
      <div className="artifact-head">
        <Layers3 size={18} />
        <span>{copy.featureCards.shuffler.title}</span>
      </div>
      <p className="artifact-copy">{copy.featureCards.shuffler.description}</p>
      <div className="relative mt-8 h-56">
        {cards.map((label, index) => (
          <motion.div
            key={label}
            layout
            className="absolute left-0 top-0 w-full rounded-[1.6rem] border border-white/10 bg-[#131326] p-5 shadow-panel"
            animate={{
              y: index * 24,
              scale: 1 - index * 0.06,
              opacity: 1 - index * 0.18,
              rotate: shouldReduceMotion ? 0 : (index % 2 === 0 ? -1.4 : 1.8) * index * 0.22,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            <div className="text-[0.68rem] font-mono uppercase tracking-[0.3em] text-plasma/80">
              Module 0{index + 1}
            </div>
            <div className="mt-4 text-xl font-semibold text-ghost">{label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function TelemetryTypewriter() {
  const { copy } = usePreviewI18n();
  const messages = copy.featureCards.typewriter.messages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setTyped('');
    setMessageIndex(0);
  }, [messages]);

  useEffect(() => {
    let pointer = 0;
    const currentMessage = messages[messageIndex];
    const typeTimer = window.setInterval(() => {
      pointer += 1;
      setTyped(currentMessage.slice(0, pointer));
      if (pointer >= currentMessage.length) {
        window.clearInterval(typeTimer);
        window.setTimeout(() => {
          setTyped('');
          setMessageIndex((current) => (current + 1) % messages.length);
        }, 1100);
      }
    }, 42);

    return () => window.clearInterval(typeTimer);
  }, [messageIndex, messages]);

  return (
    <motion.div
      {...revealProps}
      className="artifact-card"
      whileHover={{ y: -8, rotateX: shouldReduceMotion ? 0 : -2, rotateY: shouldReduceMotion ? 0 : 2 }}
    >
      <div className="artifact-head">
        <Activity size={18} />
        <span>{copy.featureCards.typewriter.title}</span>
      </div>
      <p className="artifact-copy">{copy.featureCards.typewriter.description}</p>
      <motion.div
        className="mt-8 rounded-[1.8rem] border border-white/10 bg-[#111124] p-5 font-mono text-sm text-ghost/90"
        whileHover={{ scale: 1.01 }}
      >
        <div className="mb-4 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.3em] text-mist/70">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-plasma opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-plasma" />
          </span>
          {copy.ui.liveFeed}
        </div>
        <div className="min-h-24 leading-7">
          {typed}
          <motion.span
            className="ml-1 inline-block h-5 w-[2px] bg-plasma align-middle"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SchedulerCard() {
  const { copy } = usePreviewI18n();
  const containerRef = useRef(null);
  const saveRef = useRef(null);
  const dayRefs = useRef([]);
  const [activeDays, setActiveDays] = useState([]);
  const [cursorState, setCursorState] = useState({ x: 20, y: 20, opacity: 1, scale: 1 });
  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % schedulerSteps.length);
    }, shouldReduceMotion ? 1200 : 820);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const step = schedulerSteps[stepIndex];
    const container = containerRef.current;

    if (!container) return undefined;

    if (step.kind === 'reset') {
      setActiveDays([]);
      setCursorState({ x: 20, y: 20, opacity: 1, scale: 1 });
      return undefined;
    }

    const target =
      step.kind === 'save'
        ? saveRef.current
        : dayRefs.current[step.index];

    if (!target) return undefined;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextState = {
      x: targetRect.left - containerRect.left + targetRect.width / 2 - 12,
      y: targetRect.top - containerRect.top + targetRect.height / 2 - 12,
      opacity: 1,
      scale: 0.9,
    };

    setCursorState(nextState);

    if (step.kind === 'day') {
      setActiveDays((current) => Array.from(new Set([...current, step.index])));
    }

    const releaseTimer = window.setTimeout(() => {
      setCursorState((current) => ({ ...current, scale: 1, opacity: step.kind === 'save' ? 0.35 : 1 }));
    }, shouldReduceMotion ? 20 : 180);

    return () => window.clearTimeout(releaseTimer);
  }, [shouldReduceMotion, stepIndex]);

  useEffect(() => {
    function syncCursor() {
      const step = schedulerSteps[stepIndex];
      const container = containerRef.current;
      if (!container || step.kind === 'reset') return;

      const target =
        step.kind === 'save'
          ? saveRef.current
          : dayRefs.current[step.index];

      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setCursorState((current) => ({
        ...current,
        x: targetRect.left - containerRect.left + targetRect.width / 2 - 12,
        y: targetRect.top - containerRect.top + targetRect.height / 2 - 12,
      }));
    }

    window.addEventListener('resize', syncCursor);
    return () => window.removeEventListener('resize', syncCursor);
  }, [stepIndex]);

  const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <motion.div
      {...revealProps}
      className="artifact-card"
      whileHover={{ y: -8, rotateX: shouldReduceMotion ? 0 : 1.5, rotateY: shouldReduceMotion ? 0 : -1.5 }}
    >
      <div className="artifact-head">
        <CalendarRange size={18} />
        <span>{copy.featureCards.scheduler.title}</span>
      </div>
      <p className="artifact-copy">{copy.featureCards.scheduler.description}</p>
      <div ref={containerRef} className="relative mt-8 rounded-[1.8rem] border border-white/10 bg-[#111124] p-5">
        <motion.div
          className="scheduler-cursor"
          animate={cursorState}
          transition={{
            x: { type: 'spring', stiffness: 240, damping: 24 },
            y: { type: 'spring', stiffness: 240, damping: 24 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.18 },
          }}
        />
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => (
            <motion.div
              key={`${day}-${index}`}
              ref={(node) => {
                dayRefs.current[index] = node;
              }}
              animate={{
                backgroundColor: activeDays.includes(index) ? 'rgba(123, 97, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: activeDays.includes(index) ? 'rgba(123, 97, 255, 0.62)' : 'rgba(255, 255, 255, 0.08)',
                color: activeDays.includes(index) ? 'rgba(240, 239, 244, 1)' : 'rgba(194, 195, 210, 0.7)',
                y: activeDays.includes(index) ? -2 : 0,
              }}
              transition={{ duration: 0.35, ease: springEase }}
              className="rounded-2xl border px-0 py-4 text-center text-sm font-mono"
            >
              {day}
            </motion.div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.3em] text-mist/60">
            {copy.featureCards.scheduler.caption}
          </div>
          <motion.button
            ref={saveRef}
            className="magnetic-button text-xs"
            animate={{
              boxShadow: activeDays.length >= 4 ? '0 16px 40px rgba(123, 97, 255, 0.28)' : '0 0 0 rgba(123, 97, 255, 0)',
            }}
          >
            <span />
            <span className="relative z-10">{copy.ui.save}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
