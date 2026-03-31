const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const { articles, authors, categories } = require('../data/data.json');

const ARTICLE_UID = 'api::article.article';
const AUTHOR_UID = 'api::author.author';
const CATEGORY_UID = 'api::category.category';
const ARTICLE_DESCRIPTION_MAX_LENGTH = 80;

const REQUIRED_LOCALES = [
  { code: 'en', name: 'English (en)' },
  { code: 'it', name: 'Italiano (it)' },
];

const ITALIAN_CATEGORY_TRANSLATIONS = {
  operations: {
    name: 'operazioni',
    description: 'Contenuti per visibilita operativa, dashboard e control tower di consegna.',
  },
  'field-service': {
    name: 'assistenza sul campo',
    description: 'Guide e storie su team mobili, programmi di manutenzione e supporto ai tecnici.',
  },
  procurement: {
    name: 'acquisti',
    description: 'Aggiornamenti su sourcing, rischio fornitori e coordinamento procurement.',
  },
  quality: {
    name: 'qualita',
    description: 'Audit, osservazioni e flussi di miglioramento continuo riusabili.',
  },
  sustainability: {
    name: 'sostenibilita',
    description: 'Contenuti per reporting ESG, tracciabilita e iniziative di compliance.',
  },
};

const ITALIAN_ARTICLE_TRANSLATIONS = {
  'regional-network-visibility': {
    title: 'Visibilita della rete regionale per operazioni multi-sito',
    description:
      'Come un team operations ha allineato responsabili di sito, finestre di servizio e reporting direzionale in un unico flusso editoriale.',
    blocks: {
      0: {
        body: [
          '## La sfida',
          '',
          'I responsabili regionali lavoravano con fogli di calcolo, digest via email e presentazioni separate. Gli aggiornamenti arrivavano tardi e i team locali non vedevano le stesse priorita.',
          '',
          '## Cosa e cambiato',
          '',
          'Northstar ha ricostruito la review operativa come contenuto strutturato: sintesi articolo per il management, blocchi citazione riusabili per le voci dei siti e moduli media per la reportistica KPI. In questo modo gli aggiornamenti settimanali sono diventati piu semplici da pubblicare e da riutilizzare su piu canali.',
        ].join('\n'),
      },
      1: {
        title: 'Responsabile programma',
        body: 'Quando il modello di contenuto e diventato stabile, ogni review regionale e diventata un lavoro editoriale invece che di impaginazione.',
      },
      3: {
        body: [
          '## Risultato',
          '',
          'I team hanno ridotto gli attriti nei passaggi di consegna, ottenuto approvazioni piu rapide e creato un archivio riusabile per i prossimi lanci di sito.',
        ].join('\n'),
      },
    },
  },
  'field-service-playbooks': {
    title: 'Playbook di assistenza sul campo sempre aggiornati',
    description:
      'Una storia demo su come trasformare documenti tecnici statici in contenuti vivi che i team possono davvero mantenere nel tempo.',
    blocks: {
      0: {
        body: [
          '## La sfida',
          '',
          'I tecnici usavano PDF obsoleti perche nessuno governava il ciclo di aggiornamento. Le procedure cambiavano piu velocemente della documentazione.',
          '',
          '## Cosa e cambiato',
          '',
          'Northstar ha spostato le guide di servizio in blocchi di contenuto riusabili con ownership chiara. Il rich text copriva i dettagli procedurali, i blocchi media supportavano i riferimenti alle attrezzature e la pubblicazione da una sola fonte rendeva gli aggiornamenti subito visibili.',
        ].join('\n'),
      },
      1: {
        title: 'Responsabile eccellenza del servizio',
        body: 'Ci serviva piu disciplina editoriale che un altro repository di documenti.',
      },
      3: {
        body: [
          '## Risultato',
          '',
          'I team hanno distribuito i cambiamenti piu velocemente e i supervisori hanno potuto verificare cio che era pubblicato senza inseguire cartelle condivise.',
        ].join('\n'),
      },
    },
  },
  'procurement-control-tower': {
    title: 'Control tower procurement per aggiornamenti fornitori',
    description:
      'Un team sourcing usa contenuti strutturati per coordinare rischio fornitori, onboarding e modifiche nei processi di acquisto.',
    blocks: {
      0: {
        body: [
          '## La sfida',
          '',
          'Gli aggiornamenti sui fornitori erano dispersi tra procurement, ufficio legale e operations. Nessuno riusciva a vedere la narrativa approvata piu aggiornata.',
          '',
          '## Cosa e cambiato',
          '',
          'Northstar ha introdotto una cadenza editoriale con categorie per i temi di sourcing, ownership degli autori per la responsabilita e un archivio centrale per gli aggiornamenti agli stakeholder interni.',
        ].join('\n'),
      },
      1: {
        title: 'Responsabile acquisti',
        body: 'Il valore e arrivato da regole di pubblicazione coerenti, non da altre riunioni di reporting.',
      },
      3: {
        body: [
          '## Risultato',
          '',
          'Le comunicazioni ai fornitori sono diventate piu facili da riutilizzare in review di governance, pacchetti di onboarding e briefing esecutivi.',
        ].join('\n'),
      },
    },
  },
  'quality-audit-reporting': {
    title: 'Reporting audit qualita senza caos da slide',
    description:
      'Come un team qualita ha standardizzato audit, osservazioni e follow-up in un modello Strapi riusabile.',
    blocks: {
      0: {
        body: [
          '## La sfida',
          '',
          'Ogni pacchetto audit aveva un formato diverso, rallentando analisi dei trend e review del management piu del necessario.',
          '',
          '## Cosa e cambiato',
          '',
          'Northstar ha creato una struttura editoriale condivisa con blocchi ripetibili per osservazioni, evidenze e azioni successive. Ogni aggiornamento audit e diventato piu semplice da revisionare e confrontare.',
        ].join('\n'),
      },
      1: {
        title: 'Responsabile sistemi qualita',
        body: 'Blocchi standardizzati hanno trasformato il nostro archivio audit in qualcosa che i team potevano davvero navigare.',
      },
      3: {
        body: [
          '## Risultato',
          '',
          'Il management ha ricevuto sintesi piu pulite, i team di sito hanno visto azioni piu chiare e l archivio e diventato uno strumento operativo utile.',
        ].join('\n'),
      },
    },
  },
  'traceability-hub': {
    title: 'Hub di tracciabilita per il reporting di sostenibilita',
    description:
      'Un iniziativa demo che mostra come le narrative ESG possano passare da note frammentate a contenuti riusabili pronti per clienti e stakeholder.',
    blocks: {
      0: {
        body: [
          '## La sfida',
          '',
          'Il reporting di sostenibilita dipendeva da note frammentate provenienti da supply chain, facility e team compliance.',
          '',
          '## Cosa e cambiato',
          '',
          'Northstar ha usato un unico layer di contenuto strutturato per milestone, evidenze e aggiornamenti ricorrenti. Gli autori potevano mantenere temi specifici mentre la narrativa complessiva restava coerente.',
        ].join('\n'),
      },
      1: {
        title: 'Responsabile sostenibilita',
        body: 'Il sistema di contenuto e diventato il sistema operativo del nostro ciclo di reporting.',
      },
      3: {
        body: [
          '## Risultato',
          '',
          'I team interni hanno prodotto aggiornamenti piu chiari, gli stakeholder esterni hanno visto una storia coerente e i report futuri sono stati piu rapidi da assemblare.',
        ].join('\n'),
      },
    },
  },
};

