import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import {
  Play, ArrowLeft, CheckCircle2, XCircle, Loader2,
  Trophy, RefreshCw, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DIFF_COLORS = {
  easy:   'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hard:   'bg-red-500/10 text-red-400 border-red-500/20',
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
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (output && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No problem loaded.</p>
          <button onClick={() => navigate('/practice')} className="px-4 py-2 bg-purple-600 rounded-lg">
            Back to Practice
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
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
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

  const handleMarkDone = async () => {
    if (isCompleted) return;
    setIsMarkingDone(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/practice/complete', { 
        problemSlug: problem._id, 
        topic: topic.id,
        title: problem.title
      }, config);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingDone(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* Header */}
      <header className="h-14 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/practice')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <BookOpen size={18} className="text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{topic.label} Practice</span>
          <span className="text-gray-600">›</span>
          <span className="text-sm font-bold text-white truncate max-w-[200px]">{problem.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${DIFF_COLORS[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center px-4 py-1.5 rounded-md text-sm font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin mr-2" /> : <Play size={14} className="mr-2" />}
            Run
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem */}
        <div className="w-[420px] border-r border-gray-800 bg-[#111827] flex flex-col overflow-y-auto shrink-0">
          <div className="p-6">
            <h2 className="text-2xl font-extrabold text-white mb-4">{problem.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-6">{problem.description}</p>

            {problem.examples?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Examples</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-[#1f2937] border border-gray-700 rounded-xl p-4 font-mono text-sm mb-3">
                    <p><span className="text-blue-400">Input:</span> <span className="text-gray-300">{ex.input}</span></p>
                    <p><span className="text-green-400">Output:</span> <span className="text-gray-300">{ex.output}</span></p>
                    {ex.explanation && <p className="text-gray-500 text-xs mt-2">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {problem.constraints?.length > 0 && (
              <div className="bg-[#1f2937]/50 border border-gray-800 rounded-xl p-4 mb-8">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Constraints</h3>
                <ul className="list-disc pl-4 text-gray-400 font-mono text-xs space-y-1">
                  {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Results */}
          <div ref={resultsRef}>
            {output && (
              <div className="p-4 border-t border-gray-800">
                <div className={`p-4 rounded-xl border mb-3 flex items-center justify-between ${output.result === 'Accepted' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center space-x-2">
                    {output.result === 'Accepted' ? <CheckCircle2 className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                    <span className={`font-bold ${output.result === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{output.result}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-sm">{output.passedCount}/{output.totalCount} Passed</span>
                </div>

                {output.result === 'Accepted' && (
                  <button
                    onClick={handleMarkDone}
                    disabled={isCompleted || isMarkingDone}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all
                      ${isCompleted
                        ? 'bg-green-900/40 text-green-400 border border-green-700 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-[1.02]'
                      }`}
                  >
                    {isMarkingDone ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isCompleted ? (
                      <><CheckCircle2 size={16} /><span>Marked as Done! ✨</span></>
                    ) : (
                      <><Trophy size={16} /><span>Mark as Done</span></>
                    )}
                  </button>
                )}

                <div className="space-y-2 mt-3">
                  {output.details?.map((d, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-xs font-mono ${d.passed ? 'bg-gray-800/50 border-gray-700' : 'bg-red-900/20 border-red-900/50'}`}>
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>Test {i + 1}</span>
                        <span className={d.passed ? 'text-green-500' : 'text-red-500'}>{d.passed ? 'Passed' : 'Failed'}</span>
                      </div>
                      {!d.passed && (
                        <div className="space-y-0.5">
                          {d.input && <p><span className="text-gray-500">Input:</span> {d.input}</p>}
                          {d.expectedOutput && <p><span className="text-green-500/70">Expected:</span> {d.expectedOutput}</p>}
                          {d.actualOutput && <p><span className="text-red-500/70">Got:</span> {d.actualOutput}</p>}
                          {d.error && <p className="text-yellow-400 mt-1">{d.error}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/practice')}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Try Another Topic</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          <div className="flex-1 py-2">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeProblem;
