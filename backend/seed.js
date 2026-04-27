const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/multiplayer-arena').then(async () => {
  const c = await Problem.findOne({title: 'Contains Duplicate'});
  if(!c){
    await Problem.create([
      {
        title: 'Contains Duplicate',
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.\n\nPrint `true` or `false` (lowercase).',
        difficulty: 'easy',
        examples: [{input: 'nums = [1,2,3,1]',output: 'true',explanation: '1 appears twice.'},{input: 'nums = [1,2,3,4]',output: 'false',explanation: 'Every element is distinct.'}],
        constraints: ['1 <= nums.length <= 10^5','-10^9 <= nums[i] <= 10^9'],
        boilerplateCode: {
          python: "def containsDuplicate(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    res = containsDuplicate(nums)\n    print('true' if res else 'false')",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool containsDuplicate(vector<int>& nums) {\n    // Write your code here\n    return false;\n}\n\nint main() {\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    bool res = containsDuplicate(nums);\n    cout << (res ? \"true\" : \"false\") << endl;\n    return 0;\n}",
          java: "import java.util.*;\n\npublic class Main {\n    public static boolean containsDuplicate(int[] nums) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (scanner.hasNextInt()) {\n            list.add(scanner.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        boolean res = containsDuplicate(nums);\n        System.out.println(res ? \"true\" : \"false\");\n    }\n}"
        },
        testCases: [{input: '1 2 3 1',expectedOutput: 'true'},{input: '1 2 3 4',expectedOutput: 'false'},{input: '1 1 1 3 3 4 3 2 4 2',expectedOutput: 'true'}]
      },
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        difficulty: 'medium',
        examples: [{input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',output: '6',explanation: '[4,-1,2,1] has the largest sum = 6.'},{input: 'nums = [1]',output: '1',explanation: 'The subarray [1] has the largest sum 1.'}],
        constraints: ['1 <= nums.length <= 10^5','-10^4 <= nums[i] <= 10^4'],
        boilerplateCode: {
          python: "def maxSubArray(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    res = maxSubArray(nums)\n    print(res)",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    int res = maxSubArray(nums);\n    cout << res << endl;\n    return 0;\n}",
          java: "import java.util.*;\n\npublic class Main {\n    public static int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (scanner.hasNextInt()) {\n            list.add(scanner.nextInt());\n        }\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) nums[i] = list.get(i);\n        int res = maxSubArray(nums);\n        System.out.println(res);\n    }\n}"
        },
        testCases: [{input: '-2 1 -3 4 -1 2 1 -5 4',expectedOutput: '6'},{input: '1',expectedOutput: '1'},{input: '5 4 -1 7 8',expectedOutput: '23'}]
      }
    ]);
    console.log("Seeded");
  } else {
    console.log("Already seeded");
  }
  process.exit(0);
});
