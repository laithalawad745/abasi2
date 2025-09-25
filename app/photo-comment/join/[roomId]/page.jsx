import { Suspense } from 'react';
import PhotoCommentGameRouter from '../../../../components/PhotoCommentGameRouter';

export const metadata = {
  title: 'انضمام للعبة صورة وتعليق - Absi',
  description: 'انضم للعبة صورة وتعليق عن بُعد!',
};

export default function JoinPhotoCommentPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">جار التحميل...</div>}>
      <PhotoCommentGameRouter roomIdFromUrl={params.roomId} />
    </Suspense>
  );
}