// components/BattleRoyaleGame.jsx - النظام الجديد مع الأرواح والمباراة الفاصلة
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getRandomQuestion, BATTLE_ROYALE_CONFIG } from '../app/data/battleRoyaleData';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from './ToastNotification';

export default function BattleRoyaleGame({ 
  roomId, 
  isHost, 
  playerName,
  allPlayers,
  pusher,
  onGameEnd 
}) {
  const [gamePhase, setGamePhase] = useState('countdown'); // countdown, playing, elimination-round, finished
  const [countdown, setCountdown] = useState(BATTLE_ROYALE_CONFIG.COUNTDOWN_BEFORE_START);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(BATTLE_ROYALE_CONFIG.QUESTION_TIMEOUT);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);
  
  // نظام الأرواح الجديد
  const [players, setPlayers] = useState(allPlayers.map(p => {
    const player = {
      ...p, 
      alive: true, 
      score: 0,
      wrongAnswers: 0, // التأكد من أنها 0 في البداية
      survivalCorrect: 0, // التأكد من أنها 0 في البداية
      inDanger: false
    };
    console.log('🎮 تهيئة اللاعب:', player.name, '- wrongAnswers:', player.wrongAnswers);
    return player;
  }));
  
  const [playersInDanger, setPlayersInDanger] = useState([]); // اللاعبون في المباراة الفاصلة
  const [showResults, setShowResults] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState({}); // تخزين إجابات اللاعبين
  const [isProcessingResults, setIsProcessingResults] = useState(false); // منع المعالجة المتكررة
  
  const playerId = useRef(allPlayers.find(p => p.name === playerName)?.id).current;
  const channel = useRef(null);

  // إعداد Pusher
  useEffect(() => {
    const channelName = `battle-royale-${roomId}`;
    channel.current = pusher.subscribe(channelName);

    // استقبال الأسئلة الجديدة
    channel.current.bind('new-question', (data) => {
      console.log('❓ سؤال جديد:', data.question.question);
      console.log('🎮 حالة اللاعبين عند استقبال السؤال:', players.map(p => ({
        name: p.name,
        wrongAnswers: p.wrongAnswers,
        alive: p.alive,
        inDanger: p.inDanger
      })));
      
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTimeLeft(BATTLE_ROYALE_CONFIG.QUESTION_TIMEOUT);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowResults(false);
      setRoundResults([]);
      setPlayerAnswers({});
      setIsProcessingResults(false); // إعادة تعيين المعالجة
    });

    // استقبال الإجابات من اللاعبين
    channel.current.bind('player-answered', (data) => {
      console.log('لاعب أجاب:', data);
      setPlayerAnswers(prev => ({
        ...prev,
        [data.playerId]: {
          answerIndex: data.answerIndex,
          isCorrect: data.isCorrect,
          timestamp: data.timestamp
        }
      }));
    });

  // استقبال نتائج الجولة
    channel.current.bind('round-results', (data) => {
      console.log('نتائج الجولة:', data);
      setRoundResults(data.results);
      
      // تحديث اللاعبين بعناية - الاحتفاظ بالبيانات الحالية وتحديث ما يلزم فقط
      setPlayers(prevPlayers => {
        return prevPlayers.map(player => {
          const updatedPlayer = data.updatedPlayers.find(p => p.id === player.id);
          if (updatedPlayer) {
            console.log(`تحديث اللاعب ${updatedPlayer.name}:`, {
              wrongAnswers: updatedPlayer.wrongAnswers,
              survivalCorrect: updatedPlayer.survivalCorrect,
              inDanger: updatedPlayer.inDanger,
              alive: updatedPlayer.alive
            });
            return updatedPlayer;
          }
          return player;
        });
      });
      
      setShowResults(true);
      
      // إشعارات
      const myResult = data.results.find(r => r.playerId === playerId);
      if (myResult) {
        if (myResult.lostLife) {
          showWarningToast(`❌ إجابة خاطئة! الأخطاء: ${myResult.wrongAnswers}/3`);
        }
        if (myResult.enteredDanger) {
          showErrorToast('⚠️ 3 أخطاء! دخلت منطقة الخطر - استعد للمباراة الفاصلة!');
        }
      }
    });

    // بدء المباراة الفاصلة
    channel.current.bind('elimination-round-started', (data) => {
      console.log('بدأت المباراة الفاصلة:', data);
      setGamePhase('elimination-round');
      setPlayersInDanger(data.playersInDanger);
      showWarningToast('⚔️ المباراة الفاصلة بدأت!');
    });

    // لاعب نجا من المباراة الفاصلة
    channel.current.bind('player-survived', (data) => {
      console.log('لاعب نجا:', data);
      if (data.playerId === playerId) {
        showSuccessToast('🎉 نجوت! عدت للمباراة!');
      } else {
        showInfoToast(`✅ ${data.playerName} نجا!`);
      }
    });

    // لاعب خرج من اللعبة
    channel.current.bind('player-eliminated', (data) => {
      console.log('لاعب خرج:', data);
      if (data.playerId === playerId) {
        showErrorToast(`💀 تم إقصاؤك! الترتيب: #${data.rank}`);
      } else {
        showInfoToast(`${data.playerName} خرج من اللعبة`);
      }
    });

    // استقبال تغيير المرحلة
    channel.current.bind('phase-changed', (data) => {
      console.log('🔄 تغيير المرحلة:', data.newPhase);
      console.log('👥 اللاعبون النشطون:', data.alivePlayers);
      
      setGamePhase(data.newPhase);
      
      // تحديث حالة اللاعبين
      setPlayers(prevPlayers => {
        return prevPlayers.map(player => {
          const alivePlayer = data.alivePlayers.find(p => p.id === player.id);
          if (alivePlayer) {
            return {
              ...player,
              alive: alivePlayer.alive,
              inDanger: alivePlayer.inDanger
            };
          }
          return player;
        });
      });
      
      if (data.newPhase === 'playing') {
        showInfoToast('🔄 عودة للعبة العادية!');
      }
    });

    // استقبال نهاية اللعبة
    channel.current.bind('game-ended', (data) => {
      console.log('انتهت اللعبة:', data);
      setGamePhase('finished');
      showSuccessToast(`🏆 الفائز: ${data.winner.name}!`);
    });

    return () => {
      if (channel.current) {
        pusher.unsubscribe(channelName);
      }
    };
  }, [roomId, pusher, playerId]);

  // العد التنازلي قبل البدء
  useEffect(() => {
    if (gamePhase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'countdown' && countdown === 0) {
      setGamePhase('playing');
      if (isHost) {
        sendNewQuestion();
      }
    }
  }, [countdown, gamePhase, isHost]);

  // تايمر السؤال
  useEffect(() => {
    if ((gamePhase === 'playing' || gamePhase === 'elimination-round') && currentQuestion && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if ((gamePhase === 'playing' || gamePhase === 'elimination-round') && timeLeft === 0 && !hasAnswered) {
      // الوقت انتهى - إرسال إجابة فارغة تلقائياً
      handleAnswer(null);
    }
  }, [timeLeft, gamePhase, currentQuestion, showResults, hasAnswered]);

  // معالجة النتائج عندما يجيب الجميع أو ينتهي الوقت (للمضيف فقط)
  useEffect(() => {
    if (!isHost || !currentQuestion || showResults || isProcessingResults) return;

    const activePlayers = gamePhase === 'elimination-round' 
      ? players.filter(p => p.inDanger)
      : players.filter(p => p.alive);

    const answeredCount = Object.keys(playerAnswers).length;
    const allAnswered = answeredCount >= activePlayers.length;
    const timeExpired = timeLeft === 0;

    // إذا أجاب الجميع أو انتهى الوقت، احسب النتائج
    if ((allAnswered || timeExpired) && !isProcessingResults) {
      console.log('🎯 معالجة النتائج - الجميع أجاب:', allAnswered, 'الوقت انتهى:', timeExpired);
      setIsProcessingResults(true); // منع المعالجة المتكررة
      
      setTimeout(() => {
        if (gamePhase === 'elimination-round') {
          processEliminationRoundResults();
        } else {
          processRoundResults();
        }
      }, 1000);
    }
  }, [playerAnswers, timeLeft, isHost, currentQuestion, showResults, gamePhase, players, isProcessingResults]);

  // الانتقال للسؤال التالي بعد عرض النتائج
  useEffect(() => {
    if (!isHost || !showResults) return;

    const timer = setTimeout(() => {
      console.log('⏭️ الانتقال للسؤال التالي...');
      if (gamePhase === 'elimination-round') {
        checkEliminationRoundStatus();
      } else {
        checkGameStatus();
      }
    }, 4000); // 4 ثواني لعرض النتائج

    return () => clearTimeout(timer);
  }, [showResults, isHost, gamePhase]);

  // إرسال سؤال جديد (المضيف فقط)
  const sendNewQuestion = () => {
    const newQuestion = getRandomQuestion(usedQuestions);
    if (!newQuestion) {
      endGame();
      return;
    }

    setUsedQuestions([...usedQuestions, newQuestion.id]);

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'new-question',
        data: {
          question: newQuestion,
          questionNumber: questionNumber
        }
      })
    });
  };

  // معالجة الإجابة
  const handleAnswer = (answerIndex) => {
    if (hasAnswered) return;
    
    // التحقق من أن اللاعب يستطيع اللعب
    const myPlayer = players.find(p => p.id === playerId);
    
    console.log('🎮 محاولة الإجابة:', {
      playerName,
      gamePhase,
      myPlayer: myPlayer ? {
        alive: myPlayer.alive,
        inDanger: myPlayer.inDanger
      } : 'لا يوجد'
    });
    
    // في اللعبة العادية: يجب أن يكون حي وليس في خطر
    if (gamePhase === 'playing') {
      if (!myPlayer?.alive || myPlayer?.inDanger) {
        console.log('⛔ لا يمكنك اللعب في الوضع الحالي');
        return;
      }
    }
    
    // في المباراة الفاصلة: يجب أن يكون في الخطر
    if (gamePhase === 'elimination-round') {
      if (!myPlayer?.inDanger) {
        console.log('⛔ لست في المباراة الفاصلة');
        return;
      }
    }
    
    console.log('✅ يمكنك الإجابة!');
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    const isCorrect = answerIndex === currentQuestion?.correctAnswer;

    // إرسال الإجابة للسيرفر
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'player-answered',
        data: {
          playerId,
          playerName,
          answerIndex,
          isCorrect,
          questionNumber,
          timestamp: Date.now()
        }
      })
    });
  };

  // معالجة نتائج الجولة العادية (المضيف فقط)
  const processRoundResults = () => {
    if (isProcessingResults) {
      console.log('⚠️ المعالجة جارية بالفعل - تجاهل الطلب المكرر');
      return;
    }
    
    console.log('📊 معالجة نتائج الجولة العادية...');
    console.log('🎮 حالة اللاعبين قبل المعالجة:', players.map(p => ({
      name: p.name,
      wrongAnswers: p.wrongAnswers,
      alive: p.alive
    })));
    console.log('📝 الإجابات المستلمة:', playerAnswers);
    
    const results = [];
    const updatedPlayers = [...players];
    
    updatedPlayers.forEach(player => {
      if (!player.alive) return;

      const playerAnswer = playerAnswers[player.id];
      const didAnswer = playerAnswer !== undefined;
      const answeredCorrectly = didAnswer && playerAnswer.isCorrect;

      console.log(`🔍 معالجة ${player.name}:`, {
        didAnswer,
        answeredCorrectly,
        currentWrongAnswers: player.wrongAnswers
      });

      if (answeredCorrectly) {
        // إجابة صحيحة - يكسب نقاط
        player.score += currentQuestion.points;
        results.push({
          playerId: player.id,
          playerName: player.name,
          status: 'correct',
          wrongAnswers: player.wrongAnswers, // لا تتغير
          lostLife: false,
          enteredDanger: false
        });
        
        console.log(`✅ ${player.name} أجاب صح - الأخطاء لم تتغير: ${player.wrongAnswers}`);
      } else {
        // إجابة خاطئة أو لم يجب - يزيد عدد الأخطاء
        const oldWrongAnswers = player.wrongAnswers || 0; // التأكد من أنها رقم
        player.wrongAnswers = oldWrongAnswers + 1;
        
        const lostLife = true;
        const enteredDanger = player.wrongAnswers >= 3;
        
        console.log(`❌ ${player.name} أخطأ - الأخطاء: ${oldWrongAnswers} → ${player.wrongAnswers}`);
        
        if (enteredDanger) {
          player.inDanger = true;
          player.alive = false; // مؤقتاً حتى المباراة الفاصلة
          console.log(`💀 ${player.name} دخل منطقة الخطر!`);
        }
        
        results.push({
          playerId: player.id,
          playerName: player.name,
          status: !didAnswer ? 'timeout' : 'wrong',
          wrongAnswers: player.wrongAnswers,
          lostLife,
          enteredDanger
        });
      }
    });

    console.log('✅ النتائج النهائية:', results);
    console.log('🎮 حالة اللاعبين بعد المعالجة:', updatedPlayers.map(p => ({
      name: p.name,
      wrongAnswers: p.wrongAnswers,
      alive: p.alive,
      inDanger: p.inDanger
    })));

    // إرسال النتائج
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'round-results',
        data: {
          results,
          updatedPlayers,
          correctAnswer: currentQuestion.correctAnswer
        }
      })
    });

    setQuestionNumber(questionNumber + 1);
  };

  // معالجة نتائج المباراة الفاصلة (المضيف فقط)
  const processEliminationRoundResults = () => {
    console.log('⚔️ معالجة نتائج المباراة الفاصلة...', { playerAnswers, players });
    
    const results = [];
    const updatedPlayers = [...players];
    const survived = [];
    const eliminated = [];
    
    updatedPlayers.forEach(player => {
      if (!player.inDanger) return;

      const playerAnswer = playerAnswers[player.id];
      const didAnswer = playerAnswer !== undefined;
      const answeredCorrectly = didAnswer && playerAnswer.isCorrect;

      if (answeredCorrectly) {
        // إجابة صحيحة - يزيد عدد الإجابات الصحيحة
        player.survivalCorrect += 1;
        
        // هل نجا؟
        if (player.survivalCorrect >= 3) {
          player.inDanger = false;
          player.alive = true;
          player.wrongAnswers = 0; // إعادة تعيين الأخطاء
          player.survivalCorrect = 0; // إعادة تعيين نقاط النجاة
          survived.push(player);
          
          // إشعار النجاة
          fetch('/api/pusher/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `battle-royale-${roomId}`,
              event: 'player-survived',
              data: {
                playerId: player.id,
                playerName: player.name
              }
            })
          });
        }
        
        results.push({
          playerId: player.id,
          playerName: player.name,
          status: 'correct',
          survivalCorrect: player.survivalCorrect,
          survived: player.survivalCorrect >= 3
        });
      } else {
        // إجابة خاطئة أو لم يجب - خروج نهائي
        player.alive = false;
        player.inDanger = false;
        eliminated.push(player);
        
        results.push({
          playerId: player.id,
          playerName: player.name,
          status: !didAnswer ? 'timeout' : 'wrong',
          survivalCorrect: player.survivalCorrect,
          survived: false
        });
        
        // إشعار الإقصاء
        const alivePlayers = updatedPlayers.filter(p => p.alive || p.inDanger);
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `battle-royale-${roomId}`,
            event: 'player-eliminated',
            data: {
              playerId: player.id,
              playerName: player.name,
              rank: alivePlayers.length + 1
            }
          })
        });
      }
    });

    console.log('✅ نتائج المباراة الفاصلة:', results);

    // إرسال النتائج
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'round-results',
        data: {
          results,
          updatedPlayers,
          correctAnswer: currentQuestion.correctAnswer
        }
      })
    });
  };

  // فحص حالة اللعبة (المضيف فقط)
  const checkGameStatus = () => {
    console.log('🔍 فحص حالة اللعبة...');
    
    const alivePlayers = players.filter(p => p.alive && !p.inDanger);
    const dangerPlayers = players.filter(p => p.inDanger);

    console.log('👥 اللاعبون الأحياء:', alivePlayers.length);
    console.log('⚠️ اللاعبون في الخطر:', dangerPlayers.length);
    console.log('📋 تفاصيل في الخطر:', dangerPlayers.map(p => p.name));

    // هل هناك لاعبون في منطقة الخطر؟
    if (dangerPlayers.length >= 2) {
      // 2 أو أكثر في الخطر → بدء المباراة الفاصلة
      console.log('⚔️ 2+ لاعبين في الخطر - بدء المباراة الفاصلة...');
      startEliminationRound(dangerPlayers);
    } 
    else if (dangerPlayers.length === 1) {
      // لاعب واحد فقط في الخطر → ينتظر
      console.log('⏳ لاعب واحد في الخطر - في انتظار لاعب آخر...');
      showInfoToast(`⏳ ${dangerPlayers[0].name} في منطقة الخطر - ينتظر منافس...`);
      
      // التحقق من عدد اللاعبين الأحياء
      if (alivePlayers.length === 0) {
        // لا يوجد لاعبون أحياء بدون خطر → اللعبة انتهت
        console.log('🏆 لا يوجد لاعبون أحياء - اللعبة انتهت!');
        endGame();
      } else {
        // استمرار اللعبة العادية (اللاعب في الخطر مراقب فقط)
        console.log('➡️ استمرار اللعبة - اللاعب في الخطر ينتظر...');
        sendNewQuestion();
      }
    }
    // هل بقي لاعب واحد فقط (حي وليس في خطر)؟
    else if (alivePlayers.length <= 1 && dangerPlayers.length === 0) {
      console.log('🏆 انتهت اللعبة - لاعب واحد فقط!');
      endGame();
    }
    // استمرار اللعبة العادية
    else {
      console.log('➡️ الانتقال للسؤال التالي...');
      sendNewQuestion();
    }
  };

  // بدء المباراة الفاصلة
  const startEliminationRound = (dangerPlayers) => {
    console.log('🚨 إرسال حدث بدء المباراة الفاصلة...');
    console.log('⚔️ عدد اللاعبين في المباراة:', dangerPlayers.length);
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'elimination-round-started',
        data: {
          playersInDanger: dangerPlayers
        }
      })
    });

    // إرسال سؤال جديد للمباراة الفاصلة
    setTimeout(() => {
      sendNewQuestion();
    }, 3000);
  };

  // فحص حالة المباراة الفاصلة
  const checkEliminationRoundStatus = () => {
    console.log('🔍 فحص حالة المباراة الفاصلة...');
    
    const stillInDanger = players.filter(p => p.inDanger);
    
    console.log('⚠️ لاعبون مازالوا في الخطر:', stillInDanger.length);
    console.log('🎮 تفاصيل جميع اللاعبين:', players.map(p => ({
      name: p.name,
      alive: p.alive,
      inDanger: p.inDanger
    })));
    
    // هل بقي أحد في منطقة الخطر؟
    if (stillInDanger.length > 0) {
      console.log('➡️ استمرار المباراة الفاصلة...');
      // استمرار المباراة الفاصلة
      sendNewQuestion();
    } else {
      console.log('✅ انتهت المباراة الفاصلة - العودة للعبة العادية');
      
      // التحقق من حالة اللعبة
      const alivePlayers = players.filter(p => p.alive && !p.inDanger);
      console.log('👥 اللاعبون الأحياء بعد المباراة الفاصلة:', alivePlayers.length);
      console.log('📋 قائمة الأحياء:', alivePlayers.map(p => p.name));
      
      if (alivePlayers.length <= 1) {
        console.log('🏆 انتهت اللعبة - لاعب واحد فقط متبقي!');
        endGame();
      } else {
        console.log('🔄 استمرار اللعبة العادية مع اللاعبين المتبقين');
        
        // إرسال حدث تغيير المرحلة للجميع
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `battle-royale-${roomId}`,
            event: 'phase-changed',
            data: {
              newPhase: 'playing',
              alivePlayers: alivePlayers.map(p => ({
                id: p.id,
                name: p.name,
                alive: p.alive,
                inDanger: p.inDanger
              }))
            }
          })
        });
        
        // تغيير المرحلة محلياً
        setGamePhase('playing');
        
        // الانتظار قليلاً ثم إرسال السؤال التالي
        setTimeout(() => {
          sendNewQuestion();
        }, 2000);
      }
    }
  };

  // إنهاء اللعبة
  const endGame = () => {
    console.log('🏁 إنهاء اللعبة...');
    
    // تحديد الفائز
    const alivePlayers = players.filter(p => p.alive && !p.inDanger);
    const dangerPlayers = players.filter(p => p.inDanger);
    
    console.log('🏆 اللاعبون الأحياء:', alivePlayers.length);
    console.log('⚠️ اللاعبون في الخطر:', dangerPlayers.length);
    
    let winner;
    
    if (alivePlayers.length === 1) {
      // لاعب واحد حي وليس في خطر = الفائز
      winner = alivePlayers[0];
    } else if (alivePlayers.length === 0 && dangerPlayers.length === 1) {
      // لاعب واحد في الخطر فقط = الفائز (الآخرون أُقصوا)
      winner = dangerPlayers[0];
    } else if (alivePlayers.length === 0 && dangerPlayers.length > 1) {
      // عدة لاعبين في الخطر = الفائز صاحب أعلى نقاط
      winner = [...dangerPlayers].sort((a, b) => b.score - a.score)[0];
    } else {
      // احتياطي: أعلى نقاط
      winner = [...players].sort((a, b) => b.score - a.score)[0];
    }
    
    console.log('👑 الفائز:', winner.name);

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'game-ended',
        data: {
          winner,
          finalPlayers: players.sort((a, b) => b.score - a.score)
        }
      })
    });
  };

  // رسم البوكسات (الأرواح) - دائماً 3 بوكسات
  const renderLivesBoxes = (player) => {
    const boxes = [];
    const totalBoxes = 3; // دائماً 3 بوكسات
    
    for (let i = 0; i < totalBoxes; i++) {
      if (i < player.wrongAnswers) {
        // خطأ - X على القلب
        boxes.push(
          <div key={i} className="w-10 h-10 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center relative">
            <span className="text-red-300 text-2xl absolute">❤</span>
            <span className="text-red-500 font-bold text-3xl z-10">✕</span>
          </div>
        );
      } else {
        // قلب سليم
        boxes.push(
          <div key={i} className="w-10 h-10 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-2xl">❤</span>
          </div>
        );
      }
    }
    
    return boxes;
  };

  // رسم بوكسات النجاة (في المباراة الفاصلة) - دائماً 3 بوكسات
  const renderSurvivalBoxes = (player) => {
    const boxes = [];
    const totalBoxes = 3; // دائماً 3 بوكسات
    
    for (let i = 0; i < totalBoxes; i++) {
      if (i < player.survivalCorrect) {
        // نقطة نجاة محققة - ✓
        boxes.push(
          <div key={i} className="w-12 h-12 bg-green-500/30 border-2 border-green-400 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-green-400 font-bold text-3xl">✓</span>
          </div>
        );
      } else {
        // نقطة نجاة مطلوبة - بوكس فارغ
        boxes.push(
          <div key={i} className="w-12 h-12 bg-white/5 border-2 border-white/30 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-3xl opacity-30">□</span>
          </div>
        );
      }
    }
    
    return boxes;
  };

  // العد التنازلي
  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            تبدأ المعركة في
          </h2>
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 animate-pulse">
            {countdown}
          </div>
          <p className="text-2xl text-gray-400 mt-8">
            استعد! ⚔️
          </p>
          <p className="text-lg text-gray-500 mt-4">
            لديك 3 فرص - لا تخطئ 3 مرات!
          </p>
        </div>
      </div>
    );
  }

  // نهاية اللعبة
  if (gamePhase === 'finished') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === playerId) + 1;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* عنوان النتائج */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black text-white mb-4">
                🏆 انتهت المعركة!
              </h1>
              
              {myRank === 1 && (
                <div className="mb-6">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
                    أنت الفائز! 👑
                  </p>
                </div>
              )}

              <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <p className="text-gray-400 mb-1">ترتيبك</p>
                <p className="text-5xl font-black text-white">#{myRank}</p>
              </div>
            </div>

            {/* جدول الترتيب */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                🏅 الترتيب النهائي
              </h3>

              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      player.id === playerId
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 scale-105'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {/* المركز */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-700 to-yellow-700 text-white' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>

                    {/* اسم اللاعب */}
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">
                        {player.name}
                        {player.id === playerId && ' (أنت)'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {player.alive ? '✅ نجا' : '💀 تم إقصاؤه'}
                      </p>
                    </div>

                    {/* النقاط */}
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{player.score}</p>
                      <p className="text-gray-400 text-sm">نقطة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار */}
            <div className="flex gap-4">
              <button
                onClick={onGameEnd}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-xl transition-all"
              >
                العودة للقائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // اللعب (العادي أو المباراة الفاصلة)
  const myPlayer = players.find(p => p.id === playerId);
  const alivePlayers = players.filter(p => p.alive);
  const dangerPlayers = players.filter(p => p.inDanger);
  const isInEliminationRound = gamePhase === 'elimination-round';

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header - معلومات اللعبة */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <span className="text-gray-400 text-sm">السؤال</span>
                <p className="text-white font-bold text-xl">{questionNumber}/{BATTLE_ROYALE_CONFIG.TOTAL_QUESTIONS}</p>
              </div>
              
              <div className={`px-6 py-3 backdrop-blur-md border-2 rounded-2xl ${
                timeLeft <= 5 
                  ? 'bg-red-500/20 border-red-400 animate-pulse' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <span className="text-gray-400 text-sm">الوقت</span>
                <p className="text-white font-bold text-xl">{timeLeft}s</p>
              </div>
            </div>

            <div className={`px-6 py-3 backdrop-blur-md border-2 rounded-2xl ${
              isInEliminationRound 
                ? 'bg-red-500/20 border-red-400' 
                : 'bg-green-500/20 border-green-400'
            }`}>
              <span className="text-gray-400 text-sm">
                {isInEliminationRound ? 'في الخطر' : 'الناجون'}
              </span>
              <p className="text-white font-bold text-xl">
                {isInEliminationRound ? dangerPlayers.length : alivePlayers.length}/{players.length}
              </p>
            </div>
          </div>

          {/* تنبيه المباراة الفاصلة */}
          {isInEliminationRound && (
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400 rounded-2xl p-6 mb-6 text-center animate-pulse">
              <h3 className="text-3xl font-black text-white mb-2">⚔️ المباراة الفاصلة!</h3>
              <p className="text-red-400 font-bold text-lg mb-3">
                اجمع 3 إجابات صحيحة (✓) للنجاة!
              </p>
              <div className="flex justify-center gap-2">
                {myPlayer && myPlayer.inDanger && renderSurvivalBoxes(myPlayer)}
              </div>
            </div>
          )}

          {/* حالة اللاعب */}
          {myPlayer && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">أنت</p>
                  <p className="text-white font-bold text-2xl">{myPlayer.name}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">النقاط</p>
                  <p className="text-white font-bold text-2xl">{myPlayer.score}</p>
                </div>
                
                {!isInEliminationRound && myPlayer.alive && !myPlayer.inDanger && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">حالتك</p>
                    <div className="flex gap-2">
                      {renderLivesBoxes(myPlayer)}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">أخطاء: {myPlayer.wrongAnswers}/3</p>
                  </div>
                )}
                
                {myPlayer.inDanger && !isInEliminationRound && (
                  <div className="w-full mt-4 p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl">
                    <p className="text-orange-400 font-bold text-center">
                      ⏳ أنت في منطقة الخطر - في انتظار منافس آخر...
                    </p>
                    <p className="text-gray-400 text-sm text-center mt-2">
                      عندما يدخل لاعب آخر منطقة الخطر، ستبدأ المباراة الفاصلة!
                    </p>
                  </div>
                )}
                
                {myPlayer.inDanger && isInEliminationRound && (
                  <div className="w-full mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <p className="text-red-400 font-bold text-center">
                      ⚔️ أنت في المباراة الفاصلة - أجب بشكل صحيح!
                    </p>
                  </div>
                )}
                
                {!myPlayer.alive && !myPlayer.inDanger && (
                  <div className="w-full mt-4 p-4 bg-red-500/20 border-2 border-red-400 rounded-xl">
                    <p className="text-red-400 font-bold text-center text-xl">
                      💀 تم إقصاؤك من المعركة!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* السؤال */}
          {currentQuestion && !showResults && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 rounded-xl mb-4">
                  <span className="text-purple-400 font-semibold">{currentQuestion.category}</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* الخيارات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  // تحديد ما إذا كان اللاعب يستطيع الإجابة
                  const canAnswer = (() => {
                    if (!myPlayer) return false;
                    
                    if (isInEliminationRound) {
                      // في المباراة الفاصلة: فقط من هم في الخطر
                      return myPlayer.inDanger;
                    } else {
                      // في اللعبة العادية: فقط الأحياء وليسوا في الخطر
                      return myPlayer.alive && !myPlayer.inDanger;
                    }
                  })();
                  
                  console.log(`🎯 التحقق من قدرة ${playerName} على الإجابة:`, {
                    canAnswer,
                    gamePhase,
                    alive: myPlayer?.alive,
                    inDanger: myPlayer?.inDanger
                  });
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={hasAnswered || !canAnswer}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        hasAnswered && selectedAnswer === index
                          ? 'bg-blue-500 text-white scale-95'
                          : hasAnswered || !canAnswer
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'
                      }`}
                    >
                      <span className="text-2xl mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <p className="text-center text-green-400 font-bold mt-6 text-xl animate-pulse">
                  ✅ تم إرسال إجابتك!
                </p>
              )}
            </div>
          )}

          {/* عرض النتائج */}
          {showResults && currentQuestion && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
              <h3 className="text-3xl font-bold text-white text-center mb-6">
                📊 نتائج الجولة
              </h3>

              {/* الإجابة الصحيحة */}
              <div className="bg-green-500/20 border-2 border-green-400 rounded-2xl p-6 mb-6">
                <p className="text-green-400 font-semibold text-center mb-2">✅ الإجابة الصحيحة:</p>
                <p className="text-white font-bold text-2xl text-center">
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              </div>

              {/* قائمة النتائج */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roundResults.map(result => (
                  <div
                    key={result.playerId}
                    className={`p-4 rounded-xl ${
                      result.status === 'correct'
                        ? 'bg-green-500/10 border border-green-400/30'
                        : 'bg-red-500/10 border border-red-400/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {result.status === 'correct' ? '✅' : result.enteredDanger ? '💀' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-bold">
                          {result.playerName}
                          {result.playerId === playerId && ' (أنت)'}
                        </p>
                        <p className={`text-sm ${
                          result.status === 'correct' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.status === 'correct' ? 'إجابة صحيحة' :
                           result.status === 'wrong' ? 'إجابة خاطئة' :
                           'انتهى الوقت'}
                        </p>
                      </div>
                    </div>
                    
                    {/* عرض البوكسات */}
                    {!isInEliminationRound && result.wrongAnswers !== undefined && (
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-8 rounded-md flex items-center justify-center relative ${
                              i < result.wrongAnswers
                                ? 'bg-red-500/20 border-2 border-red-500'
                                : 'bg-green-500/20 border-2 border-green-500'
                            }`}
                          >
                            {i < result.wrongAnswers ? (
                              <>
                                <span className="text-red-300 text-sm absolute">❤</span>
                                <span className="text-red-500 text-lg z-10">✕</span>
                              </>
                            ) : (
                              <span className="text-green-400 text-sm">❤</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isInEliminationRound && result.survivalCorrect !== undefined && (
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              i < result.survivalCorrect
                                ? 'bg-green-500/20 border-2 border-green-400'
                                : 'bg-white/5 border-2 border-white/20'
                            }`}
                          >
                            <span className="text-xs">
                              {i < result.survivalCorrect ? '✓' : '□'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.enteredDanger && (
                      <p className="text-orange-400 text-xs mt-2 font-bold">
                        ⚠️ دخل المباراة الفاصلة!
                      </p>
                    )}
                    
                    {result.survived && (
                      <p className="text-green-400 text-xs mt-2 font-bold animate-pulse">
                        🎉 نجا من المباراة الفاصلة!
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* قائمة اللاعبين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اللاعبون الأحياء */}
            {!isInEliminationRound && alivePlayers.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h4 className="text-xl font-bold text-white mb-4 text-center">
                  💚 الناجون ({alivePlayers.length})
                </h4>
                <div className="space-y-2">
                  {alivePlayers.map(player => (
                    <div
                      key={player.id}
                      className={`px-4 py-3 rounded-xl font-semibold flex items-center gap-3 ${
                        player.id === playerId
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <p>{player.name}</p>
                        <p className="text-xs opacity-70">{player.score} نقطة</p>
                      </div>
                      <div className="flex gap-1">
                        {renderLivesBoxes(player)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* اللاعبون في منطقة الخطر (في الانتظار أو في المباراة) */}
            {dangerPlayers.length > 0 && (
              <div className={`backdrop-blur-xl border rounded-3xl p-6 ${
                isInEliminationRound 
                  ? 'bg-red-500/10 border-red-400/30' 
                  : 'bg-orange-500/10 border-orange-400/30'
              }`}>
                <h4 className={`text-xl font-bold mb-4 text-center ${
                  isInEliminationRound ? 'text-red-400' : 'text-orange-400'
                }`}>
                  {isInEliminationRound 
                    ? `⚔️ المباراة الفاصلة (${dangerPlayers.length})`
                    : `⏳ في الانتظار (${dangerPlayers.length})`
                  }
                </h4>
                {!isInEliminationRound && dangerPlayers.length === 1 && (
                  <p className="text-orange-300 text-sm text-center mb-3">
                    في انتظار منافس آخر...
                  </p>
                )}
                <div className="space-y-2">
                  {dangerPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`px-4 py-3 rounded-xl font-semibold ${
                        player.id === playerId
                          ? isInEliminationRound
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                          : isInEliminationRound
                          ? 'bg-red-500/10 text-red-300 border border-red-400/30'
                          : 'bg-orange-500/10 text-orange-300 border border-orange-400/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <p className="flex-1">{player.name}</p>
                        {isInEliminationRound && (
                          <div className="flex gap-1">
                            {renderSurvivalBoxes(player)}
                          </div>
                        )}
                        {!isInEliminationRound && (
                          <span className="text-xs opacity-70">⏳ ينتظر</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}