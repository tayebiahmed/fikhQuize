// src/App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  X, 
  ChevronRight, 
  Trophy, 
  BookOpen, 
  Settings, 
  Home, 
  Flame, 
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Hammer,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRandomTip } from './data/staticTips';
import { FIQH_DATABASE, CATEGORIES, type Book, type Section, type Question } from './data/fiqhData.ts';

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full bg-brand-primary"
    />
  </div>
);

const AIFiqhTip = () => {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // محاكاة تحميل بسيط
    setTimeout(() => {
      setTip(getRandomTip());
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="bg-gradient-to-br from-brand-secondary to-blue-600 rounded-3xl p-6 text-white mb-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-xs font-black uppercase tracking-widest opacity-80">نصيحة اليوم</span>
        </div>
        {loading ? (
          <div className="animate-pulse bg-white/20 h-4 w-3/4 rounded mb-2" />
        ) : (
          <p className="text-lg font-bold leading-relaxed">
            {tip || "النظافة من الإيمان، والوضوء شطر الإيمان."}
          </p>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'quiz' | 'result' | 'leaderboard'>('home');
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(3);
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(1450);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const shuffleOptions = (questions: Question[]): Question[] => {
    return questions.map(q => {
      const optionsWithCorrectness = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correct
      }));
      
      // Fisher-Yates shuffle
      for (let i = optionsWithCorrectness.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithCorrectness[i], optionsWithCorrectness[j]] = [optionsWithCorrectness[j], optionsWithCorrectness[i]];
      }

      const newCorrectIndex = optionsWithCorrectness.findIndex(opt => opt.isCorrect);
      return {
        ...q,
        options: optionsWithCorrectness.map(opt => opt.text),
        correct: newCorrectIndex
      };
    });
  };

  const handleStartSection = (section: Section) => {
    const shuffled = shuffleOptions(section.questions);
    setShuffledQuestions(shuffled);
    setActiveSection(section);
    setCurrentQuestionIndex(0);
    setLives(3);
    setProgress(0);
    setView('quiz');
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || activeSection === null) return;
    
    const correct = selectedOption === shuffledQuestions[currentQuestionIndex].correct;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (!correct) {
      setLives(prev => Math.max(0, prev - 1));
      setStreak(0);
    } else {
      const xpGain = currentQuestion?.xp || 20;
      setXp(prev => prev + xpGain);
      setStreak(prev => prev + 1);
    }

    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Auto-transition to next question after feedback period
    timerRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 2500);
  };

  const handleNextQuestion = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (activeSection === null) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < shuffledQuestions.length && lives > 0) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsCorrect(null);
      setProgress(((nextIndex) / shuffledQuestions.length) * 100);
    } else {
      if (lives > 0) {
        setProgress(100);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        setXp(prev => prev + 50);
      }
      setView('result');
    }
  };

  const handleRestart = () => {
    setView('home');
    setActiveSection(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setLives(3);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- Components ---

  const Sidebar = () => (
    <nav className="hidden lg:flex flex-col w-64 border-l-2 border-gray-100 h-screen fixed right-0 top-0 p-6 bg-white z-50 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-b-4 border-green-700">خ</div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-gray-800 leading-none">الخلاصة</h1>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">برمجة م. طيبي أحمد</span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {[
          { icon: Home, label: 'الرئيسية', id: 'home' },
          { icon: Trophy, label: 'المتصدرون', id: 'leaderboard' },
          { icon: BookOpen, label: 'المرجع', id: 'library' },
          { icon: Star, label: 'الإنجازات', id: 'achievements' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all group ${view === item.id ? 'bg-blue-50 text-brand-secondary border-2 border-brand-secondary' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <item.icon className={`w-6 h-6 ${view === item.id ? 'text-brand-secondary' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 p-5 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">المطور المسؤول</span>
        </div>
        <p className="text-sm font-black text-gray-800">المهندس طيبي أحمد</p>
        <p className="text-[10px] text-gray-400 font-bold mt-1">نسخة الإصدار 2.5.0</p>
      </div>
    </nav>
  );

  const TopStats = () => (
    <div className="flex justify-center gap-4 lg:gap-8 mb-8 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-30 border-b-2 border-gray-50 lg:border-none lg:relative lg:bg-transparent lg:border-b-0">
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-2 border-gray-100 shadow-sm group cursor-help hover:border-orange-200 transition-colors">
        <Flame className="w-6 h-6 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
        <span className="font-black text-gray-700">{streak}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-2 border-gray-100 shadow-sm group cursor-help hover:border-red-200 transition-colors">
        <Heart className="w-6 h-6 text-brand-danger fill-brand-danger group-hover:scale-110 transition-transform" />
        <span className="font-black text-brand-danger">{lives}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-2 border-gray-100 shadow-sm group cursor-help hover:border-yellow-200 transition-colors">
        <Star className="w-6 h-6 text-brand-accent fill-brand-accent group-hover:scale-110 transition-transform" />
        <span className="font-black text-gray-700">{xp}</span>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="flex flex-row-reverse min-h-screen bg-white font-sans overflow-x-hidden" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pb-24 lg:pb-12">
        <div className="max-w-2xl mx-auto px-4 lg:px-8">
          <TopStats />
          
          <div className="mb-12">
            <AIFiqhTip />
          </div>

          <div className="space-y-32">
            {CATEGORIES.map((category, catIdx) => {
              const categoryBooks = FIQH_DATABASE.filter(b => b.categoryId === category.id);
              if (categoryBooks.length === 0) return null;

              return (
                <div key={category.id} className="relative">
                  {/* Category Banner (Main Unit) */}
                  <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${category.color} text-white shadow-xl mb-16 relative overflow-hidden flex flex-col items-center text-center ring-8 ring-white ring-offset-0`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 -rotate-12 translate-x-4 -translate-y-4">
                       <Sparkles className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-5xl mb-4 transform hover:scale-110 transition-transform cursor-default">{category.icon}</div>
                      <h2 className="text-3xl font-black mb-1">{category.name}</h2>
                      <p className="text-sm font-bold opacity-80 uppercase tracking-widest italic">المرحلة التعليمية {catIdx + 1}</p>
                    </div>
                  </div>
                  
                  {/* Books Path */}
                  <div className="space-y-24">
                    {categoryBooks.map((book, bIdx) => (
                      <div key={book.id} className="mb-16">
                        {/* Book Division Separator */}
                        <div className="flex items-center gap-4 mb-10">
                           <div className={`p-4 rounded-2xl ${book.color} text-white shadow-md order-2`}>
                              <book.icon className="w-6 h-6" />
                           </div>
                           <div className="h-0.5 flex-1 bg-gray-100 order-1"></div>
                           <h3 className="text-lg font-black text-gray-800 order-3">{book.title}</h3>
                           <div className="h-0.5 flex-1 bg-gray-100 order-4"></div>
                        </div>

                        {/* Sections Circles */}
                        <div className="flex flex-col items-center gap-12">
                          {book.sections.map((section, sIdx) => {
                            // Duolingo zig-zag calculation across the whole category or per book? 
                            // per book is cleaner for "divisions"
                            const mod = sIdx % 4;
                            let offsetClass = "";
                            if (mod === 1) offsetClass = "mr-20";
                            if (mod === 2) offsetClass = "ml-0";
                            if (mod === 3) offsetClass = "ml-20";

                            return (
                              <div key={section.id} className={`flex flex-col items-center ${offsetClass} transition-all`}>
                                <motion.div 
                                  whileHover={{ scale: 1.1, rotate: 2 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="relative group cursor-pointer"
                                  onClick={() => handleStartSection(section)}
                                >
                                  <div className={`w-28 h-28 rounded-full flex items-center justify-center border-b-8 border-black/20 shadow-xl relative z-10 transition-all ${book.color} ring-8 ring-white ring-offset-0`}>
                                     <div className="text-white text-center">
                                        <BookOpen className="w-10 h-10 mb-1 mx-auto opacity-90" />
                                     </div>
                                     
                                     {/* Achievement Tooltip */}
                                     <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none scale-90 group-hover:scale-100 z-50">
                                       {section.title}
                                       <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                                     </div>
                                  </div>
                                </motion.div>
                                <span className="mt-4 font-black text-gray-600 text-sm max-w-[120px] text-center leading-tight">{section.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-24 mb-12 text-center p-8 bg-gray-50 rounded-[3rem] border-2 border-gray-100">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-md mx-auto mb-4 flex items-center justify-center border-b-4 border-gray-200">
                <Hammer className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-xl font-black text-gray-800 mb-2">في خدمة طلبة العلم</h3>
             <p className="text-gray-500 font-bold mb-4">تم تطوير هذا النظام لخدمة طلبة المدرسة المالكية بلمسة معاصرة</p>
             <div className="py-3 px-6 bg-white inline-block rounded-2xl border-2 border-gray-100 font-black text-gray-700 shadow-sm">
                برمجة وإشراف: م. طيبي أحمد
             </div>
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-4 flex justify-around items-center lg:hidden z-50">
        {[
          { icon: Home, id: 'home' },
          { icon: Trophy, id: 'leaderboard' },
          { icon: BookOpen, id: 'library' },
          { icon: Settings, id: 'settings' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`p-3 rounded-2xl transition-all ${view === item.id ? 'bg-blue-50 text-brand-secondary active:scale-90' : 'text-gray-400'}`}
          >
            <item.icon className="w-7 h-7" />
          </button>
        ))}
      </footer>
    </div>
  );

  const QuizView = () => (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-brand-primary" dir="rtl">
      {/* Header */}
      <div className="p-4 flex items-center gap-6 max-w-4xl mx-auto w-full lg:px-12">
        <button onClick={handleRestart} className="hover:rotate-90 transition-transform duration-300">
           <X className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600" />
        </button>
        <ProgressBar progress={progress} />
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-brand-danger rounded-2xl font-black text-xl shadow-sm border-2 border-red-100">
          <Heart className="w-6 h-6 fill-brand-danger" />
          <span>{lives}</span>
        </div>
      </div>

      {/* Question Area */}
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full lg:px-12">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="space-y-12"
        >
          <div className="flex items-start gap-6">
             <div className="w-16 h-16 bg-brand-primary/10 rounded-3xl flex items-center justify-center shrink-0 border-b-4 border-brand-primary/20">
                <Sparkles className="w-8 h-8 text-brand-primary" />
             </div>
             <div>
               <span className="text-xs font-black text-brand-primary uppercase tracking-widest mb-1 block">سؤال من {activeSection?.title}</span>
               <h2 className="text-3xl font-black text-gray-800 leading-tight">
                 {currentQuestion?.text}
               </h2>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentQuestion?.options.map((option, idx) => {
              let classes = "option-card transition-all cursor-pointer p-6 rounded-3xl border-2 font-black text-xl text-right flex items-center gap-4 active:scale-[0.98] ";
              
              if (selectedOption === idx) {
                classes += "border-brand-secondary bg-blue-50 text-brand-secondary shadow-[0_4px_0_0_rgba(28,176,246,1)] ";
              } else {
                classes += "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-[0_4px_0_0_rgba(229,231,235,1)] ";
              }

              if (isAnswerChecked) {
                if (idx === currentQuestion.correct) {
                  classes = "option-card p-6 rounded-3xl border-2 font-black text-xl text-right flex items-center gap-4 bg-brand-correct/10 border-brand-correct text-brand-correct shadow-[0_4px_0_0_rgba(88,204,2,1)] ";
                } else if (selectedOption === idx) {
                  classes = "option-card p-6 rounded-3xl border-2 font-black text-xl text-right flex items-center gap-4 bg-brand-danger/10 border-brand-danger text-brand-danger shadow-[0_4px_0_0_rgba(234,43,43,1)] ";
                }
              }

              return (
                <motion.div 
                  key={`${currentQuestion.id}_${idx}`}
                  whileHover={!isAnswerChecked ? { y: -2 } : {}}
                  animate={
                    isAnswerChecked && selectedOption === idx && !isCorrect 
                      ? { x: [0, -10, 10, -10, 10, 0] } 
                      : isAnswerChecked && idx === currentQuestion.correct
                      ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className={classes}
                  onClick={() => !isAnswerChecked && setSelectedOption(idx)}
                >
                  <div className={`w-10 h-10 border-2 border-inherit rounded-xl flex items-center justify-center shrink-0`}>
                    {idx + 1}
                  </div>
                  <span>{option}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Footer / Feedback */}
      <div className={`p-8 border-t-4 transition-all duration-500 z-50 ${isAnswerChecked ? (isCorrect ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200') : 'bg-white border-gray-50'}`}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {isAnswerChecked ? (
            <div className="flex items-center gap-6">
               <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ring-8 ring-white ${isCorrect ? 'bg-brand-correct text-white' : 'bg-brand-danger text-white'}`}>
                  {isCorrect ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12" />}
               </div>
               <div>
                  <h3 className={`text-3xl font-black ${isCorrect ? 'text-brand-correct' : 'text-brand-danger'}`}>
                    {isCorrect ? 'رائع، جواب سديد!' : 'لعل المرة القادمة أفضل!'}
                  </h3>
                  <p className="text-gray-700 font-bold max-w-lg mt-1">{currentQuestion?.explanation}</p>
               </div>
            </div>
          ) : (
            <div className="hidden md:block">
               <p className="text-gray-400 font-black text-xl italic uppercase tracking-widest leading-none">واصل التقدم في طلب العلم <span className="text-2xl not-italic">📚</span></p>
            </div>
          )}

          <button 
            disabled={selectedOption === null && !isAnswerChecked}
            className={`w-full md:w-auto px-16 py-5 rounded-2xl font-black text-2xl text-white transition-all transform active:translate-y-1 active:shadow-none shadow-lg ${isAnswerChecked ? (isCorrect ? 'bg-brand-correct shadow-[0_6px_0_0_rgba(75,175,2,1)]' : 'bg-brand-danger shadow-[0_6px_0_0_rgba(185,28,28,1)]') : (selectedOption !== null ? 'bg-brand-primary shadow-[0_6px_0_0_rgba(22,163,74,1)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}`}
            onClick={isAnswerChecked ? handleNextQuestion : handleCheckAnswer}
          >
            {isAnswerChecked ? 'المتابعة' : 'تحقق من صحة الجواب'}
          </button>
        </div>
      </div>
    </div>
  );

  const ResultView = () => {
    const isSuccess = lives > 0;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-sans text-center selection:bg-brand-primary" dir="rtl">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="max-w-xl w-full"
        >
           <div className={`w-64 h-64 mx-auto mb-12 rounded-[4rem] flex items-center justify-center relative ${isSuccess ? 'bg-brand-accent shadow-[0_12px_0_0_rgba(255,200,0,0.5)]' : 'bg-gray-100'}`}>
              {isSuccess ? (
                <Trophy className="w-32 h-32 text-white drop-shadow-2xl" />
              ) : (
                <AlertCircle className="w-32 h-32 text-gray-300" />
              )}
              {isSuccess && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-0 border-8 border-dashed border-white/30 rounded-[4rem]"></motion.div>}
           </div>

           <h2 className="text-5xl font-black text-gray-800 mb-4">{isSuccess ? 'بارك الله فيك!' : 'راجع معلوماتك'}</h2>
           <p className="text-2xl text-gray-500 font-bold mb-12">{isSuccess ? 'لقد أكملت المهمة العلمية بنجاح باهر' : 'طلب العلم يحتاج صبراً ومثابرة، لا تيأس'}</p>

           <div className="grid grid-cols-3 gap-6 mb-16 px-4">
              <div className="bg-orange-50 p-6 rounded-[2rem] border-b-8 border-orange-200">
                 <div className="text-orange-500 font-black text-4xl mb-1">+{isSuccess ? 80 : 10}</div>
                 <div className="text-orange-400 text-xs font-black uppercase">XP العلم</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border-b-8 border-blue-200">
                 <div className="text-brand-secondary font-black text-4xl mb-1">100%</div>
                 <div className="text-blue-400 text-xs font-black uppercase">الدقة</div>
              </div>
              <div className="bg-green-50 p-6 rounded-[2rem] border-b-8 border-green-200">
                 <div className="text-brand-primary font-black text-4xl mb-1">{streak}</div>
                 <div className="text-green-400 text-xs font-black uppercase">اليوم</div>
              </div>
           </div>

           <div className="space-y-4 px-8">
              <button 
                onClick={handleRestart}
                className="w-full py-6 rounded-[2rem] bg-brand-primary text-white font-black text-2xl shadow-[0_8px_0_0_rgba(22,163,74,1)] active:translate-y-2 active:shadow-none transition-all"
              >
                المتابعة إلى المسار
              </button>
              <div className="pt-6">
                <p className="text-sm font-black text-gray-400 italic">ببرمجة وإشراف المهندس طيبي أحمد</p>
              </div>
           </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'home' && <HomeView key="home" />}
        {view === 'quiz' && <QuizView key="quiz" />}
        {view === 'result' && <ResultView key="result" />}
      </AnimatePresence>
    </div>
  );
}
