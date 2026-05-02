import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';

const TOPICS = [
  {
    id: 'arrays', label: 'Arrays', icon: '📦', color: 'blue',
    problems: [
      { id: 'lc-1', title: 'Two Sum', difficulty: 'easy', url: 'https://leetcode.com/problems/two-sum/' },
      { id: 'lc-121', title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'lc-238', title: 'Product of Array Except Self', difficulty: 'medium', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'lc-53', title: 'Maximum Subarray', difficulty: 'medium', url: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'lc-56', title: 'Merge Intervals', difficulty: 'medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'lc-15', title: '3Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/3sum/' },
      { id: 'lc-11', title: 'Container With Most Water', difficulty: 'medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'lc-42', title: 'Trapping Rain Water', difficulty: 'hard', url: 'https://leetcode.com/problems/trapping-rain-water/' },
    ]
  },
  {
    id: 'strings', label: 'Strings', icon: '🔤', color: 'purple',
    problems: [
      { id: 'lc-3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'lc-5', title: 'Longest Palindromic Substring', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
      { id: 'lc-20', title: 'Valid Parentheses', difficulty: 'easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'lc-49', title: 'Group Anagrams', difficulty: 'medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 'lc-76', title: 'Minimum Window Substring', difficulty: 'hard', url: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'lc-242', title: 'Valid Anagram', difficulty: 'easy', url: 'https://leetcode.com/problems/valid-anagram/' },
    ]
  },
  {
    id: 'linked-lists', label: 'Linked Lists', icon: '🔗', color: 'green',
    problems: [
      { id: 'lc-206', title: 'Reverse Linked List', difficulty: 'easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'lc-21', title: 'Merge Two Sorted Lists', difficulty: 'easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'lc-141', title: 'Linked List Cycle', difficulty: 'easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'lc-23', title: 'Merge K Sorted Lists', difficulty: 'hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'lc-19', title: 'Remove Nth Node From End', difficulty: 'medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'lc-143', title: 'Reorder List', difficulty: 'medium', url: 'https://leetcode.com/problems/reorder-list/' },
    ]
  },
  {
    id: 'trees', label: 'Trees', icon: '🌳', color: 'emerald',
    problems: [
      { id: 'lc-104', title: 'Maximum Depth of Binary Tree', difficulty: 'easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'lc-226', title: 'Invert Binary Tree', difficulty: 'easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { id: 'lc-102', title: 'Binary Tree Level Order Traversal', difficulty: 'medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 'lc-98', title: 'Validate Binary Search Tree', difficulty: 'medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
      { id: 'lc-235', title: 'Lowest Common Ancestor of BST', difficulty: 'medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
      { id: 'lc-124', title: 'Binary Tree Maximum Path Sum', difficulty: 'hard', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    ]
  },
  {
    id: 'dynamic-programming', label: 'Dynamic Programming', icon: '⚡', color: 'orange',
    problems: [
      { id: 'lc-70', title: 'Climbing Stairs', difficulty: 'easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'lc-322', title: 'Coin Change', difficulty: 'medium', url: 'https://leetcode.com/problems/coin-change/' },
      { id: 'lc-300', title: 'Longest Increasing Subsequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'lc-1143', title: 'Longest Common Subsequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'lc-416', title: 'Partition Equal Subset Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
      { id: 'lc-72', title: 'Edit Distance', difficulty: 'hard', url: 'https://leetcode.com/problems/edit-distance/' },
    ]
  },
  {
    id: 'graphs', label: 'Graphs', icon: '🕸️', color: 'red',
    problems: [
      { id: 'lc-200', title: 'Number of Islands', difficulty: 'medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'lc-207', title: 'Course Schedule', difficulty: 'medium', url: 'https://leetcode.com/problems/course-schedule/' },
      { id: 'lc-133', title: 'Clone Graph', difficulty: 'medium', url: 'https://leetcode.com/problems/clone-graph/' },
      { id: 'lc-417', title: 'Pacific Atlantic Water Flow', difficulty: 'medium', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
      { id: 'lc-127', title: 'Word Ladder', difficulty: 'hard', url: 'https://leetcode.com/problems/word-ladder/' },
    ]
  },
  {
    id: 'hashing', label: 'Hashing', icon: '🗝️', color: 'indigo',
    problems: [
      { id: 'lc-217', title: 'Contains Duplicate', difficulty: 'easy', url: 'https://leetcode.com/problems/contains-duplicate/' },
      { id: 'lc-128', title: 'Longest Consecutive Sequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
      { id: 'lc-347', title: 'Top K Frequent Elements', difficulty: 'medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: 'lc-146', title: 'LRU Cache', difficulty: 'medium', url: 'https://leetcode.com/problems/lru-cache/' },
      { id: 'lc-380', title: 'Insert Delete GetRandom O(1)', difficulty: 'medium', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/' },
    ]
  },
  {
    id: 'sorting', label: 'Sorting & Searching', icon: '🔍', color: 'cyan',
    problems: [
      { id: 'lc-704', title: 'Binary Search', difficulty: 'easy', url: 'https://leetcode.com/problems/binary-search/' },
      { id: 'lc-33', title: 'Search in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'lc-153', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'lc-4', title: 'Median of Two Sorted Arrays', difficulty: 'hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { id: 'lc-912', title: 'Sort an Array', difficulty: 'medium', url: 'https://leetcode.com/problems/sort-an-array/' },
    ]
  },
  {
    id: 'stacks-queues', label: 'Stacks & Queues', icon: '📚', color: 'yellow',
    problems: [
      { id: 'lc-155', title: 'Min Stack', difficulty: 'medium', url: 'https://leetcode.com/problems/min-stack/' },
      { id: 'lc-84', title: 'Largest Rectangle in Histogram', difficulty: 'hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
      { id: 'lc-739', title: 'Daily Temperatures', difficulty: 'medium', url: 'https://leetcode.com/problems/daily-temperatures/' },
      { id: 'lc-496', title: 'Next Greater Element I', difficulty: 'easy', url: 'https://leetcode.com/problems/next-greater-element-i/' },
      { id: 'lc-225', title: 'Implement Stack using Queues', difficulty: 'easy', url: 'https://leetcode.com/problems/implement-stack-using-queues/' },
    ]
  },
  {
    id: 'recursion', label: 'Recursion & Backtracking', icon: '🔄', color: 'pink',
    problems: [
      { id: 'lc-46', title: 'Permutations', difficulty: 'medium', url: 'https://leetcode.com/problems/permutations/' },
      { id: 'lc-78', title: 'Subsets', difficulty: 'medium', url: 'https://leetcode.com/problems/subsets/' },
      { id: 'lc-39', title: 'Combination Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/combination-sum/' },
      { id: 'lc-51', title: 'N-Queens', difficulty: 'hard', url: 'https://leetcode.com/problems/n-queens/' },
      { id: 'lc-79', title: 'Word Search', difficulty: 'medium', url: 'https://leetcode.com/problems/word-search/' },
    ]
  },
  {
    id: 'greedy', label: 'Greedy', icon: '💰', color: 'lime',
    problems: [
      { id: 'lc-55', title: 'Jump Game', difficulty: 'medium', url: 'https://leetcode.com/problems/jump-game/' },
      { id: 'lc-45', title: 'Jump Game II', difficulty: 'medium', url: 'https://leetcode.com/problems/jump-game-ii/' },
      { id: 'lc-435', title: 'Non-overlapping Intervals', difficulty: 'medium', url: 'https://leetcode.com/problems/non-overlapping-intervals/' },
      { id: 'lc-134', title: 'Gas Station', difficulty: 'medium', url: 'https://leetcode.com/problems/gas-station/' },
      { id: 'lc-621', title: 'Task Scheduler', difficulty: 'medium', url: 'https://leetcode.com/problems/task-scheduler/' },
    ]
  },
  {
    id: 'bit-manipulation', label: 'Bit Manipulation', icon: '⚙️', color: 'slate',
    problems: [
      { id: 'lc-191', title: 'Number of 1 Bits', difficulty: 'easy', url: 'https://leetcode.com/problems/number-of-1-bits/' },
      { id: 'lc-338', title: 'Counting Bits', difficulty: 'easy', url: 'https://leetcode.com/problems/counting-bits/' },
      { id: 'lc-268', title: 'Missing Number', difficulty: 'easy', url: 'https://leetcode.com/problems/missing-number/' },
      { id: 'lc-371', title: 'Sum of Two Integers', difficulty: 'medium', url: 'https://leetcode.com/problems/sum-of-two-integers/' },
      { id: 'lc-190', title: 'Reverse Bits', difficulty: 'easy', url: 'https://leetcode.com/problems/reverse-bits/' },
    ]
  },
];

const DIFF_STYLE = {
  easy:   'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  hard:   'bg-red-500/10 text-red-400 border border-red-500/20',
};

const CARD_COLORS = {
  blue:    'from-blue-900/40 to-blue-800/20 border-blue-500/30',
  purple:  'from-purple-900/40 to-purple-800/20 border-purple-500/30',
  green:   'from-green-900/40 to-green-800/20 border-green-500/30',
  emerald: 'from-emerald-900/40 to-emerald-800/20 border-emerald-500/30',
  orange:  'from-orange-900/40 to-orange-800/20 border-orange-500/30',
  red:     'from-red-900/40 to-red-800/20 border-red-500/30',
  indigo:  'from-indigo-900/40 to-indigo-800/20 border-indigo-500/30',
  cyan:    'from-cyan-900/40 to-cyan-800/20 border-cyan-500/30',
  yellow:  'from-yellow-900/40 to-yellow-800/20 border-yellow-500/30',
  pink:    'from-pink-900/40 to-pink-800/20 border-pink-500/30',
  lime:    'from-lime-900/40 to-lime-800/20 border-lime-500/30',
  slate:   'from-slate-800/60 to-slate-700/30 border-slate-500/30',
};

const Practice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doneProblemIds, setDoneProblemIds] = useState(new Set());
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const [generatingTopic, setGeneratingTopic] = useState(null);

  useEffect(() => {
    const fetchDone = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/practice/done', config);
        setDoneProblemIds(new Set(data.map(d => d.problemSlug)));
      } catch (err) { console.error(err); }
    };
    fetchDone();
  }, [user.token]);

  const handleAiGenerate = async (e, topic) => {
    e.stopPropagation();
    if (generatingTopic) return;
    setGeneratingTopic(topic.id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/practice/generate', { topic: topic.id }, config);
      navigate(`/practice/${topic.id}`, { state: { problem: data, topic } });
    } catch (err) {
      console.error(err);
      alert('AI Generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingTopic(null);
    }
  };

  const handleMarkDone = async (e, topic, problem) => {
    e.stopPropagation();
    if (doneProblemIds.has(problem.id) || markingId === problem.id) return;
    setMarkingId(problem.id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/practice/complete', {
        problemSlug: problem.id,
        topic: topic.id,
        title: problem.title,
      }, config);
      setDoneProblemIds(prev => new Set([...prev, problem.id]));
    } catch (err) { console.error(err); }
    finally { setMarkingId(null); }
  };

  const totalDone = doneProblemIds.size;
  const totalProblems = TOPICS.reduce((a, t) => a + t.problems.length, 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      <header className="bg-[#111827] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg"><BookOpen size={22} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Practice Mode</h1>
              <p className="text-xs text-gray-400">Top LeetCode problems, organized by topic</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
          <CheckCircle2 size={16} className="text-green-400" />
          <span className="text-sm font-bold text-white">{totalDone}</span>
          <span className="text-sm text-gray-400">/ {totalProblems} solved</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-white mb-1">Choose a Topic</h2>
          <p className="text-gray-400">Click a topic to expand. Open problems on LeetCode and mark them done to track progress!</p>
        </div>

        {TOPICS.map((topic) => {
          const solvedCount = topic.problems.filter(p => doneProblemIds.has(p.id)).length;
          const isOpen = expandedTopic === topic.id;
          const cardColor = CARD_COLORS[topic.color] || CARD_COLORS.blue;

          return (
            <div key={topic.id} className={`bg-gradient-to-br ${cardColor} border rounded-2xl overflow-hidden transition-all duration-300`}>
              <button
                onClick={() => setExpandedTopic(isOpen ? null : topic.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{topic.icon}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">{topic.label}</h3>
                    <p className="text-sm text-gray-400">{topic.problems.length} problems</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${(solvedCount / topic.problems.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">{solvedCount}/{topic.problems.length}</span>
                  </div>

                  <button
                    onClick={(e) => handleAiGenerate(e, topic)}
                    className="p-2 bg-purple-600/80 hover:bg-purple-500 rounded-lg text-white transition-all hover:scale-105 flex items-center space-x-1"
                    title="Generate AI Problem"
                    disabled={generatingTopic === topic.id}
                  >
                    {generatingTopic === topic.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span className="text-xs font-bold uppercase hidden sm:inline">AI Challenge</span>
                      </>
                    )}
                  </button>

                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                  {topic.problems.map((problem) => {
                    const isDone = doneProblemIds.has(problem.id);
                    const isMarking = markingId === problem.id;
                    return (
                      <div key={problem.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => handleMarkDone(e, topic, problem)}
                            disabled={isDone || isMarking}
                            title={isDone ? 'Solved!' : 'Mark as done'}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                              ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}`}
                          >
                            {isDone && <CheckCircle2 size={14} className="text-white" />}
                          </button>
                          <span className={`font-medium text-sm ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {problem.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${DIFF_STYLE[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                          >
                            <span>LeetCode</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Practice;
