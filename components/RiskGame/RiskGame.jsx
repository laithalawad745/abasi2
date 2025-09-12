// components/RiskGame/RiskGame.jsx - النسخة الكاملة مع منطق الهجوم المحسن
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

  // الحصول على اللاعب الحالي (مُصلح نهائياً)
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
      // 🔥 إزالة استدعاء nextTurn() من هنا لتجنب الحلقة اللانهائية
      return null;
    }
    
    // console.log(`✅ اللاعب الحالي: ${player.name} (ID: ${player.id}, Index: ${currentPlayerIndex})`);
    return player;
  };

  const currentPlayer = getCurrentPlayer();

  // 🔥 تتبع شامل لكل تغيير في countries state
  useEffect(() => {
    console.log('🔍 COUNTRIES STATE CHANGED:', countries);
    
    // تتبع مفصل للدول المهمة
    if (countries.libya) {
      console.log(`🔍 ليبيا: مالك=${countries.libya.owner}, جنود=${countries.libya.troops}`);
    }
    if (countries.egypt) {
      console.log(`🔍 مصر: مالك=${countries.egypt.owner}, جنود=${countries.egypt.troops}`);
    }
  }, [countries]);

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
      
      setTimeout(() => {
        nextTurn();
      }, 1000);
      
    }, () => {
      alert('❌ فشل في احتلال الدولة!');
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

  // 🆕 مهاجمة دولة - مع منطق القوة المحسن (قانون القوة البسيط)
  const attackCountry = (targetCountryId) => {
    const attackingCountryId = Object.keys(countries).find(id => 
      countries[id].owner === currentPlayer.id && 
      adjacentCountries[id]?.includes(targetCountryId)
    );
    
    if (!attackingCountryId) {
      alert('لا يوجد دولة مجاورة للهجوم منها!');
      return;
    }
    
    // التأكد أن لديه جنود كافية للهجوم (الحد الأدنى)
    if (countries[attackingCountryId].troops < 2) {
      alert('تحتاج على الأقل جنديين للهجوم!');
      return;
    }

    // 🆕 🎯 المقارنة العسكرية - المهاجم يجب أن يكون أقوى أو مساوي للمدافع
    const attackingTroops = countries[attackingCountryId].troops;
    const defendingTroops = countries[targetCountryId].troops;

    if (attackingTroops < defendingTroops) {
      alert(`❌ لا يمكنك مهاجمة دولة أقوى منك!
    
قوتك في ${countries[attackingCountryId].name}: ${attackingTroops} جندي
قوة العدو في ${countries[targetCountryId].name}: ${defendingTroops} جندي

💡 قم بتقوية جيشك أولاً قبل الهجوم!`);
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

  // 🆕 تنفيذ الهجوم بالمستوى المختار - مع التحسينات (مُحسّن لإصلاح مشكلة الألوان)
  const executeAttackCountry = (targetCountryId, attackingCountryId, difficulty) => {
    const attackingTroops = countries[attackingCountryId].troops;
    const defendingTroops = countries[targetCountryId].troops;
    const powerRatio = (attackingTroops / defendingTroops).toFixed(1);
    
    console.log(`⚔️ ${currentPlayer.name} يهاجم ${countries[targetCountryId].name} من ${countries[attackingCountryId].name}
نسبة القوة: ${powerRatio}:1 (${attackingTroops} vs ${defendingTroops})
مستوى السؤال: ${difficulty}`);
    
    showRiskQuestion(difficulty, () => {
      const previousOwner = countries[targetCountryId].owner;
      
      // 🆕 تحديد قوة الجيش الجديد بناءً على نسبة القوة الأصلية
      const baseNewTroops = 15;
      const bonusTroops = Math.floor((attackingTroops - defendingTroops) * 0.5); // مكافأة للتفوق
      const finalTroops = Math.max(baseNewTroops, baseNewTroops + bonusTroops);
      const attackLosses = Math.ceil(attackingTroops * 0.1); // خسارة 10%
      
      console.log(`✅ نجح الهجوم! الدولة ستحصل على ${finalTroops} جندي`);
      
      // 🔥 تحديث متزامن للدول واللاعبين معاً لضمان التحديث الصحيح
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        
        // تحديث الدولة المحتلة
        newCountries[targetCountryId] = {
          ...newCountries[targetCountryId],
          owner: currentPlayer.id,
          troops: finalTroops,
          name: newCountries[targetCountryId].name
        };
        
        // تقليل قوة الجيش المهاجم (خسائر الحرب)
        newCountries[attackingCountryId] = {
          ...newCountries[attackingCountryId],
          troops: Math.max(1, attackingTroops - attackLosses)
        };
        
        console.log(`🔄 تحديث countries: ${targetCountryId} أصبحت ملك اللاعب ${currentPlayer.id} بـ ${finalTroops} جندي`);
        
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
            newPlayers[prevOwnerIndex].totalTroops -= defendingTroops;
            console.log(`➖ إزالة ${targetCountryId} من اللاعب ${previousOwner}`);
          }
        }
        
        // إضافة الدولة للاعب الحالي
        const currentPlayerIndexInPlayers = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (currentPlayerIndexInPlayers !== -1) {
          if (!newPlayers[currentPlayerIndexInPlayers].countries.includes(targetCountryId)) {
            newPlayers[currentPlayerIndexInPlayers].countries.push(targetCountryId);
          }
          newPlayers[currentPlayerIndexInPlayers].totalTroops += finalTroops;
          newPlayers[currentPlayerIndexInPlayers].totalTroops -= attackLosses; // خسائر الهجوم
          console.log(`➕ إضافة ${targetCountryId} للاعب ${currentPlayer.id}`);
        }
        
        return newPlayers;
      });
      
      // 🔥 إضافة تأخير قصير قبل الـ alert لضمان اكتمال التحديث
      setTimeout(() => {
        alert(`⚔️ انتصار عظيم! تم احتلال ${countries[targetCountryId].name}!
    
🏆 مكاسب المعركة:
• احتللت دولة جديدة بـ ${finalTroops} جندي
• خسرت ${attackLosses} جندي في المعركة
    
💪 نسبة القوة كانت ${powerRatio}:1 لصالحك!`);
        
        // تأخير إضافي قبل الانتقال للدور التالي
        setTimeout(() => {
          checkImmediateElimination();
          nextTurn();
        }, 500);
      }, 100);
      
    }, () => {
      // فشل الهجوم - خسائر أكبر للمهاجم
      const failurePenalty = 0.75; // خسارة 75%
      
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[attackingCountryId].troops;
        
        const troopsLost = Math.floor(currentTroops * failurePenalty);
        const newTroops = Math.max(1, currentTroops - troopsLost);
        newCountries[attackingCountryId].troops = newTroops;
        
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(attackingTroops * failurePenalty);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`💔 فشل الهجوم على ${countries[targetCountryId].name}!
    
💀 خسائر المعركة:
• خسرت ${Math.floor(failurePenalty * 100)}% من جيشك
• نصيحة: هاجم فقط عندما تكون أقوى!
    
📊 كانت نسبة القوة ${powerRatio}:1`);
      
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

    setCurrentPlayerIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % turnOrder.length;
      console.log(`🔄 الانتقال من اللاعب ${prevIndex} إلى ${nextIndex}`);
      return nextIndex;
    });

    // تنظيف حالة العمليات
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    setCurrentQuestion(null);
  };

  // فحص انتهاء اللعبة
  const checkGameEnd = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length <= 1) {
      const winner = activePlayers[0];
      if (winner) {
        alert(`🏆 انتهت اللعبة! الفائز هو ${winner.name}!`);
        setGamePhase('finished');
      }
      return true;
    }
    return false;
  };

  // إنهاء الدور (ايضاً للتحكم اليدوي)
  const endTurn = () => {
    nextTurn();
  };

  // إعادة تشغيل اللعبة
  const restartGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setTurnOrder([]);
    setRound(1);
    setCountries({});
    setCurrentQuestion(null);
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    setShowDifficultyModal(false);
    setPendingAction(null);
  };

  // إحصائيات اللاعب
  const getPlayerStats = (player) => {
    const playerCountries = Object.values(countries).filter(c => c.owner === player.id);
    return {
      countries: playerCountries.length,
      totalTroops: player.totalTroops || 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {gamePhase === 'setup' && (
        <PlayerSetup onSetupComplete={setupPlayers} />
      )}
      
      {gamePhase === 'spin' && (
        <SpinWheel players={players} onSpinComplete={spinForTurnOrder} />
      )}
      
      {gamePhase === 'playing' && (
        <>
          <GameUI 
            players={players}
            currentPlayer={currentPlayer}
            round={round}
            countries={countries}
            onEndTurn={endTurn}
            onRestart={restartGame}
            getPlayerStats={getPlayerStats}
          />
          <WorldMapD3 
            countries={countries}
            onCountryClick={selectCountry}
            currentPlayer={currentPlayer}
            actionType={actionType}
          />
        </>
      )}

      {/* Modal السؤال */}
      {currentQuestion && (
        <QuestionModal 
          question={currentQuestion}
          onAnswer={answerQuestion}
        />
      )}

      {/* Modal اختيار الصعوبة */}
      <DifficultySelectionModal />
    </div>
  );
}