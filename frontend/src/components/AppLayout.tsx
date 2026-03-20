import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, LayoutDashboard, Upload, MessageSquare, FileText, HelpCircle, Library, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useTheme } from '@/contexts/ThemeProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Video', path: '/upload' },
  { icon: MessageSquare, label: 'Ask AI', path: '/ask-ai' },
  { icon: FileText, label: 'Summaries', path: '/summaries' },
  { icon: HelpCircle, label: 'Quiz', path: '/quiz' },
  { icon: Library, label: 'Library', path: '/library' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 lg:w-64 border-r border-border/50 flex-col flex-shrink-0 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-5 py-5 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Brain className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 blur-lg bg-primary/40" />
          </div>
          <span className="text-base font-bold text-foreground">
            Brain<span className="text-gradient-primary">Tube</span>
          </span>
        </Link>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50 flex items-center gap-3">
          <UserButton showName afterSignOutUrl="/" appearance={{ elements: { userButtonBox: 'flex-row-reverse', userButtonOuterIdentifier: 'text-foreground text-sm font-medium' } }} />
          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Brain<span className="text-gradient-primary">Tube</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <UserButton />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-muted-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden pt-14"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-colors ${
                      active
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
