// app/data/footballGridData.js - نسخة مع معايير متغيرة

// 🎯 جميع معايير الصفوف المتاحة
export const allRowCriteria = [
  {
    id: 'ucl_titles',
    name: '1+ UCL',
    nameAr: 'بطل دوري الأبطال',
    imageUrl: '/football-grid/ucl-trophy.png',
    check: (player) => player.uclTitles >= 1
  },
  {
    id: 'world_cup',
    name: 'WC WINNER',
    nameAr: 'بطل كأس العالم',
    imageUrl: '/football-grid/world-cup-trophy.png',
    check: (player) => player.worldCupWinner === true
  },
  {
    id: 'euros_winner',
    name: 'EUROS',
    nameAr: 'بطل يورو',
    imageUrl: '/football-grid/euros-trophy.png',
    check: (player) => player.eurosWinner === true
  },
  {
    id: 'psg',
    name: 'PSG',
    nameAr: 'باريس سان جيرمان',
    imageUrl: '/football-grid/psg.png',
    check: (player) => player.clubs.includes('PSG')
  },
  {
    id: 'real_madrid',
    name: 'RMA',
    nameAr: 'ريال مدريد',
    imageUrl: '/football-grid/real-madrid.png',
    check: (player) => player.clubs.includes('Real Madrid')
  },
  {
    id: 'barcelona',
    name: 'BAR',
    nameAr: 'برشلونة',
    imageUrl: '/football-grid/barcelona.png',
    check: (player) => player.clubs.includes('Barcelona')
  },
  {
    id: 'manchester_united',
    name: 'MUN',
    nameAr: 'مانشستر يونايتد',
    imageUrl: '/football-grid/manchester-united.png',
    check: (player) => player.clubs.includes('Manchester United')
  },
  {
    id: 'chelsea',
    name: 'CHE',
    nameAr: 'تشيلسي',
    imageUrl: '/football-grid/chelsea.png',
    check: (player) => player.clubs.includes('Chelsea')
  },
  {
    id: 'juventus',
    name: 'JUV',
    nameAr: 'يوفنتوس',
    imageUrl: '/football-grid/juventus.png',
    check: (player) => player.clubs.includes('Juventus')
  },
  {
    id: 'bayern',
    name: 'BAY',
    nameAr: 'بايرن ميونيخ',
    imageUrl: '/football-grid/bayern.png',
    check: (player) => player.clubs.includes('Bayern Munich')
  }
];

// 🎯 جميع معايير الأعمدة المتاحة
export const allColumnCriteria = [
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
    id: 'spain',
    name: 'ESP',
    nameAr: 'إسبانيا',
    imageUrl: '/football-grid/spain.png',
    check: (player) => player.nationality === 'Spain'
  },
  {
    id: 'france',
    name: 'FRA',
    nameAr: 'فرنسا',
    imageUrl: '/football-grid/france.png',
    check: (player) => player.nationality === 'France'
  },
  {
    id: 'brazil',
    name: 'BRA',
    nameAr: 'البرازيل',
    imageUrl: '/football-grid/brazil.png',
    check: (player) => player.nationality === 'Brazil'
  },
  {
    id: 'argentina',
    name: 'ARG',
    nameAr: 'الأرجنتين',
    imageUrl: '/football-grid/argentina.png',
    check: (player) => player.nationality === 'Argentina'
  },
  {
    id: 'germany',
    name: 'GER',
    nameAr: 'ألمانيا',
    imageUrl: '/football-grid/germany.png',
    check: (player) => player.nationality === 'Germany'
  },
  {
    id: 'england',
    name: 'ENG',
    nameAr: 'إنجلترا',
    imageUrl: '/football-grid/england.png',
    check: (player) => player.nationality === 'England'
  },
  {
    id: 'netherlands',
    name: 'NED',
    nameAr: 'هولندا',
    imageUrl: '/football-grid/netherlands.png',
    check: (player) => player.nationality === 'Netherlands'
  },
  {
    id: 'milan',
    name: 'MIL',
    nameAr: 'ميلان',
    imageUrl: '/football-grid/milan.png',
    check: (player) => player.clubs.includes('AC Milan')
  },
  {
    id: 'inter',
    name: 'INT',
    nameAr: 'إنتر ميلان',
    imageUrl: '/football-grid/inter.png',
    check: (player) => player.clubs.includes('Inter Milan')
  },
  {
    id: 'liverpool',
    name: 'LIV',
    nameAr: 'ليفربول',
    imageUrl: '/football-grid/liverpool.png',
    check: (player) => player.clubs.includes('Liverpool')
  }
];

