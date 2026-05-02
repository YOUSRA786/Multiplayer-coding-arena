const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config();

const problems = [
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as a single line.\n\nPrint the reversed string.",
    difficulty: "easy",
    examples: [{ input: "hello", output: "olleh", explanation: "Reverse of 'hello' is 'olleh'." }],
    constraints: ["1 <= s.length <= 10^5"],
    boilerplateCode: {
      python: "import sys\ns = sys.stdin.readline().strip()\nprint(s[::-1])",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}"
    },
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "world", expectedOutput: "dlrow" },
      { input: "a", expectedOutput: "a" }
    ]
  },
  {
    title: "Palindrome Check",
    description: "Given a string, determine if it is a palindrome (reads the same forwards and backwards). Ignore case.\n\nPrint 'true' or 'false'.",
    difficulty: "easy",
    examples: [{ input: "racecar", output: "true", explanation: "'racecar' reads the same forwards and backwards." }],
    constraints: ["1 <= s.length <= 10^5"],
    boilerplateCode: {
      python: "import sys\ns = sys.stdin.readline().strip().lower()\nprint('true' if s == s[::-1] else 'false')",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    for(auto &c : s) c = tolower(c);\n    string r = s;\n    reverse(r.begin(), r.end());\n    cout << (s == r ? \"true\" : \"false\") << endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine().toLowerCase();\n        System.out.println(s.equals(new StringBuilder(s).reverse().toString()) ? \"true\" : \"false\");\n    }\n}"
    },
    testCases: [
      { input: "racecar", expectedOutput: "true" },
      { input: "hello", expectedOutput: "false" },
      { input: "a", expectedOutput: "true" },
      { input: "abba", expectedOutput: "true" }
    ]
  },
  {
    title: "FizzBuzz",
    description: "Given a number n, print each number from 1 to n on a new line. But for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both 3 and 5 print 'FizzBuzz'.",
    difficulty: "easy",
    examples: [{ input: "5", output: "1\n2\nFizz\n4\nBuzz", explanation: "3 is Fizz, 5 is Buzz." }],
    constraints: ["1 <= n <= 100"],
    boilerplateCode: {
      python: "import sys\nn = int(sys.stdin.readline().strip())\nfor i in range(1, n+1):\n    if i % 15 == 0: print('FizzBuzz')\n    elif i % 3 == 0: print('Fizz')\n    elif i % 5 == 0: print('Buzz')\n    else: print(i)",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    for(int i=1;i<=n;i++) {\n        if(i%15==0) cout<<\"FizzBuzz\";\n        else if(i%3==0) cout<<\"Fizz\";\n        else if(i%5==0) cout<<\"Buzz\";\n        else cout<<i;\n        cout<<endl;\n    }\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        for(int i=1;i<=n;i++) {\n            if(i%15==0) System.out.println(\"FizzBuzz\");\n            else if(i%3==0) System.out.println(\"Fizz\");\n            else if(i%5==0) System.out.println(\"Buzz\");\n            else System.out.println(i);\n        }\n    }\n}"
    },
    testCases: [
      { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz" },
      { input: "15", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
      { input: "1", expectedOutput: "1" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nPrint 'true' or 'false'.",
    difficulty: "easy",
    examples: [{ input: "()", output: "true", explanation: "Simple matching pair." }],
    constraints: ["1 <= s.length <= 10^4"],
    boilerplateCode: {
      python: "import sys\ns = sys.stdin.readline().strip()\ndef isValid(s):\n    stack = []\n    m = {')':'(',']':'[','}':'{'}\n    for c in s:\n        if c in m:\n            if not stack or stack[-1] != m[c]: return False\n            stack.pop()\n        else: stack.append(c)\n    return len(stack) == 0\nprint('true' if isValid(s) else 'false')",
      cpp: "#include <iostream>\n#include <stack>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    stack<char> st;\n    for(char c : s) {\n        if(c=='('||c=='['||c=='{') st.push(c);\n        else {\n            if(st.empty()) { cout<<\"false\"<<endl; return 0; }\n            char t = st.top(); st.pop();\n            if((c==')'&&t!='(')||(c==']'&&t!='[')||(c=='}'&&t!='{')) { cout<<\"false\"<<endl; return 0; }\n        }\n    }\n    cout << (st.empty() ? \"true\" : \"false\") << endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        Stack<Character> st = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c=='('||c=='['||c=='{') st.push(c);\n            else {\n                if(st.isEmpty()) { System.out.println(\"false\"); return; }\n                char t = st.pop();\n                if((c==')'&&t!='(')||(c==']'&&t!='[')||(c=='}'&&t!='{')) { System.out.println(\"false\"); return; }\n            }\n        }\n        System.out.println(st.isEmpty() ? \"true\" : \"false\");\n    }\n}"
    },
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true" }
    ]
  },
  {
    title: "Find the Missing Number",
    description: "Given an array containing n distinct numbers in the range [0, n], find the one number that is missing from the array.\n\nPrint the missing number.",
    difficulty: "easy",
    examples: [{ input: "3 0 1", output: "2", explanation: "n=3, missing number is 2." }],
    constraints: ["n == nums.length", "1 <= n <= 10^4", "All numbers are unique"],
    boilerplateCode: {
      python: "import sys\nnums = list(map(int, sys.stdin.readline().strip().split()))\nn = len(nums)\nprint(n*(n+1)//2 - sum(nums))",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> nums;\n    int v;\n    while(cin >> v) nums.push_back(v);\n    int n = nums.size();\n    long long s = (long long)n*(n+1)/2;\n    for(int x : nums) s -= x;\n    cout << s << endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int n = list.size();\n        long s = (long)n*(n+1)/2;\n        for(int x : list) s -= x;\n        System.out.println(s);\n    }\n}"
    },
    testCases: [
      { input: "3 0 1", expectedOutput: "2" },
      { input: "0 1", expectedOutput: "2" },
      { input: "9 6 4 2 3 5 7 0 1", expectedOutput: "8" }
    ]
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nPrint the number of ways.",
    difficulty: "easy",
    examples: [{ input: "3", output: "3", explanation: "1+1+1, 1+2, 2+1 = 3 ways." }],
    constraints: ["1 <= n <= 45"],
    boilerplateCode: {
      python: "import sys\nn = int(sys.stdin.readline().strip())\ndef climb(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a+b\n    return b\nprint(climb(n))",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    if(n<=2) { cout<<n<<endl; return 0; }\n    int a=1,b=2;\n    for(int i=3;i<=n;i++) { int t=a+b; a=b; b=t; }\n    cout<<b<<endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        if(n<=2) { System.out.println(n); return; }\n        int a=1,b=2;\n        for(int i=3;i<=n;i++) { int t=a+b; a=b; b=t; }\n        System.out.println(b);\n    }\n}"
    },
    testCases: [
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
      { input: "5", expectedOutput: "8" },
      { input: "10", expectedOutput: "89" }
    ]
  },
  {
    title: "Single Number",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nPrint the single number.",
    difficulty: "easy",
    examples: [{ input: "2 2 1", output: "1", explanation: "1 appears once." }],
    constraints: ["1 <= nums.length <= 3*10^4"],
    boilerplateCode: {
      python: "import sys\nnums = list(map(int, sys.stdin.readline().strip().split()))\nresult = 0\nfor n in nums: result ^= n\nprint(result)",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int r=0, v;\n    while(cin >> v) r ^= v;\n    cout << r << endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int r = 0;\n        while(sc.hasNextInt()) r ^= sc.nextInt();\n        System.out.println(r);\n    }\n}"
    },
    testCases: [
      { input: "2 2 1", expectedOutput: "1" },
      { input: "4 1 2 1 2", expectedOutput: "4" },
      { input: "1", expectedOutput: "1" }
    ]
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nPrint the resulting array space-separated.",
    difficulty: "easy",
    examples: [{ input: "0 1 0 3 12", output: "1 3 12 0 0", explanation: "Non-zero elements keep order, zeros moved to end." }],
    constraints: ["1 <= nums.length <= 10^4"],
    boilerplateCode: {
      python: "import sys\nnums = list(map(int, sys.stdin.readline().strip().split()))\nj = 0\nfor i in range(len(nums)):\n    if nums[i] != 0:\n        nums[j], nums[i] = nums[i], nums[j]\n        j += 1\nprint(' '.join(map(str, nums)))",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> nums;\n    int v;\n    while(cin >> v) nums.push_back(v);\n    int j=0;\n    for(int i=0;i<nums.size();i++)\n        if(nums[i]!=0) swap(nums[j++],nums[i]);\n    for(int i=0;i<nums.size();i++) cout<<nums[i]<<(i==nums.size()-1?\"\":\" \");\n    cout<<endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while(sc.hasNextInt()) nums.add(sc.nextInt());\n        int j=0;\n        for(int i=0;i<nums.size();i++)\n            if(nums.get(i)!=0) { int t=nums.get(j); nums.set(j,nums.get(i)); nums.set(i,t); j++; }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<nums.size();i++) { if(i>0) sb.append(' '); sb.append(nums.get(i)); }\n        System.out.println(sb);\n    }\n}"
    },
    testCases: [
      { input: "0 1 0 3 12", expectedOutput: "1 3 12 0 0" },
      { input: "0", expectedOutput: "0" },
      { input: "1 2 3", expectedOutput: "1 2 3" }
    ]
  },
  {
    title: "Buy and Sell Stock",
    description: "Given an array where the i-th element is the price of a stock on day i, find the maximum profit you can achieve from one buy and one sell.\n\nPrint the maximum profit. If no profit is possible, print 0.",
    difficulty: "easy",
    examples: [{ input: "7 1 5 3 6 4", output: "5", explanation: "Buy at 1, sell at 6 = profit 5." }],
    constraints: ["1 <= prices.length <= 10^5"],
    boilerplateCode: {
      python: "import sys\nprices = list(map(int, sys.stdin.readline().strip().split()))\nmin_p = float('inf')\nmax_profit = 0\nfor p in prices:\n    min_p = min(min_p, p)\n    max_profit = max(max_profit, p - min_p)\nprint(max_profit)",
      cpp: "#include <iostream>\n#include <vector>\n#include <climits>\nusing namespace std;\nint main() {\n    vector<int> p;\n    int v;\n    while(cin >> v) p.push_back(v);\n    int mn=INT_MAX, mx=0;\n    for(int x : p) { mn=min(mn,x); mx=max(mx,x-mn); }\n    cout<<mx<<endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> p = new ArrayList<>();\n        while(sc.hasNextInt()) p.add(sc.nextInt());\n        int mn=Integer.MAX_VALUE, mx=0;\n        for(int x : p) { mn=Math.min(mn,x); mx=Math.max(mx,x-mn); }\n        System.out.println(mx);\n    }\n}"
    },
    testCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5" },
      { input: "7 6 4 3 1", expectedOutput: "0" },
      { input: "2 4 1", expectedOutput: "2" }
    ]
  },
  {
    title: "Merge Sorted Arrays",
    description: "Given two sorted arrays (one per line), merge them into one sorted array.\n\nPrint the merged array space-separated.",
    difficulty: "easy",
    examples: [{ input: "1 3 5\n2 4 6", output: "1 2 3 4 5 6", explanation: "Merge and sort two arrays." }],
    constraints: ["0 <= arr.length <= 10^4"],
    boilerplateCode: {
      python: "import sys\na = list(map(int, sys.stdin.readline().strip().split()))\nb = list(map(int, sys.stdin.readline().strip().split()))\nresult = []\ni = j = 0\nwhile i < len(a) and j < len(b):\n    if a[i] <= b[j]: result.append(a[i]); i += 1\n    else: result.append(b[j]); j += 1\nresult.extend(a[i:])\nresult.extend(b[j:])\nprint(' '.join(map(str, result)))",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> a,b;\n    string line;\n    getline(cin,line);\n    { istringstream iss(line); int v; while(iss>>v) a.push_back(v); }\n    getline(cin,line);\n    { istringstream iss(line); int v; while(iss>>v) b.push_back(v); }\n    vector<int> r;\n    int i=0,j=0;\n    while(i<a.size()&&j<b.size()) { if(a[i]<=b[j]) r.push_back(a[i++]); else r.push_back(b[j++]); }\n    while(i<a.size()) r.push_back(a[i++]);\n    while(j<b.size()) r.push_back(b[j++]);\n    for(int k=0;k<r.size();k++) cout<<r[k]<<(k==r.size()-1?\"\":\" \");\n    cout<<endl;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] l1 = sc.nextLine().split(\" \"), l2 = sc.nextLine().split(\" \");\n        int[] a = Arrays.stream(l1).mapToInt(Integer::parseInt).toArray();\n        int[] b = Arrays.stream(l2).mapToInt(Integer::parseInt).toArray();\n        int[] r = new int[a.length+b.length];\n        int i=0,j=0,k=0;\n        while(i<a.length&&j<b.length) { if(a[i]<=b[j]) r[k++]=a[i++]; else r[k++]=b[j++]; }\n        while(i<a.length) r[k++]=a[i++];\n        while(j<b.length) r[k++]=b[j++];\n        StringBuilder sb = new StringBuilder();\n        for(int x=0;x<r.length;x++) { if(x>0) sb.append(' '); sb.append(r[x]); }\n        System.out.println(sb);\n    }\n}"
    },
    testCases: [
      { input: "1 3 5\n2 4 6", expectedOutput: "1 2 3 4 5 6" },
      { input: "1\n2", expectedOutput: "1 2" },
      { input: "1 2 3\n4 5 6", expectedOutput: "1 2 3 4 5 6" }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  for (const p of problems) {
    const exists = await Problem.findOne({ title: p.title });
    if (!exists) {
      await Problem.create(p);
      console.log(`Seeded: ${p.title}`);
    } else {
      console.log(`Skipped (exists): ${p.title}`);
    }
  }
  console.log('Done! Total problems:', await Problem.countDocuments());
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
