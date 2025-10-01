// app/football-grid/join/[roomId]/page.jsx
import FootballGridGameRouter from '../../../../components/FootballGridGameRouter';

export const metadata = {
  title: 'الانضمام للعبة  X - 0 - Absi',
  description: 'انضم للعبة X - O  عن بُعد!',
};

export default function JoinFootballGridPage({ params }) {
  return <FootballGridGameRouter roomIdFromUrl={params.roomId} />;
}