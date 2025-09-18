// app/qr-game/page.jsx
import QROnlyGame from '../../components/QROnlyGame';

export const metadata = {
  title: 'ولا كلمة - Absi',
  description: 'فقرة ولا كلمة - امسح الـ QR واكتشف المحتوى!',
};

export default function QRGamePage() {
  return <QROnlyGame />;
}