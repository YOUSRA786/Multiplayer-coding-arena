import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Play, Users, Trophy, MessageSquare, Code, List, Clock, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
  
  // Game Engine State
  const [gameState, setGameState] = useState('waiting'); // waiting, in_round, round_end, game_end
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [roundEndTime, setRoundEndTime] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  
  const [activeTab, setActiveTab] = useState('problem');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('00:00');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_room', { roomId, userId: user._id, username: user.username });

    newSocket.on('participants_update', (data) => {
      setParticipants(data);
    });

    // Game Engine Events
    newSocket.on('game_started', (state) => {
      setGameState('in_round');
      setTotalRounds(state.totalRounds);
      setCurrentRound(state.round);
      setLeaderboard(Object.entries(state.scores).map(([uid, score]) => {
        const p = state.players.find(p => p.userId === uid);
        return { username: p?.username || 'Unknown', score };
      }));
    });

    newSocket.on('round_started', (data) => {
      setGameState('in_round');
      setCurrentRound(data.round);
      setProblem(data.problem);
      setRoundEndTime(data.endTime);
      setOutput(null);
      setActiveTab('problem');
      if (data.problem && data.problem.boilerplateCode) {
        setCode(data.problem.boilerplateCode[language]);
      }
    });

    newSocket.on('player_solved', (data) => {
      // Show toast or message about player solving
      setChatMessages(prev => [...prev, { username: 'SYSTEM', message: `${data.username} solved the problem! (+${data.points} pts)`, isSystem: true }]);
    });

    newSocket.on('round_ended', (state) => {
      setGameResult(state);
      setLeaderboard(Object.entries(state.scores).map(([uid, score]) => {
        const p = state.players.find(p => p.userId === uid);
        return { username: p?.username || 'Unknown', score };
      }));
      
      // Delay overlay so user can see their results
      setTimeout(() => {
        setGameState('round_end');
      }, 3000);
    });

    newSocket.on('game_ended', (data) => {
      setGameState('game_end');
      setGameResult(data);
      if (data.winnerId === user._id) {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
      }
    });

    newSocket.on('leaderboard_update', (data) => {
      setLeaderboard(data);
    });

    newSocket.on('submission_result', (data) => {
      setOutput(data);
      setIsSubmitting(false);
      setActiveTab('submissions');
    });

    newSocket.on('submission_error', (data) => {
      setIsSubmitting(false);
      setOutput({ 
        result: 'Error', 
        passedCount: 0, 
        totalCount: 0, 
        details: [{ passed: false, error: data.message }] 
      });
      setActiveTab('submissions');
    });

    newSocket.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, [roomId, user, language]);

  useEffect(() => {
    if (problem && problem.boilerplateCode) {
      setCode(problem.boilerplateCode[language] || '');
    }
  }, [language, problem]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (!roundEndTime || gameState !== 'in_round') return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, roundEndTime - now);
      
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roundEndTime, gameState]);

  const handleStartMatch = () => {
    if (!socket) return;
    socket.emit('start_match', { roomId, rounds: 3 });
  };

  const handleNextRound = () => {
    socket.emit('next_round', { roomId });
  };

  const handleSubmitCode = () => {
    if (gameState !== 'in_round') return;
    socket.emit('submit_code', {
      roomId,
      userId: user._id,
      username: user.username,
      problemId: problem._id,
      code,
      language
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      socket.emit('chat_message', { roomId, username: user.username, message: messageInput });
      setMessageInput('');
    }
  };

  const isHost = participants[0]?.userId === user._id || participants[0]?._id === user._id || participants[0]?.user === user._id;

  return (
    <div className="flex flex-col h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Game End Overlay */}
      {gameState === 'game_end' && gameResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-gray-700 w-full max-w-2xl rounded-3xl shadow-2xl p-8 text-center overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
             <Trophy size={60} className="mx-auto text-yellow-400 mb-4" />
             <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
             <p className="text-gray-400 mb-8">Final Standings</p>
             
             <div className="space-y-3 mb-10">
                {gameResult.rankedPlayers.map((p, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${p.userId === user._id ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}>{idx + 1}</span>
                      <span className="font-bold text-lg">{p.username} {p.userId === user._id && "(You)"}</span>
                    </div>
                    <span className="font-mono text-xl font-black text-blue-400">{p.score} PTS</span>
                  </div>
                ))}
             </div>

             <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all">
                Return to Dashboard
             </button>
          </div>
        </div>
      )}

      {/* Round End Overlay */}
      {gameState === 'round_end' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1f2937] border border-gray-700 p-10 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                <Trophy size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-3xl font-black text-white mb-1">Round {currentRound} Over!</h3>
              <p className="text-gray-400 text-sm">The round has concluded.</p>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700">
              {gameResult?.solvedUsers?.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Round Winner</p>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {participants.find(p => p.userId === gameResult.solvedUsers[0].userId)?.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-white">
                        {participants.find(p => p.userId === gameResult.solvedUsers[0].userId)?.username === user.username ? "🎉 You Won!" : participants.find(p => p.userId === gameResult.solvedUsers[0].userId)?.username + " Won!"}
                      </p>
                      <p className="text-xs text-blue-400 font-mono">Time: {gameResult.solvedUsers[0].timeTaken.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">No one solved the problem this round.</p>
              )}
            </div>

            <div className="space-y-3">
              {isHost ? (
                <button 
                  onClick={handleNextRound} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Play size={18} fill="currentColor" />
                  <span>{currentRound === totalRounds ? 'View Final Results' : 'Start Next Round'}</span>
                </button>
              ) : (
                <div className="py-4 bg-gray-800/80 rounded-2xl border border-gray-700">
                  <p className="text-sm font-bold text-gray-300 animate-pulse">Waiting for host to continue...</p>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/')} 
                className="w-full py-4 bg-transparent border-2 border-gray-700 text-gray-400 font-bold rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <XCircle size={18} />
                <span>Stop Playing & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Coding Arena</h1>
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            <Clock size={16} className={gameState === 'in_round' ? "text-yellow-400" : "text-gray-400"} />
            <span className="font-mono text-sm font-semibold">{timeLeft}</span>
          </div>
          <div className="flex items-center space-x-3">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Round {currentRound} / {totalRounds}
             </div>
             {problem && (
               <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border 
                 ${problem.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                   problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                   'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                 {problem.difficulty}
               </span>
             )}
             <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
             <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Room Code</span>
                <span className="text-xs font-mono font-black text-blue-400 select-all cursor-pointer" title="Click to copy Room ID">
                  {roomId}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!problem && isHost && (
            <button onClick={handleStartMatch} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all hover:scale-105">
              Start Game
            </button>
          )}
          {!problem && !isHost && (
            <div className="text-sm text-gray-500 flex items-center">
               <Loader2 size={16} className="animate-spin mr-2" />
               Waiting for host...
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-[450px] flex flex-col border-r border-gray-800 bg-[#111827]">
          <div className="flex border-b border-gray-800">
            {['problem', 'submissions', 'chat'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400 bg-gray-800/50' : 'border-transparent text-gray-400 hover:bg-gray-800/30'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'problem' && (
              problem ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{problem.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border 
                      ${problem.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {problem.difficulty || 'Easy'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-8 whitespace-pre-line">{problem.description}</p>
                  
                  {problem.examples?.map((ex, idx) => (
                    <div key={idx} className="bg-[#1f2937]/50 border border-gray-700/50 p-4 rounded-xl font-mono text-sm mb-4">
                      <p><span className="text-blue-400">Input:</span> {ex.input}</p>
                      <p><span className="text-green-400">Output:</span> {ex.output}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 mt-20">Game hasn't started yet.</div>
              )
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                {output ? (
                  <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-bold ${output.result === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{output.result}</span>
                      <span className="text-xs text-gray-500">{output.passedCount}/{output.totalCount} Passed</span>
                    </div>
                    {output.details?.map((d, i) => (
                      <div key={i} className="text-xs font-mono mb-2 p-2 bg-black/20 rounded">
                        <span className={d.passed ? 'text-green-500' : 'text-red-500'}>{d.passed ? '✓' : '✗'} Test Case {i+1}</span>
                        {!d.passed && <p className="text-gray-500 mt-1">{d.error || 'Wrong output'}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 mt-20">No results yet.</p>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 mb-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isSystem ? 'items-center' : (msg.username === user.username ? 'items-end' : 'items-start')}`}>
                      {msg.isSystem ? (
                         <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">{msg.message}</span>
                      ) : (
                        <>
                          <span className="text-[10px] text-gray-500 mb-1">{msg.username}</span>
                          <div className={`px-3 py-1.5 rounded-xl text-sm ${msg.username === user.username ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            {msg.message}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="relative">
                  <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..." className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500" />
                  <button type="submit" className="absolute right-2 top-1.5 p-1 text-blue-500"><Send size={16} /></button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Editor */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          <div className="h-12 border-b border-gray-800 bg-[#111827] flex justify-between items-center px-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-800 text-xs border border-gray-700 rounded px-2 py-1 outline-none">
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button onClick={handleSubmitCode} disabled={gameState !== 'in_round'} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1 rounded text-xs font-bold disabled:opacity-50">
               RUN CODE
            </button>
          </div>
          <div className="flex-1 py-2">
            <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={(val) => setCode(val)} options={{ minimap: { enabled: false }, fontSize: 14 }} />
          </div>
        </div>

        {/* Right Panel - Leaderboard & Participants */}
        <div className="w-[280px] border-l border-gray-800 bg-[#111827] flex flex-col">
          {/* Scoreboard Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Scoreboard</h3>
              <Trophy size={14} className="text-yellow-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${entry.username === user.username ? 'bg-blue-600/10 border-blue-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                   <div className="flex items-center space-x-2">
                     <span className="text-[10px] font-bold text-gray-500">{idx+1}.</span>
                     <span className="text-xs font-bold text-gray-300 truncate max-w-[120px]">{entry.username}</span>
                   </div>
                   <span className="text-xs font-mono font-black text-blue-400">{entry.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && <div className="text-center py-10 text-gray-600 text-xs italic">No scores yet</div>}
            </div>
          </div>

          {/* Participants Section */}
          <div className="h-[250px] border-t border-gray-800 flex flex-col bg-[#0d1117]">
            <div className="p-4 border-b border-gray-800 bg-black/20 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest text-center w-full">Lobby ({participants.length})</h3>
              <Users size={14} className="text-blue-500 absolute right-4" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center space-x-3 opacity-80 hover:opacity-100 transition-opacity">
                  <div className={`w-2 h-2 rounded-full ${p.socketId ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-300">{p.username} {p.userId === user._id && "(You)"}</span>
                    {idx === 0 && <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">Host</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
