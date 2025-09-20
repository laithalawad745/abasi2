// app/player-career/page.jsx
import PlayerCareerGameRouter from '../../components/PlayerCareerGameRouter';

export const metadata = {
  title: 'مسيرة اللاعبين - Absi',
  description: 'لعبة مسيرة اللاعبين - تتبع مسيرة النجوم واكتشف اللاعب عن بُعد!',
};

export default function PlayerCareerPage() {
  return <PlayerCareerGameRouter />;
}   