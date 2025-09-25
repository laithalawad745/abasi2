// components/PhotoCommentGameRouter.jsx - النسخة الكاملة مع إصلاح الانتقال بين المراحل
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';
import { ToastContainer, toast } from 'react-toastify';

const showSuccessToast = (message) => toast.success(message, { rtl: true });
const showErrorToast = (message) => toast.error(message, { rtl: true });
const showInfoToast = (message) => toast.info(message, { rtl: true });

export default function PhotoCommentGameRouter({ roomIdFromUrl = null }) {
  const [currentView, setCurrentView] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
      setCurrentView('join');
    }
  }, [roomIdFromUrl]);

  const createRoom = () => {
    if (!playerName.trim()) {
      showErrorToast('يرجى إدخال اسمك أولاً');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsHost(true);
    setCurrentView('game');
    showSuccessToast(`تم إنشاء الغرفة: ${newRoomId}`);
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      showErrorToast('يرجى إدخال البيانات المطلوبة');
      return;
    }
    setIsHost(false);
    setCurrentView('game');
    showSuccessToast(`انضممت للغرفة: ${roomId}`);
  };

  const goHome = () => {
    setCurrentView('home');
    setRoomId('');
    setPlayerName('');
    setIsHost(false);
  };

  // صفحات UI
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            صورة وتعليق
          </h1>
          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('create')}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              🏠 إنشاء غرفة
            </button>
            <button
              onClick={() => setCurrentView('join')}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              🚪 انضمام
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">إنشاء غرفة جديدة</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-medium">اسمك</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-orange-400"
                placeholder="أدخل اسمك..."
                maxLength={20}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
              >
                ← رجوع
              </button>
              <button
                onClick={createRoom}
                disabled={!playerName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                إنشاء الغرفة
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">انضمام لغرفة</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-medium">اسمك</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400"
                placeholder="أدخل اسمك..."
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-white mb-2 font-medium">رمز الغرفة</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 text-center font-mono text-lg"
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
              >
                ← رجوع
              </button>
              <button
                onClick={joinRoom}
                disabled={!playerName.trim() || !roomId.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                انضمام للغرفة
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'game') {
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
          console.log(`📦 حجم الصورة بعد الضغط: ${(compressedDataUrl.length / 1024).toFixed(2)}KB`);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
      img.src = URL.createObjectURL(file);
    });
  };

  // إرسال حدث عبر Pusher
  const triggerPusherEvent = useCallback(async (event, data) => {
    try {
      console.log(`📤 إرسال: ${event}`, data);
      
      const response = await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `photo-comment-${roomId}`,
          event: event,
          data: { ...data, timestamp: Date.now() }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ تم إرسال: ${event}`);
      return result;
    } catch (error) {
      console.error(`❌ خطأ في إرسال ${event}:`, error);
      showErrorToast(`فشل في إرسال ${event}`);
      throw error;
    }
  }, [roomId]);

  // رفع صورة محسن
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showErrorToast('حجم الصورة كبير جداً (أكثر من 20MB)');
      return;
    }

    setUploading(true);
    
    try {
      showInfoToast('جاري معالجة الصورة...');
      
      let compressedImage;
      let quality = 0.8;
      let maxWidth = 800;
      
      do {
        compressedImage = await compressImage(file, maxWidth, quality);
        
        if (compressedImage.length > 400 * 1024) {
          quality -= 0.1;
          maxWidth = Math.max(400, maxWidth - 100);
        }
        
      } while (compressedImage.length > 400 * 1024 && quality > 0.3);
      
      if (compressedImage.length > 500 * 1024) {
        showErrorToast('لا يمكن ضغط الصورة بما فيه الكفاية. جرب صورة أصغر.');
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

  // بدء مرحلة التخمين (دالة يدوية للمضيف)
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

    // 🔥 استقبال بدء مرحلة التخمين
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

    channel.bind('round-finished', (data) => {
      console.log('🏆 نتائج الجولة:', data);
      setPlayerScores(data.scores);
      setGamePhase('results');
      showSuccessToast(`انتهت الجولة!`);
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

  // 🔥 فحص اكتمال التعليقات والانتقال التلقائي لمرحلة التخمين
  useEffect(() => {
    console.log(`🔍 فحص التعليقات: ${comments.length}/${players.length}, المرحلة: ${gamePhase}, المضيف: ${isHost}`);
    
    if (gamePhase === 'commenting' && comments.length >= players.length && players.length > 0 && isHost) {
      console.log('🎯 جميع التعليقات مكتملة، الانتقال لمرحلة التخمين تلقائياً...');
      
      setTimeout(() => {
        startGuessingPhase();
      }, 3000); // تأخير 3 ثواني لرؤية التعليقات
    }
  }, [gamePhase, comments.length, players.length, isHost, startGuessingPhase]);

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
              {isConnected ? '✅ متصل بـ Pusher' : '❌ غير متصل'}
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
                      <span className="text-orange-400 text-sm">👑 مضيف</span>
                    )}
                  </div>
                ))}
              </div>

              {isHost && players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
                >
                  🎮 بدء اللعبة ({players.length} لاعبين)
                </button>
              )}

              {isHost && players.length < 2 && (
                <p className="text-yellow-400 text-center">⏳ في انتظار لاعب آخر على الأقل...</p>
              )}

              {!isHost && (
                <p className="text-blue-400 text-center">⏳ في انتظار المضيف لبدء اللعبة...</p>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={onExit}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              ← خروج
            </button>
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
            <h1 className="text-3xl font-bold text-white mb-2">🎮 اللعبة بدأت!</h1>
            <h2 className="text-2xl text-white/80 mb-2">جولة {currentRound} من {totalRounds}</h2>
            <p className="text-xl text-orange-400">دور {currentPhotoPlayer} لرفع صورة</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full text-center">
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
                        📷 اختر صورة من الجهاز
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

  // مرحلة التعليق مع زر الانتقال اليدوي
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
                  
                  <div className="mt-2 space-y-1 mb-4">
                    {comments.map((comment, index) => (
                      <div key={index} className="text-xs text-white/50 text-center p-2 bg-white/5 rounded-lg">
                        ✅ {comment.playerName}: "{comment.comment}"
                      </div>
                    ))}
                  </div>
                  
                  {/* زر يدوي للمضيف لبدء التخمين */}
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
            <h1 className="text-3xl font-bold text-white mb-2">🤔 من كتب هذا التعليق؟</h1>
            <p className="text-white/70">جولة {currentRound} من {totalRounds}</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <img 
                  src={currentPhoto} 
                  alt="صورة اللاعب" 
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">النقاط الحالية</h3>
                <div className="space-y-2">
                  {Object.entries(playerScores)
                    .sort(([,a], [,b]) => b - a)
                    .map(([player, score]) => (
                    <div key={player} className="flex justify-between items-center p-2 bg-white/10 rounded-lg">
                      <span className="text-white">{player}</span>
                      <span className="text-orange-400 font-bold">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comments.map((comment, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <div className="mb-4">
                    <div className="text-lg font-medium text-white mb-3 p-3 bg-white/10 rounded-xl">
                      "{comment.comment}"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-white/70 text-sm mb-2">من كتب هذا؟</p>
                    {players.map(player => (
                      <button
                        key={player.playerName}
                        onClick={() => makeGuess(index, player.playerName)}
                        disabled={guessResults[`${playerName}-${index}`]}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {player.playerName}
                      </button>
                    ))}
                  </div>

                  {guessResults[`${playerName}-${index}`] && (
                    <div className="mt-3 text-center">
                      <div className={`text-sm p-2 rounded-lg ${
                        guessResults[`${playerName}-${index}`].correct 
                          ? 'text-green-400 bg-green-500/20' 
                          : 'text-red-400 bg-red-500/20'
                      }`}>
                        {guessResults[`${playerName}-${index}`].correct ? '✅ صحيح! +10' : '❌ خطأ!'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // المراحل الأخرى
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl">مرحلة: {gamePhase}</p>
        <button
          onClick={() => setGamePhase('waiting')}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl"
        >
          العودة للانتظار
        </button>
      </div>
    </div>
  );
}