
//================================================================================
// 2️⃣ components/GuessWhoRouter.jsx - محدث
//================================================================================

'use client';

import React, { useState, useEffect } from 'react';
import GuessWhoSetup from './GuessWhoSetup';
import GuessWhoGame from './GuessWhoGame';

export default function GuessWhoRouter({ roomIdFromUrl = null }) {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing'
  const [roomId, setRoomId] = useState(roomIdFromUrl);

  const startGuessWhoGame = (newRoomId) => {
    setRoomId(newRoomId);
    setGameState('playing');
  };

  const goBackToSetup = () => {
    setGameState('setup');
    setRoomId(null);
  };

  if (gameState === 'setup') {
    return (
      <GuessWhoSetup 
        onStartGame={startGuessWhoGame}
        roomIdFromUrl={roomIdFromUrl}
      />
    );
  }

  return (
    <GuessWhoGame 
      roomId={roomId}
      onGoBack={goBackToSetup}
    />
  );
}