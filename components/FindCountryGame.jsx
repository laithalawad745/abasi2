// components/FindCountryGame.jsx - الكود الكامل مُصحح مع خريطة كاملة الشاشة
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getRandomQuestion } from '../app/data/findCountryData';
import FindCountryWorldMap from './FindCountryWorldMap';
import { getCountryNameAR } from '../app/data/findCountryConfig';
import ToastNotification, { showSuccessToast, showErrorToast, showInfoToast } from './ToastNotification';

export default function FindCountryGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, finished
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [questionsPerPlayer] = useState(10); // ثابت - 10 أسئلة لكل لاعب
  const [playerProgress, setPlayerProgress] = useState({}); // تتبع تقدم كل لاعب
  const [countries, setCountries] = useState({}); // للتفاعل مع الخريطة
  
  // ✅ إصلاح التايمر - استخدام useRef لتجنب re-render مستمر
  const timerRef = useRef(0);
  const timerIntervalRef = useRef(null);
  const [timerActive, setTimerActive] = useState(false);

  // ألوان اللاعبين
  const playerColors = [
    '#ff4444', '#4444ff', '#44ff44', '#ffff44',
    '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
  ];

  // ✅ Timer Effect محسن - لا يسبب re-render للخريطة
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
        timerIntervalRef.current = null;
      }
    };
  }, [timerActive, gamePhase]);

  // إعداد اللاعبين
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
    
    // إعادة تعيين ألوان الدول
    setCountries({});
  };

  // التعامل مع النقر على الدولة
  const handleCountryClick = (countryId) => {
    if (!currentQuestion) return;
    
    const isCorrect = countryId === currentQuestion.correctCountry;
    const currentPlayer = players[currentPlayerIndex];
    
    // تحديث لون الدولة
    if (isCorrect) {
      // تمييز الدولة الصحيحة باللون الأخضر
      setCountries({
        [countryId]: { owner: -1, troops: 1 } // -1 للون خاص (أخضر)
      });
    } else {
      // تمييز الدولة الخاطئة باللون الأحمر والصحيحة باللون الأخضر
      setCountries({
        [countryId]: { owner: -2, troops: 1 }, // -2 للون خاطئ (أحمر)
        [currentQuestion.correctCountry]: { owner: -1, troops: 1 } // -1 للون صحيح (أخضر)
      });
    }

    // تحديث نقاط اللاعب
    if (isCorrect) {
      // إجابة صحيحة - إضافة نقاط وتحديث عداد الأسئلة
      setPlayerProgress(prev => ({
        ...prev,
        [currentPlayerIndex]: {
          ...prev[currentPlayerIndex],
          score: prev[currentPlayerIndex].score + 100,
          questionsAnswered: prev[currentPlayerIndex].questionsAnswered + 1
        }
      }));
    } else {
      // إجابة خاطئة - تحديث عداد الأسئلة فقط (بدون نقاط)
      setPlayerProgress(prev => ({
        ...prev,
        [currentPlayerIndex]: {
          ...prev[currentPlayerIndex],
          questionsAnswered: prev[currentPlayerIndex].questionsAnswered + 1
        }
      }));
    }

    // عرض النتيجة
    if (isCorrect) {
      showSuccessToast(`🎉 ${currentPlayer.name} أجاب صحيح! +100 نقطة`);
    } else {
      showErrorToast(`❌ إجابة خاطئة! الإجابة الصحيحة: ${getCountryNameAR(currentQuestion.correctCountry)}`);
    }

    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(() => {
      nextTurn();
    }, 2000);
  };

  // الانتقال للدور التالي
  const nextTurn = () => {
    setTimeout(() => {
      setPlayerProgress(currentProgress => {
        // البحث عن اللاعب التالي الذي لم يكمل أسئلته
        let nextIndex = (currentPlayerIndex + 1) % players.length;
        let attempts = 0;
        
        while (attempts < players.length) {
          const nextPlayerProgress = currentProgress[nextIndex];
          
          // إذا هذا اللاعب لم يكمل أسئلته، استخدمه
          if (nextPlayerProgress && nextPlayerProgress.questionsAnswered < questionsPerPlayer) {
            setCurrentPlayerIndex(nextIndex);
            generateNewQuestion();
            return currentProgress;
          }
          
          nextIndex = (nextIndex + 1) % players.length;
          attempts++;
        }
        
        // جميع اللاعبين أكملوا أسئلتهم
        endGame();
        return currentProgress;
      });
    }, 100);
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
    timerRef.current = 0;
  };

  // الحصول على اللاعب الحالي
  const currentPlayer = players[currentPlayerIndex];

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
        .map((name, index) => ({ name: name.trim() || `لاعب ${index + 1}`, color: index }))
        .filter(player => player.name);
      
      if (validPlayers.length >= 1) {
        setupPlayers(validPlayers);
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            ⚙️ إعداد اللاعبين
          </h2>
          
          <div className="space-y-4 mb-6">
            {playerInputs.map((name, index) => (
              <div key={index} className="flex items-center gap-4">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white"
                  style={{ backgroundColor: playerColors[index] }}
                ></div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`لاعب ${index + 1}`}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
                {playerInputs.length > 2 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-3 rounded-xl transition-all"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            {playerInputs.length < 8 && (
              <button
                onClick={addPlayer}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 px-6 py-3 rounded-xl transition-all font-bold"
              >
                ➕ إضافة لاعب
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
    );
  };

  // مكون اللعب الرئيسي - ✅ الخريطة كاملة الشاشة مثل لعبة الهيمنة
  const GamePlay = () => {
    return (
      <div className="h-screen w-screen fixed inset-0 bg-[#0a0a0f] overflow-hidden">
        {/* الخريطة كاملة الشاشة في الخلفية */}
        <div className="absolute inset-0 z-0">
          <FindCountryWorldMap
            countries={countries}
            onCountryClick={handleCountryClick}
            currentPlayer={currentPlayer}
            actionType="select"
          />
        </div>

        {/* العناصر المطلوبة كـ overlays فوق الخريطة */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* شريط علوي مع المعلومات */}
          <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
            <div className="flex justify-between items-start">
              {/* زر الخروج والقائمة */}
              <div className="flex gap-2">
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

              {/* السؤال الحالي */}
              {currentQuestion && (
                <div className="flex-1 max-w-2xl mx-4">
                  <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {currentQuestion.question}
                    </h2>
                    {currentQuestion.hint && (
                      <p className="text-cyan-400 mt-2">
                        💡 {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات اللاعب الحالي */}
              {currentPlayer && (
                <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white"
                      style={{ backgroundColor: playerColors[currentPlayer.color] }}
                    ></div>
                    <div className="text-right">
                      <div className="text-white font-bold">{currentPlayer.name}</div>
                      <div className="text-green-400 text-sm">
                        {playerProgress[currentPlayerIndex]?.score || 0} نقطة
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* جدول النقاط في الجانب الأيمن */}
          <div className="absolute top-20 right-4 w-64 pointer-events-auto">
            <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3 text-center">
                🏆 جدول النقاط
              </h3>
              <div className="space-y-2">
                {players.map((player, index) => {
                  const progress = playerProgress[index];
                  const isActive = index === currentPlayerIndex;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-2 rounded-lg border transition-all ${
                        isActive 
                          ? 'border-cyan-400 bg-cyan-500/20' 
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border border-white"
                            style={{ backgroundColor: playerColors[player.color] }}
                          ></div>
                          <span className="text-white font-bold text-sm">{player.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">
                            {progress?.score || 0}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {progress?.questionsAnswered || 0}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // مكون انتهاء اللعبة
  const GameFinished = () => {
    // ترتيب اللاعبين حسب النقاط
    const sortedPlayers = players
      .map((player, index) => ({
        ...player,
        progress: playerProgress[index]
      }))
      .sort((a, b) => (b.progress?.score || 0) - (a.progress?.score || 0));

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <ToastNotification />
        
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            {/* العنوان */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  🎉 انتهت اللعبة!
                </span>
              </h1>
              <p className="text-xl text-gray-300">النتائج النهائية لجميع اللاعبين</p>
            </div>

            {/* جدول النتائج النهائية */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🏆 التصنيف النهائي
              </h2>
              
              {sortedPlayers.map((player, index) => (
                <div key={index} className="mb-4">
                  <div className={`p-6 rounded-2xl border-2 ${
                    index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-500/20 to-orange-500/20' :
                    index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-500/20 to-gray-600/20' :
                    index === 2 ? 'border-amber-600 bg-gradient-to-r from-amber-600/20 to-amber-700/20' :
                    'border-white/20 bg-white/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white"
                          style={{ backgroundColor: playerColors[player.color] }}
                        ></div>
                        <span className="text-white font-bold text-lg">{player.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-300' : 'text-green-400'
                        }`}>
                          {player.progress?.score || 0} نقطة
                        </div>
                        <div className="text-gray-400 text-sm">
                          {player.progress?.questionsAnswered || 0}/10 سؤال
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار التحكم */}
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                🔄 لعبة جديدة
              </button>
              
              <Link 
                href="/"
                className="block w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 text-white font-bold text-lg transition-all duration-300 hover:scale-105 text-center"
              >
                🏠 العودة للقائمة
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // عرض المكون المناسب حسب مرحلة اللعبة
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <ToastNotification />
        
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 w-full p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                🌍 أوجد الدولة
              </span>
            </h1>
            <p className="text-xl text-gray-300">اختبر معرفتك الجغرافية واعثر على الدول على الخريطة!</p>
          </div>

          <PlayerSetup />
        </div>
      </div>
    );
  }

  if (gamePhase === 'finished') {
    return <GameFinished />;
  }

  return (
    <>
      <ToastNotification />
      <GamePlay />
    </>
  );
}