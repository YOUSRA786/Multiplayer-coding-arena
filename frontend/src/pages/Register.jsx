import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sword, Shield, Lock, User, Mail, ChevronRight, 
  ChevronLeft, Zap, Target, Sparkles, Check
} from 'lucide-react';

const EMOJI_LIST = [
  '👤', '👨‍💻', '👩‍💻', '🦾', '🥷', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🧟',
  '🧛', '🤖', '💀', '👽', '🛸', '👾', '🔥', '⚡', '🐲', '🐉',
  '🐅', '🦅', '🐺', '🦍', '⚔️', '🛡️', '👑', '💎', '🎯', '🚀'
];

const Register = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('👤');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const nextStep = () => {
    if (step === 1 && (!username || !email)) return;
    if (step === 2 && (!password || password !== confirmPassword)) {
      if (password !== confirmPassword) setError("Encryption keys do not match");
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await register(username, email, password, avatarEmoji);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
        setStep(1); // Go back to first step on error
      }
    } catch (err) {
      setError("Protocol Error: Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-cyan-400">Identity Link</h3>
              <span className="text-[10px] font-bold text-gray-600 uppercase">Step 1 of 3</span>
            </div>
            
            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="h-1 flex-1 bg-white/5"></div>
              <div className="h-1 flex-1 bg-white/5"></div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Warrior Alias</p>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="text" required
                    placeholder="SYNTAX_REBEL"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:text-gray-800"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Neural Address</p>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="email" required
                    placeholder="WARRIOR@ARENA.COM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:text-gray-800"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full py-5 bg-white/5 border border-white/10 hover:border-cyan-500/50 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all flex items-center justify-center space-x-3 group"
            >
              <span>Next Phase</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-cyan-400">Encryption Key</h3>
              <span className="text-[10px] font-bold text-gray-600 uppercase">Step 2 of 3</span>
            </div>

            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="h-1 flex-1 bg-white/5"></div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Primary Key</p>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="password" required
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-800"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Confirm Encryption</p>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="password" required
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-800"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Encryption Strength</span>
                  <span className={`text-[8px] font-black uppercase ${password.length > 8 ? 'text-green-500' : 'text-yellow-500'}`}>{password.length > 8 ? 'Strong' : 'Medium'}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${password.length > 8 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500'}`} style={{ width: `${Math.min(100, password.length * 8)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all flex items-center justify-center space-x-3"
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] py-5 bg-white/5 border border-white/10 hover:border-cyan-500/50 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all flex items-center justify-center space-x-3 group"
              >
                <span>Next Phase</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-cyan-400">Combat Visuals</h3>
              <span className="text-[10px] font-bold text-gray-600 uppercase">Step 3 of 3</span>
            </div>

            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
            </div>

            <div className="text-center mb-8">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Select your battle avatar</p>
              <div className="grid grid-cols-5 gap-3 max-h-[240px] overflow-y-auto p-2 scrollbar-hide">
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
            </div>

            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-[2] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 animate-gradient-x transition-all"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                <div className="relative py-5 px-4 flex items-center justify-center space-x-3 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
                  <span>Create Warrior</span>
                </div>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30 overflow-hidden relative p-4">
      <div className="scanline"></div>
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 blur-[120px] -z-10 animate-pulse delay-700"></div>

      <div className="flex flex-col items-center mb-10 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-6 transform hover:rotate-12 transition-transform duration-500">
          <Sword size={40} className="text-white transform -rotate-45" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          CODE<span className="text-pink-500">BRAWL</span>
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">Initialize Warrior Creation</span>
        </div>
      </div>

      <div className="w-full max-w-lg brawl-card p-10 relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 animate-in slide-in-from-top-2 duration-300">
            <XCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </div>
        )}

        {renderStep()}

        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:text-glow-cyan transition-all ml-2 font-black italic underline-offset-4 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      <footer className="mt-12 text-[8px] font-bold text-gray-700 uppercase tracking-[0.5em]">
        Arena Protocol v2.4.0 • Neural Link Secure
      </footer>
    </div>
  );
};

export default Register;
