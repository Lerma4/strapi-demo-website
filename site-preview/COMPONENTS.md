# COMPONENTS.md

Inventario dei componenti UI disponibili in `site-preview`. Quando modifichi l'interfaccia, usa prima questi blocchi invece di duplicare markup o animazioni.

## Composition root

- `App` - [src/App.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/App.jsx)
  Gestisce fetch CMS, stato della preview, filtri archivio, modal attivo, scroll-driven motion e compone tutte le sezioni principali.

## Reusable components

- `PreviewBackdrop` - [src/components/PreviewBackdrop.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/PreviewBackdrop.jsx)
  Renderizza noise layer, SVG filter e orb animate di sfondo.
  Props: `orbOneY`, `orbTwoY`.

- `FloatingNav` - [src/components/FloatingNav.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/FloatingNav.jsx)
  Navbar fissa con logo, links di sezione, CTA desktop e badge mobile.
  Props: `compact`, `siteName`, `articlesCount`.

- `PreviewStatusBanner` - [src/components/PreviewStatusBanner.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/PreviewStatusBanner.jsx)
  Banner flottante per stato preview articolo.
  Props: `previewState`.

- `SectionHeading` - [src/components/SectionHeading.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/SectionHeading.jsx)
  Titolo di sezione riutilizzabile con eyebrow, heading e supporto ai motion props.
  Props: `eyebrow`, `title`, `children`, `className`, `titleClassName`, `...motionProps`.

- `HeroSection` - [src/components/HeroSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/HeroSection.jsx)
  Hero iniziale con visual parallax, CTA e pannello stato.
  Props: `heroRef`, `heroImageScale`, `heroImageY`, `heroPanelY`, `heroPanelRotate`, `shouldReduceMotion`, `cmsData`, `statusHighlights`.

- `CapabilitiesSection` - [src/components/CapabilitiesSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/CapabilitiesSection.jsx)
  Sezione che aggrega gli artifact demo.
  Props: nessuna.

- `ManifestoSection` - [src/components/ManifestoSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/ManifestoSection.jsx)
  Sezione manifesto con immagine parallax e blocchi about/quote.
  Props: `manifestoRef`, `manifestoImageY`, `manifestoImageScale`, `cmsData`.

- `ProtocolSection` - [src/components/ProtocolSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/ProtocolSection.jsx)
  Sequenza sticky dei passaggi del publishing journey.
  Props: nessuna.

- `LiveArchiveSection` - [src/components/LiveArchiveSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/LiveArchiveSection.jsx)
  Archivio filtrabile con ricerca, pill categorie e cards articolo.
  Props: `query`, `onQueryChange`, `selectedCategory`, `onCategoryChange`, `categories`, `filteredArticles`, `shouldReduceMotion`, `onOpenArticle`.

- `PlansSection` - [src/components/PlansSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/PlansSection.jsx)
  Sezione finale con piani/CTA.
  Props: nessuna.

- `SiteFooter` - [src/components/SiteFooter.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/SiteFooter.jsx)
  Footer della preview con colonne link e stato operativo.
  Props: nessuna.

- `ArticleModal` - [src/components/ArticleModal.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/ArticleModal.jsx)
  Modal overlay per dettaglio articolo e rendering blocchi Strapi.
  Props: `article`, `onClose`.

- `DiagnosticShuffler` - [src/components/FeatureArtifacts.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/FeatureArtifacts.jsx)
  Card animata che simula il riordino dei modelli contenuto.
  Props: nessuna.

- `TelemetryTypewriter` - [src/components/FeatureArtifacts.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/FeatureArtifacts.jsx)
  Feed tipografico animato per eventi editoriali.
  Props: nessuna.

- `SchedulerCard` - [src/components/FeatureArtifacts.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/FeatureArtifacts.jsx)
  Simulazione interattiva di scheduler editoriale con cursore animato.
  Props: nessuna.

## Internal helpers

- `BrandLockup` - [src/components/FloatingNav.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/FloatingNav.jsx)
  Helper interno della navbar per logo + wordmark.

- `WordReveal` - [src/components/HeroSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/HeroSection.jsx)
  Helper interno per reveal parola per parola nel hero.

- `ProtocolStage` - [src/components/ProtocolSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/ProtocolSection.jsx)
  Wrapper sticky di ogni step del protocollo.

- `ProtocolVisual` - [src/components/ProtocolSection.jsx](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/ProtocolSection.jsx)
  Visual specifico per ciascuno step del protocollo.

## Motion presets

- `previewMotion` - [src/components/previewMotion.js](/Users/lorenzolonghi/Desktop/Progetti/strapi-demo-website/site-preview/src/components/previewMotion.js)
  Costanti riutilizzabili per easing e variants: `springEase`, `heroGroupVariants`, `heroItemVariants`, `sectionVariants`, `sectionItemVariants`, `wordVariants`.
