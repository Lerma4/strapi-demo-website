import { fallbackExperience } from '../demoContent';

export default function SiteFooter() {
  return (
    <footer className="mx-4 mt-10 rounded-t-[4rem] border border-white/10 bg-[#090910] px-6 pb-10 pt-12 md:mx-8 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.35em] text-plasma">Northstar Process Lab</div>
          <p className="mt-4 max-w-md text-base leading-8 text-mist/75">
            Client-facing preview for showing what Strapi looks like when it becomes a composed digital experience instead of an admin screenshot tour.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-mist/75">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
            </span>
            System operational
          </div>
        </div>
        {fallbackExperience.footerColumns.map((column) => (
          <div key={column.title}>
            <div className="text-[0.68rem] uppercase tracking-[0.35em] text-mist/60">{column.title}</div>
            <div className="mt-5 space-y-3">
              {column.links.map((link) => (
                <a key={link} className="inline-link" href="#">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
