// components/FastestGame.jsx - الكود الأصلي بالضبط مع التصميم الجديد فقط
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

  // الكود الأصلي بالضبط - useEffect for Pusher
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

  // الكود الأصلي بالضبط - العد التنازلي
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

  // الكود الأصلي بالضبط - الضغط على زر الإجابة الأولى
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

  // الكود الأصلي بالضبط - قرار الإجابة الثانية
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

  // الكود الأصلي بالضبط - إعطاء النقاط (للمضيف فقط)
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

  // الكود الأصلي بالضبط - الانتقال للسؤال التالي
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

  // شاشة انتهاء اللعبة - التصميم الجديد فقط
  if (gameFinished) {
    const myScore = gameScores[playerId];
    const opponentScore = gameScores[opponentId];
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
              
              <h1 className="text-3xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  انتهت اللعبة!
                </span>
              </h1>
              
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isWinner ? 'bg-green-500/20 border-2 border-green-400/50' : 
                isTie ? 'bg-yellow-500/20 border-2 border-yellow-400/50' : 
                'bg-red-500/20 border-2 border-red-400/50'
              }`}>
                <span className="text-3xl">
                  {isWinner ? '🏆' : isTie ? '🤝' : '😢'}
                </span>
              </div>

              <p className="text-2xl font-bold mb-4 text-white">
                {isWinner ? 'مبروك! أنت الفائز!' : isTie ? 'تعادل!' : 'للأسف خسرت'}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">نقاطك:</span>
                  <span className="text-white font-bold text-xl">{myScore}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">نقاط الخصم:</span>
                  <span className="text-white font-bold text-xl">{opponentScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة - التصميم الجديد */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Header ثابت - التصميم الجديد */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white font-bold">نقاطك: {gameScores[playerId]}</p>
            </div>
            <div className="text-center">
              <p className="text-orange-400 font-bold">
                سؤال {currentQuestionIndex + 1} / {fastestQuestions.length}
              </p>
              {countdown > 0 && (
                <p className="text-red-400 font-bold text-lg">
                  الوقت: {countdown}s
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-bold">نقاط الخصم: {gameScores[opponentId]}</p>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 max-w-4xl mx-auto pt-24 p-6">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mb-8">
            
            {/* السؤال */}
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
            
            {/* صورة السؤال - الكود الأصلي */}
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

            {/* مراحل اللعبة - الكود الأصلي بالضبط مع التصميم الجديد */}
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
                      <p className="text-slate-300">اعطِ إجابتك الآن...</p>
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
                      <p className="text-orange-400 font-bold text-xl mb-4">⚡ الآن دورك!</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقت القرار: {countdown} ثانية</p>
                      <p className="text-slate-300 mb-4">هل تريد المحاولة؟</p>
                      
                      {canAnswer && (
                        <button
                          onClick={wantToAnswer}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                        >
                          نعم، أريد الإجابة!
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-400 font-bold text-xl mb-4">⏳ الخصم يقرر...</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقت القرار: {countdown} ثانية</p>
                      <p className="text-slate-300">انتظر قرار الخصم...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 4: الثاني يجيب (10 ثواني) */}
              {gamePhase === 'second-answering' && (
                <div>
                  {secondAnswerer === playerId ? (
                    <div>
                      <p className="text-orange-400 font-bold text-xl mb-4">🔥 دورك للإجابة!</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقتك: {countdown} ثانية</p>
                      <p className="text-slate-300">اعطِ إجابتك الآن...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-purple-400 font-bold text-xl mb-4">🎯 الخصم يجيب...</p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">وقته: {countdown} ثانية</p>
                      <p className="text-slate-300">استمع لإجابة الخصم...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 5: تسجيل النقاط */}
              {gamePhase === 'scoring' && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>

                  {isHost ? (
                    <div>
                      <p className="text-white font-bold text-lg mb-4">من أجاب صحيحاً؟</p>
                      <div className="flex flex-col gap-3">
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
                  ) : (
                    <p className="text-slate-300">في انتظار المضيف لاختيار الفائز...</p>
                  )}
                </div>
              )}

              {/* Phase 6: عرض النتائج */}
              {gamePhase === 'results' && (
                <div>
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                    <p className="text-xl text-white font-semibold">{currentQuestion.answer}</p>
                  </div>
                  <p className="text-slate-300">جاري الانتقال للسؤال التالي...</p>
                </div>
              )}

              {/* Phase 7: زر السؤال التالي */}
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

            </div>
          </div>
        </div>

        {/* مودال الصورة المكبرة */}
        {zoomedImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={zoomedImage}
                alt="صورة مكبرة"
                className="max-w-full max-h-full object-contain rounded-2xl"
                onClick={() => setZoomedImage(null)} 
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}