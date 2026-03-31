export const experienceTheme = {
  heroImage:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80',
  textureImage:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  manifestoImage:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
};

export const UI_DEFAULT_LOCALE = 'en';

const localeRegionFallbacks = {
  ar: 'sa',
  cs: 'cz',
  da: 'dk',
  de: 'de',
  el: 'gr',
  en: 'gb',
  es: 'es',
  fi: 'fi',
  fr: 'fr',
  hu: 'hu',
  it: 'it',
  ja: 'jp',
  ko: 'kr',
  nl: 'nl',
  no: 'no',
  pl: 'pl',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  sk: 'sk',
  sv: 'se',
  tr: 'tr',
  uk: 'ua',
  zh: 'cn',
};

function countryCodeToFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function normaliseLocaleCode(locale = '') {
  return locale.toLowerCase().replace(/_/g, '-');
}

export function resolveUiLocale(locale) {
  const normalised = normaliseLocaleCode(locale);

  if (experienceByLocale[normalised]) {
    return normalised;
  }

  const language = normalised.split('-')[0];

  if (experienceByLocale[language]) {
    return language;
  }

  return UI_DEFAULT_LOCALE;
}

export function getLocaleFlag(localeCode) {
  const inferredRegion = getLocaleRegion(localeCode);

  return countryCodeToFlagEmoji(inferredRegion) || normalisedLocaleLabel(localeCode);
}

export function getLocaleFlagSrc(localeCode) {
  const inferredRegion = getLocaleRegion(localeCode);

  if (!inferredRegion) {
    return null;
  }

  return `https://flagcdn.com/${inferredRegion}.svg`;
}

function getLocaleRegion(localeCode) {
  const normalised = normaliseLocaleCode(localeCode);
  const parts = normalised.split('-');
  return parts[1] || localeRegionFallbacks[parts[0]] || null;
}

function normalisedLocaleLabel(localeCode) {
  return normaliseLocaleCode(localeCode).slice(0, 2).toUpperCase();
}

