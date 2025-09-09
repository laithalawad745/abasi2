// app/guess-who/page.jsx
import GuessWhoRouter from '../../components/GuessWhoRouter';

export const metadata = {
  title: 'من هو؟ - Absi',
  description: 'لعبة من هو؟ التفاعلية - خمن الشخصية المختارة من خصمك!',
};

export default function GuessWhoPage() {
  return <GuessWhoRouter />;
}