// app/photo-comment/join/[roomId]/page.jsx
import PhotoCommentGameRouter from '../../../../components/PhotoCommentGameRouter';

export const metadata = {
  title: 'انضمام للعبة صورة وتعليق - Absi',
  description: 'انضم للعبة صورة وتعليق عن بُعد!',
};

export default function JoinPhotoCommentPage({ params }) {
  return <PhotoCommentGameRouter roomIdFromUrl={params.roomId} />;
}