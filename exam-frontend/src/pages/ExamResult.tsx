import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, XCircle, ArrowLeft, Trophy } from 'lucide-react';

interface Question { id: number; content: string; type: string; options: string; answer: string; score: number; }
interface ExamAnswer { question: Question; answer: string; isCorrect: boolean; score: number; }
interface Exam {
  id: number; score: number; status: string;
  paper: { title: string; totalScore: number; };
  answers: ExamAnswer[];
}

export default function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (id) api.getExam(Number(id)).then(setExam);
  }, [id]);

  if (!exam) return <div className="text-center py-10 text-gray-500">加载中...</div>;

  const percentage = Math.round((exam.score / exam.paper.totalScore) * 100);
  const passed = percentage >= 60;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/exams')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回考试列表
      </button>

      <div className={`rounded-2xl p-8 mb-6 text-center ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          <Trophy className={`w-10 h-10 ${passed ? 'text-green-600' : 'text-red-500'}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{exam.paper.title}</h2>
        <div className="text-5xl font-bold my-4">
          <span className={passed ? 'text-green-600' : 'text-red-500'}>{exam.score}</span>
          <span className="text-xl text-gray-400"> / {exam.paper.totalScore}</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className={`px-3 py-1 rounded-full font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {passed ? '通过' : '未通过'}
          </span>
          <span className="text-gray-500">正确率 {percentage}%</span>
          <span className="text-gray-500">
            正确 {exam.answers.filter(a => a.isCorrect).length}/{exam.answers.length}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">答题详情</h3>
      <div className="space-y-3">
        {exam.answers.map((a, i) => (
          <div key={i} className={`bg-white rounded-xl border-2 p-4 ${a.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex items-start gap-3">
              {a.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">第{i + 1}题</span>
                  <span className="text-xs text-gray-400">({a.question.score}分)</span>
                  <span className={`text-xs font-medium ${a.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    得{a.score}分
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{a.question.content}</p>
                {a.question.options && (
                  <div className="space-y-1 mb-2">
                    {JSON.parse(a.question.options).map((opt: string, j: number) => (
                      <p key={j} className="text-xs text-gray-600 pl-2">{opt}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600">你的答案: {a.answer || '(未作答)'}</span>
                  <span className="text-green-600">正确答案: {a.question.answer}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
