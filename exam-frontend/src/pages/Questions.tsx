import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';

interface Category { id: number; name: string; }
interface Question {
  id: number; content: string; type: string; options: string;
  answer: string; score: number; difficulty: string;
  category: Category | null;
}

const typeLabels: Record<string, string> = {
  SINGLE_CHOICE: '单选题', MULTI_CHOICE: '多选题', TRUE_FALSE: '判断题', FILL_BLANK: '填空题',
};
const diffLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };
const diffColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HARD: 'bg-red-100 text-red-700',
};

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ content: '', type: 'SINGLE_CHOICE', options: '', answer: '', score: 5, difficulty: 'MEDIUM', categoryId: 0 });

  const load = () => api.getQuestions(filterCat).then(setQuestions);

  useEffect(() => { api.getCategories().then(setCategories); }, []);
  useEffect(() => { load(); }, [filterCat]);

  const handleSave = async () => {
    const data = { ...form, categoryId: form.categoryId || null };
    if (editing) {
      await api.updateQuestion(editing.id, data);
    } else {
      await api.createQuestion(data);
    }
    setShowForm(false); setEditing(null);
    setForm({ content: '', type: 'SINGLE_CHOICE', options: '', answer: '', score: 5, difficulty: 'MEDIUM', categoryId: 0 });
    load();
  };

  const handleEdit = (q: Question) => {
    setEditing(q);
    setForm({
      content: q.content, type: q.type, options: q.options || '',
      answer: q.answer, score: q.score, difficulty: q.difficulty,
      categoryId: q.category?.id || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此题目？')) return;
    await api.deleteQuestion(id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">题库管理</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ content: '', type: 'SINGLE_CHOICE', options: '', answer: '', score: 5, difficulty: 'MEDIUM', categoryId: 0 }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新增题目
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">全部分类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="text-sm text-gray-500">共 {questions.length} 道题目</span>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? '编辑题目' : '新增题目'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">题目类型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="SINGLE_CHOICE">单选题</option>
                <option value="MULTI_CHOICE">多选题</option>
                <option value="TRUE_FALSE">判断题</option>
                <option value="FILL_BLANK">填空题</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属分类</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value={0}>请选择分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">选项 (JSON数组格式)</label>
              <input value={form.options} onChange={e => setForm({ ...form, options: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder='["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"]' />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">正确答案</label>
              <input value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="如: A 或 A,B,C" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">分值</label>
                <input type="number" value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="EASY">简单</option>
                  <option value="MEDIUM">中等</option>
                  <option value="HARD">困难</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">保存</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{typeLabels[q.type]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${diffColors[q.difficulty]}`}>{diffLabels[q.difficulty]}</span>
                  {q.category && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{q.category.name}</span>}
                  <span className="text-xs text-gray-500">{q.score}分</span>
                </div>
                <p className="text-sm text-gray-800">{q.content}</p>
                {q.options && (
                  <div className="mt-2 space-y-1">
                    {JSON.parse(q.options).map((opt: string, j: number) => (
                      <p key={j} className="text-xs text-gray-600 pl-4">{opt}</p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-green-600 mt-1">答案: {q.answer}</p>
              </div>
              <div className="flex gap-1 ml-4">
                <button onClick={() => handleEdit(q)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
