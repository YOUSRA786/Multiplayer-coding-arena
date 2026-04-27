const Room = require('../models/Room');
const Problem = require('../models/Problem');

const createRoom = async (req, res) => {
  try {
    let { problemId } = req.body;
    
    // Automatically find or create a default problem if none exists
    if (!problemId || problemId === '60d5ecb8b392d71520666666') {
      let problem = await Problem.findOne();
      if (!problem) {
        problem = await Problem.create({
          title: "Two Sum",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
          difficulty: "easy",
          examples: [
            {
              input: "nums = [2,7,11,15], target = 9",
              output: "[0,1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
              input: "nums = [3,2,4], target = 6",
              output: "[1,2]",
              explanation: ""
            }
          ],
          constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
          ],
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
        });
      }
      problemId = problem._id;
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
