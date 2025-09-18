// components/ChoicesOnlyGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import { ConfirmModal } from './Modals';
import ToastNotification from './ToastNotification';

export default function ChoicesOnlyGame() {
  // حالة اللعبة
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // حالة الاختيارات
  const [currentChoiceQuestion, setCurrentChoiceQuestion] = useState(null);
  const [showChoiceAnswers, setShowChoiceAnswers] = useState(false);
  const [choiceQuestionOrder, setChoiceQuestionOrder] = useState({
    red: [1, 3, 5, 7],
    blue: [2, 4, 6, 8]
  });
  const [usedChoiceQuestions, setUsedChoiceQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [choicesTopic, setChoicesTopic] = useState(null);
  
  // حالة أخرى
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // تحميل بيانات الاختيارات
  useEffect(() => {
    const choices = sampleTopics.find(topic => topic.id === 'choices');
    if (choices) {
      setChoicesTopic(choices);
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

  // اختيار سؤال الاختيارات
  const selectChoiceQuestion = () => {
    if (!choicesTopic) return;

    const currentOrder = choiceQuestionOrder[currentTurn];
    const availableNumbers = currentOrder.filter(num => !usedChoiceQuestions.includes(num));
    
    if (availableNumbers.length === 0) {
      alert('لا توجد أسئلة متاحة لهذا الفريق!');
      return;
    }

    const questionNumber = availableNumbers[0];
    const question = choicesTopic.questions.find(q => q.order === questionNumber);
    
    if (question) {
      setCurrentChoiceQuestion(question);
      setShowChoiceAnswers(false);
      setSelectedAnswers({});
    }
  };

  // عرض إجابات الاختيارات
  const showChoiceQuestionAnswers = () => {
    setShowChoiceAnswers(true);
  };

  // اختيار إجابة
  const selectAnswer = (answer) => {
    if (!currentChoiceQuestion) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [answer.text]: true
    }));
    
    // إضافة النقاط للفريق الحالي
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === currentTurn 
          ? { ...team, score: team.score + answer.points }
          : team
      )
    );
  };

  // إغلاق سؤال الاختيارات
  const closeChoiceQuestion = () => {
    if (currentChoiceQuestion) {
      setUsedChoiceQuestions(prev => [...prev, currentChoiceQuestion.order]);
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
    }
    setCurrentChoiceQuestion(null);
    setShowChoiceAnswers(false);
    setSelectedAnswers({});
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setUsedChoiceQuestions([]);
    setCurrentChoiceQuestion(null);
    setShowChoiceAnswers(false);
    setSelectedAnswers({});
    setCurrentTurn('red');
    setShowConfirmReset(false);
    resetTimer();
  };

  // حساب الأسئلة المتاحة لكل فريق
  const getAvailableQuestionsForTeam = (teamColor) => {
    const teamOrder = choiceQuestionOrder[teamColor];
    return teamOrder.filter(num => !usedChoiceQuestions.includes(num));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <ToastNotification />
      
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              🎯 الاختيارات
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
                <div className={`text-2xl md:text-3xl font-mono font-bold px-3 py-1 rounded-lg ${
                  currentChoiceQuestion 
                    ? 'bg-purple-600/50 text-purple-100'
                    : 'bg-black/30 text-white'
                }`}>
                  {currentChoiceQuestion ? 'اختيارات' : formatTime(timer)}
                </div>
                
                {!currentChoiceQuestion && (
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
                )}
              </div>

              <div className="flex flex-col items-center">
                <span className="px-2 md:px-3 py-1 bg-purple-500 rounded-full text-xs md:text-sm">
                  🎯 الاختيارات
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
            <div className="text-sm opacity-75 mt-2">
              أسئلة متبقية: {getAvailableQuestionsForTeam('red').length}
            </div>
          </div>
          <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[1].score}</p>
            <div className="text-sm opacity-75 mt-2">
              أسئلة متبقية: {getAvailableQuestionsForTeam('blue').length}
            </div>
          </div>
        </div>

        {/* زر اختيار السؤال */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <button
            onClick={selectChoiceQuestion}
            disabled={getAvailableQuestionsForTeam(currentTurn).length === 0}
            className={`px-12 py-8 rounded-3xl font-bold text-2xl transition-all duration-300 ${
              getAvailableQuestionsForTeam(currentTurn).length > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-purple-500/30 hover:scale-105'
                : 'bg-gray-500/50 cursor-not-allowed opacity-50 text-gray-300'
            }`}>
            🎯 اختر سؤال الاختيارات
          </button>
        </div>

        {/* معلومات الأسئلة المتبقية */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-center text-purple-400 mb-4">الأسئلة المتبقية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-red-400 font-bold">الفريق الأحمر</div>
                <div className="text-white text-lg">
                  {getAvailableQuestionsForTeam('red').map(num => `#${num}`).join(', ') || 'لا يوجد'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">الفريق الأزرق</div>
                <div className="text-white text-lg">
                  {getAvailableQuestionsForTeam('blue').map(num => `#${num}`).join(', ') || 'لا يوجد'}
                </div>
              </div>
            </div>
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

        {/* نافذة سؤال الاختيارات */}
        {currentChoiceQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                
                {/* عنوان السؤال */}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 rounded-2xl font-bold text-xl bg-purple-500 text-white">
                    سؤال اختيارات #{currentChoiceQuestion.order}
                  </div>
                </div>

                {/* السؤال */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                    {currentChoiceQuestion.question}
                  </h2>
                </div>

                {/* الإجابات */}
                {showChoiceAnswers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentChoiceQuestion.answers.map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => selectAnswer(answer)}
                        disabled={selectedAnswers[answer.text]}
                        className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                          selectedAnswers[answer.text]
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-105'
                        }`}
                      >
                        <div className="text-lg font-bold mb-2">{answer.text}</div>
                        <div className="text-sm opacity-75">{answer.points} نقطة</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  {!showChoiceAnswers ? (
                    <button
                      onClick={showChoiceQuestionAnswers}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      👁️ عرض الإجابات
                    </button>
                  ) : (
                    <button
                      onClick={closeChoiceQuestion}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      ✅ انتهاء السؤال
                    </button>
                  )}
                </div>

                {/* زر الإغلاق */}
                <div className="text-center mt-6">
                  <button
                    onClick={closeChoiceQuestion}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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