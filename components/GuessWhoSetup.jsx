//================================================================================
// 1️⃣ components/GuessWhoSetup.jsx - بالتصميم الجديد
//================================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

export default function GuessWhoSetup({ onStartGame, roomIdFromUrl = null }) {
  const [mode, setMode] = useState(roomIdFromUrl ? 'joining' : 'choice'); // 'choice', 'creating', 'joining'
  const [roomId, setRoomId] = useState(roomIdFromUrl || '');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  const channelRef = useRef(null);

  // Auto-join if URL has roomId
  useEffect(() => {
    if (roomIdFromUrl) {
      joinRoom(roomIdFromUrl);
    }
  }, [roomIdFromUrl]);

  // Create room
  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setMode('creating');
    
    // Initialize Pusher
    const pusher = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2'
    });

    const channelName = `guess-who-${newRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Listen for opponent joining
    channel.bind('player-joined', (data) => {
      if (data.playerId !== playerId && !data.isHost) {
        setOpponentJoined(true);
      }
    });

    // Listen for game start
    channel.bind('game-started', (data) => {
      onStartGame(newRoomId);
    });
  };

  // Join room
  const joinRoom = (targetRoomId = null) => {
    const cleanRoomId = (targetRoomId || joinRoomId).trim().toUpperCase();
    if (!cleanRoomId) return;
    
    setMode('joining');
    setJoinError('');

    // Initialize Pusher
    const pusher = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2'
    });

    const channelName = `guess-who-${cleanRoomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Listen for host response
    channel.bind('host-response', (data) => {
      if (data.accepted) {
        setOpponentJoined(true);
        setRoomId(cleanRoomId);
      } else {
        setJoinError('الغرفة ممتلئة أو غير متاحة');
        setMode('choice');
      }
    });

    // Listen for game start
    channel.bind('game-started', (data) => {
      onStartGame(cleanRoomId);
    });

    // Send join request
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
        // Timeout for joining
        setTimeout(() => {
          if (mode === 'joining') {
            setJoinError('لم يتم العثور على الغرفة');
            setMode('choice');
          }
        }, 8000);
      }).catch(console.error);
    }, 1000);
  };

  // Copy room ID
  // const copyRoomId = () => {
  //   const fullUrl = `${window.location.origin}/guess-who/join/${roomId}`;
  //   navigator.clipboard.writeText(fullUrl);
  // };
// Copy room ID
const copyRoomId = () => {
  navigator.clipboard.writeText(roomId);  // ← نسخ رقم الغرفة فقط
};
  // Start game
  const startGame = () => {
    if (opponentJoined && channelRef.current) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelRef.current.name,
          event: 'game-started',
          data: {
            startedBy: playerId,
            roomId: roomId
          }
        })
      }).then(() => {
        onStartGame(roomId);
      }).catch(console.error);
    }
  };

  // Go back
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
              من هو؟
            </span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            ← العودة للرئيسية
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            
            {mode === 'choice' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">لعبة من هو؟</h2>
                  <p className="text-xl text-gray-300">خمن الشخصية المختارة من خصمك!</p>
                </div>
                
                {joinError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                    <p className="text-red-300">{joinError}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <button
                    onClick={createRoom}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
                  >
                    إنشاء غرفة جديدة
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-lg">
                      <span className="px-4 bg-[#0a0a0f] text-gray-400">أو</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      placeholder="رقم الغرفة"
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl px-6 py-4 text-center text-xl font-bold placeholder-gray-400 focus:border-cyan-500/50 focus:outline-none transition-all duration-300"
                      onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                    />
                    <button
                      onClick={() => joinRoom()}
                      disabled={!joinRoomId.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30"
                    >
                      الانضمام للغرفة
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'creating' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">غرفة جديدة</h2>
                </div>
                
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
                  <p className="text-gray-300 mb-4 text-lg">رقم الغرفة:</p>
                  <p className="text-4xl font-bold text-white mb-6">{roomId}</p>
                  <button
                    onClick={copyRoomId}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  >
                    📋 نسخ الرابط
                  </button>
                </div>

                {!opponentJoined ? (
                  <>
                    <div className="animate-pulse mb-6">
                      <div className="w-20 h-20 bg-cyan-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <div className="w-12 h-12 bg-cyan-500/50 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-8 text-lg">انتظار انضمام لاعب آخر...</p>
                  </>
                ) : (
                  <>
                    <div className="text-green-400 mb-6">
                      <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl">✓</span>
                      </div>
                    </div>
                    <p className="text-green-400 mb-8 text-lg">انضم لاعب! يمكنك بدء اللعبة الآن</p>
                    <button
                      onClick={startGame}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
                    >
                      🚀 بدء اللعبة
                    </button>
                  </>
                )}

                <button
                  onClick={goBack}
                  className="w-full mt-6 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105"
                >
                  إلغاء
                </button>
              </>
            )}

            {mode === 'joining' && (
              <>
                <div className="animate-spin w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-4">جاري الانضمام...</h2>
                <p className="text-gray-300 mb-8 text-lg">انتظار موافقة صاحب الغرفة</p>
                <button
                  onClick={goBack}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105"
                >
                  إلغاء
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}