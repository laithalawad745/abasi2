// components/FindCountryGame.jsx - إصلاح زر الحذف على الهاتف
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

  // التعامل مع الضغط على دولة
  const handleCountryClick = (countryId) => {
    if (!currentQuestion || gamePhase !== 'playing') return;

    // ✅ إيقاف التوقيت
    setTimerActive(false);

    const isCorrect = countryId === currentQuestion.correctCountry;
    
    if (isCorrect) {
      // إجابة صحيحة
      showSuccessToast(`🎉 إجابة صحيحة! +100 نقطة`);
      
      // تحديث النقاط
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
      
      // تحديث عدد الأسئلة المجاب عليها
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

  // الانتقال للسؤال التالي
  const nextTurn = () => {
    const currentPlayerProgress = playerProgress[currentPlayerIndex];
    
    // فحص إذا انتهى هذا اللاعب من أسئلته
    if (currentPlayerProgress.questionsAnswered >= questionsPerPlayer) {
      // انتقل للاعب التالي
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        // انتهت اللعبة
        endGame();
        return;
      }
      setCurrentPlayerIndex(nextIndex);
    }
    
    generateNewQuestion();
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
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* المحتوى */}
        <div className="relative z-10">
          {/* شريط المعلومات العلوي */}
          <div className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-4">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
              {/* معلومات اللاعب الحالي */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full border-4 border-white/20"
                  style={{ backgroundColor: playerColors[currentPlayer.color] }}
                ></div>
                <div>
                  <div className="text-white font-bold text-xl">{currentPlayer.name}</div>
                  <div className="text-gray-400">دور {currentPlayer.name}</div>
                </div>
              </div>

              {/* النقاط */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {progress?.score || 0}
                </div>
                <div className="text-gray-400">النقاط</div>
              </div>
              
              {/* زر الخروج */}
              <Link 
                href="/" 
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300"
              >
                خروج
              </Link>
            </div>
          </div>

          {/* السؤال */}
          {currentQuestion && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto text-center mb-8">
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
                            ? 'border-cyan-400 bg-cyan-500/10' 
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white/50"
                            style={{ backgroundColor: playerColors[player.color] }}
                          ></div>
                          <div className="text-white font-bold text-lg truncate">
                            {player.name}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">النقاط:</span>
                            <span className="text-green-400 font-bold text-xl">
                              {progress?.score || 0}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">الأسئلة:</span>
                            <span className="text-blue-400 font-bold">
                              {progress?.questionsAnswered || 0}/{questionsPerPlayer}
                            </span>
                          </div>
                          
                          {/* شريط التقدم */}
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${((progress?.questionsAnswered || 0) / questionsPerPlayer) * 100}%`
                              }}
                            ></div>
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

  // مكون انتهاء اللعبة
  const GameFinished = () => {
    // ترتيب اللاعبين حسب النقاط
    const sortedPlayers = players
      .map((player, index) => ({
        ...player,
        ...playerProgress[index],
        originalIndex: index
      }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl w-full text-center">
            
            {/* العنوان */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                🏆 انتهت اللعبة!
              </h1>
              <p className="text-2xl text-gray-300">تهانينا للفائزين</p>
            </div>

            {/* النتائج النهائية */}
            <div className="space-y-6 mb-12">
              {sortedPlayers.map((player, rankIndex) => {
                const isWinner = rankIndex === 0;
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[rankIndex] || '🏅';
                
                return (
                  <div
                    key={player.originalIndex}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      isWinner
                        ? 'border-yellow-400 bg-yellow-500/10 scale-105'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{medal}</div>
                        <div 
                          className="w-12 h-12 rounded-full border-4 border-white/20"
                          style={{ backgroundColor: playerColors[player.color] }}
                        ></div>
                        <div className="text-left">
                          <div className={`font-bold text-2xl ${isWinner ? 'text-yellow-300' : 'text-white'}`}>
                            {player.name}
                          </div>
                          <div className="text-gray-400">المرتبة #{rankIndex + 1}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold text-3xl ${isWinner ? 'text-yellow-400' : 'text-green-400'}`}>
                          {player.score} نقطة
                        </div>
                        <div className="text-gray-400">
                          {player.questionsAnswered}/{questionsPerPlayer} سؤال
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                 لعبة جديدة
              </button>
              
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                 العودة للقائمة
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // رندر المكونات حسب حالة اللعبة
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              أوجد الدولة
            </h1>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              العودة للقائمة
            </Link>
          </div>

          {/* وصف اللعبة */}
          <div className="text-center mb-12">
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
              تحدى أصدقاءك في لعبة تحديد الدول على الخريطة! كل لاعب يحصل على 10 أسئلة    
            </p>
          </div>

          <PlayerSetup />
        </div>

        <ToastNotification />
      </div>
    );
  }

  if (gamePhase === 'playing') {
    return <GamePlay />;
  }

  if (gamePhase === 'finished') {
    return <GameFinished />;
  }

  return null;
}