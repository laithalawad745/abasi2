// app/dice/page.jsx
import DiceGame from '../../components/DiceGame';

export const metadata = {
  title: 'لعبة النرد - Absi',
  description: 'لعبة النرد التفاعلية - ارمِ النردين واجب على الأسئلة!',
};

export default function DiceGamePage() {
  return <DiceGame />;
}