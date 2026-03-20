import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Brain, User, Loader2, FileQuestion } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { chatWithAi, getExplanation } from '@/lib/api';

type Message = {
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
};

export default function AskAI() {
  const [searchParams] = useSearchParams();
  const videoUrl = searchParams.get('video_url');
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: videoUrl ? 'Hello! Ask me any question about the selected video.' : 'Hello! Please select a video from the library to start asking questions.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForGeneralExplanation, setIsWaitingForGeneralExplanation] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading || !videoUrl) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      setIsLoading(true);

      if (isWaitingForGeneralExplanation) {
        setIsWaitingForGeneralExplanation(false);
        const lowerInput = userMsg.toLowerCase();
        if (lowerInput.includes('yes') || lowerInput === 'y' || lowerInput === 'sure' || lowerInput === 'yeah') {
          // Temporarily show a loading message instead of a generic "Thinking..."
          setMessages(prev => [...prev, { role: 'ai', text: 'Fetching a general explanation for you...' }]);
          const res = await getExplanation(pendingQuery);
          const aiText = res?.answer || "Sorry, I couldn't find an explanation.";
          
          // Remove the temporary message and replace with the actual response
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages.pop(); // Remove "Fetching a general explanation..."
            return [...newMessages, { role: 'ai', text: aiText }];
          });
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: 'Okay! Let me know if you have any other questions about the video.' }]);
        }
        return;
      }

      const historyToSend = messages
        .filter(m => m.text !== 'Hello! Ask me any question about the selected video.' && !m.text.includes('Thinking...'))
        .slice(-6); // send last 6 messages to keep context reasonable

      const res = await chatWithAi(userMsg, videoUrl, historyToSend);
      
      if (res?.status === 'not_found' && res?.message?.includes('general explanation')) {
        setIsWaitingForGeneralExplanation(true);
        setPendingQuery(userMsg);
        setMessages(prev => [...prev, { role: 'ai', text: res.message }]);
      } else if (res?.status === 'not_found') {
        setMessages(prev => [...prev, { role: 'ai', text: res.message || "This topic was not found in the video." }]);
      } else {
        const aiText = typeof res === 'string' ? res : (res?.answer || JSON.stringify(res));
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to AI: ' + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-screen max-w-4xl mx-auto w-full relative">
        {videoUrl && (
            <Link 
                to={`/quiz?video_url=${encodeURIComponent(videoUrl)}`}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 px-4 py-2 rounded-full shadow-lg font-medium text-sm"
            >
                <FileQuestion className="w-4 h-4" /> Go to Quiz
            </Link>
        )}
        <div className="p-4 sm:p-6 lg:p-8 pb-0 mt-8 sm:mt-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Ask AI</h1>
            <p className="text-sm text-muted-foreground">Ask anything about your analyzed video.</p>
          </motion.div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-primary" /> : <Brain className="h-4 w-4 text-accent" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/15 text-foreground rounded-tr-sm'
                    : 'glass-panel text-muted-foreground rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div className="flex justify-start">
               <div className="flex gap-3 max-w-[90%] sm:max-w-[75%]">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/20">
                   <Loader2 className="h-4 w-4 text-accent animate-spin" />
                 </div>
                 <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed glass-panel text-muted-foreground rounded-tl-sm">
                   Thinking...
                 </div>
               </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 lg:p-8 pt-0">
          <div className="glass-panel flex items-center gap-3 p-2 pl-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={videoUrl ? "Ask a question about your videos..." : "Please select a video from the library first"}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              disabled={isLoading || !videoUrl}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !videoUrl}
              className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
