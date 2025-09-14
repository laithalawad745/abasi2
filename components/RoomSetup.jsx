// components/RoomSetup.jsx - التصميم الجديد مع الحفاظ على الوظائف الأصلية
import React, { useState, useEffect } from 'react';

export default function RoomSetup({ 
  onStartFastestGame, 
  pusher, 
  setIsHost,
  setPlayerId,
  setOpponentId,
  playerId 
}) {
  const [mode, setMode] = useState('choice');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [channel, setChannel] = useState(null);
  const [joinError, setJoinError] = useState('');

  // إنشاء Room ID عشوائي - نفس الوظيفة الأصلية
  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // إنشاء غرفة جديدة - الكود الأصلي بالضبط
  const createRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setMode('waiting');

    // استخدام public channel
    const channelName = `room-${newRoomId}`;
    const roomChannel = pusher.subscribe(channelName);
    setChannel(roomChannel);

    console.log(`Host subscribed to: ${channelName}`);

    // الاستماع لانضمام اللاعب الثاني
    roomChannel.bind('user-joined', (data) => {
      console.log('User joined:', data);
      if (data.playerId !== playerId && !data.isHost) {
        setOpponentId(data.playerId);
        setOpponentJoined(true);
        console.log('Guest found!');
      }
    });

    // إرسال presence للمضيف
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'user-joined',
          data: {
            playerId: playerId,
            isHost: true,
            roomId: newRoomId
          }
        })
      }).catch(console.error);
    }, 1000);
  };

  // الانضمام لغرفة موجودة - نفس الكود الأصلي بالضبط
  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinError('يرجى إدخال رقم الغرفة');
      return;
    }

    const cleanRoomId = joinRoomId.trim().toUpperCase();
    setJoinError('');
    setIsHost(false);
    setMode('joining');

    const channelName = `room-${cleanRoomId}`;
    const roomChannel = pusher.subscribe(channelName);
    setChannel(roomChannel);

    console.log(`Guest subscribed to: ${channelName}`);

    // الاستماع للمضيف
    roomChannel.bind('user-joined', (data) => {
      console.log('User found:', data);
      if (data.playerId !== playerId && data.isHost) {
        setOpponentId(data.playerId);
        setMode('joined');
        console.log('Host found!');
      }
    });

    // الاستماع لبدء اللعبة
    roomChannel.bind('game-started', (data) => {
      console.log('Game started');
      onStartFastestGame(cleanRoomId);
    });

    // إرسال presence للضيف
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'user-joined',
          data: {
            playerId: playerId,
            isHost: false,
            roomId: cleanRoomId
          }
        })
      }).then(() => {
        // timeout للانضمام
        setTimeout(() => {
          if (mode === 'joining') {
            setJoinError('لم يتم العثور على الغرفة');
            setMode('choice');
          }
        }, 8000);
      }).catch(console.error);
    }, 1000);
  };

  // نسخ رقم الغرفة - نفس الوظيفة الأصلية
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  // بدء اللعبة - نفس الكود الأصلي بالضبط
  const startGame = () => {
    if (opponentJoined && channel) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel.name,
          event: 'game-started',
          data: {
            startedBy: playerId,
            roomId: roomId
          }
        })
      }).then(() => {
        onStartFastestGame(roomId);
      }).catch(console.error);
    }
  };

  // الرجوع للخيارات - نفس الوظيفة الأصلية
  const goBack = () => {
    setMode('choice');
    setJoinError('');
    setJoinRoomId('');
    setOpponentJoined(false);
    if (channel) {
      pusher.unsubscribe(channel.name);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
            
            {/* العنوان الرئيسي */}
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                  ⚡ من أسرع
                </span>
              </h1>
              <p className="text-gray-400 text-lg">تحدى سرعتك في الإجابة ضد المنافسين</p>
            </div>

            {/* اختيار النمط - التصميم الجديد */}
            {mode === 'choice' && (
              <div className="space-y-6">
                <button
                  onClick={() => setMode('create')}
                  className="group relative w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      إنشاء غرفة جديدة
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('join')}
                  className="group relative w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      الانضمام لغرفة موجودة
                    </div>
                  </div>
                </button>

                {/* زر العودة للرئيسية */}
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  ← العودة للرئيسية
                </button>
              </div>
            )}

            {/* إنشاء غرفة - التصميم الجديد */}
            {mode === 'create' && (
              <div className="space-y-6">
                <button
                  onClick={createRoom}
                  className="group relative w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                    إنشاء غرفة الآن
                  </div>
                </button>
                
                <button 
                  onClick={goBack} 
                  className="w-full px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-300 rounded-2xl font-semibold transition-all duration-300"
                >
                  رجوع
                </button>
              </div>
            )}

            {/* الانضمام لغرفة - التصميم الجديد */}
            {mode === 'join' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3 text-right">رقم الغرفة:</label>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="أدخل رقم الغرفة"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 font-mono text-center tracking-widest focus:border-blue-400 focus:outline-none transition-all duration-300"
                    maxLength={8}
                  />
                  {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
                </div>
                
                <button
                  onClick={joinRoom}
                  disabled={!joinRoomId.trim()}
                  className="group relative w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100">
                    انضمام
                  </div>
                </button>
                
                <button 
                  onClick={goBack} 
                  className="w-full px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-300 rounded-2xl font-semibold transition-all duration-300"
                >
                  رجوع
                </button>
              </div>
            )}

            {/* انتظار اللاعبين - التصميم الجديد */}
            {mode === 'waiting' && (
              <div className="space-y-6">
                <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-3">الغرفة جاهزة!</h3>
                  <p className="text-gray-300 mb-4">شارك رقم الغرفة مع منافسك:</p>
                  
                  <div className="p-4 bg-white/10 rounded-xl border border-white/20 mb-4">
                    <p className="text-2xl font-mono font-bold text-white tracking-widest">{roomId}</p>
                  </div>
                  
                  <button
                    onClick={copyRoomId}
                    className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-xl font-semibold transition-all duration-300"
                  >
                    📋 نسخ رقم الغرفة
                  </button>
                </div>

                {opponentJoined ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-xl">✅</span>
                      </div>
                      <p className="text-emerald-400 font-bold">المنافس انضم!</p>
                    </div>
                    
                    <button
                      onClick={startGame}
                      className="group relative w-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                        ⚡ ابدأ التحدي!
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                    <div className="animate-pulse w-12 h-12 bg-yellow-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-xl">⏳</span>
                    </div>
                    <p className="text-yellow-400 font-semibold">في انتظار المنافس...</p>
                  </div>
                )}
              </div>
            )}

            {/* حالة الانضمام - التصميم الجديد */}
            {mode === 'joining' && (
              <div className="space-y-6">
                <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-blue-400 mb-3">جاري الانضمام...</h3>
                  <p className="text-gray-300 mb-2">رقم الغرفة: {joinRoomId}</p>
                  <p className="text-gray-400 text-sm">يرجى الانتظار...</p>
                </div>
                
                <button 
                  onClick={goBack} 
                  className="w-full px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-300 rounded-2xl font-semibold transition-all duration-300"
                >
                  إلغاء
                </button>
              </div>
            )}

            {/* تم الانضمام بنجاح - التصميم الجديد */}
            {mode === 'joined' && (
              <div className="space-y-6">
                <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-3">تم الانضمام بنجاح!</h3>
                  <p className="text-gray-300 mb-2">في انتظار المضيف لبدء اللعبة...</p>
                  <p className="text-gray-400 text-sm">رقم الغرفة: {joinRoomId}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}