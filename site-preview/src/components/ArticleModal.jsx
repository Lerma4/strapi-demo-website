import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { renderRichText } from '../contentUtils';

const springEase = [0.22, 1, 0.36, 1];

export default function ArticleModal({ article, onClose }) {
  useEffect(() => {
    if (!article) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05050c]/80 px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e1d] shadow-aura"
            initial={{ opacity: 0, y: 56, scale: 0.96, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.45, ease: springEase }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">
                  {article.category?.name || 'Archive'}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ghost">{article.title}</h3>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ghost transition hover:-translate-y-px hover:border-plasma/40"
                whileHover={{ y: -2, rotate: 90 }}
                whileTap={{ scale: 0.96 }}
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-6 py-6 md:px-8">
              {article.cover?.url && (
                <motion.img
                  src={article.cover.url}
                  alt={article.title}
                  className="mb-8 h-72 w-full rounded-[1.8rem] object-cover"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: springEase }}
                />
              )}
              <div className="mb-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-mist/60">
                <span>{article.author?.name || 'Northstar Team'}</span>
                <span>{article.category?.name || 'general'}</span>
              </div>
              <div className="space-y-6">
                {(article.blocks || []).map((block, index) => {
                  if (block.__component === 'shared.quote') {
                    return (
                      <motion.blockquote
                        key={`${block.__component}-${index}`}
                        className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6"
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.05, ease: springEase }}
                      >
                        <div className="font-serif text-3xl italic text-ghost">"</div>
                        <p className="mt-2 text-lg leading-8 text-ghost">{block.body}</p>
                        <footer className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-plasma">
                          {block.title}
                        </footer>
                      </motion.blockquote>
                    );
                  }

                  if (block.__component === 'shared.media' && block.file?.url) {
                    return (
                      <motion.img
                        key={`${block.__component}-${index}`}
                        src={block.file.url}
                        alt={article.title}
                        className="h-72 w-full rounded-[1.7rem] object-cover"
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.05, ease: springEase }}
                      />
                    );
                  }

                  if (block.__component === 'shared.slider' && block.files?.length) {
                    return (
                      <div key={`${block.__component}-${index}`} className="grid gap-4 md:grid-cols-2">
                        {block.files.map((file, fileIndex) => (
                          <motion.img
                            key={`${file.url}-${fileIndex}`}
                            src={file.url}
                            alt={`${article.title} ${fileIndex + 1}`}
                            className="h-52 w-full rounded-[1.5rem] object-cover"
                            initial={{ opacity: 0, y: 26 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: (index + fileIndex) * 0.05, ease: springEase }}
                          />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={`${block.__component}-${index}`}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.05, ease: springEase }}
                    >
                      {renderRichText(block.body || '')}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
