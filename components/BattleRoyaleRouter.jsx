// components/BattleRoyaleRouter.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import BattleRoyaleSetup from './BattleRoyaleSetup';
import BattleRoyaleGame from './BattleRoyaleGame';
import ToastNotification from './ToastNotification';
import Link from 'next/link';

export default function BattleRoyaleRouter({ roomIdFromUrl }) {
  const [gameState, setGameState] = useState('setup'); // setup, playing
  const [roomId, setRoomId] = useState(roomIdFromUrl || '');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [pusher, setPusher] = useState(null);

  // إعداد Pusher
  useEffect(() => {
    const PusherClient = require('pusher-js');
    
    const pusherInstance = new PusherClient('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      forceTLS: true
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher متصل بنجاح!');
    });

    pusherInstance.connection.bind('error', (err) => {
      console.error('❌ خطأ في اتصال Pusher:', err);
    });

    setPusher(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, []);

  // بدء اللعبة
  const handleStartGame = (room, host, name, players) => {
    setRoomId(room);
    setIsHost(host);
    setPlayerName(name);
    setAllPlayers(players);
    setGameState('playing');
  };

  // العودة للإعداد
  const handleGameEnd = () => {
    setGameState('setup');
    setRoomId('');
    setIsHost(false);
    setPlayerName('');
    setAllPlayers([]);
  };

  if (!pusher) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastNotification />
      
      {/* زر الرجوع */}
      {gameState === 'setup' && (
        <div className="fixed top-6 left-6 z-50">
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 inline-block"
          >
            ← الرئيسية
          </Link>
        </div>
      )}

      {gameState === 'setup' && (
        <BattleRoyaleSetup
          onStartGame={handleStartGame}
          pusher={pusher}
        />
      )}

      {gameState === 'playing' && (
        <BattleRoyaleGame
          roomId={roomId}
          isHost={isHost}
          playerName={playerName}
          allPlayers={allPlayers}
          pusher={pusher}
          onGameEnd={handleGameEnd}
        />
      )}
    </>
  );
}