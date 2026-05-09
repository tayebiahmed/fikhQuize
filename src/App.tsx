/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, User, Trophy, Award, Lock, Heart, 
  Flame, ChevronLeft, Info, BookOpen, X, Sparkles,
  Settings, ChevronRight, Share2, Medal, Play,
  CheckCircle2, Shuffle, Search, Swords, Users, Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  limit 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Encouraging Phrases
const SUCCESS_PHRASES = [
  "فتح الله عليك",
  "زادك الله علماً",
  "أصبت، بارك الله فيك",
  "ممتاز، ثبّت الله علمك",
  "أحسنت يا طالب العلم، نفع الله بك",
  "أبدعت، فقهك الله في الدين",
  "ما شاء الله، إجابة مسددة",
  "بارك الله في فهمك وزادك نوراً"
];

const WRONG_PHRASES = [
  "حاول مجدداً، فالعلم بالتعلم",
  "لعل المرة القادمة تكون أفضل",
  "لا بأس، العلم يحتاج لمجاهدة",
  "راجع المسألة بتركيز أكثر",
  "الصبر مفتاح العلم، حاول ثانية"
];

// Database & Types
import { FIQH_DATABASE, CATEGORIES } from './data/fiqhData';
import type { Book, Section, Question } from './types/fiqh.types';
import { getRandomTip } from './data/staticTips';

