// app/football-grid/join/[roomId]/page.jsx
import FootballGridGameRouter from '../../../../components/FootballGridGameRouter';

export const metadata = {
  title: 'الانضمام للعبة Football Grid - Absi',
  description: 'انضم للعبة Football Grid عن بُعد!',
};

export default function JoinFootballGridPage({ params }) {
  return <FootballGridGameRouter roomIdFromUrl={params.roomId} />;
}