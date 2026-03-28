import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, CircleDot, Database, Gauge, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { DiagnosticShuffler, SchedulerCard, TelemetryTypewriter } from './components/FeatureArtifacts';
import ProtocolSection from './components/ProtocolSection';
import ArticleModal from './components/ArticleModal';
import { experienceTheme, fallbackExperience } from './demoContent';
import { buildExperience, fetchJson, normaliseArticle, renderRichText, STRAPI_URL } from './contentUtils';

const springEase = [0.22, 1, 0.36, 1];

const heroGroupVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.14,
    },
  },
};

const heroItemVariants = {
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

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const sectionItemVariants = {
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

const wordVariants = {
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

function FloatingNav({ compact, siteName, articlesCount }) {
  return (
    <motion.header
      className="fixed left-0 top-4 z-50 w-full px-4 md:top-6 md:px-8"
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: springEase }}
    >
      <motion.div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-[2.4rem] border px-4 py-3 md:px-6 ${
          compact
            ? 'border-white/10 bg-ghost/75 text-graphite shadow-aura backdrop-blur-xl'
            : 'border-white/10 bg-transparent text-ghost'
        }`}
        animate={{
          scale: compact ? 0.985 : 1,
          y: compact ? -2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.35em] text-plasma">Northstar</div>
          <div className="font-sans text-sm font-semibold md:text-base">{siteName}</div>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {fallbackExperience.nav.map((item) => (
            <motion.a
              key={item}
              className="nav-link"
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>
        <motion.a className="magnetic-button hidden md:inline-flex" href="#live-archive" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <span />
          <span className="relative z-10 flex items-center gap-2">
            Open archive
            <ArrowRight size={16} />
          </span>
        </motion.a>
        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.3em] md:hidden">
          <CircleDot size={14} className="text-plasma" />
          {articlesCount} items
        </div>
      </motion.div>
    </motion.header>
  );
}

export default function App() {
  const heroRef = useRef(null);
  const manifestoRef = useRef(null);
  const [compactNav, setCompactNav] = useState(false);
  const [cmsData, setCmsData] = useState({
    connected: false,
    usingFallback: true,
    updatedAt: '--:--',
    global: fallbackExperience.fallbackCms.global,
    about: fallbackExperience.fallbackCms.about,
    categories: fallbackExperience.fallbackCms.categories,
    articles: fallbackExperience.fallbackCms.articles,
  });
  const [activeArticle, setActiveArticle] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewState, setPreviewState] = useState({ active: false, status: null, error: '' });
  const deferredQuery = useDeferredValue(query);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageScale = useSpring(
    useTransform(heroProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.14]),
    { stiffness: 120, damping: 24 }
  );
  const heroImageY = useSpring(
    useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 120]),
    { stiffness: 120, damping: 24 }
  );
  const heroPanelY = useSpring(
    useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 82]),
    { stiffness: 120, damping: 24 }
  );
  const heroPanelRotate = useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -4]);
  const orbOneY = useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -120]);
  const orbTwoY = useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 160]);

  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ['start end', 'end start'],
  });
  const manifestoImageY = useTransform(manifestoProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-40, 56]);
  const manifestoImageScale = useTransform(manifestoProgress, [0, 1], shouldReduceMotion ? [1.08, 1.08] : [1.04, 1.18]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setCompactNav(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;

    async function loadContent() {
      const requests = await Promise.allSettled([
        fetchJson('/api/articles?populate[cover]=true&populate[author][populate]=avatar&populate[category]=true&populate[blocks][populate]=*'),
        fetchJson('/api/about?populate[blocks][populate]=*'),
        fetchJson('/api/global'),
        fetchJson('/api/categories'),
      ]);

      if (disposed) return;

      startTransition(() => {
        setCmsData(buildExperience(requests));
      });
    }

    loadContent().catch(() => {
      if (disposed) return;
      startTransition(() => {
        setCmsData((current) => ({
          ...current,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      });
    });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    const params = new URLSearchParams(window.location.search);

    if (params.get('preview') !== 'article') {
      return undefined;
    }

    setPreviewState({
      active: true,
      status: params.get('status') || 'draft',
      error: '',
    });

    const previewQuery = new URLSearchParams();
    ['documentId', 'locale', 'status', 'signature', 'expires', 'uid'].forEach((key) => {
      const value = params.get(key);
      if (value) {
        previewQuery.set(key, value);
      }
    });

    fetch(`${STRAPI_URL}/api/preview/article?${previewQuery.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Preview fetch failed');
        }
        return response.json();
      })
      .then((payload) => {
        if (disposed || !payload?.data) return;
        setActiveArticle(normaliseArticle(payload.data));
      })
      .catch(() => {
        if (disposed) return;
        setPreviewState((current) => ({
          ...current,
          error: 'Preview article could not be loaded. Check preview secret, URL and document status.',
        }));
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    const title = cmsData.global.siteName || fallbackExperience.fallbackCms.global.siteName;
    const description =
      cmsData.global.siteDescription || fallbackExperience.fallbackCms.global.siteDescription;

    document.title = title;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);
  }, [cmsData.global.siteDescription, cmsData.global.siteName]);

  const aboutQuote = cmsData.about.blocks?.find((block) => block.__component === 'shared.quote');
  const aboutText = cmsData.about.blocks?.find((block) => block.__component === 'shared.rich-text');
  const filteredArticles = cmsData.articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      article.category?.slug === selectedCategory ||
      article.category?.name === selectedCategory;
    const target = `${article.title} ${article.description} ${article.author?.name || ''}`.toLowerCase();
    return matchesCategory && target.includes(deferredQuery.trim().toLowerCase());
  });

  const statusHighlights = [
    { label: 'Preview layer', value: cmsData.connected ? 'Live sync' : 'Fallback' },
    { label: 'Archive', value: `${cmsData.articles.length} entries` },
    { label: 'Mode', value: cmsData.usingFallback ? 'Cinematic demo' : 'API-backed' },
  ];

  return (
    <div className="app-shell">
      <svg className="absolute h-0 w-0">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      <div className="noise-layer" />
      <motion.div className="floating-orb orb-one" style={{ y: orbOneY }} />
      <motion.div className="floating-orb orb-two" style={{ y: orbTwoY }} />

      <FloatingNav compact={compactNav} siteName={cmsData.global.siteName} articlesCount={cmsData.articles.length} />

      <AnimatePresence>
        {previewState.active && (
          <motion.div
            className="fixed left-1/2 top-24 z-[60] w-[min(92vw,720px)] -translate-x-1/2 rounded-[1.6rem] border border-plasma/40 bg-[#120f25]/90 px-5 py-4 shadow-aura backdrop-blur-xl"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: springEase }}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">Strapi Preview</div>
                <div className="mt-1 text-sm text-ghost">
                  {previewState.error
                    ? previewState.error
                    : `Article preview loaded in ${previewState.status || 'draft'} mode.`}
                </div>
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-mist/75">
                {previewState.status || 'draft'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section ref={heroRef} className="relative isolate flex min-h-screen items-end overflow-hidden px-4 pb-12 pt-36 md:px-8 md:pb-16">
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
            <motion.div
              className="max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={heroGroupVariants}
            >
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

        <motion.section
          id="capabilities"
          className="section-shell"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <motion.div className="section-heading" variants={sectionItemVariants}>
            <div className="eyebrow">Capabilities</div>
            <h2>Interactive functional artifacts for explaining Strapi without showing a dashboard first.</h2>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            <DiagnosticShuffler />
            <TelemetryTypewriter />
            <SchedulerCard />
          </div>
        </motion.section>

        <section id="manifesto" ref={manifestoRef} className="manifesto-shell section-shell">
          <motion.div
            className="manifesto-image"
            style={{ y: manifestoImageY, scale: manifestoImageScale, backgroundImage: `url(${experienceTheme.manifestoImage})` }}
          />
          <motion.div
            className="relative z-10 mx-auto max-w-6xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={sectionVariants}
          >
            <motion.div variants={sectionItemVariants} className="eyebrow">
              {fallbackExperience.manifesto.eyebrow}
            </motion.div>
            <motion.p variants={sectionItemVariants} className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">
              {fallbackExperience.manifesto.small}
            </motion.p>
            <motion.h2 variants={sectionItemVariants} className="mt-10 max-w-5xl text-5xl leading-[0.95] text-ghost md:text-7xl">
              {fallbackExperience.manifesto.largePrefix}{' '}
              <span className="font-serif italic text-plasma">{fallbackExperience.manifesto.highlight}</span>
            </motion.h2>
            <motion.p variants={sectionItemVariants} className="mt-8 max-w-2xl text-base leading-8 text-mist/75 md:text-lg">
              {fallbackExperience.manifesto.body}
            </motion.p>
            <motion.div variants={sectionItemVariants} className="mt-10 grid gap-5 lg:grid-cols-2">
              <motion.div
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">About block</div>
                <h3 className="mt-4 text-2xl font-semibold text-ghost">{cmsData.about.title}</h3>
                <div className="mt-5 space-y-4">{renderRichText(aboutText?.body || '')}</div>
              </motion.div>
              <motion.div
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">Voice marker</div>
                <p className="mt-5 font-serif text-4xl italic leading-tight text-ghost">
                  "{aboutQuote?.body || 'Structured content should feel composed, not mechanical.'}"
                </p>
                <div className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-mist/60">
                  {aboutQuote?.title || 'Northstar editorial principle'}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <ProtocolSection />

        <motion.section
          id="live-archive"
          className="section-shell"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={sectionVariants}
        >
          <motion.div className="section-heading" variants={sectionItemVariants}>
            <div className="eyebrow">Live archive</div>
            <h2>One polished surface for client demos, editorial reviews and API-driven content checks.</h2>
          </motion.div>
          <motion.div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center" variants={sectionItemVariants}>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-panel">
              <label className="text-[0.68rem] uppercase tracking-[0.35em] text-mist/60">Search archive</label>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, descriptions or authors"
                className="mt-3 w-full bg-transparent text-base text-ghost outline-none placeholder:text-mist/40"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`filter-pill ${selectedCategory === 'all' ? 'filter-pill-active' : ''}`}
              >
                All
              </button>
              {cmsData.categories.map((category) => (
                <button
                  key={category.slug || category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug || category.name)}
                  className={`filter-pill ${
                    selectedCategory === (category.slug || category.name) ? 'filter-pill-active' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.slug}
                  layout
                  className="archive-card"
                  initial={{ opacity: 0, y: 48, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 18, scale: 0.96 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.7, delay: index * 0.06, ease: springEase }}
                  whileHover={{ y: -10, rotateX: shouldReduceMotion ? 0 : 2, scale: 1.012 }}
                >
                  <motion.div
                    className="archive-card-image"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(10,10,20,0.02), rgba(10,10,20,0.75)), url(${
                        article.cover?.url || experienceTheme.textureImage
                      })`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: springEase }}
                  />
                  <div className="archive-card-body">
                    <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.3em] text-mist/60">
                      <span>{article.category?.name || 'general'}</span>
                      <span>{article.author?.name || 'Northstar Team'}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-ghost">{article.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-mist/75">{article.description}</p>
                    <motion.button
                      type="button"
                      onClick={() => setActiveArticle(article)}
                      className="inline-link mt-6"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Open content detail
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {!filteredArticles.length && (
              <motion.div
                className="mt-8 rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-mist/60"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
              >
                No archive entries match the current filters.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          className="section-shell"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <motion.div className="section-heading" variants={sectionItemVariants}>
            <div className="eyebrow">Start now</div>
            <h2>Choose how you want to use the preview in the room.</h2>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {fallbackExperience.plans.map((plan, index) => (
              <motion.article
                key={plan.name}
                className={`rounded-[2rem] border p-7 shadow-panel ${
                  plan.featured
                    ? 'border-plasma bg-plasma text-ghost scale-[1.02]'
                    : 'border-white/10 bg-white/5 text-ghost'
                }`}
                variants={sectionItemVariants}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: plan.featured ? 1.04 : 1.02 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-current/70">{plan.name}</div>
                <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
                <p className="mt-4 text-sm leading-7 text-current/80">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <Play size={14} />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <motion.a
                  className={`mt-8 inline-flex ${plan.featured ? 'accent-button' : 'ghost-button'}`}
                  href={plan.featured ? '#live-archive' : `${STRAPI_URL}/api/articles`}
                  target={plan.featured ? undefined : '_blank'}
                  rel={plan.featured ? undefined : 'noreferrer'}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {plan.featured ? 'Launch the demo flow' : 'Inspect the data'}
                </motion.a>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="mx-4 mt-10 rounded-t-[4rem] border border-white/10 bg-[#090910] px-6 pb-10 pt-12 md:mx-8 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.35em] text-plasma">Northstar Process Lab</div>
            <p className="mt-4 max-w-md text-base leading-8 text-mist/75">
              Client-facing preview for showing what Strapi looks like when it becomes a composed digital experience instead of an admin screenshot tour.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-mist/75">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
              </span>
              System operational
            </div>
          </div>
          {fallbackExperience.footerColumns.map((column) => (
            <div key={column.title}>
              <div className="text-[0.68rem] uppercase tracking-[0.35em] text-mist/60">{column.title}</div>
              <div className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <a key={link} className="inline-link" href="#">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>

      <ArticleModal article={activeArticle} onClose={() => setActiveArticle(null)} />
    </div>
  );
}
