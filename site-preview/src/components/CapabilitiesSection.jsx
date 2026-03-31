import { motion } from 'motion/react';
import { usePreviewI18n } from '../i18n';
import { DiagnosticShuffler, SchedulerCard, TelemetryTypewriter } from './FeatureArtifacts';
import SectionHeading from './SectionHeading';
import { sectionItemVariants, sectionVariants } from './previewMotion';

export default function CapabilitiesSection() {
  const { copy } = usePreviewI18n();

  return (
    <motion.section
      id="capabilities"
      className="section-shell"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <SectionHeading
        eyebrow={copy.sections.capabilities.eyebrow}
        title={copy.sections.capabilities.title}
        variants={sectionItemVariants}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <DiagnosticShuffler />
        <TelemetryTypewriter />
        <SchedulerCard />
      </div>
    </motion.section>
  );
}
