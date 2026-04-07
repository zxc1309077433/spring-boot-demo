import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User } from '../App';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, Award, Eye } from 'lucide-react';

interface Category { id: number; name: string; }
interface Paper { id: number; title: string; totalScore: number; duration: number; description: string; category: Category | null; }
interface Props { user: User; }

export default function Papers({ user }: Props) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', totalScore: 100, duration: 60, categoryId: 0 });

  const load = () => api.getPapers().then(setPapers);

  useEffect(() => { load(); api.getCategories().then(setCategories); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    await api.createPaper({ ...form, categoryId: form.categoryId || null });
    setShowForm(false);
    setForm({ title: '', description: '', totalScore: 100, duration: 60, categoryId: 0 });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">试卷管理</h2>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新建试卷
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4">新建试卷</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">试卷标题</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属分类</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value={0}>请选择分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">考试时长(分钟)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">保存</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              {p.category && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{p.category.name}</span>
              )}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{p.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{p.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{p.duration}分钟</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{p.totalScore}分</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/papers/${p.id}`)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> 查看详情
              </button>
              {user.role === 'STUDENT' && (
                <button onClick={() => {
                  api.startExam(p.id, user.id).then(exam => navigate(`/exams/${exam.id}/take`));
                }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  开始考试
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
