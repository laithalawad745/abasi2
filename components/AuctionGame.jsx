// components/AuctionGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auctionGameData } from '../app/data/auctionGameData';

export default function AuctionGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'bidding', 'questioning', 'finished'
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(10);
  
  // حالة الفرق
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);
  
  // حالة المزايدة
  const [currentOwner, setCurrentOwner] = useState('blue'); // من يملك السؤال حالياً
  const [currentBidder, setCurrentBidder] = useState('red'); // من دوره في المزايدة
  const [currentBid, setCurrentBid] = useState(50);
  const [bidIncrement, setBidIncrement] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCategory, setQuestionCategory] = useState(null);

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('bidding');
    startNewRound();
  };

  // بدء جولة جديدة
  const startNewRound = () => {
    const questionData = getRandomQuestion();
    setCurrentQuestion(questionData.question);
    setQuestionCategory(questionData.category);
    setCurrentBid(50);
    setBidIncrement(50);
    setCurrentOwner('blue'); // الأزرق يبدأ دائماً
    setCurrentBidder('red'); // الأحمر يزايد أولاً
    setShowAnswer(false);
  };

  // الحصول على سؤال عشوائي
  const getRandomQuestion = () => {
    const categories = Object.keys(auctionGameData);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = auctionGameData[randomCategory];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return {
      question: randomQuestion,
      category: randomCategory
    };
  };

  // زيادة المزايدة
  const increaseBid = () => {
    setCurrentBid(prev => prev + bidIncrement);
    setCurrentOwner(currentBidder);
    setCurrentBidder(currentBidder === 'red' ? 'blue' : 'red');
  };

  // رفض المزايدة (باس)
  const passBid = () => {
    // الفريق الحالي يرفض، المالك يأخذ السؤال
    setGamePhase('questioning');
  };

  // إجابة صحيحة
  const correctAnswer = () => {
    setTeams(prev => prev.map(team => 
      team.color === currentOwner 
        ? { ...team, score: team.score + currentBid }
        : team
    ));
    nextRound();
  };

  // إجابة خاطئة
  const wrongAnswer = () => {
    setTeams(prev => prev.map(team => 
      team.color === currentOwner 
        ? { ...team, score: team.score - currentBid }
        : team
    ));
    nextRound();
  };

  // الجولة التالية
  const nextRound = () => {
    if (currentRound >= maxRounds) {
      setGamePhase('finished');
      return;
    }
    
    setCurrentRound(prev => prev + 1);
    setGamePhase('bidding');
    setTimeout(() => {
      startNewRound();
    }, 1000);
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentRound(1);
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
  };

  // زيادة/تقليل قيمة الزيادة
  const adjustIncrement = (change) => {
    setBidIncrement(prev => Math.max(50, prev + change));
  };

  // شاشة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-xl">
              ← العودة
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 لعبة المزاد
            </h1>
            <div></div>
          </div>

          {/* معلومات اللعبة */}
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">قوانين لعبة المزاد</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">📊 النظام</h3>
                  <p>10 فقرات - كل فقرة سؤال واحد</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">💰 المزايدة</h3>
                  <p>تبدأ من 50 نقطة وتزيد بمضاعفات 50</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">✅ النقاط</h3>
                  <p>إجابة صحيحة = + النقاط</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">❌ العقوبة</h3>
                  <p>إجابة خاطئة = - النقاط</p>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
            >
              🎯 ابدأ المزاد
            </button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة المزايدة
  if (gamePhase === 'bidding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← العودة
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">🏆 لعبة المزاد</h1>
            <p className="text-slate-300">الفقرة {currentRound} من {maxRounds}</p>
          </div>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            إعادة تعيين
          </button>
        </div>

        {/* النتائج */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {teams.map(team => (
            <div
              key={team.color}
              className={`p-4 rounded-xl text-center ${
                team.color === 'red' 
                  ? 'bg-red-500/20 border border-red-500/50' 
                  : 'bg-blue-500/20 border border-blue-500/50'
              } ${currentOwner === team.color ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <h3 className="text-white font-bold text-lg">{team.name}</h3>
              <p className={`text-2xl font-bold ${team.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {team.score} نقطة
              </p>
              {currentOwner === team.color && (
                <p className="text-yellow-400 text-sm mt-1">مالك السؤال الحالي</p>
              )}
            </div>
          ))}
        </div>

        {/* معلومات السؤال */}
        <div className="bg-slate-800/50 rounded-xl p-8 text-center mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              📚 {questionCategory}
            </h2>
            <div className="text-6xl font-bold text-white mb-4">
              {currentBid} نقطة
            </div>
            <div className="text-slate-300">
              <p className="mb-2">
                <span className={`font-bold ${currentOwner === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                  {currentOwner === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
                </span> يملك السؤال حالياً
              </p>
              <p>
                هل <span className={`font-bold ${currentBidder === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                  {currentBidder === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
                </span> يريد المزايدة؟
              </p>
            </div>
          </div>

          {/* أزرار التحكم في قيمة الزيادة */}
          <div className="mb-6">
            <p className="text-slate-300 mb-2">قيمة الزيادة:</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustIncrement(-50)}
                className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full font-bold"
                disabled={bidIncrement <= 50}
              >
                -
              </button>
              <span className="text-white font-bold text-xl">{bidIncrement}</span>
              <button
                onClick={() => adjustIncrement(50)}
                className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* أزرار المزايدة */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={increaseBid}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
               زايد يصبح السؤال ب {currentBid + bidIncrement}
            </button>
            
            <button
              onClick={passBid}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
لا أريد المزايدة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة الأسئلة
  if (gamePhase === 'questioning') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">🏆 لعبة المزاد</h1>
            <p className="text-slate-300">الفقرة {currentRound} من {maxRounds}</p>
          </div>

          {/* معلومات الفائز بالمزاد */}
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-3 rounded-xl ${
              currentOwner === 'red' 
                ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
                : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
            }`}>
              <p className="font-bold text-lg">
                🎯 {currentOwner === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} فاز بالمزاد!
              </p>
              <p className="text-white text-2xl font-bold">{currentBid} نقطة</p>
            </div>
          </div>

          {/* السؤال */}
          <div className="bg-slate-800/50 rounded-xl p-8 text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-6">{currentQuestion.question}</h2>
            
            {/* عرض الإجابة */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
              >
                👁️ إظهار الإجابة
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-400 font-bold">الإجابة الصحيحة:</p>
                  <p className="text-white text-lg">{currentQuestion.answer}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={correctAnswer}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
                  >
                    ✅ إجابة صحيحة (+{currentBid})
                  </button>
                  
                  <button
                    onClick={wrongAnswer}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
                  >
                    ❌ إجابة خاطئة (-{currentBid})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // شاشة النهاية
  if (gamePhase === 'finished') {
    const winner = teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    const isDraw = teams[0].score === teams[1].score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-800/50 rounded-xl p-8">
            {/* العنوان */}
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-8">
              🏆 انتهت لعبة المزاد!
            </h1>

            {/* النتيجة النهائية */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {teams.map(team => (
                <div
                  key={team.color}
                  className={`p-6 rounded-xl ${
                    team.color === 'red' 
                      ? 'bg-red-500/20 border border-red-500/50' 
                      : 'bg-blue-500/20 border border-blue-500/50'
                  } ${!isDraw && winner.color === team.color ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <h3 className="text-white font-bold text-lg">{team.name}</h3>
                  <p className={`text-3xl font-bold ${team.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {team.score} نقطة
                  </p>
                  {!isDraw && winner.color === team.color && (
                    <p className="text-yellow-400 text-sm mt-2">🏆 الفائز</p>
                  )}
                </div>
              ))}
            </div>

            {/* إعلان النتيجة */}
            <div className="mb-8">
              {isDraw ? (
                <h2 className="text-2xl font-bold text-yellow-400">🤝 تعادل!</h2>
              ) : (
                <h2 className="text-2xl font-bold text-green-400">
                  🎉 {winner.name} هو الفائز!
                </h2>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
              >
                🔄 لعب مرة أخرى
              </button>
              
              <Link
                href="/"
                className="block w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
              >
                🏠 العودة للقائمة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}