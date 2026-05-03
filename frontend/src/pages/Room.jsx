import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { 
  Play, Users, Trophy, MessageSquare, Code, List, Clock, 
  Send, CheckCircle2, XCircle, Loader2, Sword, Shield, 
  Share2, Zap, Terminal, Hash, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [gameState, setGameState] = useState('waiting'); 
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [roundEndTime, setRoundEndTime] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('01:14');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_room', { 
      roomId, 
      userId: user._id, 
      username: user.username, 
      avatarEmoji: user.avatarEmoji 
    });

    newSocket.on('participants_update', (data) => setParticipants(data));

    newSocket.on('game_started', (state) => {
      setGameState('in_round');
      setTotalRounds(state.totalRounds);
      setCurrentRound(state.round);
    });

    newSocket.on('round_started', (data) => {
      setGameState('in_round');
      setCurrentRound(data.round);
      setProblem(data.problem);
      setRoundEndTime(data.endTime);
      setOutput(null);
      if (data.problem?.boilerplateCode) {
        setCode(data.problem.boilerplateCode[language]);
      }
    });

    newSocket.on('round_ended', (state) => {
      setGameResult(state);
      setLeaderboard(Object.entries(state.scores).map(([uid, score]) => {
        const p = state.players.find(p => p.userId === uid);
        return { username: p?.username || 'Unknown', score, avatarEmoji: p?.avatarEmoji };
      }));
      setTimeout(() => setGameState('round_end'), 2000);
    });

    newSocket.on('game_ended', (data) => {
      setGameState('game_end');
      setGameResult(data);
      if (data.winnerId === user._id) {
        confetti({ particleCount: 300, spread: 100, origin: { y: 0.5 } });
      }
    });

    newSocket.on('leaderboard_update', (data) => setLeaderboard(data));

    newSocket.on('submission_result', (data) => {
      setOutput(data);
      setIsSubmitting(false);
    });

    newSocket.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, [roomId, user, language]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!roundEndTime || gameState !== 'in_round') return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, roundEndTime - now);
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [roundEndTime, gameState]);

  const handleStartMatch = () => {
    if (socket) socket.emit('start_match', { roomId, rounds: 3 });
  };

  const handleNextRound = () => {
    if (socket) socket.emit('next_round', { roomId });
  };

  const handleSubmitCode = () => {
    if (gameState !== 'in_round' || isSubmitting) return;
    setIsSubmitting(true);
    socket.emit('submit_code', {
      roomId, userId: user._id, username: user.username,
      problemId: problem._id, code, language
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      socket.emit('chat_message', { roomId, username: user.username, avatarEmoji: user.avatarEmoji, message: messageInput });
      setMessageInput('');
    }
  };

  const isHost = participants[0]?.userId === user._id;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <div className="scanline"></div>

      {/* Header */}
      <header className="h-24 px-10 flex items-center justify-between z-50 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5 relative shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Sword size={24} className="text-white transform -rotate-45" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              CODE<span className="text-pink-500">BRAWL</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 mt-1 ml-15">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-green-500 uppercase">System: {gameState === 'waiting' ? 'Live' : 'In Game'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="brawl-card px-6 py-3 flex items-center space-x-6 glow-cyan">
            <div className="text-right">
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lobby Encryption Code</p>
              <p className="text-2xl font-black font-mono text-cyan-400 text-glow-cyan tracking-widest">{roomId}</p>
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Share2 size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex px-10 pb-10 space-x-8 overflow-hidden">
        
        {/* Waiting / Lobby State */}
        {gameState === 'waiting' && (
          <div className="flex-1 flex space-x-8">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase">WARRIORS <span className="text-gray-600">{participants.length.toString().padStart(2, '0')}/08</span></h2>
                <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Searching for Challengers...</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {participants.map((p, idx) => (
                  <div key={idx} className="brawl-card p-6 flex flex-col items-center group hover:border-cyan-500/50 transition-all duration-500 hover:transform hover:-translate-y-2">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl border border-white/10 group-hover:border-cyan-500/30 transition-all">
                        {p.avatarEmoji || '👤'}
                        {idx === 0 && <Sword size={24} className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />}
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 via-transparent to-pink-500 rounded-[2.8rem] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                    <h3 className="text-xl font-black tracking-tight uppercase mb-1">{p.username}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Brawler Ready</span>
                    </div>
                  </div>
                ))}
                
                {Array.from({ length: Math.max(0, 8 - participants.length) }).map((_, i) => (
                  <div key={i} className="brawl-card p-6 flex flex-col items-center justify-center border-dashed border-white/10 opacity-40">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Users size={32} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recruit Node</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-96 space-y-6">
              <div className="brawl-card flex-1 flex flex-col overflow-hidden h-[400px]">
                <div className="p-6 border-b border-white/5 flex items-center space-x-3">
                  <Zap size={18} className="text-orange-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Comms Feed</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="flex space-x-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-sm">{msg.avatarEmoji || '💬'}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-cyan-400 mb-0.5 tracking-tighter">{msg.username}</p>
                        <p className="text-sm text-gray-400 group-hover:text-white transition-colors">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-6 pt-0">
                  <div className="relative">
                    <input 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Transmit Protocol..." 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-cyan-500/50 transition-all"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400 transition-colors">
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>

              <div className="brawl-card p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <Shield size={18} className="text-cyan-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Arena Params</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Protocols</span>
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-black text-cyan-400 uppercase">Strict_JS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Difficulty</span>
                    <span className="text-xs font-black text-pink-500 uppercase italic">Overload</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Latency</span>
                    <span className="text-xs font-black text-green-500">14ms</span>
                  </div>
                </div>
                {isHost && (
                  <button 
                    onClick={handleStartMatch}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl font-black uppercase tracking-[0.2em] italic shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Engage Arena
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* In-Game State */}
        {gameState === 'in_round' && problem && (
          <div className="flex-1 flex flex-col relative">
            {/* Round Timer Overlay */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="brawl-card px-10 py-6 text-center border-b-4 border-pink-500 glow-pink">
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Brawl Remaining</p>
                <p className="text-5xl font-black font-mono text-pink-500 text-glow-pink tracking-tight italic">{timeLeft}</p>
              </div>
            </div>

            <div className="flex-1 flex space-x-8 pt-20">
              {/* Left: Problem Details */}
              <div className="w-[400px] flex flex-col space-y-6">
                <div className="brawl-card p-8 flex-1 flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/40 rounded-lg text-[10px] font-black text-pink-400 uppercase italic tracking-wider">Overload</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Challenge #04</span>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase text-cyan-400 text-glow-cyan mb-8">{problem.title}</h2>
                  <div className="flex-1 overflow-y-auto pr-4 text-gray-400 text-sm leading-relaxed mb-8 scrollbar-hide">
                    {problem.description}
                  </div>
                  <div className="brawl-card bg-black/40 border-white/5 p-6 font-mono text-xs space-y-4">
                    {problem.examples?.[0] && (
                      <>
                        <p><span className="text-gray-600 italic">// Input:</span></p>
                        <p className="text-cyan-400">{problem.examples[0].input}</p>
                        <p><span className="text-gray-600 italic">// Output:</span></p>
                        <p className="text-green-400">{problem.examples[0].output}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="brawl-card p-6 bg-green-500/5 border-green-500/20">
                   <div className="flex items-center space-x-3">
                     <Trophy size={18} className="text-green-500" />
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rewards</span>
                   </div>
                   <p className="text-xl font-black italic text-green-400 mt-2">+1200 Exp & Brawl Points</p>
                </div>
              </div>

              {/* Center: Editor */}
              <div className="flex-1 flex flex-col brawl-card overflow-hidden">
                <div className="h-16 bg-white/5 border-b border-white/5 flex items-center justify-between px-8">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2 mr-6">
                      <div className="w-3 h-3 bg-red-500/50 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500/50 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500/50 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} className="text-gray-500" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">index.js</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-black/40 rounded-xl p-1 border border-white/5 mr-2">
                      {['python', 'cpp', 'java'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setCode(problem?.boilerplateCode?.[lang] || '');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-cyan-500 text-white shadow-[0_0_10px_#06b6d4]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleSubmitCode}
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-black uppercase tracking-widest italic text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Transmitting...' : 'Upload Result'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 py-4">
                   <Editor 
                    height="100%" 
                    language={language} 
                    theme="vs-dark" 
                    value={code} 
                    onChange={(val) => setCode(val)} 
                    options={{ 
                      minimap: { enabled: false }, 
                      fontSize: 16,
                      lineNumbers: 'on',
                      glyphMargin: true,
                      folding: true,
                      lineDecorationsWidth: 20,
                      backgroundColor: '#0d111700'
                    }} 
                  />
                </div>
                {output && (
                  <div className={`p-6 border-t border-white/5 ${output.result === 'Accepted' ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                    <div className="flex items-center justify-between mb-4">
                       <h4 className={`font-black italic uppercase tracking-widest text-sm ${output.result === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                         Protocol: {output.result}
                       </h4>
                       <span className="text-[10px] font-bold text-gray-500">{output.passedCount}/{output.totalCount} Test Nodes Secure</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {output.details?.map((test, idx) => (
                        <div 
                          key={idx}
                          title={test.passed ? 'Test Case Passed' : `Failed: ${test.error || 'Wrong Answer'}`}
                          className={`h-1 rounded-full transition-all duration-500 ${test.passed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}
                        />
                      ))}
                    </div>
                    {output.details?.find(t => !t.passed) && (
                      <div className="p-3 bg-black/40 rounded-xl font-mono text-[10px] text-red-400/80 border border-red-500/10 animate-in slide-in-from-bottom-2 duration-300">
                        <span className="text-gray-600 block mb-1 uppercase tracking-widest text-[8px] font-black italic">Target Failure_Log:</span>
                        <div className="space-y-3">
                          <p>{output.details.find(t => !t.passed).error || 'Data Mismatch: Expected output not achieved.'}</p>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                            <div>
                               <span className="text-gray-600 block mb-1 uppercase tracking-widest text-[7px] font-black italic">Expected:</span>
                               <pre className="bg-green-500/5 p-2 rounded border border-green-500/10 text-green-400/70 whitespace-pre-wrap">
                                 {output.details.find(t => !t.passed).expectedOutput || 'N/A'}
                               </pre>
                            </div>
                            <div>
                               <span className="text-gray-600 block mb-1 uppercase tracking-widest text-[7px] font-black italic">Actual:</span>
                               <pre className="bg-red-500/5 p-2 rounded border border-red-500/10 text-red-400/70 whitespace-pre-wrap">
                                 {output.details.find(t => !t.passed).actualOutput || 'N/A'}
                               </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Live Ranking */}
              <div className="w-80 flex flex-col space-y-6">
                <div className="brawl-card p-8 flex-1 flex flex-col">
                   <div className="flex items-center space-x-3 mb-8">
                     <Trophy size={18} className="text-yellow-500" />
                     <h3 className="text-xs font-black uppercase tracking-widest italic">Live_Ranking</h3>
                   </div>
                   <div className="space-y-6">
                      {participants.map((p, i) => {
                        const score = leaderboard.find(l => l.username === p.username)?.score || 0;
                        const rankColor = i === 0 ? 'border-yellow-500' : i === 1 ? 'border-cyan-500' : 'border-pink-500';
                        return (
                          <div key={i} className="relative pl-6">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${rankColor} opacity-50`}></div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{p.avatarEmoji || '👤'}</span>
                                <div className="text-left">
                                  <p className="text-xs font-black uppercase tracking-tighter truncate w-24">{p.username}</p>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Solving...</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-black italic">{score} pts</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div className={`h-full ${rankColor} transition-all duration-1000`} style={{ width: `${Math.min(100, (score/3000)*100)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="brawl-card p-6">
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center space-x-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <XCircle size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Abort Protocol</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Round/Game Result State */}
        {(gameState === 'round_end' || gameState === 'game_end') && gameResult && (
          <div className="fixed inset-0 z-50 bg-[#0b0e14]/90 backdrop-blur-3xl flex items-center justify-center p-10 animate-in fade-in duration-700">
             <div className="max-w-4xl w-full text-center">
                <div className="relative inline-block mb-12">
                   <div className="w-64 h-64 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-[3rem] flex items-center justify-center text-[120px] shadow-[0_0_100px_rgba(6,182,212,0.5)] border-2 border-white/30 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                     <span className="relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                       {gameResult.winnerName || gameResult.solvedUsers?.[0] ? (
                         participants.find(p => p.userId === (gameResult.winnerId || gameResult.solvedUsers?.[0]?.userId) || p.username === (gameResult.winnerName || gameResult.solvedUsers?.[0]?.username))?.avatarEmoji || '🏆'
                       ) : (
                         '🤝'
                       )}
                     </span>
                   </div>
                   <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center border-8 border-[#0b0e14] shadow-2xl z-20">
                     <Trophy size={32} className="text-black" />
                   </div>
                   <div className="absolute -inset-6 bg-gradient-to-tr from-cyan-500 via-transparent to-pink-500 rounded-[3.5rem] opacity-20 blur-2xl animate-pulse"></div>
                </div>

                <div className="px-8 py-2 bg-white/5 border border-white/10 rounded-full inline-flex items-center space-x-3 mb-6 backdrop-blur-md">
                  <div className={`w-2 h-2 rounded-full animate-ping ${gameResult.solvedUsers?.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${gameResult.solvedUsers?.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {gameState === 'game_end' ? 'CHAMPION DECLARED' : (gameResult.solvedUsers?.length > 0 ? 'ROUND SECURED' : 'PROTOCOL STALEMATE')}
                  </span>
                </div>

                <h2 className="text-8xl font-black italic tracking-tighter uppercase text-white mb-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {gameResult.winnerName || 
                   participants.find(p => p.userId === gameResult.solvedUsers?.[0]?.userId)?.username || 
                   'ROUND DRAW'}
                </h2>

                <div className="grid grid-cols-3 gap-8">
                  {(gameResult.rankedPlayers || gameResult.finalRankings || leaderboard)?.slice(0, 3).map((p, i) => (
                    <div key={i} className="brawl-card p-8 flex flex-col items-center relative overflow-hidden group hover:transform hover:-translate-y-2 transition-all border-white/10 bg-white/[0.02]">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 italic">Rank #{i+1}</p>
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
                         {participants.find(part => part.userId === p.userId || part.username === p.username)?.avatarEmoji || '👤'}
                       </div>
                       <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-white/90">{p.username}</h3>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                         <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" style={{ width: `${Math.min(100, ((p.score || 0)/3000)*100)}%` }}></div>
                       </div>
                       <p className="text-2xl font-black italic text-cyan-400">+{p.score || 0} <span className="text-[10px] text-gray-600">points</span></p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 flex items-center justify-center space-x-6">
                  {isHost && (
                    gameState === 'game_end' ? (
                      <button 
                        onClick={() => setGameState('lobby')}
                        className="px-16 py-6 bg-cyan-600 text-white font-black uppercase tracking-[0.4em] italic rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                      >
                        Return to Lobby
                      </button>
                    ) : (
                      <button 
                        onClick={handleNextRound}
                        className="px-16 py-6 bg-white text-black font-black uppercase tracking-[0.4em] italic rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                      >
                        Next Brawl
                      </button>
                    )
                  )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Room;
