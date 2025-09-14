// components/QuizGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { sampleTopics } from '../app/data/gameData';

// Import components
import NavBar from './NavBar';
import TeamScoresOnly from './TeamScoresOnly';
import TeamHelpers from './TeamHelpers';
import QuestionDisplay from './QuestionDisplay';
import ChoiceQuestion from './ChoiceQuestion';
import TopicGrid from './TopicGrid';
import GameFinished from './GameFinished';
import { ImageModal, ConfirmModal } from './Modals';

export default function QuizGame() {
  // State Management
  const [gameState, setGameState] = useState('playing'); // بدء اللعبة مباشرة
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // Choice Questions State
  const [currentChoiceQuestion, setCurrentChoiceQuestion] = useState(null);
  const [showChoiceAnswers, setShowChoiceAnswers] = useState(false);
  const [choiceQuestionOrder, setChoiceQuestionOrder] = useState({
    red: [1, 3, 5, 7],
    blue: [2, 4, 6, 8]
  });
  const [usedChoiceQuestions, setUsedChoiceQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Other State
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Question tracking
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [teamQuestionMap, setTeamQuestionMap] = useState({});
  const [isAbsiMode, setIsAbsiMode] = useState(true); // دائماً في وضع Absi
  
  // Helpers
  const [helpers, setHelpers] = useState({
    red: { number2: true, pit: true },
    blue: { number2: true, pit: true }
  });
  const [usingPitHelper, setUsingPitHelper] = useState(null);

  // Local Storage Keys
  const STORAGE_KEYS = {
    usedQuestions: 'quiz-used-questions',
    teamQuestionMap: 'quiz-team-question-map',
    teams: 'quiz-teams',
    helpers: 'quiz-helpers',
    usedChoiceQuestions: 'quiz-used-choice-questions'
  };

  // تحميل البيانات من localStorage
  useEffect(() => {
    try {
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEYS.usedQuestions);
      if (savedUsedQuestions) {
        setUsedQuestions(new Set(JSON.parse(savedUsedQuestions)));
      }
    } catch (error) {}

    try {
      const savedTeamQuestionMap = localStorage.getItem(STORAGE_KEYS.teamQuestionMap);
      if (savedTeamQuestionMap) {
        setTeamQuestionMap(JSON.parse(savedTeamQuestionMap));
      }
    } catch (error) {}

    try {
      const savedTeams = localStorage.getItem(STORAGE_KEYS.teams);
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      }
    } catch (error) {}

    try {
      const savedHelpers = localStorage.getItem(STORAGE_KEYS.helpers);
      if (savedHelpers) {
        setHelpers(JSON.parse(savedHelpers));
      }
    } catch (error) {}

    try {
      const savedUsedChoiceQuestions = localStorage.getItem(STORAGE_KEYS.usedChoiceQuestions);
      if (savedUsedChoiceQuestions) {
        setUsedChoiceQuestions(JSON.parse(savedUsedChoiceQuestions));
      }
    } catch (error) {}
  }, []);

  // إعداد المباراة الكاملة تلقائياً
  useEffect(() => {
    const absiTopic = sampleTopics.find(topic => topic.id === 'absi');
    const choicesTopic = sampleTopics.find(topic => topic.id === 'choices');
    const qrTopic = sampleTopics.find(topic => topic.id === 'qr_game');
    
    if (absiTopic && choicesTopic && qrTopic) {
      setSelectedTopics([absiTopic, choicesTopic, qrTopic]);
      
      // إعداد خريطة الأسئلة إذا لم تكن موجودة
      if (!teamQuestionMap[absiTopic.id]) {
        const questionMap = {};
        questionMap[absiTopic.id] = {
          red: { easy: false, medium: false, hard: false },
          blue: { easy: false, medium: false, hard: false }
        };
        questionMap[qrTopic.id] = {
          red: { easy: false, medium: false, hard: false },
          blue: { easy: false, medium: false, hard: false }
        };
        
        setTeamQuestionMap(questionMap);
      }
    }
  }, [teamQuestionMap]);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.usedQuestions, JSON.stringify([...usedQuestions]));
    } catch (error) {}
  }, [usedQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teamQuestionMap, JSON.stringify(teamQuestionMap));
    } catch (error) {}
  }, [teamQuestionMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
    } catch (error) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.helpers, JSON.stringify(helpers));
    } catch (error) {}
  }, [helpers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.usedChoiceQuestions, JSON.stringify(usedChoiceQuestions));
    } catch (error) {}
  }, [usedChoiceQuestions]);

  // Timer Functions
  const startTimer = () => {
    if (!timerActive) {
      setTimerActive(true);
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const toggleTimer = () => {
    if (timerActive) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Choice Question Functions
  const selectChoiceQuestion = (order) => {
    const choicesTopic = selectedTopics.find(t => t.id === 'choices');
    if (!choicesTopic) return;
    if (!choiceQuestionOrder[currentTurn].includes(order)) return;
    if (usedChoiceQuestions.includes(order)) return;

    const question = choicesTopic.questions.find(q => q.order === order);
    if (question) {
      setCurrentChoiceQuestion(question);
      setShowChoiceAnswers(false);
      setSelectedAnswers({});
      setUsedChoiceQuestions([...usedChoiceQuestions, order]);
      
      if (timerActive) {
        stopTimer();
      }
    }
  };

  const finishChoiceAnswering = () => {
    setShowChoiceAnswers(true);
  };

  const awardChoicePoints = (answerIndex, team) => {
    if (!currentChoiceQuestion) return;
    
    const answerKey = `answer_${answerIndex}`;
    if (selectedAnswers[answerKey]) return;
    
    const answer = currentChoiceQuestion.answers[answerIndex];
    const newTeams = [...teams];
    const teamIndex = team === 'red' ? 0 : 1;
    
    newTeams[teamIndex].score += answer.points;
    setTeams(newTeams);
    
    setSelectedAnswers(prev => ({
      ...prev,
      [answerKey]: team
    }));
  };

  const awardChoicePointsBoth = (answerIndex) => {
    if (!currentChoiceQuestion) return;
    
    const answerKey = `answer_${answerIndex}`;
    if (selectedAnswers[answerKey]) return;
    
    const answer = currentChoiceQuestion.answers[answerIndex];
    const newTeams = [...teams];
    
    newTeams[0].score += answer.points;
    newTeams[1].score += answer.points;
    setTeams(newTeams);
    
    setSelectedAnswers(prev => ({
      ...prev,
      [answerKey]: 'both'
    }));
  };

  const closeChoiceQuestion = () => {
    setCurrentChoiceQuestion(null);
    setShowChoiceAnswers(false);
    setSelectedAnswers({});
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
    
    setTimeout(() => {
      checkGameEnd();
    }, 100);
  };

  // Helper Functions
  const useNumber2Helper = (team) => {
    if (helpers[team].number2) {
      const newHelpers = { ...helpers };
      newHelpers[team].number2 = false;
      setHelpers(newHelpers);
    }
  };

  const usePitHelper = (team) => {
    if (helpers[team].pit) {
      const newHelpers = { ...helpers };
      newHelpers[team].pit = false;
      setHelpers(newHelpers);
      setUsingPitHelper(team);
    }
  };

  // Question Functions
  const isQuestionAvailable = (topicId, difficulty, team) => {
    const topic = selectedTopics.find(t => t.id === topicId);
    if (!topic) return false;

    const hasTeamUsedThisLevel = teamQuestionMap[topicId]?.[team]?.[difficulty] === true;
    if (hasTeamUsedThisLevel) return false;

    const availableQuestions = topic.questions.filter(q => 
      q.difficulty === difficulty && 
      !usedQuestions.has(q.id)
    );

    return availableQuestions.length > 0;
  };

  const getAvailableQuestionsCount = (topicId, difficulty, team) => {
    const topic = selectedTopics.find(t => t.id === topicId);
    if (!topic) return 0;

    const availableQuestions = topic.questions.filter(q => 
      q.difficulty === difficulty && 
      !usedQuestions.has(q.id)
    );

    return availableQuestions.length;
  };

  const selectRandomQuestionForTeam = (topicId, difficulty, team) => {
    if (team !== currentTurn) return;

    const topic = selectedTopics.find(t => t.id === topicId);
    if (!topic) return;

    const hasTeamUsedThisLevel = teamQuestionMap[topicId]?.[team]?.[difficulty] === true;
    if (hasTeamUsedThisLevel) return;

    const availableQuestions = topic.questions.filter(q => 
      q.difficulty === difficulty && 
      !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    const newTeamQuestionMap = { ...teamQuestionMap };
    if (!newTeamQuestionMap[topicId]) {
      newTeamQuestionMap[topicId] = {
        red: { easy: false, medium: false, hard: false },
        blue: { easy: false, medium: false, hard: false }
      };
    }
    newTeamQuestionMap[topicId][team][difficulty] = true;
    setTeamQuestionMap(newTeamQuestionMap);

    setUsedQuestions(prev => new Set([...prev, selectedQuestion.id]));

    setCurrentQuestion(selectedQuestion);
    setShowAnswer(false);
    
    stopTimer();
    setTimer(0);
    setTimeout(() => {
      startTimer();
    }, 100);
  };

  const finishAnswering = () => {
    setShowAnswer(true);
  };

  const awardPoints = (teamIndex) => {
    if (currentQuestion) {
      const newTeams = [...teams];
      const questionPoints = currentQuestion.points;
      
      if (usingPitHelper) {
        const pitTeamIndex = usingPitHelper === 'red' ? 0 : 1;
        const otherTeamIndex = pitTeamIndex === 0 ? 1 : 0;
        
        if (teamIndex === pitTeamIndex) {
          newTeams[pitTeamIndex].score += questionPoints;
          newTeams[otherTeamIndex].score -= questionPoints;
          if (newTeams[otherTeamIndex].score < 0) {
            newTeams[otherTeamIndex].score = 0;
          }
        } else {
          newTeams[teamIndex].score += questionPoints;
        }
        
        setUsingPitHelper(null);
      } else {
        newTeams[teamIndex].score += questionPoints;
      }
      
      setTeams(newTeams);
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      setCurrentQuestion(null);
      setShowAnswer(false);
      
      setTimeout(() => {
        checkGameEnd();
      }, 100);
    }
  };

  const noCorrectAnswer = () => {
    if (currentQuestion) {
      if (usingPitHelper) {
        setUsingPitHelper(null);
      }
      
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      setCurrentQuestion(null);
      setShowAnswer(false);
      
      setTimeout(() => {
        checkGameEnd();
      }, 100);
    }
  };

  const checkGameEnd = () => {
    let totalAnsweredQuestions = 0;
    let totalPossibleQuestions = 0;

    selectedTopics.forEach(topic => {
      if (topic.id === 'choices') {
        totalPossibleQuestions += Math.min(8, topic.questions.length);
        totalAnsweredQuestions += usedChoiceQuestions.length;
      } else if (topic.id === 'absi' || topic.id === 'qr_game') {
        const availableQuestionsForTopic = topic.questions.filter(q => !usedQuestions.has(q.id));
        
        const easyQuestions = availableQuestionsForTopic.filter(q => q.difficulty === 'easy').length;
        const mediumQuestions = availableQuestionsForTopic.filter(q => q.difficulty === 'medium').length;
        const hardQuestions = availableQuestionsForTopic.filter(q => q.difficulty === 'hard').length;
        
        if (easyQuestions > 0) totalPossibleQuestions += 2;
        if (mediumQuestions > 0) totalPossibleQuestions += 2;
        if (hardQuestions > 0) totalPossibleQuestions += 2;
        
        ['red', 'blue'].forEach(team => {
          ['easy', 'medium', 'hard'].forEach(difficulty => {
            if (teamQuestionMap[topic.id]?.[team]?.[difficulty] === true) {
              totalAnsweredQuestions += 1;
            }
          });
        });
      }
    });

    if (totalAnsweredQuestions >= totalPossibleQuestions) {
      setGameState('finished');
      stopTimer();
    }
  };

  const hasUsedQuestionsInLevel = (topicId, difficulty, team) => {
    return teamQuestionMap[topicId]?.[team]?.[difficulty] === true;
  };

  const resetGame = (fullReset = true) => {
    setGameState('playing');
    setCurrentQuestion(null);
    setCurrentChoiceQuestion(null);
    setShowAnswer(false);
    setShowChoiceAnswers(false);
    setSelectedAnswers({});
    setCurrentTurn('red');
    setUsedChoiceQuestions([]);
    
    if (fullReset) {
      setTeams([
        { name: 'الفريق الأحمر', color: 'red', score: 0 },
        { name: 'الفريق الأزرق', color: 'blue', score: 0 }
      ]);
      setUsedQuestions(new Set());
      setTeamQuestionMap({});
      setHelpers({
        red: { number2: true, pit: true },
        blue: { number2: true, pit: true }
      });
      setUsingPitHelper(null);
      
      // مسح localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {}
      });
    }
    
    resetTimer();
  };

  const zoomImage = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  if (gameState === 'finished') {
    return <GameFinished teams={teams} isAbsiMode={isAbsiMode} resetGame={resetGame} />;
  }

  return (
    <>
      {/* الناف بار - التوقيت ودور الفريق فقط */}
      <NavBar 
        currentTurn={currentTurn}
        timer={timer}
        timerActive={timerActive}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        currentChoiceQuestion={currentChoiceQuestion}
        usingPitHelper={usingPitHelper}
        isAbsiMode={isAbsiMode}
      />

      {/* المحتوى الرئيسي */}
      <div 
        className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none mt-8 md:mt-24"
        style={{ paddingTop: '120px' }}
      >
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="max-w-7xl mx-auto p-2 md:p-4">
          {/* نتائج الفرق فقط */}
          <TeamScoresOnly 
            teams={teams} 
            currentTurn={currentTurn}
          />

          <TeamHelpers 
            helpers={helpers}
            currentTurn={currentTurn}
            currentQuestion={currentQuestion}
            currentChoiceQuestion={currentChoiceQuestion}
            useNumber2Helper={useNumber2Helper}
            usePitHelper={usePitHelper}
          />

          <QuestionDisplay 
            currentQuestion={currentQuestion}
            showAnswer={showAnswer}
            usingPitHelper={usingPitHelper}
            finishAnswering={finishAnswering}
            awardPoints={awardPoints}
            noCorrectAnswer={noCorrectAnswer}
            zoomImage={zoomImage}
          />

          <ChoiceQuestion 
            currentChoiceQuestion={currentChoiceQuestion}
            showChoiceAnswers={showChoiceAnswers}
            selectedAnswers={selectedAnswers}
            finishChoiceAnswering={finishChoiceAnswering}
            awardChoicePoints={awardChoicePoints}
            awardChoicePointsBoth={awardChoicePointsBoth}
            closeChoiceQuestion={closeChoiceQuestion}
          />

          <TopicGrid 
            selectedTopics={selectedTopics}
            currentTurn={currentTurn}
            currentQuestion={currentQuestion}
            currentChoiceQuestion={currentChoiceQuestion}
            usedChoiceQuestions={usedChoiceQuestions}
            selectChoiceQuestion={selectChoiceQuestion}
            selectRandomQuestionForTeam={selectRandomQuestionForTeam}
            isQuestionAvailable={isQuestionAvailable}
            getAvailableQuestionsCount={getAvailableQuestionsCount}
            hasUsedQuestionsInLevel={hasUsedQuestionsInLevel}
            setShowConfirmReset={setShowConfirmReset}
          />

          <ImageModal zoomedImage={zoomedImage} closeZoomedImage={closeZoomedImage} />
          
          <ConfirmModal 
            showConfirmReset={showConfirmReset}
            setShowConfirmReset={setShowConfirmReset}
            resetGame={resetGame}
          />
        </div>
      </div>
    </>
  );
}