// app/battle-royale/join/[roomId]/page.jsx
import BattleRoyaleRouter from '../../../../components/BattleRoyaleRouter';

export const metadata = {
  title: 'الانضمام للعبة - Battle Royale',
  description: 'انضم لمعركة المعرفة!',
};

export default function JoinBattleRoyalePage({ params }) {
  return <BattleRoyaleRouter roomIdFromUrl={params.roomId} />;
}