// components/CluesGame.jsx - حل نهائي لمشكلة الإدخال
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Pusher from 'pusher-js';
import { getRandomCluesQuestion, calculatePoints } from '../app/data/cluesGameData';
import { showSuccessToast, showErrorToast, showInfoToast } from './ToastNotification';

export default function CluesGame({ roomId, playerName, isHost, onExit }) {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameScores, setGameScores] = useState({});
  const [myAnswer, setMyAnswer] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(5); // عدد الأسئلة في اللعبة
  const [isConnected, setIsConnected] = useState(false);
  
  // 🆕 تتبع التلميحات لكل لاعب منفرداً
  const [playerClueIndex, setPlayerClueIndex] = useState({}); // {playerName: clueIndex}
  const [gameWinner, setGameWinner] = useState(null);

  // استخدام useRef لمنع إعادة الاشتراك والمشاكل
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const inputRef = useRef(null);
  const isInitializedRef = useRef(false);
  const preventRerenderRef = useRef(0);

  // ثوابت مستقرة
  const stableRoomId = useMemo(() => roomId, [roomId]);
  const stablePlayerName = useMemo(() => playerName, [playerName]);
  const stableIsHost = useMemo(() => isHost, [isHost]);

  // إرسال حدث عبر Pusher - مع منع re-render
  const triggerPusherEvent = useCallback(async (event, data) => {
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `clues-room-${stableRoomId}`,
          event: event,
          data: data
        })
      });
    } catch (error) {
      console.error('❌ خطأ في إرسال الحدث:', error);
    }
  }, [stableRoomId]);

  // إعداد Pusher مرة واحدة فقط - بدون dependencies خطيرة
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const pusherInstance = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      encrypted: true,
    });

    pusherRef.current = pusherInstance;

    // الاتصال بالقناة
    const channel = pusherInstance.subscribe(`clues-room-${stableRoomId}`);
    channelRef.current = channel;
    
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
      console.log('✅ متصل بالغرفة:', stableRoomId);
      
      // إضافة اللاعب الحالي
      triggerPusherEvent('player-joined', {
        playerId: stablePlayerName,
        playerName: stablePlayerName,
        isHost: stableIsHost
      });
    });

    // استقبال انضمام لاعب جديد
    channel.bind('player-joined', (data) => {
      console.log('🎮 لاعب انضم:', data.playerName);
      setPlayers(prev => {
        if (!prev.find(p => p.playerId === data.playerId)) {
          return [...prev, data];
        }
        return prev;
      });
      
      if (data.playerId !== stablePlayerName) {
        showInfoToast(`${data.playerName} انضم للغرفة`);
      }
    });

    // بدء اللعبة
    channel.bind('game-started', (data) => {
      console.log('🚀 بدأت اللعبة');
      setCurrentQuestion(data.question);
      setGamePhase('playing');
      setAttemptsLeft(3);
      setHasAnswered(false);
      setShowCorrectAnswer(false);
      setGameWinner(null);
      setMyAnswer(''); // تنظيف الحقل
      // إعداد التلميحات لكل لاعب - يبدأ الجميع بالتلميح الأول
      setPlayerClueIndex(prev => {
        const newIndexes = {};
        data.players?.forEach(player => {
          newIndexes[player] = 0;
        });
        return newIndexes;
      });
      showSuccessToast('بدأت اللعبة!');
    });

    // تلميح جديد للاعب محدد
    channel.bind('player-requested-clue', (data) => {
      console.log('💡 تلميح جديد للاعب:', data.playerName, 'التلميح رقم:', data.clueIndex);
      setPlayerClueIndex(prev => ({
        ...prev,
        [data.playerName]: data.clueIndex
      }));
      
      if (data.playerName !== stablePlayerName) {
        showInfoToast(`${data.playerName} طلب تلميح إضافي`);
      }
    });

    // إجابة لاعب
    channel.bind('player-answered', (data) => {
      console.log('📝 إجابة لاعب:', data);
      
      if (data.isCorrect && !gameWinner) {
        // هذا اللاعب فاز!
        setGameWinner(data.playerName);
        showSuccessToast(`🎉 ${data.playerName} فاز بـ ${data.points} نقطة!`);
        
        // تحديث النقاط
        setGameScores(prev => ({
          ...prev,
          [data.playerId]: (prev[data.playerId] || 0) + data.points
        }));
        
        // إظهار الإجابة بعد 2 ثانية
        setTimeout(() => {
          setShowCorrectAnswer(true);
        }, 2000);
        
      } else if (!data.isCorrect) {
        if (data.playerId !== stablePlayerName) {
          showInfoToast(`${data.playerName} أجاب بشكل خاطئ (محاولات متبقية: ${data.attemptsLeft})`);
        }
      }
    });

    // إظهار الإجابة الصحيحة
    channel.bind('show-answer', (data) => {
      console.log('✅ إظهار الإجابة الصحيحة');
      setShowCorrectAnswer(true);
      setTimeout(() => {
        if (data.isLastQuestion) {
          setGamePhase('finished');
        } else {
          setQuestionNumber(prev => prev + 1);
        }
      }, 3000);
    });

    // السؤال التالي
    channel.bind('next-question', (data) => {
      console.log('➡️ السؤال التالي');
      setCurrentQuestion(data.question);
      setAttemptsLeft(3);
      setHasAnswered(false);
      setShowCorrectAnswer(false);
      setMyAnswer(''); // تنظيف الحقل
      setGameWinner(null);
      // إعادة تعيين التلميحات لكل اللاعبين
      setPlayerClueIndex(prev => {
        const newIndexes = {};
        Object.keys(prev).forEach(player => {
          newIndexes[player] = 0;
        });
        return newIndexes;
      });
    });

    // تنظيف عند unmount
    return () => {
      if (channelRef.current) {
        pusherRef.current?.unsubscribe(`clues-room-${stableRoomId}`);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // dependency array فارغ تماماً

  // بدء اللعبة (المضيف فقط)
  const startGame = useCallback(() => {
    if (!stableIsHost) return;
    
    const question = getRandomCluesQuestion();
    const playerNames = players.map(p => p.playerName);
    
    triggerPusherEvent('game-started', {
      question: question,
      questionNumber: 1,
      players: playerNames
    });
  }, [stableIsHost, triggerPusherEvent, players]);

  // طلب تلميح جديد (لاعب محدد)
  const requestNextClue = useCallback(() => {
    const myCurrentClueIndex = playerClueIndex[stablePlayerName] || 0;
    if (myCurrentClueIndex < currentQuestion?.clues.length - 1) {
      const newClueIndex = myCurrentClueIndex + 1;
      
      triggerPusherEvent('player-requested-clue', {
        playerName: stablePlayerName,
        clueIndex: newClueIndex
      });
    }
  }, [playerClueIndex, stablePlayerName, currentQuestion, triggerPusherEvent]);

  // إرسال الإجابة
  const submitAnswer = useCallback(() => {
    if (!myAnswer.trim() || hasAnswered || attemptsLeft <= 0 || gameWinner) return;

    const isCorrect = myAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    const myCurrentClueIndex = playerClueIndex[stablePlayerName] || 0;
    const points = isCorrect ? calculatePoints(myCurrentClueIndex + 1) : 0;
    const newAttemptsLeft = isCorrect ? attemptsLeft : attemptsLeft - 1;

    // إرسال الإجابة للجميع
    triggerPusherEvent('player-answered', {
      playerId: stablePlayerName,
      playerName: stablePlayerName,
      answer: myAnswer.trim(),
      isCorrect: isCorrect,
      points: points,
      attemptsLeft: newAttemptsLeft,
      clueIndex: myCurrentClueIndex
    });

    if (isCorrect) {
      setHasAnswered(true);
      showSuccessToast(`أحسنت! حصلت على ${points} نقطة`);
    } else {
      setAttemptsLeft(newAttemptsLeft);
      setMyAnswer('');
      if (newAttemptsLeft > 0) {
        showErrorToast(`إجابة خاطئة! متبقي ${newAttemptsLeft} محاولات`);
      } else {
        setHasAnswered(true);
        showErrorToast('انتهت محاولاتك!');
      }
    }
  }, [myAnswer, hasAnswered, attemptsLeft, gameWinner, currentQuestion, playerClueIndex, stablePlayerName, triggerPusherEvent]);

  // إظهار الإجابة (المضيف فقط)
  const revealAnswer = useCallback(() => {
    if (!stableIsHost) return;
    
    triggerPusherEvent('show-answer', {
      isLastQuestion: questionNumber >= totalQuestions
    });
  }, [stableIsHost, questionNumber, totalQuestions, triggerPusherEvent]);

  // السؤال التالي (المضيف فقط)
  const nextQuestion = useCallback(() => {
    if (!stableIsHost || questionNumber >= totalQuestions) return;
    
    const question = getRandomCluesQuestion();
    triggerPusherEvent('next-question', {
      question: question,
      questionNumber: questionNumber + 1
    });
  }, [stableIsHost, questionNumber, totalQuestions, triggerPusherEvent]);

  // دالة تغيير الإجابة - بحل جذري لمشكلة التركيز
  const handleAnswerChange = useCallback((e) => {
    const newValue = e.target.value;
    setMyAnswer(newValue);
    
    // حفظ موضع المؤشر
    const cursorPosition = e.target.selectionStart;
    
    // إعادة التركيز والموضع في الـ next tick
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  // دالة الضغط على Enter
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer();
    }
  }, [submitAnswer]);

  // التأكد من التركيز
  const handleInputClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // منع فقدان التركيز
  const handleInputBlur = useCallback((e) => {
    // إعادة التركيز فوراً إذا لم يكن السبب هو النقر على زر
    setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        const isButtonClick = document.activeElement && document.activeElement.tagName === 'BUTTON';
        if (!isButtonClick) {
          inputRef.current.focus();
        }
      }
    }, 10);
  }, []);

  // key ثابت للـ input لمنع إعادة إنشاؤه
  const inputKey = useMemo(() => {
    return `answer-input-${questionNumber}-stable-${preventRerenderRef.current}`;
  }, [questionNumber]);

  // تحديث counter عند تغيير السؤال فقط
  useEffect(() => {
    preventRerenderRef.current += 1;
  }, [questionNumber]);

  // صفحة الانتظار
  const WaitingScreen = () => (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center p-8">
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-lg mx-auto">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            🧩 غرفة التلميحات
          </h2>
          
          <div className="mb-8">
            <p className="text-white/70 mb-2">رمز الغرفة:</p>
            <p className="text-3xl font-mono font-bold text-white bg-white/10 rounded-xl px-4 py-2 border border-white/20">
              {stableRoomId}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-white/70 mb-4">اللاعبون في الغرفة ({players.length}):</p>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-white font-medium">{player.playerName}</span>
                  <div className="flex items-center gap-2">
                    {player.isHost && (
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg font-bold">
                        👑 مضيف
                      </span>
                    )}
                    <span className="text-xs text-white/60">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* تنبيه قواعد اللعبة الجديدة */}
          {/* <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
            <p className="text-green-400 text-sm text-center">
              ⚡ كل لاعب يتحكم في تلميحاته الخاصة - من يجيب أولاً يفوز!
            </p>
          </div> */}

          {stableIsHost && players.length >= 2 && (
            <button
              onClick={startGame}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
            >
              🚀 بدء اللعبة
            </button>
          )}

          {stableIsHost && players.length < 2 && (
            <p className="text-yellow-400">⏳ في انتظار لاعب آخر للبدء...</p>
          )}

          {!stableIsHost && (
            <p className="text-blue-400">⏳ في انتظار بدء اللعبة...</p>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={onExit}
              className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              ← خروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // شاشة اللعب
  const GameScreen = () => {
    const myCurrentClueIndex = playerClueIndex[stablePlayerName] || 0;
    const maxClueIndex = Math.max(...Object.values(playerClueIndex).concat([0]));
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 min-h-screen">
          {/* الهيدر */}
          <div className="flex justify-between items-center mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="text-white">
              <h3 className="text-lg font-bold">السؤال {questionNumber} من {totalQuestions}</h3>
              <p className="text-sm text-white/70">الفئة: {currentQuestion?.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">نقاطك</p>
              <p className="text-2xl font-bold text-white">{gameScores[stablePlayerName] || 0}</p>
            </div>
          </div>

          {/* إعلان الفائز */}
          {gameWinner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl text-center">
              <h3 className="text-xl font-bold text-yellow-400">
                🏆 {gameWinner === stablePlayerName ? 'أنت الفائز!' : `${gameWinner} فاز!`}
              </h3>
            </div>
          )}

          {/* التلميحات */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">🧩 التلميحات</h2>
                <p className="text-white/70">خمن الإجابة من التلميحات المعطاة</p>
              </div>

              {/* عرض التلميحات - بناءً على أعلى مستوى وصل إليه أي لاعب */}
              <div className="grid gap-4 mb-6">
                {currentQuestion?.clues.slice(0, maxClueIndex + 1).map((clue, index) => (
                  <div
                    key={`clue-${index}-${questionNumber}`}
                    className={`p-4 rounded-2xl border transition-all duration-500 ${
                      index <= myCurrentClueIndex
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50'
                        : 'bg-white/5 border-white/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index <= myCurrentClueIndex
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-white/20'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-lg font-medium ${
                        index <= myCurrentClueIndex ? 'text-white' : 'text-gray-500'
                      }`}>
                        {index <= myCurrentClueIndex ? clue : '🔒 مقفل'}
                      </span>
                      {index === myCurrentClueIndex && (
                        <span className="ml-auto text-yellow-400 font-bold">
                          {calculatePoints(index + 1)} نقطة متاحة لك
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* منطقة الإجابة */}
              {!showCorrectAnswer && !gameWinner && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white/70">المحاولات المتبقية:</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < attemptsLeft ? 'bg-green-500' : 'bg-red-500/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {!hasAnswered && attemptsLeft > 0 && (
                    <div className="flex gap-4">
                      <input
                        key={inputKey}
                        ref={inputRef}
                        type="text"
                        value={myAnswer}
                        onChange={handleAnswerChange}
                        onClick={handleInputClick}
                        onBlur={handleInputBlur}
                        placeholder="اكتب إجابتك هنا..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-300"
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        autoCorrect="off"
                        data-stable="true"
                      />
                      <button
                        onClick={submitAnswer}
                        disabled={!myAnswer.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        إرسال
                      </button>
                    </div>
                  )}

                  {/* زر التلميح الإضافي لكل لاعب */}
                  {!hasAnswered && attemptsLeft > 0 && myCurrentClueIndex < currentQuestion?.clues.length - 1 && !gameWinner && (
                    <button
                      onClick={requestNextClue}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                    >
                      💡 تلميح إضافي لي (-20 نقطة من نقاطي)
                    </button>
                  )}
                </div>
              )}

              {/* الإجابة الصحيحة */}
              {showCorrectAnswer && (
                <div className="text-center">
                  <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-2xl">
                    <h3 className="text-2xl font-bold text-white mb-2">✅ الإجابة الصحيحة:</h3>
                    <p className="text-3xl font-bold text-green-400">{currentQuestion?.answer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* أزرار التحكم للمضيف */}
          {stableIsHost && (
            <div className="text-center space-y-4">
              {!showCorrectAnswer && gameWinner && (
                <button
                  onClick={revealAnswer}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                >
                  🔍 إظهار الإجابة
                </button>
              )}

              {showCorrectAnswer && questionNumber < totalQuestions && (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                >
                  ➡️ السؤال التالي
                </button>
              )}
            </div>
          )}

          {/* عرض حالة التلميحات للاعبين */}
          {/* <div className="fixed left-4 top-20 w-64 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <h3 className="text-white font-bold mb-3">👥 حالة اللاعبين</h3>
            <div className="space-y-2">
              {Object.entries(playerClueIndex).map(([playerId, clueIndex]) => (
                <div
                  key={`player-${playerId}-${questionNumber}`}
                  className={`flex justify-between items-center p-2 rounded-lg ${
                    playerId === stablePlayerName ? 'bg-purple-500/20 border border-purple-400/50' : 'bg-white/5'
                  }`}
                >
                  <span className="text-white text-sm">{playerId}</span>
                  <span className="text-white font-bold">تلميح {clueIndex + 1}</span>
                </div>
              ))}
            </div>
          </div> */}

          {/* الترتيب الجانبي */}
          <div className="fixed right-4 top-20 w-64 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <h3 className="text-white font-bold mb-3">🏆 الترتيب</h3>
            <div className="space-y-2">
              {Object.entries(gameScores)
                .sort(([,a], [,b]) => b - a)
                .map(([playerId, score], index) => (
                  <div
                    key={`score-${playerId}-${questionNumber}`}
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      playerId === stablePlayerName ? 'bg-purple-500/20 border border-purple-400/50' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-white text-sm"> {playerId}</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // شاشة النتائج النهائية
  const ResultsScreen = () => {
    const sortedScores = Object.entries(gameScores).sort(([,a], [,b]) => b - a);
    const winner = sortedScores[0];
    const isWinner = winner && winner[0] === stablePlayerName;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-8">
              🏆 انتهت اللعبة!
            </h2>

            {isWinner && (
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-2xl">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-yellow-400">مبروك! أنت الفائز!</h3>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">🏅 الترتيب النهائي</h3>
              <div className="space-y-3">
                {sortedScores.map(([playerId, score], index) => (
                  <div
                    key={`final-${playerId}`}
                    className={`flex justify-between items-center p-4 rounded-2xl border ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏃'}
                      </span>
                      <span className="text-white font-bold">{playerId}</span>
                    </div>
                    <span className="text-white font-bold text-xl">{score} نقطة</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onExit}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                🏠 العودة للرئيسية
              </button>
              {stableIsHost && (
                <button
                  onClick={() => {
                    setGamePhase('waiting');
                    setQuestionNumber(1);
                    setGameScores({});
                    setCurrentQuestion(null);
                    setAttemptsLeft(3);
                    setHasAnswered(false);
                    setShowCorrectAnswer(false);
                    setMyAnswer('');
                    setPlayerClueIndex({});
                    setGameWinner(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  🔄 لعبة جديدة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // عرض الشاشة المناسبة
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>جاري الاتصال...</p>
        </div>
      </div>
    );
  }

  if (gamePhase === 'waiting') return <WaitingScreen />;
  if (gamePhase === 'playing') return <GameScreen />;
  if (gamePhase === 'finished') return <ResultsScreen />;

  return null;
}