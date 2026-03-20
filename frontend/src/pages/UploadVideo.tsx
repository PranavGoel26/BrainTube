import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link2, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { processVideo, uploadLocalVideo } from '@/lib/api';

export default function UploadVideo() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!url && !file) return;
    try {
        setIsLoading(true);
        setError(null);
        let resultUrl = url;
        
        if (file) {
          const res = await uploadLocalVideo(file);
          resultUrl = res.url;
        } else {
          await processVideo(url);
        }
        
        navigate('/summaries?video_url=' + encodeURIComponent(resultUrl));
    } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to process video.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUrl(''); // clear url
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl('');
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Upload Video</h1>
          <p className="text-sm text-muted-foreground">Paste a YouTube link or upload a video file to analyze.</p>
        </motion.div>

        {/* URL Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">YouTube URL</label>
          <div className="glass-panel flex items-center gap-3 p-2 pl-4">
            <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              disabled={isLoading}
            />
            <motion.button
              whileHover={isLoading ? {} : { scale: 1.02 }}
              whileTap={isLoading ? {} : { scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={isLoading || (!url && !file)}
              className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all whitespace-nowrap ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/25'}`}
            >
              <span className="hidden sm:inline">{isLoading ? 'Processing...' : 'Analyze'}</span>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </motion.div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Drop Zone */}
        <div className="relative">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="video/mp4,video/x-m4v,video/*"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`glass-panel border-2 border-dashed p-10 sm:p-16 text-center cursor-pointer transition-all ${
                dragActive ? 'border-primary/50 bg-primary/5' : 'border-border/30 hover:border-primary/30'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              {file ? (
                <div>
                  <p className="text-foreground font-medium mb-1">{file.name}</p>
                  <p className="text-xs text-primary hover:underline" onClick={(e) => { e.preventDefault(); setFile(null); }}>Remove file</p>
                </div>
              ) : (
                <div>
                  <p className="text-foreground font-medium mb-1">Drop your video file here or click to browse</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, AVI — up to 500MB</p>
                </div>
              )}
            </motion.div>
          </label>
        </div>
      </div>
    </AppLayout>
  );
}
