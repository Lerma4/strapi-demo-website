const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ARTICLE_UID = 'api::article.article';
const AUTHOR_UID = 'api::author.author';
const CATEGORY_UID = 'api::category.category';

const DEFAULT_COUNT = 6;
const DEFAULT_STATUS = 'published';
const ALLOWED_STATUSES = new Set(['published', 'draft', 'mixed']);

function parseArgs(argv) {
  const options = {
    count: DEFAULT_COUNT,
    status: DEFAULT_STATUS,
    prefix: 'test-article',
  };

  for (const arg of argv) {
    if (arg.startsWith('--count=')) {
      const value = Number.parseInt(arg.slice('--count='.length), 10);
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error('`--count` must be a positive integer.');
      }
      options.count = value;
      continue;
    }

    if (arg.startsWith('--status=')) {
      const value = arg.slice('--status='.length);
      if (!ALLOWED_STATUSES.has(value)) {
        throw new Error('`--status` must be one of: published, draft, mixed.');
      }
      options.status = value;
      continue;
    }

    if (arg.startsWith('--prefix=')) {
      const value = slugify(arg.slice('--prefix='.length));
      if (!value) {
        throw new Error('`--prefix` must contain at least one letter or number.');
      }
      options.prefix = value;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function getArticleStatus(globalStatus, index) {
  if (globalStatus === 'mixed') {
    return index % 2 === 0 ? 'published' : 'draft';
  }

  return globalStatus;
}

async function ensurePublicPermissions() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  const permissions = [
    'api::article.article.find',
    'api::article.article.findOne',
    'api::author.author.find',
    'api::author.author.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
  ];

  for (const action of permissions) {
    const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
      where: {
        action,
        role: publicRole.id,
      },
    });

    if (existingPermission) {
      continue;
    }

    await strapi.query('plugin::users-permissions.permission').create({
      data: {
        action,
        role: publicRole.id,
      },
    });
  }
}

async function ensureAuthors() {
  const existingAuthors = await strapi.documents(AUTHOR_UID).findMany({
    limit: 100,
  });

  if (existingAuthors.length > 0) {
    return existingAuthors;
  }

  const fallbackAuthors = [
    {
      name: 'Test Editor',
      email: 'test.editor@example.com',
    },
    {
      name: 'QA Writer',
      email: 'qa.writer@example.com',
    },
  ];

  const createdAuthors = [];
  for (const author of fallbackAuthors) {
    const created = await strapi.documents(AUTHOR_UID).create({
      data: author,
    });
    createdAuthors.push(created);
  }

  return createdAuthors;
}

async function ensureCategories() {
  const existingCategories = await strapi.documents(CATEGORY_UID).findMany({
    limit: 100,
  });

  if (existingCategories.length > 0) {
    return existingCategories;
  }

  const fallbackCategories = [
    {
      name: 'testing',
      slug: 'testing',
      description: 'Temporary content for local verification flows.',
    },
    {
      name: 'qa',
      slug: 'qa',
      description: 'Draft and published samples for UI and API checks.',
    },
    {
      name: 'sandbox',
      slug: 'sandbox',
      description: 'Safe content used to validate preview and publishing behavior.',
    },
  ];

  const createdCategories = [];
  for (const category of fallbackCategories) {
    const created = await strapi.documents(CATEGORY_UID).create({
      data: category,
    });
    createdCategories.push(created);
  }

  return createdCategories;
}

function buildArticle(index, prefix, authorDocumentId, categoryDocumentId, status, batchId) {
  const articleNumber = index + 1;
  const articleCode = padNumber(articleNumber);
  const title = `Test Article ${articleCode}`;
  const slug = `${prefix}-${batchId}-${articleCode}`;
  const bodyStatus = status === 'draft' ? 'draft-only' : 'public';

  return {
    status,
    data: {
      title,
      slug,
      description: `Generated ${bodyStatus} article ${articleCode} for local testing flows.`,
      author: authorDocumentId,
      category: categoryDocumentId,
      blocks: [
        {
          __component: 'shared.rich-text',
          body: [
            `## Scenario ${articleCode}`,
            '',
            `This is a generated ${status} article created for local testing.`,
            '',
            '- verify archive rendering',
            '- verify article modal content',
            '- verify draft and publish flows',
          ].join('\n'),
        },
        {
          __component: 'shared.quote',
          title: 'Automation note',
          body: `Created by scripts/seed-test-articles.js in batch ${batchId}.`,
        },
      ],
    },
  };
}

async function createTestArticles(options) {
  await ensurePublicPermissions();

  const authors = await ensureAuthors();
  const categories = await ensureCategories();
  const batchId = Date.now();
  const createdArticles = [];

  for (let index = 0; index < options.count; index += 1) {
    const author = authors[index % authors.length];
    const category = categories[index % categories.length];
    const status = getArticleStatus(options.status, index);
    const article = buildArticle(
      index,
      options.prefix,
      author.documentId,
      category.documentId,
      status,
      batchId
    );

    const created = await strapi.documents(ARTICLE_UID).create(article);
    createdArticles.push({
      title: created.title,
      documentId: created.documentId,
      slug: created.slug,
      status,
    });
  }

  return createdArticles;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    const createdArticles = await createTestArticles(options);

    console.log(`Created ${createdArticles.length} test articles.`);
    for (const article of createdArticles) {
      console.log(`- [${article.status}] ${article.title} (${article.slug})`);
    }
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
