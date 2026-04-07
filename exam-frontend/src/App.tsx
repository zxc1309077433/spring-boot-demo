import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import Papers from './pages/Papers';
import PaperDetail from './pages/PaperDetail';
import ExamList from './pages/ExamList';
import TakeExam from './pages/TakeExam';
import ExamResult from './pages/ExamResult';
import Ranking from './pages/Ranking';
import Students from './pages/Students';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('exam_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('exam_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('exam_user');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/papers" element={<Papers user={user} />} />
          <Route path="/papers/:id" element={<PaperDetail user={user} />} />
          <Route path="/exams" element={<ExamList user={user} />} />
          <Route path="/exams/:id/take" element={<TakeExam user={user} />} />
          <Route path="/exams/:id/result" element={<ExamResult />} />
          <Route path="/ranking" element={<Ranking />} />
          {user.role === 'ADMIN' && <Route path="/students" element={<Students />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App
