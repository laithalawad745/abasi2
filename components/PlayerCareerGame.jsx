// components/PlayerCareerGame.jsx - إضافة زر "عجزت عن السؤال" بدون تعديل آلية الانتقال الأصلية
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
  
  // نظام المحاولات - مطابق للتلميحات التدريجية
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);
  
  // متغيرات الفائز والانتقال التلقائي - مطابق للتلميحات
  const [roundWinner, setRoundWinner] = useState(null); // من فاز في هذا السؤال
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false); // إظهار الإجابة الصحيحة
  const [playersFinished, setPlayersFinished] = useState(new Set()); // تتبع اللاعبين الذين انتهوا
  
  // 🆕 إضافة نظام الاستسلام فقط - بدون تعديل باقي الآليات
  const [playersGiveUp, setPlayersGiveUp] = useState([]); // قائمة اللاعبين الذين ضغطوا زر عجزت
  const [hasGivenUp, setHasGivenUp] = useState(false); // هل ضغط اللاعب الحالي على الزر
  
  // نظام البحث - مطابق للتلميحات التدريجية
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isValidAnswer, setIsValidAnswer] = useState(false);
  
  // الحل النهائي - استخدام useRef بدلاً من state
  const lastQuestionSentTime = useRef(0);
  const transitionTimeoutRef = useRef(null);
  
  // مرجع القناة
  const channelRef = useRef(null);
  const searchInputRef = useRef(null);

  // 🆕 دالة الاستسلام - مطابقة للتلميحات بالضبط
  const handleGiveUp = useCallback(() => {
    if (hasGivenUp || hasAnswered || roundWinner) return;

    // إرسال إشعار الاستسلام للجميع
    triggerPusherEvent('player-give-up', {
      playerName: playerId,
      roundNumber: currentRound
    });

    setHasGivenUp(true);
    console.log('🏳️ تم تسجيل الاستسلام');
  }, [hasGivenUp, hasAnswered, roundWinner, playerId, currentRound]);

  // إرسال حدث عبر Pusher
  const triggerPusherEvent = useCallback(async (event, data) => {
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `player-career-${roomId}`,
          event: event,
          data: data
        })
      });
    } catch (error) {
      console.error('❌ خطأ في إرسال الحدث:', error);
    }
  }, [roomId]);

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
          console.log('🎯 تهيئة النقاط للعبة جديدة');
        }
        
        // إعادة تعيين كل شيء للسؤال الجديد
        setShowingAnswer(false);
        setHasAnswered(false);
        setCanAnswer(true);
        setAttemptsLeft(3);
        setRoundWinner(null);
        setShowCorrectAnswer(false);
        setPlayersFinished(new Set());
        
        // 🆕 إعادة تعيين حالات الاستسلام
        setPlayersGiveUp([]);
        setHasGivenUp(false);
        
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

      // 🆕 استقبال الاستسلام - إضافة جديدة بدون تعديل الآليات الأصلية
      gameChannel.bind('player-give-up', (data) => {
        console.log('🏳️ لاعب استسلم:', data.playerName);
        
        setPlayersGiveUp(prev => {
          if (!prev.includes(data.playerName)) {
            const newGiveUpList = [...prev, data.playerName];
            
            // إضافة اللاعب المستسلم لـ playersFinished لتفعيل الآلية الأصلية
            setPlayersFinished(prevFinished => {
              const newFinished = new Set(prevFinished);
              newFinished.add(data.playerName);
              
              console.log('🔚 اللاعبون المنتهون بعد الاستسلام:', Array.from(newFinished));
              
              // استخدام نفس الآلية الأصلية للانتقال
              if (newFinished.size >= 2 && !roundWinner && isHost) {
                console.log('🚫 لا يوجد فائز - التحضير للانتقال...');
                
                const now = Date.now();
                if (now - lastQuestionSentTime.current < 3000) {
                  console.log('🚫 منع إرسال سؤال مكرر - تم إرسال سؤال مؤخراً');
                  return newFinished;
                }
                
                if (transitionTimeoutRef.current) {
                  console.log('🚫 إلغاء timeout سابق');
                  clearTimeout(transitionTimeoutRef.current);
                }
                
                transitionTimeoutRef.current = setTimeout(() => {
                  if (!roundWinner) {
                    console.log('🚀 تنفيذ الانتقال للسؤال التالي...');
                    
                    // 🔧 إرسال event لإظهار الإجابة للجميع
                    triggerPusherEvent('show-correct-answer', {
                      playerName: currentPlayer?.name,
                      isLastRound: currentRound >= totalRounds,
                      currentScores: {
                        [playerId]: gameScores[playerId] || 0,
                        [opponentId]: gameScores[opponentId] || 0
                      }
                    });
                  }
                }, 1000);
              }
              
              return newFinished;
            });
            
            return newGiveUpList;
          }
          return prev;
        });
      });

      // 🆕 استقبال إظهار الإجابة الصحيحة للجميع
      gameChannel.bind('show-correct-answer', (data) => {
        console.log('✅ إظهار الإجابة الصحيحة للجميع:', data.playerName);
        setShowCorrectAnswer(true);
        
        setTimeout(() => {
          if (data.isLastRound) {
            // إرسال event لإنهاء اللعبة للجميع
            if (isHost) {
              triggerPusherEvent('game-ended', {
                finalScores: data.currentScores || {
                  [playerId]: gameScores[playerId] || 0,
                  [opponentId]: gameScores[opponentId] || 0
                }
              });
            }
          } else {
            // الانتقال للسؤال التالي
            if (isHost) {
              nextRound();
            }
          }
        }, 1500);
      });

      // 🆕 استقبال إنهاء اللعبة للجميع
      gameChannel.bind('game-ended', (data) => {
        console.log('🏁 انتهاء اللعبة للجميع:', data.finalScores);
        
        setGameScores(data.finalScores);
        
        const playerScore = data.finalScores[playerId] || 0;
        const opponentScore = data.finalScores[opponentId] || 0;
        
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
      });

      // 🔧 استقبال إجابة اللاعب - الآلية الأصلية بالضبط بدون تعديل
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
            
            // إضافة النقاط للفائز
            newScores[data.playerId] = (newScores[data.playerId] || 0) + data.points;
            
            console.log('📊 النقاط المحدثة:', newScores);
            return newScores;
          });
          
          // إظهار الإجابة الصحيحة أولاً
          setShowCorrectAnswer(true);
          
          // ثم الانتقال للسؤال التالي - الآلية الأصلية
          setTimeout(() => {
            if (currentRound >= totalRounds) {
              // انتهاء اللعبة - إرسال للجميع مع النقاط المحدثة
              if (isHost) {
                // احصل على النقاط المحدثة
                setGameScores(currentScores => {
                  const updatedScores = { ...currentScores };
                  updatedScores[data.playerId] = (updatedScores[data.playerId] || 0) + data.points;
                  
                  // إرسال النقاط النهائية
                  triggerPusherEvent('game-ended', {
                    finalScores: updatedScores
                  });
                  
                  return updatedScores;
                });
              }
            } else {
              // الانتقال للسؤال التالي
              if (isHost) {
                nextRound();
              }
            }
          }, 1500);
          
        } else if (!data.isCorrect) {
          // إجابة خاطئة - لا نفعل شيء مع النقاط
          if (data.playerId !== playerId) {
            console.log(`❌ ${data.playerId} أجاب بشكل خاطئ (محاولات متبقية: ${data.attemptsLeft})`);
          }
        }
        
        // 🆕 تتبع اللاعبين الذين انتهوا من المحاولات - الآلية الأصلية
        if (data.attemptsLeft === 0 || data.isCorrect) {
          setPlayersFinished(prev => {
            const newFinished = new Set(prev);
            newFinished.add(data.playerId);
            
            console.log('🔚 لاعب انتهى:', data.playerId);
            console.log('🔚 اللاعبون المنتهون:', Array.from(newFinished));
            
            // 🔧 الحل النهائي - منع التكرار باستخدام timeout + timestamp - الآلية الأصلية
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
          setHasAnswered(data.isCorrect || data.attemptsLeft <= 0);
          setCanAnswer(!(data.isCorrect || data.attemptsLeft <= 0));
          setAttemptsLeft(data.attemptsLeft);
          
          if (data.isCorrect) {
            console.log('✅ إجابة صحيحة! تم إخفاء نظام البحث');
            // إخفاء نظام البحث
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            setIsValidAnswer(false);
          } else {
            console.log('❌ إجابة خاطئة. محاولات متبقية:', data.attemptsLeft);
            if (data.attemptsLeft > 0) {
              // مسح الحقل للمحاولة التالية
              setSearchQuery('');
              setIsValidAnswer(false);
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 500);
            }
          }
        }
      });

      return () => {
        // تنظيف جميع الـ timeouts
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        
        gameChannel.unbind_all();
        pusher.unsubscribe(`player-career-${roomId}`);
      };
    }
  }, [pusher, roomId, isHost, playerId, opponentId, currentRound, totalRounds]);

  // دالة الانتقال للجولة التالية - الآلية الأصلية بدون تعديل
  const nextRound = useCallback(() => {
    if (!isHost) return;
    
    console.log('🔄 بدء الجولة التالية...');
    
    const now = Date.now();
    lastQuestionSentTime.current = now;
    
    const availablePlayers = playerCareerData.filter(p => !usedPlayers.includes(p.id));
    if (availablePlayers.length === 0) {
      console.log('⚠️ لا توجد لاعبين متاحين - إنهاء اللعبة');
      setGamePhase('finished');
      return;
    }
    
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    const newUsedPlayers = [...usedPlayers, randomPlayer.id];
    setUsedPlayers(newUsedPlayers);
    
    const nextRoundNumber = currentRound + 1;
    
    triggerPusherEvent('new-question', {
      player: randomPlayer,
      round: nextRoundNumber,
      usedPlayers: newUsedPlayers
    });
    
    console.log('✅ تم إرسال السؤال الجديد للجولة:', nextRoundNumber);
  }, [isHost, usedPlayers, currentRound, triggerPusherEvent]);

  // بدء سؤال جديد (المضيف فقط)
  const startNewQuestion = useCallback(() => {
    if (!isHost) return;
    
    const now = Date.now();
    if (now - lastQuestionSentTime.current < 1000) {
      console.log('⚠️ منع إرسال سؤال مكرر');
      return;
    }
    lastQuestionSentTime.current = now;
    
    const availablePlayers = playerCareerData.filter(p => !usedPlayers.includes(p.id));
    if (availablePlayers.length === 0) {
      console.log('⚠️ لا توجد لاعبين متاحين');
      return;
    }
    
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    const newUsedPlayers = [...usedPlayers, randomPlayer.id];
    setUsedPlayers(newUsedPlayers);
    
    // 🔧 استخدام currentRound مباشرة بدلاً من إضافة 1
    triggerPusherEvent('new-question', {
      player: randomPlayer,
      round: currentRound, // كان nextRound
      usedPlayers: newUsedPlayers
    });
  }, [isHost, usedPlayers, currentRound, totalRounds, triggerPusherEvent]);

  // التعامل مع البحث
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = searchPlayers(query);
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
      
      setIsValidAnswer(isValidPlayerName(query));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
    }
  };

  // اختيار اقتراح
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setIsValidAnswer(true);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // التعامل مع الضغط على المفاتيح
  const handleKeyPress = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && isValidAnswer) {
        submitAnswer();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (isValidAnswer) {
          submitAnswer();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // إرسال الإجابة
  const submitAnswer = () => {
    if (!searchQuery.trim() || hasAnswered || attemptsLeft <= 0 || roundWinner || hasGivenUp) return;

    if (!isValidAnswer) {
      console.log('يجب اختيار إجابة من القائمة المقترحة');
      return;
    }

    const isCorrect = currentPlayer?.name === searchQuery.trim();
    const points = isCorrect ? 100 : 0;
    const newAttemptsLeft = isCorrect ? attemptsLeft : attemptsLeft - 1;

    triggerPusherEvent('player-answered', {
      playerId: playerId,
      playerName: playerId,
      answer: searchQuery.trim(),
      isCorrect: isCorrect,
      points: points,
      attemptsLeft: newAttemptsLeft
    });

    if (isCorrect) {
      setHasAnswered(true);
    } else if (newAttemptsLeft <= 0) {
      setHasAnswered(true);
      setCanAnswer(false);
    }
  };

  // التعامل مع النقر على الحقل
  const handleInputClick = () => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // التعامل مع blur
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              مسيرة لاعب
            </span>
          </div>
          <Link 
            href="/"
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        {/* النقاط والجولة */}
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
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            
            {/* عنوان السؤال */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                من هذا اللاعب؟
              </h2>
            </div>

            {/* مسيرة اللاعب */}
            {currentPlayer && gamePhase === 'showing-career' && (
              <div className="space-y-6">
                {/* التلميحة العامة */}
                <div className="text-center mb-8">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/50 rounded-2xl">
                    <div className="text-2xl text-purple-400 font-bold">
                       {currentPlayer.hint}
                    </div>
                  </div>
                </div>

                {/* المسيرة الكاملة */}
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    {currentPlayer.career.map((club, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center group">
                          <div className="w-14 h-14 md:w-18 md:h-18 bg-[#1a1a27] rounded-full p-2 transition-all duration-300 group-hover:scale-110 shadow-xl ">
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

                {/* إظهار من فاز بالسؤال */}
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
                                i < attemptsLeft
                                  ? 'bg-green-500'
                                  : 'bg-red-500/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

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
                        disabled={!canAnswer || hasAnswered || hasGivenUp}
                        className={`w-full px-6 py-4 pr-14 text-xl text-white bg-slate-800/50 border-2 rounded-2xl focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                          isValidAnswer 
                            ? 'border-green-500 focus:border-green-400 shadow-lg shadow-green-500/20' 
                            : showSuggestions 
                              ? 'border-blue-500 focus:border-blue-400' 
                              : 'border-gray-600 focus:border-purple-400'
                        }`}
                      />
                      
                      {/* أيقونة البحث */}
                      {/* <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div> */}

                      {/* قائمة الاقتراحات */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-6 py-3 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                                index === selectedSuggestionIndex 
                                  ? 'bg-purple-600/30 text-white' 
                                  : 'text-gray-300 hover:bg-slate-700'
                              }`}
                              onMouseDown={() => selectSuggestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* أزرار الإجابة والاستسلام */}
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={submitAnswer}
                        disabled={!isValidAnswer || hasAnswered || hasGivenUp}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                          isValidAnswer && !hasAnswered && !hasGivenUp
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                        }`}
                      >
                        إرسال الإجابة
                      </button>

                      {/* 🆕 زر "عجزت عن السؤال" - إضافة جديدة فقط */}
                      {!hasAnswered && !hasGivenUp && !roundWinner && (
                        <button
                          onClick={handleGiveUp}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                        >
                           عجزت عن السؤال
                        </button>
                      )}
                    </div>

                    {/* 🆕 إشعار الاستسلام - إضافة جديدة فقط */}
                    {hasGivenUp && (
                      <div className="mt-4 p-3 bg-gray-600/20 border border-gray-500/50 rounded-xl text-center">
                        <p className="text-gray-300">لقد استسلمت - في انتظار المنافس</p>
                        <p className="text-sm text-gray-400 mt-1">
                          استسلم {playersGiveUp.length} من أصل 2 لاعبين
                        </p>
                      </div>
                    )}

                    {/* نصائح للمستخدم */}
                    {/* {!isValidAnswer && searchQuery.length > 0 && !hasGivenUp && (
                      <div className="mt-4 text-center">
                        <p className="text-yellow-400 text-sm">
                          💡 ابدأ بكتابة جزء من اسم اللاعب واختر من الاقتراحات
                        </p>
                      </div>
                    )} */}
                  </div>
                )}

                {/* الإجابة الصحيحة */}
                {showCorrectAnswer && (
                  <div className="text-center">
                    <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-2xl">
                      <h3 className="text-2xl font-bold text-white mb-2"> الإجابة الصحيحة:</h3>
                      <p className="text-3xl font-bold text-green-400">{currentPlayer?.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* شاشة الانتظار */}
            {gamePhase === 'waiting' && (
              <div className="text-center">
                <div className="text-2xl text-white mb-4">في انتظار المضيف لبدء اللعبة...</div>
                {isHost && (
                  <button
                    onClick={startNewQuestion}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                  >
                    بدء اللعبة
                  </button>
                )}
              </div>
            )}

            {/* شاشة انتهاء اللعبة */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-8"> انتهت اللعبة!</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="text-2xl">
                    <span className="text-white">النتيجة النهائية:</span>
                  </div>
                  <div className="flex justify-center gap-8">
                    <div className={`text-xl font-bold ${gameScores[playerId] > gameScores[opponentId] ? 'text-green-400' : 'text-red-400'}`}>
                      أنت: {gameScores[playerId]} نقطة
                    </div>
                    <div className={`text-xl font-bold ${gameScores[opponentId] > gameScores[playerId] ? 'text-green-400' : 'text-red-400'}`}>
                      المنافس: {gameScores[opponentId]} نقطة
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-yellow-400">
                    {gameScores[playerId] > gameScores[opponentId] 
                      ? ' أنت الفائز!' 
                      : gameScores[playerId] < gameScores[opponentId]
                        ? ' فاز المنافس!'
                        : ' تعادل!'
                    }
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Link 
                    href="/"
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}