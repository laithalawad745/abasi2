// app/europe/page.jsx
import EuropeGame from '../../components/EuropeGame';

export const metadata = {
  title: ' أوروبا - Absi',
  description: 'لعبة حول أوروبا - اكتشف الدول الأوروبية وأجب على الأسئلة!',
};

export default function EuropeGamePage() {
  return <EuropeGame />;
}