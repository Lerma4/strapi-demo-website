import { motion } from 'motion/react';
import { DiagnosticShuffler, SchedulerCard, TelemetryTypewriter } from './FeatureArtifacts';
import SectionHeading from './SectionHeading';
import { sectionItemVariants, sectionVariants } from './previewMotion';

export default function CapabilitiesSection() {
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
        eyebrow="Capabilities"
        title="Interactive functional artifacts for explaining Strapi without showing a dashboard first."
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
