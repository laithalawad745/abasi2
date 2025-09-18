// app/absi-lives/page.jsx
import AbsiLivesGame from '../../components/AbsiLivesGame';

export const metadata = {
  title: 'لايفات عبسي - Absi',
  description: 'فقرة لايفات عبسي - أسئلة مصورة من المقاطع الشهيرة!',
};

export default function AbsiLivesPage() {
  return <AbsiLivesGame />;
}