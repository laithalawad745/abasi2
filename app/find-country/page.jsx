// app/find-country/page.jsx
import FindCountryGame from '../../components/FindCountryGame';

export const metadata = {
  title: 'أوجد الدولة - Absi',
  description: 'لعبة أوجد الدولة - اختبر معرفتك بالجغرافيا العالمية!',
};

export default function FindCountryPage() {
  return <FindCountryGame />;
}