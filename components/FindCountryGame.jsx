// components/FindCountryGame.jsx - الكود الكامل مُحسن للهاتف
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
      setIsMobile(window.innerWidth < 1024); // أقل من lg في Tailwind
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
  const [questionsPerPlayer] = useState(10); // ثابت - 10 أسئلة لكل لاعب
  const [playerProgress, setPlayerProgress] = useState({}); // تتبع تقدم كل لاعب
  const [countries, setCountries] = useState({}); // للتفاعل مع الخريطة
  
  // 🆕 حالة واجهة الهاتف
  const [mobileView, setMobileView] = useState('map'); // 'map' or 'scores'
  const isMobile = useIsMobile();
  
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
    
    // تحديث تقدم اللاعب
    setPlayerProgress(prev => {
      const newProgress = { ...prev };
      const currentPlayer = newProgress[currentPlayerIndex];
      
      if (currentPlayer) {
        currentPlayer.questionsAnswered += 1;
        
        if (isCorrect) {
          currentPlayer.correctAnswers += 1;
          currentPlayer.score += 100;
        } else {
          currentPlayer.wrongAnswers += 1;
        }
      }
      
      return newProgress;
    });

    // تلوين الدولة حسب الإجابة
    setCountries({
      [countryId]: {
        owner: isCorrect ? -1 : -2 // -1 للصحيح (أخضر)، -2 للخطأ (أحمر)
      }
    });

    // إظهار رسالة النتيجة
    if (isCorrect) {
      showSuccessToast(`✅ إجابة صحيحة! +100 نقطة`);
    } else {
      const correctCountryName = getCountryNameAR(currentQuestion.correctCountry);
      showErrorToast(`❌ إجابة خاطئة! الإجابة الصحيحة: ${correctCountryName}`);
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
    setMobileView('map');
    timerRef.current = 0;
  };

  // الحصول على اللاعب الحالي
  const currentPlayer = players[currentPlayerIndex];

  // دالة للحصول على إحصائيات اللعبة
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

  // دالة لحساب إجمالي الأسئلة المجابة
  const getTotalQuestionsAnswered = () => {
    return Object.values(playerProgress).reduce((total, progress) => {
      return total + (progress.questionsAnswered || 0);
    }, 0);
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">إعداد اللاعبين</h2>
          
          <div className="space-y-4 mb-8">
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
                  placeholder={`اللاعب ${index + 1}`}
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
                {playerInputs.length > 2 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="text-red-400 hover:text-red-300 p-2"
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
                className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-8 py-3 text-white font-bold transition-all"
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

  // مكون اللعب للشاشات الكبيرة (الكود الأصلي)
  const DesktopGamePlay = () => {
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
            <div className="flex justify-center items-center">
              {/* زر الخروج والقائمة */}
              {/* <div className="flex gap-2">
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
              </div> */}

              {/* السؤال الحالي */}
              {currentQuestion && (
                <div className="flex-1 max-w-2xl mx-4">
                  <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md border-2 border-cyan-400/50 rounded-xl p-4 text-center shadow-xl">
                    <div className="text-cyan-300 text-sm font-semibold mb-1">
                      {currentQuestion.continent}
                    </div>
                    <div className="text-white font-bold text-xl mb-2">
                      {currentQuestion.question}
                    </div>
                    <div className="flex justify-center items-center gap-4 text-sm">
                      <span className="text-green-400 font-semibold">100 نقطة</span>
                      <span className="text-white">•</span>
                      <span className="text-purple-400 font-semibold">دور: {currentPlayer?.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* جدول النقاط الجانبي */}
          <div className="absolute top-20 right-4 z-20 pointer-events-auto">
            <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-80">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏆</span>
                <h3 className="text-xl font-bold text-white">جدول النقاط</h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getGameStats().map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      currentPlayerIndex === player.index 
                        ? 'bg-cyan-500/20 border border-cyan-400/50' 
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </div>
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
                        {player.progress?.questionsAnswered || 0}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🆕 مكون اللعب المحسن للهاتف
  const MobileGamePlay = () => {
    return (
      <div className="h-screen w-screen fixed inset-0 bg-[#0a0a0f] flex flex-col">
        
        {/* شريط علوي مضغوط */}
        {/* <div className="flex-shrink-0 p-3 bg-black/80 backdrop-blur-md border-b border-white/20">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-bold"
            >
              🏠
            </Link>

          
            {currentQuestion && (
              <div className="flex-1 mx-3">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 rounded-lg p-2 text-center shadow-lg">
                  <div className="text-white font-bold text-sm">
                    {currentQuestion.question}
                  </div>
                  <div className="flex justify-center items-center gap-2 text-xs mt-1">
                    <span className="text-cyan-300">{currentQuestion.continent}</span>
                    <span className="text-white">•</span>
                    <span className="text-green-300">100 نقطة</span>
                  </div>
                </div>
              </div>
            )}


            <button
              onClick={() => setMobileView(mobileView === 'map' ? 'scores' : 'map')}
              className="bg-blue-500/20 border border-blue-400/50 rounded-lg px-3 py-2 text-blue-300 text-sm font-bold"
            >
              {mobileView === 'map' ? '📊' : '🗺️'}
            </button>
          </div>
        </div> */}

        {/* المحتوى الرئيسي */}
        <div className="flex-1 relative">
          {mobileView === 'map' ? (
            // عرض الخريطة كاملة
            <div className="h-full w-full">
              <FindCountryWorldMap
                countries={countries}
                onCountryClick={handleCountryClick}
                currentPlayer={currentPlayer}
                actionType="select"
              />
              
              {/* معلومات اللاعب الحالي فوق الخريطة */}
              <div className="absolute top-4 left-4 right-4 z-10 space-y-3">
                {/* السؤال الحالي */}
        
                {/* معلومات اللاعب */}
                <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white"
                        style={{ backgroundColor: playerColors[currentPlayer?.color] }}
                      ></div>
                      <span className="text-white font-bold">{currentPlayer?.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">
                        {currentPlayer?.progress?.score || 0} نقطة
                      </div>
                      <div className="text-gray-400 text-xs">
                        {(currentPlayer?.progress?.questionsAnswered || 0) + 1}/10
                      </div>
                    </div>
                  </div>
                </div>

                        {currentQuestion && (
                  <div className="bg-black/80 backdrop-blur-md border border-cyan-400/50 rounded-xl p-3">
                    <div className="text-center">
            
                      <div className="text-white font-bold text-sm">
                        {currentQuestion.question}
                      </div>
           
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          ) : (
            // عرض جدول النقاط كاملاً
            <div className="h-full p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">🏆 جدول النقاط</h2>
                  <div className="text-gray-400">
                    الدور: {currentPlayerIndex + 1}/{players.length} • 
                    الجولة: {Math.floor(getTotalQuestionsAnswered() / players.length) + 1}
                  </div>
                </div>

                {getGameStats().map((player, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl transition-all ${
                      currentPlayerIndex === player.index 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 shadow-lg' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-white"
                              style={{ backgroundColor: playerColors[player.color] }}
                            ></div>
                            <span className="text-white font-bold text-lg">{player.name}</span>
                            {currentPlayerIndex === player.index && (
                              <span className="text-cyan-400 text-sm">← الدور الحالي</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-sm">
                            أجاب على {player.progress?.questionsAnswered || 0} من 10 أسئلة
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">
                          {player.progress?.score || 0}
                        </div>
                        <div className="text-gray-400 text-sm">نقطة</div>
                      </div>
                    </div>

                    {/* شريط التقدم */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((player.progress?.questionsAnswered || 0) / 10) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* إحصائيات إضافية */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl">
                  <h3 className="text-white font-bold mb-3">📈 إحصائيات اللعبة</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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

        {/* شريط سفلي للتنقل السريع */}
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
  };

  // مكون اللعب الرئيسي - يختار حسب نوع الجهاز
  const GamePlay = () => {
    return isMobile ? <MobileGamePlay /> : <DesktopGamePlay />;
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
              <p className="text-xl text-gray-300">تهانينا لجميع اللاعبين على الأداء الرائع!</p>
            </div>

            {/* ترتيب النتائج */}
            <div className="grid gap-6 mb-12">
              {sortedPlayers.map((player, index) => (
                <div key={index} className="relative">
                  <div className={`p-6 rounded-3xl border-2 transition-all ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-4xl">
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