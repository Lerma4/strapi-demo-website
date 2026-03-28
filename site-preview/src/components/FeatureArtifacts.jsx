import { useEffect, useRef, useState } from 'react';
import { Activity, CalendarRange, Layers3 } from 'lucide-react';
import gsap from 'gsap';
import { fallbackExperience } from '../demoContent';

export function DiagnosticShuffler() {
  const [cards, setCards] = useState(fallbackExperience.featureCards.shuffler.labels);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCards((current) => {
        const next = [...current];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="artifact-card">
      <div className="artifact-head">
        <Layers3 size={18} />
        <span>{fallbackExperience.featureCards.shuffler.title}</span>
      </div>
      <p className="artifact-copy">{fallbackExperience.featureCards.shuffler.description}</p>
      <div className="relative mt-8 h-52">
        {cards.map((label, index) => (
          <div
            key={label}
            className="absolute left-0 top-0 w-full rounded-[1.6rem] border border-white/10 bg-[#131326] p-5 shadow-panel transition-all duration-700"
            style={{
              transform: `translateY(${index * 20}px) scale(${1 - index * 0.05})`,
              opacity: 1 - index * 0.18,
              zIndex: 3 - index,
            }}
          >
            <div className="text-[0.68rem] font-mono uppercase tracking-[0.3em] text-plasma/80">
              Module 0{index + 1}
            </div>
            <div className="mt-4 text-xl font-semibold text-ghost">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TelemetryTypewriter() {
  const messages = fallbackExperience.featureCards.typewriter.messages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [typed, setTyped] = useState('');

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
    <div className="artifact-card">
      <div className="artifact-head">
        <Activity size={18} />
        <span>{fallbackExperience.featureCards.typewriter.title}</span>
      </div>
      <p className="artifact-copy">{fallbackExperience.featureCards.typewriter.description}</p>
      <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-[#111124] p-5 font-mono text-sm text-ghost/90">
        <div className="mb-4 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.3em] text-mist/70">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-plasma opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-plasma" />
          </span>
          Live feed
        </div>
        <div className="min-h-24 leading-7">
          {typed}
          <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-plasma align-middle" />
        </div>
      </div>
    </div>
  );
}

export function SchedulerCard() {
  const cursorRef = useRef(null);
  const saveRef = useRef(null);
  const dayRefs = useRef([]);
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sequence = [1, 2, 4, 5];
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      timeline.call(() => setActiveDays([]));
      sequence.forEach((index) => {
        timeline.to(cursorRef.current, {
          duration: 0.55,
          x: dayRefs.current[index]?.offsetLeft + dayRefs.current[index]?.offsetWidth / 2 - 12,
          y: dayRefs.current[index]?.offsetTop + dayRefs.current[index]?.offsetHeight / 2 - 12,
          ease: 'power2.inOut',
        });
        timeline.to(cursorRef.current, { duration: 0.12, scale: 0.95, yoyo: true, repeat: 1 });
        timeline.call(() => {
          setActiveDays((current) => Array.from(new Set([...current, index])));
        });
      });
      timeline.to(cursorRef.current, {
        duration: 0.6,
        x: saveRef.current?.offsetLeft + 20,
        y: saveRef.current?.offsetTop - 8,
        ease: 'power2.inOut',
      });
      timeline.to(cursorRef.current, { duration: 0.2, scale: 0.92, yoyo: true, repeat: 1 });
      timeline.to(cursorRef.current, { duration: 0.3, autoAlpha: 0 });
      timeline.set(cursorRef.current, { x: 0, y: 0, autoAlpha: 1, scale: 1 });
    });

    return () => ctx.revert();
  }, []);

  const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <div className="artifact-card">
      <div className="artifact-head">
        <CalendarRange size={18} />
        <span>{fallbackExperience.featureCards.scheduler.title}</span>
      </div>
      <p className="artifact-copy">{fallbackExperience.featureCards.scheduler.description}</p>
      <div className="relative mt-8 rounded-[1.8rem] border border-white/10 bg-[#111124] p-5">
        <div ref={cursorRef} className="scheduler-cursor" />
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => (
            <div
              key={`${day}-${index}`}
              ref={(node) => {
                dayRefs.current[index] = node;
              }}
              className={`rounded-2xl border px-0 py-4 text-center text-sm font-mono transition-all duration-300 ${
                activeDays.includes(index)
                  ? 'border-plasma bg-plasma/20 text-ghost shadow-[0_0_0_1px_rgba(123,97,255,0.3)]'
                  : 'border-white/10 bg-white/5 text-mist/70'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.3em] text-mist/60">
            {fallbackExperience.featureCards.scheduler.caption}
          </div>
          <button ref={saveRef} className="magnetic-button text-xs">
            <span />
            <span className="relative z-10">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
