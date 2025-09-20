// app/player-career/join/[roomId]/page.jsx
import PlayerCareerGameRouter from '../../../../components/PlayerCareerGameRouter';

export const metadata = {
  title: 'انضمام للعبة مسيرة اللاعبين - Absi',
  description: 'انضم للعبة مسيرة اللاعبين عن بُعد!',
};

export default function JoinPlayerCareerPage({ params }) {
  return <PlayerCareerGameRouter roomIdFromUrl={params.roomId} />;
}