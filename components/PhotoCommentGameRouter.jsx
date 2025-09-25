// components/PhotoCommentGameRouter.jsx - محدث مع إصلاح انتقال الجولات
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Pusher from 'pusher-js';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from './ToastNotification';
import { ToastContainer } from 'react-toastify';

export default function PhotoCommentGameRouter() {
  const [gameMode, setGameMode] = useState('setup');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlRoomId = searchParams.get('room');
    if (urlRoomId) {
      setRoomId(urlRoomId);
      setGameMode('join');
    }
  }, [searchParams]);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      setCreateError('يرجى إدخال اسم اللاعب');
      return;
    }
    
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setGameMode('game');
    setCreateError('');
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      setJoinError('يرجى إدخال اسم اللاعب ورمز الغرفة');
      return;
    }
    
    setIsHost(false);
    setGameMode('game');
    setJoinError('');
  };

  const goHome = () => {
    router.push('/');
  };

  if (gameMode === 'setup') {
    return (
      <>
        <PhotoCommentSetup
          onCreateRoom={() => setGameMode('create')}
          onJoinRoom={() => setGameMode('join')}
          onGoHome={goHome}
        />
        <ToastContainer />
      </>
    );
  }

  if (gameMode === 'create') {
    return (
      <>
        <PhotoCommentCreate
          playerName={playerName}
          setPlayerName={setPlayerName}
          createRoom={createRoom}
          createError={createError}
          onGoBack={() => setGameMode('setup')}
        />
        <ToastContainer />
      </>
    );
  }

  if (gameMode === 'join') {
    return (
      <>
        <PhotoCommentJoin
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          setRoomId={setRoomId}
          joinRoom={joinRoom}
          joinError={joinError}
          onGoBack={() => setGameMode('setup')}
        />
        <ToastContainer />
      </>
    );
  }

  if (gameMode === 'game') {
    return (
      <>
        <PhotoCommentGame
          roomId={roomId}
          playerName={playerName}
          isHost={isHost}
          onExit={goHome}
        />
        <ToastContainer />
      </>
    );
  }

  return null;
}

