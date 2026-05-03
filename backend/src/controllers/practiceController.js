const Problem = require('../models/Problem');
const PracticeLog = require('../models/PracticeLog');
const mongoose = require('mongoose');

const DSA_TOPICS = [
  { id: 'arrays', label: 'Arrays', icon: '📦', color: 'blue' },
  { id: 'strings', label: 'Strings', icon: '🔤', color: 'purple' },
  { id: 'linked-lists', label: 'Linked Lists', icon: '🔗', color: 'green' },
  { id: 'stacks-queues', label: 'Stacks & Queues', icon: '📚', color: 'yellow' },
  { id: 'trees', label: 'Trees', icon: '🌳', color: 'emerald' },
  { id: 'graphs', label: 'Graphs', icon: '🕸️', color: 'red' },
  { id: 'dynamic-programming', label: 'Dynamic Programming', icon: '⚡', color: 'orange' },
  { id: 'sorting', label: 'Sorting & Searching', icon: '🔍', color: 'cyan' },
  { id: 'recursion', label: 'Recursion', icon: '🔄', color: 'pink' },
  { id: 'hashing', label: 'Hashing', icon: '🗝️', color: 'indigo' },
  { id: 'greedy', label: 'Greedy', icon: '💰', color: 'lime' },
  { id: 'bit-manipulation', label: 'Bit Manipulation', icon: '⚙️', color: 'slate' },
];

// GET /api/practice/topics  — returns topics with user's solve count
const getTopics = async (req, res) => {
  try {
    const userId = req.user._id;

    const logs = await PracticeLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    const solveMap = {};
    logs.forEach(l => { solveMap[l._id] = l.count; });

    const topicsWithProgress = DSA_TOPICS.map(t => ({
      ...t,
      solved: solveMap[t.id] || 0
    }));

    res.json(topicsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/practice/generate  — AI generates a topic-specific problem
const generatePracticeProblem = async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic is required' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY not configured in .env' });
  }

  const topicObj = DSA_TOPICS.find(t => t.id === topic);
  const topicLabel = topicObj ? topicObj.label : topic;

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
Generate a unique coding interview problem specifically about the topic: "${topicLabel}".
It should be of a random difficulty (easy, medium, or hard).

Return a JSON object with this schema:
{
  "title": "String",
  "description": "String",
  "difficulty": "String - 'easy', 'medium', or 'hard'",
  "topic": "${topic}",
  "examples": [
    {
      "input": "String",
      "output": "String",
      "explanation": "String"
    }
  ],
  "constraints": ["String"],
  "boilerplateCode": {
    "python": "String",
    "cpp": "String",
    "java": "String"
  },
  "testCases": [
    {
      "input": "String",
      "expectedOutput": "String"
    }
  ]
}

Rules:
1. Exactly 2 examples, exactly 5 testCases.
2. CRITICAL: DO NOT include the solution logic or any solved code in the boilerplateCode.
3. Provide the COMPLETE boilerplate including necessary imports, the target function signature, and the Main method/block that reads from stdin and prints the result.
4. For Java, use public class Main.
`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(raw);
    parsed.topic = topic;

    const problem = await Problem.create(parsed);
    res.json(problem);
  } catch (error) {
    console.error('Practice Gemini error:', error?.message || error);
    
    // Try DB fallback for the topic
    try {
      const fallbackProblem = await Problem.findOne({ topic: topic });
      if (fallbackProblem) {
        console.log('Using DB fallback for topic:', topic);
        return res.json(fallbackProblem);
      }
    } catch (fallbackErr) {
      console.error('Topic fallback failed:', fallbackErr.message);
    }

    const errMsg = error?.message || 'Unknown error';
    res.status(500).json({ message: `AI generation failed: ${errMsg}` });
  }
};

// POST /api/practice/complete  — log a completed problem
const completeProblem = async (req, res) => {
  try {
    const { problemSlug, topic, title } = req.body;
    const userId = req.user._id;

    if (!problemSlug || !topic) {
      return res.status(400).json({ message: 'problemSlug and topic are required' });
    }

    // Upsert: ignore if already completed
    await PracticeLog.findOneAndUpdate(
      { userId, problemSlug },
      { userId, problemSlug, topic, title, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Problem marked as complete!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/practice/done — returns all completed problem slugs for the user
const getDoneIds = async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await PracticeLog.find({ userId }).select('problemSlug topic');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/practice/progress  — full progress breakdown for profile
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await PracticeLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 }, lastSolved: { $max: '$completedAt' } } },
      { $sort: { lastSolved: -1 } }
    ]);

    const totalSolved = logs.reduce((acc, l) => acc + l.count, 0);
    res.json({ totalSolved, byTopic: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/practice/problems/:topicId — returns all problems for a topic
const getProblemsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const problems = await Problem.find({ topic: topicId })
      .select('title difficulty _id topic')
      .sort({ difficulty: 1 }); // easy first
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getTopics, 
  generatePracticeProblem, 
  completeProblem, 
  getProgress, 
  getDoneIds,
  getProblemsByTopic
};
