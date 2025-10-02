// app/battle-royale/page.jsx
import BattleRoyaleRouter from '../../components/BattleRoyaleRouter';

export const metadata = {
  title: 'Battle Royale - Absi',
  description: 'معركة المعرفة - آخر لاعب يبقى يفوز!',
};

export default function BattleRoyalePage() {
  return <BattleRoyaleRouter />;
}