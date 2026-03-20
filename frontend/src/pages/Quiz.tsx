import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { generateQuiz } from '@/lib/api';

type Question = {
  question: string;
  options: string[];
  correct: number;
};

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const videoUrl = searchParams.get('video_url');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (videoUrl) {
      loadQuiz();
    } else {
      setError("No video selected for quiz generation. Please launch from Ask AI.");
    }
  }, [videoUrl]);

  const loadQuiz = async () => {
    if (!videoUrl) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await generateQuiz(videoUrl);
      setQuestions(data.questions);
      resetState();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const handleSelect = (idx: number) => {
    if (answered || questions.length === 0) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) setScore(score + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);
    setCurrentQ(currentQ + 1);
  };

  const isFinished = questions.length > 0 && currentQ >= questions.length;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Generated Quiz</h1>
          <p className="text-sm text-muted-foreground">Test your understanding of the analyzed video.</p>
        </motion.div>

        {error ? (
          <div className="glass-panel p-8 text-center border-destructive/30">
            <p className="text-destructive font-medium mb-4">{error}</p>
            {videoUrl && (
              <button
                onClick={loadQuiz}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all"
              >
                Retry Request
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="glass-panel p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Synthesizing personalized quiz...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a minute based on video length.</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="glass-panel p-12 text-center text-muted-foreground">
            <p>No questions generated yet.</p>
          </div>
        ) : !isFinished ? (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-5 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
              <span className="text-xs text-accent font-medium">Score: {score}</span>
            </div>
            <div className="flex items-start gap-3 mb-6">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-medium text-foreground">{questions[currentQ].question}</h2>
            </div>
            <div className="space-y-3 mb-6">
              {questions[currentQ].options.map((opt, i) => {
                let borderClass = 'border-border/30 hover:border-primary/30';
                if (answered && i === questions[currentQ].correct) borderClass = 'border-accent/50 bg-accent/10';
                else if (answered && i === selected && i !== questions[currentQ].correct) borderClass = 'border-destructive/50 bg-destructive/10';
                else if (selected === i) borderClass = 'border-primary/50';

                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${borderClass}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-border/50 flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                      {answered && i === questions[currentQ].correct ? <CheckCircle2 className="h-4 w-4 text-accent" /> :
                        answered && i === selected ? <XCircle className="h-4 w-4 text-destructive" /> :
                          String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-foreground">{opt}</span>
                  </motion.button>
                );
              })}
            </div>
            {answered && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground ml-auto hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                Next <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-4">You scored {score} out of {questions.length}</p>
            <button
              onClick={loadQuiz}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Retry & Generate New Questions
            </button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