function parseArgs(argv) {
  const options = {
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size: getFileSizeInBytes(filePath),
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];

  for (const fileName of files) {
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      existingFiles.push(fileWhereName);
      continue;
    }

    const fileData = getFileData(fileName);
    const fileNameNoExtension = fileName.split('.').shift();
    const [file] = await uploadFile(fileData, fileNameNoExtension);
    uploadedFiles.push(file);
  }

  const allFiles = [...existingFiles, ...uploadedFiles];
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];

  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      updatedBlocks.push({
        ...block,
        file: uploadedFiles,
      });
      continue;
    }

    if (block.__component === 'shared.slider') {
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      updatedBlocks.push({
        ...block,
        files: existingAndUploadedFiles,
      });
      continue;
    }

    updatedBlocks.push({ ...block });
  }

  return updatedBlocks;
}

function applyItalianTranslation(article) {
  const translation = ITALIAN_ARTICLE_TRANSLATIONS[article.slug];

  if (!translation) {
    throw new Error(`Missing Italian translation for article "${article.slug}".`);
  }

  const localizedBlocks = article.blocks.map((block, index) => {
    const blockTranslation = translation.blocks[index];

    if (!blockTranslation) {
      if (block.__component === 'shared.rich-text' || block.__component === 'shared.quote') {
        return { ...block };
      }

      return { ...block };
    }

    return {
      ...block,
      ...blockTranslation,
    };
  });

  return {
    ...article,
    title: translation.title,
    description: translation.description,
    blocks: localizedBlocks,
  };
}

