import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, Pencil, Trash2, Plus, UserPlus } from 'lucide-react';

interface Student { id: number; username: string; name: string; email: string; role: string; createdAt: string; }

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '' });

  const load = () => api.getStudents().then(setStudents);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) {
      await api.updateUser(editing.id, { name: form.name, email: form.email });
    } else {
      await api.register({ username: form.username, password: form.password || '123456', name: form.name, email: form.email });
    }
    setShowForm(false); setEditing(null);
    setForm({ username: '', password: '', name: '', email: '' });
    load();
  };

  const handleEdit = (s: Student) => {
    setEditing(s);
    setForm({ username: s.username, password: '', name: s.name, email: s.email || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此学员？')) return;
    await api.deleteUser(id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">学员管理</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ username: '', password: '', name: '', email: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> 添加学员
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? '编辑学员' : '添加学员'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码 (默认: 123456)</label>
                  <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="123456" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">保存</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">用户名</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">姓名</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">邮箱</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">注册时间</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{s.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.username}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.email || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-10 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无学员</p>
          </div>
        )}
      </div>
    </div>
  );
}
