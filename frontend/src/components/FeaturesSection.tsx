import { motion } from 'framer-motion';
import { MessageSquare, FileText, HelpCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Q&A from Videos',
    description: 'Ask anything about any video. Get precise answers based on the transcript.',
    gradient: 'from-primary/20 to-transparent',
    path: '/ask-ai',
  },
  {
    icon: FileText,
    title: 'Instant Summaries',
    description: 'Distill hours of content into structured, scannable key concepts.',
    gradient: 'from-accent/20 to-transparent',
    path: '/summaries',
  },
  {
    icon: HelpCircle,
    title: 'Auto Generated Quizzes',
    description: 'Test comprehension with AI-crafted questions. Lock in knowledge permanently.',
    gradient: 'from-glow-cyan/20 to-transparent',
    path: '/quiz',
  },
  {
    icon: Search,
    title: 'Smart Knowledge Search',
    description: 'Semantic search across your entire video library. Find anything instantly.',
    gradient: 'from-primary/15 to-transparent',
    path: '/library',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-24 lg:py-32 px-4">
      <div className="gradient-orb w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary/15 top-[20%] right-[-15%]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            Intelligence, <span className="glow-text">Extracted</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto">
            Every video becomes a structured knowledge graph you can query, explore, and retain.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {features.map((f) => (
            <Link key={f.title} to={f.path}>
              <motion.div
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass-panel-hover p-6 sm:p-8 group cursor-pointer h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4 sm:mb-5">
                    <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
