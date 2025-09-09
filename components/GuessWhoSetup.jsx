//================================================================================
// 1️⃣ components/GuessWhoSetup.jsx - ملف جديد
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
  const copyRoomId = () => {
    const fullUrl = `${window.location.origin}/guess-who/join/${roomId}`;
    navigator.clipboard.writeText(fullUrl);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
           من هو؟
        </h1>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
        >
          ← العودة للرئيسية
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-700">
          
          {mode === 'choice' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">لعبة من هو؟</h2>
              <p className="text-slate-300 mb-8">خمن الشخصية المختارة من خصمك!</p>
              
              {joinError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-300 text-sm">{joinError}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300"
                >
                  إنشاء غرفة جديدة
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">أو</span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="رقم الغرفة"
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-3 text-center text-lg font-bold"
                    onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                  />
                  <button
                    onClick={() => joinRoom()}
                    disabled={!joinRoomId.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg transition-all duration-300"
                  >
                    الانضمام للغرفة
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'creating' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">غرفة جديدة</h2>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <p className="text-slate-300 mb-2">رقم الغرفة:</p>
                <p className="text-2xl font-bold text-white mb-4">{roomId}</p>
       
              </div>

              {!opponentJoined ? (
                <>
                  <div className="animate-pulse mb-4">
                    <div className="w-16 h-16 bg-blue-500/50 rounded-full mx-auto mb-4"></div>
                  </div>
                  <p className="text-slate-300 mb-6">انتظار انضمام لاعب آخر...</p>
                </>
              ) : (
                <>
                  <div className="text-green-500 mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <p className="text-green-400 mb-6">انضم لاعب! يمكنك بدء اللعبة الآن</p>
                  <button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300"
                  >
                    بدء اللعبة
                  </button>
                </>
              )}

              <button
                onClick={goBack}
                className="w-full mt-4 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-bold transition-all duration-300"
              >
                إلغاء
              </button>
            </>
          )}

          {mode === 'joining' && (
            <>
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-4">جاري الانضمام...</h2>
              <p className="text-slate-300 mb-6">انتظار موافقة صاحب الغرفة</p>
              <button
                onClick={goBack}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-bold transition-all duration-300"
              >
                إلغاء
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


