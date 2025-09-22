// app/question-answer/page.jsx
import QuestionAnswerGame from '../../components/QuestionAnswerGame';

export const metadata = {
  title: 'سؤال و جواب - Absi',
  description: 'فقرة سؤال و جواب - اختر 6 أنواع أسئلة واستمتع بالتحدي المعرفي!',
};

export default function QuestionAnswerPage() {
  return <QuestionAnswerGame />;
}