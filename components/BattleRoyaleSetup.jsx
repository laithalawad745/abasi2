// components/BattleRoyaleSetup.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BATTLE_ROYALE_CONFIG } from '../app/data/battleRoyaleData';
import { showSuccessToast, showErrorToast, showInfoToast } from './ToastNotification';

export default function BattleRoyaleSetup({ onStartGame, pusher }) {
  const [mode, setMode] = useState('choice'); // choice, hosting, joining
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [channel, setChannel] = useState(null);
  
  const playerId = useRef(Math.random().toString(36).substr(2, 9)).current;

  // توليد رقم غرفة عشوائي
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // إنشاء غرفة جديدة
  const createRoom = () => {
    if (!playerName.trim()) {
      showErrorToast('الرجاء إدخال اسمك!');
      return;
    }

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setMode('hosting');

    // إضافة المضيف كأول لاعب
    setPlayers([{ id: playerId, name: playerName.trim(), isHost: true }]);

    // الاشتراك في قناة Pusher
    const channelName = `battle-royale-${newRoomId}`;
    const newChannel = pusher.subscribe(channelName);
    setChannel(newChannel);

    // الاستماع للاعبين الجدد
    newChannel.bind('player-joined', (data) => {
      console.log('لاعب جديد انضم:', data);
      setPlayers(prev => {
        if (prev.find(p => p.id === data.playerId)) return prev;
        showInfoToast(`${data.playerName} انضم للعبة! 🎮`);
        return [...prev, { id: data.playerId, name: data.playerName, isHost: false }];
      });
    });

    showSuccessToast(`تم إنشاء الغرفة: ${newRoomId}`);
  };

  // الانضمام لغرفة
  const joinRoom = () => {
    if (!playerName.trim()) {
      showErrorToast('الرجاء إدخال اسمك!');
      return;
    }

    if (!joinRoomId.trim()) {
      showErrorToast('الرجاء إدخال رقم الغرفة!');
      return;
    }

    const cleanRoomId = joinRoomId.trim().toUpperCase();
    setRoomId(cleanRoomId);
    setIsHost(false);
    setMode('joining');

    // الاشتراك في قناة Pusher
    const channelName = `battle-royale-${cleanRoomId}`;
    const newChannel = pusher.subscribe(channelName);
    setChannel(newChannel);

    // الاستماع لبدء اللعبة
    newChannel.bind('game-started', (data) => {
      console.log('اللعبة بدأت!', data);
      onStartGame(cleanRoomId, false, playerName.trim(), data.allPlayers);
    });

    // الاستماع للاعبين الآخرين
    newChannel.bind('player-joined', (data) => {
      if (data.playerId !== playerId) {
        setPlayers(prev => {
          if (prev.find(p => p.id === data.playerId)) return prev;
          return [...prev, { id: data.playerId, name: data.playerName, isHost: false }];
        });
      }
    });

    // إرسال إشعار الانضمام
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'player-joined',
          data: { 
            playerId, 
            playerName: playerName.trim(),
            isHost: false
          }
        })
      }).catch(err => {
        console.error('فشل الانضمام:', err);
        setJoinError('فشل الانضمام للغرفة');
      });
    }, 500);

    showInfoToast('جاري الانضمام...');
  };

  // نسخ رقم الغرفة
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showSuccessToast('تم نسخ رقم الغرفة! 📋');
  };

  // بدء اللعبة
  const startGame = () => {
    if (players.length < BATTLE_ROYALE_CONFIG.MIN_PLAYERS) {
      showErrorToast(`يجب أن يكون هناك ${BATTLE_ROYALE_CONFIG.MIN_PLAYERS} لاعب على الأقل!`);
      return;
    }

    // إرسال حدث بدء اللعبة
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `battle-royale-${roomId}`,
        event: 'game-started',
        data: { 
          hostId: playerId,
          allPlayers: players
        }
      })
    });

    onStartGame(roomId, true, playerName.trim(), players);
  };

  // صفحة الاختيار
  if (mode === 'choice') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
                BATTLE ROYALE
              </span>
            </div>
          </div>

          {/* العنوان */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              معركة المعرفة ⚔️
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              آخر لاعب يبقى يفوز!
            </p>
            <div className="flex justify-center gap-4 flex-wrap text-sm text-gray-500">
              <span>👥 {BATTLE_ROYALE_CONFIG.MIN_PLAYERS}-{BATTLE_ROYALE_CONFIG.MAX_PLAYERS} لاعبين</span>
              <span>⏱️ {BATTLE_ROYALE_CONFIG.QUESTION_TIMEOUT} ثانية للسؤال</span>
              <span>❓ {BATTLE_ROYALE_CONFIG.TOTAL_QUESTIONS} سؤال</span>
            </div>
          </div>

          {/* إدخال الاسم */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="أدخل اسمك..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-lg text-center focus:outline-none focus:border-orange-400/50 transition-all"
              maxLength={15}
            />
          </div>

          {/* أزرار الاختيار */}
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={createRoom}
              disabled={!playerName.trim()}
              className="group relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">إنشاء غرفة</h3>
                <p className="text-gray-400">ابدأ لعبة جديدة</p>
              </div>
            </button>

            <button
              onClick={() => setMode('join-input')}
              disabled={!playerName.trim()}
              className="group relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🚪</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">الانضمام لغرفة</h3>
                <p className="text-gray-400">انضم لأصدقائك</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة إدخال رقم الغرفة
  if (mode === 'join-input') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>
        
        <div className="relative z-10 max-w-md w-full p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              🚪 الانضمام للعبة
            </h2>
            
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="أدخل رقم الغرفة..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-lg text-center focus:outline-none focus:border-blue-400/50 transition-all mb-4"
              maxLength={6}
            />

            {joinError && (
              <p className="text-red-400 text-center mb-4">{joinError}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={joinRoom}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all"
              >
                انضم
              </button>
              <button
                onClick={() => setMode('choice')}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // غرفة الانتظار (للمضيف)
  if (mode === 'hosting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-4">
                🎮 غرفة الانتظار
              </h1>
              
              {/* رقم الغرفة */}
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/50 rounded-2xl mb-4">
                <span className="text-gray-400 font-semibold">رقم الغرفة:</span>
                <span className="text-4xl font-black text-white tracking-wider">{roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  📋
                </button>
              </div>

              <p className="text-gray-400">
                شارك هذا الرقم مع أصدقائك للانضمام!
              </p>
            </div>

            {/* قائمة اللاعبين */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                اللاعبون ({players.length}/{BATTLE_ROYALE_CONFIG.MAX_PLAYERS})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{player.name}</p>
                      {player.isHost && (
                        <span className="text-yellow-400 text-sm">👑 المضيف</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-4">
              <button
                onClick={startGame}
                disabled={players.length < BATTLE_ROYALE_CONFIG.MIN_PLAYERS}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xl transition-all"
              >
                ابدأ اللعبة 🚀
              </button>
            </div>

            {players.length < BATTLE_ROYALE_CONFIG.MIN_PLAYERS && (
              <p className="text-center text-yellow-400 mt-4">
                ⚠️ في انتظار {BATTLE_ROYALE_CONFIG.MIN_PLAYERS - players.length} لاعب إضافي على الأقل
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // غرفة الانتظار (للضيوف)
  if (mode === 'joining') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]"></div>

        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-400 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">
            في انتظار بدء اللعبة...
          </h2>
          <p className="text-gray-400 text-lg">
            المضيف سيبدأ اللعبة قريباً! 🎮
          </p>
          
          <div className="mt-8">
            <p className="text-white font-semibold mb-2">اللاعبون:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {players.map(player => (
                <span key={player.id} className="px-4 py-2 bg-white/10 rounded-xl text-white">
                  {player.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}