// 🎲 دالة لاختيار 3 معايير عشوائية
export const getRandomCriteria = (criteriaList, count = 3) => {
  const shuffled = [...criteriaList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// 🎮 دالة لإنشاء شبكة جديدة بمعايير عشوائية
export const generateNewGame = () => {
  return {
    rowCriteria: getRandomCriteria(allRowCriteria, 3),
    columnCriteria: getRandomCriteria(allColumnCriteria, 3)
  };
};

// قاعدة بيانات اللاعبين - محدثة مع بيانات كأس العالم
export const playersDatabase = [
  // ============================================
  // 🇵🇹 لاعبون برتغاليون
  // ============================================
  {
    name: 'Cristiano Ronaldo',
    nameAr: 'كريستيانو رونالدو',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Manchester United', 'Real Madrid', 'Juventus', 'Al Nassr'],
    uclTitles: 5,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['ronaldo', 'cristiano', 'cr7', 'رونالدو', 'كريستيانو']
  },
{
  name: 'Trent Alexander-Arnold',
  nameAr: 'ترينت ألكسندر أرنولد',
  nationality: 'England',
  clubs: ['Liverpool', 'Real Madrid'],  // ✅ أضفنا ريال مدريد
  uclTitles: 1,
  eurosWinner: false,
  worldCupWinner: false,
  searchTerms: ['arnold', 'trent', 'alexander', 'أرنولد', 'ترينت']
},
  {
    name: 'Mohamed Salah',
    nameAr: 'محمد صلاح',
    nationality: 'Egypt',
    clubs: ['Basel', 'Chelsea', 'Fiorentina', 'Roma', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['salah', 'mohamed', 'صلاح', 'محمد', 'مو']
  },
  {
    name: 'Sadio Mane',
    nameAr: 'ساديو ماني',
    nationality: 'Senegal',
    clubs: ['Metz', 'Red Bull Salzburg', 'Southampton', 'Liverpool', 'Bayern Munich', 'Al Nassr'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['mane', 'sadio', 'ماني', 'ساديو']
  },
  {
    name: 'Virgil van Dijk',
    nameAr: 'فيرجيل فان دايك',
    nationality: 'Netherlands',
    clubs: ['Groningen', 'Celtic', 'Southampton', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['van dijk', 'virgil', 'فان دايك', 'فيرجيل']
  },
  {
    name: 'Alisson Becker',
    nameAr: 'أليسون بيكر',
    nationality: 'Brazil',
    clubs: ['Internacional', 'Roma', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['alisson', 'becker', 'أليسون', 'بيكر']
  },
  {
    name: 'Roberto Firmino',
    nameAr: 'روبيرتو فيرمينو',
    nationality: 'Brazil',
    clubs: ['Figueirense', 'Hoffenheim', 'Liverpool', 'Al Ahli'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['firmino', 'roberto', 'فيرمينو', 'روبيرتو']
  },
  {
    name: 'Andrew Robertson',
    nameAr: 'أندرو روبرتسون',
    nationality: 'Scotland',
    clubs: ['Queen\'s Park', 'Dundee United', 'Hull City', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['robertson', 'andrew', 'andy', 'روبرتسون', 'أندرو']
  },
  {
    name: 'Jordan Henderson',
    nameAr: 'جوردان هندرسون',
    nationality: 'England',
    clubs: ['Sunderland', 'Liverpool', 'Al Ettifaq', 'Ajax'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['henderson', 'jordan', 'hendo', 'هندرسون', 'جوردان']
  },
  {
    name: 'Fabinho',
    nameAr: 'فابينيو',
    nationality: 'Brazil',
    clubs: ['Fluminense', 'Real Madrid Castilla', 'Monaco', 'Liverpool', 'Al Ittihad'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['fabinho', 'فابينيو']
  },
  {
    name: 'Thiago Alcantara',
    nameAr: 'تياغو ألكانتارا',
    nationality: 'Spain',
    clubs: ['Barcelona', 'Bayern Munich', 'Liverpool'],
    uclTitles: 2,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['thiago', 'alcantara', 'تياغو', 'ألكانتارا']
  },
  {
    name: 'Luis Figo',
    nameAr: 'لويس فيغو',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Barcelona', 'Real Madrid', 'Inter Milan'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['figo', 'luis', 'فيغو', 'لويس']
  },
  {
    name: 'Ricardo Carvalho',
    nameAr: 'ريكاردو كارفالو',
    nationality: 'Portugal',
    clubs: ['Porto', 'Chelsea', 'Real Madrid', 'Monaco'],
    uclTitles: 3,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['carvalho', 'ricardo', 'كارفالو', 'ريكاردو']
  },
  {
    name: 'Pepe',
    nameAr: 'بيبي',
    nationality: 'Portugal',
    clubs: ['Porto', 'Real Madrid'],
    uclTitles: 3,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['pepe', 'بيبي']
  },
  {
    name: 'Deco',
    nameAr: 'ديكو',
    nationality: 'Portugal',
    clubs: ['Benfica', 'Porto', 'Barcelona', 'Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['deco', 'ديكو']
  },
  {
    name: 'Rui Costa',
    nameAr: 'روي كوستا',
    nationality: 'Portugal',
    clubs: ['Benfica', 'Fiorentina', 'AC Milan'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['rui costa', 'costa', 'روي', 'كوستا']
  },
  {
    name: 'Nani',
    nameAr: 'ناني',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Manchester United', 'Fenerbahce', 'Valencia'],
    uclTitles: 1,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['nani', 'ناني']
  },
  {
    name: 'Bruno Fernandes',
    nameAr: 'برونو فيرنانديز',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Manchester United'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['bruno', 'fernandes', 'برونو', 'فيرنانديز']
  },
  {
    name: 'Bernardo Silva',
    nameAr: 'برناردو سيلفا',
    nationality: 'Portugal',
    clubs: ['Monaco', 'Manchester City'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['bernardo', 'silva', 'برناردو', 'سيلفا']
  },
  {
    name: 'Renato Sanches',
    nameAr: 'ريناتو سانشيز',
    nationality: 'Portugal',
    clubs: ['Benfica', 'Bayern Munich', 'Lille', 'PSG'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['renato', 'sanches', 'ريناتو', 'سانشيز']
  },
  {
    name: 'Joao Moutinho',
    nameAr: 'جواو موتينهو',
    nationality: 'Portugal',
    clubs: ['Sporting', 'Porto', 'Monaco', 'Wolves'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['moutinho', 'joao', 'موتينهو', 'جواو']
  },

  // ============================================
  // 🇮🇹 لاعبون إيطاليون
  // ============================================
  {
    name: 'Paolo Maldini',
    nameAr: 'باولو مالديني',
    nationality: 'Italy',
    clubs: ['AC Milan'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['maldini', 'paolo', 'مالديني', 'باولو']
  },
  {
    name: 'Alessandro Nesta',
    nameAr: 'أليساندرو نيستا',
    nationality: 'Italy',
    clubs: ['Lazio', 'AC Milan'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['nesta', 'alessandro', 'نيستا', 'أليساندرو']
  },
  {
    name: 'Andrea Pirlo',
    nameAr: 'أندريا بيرلو',
    nationality: 'Italy',
    clubs: ['Brescia', 'Inter Milan', 'AC Milan', 'Juventus'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['pirlo', 'andrea', 'بيرلو', 'أندريا']
  },
  {
    name: 'Fabio Cannavaro',
    nameAr: 'فابيو كانافارو',
    nationality: 'Italy',
    clubs: ['Napoli', 'Parma', 'Inter Milan', 'Juventus', 'Real Madrid'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['cannavaro', 'fabio', 'كانافارو', 'فابيو']
  },
  {
    name: 'Gennaro Gattuso',
    nameAr: 'جينارو غاتوزو',
    nationality: 'Italy',
    clubs: ['Rangers', 'AC Milan'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['gattuso', 'gennaro', 'غاتوزو', 'جينارو']
  },
  {
    name: 'Filippo Inzaghi',
    nameAr: 'فيليبو إنزاجي',
    nationality: 'Italy',
    clubs: ['Parma', 'Atalanta', 'Juventus', 'AC Milan'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['inzaghi', 'filippo', 'إنزاجي', 'فيليبو']
  },
  {
    name: 'Giorgio Chiellini',
    nameAr: 'جورجيو كيليني',
    nationality: 'Italy',
    clubs: ['Juventus', 'Roma', 'LAFC'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['chiellini', 'giorgio', 'كيليني', 'جورجيو']
  },
  {
    name: 'Leonardo Bonucci',
    nameAr: 'ليوناردو بونوتشي',
    nationality: 'Italy',
    clubs: ['Bari', 'Juventus', 'AC Milan'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['bonucci', 'leonardo', 'بونوتشي', 'ليوناردو']
  },
  {
    name: 'Marco Verratti',
    nameAr: 'ماركو فيراتي',
    nationality: 'Italy',
    clubs: ['Pescara', 'PSG'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['verratti', 'marco', 'فيراتي', 'ماركو']
  },
  {
    name: 'Francesco Totti',
    nameAr: 'فرانشيسكو توتي',
    nationality: 'Italy',
    clubs: ['Roma'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['totti', 'francesco', 'توتي', 'فرانشيسكو']
  },
  {
    name: 'Gianluigi Buffon',
    nameAr: 'جيانلويجي بوفون',
    nationality: 'Italy',
    clubs: ['Parma', 'Juventus', 'PSG'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['buffon', 'gianluigi', 'بوفون', 'جيانلويجي']
  },

  // ============================================
  // 🇪🇸 لاعبون إسبان
  // ============================================
  {
    name: 'Iker Casillas',
    nameAr: 'إيكر كاسياس',
    nationality: 'Spain',
    clubs: ['Real Madrid', 'Porto'],
    uclTitles: 3,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['casillas', 'iker', 'كاسياس', 'إيكر']
  },
  {
    name: 'Xavi Hernandez',
    nameAr: 'تشافي هيرنانديز',
    nationality: 'Spain',
    clubs: ['Barcelona'],
    uclTitles: 4,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['xavi', 'hernandez', 'تشافي', 'هيرنانديز']
  },
  {
    name: 'Andres Iniesta',
    nameAr: 'أندريس إنييستا',
    nationality: 'Spain',
    clubs: ['Barcelona'],
    uclTitles: 4,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['iniesta', 'andres', 'إنييستا', 'أندريس']
  },
  {
    name: 'Sergio Ramos',
    nameAr: 'سيرجيو راموس',
    nationality: 'Spain',
    clubs: ['Sevilla', 'Real Madrid', 'PSG'],
    uclTitles: 4,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['ramos', 'sergio', 'راموس', 'سيرجيو']
  },
  {
    name: 'Gerard Pique',
    nameAr: 'جيرارد بيكيه',
    nationality: 'Spain',
    clubs: ['Manchester United', 'Barcelona'],
    uclTitles: 4,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['pique', 'gerard', 'بيكيه', 'جيرارد']
  },
  {
    name: 'Xabi Alonso',
    nameAr: 'تشابي ألونسو',
    nationality: 'Spain',
    clubs: ['Real Sociedad', 'Liverpool', 'Real Madrid', 'Bayern Munich'],
    uclTitles: 2,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['xabi', 'alonso', 'تشابي', 'ألونسو']
  },
  {
    name: 'Carles Puyol',
    nameAr: 'كارليس بويول',
    nationality: 'Spain',
    clubs: ['Barcelona'],
    uclTitles: 3,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['puyol', 'carles', 'بويول', 'كارليس']
  },
  {
    name: 'David Villa',
    nameAr: 'ديفيد فيا',
    nationality: 'Spain',
    clubs: ['Valencia', 'Barcelona', 'Atletico Madrid'],
    uclTitles: 1,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['villa', 'david', 'فيا', 'ديفيد']
  },
  {
    name: 'Fernando Torres',
    nameAr: 'فرناندو توريس',
    nationality: 'Spain',
    clubs: ['Atletico Madrid', 'Liverpool', 'Chelsea', 'AC Milan'],
    uclTitles: 1,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['torres', 'fernando', 'توريس', 'فرناندو']
  },

  // ============================================
  // 🇫🇷 لاعبون فرنسيون
  // ============================================
  {
    name: 'Zinedine Zidane',
    nameAr: 'زين الدين زيدان',
    nationality: 'France',
    clubs: ['Bordeaux', 'Juventus', 'Real Madrid'],
    uclTitles: 1,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['zidane', 'zinedine', 'زيدان', 'زين الدين']
  },
  {
    name: 'Thierry Henry',
    nameAr: 'تييري هنري',
    nationality: 'France',
    clubs: ['Monaco', 'Juventus', 'Arsenal', 'Barcelona'],
    uclTitles: 1,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['henry', 'thierry', 'هنري', 'تييري']
  },
  {
    name: 'Patrick Vieira',
    nameAr: 'باتريك فييرا',
    nationality: 'France',
    clubs: ['Monaco', 'Arsenal', 'Juventus', 'Inter Milan'],
    uclTitles: 0,
    eurosWinner: true,
    worldCupWinner: true,
    searchTerms: ['vieira', 'patrick', 'فييرا', 'باتريك']
  },
  {
    name: 'Karim Benzema',
    nameAr: 'كريم بنزيما',
    nationality: 'France',
    clubs: ['Lyon', 'Real Madrid', 'Al Ittihad'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['benzema', 'karim', 'بنزيما', 'كريم']
  },
  {
    name: 'Kylian Mbappe',
    nameAr: 'كيليان مبابي',
    nationality: 'France',
    clubs: ['Monaco', 'PSG', 'Real Madrid'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['mbappe', 'kylian', 'مبابي', 'كيليان']
  },
  {
    name: 'Paul Pogba',
    nameAr: 'بول بوجبا',
    nationality: 'France',
    clubs: ['Manchester United', 'Juventus'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['pogba', 'paul', 'بوجبا', 'بول']
  },
  {
    name: 'Antoine Griezmann',
    nameAr: 'أنطوان جريزمان',
    nationality: 'France',
    clubs: ['Real Sociedad', 'Atletico Madrid', 'Barcelona'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['griezmann', 'antoine', 'جريزمان', 'أنطوان']
  },
  {
    name: 'Raphael Varane',
    nameAr: 'رافائيل فاران',
    nationality: 'France',
    clubs: ['Real Madrid', 'Manchester United'],
    uclTitles: 4,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['varane', 'raphael', 'فاران', 'رافائيل']
  },
  {
    name: 'N\'Golo Kante',
    nameAr: 'نجولو كانتي',
    nationality: 'France',
    clubs: ['Leicester', 'Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['kante', 'ngolo', 'كانتي', 'نجولو']
  },

  // ============================================
  // 🇧🇷 لاعبون برازيليون
  // ============================================
  {
    name: 'Ronaldo',
    nameAr: 'رونالدو',
    nationality: 'Brazil',
    clubs: ['PSV', 'Barcelona', 'Inter Milan', 'Real Madrid', 'AC Milan'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['ronaldo', 'r9', 'رونالدو', 'الظاهرة']
  },
  {
    name: 'Ronaldinho',
    nameAr: 'رونالدينهو',
    nationality: 'Brazil',
    clubs: ['Gremio', 'PSG', 'Barcelona', 'AC Milan'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['ronaldinho', 'رونالدينهو']
  },
  {
    name: 'Rivaldo',
    nameAr: 'ريفالدو',
    nationality: 'Brazil',
    clubs: ['Deportivo', 'Barcelona', 'AC Milan', 'Olympiacos'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['rivaldo', 'ريفالدو']
  },
  {
    name: 'Kaka',
    nameAr: 'كاكا',
    nationality: 'Brazil',
    clubs: ['Sao Paulo', 'AC Milan', 'Real Madrid'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['kaka', 'كاكا']
  },
  {
    name: 'Roberto Carlos',
    nameAr: 'روبيرتو كارلوس',
    nationality: 'Brazil',
    clubs: ['Inter Milan', 'Real Madrid'],
    uclTitles: 3,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['roberto carlos', 'carlos', 'كارلوس', 'روبيرتو']
  },
  {
    name: 'Cafu',
    nameAr: 'كافو',
    nationality: 'Brazil',
    clubs: ['Sao Paulo', 'Roma', 'AC Milan'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['cafu', 'كافو']
  },
  {
    name: 'Neymar',
    nameAr: 'نيمار',
    nationality: 'Brazil',
    clubs: ['Santos', 'Barcelona', 'PSG', 'Al Hilal'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['neymar', 'نيمار']
  },
  {
    name: 'Thiago Silva',
    nameAr: 'تياغو سيلفا',
    nationality: 'Brazil',
    clubs: ['AC Milan', 'PSG', 'Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['thiago silva', 'silva', 'تياغو', 'سيلفا']
  },
  {
    name: 'Casemiro',
    nameAr: 'كاسيميرو',
    nationality: 'Brazil',
    clubs: ['Real Madrid', 'Manchester United'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['casemiro', 'كاسيميرو']
  },
  {
    name: 'Marcelo',
    nameAr: 'مارسيلو',
    nationality: 'Brazil',
    clubs: ['Fluminense', 'Real Madrid'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['marcelo', 'مارسيلو']
  },

  // ============================================
  // 🇦🇷 لاعبون أرجنتينيون
  // ============================================
  {
    name: 'Lionel Messi',
    nameAr: 'ليونيل ميسي',
    nationality: 'Argentina',
    clubs: ['Barcelona', 'PSG', 'Inter Miami'],
    uclTitles: 4,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['messi', 'lionel', 'ميسي', 'ليونيل']
  },
  {
    name: 'Diego Maradona',
    nameAr: 'دييغو مارادونا',
    nationality: 'Argentina',
    clubs: ['Argentinos Juniors', 'Boca Juniors', 'Barcelona', 'Napoli'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['maradona', 'diego', 'مارادونا', 'دييغو']
  },
  {
    name: 'Angel Di Maria',
    nameAr: 'أنخيل دي ماريا',
    nationality: 'Argentina',
    clubs: ['Benfica', 'Real Madrid', 'Manchester United', 'PSG', 'Juventus'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['di maria', 'angel', 'دي ماريا', 'أنخيل']
  },
  {
    name: 'Sergio Aguero',
    nameAr: 'سيرجيو أغويرو',
    nationality: 'Argentina',
    clubs: ['Independiente', 'Atletico Madrid', 'Manchester City', 'Barcelona'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['aguero', 'sergio', 'أغويرو', 'سيرجيو']
  },
  {
    name: 'Javier Mascherano',
    nameAr: 'خافيير ماسكيرانو',
    nationality: 'Argentina',
    clubs: ['River Plate', 'West Ham', 'Liverpool', 'Barcelona'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['mascherano', 'javier', 'ماسكيرانو', 'خافيير']
  },

  // ============================================
  // 🇩🇪 لاعبون ألمان
  // ============================================
  {
    name: 'Philipp Lahm',
    nameAr: 'فيليب لم',
    nationality: 'Germany',
    clubs: ['Bayern Munich'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['lahm', 'philipp', 'لم', 'فيليب']
  },
  {
    name: 'Bastian Schweinsteiger',
    nameAr: 'باستيان شفاينشتايجر',
    nationality: 'Germany',
    clubs: ['Bayern Munich', 'Manchester United'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['schweinsteiger', 'bastian', 'شفاينشتايجر', 'باستيان']
  },
  {
    name: 'Toni Kroos',
    nameAr: 'توني كروس',
    nationality: 'Germany',
    clubs: ['Bayern Munich', 'Real Madrid'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['kroos', 'toni', 'كروس', 'توني']
  },
  {
    name: 'Thomas Muller',
    nameAr: 'توماس مولر',
    nationality: 'Germany',
    clubs: ['Bayern Munich'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['muller', 'thomas', 'مولر', 'توماس']
  },
  {
    name: 'Manuel Neuer',
    nameAr: 'مانويل نوير',
    nationality: 'Germany',
    clubs: ['Schalke', 'Bayern Munich'],
    uclTitles: 2,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['neuer', 'manuel', 'نوير', 'مانويل']
  },
  {
    name: 'Mesut Ozil',
    nameAr: 'مسعود أوزيل',
    nationality: 'Germany',
    clubs: ['Schalke', 'Werder Bremen', 'Real Madrid', 'Arsenal'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: true,
    searchTerms: ['ozil', 'mesut', 'أوزيل', 'مسعود']
  },

  // ============================================
  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 لاعبون إنجليز
  // ============================================
  {
    name: 'David Beckham',
    nameAr: 'ديفيد بيكهام',
    nationality: 'England',
    clubs: ['Manchester United', 'Real Madrid', 'LA Galaxy', 'AC Milan', 'PSG'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['beckham', 'david', 'بيكهام', 'ديفيد']
  },
  {
    name: 'Steven Gerrard',
    nameAr: 'ستيفن جيرارد',
    nationality: 'England',
    clubs: ['Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['gerrard', 'steven', 'جيرارد', 'ستيفن']
  },
  {
    name: 'Frank Lampard',
    nameAr: 'فرانك لامبارد',
    nationality: 'England',
    clubs: ['West Ham', 'Chelsea', 'Manchester City'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['lampard', 'frank', 'لامبارد', 'فرانك']
  },
  {
    name: 'Wayne Rooney',
    nameAr: 'واين روني',
    nationality: 'England',
    clubs: ['Everton', 'Manchester United'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['rooney', 'wayne', 'روني', 'واين']
  },
  {
    name: 'John Terry',
    nameAr: 'جون تيري',
    nationality: 'England',
    clubs: ['Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['terry', 'john', 'تيري', 'جون']
  },
  {
    name: 'Rio Ferdinand',
    nameAr: 'ريو فيرديناند',
    nationality: 'England',
    clubs: ['West Ham', 'Leeds', 'Manchester United'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['ferdinand', 'rio', 'فيرديناند', 'ريو']
  },
  {
    name: 'Ashley Cole',
    nameAr: 'آشلي كول',
    nationality: 'England',
    clubs: ['Arsenal', 'Chelsea'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['cole', 'ashley', 'كول', 'آشلي']
  },

  // ============================================
  // 🇳🇱 لاعبون هولنديون
  // ============================================
  {
    name: 'Marco van Basten',
    nameAr: 'ماركو فان باستن',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'AC Milan'],
    uclTitles: 2,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['van basten', 'marco', 'فان باستن', 'ماركو']
  },
  {
    name: 'Ruud Gullit',
    nameAr: 'رود خوليت',
    nationality: 'Netherlands',
    clubs: ['Feyenoord', 'PSV', 'AC Milan', 'Chelsea'],
    uclTitles: 2,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['gullit', 'ruud', 'خوليت', 'رود']
  },
  {
    name: 'Frank Rijkaard',
    nameAr: 'فرانك رايكارد',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'AC Milan'],
    uclTitles: 2,
    eurosWinner: true,
    worldCupWinner: false,
    searchTerms: ['rijkaard', 'frank', 'رايكارد', 'فرانك']
  },
  {
    name: 'Clarence Seedorf',
    nameAr: 'كلارنس سيدورف',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'Real Madrid', 'Inter Milan', 'AC Milan'],
    uclTitles: 4,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['seedorf', 'clarence', 'سيدورف', 'كلارنس']
  },
  {
    name: 'Arjen Robben',
    nameAr: 'أرين روبن',
    nationality: 'Netherlands',
    clubs: ['PSV', 'Chelsea', 'Real Madrid', 'Bayern Munich'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['robben', 'arjen', 'روبن', 'أرين']
  },
  {
    name: 'Wesley Sneijder',
    nameAr: 'ويسلي سنايدر',
    nationality: 'Netherlands',
    clubs: ['Ajax', 'Real Madrid', 'Inter Milan'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['sneijder', 'wesley', 'سنايدر', 'ويسلي']
  },
  {
    name: 'Virgil van Dijk',
    nameAr: 'فيرجيل فان دايك',
    nationality: 'Netherlands',
    clubs: ['Celtic', 'Southampton', 'Liverpool'],
    uclTitles: 1,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['van dijk', 'virgil', 'فان دايك', 'فيرجيل']
  },

  // لاعبون إضافيون بدون تصنيف محدد
  {
    name: 'Luka Modric',
    nameAr: 'لوكا مودريتش',
    nationality: 'Croatia',
    clubs: ['Dinamo Zagreb', 'Tottenham', 'Real Madrid'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['modric', 'luka', 'مودريتش', 'لوكا']
  },
  {
    name: 'Gareth Bale',
    nameAr: 'غاريث بيل',
    nationality: 'Wales',
    clubs: ['Southampton', 'Tottenham', 'Real Madrid'],
    uclTitles: 5,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['bale', 'gareth', 'بيل', 'غاريث']
  },
  {
    name: 'Zlatan Ibrahimovic',
    nameAr: 'زلاتان إبراهيموفيتش',
    nationality: 'Sweden',
    clubs: ['Ajax', 'Juventus', 'Inter Milan', 'Barcelona', 'AC Milan', 'PSG', 'Manchester United'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['ibrahimovic', 'zlatan', 'إبراهيموفيتش', 'زلاتان', 'ابرا']
  },
  {
    name: 'Edinson Cavani',
    nameAr: 'إدينسون كافاني',
    nationality: 'Uruguay',
    clubs: ['Palermo', 'Napoli', 'PSG', 'Manchester United'],
    uclTitles: 0,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['cavani', 'edinson', 'كافاني', 'إدينسون']
  },
  {
    name: 'Samuel Eto\'o',
    nameAr: 'صامويل إيتو',
    nationality: 'Cameroon',
    clubs: ['Real Madrid', 'Barcelona', 'Inter Milan', 'Chelsea'],
    uclTitles: 3,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['etoo', 'samuel', 'إيتو', 'صامويل']
  },
  {
    name: 'Dani Alves',
    nameAr: 'داني ألفيش',
    nationality: 'Brazil',
    clubs: ['Sevilla', 'Barcelona', 'Juventus', 'PSG'],
    uclTitles: 3,
    eurosWinner: false,
    worldCupWinner: false,
    searchTerms: ['alves', 'dani', 'ألفيش', 'داني']
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
  ).slice(0, 8);
};

// دالة للتحقق من صحة اللاعب للمربع
export const validatePlayerForCell = (playerName, rowIndex, colIndex, currentRowCriteria, currentColumnCriteria) => {
  const player = playersDatabase.find(p => 
    p.name.toLowerCase() === playerName.toLowerCase() ||
    p.nameAr === playerName
  );
  
  if (!player) return { valid: false, message: 'لاعب غير موجود في قاعدة البيانات' };
  
  const rowCriterion = currentRowCriteria[rowIndex];
  const colCriterion = currentColumnCriteria[colIndex];
  
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
  for (let i = 0; i < 3; i++) {
    if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
      return { winner: grid[i][0], line: `row-${i}` };
    }
  }
  
  for (let i = 0; i < 3; i++) {
    if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) {
      return { winner: grid[0][i], line: `col-${i}` };
    }
  }
  
  if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    return { winner: grid[0][0], line: 'diag-1' };
  }
  
  if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
    return { winner: grid[0][2], line: 'diag-2' };
  }
  
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