// components/RiskGame/RiskGame.jsx - النسخة الكاملة مع اختيار مستوى السؤال
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
  
  // 🆕 حالة اختيار مستوى السؤال
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // {type: 'occupy'|'reinforce'|'attack', data: {...}}

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

  // خريطة الدول المجاورة
  const adjacentCountries = {
    egypt: ['libya', 'algeria'],
    libya: ['egypt', 'algeria', 'france'],
    algeria: ['egypt', 'libya', 'france', 'spain'],
    france: ['libya', 'algeria', 'spain', 'germany', 'united_kingdom'],
    germany: ['france', 'poland', 'ukraine'],
    spain: ['algeria', 'france'],
    italy: ['france', 'germany'],
    united_kingdom: ['france'],
    poland: ['germany', 'ukraine', 'russia'],
    ukraine: ['germany', 'poland', 'russia', 'turkey'],
    turkey: ['ukraine', 'iran', 'saudi_arabia'],
    iran: ['turkey', 'pakistan', 'saudi_arabia'],
    saudi_arabia: ['turkey', 'iran', 'pakistan'],
    pakistan: ['iran', 'saudi_arabia', 'india', 'china'],
    india: ['pakistan', 'china', 'thailand'],
    china: ['pakistan', 'india', 'thailand', 'mongolia', 'russia'],
    mongolia: ['china', 'russia'],
    russia: ['poland', 'ukraine', 'mongolia', 'china', 'kazakhstan'],
    kazakhstan: ['russia'],
    thailand: ['india', 'china', 'vietnam', 'indonesia'],
    vietnam: ['thailand', 'china'],
    indonesia: ['thailand', 'australia'],
    australia: ['indonesia'],
    brazil: ['argentina', 'usa'],
    argentina: ['brazil'],
    usa: ['brazil', 'canada', 'mexico'],
    canada: ['usa'],
    mexico: ['usa'],
    south_africa: ['nigeria'],
    nigeria: ['south_africa'],
    japan: ['china', 'south_korea'],
    south_korea: ['japan', 'china']
  };

  // 🆕 مكون اختيار مستوى السؤال
  const DifficultySelectionModal = () => {
    if (!showDifficultyModal || !pendingAction) return null;

    const handleDifficultySelect = (difficulty) => {
      setShowDifficultyModal(false);
      
      // تنفيذ الإجراء المؤجل مع المستوى المختار
      if (pendingAction.type === 'occupy') {
        executeOccupyCountry(pendingAction.data.countryId, pendingAction.data.player, difficulty);
      } else if (pendingAction.type === 'reinforce') {
        executeReinforceCountry(pendingAction.data.countryId, difficulty);
      } else if (pendingAction.type === 'attack') {
        executeAttackCountry(pendingAction.data.targetCountryId, pendingAction.data.attackingCountryId, difficulty);
      }
      
      setPendingAction(null);
    };

    const difficulties = [
      { 
        key: 'easy', 
        name: 'سهل', 
        troops: 5, 
        color: 'from-green-500 to-emerald-500', 
        description: 'فرصة نجاح عالية - مخاطرة منخفضة' 
      },
      { 
        key: 'medium', 
        name: 'متوسط', 
        troops: 10, 
        color: 'from-yellow-500 to-orange-500', 
        description: 'فرصة نجاح متوسطة - مخاطرة متوازنة' 
      },
      { 
        key: 'hard', 
        name: 'صعب', 
        troops: 20, 
        color: 'from-red-500 to-pink-500', 
        description: 'فرصة نجاح منخفضة - مخاطرة عالية' 
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-600">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
             اختر مستوى السؤال
          </h2>
          
          <div className="space-y-4">
            {difficulties.map(diff => (
              <button
                key={diff.key}
                onClick={() => handleDifficultySelect(diff.key)}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${diff.color} hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="text-white">
                  <div className="text-xl font-bold">{diff.name}</div>
                  {/* <div className="text-sm opacity-90 mb-1">{diff.description}</div> */}
                  <div className="text-lg font-bold">  {diff.troops} جندي</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowDifficultyModal(false);
              setPendingAction(null);
              setActionType(null);
              setSelectedCountry(null);
              setTargetCountry(null);
            }}
            className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-colors"
          >
            ❌ إلغاء
          </button>
        </div>
      </div>
    );
  };

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
    
    // تنظيف حالة سابقة
    setCurrentPlayerIndex(0);
    setTurnOrder([]);
    setCountries({});
    setCurrentQuestion(null);
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
  };

  // عجلة الحظ لتحديد ترتيب اللعب
  const spinForTurnOrder = (result) => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const newTurnOrder = shuffledPlayers.map(p => p.id);
    
    setTurnOrder(newTurnOrder);
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
    
    console.log('🎮 ترتيب اللعب الجديد:', newTurnOrder);
    console.log('🎮 أول لاعب (Index 0):', shuffledPlayers[0].name, 'ID:', shuffledPlayers[0].id);
    
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
    console.log('🌍 تم تهيئة الدول:', Object.keys(initialCountries).length, 'دولة');
  };

  // الحصول على اللاعب الحالي
  const getCurrentPlayer = () => {
    if (turnOrder.length === 0) {
      console.log('❌ turnOrder فارغ');
      return null;
    }
    
    if (currentPlayerIndex < 0 || currentPlayerIndex >= turnOrder.length) {
      console.log(`❌ currentPlayerIndex غير صحيح: ${currentPlayerIndex}, طول turnOrder: ${turnOrder.length}`);
      return null;
    }
    
    const playerId = turnOrder[currentPlayerIndex];
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      console.log(`❌ لم يتم العثور على اللاعب بـ ID: ${playerId}`);
      return null;
    }
    
    if (player.eliminated) {
      console.log(`⚠️ اللاعب ${player.name} مقصى، الانتقال للتالي`);
      nextTurn();
      return null;
    }
    
    console.log(`✅ اللاعب الحالي: ${player.name} (ID: ${player.id}, Index: ${currentPlayerIndex})`);
    return player;
  };

  const currentPlayer = getCurrentPlayer();

  // 🔥 فحص فوري للإقصاء
  const checkImmediateElimination = () => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      let eliminatedThisTurn = [];
      
      newPlayers.forEach(player => {
        if (!player.eliminated) {
          const playerCountries = Object.values(countries).filter(c => c.owner === player.id);
          
          if (playerCountries.length === 0) {
            player.eliminated = true;
            player.isActive = false;
            eliminatedThisTurn.push(player.name);
            console.log(`❌ تم إقصاء ${player.name} - لا يملك أي دولة!`);
          }
          else if (player.totalTroops < 3) {
            player.eliminated = true;
            player.isActive = false;
            eliminatedThisTurn.push(player.name);
            console.log(`❌ تم إقصاء ${player.name} - جيش ضعيف جداً!`);
            
            // تحرير دوله وجعلها محايدة ضعيفة
            playerCountries.forEach(country => {
              const countryId = Object.keys(countries).find(id => countries[id] === country);
              if (countryId) {
                setCountries(prev => ({
                  ...prev,
                  [countryId]: { ...prev[countryId], owner: null, troops: 1 }
                }));
              }
            });
          }
        }
      });
      
      if (eliminatedThisTurn.length > 0) {
        const activePlayers = newPlayers.filter(p => !p.eliminated);
        const newTurnOrder = activePlayers.map(p => p.id);
        setTurnOrder(newTurnOrder);
        
        if (newTurnOrder.length > 0) {
          const newIndex = Math.min(currentPlayerIndex, newTurnOrder.length - 1);
          setCurrentPlayerIndex(newIndex);
        }
        
        alert(`🔥 تم إقصاء: ${eliminatedThisTurn.join(', ')}!`);
      }
      
      return newPlayers;
    });
  };

  // اختيار دولة
  const selectCountry = (countryId) => {
    const country = countries[countryId];
    if (!country) {
      console.log('❌ دولة غير معروفة:', countryId);
      return;
    }

    if (!currentPlayer) {
      console.log('❌ لا يوجد لاعب حالي');
      return;
    }

    console.log(`🎯 اللاعب ${currentPlayer.name} (ID: ${currentPlayer.id}) نقر على ${country.name} (مالك حالي: ${country.owner})`);
    
    if (country.owner === null) {
      // دولة فارغة - احتلال
      occupyCountry(countryId, currentPlayer);
    } else if (country.owner === currentPlayer.id) {
      // دولة مملوكة - تقوية
      reinforceCountry(countryId);
    } else {
      // دولة للعدو - هجوم
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

  // 🆕 احتلال دولة فارغة - عرض اختيار المستوى
  const occupyCountry = (countryId, player) => {
    setActionType('occupy');
    setSelectedCountry(countryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'occupy',
      data: { countryId, player }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ احتلال الدولة بالمستوى المختار
  const executeOccupyCountry = (countryId, player, difficulty) => {
    console.log(`🏴 ${player.name} (ID: ${player.id}) يحاول احتلال ${countries[countryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, (selectedDifficulty) => {
      const troopsGained = getTroopsForDifficulty(selectedDifficulty);
      
      console.log(`✅ نجح في الاحتلال! اللاعب ${player.id} سيملك ${countryId} بـ ${troopsGained} جندي`);
      
      // تحديث الدول
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId] = {
          ...newCountries[countryId],
          owner: player.id,
          troops: troopsGained
        };
        
        console.log(`🌍 تحديث الدولة ${countryId}: مالك = ${player.id}, جنود = ${troopsGained}`);
        
        return newCountries;
      });
      
      // تحديث قائمة دول اللاعب
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === player.id);
        
        if (playerIndex !== -1) {
          if (!newPlayers[playerIndex].countries.includes(countryId)) {
            newPlayers[playerIndex].countries.push(countryId);
          }
          newPlayers[playerIndex].totalTroops += troopsGained;
          
          console.log(`👤 تحديث اللاعب ${player.name}: دول = ${newPlayers[playerIndex].countries.length}`);
        }
        
        return newPlayers;
      });
      
      // alert(`✅ تم احتلال ${countries[countryId].name} بـ ${troopsGained} جندي!`);
      
      setTimeout(() => {
        nextTurn();
      }, 1000);
      
    }, () => {
      // alert('❌ فشل في احتلال الدولة!');
      setTimeout(() => {
        nextTurn();
      }, 1000);
    });
  };

  // 🆕 تقوية دولة - عرض اختيار المستوى
  const reinforceCountry = (countryId) => {
    setActionType('reinforce');
    setSelectedCountry(countryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'reinforce',
      data: { countryId }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ تقوية الدولة بالمستوى المختار
  const executeReinforceCountry = (countryId, difficulty) => {
    console.log(`💪 ${currentPlayer.name} يحاول تقوية ${countries[countryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, (selectedDifficulty) => {
      const troopsGained = getTroopsForDifficulty(selectedDifficulty);
      
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId] = {
          ...newCountries[countryId],
          troops: newCountries[countryId].troops + troopsGained
        };
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
      
      alert(`💪 تمت تقوية ${countries[countryId].name} بـ ${troopsGained} جندي إضافي!`);
      setTimeout(() => {
        nextTurn();
      }, 1000);
    }, () => {
      // فشلت التقوية - خسارة 50%
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[countryId].troops;
        const troopsLost = Math.floor(currentTroops * 0.5);
        const newTroops = Math.max(1, currentTroops - troopsLost);
        newCountries[countryId].troops = newTroops;
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(countries[countryId].troops * 0.5);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`💔 خسرت 50% من جيش ${countries[countryId].name}`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
    });
  };

  // 🆕 مهاجمة دولة - عرض اختيار المستوى
  const attackCountry = (targetCountryId) => {
    const attackingCountryId = Object.keys(countries).find(id => 
      countries[id].owner === currentPlayer.id && 
      adjacentCountries[id]?.includes(targetCountryId)
    );
    
    if (!attackingCountryId) {
      alert('لا يوجد دولة مجاورة للهجوم منها!');
      return;
    }
    
    // التأكد أن لديه جنود كافية للهجوم
    if (countries[attackingCountryId].troops < 2) {
      alert('تحتاج على الأقل جنديين للهجوم!');
      return;
    }
    
    setActionType('attack');
    setSelectedCountry(attackingCountryId);
    setTargetCountry(targetCountryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'attack',
      data: { targetCountryId, attackingCountryId }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ الهجوم بالمستوى المختار
  const executeAttackCountry = (targetCountryId, attackingCountryId, difficulty) => {
    console.log(`⚔️ ${currentPlayer.name} يهاجم ${countries[targetCountryId].name} من ${countries[attackingCountryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, () => {
      const previousOwner = countries[targetCountryId].owner;
      
      console.log(`✅ نجح الهجوم! اللاعب ${currentPlayer.id} سيأخذ ${targetCountryId} من اللاعب ${previousOwner}`);
      
      // تحديث الدول
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[targetCountryId] = {
          ...newCountries[targetCountryId],
          owner: currentPlayer.id,
          troops: 15
        };
        return newCountries;
      });
      
      // تحديث قائمة اللاعبين
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        // إزالة الدولة من اللاعب السابق
        if (previousOwner !== null) {
          const prevOwnerIndex = newPlayers.findIndex(p => p.id === previousOwner);
          if (prevOwnerIndex !== -1) {
            newPlayers[prevOwnerIndex].countries = newPlayers[prevOwnerIndex].countries.filter(c => c !== targetCountryId);
            newPlayers[prevOwnerIndex].totalTroops -= countries[targetCountryId].troops;
          }
        }
        
        // إضافة الدولة للاعب الحالي
        const currentPlayerIndexInPlayers = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (currentPlayerIndexInPlayers !== -1) {
          if (!newPlayers[currentPlayerIndexInPlayers].countries.includes(targetCountryId)) {
            newPlayers[currentPlayerIndexInPlayers].countries.push(targetCountryId);
          }
          newPlayers[currentPlayerIndexInPlayers].totalTroops += 15;
        }
        
        return newPlayers;
      });
      
      alert(`⚔️ تم احتلال ${countries[targetCountryId].name} بنجاح!`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
      
    }, () => {
      // فشل الهجوم - خسارة 75%
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[attackingCountryId].troops;
        
        const troopsLost = Math.floor(currentTroops * 0.75);
        const newTroops = Math.max(1, currentTroops - troopsLost);
        newCountries[attackingCountryId].troops = newTroops;
        
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(countries[attackingCountryId].troops * 0.75);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`💔 فشل الهجوم! خسرت 75% من جيش ${countries[attackingCountryId].name}`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
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

  // 🆕 إظهار سؤال من أسئلة Risk مع مستوى محدد
  const showRiskQuestion = (difficulty, onSuccess, onFailure) => {
    const question = getRandomRiskQuestion();
    
    if (!question) {
      setCurrentQuestion({
        id: 'default',
        question: 'ما هي عاصمة فرنسا؟',
        answer: 'باريس',
        difficulty: difficulty,
        points: getTroopsForDifficulty(difficulty),
        onSuccess: () => onSuccess(difficulty),
        onFailure: onFailure
      });
      return;
    }
    
    setCurrentQuestion({
      ...question,
      difficulty: difficulty, // فرض المستوى المختار
      points: getTroopsForDifficulty(difficulty),
      onSuccess: () => onSuccess(difficulty),
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
    console.log('🔄 محاولة الانتقال للدور التالي...');
    
    if (checkGameEnd()) {
      console.log('🏆 اللعبة انتهت!');
      return;
    }
    
    if (turnOrder.length === 0) {
      console.log('❌ turnOrder فارغ، لا يمكن الانتقال');
      return;
    }
    
    const nextIndex = (currentPlayerIndex + 1) % turnOrder.length;
    const nextPlayerId = turnOrder[nextIndex];
    const nextPlayer = players.find(p => p.id === nextPlayerId);
    
    console.log(`🎮 الانتقال من اللاعب ${currentPlayerIndex} إلى ${nextIndex}`);
    console.log(`🎮 اللاعب التالي: ${nextPlayer?.name} (ID: ${nextPlayerId})`);
    
    if (nextPlayer && !nextPlayer.eliminated) {
      setCurrentPlayerIndex(nextIndex);
      console.log(`✅ تم الانتقال بنجاح إلى ${nextPlayer.name}`);
    } else {
      console.log(`⚠️ اللاعب التالي مقصى، البحث عن لاعب آخر...`);
      const activePlayers = players.filter(p => !p.eliminated);
      if (activePlayers.length > 0) {
        const firstActivePlayer = activePlayers[0];
        const newIndex = turnOrder.findIndex(id => id === firstActivePlayer.id);
        setCurrentPlayerIndex(newIndex);
        console.log(`✅ تم الانتقال إلى أول لاعب نشط: ${firstActivePlayer.name}`);
      }
    }
    
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    
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
          console.log(`❌ تم إقصاء اللاعب ${player.name}`);
        }
      });
      
      if (eliminatedCount > 0) {
        const activePlayers = newPlayers.filter(p => !p.eliminated);
        const newTurnOrder = activePlayers.map(p => p.id);
        
        setTurnOrder(newTurnOrder);
        
        if (newTurnOrder.length > 0) {
          setCurrentPlayerIndex(0);
        }
        
        alert(`تم إقصاء ${eliminatedCount} لاعب لعدم احتلالهم أي دولة!`);
      }
      
      return newPlayers;
    });
  };

  // فحص انتهاء اللعبة
  const checkGameEnd = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    
    if (activePlayers.length <= 1) {
      setGamePhase('finished');
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        const winnerCountries = Object.values(countries).filter(c => c.owner === winner.id);
        alert(`🎉 ${winner.name} فاز باللعبة! 
السيطرة: ${winnerCountries.length} دولة
القوة: ${winner.totalTroops} جندي`);
      } else {
        alert('🔥 لم يبق أي لاعب! نهاية مأساوية للعالم!');
      }
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
    setShowDifficultyModal(false);
    setPendingAction(null);
    console.log('🔄 تم إعادة تشغيل اللعبة');
  };

  // تصحيح الأدوار يدوياً (للطوارئ)
  const manualNextTurn = () => {
    console.log('🛠️ انتقال يدوي للدور التالي');
    const nextIndex = (currentPlayerIndex + 1) % Math.max(turnOrder.length, 1);
    setCurrentPlayerIndex(nextIndex);
    
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    
    console.log(`🎮 تم الانتقال يدوياً إلى فهرس ${nextIndex}`);
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
          
          {/* زر الانتقال اليدوي للطوارئ */}
          {/* <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={manualNextTurn}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
            >
              انتقال يدوي
            </button>
          </div> */}
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
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
            >
              لعبة جديدة
            </button>
          </div>
        </div>
      )}

      {/* نافذة السؤال */}
      {currentQuestion && (
        <QuestionModal 
          question={currentQuestion}
          onAnswer={answerQuestion}
        />
      )}

      {/* 🆕 نافذة اختيار مستوى السؤال */}
      <DifficultySelectionModal />
    </div>
  );
}