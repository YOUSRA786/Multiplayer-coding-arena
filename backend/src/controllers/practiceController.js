const OpenAI = require('openai');
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

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: 'OpenAI API key not configured' });
  }

  const topicObj = DSA_TOPICS.find(t => t.id === topic);
  const topicLabel = topicObj ? topicObj.label : topic;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Generate a unique coding interview problem specifically about the topic: "${topicLabel}".
It should be of a random difficulty (easy, medium, or hard).

Return ONLY a strictly valid JSON object matching this exact schema:
{
  "title": "String - A creative title for the problem",
  "description": "String - The full problem description in Markdown format",
  "difficulty": "String - 'easy', 'medium', or 'hard'",
  "topic": "${topic}",
  "examples": [
    {
      "input": "String - Example input variables",
      "output": "String - Example output",
      "explanation": "String - Brief explanation"
    }
  ],
  "constraints": ["String - Constraint 1", "String - Constraint 2"],
  "boilerplateCode": {
    "python": "String - Python 3 boilerplate reading from stdin, printing to stdout",
    "cpp": "String - C++ boilerplate using cin/cout with int main()",
    "java": "String - Java boilerplate, public class Main, using System.in/out"
  },
  "testCases": [
    {
      "input": "String - Exact stdin input matching your boilerplate format",
      "expectedOutput": "String - Exact stdout output, no extra whitespace"
    }
  ]
}

Rules:
1. Exactly 2 examples, exactly 5 testCases.
2. testCases input/output MUST exactly match boilerplate stdin/stdout format.
3. Return raw JSON only — no markdown, no code blocks, no trailing commas.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
    });

    let raw = response.choices[0].message.content.trim();
    if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(raw);
    parsed.topic = topic; // ensure topic field is set

    const problem = await Problem.create(parsed);
    res.json(problem);
  } catch (error) {
    console.error('Practice AI error:', error);
    res.status(500).json({ message: 'Failed to generate practice problem' });
  }
};

// POST /api/practice/complete  — log a completed problem
const completeProblem = async (req, res) => {
  try {
    const { problemId, topic } = req.body;
    const userId = req.user._id;

    // Upsert: ignore if already completed
    await PracticeLog.findOneAndUpdate(
      { userId, problemId },
      { userId, problemId, topic, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Problem marked as complete!' });
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

module.exports = { getTopics, generatePracticeProblem, completeProblem, getProgress };
