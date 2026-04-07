import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankItem {
  rank: number; examId: number; userId: number; userName: string;
  paperTitle: string; score: number; totalScore: number; endTime: string;
}
interface Paper { id: number; title: string; }

export default function Ranking() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<number | undefined>();

  useEffect(() => { api.getPapers().then(setPapers); }, []);
  useEffect(() => { api.getRanking(selectedPaper).then(setRanking); }, [selectedPaper]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-gray-500 font-medium">{rank}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">成绩排名</h2>
        <select value={selectedPaper || ''} onChange={e => setSelectedPaper(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">全部试卷</option>
          {papers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {ranking.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无排名数据</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-16">排名</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">考生</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">试卷</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">成绩</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">完成时间</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map(item => {
                const pct = Math.round((item.score / item.totalScore) * 100);
                return (
                  <tr key={item.examId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{getRankIcon(item.rank)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.paperTitle}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{item.score}/{item.totalScore}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pct >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.endTime ? new Date(item.endTime).toLocaleString('zh-CN') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
