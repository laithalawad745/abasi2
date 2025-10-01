// components/FootballGridGame.jsx - نسخة مع معايير متغيرة
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  generateNewGame,
  allRowCriteria,
  allColumnCriteria,
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
  // المضيف ينشئ المعايير، الضيف ينتظر استقبالها
  const [gameCriteria, setGameCriteria] = useState(() => 
    isHost ? generateNewGame() : null
  );
  const [waitingForCriteria, setWaitingForCriteria] = useState(!isHost);
  
  const [grid, setGrid] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [selectedCell, setSelectedCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const myColor = isHost ? 'red' : 'blue';
  const channelRef = useRef(null);
  const searchInputRef = useRef(null);

  // المضيف يرسل المعايير للضيف عند بدء اللعبة
  useEffect(() => {
    if (isHost && gameCriteria) {
      console.log('🎲 Host sending criteria to guest:', {
        rows: gameCriteria.rowCriteria.map(c => c.nameAr),
        cols: gameCriteria.columnCriteria.map(c => c.nameAr)
      });

      // إرسال IDs فقط بدلاً من الكائنات الكاملة
      setTimeout(() => {
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `football-grid-${roomId}`,
            event: 'initial-criteria',
            data: { 
              rowIds: gameCriteria.rowCriteria.map(c => c.id),
              colIds: gameCriteria.columnCriteria.map(c => c.id)
            }
          })
        });
      }, 500);
    }
  }, [isHost, gameCriteria, roomId]);

  // إعداد Pusher
  useEffect(() => {
    if (!pusher || !roomId) return;

    const channel = pusher.subscribe(`football-grid-${roomId}`);
    channelRef.current = channel;

    // 🆕 الضيف يستقبل المعايير من المضيف
    channel.bind('initial-criteria', (data) => {
      console.log('📥 Guest received criteria IDs from host:', data);
      
      // إعادة بناء المعايير من القوائم الأصلية باستخدام IDs
      const reconstructedCriteria = {
        rowCriteria: data.rowIds.map(id => 
          allRowCriteria.find(c => c.id === id)
        ),
        columnCriteria: data.colIds.map(id => 
          allColumnCriteria.find(c => c.id === id)
        )
      };
      
      console.log('✅ Reconstructed criteria:', {
        rows: reconstructedCriteria.rowCriteria.map(c => c.nameAr),
        cols: reconstructedCriteria.columnCriteria.map(c => c.nameAr)
      });
      
      setGameCriteria(reconstructedCriteria);
      setWaitingForCriteria(false);
    });

    channel.bind('cell-claimed', (data) => {
      setGrid(data.grid);
      setCurrentPlayer(data.nextPlayer);
      setErrorMessage('');
    });

    channel.bind('game-ended', (data) => {
      setGameResult(data.result);
    });

    // 🆕 استقبال معايير جديدة للعبة جديدة
    channel.bind('new-criteria', (data) => {
      console.log('🔄 New criteria IDs received:', data);
      
      // إعادة بناء المعايير من القوائم الأصلية
      const reconstructedCriteria = {
        rowCriteria: data.rowIds.map(id => 
          allRowCriteria.find(c => c.id === id)
        ),
        columnCriteria: data.colIds.map(id => 
          allColumnCriteria.find(c => c.id === id)
        )
      };
      
      console.log('✅ Reconstructed new criteria:', {
        rows: reconstructedCriteria.rowCriteria.map(c => c.nameAr),
        cols: reconstructedCriteria.columnCriteria.map(c => c.nameAr)
      });
      
      setGameCriteria(reconstructedCriteria);
      setGrid([
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]);
      setCurrentPlayer('red');
      setGameResult(null);
      setErrorMessage('');
    });

    return () => {
      channel.unsubscribe();
    };
  }, [pusher, roomId]);

  // التحقق من الفوز
  useEffect(() => {
    const result = checkWinner(grid);
    if (result) {
      setGameResult(result);
      
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

  // البحث
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchPlayer(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCellClick = (row, col) => {
    if (gameResult || grid[row][col]) return;
    
    if (currentPlayer !== myColor) {
      setErrorMessage('ليس دورك الآن!');
      return;
    }

    setSelectedCell({ row, col });
    setShowSearch(true);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
    
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handlePlayerSelect = (player) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const validation = validatePlayerForCell(
      player.name, 
      row, 
      col, 
      gameCriteria.rowCriteria, 
      gameCriteria.columnCriteria
    );

    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = currentPlayer;
    
    const nextPlayer = currentPlayer === 'red' ? 'blue' : 'red';

    setGrid(newGrid);
    setCurrentPlayer(nextPlayer);
    setShowSearch(false);
    setSelectedCell(null);
    setSearchQuery('');
    setErrorMessage('');

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `football-grid-${roomId}`,
        event: 'cell-claimed',
        data: {
          playerId,
          grid: newGrid,
          nextPlayer,
          cell: { row, col },
          playerName: player.nameAr
        }
      })
    });
  };

  const handleCancelSelection = () => {
    setShowSearch(false);
    setSelectedCell(null);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
  };

  const handleNewGame = () => {
    // فقط المضيف يمكنه إنشاء لعبة جديدة
    if (!isHost) return;

    // توليد معايير جديدة عشوائية
    const newCriteria = generateNewGame();
    console.log('🎲 Host creating new game with criteria:', {
      rows: newCriteria.rowCriteria.map(c => c.nameAr),
      cols: newCriteria.columnCriteria.map(c => c.nameAr)
    });
    
    setGameCriteria(newCriteria);
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

    // إرسال المعايير الجديدة للضيف (IDs فقط)
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `football-grid-${roomId}`,
        event: 'new-criteria',
        data: { 
          rowIds: newCriteria.rowCriteria.map(c => c.id),
          colIds: newCriteria.columnCriteria.map(c => c.id)
        }
      })
    });
  };

  const renderCell = (row, col) => {
    const cellValue = grid[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    
    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={!!cellValue || !!gameResult}
        className={`
          aspect-square rounded-lg md:rounded-2xl border-2 md:border-4 transition-all duration-300
          ${cellValue === 'red' ? 'bg-red-500/30 border-red-500' : ''}
          ${cellValue === 'blue' ? 'bg-blue-500/30 border-blue-500' : ''}
          ${!cellValue && !gameResult ? 'bg-slate-700/50 border-slate-600 hover:border-cyan-500 hover:bg-slate-600/50' : ''}
          ${isSelected ? 'border-yellow-400 ring-2 md:ring-4 ring-yellow-400/50' : ''}
          ${cellValue || gameResult ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {cellValue && (
          <div className="flex items-center justify-center h-full">
            <div className={`text-3xl md:text-6xl ${cellValue === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              {cellValue === 'red' ? '❌' : '⭕'}
            </div>
          </div>
        )}
        {!cellValue && !gameResult && (
          <div className="flex items-center justify-center h-full opacity-30">
            <span className="text-2xl md:text-4xl">➕</span>
          </div>
        )}
      </button>
    );
  };

  const isMyTurn = currentPlayer === myColor;

  // 🆕 شاشة انتظار المعايير للضيف
  if (waitingForCriteria || !gameCriteria) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-400 mx-auto mb-6"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ⚽ جاري تحميل اللعبة...
          </h2>
          <p className="text-gray-400 text-lg">
            انتظر المضيف لبدء اللعبة
          </p>
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

      <div className="relative z-10 p-3 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              X - O
            </h1>
            <div className="px-2 md:px-4 py-1 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg md:rounded-xl text-xs md:text-base">
              <span className="text-white/60">غرفة:</span>
              <span className="text-white font-bold ml-1 md:ml-2">{roomId}</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="px-4 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg md:rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm md:text-base"
          >
            ← الرئيسية
          </button>
        </div>

        {/* حالة اللاعب */}
        <div className="max-w-5xl mx-auto mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4">
            <div className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all duration-300 text-center ${
              myColor === 'red' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              أنت: {myColor === 'red' ? '❌ الأحمر' : '⭕ الأزرق'}
            </div>
            
            <div className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg text-center ${
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
          <div className="max-w-5xl mx-auto mb-3 md:mb-6">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
              <p className="text-red-400 font-bold text-sm md:text-base">❌ {errorMessage}</p>
            </div>
          </div>
        )}

        {/* الشبكة */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-8">
            {/* العناوين العلوية */}
            <div className="grid grid-cols-[60px_1fr_1fr_1fr] md:grid-cols-[100px_1fr_1fr_1fr] gap-1 md:gap-4 mb-2 md:mb-4">
              <div></div>
              {gameCriteria.columnCriteria.map((criterion, index) => (
                <div key={index} className="flex flex-col items-center justify-center rounded-lg md:rounded-2xl p-1 md:p-4 min-h-[60px] md:min-h-[100px]">
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={criterion.imageUrl} 
                      alt={criterion.name}
                      className="max-w-full max-h-[30px] md:max-h-[60px] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-xl md:text-4xl">🏴</span>`;
                      }}
                    />
                  </div>
                  <div className="text-white font-bold text-center text-[9px] md:text-sm mt-1 md:mt-2 leading-tight">{criterion.nameAr}</div>
                </div>
              ))}
            </div>

            {/* الصفوف */}
            {[0, 1, 2].map(rowIndex => (
              <div key={rowIndex} className="grid grid-cols-[60px_1fr_1fr_1fr] md:grid-cols-[100px_1fr_1fr_1fr] gap-1 md:gap-4 mb-1 md:mb-4">
                <div className="flex flex-col items-center justify-center rounded-lg md:rounded-2xl p-1 md:p-4 min-h-[60px] md:min-h-[120px]">
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={gameCriteria.rowCriteria[rowIndex].imageUrl} 
                      alt={gameCriteria.rowCriteria[rowIndex].name}
                      className="max-w-full max-h-[35px] md:max-h-[70px] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-xl md:text-4xl">🏆</span>`;
                      }}
                    />
                  </div>
                  <div className="text-white font-bold text-center text-[8px] md:text-xs mt-1 md:mt-2 leading-tight">{gameCriteria.rowCriteria[rowIndex].nameAr}</div>
                </div>
                
                {[0, 1, 2].map(colIndex => renderCell(rowIndex, colIndex))}
              </div>
            ))}
          </div>
        </div>

        {/* نافذة البحث */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-700">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-lg md:text-2xl font-bold text-white">ابحث عن لاعب</h3>
                  <button
                    onClick={handleCancelSelection}
                    className="text-slate-400 hover:text-white transition-colors text-2xl md:text-3xl"
                  >
                    ✕
                  </button>
                </div>

                {selectedCell && (
                  <div className="mb-3 md:mb-4 p-3 md:p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-white/80 text-xs md:text-sm mb-2">يجب أن يطابق اللاعب:</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 md:px-3 py-1 bg-blue-500/30 border border-blue-500 rounded-lg text-blue-300 text-xs md:text-sm">
                        {gameCriteria.rowCriteria[selectedCell.row].nameAr}
                      </span>
                      <span className="px-2 md:px-3 py-1 bg-green-500/30 border border-green-500 rounded-lg text-green-300 text-xs md:text-sm">
                        {gameCriteria.columnCriteria[selectedCell.col].nameAr}
                      </span>
                    </div>
                  </div>
                )}
                
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب اسم اللاعب بالعربية..."
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-700 text-white rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base md:text-lg"
                  autoComplete="off"
                />
              </div>
              
              <div className="overflow-y-auto max-h-[50vh] md:max-h-[60vh] p-3 md:p-4">
                {searchResults.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {searchResults.map(player => (
                      <button
                        key={player.name}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-700 hover:bg-slate-600 rounded-xl md:rounded-2xl transition-all duration-300 group"
                      >
                        <div className="flex-1 text-left">
                          <div className="text-white font-bold text-sm md:text-lg">{player.nameAr}</div>
                          <div className="text-slate-400 text-xs md:text-sm">{player.name}</div>
                        </div>
                        <div className="text-cyan-400 text-xl md:text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center text-white/60 py-6 md:py-8 text-sm md:text-base">
                    لا توجد نتائج
                  </div>
                ) : (
                  <div className="text-center text-white/60 py-6 md:py-8 text-sm md:text-base">
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
            <div className="bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 text-center">
              {gameResult.winner === 'draw' ? (
                <>
                  <div className="text-5xl md:text-6xl mb-4">🤝</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">تعادل!</h2>
                  <p className="text-white/60 mb-6 text-sm md:text-base">امتلأت الشبكة بدون فائز</p>
                </>
              ) : (
                <>
                  <div className="text-5xl md:text-6xl mb-4">
                    {gameResult.winner === 'red' ? '❌' : '⭕'}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {gameResult.winner === myColor ? '🎉 لقد فزت!' : '😔 خسرت!'}
                  </h2>
                  <p className="text-white/60 mb-6 text-sm md:text-base">
                    الفائز: {gameResult.winner === 'red' ? 'الفريق الأحمر ❌' : 'الفريق الأزرق ⭕'}
                  </p>
                </>
              )}
              
              <div className="flex flex-col gap-3">
                {isHost ? (
                  <button
                    onClick={handleNewGame}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all duration-300 text-sm md:text-base"
                  >
                    🎲 لعبة جديدة بمعايير جديدة
                  </button>
                ) : (
                  <div className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white/60 text-center text-sm md:text-base">
                    انتظر المضيف لبدء لعبة جديدة...
                  </div>
                )}
                <button
                  onClick={() => window.location.href = '/football-grid'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all duration-300 text-sm md:text-base"
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