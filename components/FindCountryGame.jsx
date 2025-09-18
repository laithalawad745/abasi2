// components/FindCountryGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
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
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // ألوان اللاعبين
  const playerColors = [
    '#ff4444', '#4444ff', '#44ff44', '#ffff44',
    '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
  ];

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && gamePhase === 'playing') {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!timerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
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
    
    // بدء التوقيت
    setTimer(0);
    setTimerActive(true);
    
    showInfoToast(`${players[currentPlayerIndex].name}: ${question.question}`);
  };

  // التعامل مع الضغط على دولة
  const handleCountryClick = (countryId) => {
    if (!currentQuestion || gamePhase !== 'playing') return;

    // إيقاف التوقيت
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
      showErrorToast(`❌ إجابة خاطئة! الدولة الصحيحة هي ${getCountryName(currentQuestion.correctCountry)}`);
      
      // تحديث عدد الأسئلة المجاب عليها فقط
      setPlayerProgress(prev => ({
        ...prev,
        [currentPlayerIndex]: {
          ...prev[currentPlayerIndex],
          questionsAnswered: prev[currentPlayerIndex].questionsAnswered + 1
        }
      }));
      
      // تمييز الدولة الخاطئة باللون الأحمر والصحيحة باللون الأخضر
      setCountries({
        [countryId]: { owner: -2, troops: 1 }, // -2 للون أحمر
        [currentQuestion.correctCountry]: { owner: -1, troops: 1 } // -1 للون أخضر
      });
    }

    // الانتقال للسؤال التالي أو اللاعب التالي
    setTimeout(() => {
      nextTurn();
    }, 3000);
  };

  // الانتقال للدور التالي
  const nextTurn = () => {
    const currentPlayer = playerProgress[currentPlayerIndex];
    
    // التحقق من انتهاء أسئلة اللاعب الحالي
    if (currentPlayer.questionsAnswered >= questionsPerPlayer) {
      // الانتقال للاعب التالي أو انهاء اللعبة
      const nextPlayer = currentPlayerIndex + 1;
      if (nextPlayer >= players.length) {
        // انتهت اللعبة
        endGame();
        return;
      } else {
        setCurrentPlayerIndex(nextPlayer);
      }
    }
    
    // توليد سؤال جديد
    generateNewQuestion();
  };

  // انهاء اللعبة
  const endGame = () => {
    setTimerActive(false);
    setGamePhase('finished');
    
    // تحديد الفائز
    let winner = null;
    let maxScore = -1;
    
    Object.values(playerProgress).forEach(player => {
      if (player.score > maxScore) {
        maxScore = player.score;
        winner = player;
      }
    });
    
    if (winner) {
      showSuccessToast(`🏆 الفائز: ${winner.name} بـ ${winner.score} نقطة!`);
    }
  };

  // الحصول على اسم الدولة بالعربية
  const getCountryName = (countryId) => {
    return getCountryNameAR(countryId);
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
      if (tempPlayers.length > 1) {
        setTempPlayers(tempPlayers.filter((_, i) => i !== index));
      }
    };

    const updatePlayerName = (index, name) => {
      const updated = [...tempPlayers];
      updated[index].name = name;
      setTempPlayers(updated);
    };

    const startGame = () => {
      const validPlayers = tempPlayers.filter(p => p.name.trim() !== '');
      if (validPlayers.length === 0) {
        showErrorToast('يجب إدخال اسم لاعب واحد على الأقل');
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
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                أوجد الدولة
              </span>
            </div>
            <Link 
              href="/"
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* العنوان */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              إعداد اللاعبين
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              كل لاعب سيجيب على {questionsPerPlayer} أسئلة • 100 نقطة للإجابة الصحيحة
            </p>
          </div>

          {/* قائمة اللاعبين */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {tempPlayers.map((player, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
                >
                  {/* لون اللاعب */}
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-white/20"
                    style={{ backgroundColor: playerColors[player.color] }}
                  ></div>
                  
                  {/* اسم اللاعب */}
                  <input
                    type="text"
                    placeholder={`اللاعب ${index + 1}`}
                    value={player.name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                  
                  {/* زر الحذف */}
                  {tempPlayers.length > 1 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {tempPlayers.length < 8 && (
                <button
                  onClick={addPlayer}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  ➕ إضافة لاعب
                </button>
              )}
              
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                🎮 بدء اللعبة
              </button>
            </div>
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
                  <div className="text-gray-400">
                    السؤال {progress.questionsAnswered + 1} من {questionsPerPlayer}
                  </div>
                </div>
              </div>

              {/* التوقيت */}
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-white">
                  {formatTime(timer)}
                </div>
                <div className="text-gray-400">الوقت المنقضي</div>
              </div>

              {/* النقاط */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {progress.score}
                </div>
                <div className="text-gray-400">النقاط</div>
              </div>
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

          {/* جدول النقاط */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  📊 جدول النقاط
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
                            ? 'border-cyan-500 bg-cyan-500/20' 
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: playerColors[player.color] }}
                          ></div>
                          <span className="text-white font-bold">{player.name}</span>
                        </div>
                        <div className="text-green-400 font-bold text-xl">
                          {progress.score} نقطة
                        </div>
                        <div className="text-gray-400 text-sm">
                          {progress.questionsAnswered}/{questionsPerPlayer} سؤال
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

  // مكون النتائج النهائية
  const GameFinished = () => {
    // ترتيب اللاعبين حسب النقاط
    const sortedPlayers = players.map((player, index) => ({
      ...player,
      ...playerProgress[index],
      originalIndex: index
    })).sort((a, b) => b.score - a.score);

    const winner = sortedPlayers[0];

    const resetGame = () => {
      setGamePhase('setup');
      setPlayers([]);
      setCurrentPlayerIndex(0);
      setCurrentQuestion(null);
      setUsedQuestions([]);
      setPlayerProgress({});
      setCountries({});
      setTimer(0);
      setTimerActive(false);
    };

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                النتائج النهائية
              </span>
            </div>
            <Link 
              href="/"
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* بطاقة الفائز */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 rounded-3xl p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                الفائز
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white/20"
                  style={{ backgroundColor: playerColors[winner.originalIndex] }}
                ></div>
                <span className="text-3xl font-bold text-white">{winner.name}</span>
              </div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">
                {winner.score} نقطة
              </div>
              <div className="text-xl text-gray-300">
                من أصل {questionsPerPlayer * 100} نقطة ممكنة
              </div>
            </div>
          </div>

          {/* جدول جميع اللاعبين */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                📊 الترتيب النهائي
              </h2>
              <div className="space-y-4">
                {sortedPlayers.map((player, rank) => (
                  <div 
                    key={player.originalIndex}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                      rank === 0 
                        ? 'border-yellow-500 bg-yellow-500/20' 
                        : rank === 1
                        ? 'border-gray-400 bg-gray-400/20'
                        : rank === 2
                        ? 'border-amber-600 bg-amber-600/20'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-white w-8">
                        {rank + 1}
                      </div>
                      <div 
                        className="w-12 h-12 rounded-full border-4 border-white/20"
                        style={{ backgroundColor: playerColors[player.originalIndex] }}
                      ></div>
                      <div>
                        <div className="text-xl font-bold text-white">
                          {player.name}
                        </div>
                        <div className="text-gray-400">
                          {player.questionsAnswered}/{questionsPerPlayer} سؤال
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {player.score}
                      </div>
                      <div className="text-gray-400">نقطة</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetGame}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              🔄 لعبة جديدة
            </button>
            <Link 
              href="/"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 text-center"
            >
              🏠 العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // عرض المرحلة المناسبة
  if (gamePhase === 'setup') {
    return <PlayerSetup />;
  } else if (gamePhase === 'playing') {
    return <GamePlay />;
  } else {
    return <GameFinished />;
  }
}