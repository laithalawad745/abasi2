// components/PlayerCareerGame.jsx - نسخة محدثة مع التعديلات المطلوبة
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { playerCareerData, searchPlayers } from '../app/data/playerCareerData';

export default function PlayerCareerGame({ 
  roomId, 
  pusher, 
  isHost,
  playerId,
  opponentId,
  onGameEnd 
}) {
  // حالات اللعبة
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'showing-career', 'answered', 'next-ready', 'finished'
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameScores, setGameScores] = useState({
    [playerId]: 0,
    [opponentId]: 0
  });
  
  // إعدادات اللعبة
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [usedPlayers, setUsedPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  
  // حالة الإجابة
  const [firstAnswerer, setFirstAnswerer] = useState(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);
  
  // نظام البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // مرجع القناة
  const channelRef = useRef(null);
  const searchInputRef = useRef(null);

  // إعداد Pusher
  useEffect(() => {
    if (pusher && roomId) {
      const gameChannel = pusher.subscribe(`player-career-${roomId}`);
      channelRef.current = gameChannel;

      // استقبال بداية الجولة الجديدة
      gameChannel.bind('new-round', (data) => {
        console.log('New round received:', data);
        setCurrentPlayer(data.player);
        setCurrentRound(data.round);
        setGamePhase('showing-career');
        setFirstAnswerer(null);
        setShowingAnswer(false);
        setCanAnswer(true);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
      });

      // استقبال إجابة اللاعب
      gameChannel.bind('player-answered', (data) => {
        console.log('Player answered:', data);
        if (!firstAnswerer) {
          setFirstAnswerer(data.playerId);
          setCanAnswer(false);
          setGamePhase('answered');
        }
      });

      // استقبال النقاط
      gameChannel.bind('points-awarded', (data) => {
        console.log('Points awarded:', data);
        setGameScores(data.scores);
        setShowingAnswer(true);
        
        // التحقق من انتهاء اللعبة
        const maxScore = Math.max(...Object.values(data.scores));
        if (maxScore >= 500 || data.round >= totalRounds) {
          setGameFinished(true);
          setTimeout(() => onGameEnd(data.scores), 3000);
        } else {
          setTimeout(() => {
            if (isHost) {
              setGamePhase('next-ready');
            }
          }, 3000);
        }
      });

      // استقبال الجولة التالية
      gameChannel.bind('next-question', (data) => {
        console.log('Next question:', data);
        if (data.round <= totalRounds) {
          // سيتم استقبال new-round بعدها
        } else {
          setGameFinished(true);
        }
      });

      return () => {
        gameChannel.unbind_all();
      };
    }
  }, [pusher, roomId, firstAnswerer, playerId, isHost, totalRounds, onGameEnd]);

  // بدء اللعبة (للمضيف فقط)
  useEffect(() => {
    if (gamePhase === 'waiting' && isHost) {
      setTimeout(() => {
        startNewRound();
      }, 1000);
    }
  }, [gamePhase, isHost]);

  // معالجة البحث
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchPlayers(searchQuery);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // بدء جولة جديدة
  const startNewRound = () => {
    if (!isHost) return;
    
    // اختيار لاعب عشوائي لم يُستخدم من قبل
    let availablePlayers = playerCareerData.filter(
      player => !usedPlayers.includes(player.id)
    );
    
    // إذا انتهت جميع اللاعبين، إعادة تعيين
    if (availablePlayers.length === 0) {
      setUsedPlayers([]);
      availablePlayers = playerCareerData;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex];
    
    // إرسال اللاعب المختار لجميع اللاعبين
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `player-career-${roomId}`,
        event: 'new-round',
        data: {
          player: selectedPlayer,
          round: currentRound,
          hostId: playerId
        }
      })
    }).catch(console.error);
    
    setUsedPlayers(prev => [...prev, selectedPlayer.id]);
  };

  // إجابة اللاعب
  const answerPlayer = (playerName) => {
    if (!canAnswer || showingAnswer || !currentPlayer) return;
    
    console.log('Answering:', playerName, 'Correct:', currentPlayer.name);
    
    // إرسال الإجابة
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `player-career-${roomId}`,
        event: 'player-answered',
        data: {
          playerId: playerId,
          answer: playerName,
          correctAnswer: currentPlayer.name,
          timestamp: Date.now()
        }
      })
    }).then(() => {
      // تقييم الإجابة وإعطاء النقاط (للمضيف فقط)
      if (isHost) {
        setTimeout(() => {
          // مقارنة مرنة للإجابة
          const playerAnswer = playerName.trim().toLowerCase();
          const correctAnswer = currentPlayer.name.toLowerCase();
          const isCorrect = playerAnswer === correctAnswer || 
                           correctAnswer.includes(playerAnswer) ||
                           playerAnswer.includes(correctAnswer.split(' ')[0]); // يقبل الاسم الأول فقط
          
          const newScores = { ...gameScores };
          
          if (isCorrect) {
            newScores[playerId] += 100;
          }
          
          fetch('/api/pusher/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `player-career-${roomId}`,
              event: 'points-awarded',
              data: {
                scores: newScores,
                winnerId: isCorrect ? playerId : null,
                round: currentRound,
                correctAnswer: currentPlayer.name
              }
            })
          }).catch(console.error);
        }, 1000);
      }
    }).catch(console.error);

    // إخفاء نتائج البحث وتفريغ المربع
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // اختيار من نتائج البحث
  const selectFromSearch = (selectedName) => {
    answerPlayer(selectedName);
  };

  // الجولة التالية
  const nextRound = () => {
    if (!isHost) return;
    
    const nextRoundNumber = currentRound + 1;
    setCurrentRound(nextRoundNumber);
    
    if (nextRoundNumber <= totalRounds) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `player-career-${roomId}`,
          event: 'next-question',
          data: {
            round: nextRoundNumber,
            hostId: playerId
          }
        })
      }).then(() => {
        setTimeout(() => {
          startNewRound();
        }, 1000);
      }).catch(console.error);
    }
  };

  // شاشة الانتظار
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              <div className="text-6xl mb-6">⚽</div>
              <h1 className="text-4xl font-bold text-white mb-4">
                جاري تحضير اللعبة...
              </h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة اللعب الرئيسية
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header مع النقاط */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-6">
            <div className={`px-6 py-3 rounded-2xl font-bold text-xl transition-all duration-300 ${
              firstAnswerer === playerId
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 text-green-300 animate-pulse'
                : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50 text-blue-300'
            }`}>
              أنت: {gameScores[playerId]} نقطة
              {firstAnswerer === playerId && <span className="ml-2">⚡</span>}
            </div>
            
            <div className={`px-6 py-3 rounded-2xl font-bold text-xl transition-all duration-300 ${
              firstAnswerer === opponentId
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 text-green-300 animate-pulse'
                : 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border-2 border-red-400/50 text-red-300'
            }`}>
              المنافس: {gameScores[opponentId]} نقطة
              {firstAnswerer === opponentId && <span className="ml-2">⚡</span>}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              الجولة {currentRound} / {totalRounds}
            </div>
            <div className="text-gray-400">
              الهدف: 500 نقطة
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            
            {/* عنوان السؤال */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🔍 من هذا اللاعب؟
              </h2>
              <p className="text-xl text-gray-400">
                انظر إلى مسيرته واكتشف هويته - من يجيب أولاً يفوز!
              </p>
            </div>

            {/* مسيرة اللاعب - مبسطة */}
            {currentPlayer && gamePhase === 'showing-career' && (
              <div className="space-y-6">
                {/* التلميحة العامة */}
                <div className="text-center mb-8">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/50 rounded-2xl">
                    <div className="text-2xl text-purple-400 font-bold">
                      💡 {currentPlayer.hint}
                    </div>
                  </div>
                </div>

                {/* المسيرة الكاملة - شعارات فقط */}
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">
                      📋 المسيرة الكاملة
                    </h3>
                  </div>
                  
                  {/* عرض الأندية كشعارات مع أسهم - تصميم محسّن */}
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    {currentPlayer.career.map((club, index) => (
                      <React.Fragment key={index}>
                        {/* شعار النادي */}
                        <div className="flex flex-col items-center group">
                          <div className="w-14 h-14 md:w-18 md:h-18 bg-white rounded-full p-2 transition-all duration-300 group-hover:scale-110 shadow-xl border-2 border-gray-200">
                            <img 
                              src={`/clubs/${club.club}.png`}
                              alt={club.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = '/clubs/default.png';
                              }}
                            />
                          </div>
                          {/* اسم النادي - مخفي افتراضياً */}
                          <div className="mt-2 text-xs text-gray-400 font-bold text-center max-w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {club.name}
                          </div>
                        </div>
                        
                        {/* السهم */}
                        {index < currentPlayer.career.length - 1 && (
                          <div className="text-lg md:text-xl text-cyan-400 animate-pulse mx-1">
                            ➡️
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* مربع البحث والإجابة */}
                {!showingAnswer && (
                  <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-purple-400/50 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-center text-purple-400 mb-6">
                      ✍️ أدخل اسم اللاعب
                    </h3>
                    
                    {/* مربع البحث مع أيقونة */}
                    <div className="relative">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="ابحث عن اسم اللاعب..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                              answerPlayer(searchQuery.trim());
                            }
                          }}
                          disabled={!canAnswer}
                          className="w-full bg-black/70 border-2 border-white/20 rounded-xl pl-6 pr-14 py-4 text-white text-xl font-bold placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-all duration-300 shadow-lg"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🔍
                        </div>
                      </div>
                      
                      {/* نتائج البحث */}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border-2 border-purple-400/30 rounded-xl max-h-64 overflow-y-auto z-50 shadow-2xl">
                          <div className="p-2">
                            <div className="text-purple-400 text-sm font-bold mb-2 px-3">اختر من القائمة:</div>
                            {searchResults.map((playerName, index) => (
                              <button
                                key={index}
                                onClick={() => selectFromSearch(playerName)}
                                disabled={!canAnswer}
                                className="w-full px-4 py-3 text-white font-bold text-right hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg border border-transparent hover:border-purple-400/30 mb-1"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-purple-400">👤</span>
                                  <span>{playerName}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* زر الإجابة */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          if (searchQuery.trim()) {
                            answerPlayer(searchQuery.trim());
                          }
                        }}
                        disabled={!canAnswer || !searchQuery.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400/50 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        ✅ إجابة
                      </button>
                    </div>
                    
                    {firstAnswerer && (
                      <div className="mt-4 text-center">
                        <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-lg ${
                          firstAnswerer === playerId 
                            ? 'bg-green-500/20 border border-green-400/50 text-green-400' 
                            : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-400'
                        }`}>
                          {firstAnswerer === playerId ? 
                            '⚡ لقد أجبت أولاً! انتظر النتيجة...' : 
                            '⏳ المنافس أجاب أولاً! انتظر النتيجة...'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* عرض الإجابة الصحيحة */}
                {showingAnswer && (
                  <div className="text-center p-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-2xl">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {currentPlayer.name}
                    </h3>
                    <p className="text-xl text-gray-300 mb-4">
                      {currentPlayer.hint}
                    </p>
                    
                    {firstAnswerer && (
                      <div className="mt-4 text-lg font-bold">
                        {firstAnswerer === playerId ? (
                          <span className="text-green-400">🎯 أحسنت! +100 نقطة</span>
                        ) : (
                          <span className="text-red-400">😔 المنافس فاز بهذه الجولة</span>
                        )}
                      </div>
                    )}
                    
                    {gameFinished && (
                      <div className="mt-4 text-2xl font-bold text-yellow-400">
                        🏆 انتهت اللعبة!
                      </div>
                    )}
                  </div>
                )}

                {/* زر الجولة التالية (للمضيف فقط) */}
                {gamePhase === 'next-ready' && isHost && !gameFinished && (
                  <div className="text-center mt-6">
                    <button
                      onClick={nextRound}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 border border-purple-400/50 rounded-2xl font-bold text-xl text-white transition-all duration-300 hover:scale-105"
                    >
                      ➡️ الجولة التالية
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}