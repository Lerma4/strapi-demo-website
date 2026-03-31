import { motion } from 'motion/react';
import { experienceTheme } from '../demoContent';
import { renderRichText } from '../contentUtils';
import { usePreviewI18n } from '../i18n';
import { sectionItemVariants, sectionVariants } from './previewMotion';

export default function ManifestoSection({ manifestoRef, manifestoImageY, manifestoImageScale, cmsData }) {
  const aboutQuote = cmsData.about.blocks?.find((block) => block.__component === 'shared.quote');
  const aboutText = cmsData.about.blocks?.find((block) => block.__component === 'shared.rich-text');
  const { copy } = usePreviewI18n();

  return (
    <section id="manifesto" ref={manifestoRef} className="manifesto-shell section-shell">
      <motion.div
        className="manifesto-image"
        style={{ y: manifestoImageY, scale: manifestoImageScale, backgroundImage: `url(${experienceTheme.manifestoImage})` }}
      />
      <motion.div
        className="relative z-10 mx-auto max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
      >
        <motion.div variants={sectionItemVariants} className="eyebrow">
          {copy.manifesto.eyebrow}
        </motion.div>
        <motion.p variants={sectionItemVariants} className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">
          {copy.manifesto.small}
        </motion.p>
        <motion.h2 variants={sectionItemVariants} className="mt-10 max-w-5xl text-5xl leading-[0.95] text-ghost md:text-7xl">
          {copy.manifesto.largePrefix}{' '}
          <span className="font-serif italic text-plasma">{copy.manifesto.highlight}</span>
        </motion.h2>
        <motion.p variants={sectionItemVariants} className="mt-8 max-w-2xl text-base leading-8 text-mist/75 md:text-lg">
          {copy.manifesto.body}
        </motion.p>
        <motion.div variants={sectionItemVariants} className="mt-10 grid gap-5 lg:grid-cols-2">
          <motion.div
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">{copy.ui.aboutBlock}</div>
            <h3 className="mt-4 text-2xl font-semibold text-ghost">{cmsData.about.title}</h3>
            <div className="mt-5 space-y-4">{renderRichText(aboutText?.body || '')}</div>
          </motion.div>
          <motion.div
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">{copy.ui.voiceMarker}</div>
            <p className="mt-5 font-serif text-4xl italic leading-tight text-ghost">
              "{aboutQuote?.body || copy.ui.defaultQuote}"
            </p>
            <div className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-mist/60">
              {aboutQuote?.title || copy.ui.defaultQuoteTitle}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
