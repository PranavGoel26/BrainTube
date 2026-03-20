import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import UploadVideo from "./pages/UploadVideo.tsx";
import AskAI from "./pages/AskAI.tsx";
import Summaries from "./pages/Summaries.tsx";
import Quiz from "./pages/Quiz.tsx";
import VideoLibrary from "./pages/VideoLibrary.tsx";
import NotFound from "./pages/NotFound.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your frontend .env.local file");
}

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <SignIn routing="hash" forceRedirectUrl="/dashboard" />
      </div>
    </SignedOut>
  </>
);

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_missing_key"}>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
              <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
              <Route path="/summaries" element={<ProtectedRoute><Summaries /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><VideoLibrary /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ClerkProvider>
);

export default App;

