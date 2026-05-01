import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, Trophy, Activity, Target, Flame, BookOpen,
  CheckCircle2, User as UserIcon
} from 'lucide-react';

const TOPIC_LABELS = {
  'arrays': 'Arrays',
  'strings': 'Strings',
  'linked-lists': 'Linked Lists',
  'stacks-queues': 'Stacks & Queues',
  'trees': 'Trees',
  'graphs': 'Graphs',
  'dynamic-programming': 'Dynamic Programming',
  'sorting': 'Sorting & Searching',
  'recursion': 'Recursion',
  'hashing': 'Hashing',
  'greedy': 'Greedy',
  'bit-manipulation': 'Bit Manipulation',
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ matchesPlayed: 0, wins: 0, ratingChange: '+0', winStreak: 0 });
  const [progress, setProgress] = useState({ totalSolved: 0, byTopic: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [statsRes, progressRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/stats', config),
          axios.get('http://localhost:5000/api/practice/progress', config),
        ]);
        setStats(statsRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-[#111827] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Hero */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-900/50 text-4xl font-extrabold text-white shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-white">{user.username}</h2>
            <p className="text-gray-400 mt-1">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3">
              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-bold">
                {user.rating || 1200} ELO
              </span>
              <span className="text-gray-500 text-sm">Joined {joinDate}</span>
            </div>
          </div>
        </div>

        {/* Arena Stats */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Trophy size={18} className="mr-2 text-yellow-400" /> Arena Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Matches Played', value: stats.matchesPlayed, icon: <Activity size={18} className="text-blue-400" /> },
              { label: 'Victories', value: stats.wins, icon: <Trophy size={18} className="text-yellow-400" /> },
              { label: 'Rating Change', value: stats.ratingChange, icon: <Target size={18} className="text-green-400" />, green: true },
              { label: 'Win Streak', value: `${stats.winStreak}`, icon: <Flame size={18} className="text-orange-400" /> },
            ].map((s) => (
              <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  {s.icon}
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className={`text-2xl font-extrabold ${s.green ? 'text-green-400' : 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Progress */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BookOpen size={18} className="mr-2 text-purple-400" /> Practice Progress
            <span className="ml-3 px-3 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold">
              {progress.totalSolved} solved
            </span>
          </h3>

          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : progress.byTopic.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
              <BookOpen size={40} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500">No practice sessions yet.</p>
              <button
                onClick={() => navigate('/practice')}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progress.byTopic.map((t) => (
                <div key={t._id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white text-sm">{TOPIC_LABELS[t._id] || t._id}</p>
                      <p className="text-xs text-gray-500">
                        Last: {new Date(t.lastSolved).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-purple-400">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
