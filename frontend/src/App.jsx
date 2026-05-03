import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Practice from './pages/Practice';
import PracticeProblem from './pages/PracticeProblem';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="scanline"></div>
      <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]"></div>
      <div className="flex flex-col items-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 animate-pulse italic">Neural Link Syncing</p>
        <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-2">Protocol Buffer v2.4.0</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0b0e14] text-white font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/practice/:topicId" element={<ProtectedRoute><PracticeProblem /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
