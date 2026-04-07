import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User } from '../App';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Users, Trophy, ClipboardList, TrendingUp } from 'lucide-react';

interface Props { user: User; }

export default function Dashboard({ user }: Props) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Array<{ id: number; name: string; questionCount: number }>>([]);
  const [papers, setPapers] = useState<Array<{ id: number; title: string; totalScore: number; duration: number }>>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
    api.getPapers().then(setPapers).catch(() => {});
  }, []);

  const cards = user.role === 'ADMIN' ? [
    { icon: BookOpen, label: '题目总数', value: categories.reduce((s, c) => s + c.questionCount, 0), color: 'blue', path: '/questions' },
    { icon: FileText, label: '试卷总数', value: papers.length, color: 'green', path: '/papers' },
    { icon: ClipboardList, label: '考试次数', value: stats.totalExams || 0, color: 'purple', path: '/exams' },
    { icon: TrendingUp, label: '平均分', value: stats.averageScore || 0, color: 'orange', path: '/ranking' },
  ] : [
    { icon: FileText, label: '可考试卷', value: papers.length, color: 'blue', path: '/papers' },
    { icon: ClipboardList, label: '我的考试', value: stats.totalExams || 0, color: 'green', path: '/exams' },
    { icon: Trophy, label: '最高分', value: stats.highestScore || 0, color: 'purple', path: '/ranking' },
    { icon: TrendingUp, label: '及格率', value: `${stats.passRate || 0}%`, color: 'orange', path: '/ranking' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        欢迎回来，{user.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">考试分类</h3>
          <div className="space-y-3">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{c.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {c.questionCount} 题
                </span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无分类</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">可用试卷</h3>
          <div className="space-y-3">
            {papers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">{p.title}</span>
                  <span className="text-xs text-gray-400 ml-2">{p.duration}分钟</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {p.totalScore} 分
                </span>
              </div>
            ))}
            {papers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无试卷</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
