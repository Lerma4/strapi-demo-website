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
import { UI_DEFAULT_LOCALE, getFallbackExperience } from './demoContent';
import {
  buildCmsRequests,
  buildExperience,
  fetchJson,
  normaliseArticle,
  STRAPI_URL,
} from './contentUtils';
import {
  LOCALE_STORAGE_KEY,
  PreviewI18nProvider,
  readRequestedLocale,
  resolveInstalledLocale,
} from './i18n';

function createInitialCmsData(locale) {
  const fallbackCms = getFallbackExperience(locale).fallbackCms;

  return {
    connected: false,
    usingFallback: true,
    updatedAt: '--:--',
    global: fallbackCms.global,
    about: fallbackCms.about,
    categories: fallbackCms.categories,
    articles: fallbackCms.articles,
  };
}

export default function App() {
  const heroRef = useRef(null);
  const manifestoRef = useRef(null);
  const initialRequestedLocale = readRequestedLocale() || UI_DEFAULT_LOCALE;
  const [compactNav, setCompactNav] = useState(false);
  const [locale, setLocale] = useState(initialRequestedLocale);
  const [availableLocales, setAvailableLocales] = useState([]);
  const [cmsData, setCmsData] = useState(() => createInitialCmsData(initialRequestedLocale));
  const [activeArticle, setActiveArticle] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewState, setPreviewState] = useState({ active: false, status: null, error: '' });
  const deferredQuery = useDeferredValue(query);
  const shouldReduceMotion = useReducedMotion();
  const localeCopy = getFallbackExperience(locale);
  const fallbackLocale = availableLocales.find((item) => item.isDefault)?.code || UI_DEFAULT_LOCALE;

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

    fetchJson('/api/site-locales')
      .then((payload) => {
        if (disposed) {
          return;
        }

        const locales = Array.isArray(payload.data) ? payload.data : [];

        startTransition(() => {
          setAvailableLocales(locales);
          setLocale((current) => resolveInstalledLocale(current, locales));
        });
      })
      .catch(() => {
        if (disposed) {
          return;
        }

        startTransition(() => {
          setAvailableLocales([]);
        });
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    const url = new URL(window.location.href);

    if (locale === fallbackLocale) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', locale);
    }

    window.history.replaceState({}, '', url);
  }, [fallbackLocale, locale]);

  useEffect(() => {
    let disposed = false;

    async function loadContent() {
      const requests = await Promise.allSettled(buildCmsRequests(locale));
      const fallbackRequests =
        locale !== fallbackLocale
          ? await Promise.allSettled(buildCmsRequests(fallbackLocale))
          : null;

      if (disposed) return;

      startTransition(() => {
        setCmsData(buildExperience(requests, locale, fallbackRequests));
      });
    }

    startTransition(() => {
      setCmsData(createInitialCmsData(locale));
      setActiveArticle(null);
    });

    loadContent().catch(() => {
      if (disposed) return;
      startTransition(() => {
        setCmsData(createInitialCmsData(locale));
      });
    });

    return () => {
      disposed = true;
    };
  }, [fallbackLocale, locale]);

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
    ['documentId', 'status', 'signature', 'expires', 'uid'].forEach((key) => {
      const value = params.get(key);
      if (value) {
        previewQuery.set(key, value);
      }
    });

    previewQuery.set('locale', params.get('locale') || locale);

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
          error: localeCopy.ui.previewError,
        }));
      });

    return () => {
      disposed = true;
    };
  }, [locale, localeCopy.ui.previewError]);

  useEffect(() => {
    const title = cmsData.global.siteName || localeCopy.fallbackCms.global.siteName;
    const description =
      cmsData.global.siteDescription || localeCopy.fallbackCms.global.siteDescription;

    document.title = title;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);
  }, [cmsData.global.siteDescription, cmsData.global.siteName, localeCopy.fallbackCms.global.siteDescription, localeCopy.fallbackCms.global.siteName]);

  const filteredArticles = cmsData.articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      article.category?.slug === selectedCategory ||
      article.category?.name === selectedCategory;
    const target = `${article.title} ${article.description} ${
      article.author?.name || localeCopy.ui.authorFallback
    }`.toLowerCase();
    return matchesCategory && target.includes(deferredQuery.trim().toLowerCase());
  });

  const statusHighlights = [
    {
      label: localeCopy.ui.previewLayer,
      value: cmsData.connected ? localeCopy.ui.liveSync : localeCopy.ui.fallback,
    },
    {
      label: localeCopy.ui.archiveFallback,
      value: localeCopy.ui.visibleEntries(cmsData.articles.length),
    },
    {
      label: localeCopy.ui.mode,
      value: cmsData.usingFallback ? localeCopy.ui.cinematicDemo : localeCopy.ui.apiBacked,
    },
  ];

  return (
    <PreviewI18nProvider locale={locale} locales={availableLocales} setLocale={setLocale}>
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
    </PreviewI18nProvider>
  );
}
