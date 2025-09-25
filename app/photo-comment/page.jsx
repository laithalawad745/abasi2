// app/photo-comment/page.jsx
import PhotoCommentGameRouter from '../../components/PhotoCommentGameRouter';

export const metadata = {
  title: 'صورة وتعليق - Absi',
  description: 'لعبة التعليقات والتخمين - ضع تعليقك وخمن من كتب كل تعليق!',
};

export default function PhotoCommentPage() {
  return <PhotoCommentGameRouter />;
}