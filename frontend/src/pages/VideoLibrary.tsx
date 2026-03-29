import { motion } from 'framer-motion';
import { Play, Search, Grid3X3, List, Loader2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { fetchVideos, deleteVideo } from '@/lib/api';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

type Video = {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: string;
  analyzed: boolean;
  thumbnail: string;
};

// Helper to extract YouTube ID
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoLibrary() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent, videoUrl: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this video? This will also delete all stored embeddings.')) return;
    try {
      setDeletingVideo(videoUrl);
      await deleteVideo(videoUrl);
      setVideos(prev => prev.filter(v => v.url !== videoUrl));
      toast.success('Video removed from library');
    } catch (err) {
      console.error('Failed to delete video:', err);
      toast.error('Failed to remove video');
    } finally {
      setDeletingVideo(null);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVideos();
      setVideos(data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Library</h1>
          <p className="text-sm text-muted-foreground">All your analyzed and saved videos.</p>
        </motion.div>

        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="glass-panel flex items-center gap-2 px-3 py-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
            />
          </div>
          <div className="flex gap-1 glass-panel p-1 w-fit">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Grid / List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 glass-panel">
             <p className="text-muted-foreground">No videos found. Upload a video to get started.</p>
          </div>
        ) : (
          <motion.div 
            className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filtered.map((v, i) => {
              const ytId = getYoutubeId(v.url);
              const isHovered = hoveredVideo === v.url;
              return (
                <motion.div
                  key={v.id || i}
                  variants={itemVariants}
                  className={`glass-panel-hover cursor-pointer ${view === 'list' ? 'flex items-center gap-4 p-3' : ''}`}
                  onMouseEnter={() => setHoveredVideo(v.url)}
                  onMouseLeave={() => setHoveredVideo(null)}
                  onClick={() => navigate(`/ask-ai?video_url=${encodeURIComponent(v.url)}`)}
                >
                  {view === 'grid' ? (
                    <>
                      <div 
                        className={`aspect-video bg-gradient-to-br ${v.thumbnail} rounded-t-xl flex items-center justify-center relative overflow-hidden bg-cover bg-center`}
                        style={ytId ? { backgroundImage: `url('https://img.youtube.com/vi/${ytId}/maxresdefault.jpg')` } : {}}
                      >
                        {isHovered && ytId ? (
                            <iframe 
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1`}
                                className="w-full h-full absolute inset-0 object-cover pointer-events-none"
                                allow="autoplay; encrypted-media" 
                            />
                        ) : (
                            <Play className="h-10 w-10 text-white z-10" />
                        )}
                        <span className="absolute bottom-2 right-2 text-xs bg-black/80 px-2 py-0.5 rounded text-white font-mono z-10">{v.duration}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{v.channel}</p>
                        <div className="flex items-center justify-between mt-2">
                          {v.analyzed && <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Analyzed</span>}
                          <button
                            onClick={(e) => handleDelete(e, v.url)}
                            disabled={deletingVideo === v.url}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          >
                            {deletingVideo === v.url ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            Remove
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`w-24 h-14 bg-gradient-to-br ${v.thumbnail} rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-cover bg-center`}
                        style={ytId ? { backgroundImage: `url('https://img.youtube.com/vi/${ytId}/maxresdefault.jpg')` } : {}}
                      >
                        {isHovered && ytId ? (
                            <iframe 
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1`}
                                className="w-[150%] h-[150%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                allow="autoplay; encrypted-media" 
                            />
                        ) : (
                            <Play className="h-6 w-6 text-white z-10" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                        <p className="text-xs text-muted-foreground">{v.channel} · {v.duration}</p>
                      </div>
                      {v.analyzed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex-shrink-0 hidden sm:inline">Analyzed</span>}
                      <button
                        onClick={(e) => handleDelete(e, v.url)}
                        disabled={deletingVideo === v.url}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        {deletingVideo === v.url ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Remove
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