// مكون اللعبة الرئيسي مع إصلاح الانتقال بين المراحل
function PhotoCommentGame({ roomId, playerName, isHost, onExit }) {
  const [gamePhase, setGamePhase] = useState('waiting');
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentPhotoPlayer, setCurrentPhotoPlayer] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [myComment, setMyComment] = useState('');
  const [hasCommented, setHasCommented] = useState(false);
  const [guessResults, setGuessResults] = useState({});
  const [playerScores, setPlayerScores] = useState({});
  const [uploading, setUploading] = useState(false);
  
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const isInitializedRef = useRef(false);

  // دالة ضغط الصورة
  const compressImage = (file, maxWidth = 600, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = (width * maxWidth) / height;
              height = maxWidth;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          console.log(`🗜️ تم ضغط الصورة: ${Math.round(compressedDataUrl.length / 1024)}KB`);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
      img.src = URL.createObjectURL(file);
    });
  };

  // دالة إرسال أحداث Pusher
  const triggerPusherEvent = useCallback(async (eventName, data) => {
    try {
      console.log(`📤 إرسال حدث: ${eventName}`, data);
      
      const response = await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `photo-comment-${roomId}`,
          event: eventName,
          data: data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ تم إرسال ${eventName} بنجاح:`, result);
    } catch (error) {
      console.error(`❌ خطأ في إرسال ${eventName}:`, error);
      showErrorToast(`خطأ في إرسال البيانات: ${eventName}`);
    }
  }, [roomId]);

  // 🔥 الجديد - فحص اكتمال التخمينات وحساب النقاط والانتقال للجولة التالية
  useEffect(() => {
    // إجمالي التخمينات المطلوبة = عدد اللاعبين × عدد التعليقات (الجميع يصوت لكل تعليق)
    const totalGuessesNeeded = players.length * comments.length;
    const currentGuessesCount = Object.keys(guessResults).length;
    
    console.log(`🔍 فحص التخمينات: ${currentGuessesCount}/${totalGuessesNeeded}, المرحلة: ${gamePhase}, المضيف: ${isHost}`);
    
    if (gamePhase === 'guessing' && currentGuessesCount >= totalGuessesNeeded && totalGuessesNeeded > 0 && isHost) {
      console.log('🎯 جميع التخمينات مكتملة، حساب النقاط والانتقال...');
      
      setTimeout(() => {
        // حساب النقاط
        const newScores = { ...playerScores };
        
        // +10 نقاط لكل تخمين صحيح (بما في ذلك التصويت لنفسه)
        Object.entries(guessResults).forEach(([key, guess]) => {
          if (guess.correct) {
            newScores[guess.guesserName] = (newScores[guess.guesserName] || 0) + 10;
          }
        });
        
        // +20 نقطة لكل تعليق لم يخمنه أحد من الآخرين (نتجاهل تصويت صاحب التعليق لنفسه)
        comments.forEach((comment, index) => {
          const correctGuessesFromOthers = Object.entries(guessResults).filter(
            ([key, guess]) => {
              return guess.commentIndex === index && 
                     guess.correct && 
                     guess.guesserName !== comment.playerName; // فقط التخمينات من الآخرين
            }
          );
          
          if (correctGuessesFromOthers.length === 0) {
            // لم يخمنه أحد من الآخرين، صاحبه يحصل على 20 نقطة إضافية
            newScores[comment.playerName] = (newScores[comment.playerName] || 0) + 20;
            console.log(`💰 ${comment.playerName} يحصل على 20 نقطة لأن تعليقه لم ينكشف!`);
          }
        });
        
        // تحديد فائز الجولة
        const roundWinner = Object.entries(newScores)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        console.log('💰 النقاط الجديدة:', newScores);
        console.log('🏆 فائز الجولة:', roundWinner);
        
        // إرسال نتائج الجولة
        triggerPusherEvent('round-finished', {
          scores: newScores,
          roundWinner: roundWinner,
          round: currentRound,
          totalRounds: totalRounds,
          isLastRound: currentRound >= totalRounds
        });
        
      }, 2000); // تأخير لرؤية نتائج التخمينات
    }
  }, [gamePhase, guessResults, players.length, comments.length, isHost, playerScores, currentRound, totalRounds, triggerPusherEvent, comments]);

  // 🔥 الجديد - دالة الانتقال للجولة التالية
  const nextRound = useCallback(() => {
    if (!isHost) return;
    
    if (currentRound < totalRounds) {
      const nextRoundNumber = currentRound + 1;
      const nextPlayerIndex = nextRoundNumber - 1;
      const nextPlayer = players[nextPlayerIndex];
      
      console.log(`🔄 الانتقال للجولة ${nextRoundNumber}, دور ${nextPlayer?.playerName}`);
      
      // إعادة تعيين حالة الجولة الجديدة
      setCurrentRound(nextRoundNumber);
      setCurrentPhotoPlayer(nextPlayer?.playerName);
      setCurrentPhoto(null);
      setComments([]);
      setMyComment('');
      setHasCommented(false);
      setGuessResults({});
      setGamePhase('photo-submission');
      
      // إخبار اللاعبين الآخرين
      triggerPusherEvent('next-round-started', {
        round: nextRoundNumber,
        currentPlayer: nextPlayer?.playerName,
        totalRounds: totalRounds
      });
      
      showSuccessToast(`🔄 الجولة ${nextRoundNumber} - دور ${nextPlayer?.playerName}`);
      
    } else {
      // انتهاء اللعبة
      const gameWinner = Object.entries(playerScores)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      console.log(' انتهاء اللعبة، الفائز:', gameWinner);
      
      setGamePhase('finished');
      
      triggerPusherEvent('game-finished', {
        gameWinner: gameWinner,
        finalScores: playerScores
      });
      
      showSuccessToast(` انتهت اللعبة! الفائز: ${gameWinner}`);
    }
  }, [isHost, currentRound, totalRounds, players, playerScores, triggerPusherEvent]);

  // إعداد Pusher
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('🔄 بدء إعداد Pusher...');

    const pusherInstance = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      encrypted: true,
    });

    pusherRef.current = pusherInstance;

    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher متصل');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('error', (error) => {
      console.error('❌ خطأ Pusher:', error);
      setIsConnected(false);
    });

    const channelName = `photo-comment-${roomId}`;
    const channel = pusherInstance.subscribe(channelName);
    channelRef.current = channel;
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ تم الاشتراك بنجاح');
      
      setTimeout(() => {
        triggerPusherEvent('player-joined', {
          playerName: playerName,
          isHost: isHost
        });
      }, 500);
    });

    // استقبال الأحداث
    channel.bind('player-joined', (data) => {
      console.log(`👤 لاعب انضم: ${data.playerName}`);
      setPlayers(prev => {
        if (prev.find(p => p.playerName === data.playerName)) return prev;
        const newPlayers = [...prev, data];
        console.log(`👥 إجمالي اللاعبين: ${newPlayers.length}`);
        return newPlayers;
      });
      
      if (data.playerName !== playerName) {
        showSuccessToast(`${data.playerName} انضم للغرفة`);
      }
    });

    channel.bind('game-started', (data) => {
      console.log(`🎮 بدء اللعبة:`, data);
      setGamePhase('photo-submission');
      setTotalRounds(data.totalRounds);
      setCurrentRound(1);
      setCurrentPhotoPlayer(data.currentPlayer);
      
      const initialScores = {};
      (data.players || []).forEach(player => {
        initialScores[player] = 0;
      });
      setPlayerScores(initialScores);
      
      showSuccessToast(`🎮 بدأت اللعبة! دور ${data.currentPlayer}`);
    });

    channel.bind('photo-submitted', (data) => {
      console.log('📷 تم استلام صورة:', data.playerName);
      setCurrentPhoto(data.photoUrl);
      setGamePhase('commenting');
      showInfoToast('تم رفع الصورة! ابدأ بكتابة التعليقات');
    });

    channel.bind('comment-submitted', (data) => {
      console.log('💬 تعليق جديد:', data.playerName);
      setComments(prev => [...prev, data]);
      if (data.playerName !== playerName) {
        showInfoToast(`${data.playerName} علق على الصورة`);
      }
    });

    channel.bind('guessing-phase-started', (data) => {
      console.log('🤔 بدء مرحلة التخمين:', data);
      setGamePhase('guessing');
      setComments(data.shuffledComments || comments);
      showSuccessToast(data.message || 'ابدأ التخمين! من كتب كل تعليق؟');
    });

    channel.bind('player-guessed', (data) => {
      console.log('🎯 تخمين من:', data.guesserName);
      setGuessResults(prev => ({
        ...prev,
        [`${data.guesserName}-${data.commentIndex}`]: data
      }));
    });

    // 🔥 الجديد - استقبال الأحداث الجديدة
    channel.bind('round-finished', (data) => {
      console.log('🏆 نتائج الجولة:', data);
      setPlayerScores(data.scores);
      setGamePhase('results');
      showSuccessToast(`انتهت الجولة ${data.round}!`);
    });

    channel.bind('next-round-started', (data) => {
      console.log('🔄 الجولة التالية:', data);
      setCurrentRound(data.round);
      setCurrentPhotoPlayer(data.currentPlayer);
      setCurrentPhoto(null);
      setComments([]);
      setMyComment('');
      setHasCommented(false);
      setGuessResults({});
      setGamePhase('photo-submission');
      showInfoToast(`الجولة ${data.round} - دور ${data.currentPlayer}`);
    });

    channel.bind('game-finished', (data) => {
      console.log(' انتهاء اللعبة:', data);
      setPlayerScores(data.finalScores);
      setGamePhase('finished');
      showSuccessToast(` فاز ${data.gameWinner}!`);
    });

    return () => {
      console.log('🔄 تنظيف الاتصالات...');
      if (channelRef.current) {
        pusherRef.current?.unsubscribe(channelName);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
      isInitializedRef.current = false;
    };
  }, [roomId, playerName, isHost, triggerPusherEvent]);

  // فحص اكتمال التعليقات والانتقال التلقائي لمرحلة التخمين
  useEffect(() => {
    console.log(`🔍 فحص التعليقات: ${comments.length}/${players.length}, المرحلة: ${gamePhase}, المضيف: ${isHost}`);
    
    if (gamePhase === 'commenting' && comments.length >= players.length && players.length > 0 && isHost) {
      console.log('🎯 جميع التعليقات مكتملة، الانتقال لمرحلة التخمين تلقائياً...');
      
      setTimeout(() => {
        startGuessingPhase();
      }, 3000);
    }
  }, [gamePhase, comments.length, players.length, isHost]);

  // دالة بدء اللعبة
  const startGame = useCallback(() => {
    if (!isHost || players.length < 2) return;

    const gameData = {
      totalRounds: players.length,
      currentPlayer: players[0]?.playerName,
      players: players.map(p => p.playerName)
    };

    triggerPusherEvent('game-started', gameData);
  }, [isHost, players, triggerPusherEvent]);

  // رفع صورة
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || currentPhotoPlayer !== playerName) return;

    setUploading(true);
    
    try {
      if (file.size > 10 * 1024 * 1024) {
        showErrorToast('الصورة كبيرة جداً! يجب أن تكون أقل من 10MB');
        setUploading(false);
        return;
      }
      
      const compressedImage = await compressImage(file);
      
      if (compressedImage.length > 2 * 1024 * 1024) {
        showWarningToast('الصورة لا تزال كبيرة نسبياً. جرب صورة أصغر.');
        return;
      }
      
      console.log(`📸 تم ضغط الصورة بنجاح`);
      showSuccessToast('تم معالجة الصورة بنجاح!');
      
      await triggerPusherEvent('photo-submitted', {
        playerName: playerName,
        photoUrl: compressedImage,
        round: currentRound
      });
      
    } catch (error) {
      console.error('❌ خطأ في معالجة الصورة:', error);
      showErrorToast('فشل في معالجة الصورة. جرب صورة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  // بدء مرحلة التخمين
  const startGuessingPhase = useCallback(() => {
    if (!isHost) {
      showErrorToast('فقط المضيف يمكنه بدء مرحلة التخمين');
      return;
    }
    
    if (comments.length < players.length) {
      showErrorToast(`في انتظار ${players.length - comments.length} تعليق إضافي`);
      return;
    }
    
    const shuffledComments = [...comments].sort(() => Math.random() - 0.5);
    console.log('🔀 بدء مرحلة التخمين بواسطة المضيف');
    
    triggerPusherEvent('guessing-phase-started', {
      shuffledComments: shuffledComments,
      round: currentRound,
      message: 'بدأت مرحلة التخمين!'
    });
  }, [isHost, comments, players.length, triggerPusherEvent, currentRound]);

  // إرسال تعليق
  const submitComment = () => {
    if (!myComment.trim() || hasCommented) return;

    setHasCommented(true);
    const cleanComment = myComment.trim();
    setMyComment('');

    triggerPusherEvent('comment-submitted', {
      playerName: playerName,
      comment: cleanComment,
      round: currentRound
    });

    showSuccessToast('تم إرسال تعليقك!');
  };

  // التخمين
  const makeGuess = (commentIndex, guessedPlayer) => {
    const isCorrect = comments[commentIndex]?.playerName === guessedPlayer;
    
    triggerPusherEvent('player-guessed', {
      guesserName: playerName,
      commentIndex,
      guessedPlayer,
      correct: isCorrect,
      round: currentRound
    });

    if (isCorrect) {
      showSuccessToast('إجابة صحيحة! +10 نقاط');
    } else {
      showErrorToast('إجابة خاطئة!');
    }
  };

  // مرحلة الانتظار
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">غرفة اللعبة</h1>
            <div className="text-2xl font-mono text-orange-400 bg-white/10 px-6 py-3 rounded-xl inline-block">
              {roomId}
            </div>
            <p className="text-white/60 mt-2">شارك هذا الرمز مع أصدقائك</p>
            
            <div className={`mt-4 px-4 py-2 rounded-lg inline-block ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? ' متصل ' : ' غير متصل'}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">اللاعبون ({players.length})</h2>
              
              <div className="space-y-3 mb-8">
                {players.map((player, index) => (
                  <div key={`${player.playerName}-${index}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{player.playerName}</span>
                    </div>
                    {player.isHost && (
                      <span className="text-orange-400 text-sm"> مضيف</span>
                    )}
                  </div>
                ))}
              </div>

              {isHost && players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
                >
                  🚀 بدء اللعبة ({players.length} لاعبين)
                </button>
              )}

              {isHost && players.length < 2 && (
                <p className="text-yellow-400 text-center">
                  ⏳ في انتظار المزيد من اللاعبين (الحد الأدنى 2)
                </p>
              )}

              {!isHost && (
                <p className="text-blue-400 text-center">
                  ⏳ في انتظار المضيف لبدء اللعبة...
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={onExit}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                >
                   العودة للقائمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // مرحلة رفع الصورة
  if (gamePhase === 'photo-submission') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 p-6 flex flex-col min-h-screen">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">📷 رفع الصورة</h1>
            <p className="text-xl text-white/80">الجولة {currentRound} من {totalRounds}</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
              {currentPhotoPlayer === playerName ? (
                <div className="space-y-6">
                  <div className="text-6xl mb-4">📸</div>
                  <h2 className="text-2xl font-bold text-white mb-4">حان دورك!</h2>
                  <p className="text-white/70 mb-6">ارفع صورتك الآن</p>
                  
                  {!uploading ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                         اختر صورة من الجهاز
                      </label>
                      <p className="text-white/50 text-sm mt-2">سيتم ضغط الصورة تلقائياً</p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-white">جاري معالجة الصورة...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="animate-pulse text-6xl mb-4">⏳</div>
                  <h2 className="text-2xl font-bold text-white mb-4">في الانتظار...</h2>
                  <p className="text-white/70">ينتظر {currentPhotoPlayer} رفع صورته</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // مرحلة التعليق
  if (gamePhase === 'commenting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">💬 وقت التعليقات!</h1>
            <p className="text-xl text-white/80">صورة {currentPhotoPlayer}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <img 
                  src={currentPhoto} 
                  alt="صورة اللاعب" 
                  className="w-full h-80 object-cover rounded-2xl mb-4"
                />
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">اكتب تعليقك</h3>
                
                {!hasCommented ? (
                  <div className="space-y-4">
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="اكتب تعليقاً مبدعاً..."
                      className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-orange-400 focus:bg-white/20 transition-all duration-300 resize-none"
                      maxLength={100}
                    />
                    <button
                      onClick={submitComment}
                      disabled={!myComment.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      إرسال التعليق
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-green-400">
                    <div className="text-4xl mb-2">✅</div>
                    <p>تم إرسال تعليقك!</p>
                    <p className="text-white/60 text-sm">في انتظار باقي اللاعبين...</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/70 text-sm text-center mb-4">
                    التعليقات: {comments.length} / {players.length}
                  </p>
         
                  {/* <div className="mt-2 space-y-1 mb-4">
                    {comments.map((comment, index) => (
                      <div key={index} className="text-xs text-white/50 text-center p-2 bg-white/5 rounded-lg">
                        ✅ {comment.playerName}: "{comment.comment}"
                      </div>
                    ))}
                  </div> */}
                  
                  {isHost && comments.length >= players.length && (
                    <button
                      onClick={startGuessingPhase}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                    >
                      🤔 بدء مرحلة التخمين الآن
                    </button>
                  )}
                  
                  {isHost && comments.length < players.length && (
                    <p className="text-yellow-400 text-center text-sm">
                      ⏳ في انتظار {players.length - comments.length} تعليق إضافي
                    </p>
                  )}
                  
                  {!isHost && (
                    <p className="text-blue-400 text-center text-sm">
                      ⏳ ينتظر المضيف بدء مرحلة التخمين...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // مرحلة التخمين
  if (gamePhase === 'guessing') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🤔 مرحلة التخمين!</h1>
            <p className="text-xl text-white/80">من كتب كل تعليق؟</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <img 
                  src={currentPhoto} 
                  alt="صورة اللاعب" 
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>

              <div className="space-y-4">
                {comments.map((comment, commentIndex) => {
                  const hasGuessed = guessResults[`${playerName}-${commentIndex}`];
                  
                  return (
                    <div key={commentIndex} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                      <p className="text-white font-medium mb-3">"{comment.comment}"</p>
                      
                      {!hasGuessed ? (
                        <div className="grid grid-cols-2 gap-2">
                          {players.map(player => (
                            <button
                              key={player.playerName}
                              onClick={() => makeGuess(commentIndex, player.playerName)}
                              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 rounded-lg text-white text-sm transition-all duration-300"
                            >
                              {player.playerName}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-center py-2 px-3 rounded-lg ${
                          hasGuessed.correct 
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}>
                          {hasGuessed.correct ? '✅ صحيح!' : '❌ خطأ!'} - اخترت: {hasGuessed.guessedPlayer}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-white/70 text-sm">
                    التخمينات: {Object.keys(guessResults).length} / {players.length * comments.length}
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(guessResults).length / (players.length * comments.length)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 الجديد - مرحلة النتائج
  if (gamePhase === 'results') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 p-6 flex flex-col min-h-screen">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🏆 نتائج الجولة {currentRound}</h1>
          </div>

          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">النقاط الحالية</h2>
              
              <div className="space-y-4 mb-8">
                {Object.entries(playerScores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([player, score], index) => (
                  <div key={player} className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50' 
                      : 'bg-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <span className="text-white font-medium">{player}</span>
                    </div>
                    <span className="text-orange-400 font-bold text-xl">{score}</span>
                  </div>
                ))}
              </div>

              {isHost && (
                <div className="space-y-4">
                  {currentRound < totalRounds ? (
                    <button
                      onClick={nextRound}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
                    >
                      ➡️ الجولة التالية ({currentRound + 1}/{totalRounds})
                    </button>
                  ) : (
                    <button
                      onClick={nextRound}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
                    >
                       عرض النتائج النهائية
                    </button>
                  )}
                </div>
              )}

              {!isHost && (
                <p className="text-blue-400 text-center">⏳ في انتظار المضيف...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 الجديد - مرحلة انتهاء اللعبة
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 p-6 flex flex-col min-h-screen">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4"> انتهت اللعبة!</h1>
            <p className="text-white/70 text-lg">
              تم لعب {totalRounds} جولات مع {players.length} لاعبين
            </p>
          </div>

          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center"> النتائج النهائية</h2>
              
              <div className="space-y-4 mb-8">
                {Object.entries(playerScores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([player, score], index) => (
                  <div key={player} className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50' 
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-2 border-gray-400/50'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-800/20 to-yellow-800/20 border-2 border-orange-600/50'
                      : 'bg-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-800 to-yellow-800' :
                        'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <span className="text-white font-medium text-lg">{player}</span>
                    </div>
                    <span className="text-orange-400 font-bold text-2xl">{score}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={onExit}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105"
                >
                   العودة للقائمة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// مكونات الإعداد (لم تتغير)
function PhotoCommentSetup({ onCreateRoom, onJoinRoom, onGoHome }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex justify-between items-center mb-12">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
               صورة وتعليق
            </span>
          </div>
          <button
            onClick={onGoHome}
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            ← العودة للرئيسية
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">  صورة وتعليق</h2>
              <p className="text-xl text-gray-300">شارك صورتك وخمن من كتب كل تعليق!</p>
            </div>
            
            <div className="space-y-6">
              <button
                onClick={onCreateRoom}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                 إنشاء غرفة جديدة
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-lg">
                  <span className="bg-[#0a0a0f] px-4 text-white/60">أو</span>
                </div>
              </div>

              <button
                onClick={onJoinRoom}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                 انضم لغرفة موجودة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoCommentCreate({ playerName, setPlayerName, createRoom, createError, onGoBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
      
      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">إنشاء غرفة جديدة</h1>
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
          >
            ← رجوع
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">
            
            {createError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-red-300">{createError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">اسم اللاعب</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ادخل اسمك..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all duration-300"
                  maxLength={20}
                />
              </div>

              <button
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                 إنشاء الغرفة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoCommentJoin({ playerName, setPlayerName, roomId, setRoomId, joinRoom, joinError, onGoBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
      
      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">الانضمام للغرفة</h1>
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
          >
            ← رجوع
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">
            
            {joinError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-red-300">{joinError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">اسم اللاعب</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ادخل اسمك..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">رمز الغرفة</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ادخل رمز الغرفة..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 font-mono text-center text-lg"
                  maxLength={6}
                />
              </div>

              <button
                onClick={joinRoom}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                دخول الغرفة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}