import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LogOut, Plus, Users, Trophy, Activity, Target, Flame, 
  ChevronDown, User as UserIcon, BookOpen, Sword, Zap, 
  Terminal, Shield, Globe, TrendingUp, CheckCircle2, XCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [stats, setStats] = useState({ matchesPlayed: 0, wins: 0, ratingChange: '+0', winStreak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [statsRes, lbRes, histRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/stats', config),
          axios.get('http://localhost:5000/api/users/leaderboard'),
          axios.get('http://localhost:5000/api/users/history', config)
        ]);
        setStats(statsRes.data);
        setLeaderboard(lbRes.data);
        setHistory(histRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [user.token]);

  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/rooms', { useAi: true }, config);
      navigate(`/room/${data.roomId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <div className="scanline"></div>

      {/* Futuristic Navbar */}
      <nav className="h-24 px-10 flex items-center justify-between z-50 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sword size={20} className="text-white transform -rotate-45" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              CODE<span className="text-pink-500">BRAWL</span>
            </h1>
          </div>
          <p className="text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase mt-1 ml-13">Brawl Node: Active</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="brawl-card px-4 py-2 flex items-center space-x-4 hover:border-cyan-500/50 transition-all group"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10 group-hover:border-cyan-500/30 transition-all">
              {user.avatarEmoji || '👤'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black uppercase tracking-tight text-white">{user.username}</p>
              <p className="text-[10px] text-cyan-400 font-bold italic">{user.rating} ELO</p>
            </div>
            <ChevronDown size={14} className="text-gray-500 group-hover:text-cyan-500 transition-colors" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 brawl-card py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-6 py-4 border-b border-white/5">
                <p className="text-xs font-black uppercase text-white">{user.username}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{user.email}</p>
              </div>
              <button onClick={() => navigate('/profile')} className="w-full text-left px-6 py-3 text-xs font-bold uppercase text-gray-400 hover:text-cyan-400 hover:bg-white/5 flex items-center transition-all">
                <UserIcon size={14} className="mr-3" /> Profile
              </button>
              <button 
                onClick={logout}
                className="w-full text-left px-6 py-3 text-xs font-bold uppercase text-red-500 hover:bg-red-500/10 flex items-center transition-all"
              >
                <LogOut size={14} className="mr-3" /> Terminate Session
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10 w-full space-y-10 z-10">
        
        {/* Stats Grid - Futuristic Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Matches Played', value: stats.matchesPlayed, icon: <Activity size={18} className="text-blue-400" />, glow: 'glow-cyan' },
            { label: 'Victories', value: stats.wins, icon: <Trophy size={18} className="text-yellow-400" />, glow: '' },
            { label: 'Rating Change', value: stats.ratingChange, icon: <TrendingUp size={18} className="text-green-400" />, green: true, glow: '' },
            { label: 'Win Streak', value: `${stats.winStreak}`, icon: <Flame size={18} className="text-orange-400" />, glow: '' },
          ].map((s) => (
            <div key={s.label} className={`brawl-card p-6 group hover:border-white/10 transition-all ${s.glow}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">{s.icon}</div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</h3>
              </div>
              <p className={`text-4xl font-black italic tracking-tighter ${s.green ? 'text-green-400' : 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Arena */}
          <div className="group relative brawl-card p-10 flex flex-col border-cyan-500/20 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 blur-[80px] group-hover:bg-cyan-500/20 transition-all"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Plus size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Engage Arena</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">Initiate a private brawl. A specialized AI protocol will generate a fresh challenge.</p>
            <button 
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="mt-auto w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-all disabled:opacity-50"
            >
              {isCreating ? 'Accessing Neural Link...' : 'Create Lobby'}
            </button>
          </div>

          {/* Join Arena */}
          <div className="brawl-card p-10 flex flex-col border-pink-500/10 group">
             <div className="w-16 h-16 bg-pink-500/20 border border-pink-500/30 rounded-2xl flex items-center justify-center mb-8">
               <Users size={32} className="text-pink-500" />
             </div>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Infiltrate</h2>
             <p className="text-sm text-gray-500 mb-10 leading-relaxed">Enter an encryption key to breach an active arena and engage in combat.</p>
             <form onSubmit={handleJoinRoom} className="mt-auto space-y-4">
                <input
                  type="text"
                  placeholder="Encryption Key"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest text-pink-400 outline-none focus:border-pink-500/50 transition-all uppercase placeholder:normal-case placeholder:text-gray-700"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full py-5 bg-white/5 border border-white/10 hover:border-pink-500/50 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all"
                >
                  Join Brawl
                </button>
             </form>
          </div>

          {/* Practice Mode */}
          <div
            onClick={() => navigate('/practice')}
            className="group relative brawl-card p-10 flex flex-col border-purple-500/20 cursor-pointer hover:shadow-[0_0_60px_rgba(168,85,247,0.15)] transition-all duration-500"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <BookOpen size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Neural Training</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">Access the archives to sharpen your protocols against 120+ curated challenges.</p>
            <div className="mt-auto flex items-center text-purple-400 text-xs font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">
              <span>Access Files →</span>
            </div>
          </div>
        </div>

        {/* History & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 brawl-card p-10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center">
                <Terminal size={24} className="mr-4 text-cyan-500" /> Recent Operations
              </h2>
              <button className="text-[10px] font-bold uppercase text-gray-600 hover:text-white transition-colors">Clear Logs</button>
            </div>
            <div className="space-y-4">
              {history?.length > 0 ? history.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center space-x-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sub.result === 'Accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {sub.result === 'Accepted' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors">{sub.problemId?.title || 'Unknown Protocol'}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Node: {sub.roomId?.roomId || 'Internal'} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic ${sub.result === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>{sub.result}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Status: Logged</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-700">No Mission Data Found</p>
                </div>
              )}
            </div>
          </div>

          <div className="brawl-card p-10 flex flex-col">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center mb-10">
              <Globe size={24} className="mr-4 text-yellow-500" /> Global Ranks
            </h2>
            <div className="space-y-4 flex-1">
              {leaderboard?.map((u, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:transform hover:scale-[1.02] transition-all group">
                  <div className="flex items-center space-x-4">
                    <span className={`w-6 text-center font-black italic ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl border border-white/10 group-hover:border-cyan-500/30 transition-all">
                      {u.avatarEmoji || '👤'}
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight text-gray-300 group-hover:text-white transition-colors">{u.username}</span>
                  </div>
                  <span className="text-lg font-black italic text-yellow-500 text-glow-yellow">{u.rating}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-white/5">
               <p className="text-[10px] font-bold text-center text-gray-600 uppercase tracking-widest">Resets in 14 days • Round 08</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