async function ensureLocales({ dryRun }) {
  const localesService = strapi.plugin('i18n').service('locales');
  const existingLocales = await localesService.find();
  const existingCodes = new Set(existingLocales.map((locale) => locale.code));

  for (const locale of REQUIRED_LOCALES) {
    if (existingCodes.has(locale.code)) {
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] Would create locale ${locale.code}.`);
      continue;
    }

    await localesService.create(locale);
    console.log(`Created locale ${locale.code}.`);
  }
}

async function ensureAuthors({ dryRun }) {
  const existingAuthors = await strapi.documents(AUTHOR_UID).findMany({
    limit: 200,
  });

  const authorsByEmail = new Map(existingAuthors.map((author) => [author.email, author]));
  const resolvedAuthors = [];

  for (const authorSeed of authors) {
    const existingAuthor = authorsByEmail.get(authorSeed.email);

    if (existingAuthor) {
      resolvedAuthors.push(existingAuthor);
      continue;
    }

    if (dryRun) {
      resolvedAuthors.push({
        documentId: `dry-run-author-${resolvedAuthors.length + 1}`,
        email: authorSeed.email,
      });
      console.log(`[dry-run] Would create author ${authorSeed.email}.`);
      continue;
    }

    const avatar = await checkFileExistsBeforeUpload([authorSeed.avatar]);
    const createdAuthor = await strapi.documents(AUTHOR_UID).create({
      data: {
        ...authorSeed,
        avatar,
      },
    });

    resolvedAuthors.push(createdAuthor);
    console.log(`Created author ${createdAuthor.email}.`);
  }

  return resolvedAuthors;
}

async function upsertCategoryLocale(documentId, locale, data, { dryRun }) {
  if (dryRun) {
    console.log(`[dry-run] Would upsert category locale ${locale} for ${data.slug}.`);
    return;
  }

  if (documentId) {
    await strapi.documents(CATEGORY_UID).update({
      documentId,
      locale,
      data,
    });
    return;
  }

  await strapi.documents(CATEGORY_UID).create({
    locale,
    data,
  });
}

async function ensureCategories({ dryRun }) {
  const existingCategories = await strapi.documents(CATEGORY_UID).findMany({
    locale: '*',
    limit: 200,
  });

  const categoriesBySlug = new Map();
  for (const category of existingCategories) {
    if (!categoriesBySlug.has(category.slug)) {
      categoriesBySlug.set(category.slug, category);
    }
  }

  const resolvedCategories = [];

  for (const categorySeed of categories) {
    const existingCategory = categoriesBySlug.get(categorySeed.slug);
    const italianTranslation = ITALIAN_CATEGORY_TRANSLATIONS[categorySeed.slug];

    if (!italianTranslation) {
      throw new Error(`Missing Italian translation for category "${categorySeed.slug}".`);
    }

    if (!existingCategory) {
      if (dryRun) {
        resolvedCategories.push({
          documentId: `dry-run-category-${resolvedCategories.length + 1}`,
          slug: categorySeed.slug,
        });
        console.log(`[dry-run] Would create category ${categorySeed.slug} in en and it.`);
        continue;
      }

      const createdCategory = await strapi.documents(CATEGORY_UID).create({
        locale: 'en',
        data: categorySeed,
      });

      await strapi.documents(CATEGORY_UID).update({
        documentId: createdCategory.documentId,
        locale: 'it',
        data: {
          ...categorySeed,
          ...italianTranslation,
        },
      });

      resolvedCategories.push(createdCategory);
      console.log(`Created category ${categorySeed.slug} in en and it.`);
      continue;
    }

    const localizedEntries = existingCategories.filter(
      (category) => category.documentId === existingCategory.documentId
    );
    const locales = new Set(localizedEntries.map((category) => category.locale));

    if (!locales.has('en')) {
      await upsertCategoryLocale(
        existingCategory.documentId,
        'en',
        categorySeed,
        { dryRun }
      );
    }

    if (!locales.has('it')) {
      await upsertCategoryLocale(
        existingCategory.documentId,
        'it',
        {
          ...categorySeed,
          ...italianTranslation,
        },
        { dryRun }
      );
    }

    resolvedCategories.push(existingCategory);
  }

  return resolvedCategories;
}

async function deleteExistingArticles({ dryRun }) {
  const existingEntries = await strapi.db.query(ARTICLE_UID).findMany({
    select: ['documentId'],
  });

  const documentIds = [...new Set(existingEntries.map((entry) => entry.documentId).filter(Boolean))];

  if (dryRun) {
    console.log(`[dry-run] Would delete ${documentIds.length} existing article documents.`);
    return documentIds.length;
  }

  for (const documentId of documentIds) {
    await strapi.documents(ARTICLE_UID).delete({
      documentId,
      locale: '*',
    });
  }

  console.log(`Deleted ${documentIds.length} existing article documents.`);
  return documentIds.length;
}

function getAuthorDocumentId(articleSeed, resolvedAuthors) {
  const authorSeed = authors[articleSeed.author.id - 1];
  const author = resolvedAuthors.find((entry) => entry.email === authorSeed.email);

  if (!author) {
    throw new Error(`Could not resolve author ${authorSeed.email}.`);
  }

  return author.documentId;
}

function getCategoryDocumentId(articleSeed, resolvedCategories) {
  const categorySeed = categories[articleSeed.category.id - 1];
  const category = resolvedCategories.find((entry) => entry.slug === categorySeed.slug);

  if (!category) {
    throw new Error(`Could not resolve category ${categorySeed.slug}.`);
  }

  return category.documentId;
}

function buildLocalizedBlocks(preparedBlocks, localizedBlocks) {
  return preparedBlocks.map((block, index) => {
    const localizedBlock = localizedBlocks[index];

    if (!localizedBlock) {
      return { ...block };
    }

    if (block.__component === 'shared.rich-text') {
      return {
        ...block,
        body: localizedBlock.body,
      };
    }

    if (block.__component === 'shared.quote') {
      return {
        ...block,
        title: localizedBlock.title,
        body: localizedBlock.body,
      };
    }

    return { ...block };
  });
}

function normalizeArticleDescription(description) {
  if (!description || description.length <= ARTICLE_DESCRIPTION_MAX_LENGTH) {
    return description;
  }

  return `${description.slice(0, ARTICLE_DESCRIPTION_MAX_LENGTH - 3).trimEnd()}...`;
}

function buildLocalizedArticleData(articleSeed, locale, relations, assets) {
  const localizedSeed = locale === 'it' ? applyItalianTranslation(articleSeed) : articleSeed;
  const { coverFile: _coverFile, cover: _cover, author: _author, category: _category, ...baseData } =
    localizedSeed;

  return {
    ...baseData,
    description: normalizeArticleDescription(baseData.description),
    cover: assets.cover,
    blocks: buildLocalizedBlocks(assets.blocks, localizedSeed.blocks),
    author: relations.authorDocumentId,
    category: relations.categoryDocumentId,
  };
}

async function createBilingualArticles({ dryRun, resolvedAuthors, resolvedCategories }) {
  const createdArticles = [];

  for (const articleSeed of articles) {
    const coverFile = articleSeed.coverFile || `${articleSeed.slug}.jpg`;
    const authorDocumentId = getAuthorDocumentId(articleSeed, resolvedAuthors);
    const categoryDocumentId = getCategoryDocumentId(articleSeed, resolvedCategories);

    const assets = dryRun
      ? {
          cover: { id: 0, name: coverFile },
          blocks: articleSeed.blocks.map((block) => ({ ...block })),
        }
      : {
          cover: await checkFileExistsBeforeUpload([coverFile]),
          blocks: await updateBlocks(articleSeed.blocks),
        };

    const englishData = buildLocalizedArticleData(
      articleSeed,
      'en',
      { authorDocumentId, categoryDocumentId },
      assets
    );
    const italianData = buildLocalizedArticleData(
      articleSeed,
      'it',
      { authorDocumentId, categoryDocumentId },
      assets
    );

    if (dryRun) {
      createdArticles.push({
        slug: articleSeed.slug,
        locales: ['en', 'it'],
      });
      console.log(`[dry-run] Would create article ${articleSeed.slug} in en and it.`);
      continue;
    }

    const createdEnglishArticle = await strapi.documents(ARTICLE_UID).create({
      locale: 'en',
      status: 'published',
      data: englishData,
    });

    await strapi.documents(ARTICLE_UID).update({
      documentId: createdEnglishArticle.documentId,
      locale: 'it',
      status: 'published',
      data: italianData,
    });

    createdArticles.push({
      slug: articleSeed.slug,
      documentId: createdEnglishArticle.documentId,
      locales: ['en', 'it'],
    });

    console.log(`Created bilingual article ${articleSeed.slug}.`);
  }

  return createdArticles;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await ensureLocales(options);
    const resolvedAuthors = await ensureAuthors(options);
    const resolvedCategories = await ensureCategories(options);
    const deletedCount = await deleteExistingArticles(options);
    const createdArticles = await createBilingualArticles({
      ...options,
      resolvedAuthors,
      resolvedCategories,
    });

    console.log(
      `${options.dryRun ? '[dry-run] ' : ''}Processed ${deletedCount} deleted article documents and ${createdArticles.length} recreated bilingual articles.`
    );
  } finally {
    await app.destroy();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
