// components/RiskGame/RiskGame.jsx - إضافة الدول الجديدة فقط للأتصالات
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

  // 🆕 خريطة الدول المجاورة - مع إضافة الدول الجديدة
  const adjacentCountries = {
    // الدول الأصلية
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
    south_korea: ['japan', 'china'],
    
    // 🆕 الدول الجديدة مع اتصالاتها
    // أوروبا الشمالية
    norway: ['sweden', 'finland', 'united_kingdom'],
    sweden: ['norway', 'finland', 'denmark'],
    finland: ['norway', 'sweden', 'russia'],
    denmark: ['sweden', 'germany', 'netherlands'],
    netherlands: ['germany', 'belgium', 'denmark'],
    belgium: ['netherlands', 'germany', 'france'],
    switzerland: ['france', 'germany', 'austria', 'italy'],
    austria: ['germany', 'czech_republic', 'switzerland', 'italy'],
    czech_republic: ['germany', 'poland', 'austria'],
    romania: ['ukraine', 'bulgaria'],
    bulgaria: ['romania', 'turkey', 'greece'],
    greece: ['bulgaria', 'turkey', 'italy'],
    portugal: ['spain'],
    
    // آسيا الجديدة
    myanmar: ['china', 'india', 'bangladesh', 'thailand', 'laos'],
    malaysia: ['thailand', 'indonesia'],
    philippines: ['malaysia'],
    north_korea: ['china', 'russia', 'south_korea'],
    afghanistan: ['iran', 'pakistan', 'china', 'uzbekistan', 'kazakhstan'],
    uzbekistan: ['afghanistan', 'kazakhstan'],
    bangladesh: ['india', 'myanmar'],
    sri_lanka: ['india'],
    nepal: ['india', 'china'],
    bhutan: ['india', 'china'],
    laos: ['china', 'vietnam', 'thailand', 'myanmar'],
    cambodia: ['thailand', 'vietnam'],
    
    // أفريقيا الجديدة
    morocco: ['algeria', 'spain', 'portugal'],
    tunisia: ['libya', 'algeria'],
    sudan: ['egypt', 'libya', 'ethiopia'],
    ethiopia: ['sudan', 'kenya'],
    kenya: ['ethiopia', 'tanzania'],
    tanzania: ['kenya', 'zambia', 'zimbabwe'],
    zambia: ['tanzania', 'zimbabwe', 'botswana', 'angola', 'democratic_republic_congo'],
    zimbabwe: ['zambia', 'tanzania', 'botswana', 'south_africa'],
    botswana: ['zambia', 'zimbabwe', 'south_africa', 'namibia'],
    namibia: ['botswana', 'south_africa', 'angola'],
    madagascar: [],
    ghana: ['nigeria', 'ivory_coast'],
    ivory_coast: ['ghana', 'nigeria'],
    cameroon: ['nigeria', 'democratic_republic_congo'],
    democratic_republic_congo: ['cameroon', 'zambia', 'angola'],
    angola: ['democratic_republic_congo', 'zambia', 'namibia'],
    
    // الأمريكتين الجديدة
    chile: ['argentina', 'peru', 'bolivia'],
    peru: ['chile', 'bolivia', 'brazil', 'colombia', 'ecuador'],
    colombia: ['venezuela', 'brazil', 'peru', 'ecuador', 'panama'],
    venezuela: ['colombia', 'brazil'],
    bolivia: ['brazil', 'argentina', 'chile', 'peru'],
    ecuador: ['peru', 'colombia'],
    uruguay: ['brazil', 'argentina'],
    guatemala: ['mexico', 'panama'],
    cuba: [],
    panama: ['colombia', 'costa_rica', 'guatemala'],
    costa_rica: ['panama', 'nicaragua'],
    nicaragua: ['costa_rica'],
    
    // أوقيانوسيا الجديدة
    new_zealand: ['australia'],
    papua_new_guinea: ['indonesia', 'australia'],
    fiji: [],
    
    // الشرق الأوسط الجديد
    israel: ['syria', 'jordan', 'egypt', 'lebanon'],
    lebanon: ['syria', 'israel'],
    syria: ['turkey', 'iraq', 'jordan', 'lebanon', 'israel'],
    jordan: ['syria', 'iraq', 'saudi_arabia', 'israel'],
    iraq: ['iran', 'turkey', 'syria', 'jordan', 'saudi_arabia', 'kuwait'],
    yemen: ['saudi_arabia', 'oman'],
    oman: ['yemen', 'saudi_arabia', 'uae'],
    uae: ['oman', 'saudi_arabia', 'qatar'],
    kuwait: ['iraq', 'saudi_arabia'],
    qatar: ['saudi_arabia', 'uae']
  };

  // اللاعب الحالي
  const currentPlayer = players[turnOrder[currentPlayerIndex]];

  // تهيئة الدول عند بداية اللعبة
  useEffect(() => {
    if (gamePhase === 'playing' && Object.keys(countries).length === 0) {
      initializeCountries();
    }
  }, [gamePhase]);

  // تهيئة الدول
  const initializeCountries = () => {
    const countryNames = {
      // الدول الأصلية
      egypt: 'مصر', libya: 'ليبيا', algeria: 'الجزائر', france: 'فرنسا',
      germany: 'ألمانيا', spain: 'إسبانيا', italy: 'إيطاليا',
      united_kingdom: 'المملكة المتحدة', poland: 'بولندا', ukraine: 'أوكرانيا',
      turkey: 'تركيا', iran: 'إيران', saudi_arabia: 'السعودية',
      pakistan: 'باكستان', india: 'الهند', china: 'الصين',
      mongolia: 'منغوليا', russia: 'روسيا', kazakhstan: 'كازاخستان',
      thailand: 'تايلاند', vietnam: 'فيتنام', indonesia: 'إندونيسيا',
      australia: 'أستراليا', brazil: 'البرازيل', argentina: 'الأرجنتين',
      usa: 'الولايات المتحدة', canada: 'كندا', mexico: 'المكسيك',
      south_africa: 'جنوب أفريقيا', nigeria: 'نيجيريا', japan: 'اليابان',
      south_korea: 'كوريا الجنوبية',
      
      // 🆕 الدول الجديدة
      // أوروبا الشمالية والوسطى
      norway: 'النرويج', sweden: 'السويد', finland: 'فنلندا', denmark: 'الدنمارك',
      netherlands: 'هولندا', belgium: 'بلجيكا', switzerland: 'سويسرا',
      austria: 'النمسا', czech_republic: 'التشيك', romania: 'رومانيا',
      bulgaria: 'بلغاريا', greece: 'اليونان', portugal: 'البرتغال',
      
      // آسيا الجديدة
      myanmar: 'ميانمار', malaysia: 'ماليزيا', philippines: 'الفلبين',
      north_korea: 'كوريا الشمالية', afghanistan: 'أفغانستان', uzbekistan: 'أوزبكستان',
      bangladesh: 'بنغلادش', sri_lanka: 'سريلانكا', nepal: 'نيبال',
      bhutan: 'بوتان', laos: 'لاوس', cambodia: 'كمبوديا',
      
      // أفريقيا الجديدة
      morocco: 'المغرب', tunisia: 'تونس', sudan: 'السودان',
      ethiopia: 'إثيوبيا', kenya: 'كينيا', tanzania: 'تنزانيا',
      zambia: 'زامبيا', zimbabwe: 'زيمبابوي', botswana: 'بوتسوانا',
      namibia: 'ناميبيا', madagascar: 'مدغشقر', ghana: 'غانا',
      ivory_coast: 'ساحل العاج', cameroon: 'الكاميرون',
      democratic_republic_congo: 'الكونغو الديمقراطية', angola: 'أنغولا',
      
      // الأمريكتين الجديدة
      chile: 'تشيلي', peru: 'بيرو', colombia: 'كولومبيا',
      venezuela: 'فنزويلا', bolivia: 'بوليفيا', ecuador: 'الإكوادور',
      uruguay: 'أوروغواي', guatemala: 'غواتيمالا', cuba: 'كوبا',
      panama: 'بنما', costa_rica: 'كوستاريكا', nicaragua: 'نيكاراغوا',
      
      // أوقيانوسيا الجديدة
      new_zealand: 'نيوزيلندا', papua_new_guinea: 'بابوا نيو غينيا', fiji: 'فيجي',
      
      // الشرق الأوسط الجديد
      israel: 'إسرائيل', lebanon: 'لبنان', syria: 'سوريا', jordan: 'الأردن',
      iraq: 'العراق', yemen: 'اليمن', oman: 'عمان', uae: 'الإمارات',
      kuwait: 'الكويت', qatar: 'قطر'
    };
    
    const initialCountries = {};
    Object.keys(countryNames).forEach(countryId => {
      initialCountries[countryId] = {
        id: countryId,
        name: countryNames[countryId],
        owner: null,
        troops: 1
      };
    });
    setCountries(initialCountries);
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
  };

  // عرض السؤال مع callback للنجاح والفشل
  const showRiskQuestion = (difficulty, onSuccess, onFailure) => {
    const question = getRandomRiskQuestion();
    setCurrentQuestion({
      ...question,
      difficulty: difficulty,
      onSuccess: () => {
        setCurrentQuestion(null);
        onSuccess(difficulty);
      },
      onFailure: () => {
        setCurrentQuestion(null);
        onFailure();
      }
    });
  };

  // الإجابة على السؤال
  const answerQuestion = (isCorrect) => {
    if (currentQuestion) {
      if (isCorrect) {
        currentQuestion.onSuccess();
      } else {
        currentQuestion.onFailure();
      }
    }
  };

  // الحصول على عدد الجنود حسب المستوى
  const getTroopsForDifficulty = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 20;
      default: return 5;
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
      
      console.log(`✅ نجح الهجوم!
- الجيش الجديد في ${countries[targetCountryId].name}: ${finalTroops} جندي
- خسائر المهاجم: ${attackLosses} جندي
- باقي الجيش في ${countries[attackingCountryId].name}: ${attackingTroops - attackLosses} جندي`);
      
      // تحديث الدول مع الإحصائيات الجديدة
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        
        // تحديث الدولة المهاجمة (خسارة جزئية)
        newCountries[attackingCountryId] = {
          ...newCountries[attackingCountryId],
          troops: Math.max(1, attackingTroops - attackLosses)
        };
        
        // تحديث الدولة المُحتلة (مالك جديد)
        newCountries[targetCountryId] = {
          ...newCountries[targetCountryId],
          owner: currentPlayer.id,
          troops: finalTroops
        };
        
        console.log('🔥 تحديث خريطة البلدان:', {
          [attackingCountryId]: `${newCountries[attackingCountryId].troops} جندي`,
          [targetCountryId]: `مالك جديد ${currentPlayer.id} - ${finalTroops} جندي`
        });
        
        return newCountries;
      });
      
      // تحديث اللاعبين
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        // تحديث المهاجم (إضافة الدولة الجديدة)
        const attackerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (attackerIndex !== -1) {
          if (!newPlayers[attackerIndex].countries.includes(targetCountryId)) {
            newPlayers[attackerIndex].countries.push(targetCountryId);
          }
          newPlayers[attackerIndex].totalTroops = newPlayers[attackerIndex].totalTroops - attackLosses + finalTroops;
        }
        
        // تحديث المدافع (إزالة الدولة)
        if (previousOwner !== null) {
          const defenderIndex = newPlayers.findIndex(p => p.id === previousOwner);
          if (defenderIndex !== -1) {
            newPlayers[defenderIndex].countries = newPlayers[defenderIndex].countries.filter(id => id !== targetCountryId);
            newPlayers[defenderIndex].totalTroops -= defendingTroops;
          }
        }
        
        console.log('👥 تحديث اللاعبين:', {
          attacker: `${newPlayers[attackerIndex]?.name}: ${newPlayers[attackerIndex]?.countries.length} دولة`,
          defender: previousOwner !== null ? `لاعب ${previousOwner}: خسر ${countries[targetCountryId].name}` : 'لا يوجد مدافع'
        });
        
        return newPlayers;
      });
      
      alert(`🎯 نجح الهجوم! تم احتلال ${countries[targetCountryId].name} بقوة ${finalTroops} جندي!
خسائرك: ${attackLosses} جندي من ${countries[attackingCountryId].name}`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 2000);
      
    }, () => {
      // فشل الهجوم - خسارة 50% من جيش الدولة المُهاجِمة
      const currentTroops = countries[attackingCountryId].troops;
      const lostTroops = Math.floor(currentTroops * 0.5);
      const remainingTroops = Math.max(1, currentTroops - lostTroops);
      
      console.log(`💥 فشل الهجوم! خسارة ${lostTroops} من ${currentTroops} في ${countries[attackingCountryId].name}`);
      
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[attackingCountryId] = {
          ...newCountries[attackingCountryId],
          troops: remainingTroops
        };
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          newPlayers[playerIndex].totalTroops -= lostTroops;
        }
        return newPlayers;
      });
      
      alert(`💥 فشل الهجوم! خسرت ${lostTroops} جندي من ${countries[attackingCountryId].name}
الباقي: ${remainingTroops} جندي`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
    });
  };

  // التحقق من الإقصاء الفوري
  const checkImmediateElimination = () => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const eliminatedThisTurn = [];
      
      newPlayers.forEach(player => {
        if (!player.eliminated) {
          const playerCountries = Object.keys(countries).filter(id => 
            countries[id].owner === player.id
          );
          
          if (playerCountries.length === 0 || player.totalTroops < 5) {
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

  // الانتقال للدور التالي
  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => {
      const activePlayers = players.filter(p => !p.eliminated);
      
      if (activePlayers.length <= 1) {
        // انتهاء اللعبة
        setGamePhase('finished');
        return prevIndex;
      }
      
      const newIndex = (prevIndex + 1) % turnOrder.length;
      
      // إذا عدنا للاعب الأول، انتقل للجولة التالية
      if (newIndex === 0) {
        setRound(prevRound => prevRound + 1);
      }
      
      return newIndex;
    });
    
    // إعادة تعيين حالة العمليات
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
  };

  // التحقق من الفوز
  const checkForWinner = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      alert(`🏆 انتهت اللعبة! الفائز هو ${winner.name}!`);
      setGamePhase('finished');
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

      {gamePhase === 'finished' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
              🏆 انتهت اللعبة!
            </h1>
            <p className="text-2xl text-white mb-8">
              الفائز: {players.find(p => !p.eliminated)?.name || 'لا يوجد'}
            </p>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform"
            >
              🔄 لعبة جديدة
            </button>
          </div>
        </div>
      )}

      {/* Modal السؤال */}
      {currentQuestion && (
        <QuestionModal 
          question={currentQuestion}
          onAnswer={answerQuestion}
          onClose={() => setCurrentQuestion(null)}
        />
      )}

      {/* Modal اختيار الصعوبة */}
      <DifficultySelectionModal />
    </div>
  );
}