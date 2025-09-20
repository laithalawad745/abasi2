// components/PlayerCareerGame.jsx - الحل النهائي لمشكلة إرسال السؤالين
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playerCareerData, searchPlayers, isValidPlayerAnswer, isValidPlayerName, uniquePlayerNames } from '../app/data/playerCareerData';
import Link from 'next/link';

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
  const [gameScores, setGameScores] = useState(() => ({
    [playerId]: 0,
    [opponentId]: 0
  }));
  
  // إعدادات اللعبة
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [usedPlayers, setUsedPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  
  // 🆕 نظام المحاولات - مطابق للتلميحات التدريجية
const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);
  
  // 🆕 متغيرات الفائز والانتقال التلقائي - مطابق للتلميحات
  const [roundWinner, setRoundWinner] = useState(null); // من فاز في هذا السؤال
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false); // إظهار الإجابة الصحيحة
  const [playersFinished, setPlayersFinished] = useState(new Set()); // تتبع اللاعبين الذين انتهوا
  
  // 🔍 نظام البحث - مطابق للتلميحات التدريجية
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isValidAnswer, setIsValidAnswer] = useState(false);
  
  // 🔧 الحل النهائي - استخدام useRef بدلاً من state
  const lastQuestionSentTime = useRef(0);
  const transitionTimeoutRef = useRef(null);
  
  // مرجع القناة
  const channelRef = useRef(null);
  const searchInputRef = useRef(null);

  // إعداد Pusher
  useEffect(() => {
    if (pusher && roomId) {
      const gameChannel = pusher.subscribe(`player-career-${roomId}`);
      channelRef.current = gameChannel;

      // استقبال بداية الجولة الجديدة
      gameChannel.bind('new-question', (data) => {
        console.log('🆕 سؤال جديد:', data);
        setCurrentPlayer(data.player);
        setCurrentRound(data.round);
        setGamePhase('showing-career');
        
        // 🔧 إصلاح: التأكد من تهيئة النقاط للجميع
        if (data.round === 1) {
          setGameScores({
            [playerId]: 0,
            [opponentId]: 0
          });
          console.log(' تهيئة النقاط للعبة جديدة');
        }
        
        // إعادة تعيين كل شيء للسؤال الجديد
        setShowingAnswer(false);
        setHasAnswered(false);
        setCanAnswer(true);
setAttemptsLeft(3);
        setRoundWinner(null);
        setShowCorrectAnswer(false);
        setPlayersFinished(new Set());
        
        // 🔧 تنظيف timeout السابق
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = null;
        }
        
        // إعادة تعيين نظام البحث
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setIsValidAnswer(false);
        
        if (searchInputRef.current) {
          setTimeout(() => {
            searchInputRef.current.focus();
          }, 100);
        }
      });

      // 🆕 استقبال إجابة اللاعب - إصلاح تحديث النقاط + آلية عدم الفوز
      gameChannel.bind('player-answered', (data) => {
        console.log('📨 إجابة مستلمة:', data);
        
        if (data.isCorrect && !roundWinner) {
          // هذا اللاعب فاز بالسؤال!
          setRoundWinner(data.playerId);
          
          if (data.playerId === playerId) {
            console.log('🎉 أنت فزت بهذا السؤال!');
          } else {
            console.log('😔 فاز المنافس بهذا السؤال');
          }
          
          // تحديث النقاط بطريقة أكثر مرونة
          setGameScores(prev => {
            const newScores = { ...prev };
            
            // تهيئة النقاط إذا لم تكن موجودة
            if (!(playerId in newScores)) {
              newScores[playerId] = 0;
            }
            if (!(opponentId in newScores)) {
              newScores[opponentId] = 0;
            }
            
            // تحديد اللاعب الفائز وإضافة النقاط
            if (data.playerId === playerId) {
              newScores[playerId] += data.points;
            } else {
              newScores[opponentId] += data.points;
            }
            
            console.log('🏆 تحديث النقاط النهائي:');
            console.log('- اللاعب الحالي:', playerId, '=', newScores[playerId]);
            console.log('- المنافس:', opponentId, '=', newScores[opponentId]);
            
            return newScores;
          });
          
          // إظهار الإجابة الصحيحة بعد ثانيتين
          setTimeout(() => {
            setShowCorrectAnswer(true);
          }, 2000);
          
          // بدء عملية الانتقال التلقائي بعد 5 ثوانِ
          setTimeout(() => {
            if (isHost) {
              if (currentRound >= totalRounds) {
                // انتهاء اللعبة
                setGameScores(currentScores => {
                  const playerScore = currentScores[playerId] || 0;
                  const opponentScore = currentScores[opponentId] || 0;
                  
                  let finalWinner;
                  if (playerScore > opponentScore) {
                    finalWinner = playerId;
                  } else if (opponentScore > playerScore) {
                    finalWinner = opponentId;
                  } else {
                    finalWinner = playerId; // تعادل
                  }
                  
                  setWinner(finalWinner);
                  setGameFinished(true);
                  setGamePhase('finished');
                  return currentScores;
                });
              } else {
                // الانتقال للسؤال التالي
                nextRound();
              }
            }
          }, 5000);
          
        } else if (!data.isCorrect) {
          // إجابة خاطئة - لا نفعل شيء مع النقاط
          if (data.playerId !== playerId) {
            console.log(`❌ ${data.playerId} أجاب بشكل خاطئ (محاولات متبقية: ${data.attemptsLeft})`);
          }
        }
        
        // 🆕 تتبع اللاعبين الذين انتهوا من المحاولات
        if (data.attemptsLeft === 0 || data.isCorrect) {
          setPlayersFinished(prev => {
            const newFinished = new Set(prev);
            newFinished.add(data.playerId);
            
            console.log('🔚 لاعب انتهى:', data.playerId);
            console.log('🔚 اللاعبون المنتهون:', Array.from(newFinished));
            
            // 🔧 الحل النهائي - منع التكرار باستخدام timeout + timestamp
            if (newFinished.size >= 2 && !roundWinner && isHost) {
              console.log('🚫 لا يوجد فائز - التحضير للانتقال...');
              
              // 🛡️ منع التكرار - فحص آخر مرة تم إرسال سؤال فيها
              const now = Date.now();
              if (now - lastQuestionSentTime.current < 3000) { // منع الإرسال خلال 3 ثوانِ
                console.log('🚫 منع إرسال سؤال مكرر - تم إرسال سؤال مؤخراً');
                return newFinished;
              }
              
              // 🎯 استخدام timeout لمنع التداخل
              if (transitionTimeoutRef.current) {
                console.log('🚫 إلغاء timeout سابق');
                clearTimeout(transitionTimeoutRef.current);
              }
              
              transitionTimeoutRef.current = setTimeout(() => {
                // التحقق المضاعف من أنه لا يوجد فائز
                if (!roundWinner) {
                  console.log('🚀 تنفيذ الانتقال للسؤال التالي...');
                  
                  // إظهار الإجابة الصحيحة أولاً
                  setShowCorrectAnswer(true);
                  
                  // ثم الانتقال للسؤال التالي
                  setTimeout(() => {
                    if (currentRound >= totalRounds) {
                      // انتهاء اللعبة
                      setGameScores(currentScores => {
                        const playerScore = currentScores[playerId] || 0;
                        const opponentScore = currentScores[opponentId] || 0;
                        
                        let finalWinner;
                        if (playerScore > opponentScore) {
                          finalWinner = playerId;
                        } else if (opponentScore > playerScore) {
                          finalWinner = opponentId;
                        } else {
                          finalWinner = playerId; // تعادل
                        }
                        
                        setWinner(finalWinner);
                        setGameFinished(true);
                        setGamePhase('finished');
                        return currentScores;
                      });
                    } else {
                      // الانتقال للسؤال التالي
                      nextRound();
                    }
                  }, 1500);
                }
              }, 1000); // انتظار ثانية واحدة للتأكد
            }
            
            return newFinished;
          });
        }
        
        // تحديث حالة اللاعب الحالي فقط
        if (data.playerId === playerId) {
          setHasAnswered(true);
          setCanAnswer(false);
          setAttemptsLeft(data.attemptsLeft);
          
          if (data.isCorrect) {
            console.log('✅ إجابة صحيحة! تم إخفاء نظام البحث');
            // إخفاء نظام البحث
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            setIsValidAnswer(false);
          } else {
            console.log('❌ إجابة خاطئة. المحاولات المتبقية:', data.attemptsLeft);
            if (data.attemptsLeft > 0) {
              // السماح بمحاولة أخرى
              setTimeout(() => {
                setHasAnswered(false);
                setCanAnswer(true);
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                setIsValidAnswer(false);
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 2000);
            }
          }
        }
      });

      return () => {
        // تنظيف المراجع عند إلغاء المكون
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        if (gameChannel) {
          pusher.unsubscribe(`player-career-${roomId}`);
        }
      };
    }
  }, [pusher, roomId, playerId, opponentId, isHost, currentRound, totalRounds, gameScores, roundWinner]);

  // 🔍 تحديث الاقتراحات - مطابق للتلميحات التدريجية (منع الإدخال اليدوي)
  const handleSearchChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    // 🔍 البحث عن اقتراحات
    if (newValue.trim().length >= 2) {
      const foundSuggestions = searchPlayers(newValue.trim());
      setSuggestions(foundSuggestions);
      setShowSuggestions(foundSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
      
      // 🔧 إصلاح: منع الإدخال اليدوي - isValidAnswer = false دائماً عند الكتابة
      setIsValidAnswer(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
    }
    
    // حفظ موضع المؤشر
    const cursorPosition = e.target.selectionStart;
    
    // إعادة التركيز والموضع في الـ next tick
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  // 🎯 اختيار اقتراح من القائمة - مطابق للتلميحات التدريجية
  const selectSuggestion = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    setIsValidAnswer(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // التركيز مرة أخرى على الحقل
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
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
  }, [showSuggestions, suggestions, selectedSuggestionIndex, selectSuggestion, isValidAnswer]);

  // 🆕 إرسال الإجابة - تحديث واحد فقط
  const submitAnswer = useCallback(() => {
    if (!canAnswer || hasAnswered || !currentPlayer || !searchQuery.trim()) return;
    
    if (!isValidAnswer) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      return;
    }
    
    console.log('🎯 إرسال إجابة:', searchQuery, 'الصحيحة:', currentPlayer.name);
    
    // 🆕 تقييم الإجابة محلياً (كل لاعب يقيم إجابته بنفسه)
    const isCorrect = isValidPlayerAnswer(searchQuery.trim(), currentPlayer.name);
    const points = isCorrect ? 100 : 0;
    const newAttemptsLeft = isCorrect ? attemptsLeft : attemptsLeft - 1;
    
    console.log('🔍 تقييم الإجابة:', isCorrect ? '✅ صحيحة' : '❌ خاطئة');
    
    // 🔧 إصلاح: تحديث الحالة المحلية فوراً (بدون تحديث النقاط هنا)
    if (isCorrect) {
      setHasAnswered(true);
      console.log('✅ أحسنت! ستحصل على', points, 'نقطة (ستُضاف عبر Pusher)');
    } else {
      setAttemptsLeft(newAttemptsLeft);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
      
      if (newAttemptsLeft > 0) {
        console.log(`❌ إجابة خاطئة! متبقي ${newAttemptsLeft} محاولات`);
      } else {
        setHasAnswered(true);
        console.log('❌ انتهت محاولاتك!');
      }
    }
    
    // إرسال الإجابة للجميع مع التقييم
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `player-career-${roomId}`,
        event: 'player-answered',
        data: {
          playerId: playerId,
          playerName: playerId,
          answer: searchQuery.trim(),
          correctAnswer: currentPlayer.name,
          isCorrect: isCorrect,
          points: points,
          attemptsLeft: newAttemptsLeft,
          timestamp: Date.now()
        }
      })
    }).then(() => {
      console.log('📤 تم إرسال الإجابة بنجاح');
    }).catch((error) => {
      console.error('❌ خطأ في إرسال الإجابة:', error);
    });
  }, [canAnswer, hasAnswered, currentPlayer, searchQuery, isValidAnswer, playerId, roomId, attemptsLeft]);

  // التعامل مع النقر خارج الاقتراحات
  const handleInputBlur = useCallback((e) => {
    // إخفاء الاقتراحات بعد تأخير للسماح بالنقر عليها
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  }, []);

  // التركيز على المربع
  const handleInputClick = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      
      // إظهار الاقتراحات إذا كان هناك نص
      if (searchQuery.trim().length >= 2) {
        const foundSuggestions = searchPlayers(searchQuery.trim());
        setSuggestions(foundSuggestions);
        setShowSuggestions(foundSuggestions.length > 0);
      }
    }
  }, [searchQuery]);

  // 🔧 الجولة التالية - محسنة مع حماية من التكرار
  const nextRound = () => {
    if (!isHost) return;
    
    // 🛡️ حماية إضافية - التحقق من آخر مرة تم إرسال سؤال فيها
    const now = Date.now();
    if (now - lastQuestionSentTime.current < 2000) { // منع الإرسال خلال ثانيتين
      console.log('🚫 منع إرسال سؤال مكرر - تم إرسال سؤال مؤخراً');
      return;
    }
    
    lastQuestionSentTime.current = now;
    
    const nextRoundNumber = currentRound + 1;
    
    if (nextRoundNumber <= totalRounds) {
      // اختيار لاعب جديد
      const availablePlayers = playerCareerData.filter(p => 
        !usedPlayers.includes(p.id)
      );
      
      let newPlayer;
      if (availablePlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        newPlayer = availablePlayers[randomIndex];
      } else {
        // إذا انتهت الأسئلة، اختر عشوائياً
        const randomIndex = Math.floor(Math.random() * playerCareerData.length);
        newPlayer = playerCareerData[randomIndex];
      }
      
      // إضافة اللاعب للمستخدمين
      setUsedPlayers(prev => [...prev, newPlayer.id]);
      
      console.log('📤 إرسال سؤال جديد:', newPlayer.name, 'الجولة:', nextRoundNumber);
      
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `player-career-${roomId}`,
          event: 'new-question',
          data: {
            player: newPlayer,
            round: nextRoundNumber,
            hostId: playerId
          }
        })
      }).catch(console.error);
    } else {
      // انتهاء اللعبة
      const playerScore = gameScores[playerId] || 0;
      const opponentScore = gameScores[opponentId] || 0;
      
      let finalWinner;
      if (playerScore > opponentScore) {
        finalWinner = playerId;
      } else if (opponentScore > playerScore) {
        finalWinner = opponentId;
      } else {
        finalWinner = playerId; // تعادل
      }
      
      setWinner(finalWinner);
      setGameFinished(true);
      setGamePhase('finished');
    }
  };

  // بدء اللعبة (للمضيف فقط)
  const startGame = () => {
    if (!isHost) return;
    
    const randomIndex = Math.floor(Math.random() * playerCareerData.length);
    const firstPlayer = playerCareerData[randomIndex];
    
    setUsedPlayers([firstPlayer.id]);
    lastQuestionSentTime.current = Date.now();
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `player-career-${roomId}`,
        event: 'new-question',
        data: {
          player: firstPlayer,
          round: 1,
          hostId: playerId
        }
      })
    }).catch(console.error);
  };

  // في مرحلة الانتظار
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">🔍 مسيرة اللاعبين</h1>
            <p className="text-xl text-gray-400 mb-8">انتظار بدء اللعبة...</p>
            
            {isHost && (
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300"
              >
                🚀 بدء اللعبة
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // اللعبة منتهية
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <h1 className="text-6xl font-bold text-white mb-8"> انتهت اللعبة!</h1>
            
            <div className="text-xl text-white space-y-2">
              <div>أنت: {gameScores[playerId] || 0} نقطة</div>
              <div>المنافس: {gameScores[opponentId] || 0} نقطة</div>
            </div>
            
            <Link 
              href="/"
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 inline-block mt-8"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // الواجهة الرئيسية للعبة
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* شريط النقاط - مُحسن لعرض النقاط الصحيحة */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-6">
            <div className={`px-6 py-3 border-2 rounded-2xl font-bold text-xl transition-all duration-300 ${
              roundWinner === playerId
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/50 text-green-300 animate-pulse'
                : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50 text-blue-300'
            }`}>
              أنت: {gameScores[playerId] || 0} نقطة
              {roundWinner === playerId && <span className="ml-2">🏆</span>}
            </div>
            
            <div className={`px-6 py-3 border-2 rounded-2xl font-bold text-xl transition-all duration-300 ${
              roundWinner === opponentId
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/50 text-green-300 animate-pulse'
                : 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/50 text-red-300'
            }`}>
              المنافس: {gameScores[opponentId] || 0} نقطة
              {roundWinner === opponentId && <span className="ml-2">🏆</span>}
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
                انظر إلى مسيرته واكتشف هويته - لديك محاولتين!
              </p>
            </div>

            {/* مسيرة اللاعب */}
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

                {/* المسيرة الكاملة */}
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">
                      📋 المسيرة الكاملة
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    {currentPlayer.career.map((club, index) => (
                      <React.Fragment key={index}>
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
                          <div className="mt-2 text-xs text-gray-400 font-bold text-center max-w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {club.name}
                          </div>
                        </div>
                        
                        {index < currentPlayer.career.length - 1 && (
                          <div className="text-lg md:text-xl text-cyan-400 animate-pulse mx-1">
                            ➡️
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* 🆕 إظهار من فاز بالسؤال - مطابق للتلميحات التدريجية */}
                {roundWinner && !showCorrectAnswer && (
                  <div className="text-center">
                    <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-2xl">
                      <div className="text-2xl text-yellow-400 font-bold">
                        🎉 {roundWinner === playerId ? 'أنت فزت بهذا السؤال!' : 'فاز المنافس بهذا السؤال!'}
                      </div>
                    </div>
                  </div>
                )}

                {/* مربع البحث والإجابة */}
                {!showCorrectAnswer && !roundWinner && (
                  <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-purple-400/50 rounded-2xl p-6">
                    {/* عداد المحاولات */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-4">
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
                    </div>

                    <h3 className="text-2xl font-bold text-center text-purple-400 mb-6">
                      ✍️ أدخل اسم اللاعب
                    </h3>
                    
                    {/* مربع البحث مطابق للتلميحات التدريجية */}
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="ابحث عن اسم اللاعب..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyPress}
                        onClick={handleInputClick}
                        onBlur={handleInputBlur}
                        disabled={!canAnswer || hasAnswered}
                        className={`w-full px-6 py-4 pr-14 text-xl text-white bg-slate-800/50 border-2 rounded-2xl focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                          isValidAnswer 
                            ? 'border-green-500 focus:border-green-400 shadow-lg shadow-green-500/20' 
                            : showSuggestions 
                              ? 'border-blue-500 focus:border-blue-400' 
                              : 'border-gray-600 focus:border-purple-400'
                        }`}
                      />
                      
                      {/* أيقونة البحث */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* قائمة الاقتراحات */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-6 py-3 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                                index === selectedSuggestionIndex 
                                  ? 'bg-purple-600/50 text-white' 
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                              onClick={() => selectSuggestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* زر الإرسال */}
                    <button
                      onClick={submitAnswer}
                      disabled={!canAnswer || hasAnswered || !isValidAnswer}
                      className={`w-full mt-6 px-6 py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
                        isValidAnswer && canAnswer && !hasAnswered
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 shadow-lg shadow-green-500/30'
                          : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {hasAnswered ? '⏳ انتظار...' : '✈️ إرسال الإجابة'}
                    </button>
                  </div>
                )}

                {/* عرض الإجابة الصحيحة */}
                {showCorrectAnswer && (
                  <div className="text-center mt-8">
                    <div className="inline-block px-8 py-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50 rounded-2xl">
                      <h4 className="text-2xl text-emerald-400 font-bold mb-2">
                        ✅ الإجابة الصحيحة:
                      </h4>
                      <p className="text-3xl font-bold text-white">
                        {currentPlayer.name}
                      </p>
                      {!roundWinner && (
                        <p className="text-xl text-gray-400 mt-2">
                          لم يجب أي لاعب إجابة صحيحة
                        </p>
                      )}
                    </div>
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