import { motion } from 'framer-motion';
import { FileText, ChevronDown, Clock, Tag, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { fetchVideos } from '@/lib/api';

export default function Summaries() {
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('video_url');
  
  const [expanded, setExpanded] = useState<number | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVideos();
      const reversed = data.reverse();
      setVideos(reversed);
      
      if (targetUrl) {
          const idx = reversed.findIndex((v: any) => v.url === targetUrl);
          if (idx !== -1) setExpanded(idx);
      } else if (reversed.length > 0) {
          setExpanded(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full relative">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Summaries</h1>
          <p className="text-sm text-muted-foreground">AI-generated summaries of your analyzed videos.</p>
        </motion.div>

        {isLoading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
        ) : videos.length === 0 ? (
             <div className="glass-panel p-12 text-center text-muted-foreground">No videos processed yet.</div>
        ) : (
            <div className="space-y-4">
              {videos.map((v, i) => (
                <motion.div
                  key={v.url + i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{v.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> Duration: {v.duration}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${expanded === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 sm:px-5 pb-5"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                        {v.summary || "We have automatically extracted and chunked this video to create an interactive learning module. Please visit Ask AI to query the contents of this video."}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 justify-between items-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                            <Tag className="h-3 w-3" /> Transcribed
                          </span>
                          
                          <button 
                             onClick={() => navigate(`/ask-ai?video_url=${encodeURIComponent(v.url)}`)}
                             className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                              <Sparkles className="w-4 h-4" /> Ask AI
                          </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
        )}
      </div>
    </AppLayout>
  );
}
