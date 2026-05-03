import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sword, Shield, Lock, User, Mail, ChevronRight, 
  Zap, Target, Loader2, XCircle, Key
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || "Invalid Authentication Sequence");
      }
    } catch (err) {
      setError("Portal Error: Connection timed out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30 overflow-hidden relative p-4">
      <div className="scanline"></div>
      
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] -z-10 animate-pulse delay-1000"></div>

      <div className="flex flex-col items-center mb-10 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.4)] mb-6 transform hover:-rotate-12 transition-transform duration-500">
          <Sword size={40} className="text-white transform -rotate-45" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          CODE<span className="text-cyan-400">BRAWL</span>
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">Authenticate Warrior Identity</span>
        </div>
      </div>

      <div className="w-full max-w-md brawl-card p-10 relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 animate-in slide-in-from-top-2 duration-300">
            <XCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="group">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Neural Address</p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input
                type="email" required
                placeholder="WARRIOR@ARENA.COM"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-pink-500/50 transition-all uppercase placeholder:text-gray-800"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="group">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Key</p>
              <button type="button" className="text-[8px] font-bold text-cyan-500 hover:text-cyan-300 uppercase tracking-widest italic transition-colors">Forgot Protocol?</button>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input
                type="password" required
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-pink-500/50 transition-all placeholder:text-gray-800"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group mt-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-800 animate-gradient-x transition-all"></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
            <div className="relative py-5 px-4 flex items-center justify-center space-x-3 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
              <span>Engage Combat</span>
            </div>
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            New Challenger? <Link to="/register" className="text-pink-400 hover:text-pink-300 hover:text-glow-pink transition-all ml-2 font-black italic underline-offset-4 hover:underline">Create Warrior</Link>
          </p>
        </div>
      </div>

      <footer className="mt-12 text-[8px] font-bold text-gray-700 uppercase tracking-[0.5em]">
        Arena Protocol v2.4.0 • Secure Gateway Active
      </footer>
    </div>
  );
};

export default Login;
