import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

const TOPIC_COLORS = {
  blue:    { card: 'from-blue-900/40 to-blue-800/20 border-blue-500/30', icon: 'bg-blue-500', text: 'text-blue-400', ring: '#3b82f6' },
  purple:  { card: 'from-purple-900/40 to-purple-800/20 border-purple-500/30', icon: 'bg-purple-500', text: 'text-purple-400', ring: '#a855f7' },
  green:   { card: 'from-green-900/40 to-green-800/20 border-green-500/30', icon: 'bg-green-600', text: 'text-green-400', ring: '#22c55e' },
  yellow:  { card: 'from-yellow-900/40 to-yellow-800/20 border-yellow-500/30', icon: 'bg-yellow-500', text: 'text-yellow-400', ring: '#eab308' },
  emerald: { card: 'from-emerald-900/40 to-emerald-800/20 border-emerald-500/30', icon: 'bg-emerald-600', text: 'text-emerald-400', ring: '#10b981' },
  red:     { card: 'from-red-900/40 to-red-800/20 border-red-500/30', icon: 'bg-red-600', text: 'text-red-400', ring: '#ef4444' },
  orange:  { card: 'from-orange-900/40 to-orange-800/20 border-orange-500/30', icon: 'bg-orange-500', text: 'text-orange-400', ring: '#f97316' },
  cyan:    { card: 'from-cyan-900/40 to-cyan-800/20 border-cyan-500/30', icon: 'bg-cyan-600', text: 'text-cyan-400', ring: '#06b6d4' },
  pink:    { card: 'from-pink-900/40 to-pink-800/20 border-pink-500/30', icon: 'bg-pink-500', text: 'text-pink-400', ring: '#ec4899' },
  indigo:  { card: 'from-indigo-900/40 to-indigo-800/20 border-indigo-500/30', icon: 'bg-indigo-600', text: 'text-indigo-400', ring: '#6366f1' },
  lime:    { card: 'from-lime-900/40 to-lime-800/20 border-lime-500/30', icon: 'bg-lime-600', text: 'text-lime-400', ring: '#84cc16' },
  slate:   { card: 'from-slate-800/60 to-slate-700/30 border-slate-500/30', icon: 'bg-slate-600', text: 'text-slate-300', ring: '#64748b' },
};

const ProgressRing = ({ solved, color }) => {
  const max = 10;
  const pct = Math.min(solved / max, 1);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width="56" height="56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#1f2937" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">
        {solved}
      </text>
    </svg>
  );
};

const Practice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // topic id being generated

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/practice/topics', config);
        setTopics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [user.token]);

  const handleTopicClick = async (topic) => {
    if (generating) return;
    setGenerating(topic.id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/practice/generate',
        { topic: topic.id },
        config
      );
      navigate(`/practice/${topic.id}`, { state: { problem: data, topic } });
    } catch (err) {
      console.error(err);
      alert('Failed to generate problem. Please check your OpenAI API key.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-[#111827] border-b border-gray-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Practice Mode</h1>
              <p className="text-xs text-gray-400">AI-powered DSA problems, topic by topic</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
          <CheckCircle2 size={16} className="text-green-400" />
          <span className="text-sm text-gray-200 font-medium">
            {topics.reduce((a, t) => a + t.solved, 0)} solved
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">Choose a Topic</h2>
          <p className="text-gray-400">Click any topic to get a fresh AI-generated problem. Track your progress as you go!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              const colors = TOPIC_COLORS[topic.color] || TOPIC_COLORS.blue;
              const isGenerating = generating === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  disabled={!!generating}
                  className={`group relative bg-gradient-to-br ${colors.card} border p-6 rounded-2xl text-left
                    transition-all duration-300 hover:scale-[1.03] hover:shadow-xl
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2 text-white">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-semibold">Generating...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {topic.icon}
                    </div>
                    <ProgressRing solved={topic.solved} color={colors.ring} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{topic.label}</h3>
                  <p className={`text-sm ${colors.text} font-medium mb-4`}>
                    {topic.solved === 0
                      ? 'Not started yet'
                      : `${topic.solved} problem${topic.solved > 1 ? 's' : ''} solved`}
                  </p>

                  <div className={`flex items-center text-xs font-semibold ${colors.text} group-hover:gap-2 transition-all`}>
                    <span>Solve a problem</span>
                    <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
