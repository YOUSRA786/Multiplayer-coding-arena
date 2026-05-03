import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import {
  Play, ArrowLeft, CheckCircle2, XCircle, Loader2,
  Trophy, RefreshCw, BookOpen, Sword, Terminal, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DIFF_COLORS = {
  easy:   'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  hard:   'bg-red-500/10 text-red-400 border border-red-500/20',
};

const PracticeProblem = () => {
  const { topicId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem] = useState(state?.problem || null);
  const topic = state?.topic || { id: topicId, label: topicId };

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(
    problem?.boilerplateCode?.python || '# Write your solution here'
  );
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (output && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  if (!user) return null;

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-500 mb-8 italic uppercase tracking-widest">Protocol Buffer Empty</p>
          <button onClick={() => navigate('/practice')} className="px-8 py-4 bg-purple-600 rounded-2xl font-black uppercase tracking-widest italic shadow-lg">
            Return to Archives
          </button>
        </div>
      </div>
    );
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(problem.boilerplateCode?.[lang] || '');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const res = await axios.post('http://localhost:5001/execute', {
        code,
        language,
        testCases: problem.testCases,
      });
      const data = res.data;
      const results = data.results || [];
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const allPassed = passed === total && total > 0;

      setOutput({ result: allPassed ? 'Accepted' : 'Wrong Answer', passedCount: passed, totalCount: total, details: results });

      if (allPassed && !isCompleted) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setIsCompleted(true);
      }
    } catch (err) {
      setOutput({
        result: 'Error',
        passedCount: 0,
        totalCount: problem.testCases?.length || 0,
        details: [{ passed: false, error: err.response?.data?.message || err.message }],
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e14] text-white font-sans selection:bg-cyan-500/30">
      <div className="scanline"></div>

      {/* Header */}
      <header className="h-20 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/practice')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <BookOpen size={20} className="text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">{topic.label} Archive</span>
              <span className="text-xl font-black text-white italic uppercase tracking-tighter truncate max-w-[300px]">{problem.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded italic border ${DIFF_COLORS[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-black/40 rounded-xl p-1 border border-white/5 mx-2">
            {['python', 'cpp', 'java'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
              </button>
            ))}
          </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic bg-gradient-to-r from-cyan-600 to-blue-700 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={16} className="animate-spin mr-3" /> : <Play size={16} className="mr-3" />}
              Execute Protocol
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-8 space-x-8">
        {/* Left: Problem Details */}
        <div className="w-[450px] flex flex-col space-y-6 overflow-hidden">
          <div className="brawl-card p-8 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-3 mb-8">
              <Target size={18} className="text-pink-500" />
              <h3 className="text-xs font-black uppercase tracking-widest italic">Mission Parameters</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 text-gray-400 text-sm leading-relaxed mb-8 scrollbar-hide">
              {problem.description}
            </div>
            
            <div className="space-y-6">
              {problem.examples?.map((ex, idx) => (
                <div key={idx} className="brawl-card bg-black/40 border-white/5 p-6 font-mono text-xs space-y-4">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 italic">Example Node #{idx + 1}</p>
                  <div>
                    <p className="text-gray-600 mb-1">// Input:</p>
                    <p className="text-cyan-400 break-all">{ex.input}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">// Output:</p>
                    <p className="text-green-400 break-all">{ex.output}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor & Results */}
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          <div className="flex-1 flex flex-col brawl-card overflow-hidden">
            <div className="h-14 bg-white/5 border-b border-white/5 flex items-center px-8">
              <div className="flex space-x-2 mr-6">
                <div className="w-3 h-3 bg-red-500/50 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500/50 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500/5 rounded-full border border-green-500/20"></div>
              </div>
              <Terminal size={14} className="text-gray-500 mr-2" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 italic">Neural_Buffer.js</span>
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
                  padding: { top: 20 },
                  backgroundColor: '#0d111700'
                }} 
              />
            </div>
          </div>

          {/* Results Bar */}
          {output && (
            <div ref={resultsRef} className={`brawl-card p-8 animate-in slide-in-from-bottom-4 duration-500 ${output.result === 'Accepted' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${output.result === 'Accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {output.result === 'Accepted' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                   </div>
                   <div>
                     <h4 className="text-2xl font-black italic uppercase tracking-tighter">{output.result}</h4>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Verification: {output.passedCount}/{output.totalCount} Test Nodes Secure</p>
                   </div>
                </div>
                {output.result === 'Accepted' && (
                  <div className="px-6 py-2 bg-green-500/10 border border-green-500/30 rounded-full flex items-center space-x-3">
                    <Trophy size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Archive Uploaded</span>
                  </div>
                )}
              </div>
              
              {output.details && (
                <div className="grid grid-cols-5 gap-4">
                  {output.details.map((d, i) => (
                    <div key={i} className={`p-4 rounded-xl border font-mono text-[10px] flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 ${d.passed ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                       <span className="font-black uppercase opacity-40">Test #{i+1}</span>
                       <span className="font-black">{d.passed ? 'SECURE' : 'BREACH'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeProblem;
