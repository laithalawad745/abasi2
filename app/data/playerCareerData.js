// app/data/playerCareerData.js - محدث مع إصلاح البحث المكرر

export const playerCareerData = [
  // لاعبين حاليين
  {
    id: 'ronaldo',
    name: 'كريستيانو رونالدو',
    hint: 'لاعب حالي',
    career: [
      { club: 'sporting', name: 'سبورتينغ لشبونة' },
      { club: 'manchester-united', name: 'مانشستر يونايتد' },
      { club: 'real-madrid', name: 'ريال مدريد' },
      { club: 'juventus', name: 'يوفنتوس' },
      { club: 'manchester-united', name: 'مانشستر يونايتد' },
      { club: 'al-nassr', name: 'النصر' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'messi',
    name: 'ليونيل ميسي',
    hint: 'لاعب حالي',
    career: [
      { club: 'barcelona', name: 'برشلونة' },
      { club: 'psg', name: 'باريس سان جيرمان' },
      { club: 'inter-miami', name: 'انتر مايامي' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'neymar',
    name: 'نيمار جونيور',
    hint: 'لاعب حالي',
    career: [
      { club: 'santos', name: 'سانتوس' },
      { club: 'barcelona', name: 'برشلونة' },
      { club: 'psg', name: 'باريس سان جيرمان' },
      { club: 'al-hilal', name: 'الهلال' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'modric',
    name: 'لوكا مودريتش',
    hint: 'لاعب حالي',
    career: [
      { club: 'dinamo-zagreb', name: 'دينامو زغرب' },
      { club: 'tottenham', name: 'توتنهام' },
      { club: 'real-madrid', name: 'ريال مدريد' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'lewandowski',
    name: 'روبرت ليفاندوفسكي',
    hint: 'لاعب حالي',
    career: [
      { club: 'lech-poznan', name: 'ليتش بوزنان' },
      { club: 'borussia-dortmund', name: 'بوروسيا دورتموند' },
      { club: 'bayern-munich', name: 'بايرن ميونيخ' },
      { club: 'barcelona', name: 'برشلونة' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'mbappe',
    name: 'كيليان مبابي',
    hint: 'لاعب حالي',
    career: [
      { club: 'monaco', name: 'موناكو' },
      { club: 'psg', name: 'باريس سان جيرمان' },
      { club: 'real-madrid', name: 'ريال مدريد' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'salah',
    name: 'محمد صلاح',
    hint: 'لاعب حالي',
    career: [
      { club: 'arab-contractors', name: 'المقاولون العرب' },
      { club: 'basel', name: 'بازل' },
      { club: 'chelsea', name: 'تشيلسي' },
      { club: 'fiorentina', name: 'فيورنتينا' },
      { club: 'roma', name: 'روما' },
      { club: 'liverpool', name: 'ليفربول' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'haaland',
    name: 'إيرلينغ هالاند',
    hint: 'لاعب حالي',
    career: [
      { club: 'molde', name: 'مولده' },
      { club: 'red-bull-salzburg', name: 'ريد بل سالزبورغ' },
      { club: 'borussia-dortmund', name: 'بوروسيا دورتموند' },
      { club: 'manchester-city', name: 'مانشستر سيتي' }
    ],
    difficulty: 'easy'
  },

  {
    id: 'benzema',
    name: 'كريم بنزيما',
    hint: 'لاعب حالي',
    career: [
      { club: 'lyon', name: 'ليون' },
      { club: 'real-madrid', name: 'ريال مدريد' },
      { club: 'al-ittihad', name: 'الاتحاد' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'kante',
    name: 'نغولو كانتي',
    hint: 'لاعب حالي',
    career: [
      { club: 'boulogne', name: 'بولون' },
      { club: 'caen', name: 'كان' },
      { club: 'leicester', name: 'ليستر سيتي' },
      { club: 'chelsea', name: 'تشيلسي' },
      { club: 'al-ittihad', name: 'الاتحاد' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'dybala',
    name: 'باولو ديبالا',
    hint: 'لاعب حالي',
    career: [
      { club: 'instituto', name: 'إنستيتوتو' },
      { club: 'palermo', name: 'باليرمو' },
      { club: 'juventus', name: 'يوفنتوس' },
      { club: 'roma', name: 'روما' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'griezmann',
    name: 'أنطوان جريزمان',
    hint: 'لاعب حالي',
    career: [
      { club: 'real-sociedad', name: 'ريال سوسيداد' },
      { club: 'atletico', name: 'أتلتيكو مدريد' },
      { club: 'barcelona', name: 'برشلونة' },
      { club: 'atletico', name: 'أتلتيكو مدريد' }
    ],
    difficulty: 'medium'
  },

  // لاعبين معتزلين
  {
    id: 'ramos',
    name: 'سيرجيو راموس',
    hint: 'لاعب معتزل',
    career: [
      { club: 'sevilla', name: 'إشبيلية' },
      { club: 'real-madrid', name: 'ريال مدريد' },
      { club: 'psg', name: 'باريس سان جيرمان' },
      { club: 'sevilla', name: 'إشبيلية' }
    ],
    difficulty: 'medium'
  },

  {
    id: 'suarez',
    name: 'لويس سواريز',
    hint: 'لاعب معتزل',
    career: [
      { club: 'nacional', name: 'ناسيونال' },
      { club: 'groningen', name: 'خرونينجن' },
      { club: 'ajax', name: 'أياكس' },
      { club: 'liverpool', name: 'ليفربول' },
      { club: 'barcelona', name: 'برشلونة' },
      { club: 'atletico', name: 'أتلتيكو مدريد' },
      { club: 'nacional', name: 'ناسيونال' }
    ],
    difficulty: 'medium'
  },

  // مدربين
  {
    id: 'guardiola',
    name: 'بيب جوارديولا',
    hint: 'مدرب حالي',
    career: [
      { club: 'barcelona', name: 'برشلونة' }, // كلاعب
      { club: 'brescia', name: 'بريشيا' },
      { club: 'roma', name: 'روما' },
      { club: 'brescia', name: 'بريشيا' },
      { club: 'al-ahli-doha', name: 'الأهلي الدوحة' }
    ],
    difficulty: 'hard'
  }
];

// 🔍 قائمة الأسماء الفريدة فقط - بدون تكرار (مطابقة للتلميحات التدريجية)
export const uniquePlayerNames = [
  'كريستيانو رونالدو',
  'ليونيل ميسي', 
  'نيمار جونيور',
  'لوكا مودريتش',
  'روبرت ليفاندوفسكي',
  'كيليان مبابي',
  'محمد صلاح',
  'إيرلينغ هالاند',
  'كريم بنزيما',
  'نغولو كانتي',
  'باولو ديبالا',
  'أنطوان جريزمان',
  'سيرجيو راموس',
  'لويس سواريز',
  'بيب جوارديولا'
];

// 🔍 دالة البحث المحسنة - مطابقة للتلميحات التدريجية
export const searchPlayers = (query) => {
  if (!query || query.length < 2) return [];
  
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[إأآا]/g, 'ا')        // توحيد الألف
      .replace(/[ئي]/g, 'ي')         // توحيد الياء  
      .replace(/ة/g, 'ه')            // ة → ه
      .replace(/\s+/g, ' ')          // توحيد المسافات
      .trim();
  };

  const normalizedQuery = normalizeText(query);
  
  // البحث في الأسماء الفريدة فقط
  const matches = uniquePlayerNames
    .filter(name => normalizeText(name).includes(normalizedQuery))
    .slice(0, 5); // أقصى 5 اقتراحات

  return [...new Set(matches)]; // إزالة التكرارات إضافياً
};

// 🎯 دالة التحقق من صحة الإجابة - محسنة
export const isValidPlayerAnswer = (userAnswer, correctAnswer) => {
  if (!userAnswer || !correctAnswer) return false;
  
  const normalizeString = (str) => {
    return str.toLowerCase()
              .trim()
              .replace(/\s+/g, ' ') // تبديل المسافات المتعددة بمسافة واحدة
              .replace(/[أإآا]/g, 'ا') // توحيد الألف
              .replace(/[ىي]/g, 'ي') // توحيد الياء
              .replace(/ة/g, 'ه') // تبديل التاء المربوطة بالهاء
              .replace(/ؤ/g, 'و') // تبديل الواو المهمزة
              .replace(/ئ/g, 'ي'); // تبديل الياء المهمزة
  };
  
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);
  
  // مطابقة تامة
  if (normalizedUser === normalizedCorrect) return true;
  
  // مطابقة جزئية للأسماء الطويلة
  const userWords = normalizedUser.split(' ');
  const correctWords = normalizedCorrect.split(' ');
  
  // إذا كان الاسم يحتوي على كلمتين أو أكثر، قبول الاسم الأول أو الأخير
  if (correctWords.length >= 2) {
    const firstName = correctWords[0];
    const lastName = correctWords[correctWords.length - 1];
    
    if (normalizedUser === firstName || normalizedUser === lastName) return true;
    
    // قبول إذا كان المستخدم كتب أي كلمتين من الاسم الصحيح
    const matchingWords = userWords.filter(word => correctWords.includes(word));
    if (matchingWords.length >= Math.min(2, correctWords.length)) return true;
  }
  
  // مطابقة إذا كان الاسم المدخل يحتوي على 80% من الاسم الصحيح
  if (normalizedCorrect.includes(normalizedUser) && normalizedUser.length >= normalizedCorrect.length * 0.6) {
    return true;
  }
  
  return false;
};

// 🎯 دالة للتحقق إذا كانت الإجابة المدخلة موجودة في قائمة الأسماء الصحيحة - مطابقة للتلميحات التدريجية
export const isValidPlayerName = (userAnswer) => {
  return uniquePlayerNames.some(name => 
    isValidPlayerAnswer(userAnswer, name)
  );
};

// دالة للحصول على لاعب عشوائي
export const getRandomPlayer = () => {
  const randomIndex = Math.floor(Math.random() * playerCareerData.length);
  return playerCareerData[randomIndex];
};

// دالة للحصول على لاعب حسب الصعوبة
export const getPlayerByDifficulty = (difficulty) => {
  const filteredPlayers = playerCareerData.filter(player => player.difficulty === difficulty);
  if (filteredPlayers.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * filteredPlayers.length);
  return filteredPlayers[randomIndex];
};

// دالة للحصول على إحصائيات البيانات
export const getPlayersStats = () => {
  return {
    total: playerCareerData.length,
    easy: playerCareerData.filter(p => p.difficulty === 'easy').length,
    medium: playerCareerData.filter(p => p.difficulty === 'medium').length,
    hard: playerCareerData.filter(p => p.difficulty === 'hard').length
  };
};