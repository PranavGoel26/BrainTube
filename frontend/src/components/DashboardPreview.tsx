import { motion } from 'framer-motion';
import {
  Brain, LayoutDashboard, Upload, MessageSquare,
  FileText, HelpCircle, Library, Play, Clock,
  Send, ChevronRight
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Upload, label: 'Upload Video' },
  { icon: MessageSquare, label: 'Ask AI' },
  { icon: FileText, label: 'Summaries' },
  { icon: HelpCircle, label: 'Quiz' },
  { icon: Library, label: 'Library' },
];

const transcriptLines = [
  { time: '00:12', text: 'Neural networks are computational systems inspired by biological neural networks...' },
  { time: '01:34', text: 'The key innovation was backpropagation, which allows efficient gradient computation...' },
  { time: '03:22', text: 'Transformer architecture revolutionized natural language processing in 2017...' },
  { time: '05:01', text: 'Attention mechanisms allow the model to focus on relevant parts of the input...' },
];

const chatMessages = [
  { role: 'user', text: 'What is backpropagation?' },
  { role: 'ai', text: 'Backpropagation is an algorithm for training neural networks by computing gradients of the loss function. Referenced at 01:34.' },
];

export default function DashboardPreview() {
  return (
    <section id="how-it-works" className="relative py-32 px-4">
      <div className="gradient-orb w-[500px] h-[500px] bg-accent/10 bottom-[10%] left-[-10%]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The <span className="glow-text">Workspace</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A heads-up display for your mind. Video is secondary — intelligence is primary.
          </p>
        </motion.div>

        {/* Dashboard Mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.6)' }}
        >
          <div className="flex min-h-[520px]">
            {/* Sidebar */}
            <div className="w-16 md:w-56 border-r border-border/50 p-3 flex flex-col gap-1 flex-shrink-0">
              <div className="flex items-center gap-2 px-2 py-3 mb-4">
                <Brain className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="hidden md:block text-sm font-bold text-foreground">BrainTube</span>
              </div>
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:block">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row">
              {/* Video Area */}
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-border/50">
                <div className="relative rounded-lg bg-black/60 aspect-video flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <Play className="h-12 w-12 text-muted-foreground/50" />
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div className="h-full w-[45%] bg-gradient-to-r from-primary to-accent rounded-r" />
                  </div>
                </div>
                {/* Transcript */}
                <div className="mt-4 space-y-2 max-h-36 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transcript</span>
                  </div>
                  {transcriptLines.map((line) => (
                    <div key={line.time} className="flex gap-3 text-xs group cursor-pointer hover:bg-muted/30 rounded px-2 py-1.5 transition-colors">
                      <span className="text-accent font-mono flex-shrink-0">{line.time}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Chat */}
              <div className="w-full md:w-72 lg:w-80 flex flex-col p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Chat</span>
                </div>
                <div className="flex-1 space-y-3 mb-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary/20 text-foreground'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {msg.text}
                        {msg.role === 'ai' && (
                          <span className="inline-flex items-center gap-1 ml-1 text-accent cursor-pointer">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono">01:34</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
                  <input
                    placeholder="Ask about this video..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    readOnly
                  />
                  <Send className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
