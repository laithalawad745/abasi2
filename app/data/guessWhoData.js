// app/data/guessWhoData.js
export const guessWhoCharacters = [
  // الدور الأول - لاعبي ريال مدريد (char1 إلى char10)
  {
    id: 'char1',
    name: 'فينيسيوس',
    image: '../../vini.jpg'
  },
  {
    id: 'char2',
    name: 'بنزيما',
    image: '../../benzema.jpg'
  },
  {
    id: 'char3',
    name: 'كاماڤينغا',
    image: '../../cama.jpg'
  },
  {
    id: 'char4',
    name: 'إندريك',
    image: '../../endrick.jpg'
  },
  {
    id: 'char5',
    name: 'رودريغو',
    image: '../../rodrigojpg.jpg'
  },
  {
    id: 'char6',
    name: 'رودريغر',
    image: '../../rodeger.jpg'
  },
  {
    id: 'char7',
    name: 'إمبابي',
    image: '../../mbabe.jpg'
  },
  {
    id: 'char8',
    name: 'كروس',
    image: '../../kros.jpg'
  },
  {
    id: 'char9',
    name: 'فالفيردي',
    image: '../../falverde.jpg'
  },
  {
    id: 'char10',
    name: 'أرنولد',
    image: '../../arnold.jpg'
  },

  // الدور الثاني - الأعلام (char11 إلى char20)
  {
    id: 'char11',
    name: 'تركيا',
    image: '../../turkey.jpg'
  },
  {
    id: 'char12',
    name: 'الفلبين',
    image: '../../philippines.jpg'
  },
  {
    id: 'char13',
    name: 'الصين',
    image: '../../chaina.jpg'
  },
  {
    id: 'char14',
    name: 'المملكة المتحدة',
    image: '../../unaitkingdom.jpg'
  },
  {
    id: 'char15',
    name: 'الأوروغواي',
    image: '../../uruguay.jpg'
  },
  {
    id: 'char16',
    name: 'الهند',
    image: '../../india.jpg'
  },
  {
    id: 'char17',
    name: 'اليابان',
    image: '../../japan.jpg'
  },
  {
    id: 'char18',
    name: 'إيطاليا',
    image: '../../italy.jpg'
  },
  {
    id: 'char19',
    name: 'فرنسا',
    image: '../../franc.jpg'
  },
  {
    id: 'char20',
    name: 'البرازيل',
    image: '../../brazel.jpg'
  },

  // الدور الثالث - الشخصيات الأصلية الأولى (char21 إلى char30)
  {
    id: 'char21',
    name: 'الشاب خالد',
    image: '../../alshabkhaled.jpg'
  },
  {
    id: 'char22',
    name: 'مريم',
    image: '../../merem.jpg'
  },
  {
    id: 'char23',
    name: 'ميسي',
    image: '../../messi.jpg'
  },
  {
    id: 'char24',
    name: 'رونالدو',
    image: '../../ronlado.jpg'
  },
  {
    id: 'char25',
    name: 'رايا',
    image: '../../raya.jpg'
  },
  {
    id: 'char26',
    name: 'شاكيرا',
    image: '../../shakera.jpg'
  },
  {
    id: 'char27',
    name: 'نانسي',
    image: '../../nansi.jpg'
  },
  {
    id: 'char28',
    name: 'عادل',
    image: '../../adel.jpg'
  },
  {
    id: 'char29',
    name: 'احمد',
    image: '../../ahmad.jpg'
  },
  {
    id: 'char30',
    name: 'هنيدي',
    image: '../../hnede.jpg'
  },

  // الدور الرابع - الشخصيات الأصلية الثانية (char31 إلى char40)
  {
    id: 'char31',
    name: 'دربحة',
    image: '../../darbha.jpg'
  },
  {
    id: 'char32',
    name: 'عبسي',
    image: '../../fabsi.jpg'
  },
  {
    id: 'char33',
    name: 'جورجينا',
    image: '../../georgina.jpg'
  },
  {
    id: 'char34',
    name: 'ماهر',
    image: '../../mahercom.jpg'
  },
  {
    id: 'char35',
    name: 'مستر بيست',
    image: '../../mrbest.jpg'
  },
  {
    id: 'char36',
    name: 'صلاح',
    image: '../../salah.jpg'
  },
  {
    id: 'char37',
    name: 'ترامب',
    image: '../../tramp.jpg'
  },
  {
    id: 'char38',
    name: 'سبيد',
    image: '../../speed.jpg'
  },
  {
    id: 'char39',
    name: 'ام عصام',
    image: '../../omesam.jpg'
  },
  {
    id: 'char40',
    name: 'ابو فلة',
    image: '../../abofalah.jpg'
  }
];

// دالة للحصول على لاعبي ريال مدريد (char1-char10)
export const getMatch1Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 1 && charNumber <= 10;
  });
};

// دالة للحصول على الأعلام (char11-char20)
export const getMatch2Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 11 && charNumber <= 20;
  });
};

// دالة للحصول على الشخصيات الأصلية الأولى (char21-char30)
export const getMatch3Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 21 && charNumber <= 30;
  });
};

// دالة للحصول على الشخصيات الأصلية الثانية (char31-char40)
export const getMatch4Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 31 && charNumber <= 40;
  });
};

// // دالة للحصول على لاعبي ريال مدريد فقط
// export const getRealMadridPlayers = () => {
//   return getMatch1Characters();
// };

// // دالة للحصول على الأعلام فقط
// export const getCountryFlags = () => {
//   return getMatch2Characters();
// };