// components/PlayerCareerSetup.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function PlayerCareerSetup({ 
  pusher, 
  playerId, 
  onGameStart, 
  initialMode = 'choice',
  roomIdFromUrl = null 
}) {
  const [mode, setMode] = useState(initialMode);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState(roomIdFromUrl || '');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [opponentId, setOpponentId] = useState('');
  const [joinError, setJoinError] = useState('');
  const channelRef = useRef(null);

  // تنظيف القناة عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  // إنشاء غرفة جديدة
  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomId(newRoomId);
    setMode('hosting');

    // الاشتراك في القناة
    const channelName = `player-career-${newRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // استقبال انضمام لاعب
    channel.bind('player-joined', (data) => {
      if (data.playerId !== playerId) {
        setOpponentId(data.playerId);
        setOpponentJoined(true);
      }
    });

    // استقبال بداية اللعبة
    channel.bind('game-started', (data) => {
      onGameStart(newRoomId, true, opponentId);
    });
  };

  // الانضمام لغرفة
  const joinRoom = () => {
    if (!joinRoomId.trim()) return;
    
    const cleanRoomId = joinRoomId.trim().toUpperCase();
    setJoinError('');
    setMode('joining');

    // الاشتراك في القناة
    const channelName = `player-career-${cleanRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // استقبال بداية اللعبة
    channel.bind('game-started', (data) => {
      onGameStart(cleanRoomId, false, data.hostId);
    });

    // إرسال طلب انضمام
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'player-joined',
          data: {
            playerId: playerId,
            isHost: false,
            roomId: cleanRoomId
          }
        })
      }).then(() => {
        // Timeout للانضمام
        setTimeout(() => {
          if (mode === 'joining') {
            setJoinError('لم يتم العثور على الغرفة');
            setMode('choice');
          }
        }, 8000);
      }).catch(console.error);
    }, 1000);
  };

  // نسخ رقم الغرفة
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  // نسخ رابط الغرفة
  const copyRoomLink = () => {
    const fullUrl = `${window.location.origin}/player-career/join/${roomId}`;
    navigator.clipboard.writeText(fullUrl);
  };

  // بدء اللعبة
  const startGame = () => {
    if (opponentJoined && channelRef.current) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelRef.current.name,
          event: 'game-started',
          data: {
            hostId: playerId,
            roomId: roomId
          }
        })
      }).then(() => {
        onGameStart(roomId, true, opponentId);
      }).catch(console.error);
    }
  };

  // العودة للخيارات
  const goBack = () => {
    setMode('choice');
    setJoinError('');
    setJoinRoomId('');
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">

            {/* العنوان */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                   مسيرة اللاعبين
                </span>
              </h1>
       
            </div>

            {/* اختيار الوضع */}
            {mode === 'choice' && (
              <div className="space-y-6">
                <button
                  onClick={createRoom}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative px-8 py-6 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 border-2 border-green-400/50 rounded-2xl font-bold text-xl text-white transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-center gap-3">
                      إنشاء غرفة جديدة
                    </div>
                  </div>
                </button>

                <div className="text-center text-gray-400 font-bold">أو</div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="أدخل رقم الغرفة"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-white text-center text-xl font-bold placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                    maxLength={6}
                  />
                  
                  <button
                    onClick={joinRoom}
                    disabled={!joinRoomId.trim()}
                    className="w-full group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 hover:from-blue-500/50 hover:to-indigo-500/50 border-2 border-blue-400/50 rounded-2xl font-bold text-xl text-white transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center gap-3">
                        انضمام للغرفة
                      </div>
                    </div>
                  </button>
                </div>

                {joinError && (
                  <div className="text-red-400 text-center font-bold bg-red-500/10 border border-red-500/30 rounded-xl py-3">
                    {joinError}
                  </div>
                )}
              </div>
            )}

            {/* انتظار إنشاء الغرفة */}
            {mode === 'hosting' && (
              <div className="text-center space-y-6">
         
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                  <p className="text-gray-400 mb-3">رقم الغرفة:</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-2xl text-center tracking-wider">
                      {roomId}
                    </div>
            
                  </div>
                  
          
                </div>

                {!opponentJoined ? (
                  <div className="space-y-4">
                    <div className="animate-pulse text-yellow-400 text-xl font-bold">
                      انتظار لاعب آخر...
                    </div>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-green-400 text-xl font-bold">
                       انضم لاعب جديد!
                    </div>
                    <button
                      onClick={startGame}
                      className="w-full group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl font-bold text-xl text-white transition-all duration-300 hover:scale-105">
                         ابدأ اللعبة!
                      </div>
                    </button>
                  </div>
                )}

                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  ← العودة
                </button>
              </div>
            )}

            {/* انتظار الانضمام */}
            {mode === 'joining' && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-white">البحث عن الغرفة...</h2>
                <div className="text-yellow-400 text-xl font-bold">
                  غرفة: {joinRoomId}
                </div>
                
                <div className="space-y-4">
                  <div className="animate-pulse text-yellow-400">
                    جاري الانضمام...
                  </div>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                </div>

                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  ← إلغاء
                </button>
              </div>
            )}

            {/* قواعد اللعبة */}
            {/* <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-purple-400 font-bold text-lg mb-4 text-center">📋 قواعد اللعبة الجديدة</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-lg">💡</span>
                  <span>تلميحة عامة فقط: "لاعب حالي" أو "لاعب معتزل" أو "مدرب حالي"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-lg">⚽</span>
                  <span>مسيرة مبسطة: شعارات الأندية بالترتيب الصحيح (بدون تواريخ)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 text-lg">🔍</span>
                  <span>نظام بحث ذكي: اكتب أي حرف أو كلمة واختر من القائمة</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">⚡</span>
                  <span>من يكتب الاسم الصحيح أولاً يحصل على النقاط</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-lg">🎯</span>
                  <span>أول من يصل 500 نقطة أو يكمل 10 جولات يفوز</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 text-lg">🧠</span>
                  <span>يمكن كتابة الاسم الأول فقط أو البحث بأي كلمة</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                <div className="text-cyan-400 font-bold text-sm mb-1">🎮 مثال على اللعب:</div>
                <div className="text-gray-300 text-sm">
                  تظهر المسيرة: سبورتينغ ➡️ مانشستر يونايتد ➡️ ريال مدريد ➡️ يوفنتوس ➡️ النصر
                  <br />
                  ابحث عن "رونالدو" أو "كريستيانو" واختر من القائمة!
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}