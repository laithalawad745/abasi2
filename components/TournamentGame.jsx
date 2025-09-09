// components/TournamentGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { tournamentQuestions } from '../app/data/tournamentData';

export default function TournamentGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentRound, setCurrentRound] = useState(0); // 0=16, 1=8, 2=4, 3=2, 4=نهائي
  const [currentTurn, setCurrentTurn] = useState('right'); // 'right', 'left'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionInRound, setQuestionInRound] = useState(0);
  
  // نقاط اللاعبين
  const [players, setPlayers] = useState([
    { name: 'اللاعب الأيمن', position: 'right', score: 0, currentRoundScore: 0, eliminated: false },
    { name: 'اللاعب الأيسر', position: 'left', score: 0, currentRoundScore: 0, eliminated: false }
  ]);

  // إعدادات الأدوار
  const rounds = [
    { name: 'دور الـ16', questions: 16, pointsPerQuestion: 10, questionsNeeded: 1 },
    { name: 'دور الـ8', questions: 8, pointsPerQuestion: 20, questionsNeeded: 1 },
    { name: 'دور الـ4', questions: 4, pointsPerQuestion: 40, questionsNeeded: 1 },
    { name: 'نصف النهائي', questions: 2, pointsPerQuestion: 80, questionsNeeded: 1 },
    { name: 'النهائي', questions: 1, pointsPerQuestion: 160, questionsNeeded: 1 }
  ];

  const currentRoundInfo = rounds[currentRound];

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('playing');
    startNewQuestion();
  };

  // بدء سؤال جديد
  const startNewQuestion = () => {
    const availableQuestions = tournamentQuestions.filter(q => 
      q.round === currentRound && !q.used
    );
    
    if (availableQuestions.length === 0) {
      console.error('No questions available for round', currentRound);
      return;
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    randomQuestion.used = true;
    
    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
  };

  // إنهاء الإجابة
  const finishAnswering = () => {
    setShowAnswer(true);
  };

  // إجابة صحيحة
  const correctAnswer = () => {
    const newPlayers = [...players];
    const currentPlayerIndex = players.findIndex(p => p.position === currentTurn);
    
    // إضافة النقاط
    newPlayers[currentPlayerIndex].currentRoundScore += currentRoundInfo.pointsPerQuestion;
    setPlayers(newPlayers);

    // الانتقال للدور التالي
    nextTurn();
  };

  // إجابة خاطئة
  const wrongAnswer = () => {
    const newPlayers = [...players];
    const currentPlayerIndex = players.findIndex(p => p.position === currentTurn);
    
    // اللاعب يخسر كل نقاطه ويخرج من البطولة
    newPlayers[currentPlayerIndex].score = 0;
    newPlayers[currentPlayerIndex].currentRoundScore = 0;
    newPlayers[currentPlayerIndex].eliminated = true;
    setPlayers(newPlayers);

    // التحقق من انتهاء اللعبة
    checkGameEnd();
  };

  // انسحاب اللاعب
  const withdrawPlayer = () => {
    const newPlayers = [...players];
    const currentPlayerIndex = players.findIndex(p => p.position === currentTurn);
    
    // اللاعب يحصل على نقاطه الحالية ويخرج
    newPlayers[currentPlayerIndex].score += newPlayers[currentPlayerIndex].currentRoundScore;
    newPlayers[currentPlayerIndex].eliminated = true;
    setPlayers(newPlayers);

    // التحقق من انتهاء اللعبة
    checkGameEnd();
  };

  // الدور التالي
  const nextTurn = () => {
    setCurrentTurn(currentTurn === 'right' ? 'left' : 'right');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setQuestionInRound(questionInRound + 1);

    // التحقق من الانتقال للدور التالي
    if (questionInRound + 1 >= currentRoundInfo.questions) {
      nextRound();
    } else {
      setTimeout(() => {
        startNewQuestion();
      }, 1000);
    }
  };

  // الدور التالي في البطولة
  const nextRound = () => {
    const newPlayers = [...players];
    
    // إضافة نقاط الدور الحالي للنقاط الإجمالية
    newPlayers.forEach(player => {
      if (!player.eliminated) {
        player.score += player.currentRoundScore;
        player.currentRoundScore = 0;
      }
    });
    
    setPlayers(newPlayers);

    if (currentRound + 1 >= rounds.length) {
      // انتهاء البطولة
      setGamePhase('finished');
    } else {
      // الانتقال للدور التالي
      setCurrentRound(currentRound + 1);
      setQuestionInRound(0);
      setCurrentTurn('right'); // البداية دائماً من اليمين
      
      setTimeout(() => {
        startNewQuestion();
      }, 2000);
    }
  };

  // التحقق من انتهاء اللعبة
  const checkGameEnd = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    
    if (activePlayers.length <= 1) {
      setGamePhase('finished');
    } else {
      // الاستمرار مع اللاعب الآخر
      const otherPlayer = activePlayers.find(p => p.position !== currentTurn);
      if (otherPlayer) {
        setCurrentTurn(otherPlayer.position);
        setTimeout(() => {
          startNewQuestion();
        }, 1500);
      }
    }
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentRound(0);
    setCurrentTurn('right');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setQuestionInRound(0);
    setPlayers([
      { name: 'اللاعب الأيمن', position: 'right', score: 0, currentRoundScore: 0, eliminated: false },
      { name: 'اللاعب الأيسر', position: 'left', score: 0, currentRoundScore: 0, eliminated: false }
    ]);
    
    // إعادة تعيين الأسئلة
    tournamentQuestions.forEach(q => q.used = false);
  };

  // صفحة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 select-none flex flex-col">
        <div className="flex justify-between p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            بطولة المعرفة
          </h1>
          <Link 
            href="/"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <div className="text-center space-y-8 max-w-4xl">
            <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 بطولة المعرفة
            </h1>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">قواعد البطولة:</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">🏆</span>
                    <span className="text-slate-300">5 أدوار: 16→8→4→2→نهائي</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">⚡</span>
                    <span className="text-slate-300">كل إجابة صحيحة = نقاط الدور</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">🎯</span>
                    <span className="text-slate-300">يمكن الانسحاب والحفاظ على النقاط</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-red-400">❌</span>
                    <span className="text-slate-300">إجابة خاطئة = خسارة كل النقاط</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">🔄</span>
                    <span className="text-slate-300">اللاعبان يتناوبان الأسئلة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400">👑</span>
                    <span className="text-slate-300">الهدف: الوصول للنهائي</span>
                  </div>
                </div>
              </div>

              {/* جدول النقاط */}
              <div className="mt-8 bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-center text-yellow-400 font-bold text-lg mb-4">نظام النقاط:</h3>
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  <div className="bg-green-500/20 rounded-lg p-2">
                    <div className="font-bold text-green-400">دور الـ16</div>
                    <div className="text-white">10 نقاط</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <div className="font-bold text-blue-400">دور الـ8</div>
                    <div className="text-white">20 نقطة</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <div className="font-bold text-purple-400">دور الـ4</div>
                    <div className="text-white">40 نقطة</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-2">
                    <div className="font-bold text-orange-400">نصف نهائي</div>
                    <div className="text-white">80 نقطة</div>
                  </div>
                  <div className="bg-yellow-500/20 rounded-lg p-2">
                    <div className="font-bold text-yellow-400">النهائي</div>
                    <div className="text-white">160 نقطة</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-yellow-400/50"
            >
              🏆 ابدأ البطولة!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    const loser = players.find(p => p !== winner);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center shadow-2xl border border-slate-700">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 انتهت البطولة!
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                winner.position === 'right'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">اللاعب الأيمن</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{players.find(p => p.position === 'right').score}</p>
                {winner.position === 'right' && <p className="text-yellow-200 font-bold mt-2">🏆 بطل المعرفة</p>}
              </div>
              
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                winner.position === 'left'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">اللاعب الأيسر</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{players.find(p => p.position === 'left').score}</p>
                {winner.position === 'left' && <p className="text-yellow-200 font-bold mt-2">🏆 بطل المعرفة</p>}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                {winner.name} هو بطل المعرفة!
              </h2>
              <p className="text-lg text-slate-300">
                نقاط البطل: {winner.score} • نقاط المنافس: {loser.score}
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                بطولة جديدة 🏆
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  const currentPlayer = players.find(p => p.position === currentTurn);
  const otherPlayer = players.find(p => p.position !== currentTurn);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              المعرفة
          </h1>
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
            >
              إعادة تشغيل
            </button>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* معلومات الدور */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-600 shadow-xl">
            <div className="text-yellow-400 font-bold text-xl">
              {currentRoundInfo.name}
            </div>
            <div className="w-px h-6 bg-slate-600"></div>
            <div className="text-green-400 font-bold">
              {currentRoundInfo.pointsPerQuestion} نقطة/سؤال
            </div>
            <div className="w-px h-6 bg-slate-600"></div>
            <div className="text-blue-400 font-bold">
              السؤال {questionInRound + 1}/{currentRoundInfo.questions}
            </div>
          </div>
        </div>

        {/* نتائج اللاعبين */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'right'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/25 ring-4 ring-yellow-400/50'
              : 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">اللاعب الأيمن</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">
              {players.find(p => p.position === 'right').score}
            </p>
            <p className="text-sm text-white/80 mt-2">
              +{players.find(p => p.position === 'right').currentRoundScore} هذا الدور
            </p>
            {players.find(p => p.position === 'right').eliminated && (
              <p className="text-red-300 font-bold mt-2">❌ خارج البطولة</p>
            )}
          </div>
          
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'left'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/25 ring-4 ring-yellow-400/50'
              : 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">اللاعب الأيسر</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">
              {players.find(p => p.position === 'left').score}
            </p>
            <p className="text-sm text-white/80 mt-2">
              +{players.find(p => p.position === 'left').currentRoundScore} هذا الدور
            </p>
            {players.find(p => p.position === 'left').eliminated && (
              <p className="text-red-300 font-bold mt-2">❌ خارج البطولة</p>
            )}
          </div>
        </div>

        {/* منطقة السؤال */}
        {currentQuestion && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${
                currentTurn === 'right' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-violet-500'
              }`}>
                {currentTurn === 'right' ? 'دور اللاعب الأيمن' : 'دور اللاعب الأيسر'} • {currentRoundInfo.pointsPerQuestion} نقطة
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
              {currentQuestion.question}
            </h3>
            
            {/* عرض الصورة إذا وجدت */}
            {currentQuestion.hasImage && (
              <div className="flex justify-center mb-8">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="صورة السؤال" 
                  className="max-w-full max-h-64 object-contain rounded-xl shadow-2xl border-4 border-yellow-400/50"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                  }}
                />
              </div>
            )}
            
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={finishAnswering}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                >
                  انتهيت من الإجابة
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                  <p className="text-xl md:text-2xl text-white font-semibold">{currentQuestion.answer}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={correctAnswer}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ✅ إجابة صحيحة
                  </button>
                  
                  <button
                    onClick={withdrawPlayer}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    🏃 انسحاب (+{currentPlayer.currentRoundScore + currentRoundInfo.pointsPerQuestion} نقطة)
                  </button>
                  
                  <button
                    onClick={wrongAnswer}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ❌ إجابة خاطئة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}