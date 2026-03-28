import { X } from 'lucide-react';
import { renderRichText } from '../contentUtils';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05050c]/80 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e1d] shadow-aura">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">
              {article.category?.name || 'Archive'}
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-ghost">{article.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ghost transition hover:-translate-y-px hover:border-plasma/40"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-6 py-6 md:px-8">
          {article.cover?.url && (
            <img
              src={article.cover.url}
              alt={article.title}
              className="mb-8 h-72 w-full rounded-[1.8rem] object-cover"
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
                  <blockquote key={`${block.__component}-${index}`} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6">
                    <div className="font-serif text-3xl italic text-ghost">“</div>
                    <p className="mt-2 text-lg leading-8 text-ghost">{block.body}</p>
                    <footer className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-plasma">
                      {block.title}
                    </footer>
                  </blockquote>
                );
              }

              if (block.__component === 'shared.media' && block.file?.url) {
                return (
                  <img
                    key={`${block.__component}-${index}`}
                    src={block.file.url}
                    alt={article.title}
                    className="h-72 w-full rounded-[1.7rem] object-cover"
                  />
                );
              }

              if (block.__component === 'shared.slider' && block.files?.length) {
                return (
                  <div key={`${block.__component}-${index}`} className="grid gap-4 md:grid-cols-2">
                    {block.files.map((file, fileIndex) => (
                      <img
                        key={`${file.url}-${fileIndex}`}
                        src={file.url}
                        alt={`${article.title} ${fileIndex + 1}`}
                        className="h-52 w-full rounded-[1.5rem] object-cover"
                      />
                    ))}
                  </div>
                );
              }

              return (
                <div key={`${block.__component}-${index}`} className="space-y-4">
                  {renderRichText(block.body || '')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
