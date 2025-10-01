// app/data/footballGridData.js

// معايير الصفوف
export const rowCriteria = [
  {
    id: 'ucl_titles',
    name: '2+ UCL TITLES',
    nameAr: 'بطل دوري أبطال أوروبا مرتين+',
    imageUrl: '/football-grid/ucl-trophy.png',
    check: (player) => player.uclTitles >= 2
  },
  {
    id: 'psg',
    name: 'PSG',
    nameAr: 'باريس سان جيرمان',
    imageUrl: '/football-grid/psg.png',
    check: (player) => player.clubs.includes('PSG')
  },
  {
    id: 'euros_winner',
    name: 'EUROS WINNER',
    nameAr: 'بطل يورو',
    imageUrl: '/football-grid/euros-trophy.png',
    check: (player) => player.eurosWinner === true
  }
];

// معايير الأعمدة
export const columnCriteria = [
  {
    id: 'portugal',
    name: 'POR',
    nameAr: 'البرتغال',
    imageUrl: '/football-grid/portugal.png',
    check: (player) => player.nationality === 'Portugal'
  },
  {
    id: 'italy',
    name: 'ITA',
    nameAr: 'إيطاليا',
    imageUrl: '/football-grid/italy.png',
    check: (player) => player.nationality === 'Italy'
  },
  {
    id: 'milan',
    name: 'MIL',
    nameAr: 'ميلان',
    imageUrl: '/football-grid/milan.png',
    check: (player) => player.clubs.includes('AC Milan')
  }
];

