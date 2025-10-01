// app/football-grid/page.jsx
import FootballGridGameRouter from '../../components/FootballGridGameRouter';

export const metadata = {
  title: 'Football Grid - Absi',
  description: 'لعبة Tic-Tac-Toe مع لاعبي كرة القدم - العب مع أصدقائك!',
};

export default function FootballGridPage() {
  return <FootballGridGameRouter />;
}