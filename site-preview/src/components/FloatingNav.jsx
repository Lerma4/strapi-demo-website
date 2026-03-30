import { useEffect, useState } from 'react';
import { ArrowRight, CircleDot, Menu, Orbit, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { fallbackExperience } from '../demoContent';
import { springEase } from './previewMotion';

function getNavHref(item) {
  if (item.toLowerCase() === 'archive') {
    return '#live-archive';
  }

  return `#${item.toLowerCase().replace(/\s+/g, '-')}`;
}

function BrandLockup({ compact, siteName, logoUrl, inverse = false, onClick }) {
  return (
    <motion.a
      href="#top"
      aria-label={`Go to ${siteName} homepage`}
      onClick={onClick}
      className="group flex min-w-0 items-center gap-3"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
    >
      <span
        className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.15rem] border ${
          inverse
            ? 'border-[#0a0a14]/10 bg-[#0a0a14]/8 shadow-[0_16px_40px_rgba(10,10,20,0.12)]'
            : compact
              ? 'border-graphite/10 bg-graphite/5'
              : 'border-white/15 bg-[#0b0b16]/65'
        } shadow-[0_16px_40px_rgba(8,8,16,0.28)]`}
      >
        {logoUrl ? (
          <>
            <span className={`absolute inset-[3px] rounded-[0.9rem] ${inverse ? 'bg-white/80' : 'bg-white/95'}`} />
            <img
              src={logoUrl}
              alt={`${siteName} logo`}
              className="relative z-10 h-full w-full object-contain p-2"
            />
          </>
        ) : (
          <>
            <span
              className={`absolute inset-[3px] rounded-[0.9rem] ${
                inverse
                  ? 'bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_34%),linear-gradient(145deg,rgba(10,10,20,0.96),rgba(30,30,42,0.88))]'
                  : 'bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28),transparent_32%),linear-gradient(145deg,rgba(123,97,255,0.95),rgba(78,212,255,0.72))]'
              }`}
            />
            <svg viewBox="0 0 48 48" className={`relative z-10 h-6 w-6 ${inverse ? 'text-[#66ef7f]' : 'text-white'}`} fill="none" aria-hidden="true">
              <path d="M24 8L28.1 19.9L40 24L28.1 28.1L24 40L19.9 28.1L8 24L19.9 19.9L24 8Z" fill="currentColor" />
              <circle cx="24" cy="24" r="4.5" fill="#0B0B16" />
            </svg>
          </>
        )}
      </span>
      <span className={`min-w-0 ${inverse ? 'text-[#0b0b16]' : ''}`}>
        <span className="block truncate font-sans text-sm font-semibold md:text-base">{siteName}</span>
      </span>
    </motion.a>
  );
}

export default function FloatingNav({ compact, siteName, logoUrl, articlesCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.header
      className="fixed left-0 top-4 z-50 w-full px-4 md:top-6 md:px-8"
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: springEase }}
    >
      <motion.div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-[2.4rem] border px-4 py-3 md:px-6 ${compact
          ? 'border-white/10 bg-ghost/75 text-graphite shadow-aura backdrop-blur-xl'
          : 'border-white/10 bg-transparent text-ghost'
          }`}
        animate={{
          scale: compact ? 0.985 : 1,
          y: compact ? -2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <BrandLockup compact={compact} siteName={siteName} logoUrl={logoUrl} onClick={() => setIsMenuOpen(false)} />
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {fallbackExperience.nav.map((item) => (
            <motion.a
              key={item}
              className="nav-link"
              href={getNavHref(item)}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>
        <motion.a
          className="magnetic-button hidden md:inline-flex"
          href="#live-archive"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span />
          <span className="relative z-10 flex items-center gap-2">
            Open archive
            <ArrowRight size={16} />
          </span>
        </motion.a>
        <div className="flex items-center gap-2 md:hidden">
          <motion.div
            className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.28em]"
            animate={{
              opacity: isMenuOpen ? 0 : 1,
              scale: isMenuOpen ? 0.94 : 1,
            }}
            transition={{ duration: 0.22, ease: springEase }}
          >
            <CircleDot size={14} className="text-plasma" />
            {articlesCount} items
          </motion.div>
          <motion.button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
              isMenuOpen
                ? 'border-plasma/60 bg-plasma text-ghost'
                : 'border-white/12 bg-white/5 text-current backdrop-blur-md'
            }`}
            onClick={() => setIsMenuOpen((open) => !open)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ rotate: isMenuOpen ? 180 : 0, scale: isMenuOpen ? 0.92 : 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-[#04050d]/72 backdrop-blur-[3px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: springEase }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              id="mobile-site-menu"
              className="fixed inset-x-4 top-[5.35rem] z-[60] max-h-[calc(100svh-6.25rem)] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#121222] text-ghost shadow-[0_28px_90px_rgba(5,6,12,0.45)] md:hidden"
              initial={{ opacity: 0, y: -26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,97,255,0.32),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />

              <div className="relative flex max-h-[calc(100svh-6.25rem)] flex-col overflow-y-auto p-5">
                <div className="flex items-start justify-between gap-4">
                  <BrandLockup
                    compact={false}
                    siteName={siteName}
                    logoUrl={logoUrl}
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-mist/70">
                    Mobile nav
                  </div>
                </div>

                <motion.nav
                  className="mt-8 flex flex-col"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.06,
                        delayChildren: 0.06,
                      },
                    },
                  }}
                >
                  {fallbackExperience.nav.map((item) => (
                    <motion.a
                      key={item}
                      href={getNavHref(item)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-[1.05rem] font-medium tracking-[-0.02em]"
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.28, ease: springEase }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-px w-8 bg-plasma/70 transition-transform duration-300 ease-magnetic group-hover:w-10" />
                        {item}
                      </span>
                      <ArrowRight size={18} className="text-plasma transition-transform duration-300 ease-magnetic group-hover:translate-x-1" />
                    </motion.a>
                  ))}
                </motion.nav>

                <motion.div
                  className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.18, ease: springEase }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[0.64rem] uppercase tracking-[0.32em] text-mist/60">Live archive</div>
                      <div className="mt-2 text-lg font-semibold">{articlesCount} visible entries</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plasma text-ghost shadow-[0_16px_30px_rgba(10,10,20,0.22)]">
                      <Orbit size={18} />
                    </div>
                  </div>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-mist/72">
                    Jump straight into the archive or scan the publishing journey section by section.
                  </p>
                </motion.div>

                <motion.a
                  href="#live-archive"
                  className="mt-4 inline-flex items-center justify-between rounded-full bg-plasma px-5 py-4 text-sm font-semibold text-ghost"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.24, ease: springEase }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Open archive
                  <ArrowRight size={18} />
                </motion.a>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
