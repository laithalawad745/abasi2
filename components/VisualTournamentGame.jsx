'use client';

import React, { useState, useEffect } from 'react';

// بيانات الأسئلة
const tournamentQuestions = [
  // دور الـ8 
  { id: 1, question: 'ما هي عاصمة فرنسا؟', answer: 'باريس', round: 'round8', used: false },
  { id: 2, question: 'كم عدد الكواكب في المجموعة الشمسية؟', answer: 'ثمانية كواكب', round: 'round8', used: false },
  { id: 3, question: 'ما هو أكبر محيط في العالم؟', answer: 'المحيط الهادئ', round: 'round8', used: false },
  { id: 4, question: 'من هو مخترع المصباح الكهربائي؟', answer: 'توماس إديسون', round: 'round8', used: false },
  { id: 5, question: 'ما هي عملة اليابان؟', answer: 'الين', round: 'round8', used: false },
  { id: 6, question: 'كم عدد قارات العالم؟', answer: 'سبع قارات', round: 'round8', used: false },
  { id: 7, question: 'ما هو أطول نهر في العالم؟', answer: 'نهر النيل', round: 'round8', used: false },
  { id: 8, question: 'في أي عام انتهت الحرب العالمية الثانية؟', answer: '1945', round: 'round8', used: false },
  { id: 9, question: 'ما هو الكوكب الأحمر؟', answer: 'المريخ', round: 'round8', used: false },
  { id: 10, question: 'كم عدد ألوان قوس قزح؟', answer: 'سبعة ألوان', round: 'round8', used: false },
  { id: 11, question: 'ما هي أصغر دولة في العالم؟', answer: 'الفاتيكان', round: 'round8', used: false },
  { id: 12, question: 'من هو مؤسس شركة مايكروسوفت؟', answer: 'بيل غيتس', round: 'round8', used: false },
  { id: 13, question: 'ما هو أعمق محيط في العالم؟', answer: 'المحيط الهادئ', round: 'round8', used: false },
  { id: 14, question: 'كم عدد أيام السنة الكبيسة؟', answer: '366 يوم', round: 'round8', used: false },
  { id: 15, question: 'ما هي عاصمة أستراليا؟', answer: 'كانبرا', round: 'round8', used: false },
  { id: 16, question: 'من هو مخترع الهاتف؟', answer: 'ألكسندر غراهام بيل', round: 'round8', used: false },

  // دور الـ4
  { id: 17, question: 'من هو مؤلف رواية "مئة عام من العزلة"؟', answer: 'غابرييل غارسيا ماركيز', round: 'round4', used: false },
  { id: 18, question: 'ما هو العنصر الكيميائي الذي رمزه Au؟', answer: 'الذهب', round: 'round4', used: false },
  { id: 19, question: 'في أي عام تم افتتاح قناة السويس؟', answer: '1869', round: 'round4', used: false },
  { id: 20, question: 'ما هو اسم أطول نهر في أوروبا؟', answer: 'نهر الفولغا', round: 'round4', used: false },
  { id: 21, question: 'من هو الرسام الذي قطع أذنه؟', answer: 'فان جوخ', round: 'round4', used: false },
  { id: 22, question: 'كم عدد العظام في جسم الإنسان البالغ؟', answer: '206 عظمة', round: 'round4', used: false },
  { id: 23, question: 'ما هي عاصمة كندا؟', answer: 'أوتاوا', round: 'round4', used: false },
  { id: 24, question: 'في أي عام هبط الإنسان على القمر لأول مرة؟', answer: '1969', round: 'round4', used: false },

  // نصف النهائي
  { id: 25, question: 'ما هو الاسم العلمي لفيتامين C؟', answer: 'حمض الأسكوربيك', round: 'semi', used: false },
  { id: 26, question: 'من هو مؤسس الإمبراطورية المغولية؟', answer: 'چنگیز خان', round: 'semi', used: false },
  { id: 27, question: 'ما هو أعمق نقطة في المحيطات؟', answer: 'خندق ماريانا', round: 'semi', used: false },
  { id: 28, question: 'في أي عام تم اكتشاف DNA؟', answer: '1953', round: 'semi', used: false },

  // النهائي
  { id: 29, question: 'ما هو أقل عدد من الألوان المطلوبة لتلوين أي خريطة؟', answer: 'أربعة ألوان', round: 'final', used: false },
  { id: 30, question: 'من هو مكتشف قانون الجاذبية؟', answer: 'إسحاق نيوتن', round: 'final', used: false }
];

