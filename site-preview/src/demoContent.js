export const experienceTheme = {
  heroImage:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80',
  textureImage:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  manifestoImage:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
};

export const fallbackExperience = {
  brandName: 'Northstar Process Lab',
  tagline: 'Operational content systems for industrial teams',
  heroLead: 'Operations beyond',
  heroDrama: 'friction.',
  heroBody:
    'A cinematic demo site built to show how Strapi can power structured publishing, reusable content blocks and client-facing narratives without exposing raw CMS complexity.',
  nav: ['Capabilities', 'Manifesto', 'Protocol', 'Archive'],
  featureCards: {
    shuffler: {
      title: 'Content Model Shuffler',
      description:
        'Show clients how collection types, single types and reusable blocks can be reorganised without redesigning the whole experience.',
      labels: ['Articles / Insights', 'Single types / Global', 'Components / Blocks'],
    },
    typewriter: {
      title: 'Publishing Telemetry',
      description:
        'A stylised operational feed that turns editorial actions into visible, high-signal moments.',
      messages: [
        'Draft saved: regional visibility update',
        'Review requested: field service playbook',
        'SEO synced: sustainability archive',
        'Permissions verified: public article access'
      ],
    },
    scheduler: {
      title: 'Workflow Scheduler',
      description:
        'Use this pattern to explain approval windows, publishing cadence and handoff points across teams.',
      caption: 'Review cadence aligned to weekly operating rhythm.',
    },
  },
  manifesto: {
    eyebrow: 'Publishing philosophy',
    small:
      'Most CMS demos focus on forms, toggles and admin screenshots. They explain where data lives.',
    largePrefix: 'We focus on how content becomes',
    highlight: 'operational clarity.',
    body:
      'This preview translates Strapi into a client-facing system: structured, elegant and visibly connected to real publishing workflows.',
  },
  protocol: [
    {
      step: '01',
      title: 'Model the narrative',
      description:
        'Create a content architecture with collection types, single types and reusable blocks that mirror how the business actually speaks.',
    },
    {
      step: '02',
      title: 'Stage the review',
      description:
        'Use categories, author ownership and modular sections to keep draft, review and publish states legible across teams.',
    },
    {
      step: '03',
      title: 'Publish with traceability',
      description:
        'Expose the final story through one polished surface while keeping Strapi as the source of truth underneath.',
    },
  ],
  plans: [
    {
      name: 'Essential',
      price: 'Pilot',
      description: 'Use the preview to validate IA, tone and editing flows with stakeholders.',
      bullets: ['Single market site', 'Core content types', 'Preview sync'],
    },
    {
      name: 'Performance',
      price: 'Launch',
      featured: true,
      description: 'Demonstrate live updates, reusable blocks and workflow storytelling to clients.',
      bullets: ['Live archive', 'Animated showcase', 'Editorial scenarios'],
    },
    {
      name: 'Enterprise',
      price: 'Scale',
      description: 'Extend the same structure to multi-brand, multi-country or multi-team publishing.',
      bullets: ['Shared governance', 'Role-based operations', 'Structured growth'],
    },
  ],
  footerColumns: [
    {
      title: 'Preview',
      links: ['Capabilities', 'Manifesto', 'Protocol', 'Live archive'],
    },
    {
      title: 'Strapi',
      links: ['Admin workflow', 'Content modelling', 'Permissions', 'Public API'],
    },
    {
      title: 'Company',
      links: ['About', 'Methods', 'Case studies', 'Contact'],
    },
  ],
  fallbackCms: {
    global: {
      siteName: 'Northstar Process Lab',
      siteDescription:
        'Generic industrial technology company used to demonstrate Strapi-powered publishing.',
      logo: null,
    },
    about: {
      title: 'About Northstar Process Lab',
      blocks: [
        {
          __component: 'shared.quote',
          title: 'Elena Ward, Operations Director',
          body: 'We ship operational clarity teams can act on.',
        },
        {
          __component: 'shared.rich-text',
          body:
            '## Built for industrial teams\n\nNorthstar Process Lab is a fictional company used to show how structured content can support industrial storytelling, not just content storage.',
        },
      ],
    },
    categories: [
      { name: 'operations', slug: 'operations', description: 'Visibility and control tower content.' },
      { name: 'field service', slug: 'field-service', description: 'Guides and playbooks for field teams.' },
      { name: 'procurement', slug: 'procurement', description: 'Supplier and sourcing updates.' },
      { name: 'quality', slug: 'quality', description: 'Audit and continuous improvement stories.' },
      { name: 'sustainability', slug: 'sustainability', description: 'Traceability and reporting content.' },
    ],
    articles: [
      {
        title: 'Regional network visibility for multi-site operations',
        slug: 'regional-network-visibility',
        description:
          'How a generic operations team aligned site leaders, service windows and leadership reporting in one publishing flow.',
        category: { name: 'operations' },
        author: { name: 'Nora Ellis' },
        cover: {
          url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
        },
        blocks: [
          {
            __component: 'shared.rich-text',
            body:
              '## The challenge\n\nRegional leaders were working from disconnected updates and separate slide decks.\n\n## Result\n\nA structured archive replaced formatting chaos with one repeatable publishing cycle.',
          },
        ],
      },
      {
        title: 'Field service playbooks that stay current',
        slug: 'field-service-playbooks',
        description:
          'A living documentation approach for service teams that need procedures, not stale PDFs.',
        category: { name: 'field service' },
        author: { name: 'Nora Ellis' },
        cover: {
          url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        },
        blocks: [
          {
            __component: 'shared.quote',
            title: 'Service excellence manager',
            body: 'We needed publishing discipline more than another document repository.',
          },
        ],
      },
      {
        title: 'Traceability hub for sustainability reporting',
        slug: 'traceability-hub',
        description:
          'A demo initiative showing how sustainability narratives can move from fragmented notes to reusable, client-ready content.',
        category: { name: 'sustainability' },
        author: { name: 'Marco Levin' },
        cover: {
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        },
        blocks: [
          {
            __component: 'shared.rich-text',
            body:
              '## The challenge\n\nReporting depended on fragmented notes.\n\n## Result\n\nThe content system became the operating system for the reporting cycle.',
          },
        ],
      },
    ],
  },
};
