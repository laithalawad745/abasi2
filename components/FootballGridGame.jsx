// components/FootballGridGame.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  rowCriteria, 
  columnCriteria, 
  searchPlayer, 
  validatePlayerForCell,
  checkWinner 
} from '../app/data/footballGridData';

export default function FootballGridGame({ 
  pusher, 
  roomId, 
  playerId, 
  opponentId, 
  isHost, 
  onGameEnd 
}) {
  // طباعة معلومات اللاعب عند تحميل المكون
  useEffect(() => {
    console.log('🎮 Game Component Loaded:', {
      playerId,
      isHost,
      myColor: isHost ? 'red' : 'blue'
    });
  }, [playerId, isHost]);
  
  // حالة اللعبة
  const [grid, setGrid] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const [currentPlayer, setCurrentPlayer] = useState('red'); // red أو blue
  const [selectedCell, setSelectedCell] = useState(null); // {row, col}
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [gameResult, setGameResult] = useState(null); // {winner, line}
  const [errorMessage, setErrorMessage] = useState('');
  
  // تحديد لون اللاعب الحالي مرة واحدة
  const myColor = isHost ? 'red' : 'blue';
  
  // مراجع
  const channelRef = useRef(null);
  const searchInputRef = useRef(null);

  // إعداد Pusher
  useEffect(() => {
    if (!pusher || !roomId) return;

    const channel = pusher.subscribe(`football-grid-${roomId}`);
    channelRef.current = channel;

    // استقبال الحركات
    channel.bind('cell-claimed', (data) => {
      // كلا اللاعبين يحدثون الحالة لضمان التزامن
      setGrid(data.grid);
      setCurrentPlayer(data.nextPlayer);
      setErrorMessage('');
      
      console.log('🔄 Grid updated:', {
        currentPlayer: data.nextPlayer,
        from: data.playerId,
        me: playerId
      });
    });

    // استقبال نهاية اللعبة
    channel.bind('game-ended', (data) => {
      setGameResult(data.result);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [pusher, roomId, playerId]);

  // التحقق من الفوز بعد كل حركة
  useEffect(() => {
    const result = checkWinner(grid);
    if (result) {
      setGameResult(result);
      
      // إرسال النتيجة للخادم
      if (isHost) {
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `football-grid-${roomId}`,
            event: 'game-ended',
            data: { result }
          })
        });
      }
    }
  }, [grid, isHost, roomId]);

  // البحث عن اللاعبين
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchPlayer(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // اختيار مربع
  const handleCellClick = (row, col) => {
    console.log('🎯 Cell clicked:', { row, col, currentPlayer, myColor, isHost });
    
    // التحقق من صحة الحركة
    if (gameResult) {
      console.log('❌ Game already ended');
      return;
    }
    
    if (grid[row][col]) {
      console.log('❌ Cell already occupied');
      return;
    }
    
    if (currentPlayer !== myColor) {
      console.log('❌ Not your turn:', { currentPlayer, myColor });
      setErrorMessage('ليس دورك الآن!');
      return;
    }

    console.log('✅ Valid move, opening search');
    setSelectedCell({ row, col });
    setShowSearch(true);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
    
    // التركيز على حقل البحث
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // اختيار لاعب
  const handlePlayerSelect = (player) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const validation = validatePlayerForCell(player.name, row, col);

    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    // تحديث الشبكة
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = currentPlayer;
    
    const nextPlayer = currentPlayer === 'red' ? 'blue' : 'red';

    // تحديث الحالة المحلية أولاً
    setGrid(newGrid);
    setCurrentPlayer(nextPlayer);
    setShowSearch(false);
    setSelectedCell(null);
    setSearchQuery('');
    setErrorMessage('');

    console.log('✅ Move made locally:', {
      player: player.name,
      cell: { row, col },
      by: currentPlayer,
      nextPlayer,
      myId: playerId
    });

    // إرسال الحركة عبر Pusher لكلا اللاعبين
    const eventData = {
      channel: `football-grid-${roomId}`,
      event: 'cell-claimed',
      data: {
        playerId,
        grid: newGrid,
        nextPlayer,
        cell: { row, col },
        playerName: player.nameAr
      }
    };
    
    console.log('📤 Sending move to Pusher:', eventData);
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).then(response => {
      console.log('✅ Move sent successfully, response:', response.status);
      return response.json();
    }).then(data => {
      console.log('📥 Server response:', data);
    }).catch(err => {
      console.error('❌ Failed to send move:', err);
    });
  };

  // إلغاء الاختيار
  const handleCancelSelection = () => {
    setShowSearch(false);
    setSelectedCell(null);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
  };

  // لعبة جديدة
  const handleNewGame = () => {
    setGrid([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setCurrentPlayer('red');
    setGameResult(null);
    setErrorMessage('');
    setSelectedCell(null);
    setShowSearch(false);
  };

  // رسم المربع
  const renderCell = (row, col) => {
    const cellValue = grid[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    
    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={!!cellValue || !!gameResult}
        className={`
          aspect-square rounded-2xl border-4 transition-all duration-300
          ${cellValue === 'red' ? 'bg-red-500/30 border-red-500' : ''}
          ${cellValue === 'blue' ? 'bg-blue-500/30 border-blue-500' : ''}
          ${!cellValue && !gameResult ? 'bg-slate-700/50 border-slate-600 hover:border-cyan-500 hover:bg-slate-600/50' : ''}
          ${isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/50' : ''}
          ${cellValue || gameResult ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {cellValue && (
          <div className="flex items-center justify-center h-full">
            <div className={`text-6xl ${cellValue === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              {cellValue === 'red' ? '❌' : '⭕'}
            </div>
          </div>
        )}
        {!cellValue && !gameResult && (
          <div className="flex items-center justify-center h-full opacity-30">
            <span className="text-4xl">➕</span>
          </div>
        )}
      </button>
    );
  };

  const isMyTurn = currentPlayer === myColor;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              ⚽ Football Grid
            </h1>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <span className="text-white/60 text-sm">رمز الغرفة:</span>
              <span className="text-white font-bold ml-2">{roomId}</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
          >
            ← الرئيسية
          </button>
        </div>

        {/* حالة اللاعب */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
              myColor === 'red' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              أنت: {myColor === 'red' ? '❌ الأحمر' : '⭕ الأزرق'}
            </div>
            
            <div className={`px-6 py-3 rounded-2xl font-bold text-lg ${
              isMyTurn 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse' 
                : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-300'
            }`}>
              {isMyTurn ? '🎯 دورك الآن!' : '⏳ انتظر دور الخصم'}
            </div>
          </div>
        </div>

        {/* رسالة خطأ */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold">❌ {errorMessage}</p>
            </div>
          </div>
        )}

        {/* الشبكة */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            {/* العناوين */}
            <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4 mb-4">
              <div></div>
              {columnCriteria.map((criterion, index) => (
                <div key={index} className="flex flex-col items-center justify-center  rounded-2xl p-4 min-h-[100px]">
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={criterion.imageUrl} 
                      alt={criterion.name}
                      className="max-w-full max-h-[60px] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-4xl">${criterion.flag || '🏴'}</span>`;
                      }}
                    />
                  </div>
                  <div className="text-white font-bold text-center text-sm mt-2">{criterion.name}</div>
                </div>
              ))}
            </div>

            {/* الصفوف */}
            {[0, 1, 2].map(rowIndex => (
              <div key={rowIndex} className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4 mb-4">
                <div className="flex flex-col items-center justify-center   rounded-2xl p-4 min-h-[120px]">
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={rowCriteria[rowIndex].imageUrl} 
                      alt={rowCriteria[rowIndex].name}
                      className="max-w-full max-h-[70px] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-4xl">${rowCriteria[rowIndex].icon || '🏆'}</span>`;
                      }}
                    />
                  </div>
                  <div className="text-white font-bold text-center text-xs mt-2">{rowCriteria[rowIndex].name}</div>
                </div>
                
                {[0, 1, 2].map(colIndex => renderCell(rowIndex, colIndex))}
              </div>
            ))}
          </div>
        </div>

        {/* نافذة البحث */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">ابحث عن لاعب</h3>
                  <button
                    onClick={handleCancelSelection}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                {selectedCell && (
                  <div className="mb-4 p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-white/80 text-sm mb-2">يجب أن يطابق اللاعب:</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-500/30 border border-blue-500 rounded-lg text-blue-300 text-sm">
                        {rowCriteria[selectedCell.row].nameAr}
                      </span>
                      <span className="px-3 py-1 bg-green-500/30 border border-green-500 rounded-lg text-green-300 text-sm">
                        {columnCriteria[selectedCell.col].nameAr}
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب اسم اللاعب..."
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border-2 border-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((player, index) => (
                      <button
                        key={index}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-300 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-bold">{player.name}</p>
                            <p className="text-white/60 text-sm">{player.nameAr}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-cyan-400 text-sm">{player.nationality}</p>
                            <p className="text-white/60 text-xs">🏆 {player.uclTitles} UCL</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center text-white/60 py-8">
                    لا توجد نتائج
                  </div>
                ) : (
                  <div className="text-center text-white/60 py-8">
                    ابدأ الكتابة للبحث...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* نافذة النتيجة */}
        {gameResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
              {gameResult.winner === 'draw' ? (
                <>
                  <div className="text-6xl mb-4">🤝</div>
                  <h2 className="text-3xl font-bold text-white mb-4">تعادل!</h2>
                  <p className="text-white/60 mb-6">امتلأت الشبكة بدون فائز</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">
                    {gameResult.winner === 'red' ? '❌' : '⭕'}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {gameResult.winner === myColor ? '🎉 لقد فزت!' : '😔 خسرت!'}
                  </h2>
                  <p className="text-white/60 mb-6">
                    الفائز: {gameResult.winner === 'red' ? 'الفريق الأحمر ❌' : 'الفريق الأزرق ⭕'}
                  </p>
                </>
              )}
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNewGame}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all duration-300"
                >
                  لعبة جديدة
                </button>
                <button
                  onClick={() => window.location.href = '/football-grid'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all duration-300"
                >
                  العودة للقائمة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}