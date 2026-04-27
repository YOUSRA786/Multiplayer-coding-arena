const OpenAI = require('openai');

const generateRandomProblem = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
Generate a random, unique coding interview problem suitable for a competitive programming arena. 
It should be of random difficulty (easy, medium, or hard).

Return ONLY a strictly valid JSON object matching this exact schema:
{
  "title": "String - A creative title for the problem",
  "description": "String - The full problem description in Markdown format",
  "difficulty": "String - 'easy', 'medium', or 'hard'",
  "examples": [
    {
      "input": "String - Example input variables",
      "output": "String - Example output",
      "explanation": "String - Brief explanation of the example"
    }
  ],
  "constraints": [
    "String - Constraint 1",
    "String - Constraint 2"
  ],
  "boilerplateCode": {
    "python": "String - Python 3 boilerplate code reading from stdin and printing to stdout. Do not use classes unless necessary. e.g. def solve(): ... if __name__ == '__main__': ...",
    "cpp": "String - C++ boilerplate code reading from cin and printing to cout. Include <iostream> etc. int main() { ... return 0; }",
    "java": "String - Java boilerplate code. Must be a public class named Main reading from System.in and printing to System.out."
  },
  "testCases": [
    {
      "input": "String - Exact input string to be passed via stdin to test the code. Format it exactly as your boilerplate expects.",
      "expectedOutput": "String - Exact expected output string to be printed to stdout. No extra spaces or newlines."
    }
  ]
}

Important Rules:
1. Generate exactly 3 examples and exactly 5 strictly valid testCases.
2. The testCases 'input' and 'expectedOutput' MUST exactly match the format parsed and printed by the boilerplateCode.
3. The boilerplateCode must read raw strings/numbers from standard input, process it, and print exactly the expected output to standard output. 
4. The JSON must be raw and strictly valid (no markdown code blocks, no trailing commas).
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let rawData = response.choices[0].message.content.trim();
    
    // Strip markdown JSON block if present
    if (rawData.startsWith('```json')) {
      rawData = rawData.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawData.startsWith('```')) {
      rawData = rawData.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const problemData = JSON.parse(rawData);
    return problemData;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error('Failed to generate problem with AI');
  }
};

module.exports = { generateRandomProblem };
