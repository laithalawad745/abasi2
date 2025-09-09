// components/RiskGame/RiskGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { getRandomRiskQuestion } from '../../app/data/riskGameData';

// Import components
import PlayerSetup from './PlayerSetup';
import SpinWheel from './SpinWheel';
import WorldMapD3 from './WorldMapD3';
import GameUI from './GameUI';
import QuestionModal from './QuestionModal';

export default function RiskGame() {
  // حالة اللعبة الأساسية
  const [gamePhase, setGamePhase] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([]);
  const [round, setRound] = useState(1);
  
  // حالة الخريطة والدول
  const [countries, setCountries] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // حالة العمليات
  const [actionType, setActionType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [targetCountry, setTargetCountry] = useState(null);

  // ألوان اللاعبين (ثابتة ومتطابقة مع WorldMapD3)
  const playerColors = [
    '#ff4444', // أحمر - لاعب 0
    '#4444ff', // أزرق - لاعب 1  
    '#44ff44', // أخضر - لاعب 2
    '#ffff44', // أصفر - لاعب 3
    '#ff44ff', // بنفسجي - لاعب 4
    '#44ffff', // سماوي - لاعب 5
    '#ff8844', // برتقالي - لاعب 6
    '#8844ff'  // بنفسجي غامق - لاعب 7
  ];

  // إعداد اللاعبين
  const setupPlayers = (playerCount) => {
    const newPlayers = Array(playerCount).fill(null).map((_, i) => ({
      id: i,
      name: `لاعب ${i + 1}`,
      color: playerColors[i],
      countries: [],
      totalTroops: 0,
      eliminated: false,
      isActive: true
    }));
    setPlayers(newPlayers);
    setGamePhase('spin');
  };

  // عجلة الحظ لتحديد ترتيب اللعب
  const spinForTurnOrder = (result) => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const newTurnOrder = shuffledPlayers.map(p => p.id);
    setTurnOrder(newTurnOrder);
    setCurrentPlayerIndex(0); // البداية من الفهرس 0
    setGamePhase('playing');
    
    console.log('ترتيب اللعب:', newTurnOrder);
    console.log('اللاعب الحالي:', newTurnOrder[0]);
    
    // تهيئة الدول
    initializeCountries();
  };

  // تهيئة الدول
  const initializeCountries = () => {
    const initialCountries = {
      egypt: { owner: null, troops: 0, name: 'مصر' },
      libya: { owner: null, troops: 0, name: 'ليبيا' },
      algeria: { owner: null, troops: 0, name: 'الجزائر' },
      france: { owner: null, troops: 0, name: 'فرنسا' },
      germany: { owner: null, troops: 0, name: 'ألمانيا' },
      brazil: { owner: null, troops: 0, name: 'البرازيل' },
      usa: { owner: null, troops: 0, name: 'أمريكا' },
      china: { owner: null, troops: 0, name: 'الصين' },
      russia: { owner: null, troops: 0, name: 'روسيا' },
      australia: { owner: null, troops: 0, name: 'أستراليا' },
      india: { owner: null, troops: 0, name: 'الهند' },
      united_kingdom: { owner: null, troops: 0, name: 'المملكة المتحدة' },
      spain: { owner: null, troops: 0, name: 'إسبانيا' },
      italy: { owner: null, troops: 0, name: 'إيطاليا' },
      canada: { owner: null, troops: 0, name: 'كندا' },
      mexico: { owner: null, troops: 0, name: 'المكسيك' },
      argentina: { owner: null, troops: 0, name: 'الأرجنتين' },
      south_africa: { owner: null, troops: 0, name: 'جنوب أفريقيا' },
      nigeria: { owner: null, troops: 0, name: 'نيجيريا' },
      japan: { owner: null, troops: 0, name: 'اليابان' },
      south_korea: { owner: null, troops: 0, name: 'كوريا الجنوبية' },
      indonesia: { owner: null, troops: 0, name: 'إندونيسيا' },
      turkey: { owner: null, troops: 0, name: 'تركيا' },
      iran: { owner: null, troops: 0, name: 'إيران' },
      saudi_arabia: { owner: null, troops: 0, name: 'السعودية' },
      pakistan: { owner: null, troops: 0, name: 'باكستان' },
      poland: { owner: null, troops: 0, name: 'بولندا' },
      ukraine: { owner: null, troops: 0, name: 'أوكرانيا' },
      kazakhstan: { owner: null, troops: 0, name: 'كازاخستان' },
      mongolia: { owner: null, troops: 0, name: 'منغوليا' },
      thailand: { owner: null, troops: 0, name: 'تايلاند' },
      vietnam: { owner: null, troops: 0, name: 'فيتنام' }
    };
    setCountries(initialCountries);
  };

  // الدول المجاورة
  const adjacentCountries = {
    egypt: ['libya', 'sudan', 'israel'],
    libya: ['egypt', 'algeria', 'tunisia', 'chad'],
    algeria: ['libya', 'morocco', 'tunisia', 'mali'],
    france: ['spain', 'italy', 'germany', 'united_kingdom'],
    germany: ['france', 'poland', 'austria', 'netherlands'],
    usa: ['canada', 'mexico'],
    canada: ['usa', 'greenland'],
    mexico: ['usa', 'guatemala'],
    brazil: ['argentina', 'colombia', 'peru'],
    china: ['russia', 'mongolia', 'india', 'kazakhstan'],
    russia: ['china', 'mongolia', 'kazakhstan', 'ukraine'],
    india: ['china', 'pakistan', 'myanmar'],
    turkey: ['iran', 'iraq', 'syria'],
    iran: ['turkey', 'iraq', 'afghanistan'],
    saudi_arabia: ['iraq', 'jordan', 'yemen'],
  };

  // الحصول على اللاعب الحالي
  const getCurrentPlayer = () => {
    if (turnOrder.length === 0 || currentPlayerIndex >= turnOrder.length) {
      return null;
    }
    const playerId = turnOrder[currentPlayerIndex];
    return players.find(p => p.id === playerId);
  };

  const currentPlayer = getCurrentPlayer();

  // اختيار دولة
  const selectCountry = (countryId) => {
    const country = countries[countryId];
    if (!country) {
      console.log('دولة غير معروفة:', countryId);
      return;
    }

    if (!currentPlayer) {
      console.log('لا يوجد لاعب حالي');
      return;
    }

    console.log(`اللاعب الحالي: ${currentPlayer.name} (ID: ${currentPlayer.id})`);
    console.log(`دولة مختارة: ${country.name} (مالك: ${country.owner})`);
    
    if (country.owner === null) {
      // دولة فارغة - احتلال
      occupyCountry(countryId, currentPlayer);
    } else if (country.owner === currentPlayer.id) {
      // دولة مملوكة - تقوية
      reinforceCountry(countryId);
    } else {
      // دولة للعدو - هجوم (فقط إذا كانت مجاورة)
      const playerCountries = Object.keys(countries).filter(id => 
        countries[id].owner === currentPlayer.id
      );
      
      const canAttack = playerCountries.some(playerCountryId => 
        adjacentCountries[playerCountryId]?.includes(countryId)
      );
      
      if (canAttack) {
        attackCountry(countryId);
      } else {
        alert('يمكنك فقط مهاجمة الدول المجاورة لدولك!');
      }
    }
  };

  // احتلال دولة فارغة
  const occupyCountry = (countryId, player) => {
    setActionType('occupy');
    setSelectedCountry(countryId);
    
    console.log(`${player.name} يحاول احتلال ${countries[countryId].name}`);
    
    // اختيار سؤال عشوائي من أسئلة Risk
    showRiskQuestion((difficulty) => {
      const troopsGained = getTroopsForDifficulty(difficulty);
      
      // تحديث الدول مع التأكد من عدم إزالة ملكية الدول الأخرى
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId] = {
          ...newCountries[countryId],
          owner: player.id,
          troops: troopsGained
        };
        console.log(`تم احتلال ${countryId} بواسطة اللاعب ${player.id}`);
        return newCountries;
      });
      
      // تحديث قائمة دول اللاعب
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          newPlayers[playerIndex].countries.push(countryId);
          newPlayers[playerIndex].totalTroops += troopsGained;
        }
        return newPlayers;
      });
      
      alert(`تم احتلال ${countries[countryId].name} بـ ${troopsGained} جندي!`);
      nextTurn();
    }, () => {
      alert('فشل في احتلال الدولة!');
      nextTurn();
    });
  };

  // مهاجمة دولة
  const attackCountry = (targetCountryId) => {
    // العثور على الدولة المهاجمة
    const attackingCountryId = Object.keys(countries).find(id => 
      countries[id].owner === currentPlayer.id && 
      adjacentCountries[id]?.includes(targetCountryId)
    );
    
    if (!attackingCountryId) {
      alert('لا يوجد دولة مجاورة للهجوم منها!');
      return;
    }
    
    setActionType('attack');
    setSelectedCountry(attackingCountryId);
    setTargetCountry(targetCountryId);
    
    console.log(`${currentPlayer.name} يهاجم ${countries[targetCountryId].name} من ${countries[attackingCountryId].name}`);
    
    showRiskQuestion(() => {
      // نجح الهجوم
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        
        // إضافة الدولة للاعب الحالي مع 15 جندي إضافي
        newCountries[targetCountryId] = {
          ...newCountries[targetCountryId],
          owner: currentPlayer.id,
          troops: 15
        };
        
        console.log(`تم احتلال ${targetCountryId} بواسطة اللاعب ${currentPlayer.id}`);
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        // إزالة الدولة من اللاعب السابق
        const previousOwner = countries[targetCountryId].owner;
        if (previousOwner !== null) {
          const prevOwnerIndex = newPlayers.findIndex(p => p.id === previousOwner);
          if (prevOwnerIndex !== -1) {
            newPlayers[prevOwnerIndex].countries = newPlayers[prevOwnerIndex].countries.filter(c => c !== targetCountryId);
            newPlayers[prevOwnerIndex].totalTroops -= countries[targetCountryId].troops;
          }
        }
        
        // إضافة الدولة للاعب الحالي
        const currentPlayerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (currentPlayerIndex !== -1) {
          newPlayers[currentPlayerIndex].countries.push(targetCountryId);
          newPlayers[currentPlayerIndex].totalTroops += 15;
        }
        
        return newPlayers;
      });
      
      alert(`تم احتلال ${countries[targetCountryId].name} بنجاح! +15 جندي`);
      nextTurn();
    }, () => {
      // فشل الهجوم - خسارة نصف الجيش
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[attackingCountryId].troops;
        const newTroops = Math.floor(currentTroops / 2);
        newCountries[attackingCountryId].troops = newTroops;
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = countries[attackingCountryId].troops - Math.floor(countries[attackingCountryId].troops / 2);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`فشل الهجوم! خسرت نصف جيشك في ${countries[attackingCountryId].name}`);
      nextTurn();
    });
  };

  // تقوية دولة
  const reinforceCountry = (countryId) => {
    setActionType('reinforce');
    setSelectedCountry(countryId);
    
    console.log(`${currentPlayer.name} يقوي ${countries[countryId].name}`);
    
    showRiskQuestion((difficulty) => {
      // نجحت التقوية
      const troopsGained = getTroopsForDifficulty(difficulty);
      
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId].troops += troopsGained;
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          newPlayers[playerIndex].totalTroops += troopsGained;
        }
        return newPlayers;
      });
      
      alert(`تم تقوية ${countries[countryId].name} بـ ${troopsGained} جندي!`);
      nextTurn();
    }, () => {
      // فشلت التقوية - خسارة 25%
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[countryId].troops;
        const troopsLost = Math.floor(currentTroops * 0.25);
        const newTroops = currentTroops - troopsLost;
        newCountries[countryId].troops = Math.max(1, newTroops);
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(countries[countryId].troops * 0.25);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`فشلت التقوية! خسرت 25% من جيش ${countries[countryId].name}`);
      nextTurn();
    });
  };

  // الحصول على عدد الجنود حسب صعوبة السؤال
  const getTroopsForDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 20;
      default: return 5;
    }
  };

  // إظهار سؤال من أسئلة Risk
  const showRiskQuestion = (onSuccess, onFailure) => {
    const question = getRandomRiskQuestion();
    
    if (!question) {
      setCurrentQuestion({
        id: 'default',
        question: 'ما هي عاصمة فرنسا؟',
        answer: 'باريس',
        difficulty: 'easy',
        points: 5,
        onSuccess: () => onSuccess('easy'),
        onFailure: onFailure
      });
      return;
    }
    
    setCurrentQuestion({
      ...question,
      onSuccess: () => onSuccess(question.difficulty),
      onFailure: onFailure
    });
  };

  // الإجابة على السؤال
  const answerQuestion = (isCorrect) => {
    if (isCorrect && currentQuestion.onSuccess) {
      currentQuestion.onSuccess();
    } else if (!isCorrect && currentQuestion.onFailure) {
      currentQuestion.onFailure();
    }
    setCurrentQuestion(null);
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
  };

  // الدور التالي
  const nextTurn = () => {
    // فحص انتهاء اللعبة
    if (checkGameEnd()) return;
    
    // الانتقال للاعب التالي
    const nextIndex = (currentPlayerIndex + 1) % turnOrder.length;
    setCurrentPlayerIndex(nextIndex);
    
    const nextPlayer = players.find(p => p.id === turnOrder[nextIndex]);
    console.log(`الدور التالي: ${nextPlayer?.name} (Index: ${nextIndex}, ID: ${turnOrder[nextIndex]})`);
    
    // فحص إذا انتهت الجولة الأولى (كل الدول محتلة)
    const allCountriesOccupied = Object.values(countries).every(country => country.owner !== null);
    if (allCountriesOccupied && gamePhase === 'playing') {
      setGamePhase('elimination');
      eliminatePlayersWithoutCountries();
    }
  };

  // إقصاء اللاعبين بدون دول
  const eliminatePlayersWithoutCountries = () => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      let eliminatedCount = 0;
      
      newPlayers.forEach(player => {
        if (player.countries.length === 0 && !player.eliminated) {
          player.eliminated = true;
          player.isActive = false;
          eliminatedCount++;
        }
      });
      
      if (eliminatedCount > 0) {
        const activePlayers = newPlayers.filter(p => !p.eliminated);
        const newTurnOrder = activePlayers.map(p => p.id);
        setTurnOrder(newTurnOrder);
        setCurrentPlayerIndex(0);
        
        alert(`تم إقصاء ${eliminatedCount} لاعب لعدم احتلالهم أي دولة!`);
      }
      
      return newPlayers;
    });
  };

  // فحص انتهاء اللعبة
  const checkGameEnd = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    
    if (activePlayers.length === 1) {
      setGamePhase('finished');
      alert(`🎉 تهانينا! ${activePlayers[0].name} احتل العالم وفاز باللعبة! 🏆`);
      return true;
    }
    
    return false;
  };

  // إعادة تشغيل اللعبة
  const restartGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setTurnOrder([]);
    setCountries({});
    setCurrentQuestion(null);
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    setRound(1);
  };

  return (
    <div className="risk-game min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900">
      {gamePhase === 'setup' && (
        <PlayerSetup onSetupComplete={setupPlayers} />
      )}
      
      {gamePhase === 'spin' && (
        <SpinWheel players={players} onSpinComplete={spinForTurnOrder} />
      )}
      
      {(gamePhase === 'playing' || gamePhase === 'elimination') && (
        <>
          <GameUI 
            currentPlayer={currentPlayer}
            players={players}
            countries={countries}
            gamePhase={gamePhase}
            round={round}
            onEndTurn={nextTurn}
            onRestart={restartGame}
          />
          <WorldMapD3 
            countries={countries}
            onCountryClick={selectCountry}
            currentPlayer={currentPlayer}
            actionType={actionType}
          />
        </>
      )}

      {gamePhase === 'finished' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-center shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">🏆 انتهت اللعبة! 🏆</h1>
            <p className="text-xl text-white mb-6">
              {players.find(p => !p.eliminated)?.name} احتل العالم!
            </p>
            <button
              onClick={restartGame}
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
            >
              لعبة جديدة
            </button>
          </div>
        </div>
      )}

      {currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          onAnswer={answerQuestion}
          onClose={() => setCurrentQuestion(null)}
          actionType={actionType}
          selectedCountry={selectedCountry ? countries[selectedCountry]?.name : ''}
          targetCountry={targetCountry ? countries[targetCountry]?.name : ''}
        />
      )}
    </div>
  );
}