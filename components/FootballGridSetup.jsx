// components/FootballGridSetup.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function FootballGridSetup({ pusher, playerId, onStartGame, roomIdFromUrl = null }) {
  const [mode, setMode] = useState(roomIdFromUrl ? 'joining' : 'choice');
  const [roomId, setRoomId] = useState(roomIdFromUrl || '');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [joinError, setJoinError] = useState('');
  
  const channelRef = useRef(null);

  // Auto-join إذا كان هناك roomId في الـ URL
  useEffect(() => {
    if (roomIdFromUrl && pusher) {
      console.log('🔗 Auto-joining room from URL:', roomIdFromUrl);
      joinRoom(roomIdFromUrl);
    }
  }, [roomIdFromUrl, pusher]);

  // إنشاء غرفة
  const createRoom = () => {
    if (!pusher) {
      console.error('❌ Pusher not ready');
      return;
    }
    
    const newRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomId(newRoomId);
    setMode('creating');
    
    console.log('🎮 Creating room as HOST:', newRoomId, 'with playerId:', playerId);

    const channelName = `football-grid-${newRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // استقبال انضمام اللاعب
    channel.bind('player-joined', (data) => {
      console.log('👤 Player joined:', data.playerId, 'I am:', playerId);
      if (data.playerId !== playerId) {
        setOpponentJoined(true);
      }
    });

    // استقبال بداية اللعبة
    channel.bind('game-started', () => {
      console.log('🎮 Game started! I am HOST');
      onStartGame(newRoomId, true); // true = isHost
    });
  };

  // الانضمام لغرفة
  const joinRoom = (targetRoomId = null) => {
    if (!pusher) {
      console.error('❌ Pusher not ready');
      return;
    }
    
    const cleanRoomId = (targetRoomId || joinRoomId).trim().toUpperCase();
    if (!cleanRoomId) return;
    
    setMode('joining');
    setJoinError('');
    
    console.log('🎮 Joining room as GUEST:', cleanRoomId, 'with playerId:', playerId);

    const channelName = `football-grid-${cleanRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    console.log('📡 Subscribed to channel:', channelName);

    // استقبال بداية اللعبة
    channel.bind('game-started', (data) => {
      console.log('🎮 Game started! I am GUEST', data);
      onStartGame(cleanRoomId, false); // false = not host
    });

    // إرسال إشعار الانضمام
    setTimeout(() => {
      console.log('📤 Sending join notification...');
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'player-joined',
          data: { playerId }
        })
      }).then(() => {
        console.log('✅ Join notification sent');
        setOpponentJoined(true);
        setRoomId(cleanRoomId);
      }).catch(err => {
        console.error('❌ Failed to send join notification:', err);
        setJoinError('فشل الانضمام للغرفة');
      });
    }, 500);
  };

  // بدء اللعبة (للمضيف)
  const startGame = () => {
    console.log('🚀 Starting game as HOST');
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `football-grid-${roomId}`,
        event: 'game-started',
        data: { hostId: playerId }
      })
    }).then(() => {
      console.log('✅ Game start signal sent');
    });
    
    // المضيف يبدأ اللعبة مباشرة
    onStartGame(roomId, true); // true = isHost
  };

  // صفحة الاختيار
  if (mode === 'choice') {
    // التحقق من جاهزية Pusher
    if (!pusher) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-xl">جاري تحميل النظام...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce">⚽</div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              X  -<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">O</span>
            </h1>
            {/* <p className="text-xl text-gray-400">X - O     </p> */}
          </div>

          <div className="flex flex-col gap-6 w-full max-w-md">
            <button
              onClick={() => setMode('create')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                 إنشاء غرفة جديدة
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                 الانضمام لغرفة
              </div>
            </button>
          </div>

          <div className="mt-16 text-center">
            {/* <p className="text-white/60 mb-4">📊 كيف تلعب</p> */}
            <div className="flex flex-wrap justify-center gap-6 text-white/80 max-w-3xl">
              <div className="text-center min-w-[200px]">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm font-bold mb-1">اختر مربع</div>
                <div className="text-xs text-white/60">كل مربع له معياران</div>
              </div>
              <div className="text-center min-w-[200px]">
                <div className="text-3xl mb-2">⚽</div>
                <div className="text-sm font-bold mb-1">ابحث عن لاعب</div>
                <div className="text-xs text-white/60">يطابق المعيارين</div>
              </div>
              <div className="text-center min-w-[200px]">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-sm font-bold mb-1">اصنع خط</div>
                <div className="text-xs text-white/60">3 في صف للفوز</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة إنشاء غرفة
  if (mode === 'creating' || mode === 'create') {
    if (mode === 'create') {
      createRoom();
      return null;
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-6">⚽</div>
            <h2 className="text-3xl font-bold text-white mb-6">غرفة جاهزة!</h2>
            
            <div className="mb-8">
              <p className="text-white/60 mb-3">رمز الغرفة:</p>
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-wider">
                  {roomId}
                </p>
              </div>
              <p className="text-sm text-white/40">شارك هذا الرمز مع صديقك</p>
            </div>

            {opponentJoined ? (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
                  <p className="text-green-400 font-bold">✅ انضم اللاعب الثاني!</p>
                </div>
                <button
                  onClick={startGame}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🎮 ابدأ اللعبة
                </button>
              </div>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                  <p className="text-yellow-400 font-bold">انتظار اللاعب الثاني...</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setMode('choice')}
              className="mt-6 w-full px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              ← رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة الانضمام
  if (mode === 'join' || mode === 'joining') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-3xl font-bold text-white mb-2">الانضمام لغرفة</h2>
              <p className="text-white/60">أدخل رمز الغرفة</p>
            </div>

            {mode === 'joining' && opponentJoined ? (
              <div className="text-center">
                <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 mb-6">
                  <p className="text-green-400 font-bold text-lg mb-2">✅ تم الانضمام بنجاح!</p>
                  <p className="text-white/60 text-sm">انتظر حتى يبدأ المضيف اللعبة...</p>
                </div>
                <div className="flex items-center justify-center gap-3 text-white/60">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                  <span>جاري الانتظار...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <input
                    type="text"
                    value={mode === 'join' ? joinRoomId : roomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="مثال: ABC123"
                    className="w-full px-4 py-4 bg-slate-800 text-white text-center text-2xl font-bold rounded-xl border-2 border-slate-600 focus:border-cyan-500 focus:outline-none uppercase tracking-wider"
                    maxLength={6}
                    disabled={mode === 'joining'}
                  />
                </div>

                {joinError && (
                  <div className="mb-6 bg-red-500/20 border border-red-500 rounded-xl p-4">
                    <p className="text-red-400 text-center">❌ {joinError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {mode === 'join' && (
                    <>
                      <button
                        onClick={() => joinRoom()}
                        disabled={!joinRoomId.trim()}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        انضمام للغرفة
                      </button>
                      <button
                        onClick={() => setMode('choice')}
                        className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                      >
                        ← رجوع
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}