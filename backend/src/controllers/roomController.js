const Room = require('../models/Room');
const Problem = require('../models/Problem');
const { generateRandomProblem } = require('../services/aiProblemGenerator');

const createRoom = async (req, res) => {
  try {
    let { problemId, useAi } = req.body;
    
    if (useAi) {
      try {
        const generatedData = await generateRandomProblem();
        const problem = await Problem.create(generatedData);
        problemId = problem._id;
      } catch (error) {
        console.error("AI Generation failed, falling back to random:", error);
        // Fallback to random logic below if AI fails
      }
    }

    // Automatically find or create a default problem if none exists (or if AI failed)
    if (!problemId || problemId === '60d5ecb8b392d71520666666') {
      const count = await Problem.countDocuments();
      if (count === 0) {
        await Problem.insertMany([
          {
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
            difficulty: "easy",
            examples: [
              { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
              { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" }
            ],
            constraints: [ "2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists." ],
            boilerplateCode: {
              python: "def twoSum(nums, target):\n    # Write your code here\n    pass\n\n# Read standard input for testing\nif __name__ == '__main__':\n    import sys\n    target = int(sys.stdin.readline().strip())\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    res = twoSum(nums, target)\n    print(' '.join(map(str, res)))",
              cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    int target;\n    cin >> target;\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    vector<int> res = twoSum(nums, target);\n    for(int i=0; i<res.size(); i++) cout << res[i] << (i==res.size()-1 ? \"\" : \" \");\n    cout << endl;\n    return 0;\n}",
              java: "import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int target = scanner.nextInt();\n        List<Integer> list = new ArrayList<>();\n        while (scanner.hasNextInt()) {\n            list.add(scanner.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        int[] res = twoSum(nums, target);\n        for (int i = 0; i < res.length; i++) {\n            System.out.print(res[i] + (i == res.length - 1 ? \"\" : \" \"));\n        }\n        System.out.println();\n    }\n}"
            },
            testCases: [
              { input: "9\n2 7 11 15", expectedOutput: "0 1" },
              { input: "6\n3 2 4", expectedOutput: "1 2" },
              { input: "6\n3 3", expectedOutput: "0 1" }
            ]
          },
          {
            title: "Contains Duplicate",
            description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.\n\nPrint `true` or `false` (lowercase).",
            difficulty: "easy",
            examples: [
              { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears twice." },
              { input: "nums = [1,2,3,4]", output: "false", explanation: "Every element is distinct." }
            ],
            constraints: [ "1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9" ],
            boilerplateCode: {
              python: "def containsDuplicate(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    res = containsDuplicate(nums)\n    print('true' if res else 'false')",
              cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool containsDuplicate(vector<int>& nums) {\n    // Write your code here\n    return false;\n}\n\nint main() {\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    bool res = containsDuplicate(nums);\n    cout << (res ? \"true\" : \"false\") << endl;\n    return 0;\n}",
              java: "import java.util.*;\n\npublic class Main {\n    public static boolean containsDuplicate(int[] nums) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (scanner.hasNextInt()) {\n            list.add(scanner.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        boolean res = containsDuplicate(nums);\n        System.out.println(res ? \"true\" : \"false\");\n    }\n}"
            },
            testCases: [
              { input: "1 2 3 1", expectedOutput: "true" },
              { input: "1 2 3 4", expectedOutput: "false" },
              { input: "1 1 1 3 3 4 3 2 4 2", expectedOutput: "true" }
            ]
          },
          {
            title: "Maximum Subarray",
            description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
            difficulty: "medium",
            examples: [
              { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6." },
              { input: "nums = [1]", output: "1", explanation: "The subarray [1] has the largest sum 1." }
            ],
            constraints: [ "1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4" ],
            boilerplateCode: {
              python: "def maxSubArray(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    res = maxSubArray(nums)\n    print(res)",
              cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    int res = maxSubArray(nums);\n    cout << res << endl;\n    return 0;\n}",
              java: "import java.util.*;\n\npublic class Main {\n    public static int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (scanner.hasNextInt()) {\n            list.add(scanner.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        int res = maxSubArray(nums);\n        System.out.println(res);\n    }\n}"
            },
            testCases: [
              { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
              { input: "1", expectedOutput: "1" },
              { input: "5 4 -1 7 8", expectedOutput: "23" }
            ]
          }
        ]);
      }
      
      const randomProblems = await Problem.aggregate([{ $sample: { size: 1 } }]);
      if (randomProblems && randomProblems.length > 0) {
        problemId = randomProblems[0]._id;
      }
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = await Room.create({
      roomId,
      host: req.user._id,
      problemId,
      players: [{ user: req.user._id, status: 'waiting' }]
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('players.user', 'username rating').populate('problemId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRoom };
