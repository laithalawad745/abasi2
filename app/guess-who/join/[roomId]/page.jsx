// app/guess-who/join/[roomId]/page.jsx
import GuessWhoRouter from '../../../../components/GuessWhoRouter';

export default function JoinGuessWhoRoomPage({ params }) {
  return <GuessWhoRouter roomIdFromUrl={params.roomId} />;
}