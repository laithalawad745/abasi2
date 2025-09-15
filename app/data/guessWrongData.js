// app/data/guessWrongData.js

export const guessWrongGameData = [
  {
    id: 1,
    category: 'كرة القدم',
    country: 'البرتغال',
    countryFlag: '🇵🇹',
    correctPerson: 'روبن دياز', // ✅ تم تغييرها من كريستيانو رونالدو
    personImage: '../../g1.jpg',
    choices: [
      'كريستيانو رونالدو',
      'برناردو سيلفا', 
      'روبن دياز',
      'روبن نيفز',
      'جواو فيلكس'
    ],
    hint: 'لاعب برتغالي مشهور'
  },
  {
    id: 2,
    category: 'كرة القدم',
    country: 'الأرجنتين',
    countryFlag: '🇦🇷',
    correctPerson: 'أنخيل دي ماريا', // ✅ تم تغييرها من ليونيل ميسي
    personImage: '../../g2.jpg',
    choices: [
      'ليونيل ميسي',
      'باولو ديبالا',
      'لاوتارو مارتينيز', 
      'أنخيل دي ماريا',
      'رودريجو دي بول'
    ],
    hint: 'لاعب أرجنتيني عظيم'
  },
  {
    id: 3,
    category: 'كرة القدم',
    country: 'البرازيل',
    countryFlag: '🇧🇷',
    correctPerson: 'نيمار جونيور',
    personImage: '../../g3.jpg',
    choices: [
      'نيمار جونيور',
      'فينيسيوس جونيور',
      'كاسيميرو',
      'أليسون بيكر', 
      'ماركينهوس'
    ],
    hint: 'لاعب برازيلي ماهر'
  },
  {
    id: 4,
    category: 'كرة القدم',
    country: 'مصر',
    countryFlag: '🇪🇬',
    correctPerson: 'محمد صلاح',
    personImage: '../../g4.jpg',
    choices: [
      'محمد صلاح',
      'محمد الننى',
      'مصطفى محمد',
      'أحمد حجازي',
      'محمد تريزيجيه'
    ],
    hint: 'لاعب مصري مميز'
  },
  {
    id: 5,
    category: 'كرة القدم', 
    country: 'فرنسا',
    countryFlag: '🇫🇷',
    correctPerson: 'كيليان مبابي',
    personImage: '../../g5.jpg',
    choices: [
      'كيليان مبابي',
      'أنطوان جريزمان',
      'كريم بنزيما',
      'بول بوجبا',
      'رافائيل فاران'
    ],
    hint: 'لاعب فرنسي سريع'
  },
  {
    id: 6,
    category: 'ممثلين',
    country: 'أمريكا',
    countryFlag: '🇺🇸',
    correctPerson: 'ويل سميث',
    personImage: '../../g6.jpg',
    choices: [
      'ويل سميث',
      'دوين جونسون',
      'ليوناردو دي كابريو',
      'براد بيت',
      'توم كروز'
    ],
    hint: 'ممثل أمريكي مشهور'
  },
  {
    id: 7,
    category: 'مغنين',
    country: 'أمريكا', 
    countryFlag: '🇺🇸',
    correctPerson: 'مايكل جاكسون',
    personImage: '../../g6.jpg',
    choices: [
      'مايكل جاكسون',
      'برونو مارس',
      'جاستين تيمبرليك',
      'أوشر',
      'كريس براون'
    ],
    hint: 'ملك البوب'
  },
  {
    id: 8,
    category: 'كرة القدم',
    country: 'إنجلترا',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    correctPerson: 'هاري كين',
    personImage: '../../g7.jpg',
    choices: [
      'هاري كين',
      'جارث ساوثجيت',
      'رحيم ستيرلنغ',
      'جودي بيلينغهام',
      'فيل فودين'
    ],
    hint: 'مهاجم إنجليزي'
  }
];

// دالة للحصول على سؤال عشوائي
export const getRandomGuessWrongQuestion = (usedQuestions = []) => {
  const availableQuestions = guessWrongGameData.filter(q => !usedQuestions.includes(q.id));
  if (availableQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

// دالة لخلط الخيارات
export const shuffleChoices = (choices) => {
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};