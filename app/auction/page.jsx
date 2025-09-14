// app/auction/page.jsx
import AuctionGame from '../../components/AuctionGame';

export const metadata = {
  title: 'لعبة المزاد - Absi',
  description: 'لعبة المزاد التفاعلية - زايد على الأسئلة واربح النقاط!',
};

export default function AuctionGamePage() {
  return <AuctionGame />;
}