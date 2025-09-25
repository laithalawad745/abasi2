import { Suspense } from 'react';
import PhotoCommentGameRouter from '../../components/PhotoCommentGameRouter';

export const metadata = {
  title: 'صورة وتعليق - Absi',
  description: 'لعبة التعليقات والتخمين - ضع تعليقك وخمن من كتب كل تعليق!',
};

export default function PhotoCommentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">جار التحميل...</div>}>
      <PhotoCommentGameRouter />
    </Suspense>
  );
}