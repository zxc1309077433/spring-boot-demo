const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/api/users/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { username: string; password: string; name: string; email?: string }) =>
    request('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUsers: () => request('/api/users'),
  getStudents: () => request('/api/users/students'),
  getUser: (id: number) => request(`/api/users/${id}`),
  updateUser: (id: number, data: Record<string, unknown>) =>
    request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request(`/api/users/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/api/categories'),
  createCategory: (data: { name: string; description?: string }) =>
    request('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: { name: string; description?: string }) =>
    request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request(`/api/categories/${id}`, { method: 'DELETE' }),

  // Questions
  getQuestions: (categoryId?: number) =>
    request(`/api/questions${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getQuestion: (id: number) => request(`/api/questions/${id}`),
  createQuestion: (data: Record<string, unknown>) =>
    request('/api/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: number, data: Record<string, unknown>) =>
    request(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: number) => request(`/api/questions/${id}`, { method: 'DELETE' }),

  // Papers
  getPapers: () => request('/api/papers'),
  getPaper: (id: number) => request(`/api/papers/${id}`),
  createPaper: (data: Record<string, unknown>) =>
    request('/api/papers', { method: 'POST', body: JSON.stringify(data) }),
  updatePaper: (id: number, data: Record<string, unknown>) =>
    request(`/api/papers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addQuestionsToPaper: (paperId: number, questionIds: number[]) =>
    request(`/api/papers/${paperId}/questions`, { method: 'POST', body: JSON.stringify({ questionIds }) }),
  deletePaper: (id: number) => request(`/api/papers/${id}`, { method: 'DELETE' }),

  // Exams
  startExam: (paperId: number, userId: number) =>
    request('/api/exams/start', { method: 'POST', body: JSON.stringify({ paperId, userId }) }),
  submitExam: (examId: number, answers: Record<string, string>) =>
    request(`/api/exams/${examId}/submit`, { method: 'POST', body: JSON.stringify(answers) }),
  getExam: (id: number) => request(`/api/exams/${id}`),
  getExams: (userId?: number) =>
    request(`/api/exams${userId ? `?userId=${userId}` : ''}`),
  getRanking: (paperId?: number) =>
    request(`/api/exams/ranking${paperId ? `?paperId=${paperId}` : ''}`),
  getStats: () => request('/api/exams/stats'),
};
