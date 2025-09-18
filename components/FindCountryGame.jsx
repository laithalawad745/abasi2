// components/FindCountryGame.jsx - الكود الكامل مُصحح
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
        score: 0,
        name: player.name
      };
    });
    
    setPlayers(playerList);
    setPlayerProgress(initialProgress);
    setGamePhase('playing');
    generateNewQuestion();
  };

  // توليد سؤال جديد
  const generateNewQuestion = () => {
    const question = getRandomQuestion(usedQuestions);
    if (!question) {
      // انتهت الأسئلة
      endGame();
      return;
    }

    setCurrentQuestion(question);
    setUsedQuestions(prev => [...prev, question.id]);
    
    // إعادة تعيين الخريطة
    setCountries({});
    
    // ✅ بدء التوقيت باستخدام ref
    timerRef.current = 0;
    setTimerActive(true);
    
    showInfoToast(`${players[currentPlayerIndex].name}: ${question.question}`);
  };

  // ✅ التعامل مع الضغط على دولة - مُصحح
  const handleCountryClick = (countryId) => {
    if (!currentQuestion || gamePhase !== 'playing') return;

    // ✅ إيقاف التوقيت
    setTimerActive(false);

    const isCorrect = countryId === currentQuestion.correctCountry;
    
    if (isCorrect) {
      // إجابة صحيحة
      showSuccessToast(`🎉 إجابة صحيحة! +100 نقطة`);
      
      // ✅ تحديث النقاط وعد الأسئلة معاً
      setPlayerProgress(prev => ({
        ...prev,
        [currentPlayerIndex]: {
          ...prev[currentPlayerIndex],
          score: prev[currentPlayerIndex].score + 100,
          questionsAnswered: prev[currentPlayerIndex].questionsAnswered + 1
        }
      }));
      
      // تمييز الدولة الصحيحة باللون الأخضر
      setCountries({
        [countryId]: { owner: -1, troops: 1 } // -1 للون خاص (أخضر)
      });
    } else {
      // إجابة خاطئة
      showErrorToast(`❌ إجابة خاطئة! الإجابة الصحيحة: ${getCountryNameAR(currentQuestion.correctCountry)}`);
      
      // ✅ تحديث عد الأسئلة حتى لو كانت خاطئة (بدون نقاط)
      setPlayerProgress(prev => ({
        ...prev,
        [currentPlayerIndex]: {
          ...prev[currentPlayerIndex],
          questionsAnswered: prev[currentPlayerIndex].questionsAnswered + 1
        }
      }));
      
      // تمييز الدولة الخاطئة باللون الأحمر والصحيحة باللون الأخضر
      setCountries({
        [countryId]: { owner: -2, troops: 1 }, // -2 للون خاطئ (أحمر)
        [currentQuestion.correctCountry]: { owner: -1, troops: 1 } // -1 للون صحيح (أخضر)
      });
    }

    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(() => {
      nextTurn();
    }, 2000);
  };

  // ✅ الانتقال للدور التالي - مُصحح للتناوب
  const nextTurn = () => {
    // ✅ التحقق من حالة playerProgress الحديثة
    // استخدم setTimeout للحصول على أحدث state
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
            return currentProgress; // لا تغير playerProgress
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

  // انهاء اللعبة
  const endGame = () => {
    setTimerActive(false);
    setGamePhase('finished');
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentQuestion(null);
    setUsedQuestions([]);
    setPlayerProgress({});
    setCountries({});
    timerRef.current = 0;
    setTimerActive(false);
  };

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // مكون إعداد اللاعبين
  const PlayerSetup = () => {
    const [tempPlayers, setTempPlayers] = useState([
      { name: '', color: 0 },
      { name: '', color: 1 }
    ]);

    const addPlayer = () => {
      if (tempPlayers.length < 8) {
        setTempPlayers([...tempPlayers, { 
          name: '', 
          color: tempPlayers.length 
        }]);
      }
    };

    const removePlayer = (index) => {
      if (tempPlayers.length > 2) {
        setTempPlayers(tempPlayers.filter((_, i) => i !== index));
      }
    };

    const updatePlayerName = (index, name) => {
      const updated = [...tempPlayers];
      updated[index].name = name;
      setTempPlayers(updated);
    };

    const handleStart = () => {
      const validPlayers = tempPlayers.filter(p => p.name.trim() !== '');
      if (validPlayers.length >= 1) {
        setupPlayers(validPlayers);
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
            إعداد اللاعبين
          </h2>

          <div className="space-y-4 mb-8">
            {tempPlayers.map((player, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white flex-shrink-0"
                  style={{ backgroundColor: playerColors[player.color] }}
                ></div>
                
                <input
                  type="text"
                  placeholder={`اسم اللاعب ${index + 1}`}
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/20 transition-all duration-300"
                  maxLength={20}
                />
                
                {tempPlayers.length > 2 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="flex-shrink-0 w-12 h-12 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            {tempPlayers.length < 8 && (
              <button
                onClick={addPlayer}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl text-white px-6 py-4 hover:bg-white/20 transition-all duration-300 font-bold"
              >
                ➕ إضافة لاعب
              </button>
            )}
            
            <button
              onClick={handleStart}
              disabled={tempPlayers.filter(p => p.name.trim() !== '').length < 1}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
            >
              🚀 بدء اللعبة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // مكون اللعبة الرئيسي
  const GamePlay = () => {
    const currentPlayer = players[currentPlayerIndex];
    const progress = playerProgress[currentPlayerIndex];

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* شريط معلومات اللاعب الحالي */}
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <Link 
                  href="/"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 text-white font-bold transition-all duration-300 hover:scale-105"
                >
                  🏠 القائمة الرئيسية
                </Link>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    المجموع: {Object.values(playerProgress).reduce((sum, p) => sum + p.questionsAnswered, 0)} / {players.length * questionsPerPlayer}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                      style={{ backgroundColor: playerColors[currentPlayer?.color || 0] }}
                    ></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {currentPlayer?.name}
                      </h2>
                      <p className="text-cyan-400">
                        السؤال {progress?.questionsAnswered + 1} من {questionsPerPlayer}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      {progress?.score || 0} نقطة
                    </div>
                    <div className="text-cyan-400">
                      الوقت: {formatTime(timerRef.current)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* السؤال */}
          {currentQuestion && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.hint && (
                    <p className="text-xl text-cyan-400">
                      💡 تلميح: {currentQuestion.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* الخريطة */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <FindCountryWorldMap
                  countries={countries}
                  onCountryClick={handleCountryClick}
                  currentPlayer={currentPlayer}
                  actionType="select"
                />
              </div>
            </div>
          </div>

          {/* ✅ جدول النقاط - المربعات المطلوبة */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                   جدول النقاط
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {players.map((player, index) => {
                    const progress = playerProgress[index];
                    const isActive = index === currentPlayerIndex;
                    
                    return (
                      <div 
                        key={index}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isActive 
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30' 
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white"
                            style={{ backgroundColor: playerColors[player.color] }}
                          ></div>
                          <span className="text-white font-bold">{player.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isActive ? 'text-cyan-300' : 'text-green-400'}`}>
                            {progress?.score || 0} نقطة
                          </div>
                          <div className="text-gray-400 text-sm">
                            {progress?.questionsAnswered || 0}/{questionsPerPlayer} سؤال
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
      </div>
    );
  };

  // مكون شاشة النتائج النهائية
  const GameFinished = () => {
    // ترتيب اللاعبين حسب النقاط
    const sortedPlayers = players
      .map((player, index) => ({
        ...player,
        progress: playerProgress[index]
      }))
      .sort((a, b) => b.progress.score - a.progress.score);

    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <ToastNotification />
        
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto p-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center">
            
            {/* العنوان */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                🏆 انتهت اللعبة!
              </h1>
              <p className="text-xl text-gray-300">تهانينا للفائزين</p>
            </div>

            {/* النتائج النهائية */}
            <div className="space-y-4 mb-8">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    index === 0 
                      ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-500/30' 
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
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
                className="block w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 text-white font-bold text-lg transition-all duration-300 hover:scale-105"
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