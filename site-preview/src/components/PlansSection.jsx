import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { fallbackExperience } from '../demoContent';
import { STRAPI_URL } from '../contentUtils';
import SectionHeading from './SectionHeading';
import { sectionItemVariants, sectionVariants } from './previewMotion';

export default function PlansSection() {
  return (
    <motion.section
      className="section-shell"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <SectionHeading
        eyebrow="Start now"
        title="Choose how you want to use the preview in the room."
        variants={sectionItemVariants}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {fallbackExperience.plans.map((plan, index) => (
          <motion.article
            key={plan.name}
            className={`rounded-[2rem] border p-7 shadow-panel ${
              plan.featured
                ? 'border-plasma bg-plasma text-ghost scale-[1.02]'
                : 'border-white/10 bg-white/5 text-ghost'
            }`}
            variants={sectionItemVariants}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -8, scale: plan.featured ? 1.04 : 1.02 }}
          >
            <div className="text-[0.68rem] uppercase tracking-[0.35em] text-current/70">{plan.name}</div>
            <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
            <p className="mt-4 text-sm leading-7 text-current/80">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <Play size={14} />
                  {bullet}
                </li>
              ))}
            </ul>
            <motion.a
              className={`mt-8 inline-flex ${plan.featured ? 'accent-button' : 'ghost-button'}`}
              href={plan.featured ? '#live-archive' : `${STRAPI_URL}/api/articles`}
              target={plan.featured ? undefined : '_blank'}
              rel={plan.featured ? undefined : 'noreferrer'}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
            >
              {plan.featured ? 'Launch the demo flow' : 'Inspect the data'}
            </motion.a>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
