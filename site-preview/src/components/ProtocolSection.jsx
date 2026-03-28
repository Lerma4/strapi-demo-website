import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { fallbackExperience } from '../demoContent';

export default function ProtocolSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0.4 },
          {
            y: 0,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 78%',
              end: 'top 38%',
              scrub: true,
            },
          }
        );

        if (index > 0) {
          const previous = cards[index - 1];
          gsap.to(previous, {
            scale: 0.9,
            opacity: 0.5,
            filter: 'blur(20px)',
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: card,
              start: 'top 70%',
              end: 'top 25%',
              scrub: true,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={sectionRef} className="section-shell">
      <div className="section-heading">
        <div className="eyebrow">Protocol</div>
        <h2>Sticky stacking archive for the publishing journey.</h2>
      </div>
      <div className="space-y-20">
        {fallbackExperience.protocol.map((item, index) => (
          <div key={item.step} className="protocol-stage">
            <article className="protocol-card">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <div className="mb-4 font-mono text-sm uppercase tracking-[0.35em] text-plasma">
                    Step {item.step}
                  </div>
                  <h3 className="text-3xl font-semibold text-ghost md:text-5xl">{item.title}</h3>
                  <p className="mt-6 max-w-xl text-base leading-8 text-mist/75 md:text-lg">
                    {item.description}
                  </p>
                </div>
                <div className="protocol-visual">
                  {index === 0 && (
                    <svg viewBox="0 0 300 300" className="h-64 w-full text-plasma/90">
                      <g className="rotor">
                        <circle cx="150" cy="150" r="84" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="150" cy="150" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M90 85C140 120 160 180 210 215" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path d="M90 215C140 180 160 120 210 85" fill="none" stroke="currentColor" strokeWidth="3" />
                      </g>
                    </svg>
                  )}
                  {index === 1 && (
                    <div className="laser-grid">
                      <div className="laser-line" />
                    </div>
                  )}
                  {index === 2 && (
                    <svg viewBox="0 0 420 120" className="h-40 w-full text-plasma/90">
                      <path
                        className="wave-line"
                        d="M0 70 H85 L120 30 L165 95 L205 48 L252 82 L305 18 L360 70 H420"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
