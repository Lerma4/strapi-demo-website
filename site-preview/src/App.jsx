import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import FloatingNav from './components/FloatingNav';
import HeroSection from './components/HeroSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import ManifestoSection from './components/ManifestoSection';
import ProtocolSection from './components/ProtocolSection';
import LiveArchiveSection from './components/LiveArchiveSection';
import PlansSection from './components/PlansSection';
import PreviewBackdrop from './components/PreviewBackdrop';
import PreviewStatusBanner from './components/PreviewStatusBanner';
import SiteFooter from './components/SiteFooter';
import ArticleModal from './components/ArticleModal';
import { fallbackExperience } from './demoContent';
import { buildExperience, fetchJson, normaliseArticle, STRAPI_URL } from './contentUtils';

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
        fetchJson('/api/global?populate[logo]=true'),
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
      <PreviewBackdrop orbOneY={orbOneY} orbTwoY={orbTwoY} />

      <FloatingNav
        compact={compactNav}
        siteName={cmsData.global.siteName}
        logoUrl={cmsData.global.logo?.url}
        articlesCount={cmsData.articles.length}
      />
      <PreviewStatusBanner previewState={previewState} />

      <main>
        <HeroSection
          heroRef={heroRef}
          heroImageScale={heroImageScale}
          heroImageY={heroImageY}
          heroPanelY={heroPanelY}
          heroPanelRotate={heroPanelRotate}
          shouldReduceMotion={shouldReduceMotion}
          cmsData={cmsData}
          statusHighlights={statusHighlights}
        />
        <CapabilitiesSection />
        <ManifestoSection
          manifestoRef={manifestoRef}
          manifestoImageY={manifestoImageY}
          manifestoImageScale={manifestoImageScale}
          cmsData={cmsData}
        />
        <ProtocolSection />
        <LiveArchiveSection
          query={query}
          onQueryChange={setQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={cmsData.categories}
          filteredArticles={filteredArticles}
          shouldReduceMotion={shouldReduceMotion}
          onOpenArticle={setActiveArticle}
        />
        <PlansSection />
      </main>

      <SiteFooter />
      <ArticleModal article={activeArticle} onClose={() => setActiveArticle(null)} />
    </div>
  );
}
