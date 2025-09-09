import FastestGameRouter from '../../../components/FastestGameRouter';

export default function JoinRoomPage({ params }) {
  return <FastestGameRouter roomIdFromUrl={params.roomId} />;
}