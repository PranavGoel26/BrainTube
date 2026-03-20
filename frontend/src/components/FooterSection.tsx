import { Brain } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">BrainTube</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 BrainTube. Intelligence at the speed of thought.
        </p>
      </div>
    </footer>
  );
}
