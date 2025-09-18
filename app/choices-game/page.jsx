// app/choices-game/page.jsx
import ChoicesOnlyGame from '../../components/ChoicesOnlyGame';

export const metadata = {
  title: 'الاختيارات - Absi',
  description: 'فقرة الاختيارات - قولوا كلمة مع نظام النقاط!',
};

export default function ChoicesGamePage() {
  return <ChoicesOnlyGame />;
}