// قاعدة بيانات اللاعبين
export const playersDatabase = [
  // لاعبون برتغاليون
  {
    name: 'Cristiano Ronaldo',
    nameAr: 'كريستيانو رونالدو',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Manchester United', 'Real Madrid', 'Juventus', 'Al Nassr'],
    uclTitles: 5,
    eurosWinner: true,
    searchTerms: ['ronaldo', 'cristiano', 'cr7', 'رونالدو', 'كريستيانو']
  },
  {
    name: 'Bruno Fernandes',
    nameAr: 'برونو فيرنانديز',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Manchester United'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['bruno', 'fernandes', 'برونو', 'فيرنانديز']
  },
  {
    name: 'Joao Felix',
    nameAr: 'جواو فيليكس',
    nationality: 'Portugal',
    clubs: ['Benfica', 'Atletico Madrid', 'Chelsea', 'Barcelona'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['joao', 'felix', 'جواو', 'فيليكس']
  },
  {
    name: 'Pepe',
    nameAr: 'بيبي',
    nationality: 'Portugal',
    clubs: ['Porto', 'Real Madrid'],
    uclTitles: 3,
    eurosWinner: true,
    searchTerms: ['pepe', 'بيبي']
  },
  {
    name: 'Bernardo Silva',
    nameAr: 'برناردو سيلفا',
    nationality: 'Portugal',
    clubs: ['Monaco', 'Manchester City'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['bernardo', 'silva', 'برناردو', 'سيلفا']
  },
  {
    name: 'Renato Sanches',
    nameAr: 'ريناتو سانشيز',
    nationality: 'Portugal',
    clubs: ['Benfica', 'Bayern Munich', 'Lille', 'PSG'],
    uclTitles: 0,
    eurosWinner: true,
    searchTerms: ['renato', 'sanches', 'ريناتو', 'سانشيز']
  },
  {
    name: 'Nuno Mendes',
    nameAr: 'نونو مينديز',
    nationality: 'Portugal',
    clubs: ['Sporting', 'PSG'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['nuno', 'mendes', 'نونو', 'مينديز']
  },
  {
    name: 'Vitinha',
    nameAr: 'فيتينيا',
    nationality: 'Portugal',
    clubs: ['Porto', 'PSG'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['vitinha', 'فيتينيا']
  },

  // لاعبون إسبان (إضافة المزيد)
  {
    name: 'Andres Iniesta',
    nameAr: 'أندريس إنييستا',
    nationality: 'Spain',
    clubs: ['Barcelona', 'Vissel Kobe'],
    uclTitles: 4,
    eurosWinner: true,
    searchTerms: ['iniesta', 'andres', 'إنييستا', 'أندريس']
  },
  {
    name: 'Xavi Hernandez',
    nameAr: 'تشافي هيرنانديز',
    nationality: 'Spain',
    clubs: ['Barcelona', 'Al Sadd'],
    uclTitles: 4,
    eurosWinner: true,
    searchTerms: ['xavi', 'hernandez', 'تشافي', 'هيرنانديز']
  },
  {
    name: 'David Villa',
    nameAr: 'ديفيد فيا',
    nationality: 'Spain',
    clubs: ['Valencia', 'Barcelona', 'Atletico Madrid', 'New York City'],
    uclTitles: 1,
    eurosWinner: true,
    searchTerms: ['villa', 'david', 'فيا', 'ديفيد']
  },
  {
    name: 'Fernando Torres',
    nameAr: 'فرناندو توريس',
    nationality: 'Spain',
    clubs: ['Atletico Madrid', 'Liverpool', 'Chelsea', 'AC Milan'],
    uclTitles: 1,
    eurosWinner: true,
    searchTerms: ['torres', 'fernando', 'توريس', 'فرناندو']
  },
  {
    name: 'Iker Casillas',
    nameAr: 'إيكر كاسياس',
    nationality: 'Spain',
    clubs: ['Real Madrid', 'Porto'],
    uclTitles: 3,
    eurosWinner: true,
    searchTerms: ['casillas', 'iker', 'كاسياس', 'إيكر']
  },
  {
    name: 'Xabi Alonso',
    nameAr: 'تشابي ألونسو',
    nationality: 'Spain',
    clubs: ['Real Sociedad', 'Liverpool', 'Real Madrid', 'Bayern Munich'],
    uclTitles: 2,
    eurosWinner: true,
    searchTerms: ['xabi', 'alonso', 'تشابي', 'ألونسو']
  },
  {
    name: 'Carles Puyol',
    nameAr: 'كارليس بويول',
    nationality: 'Spain',
    clubs: ['Barcelona'],
    uclTitles: 3,
    eurosWinner: true,
    searchTerms: ['puyol', 'carles', 'بويول', 'كارليس']
  },

  // لاعبون فرنسيون (إضافة المزيد)
  {
    name: 'Karim Benzema',
    nameAr: 'كريم بنزيما',
    nationality: 'France',
    clubs: ['Lyon', 'Real Madrid', 'Al Ittihad'],
    uclTitles: 5,
    eurosWinner: false,
    searchTerms: ['benzema', 'karim', 'بنزيما', 'كريم']
  },
  {
    name: 'Antoine Griezmann',
    nameAr: 'أنطوان جريزمان',
    nationality: 'France',
    clubs: ['Real Sociedad', 'Atletico Madrid', 'Barcelona'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['griezmann', 'antoine', 'جريزمان', 'أنطوان']
  },
  {
    name: 'N\'Golo Kante',
    nameAr: 'نجولو كانتي',
    nationality: 'France',
    clubs: ['Leicester', 'Chelsea', 'Al Ittihad'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['kante', 'ngolo', 'كانتي', 'نجولو']
  },
  {
    name: 'Paul Pogba',
    nameAr: 'بول بوجبا',
    nationality: 'France',
    clubs: ['Manchester United', 'Juventus'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['pogba', 'paul', 'بوجبا', 'بول']
  },
  {
    name: 'Raphael Varane',
    nameAr: 'رافائيل فاران',
    nationality: 'France',
    clubs: ['Lens', 'Real Madrid', 'Manchester United'],
    uclTitles: 4,
    eurosWinner: false,
    searchTerms: ['varane', 'raphael', 'فاران', 'رافائيل']
  },
  {
    name: 'Zinedine Zidane',
    nameAr: 'زين الدين زيدان',
    nationality: 'France',
    clubs: ['Bordeaux', 'Juventus', 'Real Madrid'],
    uclTitles: 1,
    eurosWinner: true,
    searchTerms: ['zidane', 'zinedine', 'زيدان', 'زين الدين']
  },
  {
    name: 'Thierry Henry',
    nameAr: 'تييري هنري',
    nationality: 'France',
    clubs: ['Monaco', 'Juventus', 'Arsenal', 'Barcelona'],
    uclTitles: 1,
    eurosWinner: true,
    searchTerms: ['henry', 'thierry', 'هنري', 'تييري']
  },
  {
    name: 'Patrick Vieira',
    nameAr: 'باتريك فييرا',
    nationality: 'France',
    clubs: ['Monaco', 'Arsenal', 'Juventus', 'Inter Milan'],
    uclTitles: 0,
    eurosWinner: true,
    searchTerms: ['vieira', 'patrick', 'فييرا', 'باتريك']
  },

  // لاعبون ألمان (إضافة المزيد)
  {
    name: 'Toni Kroos',
    nameAr: 'توني كروس',
    nationality: 'Germany',
    clubs: ['Bayern Munich', 'Real Madrid'],
    uclTitles: 5,
    eurosWinner: false,
    searchTerms: ['kroos', 'toni', 'كروس', 'توني']
  },
  {
    name: 'Thomas Muller',
    nameAr: 'توماس مولر',
    nationality: 'Germany',
    clubs: ['Bayern Munich'],
    uclTitles: 2,
    eurosWinner: false,
    searchTerms: ['muller', 'thomas', 'مولر', 'توماس']
  },
  {
    name: 'Bastian Schweinsteiger',
    nameAr: 'باستيان شفاينشتايجر',
    nationality: 'Germany',
    clubs: ['Bayern Munich', 'Manchester United'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['schweinsteiger', 'bastian', 'شفاينشتايجر', 'باستيان']
  },
  {
    name: 'Philipp Lahm',
    nameAr: 'فيليب لام',
    nationality: 'Germany',
    clubs: ['Bayern Munich'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['lahm', 'philipp', 'لم', 'فيليب']
  },
  {
    name: 'Manuel Neuer',
    nameAr: 'مانويل نوير',
    nationality: 'Germany',
    clubs: ['Schalke', 'Bayern Munich'],
    uclTitles: 2,
    eurosWinner: false,
    searchTerms: ['neuer', 'manuel', 'نوير', 'مانويل']
  },
  {
    name: 'Mesut Ozil',
    nameAr: 'مسعود أوزيل',
    nationality: 'Germany',
    clubs: ['Schalke', 'Werder Bremen', 'Real Madrid', 'Arsenal'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['ozil', 'mesut', 'أوزيل', 'مسعود']
  },

  // لاعبون إنجليز (جدد)
  {
    name: 'Steven Gerrard',
    nameAr: 'ستيفن جيرارد',
    nationality: 'England',
    clubs: ['Liverpool', 'LA Galaxy'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['gerrard', 'steven', 'جيرارد', 'ستيفن']
  },
  {
    name: 'Frank Lampard',
    nameAr: 'فرانك لامبارد',
    nationality: 'England',
    clubs: ['West Ham', 'Chelsea', 'Manchester City'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['lampard', 'frank', 'لامبارد', 'فرانك']
  },
  {
    name: 'John Terry',
    nameAr: 'جون تيري',
    nationality: 'England',
    clubs: ['Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['terry', 'john', 'تيري', 'جون']
  },
  {
    name: 'Wayne Rooney',
    nameAr: 'واين روني',
    nationality: 'England',
    clubs: ['Everton', 'Manchester United', 'DC United'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['rooney', 'wayne', 'روني', 'واين']
  },
  {
    name: 'David Beckham',
    nameAr: 'ديفيد بيكهام',
    nationality: 'England',
    clubs: ['Manchester United', 'Real Madrid', 'LA Galaxy', 'AC Milan', 'PSG'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['beckham', 'david', 'بيكهام', 'ديفيد']
  },
  {
    name: 'Rio Ferdinand',
    nameAr: 'ريو فيرديناند',
    nationality: 'England',
    clubs: ['West Ham', 'Leeds', 'Manchester United'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['ferdinand', 'rio', 'فيرديناند', 'ريو']
  },
  {
    name: 'Ashley Cole',
    nameAr: 'آشلي كول',
    nationality: 'England',
    clubs: ['Arsenal', 'Chelsea', 'Roma'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['cole', 'ashley', 'كول', 'آشلي']
  },

  // لاعبون هولنديون (جدد)
  {
    name: 'Arjen Robben',
    nameAr: 'أرين روبن',
    nationality: 'Netherlands',
    clubs: ['PSV', 'Chelsea', 'Real Madrid', 'Bayern Munich'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['robben', 'arjen', 'روبن', 'أرين']
  },
  {
    name: 'Wesley Sneijder',
    nameAr: 'ويسلي سنايدر',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'Real Madrid', 'Inter Milan', 'Galatasaray'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['sneijder', 'wesley', 'سنايدر', 'ويسلي']
  },
  {
    name: 'Robin van Persie',
    nameAr: 'روبن فان بيرسي',
    nationality: 'Netherlands',
    clubs: ['Feyenoord', 'Arsenal', 'Manchester United'],
    uclTitles: 0,
    eurosWinner: false,
    searchTerms: ['van persie', 'robin', 'فان بيرسي', 'روبن']
  },
  {
    name: 'Virgil van Dijk',
    nameAr: 'فيرجيل فان دايك',
    nationality: 'Netherlands',
    clubs: ['Celtic', 'Southampton', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    searchTerms: ['van dijk', 'virgil', 'فان دايك', 'فيرجيل']
  },
  {
    name: 'Edwin van der Sar',
    nameAr: 'إدوين فان در سار',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'Juventus', 'Fulham', 'Manchester United'],
    uclTitles: 2,
    eurosWinner: false,
    searchTerms: ['van der sar', 'edwin', 'فان در سار', 'إدوين']
  }
];

// دالة للبحث عن لاعب
export const searchPlayer = (query) => {
  if (!query || query.trim().length < 2) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return playersDatabase.filter(player => 
    player.searchTerms.some(term => term.toLowerCase().includes(searchTerm)) ||
    player.name.toLowerCase().includes(searchTerm) ||
    player.nameAr.includes(searchTerm)
  ).slice(0, 5); // أول 5 نتائج
};

// دالة للتحقق من صحة اللاعب للمربع
export const validatePlayerForCell = (playerName, rowIndex, colIndex) => {
  const player = playersDatabase.find(p => 
    p.name.toLowerCase() === playerName.toLowerCase() ||
    p.nameAr === playerName
  );
  
  if (!player) return { valid: false, message: 'لاعب غير موجود في قاعدة البيانات' };
  
  const rowCriterion = rowCriteria[rowIndex];
  const colCriterion = columnCriteria[colIndex];
  
  const matchesRow = rowCriterion.check(player);
  const matchesCol = colCriterion.check(player);
  
  if (!matchesRow && !matchesCol) {
    return { 
      valid: false, 
      message: `${player.nameAr} لا يطابق ${rowCriterion.nameAr} ولا ${colCriterion.nameAr}` 
    };
  }
  
  if (!matchesRow) {
    return { 
      valid: false, 
      message: `${player.nameAr} لا يطابق ${rowCriterion.nameAr}` 
    };
  }
  
  if (!matchesCol) {
    return { 
      valid: false, 
      message: `${player.nameAr} لا يطابق ${colCriterion.nameAr}` 
    };
  }
  
  return { valid: true, player };
};

// دالة للتحقق من الفوز
export const checkWinner = (grid) => {
  // التحقق من الصفوف
  for (let i = 0; i < 3; i++) {
    if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
      return { winner: grid[i][0], line: `row-${i}` };
    }
  }
  
  // التحقق من الأعمدة
  for (let i = 0; i < 3; i++) {
    if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) {
      return { winner: grid[0][i], line: `col-${i}` };
    }
  }
  
  // التحقق من القطر الأول
  if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    return { winner: grid[0][0], line: 'diag-1' };
  }
  
  // التحقق من القطر الثاني
  if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
    return { winner: grid[0][2], line: 'diag-2' };
  }
  
  // التحقق من التعادل
  let isFull = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!grid[i][j]) {
        isFull = false;
        break;
      }
    }
    if (!isFull) break;
  }
  
  if (isFull) {
    return { winner: 'draw', line: null };
  }
  
  return null;
};