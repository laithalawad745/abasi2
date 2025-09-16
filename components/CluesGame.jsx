// components/CluesGame.jsx - حل نهائي لمشكلة الإدخال + إضافة زر عجزت عن الإجابة
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Pusher from 'pusher-js';
import { 
  getRandomCluesQuestion, 
  calculatePoints, 
  loadUsedCluesQuestions, 
  saveUsedCluesQuestions,
  clearUsedCluesQuestions,
  getCluesUsageStats,
  searchCluesAnswers,
  isValidCluesAnswer
} from '../app/data/cluesGameData';
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
  
  // 🆕 إضافة state جديد لتتبع من ضغط على زر "عجزت عن الإجابة"
  const [playersGiveUp, setPlayersGiveUp] = useState([]); // قائمة اللاعبين الذين ضغطوا زر عجزت
  const [hasGivenUp, setHasGivenUp] = useState(false); // هل ضغط اللاعب الحالي على الزر
  
  // 🆕 نظام إدارة الأسئلة المستخدمة - مطابق للألعاب الأخرى
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [isClient, setIsClient] = useState(false);

  // 🆕 نظام الاقتراحات التلقائية
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isValidAnswer, setIsValidAnswer] = useState(false);

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

  // 🆕 تحميل الأسئلة المستخدمة من localStorage عند بدء التطبيق
  useEffect(() => {
    setIsClient(true);
    const savedUsedQuestions = loadUsedCluesQuestions();
    setUsedQuestions(savedUsedQuestions);
    console.log('📊 تم تحميل', savedUsedQuestions.size, 'سؤال مستخدم مسبقاً');
  }, []);

  // 🆕 حفظ الأسئلة المستخدمة في localStorage عند تغييرها
  useEffect(() => {
    if (isClient && usedQuestions.size > 0) {
      saveUsedCluesQuestions(usedQuestions);
    }
  }, [usedQuestions, isClient]);

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

  // 🆕 دالة الاستسلام - عجزت عن الإجابة
  const handleGiveUp = useCallback(() => {
    if (hasGivenUp || hasAnswered || gameWinner) return;

    // إرسال إشعار الاستسلام للجميع
    triggerPusherEvent('player-give-up', {
      playerName: stablePlayerName,
      questionNumber: questionNumber
    });

    setHasGivenUp(true);
    showInfoToast('تم تسجيل استسلامك');
  }, [hasGivenUp, hasAnswered, gameWinner, stablePlayerName, questionNumber, triggerPusherEvent]);

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
      // 🆕 إعادة تعيين الاستسلام
      setPlayersGiveUp([]);
      setHasGivenUp(false);
      // 🆕 إعادة تعيين الاقتراحات
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
      setSelectedSuggestionIndex(-1);
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

    // 🆕 استقبال الاستسلام
    channel.bind('player-give-up', (data) => {
      console.log('🏳️ لاعب استسلم:', data.playerName);
      
      setPlayersGiveUp(prev => {
        if (!prev.includes(data.playerName)) {
          const newGiveUpList = [...prev, data.playerName];
          
          // تحقق من أن جميع اللاعبين استسلموا
          if (newGiveUpList.length >= players.length && players.length > 0) {
            // جميع اللاعبين استسلموا - تعادل
            setTimeout(() => {
              if (stableIsHost) {
                showInfoToast('جميع اللاعبين استسلموا - تعادل!');
                // الانتقال للسؤال التالي أو إظهار الإجابة
                triggerPusherEvent('show-answer', {
                  isLastQuestion: questionNumber >= totalQuestions,
                  isDraw: true
                });
              }
            }, 1000);
          } else {
            // إشعار عادي
            if (data.playerName !== stablePlayerName) {
              showInfoToast(`${data.playerName} استسلم`);
            }
          }
          
          return newGiveUpList;
        }
        return prev;
      });
    });

    // إظهار الإجابة الصحيحة
    channel.bind('show-answer', (data) => {
      console.log('✅ إظهار الإجابة الصحيحة');
      setShowCorrectAnswer(true);
      
      if (data.isDraw) {
        showInfoToast('السؤال انتهى بتعادل');
      }
      
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
      // 🆕 إعادة تعيين الاستسلام
      setPlayersGiveUp([]);
      setHasGivenUp(false);
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
    
    const question = getRandomCluesQuestion(usedQuestions);
    if (!question) {
      showErrorToast('لا توجد أسئلة متاحة!');
      return;
    }
    
    // إضافة السؤال للأسئلة المستخدمة
    setUsedQuestions(prev => new Set([...prev, question.id]));
    
    const playerNames = players.map(p => p.playerName);
    
    triggerPusherEvent('game-started', {
      question: question,
      questionNumber: 1,
      players: playerNames
    });
    
    console.log('🎮 بدء لعبة التلميحات مع', usedQuestions.size + 1, 'سؤال مستخدم');
  }, [stableIsHost, triggerPusherEvent, players, usedQuestions]);

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

    // 🎯 التحقق من صحة الإجابة قبل الإرسال
    if (!isValidAnswer) {
      showErrorToast('يجب اختيار إجابة من القائمة المقترحة');
      return;
    }

    const isCorrect = currentQuestion?.answer === myAnswer.trim();
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
      // إعادة تعيين الاقتراحات
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
      
      if (newAttemptsLeft > 0) {
        showErrorToast(`إجابة خاطئة! متبقي ${newAttemptsLeft} محاولات`);
      } else {
        setHasAnswered(true);
        showErrorToast('انتهت محاولاتك!');
      }
    }
  }, [myAnswer, hasAnswered, attemptsLeft, gameWinner, currentQuestion, playerClueIndex, stablePlayerName, triggerPusherEvent, isValidAnswer]);

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
    
    const question = getRandomCluesQuestion(usedQuestions);
    if (!question) {
      showErrorToast('لا توجد أسئلة متاحة!');
      return;
    }
    
    // إضافة السؤال للأسئلة المستخدمة
    setUsedQuestions(prev => new Set([...prev, question.id]));
    
    triggerPusherEvent('next-question', {
      question: question,
      questionNumber: questionNumber + 1
    });
    
    console.log('➡️ السؤال التالي:', question.answer, '- إجمالي الأسئلة المستخدمة:', usedQuestions.size + 1);
  }, [stableIsHost, questionNumber, totalQuestions, triggerPusherEvent, usedQuestions]);

  // 🗑️ إعادة تعيين الأسئلة المستخدمة (دالة اختيارية)
  const resetUsedQuestions = useCallback(() => {
    setUsedQuestions(new Set());
    clearUsedCluesQuestions();
    showSuccessToast('تم إعادة تعيين جميع الأسئلة');
  }, []);

  // دالة تغيير الإجابة - بحل جذري لمشكلة التركيز + الاقتراحات التلقائية
  const handleAnswerChange = useCallback((e) => {
    const newValue = e.target.value;
    setMyAnswer(newValue);
    
    // 🔍 البحث عن اقتراحات
    if (newValue.trim().length >= 1) {
      const foundSuggestions = searchCluesAnswers(newValue.trim());
      setSuggestions(foundSuggestions);
      setShowSuggestions(foundSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
      
      // التحقق من صحة الإجابة
      setIsValidAnswer(isValidCluesAnswer(newValue.trim()));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
    }
    
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

  // 🎯 اختيار اقتراح من القائمة
  const selectSuggestion = useCallback((suggestion) => {
    setMyAnswer(suggestion);
    setIsValidAnswer(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // التركيز مرة أخرى على الحقل
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  // 🎮 التعامل مع الكيبورد للاقتراحات
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        // اختيار الاقتراح المحدد
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else if (isValidAnswer) {
        // إرسال الإجابة إذا كانت صالحة
        submitAnswer();
      }
    } else if (e.key === 'Escape') {
      // إغلاق الاقتراحات
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, selectSuggestion, submitAnswer, isValidAnswer]);

  // التأكد من التركيز
  const handleInputClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // إظهار الاقتراحات إذا كان هناك نص
      if (myAnswer.trim().length >= 1) {
        const foundSuggestions = searchCluesAnswers(myAnswer.trim());
        setSuggestions(foundSuggestions);
        setShowSuggestions(foundSuggestions.length > 0);
      }
    }
  }, [myAnswer]);

  // Handle input blur
  const handleInputBlur = useCallback((e) => {
    // إخفاء الاقتراحات بعد تأخير للسماح بالنقر عليها
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  }, []);

  // مفتاح تحديث الـ input لحل مشكلة التركيز
  const [inputKey, setInputKey] = useState(0);

  // إعادة تعيين الـ input key عند تغيير السؤال
  useEffect(() => {
    setInputKey(prev => prev + 1);
    // إعادة تعيين جميع حالات الاقتراحات
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidAnswer(false);
    setSelectedSuggestionIndex(-1);
  }, [questionNumber]);

  if (gamePhase === 'finished') {
    const finalScores = Object.entries(gameScores).sort(([,a], [,b]) => b - a);
    const winner = finalScores[0];
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-2xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-8">🏆</h1>
          <h2 className="text-4xl font-bold text-white mb-6">انتهت اللعبة!</h2>
          
          {winner && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                🥇 الفائز: {winner[0]}
              </h3>
              <p className="text-xl text-white">بـ {winner[1]} نقطة</p>
            </div>
          )}

          {/* الترتيب النهائي */}
          <div className="mb-8 space-y-2">
            <h4 className="text-xl font-bold text-white mb-4">الترتيب النهائي:</h4>
            {finalScores.map(([player, score], index) => (
              <div 
                key={player} 
                className={`flex justify-between items-center p-3 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-400/50' : 'bg-white/5'
                }`}
              >
                <span className="text-white font-medium">#{index + 1} {player}</span>
                <span className="text-white font-bold">{score} نقطة</span>
              </div>
            ))}
          </div>

          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
              التلميحات
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

          {stableIsHost && players.length >= 2 && (
            <div className="space-y-4">
              <button
                onClick={startGame}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                 بدء اللعبة
              </button>
              
              {/* 📊 إحصائيات الأسئلة */}
              {/* {isClient && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/70 text-sm text-center mb-2">📊 إحصائيات الأسئلة</p>
                  <div className="flex justify-center gap-4 text-xs text-white/60">
                    <span>المستخدمة: {usedQuestions.size}</span>
                    <span>المتبقية: {getCluesUsageStats(usedQuestions).remaining}</span>
                    <span>الإجمالي: {getCluesUsageStats(usedQuestions).total}</span>
                  </div>
                  {usedQuestions.size > 0 && (
                    <button
                      onClick={resetUsedQuestions}
                      className="w-full mt-2 px-3 py-1 bg-gray-600/50 hover:bg-gray-600/70 text-white text-xs rounded-lg transition-all duration-300"
                    >
                      🗑️ إعادة تعيين الأسئلة
                    </button>
                  )}
                </div>
              )} */}
            </div>
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
    );
  }

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
                <h2 className="text-3xl font-bold text-white mb-2"> التلميحات</h2>
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

                  {!hasAnswered && attemptsLeft > 0 && !hasGivenUp && (
                    <div className="relative">
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <input
                            key={inputKey}
                            ref={inputRef}
                            type="text"
                            value={myAnswer}
                            onChange={handleAnswerChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder="ابدأ الكتابة  ..."
                            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors duration-300 ${
                              isValidAnswer 
                                ? 'border-green-500 focus:border-green-400 shadow-lg shadow-green-500/20' 
                                : showSuggestions 
                                  ? 'border-purple-500 focus:border-purple-400 shadow-lg shadow-purple-500/20'
                                  : 'border-white/20 focus:border-purple-500'
                            }`}
                            onKeyDown={handleKeyPress}
                            autoComplete="off"
                            spellCheck="false"
                            autoCapitalize="off"
                            autoCorrect="off"
                            data-stable="true"
                          />
                          
                          {/* 🔍 قائمة الاقتراحات */}
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                              {suggestions.map((suggestion, index) => (
                                <div
                                  key={suggestion}
                                  onClick={() => selectSuggestion(suggestion)}
                                  className={`px-4 py-3 text-white cursor-pointer transition-all duration-200 ${
                                    index === selectedSuggestionIndex
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'hover:bg-white/10'
                                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                    index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-current opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="font-medium">{suggestion}</span>
                                  </div>
                                </div>
                              ))}
                              
                              {/* تلميح للتعامل مع الكيبورد */}
                              {/* <div className="px-4 py-2 bg-white/5 border-t border-white/10 rounded-b-xl">
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                  <span>⬆️⬇️ للتنقل</span>
                                  <span>Enter للاختيار</span>
                                  <span>Esc للإغلاق</span>
                                </div>
                              </div> */}
                            </div>
                          )}
                          
                          {/* 🔍 رسالة عدم وجود نتائج */}
                          {showSuggestions && suggestions.length === 0 && myAnswer.trim().length >= 1 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 z-50">
                              <div className="flex items-center gap-2 text-white/70">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                <span>لا توجد إجابات مطابقة. حاول كتابة شيء آخر.</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={submitAnswer}
                          disabled={!isValidAnswer}
                          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                            isValidAnswer
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                          }`}
                        >
                          إرسال
                        </button>
                      </div>
                      
                      {/* 💡 نصائح للمستخدم */}
                      {!isValidAnswer && myAnswer.length > 0 && (
                        <div className="mt-2 text-center">
                          <p className="text-yellow-400 text-sm">
                            💡 ابدأ بكتابة جزء من الإجابة واختر من الاقتراحات
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🆕 زر "عجزت عن الإجابة" */}
                  {!hasAnswered && !hasGivenUp && !gameWinner && (
                    <div className="flex gap-4">
                      <button
                        onClick={handleGiveUp}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                      >
                        🏳️ عجزت عن الإجابة
                      </button>
                    </div>
                  )}

                  {/* إشعار الاستسلام */}
                  {hasGivenUp && (
                    <div className="p-3 bg-gray-600/20 border border-gray-500/50 rounded-xl text-center">
                      <p className="text-gray-300">لقد استسلمت - في انتظار باقي اللاعبين</p>
                      <p className="text-sm text-gray-400 mt-1">
                        استسلم {playersGiveUp.length} من أصل {players.length} لاعبين
                      </p>
                    </div>
                  )}

                  {/* زر التلميح الإضافي لكل لاعب */}
                  {!hasAnswered && attemptsLeft > 0 && myCurrentClueIndex < currentQuestion?.clues.length - 1 && !gameWinner && !hasGivenUp && (
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
              {/* {!showCorrectAnswer && gameWinner && (
                <button
                  onClick={revealAnswer}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                >
                  🔍 إظهار الإجابة
                </button>
              )} */}

              {/* 🆕 زر السؤال التالي عند استسلام الجميع */}
              {!showCorrectAnswer && !gameWinner && playersGiveUp.length >= players.length && players.length > 0 && questionNumber < totalQuestions && (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                >
                  ➡️ السؤال التالي (تعادل)
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
                    <span className="text-white text-sm">#{index + 1} {playerId}</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="fixed bottom-6 left-6">
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              ← خروج
            </button>
          </div>
        </div>
      </div>
    );
  };

  return <GameScreen />;
}