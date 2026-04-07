import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User } from '../App';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Exam {
  id: number; score: number; status: string;
  startTime: string; endTime: string;
  paper: { id: number; title: string; totalScore: number; };
  user: { id: number; name: string; };
}
interface Props { user: User; }

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  NOT_STARTED: { label: '未开始', color: 'bg-gray-100 text-gray-600', icon: Clock },
  IN_PROGRESS: { label: '进行中', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  FINISHED: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function ExamList({ user }: Props) {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (user.role === 'STUDENT') {
      api.getExams(user.id).then(setExams);
    } else {
      api.getExams().then(setExams);
    }
  }, [user]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {user.role === 'ADMIN' ? '全部考试记录' : '我的考试'}
      </h2>

      {exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无考试记录</p>
          {user.role === 'STUDENT' && (
            <button onClick={() => navigate('/papers')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700">去选择试卷考试 &rarr;</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => {
            const st = statusMap[exam.status] || statusMap.NOT_STARTED;
            const Icon = st.icon;
            return (
              <div key={exam.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{exam.paper.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      {user.role === 'ADMIN' && <span>考生: {exam.user.name}</span>}
                      <span>{new Date(exam.startTime).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${st.color}`}>
                    <Icon className="w-3.5 h-3.5" /> {st.label}
                  </span>
                  {exam.status === 'FINISHED' && (
                    <span className="text-lg font-bold text-gray-800">
                      {exam.score}<span className="text-sm text-gray-400">/{exam.paper.totalScore}</span>
                    </span>
                  )}
                  {exam.status === 'FINISHED' ? (
                    <button onClick={() => navigate(`/exams/${exam.id}/result`)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" /> 查看
                    </button>
                  ) : exam.status === 'IN_PROGRESS' ? (
                    <button onClick={() => navigate(`/exams/${exam.id}/take`)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                      继续考试
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
