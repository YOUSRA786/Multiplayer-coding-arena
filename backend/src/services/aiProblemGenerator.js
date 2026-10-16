const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    difficulty: { type: SchemaType.STRING },
    examples: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          input: { type: SchemaType.STRING },
          output: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING }
        },
        required: ["input", "output", "explanation"]
      }
    },
    constraints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    boilerplateCode: {
      type: SchemaType.OBJECT,
      properties: {
        python: { type: SchemaType.STRING },
        cpp: { type: SchemaType.STRING },
        java: { type: SchemaType.STRING }
      },
      required: ["python", "cpp", "java"]
    },
    testCases: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          input: { type: SchemaType.STRING },
          expectedOutput: { type: SchemaType.STRING }
        },
        required: ["input", "expectedOutput"]
      }
    }
  },
  required: ["title", "description", "difficulty", "examples", "constraints", "boilerplateCode", "testCases"]
};

function cleanGeminiResponse(raw) {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.trim();
  }
  
  // Sanitize control characters inside double quoted string literals
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        const code = char.charCodeAt(0);
        if (code < 32) {
          continue; // skip other non-printable control characters
        }
        result += char;
      }
    } else {
      result += char;
    }
  }
  return result;
}

const generateRandomProblem = async (excludeTitles = [], topic = null, difficulty = null) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Use gemini-1.5-flash: 15 req/min free tier vs gemini-2.5-flash's 5 req/min
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: { 
      responseMimeType: 'application/json',
      responseSchema: schema
    }
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

  // Retry up to 2 times with backoff on rate limit errors
  const MAX_RETRIES = 2;
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const cleaned = cleanGeminiResponse(raw);

      const problemData = JSON.parse(cleaned);
      
      // Normalize difficulty to lowercase for MongoDB enum validation
      if (problemData.difficulty) {
        problemData.difficulty = problemData.difficulty.toLowerCase();
      }
      const validDiffs = ['easy', 'medium', 'hard'];
      if (!validDiffs.includes(problemData.difficulty)) {
        problemData.difficulty = 'medium';
      }

      return problemData;
    } catch (error) {
      lastError = error;
      const is429 = error?.message?.includes('429') || error?.message?.includes('quota');
      const is503 = error?.message?.includes('503') || error?.message?.includes('high demand');
      if ((is429 || is503) && attempt < MAX_RETRIES) {
        const waitMs = (attempt + 1) * 5000; // 5s, 10s
        console.warn(`Gemini rate limited (attempt ${attempt + 1}). Retrying in ${waitMs / 1000}s...`);
        await new Promise(res => setTimeout(res, waitMs));
        continue;
      }
      console.error('Gemini Generation Error:', error?.message || error);
      throw new Error('Failed to generate problem with Gemini AI: ' + (error?.message || 'Unknown error'));
    }
  }
  throw new Error('Failed to generate problem after retries: ' + (lastError?.message || 'Unknown error'));
};

module.exports = { generateRandomProblem };
