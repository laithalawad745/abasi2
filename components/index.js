// components/index.js - تحديث الملف ليشمل لعبة أوجد الدولة
export { default as QuizGame } from './QuizGame';
export { default as GameSetup } from './GameSetup';
export { default as TeamScores } from './TeamScores';
export { default as TeamHelpers } from './TeamHelpers';
export { default as QuestionDisplay } from './QuestionDisplay';
export { default as ChoiceQuestion } from './ChoiceQuestion';
export { default as TopicGrid } from './TopicGrid';
export { default as GameFinished } from './GameFinished';
export { default as DiceGame } from './DiceGame';
export { default as DiceComponent } from './DiceComponent';
export { default as DiceInstructions } from './DiceInstructions';
export { default as TournamentGame } from './TournamentGame';
export { default as VisualTournamentGame } from './VisualTournamentGame';
export { default as GuessWhoGame } from './GuessWhoGame';
export { default as GuessWhoRouter } from './GuessWhoRouter';
export { ImageModal, ConfirmModal } from './Modals';
export { default as GuessWhoSetup } from './GuessWhoSetup';

// خرائط تفاعلية بـ D3.js
export { default as ArabMapD3 } from './ArabMapD3';
export { default as EuropeMapD3 } from './EuropeMapD3';

// ألعاب الخرائط
export { default as EuropeGame } from './EuropeGame';
export { default as ArabGame } from './ArabGame';

// مكونات أخرى
export { default as WorldMap } from './WorldMap';
export { default as WorldQuestion } from './WorldQuestion';

// Toast Component
export { default as ToastNotification, showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ToastNotification';

// لعبة المزاد
export { default as AuctionGame } from './AuctionGame';

// لعبة خمن الخطأ
export { default as GuessWrongGame } from './GuessWrongGame';

// لعبة التلميحات التدريجية
export { default as CluesGame } from './CluesGame';
export { default as CluesGameRouter } from './CluesGameRouter';

// 🆕 الصفحات المنفصلة الجديدة
export { default as AbsiLivesGame } from './AbsiLivesGame';
export { default as ChoicesOnlyGame } from './ChoicesOnlyGame';
export { default as QROnlyGame } from './QROnlyGame';

// 🆕 لعبة أوجد الدولة
export { default as FindCountryGame } from './FindCountryGame';
export { default as FindCountryWorldMap } from './FindCountryWorldMap';

// إضافة هذه الأسطر لملف components/index.js:

// 🆕 لعبة مسيرة اللاعبين
export { default as PlayerCareerGame } from './PlayerCareerGame';
export { default as PlayerCareerGameRouter } from './PlayerCareerGameRouter';
export { default as PlayerCareerSetup } from './PlayerCareerSetup';