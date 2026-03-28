import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, CircleDot, Database, Gauge, Play, ShieldCheck, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DiagnosticShuffler, SchedulerCard, TelemetryTypewriter } from './components/FeatureArtifacts';
import ProtocolSection from './components/ProtocolSection';
import ArticleModal from './components/ArticleModal';
import { experienceTheme, fallbackExperience } from './demoContent';
import { buildExperience, fetchJson, normaliseArticle, renderRichText, STRAPI_URL } from './contentUtils';

gsap.registerPlugin(ScrollTrigger);

function FloatingNav({ compact, siteName, articlesCount }) {
  return (
    <header className="fixed left-0 top-4 z-50 w-full px-4 md:top-6 md:px-8">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-[2.4rem] border px-4 py-3 transition-all duration-500 md:px-6 ${
          compact
            ? 'border-white/10 bg-ghost/60 text-graphite shadow-aura backdrop-blur-xl'
            : 'border-white/10 bg-transparent text-ghost'
        }`}
      >
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.35em] text-plasma">Northstar</div>
          <div className="font-sans text-sm font-semibold md:text-base">{siteName}</div>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {fallbackExperience.nav.map((item) => (
            <a key={item} className="nav-link" href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}>
              {item}
            </a>
          ))}
        </nav>
        <a className="magnetic-button hidden md:inline-flex" href="#live-archive">
          <span />
          <span className="relative z-10 flex items-center gap-2">
            Open archive
            <ArrowRight size={16} />
          </span>
        </a>
        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.3em] md:hidden">
          <CircleDot size={14} className="text-plasma" />
          {articlesCount} items
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const heroRef = useRef(null);
  const appRef = useRef(null);
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
    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
      });

      gsap.utils.toArray('.section-reveal').forEach((section) => {
        gsap.from(section, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
          },
        });
      });
    }, appRef);

    return () => ctx.revert();
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

  return (
    <div ref={appRef} className="app-shell">
      <svg className="absolute h-0 w-0">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div className="noise-layer" />

      <FloatingNav compact={compactNav} siteName={cmsData.global.siteName} articlesCount={cmsData.articles.length} />

      {previewState.active && (
        <div className="fixed left-1/2 top-24 z-[60] w-[min(92vw,720px)] -translate-x-1/2 rounded-[1.6rem] border border-plasma/40 bg-[#120f25]/90 px-5 py-4 shadow-aura backdrop-blur-xl">
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
        </div>
      )}

      <main>
        <section
          ref={heroRef}
          className="relative flex min-h-screen items-end overflow-hidden px-4 pb-12 pt-36 md:px-8 md:pb-16"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,20,0.18), rgba(10,10,20,0.9)), url(${experienceTheme.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="hero-reveal inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.35em] text-mist backdrop-blur-md">
                <Sparkles size={14} className="text-plasma" />
                Strapi cinematic preview
              </div>
              <div className="mt-6 hero-reveal text-5xl font-semibold uppercase tracking-[-0.05em] text-ghost md:text-7xl">
                {fallbackExperience.heroLead}
              </div>
              <div className="hero-reveal mt-2 font-serif text-[5.6rem] italic leading-none text-ghost md:text-[10rem]">
                {fallbackExperience.heroDrama}
              </div>
              <p className="hero-reveal mt-8 max-w-2xl text-base leading-8 text-mist/80 md:text-lg">
                {fallbackExperience.heroBody}
              </p>
              <div className="hero-reveal mt-10 flex flex-wrap gap-4">
                <a className="magnetic-button" href="#live-archive">
                  <span />
                  <span className="relative z-10 flex items-center gap-2">
                    Explore the archive
                    <ArrowRight size={16} />
                  </span>
                </a>
                <a className="ghost-button" href={`${STRAPI_URL}/admin`} target="_blank" rel="noreferrer">
                  Open Strapi admin
                </a>
              </div>
            </div>

            <div className="hero-reveal rounded-[2rem] border border-white/10 bg-[#10101d]/70 p-6 shadow-aura backdrop-blur-xl">
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
            </div>
          </div>
        </section>

        <section id="capabilities" className="section-shell section-reveal">
          <div className="section-heading">
            <div className="eyebrow">Capabilities</div>
            <h2>Interactive functional artifacts for explaining Strapi without showing a dashboard first.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <DiagnosticShuffler />
            <TelemetryTypewriter />
            <SchedulerCard />
          </div>
        </section>

        <section id="manifesto" className="manifesto-shell section-reveal">
          <div
            className="manifesto-image"
            style={{ backgroundImage: `url(${experienceTheme.manifestoImage})` }}
          />
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-28">
            <div className="eyebrow">{fallbackExperience.manifesto.eyebrow}</div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">{fallbackExperience.manifesto.small}</p>
            <h2 className="mt-10 max-w-5xl text-5xl leading-[0.95] text-ghost md:text-7xl">
              {fallbackExperience.manifesto.largePrefix}{' '}
              <span className="font-serif italic text-plasma">{fallbackExperience.manifesto.highlight}</span>
            </h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-mist/75 md:text-lg">
              {fallbackExperience.manifesto.body}
            </p>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">About block</div>
                <h3 className="mt-4 text-2xl font-semibold text-ghost">{cmsData.about.title}</h3>
                <div className="mt-5 space-y-4">{renderRichText(aboutText?.body || '')}</div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">Voice marker</div>
                <p className="mt-5 font-serif text-4xl italic leading-tight text-ghost">
                  “{aboutQuote?.body || 'Structured content should feel composed, not mechanical.'}”
                </p>
                <div className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-mist/60">
                  {aboutQuote?.title || 'Northstar editorial principle'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProtocolSection />

        <section id="live-archive" className="section-shell section-reveal">
          <div className="section-heading">
            <div className="eyebrow">Live archive</div>
            <h2>One polished surface for client demos, editorial reviews and API-driven content checks.</h2>
          </div>
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article key={article.slug} className="archive-card">
                <div
                  className="archive-card-image"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,20,0.02), rgba(10,10,20,0.75)), url(${
                      article.cover?.url || experienceTheme.textureImage
                    })`,
                  }}
                />
                <div className="archive-card-body">
                  <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.3em] text-mist/60">
                    <span>{article.category?.name || 'general'}</span>
                    <span>{article.author?.name || 'Northstar Team'}</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-ghost">{article.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-mist/75">{article.description}</p>
                  <button type="button" onClick={() => setActiveArticle(article)} className="inline-link mt-6">
                    Open content detail
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!filteredArticles.length && (
            <div className="mt-8 rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-mist/60">
              No archive entries match the current filters.
            </div>
          )}
        </section>

        <section className="section-shell section-reveal">
          <div className="section-heading">
            <div className="eyebrow">Start now</div>
            <h2>Choose how you want to use the preview in the room.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {fallbackExperience.plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[2rem] border p-7 shadow-panel ${
                  plan.featured
                    ? 'border-plasma bg-plasma text-ghost scale-[1.02]'
                    : 'border-white/10 bg-white/5 text-ghost'
                }`}
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
                <a
                  className={`mt-8 inline-flex ${plan.featured ? 'accent-button' : 'ghost-button'}`}
                  href={plan.featured ? '#live-archive' : `${STRAPI_URL}/api/articles`}
                  target={plan.featured ? undefined : '_blank'}
                  rel={plan.featured ? undefined : 'noreferrer'}
                >
                  {plan.featured ? 'Launch the demo flow' : 'Inspect the data'}
                </a>
              </article>
            ))}
          </div>
        </section>
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
