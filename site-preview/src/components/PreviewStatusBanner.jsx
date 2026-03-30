import { AnimatePresence, motion } from 'motion/react';
import { springEase } from './previewMotion';

export default function PreviewStatusBanner({ previewState }) {
  return (
    <AnimatePresence>
      {previewState.active && (
        <motion.div
          className="fixed left-1/2 top-24 z-[60] w-[min(92vw,720px)] -translate-x-1/2 rounded-[1.6rem] border border-plasma/40 bg-[#120f25]/90 px-5 py-4 shadow-aura backdrop-blur-xl"
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.45, ease: springEase }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.35em] text-plasma">Strapi Preview</div>
              <div className="mt-1 text-sm text-ghost">
                {previewState.error
                  ? previewState.error
                  : `Article preview loaded in ${previewState.status || 'draft'} mode.`}
              </div>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-mist/75">
              {previewState.status || 'draft'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
