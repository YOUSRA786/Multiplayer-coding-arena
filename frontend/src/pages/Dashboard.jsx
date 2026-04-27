import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogOut, Plus, Users, Trophy, Activity, Target, Flame, ChevronDown, User as UserIcon } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [stats, setStats] = useState({ matchesPlayed: 0, wins: 0, ratingChange: '+0', winStreak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
      const { data } = await axios.post('http://localhost:5000/api/rooms', { useAi }, config);
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#111827] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Target size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Coding Arena</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 focus:outline-none hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.username}</p>
              <p className="text-xs text-yellow-400 font-medium">{user.rating} ELO</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm text-white font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <UserIcon size={16} className="mr-2" /> Profile
              </button>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
              >
                <LogOut size={16} className="mr-2" /> Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
            <div className="flex items-center text-gray-400 mb-2">
              <Activity size={18} className="mr-2 text-blue-400" />
              <h3 className="text-sm font-medium">Matches Played</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.matchesPlayed}</p>
          </div>
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
            <div className="flex items-center text-gray-400 mb-2">
              <Trophy size={18} className="mr-2 text-yellow-400" />
              <h3 className="text-sm font-medium">Victories</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.wins}</p>
          </div>
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
            <div className="flex items-center text-gray-400 mb-2">
              <Target size={18} className="mr-2 text-green-400" />
              <h3 className="text-sm font-medium">Rating Change</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.ratingChange}</p>
          </div>
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
            <div className="flex items-center text-gray-400 mb-2">
              <Flame size={18} className="mr-2 text-orange-400" />
              <h3 className="text-sm font-medium">Win Streak</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.winStreak} <span className="text-lg text-gray-500 font-normal">matches</span></p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-8 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Plus size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Arena</h2>
              <p className="text-blue-200 mb-6">Start a new private match and invite your friends to compete.</p>
              
              <div className="flex items-center mb-6 space-x-3 bg-black/30 p-4 rounded-xl border border-white/10">
                <input 
                  type="checkbox" 
                  id="useAiToggle" 
                  checked={useAi} 
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-600 focus:ring-2"
                />
                <label htmlFor="useAiToggle" className="text-sm font-medium text-purple-200 cursor-pointer flex-1">
                  ✨ Generate new AI Problem (Takes ~5s)
                </label>
              </div>

              <button 
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (useAi ? 'Generating AI Magic...' : 'Creating...') : 'Start Match'}
              </button>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
              <Users size={32} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join Arena</h2>
            <p className="text-gray-400 mb-6">Enter a room code to jump into an active battle.</p>
            <form onSubmit={handleJoinRoom} className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter Room Code"
                required
                className="flex-1 px-5 py-4 text-white bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all uppercase placeholder:normal-case"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button
                type="submit"
                className="px-8 py-4 font-bold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-colors shadow-lg shadow-green-900/50"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* History & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity size={20} className="mr-2 text-blue-400" /> Recent Matches
            </h2>
            <div className="space-y-4">
              {history.length > 0 ? history.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:bg-gray-800 transition-colors">
                  <div>
                    <h4 className="text-white font-medium">{sub.problemId?.title || 'Unknown Problem'}</h4>
                    <p className="text-sm text-gray-400 mt-1">Room: {sub.roomId?.roomId || 'Unknown'} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${sub.result === 'Accepted' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {sub.result}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">No recent matches found. Start coding!</div>
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Trophy size={20} className="mr-2 text-yellow-400" /> Global Top 10
            </h2>
            <div className="space-y-3">
              {leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 text-center font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-200 font-medium">{user.username}</span>
                  </div>
                  <span className="text-yellow-500 font-bold">{user.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
