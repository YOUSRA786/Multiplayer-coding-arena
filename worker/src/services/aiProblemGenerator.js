const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateRandomProblem = async (excludeTitles = [], topic = null, difficulty = null) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const exclusionPrompt = excludeTitles.length > 0 
    ? `IMPORTANT: DO NOT generate any of the following problems: ${excludeTitles.join(', ')}. Create something entirely different.`
    : '';

  const topicPrompt = topic ? `specifically about the topic: "${topic}"` : 'suitable for a competitive programming arena';
  const diffPrompt = difficulty ? `with difficulty: "${difficulty}"` : 'of random difficulty (easy, medium, or hard)';

  const prompt = `
Generate a random, unique coding interview problem ${topicPrompt}.
It should be ${diffPrompt}.
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
    "python": "String - Function signature + Main block to read stdin",
    "cpp": "String - Class/Function + Main function to read stdin",
    "java": "String - Solution class + Main class to read stdin"
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
2. CRITICAL: DO NOT include any solution logic or solved code in the boilerplateCode. 
3. Provide the FULL boilerplate including:
   - Function signature (where the user implements the logic).
   - Necessary imports.
   - The COMPLETE Main body that reads input from stdin, calls the function, and prints the result.
4. The Main body must handle the specific input format of your testCases.
5. For Java, include both the Solution class and the public class Main in the same boilerplate.
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
