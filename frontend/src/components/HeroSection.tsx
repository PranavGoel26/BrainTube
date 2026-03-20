import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrainScene from './BrainScene';

export default function HeroSection() {
  const [url, setUrl] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Gradient Orbs that follow mouse */}
      <motion.div
        className="gradient-orb w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-primary/30 top-[-10%] left-[-10%]"
        animate={{
          x: mousePos.x * 30,
          y: mousePos.y * 30,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ animationName: 'pulse-glow', animationDuration: '3s', animationIterationCount: 'infinite' }}
      />
      <motion.div
        className="gradient-orb w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-accent/20 bottom-[-10%] right-[-10%]"
        animate={{
          x: mousePos.x * -20,
          y: mousePos.y * -20,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ animationName: 'pulse-glow', animationDuration: '3s', animationDelay: '1.5s', animationIterationCount: 'infinite' }}
      />

      {/* 3D Brain - responds to mouse */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          x: mousePos.x * 15,
          y: mousePos.y * 15,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 25 }}
      >
        <BrainScene />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-20 sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 sm:mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-medium text-primary tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            AI-Powered Knowledge Engine
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 sm:mb-6"
        >
          <span className="text-foreground">Deconstruct</span>
          <br />
          <span className="glow-text">Reality.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2"
        >
          BrainTube synthesizes video into structured intelligence.
          <br className="hidden md:block" />
          Learn at the speed of thought.
        </motion.p>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl px-2"
        >
          <div className="glass-panel flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pl-3 sm:pl-5">
            <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube link or upload video"
              className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(url ? `/upload?url=${encodeURIComponent(url)}` : '/upload')}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Initialize Synthesis</span>
              <span className="sm:hidden">Go</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Floating Cards - follow mouse subtly */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex gap-3 sm:gap-4 mt-10 sm:mt-16 flex-wrap justify-center"
        >
          {['Transcript', 'AI Answers', 'Summary', 'Quiz'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                x: mousePos.x * (5 + i * 3),
              }}
              transition={{
                opacity: { delay: 0.7 + i * 0.1, duration: 0.5 },
                y: { delay: 0.7 + i * 0.1, duration: 0.5 },
                x: { type: 'spring', stiffness: 100, damping: 20 },
              }}
              className="glass-panel px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-muted-foreground"
              style={{ animation: `float 6s ease-in-out ${i * 0.8}s infinite` }}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
