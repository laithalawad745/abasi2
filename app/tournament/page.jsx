// app/tournament/page.jsx
import VisualTournamentGame from '../../components/VisualTournamentGame';

export const metadata = {
  title: 'بطولة المعرفة - Absi',
  description: 'بطولة المعرفة التفاعلية - شجرة بطولة بصرية مثل البطولات الحقيقية!',
};

export default function TournamentGamePage() {
  return <VisualTournamentGame />;
}