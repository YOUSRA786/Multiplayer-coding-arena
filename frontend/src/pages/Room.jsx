import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Play, Users, Trophy, MessageSquare, Code, List, Clock, Send, CheckCircle2, XCircle } from 'lucide-react';
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
  
  // New State for Tabs & Chat
  const [activeTab, setActiveTab] = useState('problem');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('30:00');
  const [winner, setWinner] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_room', { roomId, userId: user._id, username: user.username });

    newSocket.on('participants_update', (data) => {
      setParticipants(data);
    });

    newSocket.on('match_started', (data) => {
      setProblem(data.problem);
      setMatchStartTime(data.startTime);
      if (data.problem && data.problem.boilerplateCode) {
        setCode(data.problem.boilerplateCode[language]);
      }
      if (data.isNextRound) {
        setWinner(null);
        setOutput(null);
        setActiveTab('problem');
      }
    });

    newSocket.on('leaderboard_update', (data) => {
      setLeaderboard(Array.isArray(data) ? data : (data.leaderboard || []));
    });

    newSocket.on('submission_result', (data) => {
      setOutput(data);
      setActiveTab('submissions');
    });

    newSocket.on('submission_error', (data) => {
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

    newSocket.on('player_won', (data) => {
      if (!winner) { // Prevent multiple alerts if multiple accepted submissions happen
        setWinner(data.username);
        if (data.username === user.username) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    });

    return () => newSocket.disconnect();
  }, [roomId, user, language, winner]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (!matchStartTime) return;
    const interval = setInterval(() => {
      const start = new Date(matchStartTime).getTime();
      const now = new Date().getTime();
      const elapsed = now - start;
      const totalTime = 30 * 60 * 1000; // 30 minutes
      const remaining = Math.max(0, totalTime - elapsed);
      
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [matchStartTime]);

  const handleStartMatch = () => {
    socket.emit('start_match', { roomId });
  };

  const handleSubmitCode = () => {
    if (!problem || !problem._id) {
      setOutput({ 
        result: 'Error', 
        passedCount: 0, 
        totalCount: 0, 
        details: [{ passed: false, error: 'No problem loaded. Please start the match first.' }] 
      });
      return;
    }
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

  return (
    <div className="flex flex-col h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Winner Overlay */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-700 p-10 rounded-3xl shadow-[0_0_100px_rgba(59,130,246,0.3)] text-center animate-in zoom-in duration-300 transform scale-110">
            <Trophy size={80} className="mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 tracking-tight">
              {winner === user.username ? 'VICTORY!' : `${winner.toUpperCase()} WON!`}
            </h2>
            <p className="text-gray-300 text-xl font-medium">
              {winner === user.username ? 'You solved all test cases perfectly.' : 'Better luck next time! Keep coding.'}
            </p>
            <button 
              onClick={() => {
                socket.emit('next_round', { roomId });
              }} 
              className="mt-10 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Arena #{roomId}</h1>
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            <Clock size={16} className={matchStartTime ? "text-yellow-400" : "text-gray-400"} />
            <span className="font-mono text-sm font-semibold">{matchStartTime ? timeLeft : '--:--'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2 mr-4">
            {participants.map((p, idx) => (
              <div key={idx} title={p.username} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#111827] flex items-center justify-center relative shadow-sm">
                <span className="text-xs font-bold text-white">{p.username.charAt(0).toUpperCase()}</span>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111827] rounded-full"></div>
              </div>
            ))}
          </div>
          {!problem && (
            <button onClick={handleStartMatch} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105 active:scale-95">
              Start Match
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tabs & Content */}
        <div className="w-[450px] flex flex-col border-r border-gray-800 bg-[#111827]">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setActiveTab('problem')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'problem' ? 'border-blue-500 text-blue-400 bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              <Code size={16} className="mr-2" /> Problem
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-blue-500 text-blue-400 bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              <List size={16} className="mr-2" /> Submissions
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-500 text-blue-400 bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              <MessageSquare size={16} className="mr-2" /> Chat
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'problem' && (
              <div className="p-6">
                {problem ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <h3 className="text-2xl font-bold text-white">{problem.title}</h3>
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md border ${
                        problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line mb-8 text-sm leading-relaxed">
                      {problem.description}
                    </div>
                    
                    {problem.examples && problem.examples.length > 0 && (
                      <div className="mb-8 space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Examples</h4>
                        {problem.examples.map((ex, idx) => (
                          <div key={idx} className="bg-[#1f2937]/50 border border-gray-700/50 p-4 rounded-xl font-mono text-sm shadow-inner">
                            <p className="mb-1"><span className="text-blue-400 font-semibold">Input:</span> <span className="text-gray-300">{ex.input}</span></p>
                            <p className="mb-1"><span className="text-green-400 font-semibold">Output:</span> <span className="text-gray-300">{ex.output}</span></p>
                            {ex.explanation && <p className="mt-2 pt-2 border-t border-gray-700/50 text-gray-400 text-xs"><span className="text-gray-500 font-semibold">Explanation:</span> {ex.explanation}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {problem.constraints && problem.constraints.length > 0 && (
                      <div className="bg-[#1f2937]/30 border border-gray-800 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Constraints</h4>
                        <ul className="list-disc pl-5 text-gray-400 font-mono text-xs space-y-2">
                          {problem.constraints.map((c, idx) => <li key={idx}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
                    <Users size={48} className="mb-4 opacity-30" />
                    <p className="text-lg font-medium">Waiting for match to start...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="p-4 flex flex-col h-full">
                {output ? (
                  <div className="animate-in fade-in flex-1">
                    <div className={`p-4 rounded-xl border ${output.result === 'Accepted' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} mb-4 flex justify-between items-center`}>
                      <div className="flex items-center space-x-3">
                        {output.result === 'Accepted' ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                        <span className={`font-bold text-lg ${output.result === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{output.result}</span>
                      </div>
                      <span className="text-gray-300 font-mono text-sm">{output.passedCount} / {output.totalCount} Passed</span>
                    </div>

                    <div className="space-y-3">
                      {output.details && output.details.map((detail, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${detail.passed ? 'bg-gray-800/50 border-gray-700' : 'bg-red-900/20 border-red-900/50'} text-sm font-mono`}>
                          <div className="flex justify-between text-gray-400 mb-2">
                            <span>Test Case {idx + 1}</span>
                            {detail.passed ? <span className="text-green-500">Passed</span> : <span className="text-red-500">Failed</span>}
                          </div>
                          {!detail.passed && (
                            <div className="space-y-1 mt-2 text-xs">
                              <p><span className="text-gray-500">Input:</span> <span className="text-gray-300">{detail.input}</span></p>
                              <p><span className="text-green-500/70">Expected:</span> <span className="text-gray-300">{detail.expectedOutput}</span></p>
                              <p><span className="text-red-500/70">Actual:</span> <span className="text-gray-300">{detail.actualOutput}</span></p>
                              {detail.error && <p className="text-yellow-500 mt-2 p-2 bg-black/30 rounded">{detail.error}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No submissions yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">Say hi to your opponents!</div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-1 px-1">{msg.username}</span>
                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.username === user.username ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-700 text-gray-100 rounded-tl-sm'}`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-[#111827]">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..." 
                      className="w-full bg-gray-900 border border-gray-700 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button type="submit" disabled={!messageInput.trim()} className="absolute right-2 top-1.5 p-1.5 text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition-colors bg-gray-800 rounded-full">
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative">
          <div className="h-12 border-b border-gray-800 bg-[#111827] flex justify-between items-center px-4">
            <select 
              className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-700 transition-colors cursor-pointer"
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                if (problem && problem.boilerplateCode) {
                  setCode(problem.boilerplateCode[newLang] || '');
                }
              }}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button 
              onClick={handleSubmitCode}
              disabled={!problem}
              className={`flex items-center px-5 py-1.5 rounded-md text-sm font-bold transition-all ${problem ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30 hover:shadow-green-900/50' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
            >
              <Play size={14} className="mr-2" /> RUN
            </button>
          </div>
          
          <div className="flex-1 py-2">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Right Panel - Leaderboard */}
        <div className="w-[300px] border-l border-gray-800 bg-[#111827] flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center">
            <Trophy size={18} className="text-yellow-500 mr-2" />
            <h3 className="font-bold text-white tracking-wide">MATCH LEADERBOARD</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                    idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' : 
                    idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-gray-200 text-sm truncate max-w-[120px]">{entry.username}</span>
                </div>
                <span className="text-green-400 font-mono font-bold text-sm">{entry.score} pts</span>
              </div>
            )) : (
              <div className="text-center text-gray-500 mt-10 text-sm">Waiting for submissions...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
