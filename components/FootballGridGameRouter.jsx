// components/FootballGridGameRouter.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import FootballGridSetup from './FootballGridSetup';
import FootballGridGame from './FootballGridGame';

export default function FootballGridGameRouter({ roomIdFromUrl = null }) {
  const [gameState, setGameState] = useState('setup');
  const [pusher, setPusher] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomIdFromUrl);

  // إعداد Pusher
  useEffect(() => {
    const pusherClient = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      encrypted: true
    });

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected!');
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('❌ Pusher error:', err);
    });

    setPusher(pusherClient);

    // إنشاء Player ID فريد
    const newPlayerId = 'player_' + Math.random().toString(36).substr(2, 9);
    setPlayerId(newPlayerId);

    if (roomIdFromUrl) {
      setGameState('joining');
    }

    return () => {
      pusherClient.disconnect();
    };
  }, [roomIdFromUrl]);

  const handleGameStart = (roomId, hostStatus) => {
    console.log('🎯 handleGameStart called:', {
      roomId,
      hostStatus,
      willBeColor: hostStatus ? 'red' : 'blue'
    });
    
    setCurrentRoomId(roomId);
    setIsHost(hostStatus);
    setGameState('playing');
  };

  const handleGameEnd = () => {
    setGameState('finished');
  };

  // شاشة التحميل
  if (!pusher) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-xl">⚽ جاري تحميل اللعبة...</p>
          </div>
        </div>
      </div>
    );
  }

  // التوجيه حسب حالة اللعبة
  if (gameState === 'setup' || gameState === 'joining') {
    return (
      <FootballGridSetup 
        pusher={pusher}
        playerId={playerId}
        onStartGame={handleGameStart}
        roomIdFromUrl={roomIdFromUrl}
      />
    );
  }

  if (gameState === 'playing') {
    console.log('🎮 Rendering Game with:', {
      isHost,
      playerId,
      roomId: currentRoomId
    });
    
    return (
      <FootballGridGame
        pusher={pusher}
        roomId={currentRoomId}
        playerId={playerId}
        opponentId={opponentId}
        isHost={isHost}
        onGameEnd={handleGameEnd}
      />
    );
  }

  return null;
}