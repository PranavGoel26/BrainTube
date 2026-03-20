import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, BookOpen, Play, Brain, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { fetchVideos } from '@/lib/api';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function Dashboard() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVideos();
      setVideos(data.reverse()); // latest first
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalVideos = videos.length;
  // Calculate total seconds roughly
  const totalSeconds = videos.reduce((acc, v) => {
    const [m, s] = (v.duration || '0:0').split(':').map(Number);
    return acc + ((m || 0) * 60 + (s || 0));
  }, 0);
  const hoursSaved = (totalSeconds / 3600).toFixed(1) + 'h';

  const stats = [
    { label: 'Videos Analyzed', value: totalVideos.toString(), icon: Play, change: '+1 this week' },
    { label: 'AI Questions Asked', value: '142', icon: Brain, change: '+18 today' },
    { label: 'Hours Saved', value: hoursSaved, icon: Clock, change: '+' + hoursSaved + ' this week' },
    { label: 'Quizzes Completed', value: '12', icon: BookOpen, change: '85% avg score' },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your learning intelligence at a glance.</p>
        </motion.div>

        {isLoading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      variants={item}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.08 }}
                      className="glass-panel p-5 group hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <s.icon className="h-5 w-5 text-primary" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      <p className="text-xs text-accent mt-2">{s.change}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Recent Activity
                  </h2>
                  <div className="glass-panel divide-y divide-border/30">
                    {videos.slice(0, 5).map((v) => (
                      <div key={v.url} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                          <p className="text-xs text-muted-foreground">{v.duration}</p>
                        </div>
                        <div className="w-24 hidden sm:block">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: `100%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">Analyzed</p>
                        </div>
                      </div>
                    ))}
                    {videos.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No videos imported yet.
                        </div>
                    )}
                  </div>
                </motion.div>
            </>
        )}
      </div>
    </AppLayout>
  );
}