export default function VisualTournamentGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentTeam, setCurrentTeam] = useState('red'); // 'red', 'blue'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showingDecision, setShowingDecision] = useState(false);

  // التأكد من أننا في المتصفح
  useEffect(() => {
    setIsClient(true);
  }, []);

  // حالة الفرق
  const [teams, setTeams] = useState({
    red: {
      name: 'الفريق الأحمر',
      score: 0,
      currentRound: 'round8',
      questionsAnswered: 0,
      active: true,
      withdrawn: false,
      eliminated: false,
      finishedFinal: false // 🔥 جديد: هل أنهى النهائي
    },
    blue: {
      name: 'الفريق الأزرق', 
      score: 0,
      currentRound: 'round8',
      questionsAnswered: 0,
      active: true,
      withdrawn: false,
      eliminated: false,
      finishedFinal: false // 🔥 جديد: هل أنهى النهائي
    }
  });

  // إعدادات الأدوار
  const roundConfig = {
    round8: { name: 'دور الـ8', questionsNeeded: 8, points: 20 },
    round4: { name: 'دور الـ4', questionsNeeded: 4, points: 40 },
    semi: { name: 'نصف النهائي', questionsNeeded: 2, points: 80 },
    final: { name: 'النهائي', questionsNeeded: 1, points: 160 }
  };

  // التأكد من أننا في المتصفح قبل العرض
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  // بدء اللعبة
  const startGame = () => {
    if (!isClient) return;
    setGamePhase('playing');
    setIsProcessing(false);
    tournamentQuestions.forEach(q => q.used = false);
    startNewTurn();
  };

  // بدء دور جديد (عرض خيار الانسحاب أو المتابعة)
  const startNewTurn = () => {
    if (!isClient) return;
    
    const currentTeamData = teams[currentTeam];
    
    // التحقق من أن الفريق الحالي لا يزال نشطاً
    if (!currentTeamData.active || currentTeamData.eliminated || currentTeamData.withdrawn) {
      switchToNextActiveTeam();
      return;
    }

    // إظهار خيار الانسحاب أو المتابعة
    setShowingDecision(true);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setIsProcessing(false);
  };

  // قرار المتابعة - عرض السؤال
  const continueGame = () => {
    setShowingDecision(false);
    startNewQuestion();
  };

  // بدء سؤال جديد (بعد اختيار المتابعة)
  const startNewQuestion = () => {
    if (!isClient) return;
    
    const currentTeamData = teams[currentTeam];

    // الحصول على الأسئلة المتاحة للدور الحالي
    const availableQuestions = tournamentQuestions.filter(q => 
      q.round === currentTeamData.currentRound && !q.used
    );
    
    if (availableQuestions.length === 0) {
      console.error('No questions available for round', currentTeamData.currentRound);
      return;
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    randomQuestion.used = true;
    
    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
    setIsProcessing(false);
  };

  // تبديل للفريق النشط التالي
  const switchToNextActiveTeam = () => {
    if (!isClient) return;
    
    const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
    const nextTeamData = teams[nextTeam];
    
    // إذا كان الفريق التالي نشطاً
    if (nextTeamData.active && !nextTeamData.eliminated && !nextTeamData.withdrawn) {
      setCurrentTeam(nextTeam);
      setIsProcessing(false);
      setTimeout(() => startNewTurn(), 500);
    } else {
      // 🔥 تحقق خاص: إذا كان أحد الفريقين أنهى النهائي
      if (teams.red.finishedFinal || teams.blue.finishedFinal) {
        // أحد الفريقين أنهى النهائي والآخر متوقف
        endGame();
      } else {
        // لا يوجد فرق نشطة، انتهت اللعبة
        endGame();
      }
    }
  };

  // إظهار الإجابة
  const showQuestionAnswer = () => {
    setShowAnswer(true);
  };

  // إجابة صحيحة
  const correctAnswer = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const currentTeamData = teams[currentTeam];
    const roundPoints = roundConfig[currentTeamData.currentRound].points;
    
    setTeams(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        score: prev[currentTeam].score + roundPoints,
        questionsAnswered: prev[currentTeam].questionsAnswered + 1
      }
    }));

    // التحقق من انتهاء الدور
    checkRoundCompletion();
  };

  // إجابة خاطئة
  const wrongAnswer = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTeams(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        score: 0,
        active: false,
        eliminated: true
      }
    }));

    setShowingDecision(false);
    setTimeout(() => switchToNextActiveTeam(), 1500);
  };

  // انسحاب الفريق
  const withdrawTeam = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTeams(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        active: false,
        withdrawn: true
      }
    }));

    setShowingDecision(false);
    setTimeout(() => switchToNextActiveTeam(), 1500);
  };

  // 🔥 التحقق من انتهاء الدور - مُعدّل لحل مشكلة النهائي
  const checkRoundCompletion = () => {
    const currentTeamData = teams[currentTeam];
    const roundNeeded = roundConfig[currentTeamData.currentRound].questionsNeeded;
    
    if (currentTeamData.questionsAnswered + 1 >= roundNeeded) {
      const nextRound = getNextRound(currentTeamData.currentRound);
      
      // إذا أنهى النهائي
      if (currentTeamData.currentRound === 'final') {
        setTeams(prev => ({
          ...prev,
          [currentTeam]: {
            ...prev[currentTeam],
            currentRound: 'completed',
            questionsAnswered: 0,
            finishedFinal: true // 🔥 وضع علامة أنه أنهى النهائي
          }
        }));
        
        // 🔥 تحقق من الفريق الآخر
        const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
        const otherTeamData = teams[otherTeam];
        
        if (otherTeamData.finishedFinal) {
          // كلا الفريقين أنهى النهائي = تعادل
          setTimeout(() => endGameWithTie(), 1500);
          return;
        } else {
          // الفريق الحالي أنهى النهائي، ننتظر الآخر
          console.log(`${currentTeam} أنهى النهائي، ننتظر ${otherTeam}`);
        }
      } else {
        // دور عادي (ليس النهائي)
        setTeams(prev => ({
          ...prev,
          [currentTeam]: {
            ...prev[currentTeam],
            currentRound: nextRound,
            questionsAnswered: 0
          }
        }));
      }
    }

    // الانتقال للفريق التالي
    setTimeout(() => {
      setIsProcessing(false);
      switchToNextActiveTeam();
    }, 1000);
  };

  // الحصول على الدور التالي
  const getNextRound = (currentRound) => {
    const roundOrder = ['round8', 'round4', 'semi', 'final', 'completed'];
    const currentIndex = roundOrder.indexOf(currentRound);
    return roundOrder[currentIndex + 1] || 'completed';
  };

  // انتهاء اللعبة
  const endGame = () => {
    setGamePhase('finished');
  };

  // انتهاء اللعبة بالتعادل
  const endGameWithTie = () => {
    setTeams(prev => ({
      ...prev,
      tie: true
    }));
    setGamePhase('finished');
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentTeam('red');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setIsProcessing(false);
    setShowingDecision(false);
    setTeams({
      red: {
        name: 'الفريق الأحمر',
        score: 0,
        currentRound: 'round8',
        questionsAnswered: 0,
        active: true,
        withdrawn: false,
        eliminated: false,
        finishedFinal: false
      },
      blue: {
        name: 'الفريق الأزرق',
        score: 0,
        currentRound: 'round8',
        questionsAnswered: 0,
        active: true,
        withdrawn: false,
        eliminated: false,
        finishedFinal: false
      }
    });
    tournamentQuestions.forEach(q => q.used = false);
  };

  // مكون الدائرة للشجرة
  const PlayerCircle = ({ position, team, isActive, size = 'normal' }) => {
    const sizeClasses = {
      small: 'w-8 h-8 text-xs',
      normal: 'w-12 h-12 text-sm',
      large: 'w-16 h-16 text-base'
    };

    const teamColors = {
      red: isActive ? 'bg-red-500 border-red-300' : position.reached ? 'bg-red-600 border-red-400' : 'bg-gray-600 border-gray-500',
      blue: isActive ? 'bg-blue-500 border-blue-300' : position.reached ? 'bg-blue-600 border-blue-400' : 'bg-gray-600 border-gray-500'
    };

    return (
      <div className={`${sizeClasses[size]} ${teamColors[team]} border-2 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${isActive ? 'ring-2 ring-yellow-400 scale-110' : ''}`}>
        {position.name}
      </div>
    );
  };

  // مكون الخط الواصل
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

  // 🔥 مكون الشجرة للفريق - مُعدّل لحل مشكلة الدوائر
  const TeamBracket = ({ team }) => {
    const teamData = teams[team];
    const teamColors = {
      red: 'border-red-500/50 bg-red-500/10',
      blue: 'border-blue-500/50 bg-blue-500/10'
    };

    // 🔥 دالة محسّنة لإنشاء مواضع الدوائر
    const createPositions = (count, round) => {
      return Array(count).fill(null).map((_, i) => {
        // ترتيب الأدوار
        const roundOrder = ['round8', 'round4', 'semi', 'final'];
        const currentRoundIndex = roundOrder.indexOf(teamData.currentRound);
        const thisRoundIndex = roundOrder.indexOf(round);
        
        // إذا تجاوز الفريق هذا الدور (أدوار سابقة مكتملة)
        if (currentRoundIndex > thisRoundIndex || teamData.currentRound === 'completed') {
          return {
            id: `${team}_${round}_${i + 1}`,
            name: '✓', // 🔥 إظهار كل الدوائر كمكتملة
            reached: true
          };
        }
        
        // إذا كان في نفس الدور الحالي
        if (teamData.currentRound === round) {
          return {
            id: `${team}_${round}_${i + 1}`,
            name: i < teamData.questionsAnswered ? '✓' : 
                  i === teamData.questionsAnswered ? '?' : '',
            reached: i < teamData.questionsAnswered
          };
        }
        
        // دور مستقبلي
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
      <div className={`border-2 rounded-2xl p-6 ${teamColors[team]} ${teamData.active && currentTeam === team ? 'ring-2 ring-yellow-400 shadow-2xl' : ''} ${teamData.withdrawn ? 'opacity-50' : ''} ${teamData.eliminated ? 'opacity-30' : ''}`}>
        <h2 className={`text-center text-2xl font-bold mb-6 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
          {teamData.name}
          {teamData.withdrawn && <span className="text-yellow-400 text-sm mr-2">(منسحب)</span>}
          {teamData.eliminated && <span className="text-red-400 text-sm mr-2">(مُبعد)</span>}
          {teamData.finishedFinal && <span className="text-green-400 text-sm mr-2">(أنهى النهائي)</span>}
        </h2>
        
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-white">النقاط: {teamData.score}</div>
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
                <h4 className="text-center text-green-400 font-bold mb-2 text-sm">نصف النهائي</h4>
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
    );
  };

  // صفحة الإعدادات
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                 الإقصاء
            </h1>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6">
           الإقصاء
            </h2>
            
            <div className="text-lg text-slate-300 mb-8 text-right">
              <p className="mb-4">: قواعد اللعبة </p>
              <ul className="list-disc list-inside space-y-2">
   
                <li className="text-red-400"> إجابة خاطئة = خسارة كل النقاط وإيقاف اللعب</li>
                <li className="text-yellow-400"> يمكن الانسحاب قبل رؤية السؤال والاحتفاظ بالنقاط</li>
                <li className="text-blue-400"> سؤال لكل فريق بالتناوب</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(roundConfig).map(([round, config]) => (
                <div key={round} className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">{config.name}</h3>
                  <p className="text-2xl font-bold text-white">{config.points} نقطة</p>
                  <p className="text-sm text-gray-400">لكل سؤال</p>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              disabled={!isClient}
              className={`px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl shadow-2xl transition-all duration-300 hover:scale-105 ${
                isClient 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  : 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
              }`}
            >
               ابدأ !
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  if (gamePhase === 'playing') {
    const currentTeamData = teams[currentTeam];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              الإقصاء
            </h1>
            {/* <button
              onClick={resetGame}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
            >
              إعادة تعيين
            </button> */}
          </div>

          {/* معلومات الدور الحالي */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-600 shadow-xl">
              <div className={`text-xl font-bold ${currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                دور {currentTeamData.name}
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="text-yellow-400 font-bold">
                {currentTeamData.currentRound === 'completed' ? 'مكتمل' : roundConfig[currentTeamData.currentRound]?.name}
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="text-green-400 font-bold">
                {currentTeamData.currentRound !== 'completed' ? roundConfig[currentTeamData.currentRound]?.points : 0} نقطة/سؤال
              </div>
            </div>
          </div>

          {/* شجرة البطولة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TeamBracket team="red" />
            <TeamBracket team="blue" />
          </div>

          {/* منطقة السؤال */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-600">
            {showingDecision ? (
              // مرحلة القرار: انسحاب أو متابعة
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  دور {teams[currentTeam].name}
                </h3>
                <p className="text-lg text-gray-300 mb-8">
                  اختر ما تريد فعله:
                </p>
                
                <div className="flex flex-wrap justify-center gap-6">
                  <button
                    onClick={withdrawTeam}
                    disabled={isProcessing}
                    className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${
                      isProcessing 
                        ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:scale-105'
                    }`}
                  >
                     انسحاب والاحتفاظ بالنقاط
                  </button>
                  <button
                    onClick={continueGame}
                    disabled={isProcessing}
                    className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${
                      isProcessing 
                        ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                    }`}
                  >
                     متابعة  
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              // مرحلة السؤال
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  {currentQuestion.question}
                </h3>
                
                {showAnswer && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
                    <p className="text-xl text-green-400 font-bold">
                      الإجابة: {currentQuestion.answer}
                    </p>
                  </div>
                )}

                {isProcessing && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                    <p className="text-lg text-blue-400 font-bold">
                      ⏳ جاري المعالجة...
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                  {!showAnswer ? (
                    <button
                      onClick={showQuestionAnswer}
                      disabled={isProcessing}
                      className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                        isProcessing 
                          ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                      }`}
                    >
                      إظهار الإجابة
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={correctAnswer}
                        disabled={isProcessing}
                        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                          isProcessing 
                            ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        }`}
                      >
                        ✅ إجابة صحيحة
                      </button>
                      <button
                        onClick={wrongAnswer}
                        disabled={isProcessing}
                        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                          isProcessing 
                            ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                        }`}
                      >
                        ❌ إجابة خاطئة
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xl text-slate-300">جاري تحضير الدور التالي...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // صفحة النهاية
  if (gamePhase === 'finished') {
    // التحقق من التعادل
    const isTie = teams.tie || (teams.red.finishedFinal && teams.blue.finishedFinal);
    
    if (isTie) {
      // حالة التعادل
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl p-8 md:p-12 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                🤝 تعادل!
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                الفريقان متعادلان! 🎊
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-300 mb-2">🥇 فريق</h3>
                  <p className="text-2xl font-bold text-white">{teams.red.name}</p>
                  <p className="text-xl text-white">{teams.red.score} نقطة</p>
                </div>
                
                <div className="bg-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-2">🥇 فريق</h3>
                  <p className="text-2xl font-bold text-white">{teams.blue.name}</p>
                  <p className="text-xl text-white">{teams.blue.score} نقطة</p>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                بطولة جديدة 🏆
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
      loser = teams.red.score <= teams.blue.score ? teams.red : teams.blue;
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
              🏆 انتهت البطولة!
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {winner.name} هو بطل المعرفة! 🎉
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">🥇 البطل</h3>
                <p className="text-2xl font-bold text-yellow-200">{winner.name}</p>
                <p className="text-xl text-white">{winner.score} نقطة</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">🥈 الوصيف</h3>
                <p className="text-2xl font-bold text-gray-200">{loser.name}</p>
                <p className="text-xl text-white">{loser.score} نقطة</p>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              بطولة جديدة 🏆
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}