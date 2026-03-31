import React from 'react';
import { getFallbackExperience } from './demoContent';

export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const cmsEndpoints = {
  about: '/api/about?populate[blocks][populate]=*',
  articles:
    '/api/articles?populate[cover]=true&populate[author][populate]=avatar&populate[category]=true&populate[blocks][populate]=*',
  categories: '/api/categories',
  global: '/api/global?populate[logo]=true',
};

export function toAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

export function withLocale(path, locale) {
  if (!locale) {
    return path;
  }

  const [pathname, query = ''] = path.split('?');
  const params = new URLSearchParams(query);

  params.set('locale', locale);

  return `${pathname}?${params.toString()}`;
}

export function pickMediaUrl(media) {
  if (!media) return null;
  if (Array.isArray(media)) return pickMediaUrl(media[0]);
  const preferred =
    media?.formats?.large?.url ||
    media?.formats?.medium?.url ||
    media?.formats?.small?.url ||
    media?.formats?.thumbnail?.url ||
    media?.url ||
    media?.file?.url;
  return toAbsoluteUrl(preferred);
}

export function plainText(value = '') {
  return value
    .replace(/\*\*/g, '')
    .replace(/##\s?/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

export function renderRichText(body) {
  if (/<[a-z][\s\S]*>/i.test(body)) {
    return <div className="richtext-html" dangerouslySetInnerHTML={{ __html: body }} />;
  }

  const lines = body.split('\n').filter(Boolean);
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${key}`} className="ml-5 list-disc space-y-2 text-sm text-mist/80 md:text-base">
        {listItems.map((item, index) => (
          <li key={`${key}-${index}`}>{plainText(item.replace(/^- /, ''))}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    if (line.startsWith('- ')) {
      listItems.push(line);
      return;
    }

    flushList(index);

    if (line.startsWith('## ')) {
      elements.push(
        <h4 key={`heading-${index}`} className="font-sans text-lg font-semibold text-ghost md:text-xl">
          {plainText(line.replace(/^## /, ''))}
        </h4>
      );
      return;
    }

    elements.push(
      <p key={`paragraph-${index}`} className="text-sm leading-7 text-mist/80 md:text-base">
        {plainText(line)}
      </p>
    );
  });

  flushList('end');
  return elements;
}

export async function fetchJson(path) {
  const response = await fetch(`${STRAPI_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json();
}

export function normaliseArticle(article) {
  return {
    ...article,
    category: article.category || { name: 'general' },
    author: article.author || { name: 'Northstar Team' },
    cover: article.cover ? { url: pickMediaUrl(article.cover) } : null,
    blocks: (article.blocks || []).map((block) => {
      if (block.__component === 'shared.media' && block.file) {
        return { ...block, file: { ...block.file, url: pickMediaUrl(block.file) } };
      }
      if (block.__component === 'shared.slider' && block.files) {
        return {
          ...block,
          files: block.files.map((file) => ({ ...file, url: pickMediaUrl(file) })),
        };
      }
      return block;
    }),
  };
}

export function buildCmsRequests(locale) {
  return [
    fetchJson(withLocale(cmsEndpoints.articles, locale)),
    fetchJson(withLocale(cmsEndpoints.about, locale)),
    fetchJson(withLocale(cmsEndpoints.global, locale)),
    fetchJson(withLocale(cmsEndpoints.categories, locale)),
  ];
}

function readCollection(result) {
  return result?.status === 'fulfilled' && Array.isArray(result.value?.data) && result.value.data.length
    ? result.value.data
    : null;
}

function readSingle(result) {
  return result?.status === 'fulfilled' && result.value?.data
    ? result.value.data
    : null;
}

export function buildExperience(payloads, locale, fallbackPayloads = null) {
  const [articlesResult, aboutResult, globalResult, categoriesResult] = payloads;
  const [fallbackArticlesResult, fallbackAboutResult, fallbackGlobalResult, fallbackCategoriesResult] =
    fallbackPayloads || [];
  const fallback = getFallbackExperience(locale).fallbackCms;

  const primaryArticles = readCollection(articlesResult)?.map(normaliseArticle) || null;
  const secondaryArticles = readCollection(fallbackArticlesResult)?.map(normaliseArticle) || null;
  const liveArticles = primaryArticles || secondaryArticles || fallback.articles;

  const liveAbout = readSingle(aboutResult) || readSingle(fallbackAboutResult) || fallback.about;
  const liveGlobal = readSingle(globalResult) || readSingle(fallbackGlobalResult) || fallback.global;
  const liveCategories =
    readCollection(categoriesResult) || readCollection(fallbackCategoriesResult) || fallback.categories;

  return {
    connected:
      payloads.some((result) => result.status === 'fulfilled') ||
      fallbackPayloads?.some((result) => result.status === 'fulfilled'),
    usingFallback: !primaryArticles && !secondaryArticles,
    updatedAt: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    global: {
      siteName: liveGlobal.siteName || fallback.global.siteName,
      siteDescription: liveGlobal.siteDescription || fallback.global.siteDescription,
      logo: liveGlobal.logo ? { url: pickMediaUrl(liveGlobal.logo) } : fallback.global.logo,
    },
    about: liveAbout,
    categories: liveCategories,
    articles: liveArticles.length ? liveArticles : fallback.articles,
  };
}
