import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, User, Trophy, Star, Lock, Flame, 
  BookOpen, Heart, X, ChevronLeft 
} from 'lucide-react';

// بيانات تجريبية
const BOOKS = [
  { id: '1', name: 'كتاب الطهارة', icon: '💧', color: '#10b981', unlocked: true, sections: 6 },
  { id: '2', name: 'كتاب الصلاة', icon: '🕌', color: '#3b82f6', unlocked: true, sections: 8 },
  { id: '3', name: 'كتاب الزكاة', icon: '💰', color: '#f59e0b', unlocked: false, sections: 5, requiredXp: 500 },
  { id: '4', name: 'كتاب الصيام', icon: '🌙', color: '#8b5cf6', unlocked: false, sections: 4, requiredXp: 1000 },
];

const QUESTIONS = [
  { 
    id: 1, 
    text: "ما هي حقيقة الطهارة عند المالكية؟", 
    options: [
      "رفع المنع المرتب على الأعضاء كلها أو بعضها",
      "غسل جميع الأعضاء بالماء فقط",
      "التطهر من النجاسات الظاهرة فقط"
    ], 
    correct: 0, 
    fawaid: "الطهارة مفتاح الصلاة، وهي شرط لصحتها." 
  },
  { 
    id: 2, 
    text: "كم عدد فرائض الوضوء عند المالكية؟", 
    options: ["أربعة", "ستة", "سبعة"], 
    correct: 2, 
    fawaid: "فرائض الوضوء سبع: النية، الموالاة، الدلك، غسل الوجه، غسل اليدين، مسح الرأس، غسل الرجلين." 
  },
  { 
    id: 3, 
    text: "ما هو نصاب الذهب عند المالكية؟", 
    options: ["عشرون ديناراً", "ثلاثون ديناراً", "أربعون ديناراً"], 
    correct: 0, 
    fawaid: "نصاب الذهب عشرون ديناراً، وتساوي تقريباً 85 جراماً." 
  },
];

export default function App() {
  const [view, setView] = useState<'home' | 'quiz'>('home');
  const [xp, setXp] = useState(1240);
  const [streak, setStreak] = useState(3);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFawaid, setShowFawaid] = useState(false);
  const [progress, setProgress] = useState(0);

  const q = QUESTIONS[currentQuestion % QUESTIONS.length];

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    if (idx === q.correct) {
      setXp(prev => prev + 15);
      setStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
    }
    
    setTimeout(() => setShowFawaid(true), 600);
  };

  const nextQuestion = () => {
    setShowFawaid(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setProgress(((currentQuestion + 2) / 5) * 100);
    
    if (currentQuestion + 1 >= 5) {
      setView('home');
      setCurrentQuestion(0);
      setProgress(0);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // عرض واجهة الاختبار
  if (view === 'quiz') {
    return (
      <div className="min-h-screen bg-white font-['Cairo']">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b z-50 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-orange-700">{streak}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-20 px-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-8">
          <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-black leading-relaxed text-gray-800">
              {q.text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isAnswered && handleAnswer(i)}
                className={`w-full p-5 text-right rounded-2xl border-2 font-bold transition-all ${
                  selectedOption === i 
                    ? i === q.correct 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'bg-red-50 border-red-500 text-red-700'
                    : isAnswered && i === q.correct
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
                disabled={isAnswered}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Fawaid Popup */}
        {showFawaid && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl z-50"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-full">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-lg">💎 فائدة فقهية</h4>
                <p className="text-sm mt-1 leading-relaxed opacity-95">
                  {q.fawaid}
                </p>
              </div>
            </div>
            <button 
              onClick={nextQuestion}
              className="w-full py-4 bg-white text-emerald-700 font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              {currentQuestion + 1 >= 5 ? '🏆 إكمال 🏆' : 'السؤال التالي →'}
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // عرض الواجهة الرئيسية (المسار التعليمي)
  const PathNode = ({ book, index }: { book: typeof BOOKS[0], index: number }) => {
    const isEven = index % 2 === 0;
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex flex-col items-center mb-12 ${isEven ? 'mr-8' : 'ml-8'}`}
      >
        <button
          onClick={() => book.unlocked && setView('quiz')}
          disabled={!book.unlocked}
          className={`
            relative w-24 h-24 rounded-full flex items-center justify-center transition-all 
            bg-white shadow-xl border-b-8
            ${book.unlocked ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}
          `}
          style={{ borderColor: book.color }}
        >
          <span className="text-4xl select-none">{book.icon}</span>
          {!book.unlocked && (
            <Lock className="absolute w-6 h-6 text-gray-400 bg-white rounded-full p-1 -top-1 -right-1" />
          )}
        </button>
        <div className="text-center mt-3">
          <p className="font-bold text-gray-800">{book.name}</p>
          <p className="text-xs text-gray-400">{book.sections} أبواب</p>
          {!book.unlocked && (
            <p className="text-xs text-amber-600 mt-1">يتطلب {book.requiredXp} XP</p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Cairo'] pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b z-40 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-orange-700">{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
            <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
            <span className="font-bold text-blue-700">{xp}</span>
          </div>
        </div>
        <h1 className="text-xl font-black text-emerald-800">تحدي الفقه</h1>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Learning Path */}
      <div className="pt-24 max-w-md mx-auto px-6">
        <div className="relative">
          {/* المسار العمودي */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gray-200 rounded-full -z-10" />
          
          {BOOKS.map((book, idx) => (
            <PathNode key={book.id} book={book} index={idx} />
          ))}

          {/* جائزة النهاية */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center mt-4"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center border-b-8 border-amber-200 animate-bounce">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <span className="mt-2 text-xs font-bold text-amber-700">الجائزة الكبرى</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            <Home className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl text-gray-400 group-hover:bg-gray-100 transition">
            <Trophy className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-gray-400">الإنجازات</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl text-gray-400 group-hover:bg-gray-100 transition">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-gray-400">المكتبة</span>
        </button>
      </nav>
    </div>
  );
}
