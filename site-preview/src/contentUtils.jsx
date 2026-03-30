import React from 'react';
import { fallbackExperience } from './demoContent';

export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

export function toAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
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

export function buildExperience(payloads) {
  const [articlesResult, aboutResult, globalResult, categoriesResult] = payloads;
  const fallback = fallbackExperience.fallbackCms;
  const liveArticles =
    articlesResult.status === 'fulfilled'
      ? (articlesResult.value.data || []).map(normaliseArticle)
      : [];
  const liveAbout =
    aboutResult.status === 'fulfilled' && aboutResult.value.data
      ? aboutResult.value.data
      : fallback.about;
  const liveGlobal =
    globalResult.status === 'fulfilled' && globalResult.value.data
      ? globalResult.value.data
      : fallback.global;
  const liveCategories =
    categoriesResult.status === 'fulfilled' && categoriesResult.value.data?.length
      ? categoriesResult.value.data
      : fallback.categories;

  return {
    connected: payloads.some((result) => result.status === 'fulfilled'),
    usingFallback: liveArticles.length === 0,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
