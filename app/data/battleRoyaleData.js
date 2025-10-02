// app/data/battleRoyaleData.js - بيانات لعبة Battle Royale

export const battleRoyaleQuestions = [
  // 🌍 جغرافيا
  {
    id: 'br_geo_1',
    category: 'جغرافيا',
    question: 'ما هي عاصمة فرنسا؟',
    options: ['باريس', 'لندن', 'برلين', 'روما'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_geo_2',
    category: 'جغرافيا',
    question: 'أكبر قارة في العالم من حيث المساحة؟',
    options: ['أفريقيا', 'أوروبا', 'آسيا', 'أمريكا الشمالية'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_geo_3',
    category: 'جغرافيا',
    question: 'ما هو أطول نهر في العالم؟',
    options: ['النيل', 'الأمازون', 'اليانغتسي', 'الميسيسيبي'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_geo_4',
    category: 'جغرافيا',
    question: 'كم عدد الدول العربية؟',
    options: ['18', '20', '22', '24'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_geo_5',
    category: 'جغرافيا',
    question: 'ما هي أصغر دولة في العالم؟',
    options: ['موناكو', 'الفاتيكان', 'سان مارينو', 'ليختنشتاين'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 300
  },

  // ⚽ رياضة
  {
    id: 'br_sport_1',
    category: 'رياضة',
    question: 'كم عدد لاعبي كرة القدم في الفريق الواحد؟',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_sport_2',
    category: 'رياضة',
    question: 'من هو الهداف التاريخي لكأس العالم؟',
    options: ['بيليه', 'رونالدو', 'ميروسلاف كلوزه', 'كريستيانو رونالدو'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_sport_3',
    category: 'رياضة',
    question: 'في أي مدينة أقيمت أولمبياد 2020؟',
    options: ['بكين', 'لندن', 'طوكيو', 'ريو دي جانيرو'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_sport_4',
    category: 'رياضة',
    question: 'كم عدد الكرات الذهبية التي فاز بها ميسي؟',
    options: ['6', '7', '8', '9'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_sport_5',
    category: 'رياضة',
    question: 'من فاز بكأس العالم 2010؟',
    options: ['البرازيل', 'ألمانيا', 'إسبانيا', 'الأرجنتين'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },

  // 📚 ثقافة عامة
  {
    id: 'br_culture_1',
    category: 'ثقافة',
    question: 'كم عدد أيام السنة الميلادية؟',
    options: ['364', '365', '366', '367'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_culture_2',
    category: 'ثقافة',
    question: 'من هو مؤلف رواية "الحرب والسلام"؟',
    options: ['دوستويفسكي', 'تولستوي', 'تشيخوف', 'غوغول'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 300
  },
  {
    id: 'br_culture_3',
    category: 'ثقافة',
    question: 'ما هو أسرع حيوان بري في العالم؟',
    options: ['الأسد', 'الفهد', 'النمر', 'الذئب'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_culture_4',
    category: 'ثقافة',
    question: 'كم عدد ألوان قوس قزح؟',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_culture_5',
    category: 'ثقافة',
    question: 'ما هي أكبر صحراء في العالم؟',
    options: ['الصحراء الكبرى', 'صحراء جوبي', 'الصحراء العربية', 'صحراء أنتاركتيكا'],
    correctAnswer: 3,
    difficulty: 'hard',
    points: 300
  },

  // 🏛️ تاريخ
  {
    id: 'br_history_1',
    category: 'تاريخ',
    question: 'في أي سنة بدأت الحرب العالمية الثانية؟',
    options: ['1935', '1939', '1941', '1945'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_history_2',
    category: 'تاريخ',
    question: 'من هو أول رئيس للولايات المتحدة؟',
    options: ['توماس جيفرسون', 'جورج واشنطن', 'أبراهام لينكولن', 'جون آدامز'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_history_3',
    category: 'تاريخ',
    question: 'في أي سنة سقطت الدولة العثمانية؟',
    options: ['1918', '1920', '1922', '1924'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 300
  },
  {
    id: 'br_history_4',
    category: 'تاريخ',
    question: 'من فتح القسطنطينية؟',
    options: ['محمد الفاتح', 'سليمان القانوني', 'سليم الأول', 'بايزيد الأول'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_history_5',
    category: 'تاريخ',
    question: 'كم سنة دامت الحرب العالمية الأولى؟',
    options: ['3 سنوات', '4 سنوات', '5 سنوات', '6 سنوات'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 200
  },

  // 🔬 علوم
  {
    id: 'br_science_1',
    category: 'علوم',
    question: 'ما هو الرمز الكيميائي للماء؟',
    options: ['H2O', 'CO2', 'O2', 'N2'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_science_2',
    category: 'علوم',
    question: 'كم عدد كواكب المجموعة الشمسية؟',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_science_3',
    category: 'علوم',
    question: 'ما هو أقرب كوكب للشمس؟',
    options: ['الزهرة', 'الأرض', 'عطارد', 'المريخ'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_science_4',
    category: 'علوم',
    question: 'من مكتشف الجاذبية؟',
    options: ['أينشتاين', 'نيوتن', 'غاليليو', 'داروين'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_science_5',
    category: 'علوم',
    question: 'كم عدد عظام جسم الإنسان البالغ؟',
    options: ['186', '206', '216', '226'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 200
  },

  // 💻 تكنولوجيا
  {
    id: 'br_tech_1',
    category: 'تكنولوجيا',
    question: 'من مؤسس شركة Apple؟',
    options: ['بيل غيتس', 'ستيف جوبز', 'مارك زوكربيرغ', 'إيلون ماسك'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_tech_2',
    category: 'تكنولوجيا',
    question: 'ما هو أشهر محرك بحث في العالم؟',
    options: ['Bing', 'Yahoo', 'Google', 'DuckDuckGo'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_tech_3',
    category: 'تكنولوجيا',
    question: 'في أي سنة تأسس موقع Facebook؟',
    options: ['2002', '2004', '2006', '2008'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 200
  },
  {
    id: 'br_tech_4',
    category: 'تكنولوجيا',
    question: 'ما معنى AI؟',
    options: ['Automatic Intelligence', 'Artificial Intelligence', 'Advanced Intelligence', 'Automated Intelligence'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  },
  {
    id: 'br_tech_5',
    category: 'تكنولوجيا',
    question: 'من هو مؤسس شركة Tesla؟',
    options: ['جيف بيزوس', 'إيلون ماسك', 'بيل غيتس', 'وارن بافيت'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 100
  }
];

// دوال مساعدة
export const getRandomQuestion = (usedQuestionIds = []) => {
  const availableQuestions = battleRoyaleQuestions.filter(
    q => !usedQuestionIds.includes(q.id)
  );
  
  if (availableQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

export const getQuestionsByCategory = (category) => {
  return battleRoyaleQuestions.filter(q => q.category === category);
};

export const getQuestionsByDifficulty = (difficulty) => {
  return battleRoyaleQuestions.filter(q => q.difficulty === difficulty);
};

// إعدادات اللعبة
export const BATTLE_ROYALE_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  QUESTION_TIMEOUT: 30, // ثانية
  TOTAL_QUESTIONS: 15,
  COUNTDOWN_BEFORE_START: 3, // ثواني
  LIVES_PER_PLAYER: 3, // عدد البوكسات (الأرواح)
  SURVIVAL_POINTS_NEEDED: 3 // عدد النقاط الصحيحة للنجاة من المباراة الفاصلة
};