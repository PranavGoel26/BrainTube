import { motion } from 'framer-motion';
import { Database, Cpu, MessageSquare } from 'lucide-react';

const pillars = [
  {
    title: 'Ingest',
    icon: Database,
    description: 'We leverage the official YouTube API to extract high-fidelity transcripts, audio, and metadata at blazing speeds.',
  },
  {
    title: 'Embed',
    icon: Cpu,
    description: 'State-of-the-art embedding models chunk and vectorize the video content, building a localized FAISS intelligence matrix.',
  },
  {
    title: 'Interact',
    icon: MessageSquare,
    description: 'Chat directly with the video context. Generate quizzes, deep-dives, and summaries powered by precision RAG architecture.',
  },
];

export default function AboutSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 text-center mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-6">
            Active Learning Engineered
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            BrainTube was built to solve the information overload of long-form educational content. By combining the Official YouTube API with High-Precision RAG (Retrieval-Augmented Generation), we turn passive watching into active learning.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
        {pillars.map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="glass-panel p-6 sm:p-8 flex flex-col items-center text-center group hover:border-primary/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <pillar.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">{pillar.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pillar.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
