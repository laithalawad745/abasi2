// app/player-career/page.jsx - الصفحة الرئيسية المحدثة
import PlayerCareerModeSelector from '../../components/PlayerCareerModeSelector';

export const metadata = {
  title: 'مسيرة اللاعبين - Absi',
  description: 'لعبة مسيرة اللاعبين - العب أونلاين أو محلياً!',
};

export default function PlayerCareerPage() {
  return <PlayerCareerModeSelector />;
}