// Helper: Shuffle Array
const shuffleArray = <T,>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [gameMode, setGameMode] = useState<'challenge' | 'casual' | 'group' | null>(null);
  const [challengeSubType, setChallengeSubType] = useState<'single' | 'group' | null>(null);

  // Navigation & UI State
  const [view, setView] = useState<'home' | 'quiz' | 'profile' | 'leaderboard' | 'group_challenge'>('home');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (!activeChallengeId) {
      setRoomParticipants([]);
      return;
    }
    const participantsRef = collection(db, 'challenges', activeChallengeId, 'participants');
    const q = query(participantsRef, orderBy('score', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoomParticipants(parts);
    });
    return () => unsubscribe();
  }, [activeChallengeId]);
  const [showBooksPanel, setShowBooksPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Progress (Persist in real app)
  const [xp, setXp] = useState(1240);
  const [streak, setStreak] = useState(3);
  const [lives, setLives] = useState(3);
  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>(['book_01', 'book_02']);

  // Quiz State
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pendingOption, setPendingOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFawaid, setShowFawaid] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [currentEncouragement, setCurrentEncouragement] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  // Celebration Particles Component
  const CelebrationParticles = () => {
    const particles = [...Array(30)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 4,
      type: i % 2 === 0 ? 'rose' : 'bubble'
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-[160] overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: "110%", x: `${p.x}%`, opacity: 1, rotate: 0 }}
            animate={{ 
              y: "-10%", 
              x: `${p.x + (Math.random() * 20 - 10)}%`,
              opacity: 0,
              rotate: 360
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              ease: "easeOut",
              repeat: Infinity 
            }}
            className="absolute"
          >
            {p.type === 'rose' ? (
              <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.4))' }}>🌹</span>
            ) : (
              <div 
                className="w-4 h-4 rounded-full border border-white/40 bg-white/10 backdrop-blur-[1px]"
                style={{ width: p.size, height: p.size }}
              />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // Splash Timer Transition
  useEffect(() => {
    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Ensure user doc exists
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then((snap) => {
          if (!snap.exists()) {
            setDoc(userRef, {
              displayName: `طالب علم ${user.uid.slice(0, 4)}`,
              xp: 0,
              level: 1,
              updatedAt: serverTimestamp()
            });
          }
        });
      } else {
        signInAnonymously(auth);
      }
    });

    // Play startup sound
    const startupSfx = 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3'; // Grand Cinematic
    const audio = new Audio(startupSfx);
    audio.volume = 0.5;
    audio.play().catch(() => console.log('Audio playback requires interaction'));

    const timer = setTimeout(() => {
      setShowSplash(false);
      setShowModeSelection(true);
    }, 7000); // 7 seconds as requested
    return () => {
      clearTimeout(timer);
      unsubscribe();
      // Smoothly fade out audio
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.pause();
          clearInterval(fadeOut);
        }
      }, 100);
    };
  }, []);

  const playClickSound = () => {
    const tickSfx = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // Selection tick
    const audio = new Audio(tickSfx);
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  const selectMode = (mode: 'challenge' | 'casual' | 'group') => {
    playClickSound();
    setGameMode(mode);
    setShowModeSelection(false);
    if (mode === 'group') setView('home');
  };

  const selectChallengeType = (type: 'single' | 'group') => {
    setChallengeSubType(type);
    if (type === 'group') {
      setGameMode('group');
      setView('home');
    }
    setShowModeSelection(false);
  };

  // --- Handlers ---

  const startQuiz = (section: Section, book: Book) => {
    if (section.questions.length === 0) return;
    setQuestions(shuffleArray(section.questions));
    setActiveBook(book);
    setActiveSection(section);
    setCurrentIdx(0);
    setSelectedOption(null);
    setPendingOption(null);
    setIsAnswered(false);
    setShowFawaid(false);
    setQuizComplete(false);
    setLives(3);

    if (activeChallengeId && currentUser) {
      const participantRef = doc(db, 'challenges', activeChallengeId, 'participants', currentUser.uid);
      setDoc(participantRef, {
        displayName: currentUser.displayName || `طالب ${currentUser.uid.slice(0,4)}`,
        score: 0,
        avatar: '🌙',
        updatedAt: serverTimestamp()
      });
    }

    setView('quiz');
  };

  const createGroupChallenge = async (section: Section, book: Book) => {
    if (!currentUser) return;
    const challengeRef = await addDoc(collection(db, 'challenges'), {
      title: section.title,
      sectionId: section.id,
      bookId: book.id,
      creatorId: currentUser.uid,
      status: 'open',
      createdAt: serverTimestamp()
    });
    setActiveChallengeId(challengeRef.id);
    startQuiz(section, book);
  };

  const joinGroupChallenge = async (challengeId: string) => {
    const docRef = doc(db, 'challenges', challengeId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const book = FIQH_DATABASE.find(b => b.id === data.bookId);
      const section = book?.sections.find(s => s.id === data.sectionId);
      if (section && book) {
        setActiveChallengeId(challengeId);
        startQuiz(section, book);
      }
    }
  };

  const playFeedbackSound = (isCorrect: boolean) => {
    // Standard UI sound effects
    const correctSfx = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'; // Chime
    const wrongSfx = 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3'; // Buzzer
    const audio = new Audio(isCorrect ? correctSfx : wrongSfx);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const handleSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setPendingOption(optionIdx);
    playClickSound();
  };

  const confirmAnswer = () => {
    if (pendingOption === null || isAnswered) return;
    
    setSelectedOption(pendingOption);
    setIsAnswered(true);
    
    const correct = pendingOption === questions[currentIdx].correct;
    playFeedbackSound(correct);
    
    if (correct) {
      const addedXp = questions[currentIdx].xp || 10;
      setXp(p => p + addedXp);
      const encouragement = SUCCESS_PHRASES[Math.floor(Math.random() * SUCCESS_PHRASES.length)];
      setCurrentEncouragement(encouragement);
      
      // Update score in Firebase if in group mode
      if (activeChallengeId && currentUser) {
        const participantRef = doc(db, 'challenges', activeChallengeId, 'participants', currentUser.uid);
        updateDoc(participantRef, {
          score: (currentIdx + 1) * 10,
          updatedAt: serverTimestamp()
        });
      }
    } else {
      setLives(p => Math.max(0, p - 1));
      setCurrentEncouragement(WRONG_PHRASES[Math.floor(Math.random() * WRONG_PHRASES.length)]);
    }
    
    setTimeout(() => {
        const whooshUrl = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
        new Audio(whooshUrl).play().catch(() => {});
        setShowFawaid(true);
    }, 600);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length && lives > 0) {
      setCurrentIdx(p => p + 1);
      setSelectedOption(null);
      setPendingOption(null);
      setIsAnswered(false);
      setShowFawaid(false);
    } else {
      setQuizComplete(true);
      if (lives > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 8000);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ميدان الفقهاء',
      text: 'انضم إلي في رحلة العلم بمذهب المالكية في تطبيق ميدان الفقهاء!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط لمشاركته مع الآخرين');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  // --- Views ---

  const QuizView = () => {
    const q = questions[currentIdx];
    const progress = ((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100;

    if (quizComplete || lives === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen flex flex-col items-center justify-center p-8 bg-emerald-50 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl relative ${lives > 0 ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'}`}
          >
            {lives > 0 ? <Trophy className="w-16 h-16" /> : <X className="w-16 h-16" />}
            {lives > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-amber-500 rounded-[2.5rem]"
              />
            )}
          </motion.div>

          <h2 className="text-5xl font-black text-emerald-900 mb-4" style={{ fontFamily: '"Amiri", serif' }}>
            {lives > 0 ? 'فتح الله عليك وزادك علماً!' : 'حاول مرة أخرى'}
          </h2>
          
          <p className="text-emerald-800/70 mb-10 arabic-text leading-relaxed font-bold text-xl max-w-md">
            {lives > 0 
              ? `لقد أتممت "${activeSection?.title}" بإتقان تام. استمر في رحلتك المباركة لطلب العلم فالعلم نور والجهل ظلام.` 
              : 'لا بأس يا طالب العلم، فالعلم يحتاج إلى صبر ومصابرة. راجع دروسك ثم عُد لتختبر فهمك.'}
          </p>

          <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-12">
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm">
              <span className="block text-slate-400 text-xs font-bold uppercase mb-1">النقاط م</span>
              <span className="text-3xl font-black text-emerald-600">+{lives > 0 ? questions.length * 10 : 0}</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border-2 border-amber-100 shadow-sm">
              <span className="block text-slate-400 text-xs font-bold uppercase mb-1">المكافأة</span>
              <span className="text-3xl font-black text-amber-600">💎 {lives > 0 ? 5 : 0}</span>
            </div>
          </div>

          <button 
            onClick={() => setView('home')}
            className="w-full max-w-xs py-6 bg-emerald-600 text-white font-black text-2xl rounded-3xl shadow-xl shadow-emerald-200 active:scale-95 transition-all duo-button border-emerald-800"
            style={{ borderBottomWidth: '10px' }}
          >
            {lives > 0 ? 'دخول الباب التالي' : 'العودة للمراجعة'}
          </button>
        </motion.div>
      );
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, scale: 0.9, y: 20 },
      show: { opacity: 1, scale: 1, y: 0 }
    };

    const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د'];

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Professional Quiz Header */}
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 px-6 py-4 border-b border-slate-100">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-6">
            <button 
              onClick={() => setView('home')} 
              className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeSection?.title}</span>
                <span className="text-[10px] font-black text-emerald-600">{Math.round(progress)}% متقدم</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 relative shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 bg-rose-50 px-3 py-2 rounded-2xl border border-rose-100">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={i < lives ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                >
                  <Heart className={`w-5 h-5 transition-all ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Group Leaderboard HUD */}
        {activeChallengeId && roomParticipants.length > 0 && (
          <div className="fixed top-24 left-6 z-[45] hidden sm:flex flex-col gap-2">
            {roomParticipants.map((p, idx) => (
              <motion.div 
                key={p.id} 
                layout
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border bg-white shadow-sm transition-all ${p.id === currentUser?.uid ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100'}`}
              >
                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </div>
                <span className="text-[10px] font-black text-slate-700 max-w-[60px] truncate">{p.displayName}</span>
                <span className="text-[10px] font-black text-blue-600">{p.score}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="pt-28 pb-40 px-6 max-w-xl mx-auto">
          {/* Professional Question Card - Tighter and more centered */}
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-8 relative flex justify-center"
          >
            {/* Ambient Shadow Effect */}
            <div className="absolute inset-x-12 -bottom-2 h-6 bg-emerald-600/5 blur-xl rounded-full" />
            
            <div className="bg-white px-6 py-5 sm:px-8 sm:py-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-emerald-50/60 relative overflow-hidden group w-full">
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 -mr-8 -mt-8 rounded-full" />
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <span className="text-emerald-600/40 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                    مسألة {currentIdx + 1} من {questions.length}
                  </span>
                  <div className="mx-2 w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-amber-600 font-black text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    المتبقي: {questions.length - (currentIdx + 1)}
                  </span>
                </div>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${selectedOption === q.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                  >
                    {selectedOption === q.correct ? 'صواب' : 'خطأ'}
                  </motion.div>
                )}
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed arabic-text text-right relative z-10" style={{ fontFamily: '"Amiri", serif' }}>
                {q.text}
              </h2>
            </div>
          </motion.div>

          {/* Options Grid - Refined spacing */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-3.5"
          >
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selectedOption;
              const isPending = i === pendingOption;
              
              let style = "bg-white border-slate-100 text-slate-700 hover:border-emerald-100 hover:bg-emerald-50/20";
              let shadowColor = "#f1f5f9";
              
              if (isAnswered) {
                if (isCorrect) {
                  style = "bg-emerald-50 border-emerald-500 text-emerald-900";
                  shadowColor = "#10b981";
                } else if (isSelected) {
                  style = "bg-rose-50 border-rose-500 text-rose-900";
                  shadowColor = "#f43f5e";
                } else {
                  style = "bg-slate-50 border-slate-100 text-slate-300 opacity-40 grayscale";
                  shadowColor = "#f8fafc";
                }
              } else if (isPending) {
                style = "bg-emerald-50/80 border-emerald-500 text-emerald-900";
                shadowColor = "#10b981";
              }

              return (
                <motion.button
                  key={i}
                  variants={itemVariants}
                  disabled={isAnswered}
                  onClick={() => handleSelect(i)}
                  className={`w-full group p-4 text-right rounded-[1.75rem] border-2 transition-all font-bold trio-button relative overflow-hidden ${style}`}
                  style={{ 
                    borderBottomWidth: '6px',
                    borderColor: (isAnswered && (isSelected || isCorrect)) || isPending ? shadowColor : undefined,
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${isAnswered ? (isCorrect ? 'bg-emerald-600 text-white' : isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400') : (isPending ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white')}`}>
                        {ARABIC_LETTERS[i]}
                      </div>
                      <span className="arabic-text text-lg sm:text-xl">{opt}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Confirm Selection Button - Sleeker for Mobile */}
          <AnimatePresence>
            {pendingOption !== null && !isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-0 right-0 px-8 z-40 pointer-events-none"
              >
                <div className="max-w-md mx-auto flex justify-center pointer-events-auto">
                  <button 
                    onClick={confirmAnswer}
                    className="w-full py-4 bg-emerald-600 text-white font-black text-xl rounded-[2rem] shadow-[0_15px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all trio-button border-emerald-800 flex items-center justify-center gap-3"
                    style={{ borderBottomWidth: '8px' }}
                  >
                    <span>تأكيد الإجابة</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar / Bottom Sheet */}
        <AnimatePresence>
          {showFawaid && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 p-8 pt-10 z-[60] rounded-t-[3.5rem] shadow-[0_-30px_60px_rgba(0,0,0,0.15)] bg-white border-t-2 border-slate-100"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-200 rounded-full" />
              <div className="max-w-xl mx-auto">
                <div className="flex items-start gap-6 mb-10">
                  <div className={`p-5 rounded-[2rem] shadow-xl ${selectedOption === q.correct ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-rose-600 text-white shadow-rose-200'}`}>
                    {selectedOption === q.correct ? <Medal className="w-10 h-10" /> : <Info className="w-10 h-10" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-3xl mb-3 tracking-tight ${selectedOption === q.correct ? 'text-emerald-700' : 'text-rose-700'}`} style={{ fontFamily: '"Amiri", serif' }}>
                      {currentEncouragement}
                    </h4>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-600 arabic-text leading-relaxed font-bold text-lg">
                        {q.fawaid || getRandomTip()}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleNext}
                  className={`w-full py-6 text-white font-black rounded-3xl shadow-2xl active:scale-95 transition-all text-2xl duo-button ${selectedOption === q.correct ? 'bg-emerald-600 border-emerald-800 shadow-emerald-200' : 'bg-slate-800 border-slate-950 shadow-slate-200'}`}
                  style={{ borderBottomWidth: '10px' }}
                >
                  استمر في التعلم
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const GroupChallengeView = () => {
    const [activeRooms, setActiveRooms] = useState<any[]>([]);

    useEffect(() => {
      const q = query(collection(db, 'challenges'), where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(10));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActiveRooms(rooms);
      });
      return () => unsubscribe();
    }, []);

    return (
      <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-32">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900" style={{ fontFamily: '"Amiri", serif' }}>ميدان المنافسة</h2>
            <div className="px-4 py-1.5 bg-blue-100 rounded-full text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              مباشر الآن
            </div>
          </div>

          {activeRooms.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-bold arabic-text">لا توجد غرف مفتوحة حالياً. أنشئ غرفتك الخاصة وابدأ التحدي!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRooms.map((room) => (
                <div key={room.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      ⚔️
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg sm:text-xl">{room.title}</h4>
                      <p className="text-slate-400 text-xs font-bold">بواسطة: {room.creatorId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => joinGroupChallenge(room.id)}
                    className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm"
                  >
                    انضمام
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 p-8 bg-gradient-to-br from-slate-800 to-black rounded-[3rem] text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4" style={{ fontFamily: '"Amiri", serif' }}>قواعد الميدان ⚔️</h3>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">1</div>
                  <p className="text-slate-400 text-sm font-bold arabic-text">اختر أي باب من الأبواب العلمية لبدء غرفة تحدي جديدة.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">2</div>
                  <p className="text-slate-400 text-sm font-bold arabic-text">شارك اسم الغرفة مع أصدقائك أو انتظر دخول طلاب علم آخرين.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">3</div>
                  <p className="text-slate-400 text-sm font-bold arabic-text">تظهر نتائجك ونتائج منافسيك لحظياً في لوحة الشرف الجانبية.</p>
                </div>
              </div>
              <button 
                onClick={() => setView('home')}
                className="w-full py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
              >
                إنشاء غرفة تحدي
              </button>
            </div>
            <Users className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </div>
        </div>
      </div>
    );
  };
  const LeaderboardView = () => (
    <div className="min-h-screen bg-emerald-50 pt-24 px-6 pb-32">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-emerald-900">المتصدرون</h2>
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-1 rounded-full text-blue-600 font-bold text-xs">
            <span>الدوري الذهبي</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white mb-8 shadow-2xl flex items-center justify-between overflow-hidden relative">
          <div className="z-10">
            <span className="text-xs opacity-70 font-bold mb-1 block">ترتيبك في الدوري</span>
            <div className="text-4xl font-black tracking-tighter">المركز #12</div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full border-8 border-white/5"
          />
          <Medal className="w-20 h-20 text-white/30 z-10" />
        </div>

        <div className="space-y-4">
          {[
            { name: 'سليمان بن علي', xp: 5800, rank: 1, img: '🌙', color: 'bg-amber-50 border-amber-200' },
            { name: 'فاطمة الزهراء', xp: 4200, rank: 2, img: '⭐', color: 'bg-slate-50 border-slate-200' },
            { name: 'عبدالله محمود', xp: 3950, rank: 3, img: '🕌', color: 'bg-orange-50 border-orange-200' },
            { name: 'عائشة بنت فهد', xp: 2100, rank: 4, img: '🍃', color: 'bg-white border-emerald-100' },
          ].map((user, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:translate-x-2 ${user.color}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {user.rank}
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-50">{user.img}</div>
              <div className="flex-1">
                <h4 className="font-black text-emerald-900">{user.name}</h4>
                <p className="text-xs text-emerald-600/60 font-bold">{user.xp} نقطة</p>
              </div>
              {i === 0 && <Medal className="w-6 h-6 text-amber-500 fill-amber-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="min-h-screen bg-emerald-50 pt-24 px-6 pb-32">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-emerald-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16" />
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-6 ring-8 ring-emerald-50">
              🕋
            </div>
            <h2 className="text-3xl font-black text-emerald-900 mb-1">باحث في الفقه</h2>
            <p className="text-emerald-600/70 font-bold text-sm mb-4">طالب علم منذ رمضان 1447هـ</p>
            <p className="text-emerald-500 font-extrabold text-xs mb-8 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              بإشراف وبرمجة المهندس: طيبي احمد
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-black text-orange-700">{streak}</div>
                <div className="text-[10px] font-bold text-orange-600/50 uppercase">يوم متتالي</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-black text-blue-700">{xp}</div>
                <div className="text-[10px] font-bold text-blue-600/50 uppercase">نقطة خبرة</div>
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="mt-8 w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3 trio-button border-emerald-800"
              style={{ borderBottomWidth: '8px' }}
            >
              <Share2 className="w-6 h-6" />
              <span>شارك التطبيق مع أحبائك</span>
            </button>
          </div>
        </div>

        <h3 className="text-xl font-black text-emerald-900 mb-6 px-4">أوسمة الشرف</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '📜', label: 'المتطهر' },
            { icon: '⚔️', label: 'المجاهد' },
            { icon: '🌙', label: 'الصائم' },
            { icon: '💰', label: 'المتصدق' },
            { icon: '🛡️', label: 'الحافظ' },
            { icon: '📖', label: 'القارئ' },
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-sm border-2 ${i < 2 ? 'bg-white border-emerald-100' : 'bg-gray-100/50 border-gray-100 grayscale opacity-40'}`}>
                {badge.icon}
              </div>
              <span className={`text-[10px] font-black ${i < 2 ? 'text-emerald-900' : 'text-gray-400'}`}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const HomeView = () => {
    const filteredCategories = CATEGORIES.map(category => {
      const categoryBooks = FIQH_DATABASE.filter(b => b.categoryId === category.id);
      const filteredBooks = categoryBooks.filter(book => 
        book.title.includes(searchQuery) || 
        book.sections.some(section => section.title.includes(searchQuery))
      );
      return { ...category, filteredBooks };
    }).filter(cat => cat.filteredBooks.length > 0);

    return (
      <div className="min-h-screen bg-[#fcfdfc] pb-64 overflow-x-hidden">
        {/* Ambient background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 blur-[100px] rounded-full -ml-32 -mb-32" />
        </div>

        <div className="max-w-xl mx-auto pt-32 px-6 relative z-10">

          {/* Challenge Mode Top Banner */}
          {gameMode === 'challenge' && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-10 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10">
                    👥
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-1" style={{ fontFamily: '"Amiri", serif' }}>تحدي المجموعات</h3>
                    <p className="text-[10px] font-black text-blue-100/60 uppercase tracking-widest">نافس إخوتك في طلب العلم الآن</p>
                  </div>
                </div>
                <button 
                  onClick={() => setView('group_challenge')}
                  className="px-8 py-3 bg-white text-blue-700 font-black rounded-2xl text-xs active:scale-95 transition-all shadow-lg"
                >
                  دخول الميدان
                </button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            </motion.div>
          )}
          
          {/* Enhanced Search Bar */}
          <div className="mb-16 relative">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="ابحث عن مَسألة فقهية أو كتاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-5 pr-14 pl-6 bg-white/60 backdrop-blur-xl border-b-4 border-emerald-100 shadow-xl shadow-emerald-900/[0.03] rounded-3xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-4 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {filteredCategories.length > 0 ? (
            <div className="relative">
              {/* Path connector line */}
              {!searchQuery && (
                <div className="absolute top-20 bottom-0 left-1/2 -translate-x-1/2 w-1.5 border-r-[3px] border-dashed border-emerald-100/60 pointer-events-none" />
              )}

              {filteredCategories.map((category, catIdx) => {
                const colors = [
                  { bg: 'bg-emerald-600', shadow: '#065f46', text: 'text-emerald-900', light: 'bg-emerald-50' },
                  { bg: 'bg-amber-500', shadow: '#92400e', text: 'text-amber-900', light: 'bg-amber-50' },
                  { bg: 'bg-blue-500', shadow: '#1e40af', text: 'text-blue-900', light: 'bg-blue-50' },
                  { bg: 'bg-rose-500', shadow: '#9f1239', text: 'text-rose-900', light: 'bg-rose-50' }
                ];
                const color = colors[catIdx % colors.length];
                
                return (
                  <div key={category.id} className="mb-24 relative">
                    {!searchQuery && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ margin: "-100px" }}
                        className="mb-14 relative z-20 flex justify-center"
                      >
                         <div 
                          className={`px-8 py-4 rounded-full ${color.bg} shadow-2xl relative overflow-hidden group`}
                          style={{ boxShadow: `0 8px 0 0 ${color.shadow}` }}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h3 className="text-xl font-black text-white relative flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            {category.name}
                          </h3>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-20 relative z-10">
                      {category.filteredBooks.map((book, idx) => {
                        const isUnlocked = gameMode === 'casual' || unlockedBookIds.includes(book.id) || (catIdx === 0 && idx === 0);
                        const offsets = [0, 45, 85, 45, 0, -45, -85, -45]; 
                        const xOffset = searchQuery ? 0 : offsets[idx % offsets.length];
                        
                        return (
                          <motion.div 
                            key={book.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="flex flex-col items-center w-full relative"
                            style={{ x: xOffset }}
                          >
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 4 + idx, repeat: Infinity, ease: "easeInOut" }}
                              className="relative"
                            >
                              <button 
                                onClick={() => isUnlocked && setActiveBook(book)}
                                className={`
                                  w-28 h-28 rounded-[3rem] flex items-center justify-center transition-all bg-white trio-button relative group
                                  ${isUnlocked ? 'border-emerald-600 text-emerald-600' : 'bg-slate-50 border-slate-200 grayscale cursor-not-allowed'}
                                `}
                                style={{ 
                                  borderBottomWidth: '10px', 
                                  borderColor: isUnlocked ? '#059669' : '#cbd5e1',
                                  boxShadow: isUnlocked ? '0 10px 0 0 #064e3b' : '0 10px 0 0 #94a3b8' 
                                }}
                              >
                                <span className="text-5xl select-none transition-transform group-hover:scale-110 duration-500">
                                  {book.icon || '📚'}
                                </span>
                                
                                {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-[3rem] backdrop-blur-[2px]">
                                    <Lock className="w-8 h-8 text-slate-400" />
                                  </div>
                                )}

                                {isUnlocked && (
                                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 border-4 border-white rounded-full flex items-center justify-center shadow-md">
                                    <Medal className="w-4 h-4 text-amber-900" />
                                  </div>
                                )}
                              </button>
                            </motion.div>

                            <div className="mt-6 text-center">
                              <span className={`block font-black text-xl mb-1 transition-colors ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                                {book.title}
                              </span>
                              
                              {searchQuery && book.sections.some(s => s.title.includes(searchQuery)) && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="mt-6 w-full max-w-sm grid gap-3 overflow-hidden"
                                >
                                  {book.sections.filter(s => s.title.includes(searchQuery)).map(section => (
                                    <button
                                      key={section.id}
                                      onClick={() => startQuiz(section, book)}
                                      className="group/item flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-right"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-colors group-hover/item:bg-emerald-600 group-hover/item:text-white">
                                          <Play className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                          <span className="block font-bold text-slate-700">{section.title}</span>
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">اضغط للـبدء</span>
                                        </div>
                                      </div>
                                      <ChevronLeft className="w-5 h-5 text-slate-300 group-hover/item:text-emerald-500" />
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-32 text-center"
            >
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border-4 border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">لم نجد أثراً لما تبحث عنه</h3>
              <p className="text-slate-400 font-bold text-lg max-w-xs leading-relaxed">
                جرب البحث بكلمات أخرى أو عُد لتصفح الأبواب الرئيسية في المسار.
              </p>
            </motion.div>
          )}

          {!searchQuery && (
            <div className="flex flex-col items-center py-20 grayscale-0 opacity-100">
               <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center border-b-[10px] border-slate-100 shadow-xl relative">
                  <Lock className="w-8 h-8 text-slate-300" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-[2.5rem]" />
               </div>
               <span className="mt-6 font-black text-slate-400 text-lg">بانتظار مزيد من العلوم..</span>
               <div className="w-1 h-12 bg-gradient-to-b from-slate-200 to-transparent mt-4 rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const SplashView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-[#041a14] flex flex-col items-center justify-center text-center p-6 sm:p-8 overflow-hidden"
    >
      {/* Dynamic Background Elements - Geometric Parallax */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z' fill='%23d4af37' fill-opacity='0.1'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" 
        />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm sm:max-w-none"
      >
        {/* Rub el Hizb (8-pointed star) + Shield Emblem */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 90, 180, 270, 360],
            filter: ["drop-shadow(0 0 10px rgba(212,175,55,0.4))", "drop-shadow(0 0 30px rgba(212,175,55,0.8))", "drop-shadow(0 0 10px rgba(212,175,55,0.4))"]
          }}
          transition={{ 
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-[#d4af37] via-[#f9f295] to-[#b8860b] flex items-center justify-center mb-10 sm:mb-12 relative shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          style={{ 
            clipPath: 'polygon(50% 0%, 65% 15%, 100% 15%, 85% 35%, 85% 65%, 100% 85%, 65% 85%, 50% 100%, 35% 85%, 0% 85%, 15% 65%, 15% 35%, 0% 15%, 35% 15%)' 
          }}
        >
          <div className="absolute inset-4 bg-emerald-950 flex items-center justify-center border-4 border-[#d4af37]/40 shadow-inner" style={{ clipPath: 'inherit' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Library className="w-24 h-24 sm:w-40 sm:h-40 text-[#d4af37] drop-shadow-[0_0_20px_rgba(212,175,55,0.8)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Golden Neon Glow Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            textShadow: [
              "0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37",
              "0 0 10px #d4af37, 0 0 30px #d4af37, 0 0 50px #d4af37",
              "0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37"
            ]
          }}
          transition={{ 
            opacity: { delay: 0.5, duration: 1.5 },
            y: { delay: 0.5, duration: 1.5 },
            textShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-4xl sm:text-7xl md:text-9xl font-black text-white mb-6 tracking-tight px-4 leading-tight"
          style={{ fontFamily: '"Amiri", serif' }}
        >
          تحدي الفقيه المالكي
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="text-[#d4af37] text-lg sm:text-xl md:text-2xl font-bold arabic-text mb-12 sm:mb-20 tracking-[0.2em] sm:tracking-[0.4em] uppercase"
        >
          إرث المذهب .. عبق الحضارة
        </motion.p>

        {/* Footer Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="px-8 sm:px-12 py-4 sm:py-5 bg-black/30 border border-[#d4af37]/10 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-3xl"
        >
          <p className="text-[#d4af37]/40 text-[9px] sm:text-xs font-black uppercase tracking-[0.5em] mb-2 leading-none">برمجة وتطوير</p>
          <h2 className="text-xl sm:text-4xl font-black text-white" style={{ fontFamily: '"Amiri", serif' }}>
            المهندس أحمد طيبي
          </h2>
        </motion.div>
      </motion.div>

      {/* Modern Progress Glimmer */}
      <div className="absolute bottom-12 sm:bottom-16 w-60 sm:w-72 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 7, ease: "linear" }}
          className="w-full h-full bg-gradient-to-r from-emerald-600 via-[#d4af37] to-emerald-600 relative"
        >
          <motion.div 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );

  const ModeSelectionView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      className="fixed inset-0 z-[150] bg-[#061f17] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden"
    >
      {/* Background Tech Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#d4af37] blur-[100px] sm:blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500 blur-[100px] sm:blur-[150px] rounded-full" />
      </div>
      
      <div className="relative z-10 w-full max-w-5xl text-center py-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-8xl font-black text-white mb-4 sm:mb-6 drop-shadow-lg leading-tight" style={{ fontFamily: '"Amiri", serif' }}>
            ميدان <span className="text-[#d4af37]">التحدي</span> والتحصيل
          </h2>
          <div className="w-32 sm:w-48 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto rounded-full" />
        </motion.div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-12 max-w-4xl mx-auto px-4 items-center">
          {/* Challenge Mode Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectMode('challenge')}
            className="group relative w-full h-full p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border-2 bg-white/5 border-[#d4af37]/20 backdrop-blur-3xl hover:border-[#d4af37]/60 hover:bg-white/10 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit]" />
            
            <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-8">
              <div className="w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-br from-[#d4af37]/20 to-[#996515]/20 rounded-2xl flex items-center justify-center border border-[#d4af37]/30 group-hover:scale-110 transition-transform">
                <Swords className="w-8 h-8 sm:w-12 sm:h-12 text-[#d4af37]" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-none" style={{ fontFamily: '"Amiri", serif' }}>وضع التحدي</h3>
                <div className="space-y-1">
                  <p className="text-[#d4af37] text-[9px] sm:text-xs font-black uppercase tracking-[0.2em]">تفتح المراحل تِباعاً</p>
                  <p className="text-[#d4af37]/60 text-[10px] sm:text-sm font-bold arabic-text leading-relaxed px-2 sm:px-4">
                    مسار منهجي يتطلب النجاح في كل مرحلة لفتح ما بعدها، مصمم لضبط أصول المذهب المالكي.
                  </p>
                </div>
              </div>
              <div className="w-full h-[1px] bg-white/10 my-1 sm:my-2" />
              <div className="w-full py-3 sm:py-4 bg-[#d4af37] text-emerald-950 font-black rounded-2xl text-base sm:text-lg shadow-[0_10px_20px_rgba(212,175,55,0.3)] group-hover:bg-white group-hover:text-amber-900 transition-colors">
                دخول الميدان
              </div>
            </div>
          </motion.button>

          {/* Open Mode Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectMode('casual')}
            className="group relative w-full h-full p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border-2 bg-white/5 border-emerald-500/20 backdrop-blur-3xl hover:border-emerald-500/60 hover:bg-white/10 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit]" />
            
            <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-8">
              <div className="w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-none" style={{ fontFamily: '"Amiri", serif' }}>الوضع المفتوح</h3>
                <div className="space-y-1">
                  <p className="text-emerald-400 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em]">تصفح حر مباشـــر</p>
                  <p className="text-emerald-400/60 text-[10px] sm:text-sm font-bold arabic-text leading-relaxed px-2 sm:px-4">
                    جميع الأبواب متاحة للاطلاع والمراجعة في أي وقت بدون قيود أو شروط مسبقة (مناسب للمراجعة).
                  </p>
                </div>
              </div>
              <div className="w-full h-[1px] bg-white/10 my-1 sm:my-2" />
              <div className="w-full py-3 sm:py-4 bg-emerald-600 text-white font-black rounded-2xl text-base sm:text-lg shadow-[0_10px_20px_rgba(16,185,129,0.3)] group-hover:bg-white group-hover:text-emerald-900 transition-colors">
                تعلّم بحرية
              </div>
            </div>
          </motion.button>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-12 sm:mt-16 text-white/60 text-[10px] sm:text-xs font-bold arabic-text tracking-widest px-6"
        >
          تفتح المستويات تباعاً بناءً على تقدمك، أو انضم لتحدي المجموعات المباشر
        </motion.p>
      </div>

      {/* Aesthetic Technical Accent */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-6 sm:bottom-10 flex items-center gap-4 text-white/20 select-none"
      >
        <div className="w-10 sm:w-16 h-[1px] bg-white/20" />
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em]">System Authenticated</span>
        <div className="w-10 sm:w-16 h-[1px] bg-white/20" />
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen font-sans flex flex-row-reverse bg-emerald-50">
      <AnimatePresence>
        {showSplash && <SplashView key="splash" />}
        {showModeSelection && <ModeSelectionView key="mode" />}
        {showCelebration && <CelebrationParticles key="celebration" />}
      </AnimatePresence>

      {/* Real-time Group Leaderboard HUD */}
      {activeChallengeId && roomParticipants.length > 0 && view === 'quiz' && (
        <div className="fixed top-24 left-6 z-[45] hidden sm:flex flex-col gap-3">
          <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center gap-2 border border-white/10 shadow-2xl">
            <Users className="w-3 h-3 text-amber-400" />
            الميدان المباشر
          </div>
          {roomParticipants.sort((a, b) => b.score - a.score).map((p, idx) => (
            <motion.div 
              key={p.id} 
              layout
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl border bg-white shadow-xl min-w-[200px] transition-all ${p.id === currentUser?.uid ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100'}`}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-500">
                  {idx + 1}
                </div>
                {idx === 0 && <Award className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-slate-800 leading-none mb-1 max-w-[80px] truncate">{p.displayName}</p>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((p.score / 500) * 100, 100)}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[12px] font-black text-blue-600 block leading-none">{p.score}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase">نقطة</span>
              </div>
            </motion.div>
          ))}
          
          <button 
            onClick={() => {
              const url = window.location.origin;
              navigator.clipboard.writeText(`انضم إلي في تحدي ميراث! رمز الغرفة: ${activeChallengeId}\nالرابط: ${url}`);
              alert('تم نسخ رابط الدعوة ورمز الغرفة');
            }}
            className="mt-2 flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95"
          >
            <Share2 className="w-3 h-3" />
            دعوة الأصدقاء
          </button>
        </div>
      )}

      {/* Desktop Sidebar (Right side for RTL) */}
      {view !== 'quiz' && (
        <aside className="hidden lg:flex w-24 glass-card border-r-0 border-l border-emerald-100 flex-col items-center py-10 fixed right-0 top-0 bottom-0 z-50">
          <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-200 mb-12">
            <Swords className="text-white w-8 h-8" strokeWidth={2.5} />
          </div>
          <nav className="flex flex-col gap-10">
            <button onClick={() => setView('home')} className={`p-4 rounded-2xl transition-all ${view === 'home' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-emerald-50'}`}>
              <Home className="w-8 h-8" />
            </button>
            <button onClick={() => setView('leaderboard')} className={`p-4 rounded-2xl transition-all ${view === 'leaderboard' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:bg-blue-50'}`}>
              <Trophy className="w-8 h-8" />
            </button>
            <button onClick={() => setView('profile')} className={`p-4 rounded-2xl transition-all ${view === 'profile' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-50'}`}>
              <User className="w-8 h-8" />
            </button>
          </nav>
          <div className="mt-auto">
            <div className="w-14 h-14 bg-emerald-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-2xl">🕌</div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${view !== 'quiz' ? 'lg:mr-24 lg:ml-80' : ''} transition-all duration-300`}>
        {/* Top Header for Mobile/Common */}
        {view !== 'quiz' && (
          <header className={`fixed top-0 left-0 right-0 ${view !== 'quiz' ? 'lg:right-24 ' : ''} glass-card z-40 px-8 py-5 flex justify-between items-center`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-orange-100 shadow-sm">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                <span className="font-black text-lg text-orange-700">{streak}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
                <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500" />
                <span className="font-black text-lg text-blue-700">{xp}</span>
              </div>
              <button 
                onClick={handleShare}
                className="w-12 h-12 bg-white rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors active:scale-95"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight hidden sm:block" style={{ fontFamily: 'Amiri, serif' }}>ميدان فقهاء المالكية</h1>
          </header>
        )}

        <AnimatePresence mode="wait">
          {view === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HomeView /></motion.div>}
          {view === 'quiz' && <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><QuizView /></motion.div>}
          {view === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProfileView /></motion.div>}
          {view === 'leaderboard' && <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LeaderboardView /></motion.div>}
          {view === 'group_challenge' && <motion.div key="gc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GroupChallengeView /></motion.div>}
        </AnimatePresence>
      </div>

      {/* Desktop Competition Sidebar (Left side for RTL) */}
      {view !== 'quiz' && (
        <aside className="hidden xl:flex w-80 glass-card fixed left-0 top-0 bottom-0 z-45 flex-col p-8 gap-8 overflow-y-auto pt-24 border-l-0 border-r border-emerald-100">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <h3 className="text-xl font-black mb-4 relative z-10">تحدي المجموعات</h3>
            
            <div className="space-y-3 relative z-10">
              {/* This would be populated by a limit(1) query in a real app */}
              <div className="flex items-center gap-4 bg-white/20 p-4 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-xl shadow-lg">⚔️</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-white/70">ميدان نشط</p>
                  <p className="text-[10px] font-black">غرف المنافسة المفتوحة</p>
                </div>
                <button 
                  onClick={() => setView('group_challenge')}
                  className="px-4 py-2 bg-white text-blue-700 text-[10px] font-black rounded-xl active:scale-95 transition-transform"
                >
                  استعراض
                </button>
              </div>
            </div>
            
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-emerald-900">الأصدقاء</h3>
              <button className="p-2 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100"><Share2 className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'سليمان علي', level: 12, xp: 2850, img: '🌙' },
                { name: 'عبدالله محمد', level: 8, xp: 1420, img: '📚' },
              ].map((friend, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-emerald-50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-emerald-50 group-hover:scale-110 transition-transform">{friend.img}</div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-900">{friend.name}</p>
                    <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-1.5">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-black mb-1">متجر الفوائد</h4>
                <p className="text-[10px] text-emerald-400 font-bold mb-4">أوسمة نادرة وحزم الأسئلة</p>
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs active:scale-95 transition-all">دخول المتجر</button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl" />
            </div>
          </div>
        </aside>
      )}

      {/* Book Panel Modal */}
      <AnimatePresence>
        {(showBooksPanel || activeBook) && view === 'home' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-950/40 z-[60] backdrop-blur-md flex items-end sm:items-center justify-center"
            onClick={() => { setShowBooksPanel(false); setActiveBook(null); }}
          >
            <motion.div 
              initial={{ y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-[#fafafa] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-10 max-h-[92vh] overflow-y-auto shadow-[0_-20px_80px_rgba(6,78,59,0.2)] relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative Background Pattern Overlay */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                  <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-emerald-900 leading-tight" style={{ fontFamily: '"Amiri", serif' }}>
                      {activeBook ? activeBook.title : 'خزانة مذهب المالكية'}
                    </h2>
                    <p className="text-emerald-700/40 font-bold text-sm sm:text-base">اختر باباً لتشرع في رحلة التعلم</p>
                  </div>
                  <button 
                    onClick={() => { setShowBooksPanel(false); setActiveBook(null); }} 
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-md flex items-center justify-center text-emerald-600 border border-emerald-50 active:scale-95"
                  >
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {(!activeBook ? FIQH_DATABASE : [activeBook]).map(book => (
                    <div key={book.id} className="relative">
                      {/* Main Book Header Card */}
                      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-emerald-50/80 mb-6 group transition-all hover:border-emerald-100">
                        <div className="flex items-center gap-5 sm:gap-7">
                          <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2.2rem] bg-gradient-to-br from-emerald-50 to-white shadow-inner flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-500">
                              {book.icon || '📖'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                          </div>
                          <div>
                            <h3 className="font-black text-2xl sm:text-3xl text-emerald-900 mb-1" style={{ fontFamily: '"Amiri", serif' }}>{book.title}</h3>
                            <div className="flex items-center gap-3">
                              <div className="px-3 py-1 bg-emerald-50 rounded-lg text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                {book.sections?.length || 0} أبواب تعليمية
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {book.sections && book.sections.length > 0 ? (
                        <div className="grid gap-3 sm:gap-4 pl-2 sm:pl-4">
                          {book.sections.map((section, sIdx) => (
                            <button
                              key={section.id}
                              onClick={() => {
                                if (gameMode === 'group') {
                                  createGroupChallenge(section, book);
                                } else {
                                  startQuiz(section, book);
                                }
                              }}
                              className="w-full group/btn relative flex items-center justify-between p-5 bg-white border border-slate-100/60 rounded-[1.8rem] shadow-sm hover:translate-x-1 hover:border-emerald-200 hover:shadow-[0_10px_25px_rgba(6,78,59,0.05)] transition-all text-right"
                            >
                              <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50/50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all group-hover/btn:bg-emerald-600 group-hover/btn:text-white shadow-sm group-hover/btn:shadow-emerald-200">
                                  <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="font-black text-emerald-900 arabic-text text-lg sm:text-xl leading-none mb-1">{section.title}</span>
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">الباب {sIdx + 1}</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover/btn:bg-emerald-50 group-hover/btn:text-emerald-500 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center bg-slate-50/30">
                          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed">
                            المحتوى قيد المراجعة الفقهية المستفيضة<br/>ليوافق الراجح من مذهب الإمام مالك
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {view !== 'quiz' && (
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 backdrop-blur-md border-t p-4 flex justify-around items-center shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40">
          <button onClick={() => setView('home')} className="flex flex-col items-center gap-1">
            <div className={`p-2 px-6 rounded-2xl transition-all ${view === 'home' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <Home className="w-8 h-8" />
            </div>
            <span className={`text-[10px] font-black ${view === 'home' ? 'text-emerald-900' : 'text-slate-400'}`}>الرئيسية</span>
          </button>
          
          <button onClick={() => setView('leaderboard')} className="flex flex-col items-center gap-1">
            <div className={`p-2 px-6 rounded-2xl transition-all ${view === 'leaderboard' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>
              <Trophy className="w-8 h-8" />
            </div>
            <span className={`text-[10px] font-black ${view === 'leaderboard' ? 'text-blue-900' : 'text-slate-400'}`}>المتصدرون</span>
          </button>

          <button onClick={() => setView('profile')} className="flex flex-col items-center gap-1">
            <div className={`p-2 px-6 rounded-2xl transition-all ${view === 'profile' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400'}`}>
              <User className="w-8 h-8" />
            </div>
            <span className={`text-[10px] font-black ${view === 'profile' ? 'text-indigo-900' : 'text-slate-400'}`}>أنا</span>
          </button>
        </nav>
      )}
    </div>
  );
}

