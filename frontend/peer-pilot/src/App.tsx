import { mockGrades, mockStudent, mockStudents, mockTeams, reviewAssignments } from "./data/mock";
import AllReviews from "./instructor/reviews/AllReviews";
import Dashboard from "./instructor/grading/Dashboard";
import StudentDashboard from "./student/StudentDashboard";
import { useEffect, useState } from "react";
import type { User } from "./types/types";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./auth/LoginPage";
import Layout from "./Layout";
import AllStudentsDashboard from "./instructor/grading/AllStudentsDashboard";

function App() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public route - redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Instructor routes */}
        <Route
          path="/instructor/*"
          element={
            user?.role === 'instructor' ? (
              <Layout user={user} onLogout={handleLogout} role="instructor">
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="students" element={<AllStudentsDashboard />} />
                  <Route path="reviews" element={<AllReviews />} />
                  <Route path="*" element={<Navigate to="/instructor" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Student routes */}
        <Route
          path="/student/*"
          element={
            user?.role === 'student' ? (
              <Layout user={user} onLogout={handleLogout} role="student">
                <Routes>
                  <Route index element={
                    <StudentDashboard
                      student={mockStudent}
                      teams={mockTeams}
                      students={mockStudents}
                      grades={mockGrades}
                      reviewAssignments={reviewAssignments} />} />
                  <Route path="*" element={<Navigate to="/student" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default route - redirect based on role */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;