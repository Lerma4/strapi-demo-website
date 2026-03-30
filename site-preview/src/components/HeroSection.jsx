import { ArrowRight, Boxes, Database, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { experienceTheme, fallbackExperience } from '../demoContent';
import { STRAPI_URL } from '../contentUtils';
import { heroGroupVariants, heroItemVariants, springEase, wordVariants } from './previewMotion';

function WordReveal({ text, className }) {
  return (
    <div className={className}>
      {text.split(' ').map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.18em] inline-block overflow-hidden align-top last:mr-0">
          <motion.span className="inline-block" custom={index} variants={wordVariants}>
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

export default function HeroSection({
  heroRef,
  heroImageScale,
  heroImageY,
  heroPanelY,
  heroPanelRotate,
  shouldReduceMotion,
  cmsData,
  statusHighlights,
}) {
  return (
    <section id="top" ref={heroRef} className="relative isolate flex min-h-screen items-end overflow-hidden px-4 pb-12 pt-36 md:px-8 md:pb-16">
      <motion.div className="hero-backdrop" style={{ scale: heroImageScale, y: heroImageY }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${experienceTheme.heroImage})`,
          }}
        />
      </motion.div>
      <div className="hero-vignette" />
      <div className="hero-grid" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={heroGroupVariants}>
          <motion.div
            variants={heroItemVariants}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.35em] text-mist backdrop-blur-md"
          >
            <Sparkles size={14} className="text-plasma" />
            Strapi cinematic preview
          </motion.div>

          <WordReveal text={fallbackExperience.heroLead} className="mt-6 text-5xl font-semibold uppercase tracking-[-0.05em] text-ghost md:text-7xl" />
          <WordReveal text={fallbackExperience.heroDrama} className="mt-2 font-serif text-[5.6rem] italic leading-none text-ghost md:text-[10rem]" />

          <motion.p variants={heroItemVariants} className="mt-8 max-w-2xl text-base leading-8 text-mist/80 md:text-lg">
            {fallbackExperience.heroBody}
          </motion.p>

          <motion.div variants={heroItemVariants} className="mt-10 flex flex-wrap gap-4">
            <motion.a className="magnetic-button" href="#live-archive" whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span />
              <span className="relative z-10 flex items-center gap-2">
                Explore the archive
                <ArrowRight size={16} />
              </span>
            </motion.a>
            <motion.a
              className="ghost-button"
              href={`${STRAPI_URL}/admin`}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              Open Strapi admin
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-dock rounded-[2rem] border border-white/10 bg-[#10101d]/72 p-6 shadow-aura backdrop-blur-xl"
          initial={{ opacity: 0, y: 56, rotate: shouldReduceMotion ? 0 : 2, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.95, delay: 0.3, ease: springEase }}
          style={{ y: heroPanelY, rotate: heroPanelRotate }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">System status</div>
              <div className="mt-2 text-2xl font-semibold text-ghost">
                {cmsData.connected ? 'Connected to Strapi' : 'Fallback preview active'}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 font-mono text-xs text-mist/75">
              <span className={`h-2.5 w-2.5 rounded-full ${cmsData.connected ? 'bg-emerald' : 'bg-plasma'}`} />
              {cmsData.updatedAt}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <Database size={18} />
              <strong>{cmsData.articles.length}</strong>
              <span>Archive entries</span>
            </div>
            <div className="stat-card">
              <Boxes size={18} />
              <strong>{cmsData.categories.length}</strong>
              <span>Navigation groups</span>
            </div>
            <div className="stat-card">
              <Gauge size={18} />
              <strong>{cmsData.usingFallback ? 'Fallback' : 'Live'}</strong>
              <span>Rendering mode</span>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.35em] text-mist/60">
              <ShieldCheck size={16} className="text-plasma" />
              Operational brief
            </div>
            <p className="text-sm leading-7 text-mist/80">{cmsData.global.siteDescription}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {statusHighlights.map((item) => (
              <motion.div
                key={item.label}
                className="hero-highlight-card"
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <div className="text-[0.65rem] uppercase tracking-[0.3em] text-mist/55">{item.label}</div>
                <div className="mt-3 text-sm font-semibold text-ghost">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
