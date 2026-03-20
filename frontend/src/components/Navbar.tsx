import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { useTheme } from '@/contexts/ThemeProvider';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50 bg-background/60"
        style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
            <div className="absolute inset-0 blur-lg bg-primary/40" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Brain<span className="text-gradient-primary">Tube</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
          <SignedIn>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
            >
              Go to Dashboard
            </Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold hover:text-foreground transition-colors">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted-foreground">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[57px] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 md:hidden"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <SignedIn>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-primary/10 text-sm font-semibold text-primary text-center"
                >
                  Go to Dashboard
                </Link>
                <div className="flex justify-center py-2">
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col gap-2 pt-2">
                  <SignInButton mode="modal">
                    <button onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-lg text-sm font-semibold border border-border">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-lg bg-primary text-sm font-semibold text-primary-foreground">Sign Up</button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
