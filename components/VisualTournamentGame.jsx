// components/VisualTournamentGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';

export default function VisualTournamentGame() {
  // State management
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentTeam, setCurrentTeam] = useState('red');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showingDecision, setShowingDecision] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Tournament configuration
  const roundConfig = {
    round8: { name: 'دور الـ8', points: 10, questionsNeeded: 8 },
    round4: { name: 'دور الـ4', points: 20, questionsNeeded: 4 },
    semi: { name: 'نصف النهائي', points: 40, questionsNeeded: 2 },
    final: { name: 'النهائي', points: 80, questionsNeeded: 1 }
  };

  // Teams data
  const [teams, setTeams] = useState({
    red: {
      name: 'الفريق الأحمر',
      score: 0,
      currentRound: 'round8',
      questionsAnswered: 0,
      withdrawn: false,
      eliminated: false,
      finishedFinal: false,
      active: false
    },
    blue: {
      name: 'الفريق الأزرق', 
      score: 0,
      currentRound: 'round8',
      questionsAnswered: 0,
      withdrawn: false,
      eliminated: false,
      finishedFinal: false,
      active: false
    },
    tie: false
  });

  // Client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Game functions
  const startGame = () => {
    if (!isClient) return;

    setGamePhase('playing');
    setCurrentTeam('red');
    setShowingDecision(true);
    setTeams(prev => ({
      ...prev,
      red: { ...prev.red, active: true },
      blue: { ...prev.blue, active: true }
    }));
  };

  const continueGame = () => {
    const questions = sampleTopics.find(t => t.id === 'absi')?.questions || [];
    if (questions.length === 0) return;

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
    setShowingDecision(false);
  };

  const withdrawTeam = () => {
    setTeams(prev => ({
      ...prev,
      [currentTeam]: { ...prev[currentTeam], withdrawn: true, active: false }
    }));
    
    if (checkGameEnd()) return;
    switchTeam();
  };

  const correctAnswer = () => {
    const currentTeamData = teams[currentTeam];
    const roundPoints = roundConfig[currentTeamData.currentRound]?.points || 0;
    
    setTeams(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        score: prev[currentTeam].score + roundPoints,
        questionsAnswered: prev[currentTeam].questionsAnswered + 1
      }
    }));

    const newQuestionsAnswered = currentTeamData.questionsAnswered + 1;
    const questionsNeeded = roundConfig[currentTeamData.currentRound]?.questionsNeeded || 0;

    if (newQuestionsAnswered >= questionsNeeded) {
      advanceToNextRound();
    } else {
      switchTeam();
    }
  };

  const wrongAnswer = () => {
    setTeams(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        eliminated: true,
        active: false,
        score: 0
      }
    }));
    
    if (checkGameEnd()) return;
    switchTeam();
  };

  const advanceToNextRound = () => {
    const roundOrder = ['round8', 'round4', 'semi', 'final'];
    const currentRoundIndex = roundOrder.indexOf(teams[currentTeam].currentRound);
    
    if (currentRoundIndex === roundOrder.length - 1) {
      setTeams(prev => ({
        ...prev,
        [currentTeam]: { ...prev[currentTeam], finishedFinal: true, active: false }
      }));
      
      if (checkGameEnd()) return;
    } else {
      const nextRound = roundOrder[currentRoundIndex + 1];
      setTeams(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          currentRound: nextRound,
          questionsAnswered: 0
        }
      }));
    }
    
    switchTeam();
  };

  const switchTeam = () => {
    const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
    setCurrentTeam(nextTeam);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setShowingDecision(true);
  };

  const checkGameEnd = () => {
    const activeTeams = Object.values(teams).filter(t => t.active && !t.eliminated && !t.withdrawn);
    
    if (activeTeams.length <= 1 || (teams.red.finishedFinal && teams.blue.finishedFinal)) {
      setGamePhase('finished');
      return true;
    }
    
    return false;
  };

  const resetGame = () => {
    setGamePhase('setup');
    setCurrentTeam('red');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setShowingDecision(true);
    setTeams({
      red: {
        name: 'الفريق الأحمر',
        score: 0,
        currentRound: 'round8',
        questionsAnswered: 0,
        withdrawn: false,
        eliminated: false,
        finishedFinal: false,
        active: false
      },
      blue: {
        name: 'الفريق الأزرق',
        score: 0,
        currentRound: 'round8', 
        questionsAnswered: 0,
        withdrawn: false,
        eliminated: false,
        finishedFinal: false,
        active: false
      },
      tie: false
    });
  };

  // Tournament bracket components
  const PlayerCircle = ({ position, team, isActive, size = 'normal' }) => {
    const sizeClasses = {
      small: 'w-8 h-8 text-xs',
      normal: 'w-12 h-12 text-sm',
      large: 'w-16 h-16 text-base'
    };

    const teamColors = {
      red: isActive ? 'bg-red-500 border-red-300 ring-2 ring-yellow-400' : position.reached ? 'bg-red-600 border-red-400' : 'bg-gray-600 border-gray-500',
      blue: isActive ? 'bg-blue-500 border-blue-300 ring-2 ring-yellow-400' : position.reached ? 'bg-blue-600 border-blue-400' : 'bg-gray-600 border-gray-500'
    };

    return (
      <div className={`${sizeClasses[size]} ${teamColors[team]} border-2 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${isActive ? 'scale-110 animate-pulse' : ''}`}>
        {position.name}
      </div>
    );
  };

  const ConnectingLine = ({ direction = 'horizontal', length = 'normal' }) => {
    const lengthClasses = {
      short: direction === 'horizontal' ? 'w-6' : 'h-6',
      normal: direction === 'horizontal' ? 'w-12' : 'h-12',
      long: direction === 'horizontal' ? 'w-16' : 'h-16'
    };

    const lineClass = direction === 'horizontal' 
      ? `${lengthClasses[length]} h-px` 
      : `w-px ${lengthClasses[length]}`;

    return (
      <div className={`${lineClass} bg-gradient-to-r from-gray-400 to-gray-600`}></div>
    );
  };

  const TeamBracket = ({ team }) => {
    const teamData = teams[team];
    const teamColors = {
      red: 'border-red-500/50 bg-red-500/10',
      blue: 'border-blue-500/50 bg-blue-500/10'
    };

    // Create positions for bracket visualization
    const createPositions = (count, round) => {
      return Array(count).fill(null).map((_, i) => {
        const roundOrder = ['round8', 'round4', 'semi', 'final'];
        const currentRoundIndex = roundOrder.indexOf(teamData.currentRound);
        const thisRoundIndex = roundOrder.indexOf(round);
        
        if (currentRoundIndex > thisRoundIndex || teamData.currentRound === 'completed') {
          return {
            id: `${team}_${round}_${i + 1}`,
            name: '✓',
            reached: true
          };
        }
        
        if (teamData.currentRound === round) {
          return {
            id: `${team}_${round}_${i + 1}`,
            name: i < teamData.questionsAnswered ? '✓' : 
                  i === teamData.questionsAnswered ? '?' : '',
            reached: i < teamData.questionsAnswered
          };
        }
        
        return {
          id: `${team}_${round}_${i + 1}`,
          name: '',
          reached: false
        };
      });
    };

    const positions = {
      round8: createPositions(8, 'round8'),
      round4: createPositions(4, 'round4'), 
      semi: createPositions(2, 'semi'),
      final: createPositions(1, 'final')
    };

    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-300 ${teamData.active && currentTeam === team ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/25' : ''} ${teamData.withdrawn ? 'opacity-50' : ''} ${teamData.eliminated ? 'opacity-30' : ''}`}>
        <h2 className={`text-center text-2xl font-bold mb-6 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
          {teamData.name}
          {teamData.withdrawn && <span className="text-yellow-400 text-sm mr-2">(منسحب)</span>}
          {teamData.eliminated && <span className="text-red-400 text-sm mr-2">(مُبعد)</span>}
          {teamData.finishedFinal && <span className="text-green-400 text-sm mr-2">(أنهى النهائي)</span>}
        </h2>
        
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-2">{teamData.score}</div>
          <div className="text-sm text-gray-300">
            {teamData.currentRound === 'completed' ? 'مكتمل' : roundConfig[teamData.currentRound]?.name}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px] p-4">
            <div className={`flex items-center justify-center space-x-6 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              
              {/* دور الـ8 */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-center text-blue-400 font-bold mb-2 text-sm">دور الـ8</h4>
                {positions.round8.map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={teamData.currentRound === 'round8' && index === teamData.questionsAnswered}
                      size="small"
                    />
                    <ConnectingLine direction="horizontal" length="short" />
                  </div>
                ))}
              </div>

              {/* دور الـ4 */}
              <div className="flex flex-col space-y-8">
                <h4 className="text-center text-purple-400 font-bold mb-2 text-sm">دور الـ4</h4>
                {positions.round4.map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={teamData.currentRound === 'round4' && index === teamData.questionsAnswered}
                      size="normal"
                    />
                    <ConnectingLine direction="horizontal" length="normal" />
                  </div>
                ))}
              </div>

              {/* نصف النهائي */}
              <div className="flex flex-col space-y-12">
                <h4 className="text-center text-orange-400 font-bold mb-2 text-sm">نصف النهائي</h4>
                {positions.semi.map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={teamData.currentRound === 'semi' && index === teamData.questionsAnswered}
                      size="normal"
                    />
                    <ConnectingLine direction="horizontal" length="normal" />
                  </div>
                ))}
              </div>

              {/* النهائي */}
              <div className="flex flex-col">
                <h4 className="text-center text-yellow-400 font-bold mb-2 text-sm">النهائي</h4>
                <div className="flex justify-center">
                  <PlayerCircle 
                    position={positions.final[0]} 
                    team={team}
                    isActive={teamData.currentRound === 'final' && teamData.questionsAnswered === 0}
                    size="large"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Setup phase
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                الإقصاء
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* العنوان الرئيسي */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
              بطولة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                الإقصاء 
              </span>
            </h1>
            {/* <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              شجرة بطولة بصرية مثل البطولات الحقيقية
            </p> */}
          </div>

          {/* قواعد اللعبة */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-8">
                 قواعد البطولة 
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-green-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">إجابة صحيحة</h3>
                  <p className="text-gray-300">تتقدم في الشجرة وتحصل على النقاط</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-red-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">إجابة خاطئة</h3>
                  <p className="text-gray-300">إقصاء فوري وخسارة كل النقاط</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-yellow-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">انسحاب ذكي</h3>
                  <p className="text-gray-300">يمكن الانسحاب والاحتفاظ بالنقاط</p>
                </div>
              </div>

              {/* نظام النقاط */}
              <div className="bg-white/5 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-purple-400 font-bold text-lg mb-4 text-center">💎 نظام النقاط لكل مرحلة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="font-bold text-blue-400 text-lg">دور الـ8</div>
                    <div className="text-white text-2xl font-bold">10</div>
                    <div className="text-gray-300">نقاط/سؤال</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="font-bold text-purple-400 text-lg">دور الـ4</div>
                    <div className="text-white text-2xl font-bold">20</div>
                    <div className="text-gray-300">نقطة/سؤال</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="font-bold text-orange-400 text-lg">نصف النهائي</div>
                    <div className="text-white text-2xl font-bold">40</div>
                    <div className="text-gray-300">نقطة/سؤال</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
                    <div className="font-bold text-yellow-400 text-lg">النهائي</div>
                    <div className="text-white text-2xl font-bold">80</div>
                    <div className="text-gray-300">نقطة/سؤال</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* زر البدء */}
          <div className="text-center">
            <button
              onClick={startGame}
              disabled={!isClient}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative px-12 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-400/50 ${
                isClient 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  : 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  ابدأ البطولة البصرية!
                </div>
              </div>
            </button>
          </div>

          {/* معلومات إضافية */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center justify-center space-x-8 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>شجرة بصرية</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>4 مراحل</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>إقصاء مباشر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  if (gamePhase === 'playing') {
    const currentTeamData = teams[currentTeam];
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                الإقصاء 
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* معلومات الدور الحالي */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <div className="text-center">
                <div className={`text-xl font-bold ${currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                  دور {currentTeamData.name}
                </div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {currentTeamData.currentRound === 'completed' ? 'مكتمل' : roundConfig[currentTeamData.currentRound]?.name}
                </div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">
                  {currentTeamData.currentRound !== 'completed' ? roundConfig[currentTeamData.currentRound]?.points : 0} نقطة/سؤال
                </div>
              </div>
            </div>
          </div>

          {/* شجرة البطولة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <TeamBracket team="red" />
            <TeamBracket team="blue" />
          </div>

          {/* منطقة السؤال */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {showingDecision ? (
                // مرحلة القرار: انسحاب أو متابعة
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-6">
                    دور {teams[currentTeam].name}
                  </h3>
                  <p className="text-xl text-gray-300 mb-8">
                    اختر ما تريد فعله:
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-6">
                    <button
                      onClick={withdrawTeam}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                        🏃‍♂️ انسحاب والاحتفاظ بالنقاط
                      </div>
                    </button>
                    
                    <button
                      onClick={continueGame}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                        ⚔️ متابعة اللعب
                      </div>
                    </button>
                  </div>
                </div>
              ) : currentQuestion ? (
                // عرض السؤال
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
                    {currentQuestion.question}
                  </h3>

                  {!showAnswer ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                          ✅ انتهيت من الإجابة
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* عرض الإجابة */}
                      <div className="bg-white/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 text-center">
                        <h4 className="text-emerald-400 font-bold text-xl mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          الإجابة الصحيحة
                        </h4>
                        <p className="text-2xl text-white font-bold">{currentQuestion.answer}</p>
                      </div>

                      {/* أزرار التقييم */}
                      <div className="flex flex-wrap justify-center gap-6">
                        <button
                          onClick={correctAnswer}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                            ✅ إجابة صحيحة
                          </div>
                        </button>
                        
                        <button
                          onClick={wrongAnswer}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                            ❌ إجابة خاطئة
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xl text-slate-300">جاري تحضير الدور التالي...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished phase
  if (gamePhase === 'finished') {
    // التحقق من التعادل
    const isTie = teams.tie || (teams.red.finishedFinal && teams.blue.finishedFinal);
    
    if (isTie) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gray-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center p-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto flex items-center justify-center mb-8 shadow-2xl">
                <span className="text-6xl">🤝</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8">
                🤝 تعادل!
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                الفريقان متعادلان! 🎊
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-red-300 mb-2">🥇 فريق</h3>
                  <p className="text-2xl font-bold text-white">{teams.red.name}</p>
                  <p className="text-xl text-white">{teams.red.score} نقطة</p>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-2">🥇 فريق</h3>
                  <p className="text-2xl font-bold text-white">{teams.blue.name}</p>
                  <p className="text-xl text-white">{teams.blue.score} نقطة</p>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                  🔄 بطولة جديدة
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // تحديد الفائز
    let winner, loser;
    
    if (teams.red.finishedFinal && !teams.blue.finishedFinal) {
      winner = teams.red;
      loser = teams.blue;
    } else if (teams.blue.finishedFinal && !teams.red.finishedFinal) {
      winner = teams.blue;
      loser = teams.red;
    } else {
      winner = teams.red.score > teams.blue.score ? teams.red : teams.blue;
      loser = teams.red.score > teams.blue.score ? teams.blue : teams.red;
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 w-full">
              <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  الإقصاء البصري
                </span>
              </div>
              <Link 
                href="/" 
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                ← العودة للرئيسية
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              {/* تاج النصر */}
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
                🏆 انتهت البطولة!
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                البطل: {winner.name}! 🎊
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">🥇 البطل</h3>
                  <p className="text-3xl font-bold text-white mb-2">{winner.name}</p>
                  <p className="text-2xl text-yellow-300">{winner.score} نقطة</p>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-gray-500/30">
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">🥈 الوصيف</h3>
                  <p className="text-3xl font-bold text-white mb-2">{loser.name}</p>
                  <p className="text-2xl text-gray-300">{loser.score} نقطة</p>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                  🔄 بطولة جديدة
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}