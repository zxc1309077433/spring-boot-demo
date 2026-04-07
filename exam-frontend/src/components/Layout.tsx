import { Link, useLocation } from 'react-router-dom';
import { User } from '../App';
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList,
  Trophy, Users, LogOut, GraduationCap, FolderOpen
} from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/categories', icon: FolderOpen, label: '考试分类' },
  { path: '/questions', icon: BookOpen, label: '题库管理' },
  { path: '/papers', icon: FileText, label: '试卷管理' },
  { path: '/exams', icon: ClipboardList, label: '考试中心' },
  { path: '/ranking', icon: Trophy, label: '成绩排名' },
];

export default function Layout({ user, onLogout, children }: Props) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">在线考试系统</h1>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            if (item.path === '/categories' && user.role !== 'ADMIN') return null;
            if (item.path === '/questions' && user.role !== 'ADMIN') return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          {user.role === 'ADMIN' && (
            <Link
              to="/students"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/students'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              学员管理
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'ADMIN' ? '管理员' : '学员'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
