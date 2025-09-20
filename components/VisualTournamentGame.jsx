// components/VisualTournamentGame.jsx - النسخة العادلة
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getRandomQuestionFromRound, 
  saveUsedQuestions, 
  loadUsedQuestions, 
  clearUsedQuestions,
  getUsageStats 
} from '../app/data/tournamentData';

export default function VisualTournamentGame() {
  // State management
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentTeam, setCurrentTeam] = useState('red');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showingDecision, setShowingDecision] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);

  // 🆕 حالات جديدة للمنطق العادل
  const [eliminationPhase, setEliminationPhase] = useState(null); // 'first_team_failed', 'waiting_second_team'
  const [firstFailedTeam, setFirstFailedTeam] = useState(null); // أي فريق أخطأ أولاً
  const [failureType, setFailureType] = useState(null); // 'wrong_answer' أو 'withdrawal'

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
    const savedUsedQuestions = loadUsedQuestions();
    setUsedQuestionIds(savedUsedQuestions);
  }, []);

  useEffect(() => {
    if (isClient && usedQuestionIds.length > 0) {
      saveUsedQuestions(usedQuestionIds);
    }
  }, [usedQuestionIds, isClient]);

  // 🔧 NEW FAIR LOGIC - المنطق العادل الجديد
  
  const wrongAnswer = () => {
    if (eliminationPhase === null) {
      // الفريق الأول أخطأ - نعطي الفريق الآخر فرصة
      setFirstFailedTeam(currentTeam);
      setFailureType('wrong_answer');
      setEliminationPhase('first_team_failed');
      
      // تحديث حالة الفريق الذي أخطأ
      setTeams(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          eliminated: true,
          active: false,
          score: 0
        }
      }));
      
      // التحويل للفريق الآخر
      const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
      setCurrentTeam(otherTeam);
      setCurrentQuestion(null);
      setShowAnswer(false);
      setShowingDecision(true);
      setEliminationPhase('waiting_second_team');
      
    } else if (eliminationPhase === 'waiting_second_team') {
      // الفريق الثاني أيضاً أخطأ - تعادل
      setTeams(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          eliminated: true,
          active: false,
          score: 0
        },
        tie: true
      }));
      
      setTimeout(() => {
        setGamePhase('finished');
      }, 1500);
    }
  };

  const withdrawTeam = () => {
    if (eliminationPhase === null) {
      // الفريق الأول انسحب - نعطي الفريق الآخر فرصة
      setFirstFailedTeam(currentTeam);
      setFailureType('withdrawal');
      setEliminationPhase('first_team_failed');
      
      // تحديث حالة الفريق الذي انسحب
      setTeams(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          withdrawn: true,
          active: false
        }
      }));
      
      // التحويل للفريق الآخر
      const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
      setCurrentTeam(otherTeam);
      setCurrentQuestion(null);
      setShowAnswer(false);
      setShowingDecision(true);
      setEliminationPhase('waiting_second_team');
      
    } else if (eliminationPhase === 'waiting_second_team') {
      // الفريق الثاني أيضاً انسحب - تعادل
      setTeams(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          withdrawn: true,
          active: false
        },
        tie: true
      }));
      
      setTimeout(() => {
        setGamePhase('finished');
      }, 1500);
    }
  };

  const correctAnswer = () => {
    if (eliminationPhase === 'waiting_second_team') {
      // الفريق الثاني أجاب صحيح - يفوز
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
      
      setTimeout(() => {
        setGamePhase('finished');
      }, 1500);
      return;
    }
    
    // المنطق العادي للإجابة الصحيحة
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

  // باقي الدوال بدون تغيير
  const startGame = () => {
    if (!isClient) return;

    setGamePhase('playing');
    setCurrentTeam('red');
    setShowingDecision(true);
    setEliminationPhase(null);
    setFirstFailedTeam(null);
    setFailureType(null);
    setTeams(prev => ({
      ...prev,
      red: { ...prev.red, active: true },
      blue: { ...prev.blue, active: true }
    }));
  };

  const continueGame = () => {
    const currentTeamData = teams[currentTeam];
    
    const randomQuestion = getRandomQuestionFromRound(currentTeamData.currentRound, usedQuestionIds);
    
    if (!randomQuestion) {
      console.error('لا توجد أسئلة متاحة للدور:', currentTeamData.currentRound);
      advanceToNextRound();
      return;
    }

    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
    setShowingDecision(false);
    
    setUsedQuestionIds(prev => [...prev, randomQuestion.id]);
  };

  const advanceToNextRound = () => {
    const roundOrder = ['round8', 'round4', 'semi', 'final'];
    const currentRoundIndex = roundOrder.indexOf(teams[currentTeam].currentRound);
    
    if (currentRoundIndex === roundOrder.length - 1) {
      setTeams(prev => ({
        ...prev,
        [currentTeam]: { ...prev[currentTeam], finishedFinal: true, active: false }
      }));
      
      const updatedTeams = {
        ...teams,
        [currentTeam]: { ...teams[currentTeam], finishedFinal: true, active: false }
      };
      
      if (updatedTeams.red.finishedFinal && updatedTeams.blue.finishedFinal) {
        setTimeout(() => {
          setGamePhase('finished');
        }, 1500);
      } else {
        switchTeam();
      }
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
      
      switchTeam();
    }
  };

  const switchTeam = () => {
    const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
    setCurrentTeam(nextTeam);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setShowingDecision(true);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setCurrentTeam('red');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setShowingDecision(true);
    setUsedQuestionIds([]);
    setEliminationPhase(null);
    setFirstFailedTeam(null);
    setFailureType(null);
    clearUsedQuestions();
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

  const getQuestionStats = () => {
    if (!isClient) return { total: { remaining: 0 } };
    return getUsageStats(usedQuestionIds);
  };

  // Tournament bracket components (نفس الكود السابق)
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
          {teamData.eliminated && <span className="text-red-400 text-sm mr-2">(مُقصى)</span>}
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
              <div className="flex flex-col space-y-16">
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
                <h4 className="text-center text-yellow-400 font-bold mb-8 text-sm">النهائي</h4>
                {positions.final.map((position, index) => (
                  <div key={position.id} className="flex items-center justify-center">
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={teamData.currentRound === 'final' && index === teamData.questionsAnswered}
                      size="large"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // صفحة الإعداد (نفس الكود السابق مع إضافة شرح المنطق الجديد)
  if (gamePhase === 'setup') {
    const stats = getQuestionStats();
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                 بطولة الإقصاء
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
              بطولة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                الإقصاء 
              </span>
            </h1>
            
 

            {/* شرح المنطق الجديد */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              <h3 className="text-yellow-400 font-bold text-xl mb-6">قواعد اللعبة  </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
                  <h3 className="text-red-400 font-bold text-lg mb-3">❌ فريق أخطأ أولاً</h3>
                  <p className="text-gray-300">
                    الفريق الآخر يحصل على فرصة للإجابة على نفس السؤال.
                  </p>
                </div>

                <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-green-400 font-bold text-lg mb-3">✅ الفريق الثاني صحيح</h3>
                  <p className="text-gray-300">
                    الفريق الثاني يفوز ويحصل على النقاط.
                  </p>
                </div>

                <div className="bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">🤝 كلاهما أخطأ</h3>
                  <p className="text-gray-300">
                    إذا كلا الفريقين أخطأ أو انسحب → تعادل.
                  </p>
                </div>
              </div>
            </div>

            {/* نظام النقاط */}
            {/* <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              <h3 className="text-yellow-400 font-bold text-xl mb-6">🏆 نظام النقاط</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="font-bold text-blue-400">دور الـ8</div>
                  <div className="text-white font-bold">10 نقاط</div>
                  <div className="text-gray-400 text-sm">8 أسئلة</div>
                </div>
                <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="font-bold text-purple-400">دور الـ4</div>
                  <div className="text-white font-bold">20 نقطة</div>
                  <div className="text-gray-400 text-sm">4 أسئلة</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="font-bold text-orange-400">نصف النهائي</div>
                  <div className="text-white font-bold">40 نقطة</div>
                  <div className="text-gray-400 text-sm">2 سؤال</div>
                </div>
                <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="font-bold text-yellow-400">النهائي</div>
                  <div className="text-white font-bold">80 نقطة</div>
                  <div className="text-gray-400 text-sm">1 سؤال</div>
                </div>
              </div>
            </div> */}

            {/* {stats.total.remaining > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-cyan-400 font-bold text-lg mb-4">📊 الأسئلة المتاحة</h3>
                <div className="text-white text-xl">
                  {stats.total.remaining} سؤال متاح من أصل {stats.total.available}
                </div>
              </div>
            )} */}

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
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  ابدأ البطولة العادلة!
                </div>
              </div>
            </button>

            {/* {usedQuestionIds.length > 0 && (
              <button
                onClick={() => {
                  setUsedQuestionIds([]);
                  clearUsedQuestions();
                }}
                className="mt-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-2xl text-red-400 font-bold transition-all duration-300"
              >
                🔄 إعادة تعيين الأسئلة
              </button>
            )} */}
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const redTeam = teams.red;
    const blueTeam = teams.blue;
    
    let winner, loser;
    if (teams.tie) {
      winner = null; // تعادل
    } else if (redTeam.score > blueTeam.score) {
      winner = redTeam;
      loser = blueTeam;
    } else if (blueTeam.score > redTeam.score) {
      winner = blueTeam;
      loser = redTeam;
    } else {
      winner = null; // تعادل
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
               انتهت البطولة!
            </h1>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              {winner ? (
                <>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                    🎉 الفائز: {winner.name}
                  </h2>
                  <div className="text-2xl text-white mb-6">
                    النقاط النهائية: {winner.score}
                  </div>
                  <div className="text-lg text-gray-300">
                    الفريق المنافس: {loser.name} - {loser.score} نقطة
                    {loser.eliminated && " (مُقصى)"}
                    {loser.withdrawn && " (منسحب)"}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                    🤝 تعادل!
                  </h2>
                  <div className="text-xl text-white mb-4">
                    كلا الفريقين حصل على {redTeam.score} نقطة
                  </div>
                  <div className="text-lg text-gray-300">
                    {teams.tie && "كلا الفريقين أخطأ أو انسحب"}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                🔄 بطولة جديدة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  const currentTeamData = teams[currentTeam];
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
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

        {/* رسالة الحالة الحالية */}
        {eliminationPhase && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-orange-500/20 backdrop-blur-xl border border-orange-500/50 rounded-3xl">
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div className="text-orange-300 font-bold">
                {eliminationPhase === 'first_team_failed' && (
                  `${teams[firstFailedTeam].name} ${failureType === 'wrong_answer' ? 'أخطأ' : 'انسحب'} - فرصة للفريق الآخر!`
                )}
                {eliminationPhase === 'waiting_second_team' && (
                  `فرصة أخيرة للفوز أو التعادل - ${currentTeamData.name}`
                )}
              </div>
            </div>
          </div>
        )}

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
        {/* منطقة السؤال */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            {showingDecision ? (
              <div className="text-center space-y-8">
                <h2 className={`text-3xl font-bold ${currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                  دور {currentTeamData.name}
                </h2>
                
                {eliminationPhase === 'waiting_second_team' ? (
                  <div className="space-y-4">
                    <p className="text-xl text-orange-300">
                      🔥 فرصة أخيرة! {teams[firstFailedTeam].name} {failureType === 'wrong_answer' ? 'أخطأ' : 'انسحب'}
                    </p>
                    <p className="text-lg text-white">
                      هل تريد الاستمرار والمحاولة للفوز؟
                    </p>
                  </div>
                ) : (
                  <p className="text-xl text-white">
                    هل تريد الاستمرار في {roundConfig[currentTeamData.currentRound]?.name}؟
                  </p>
                )}
                
                <div className="flex justify-center gap-6">
                  <button
                    onClick={continueGame}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    {eliminationPhase === 'waiting_second_team' ? '🎯 محاولة الفوز' : 'استمرار'}
                  </button>
                  
                  <button
                    onClick={withdrawTeam}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    {eliminationPhase === 'waiting_second_team' ? '🤝 قبول التعادل' : 'انسحاب'}
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30">
                    <span className="text-purple-400 font-bold">
                      {currentQuestion.difficulty === 'easy' ? 'سهل' : 
                       currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </span>
                    <span className="text-white">•</span>
                    <span className="text-blue-400 font-bold">
                      {roundConfig[currentTeamData.currentRound]?.points} نقطة
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>
                </div>

                {!showAnswer ? (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                    >
                      📝 إظهار الإجابة
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-white">الإجابة الصحيحة</h4>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
                        <p className="text-2xl md:text-3xl text-white font-bold">{currentQuestion.answer}</p>
                      </div>
                    </div>

                    <div className="flex justify-center gap-6">
                      <button
                        onClick={correctAnswer}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                      >
                        ✅ إجابة صحيحة
                        {eliminationPhase === 'waiting_second_team' && ' - الفوز!'}
                      </button>
                      
                      <button
                        onClick={wrongAnswer}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                      >
                        ❌ إجابة خاطئة
                        {eliminationPhase === 'waiting_second_team' && ' - تعادل!'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-white">
                <p>جاري تحميل السؤال...</p>
              </div>
            )}
          </div>
        </div>
        {/* شجرة البطولة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TeamBracket team="red" />
          <TeamBracket team="blue" />
        </div>


      </div>
    </div>
  );
}