const experienceByLocale = {
  en: {
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
          'Permissions verified: public article access',
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
        description:
          'Demonstrate live updates, reusable blocks and workflow storytelling to clients.',
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
    sections: {
      capabilities: {
        eyebrow: 'Capabilities',
        title: 'Interactive functional artifacts for explaining Strapi without showing a dashboard first.',
      },
      protocol: {
        eyebrow: 'Protocol',
        title: 'Sticky stacking archive for the publishing journey.',
      },
      archive: {
        eyebrow: 'Live archive',
        title: 'One polished surface for client demos, editorial reviews and API-driven content checks.',
      },
      plans: {
        eyebrow: 'Start now',
        title: 'Choose how you want to use the preview in the room.',
      },
    },
    ui: {
      aboutBlock: 'About block',
      allCategories: 'All',
      archiveEntries: 'Archive entries',
      archiveFallback: 'Archive',
      apiBacked: 'API-backed',
      authorFallback: 'Northstar Team',
      categoryFallback: 'general',
      connectedToStrapi: 'Connected to Strapi',
      defaultQuote: 'Structured content should feel composed, not mechanical.',
      defaultQuoteTitle: 'Northstar editorial principle',
      exploreArchive: 'Explore the archive',
      fallback: 'Fallback',
      fallbackPreviewActive: 'Fallback preview active',
      languageSwitcher: 'Change language',
      launchDemoFlow: 'Launch the demo flow',
      liveFeed: 'Live feed',
      liveSync: 'Live sync',
      mobileArchiveHint:
        'Jump straight into the archive or scan the publishing journey section by section.',
      mobileNav: 'Mobile nav',
      mode: 'Mode',
      navigationGroups: 'Navigation groups',
      noArchiveEntries: 'No archive entries match the current filters.',
      openArchive: 'Open archive',
      openContentDetail: 'Open content detail',
      openStrapiAdmin: 'Open Strapi admin',
      operationalBrief: 'Operational brief',
      previewBadge: 'Strapi cinematic preview',
      previewError:
        'Preview article could not be loaded. Check preview secret, URL and document status.',
      previewLayer: 'Preview layer',
      renderingMode: 'Rendering mode',
      save: 'Save',
      searchArchive: 'Search archive',
      searchPlaceholder: 'Search titles, descriptions or authors',
      systemOperational: 'System operational',
      systemStatus: 'System status',
      voiceMarker: 'Voice marker',
      visibleEntries: (count) => `${count} visible entries`,
      inspectData: 'Inspect the data',
      cinematicDemo: 'Cinematic demo',
      currentPreview: (status) => `Article preview loaded in ${status} mode.`,
      stepLabel: (step) => `Step ${step}`,
      previewStatusLabel: {
        draft: 'draft',
        published: 'published',
      },
    },
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
        {
          name: 'operations',
          slug: 'operations',
          description: 'Visibility and control tower content.',
        },
        {
          name: 'field service',
          slug: 'field-service',
          description: 'Guides and playbooks for field teams.',
        },
        {
          name: 'procurement',
          slug: 'procurement',
          description: 'Supplier and sourcing updates.',
        },
        {
          name: 'quality',
          slug: 'quality',
          description: 'Audit and continuous improvement stories.',
        },
        {
          name: 'sustainability',
          slug: 'sustainability',
          description: 'Traceability and reporting content.',
        },
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
  },
  it: {
    brandName: 'Northstar Process Lab',
    tagline: 'Sistemi editoriali operativi per team industriali',
    heroLead: 'Operazioni oltre',
    heroDrama: 'l’attrito.',
    heroBody:
      'Una demo cinematografica pensata per mostrare come Strapi possa governare publishing strutturato, blocchi riusabili e narrative client-facing senza esporre la complessita grezza del CMS.',
    nav: ['Capacita', 'Manifesto', 'Protocollo', 'Archivio'],
    featureCards: {
      shuffler: {
        title: 'Riorganizzatore del modello contenuti',
        description:
          'Mostra ai clienti come collection type, single type e blocchi riusabili possano essere riorganizzati senza ridisegnare tutta l’esperienza.',
        labels: ['Articoli / Insight', 'Single type / Global', 'Componenti / Blocchi'],
      },
      typewriter: {
        title: 'Telemetria editoriale',
        description:
          'Un feed operativo stilizzato che trasforma le azioni editoriali in momenti visibili e ad alto segnale.',
        messages: [
          'Bozza salvata: aggiornamento visibilita regionale',
          'Revisione richiesta: playbook field service',
          'SEO sincronizzata: archivio sostenibilita',
          'Permessi verificati: accesso pubblico agli articoli',
        ],
      },
      scheduler: {
        title: 'Scheduler del workflow',
        description:
          'Usa questo pattern per spiegare finestre di approvazione, cadenze di pubblicazione e handoff tra team.',
        caption: 'Cadenza di review allineata al ritmo operativo settimanale.',
      },
    },
    manifesto: {
      eyebrow: 'Filosofia editoriale',
      small:
        'La maggior parte delle demo CMS si concentra su form, toggle e screenshot dell’admin. Spiegano dove vive il dato.',
      largePrefix: 'Noi ci concentriamo su come il contenuto diventa',
      highlight: 'chiarezza operativa.',
      body:
        'Questa preview traduce Strapi in un sistema client-facing: strutturato, elegante e visibilmente connesso ai workflow editoriali reali.',
    },
    protocol: [
      {
        step: '01',
        title: 'Modella la narrazione',
        description:
          'Crea un’architettura di contenuti con collection type, single type e blocchi riusabili che rispecchi davvero il linguaggio del business.',
      },
      {
        step: '02',
        title: 'Prepara la review',
        description:
          'Usa categorie, ownership degli autori e sezioni modulari per rendere leggibili bozza, revisione e pubblicazione tra team diversi.',
      },
      {
        step: '03',
        title: 'Pubblica con tracciabilita',
        description:
          'Espone la storia finale su una sola superficie rifinita, mantenendo Strapi come source of truth sottostante.',
      },
    ],
    plans: [
      {
        name: 'Essenziale',
        price: 'Pilot',
        description:
          'Usa la preview per validare information architecture, tono e flussi editoriali con gli stakeholder.',
        bullets: ['Sito per singolo mercato', 'Content type core', 'Sincronizzazione preview'],
      },
      {
        name: 'Performance',
        price: 'Launch',
        featured: true,
        description:
          'Mostra ai clienti aggiornamenti live, blocchi riusabili e storytelling del workflow.',
        bullets: ['Archivio live', 'Showcase animato', 'Scenari editoriali'],
      },
      {
        name: 'Enterprise',
        price: 'Scale',
        description:
          'Estendi la stessa struttura a publishing multi-brand, multi-country o multi-team.',
        bullets: ['Governance condivisa', 'Operazioni role-based', 'Crescita strutturata'],
      },
    ],
    footerColumns: [
      {
        title: 'Preview',
        links: ['Capacita', 'Manifesto', 'Protocollo', 'Archivio live'],
      },
      {
        title: 'Strapi',
        links: ['Workflow admin', 'Content modelling', 'Permessi', 'API pubblica'],
      },
      {
        title: 'Company',
        links: ['Chi siamo', 'Metodo', 'Case study', 'Contatti'],
      },
    ],
    sections: {
      capabilities: {
        eyebrow: 'Capacita',
        title: 'Artifact interattivi per raccontare Strapi senza partire da una dashboard.',
      },
      protocol: {
        eyebrow: 'Protocollo',
        title: 'Archivio sticky a strati per visualizzare il publishing journey.',
      },
      archive: {
        eyebrow: 'Archivio live',
        title: 'Una sola superficie rifinita per demo cliente, revisioni editoriali e controlli su contenuti API-driven.',
      },
      plans: {
        eyebrow: 'Parti ora',
        title: 'Scegli come usare la preview durante la presentazione.',
      },
    },
    ui: {
      aboutBlock: 'Blocco about',
      allCategories: 'Tutte',
      archiveEntries: 'Elementi in archivio',
      archiveFallback: 'Archivio',
      apiBacked: 'Connesso alle API',
      authorFallback: 'Team Northstar',
      categoryFallback: 'generale',
      connectedToStrapi: 'Connesso a Strapi',
      defaultQuote: 'Il contenuto strutturato dovrebbe sembrare composto, non meccanico.',
      defaultQuoteTitle: 'Principio editoriale Northstar',
      exploreArchive: 'Esplora l’archivio',
      fallback: 'Fallback',
      fallbackPreviewActive: 'Preview fallback attiva',
      languageSwitcher: 'Cambia lingua',
      launchDemoFlow: 'Avvia il flusso demo',
      liveFeed: 'Feed live',
      liveSync: 'Sync live',
      mobileArchiveHint:
        'Apri subito l’archivio oppure scorri il publishing journey sezione per sezione.',
      mobileNav: 'Menu mobile',
      mode: 'Modalita',
      navigationGroups: 'Gruppi di navigazione',
      noArchiveEntries: 'Nessun elemento dell’archivio corrisponde ai filtri attuali.',
      openArchive: 'Apri archivio',
      openContentDetail: 'Apri dettaglio contenuto',
      openStrapiAdmin: 'Apri admin Strapi',
      operationalBrief: 'Brief operativo',
      previewBadge: 'Preview cinematografica Strapi',
      previewError:
        'Impossibile caricare l’articolo in preview. Controlla secret, URL e stato del documento.',
      previewLayer: 'Layer preview',
      renderingMode: 'Modalita di rendering',
      save: 'Salva',
      searchArchive: 'Cerca nell’archivio',
      searchPlaceholder: 'Cerca titoli, descrizioni o autori',
      systemOperational: 'Sistema operativo',
      systemStatus: 'Stato sistema',
      voiceMarker: 'Voice marker',
      visibleEntries: (count) => `${count} elementi visibili`,
      inspectData: 'Ispeziona i dati',
      cinematicDemo: 'Demo cinematografica',
      currentPreview: (status) => `Preview articolo caricata in modalita ${status}.`,
      stepLabel: (step) => `Step ${step}`,
      previewStatusLabel: {
        draft: 'bozza',
        published: 'pubblicato',
      },
    },
    fallbackCms: {
      global: {
        siteName: 'Northstar Process Lab',
        siteDescription:
          'Azienda industrial-tech generica usata per mostrare un flusso di publishing alimentato da Strapi.',
        logo: null,
      },
      about: {
        title: 'Chi e Northstar Process Lab',
        blocks: [
          {
            __component: 'shared.quote',
            title: 'Elena Ward, Direttrice Operations',
            body: 'Consegniamo chiarezza operativa su cui i team possono agire.',
          },
          {
            __component: 'shared.rich-text',
            body:
              '## Costruito per team industriali\n\nNorthstar Process Lab e una company fittizia usata per mostrare come i contenuti strutturati possano sostenere storytelling industriale, non solo storage.',
          },
        ],
      },
      categories: [
        {
          name: 'operations',
          slug: 'operations',
          description: 'Contenuti di visibilita e control tower.',
        },
        {
          name: 'field service',
          slug: 'field-service',
          description: 'Guide e playbook per team sul campo.',
        },
        {
          name: 'procurement',
          slug: 'procurement',
          description: 'Aggiornamenti su sourcing e fornitori.',
        },
        {
          name: 'quality',
          slug: 'quality',
          description: 'Audit e storie di miglioramento continuo.',
        },
        {
          name: 'sustainability',
          slug: 'sustainability',
          description: 'Contenuti di reporting e tracciabilita.',
        },
      ],
      articles: [
        {
          title: 'Visibilita regionale per operazioni multi-sito',
          slug: 'regional-network-visibility',
          description:
            'Come un team operations generico ha allineato responsabili di sito, finestre di servizio e reporting direzionale in un unico flusso editoriale.',
          category: { name: 'operations' },
          author: { name: 'Nora Ellis' },
          cover: {
            url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
          },
          blocks: [
            {
              __component: 'shared.rich-text',
              body:
                '## La sfida\n\nI responsabili regionali lavoravano con aggiornamenti scollegati e slide diverse.\n\n## Risultato\n\nUn archivio strutturato ha sostituito il caos di formattazione con un ciclo editoriale ripetibile.',
            },
          ],
        },
        {
          title: 'Playbook field service sempre aggiornati',
          slug: 'field-service-playbooks',
          description:
            'Un approccio di documentazione viva per team di servizio che hanno bisogno di procedure, non PDF obsoleti.',
          category: { name: 'field service' },
          author: { name: 'Nora Ellis' },
          cover: {
            url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
          },
          blocks: [
            {
              __component: 'shared.quote',
              title: 'Responsabile service excellence',
              body: 'Ci serviva disciplina editoriale piu di un altro repository documentale.',
            },
          ],
        },
        {
          title: 'Hub di tracciabilita per il reporting di sostenibilita',
          slug: 'traceability-hub',
          description:
            'Una iniziativa demo che mostra come le narrative di sostenibilita possano passare da note frammentate a contenuti riusabili e pronti per il cliente.',
          category: { name: 'sustainability' },
          author: { name: 'Marco Levin' },
          cover: {
            url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          },
          blocks: [
            {
              __component: 'shared.rich-text',
              body:
                '## La sfida\n\nIl reporting dipendeva da note sparse.\n\n## Risultato\n\nIl content system e diventato il sistema operativo del ciclo di reporting.',
            },
          ],
        },
      ],
    },
  },
};

export function getFallbackExperience(locale) {
  return experienceByLocale[resolveUiLocale(locale)];
}
