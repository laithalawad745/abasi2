// components/RiskGame/RiskGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { sampleTopics } from '../../app/data/gameData';

// Import components
import PlayerSetup from './PlayerSetup';
import SpinWheel from './SpinWheel';
import WorldMap from './WorldMap';
import GameUI from './GameUI';
import QuestionModal from './QuestionModal';

export default function RiskGame() {
  // حالة اللعبة الأساسية
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'spin', 'playing', 'finished'
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([]);
  
  // حالة الخريطة والدول
  const [countries, setCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // حالة القتال والهجوم
  const [attackMode, setAttackMode] = useState(false);
  const [attackFrom, setAttackFrom] = useState(null);
  const [attackTo, setAttackTo] = useState(null);

  // ألوان اللاعبين
  const playerColors = [
    '#ff4444', '#4444ff', '#44ff44', '#ffff44',
    '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
  ];

  // إعداد اللاعبين
  const setupPlayers = (playerCount) => {
    const newPlayers = Array(playerCount).fill(null).map((_, i) => ({
      id: i,
      name: `لاعب ${i + 1}`,
      color: playerColors[i],
      countries: [],
      totalTroops: 0,
      eliminated: false
    }));
    setPlayers(newPlayers);
    setGamePhase('spin');
  };

  // عجلة الحظ لتحديد ترتيب اللعب
  const spinForTurnOrder = (result) => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    setTurnOrder(shuffledPlayers.map(p => p.id));
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
    
    // تهيئة الدول
    initializeCountries();
  };

  // تهيئة الدول
  const initializeCountries = () => {
    const initialCountries = {
      egypt: { owner: null, troops: 0, name: 'مصر', region: 'arab_world' },
      libya: { owner: null, troops: 0, name: 'ليبيا', region: 'arab_world' },
      france: { owner: null, troops: 0, name: 'فرنسا', region: 'world_tour' },
      germany: { owner: null, troops: 0, name: 'ألمانيا', region: 'world_tour' },
      brazil: { owner: null, troops: 0, name: 'البرازيل', region: 'world_tour' },
      usa: { owner: null, troops: 0, name: 'أمريكا', region: 'world_tour' },
      china: { owner: null, troops: 0, name: 'الصين', region: 'world_tour' },
      russia: { owner: null, troops: 0, name: 'روسيا', region: 'world_tour' },
      australia: { owner: null, troops: 0, name: 'أستراليا', region: 'world_tour' },
      india: { owner: null, troops: 0, name: 'الهند', region: 'world_tour' }
    };
    setCountries(initialCountries);
  };

  // اختيار دولة
  const selectCountry = (countryId) => {
    const country = countries[countryId];
    const currentPlayer = players[turnOrder[currentPlayerIndex]];
    
    if (!country.owner) {
      // احتلال دولة جديدة
      setSelectedCountry(countryId);
      showQuestion(countryId, 'occupy');
    } else if (country.owner === currentPlayer.id) {
      // تقوية دولة مملوكة
      setSelectedCountry(countryId);
      showQuestion(countryId, 'reinforce');
    } else if (isAdjacent(countryId, currentPlayer.countries)) {
      // مهاجمة دولة مجاورة
      setAttackMode(true);
      setAttackTo(countryId);
      showQuestion(countryId, 'attack');
    }
  };

  // عرض السؤال
  const showQuestion = (countryId, actionType) => {
    const countryData = countries[countryId];
    const randomQuestion = getRandomQuestion(countryData.region);
    setCurrentQuestion({
      ...randomQuestion,
      countryId,
      actionType
    });
  };

  // الحصول على سؤال عشوائي
  const getRandomQuestion = (region) => {
    const regionData = sampleTopics.find(topic => topic.id === region);
    if (regionData && regionData.questions) {
      const questions = regionData.questions;
      return questions[Math.floor(Math.random() * questions.length)];
    }
    // fallback إذا لم توجد أسئلة
    return {
      question: 'ما هي عاصمة هذه الدولة؟',
      answer: 'السؤال التجريبي',
      difficulty: 'easy',
      points: 200
    };
  };

  // الإجابة على السؤال
  const answerQuestion = (isCorrect, difficulty) => {
    const countryId = currentQuestion.countryId;
    const actionType = currentQuestion.actionType;
    const currentPlayer = players[turnOrder[currentPlayerIndex]];

    if (actionType === 'occupy') {
      if (isCorrect) {
        const troops = getTroopsForDifficulty(difficulty);
        occupyCountry(countryId, currentPlayer.id, troops);
      }
    } else if (actionType === 'attack') {
      if (isCorrect) {
        const troops = getTroopsForDifficulty(difficulty) + 15; // هدية الاحتلال
        occupyCountry(countryId, currentPlayer.id, troops);
      } else {
        // فقدان نصف الجيش
        reducePlayerTroops(currentPlayer.id, 0.5);
      }
    } else if (actionType === 'reinforce') {
      if (isCorrect) {
        const troops = getTroopsForDifficulty(difficulty);
        reinforceCountry(countryId, troops);
      } else {
        // فقدان 25% من الجيش
        reduceCountryTroops(countryId, 0.25);
      }
    }

    setCurrentQuestion(null);
    nextTurn();
  };

  // احتلال دولة
  const occupyCountry = (countryId, playerId, troops) => {
    setCountries(prev => ({
      ...prev,
      [countryId]: {
        ...prev[countryId],
        owner: playerId,
        troops: troops
      }
    }));

    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          countries: [...player.countries, countryId],
          totalTroops: player.totalTroops + troops
        };
      }
      return player;
    }));
  };

  // تقوية دولة
  const reinforceCountry = (countryId, troops) => {
    setCountries(prev => ({
      ...prev,
      [countryId]: {
        ...prev[countryId],
        troops: prev[countryId].troops + troops
      }
    }));
  };

  // تقليل قوات اللاعب
  const reducePlayerTroops = (playerId, percentage) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newTotalTroops = Math.floor(player.totalTroops * (1 - percentage));
        return {
          ...player,
          totalTroops: newTotalTroops
        };
      }
      return player;
    }));
  };

  // تقليل قوات دولة
  const reduceCountryTroops = (countryId, percentage) => {
    setCountries(prev => ({
      ...prev,
      [countryId]: {
        ...prev[countryId],
        troops: Math.floor(prev[countryId].troops * (1 - percentage))
      }
    }));
  };

  // الحصول على عدد الجنود حسب الصعوبة
  const getTroopsForDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 20;
      default: return 5;
    }
  };

  // التحقق من التجاور
  const isAdjacent = (countryId, playerCountries) => {
    const adjacencyMap = {
      egypt: ['libya', 'sudan', 'israel'],
      libya: ['egypt', 'tunisia', 'algeria', 'chad'],
      france: ['spain', 'germany', 'italy', 'switzerland'],
      germany: ['france', 'poland', 'czech'],
      usa: ['canada', 'mexico'],
      china: ['russia', 'india', 'mongolia'],
      russia: ['china', 'mongolia'],
      brazil: ['argentina', 'colombia'],
      australia: ['new_zealand'],
      india: ['china', 'pakistan']
    };
    
    return playerCountries.some(playerCountry => 
      adjacencyMap[playerCountry]?.includes(countryId)
    );
  };

  // الدور التالي
  const nextTurn = () => {
    const nextIndex = (currentPlayerIndex + 1) % turnOrder.length;
    setCurrentPlayerIndex(nextIndex);
    
    // التحقق من انتهاء اللعبة
    checkGameEnd();
  };

  // التحقق من انتهاء اللعبة
  const checkGameEnd = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length === 1) {
      setGamePhase('finished');
    }
  };

  const currentPlayer = gamePhase === 'playing' ? players[turnOrder[currentPlayerIndex]] : null;

  return (
    <div className="risk-game min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900">
      {gamePhase === 'setup' && (
        <PlayerSetup onSetupComplete={setupPlayers} />
      )}
      
      {gamePhase === 'spin' && (
        <SpinWheel players={players} onSpinComplete={spinForTurnOrder} />
      )}
      
      {gamePhase === 'playing' && (
        <>
          <GameUI 
            currentPlayer={currentPlayer}
            players={players}
            countries={countries}
          />
          <WorldMap 
            countries={countries}
            onCountryClick={selectCountry}
            currentPlayer={currentPlayer}
            attackMode={attackMode}
          />
        </>
      )}

      {currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          onAnswer={answerQuestion}
          onClose={() => setCurrentQuestion(null)}
        />
      )}
    </div>
  );
}