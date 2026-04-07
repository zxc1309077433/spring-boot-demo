import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { User } from '../App';
import { Clock, Send, AlertTriangle } from 'lucide-react';

interface Question { id: number; content: string; type: string; options: string; score: number; }
interface PaperQuestion { question: Question; orderNum: number; score: number; }
interface Exam {
  id: number;
  paper: { title: string; duration: number; totalScore: number; paperQuestions: PaperQuestion[] };
  startTime: string;
  status: string;
}
interface Props { user: User; }

export default function TakeExam({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) api.getExam(Number(id)).then(setExam);
  }, [id]);

  useEffect(() => {
    if (!exam) return;
    const startTime = new Date(exam.startTime).getTime();
    const endTime = startTime + exam.paper.duration * 60 * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  const handleSubmit = async () => {
    if (!id) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.submitExam(Number(id), answers);
      navigate(`/exams/${id}/result`);
    } catch {
      alert('提交失败，请重试');
      setSubmitting(false);
    }
  };

  if (!exam) return <div className="text-center py-10 text-gray-500">加载中...</div>;
  if (exam.status === 'FINISHED') {
    navigate(`/exams/${id}/result`);
    return null;
  }

  const questions = exam.paper.paperQuestions;
  const q = questions[currentQ];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300;

  const setAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [String(questionId)]: value }));
  };

  const renderOptions = (question: Question) => {
    if (!question.options) {
      return (
        <input
          value={answers[String(question.id)] || ''}
          onChange={e => setAnswer(question.id, e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          placeholder="请输入答案"
        />
      );
    }

    const options: string[] = JSON.parse(question.options);
    const isMulti = question.type === 'MULTI_CHOICE';
    const currentAnswer = answers[String(question.id)] || '';

    return (
      <div className="space-y-3">
        {options.map((opt, i) => {
          const letter = opt.charAt(0);
          const isSelected = isMulti
            ? currentAnswer.split(',').includes(letter)
            : currentAnswer === letter;

          return (
            <button
              key={i}
              onClick={() => {
                if (isMulti) {
                  const selected = currentAnswer ? currentAnswer.split(',') : [];
                  const newSelected = selected.includes(letter)
                    ? selected.filter(s => s !== letter)
                    : [...selected, letter];
                  setAnswer(question.id, newSelected.sort().join(','));
                } else {
                  setAnswer(question.id, letter);
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">{exam.paper.title}</h2>
          <p className="text-sm text-gray-500">总分 {exam.paper.totalScore}分 | 共 {questions.length} 题</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
          {isUrgent && <AlertTriangle className="w-4 h-4" />}
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Question Area */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">第{currentQ + 1}题</span>
              <span className="text-sm text-gray-500">({q.score}分)</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {q.question.type === 'SINGLE_CHOICE' ? '单选题' :
                 q.question.type === 'MULTI_CHOICE' ? '多选题' :
                 q.question.type === 'TRUE_FALSE' ? '判断题' : '填空题'}
              </span>
            </div>
            <p className="text-lg text-gray-800 mb-6">{q.question.content}</p>
            {renderOptions(q.question)}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              上一题
            </button>
            {currentQ === questions.length - 1 ? (
              <button
                onClick={() => { if (confirm('确定要交卷吗？')) handleSubmit(); }}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {submitting ? '提交中...' : '交卷'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                下一题
              </button>
            )}
          </div>
        </div>

        {/* Answer Card */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-3">答题卡</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, i) => {
                const answered = !!answers[String(questions[i].question.id)];
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded text-xs font-medium ${
                      i === currentQ
                        ? 'bg-blue-600 text-white'
                        : answered
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>已答: {Object.keys(answers).length}/{questions.length}</p>
              <p>未答: {questions.length - Object.keys(answers).length}</p>
            </div>
            <button
              onClick={() => { if (confirm('确定要交卷吗？')) handleSubmit(); }}
              disabled={submitting}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '交卷'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
