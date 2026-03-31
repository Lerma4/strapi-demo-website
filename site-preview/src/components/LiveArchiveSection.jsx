import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { experienceTheme } from '../demoContent';
import { usePreviewI18n } from '../i18n';
import SectionHeading from './SectionHeading';
import { sectionItemVariants, sectionVariants, springEase } from './previewMotion';

export default function LiveArchiveSection({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  categories,
  filteredArticles,
  shouldReduceMotion,
  onOpenArticle,
}) {
  const { copy } = usePreviewI18n();

  return (
    <motion.section
      id="live-archive"
      className="section-shell"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={sectionVariants}
    >
      <SectionHeading
        eyebrow={copy.sections.archive.eyebrow}
        title={copy.sections.archive.title}
        variants={sectionItemVariants}
      />
      <motion.div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center" variants={sectionItemVariants}>
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-panel">
          <label className="text-[0.68rem] uppercase tracking-[0.35em] text-mist/60">{copy.ui.searchArchive}</label>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.ui.searchPlaceholder}
            className="mt-3 w-full bg-transparent text-base text-ghost outline-none placeholder:text-mist/40"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`filter-pill ${selectedCategory === 'all' ? 'filter-pill-active' : ''}`}
          >
            {copy.ui.allCategories}
          </button>
          {categories.map((category) => (
            <button
              key={category.slug || category.name}
              type="button"
              onClick={() => onCategoryChange(category.slug || category.name)}
              className={`filter-pill ${
                selectedCategory === (category.slug || category.name) ? 'filter-pill-active' : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.slug}
              layout
              className="archive-card"
              initial={{ opacity: 0, y: 48, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.7, delay: index * 0.06, ease: springEase }}
              whileHover={{ y: -10, rotateX: shouldReduceMotion ? 0 : 2, scale: 1.012 }}
            >
              <motion.div
                className="archive-card-image"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(10,10,20,0.02), rgba(10,10,20,0.75)), url(${
                    article.cover?.url || experienceTheme.textureImage
                  })`,
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: springEase }}
              />
              <div className="archive-card-body">
                <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.3em] text-mist/60">
                  <span>{article.category?.name || copy.ui.categoryFallback}</span>
                  <span>{article.author?.name || copy.ui.authorFallback}</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-ghost">{article.title}</h3>
                <p className="mt-4 text-sm leading-7 text-mist/75">{article.description}</p>
                <motion.button
                  type="button"
                  onClick={() => onOpenArticle(article)}
                  className="inline-link mt-6"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copy.ui.openContentDetail}
                  <ArrowRight size={15} />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!filteredArticles.length && (
          <motion.div
            className="mt-8 rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-mist/60"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            {copy.ui.noArchiveEntries}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
