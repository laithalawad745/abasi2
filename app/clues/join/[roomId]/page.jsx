// app/clues/join/[roomId]/page.jsx
import CluesGameRouter from '../../../../components/CluesGameRouter';

export default function JoinCluesRoomPage({ params }) {
  return <CluesGameRouter roomIdFromUrl={params.roomId} />;
}