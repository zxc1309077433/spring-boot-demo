import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { User } from '../App';
import { Plus, ArrowLeft, Clock, Award } from 'lucide-react';

interface Question { id: number; content: string; type: string; score: number; }
interface PaperQuestion { id: number; question: Question; orderNum: number; score: number; }
interface Paper { id: number; title: string; totalScore: number; duration: number; description: string; paperQuestions: PaperQuestion[]; }
interface Props { user: User; }

export default function PaperDetail({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<number[]>([]);
  const [showAddQ, setShowAddQ] = useState(false);

  useEffect(() => {
    if (id) {
      api.getPaper(Number(id)).then(setPaper);
      api.getQuestions().then(setAllQuestions);
    }
  }, [id]);

  const handleAddQuestions = async () => {
    if (!id || selectedQIds.length === 0) return;
    await api.addQuestionsToPaper(Number(id), selectedQIds);
    api.getPaper(Number(id)).then(setPaper);
    setShowAddQ(false);
    setSelectedQIds([]);
  };

  const toggleQ = (qId: number) => {
    setSelectedQIds(prev => prev.includes(qId) ? prev.filter(x => x !== qId) : [...prev, qId]);
  };

  if (!paper) return <div className="text-center py-10 text-gray-500">加载中...</div>;

  const existingQIds = paper.paperQuestions.map(pq => pq.question.id);
  const availableQuestions = allQuestions.filter(q => !existingQIds.includes(q.id));

  return (
    <div>
      <button onClick={() => navigate('/papers')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回试卷列表
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{paper.title}</h2>
        <p className="text-sm text-gray-500 mb-3">{paper.description}</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{paper.duration}分钟</span>
          <span className="flex items-center gap-1"><Award className="w-4 h-4" />总分 {paper.totalScore}分</span>
          <span>共 {paper.paperQuestions.length} 题</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">试卷题目</h3>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowAddQ(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> 添加题目
          </button>
        )}
      </div>

      {showAddQ && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h4 className="font-semibold mb-3">选择要添加的题目</h4>
          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {availableQuestions.map(q => (
              <label key={q.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" checked={selectedQIds.includes(q.id)} onChange={() => toggleQ(q.id)}
                  className="rounded" />
                <span className="text-sm text-gray-700 flex-1">{q.content}</span>
                <span className="text-xs text-gray-500">{q.score}分</span>
              </label>
            ))}
            {availableQuestions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">没有可添加的题目</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddQuestions} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              添加 {selectedQIds.length} 道题
            </button>
            <button onClick={() => { setShowAddQ(false); setSelectedQIds([]); }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paper.paperQuestions.map((pq, i) => (
          <div key={pq.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-500">第{i + 1}题</span>
              <span className="text-xs text-gray-400">({pq.score}分)</span>
            </div>
            <p className="text-sm text-gray-800">{pq.question.content}</p>
          </div>
        ))}
        {paper.paperQuestions.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            暂无题目，请点击"添加题目"按钮添加
          </div>
        )}
      </div>

      {user.role === 'STUDENT' && paper.paperQuestions.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => api.startExam(paper.id, user.id).then(exam => navigate(`/exams/${exam.id}/take`))}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">
            开始考试
          </button>
        </div>
      )}
    </div>
  );
}
