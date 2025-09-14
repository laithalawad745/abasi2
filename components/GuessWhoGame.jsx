// components/GuessWhoGame.jsx - تصميم جديد مع نفس اللوجيك
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { 
  guessWhoCharacters, 
  getMatch1Characters, 
  getMatch2Characters, 
  getMatch3Characters, 
  getMatch4Characters 
} from '../app/data/guessWhoData';

export default function GuessWhoGame({ roomId, onGoBack }) {
  // Game States
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [myCharacter, setMyCharacter] = useState(null);
  const [opponentCharacter, setOpponentCharacter] = useState(null);
  const [eliminatedCharacters, setEliminatedCharacters] = useState([]); // فقط لي
  const [currentTurn, setCurrentTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30); // 30 ثانية لكل دور
  const [gameMessages, setGameMessages] = useState([]); // رسائل اللعبة
  
  // Match System - نظام الأدوار (4 مباريات)
  const [currentMatch, setCurrentMatch] = useState(1); // 1, 2, 3, أو 4
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [usedMatches, setUsedMatches] = useState([]); // المباريات المستخدمة
  
  // Player Management
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [opponentId, setOpponentId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  
  // Refs
  const channelRef = useRef(null);
  const turnTimerRef = useRef(null);

  // تحميل البيانات المحفوظة من localStorage
  useEffect(() => {
    try {
      const savedUsedMatches = localStorage.getItem('guess-who-used-matches');
      const savedCurrentMatch = localStorage.getItem('guess-who-current-match');
      
      if (savedUsedMatches) {
        const used = JSON.parse(savedUsedMatches);
        setUsedMatches(used);
        
        // تحديد المباراة التالية
        if (!used.includes(1)) {
          setCurrentMatch(1);
        } else if (!used.includes(2)) {
          setCurrentMatch(2);
        } else if (!used.includes(3)) {
          setCurrentMatch(3);
        } else if (!used.includes(4)) {
          setCurrentMatch(4);
        } else {
          // تمت جميع المباريات الأربع - إعادة تعيين
          setCurrentMatch(1);
          setUsedMatches([]);
          localStorage.removeItem('guess-who-used-matches');
        }
      } else if (savedCurrentMatch) {
        setCurrentMatch(JSON.parse(savedCurrentMatch));
      }
    } catch (error) {
      console.log('localStorage error:', error);
    }
  }, []);

  // تحديث الشخصيات المتاحة حسب المباراة
  useEffect(() => {
    let characters = [];
    switch(currentMatch) {
      case 1:
        characters = getMatch1Characters();
        break;
      case 2:
        characters = getMatch2Characters();
        break;
      case 3:
        characters = getMatch3Characters();
        break;
      case 4:
        characters = getMatch4Characters();
        break;
      default:
        characters = getMatch1Characters();
    }
    setAvailableCharacters(characters);
  }, [currentMatch]);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('guess-who-used-matches', JSON.stringify(usedMatches));
      localStorage.setItem('guess-who-current-match', JSON.stringify(currentMatch));
    } catch (error) {}
  }, [usedMatches, currentMatch]);

  // Pusher connection
  useEffect(() => {
    if (!roomId) return;

    const pusher = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
    });

    const channel = pusher.subscribe(`guess-who-${roomId}`);
    channelRef.current = channel;

    // Player joined
    channel.bind('player-joined', (data) => {
      if (data.playerId !== playerId) {
        setOpponentId(data.playerId);
        setOpponentJoined(true);
        
        if (data.isHost) {
          setIsHost(false);
        } else {
          setIsHost(true);
        }
      }
    });

    // Character selection
    channel.bind('character-selected', (data) => {
      if (data.playerId !== playerId) {
        setOpponentCharacter(data.character);
      }
    });

    // Turn management
    channel.bind('turn-changed', (data) => {
      setCurrentTurn(data.nextPlayerId);
      setTurnTimeLeft(30);
    });

    // Game messages
    channel.bind('game-message', (data) => {
      if (data.playerId !== playerId) {
        setGameMessages(prev => [...prev, {
          text: data.message,
          type: data.type,
          timestamp: Date.now()
        }]);
      }
    });

    // Game won
    channel.bind('game-won', (data) => {
      console.log('Game won event received:', data);
      setWinner(data.winnerId === playerId ? 'me' : 'opponent');
      setGamePhase('finished');
      stopTurnTimer();

      // إضافة المباراة الحالية للمستخدمة
      setUsedMatches(prev => {
        const newUsed = [...prev, currentMatch];
        return newUsed;
      });
    });

    // Announce presence
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `guess-who-${roomId}`,
          event: 'player-joined',
          data: { playerId, isHost: !opponentJoined }
        })
      });
    }, 1000);

    return () => {
      pusher.unsubscribe(`guess-who-${roomId}`);
      stopTurnTimer();
    };
  }, [roomId, playerId, opponentJoined]);

  // Timer للدور
  const startTurnTimer = () => {
    stopTurnTimer();
    turnTimerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // انتهى الوقت - تغيير الدور
          if (currentTurn === playerId) {
            changeTurn();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTurnTimer = () => {
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
      turnTimerRef.current = null;
    }
  };

  // تغيير الدور
  const changeTurn = () => {
    const nextPlayerId = currentTurn === playerId ? opponentId : playerId;
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'turn-changed',
        data: { 
          nextPlayerId,
          changedBy: playerId
        }
      })
    });
  };

  // إرسال رسالة للعبة
  const sendGameMessage = (message, type) => {
    setGameMessages(prev => [...prev, {
      text: message,
      type: type,
      timestamp: Date.now()
    }]);

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'game-message',
        data: { 
          playerId,
          message,
          type
        }
      })
    });
  };

  // تحقق من بدء اللعبة
  useEffect(() => {
    if (myCharacter && opponentCharacter && opponentJoined && gamePhase === 'waiting') {
      console.log('Both characters selected! Starting game...');
      
      if (isHost) {
        console.log('I am host, sending game start signal...');
        setTimeout(() => {
          fetch('/api/pusher/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `guess-who-${roomId}`,
              event: 'game-started',
              data: { 
                hostId: playerId
              }
            })
          });
        }, 500);
      }
    }
  }, [myCharacter, opponentCharacter, opponentJoined, gamePhase, isHost, playerId, roomId]);

  // Select character
  const selectCharacter = (character) => {
    console.log('Selecting character:', character.name);
    setMyCharacter(character);
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'character-selected',
        data: { playerId, character }
      })
    });
  };

  // Eliminate character - محلي فقط
  const eliminateCharacter = (characterId) => {
    if (currentTurn !== playerId) return; // فقط في دوري
    setEliminatedCharacters(prev => [...prev, characterId]);
  };

  // Make final guess
  const makeGuess = (character) => {
    if (currentTurn !== playerId) {
      alert('ليس دورك الآن!');
      return;
    }

    if (!opponentCharacter) {
      return;
    }

    console.log('Making competitive guess:', character.name);
    console.log('Opponent character:', opponentCharacter?.name);
    console.log('Character IDs match:', character.id === opponentCharacter?.id);
    
    const isCorrect = character.id === opponentCharacter?.id;
    
    if (isCorrect) {
      // تخمين صحيح - فوز فوري!
      console.log('✅ Correct guess! I won immediately!');
      sendGameMessage(`خمن ${character.name} بشكل صحيح!`, 'correct');
      
      setWinner('me');
      setGamePhase('finished');
      
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `guess-who-${roomId}`,
          event: 'game-won',
          data: { 
            winnerId: playerId,
            reason: 'correct_guess',
            guessedCharacter: character.name,
            actualCharacter: opponentCharacter.name
          }
        })
      });
    } else {
      // تخمين خاطئ - تستمر اللعبة!
      console.log('❌ Wrong guess, but game continues!');
      sendGameMessage(`خمن ${character.name} بشكل خاطئ!`, 'wrong');
      
      // تبديل الدور
      changeTurn();
    }
  };

  // Timer للدور - بدء عند تغيير الدور
  useEffect(() => {
    if (currentTurn && gamePhase === 'playing') {
      startTurnTimer();
    } else {
      stopTurnTimer();
    }
    
    return () => stopTurnTimer();
  }, [currentTurn, gamePhase]);

  // بدء المباراة التالية
  const startNewMatch = () => {
    const updatedUsedMatches = [...usedMatches, currentMatch];
    
    // تحديد المباراة التالية
    let nextMatch = 1;
    for (let i = 1; i <= 4; i++) {
      if (!updatedUsedMatches.includes(i)) {
        nextMatch = i;
        break;
      }
    }
    
    // إذا انتهت جميع المباريات الأربع، إعادة تعيين
    if (updatedUsedMatches.length >= 4) {
      setUsedMatches([]);
      setCurrentMatch(1);
      localStorage.removeItem('guess-who-used-matches');
      
      // إعادة تعيين كل شيء
      setGamePhase('waiting');
      setMyCharacter(null);
      setOpponentCharacter(null);
      setEliminatedCharacters([]);
      setWinner(null);
      setGameMessages([]);
      setCurrentTurn(isHost ? playerId : opponentId);
      return; // إنهاء الدالة هنا
    }

    // تحديث usedMatches و currentMatch
    setUsedMatches(updatedUsedMatches);
    setCurrentMatch(nextMatch);
    
    // إعادة تعيين حالة اللعبة
    setGamePhase('waiting');
    setMyCharacter(null);
    setOpponentCharacter(null);
    setEliminatedCharacters([]);
    setWinner(null);
    setGameMessages([]);

    // إعادة تعيين الدور للمضيف
    setCurrentTurn(isHost ? playerId : opponentId);
    
    console.log(`انتقال من المباراة ${currentMatch} إلى المباراة ${nextMatch}`);
    console.log('المباريات المستخدمة:', updatedUsedMatches);
  };

  // دالة مساعدة لعرض اسم المباراة
  const getMatchName = (matchNumber) => {
    switch(matchNumber) {
      case 1: return 'ريال مدريد';
      case 2: return 'الأعلام';
      case 3: return 'الشخصيات الأولى';
      case 4: return 'الشخصيات الثانية';
      default: return `المباراة ${matchNumber}`;
    }
  };

  // Character selection screen
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header مع معلومات المباراة */}
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                    من هو؟
                  </span>
                </h1>
                {/* <p className="text-xl md:text-2xl text-gray-400 font-light mt-2">
                  {getMatchName(currentMatch)} - المباراة {currentMatch}
                </p> */}
              </div>
              
              {usedMatches.length > 0 && (
                <button
                  onClick={startNewMatch}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  مباراة جديدة
                </button>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              {!myCharacter ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-6">اختر شخصيتك السرية</h2>
                  <p className="text-xl text-gray-300 mb-8">اختر الشخصية التي سيحاول خصمك تخمينها</p>
                </>
              ) : !opponentCharacter ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-6">انتظار اختيار الخصم...</h2>
                  <p className="text-xl text-gray-300">لقد اخترت: <span className="text-green-400 font-bold">{myCharacter.name}</span></p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-6">جاري بدء اللعبة...</h2>
                  <p className="text-xl text-gray-300">شخصيتك: <span className="text-green-400 font-bold">{myCharacter.name}</span></p>
                  <div className="flex justify-center mt-6">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                  </div>
                </>
              )}
            </div>

            {!myCharacter && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
                {availableCharacters.map(character => (
                  <button
                    key={character.id}
                    onClick={() => selectCharacter(character)}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 group"
                  >
                    <div className="relative">
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-32 object-cover object-top rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=' + character.name;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <p className="text-white font-bold text-center">{character.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game finished screen
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center max-w-md">
            <h2 className="text-4xl font-bold mb-8 text-white">
              {winner === 'me' ? '🏆 أنت الفائز!' : '😔 خسرت'}
            </h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-gray-300 mb-4">{getMatchName(currentMatch)} انتهت</p>
                <p className="text-gray-300 mb-4">شخصيتك كانت:</p>
                <div className="flex items-center gap-4 justify-center">
                  <img
                    src={myCharacter?.image}
                    alt={myCharacter?.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50/6366F1/FFFFFF?text=' + myCharacter?.name;
                    }}
                  />
                  <span className="text-white font-bold text-lg">{myCharacter?.name}</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-gray-300 mb-4">شخصية الخصم كانت:</p>
                <div className="flex items-center gap-4 justify-center">
                  <img
                    src={opponentCharacter?.image}
                    alt={opponentCharacter?.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50/6366F1/FFFFFF?text=' + opponentCharacter?.name;
                    }}
                  />
                  <span className="text-white font-bold text-lg">{opponentCharacter?.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startNewMatch}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                {usedMatches.length + 1 < 4 ? 'المباراة التالية' : 'مباراة جديدة'}
              </button>
              
              <button
                onClick={onGoBack}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                العودة للقائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* معلومات الدور */}
          <div className="text-center">
            <div className={`px-6 py-3 rounded-2xl font-bold text-xl transition-all duration-300 ${
              currentTurn === playerId 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-lg shadow-green-500/30' 
                : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-300'
            }`}>
              {currentTurn === playerId ? '✅ دورك' : '❌ دور الخصم'}
            </div>
            
            <div className="flex gap-3 mt-4">
              {/* زر تغيير الدور */}
              {currentTurn === playerId && (
                <button
                  onClick={changeTurn}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  إنهاء الدور
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Characters Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-white font-bold text-3xl mb-8 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                  {getMatchName(currentMatch)} - المباراة {currentMatch}
                </span>
              </h3>
              
              {/* تعليمات */}
              <div className="mb-8 text-center">
                <div className={`text-xl font-bold mb-4 p-4 rounded-2xl transition-all duration-300 ${
                  currentTurn === playerId 
                    ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                    : 'text-red-400 bg-red-500/20 border border-red-500/30'
                }`}>
                  {currentTurn === playerId 
                    ? '✅ دورك: اضغط الشخصية لاستبعادها • استخدم قائمة التخمين ←' 
                    : '❌ دور الخصم: انتظر دورك'
                  }
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {availableCharacters.map(character => {
                  const isEliminated = eliminatedCharacters.includes(character.id);
                  const canInteract = currentTurn === playerId;
                  
                  return (
                    <div
                      key={character.id}
                      className={`relative transition-all duration-300 group ${
                        isEliminated ? 'opacity-30 grayscale' : ''
                      } ${canInteract ? '' : 'opacity-60'}`}
                    >
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-red-500/50">
                        <img
                          src={character.image}
                          alt={character.name}
                          className={`w-full h-32 object-cover object-top rounded-xl mb-3 ${
                            canInteract && !isEliminated ?
                            'cursor-pointer hover:scale-105 transition-transform duration-300' : 
                            'cursor-not-allowed'
                          }`}
                          onClick={() => canInteract && !isEliminated && eliminateCharacter(character.id)}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=' + character.name;
                          }}
                        />
                        
                        {/* X للمستبعدة */}
                        {isEliminated && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-lg">
                              ✕
                            </div>
                          </div>
                        )}
                        
                        <p className="text-white font-bold text-center">{character.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar - قائمة التخمين */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold text-2xl mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  🎯 قائمة التخمين
                </span>
              </h3>
              
              {/* العداد الزمني */}
              <div className="mb-6 text-center">
                <div className={`text-4xl font-bold transition-all duration-300 ${
                  turnTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'
                }`}>
                  {turnTimeLeft}s
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      turnTimeLeft <= 10 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${(turnTimeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* رسالة إرشادية */}
              {currentTurn !== playerId && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6 text-center">
                  انتظر دورك للتخمين
                </div>
              )}
              
              {/* قائمة الأسماء مع أزرار التخمين */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableCharacters.map(character => {
                  const isEliminated = eliminatedCharacters.includes(character.id);
                  const canGuess = currentTurn === playerId && !isEliminated;
                  
                  return (
                    <div
                      key={character.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                        isEliminated 
                          ? 'bg-red-500/10 border-red-500/30 opacity-50' 
                          : 'bg-white/5 border-white/10 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/32x32/6366F1/FFFFFF?text=' + character.name.slice(0,1);
                          }}
                        />
                        <span className={`font-medium ${
                          isEliminated ? 'text-red-400 line-through' : 'text-white'
                        }`}>
                          {character.name}
                        </span>
                      </div>
                      
                      {!isEliminated && (
                        <button
                          onClick={() => makeGuess(character)}
                          disabled={!canGuess}
                          className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                            canGuess
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                              : 'bg-white/10 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          تخمين
                        </button>
                      )}
                      
                      {isEliminated && (
                        <div className="text-red-400 text-2xl">✕</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* رسائل اللعبة */}
              {gameMessages.length > 0 && (
                <>
                  <hr className="border-white/20 my-6" />
                  <h4 className="text-white font-medium mb-4">آخر الأحداث:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {gameMessages.slice(-5).map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-xl text-sm ${
                          msg.type === 'correct' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                          msg.type === 'wrong' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                          'bg-white/5 border border-white/10 text-gray-300'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}