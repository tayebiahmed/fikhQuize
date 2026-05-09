import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Trophy, Sparkles, Brain } from 'lucide-react';
import { FIQH_DATABASE, CATEGORIES } from './data';
import type { Book, Section } from './types/fiqh.types';

function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentBooks = FIQH_DATABASE.filter(book => book.categoryId === selectedCategoryId);
  
  const currentQuestions = selectedSection?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestion?.id] !== undefined;
  const selectedAnswer = selectedAnswers[currentQuestion?.id];

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
    
    if (answerIndex === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setSelectedSection(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const getBookIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Droplets: BookOpen,
      Home: BookOpen,
      Heart: BookOpen,
      BookOpen: BookOpen,
      Scale: BookOpen,
      Shield: BookOpen,
      Star: BookOpen,
      Users: BookOpen,
    };
    const IconComponent = icons[iconName] || BookOpen;
    return <IconComponent className="w-6 h-6" />;
  };

  // واجهة اختيار القسم
  if (selectedSection) {
    if (showResults) {
      const totalQuestions = currentQuestions.length;
      const percentage = (score / totalQuestions) * 100;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-bold">نتيجة الاختبار</h2>
                <p className="text-emerald-100 mt-2">{selectedSection.title}</p>
              </div>
              
              <div className="p-8 text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-4">
                  {score} / {totalQuestions}
                </div>
                <div className="text-xl text-gray-600 mb-6">
                  {percentage >= 80 ? '🌟 ممتاز! 🌟' : percentage >= 60 ? '👍 جيد جداً' : '📚 تحتاج إلى مراجعة'}
                </div>
                
                <div className="bg-gray-100 rounded-full h-4 mb-8">
                  <div 
                    className="bg-emerald-500 rounded-full h-4 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                  >
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={handleBackToSections}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    اختيار قسم آخر
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSections}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="text-sm text-emerald-600 font-medium">{selectedBook?.title}</div>
                <div className="text-lg font-bold text-gray-800">{selectedSection.title}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              السؤال {currentQuestionIndex + 1} من {currentQuestions.length}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <Brain className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.text}
              </h3>
            </div>
            
            <div className="space-y-3">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = currentQuestion.correctIndex === idx;
                let buttonClass = "w-full text-right p-4 rounded-xl border-2 transition-all";
                
                if (isSelected) {
                  buttonClass += isCorrect 
                    ? " bg-green-50 border-green-500 text-green-700" 
                    : " bg-red-50 border-red-500 text-red-700";
                } else if (isAnswered && isCorrect) {
                  buttonClass += " bg-green-50 border-green-300 text-green-700";
                } else {
                  buttonClass += " border-gray-200 hover:border-emerald-300 hover:bg-emerald-50";
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={buttonClass}
                    disabled={isAnswered}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}. </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          
          {isAnswered && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border-r-4 border-blue-500">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-800 mb-1">📖 الفائدة الفقهية:</div>
                  <p className="text-blue-700 text-sm leading-relaxed">{currentQuestion?.explanation}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all"
            >
              {currentQuestionIndex + 1 === currentQuestions.length ? 'إنهاء' : 'التالي'}
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // واجهة اختيار الكتاب
  if (selectedBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToBooks}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
              العودة للكتب
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedBook.title}</h1>
              <p className="text-gray-500 mt-1">اختر القسم الذي تريد اختبار نفسك فيه</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {selectedBook.sections.map((section, idx) => {
              const sectionColors = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500',
                'from-green-500 to-emerald-500',
              ];
              const colorIndex = idx % sectionColors.length;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 group text-right"
                >
                  <div className={`bg-gradient-to-r ${sectionColors[colorIndex]} p-4 text-white`}>
                    <div className="flex justify-between items-center">
                      <BookOpen className="w-8 h-8 opacity-80" />
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {section.questions.length} سؤال
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{section.title}</h3>
                    <p className="text-gray-500 text-sm">
                      اختبر معلوماتك في {section.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // الواجهة الرئيسية
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span className="text-emerald-800 font-medium">بنك الأسئلة الفقهية</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 اختبر معرفتك الفقهية</h1>
          <p className="text-gray-600 text-lg">اختر الفئة ثم الكتاب الذي تريد الاختبار فيه</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(category => {
            const isActive = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-700 hover:bg-emerald-50 hover:scale-105'
                }`}
              >
                <span className="ml-2">{category.icon}</span>
                {category.name}
              </button>
            );
          })}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBooks.map((book) => (
            <button
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 group text-right"
            >
              <div className={`${book.color} p-4 text-white`}>
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getBookIcon(book.icon)}
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {book.badge}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                <p className="text-gray-500 text-sm">
                  {book.sections.length} أقسام
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
