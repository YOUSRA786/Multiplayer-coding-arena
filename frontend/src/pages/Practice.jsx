import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, BookOpen, CheckCircle2, ExternalLink, 
  ChevronDown, ChevronUp, Sparkles, Loader2, Sword, 
  Zap, Target, Shield, Terminal, Hash, AlertTriangle, RefreshCw
} from 'lucide-react';

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

const CURATED_LEETCODE = {
  arrays: [
    { id: 'lc-1', title: 'Two Sum', difficulty: 'easy', url: 'https://leetcode.com/problems/two-sum/' },
    { id: 'lc-121', title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { id: 'lc-283', title: 'Move Zeroes', difficulty: 'easy', url: 'https://leetcode.com/problems/move-zeroes/' },
    { id: 'lc-238', title: 'Product of Array Except Self', difficulty: 'medium', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
    { id: 'lc-53', title: 'Maximum Subarray', difficulty: 'medium', url: 'https://leetcode.com/problems/maximum-subarray/' },
    { id: 'lc-15', title: '3Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/3sum/' },
    { id: 'lc-11', title: 'Container With Most Water', difficulty: 'medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
    { id: 'lc-42', title: 'Trapping Rain Water', difficulty: 'hard', url: 'https://leetcode.com/problems/trapping-rain-water/' },
    { id: 'lc-4', title: 'Median of Two Sorted Arrays', difficulty: 'hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { id: 'lc-41', title: 'First Missing Positive', difficulty: 'hard', url: 'https://leetcode.com/problems/first-missing-positive/' },
  ],
  strings: [
    { id: 'lc-20', title: 'Valid Parentheses', difficulty: 'easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
    { id: 'lc-242', title: 'Valid Anagram', difficulty: 'easy', url: 'https://leetcode.com/problems/valid-anagram/' },
    { id: 'lc-14', title: 'Longest Common Prefix', difficulty: 'easy', url: 'https://leetcode.com/problems/longest-common-prefix/' },
    { id: 'lc-3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { id: 'lc-5', title: 'Longest Palindromic Substring', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
    { id: 'lc-49', title: 'Group Anagrams', difficulty: 'medium', url: 'https://leetcode.com/problems/group-anagrams/' },
    { id: 'lc-8', title: 'String to Integer (atoi)', difficulty: 'medium', url: 'https://leetcode.com/problems/string-to-integer-atoi/' },
    { id: 'lc-76', title: 'Minimum Window Substring', difficulty: 'hard', url: 'https://leetcode.com/problems/minimum-window-substring/' },
    { id: 'lc-10', title: 'Regular Expression Matching', difficulty: 'hard', url: 'https://leetcode.com/problems/regular-expression-matching/' },
    { id: 'lc-72', title: 'Edit Distance', difficulty: 'hard', url: 'https://leetcode.com/problems/edit-distance/' },
  ],
  'linked-lists': [
    { id: 'lc-206', title: 'Reverse Linked List', difficulty: 'easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
    { id: 'lc-21', title: 'Merge Two Sorted Lists', difficulty: 'easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { id: 'lc-141', title: 'Linked List Cycle', difficulty: 'easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
    { id: 'lc-19', title: 'Remove Nth Node From End', difficulty: 'medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
    { id: 'lc-143', title: 'Reorder List', difficulty: 'medium', url: 'https://leetcode.com/problems/reorder-list/' },
    { id: 'lc-2', title: 'Add Two Numbers', difficulty: 'medium', url: 'https://leetcode.com/problems/add-two-numbers/' },
    { id: 'lc-138', title: 'Copy List with Random Pointer', difficulty: 'medium', url: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
    { id: 'lc-23', title: 'Merge K Sorted Lists', difficulty: 'hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    { id: 'lc-25', title: 'Reverse Nodes in k-Group', difficulty: 'hard', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
    { id: 'lc-142', title: 'Linked List Cycle II', difficulty: 'hard', url: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
  ],
  trees: [
    { id: 'lc-226', title: 'Invert Binary Tree', difficulty: 'easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
    { id: 'lc-104', title: 'Maximum Depth of Binary Tree', difficulty: 'easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
    { id: 'lc-100', title: 'Same Tree', difficulty: 'easy', url: 'https://leetcode.com/problems/same-tree/' },
    { id: 'lc-102', title: 'Binary Tree Level Order Traversal', difficulty: 'medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { id: 'lc-98', title: 'Validate Binary Search Tree', difficulty: 'medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
    { id: 'lc-236', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
    { id: 'lc-103', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'medium', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
    { id: 'lc-124', title: 'Binary Tree Maximum Path Sum', difficulty: 'hard', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    { id: 'lc-297', title: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
    { id: 'lc-212', title: 'Word Search II', difficulty: 'hard', url: 'https://leetcode.com/problems/word-search-ii/' },
  ],
  'dynamic-programming': [
    { id: 'lc-70', title: 'Climbing Stairs', difficulty: 'easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
    { id: 'lc-198', title: 'House Robber', difficulty: 'easy', url: 'https://leetcode.com/problems/house-robber/' },
    { id: 'lc-746', title: 'Min Cost Climbing Stairs', difficulty: 'easy', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
    { id: 'lc-322', title: 'Coin Change', difficulty: 'medium', url: 'https://leetcode.com/problems/coin-change/' },
    { id: 'lc-300', title: 'Longest Increasing Subsequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    { id: 'lc-1143', title: 'Longest Common Subsequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
    { id: 'lc-139', title: 'Word Break', difficulty: 'medium', url: 'https://leetcode.com/problems/word-break/' },
    { id: 'lc-10-dp', title: 'Regular Expression Matching', difficulty: 'hard', url: 'https://leetcode.com/problems/regular-expression-matching/' },
    { id: 'lc-32', title: 'Longest Valid Parentheses', difficulty: 'hard', url: 'https://leetcode.com/problems/longest-valid-parentheses/' },
    { id: 'lc-115', title: 'Distinct Subsequences', difficulty: 'hard', url: 'https://leetcode.com/problems/distinct-subsequences/' },
  ],
  graphs: [
    { id: 'lc-1791', title: 'Find Center of Star Graph', difficulty: 'easy', url: 'https://leetcode.com/problems/find-center-of-star-graph/' },
    { id: 'lc-463', title: 'Island Perimeter', difficulty: 'easy', url: 'https://leetcode.com/problems/island-perimeter/' },
    { id: 'lc-1971', title: 'Find if Path Exists in Graph', difficulty: 'easy', url: 'https://leetcode.com/problems/find-if-path-exists-in-graph/' },
    { id: 'lc-200', title: 'Number of Islands', difficulty: 'medium', url: 'https://leetcode.com/problems/number-of-islands/' },
    { id: 'lc-207', title: 'Course Schedule', difficulty: 'medium', url: 'https://leetcode.com/problems/course-schedule/' },
    { id: 'lc-133', title: 'Clone Graph', difficulty: 'medium', url: 'https://leetcode.com/problems/clone-graph/' },
    { id: 'lc-417', title: 'Pacific Atlantic Water Flow', difficulty: 'medium', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
    { id: 'lc-127', title: 'Word Ladder', difficulty: 'hard', url: 'https://leetcode.com/problems/word-ladder/' },
    { id: 'lc-269', title: 'Alien Dictionary', difficulty: 'hard', url: 'https://leetcode.com/problems/alien-dictionary/' },
    { id: 'lc-329', title: 'Longest Increasing Path in a Matrix', difficulty: 'hard', url: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
  ],
  'stacks-queues': [
    { id: 'lc-496', title: 'Next Greater Element I', difficulty: 'easy', url: 'https://leetcode.com/problems/next-greater-element-i/' },
    { id: 'lc-225', title: 'Implement Stack using Queues', difficulty: 'easy', url: 'https://leetcode.com/problems/implement-stack-using-queues/' },
    { id: 'lc-506', title: 'Relative Ranks', difficulty: 'easy', url: 'https://leetcode.com/problems/relative-ranks/' },
    { id: 'lc-155', title: 'Min Stack', difficulty: 'medium', url: 'https://leetcode.com/problems/min-stack/' },
    { id: 'lc-739', title: 'Daily Temperatures', difficulty: 'medium', url: 'https://leetcode.com/problems/daily-temperatures/' },
    { id: 'lc-150', title: 'Evaluate Reverse Polish Notation', difficulty: 'medium', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
    { id: 'lc-227', title: 'Basic Calculator II', difficulty: 'medium', url: 'https://leetcode.com/problems/basic-calculator-ii/' },
    { id: 'lc-84', title: 'Largest Rectangle in Histogram', difficulty: 'hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
    { id: 'lc-239', title: 'Sliding Window Maximum', difficulty: 'hard', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
    { id: 'lc-224', title: 'Basic Calculator', difficulty: 'hard', url: 'https://leetcode.com/problems/basic-calculator/' },
  ],
  sorting: [
    { id: 'lc-704', title: 'Binary Search', difficulty: 'easy', url: 'https://leetcode.com/problems/binary-search/' },
    { id: 'lc-278', title: 'First Bad Version', difficulty: 'easy', url: 'https://leetcode.com/problems/first-bad-version/' },
    { id: 'lc-349', title: 'Intersection of Two Arrays', difficulty: 'easy', url: 'https://leetcode.com/problems/intersection-of-two-arrays/' },
    { id: 'lc-33', title: 'Search in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
    { id: 'lc-153', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
    { id: 'lc-74', title: 'Search a 2D Matrix', difficulty: 'medium', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
    { id: 'lc-347', title: 'Top K Frequent Elements', difficulty: 'medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    { id: 'lc-4-sort', title: 'Median of Two Sorted Arrays', difficulty: 'hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { id: 'lc-315', title: 'Count of Smaller Numbers After Self', difficulty: 'hard', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/' },
    { id: 'lc-1368', title: 'Sort Items by Groups Respecting Dependencies', difficulty: 'hard', url: 'https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/' },
  ],
  recursion: [
    { id: 'lc-509', title: 'Fibonacci Number', difficulty: 'easy', url: 'https://leetcode.com/problems/fibonacci-number/' },
    { id: 'lc-326', title: 'Power of Three', difficulty: 'easy', url: 'https://leetcode.com/problems/power-of-three/' },
    { id: 'lc-78-rec', title: 'Subsets', difficulty: 'easy', url: 'https://leetcode.com/problems/subsets/' },
    { id: 'lc-46', title: 'Permutations', difficulty: 'medium', url: 'https://leetcode.com/problems/permutations/' },
    { id: 'lc-78-mid', title: 'Subsets II', difficulty: 'medium', url: 'https://leetcode.com/problems/subsets-ii/' },
    { id: 'lc-39', title: 'Combination Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/combination-sum/' },
    { id: 'lc-79', title: 'Word Search', difficulty: 'medium', url: 'https://leetcode.com/problems/word-search/' },
    { id: 'lc-51', title: 'N-Queens', difficulty: 'hard', url: 'https://leetcode.com/problems/n-queens/' },
    { id: 'lc-37', title: 'Sudoku Solver', difficulty: 'hard', url: 'https://leetcode.com/problems/sudoku-solver/' },
    { id: 'lc-131', title: 'Palindrome Partitioning', difficulty: 'hard', url: 'https://leetcode.com/problems/palindrome-partitioning/' },
  ],
  hashing: [
    { id: 'lc-217', title: 'Contains Duplicate', difficulty: 'easy', url: 'https://leetcode.com/problems/contains-duplicate/' },
    { id: 'lc-350', title: 'Intersection of Two Arrays II', difficulty: 'easy', url: 'https://leetcode.com/problems/intersection-of-two-arrays-ii/' },
    { id: 'lc-202', title: 'Happy Number', difficulty: 'easy', url: 'https://leetcode.com/problems/happy-number/' },
    { id: 'lc-128', title: 'Longest Consecutive Sequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
    { id: 'lc-146', title: 'LRU Cache', difficulty: 'medium', url: 'https://leetcode.com/problems/lru-cache/' },
    { id: 'lc-380', title: 'Insert Delete GetRandom O(1)', difficulty: 'medium', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/' },
    { id: 'lc-523', title: 'Continuous Subarray Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/continuous-subarray-sum/' },
    { id: 'lc-149', title: 'Max Points on a Line', difficulty: 'hard', url: 'https://leetcode.com/problems/max-points-on-a-line/' },
    { id: 'lc-992', title: 'Subarrays with K Different Integers', difficulty: 'hard', url: 'https://leetcode.com/problems/subarrays-with-k-different-integers/' },
    { id: 'lc-632', title: 'Smallest Range Covering Elements from K Lists', difficulty: 'hard', url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/' },
  ],
  greedy: [
    { id: 'lc-455', title: 'Assign Cookies', difficulty: 'easy', url: 'https://leetcode.com/problems/assign-cookies/' },
    { id: 'lc-122', title: 'Best Time to Buy and Sell Stock II', difficulty: 'easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/' },
    { id: 'lc-605', title: 'Can Place Flowers', difficulty: 'easy', url: 'https://leetcode.com/problems/can-place-flowers/' },
    { id: 'lc-55', title: 'Jump Game', difficulty: 'medium', url: 'https://leetcode.com/problems/jump-game/' },
    { id: 'lc-45', title: 'Jump Game II', difficulty: 'medium', url: 'https://leetcode.com/problems/jump-game-ii/' },
    { id: 'lc-134', title: 'Gas Station', difficulty: 'medium', url: 'https://leetcode.com/problems/gas-station/' },
    { id: 'lc-435', title: 'Non-overlapping Intervals', difficulty: 'medium', url: 'https://leetcode.com/problems/non-overlapping-intervals/' },
    { id: 'lc-135', title: 'Candy', difficulty: 'hard', url: 'https://leetcode.com/problems/candy/' },
    { id: 'lc-44', title: 'Wildcard Matching', difficulty: 'hard', url: 'https://leetcode.com/problems/wildcard-matching/' },
    { id: 'lc-330', title: 'Patching Array', difficulty: 'hard', url: 'https://leetcode.com/problems/patching-array/' },
  ],
  'bit-manipulation': [
    { id: 'lc-191', title: 'Number of 1 Bits', difficulty: 'easy', url: 'https://leetcode.com/problems/number-of-1-bits/' },
    { id: 'lc-338', title: 'Counting Bits', difficulty: 'easy', url: 'https://leetcode.com/problems/counting-bits/' },
    { id: 'lc-268', title: 'Missing Number', difficulty: 'easy', url: 'https://leetcode.com/problems/missing-number/' },
    { id: 'lc-371', title: 'Sum of Two Integers', difficulty: 'medium', url: 'https://leetcode.com/problems/sum-of-two-integers/' },
    { id: 'lc-137', title: 'Single Number II', difficulty: 'medium', url: 'https://leetcode.com/problems/single-number-ii/' },
    { id: 'lc-201', title: 'Bitwise AND of Numbers Range', difficulty: 'medium', url: 'https://leetcode.com/problems/bitwise-and-of-numbers-range/' },
    { id: 'lc-260', title: 'Single Number III', difficulty: 'medium', url: 'https://leetcode.com/problems/single-number-iii/' },
    { id: 'lc-477', title: 'Total Hamming Distance', difficulty: 'hard', url: 'https://leetcode.com/problems/total-hamming-distance/' },
    { id: 'lc-1178', title: 'Number of Valid Words for Each Puzzle', difficulty: 'hard', url: 'https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/' },
    { id: 'lc-411', title: 'Minimum Unique Word Abbreviation', difficulty: 'hard', url: 'https://leetcode.com/problems/minimum-unique-word-abbreviation/' },
  ],
};

const Practice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [doneProblemIds, setDoneProblemIds] = useState(new Set());
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [generatingTopic, setGeneratingTopic] = useState(null);
  const [topicProblems, setTopicProblems] = useState({});
  const [loadingProblems, setLoadingProblems] = useState(null);
  const [activeTab, setActiveTab] = useState('leetcode');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [topicsRes, doneRes] = await Promise.all([
        axios.get('http://localhost:5000/api/practice/topics', config),
        axios.get('http://localhost:5000/api/practice/done', config)
      ]);
      setTopics(topicsRes.data);
      setDoneProblemIds(new Set(doneRes.data.map(d => d.problemSlug)));
    } catch (err) { 
      console.error(err); 
      setErrorMsg("Failed to synchronize with Neural Archives. Ensure Arena Protocol is active.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.token]);

  const toggleTopic = async (topicId) => {
    const isOpen = expandedTopic === topicId;
    if (isOpen) {
      setExpandedTopic(null);
      return;
    }
    setExpandedTopic(topicId);
    
    if (!topicProblems[topicId]) {
      setLoadingProblems(topicId);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/practice/problems/${topicId}`, config);
        setTopicProblems(prev => ({ ...prev, [topicId]: data }));
      } catch (err) { console.error(err); }
      finally { setLoadingProblems(null); }
    }
  };

  const handleAiGenerate = async (e, topic) => {
    e.stopPropagation();
    if (generatingTopic) return;
    setGeneratingTopic(topic.id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/practice/generate', { topic: topic.id }, config);
      setTopicProblems(prev => ({
        ...prev,
        [topic.id]: [...(prev[topic.id] || []), data]
      }));
      navigate(`/practice/${topic.id}`, { state: { problem: data, topic } });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'AI Generation protocol failed. Re-sync suggested.';
      alert(msg);
    } finally {
      setGeneratingTopic(null);
    }
  };

  const handleMarkDone = async (e, topic, problem) => {
    e.stopPropagation();
    const problemId = problem._id || problem.id;
    if (doneProblemIds.has(problemId) || markingId === problemId) return;
    setMarkingId(problemId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/practice/complete', {
        problemSlug: problemId,
        topic: topic.id,
        title: problem.title,
      }, config);
      setDoneProblemIds(prev => new Set([...prev, problemId]));
    } catch (err) { console.error(err); }
    finally { setMarkingId(null); }
  };

  const totalDone = doneProblemIds.size;

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
              <BookOpen size={24} className="text-purple-500" />
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">NEURAL <span className="text-purple-500">TRAINING</span></h1>
            </div>
            <p className="text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase mt-1 ml-1">Archive Node: Active</p>
          </div>
        </div>
        <div className="brawl-card px-6 py-3 flex items-center space-x-3 glow-cyan">
          <CheckCircle2 size={18} className="text-green-500" />
          <span className="text-2xl font-black italic tracking-tight">{totalDone}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modules Secured</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 z-10 w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">Select Protocol</h2>
          <p className="text-gray-500 text-sm max-w-md">Initialize a training module to refine your cognitive logic across 12 core archives.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <Loader2 size={48} className="text-purple-500 animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">Syncing Archives...</p>
          </div>
        ) : errorMsg ? (
          <div className="brawl-card p-12 text-center border-red-500/20">
             <AlertTriangle size={48} className="mx-auto text-red-500 mb-6" />
             <h3 className="text-xl font-black italic uppercase text-white mb-2">Archive Link Breach</h3>
             <p className="text-sm text-gray-500 mb-8">{errorMsg}</p>
             <button onClick={fetchData} className="px-8 py-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-2xl flex items-center space-x-3 mx-auto transition-all group">
               <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Retry Sync</span>
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {topics.map((topic) => {
              const isOpen = expandedTopic === topic.id;
              const problems = topicProblems[topic.id] || [];
              const leetcodeProblems = CURATED_LEETCODE[topic.id] || [];
              const cardColor = CARD_COLORS[topic.color] || CARD_COLORS.blue;
              const solvedCount = problems.filter(p => doneProblemIds.has(p._id)).length + leetcodeProblems.filter(p => doneProblemIds.has(p.id)).length;

              return (
                <div key={topic.id} className={`bg-gradient-to-br ${cardColor} border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:transform hover:scale-[1.01]`}>
                  <div
                    className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <div className="flex items-center space-x-6 text-left">
                      <span className="text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{topic.icon}</span>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{topic.label}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{isOpen ? (problems.length + leetcodeProblems.length) : (topic.solved + ' Solved')}</span>
                          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{solvedCount} Secured</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      {isOpen && (
                        <div className="flex items-center space-x-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-all duration-1000"
                              style={{ width: `${(solvedCount / Math.max(1, problems.length + leetcodeProblems.length)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-black italic">{Math.round((solvedCount / Math.max(1, problems.length + leetcodeProblems.length)) * 100)}%</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleAiGenerate(e, topic)}
                        className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all hover:scale-110 shadow-lg shadow-purple-900/40 group"
                        title="Generate Neural Problem"
                        disabled={generatingTopic === topic.id}
                      >
                        {generatingTopic === topic.id ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Sparkles size={20} className="group-hover:animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic hidden sm:inline">New Archive</span>
                          </div>
                        )}
                      </button>

                      {isOpen ? <ChevronUp size={24} className="text-white/40" /> : <ChevronDown size={24} className="text-white/40" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="bg-black/40 backdrop-blur-md border-t border-white/5">
                      <div className="flex px-8 border-b border-white/5">
                        <button 
                          onClick={() => setActiveTab('leetcode')}
                          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all border-b-2 ${activeTab === 'leetcode' ? 'border-purple-500 text-purple-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                          Neural Archives
                        </button>
                        <button 
                          onClick={() => setActiveTab('native')}
                          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all border-b-2 ${activeTab === 'native' ? 'border-purple-500 text-purple-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                          Native Protocols
                        </button>
                      </div>

                      <div className="divide-y divide-white/5">
                        {activeTab === 'native' ? (
                          loadingProblems === topic.id ? (
                            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" size={32} /></div>
                          ) : (
                            <div className="p-4 space-y-2">
                              {problems.length > 0 ? problems.map((p) => {
                                const isDone = doneProblemIds.has(p._id);
                                return (
                                  <div 
                                    key={p._id} 
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group cursor-pointer"
                                    onClick={() => navigate(`/practice/${topic.id}`, { state: { problem: p, topic } })}
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${isDone ? 'bg-green-500 border-green-500 shadow-[0_0_10px_#22c55e]' : 'border-white/10 group-hover:border-green-500/50'}`}>
                                        {isDone && <CheckCircle2 size={16} className="text-white" />}
                                      </div>
                                      <span className={`text-sm font-bold uppercase tracking-tight ${isDone ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-white'}`}>{p.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded italic border ${DIFF_STYLE[p.difficulty]}`}>{p.difficulty}</span>
                                      <ExternalLink size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                  </div>
                                );
                              }) : (
                                <div className="p-12 text-center text-gray-600 text-xs italic">No native protocols found. Click 'New Archive' to generate one.</div>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="p-4 space-y-2">
                            {leetcodeProblems.map((p) => {
                              const isDone = doneProblemIds.has(p.id);
                              return (
                                <div 
                                  key={p.id} 
                                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={(e) => handleMarkDone(e, topic, p)}
                                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${isDone ? 'bg-green-500 border-green-500 shadow-[0_0_10px_#22c55e]' : 'border-white/10 group-hover:border-green-500/50'}`}
                                    >
                                      {isDone && <CheckCircle2 size={16} className="text-white" />}
                                    </button>
                                    <span className={`text-sm font-bold uppercase tracking-tight ${isDone ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-white'}`}>{p.title}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded italic border ${DIFF_STYLE[p.difficulty]}`}>{p.difficulty}</span>
                                    <a
                                      href={p.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all flex items-center space-x-2"
                                    >
                                      <span className="text-[10px] font-black uppercase tracking-widest">Execute</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
