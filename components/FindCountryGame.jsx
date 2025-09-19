// components/FindCountryGame.jsx - مُصلح ومُوحد مع حل مشكلة العداد
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getRandomQuestion } from '../app/data/findCountryData';
import FindCountryWorldMap from './FindCountryWorldMap';
import { getCountryNameAR } from '../app/data/findCountryConfig';
import ToastNotification, { showSuccessToast, showErrorToast, showInfoToast } from './ToastNotification';

// Hook للكشف عن الجهاز المحمول
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default function FindCountryGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, finished
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [questionsPerPlayer] = useState(10);
  const [playerProgress, setPlayerProgress] = useState({});
  const [countries, setCountries] = useState({});

  // حالة واجهة الهاتف
  const [mobileView, setMobileView] = useState('map'); // 'map' or 'scores'
  const isMobile = useIsMobile();

  // ✅ حماية ضد النقر المزدوج
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const lastClickRef = useRef(0);

  // Timer
  const timerRef = useRef(0);
  const timerIntervalRef = useRef(null);
  const [timerActive, setTimerActive] = useState(false);

  // ألوان اللاعبين
  const playerColors = [
    '#ff4444', '#4444ff', '#44ff44', '#ffff44',
    '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
  ];

  // Timer Effect
  useEffect(() => {
    if (timerActive && gamePhase === 'playing') {
      timerIntervalRef.current = setInterval(() => {
        timerRef.current += 1;
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive, gamePhase]);

  // ✅ إعداد اللاعبين - مُصلح
  const setupPlayers = (playerList) => {
    const initialProgress = {};
    playerList.forEach((player, index) => {
      initialProgress[index] = {
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0
      };
    });

    setPlayers(playerList);
    setPlayerProgress(initialProgress);
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
    generateNewQuestion();
    setTimerActive(true);
  };

  // توليد سؤال جديد
  const generateNewQuestion = () => {
    const question = getRandomQuestion(usedQuestions);
    if (!question) {
      endGame();
      return;
    }

    setCurrentQuestion(question);
    setUsedQuestions(prev => [...prev, question.id]);
    setCountries({}); // ✅ إعادة تعيين حماية النقر المزدوج للسؤال الجديد
    setIsProcessingClick(false);
  };

  // ✅ دالة لحساب العداد الصحيح في الوقت الفعلي
  const getCurrentPlayerQuestionCount = (playerIndex) => {
    const progress = playerProgress[playerIndex];
    if (!progress) return 0;
    
    // ✅ إرجاع العداد الحقيقي بدون أي إضافات
    return progress.questionsAnswered || 0;
  };

  // ✅ التعامل مع النقر على الدولة - حل نهائي لمشكلة العداد المزدوج
  const handleCountryClick = (countryId) => {
    const now = Date.now();
    console.log(`🎯 نقر على الدولة: ${countryId} في ${now}`);

    // ✅ حماية ضد النقر المزدوج - فترة 500ms
    if (isProcessingClick || (now - lastClickRef.current) < 500) {
      console.log('🛑 تم تجاهل النقر المزدوج');
      return;
    }

    if (!currentQuestion) {
      console.log('⚠️ لا يوجد سؤال حالي');
      return;
    }

    console.log(`✅ معالجة النقر - السؤال: ${currentQuestion.question}`);

    // ✅ تشغيل الحماية فوراً
    setIsProcessingClick(true);
    lastClickRef.current = now;

    const isCorrect = countryId === currentQuestion.correctCountry;
    console.log(`📊 النتيجة: ${isCorrect ? 'صحيحة' : 'خاطئة'}`);

    // ✅ تحديث واحد فقط للعداد - بدون setTimeout
    setPlayerProgress(prev => {
      const newProgress = { ...prev };
      const currentPlayerData = newProgress[currentPlayerIndex];
      
      if (currentPlayerData) {
        // ✅ تحديث مباشر بدون تأخير
        const newQuestionsCount = currentPlayerData.questionsAnswered + 1;
        const newScore = currentPlayerData.score + (isCorrect ? 100 : 0);
        
        console.log(`📈 تحديث مباشر للاعب: الأسئلة ${currentPlayerData.questionsAnswered} → ${newQuestionsCount}, النقاط ${currentPlayerData.score} → ${newScore}`);
        
        newProgress[currentPlayerIndex] = {
          ...currentPlayerData,
          questionsAnswered: newQuestionsCount,
          correctAnswers: currentPlayerData.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: currentPlayerData.wrongAnswers + (isCorrect ? 0 : 1),
          score: newScore
        };
      }
      
      return newProgress;
    });

    // تلوين الدولة
    setCountries({
      [countryId]: {
        owner: isCorrect ? -1 : -2
      }
    });

    // إظهار رسالة النتيجة
    if (isCorrect) {
      showSuccessToast('إجابة صحيحة! 🎉');
    } else {
      const correctCountryName = getCountryNameAR(currentQuestion.correctCountry);
      showErrorToast(`إجابة خاطئة! الإجابة الصحيحة: ${correctCountryName}`);
    }

    // ✅ الانتقال للسؤال التالي بعد تأخير قصير فقط
    setTimeout(() => {
      console.log('⏭️ الانتقال للسؤال التالي');
      nextTurn();
    }, 2000);
  };

  // الانتقال للدور التالي
  const nextTurn = () => {
    // ✅ إلغاء الحماية هنا
    setIsProcessingClick(false);

    // البحث عن اللاعب التالي
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;

    while (attempts < players.length) {
      const nextPlayerProgress = playerProgress[nextIndex];
      if (nextPlayerProgress && nextPlayerProgress.questionsAnswered < questionsPerPlayer) {
        setCurrentPlayerIndex(nextIndex);
        generateNewQuestion();
        return;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    // جميع اللاعبين أكملوا أسئلتهم
    endGame();
  };

  // إنهاء اللعبة
  const endGame = () => {
    setTimerActive(false);
    setGamePhase('finished');
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentQuestion(null);
    setUsedQuestions([]);
    setPlayerProgress({});
    setCountries({});
    setTimerActive(false);
    setMobileView('map');
    timerRef.current = 0;
    // ✅ إعادة تعيين حماية النقر المزدوج
    setIsProcessingClick(false);
    lastClickRef.current = 0;
  };

  // الحصول على اللاعب الحالي
  const currentPlayer = players[currentPlayerIndex];

  // ✅ إحصائيات اللعبة - مُوحدة للهاتف واللابتوب
  const getGameStats = () => {
    return players
      .map((player, index) => ({
        ...player,
        index,
        color: index,
        progress: playerProgress[index]
      }))
      .sort((a, b) => (b.progress?.score || 0) - (a.progress?.score || 0));
  };

  // حساب إجمالي الأسئلة المجابة
  const getTotalQuestionsAnswered = () => {
    return Object.values(playerProgress).reduce((total, progress) => {
      return total + (progress.questionsAnswered || 0);
    }, 0);
  };

  // ✅ مكون النقاط المُوحد - يعمل للهاتف واللابتوب مع حل العداد
  const UnifiedScoreDisplay = ({ className = "", showRank = true }) => {
    const stats = getGameStats();

    return (
      <div className={`bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-white">جدول النقاط</h3>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stats.map((player, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                currentPlayerIndex === player.index 
                  ? 'bg-cyan-500/20 border border-cyan-400/50' 
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {showRank && (
                  <div className="text-xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                  </div>
                )}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white" 
                  style={{ backgroundColor: playerColors[player.color] }}
                ></div>
                <span className="text-white font-bold text-lg">{player.name}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {player.progress?.score || 0}
                </div>
                <div className="text-sm text-gray-400">
                  {/* ✅ استخدام الدالة المُصلحة */}
                  {getCurrentPlayerQuestionCount(player.index)}/10
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ مكون معلومات اللاعب الحالي - مُوحد مع حل العداد
  const CurrentPlayerInfo = ({ className = "" }) => {
    if (!currentPlayer) return null;

    return (
      <div className={`bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white" 
              style={{ backgroundColor: playerColors[currentPlayer.color] }}
            ></div>
            <span className="text-white font-bold">{currentPlayer.name}</span>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold">
              {playerProgress[currentPlayerIndex]?.score || 0} نقطة
            </div>
            <div className="text-gray-400 text-xs">
              {/* ✅ استخدام الدالة المُصلحة */}
              {getCurrentPlayerQuestionCount(currentPlayerIndex)}/10
            </div>
          </div>
        </div>
      </div>
    );
  };

  // مكون إعداد اللاعبين
  const PlayerSetup = () => {
    const [playerInputs, setPlayerInputs] = useState(['', '']);

    const addPlayer = () => {
      if (playerInputs.length < 8) {
        setPlayerInputs([...playerInputs, '']);
      }
    };

    const removePlayer = (index) => {
      if (playerInputs.length > 2) {
        setPlayerInputs(playerInputs.filter((_, i) => i !== index));
      }
    };

    const updatePlayerName = (index, name) => {
      const newInputs = [...playerInputs];
      newInputs[index] = name;
      setPlayerInputs(newInputs);
    };

    const startGame = () => {
      const validPlayers = playerInputs
        .filter(name => name.trim())
        .map((name, index) => ({
          name: name.trim(),
          color: index
        }));

      if (validPlayers.length < 2) {
        showErrorToast('يجب إدخال على الأقل لاعبين!');
        return;
      }

      setupPlayers(validPlayers);
    };

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                أوجد الدولة
              </span>
            </h1>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* محتوى الإعداد */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                إعداد اللاعبين
              </h2>

              <div className="space-y-4 mb-8">
                {playerInputs.map((name, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder={`اللاعب ${index + 1}`}
                      value={name}
                      onChange={(e) => updatePlayerName(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    />
                    {playerInputs.length > 2 && (
                      <button
                        onClick={() => removePlayer(index)}
                        className="bg-red-500/20 border border-red-400/50 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/30"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                {playerInputs.length < 8 && (
                  <button
                    onClick={addPlayer}
                    className="flex-1 bg-white/10 border border-white/20 py-3 rounded-xl text-white font-bold hover:bg-white/20"
                  >
                    + إضافة لاعب
                  </button>
                )}
                <button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                  🚀 بدء اللعبة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ مكون اللعب المُوحد - يعمل للهاتف واللابتوب
  const UnifiedGamePlay = () => {
    if (isMobile) {
      // عرض الهاتف
      return (
        <div className="h-screen w-screen fixed inset-0 bg-[#0a0a0f] flex flex-col">
          {/* المحتوى الرئيسي */}
          <div className="flex-1 relative">
            {mobileView === 'map' ? (
              // عرض الخريطة
              <div className="h-full w-full">
                <FindCountryWorldMap
                  countries={countries}
                  onCountryClick={handleCountryClick}
                  currentPlayer={currentPlayer}
                  actionType="select"
                />
                
                {/* معلومات فوق الخريطة */}
                <div className="absolute top-4 left-4 right-4 z-10 space-y-3">
                  {/* السؤال الحالي */}
                  {currentQuestion && (
                    <div className="bg-black/80 backdrop-blur-md border border-cyan-400/50 rounded-xl p-3">
                      <div className="text-center">
                        <div className="text-white font-bold text-sm">
                          {currentQuestion.question}
                        </div>
                        <div className="flex justify-center items-center gap-2 text-xs mt-1">
                          <span className="text-green-300">100 نقطة</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* معلومات اللاعب */}
                  <CurrentPlayerInfo />
                </div>
              </div>
            ) : (
              // عرض جدول النقاط
              <div className="h-full p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      جدول النقاط
                    </h2>
                    <div className="text-gray-400">
                      الدور: {currentPlayerIndex + 1}/{players.length} • الجولة: {Math.floor(getTotalQuestionsAnswered() / players.length) + 1}
                    </div>
                  </div>

                  <UnifiedScoreDisplay showRank={true} />

                  {/* إحصائيات إضافية */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-white mb-3">
                      إحصائيات اللعبة
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {getTotalQuestionsAnswered()}
                        </div>
                        <div className="text-gray-400">أسئلة مُجابة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                          {(players.length * questionsPerPlayer) - getTotalQuestionsAnswered()}
                        </div>
                        <div className="text-gray-400">أسئلة متبقية</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* شريط سفلي للتنقل */}
          <div className="flex-shrink-0 p-3 bg-black/80 backdrop-blur-md border-t border-white/20">
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setMobileView('map')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                  mobileView === 'map'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                🗺️ الخريطة
              </button>
              <button
                onClick={() => setMobileView('scores')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                  mobileView === 'scores'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                📊 النقاط
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 py-3 px-4 rounded-xl text-red-300 font-bold hover:bg-red-500/30 transition-all duration-300"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // عرض اللابتوب
      return (
        <div className="h-screen w-screen fixed inset-0 bg-[#0a0a0f] overflow-hidden">
          {/* الخريطة كاملة الشاشة */}
          <div className="absolute inset-0 z-0">
            <FindCountryWorldMap
              countries={countries}
              onCountryClick={handleCountryClick}
              currentPlayer={currentPlayer}
              actionType="select"
            />
          </div>

          {/* العناصر فوق الخريطة */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* شريط علوي */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
              <div className="flex justify-center items-center">
                {/* السؤال الحالي */}
                {currentQuestion && (
                  <div className="flex-1 max-w-2xl mx-4">
                    <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md border-2 border-cyan-400/50 rounded-xl p-4 text-center shadow-xl">
                      <div className="text-white font-bold text-xl mb-2">
                        {currentQuestion.question}
                      </div>
                      <div className="flex justify-center items-center gap-4 text-sm">
                        <span className="text-green-400 font-semibold">100 نقطة</span>
                        <span className="text-purple-400 font-semibold">دور: {currentPlayer?.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* جدول النقاط الجانبي */}
            <div className="absolute top-20 right-4 z-20 pointer-events-auto">
              <UnifiedScoreDisplay className="w-80" showRank={true} />
            </div>

            {/* أزرار التحكم */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
              <div className="flex gap-3">
                <Link 
                  href="/" 
                  className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white font-bold hover:bg-black/70 transition-all"
                >
                  🏠 القائمة
                </Link>
                <button
                  onClick={resetGame}
                  className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-2 text-red-300 font-bold hover:bg-red-500/30 transition-all"
                >
                  🔄 إعادة تشغيل
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // صفحة النتائج النهائية
  const GameFinished = () => {
    const finalStats = getGameStats();
    const winner = finalStats[0];

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl w-full text-center">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8">
                انتهت اللعبة! 🎉
              </h1>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  الفائز: {winner.name}
                </h2>
                <div className="text-2xl text-green-400 font-bold">
                  {winner.progress?.score || 0} نقطة
                </div>
              </div>

              <UnifiedScoreDisplay className="max-w-2xl mx-auto mb-8" showRank={true} />

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🎮 لعبة جديدة
                </button>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🏠 العودة للقائمة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // عرض الكومبوننت المناسب
  if (gamePhase === 'setup') {
    return <PlayerSetup />;
  }

  if (gamePhase === 'finished') {
    return <GameFinished />;
  }

  return (
    <>
      <UnifiedGamePlay />
      <ToastNotification />
    </>
  );
}