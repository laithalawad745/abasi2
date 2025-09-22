// app/betting/page.jsx
import BettingGame from '../../components/BettingGame';

export const metadata = {
  title: 'لعبة الرهان - Absi',
  description: 'لعبة الرهان - راهن على إجاباتك واربح أو اخسر النقاط!',
};

export default function BettingGamePage() {
  return <BettingGame />;
}