// components/GuessWrongGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { guessWrongGameData, getRandomGuessWrongQuestion, shuffleChoices } from '../app/data/guessWrongData';

export default function GuessWrongGame() {
  // حالة اللعبة
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'finished', 'no-more-questions'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState(new Set()); // ✅ استخدام Set مثل باقي الألعاب
  const [isClient, setIsClient] = useState(false);

  // حالة الفرق
  const [teams, setTeams] = useState([
    { 
      id: 'red', 
      name: 'الفريق الأحمر', 
      color: 'red', 
      mistakes: 0, 
      choice: null,
      eliminated: false
    },
    { 
      id: 'blue', 
      name: 'الفريق الأزرق', 
      color: 'blue', 
      mistakes: 0, 
      choice: null,
      eliminated: false
    }
  ]);

  const [currentRound, setCurrentRound] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);

  // Storage key
  const STORAGE_KEY = 'guess-wrong-used-questions';

  // ✅ تحميل الأسئلة المستخدمة من localStorage عند بدء التطبيق
  useEffect(() => {
    setIsClient(true);
    try {
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEY);
      if (savedUsedQuestions) {
        const parsedQuestions = JSON.parse(savedUsedQuestions);
        setUsedQuestions(new Set(parsedQuestions)); // ✅ تحويل Array إلى Set
        console.log('📊 تم تحميل', parsedQuestions.length, 'سؤال مستخدم مسبقاً');
      }
    } catch (error) {
      console.warn('فشل في تحميل الأسئلة المستخدمة:', error);
    }
  }, []);

  // ✅ حفظ الأسئلة المستخدمة في localStorage عند تغييرها
  useEffect(() => {
    if (isClient && usedQuestions.size > 0) {
      try {
        const questionsArray = Array.from(usedQuestions); // ✅ تحويل Set إلى Array للحفظ
        localStorage.setItem(STORAGE_KEY, JSON.stringify(questionsArray));
        console.log('💾 تم حفظ الأسئلة المستخدمة:', questionsArray.length);
      } catch (error) {
        console.warn('فشل في حفظ الأسئلة المستخدمة:', error);
      }
    }
  }, [usedQuestions, isClient]);

  // بدء اللعبة
  const startGame = () => {
    setGameState('playing');
    startNewRound();
  };

  // ✅ بدء جولة جديدة مع معالجة انتهاء الأسئلة
  const startNewRound = () => {
    const usedQuestionsArray = Array.from(usedQuestions);
    
    // 🔍 التحقق من انتهاء جميع الأسئلة
    if (usedQuestions.size >= guessWrongGameData.length) {
      console.log('🎯 تم استخدام جميع الأسئلة المتاحة!');
      setGameState('no-more-questions'); // حالة جديدة لانتهاء الأسئلة
      return;
    }
    
    const question = getRandomGuessWrongQuestion(usedQuestionsArray);
    
    if (!question) {
      // هذا لن يحدث عملياً لأننا نتحقق أولاً، لكن للأمان
      console.log('⚠️ لم يتم العثور على أسئلة متاحة');
      setGameState('no-more-questions');
      return;
    }
    
    setCurrentQuestion(question);
    setUsedQuestions(prev => new Set([...prev, question.id]));
    const shuffled = shuffleChoices(question.choices);
    setShuffledChoices(shuffled);
    
    // إعادة تعيين اختيارات الفرق
    setTeams(prev => prev.map(team => ({ ...team, choice: null })));
    setShowResults(false);
    setRoundWinner(null);
  };

  // اختيار الفريق لشخص
  const makeChoice = (teamId, choice) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, choice } : team
    ));
  };

  // التحقق من النتائج
  const checkResults = () => {
    if (!teams[0].choice || !teams[1].choice) return;

    const redTeam = teams.find(t => t.id === 'red');
    const blueTeam = teams.find(t => t.id === 'blue');
    
    const redChoseCorrect = redTeam.choice === currentQuestion.correctPerson;
    const blueChoseCorrect = blueTeam.choice === currentQuestion.correctPerson;

    let newTeams = [...teams];
    let winner = null;

    if (redChoseCorrect && blueChoseCorrect) {
      // كلاهما اختار الصحيح - كلاهما يحصل على خطأ
      newTeams = newTeams.map(team => ({
        ...team,
        mistakes: team.mistakes + 1
      }));
    } else if (redChoseCorrect) {
      // الأحمر اختار الصحيح - يحصل على خطأ
      newTeams[0].mistakes += 1;
      winner = 'blue';
    } else if (blueChoseCorrect) {
      // الأزرق اختار الصحيح - يحصل على خطأ  
      newTeams[1].mistakes += 1;
      winner = 'red';
    } else {
      // كلاهما اختار خطأ - لا أحد يحصل على خطأ
      winner = 'both';
    }

    // التحقق من انتهاء اللعبة
    const redEliminated = newTeams[0].mistakes >= 3;
    const blueEliminated = newTeams[1].mistakes >= 3;

    if (redEliminated && blueEliminated) {
      setGameWinner('draw');
      setGameState('finished');
    } else if (redEliminated) {
      setGameWinner('blue');
      setGameState('finished');
    } else if (blueEliminated) {
      setGameWinner('red');
      setGameState('finished');
    }

    setTeams(newTeams);
    setRoundWinner(winner);
    setShowResults(true);
  };

  // الجولة التالية
  const nextRound = () => {
    setCurrentRound(prev => prev + 1);
    startNewRound();
  };

  // ✅ إعادة تعيين الأسئلة المستخدمة فقط
  const resetUsedQuestions = () => {
    // 🚫 لا نستخدم هذه الدالة لأنها تمسح localStorage
    console.log('🚫 تم إلغاء مسح الأسئلة المستخدمة للحفاظ على localStorage');
    // 🚫 setUsedQuestions(new Set());
    // 🚫 localStorage.removeItem(STORAGE_KEY);
  };

  // ✅ إعادة تعيين اللعبة (بدون مسح localStorage)
  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(null);
    // 🚫 لا نمسح usedQuestions - نحتفظ بـ localStorage
    // 🚫 setUsedQuestions(new Set()); // ← تمت إزالة هذا السطر
    
    setTeams([
      { 
        id: 'red', 
        name: 'الفريق الأحمر', 
        color: 'red', 
        mistakes: 0, 
        choice: null,
        eliminated: false
      },
      { 
        id: 'blue', 
        name: 'الفريق الأزرق', 
        color: 'blue', 
        mistakes: 0, 
        choice: null,
        eliminated: false
      }
    ]);
    setCurrentRound(1);
    setShowResults(false);
    setRoundWinner(null);
    setGameWinner(null);
    
    // 🚫 لا نمسح localStorage نهائياً
    // 🚫 localStorage.removeItem(STORAGE_KEY); // ← تمت إزالة هذا السطر
    console.log('🔄 تم إعادة تعيين اللعبة مع الحفاظ على الأسئلة المستخدمة');
  };

  // رسم صناديق الأخطاء
  const renderMistakeBoxes = (team) => {
    const boxes = [];
    for (let i = 0; i < 3; i++) {
      boxes.push(
        <div
          key={i}
          className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl
            ${i < team.mistakes 
              ? 'bg-red-500 border-red-400 text-white' 
              : 'bg-white/10 border-white/30 text-gray-400'
            }
          `}
        >
          {i < team.mistakes ? '✕' : ''}
        </div>
      );
    }
    return boxes;
  };

  // 🆕 شاشة انتهاء الأسئلة
  if (gameState === 'no-more-questions') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center max-w-2xl">
            <div className="text-6xl mb-6">📚</div>
            
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
              تم انتهاء الأسئلة!
            </h1>
            
            <div className="text-white text-xl mb-8 space-y-4">
              <p>🎉 <strong>تهانينا!</strong> لقد أجبتم على جميع الأسئلة المتاحة</p>
              <p>📊 <strong>العدد الإجمالي:</strong> {guessWrongGameData.length} سؤال</p>
              <p>✨ <strong>الأسئلة المستخدمة:</strong> {usedQuestions.size} سؤال</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  // العودة للقائمة الرئيسية
                  setGameState('setup');
                  setCurrentQuestion(null);
                  setTeams([
                    { id: 'red', name: 'الفريق الأحمر', color: 'red', mistakes: 0, choice: null, eliminated: false },
                    { id: 'blue', name: 'الفريق الأزرق', color: 'blue', mistakes: 0, choice: null, eliminated: false }
                  ]);
                  setCurrentRound(1);
                  setShowResults(false);
                  setRoundWinner(null);
                  setGameWinner(null);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 mb-4"
              >
                🏠 العودة للقائمة الرئيسية
              </button>
              
              <button
                onClick={() => {
                  // مسح الأسئلة المستخدمة والعودة للعبة
                  setUsedQuestions(new Set());
                  localStorage.removeItem(STORAGE_KEY);
                  setGameState('setup');
                  setCurrentQuestion(null);
                  setTeams([
                    { id: 'red', name: 'الفريق الأحمر', color: 'red', mistakes: 0, choice: null, eliminated: false },
                    { id: 'blue', name: 'الفريق الأزرق', color: 'blue', mistakes: 0, choice: null, eliminated: false }
                  ]);
                  setCurrentRound(1);
                  setShowResults(false);
                  setRoundWinner(null);
                  setGameWinner(null);
                  console.log('🔄 تم مسح جميع الأسئلة المستخدمة');
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                🗑️ مسح الأسئلة والبدء من جديد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة الإعداد
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                خمن الخطأ
              </span>
            </div>
            <Link 
              href="/"
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* محتوى الإعداد */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-8">
              لعبة خمن الخطأ
            </h1>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-6">قواعد اللعبة</h2>
              <div className="text-white text-lg space-y-4 text-right">
                <p>🎯 <strong>الهدف:</strong> تجنب اختيار الشخص الصحيح!</p>
                <p>🖼️ <strong>ستظهر:</strong> صورة شخص + علم دولته + 5 خيارات</p>
                <p>❌ <strong>الخطأ:</strong> كل فريق له 3 صناديق، من يختار الشخص الصحيح يحصل على X</p>
                <p>🏆 <strong>الفوز:</strong> الفريق الذي لا يملأ 3 صناديق يفوز</p>
                <p>⚡ <strong>نهاية اللعبة:</strong> عندما يحصل فريق على 3 أخطاء</p>
              </div>
              
              {/* ✅ معلومات الأسئلة المستخدمة */}
              {isClient && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      📊 الأسئلة المستخدمة: {usedQuestions.size} من {guessWrongGameData.length}
                    </span>
                    {usedQuestions.size > 0 && (
                      <button
                        onClick={resetUsedQuestions}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-bold transition-all duration-300 hover:scale-105"
                      >
                        🗑️ مسح الأسئلة المستخدمة
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              disabled={isClient && usedQuestions.size === guessWrongGameData.length}
              className={`px-12 py-6 rounded-3xl font-bold text-2xl shadow-lg transition-all duration-300 ${
                isClient && usedQuestions.size === guessWrongGameData.length
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:scale-105'
              }`}
            >
              {isClient && usedQuestions.size === guessWrongGameData.length 
                ? '❌ لا توجد أسئلة متاحة' 
                : '🎮 ابدأ اللعبة'
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة انتهاء اللعبة
  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center max-w-2xl">
            <div className="text-6xl mb-6">
              {gameWinner === 'draw' ? '🤝' : gameWinner === 'red' ? '🔴' : '🔵'}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
              {gameWinner === 'draw' 
                ? 'تعادل!'
                : gameWinner === 'red' 
                ? 'فوز الفريق الأحمر!' 
                : 'فوز الفريق الأزرق!'
              }
            </h1>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">نتائج الفرق:</h3>
              <div className="space-y-4">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${team.id === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                      {team.name}
                    </span>
                    <div className="flex gap-2">
                      {renderMistakeBoxes(team)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                🔄 لعبة جديدة
              </button>
              
              <Link href="/" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                🏠 العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // الشاشة الرئيسية للعبة
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl md:text-3xl font-black text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              خمن الخطأ
            </span>
          </div>
          <div className="text-white font-bold text-lg">
            الجولة {currentRound}
          </div>
        </div>

        {/* صناديق أخطاء الفرق */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {teams.map(team => (
            <div key={team.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className={`text-xl font-bold mb-4 ${team.id === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                {team.name}
              </h3>
              <div className="flex gap-2 justify-center">
                {renderMistakeBoxes(team)}
              </div>
              {team.choice && (
                <div className="mt-4 text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white font-bold">اختار: {team.choice}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* معلومات السؤال */}
        {currentQuestion && (
          <div className="max-w-4xl mx-auto">
            {/* معلومات الشخص */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-center">
              <div className="flex justify-center items-center gap-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentQuestion.country}</h2>
                  <p className="text-gray-400">{currentQuestion.hint}</p>
                </div>
              </div>
              
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={currentQuestion.personImage} 
                  alt="الشخص المطلوب" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300/6366F1/FFFFFF?text=صورة+الشخص';
                  }}
                />
              </div>
              
              <h3 className="text-3xl font-bold text-white">
                من هو هذا الشخص؟
              </h3>
              <p className="text-orange-400 font-bold mt-2">
                ⚠️ تذكر: تجنب اختيار الشخص الصحيح!
              </p>
            </div>

            {/* الخيارات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* اختيارات الفريق الأحمر */}
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4 text-center">
                  🔴 الفريق الأحمر
                </h3>
                <div className="space-y-3">
                  {shuffledChoices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => makeChoice('red', choice)}
                      disabled={teams.find(t => t.id === 'red').choice !== null}
                      className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300
                        ${teams.find(t => t.id === 'red').choice === choice
                          ? 'bg-red-500 text-white border-2 border-red-400'
                          : 'bg-white/10 text-white hover:bg-white/20 border-2 border-transparent hover:border-red-400/50'
                        }
                        ${teams.find(t => t.id === 'red').choice !== null ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
                      `}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيارات الفريق الأزرق */}
              <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
                  🔵 الفريق الأزرق
                </h3>
                <div className="space-y-3">
                  {shuffledChoices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => makeChoice('blue', choice)}
                      disabled={teams.find(t => t.id === 'blue').choice !== null}
                      className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300
                        ${teams.find(t => t.id === 'blue').choice === choice
                          ? 'bg-blue-500 text-white border-2 border-blue-400'
                          : 'bg-white/10 text-white hover:bg-white/20 border-2 border-transparent hover:border-blue-400/50'
                        }
                        ${teams.find(t => t.id === 'blue').choice !== null ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
                      `}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* زر التحقق من النتائج */}
            {teams[0].choice && teams[1].choice && !showResults && (
              <div className="text-center mb-8">
                <button
                  onClick={checkResults}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🎯 اكشف النتائج
                </button>
              </div>
            )}

            {/* النتائج */}
            {showResults && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                <div className="text-4xl mb-4">
                  {roundWinner === 'both' ? '🤝' : roundWinner === 'red' ? '🔴' : roundWinner === 'blue' ? '🔵' : '⚠️'}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {roundWinner === 'both' 
                    ? 'كلا الفريقين تجنب الاختيار الصحيح!'
                    : roundWinner === 'red'
                    ? 'الفريق الأحمر تجنب الخطأ!'
                    : roundWinner === 'blue'
                    ? 'الفريق الأزرق تجنب الخطأ!'
                    : 'كلا الفريقين اختار الشخص الصحيح!'
                  }
                </h3>

                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-emerald-400 mb-2">الإجابة الصحيحة:</h4>
                  <p className="text-2xl font-bold text-white">{currentQuestion.correctPerson}</p>
                </div>

                {gameState === 'playing' && (
                  <button
                    onClick={nextRound}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    🎮 الجولة التالية
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}