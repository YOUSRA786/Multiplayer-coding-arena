const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateRandomProblem = async (excludeTitles = []) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const exclusionPrompt = excludeTitles.length > 0 
    ? `IMPORTANT: DO NOT generate any of the following problems: ${excludeTitles.join(', ')}. Create something entirely different.`
    : '';

  const prompt = `
Generate a random, unique coding interview problem suitable for a competitive programming arena.
It should be of random difficulty (easy, medium, or hard).
${exclusionPrompt}

Return a JSON object with this schema:
{
  "title": "String - A creative title for the problem",
  "description": "String - The full problem description",
  "difficulty": "String - 'easy', 'medium', or 'hard'",
  "examples": [
    {
      "input": "String - Example input variables",
      "output": "String - Example output",
      "explanation": "String - Brief explanation of the example"
    }
  ],
  "constraints": ["String"],
  "boilerplateCode": {
    "python": "String - JUST the function signature and a comment",
    "cpp": "String - JUST the function signature",
    "java": "String - JUST the method signature inside a public class Solution"
  },
  "testHarness": {
    "python": "String - Code to read stdin and call the user's function",
    "cpp": "String - Main function to read stdin and call the user's function",
    "java": "String - Main class to read stdin and call the Solution class's method"
  },
  "testCases": [
    {
      "input": "String",
      "expectedOutput": "String"
    }
  ]
}

Important Rules:
1. Generate exactly 3 examples and exactly 5 testCases.
2. CRITICAL: THE boilerplateCode MUST ONLY contain the function skeleton that the user needs to fill in. 
3. THE testHarness MUST contain the hidden code that reads from stdin, calls the user's function, and prints the result to stdout.
4. For Java, the boilerplateCode should be a class named 'Solution', and the testHarness should be a class named 'Main' that interacts with 'Solution'.
`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    try {
      const problemData = JSON.parse(raw);
      
      // Normalize difficulty to lowercase for MongoDB enum validation
      if (problemData.difficulty) {
        problemData.difficulty = problemData.difficulty.toLowerCase();
      }
      const validDiffs = ['easy', 'medium', 'hard'];
      if (!validDiffs.includes(problemData.difficulty)) {
        problemData.difficulty = 'medium';
      }

      return problemData;
    } catch (parseErr) {
      console.error('Gemini JSON Parse Error. Raw response:', raw);
      throw parseErr;
    }
  } catch (error) {
    console.error('Gemini Generation Error:', error?.message || error);
    throw new Error('Failed to generate problem with Gemini AI: ' + (error?.message || 'Unknown error'));
  }
};

module.exports = { generateRandomProblem };
