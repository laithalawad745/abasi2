// components/FastestGame.jsx
import React, { useState, useEffect } from 'react';
import { fastestQuestions } from '../app/data/fastestGameData';

export default function FastestGame({ 
  roomId, 
  pusher, 
  isHost,
  playerId,
  opponentId,
  onGameEnd 
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState('question'); // 'question', 'first-answering', 'decision-time', 'second-answering', 'scoring', 'results'
  const [gameScores, setGameScores] = useState({
    [playerId]: 0,
    [opponentId]: 0
  });
  const [firstAnswerer, setFirstAnswerer] = useState(null);
  const [secondAnswerer, setSecondAnswerer] = useState(null);
  const [canAnswer, setCanAnswer] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [channel, setChannel] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const currentQuestion = fastestQuestions[currentQuestionIndex];
  const amIFirst = firstAnswerer === playerId;

  useEffect(() => {
    if (pusher && roomId) {
      const gameChannel = pusher.subscribe(`room-${roomId}`);
      setChannel(gameChannel);

      // استقبال الإجابة الأولى
      gameChannel.bind('first-answer', (data) => {
        console.log('First answer received:', data);
        setFirstAnswerer(data.playerId);
        setGamePhase('first-answering');
        setCountdown(10);
        setCanAnswer(false); // منع الجميع من الضغط
      });

      // انتهاء وقت الأول
      gameChannel.bind('first-time-up', (data) => {
        console.log('First time up:', data);
        setGamePhase('decision-time');
        setCountdown(5);
        // فقط الشخص الذي لم يجب أولاً يمكنه القرار
        setCanAnswer(firstAnswerer !== playerId);
      });

      // الثاني يريد الإجابة
      gameChannel.bind('second-wants-answer', (data) => {
        console.log('Second wants to answer:', data);
        setSecondAnswerer(data.playerId);
        setGamePhase('second-answering');
        setCountdown(10);
        setCanAnswer(false);
      });

      // انتهاء وقت القرار أو وقت الثاني
      gameChannel.bind('phase-ended', (data) => {
        console.log('Phase ended:', data);
        setGamePhase('scoring');
        setCountdown(0);
        setCanAnswer(false);
      });

      // استقبال قرار النقاط
      gameChannel.bind('points-awarded', (data) => {
        console.log('Points awarded:', data);
        setGameScores(data.scores);
        setGamePhase('results');
        
        setTimeout(() => {
          if (currentQuestionIndex < fastestQuestions.length - 1) {
            if (isHost) {
              setGamePhase('next-ready');
            }
          } else {
            setGameFinished(true);
            setTimeout(() => onGameEnd(data.scores), 3000);
          }
        }, 3000);
      });

      // السؤال التالي
      gameChannel.bind('next-question', (data) => {
        console.log('Next question:', data);
        setCurrentQuestionIndex(data.questionIndex);
        setGamePhase('question');
        setFirstAnswerer(null);
        setSecondAnswerer(null);
        setCanAnswer(true);
        setCountdown(0);
      });

      return () => {
        gameChannel.unbind_all();
      };
    }
  }, [pusher, roomId, firstAnswerer, playerId, isHost, currentQuestionIndex]);

  // العد التنازلي
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isHost) {
      // تعامل مع انتهاء الوقت حسب المرحلة
      if (gamePhase === 'first-answering') {
        // انتهى وقت الأول
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `room-${roomId}`,
            event: 'first-time-up',
            data: { questionIndex: currentQuestionIndex }
          })
        }).catch(console.error);
      } else if (gamePhase === 'decision-time' || gamePhase === 'second-answering') {
        // انتهى وقت القرار أو وقت الثاني
        fetch('/api/pusher/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `room-${roomId}`,
            event: 'phase-ended',
            data: { questionIndex: currentQuestionIndex }
          })
        }).catch(console.error);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, gamePhase, isHost, roomId, currentQuestionIndex]);

  // الضغط على زر الإجابة الأولى
  const answerFirst = () => {
    if (!canAnswer || firstAnswerer || gamePhase !== 'question') return;

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `room-${roomId}`,
        event: 'first-answer',
        data: {
          playerId: playerId,
          questionIndex: currentQuestionIndex,
          timestamp: Date.now()
        }
      })
    }).catch(console.error);
  };

  // قرار الإجابة الثانية
  const wantToAnswer = () => {
    if (!canAnswer || gamePhase !== 'decision-time') return;

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `room-${roomId}`,
        event: 'second-wants-answer',
        data: {
          playerId: playerId,
          questionIndex: currentQuestionIndex,
          timestamp: Date.now()
        }
      })
    }).catch(console.error);
  };

  // إعطاء النقاط (للمضيف فقط)
  const awardPoints = (winnerId) => {
    if (!isHost) return;

    const newScores = { ...gameScores };
    if (winnerId) {
      newScores[winnerId] += currentQuestion.points;
    }

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `room-${roomId}`,
        event: 'points-awarded',
        data: {
          scores: newScores,
          winner: winnerId,
          questionIndex: currentQuestionIndex
        }
      })
    }).catch(console.error);
  };

  // الانتقال للسؤال التالي
  const goToNextQuestion = () => {
    if (!isHost) return;

    const nextIndex = currentQuestionIndex + 1;
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `room-${roomId}`,
        event: 'next-question',
        data: { questionIndex: nextIndex }
      })
    }).catch(console.error);
  };

  // تكبير الصورة
  const zoomImage = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  if (gameFinished) {
    const myScore = gameScores[playerId];
    const opponentScore = gameScores[opponentId];
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            انتهت اللعبة!
          </h1>
          
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isWinner ? 'bg-green-500' : isTie ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            <span className="text-3xl">
              {isWinner ? '🏆' : isTie ? '🤝' : '😢'}
            </span>
          </div>

          <p className="text-2xl font-bold mb-4 text-white">
            {isWinner ? 'مبروك! أنت الفائز!' : isTie ? 'تعادل!' : 'للأسف خسرت'}
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">نقاطك:</span>
              <span className="text-white font-bold text-xl">{myScore}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">نقاط الخصم:</span>
              <span className="text-white font-bold text-xl">{opponentScore}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none p-4">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-3">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white font-bold">نقاطك: {gameScores[playerId]}</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-bold">
                سؤال {currentQuestionIndex + 1} / {fastestQuestions.length}
              </p>
              {countdown > 0 && (
                <p className="text-red-400 font-bold text-lg">
                  الوقت: {countdown}s
                </p>
              )}
              {/* <p className="text-slate-400 text-xs">الطور: {gamePhase}</p> */}
            </div>
            <div className="text-center">
              <p className="text-white font-bold">نقاط الخصم: {gameScores[opponentId]}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto pt-24">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-center mb-6 text-slate-100">
              {currentQuestion.question}
            </h3>
            
            {/* Image */}
            {currentQuestion.hasImage && (
              <div className="flex justify-center mb-6">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="صورة السؤال" 
                  className="max-w-full max-h-64 object-contain rounded-xl shadow-2xl border-4 border-purple-400/50 cursor-pointer hover:opacity-90 transition-opacity duration-300"
                  onClick={() => zoomImage(currentQuestion.imageUrl)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                  }}
                />
              </div>
            )}

            {/* Game Phases */}
            <div className="text-center">
              
              {/* Phase 1: بداية السؤال */}
              {gamePhase === 'question' && (
                <button
                  onClick={answerFirst}
                  disabled={!canAnswer}
                  className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${
                    canAnswer 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  أجيب أولاً
                </button>
              )}

              {/* Phase 2: الأول يجيب (10 ثواني) */}
              {gamePhase === 'first-answering' && (
                <div>
                  {amIFirst ? (
                    <div>
                      <p className="text-green-400 font-bold text-xl mb-4">✅ أنت تجيب الآن!</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقتك للإجابة: {countdown} ثانية</p>
                      <p className="text-slate-300">اعطِ إجابتك  الآن...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-400 font-bold text-xl mb-4">🎤 الخصم يجيب الآن</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقته للإجابة: {countdown} ثانية</p>
                      <p className="text-slate-300 mb-4">استمع لإجابة الخصم...</p>
                      <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-300 font-bold">🔒 زر الإجابة مقفل</p>
                        <p className="text-red-200 text-sm">انتظر حتى ينتهي وقت الخصم ({countdown}s)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 3: وقت القرار للثاني (5 ثواني) */}
              {gamePhase === 'decision-time' && (
                <div>
                  {!amIFirst ? (
                    <div>
                      <p className="text-orange-400 font-bold text-xl mb-4">⚡ الآن دورك! هل تريد الإجابة؟</p>
                      <p className="text-red-400 font-bold text-2xl mb-4">
                        قرر خلال: {countdown} ثواني فقط!
                      </p>
                      <p className="text-slate-300 text-sm mb-4">إذا لم تضغط، ستنتهي المرحلة</p>
                      {countdown > 0 && canAnswer ? (
                        <button
                          onClick={wantToAnswer}
                          className="px-8 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-300 animate-pulse"
                        >
                          نعم، أريد الإجابة! 🔥
                        </button>
                      ) : (
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-400">انتهى الوقت للقرار</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-400 font-bold text-xl mb-4">⏳ الخصم يقرر الآن</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">
                        وقته للقرار: {countdown} ثواني
                      </p>
                      <p className="text-slate-300">هل سيقرر الإجابة؟</p>
                      <div className="mt-4 p-3 bg-blue-700/20 rounded-lg">
                        <p className="text-blue-300 text-sm">إذا لم يضغط، ستنتهي المرحلة</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 4: الثاني يجيب (10 ثواني) */}
              {gamePhase === 'second-answering' && (
                <div>
                  {secondAnswerer === playerId ? (
                    <div>
                      <p className="text-green-400 font-bold text-xl mb-4">✅ أنت تجيب الآن!</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقتك للإجابة: {countdown} ثانية</p>
                      <p className="text-slate-300">اعطِ إجابتك  الآن...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-400 font-bold text-xl mb-4">🎤 الخصم يجيب الآن</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقته للإجابة: {countdown} ثانية</p>
                      <p className="text-slate-300">استمع لإجابته...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 5: المضيف يختار الفائز */}
              {gamePhase === 'scoring' && isHost && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>

                  <p className="text-yellow-400 font-bold text-lg mb-4">من أجاب صح؟</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {firstAnswerer && (
                      <button
                        onClick={() => awardPoints(firstAnswerer)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                      >
                        {firstAnswerer === playerId ? 'أنت' : 'الخصم'} 
                      </button>
                    )}
                    
                    {secondAnswerer && (
                      <button
                        onClick={() => awardPoints(secondAnswerer)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                      >
                        {secondAnswerer === playerId ? 'أنت' : 'الخصم'} 
                      </button>
                    )}
                    
                    <button
                      onClick={() => awardPoints(null)}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                    >
                      لا أحد أجاب صح ❌
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 6: الضيف ينتظر المضيف */}
              {gamePhase === 'scoring' && !isHost && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>
                  <p className="text-slate-300">في انتظار المضيف لاختيار الفائز...</p>
                </div>
              )}

              {/* Phase 7: عرض النتائج */}
              {gamePhase === 'results' && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>
                  <p className="text-slate-300">جاري الانتقال للسؤال التالي...</p>
                </div>
              )}

              {/* Phase 8: زر السؤال التالي */}
              {gamePhase === 'next-ready' && isHost && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>
                  
                  <button
                    onClick={goToNextQuestion}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300"
                  >
                    السؤال التالي ➡️
                  </button>
                </div>
              )}

              {/* للضيف - انتظار السؤال التالي */}
              {gamePhase === 'next-ready' && !isHost && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>
                  <p className="text-slate-300">في انتظار المضيف للسؤال التالي...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage}
            alt="صورة مكبرة"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-pointer"
            onClick={() => setZoomedImage(null)}
          />
        </div>
      )}
    </>
  );
}