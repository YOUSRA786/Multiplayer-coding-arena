import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, Camera, Save, User as UserIcon, Mail, 
  Trophy, Activity, Shield, Zap, Sword, Target, Terminal, Loader2
} from 'lucide-react';

const EMOJI_LIST = [
  '👤', '👨‍💻', '👩‍💻', '🦾', '🥷', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🧟',
  '🧛', '🤖', '💀', '👽', '🛸', '👾', '🔥', '⚡', '🐲', '🐉',
  '🐅', '🦅', '🐺', '🦍', '⚔️', '🛡️', '👑', '💎', '🎯', '🚀'
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [avatarEmoji, setAvatarEmoji] = useState(user?.avatarEmoji || '👤');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/users/profile', { avatarEmoji }, config);
      updateUser({ ...user, avatarEmoji: data.avatarEmoji });
      setMessage('Warrior profile updated successfully!');
      setTimeout(() => setShowEmojiPicker(false), 1500);
    } catch (err) {
      setMessage('Failed to update profile protocol.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <div className="scanline"></div>

      <header className="h-24 px-10 flex items-center justify-between z-50 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-cyan-500" />
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">WARRIOR <span className="text-cyan-500">PROFILE</span></h1>
            </div>
            <p className="text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase mt-1 ml-1">Secure Identity Node</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 w-full space-y-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-56 h-56 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-[3rem] flex items-center justify-center text-[100px] shadow-2xl border border-white/10 group-hover:border-cyan-500/30 transition-all duration-500">
                {avatarEmoji}
              </div>
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500 via-transparent to-pink-500 rounded-[3.5rem] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute -bottom-4 -right-4 w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
              >
                <Camera size={24} />
              </button>
            </div>

            <div className="mt-12 w-full space-y-4">
               <div className="brawl-card p-6 border-cyan-500/20">
                 <div className="flex items-center space-x-3 mb-2">
                   <Target size={16} className="text-cyan-500" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Standing</span>
                 </div>
                 <p className="text-3xl font-black italic text-white">{user?.rating || 1200} <span className="text-xs text-gray-600 ml-1">ELO</span></p>
               </div>
               
               <div className="brawl-card p-6 border-pink-500/20">
                 <div className="flex items-center space-x-3 mb-2">
                   <Zap size={16} className="text-pink-500" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Combat Streak</span>
                 </div>
                 <p className="text-3xl font-black italic text-white">08 <span className="text-xs text-gray-600 ml-1">WINS</span></p>
               </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="brawl-card p-10 space-y-8">
              <div className="flex items-center space-x-3 mb-2">
                <Terminal size={18} className="text-cyan-500" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Identity Parameters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Warrior Alias</p>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest text-gray-400 uppercase opacity-60"
                      value={user?.username || ''}
                    />
                  </div>
                </div>

                <div className="group">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Neural Address</p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest text-gray-400 uppercase opacity-60"
                      value={user?.email || ''}
                    />
                  </div>
                </div>
              </div>

              {showEmojiPicker && (
                <div className="pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Select Battle Visual</p>
                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border transition-all ${avatarEmoji === emoji ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="mt-10 flex items-center justify-between">
                    <p className={`text-xs font-bold uppercase tracking-widest ${message.includes('success') ? 'text-green-500' : 'text-red-400'}`}>
                      {message}
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all flex items-center space-x-3 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      <span>Update Protocol</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="brawl-card p-10">
               <div className="flex items-center space-x-3 mb-8">
                <Trophy size={18} className="text-yellow-500" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Achievements Secured</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'First Blood', desc: 'Won a brawl', icon: '⚔️' },
                  { label: 'Neural Link', desc: 'Sync complete', icon: '🧠' },
                  { label: 'Overload', desc: 'Hard challenge', icon: '⚡' },
                ].map((ach, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-yellow-500/30 transition-all">
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{ach.icon}</span>
                    <p className="text-[10px] font-black uppercase text-white mb-1">{ach.label}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{ach.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
