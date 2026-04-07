import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

interface Category { id: number; name: string; description: string; questionCount: number; }

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = () => api.getCategories().then(setCategories);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await api.updateCategory(editing.id, { name, description });
    } else {
      await api.createCategory({ name, description });
    }
    setShowForm(false); setEditing(null); setName(''); setDescription('');
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此分类吗？')) return;
    await api.deleteCategory(id);
    load();
  };

  const handleEdit = (c: Category) => {
    setEditing(c); setName(c.name); setDescription(c.description || ''); setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">考试分类</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setName(''); setDescription(''); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 新增分类
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? '编辑分类' : '新增分类'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">保存</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.description}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              共 <span className="font-medium text-blue-600">{c.questionCount}</span> 道题目
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
