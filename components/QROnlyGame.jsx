// components/QROnlyGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification from './ToastNotification';

export default function QROnlyGame() {
  // حالة اللعبة
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // حالة الأسئلة
  const [qrTopic, setQrTopic] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  // حالة أخرى
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // تحميل بيانات QR
  useEffect(() => {
    const qr = sampleTopics.find(topic => topic.id === 'qr_game');
    if (qr) {
      setQrTopic(qr);
      setAvailableQuestions(qr.questions);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive]);

  // دوال التحكم بالتوقيت
  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimer(0);
    setTimerActive(false);
  };

  // تحويل الثواني إلى تنسيق mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // اختيار سؤال عشوائي
  const selectRandomQuestion = (difficulty) => {
    if (!qrTopic) return;

    const availableQuestions = qrTopic.questions.filter(q => 
      q.difficulty === difficulty && !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      alert(`لا توجد أسئلة ${difficulty === 'easy' ? 'سهلة' : difficulty === 'medium' ? 'متوسطة' : 'صعبة'} متاحة!`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    setCurrentQuestion(selectedQuestion);
    setShowAnswer(false);
  };

  // عرض الإجابة
  const showQuestionAnswer = () => {
    setShowAnswer(true);
  };

  // إغلاق السؤال
  const closeQuestion = () => {
    if (currentQuestion) {
      setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));
    }
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // إضافة نقاط
  const addPoints = (points) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === currentTurn 
          ? { ...team, score: team.score + points }
          : team
      )
    );
    closeQuestion();
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setUsedQuestions(new Set());
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentTurn('red');
    setShowConfirmReset(false);
    resetTimer();
  };

  // حساب الأسئلة المتاحة لكل مستوى
  const getAvailableCount = (difficulty) => {
    if (!qrTopic) return 0;
    return qrTopic.questions.filter(q => 
      q.difficulty === difficulty && !usedQuestions.has(q.id)
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <ToastNotification />
      
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
              📱 ولا كلمة
            </span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/full-match"
              className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-semibold hover:bg-green-500/30 transition-all duration-300"
            >
              المباراة الكاملة
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* شريط التحكم */}
        <div className="fixed top-20 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-3">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 md:px-8 py-2 md:py-4 rounded-2xl font-bold text-lg md:text-2xl shadow-lg transition-all duration-500 ${
              currentTurn === 'red' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25'
            }`}>
              
              <div className="flex flex-col items-center">
                <span className="text-sm md:text-base opacity-90">دور</span>
                <span>{currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}</span>
              </div>

              <div className="mx-4 md:mx-8 flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-mono font-bold px-3 py-1 rounded-lg bg-black/30 text-white">
                  {formatTime(timer)}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={toggleTimer}
                    className={`px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-bold transition-all duration-300 ${
                      timerActive 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {timerActive ? '⏸️ إيقاف' : '▶️ تشغيل'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-bold bg-slate-600 hover:bg-slate-700 text-white transition-all duration-300"
                  >
                    🔄 إعادة
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="px-2 md:px-3 py-1 bg-green-500 rounded-full text-xs md:text-sm">
                  📱 ولا كلمة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* نقاط الفرق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-8 mt-24">
          <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'red'
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[0].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[0].score}</p>
          </div>
          <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[1].score}</p>
          </div>
        </div>

        {/* شبكة الأسئلة */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* أسئلة سهلة */}
            <button
              onClick={() => selectRandomQuestion('easy')}
              disabled={getAvailableCount('easy') === 0}
              className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                getAvailableCount('easy') > 0
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-green-500/30 hover:scale-105'
                  : 'bg-gray-500/50 cursor-not-allowed opacity-50'
              }`}>
              <div className="text-white">
                <div className="text-2xl md:text-4xl font-bold mb-2">200</div>
                <div className="text-lg font-semibold">سهل</div>
                <div className="text-sm opacity-75 mt-1">
                  متبقي: {getAvailableCount('easy')}
                </div>
              </div>
            </button>

            {/* أسئلة متوسطة */}
            <button
              onClick={() => selectRandomQuestion('medium')}
              disabled={getAvailableCount('medium') === 0}
              className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                getAvailableCount('medium') > 0
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/30 hover:scale-105'
                  : 'bg-gray-500/50 cursor-not-allowed opacity-50'
              }`}>
              <div className="text-white">
                <div className="text-2xl md:text-4xl font-bold mb-2">400</div>
                <div className="text-lg font-semibold">متوسط</div>
                <div className="text-sm opacity-75 mt-1">
                  متبقي: {getAvailableCount('medium')}
                </div>
              </div>
            </button>

            {/* أسئلة صعبة */}
            <button
              onClick={() => selectRandomQuestion('hard')}
              disabled={getAvailableCount('hard') === 0}
              className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                getAvailableCount('hard') > 0
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/30 hover:scale-105'
                  : 'bg-gray-500/50 cursor-not-allowed opacity-50'
              }`}>
              <div className="text-white">
                <div className="text-2xl md:text-4xl font-bold mb-2">600</div>
                <div className="text-lg font-semibold">صعب</div>
                <div className="text-sm opacity-75 mt-1">
                  متبقي: {getAvailableCount('hard')}
                </div>
              </div>
            </button>
          </div>

          {/* معلومات اللعبة */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-center text-green-400 mb-4">📱 كيف تلعب ولا كلمة؟</h3>
            <div className="text-gray-300 text-center">
              <p className="mb-2">1. اختر مستوى السؤال (سهل، متوسط، صعب)</p>
              <p className="mb-2">2. امسح رمز QR المعروض</p>
              <p className="mb-2">3. اكتشف المحتوى واعطِ الإجابة الصحيحة</p>
              <p>4. احصل على النقاط واستكمل اللعب!</p>
            </div>
          </div>

          {/* زر إعادة التعيين */}
          <div className="text-center">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              🔄 إعادة تعيين اللعبة
            </button>
          </div>
        </div>

        {/* نافذة السؤال */}
        {currentQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                
                {/* عنوان السؤال */}
                <div className="text-center mb-6">
                  <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-xl ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-500' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white`}>
                    {currentQuestion.points} نقطة - {currentQuestion.difficulty === 'easy' ? 'سهل' : currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                  </div>
                </div>

                {/* السؤال */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                    {currentQuestion.question}
                  </h2>
                  
                  {/* صورة QR */}
                  {currentQuestion.hasQR && currentQuestion.qrImageUrl && (
                    <div className="mb-6">
                      <div className="bg-white p-4 rounded-2xl inline-block">
                        <img 
                          src={currentQuestion.qrImageUrl} 
                          alt="QR Code"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      <p className="text-gray-400 text-sm mt-2">امسح هذا الرمز لاكتشاف المحتوى</p>
                    </div>
                  )}
                </div>

                {/* الإجابة */}
                {showAnswer && (
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-lg mb-4">
                      <h3 className="text-xl md:text-3xl font-bold text-white">
                        {currentQuestion.answer}
                      </h3>
                    </div>
                    
                    {/* صورة الإجابة */}
                    {currentQuestion.answerImageUrl && (
                      <div className="mb-4">
                        <img 
                          src={currentQuestion.answerImageUrl} 
                          alt="صورة الإجابة"
                          className="max-w-full max-h-64 mx-auto rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => setZoomedImage(currentQuestion.answerImageUrl)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  {!showAnswer ? (
                    <button
                      onClick={showQuestionAnswer}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      👁️ عرض الإجابة
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4">
                      <button
                        onClick={() => addPoints(currentQuestion.points)}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                      >
                        ✅ إجابة صحيحة (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={closeQuestion}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                      >
                        ❌ إجابة خاطئة
                      </button>
                    </div>
                  )}
                </div>

                {/* زر الإغلاق */}
                <div className="text-center mt-6">
                  <button
                    onClick={closeQuestion}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تكبير الصورة */}
        <ImageModal 
          image={zoomedImage} 
          onClose={() => setZoomedImage(null)} 
        />

        {/* نافذة تأكيد إعادة التعيين */}
        <ConfirmModal
          isOpen={showConfirmReset}
          title="إعادة تعيين اللعبة"
          message="هل أنت متأكد من إعادة تعيين جميع النقاط والأسئلة؟"
          onConfirm={resetGame}
          onCancel={() => setShowConfirmReset(false)}
        />
      </div>
    </div>
  );
}