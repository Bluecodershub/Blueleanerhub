import type { TopicLesson } from '../_shared/types'

export const dsaLessons: TopicLesson[] = [
  {
    id: 'what-is-dsa',
    title: 'What is DSA?',
    intro: 'DSA stands for Data Structures and Algorithms — the foundation of efficient software engineering.',
    whatIsIt: 'Data Structures are ways of organizing data in memory (arrays, trees, graphs). Algorithms are step-by-step procedures to process that data (sorting, searching). Together they determine how fast and memory-efficiently a program runs.',
    whyImportant: 'Every major tech company interview tests DSA. More practically, choosing the wrong data structure can make a program 1000x slower. A hash table lookup is O(1); a linear scan is O(n). At scale, that gap is the difference between a product that works and one that crashes.',
    simpleExplanation: 'Think of a library. A data structure is how the books are arranged (alphabetical? by genre?). An algorithm is the method you use to find a book (scanning every shelf vs. using the card catalog). Better organization + smarter search = faster results.',
    detailedExplanation: "Data structures provide mechanisms for storing collections of data with defined rules for access, insertion, and deletion. Algorithms define systematic sequences of operations that transform inputs into outputs. The two concepts are inseparable: an algorithm's efficiency depends entirely on the data structure it operates on. Dijkstra's shortest-path algorithm, for example, runs in O(V²) with an adjacency matrix but O((V+E) log V) with a min-heap — the algorithm is the same, but the data structure changes the complexity class.",
    realWorldExample: 'Google Maps uses graphs (intersections = nodes, roads = edges) and Dijkstra\'s algorithm to find the shortest route. Without the right data structure, real-time navigation across millions of nodes would be impossible.',
    technicalDetails: 'DSA problems are classified by time complexity (how runtime scales with input size) and space complexity (how memory usage scales). The dominant analysis tool is Big O notation, which describes worst-case behavior. Understanding this lets engineers make principled trade-offs between speed, memory, and code simplicity.',
    codeExamples: [
      {
        title: 'Why Data Structures Matter',
        language: 'python',
        code: `import time

# O(n) linear search
def linear_search(lst, target):
    for item in lst:
        if item == target:
            return True
    return False

# O(1) hash set lookup
def set_search(s, target):
    return target in s

data = list(range(1_000_000))
data_set = set(data)
target = 999_999

start = time.time()
linear_search(data, target)
print(f"Linear: {(time.time()-start)*1000:.2f} ms")

start = time.time()
set_search(data_set, target)
print(f"Set:    {(time.time()-start)*1000:.4f} ms")`,
        output: `Linear: 42.31 ms\nSet:    0.0021 ms`,
        explanation: 'Same logical operation (find a value), but the set is ~20,000x faster because of the underlying hash table data structure.',
      },
    ],
    commonMistakes: [
      'Choosing a list where a set or dict is appropriate (O(n) vs O(1) lookup).',
      'Ignoring space complexity — an O(n log n) algorithm using O(n²) extra space can still OOM.',
      'Premature optimization: profile first, then optimize the bottleneck.',
    ],
    bestPractices: [
      'Always state the time and space complexity when analyzing a solution.',
      'Start with a brute-force solution, then optimize using the right data structure.',
      'Know the built-in complexity guarantees of your language (Python list.append is amortized O(1)).',
    ],
    exercises: [
      'List three real-world applications where choosing the wrong data structure would cause critical slowdowns.',
      'Given a list of 1 million user IDs, which data structure gives O(1) membership check? Implement it.',
      'Why is a dictionary faster than a list for lookups? Describe the internal mechanism in one paragraph.',
    ],
    quizQuestions: [
      {
        question: 'What does DSA stand for?',
        options: ['Data Science and Analytics', 'Data Structures and Algorithms', 'Dynamic Systems Architecture', 'Distributed Storage Access'],
        answer: 1,
        explanation: 'DSA = Data Structures + Algorithms. It is the study of how to organize data and process it efficiently.',
      },
      {
        question: 'Which data structure gives O(1) average-case lookup?',
        options: ['Array', 'Linked List', 'Hash Table', 'Binary Search Tree'],
        answer: 2,
        explanation: 'Hash tables compute an index from the key via a hash function, enabling direct access in O(1) average time.',
      },
    ],
    interviewQuestions: [
      'Why is understanding DSA important even if your language has built-in sorting?',
      'Give an example where a bad data structure choice caused a real performance issue.',
      'What is the difference between a data structure and an abstract data type (ADT)?',
    ],
    summary: 'DSA is the vocabulary of efficient software. Data structures organize information; algorithms process it. Every performance optimization begins by asking: "Am I using the right data structure?"',
    nextTopic: 'why-learn-dsa',
  },

  {
    id: 'why-learn-dsa',
    title: 'Why Learn DSA?',
    intro: 'DSA is the single most tested skill in software engineering interviews and the key to writing code that scales.',
    whatIsIt: 'Learning DSA means understanding how to solve computational problems efficiently — choosing the right container for data, recognizing algorithmic patterns (two pointers, sliding window, divide and conquer), and analyzing trade-offs between time and space.',
    whyImportant: 'Top tech companies (Google, Amazon, Meta, Microsoft) use DSA-heavy coding rounds to filter candidates. Beyond interviews, production systems at scale hit performance limits that only DSA knowledge can diagnose and fix. A senior engineer who can\'t analyze complexity is a liability at scale.',
    simpleExplanation: 'Every app is just "store data, find data, process data." DSA teaches you the best tools for each job. Like a chef who knows which knife to use for each cut — you\'ll know which structure to use for each problem.',
    detailedExplanation: 'DSA knowledge enables: (1) Interview success — FAANG and tier-1 companies test it directly. (2) System performance — knowing when a database needs an index (B-tree) vs. a cache (hash map). (3) Problem decomposition — recognizing that "find all pairs summing to k" is a two-pointer or hash-map problem. (4) Code clarity — using the most natural structure reduces bugs. (5) Scalability — O(n²) may work for 100 items but fails for 1,000,000.',
    realWorldExample: 'Instagram\'s feed ranking algorithm processes millions of posts. Without efficient heap-based top-K selection and graph traversal for social connections, serving a feed in under 100ms would be impossible.',
    technicalDetails: 'Core DSA topics build on each other: arrays and strings → linked lists → stacks/queues → trees → graphs → dynamic programming. Each layer adds abstraction and power. Mastering the progression makes each new concept feel like a natural extension of the last.',
    codeExamples: [
      {
        title: 'Classic Interview Problem: Two Sum',
        language: 'python',
        code: `# Brute force: O(n²)
def two_sum_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

# Optimal: O(n) using hash map
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i

print(two_sum([2, 7, 11, 15], 9))   # [0, 1]
print(two_sum([3, 2, 4], 6))        # [1, 2]`,
        output: `[0, 1]\n[1, 2]`,
        explanation: 'The hash map stores each number\'s index. For each new number we check if its complement was already seen — one pass, O(n) time, O(n) space.',
      },
    ],
    commonMistakes: [
      'Skipping fundamentals and jumping straight to LeetCode hard problems.',
      'Memorizing solutions instead of understanding the pattern behind them.',
      'Not practicing out loud — interviews require explaining your thinking.',
    ],
    bestPractices: [
      'Build a roadmap: arrays → strings → two pointers → sliding window → stacks → trees → graphs → DP.',
      'Solve 2-3 problems per topic before moving on, not 50 of the same type.',
      'Review your solutions after 1 week to solidify retention.',
    ],
    exercises: [
      'Solve "Best Time to Buy and Sell Stock" (LeetCode 121) using both O(n²) brute force and O(n) optimal.',
      'Explain to a peer why the Two Sum hash-map solution is O(n) and not O(n²).',
      'List 5 real software systems and identify one DSA concept powering each.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of the brute-force Two Sum solution?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
        answer: 2,
        explanation: 'Two nested loops each iterating over n elements give O(n²) comparisons.',
      },
      {
        question: 'Which technique reduces Two Sum from O(n²) to O(n)?',
        options: ['Sorting the array', 'Using a hash map', 'Binary search', 'Recursion'],
        answer: 1,
        explanation: 'A hash map stores seen values for O(1) lookup, reducing the overall algorithm to a single pass.',
      },
    ],
    interviewQuestions: [
      'How do you approach a problem you have never seen before in an interview?',
      'What is your strategy for improving from O(n²) to O(n)?',
      'Describe three common algorithmic patterns and when to apply each.',
    ],
    summary: 'DSA is the foundation of scalable, interview-ready software engineering. Invest in it early — the patterns you learn here appear in every serious coding problem you will ever face.',
    nextTopic: 'algorithm-basics',
  },

  {
    id: 'algorithm-basics',
    title: 'Algorithm Basics',
    intro: 'An algorithm is a finite, unambiguous sequence of steps that solves a well-defined problem.',
    whatIsIt: 'An algorithm takes input, applies a series of operations, and produces output. It must be: finite (terminates), definite (each step is clear), effective (each step is executable), and correct (produces the right output for all valid inputs).',
    whyImportant: 'Without algorithms, computers are just expensive calculators. Algorithms are what enable computers to sort a billion records in seconds, find the shortest path across continents, and compress HD video into megabytes.',
    simpleExplanation: 'A recipe is an algorithm. Ingredients = input. Steps = operations. Dish = output. A good recipe is unambiguous, always terminates, and produces consistent results.',
    detailedExplanation: 'Algorithms are evaluated on: (1) Correctness — does it produce the right answer for all inputs, including edge cases? (2) Efficiency — how does runtime and memory scale as input grows? (3) Simplicity — can it be implemented, debugged, and maintained? Algorithms can be iterative (loop-based) or recursive (self-calling). Most problems have multiple algorithmic solutions with different trade-offs.',
    realWorldExample: 'Spell-checkers use edit-distance algorithms (Levenshtein) to find the closest dictionary word to a misspelled word. The algorithm computes the minimum number of insertions, deletions, and substitutions needed to transform one string into another.',
    technicalDetails: 'Key properties: Deterministic algorithms always produce the same output for the same input. Randomized algorithms use randomness to improve expected performance (e.g., QuickSort\'s pivot selection). Approximation algorithms find near-optimal solutions for NP-hard problems in polynomial time.',
    formula: 'Correctness proof: Base case + Inductive step (loop invariant for iterative, mathematical induction for recursive)',
    codeExamples: [
      {
        title: 'Iterative vs Recursive: Factorial',
        language: 'python',
        code: `# Iterative
def factorial_iter(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Recursive
def factorial_rec(n):
    if n <= 1:          # base case
        return 1
    return n * factorial_rec(n - 1)   # recursive case

print(factorial_iter(5))   # 120
print(factorial_rec(5))    # 120`,
        output: `120\n120`,
        explanation: 'Both are correct algorithms. Iterative uses O(1) space; recursive uses O(n) call-stack space. For large n, the iterative version is safer.',
      },
    ],
    commonMistakes: [
      'No base case in recursion → infinite recursion / stack overflow.',
      'Off-by-one errors in loop bounds (use range(n) not range(1, n+1) when indexing from 0).',
      'Assuming an algorithm is correct without testing edge cases (empty input, single element, duplicates).',
    ],
    bestPractices: [
      'Always define the problem precisely before writing any code.',
      'Trace through your algorithm manually on a small example before coding.',
      'Test edge cases: empty input, size-1 input, all-equal elements, min/max values.',
    ],
    exercises: [
      'Write an algorithm to check if a number is prime. Test it for n=1, n=2, n=17, n=100.',
      'Implement GCD (Greatest Common Divisor) using Euclid\'s algorithm iteratively.',
      'Write a function that reverses a string. Identify its time and space complexity.',
    ],
    quizQuestions: [
      {
        question: 'Which property requires an algorithm to always terminate?',
        options: ['Correctness', 'Finiteness', 'Definiteness', 'Effectiveness'],
        answer: 1,
        explanation: 'Finiteness means the algorithm must complete in a finite number of steps. An infinite loop violates this property.',
      },
      {
        question: 'What is a loop invariant?',
        options: ['A variable that never changes', 'A condition true before and after each iteration', 'A loop that runs exactly once', 'A fixed loop counter'],
        answer: 1,
        explanation: 'A loop invariant is a property that holds before, during, and after each iteration, used to prove correctness of iterative algorithms.',
      },
    ],
    interviewQuestions: [
      'How do you prove an algorithm is correct?',
      'What is the difference between a deterministic and a randomized algorithm?',
      'Give an example of a problem where a simple O(n²) algorithm is preferable over a complex O(n log n) one.',
    ],
    summary: 'Algorithms are precise problem-solving recipes. Good algorithms are correct, efficient, and simple. Every algorithmic solution begins with a clear problem definition and ends with edge-case testing.',
    nextTopic: 'time-complexity',
  },

  {
    id: 'time-complexity',
    title: 'Time Complexity',
    intro: 'Time complexity measures how an algorithm\'s runtime grows as input size increases — the most critical measure of algorithmic efficiency.',
    whatIsIt: 'Time complexity is not about actual wall-clock time (which varies by hardware) but about the number of elementary operations performed as a function of input size n. We express it using Big O notation to describe worst-case growth rate.',
    whyImportant: 'A solution that works in 1 second for n=1,000 might take 1,000,000 seconds for n=1,000,000 if its complexity is O(n²). Time complexity lets you predict and prevent these disasters before deployment.',
    simpleExplanation: 'If you have 10 books to find one, checking one-by-one takes 10 steps. If you have 1000 books, it takes 1000 steps. That\'s O(n) — it grows linearly. A binary search of sorted books would take at most log₂(1000) ≈ 10 steps, that\'s O(log n).',
    detailedExplanation: 'Complexity classes from fastest to slowest: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2ⁿ) exponential, O(n!) factorial. To analyze: count the dominant operation (comparison, assignment), identify how many times it runs based on n, drop constants and lower-order terms.',
    realWorldExample: 'A social network friend-of-friend suggestion: O(n²) naive (check all pairs) fails at 1 billion users. Facebook uses O(n) hash-based approaches and graph algorithms to make this tractable.',
    technicalDetails: 'Three analysis cases: Best case (Ω) — fastest possible execution. Average case (Θ) — expected over all inputs. Worst case (O) — slowest possible execution. Interviews and engineering decisions typically focus on worst case because it provides a hard guarantee.',
    formula: 'T(n) = number of basic operations as function of n\nDrop constants: 3n² → O(n²)\nDrop lower terms: n² + n → O(n²)\nNested loops multiply: O(n) × O(n) = O(n²)',
    codeExamples: [
      {
        title: 'Identifying Time Complexity',
        language: 'python',
        code: `# O(1) — constant: doesn't grow with n
def get_first(lst):
    return lst[0]

# O(n) — linear: one loop over n
def find_max(lst):
    m = lst[0]
    for x in lst:
        if x > m:
            m = x
    return m

# O(n²) — quadratic: nested loops
def has_duplicate(lst):
    for i in range(len(lst)):
        for j in range(i+1, len(lst)):
            if lst[i] == lst[j]:
                return True
    return False

# O(n log n) — linearithmic: built-in sort
def sort_and_return(lst):
    return sorted(lst)   # Timsort is O(n log n)`,
        output: `(no output — illustrative definitions)`,
        explanation: 'Each function has a different growth rate. Nested loops → O(n²). Single loop → O(n). Direct index → O(1). Built-in sorted() → O(n log n).',
      },
    ],
    commonMistakes: [
      'Counting non-dominant terms: O(n² + n) is just O(n²).',
      'Forgetting that built-in operations have complexity: list.insert(0, x) is O(n), not O(1).',
      'Confusing time complexity with actual runtime — O(n²) with n=10 can be faster than O(n) with enormous constants.',
    ],
    bestPractices: [
      'Analyze every loop and recursive call before declaring a solution efficient.',
      'Know Python\'s built-in complexities: dict/set O(1) lookup, list.sort O(n log n), list.insert O(n).',
      'When optimizing, target the inner-most nested operation first.',
    ],
    exercises: [
      'Analyze the time complexity of bubble sort. What is the worst, best, and average case?',
      'What is the time complexity of checking membership in a list vs. a set? Write code to verify.',
      'Write a function with O(n log n) complexity by combining a sort and a linear scan.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of accessing an element by index in a Python list?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        answer: 2,
        explanation: 'Python lists are backed by arrays. Index access is direct (pointer arithmetic), so it is O(1).',
      },
      {
        question: 'Two nested loops each iterating n times gives what time complexity?',
        options: ['O(n)', 'O(2n)', 'O(n²)', 'O(n + n)'],
        answer: 2,
        explanation: 'For each of the n outer iterations, n inner iterations run. Total = n × n = n² operations = O(n²).',
      },
    ],
    interviewQuestions: [
      'What is the difference between O(n) and Θ(n)?',
      'How does time complexity relate to actual execution time in practice?',
      'Can an O(n²) algorithm ever outperform an O(n log n) algorithm? When?',
    ],
    summary: 'Time complexity lets you reason about how algorithms scale before writing a single line of production code. Master it to avoid building systems that work perfectly at small scale and catastrophically fail in production.',
    nextTopic: 'space-complexity',
  },

  {
    id: 'space-complexity',
    title: 'Space Complexity',
    intro: 'Space complexity measures how much extra memory an algorithm needs as input size grows.',
    whatIsIt: 'Space complexity quantifies the amount of memory allocated by an algorithm (beyond the input itself) as a function of input size n. It includes stack space for recursive calls, auxiliary data structures, and temporary variables.',
    whyImportant: 'Memory is finite and often more constrained than time in embedded systems, mobile devices, and serverless functions. An algorithm that uses O(n²) extra space for n=1,000,000 requires a terabyte of RAM — that\'s a bug, not a feature.',
    simpleExplanation: 'If you sort a deck of cards by copying all of them to a second deck, you used O(n) extra space. If you sort by swapping cards in-place, you used O(1) extra space. Same result, very different memory cost.',
    detailedExplanation: 'Two kinds of space: (1) Auxiliary space — extra space used by the algorithm, not counting the input. (2) Total space — auxiliary + input space. We typically report auxiliary space. Key cases: O(1) = in-place, O(log n) = recursive binary search call stack, O(n) = creating a copy of the input or a result array, O(n²) = a 2D DP table.',
    realWorldExample: 'Merge sort is O(n) space (needs a temp array). Heap sort is O(1) space (in-place). For sorting large datasets in a memory-constrained IoT device, heap sort is preferred despite both having O(n log n) time.',
    technicalDetails: 'Recursion depth contributes to space: a recursive function called n times deep uses O(n) stack space. Tail-call optimization (not available in CPython) can reduce this to O(1). In Python, recursion limit is 1000 by default (sys.setrecursionlimit).',
    formula: 'Space used = stack frames + auxiliary data structures\nRecursion depth of n → O(n) stack space\nDP table of size n×n → O(n²) space',
    codeExamples: [
      {
        title: 'Space Complexity Examples',
        language: 'python',
        code: `# O(1) space — in-place reverse
def reverse_inplace(lst):
    left, right = 0, len(lst) - 1
    while left < right:
        lst[left], lst[right] = lst[right], lst[left]
        left += 1
        right -= 1

# O(n) space — creates new list
def reverse_copy(lst):
    return lst[::-1]

# O(n) space — recursion stack
def sum_recursive(n):
    if n == 0:
        return 0
    return n + sum_recursive(n - 1)  # n frames on stack

data = [1, 2, 3, 4, 5]
reverse_inplace(data)
print(data)               # [5, 4, 3, 2, 1]
print(reverse_copy(data)) # [1, 2, 3, 4, 5]`,
        output: `[5, 4, 3, 2, 1]\n[1, 2, 3, 4, 5]`,
        explanation: 'reverse_inplace modifies the list with two pointers — O(1) extra space. reverse_copy creates a new list — O(n) space. sum_recursive uses the call stack for n frames — O(n) space.',
      },
    ],
    commonMistakes: [
      'Forgetting recursive call stack space when reporting O(1) for a recursive algorithm.',
      'Creating unnecessary copies of large data structures inside loops.',
      'Using a list to store all intermediate results when only the final result is needed.',
    ],
    bestPractices: [
      'Prefer in-place algorithms when memory is constrained and the input can be mutated.',
      'Convert recursive algorithms to iterative if stack overflow is a risk.',
      'Always report both time AND space complexity in interviews.',
    ],
    exercises: [
      'What is the space complexity of Python\'s built-in sorted()? What about list.sort()?',
      'Rewrite the recursive Fibonacci function iteratively to reduce space from O(n) to O(1).',
      'A function builds a list of all subsets of a set of size n. What is its space complexity?',
    ],
    quizQuestions: [
      {
        question: 'What is the space complexity of a recursive function that calls itself n times?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 2,
        explanation: 'Each recursive call adds a frame to the call stack. n recursive calls = n stack frames = O(n) space.',
      },
      {
        question: 'Which sorting algorithm sorts in-place using O(1) auxiliary space?',
        options: ['Merge sort', 'Counting sort', 'Heap sort', 'Radix sort'],
        answer: 2,
        explanation: 'Heap sort rearranges elements within the original array using a heap structure, requiring only O(1) extra space.',
      },
    ],
    interviewQuestions: [
      'Describe a scenario where you would trade time efficiency for space efficiency.',
      'What is the space complexity of DFS on a graph with V vertices and E edges?',
      'How do you reduce the space complexity of the Fibonacci sequence from O(n) to O(1)?',
    ],
    summary: 'Space complexity is the memory cost of an algorithm. O(1) (in-place) is ideal when memory is scarce. Always consider both time and space — the optimal solution minimizes both within the problem\'s constraints.',
    nextTopic: 'big-o-notation',
  },

  {
    id: 'big-o-notation',
    title: 'Big O Notation',
    intro: 'Big O notation is the universal language engineers use to describe and compare algorithm efficiency.',
    whatIsIt: 'Big O notation expresses the upper bound of an algorithm\'s growth rate as a function of input size n. It answers: "In the worst case, how does the number of operations scale?" O(f(n)) means the algorithm does at most c·f(n) operations for sufficiently large n, where c is a constant.',
    whyImportant: 'It provides a hardware-independent, implementation-independent measure of algorithmic efficiency. Without it, comparing algorithms would require running them on identical hardware with identical inputs — impractical for analysis.',
    simpleExplanation: 'Imagine n=10 is a small task, n=1,000,000 is a large task. O(1) always takes 1 step. O(n) takes 1,000,000 steps. O(n²) takes 1,000,000,000,000 steps — that\'s the difference between "instant" and "never finishes".',
    detailedExplanation: 'Formal definition: f(n) = O(g(n)) if there exist positive constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. In practice: (1) Find the dominant operation. (2) Count how many times it runs as a function of n. (3) Drop constants and lower-order terms. Rules: O(c) = O(1), O(2n) = O(n), O(n² + n) = O(n²), O(n) × O(log n) = O(n log n).',
    realWorldExample: 'Searching for a username: O(n) linear scan through 1 billion users = ~1 second. O(log n) binary search = ~30 comparisons. O(1) hash table = ~1 comparison. The difference is the data structure backing the search.',
    formula: 'Complexity hierarchy (best to worst):\nO(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)',
    syntaxBlock: 'Rule of Thumb:\n- Single loop over n: O(n)\n- Loop inside loop over n: O(n²)\n- Halving input each iteration: O(log n)\n- Loop + recursive halving: O(n log n)\n- All subsets: O(2ⁿ)\n- All permutations: O(n!)',
    codeExamples: [
      {
        title: 'Big O Examples for Common Patterns',
        language: 'python',
        code: `# O(log n) — halving each step
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# O(n log n) — sort then scan
def find_duplicates(nums):
    nums.sort()           # O(n log n)
    dups = []
    for i in range(1, len(nums)):   # O(n)
        if nums[i] == nums[i-1]:
            dups.append(nums[i])
    return dups

arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))      # 3
print(find_duplicates([3,1,4,1,5,9,2,6,5]))`,
        output: `3\n[1, 5]`,
        explanation: 'Binary search halves the search space each step → O(log n). The sort+scan is O(n log n) dominated by the sort.',
      },
    ],
    commonMistakes: [
      'Confusing O(n log n) with O(n²) — they differ drastically at scale.',
      'Reporting O(n) when inner operations are not O(1) (e.g., string concatenation in a loop is O(n²) total).',
      'Ignoring the multiplicative constants when comparing algorithms with the same Big O class.',
    ],
    bestPractices: [
      'Draw the "Big O Complexity Chart" — memorize which class each common algorithm belongs to.',
      'For string concatenation in loops, use "".join(parts) instead of s += char to avoid O(n²).',
      'Verify your Big O claim by timing the algorithm at n=100, n=1000, n=10000 and checking the ratio.',
    ],
    exercises: [
      'What is the Big O of a function that has three consecutive non-nested for loops, each O(n)?',
      'Determine the complexity of: for i in range(n): for j in range(i, n): operations.',
      'Write an O(n log n) algorithm to count the number of inversions in an array.',
    ],
    quizQuestions: [
      {
        question: 'What is the Big O of the following: for i in range(n): for j in range(n): pass?',
        options: ['O(n)', 'O(2n)', 'O(n + n)', 'O(n²)'],
        answer: 3,
        explanation: 'Nested loops both running n times give n × n = n² operations = O(n²).',
      },
      {
        question: 'O(n² + 3n + 100) simplifies to:',
        options: ['O(n² + 3n)', 'O(n²)', 'O(3n)', 'O(100)'],
        answer: 1,
        explanation: 'Drop lower-order terms and constants. The dominant term is n², so the complexity is O(n²).',
      },
    ],
    interviewQuestions: [
      'What is the formal mathematical definition of Big O?',
      'What is the difference between O, Ω, and Θ notation?',
      'Is O(n!) ever acceptable? When might you accept exponential complexity?',
    ],
    summary: 'Big O is the lingua franca of algorithm analysis. Mastering the common classes — O(1), O(log n), O(n), O(n log n), O(n²) — lets you quickly evaluate any algorithm and make principled optimization decisions.',
    nextTopic: 'arrays',
  },

  {
    id: 'arrays',
    title: 'Arrays',
    intro: 'Arrays are the most fundamental data structure — contiguous memory blocks that enable O(1) random access.',
    whatIsIt: 'An array is a fixed-size sequence of elements stored in contiguous memory locations, all of the same type. In Python, the built-in list is a dynamic array that can grow and shrink. Each element is accessed by its 0-based index in O(1) time.',
    whyImportant: 'Arrays underlie nearly every other data structure — stacks, queues, heaps, and hash tables are all built on arrays. CPU cache efficiency makes sequential array access extremely fast due to spatial locality (accessing arr[i+1] is a cache hit after arr[i]).',
    simpleExplanation: 'An array is like a row of mailboxes, each numbered. To get mailbox #42, you go directly to #42 — no need to walk through 1, 2, 3... That\'s O(1) access by index. The trade-off: inserting in the middle requires shifting all subsequent elements.',
    detailedExplanation: 'Static arrays allocate a fixed block of memory. Dynamic arrays (Python lists) double in capacity when full, giving amortized O(1) append. Key operations: Access by index O(1), Search O(n), Insert at end O(1) amortized, Insert at position i O(n) (shift), Delete at position i O(n) (shift), Length O(1). Python lists also support slicing (creates a new list copy) and list comprehensions.',
    realWorldExample: 'A game\'s sprite sheet is stored as a 2D array of pixels. Each frame is accessed in O(1) by [row][col] index. Image processing algorithms scan this array sequentially, benefiting from cache locality.',
    technicalDetails: 'Memory layout: element at index i is at base_address + i × element_size. This arithmetic makes index access O(1). Python\'s list is an array of pointers to Python objects, not the objects themselves, which is why Python lists can store mixed types.',
    syntaxBlock: `# Create\narr = [1, 2, 3, 4, 5]\n\n# Access\narr[0]      # first element\narr[-1]     # last element\narr[1:4]    # slice [2,3,4]\n\n# Modify\narr[2] = 99\n\n# Common operations\nlen(arr)          # O(1)\narr.append(6)     # O(1) amortized\narr.insert(0, 0)  # O(n)\narr.pop()         # O(1)\narr.pop(0)        # O(n)\n5 in arr          # O(n)`,
    codeExamples: [
      {
        title: 'Two Pointers Pattern on Arrays',
        language: 'python',
        code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

def remove_duplicates_sorted(nums):
    """Remove duplicates in-place from sorted array. Return new length."""
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write

print(is_palindrome("racecar"))    # True
print(is_palindrome("hello"))      # False

nums = [1, 1, 2, 3, 3, 4]
k = remove_duplicates_sorted(nums)
print(nums[:k])                    # [1, 2, 3, 4]`,
        output: `True\nFalse\n[1, 2, 3, 4]`,
        explanation: 'Two-pointer technique: start from both ends and move inward. Palindrome check compares symmetrically. Duplicate removal uses a read pointer and a write pointer — classic O(n) time, O(1) space pattern.',
      },
      {
        title: 'Sliding Window on Arrays',
        language: 'python',
        code: `def max_subarray_sum(nums, k):
    """Maximum sum of any subarray of length k."""
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

nums = [2, 1, 5, 1, 3, 2]
print(max_subarray_sum(nums, 3))   # 9  (5+1+3)`,
        output: `9`,
        explanation: 'Instead of recalculating the sum of each window (O(n×k)), we slide: add the new element, remove the leftmost. One pass = O(n).',
      },
    ],
    commonMistakes: [
      'IndexError: off-by-one in range(len(arr)) vs range(len(arr)-1).',
      'Mutating a list while iterating over it — causes skipped elements.',
      'Using list.insert(0, x) in a loop — O(n²) total due to repeated shifts.',
    ],
    bestPractices: [
      'Use two-pointer for sorted arrays and palindrome problems.',
      'Use sliding window for subarray/substring problems with a fixed or variable window.',
      'Use collections.deque for O(1) popleft instead of list.pop(0).',
    ],
    exercises: [
      'Find the maximum product of two elements in an array. What is the complexity?',
      'Rotate an array of n elements to the right by k positions in O(n) time and O(1) space.',
      'Given a sorted array, return True if any two elements sum to a target (two-pointer approach).',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of list.insert(0, x) in Python?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 2,
        explanation: 'Inserting at the beginning requires shifting all n elements one position to the right — O(n).',
      },
      {
        question: 'What technique efficiently solves fixed-window subarray sum problems?',
        options: ['Binary search', 'Sliding window', 'Divide and conquer', 'Backtracking'],
        answer: 1,
        explanation: 'The sliding window technique maintains a running sum, adding the new element and removing the old one — O(n) instead of O(n×k).',
      },
    ],
    interviewQuestions: [
      'Why is random access O(1) for arrays but O(n) for linked lists?',
      'Explain the amortized O(1) append complexity of Python lists.',
      'What is the difference between Python list and array module? When would you use array?',
    ],
    summary: 'Arrays offer O(1) random access at the cost of O(n) insertion/deletion in the middle. They are the foundation of two-pointer, sliding window, and prefix-sum techniques — three of the most common interview patterns.',
    nextTopic: 'strings',
  },

  {
    id: 'strings',
    title: 'Strings',
    intro: 'Strings are immutable sequences of characters with a rich set of built-in operations and common algorithmic patterns.',
    whatIsIt: 'A string is an ordered sequence of Unicode characters. In Python, strings are immutable — every "modification" creates a new string. This has significant performance implications: s += "a" in a loop is O(n²), not O(n).',
    whyImportant: 'String manipulation is ubiquitous: parsing user input, processing log files, DNA sequence analysis, natural language processing, URL routing, and serialization. String problems are among the most common in technical interviews.',
    simpleExplanation: 'A string is like an array of characters, but you can\'t change individual characters. Once created, it\'s sealed. This makes operations like concatenation in a loop expensive — you\'re building a new string each time.',
    detailedExplanation: 'Key string algorithms: (1) Anagram detection — sort both strings and compare, or use frequency count. (2) Palindrome — two pointers from ends. (3) Substring search — sliding window or KMP algorithm. (4) String reversal — slicing s[::-1] or two-pointer. (5) String parsing — split(), strip(), re module. In Python, use "".join(list) for efficient concatenation instead of += in loops.',
    realWorldExample: 'Search engines use string algorithms (Boyer-Moore, KMP) to find query terms in billions of documents. Text compression (gzip) uses Lempel-Ziv string algorithms to find repeated substrings and encode them efficiently.',
    technicalDetails: 'Python string interning: short strings and identifiers are often stored once and reused. str.encode() converts to bytes. f-strings (f"{var}") are the fastest interpolation method. ord(c) converts char to int; chr(n) converts int to char — useful for frequency arrays using 26-element list instead of dict.',
    syntaxBlock: `s = "hello world"\ns.upper()          # "HELLO WORLD"\ns.lower()          # "hello world"\ns.split()          # ['hello', 'world']\ns.replace('l','L') # "heLLo worLd"\ns.strip()          # remove leading/trailing whitespace\ns.startswith('he') # True\n"lo" in s          # True\nlen(s)             # 11\ns[::-1]            # "dlrow olleh" (reverse)\nord('a')           # 97\nchr(97)            # 'a'`,
    codeExamples: [
      {
        title: 'Anagram Check & Character Frequency',
        language: 'python',
        code: `from collections import Counter

def is_anagram(s, t):
    return Counter(s) == Counter(t)

# Without Counter — O(n), O(1) space (fixed 26 chars)
def is_anagram_array(s, t):
    if len(s) != len(t):
        return False
    freq = [0] * 26
    for c in s:
        freq[ord(c) - ord('a')] += 1
    for c in t:
        freq[ord(c) - ord('a')] -= 1
    return all(f == 0 for f in freq)

print(is_anagram("listen", "silent"))   # True
print(is_anagram("rat", "car"))         # False
print(is_anagram_array("anagram", "nagaram"))  # True`,
        output: `True\nFalse\nTrue`,
        explanation: 'Counter-based: readable and O(n). Array-based: uses a fixed 26-slot array indexed by character offset — O(1) space, O(n) time. The ord() trick maps \'a\'→0, \'b\'→1, ..., \'z\'→25.',
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        language: 'python',
        code: `def length_of_longest_substring(s):
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

print(length_of_longest_substring("abcabcbb"))  # 3 (abc)
print(length_of_longest_substring("bbbbb"))     # 1 (b)
print(length_of_longest_substring("pwwkew"))    # 3 (wke)`,
        output: `3\n1\n3`,
        explanation: 'Sliding window with a hash map tracking the last-seen index of each character. When a repeat is found, move the left boundary past the previous occurrence. O(n) time, O(min(n,m)) space where m is charset size.',
      },
    ],
    commonMistakes: [
      'String concatenation in a loop: "result += char" is O(n²). Use list.append then "".join().',
      'Assuming len("") is 1 — it is 0. Always handle empty string edge cases.',
      'Forgetting that Python strings are Unicode — ord(c) works for ASCII but not all Unicode chars.',
    ],
    bestPractices: [
      'Use "".join(parts) for building strings from parts — O(n) vs O(n²).',
      'Use Counter or a 26-element array for character frequency problems.',
      'Use two-pointer or sliding window for most substring problems.',
    ],
    exercises: [
      'Check if one string is a rotation of another (e.g., "abcde" and "cdeab") using string operations.',
      'Find all permutations of a string that are substrings of another given string.',
      'Implement string compression: "aaabbbcc" → "a3b3c2". Handle the case where the compressed version is longer.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of "result += char" in a loop of n iterations in Python?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1) per iteration'],
        answer: 2,
        explanation: 'Each concatenation creates a new string of length up to n, copying all previous characters. Total copies = 1+2+...+n = n(n+1)/2 = O(n²).',
      },
      {
        question: 'Which method efficiently builds a string from a list of characters?',
        options: ['str(list)', 'sum(list)', '"".join(list)', 'list.toString()'],
        answer: 2,
        explanation: '"".join(list) is O(n) — it makes a single pass to allocate and fill the result string.',
      },
    ],
    interviewQuestions: [
      'Why are Python strings immutable, and what are the performance implications?',
      'Describe the sliding window approach for string problems and when to apply it.',
      'How would you find the longest palindromic substring efficiently?',
    ],
    summary: 'Strings are immutable character arrays requiring careful attention to concatenation cost. Master the sliding window pattern with a frequency map — it solves the majority of substring interview problems.',
    nextTopic: 'linked-lists',
  },

  {
    id: 'linked-lists',
    title: 'Linked Lists',
    intro: 'Linked lists are node-based structures offering O(1) insertion/deletion at known positions at the cost of O(n) random access.',
    whatIsIt: 'A linked list is a sequence of nodes where each node stores a value and a pointer to the next node. Unlike arrays, nodes are scattered in memory and connected by pointers. There is no index-based access — traversal always starts from the head.',
    whyImportant: 'Linked lists excel at: frequent insertions/deletions at the front (O(1) vs O(n) for arrays), implementing stacks and queues without pre-allocating capacity, and representing sparse or dynamically-sized sequences. They are also a core interview topic testing pointer manipulation.',
    simpleExplanation: 'Think of a linked list as a treasure hunt. Each clue tells you where the next clue is. To find clue #5, you must follow clues 1→2→3→4→5. You can\'t jump directly to clue #5 like you can with an array index.',
    detailedExplanation: 'Operations: Traverse O(n), Search O(n), Insert at head O(1), Insert at tail O(n) without tail pointer / O(1) with, Delete at head O(1), Delete by value O(n). Linked lists shine when: insertion/deletion frequency is high, memory can\'t be pre-allocated, implementation of other ADTs (stacks, queues, adjacency lists). They are inferior to arrays when random access is needed.',
    realWorldExample: 'Browser history is a doubly linked list. Back (prev) and forward (next) navigation are O(1) — just follow a pointer. Adding a new page (inserting at current position) is also O(1).',
    technicalDetails: 'Pointer manipulation patterns: (1) Fast/slow pointer (Floyd\'s algorithm) — detect cycles, find middle. (2) Reverse in place — track prev, curr, next. (3) Merge two sorted lists — merge by comparing heads. (4) Dummy node — simplifies edge cases for head insertion/deletion.',
    syntaxBlock: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def append(self, val):\n        node = Node(val)\n        if not self.head:\n            self.head = node\n            return\n        curr = self.head\n        while curr.next:\n            curr = curr.next\n        curr.next = node`,
    codeExamples: [
      {
        title: 'Reverse a Linked List',
        language: 'python',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverse(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next   # save next
        curr.next = prev  # reverse pointer
        prev = curr       # advance prev
        curr = nxt        # advance curr
    return prev           # new head

# Build: 1 -> 2 -> 3 -> 4 -> 5
nodes = [Node(i) for i in range(1, 6)]
for i in range(4):
    nodes[i].next = nodes[i+1]

new_head = reverse(nodes[0])
curr = new_head
while curr:
    print(curr.val, end=" ")
    curr = curr.next`,
        output: `5 4 3 2 1`,
        explanation: 'Track three pointers: prev (reversed so far), curr (current node), nxt (next to process). Each step flips curr.next to point backward. O(n) time, O(1) space.',
      },
      {
        title: 'Detect Cycle (Floyd\'s Algorithm)',
        language: 'python',
        code: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next        # moves 1 step
        fast = fast.next.next   # moves 2 steps
        if slow is fast:
            return True
    return False

# Build cycle: 1 -> 2 -> 3 -> 4 -> 2 (cycle)
n1, n2, n3, n4 = Node(1), Node(2), Node(3), Node(4)
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2

print(has_cycle(n1))   # True`,
        output: `True`,
        explanation: 'Two pointers at different speeds: if there\'s a cycle, the fast pointer laps the slow one and they meet. If no cycle, fast reaches None. O(n) time, O(1) space — no visited set needed.',
      },
    ],
    commonMistakes: [
      'Not saving next pointer before reversing: curr.next = prev loses the rest of the list.',
      'Forgetting the dummy node pattern — leads to messy head-edge-case code.',
      'NullPointerError: always check curr and curr.next before accessing curr.next.next.',
    ],
    bestPractices: [
      'Use a dummy head node to simplify insertion/deletion near the head.',
      'Use fast/slow pointers for cycle detection and finding the middle node.',
      'Draw the pointer state on paper before coding complex manipulations.',
    ],
    exercises: [
      'Find the middle node of a linked list using the fast/slow pointer technique.',
      'Merge two sorted linked lists into one sorted list.',
      'Remove the nth node from the end of a linked list in one pass (two-pointer technique).',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of inserting a node at the head of a singly linked list?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        answer: 2,
        explanation: 'Head insertion only requires creating a new node and updating its next pointer to the current head — no traversal needed.',
      },
      {
        question: 'Floyd\'s cycle detection uses which technique?',
        options: ['Stack-based DFS', 'Hash set for visited nodes', 'Fast and slow pointers', 'Binary search'],
        answer: 2,
        explanation: 'Two pointers move at speeds 1 and 2. If a cycle exists, the fast pointer laps the slow one and they meet within the cycle.',
      },
    ],
    interviewQuestions: [
      'When would you use a linked list instead of an array? Give a concrete example.',
      'How does the fast/slow pointer technique detect the start of a cycle (not just its existence)?',
      'Explain the dummy head node pattern and why it simplifies linked list code.',
    ],
    summary: 'Linked lists trade O(n) random access for O(1) front insertion/deletion. Master pointer reversal, fast/slow pointer, and the dummy node pattern — these three techniques cover the vast majority of linked list interview problems.',
    nextTopic: 'stacks',
  },

  {
    id: 'stacks',
    title: 'Stacks',
    intro: 'A stack is a LIFO (Last-In, First-Out) data structure — the last item pushed is the first item popped.',
    whatIsIt: 'A stack supports two primary operations: push (add to top) and pop (remove from top), both in O(1). It also supports peek (view top without removing) in O(1). Python\'s list naturally implements a stack — append() is push, pop() is pop.',
    whyImportant: 'Stacks are used in: function call management (call stack), expression evaluation, bracket matching, undo/redo functionality, DFS graph traversal, and parsing (compilers use stacks for syntax analysis). Understanding stacks is essential for understanding how programs execute.',
    simpleExplanation: 'A stack is a pile of plates. You add to the top (push) and take from the top (pop). You can\'t pull a plate from the middle. The last plate placed is the first one taken — LIFO.',
    detailedExplanation: 'Key applications: (1) Balanced brackets — push opening brackets, pop and match closing brackets. (2) Monotonic stack — maintain a stack of increasing or decreasing elements to solve next-greater-element problems in O(n). (3) Expression evaluation — postfix notation uses a stack to evaluate without parentheses. (4) DFS — iterative DFS replaces recursion with an explicit stack.',
    realWorldExample: 'IDE undo functionality is a stack. Every action is pushed. Ctrl+Z pops the last action and reverses it. Redo is a second stack. This is why undo goes in exact reverse order.',
    technicalDetails: 'Python stack implementation: list (append/pop from end) — O(1). collections.deque (append/pop from end) — O(1), thread-safe. queue.LifoQueue — thread-safe with blocking. For interview use, list is idiomatic Python for stacks.',
    syntaxBlock: `stack = []\n\nstack.append(1)   # push\nstack.append(2)\nstack.append(3)\n\nprint(stack[-1])  # peek: 3\nstack.pop()       # pop: removes 3\nprint(stack)      # [1, 2]\n\nbool(stack)       # True (non-empty)\nnot stack         # False`,
    codeExamples: [
      {
        title: 'Valid Parentheses',
        language: 'python',
        code: `def is_valid(s):
    stack = []
    matching = {')': '(', '}': '{', ']': '['}
    for ch in s:
        if ch in '({[':
            stack.append(ch)
        else:
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()
    return len(stack) == 0

print(is_valid("()[]{}"))   # True
print(is_valid("(]"))       # False
print(is_valid("([)]"))     # False
print(is_valid("{[]}"))     # True`,
        output: `True\nFalse\nFalse\nTrue`,
        explanation: 'Push opening brackets. For closing brackets, check if the top of the stack is the matching opener. Return True only if the stack is empty at the end — all openers were closed.',
      },
      {
        title: 'Monotonic Stack: Next Greater Element',
        language: 'python',
        code: `def next_greater(nums):
    result = [-1] * len(nums)
    stack = []   # stores indices
    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            result[idx] = num
        stack.append(i)
    return result

print(next_greater([2, 1, 2, 4, 3]))
# For each element, find the next larger one to its right`,
        output: `[4, 2, 4, -1, -1]`,
        explanation: 'Maintain a stack of indices whose "next greater" hasn\'t been found yet. When a new element is larger than the top, the top\'s next greater is this element. O(n) — each element pushed and popped at most once.',
      },
    ],
    commonMistakes: [
      'Calling pop() on an empty stack — always check "if stack" or "if len(stack) > 0" first.',
      'Using stack[0] instead of stack[-1] for peek — the top is the last element.',
      'Forgetting that at the end of bracket matching, the stack must be empty.',
    ],
    bestPractices: [
      'Use a monotonic stack for "next greater/smaller element" and "largest rectangle" problems.',
      'Convert recursive DFS to iterative DFS with an explicit stack to avoid recursion limits.',
      'For bracket problems, store the index not just the character — useful for length calculations.',
    ],
    exercises: [
      'Implement a min-stack that supports push, pop, top, and getMin all in O(1).',
      'Evaluate a postfix expression (e.g., "3 4 + 2 *" = 14) using a stack.',
      'Find the largest rectangle in a histogram using a monotonic stack approach.',
    ],
    quizQuestions: [
      {
        question: 'What does LIFO stand for?',
        options: ['Last In, First Out', 'Last In, Fast Out', 'Least Index, First Output', 'Linear In, First Out'],
        answer: 0,
        explanation: 'LIFO = Last In, First Out. The most recently added element is the first one removed — like a stack of plates.',
      },
      {
        question: 'In Python, which list method is equivalent to "push" for a stack?',
        options: ['list.insert()', 'list.append()', 'list.add()', 'list.push()'],
        answer: 1,
        explanation: 'list.append(x) adds x to the end of the list — which is the "top" of a stack implemented as a Python list.',
      },
    ],
    interviewQuestions: [
      'How is the system call stack related to the stack data structure?',
      'Explain the monotonic stack pattern and give two problems it solves.',
      'How do you implement a queue using two stacks?',
    ],
    summary: 'Stacks are O(1) LIFO structures powering bracket matching, expression evaluation, DFS, and the monotonic stack pattern. In Python, a list with append/pop is the idiomatic stack.',
    nextTopic: 'queues',
  },

  {
    id: 'queues',
    title: 'Queues',
    intro: 'A queue is a FIFO (First-In, First-Out) data structure — the first item enqueued is the first item dequeued.',
    whatIsIt: 'A queue supports enqueue (add to back) and dequeue (remove from front), both in O(1) with the right implementation. Python\'s collections.deque is the correct tool — list.pop(0) is O(n) and should never be used as dequeue.',
    whyImportant: 'Queues model real-world waiting scenarios: CPU task scheduling, print queues, web server request handling, and BFS graph traversal. BFS finds the shortest path in unweighted graphs and requires a queue to process nodes level by level.',
    simpleExplanation: 'A queue is like a line at a coffee shop. The first person in line is served first. New arrivals join the back. No cutting! FIFO — fair, ordered processing.',
    detailedExplanation: 'Variants: (1) Standard queue: FIFO for fair processing. (2) Circular queue: fixed-size ring buffer, used in OS task scheduling. (3) Priority queue: dequeue the highest-priority item, backed by a heap. (4) Monotonic deque: maintains sorted order while sliding a window — solves sliding window maximum in O(n). (5) Double-ended queue (deque): insert/remove from both ends in O(1).',
    realWorldExample: 'Web server request handling: requests arrive at a queue. Worker threads dequeue and process them in order. If the server is overwhelmed, the queue buffers requests. Priority queues give VIP requests faster service.',
    technicalDetails: 'Python deque vs list: deque.appendleft() and deque.popleft() are O(1) — implemented as a doubly-linked list of fixed-size blocks. list.insert(0) and list.pop(0) are O(n) — array shift. For queues, always use collections.deque.',
    syntaxBlock: `from collections import deque\n\nq = deque()\nq.append(1)      # enqueue to back\nq.append(2)\nq.append(3)\nq.popleft()      # dequeue from front → 1\nprint(q)         # deque([2, 3])\n\n# Both ends in O(1)\nq.appendleft(0)  # add to front\nq.pop()          # remove from back`,
    codeExamples: [
      {
        title: 'BFS with a Queue',
        language: 'python',
        code: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'], 'E': ['B'], 'F': ['C']
}
print(bfs(graph, 'A'))`,
        output: `['A', 'B', 'C', 'D', 'E', 'F']`,
        explanation: 'BFS processes nodes level by level. A queue ensures we process nodes in the order we discovered them. Mark visited before enqueueing to prevent re-processing.',
      },
      {
        title: 'Sliding Window Maximum (Monotonic Deque)',
        language: 'python',
        code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()   # stores indices
    result = []
    for i, num in enumerate(nums):
        # Remove elements outside the window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Remove smaller elements — they'll never be the max
        while dq and nums[dq[-1]] < num:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])  # front is always max
    return result

print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))`,
        output: `[3, 3, 5, 5, 6, 7]`,
        explanation: 'Monotonic decreasing deque: front holds the max index. Maintain invariant by removing: (1) out-of-window indices from front, (2) smaller values from back. O(n) total — each element pushed/popped at most once.',
      },
    ],
    commonMistakes: [
      'Using list.pop(0) as dequeue — O(n). Always use deque.popleft().',
      'Not marking nodes visited before enqueueing in BFS — leads to processing nodes multiple times.',
      'Confusing FIFO (queue) with LIFO (stack) — BFS requires FIFO, DFS requires LIFO.',
    ],
    bestPractices: [
      'Always use collections.deque for queue operations in Python.',
      'In BFS, add to visited when enqueuing (not when dequeuing) to prevent duplicate processing.',
      'Use a priority queue (heapq) when dequeue order depends on priority, not arrival order.',
    ],
    exercises: [
      'Implement a queue using two stacks, with amortized O(1) enqueue and dequeue.',
      'Find the minimum value in all windows of size k using a monotonic deque.',
      'Implement a circular buffer (ring buffer) with fixed capacity.',
    ],
    quizQuestions: [
      {
        question: 'Why is list.pop(0) not suitable as a queue dequeue operation?',
        options: ['It raises an error', 'It is O(n) due to array shifting', 'It removes from the wrong end', 'It is not available in Python'],
        answer: 1,
        explanation: 'Removing from the front of a Python list shifts all remaining elements left — O(n). deque.popleft() is O(1).',
      },
      {
        question: 'Which traversal algorithm requires a queue?',
        options: ['DFS (depth-first)', 'BFS (breadth-first)', 'Inorder traversal', 'Postorder traversal'],
        answer: 1,
        explanation: 'BFS processes nodes level by level. A FIFO queue ensures nodes at depth d are all processed before depth d+1.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a queue and a deque?',
      'How does a circular queue differ from a regular queue, and when is it used?',
      'Explain the monotonic deque technique and describe a problem it solves in O(n).',
    ],
    summary: 'Queues are O(1) FIFO structures essential for BFS, task scheduling, and sliding window problems. Use collections.deque in Python — never list.pop(0). The monotonic deque pattern solves sliding window extremum problems in linear time.',
    nextTopic: 'hash-tables',
  },

  {
    id: 'hash-tables',
    title: 'Hash Tables',
    intro: 'Hash tables provide O(1) average-case insert, delete, and lookup — the fastest general-purpose data structure for these operations.',
    whatIsIt: 'A hash table maps keys to values using a hash function that converts a key into an array index. Collisions (two keys mapping to the same index) are handled by chaining (linked lists at each bucket) or open addressing (probing for next empty slot). Python\'s dict and set are hash tables.',
    whyImportant: 'Hash tables turn O(n) problems into O(n) problems with O(1) lookups — they are the solution to most "find if X exists" or "count frequency of X" problems. Virtually every optimized algorithm uses a hash map somewhere.',
    simpleExplanation: 'A hash table is a phonebook where instead of scanning every page, you use the first letter of the name to jump directly to the right section. The "first letter" is a simplified hash function. O(1) lookup.',
    detailedExplanation: 'Python dict implementation: open-addressing with pseudo-random probing and a load factor of 2/3. When 2/3 full, the table resizes (doubles), rehashing all entries — O(n) amortized over many insertions. Sets work identically but store only keys. Worst-case O(n) for lookups occurs with many collisions (adversarial hash attack) — Python uses hash randomization (PYTHONHASHSEED) to prevent this.',
    realWorldExample: 'Databases use hash indices for equality lookups (WHERE id = 42). File deduplication tools hash file contents — if two files have the same hash, they\'re likely duplicates. Git uses SHA-1 to uniquely identify commits.',
    technicalDetails: 'Python dict is ordered (insertion order preserved since Python 3.7). Keys must be hashable (immutable: int, str, tuple — not list, dict, set). Custom objects are hashable if they implement __hash__ and __eq__. hash() function: hash("hello") returns an integer (varies per run due to seed randomization).',
    syntaxBlock: `d = {}\nd['key'] = 'value'    # O(1) insert\nd['key']              # O(1) lookup\ndel d['key']          # O(1) delete\n'key' in d            # O(1) membership\nd.get('key', default) # safe lookup\nd.items()             # (key, value) pairs\nd.keys()              # dict_keys view\nd.values()            # dict_values view\n\nfrom collections import Counter, defaultdict\nCounter("abracadabra")  # frequency map\ndefaultdict(list)       # auto-creates missing keys`,
    codeExamples: [
      {
        title: 'Group Anagrams',
        language: 'python',
        code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = tuple(sorted(word))   # canonical form
        groups[key].append(word)
    return list(groups.values())

words = ["eat", "tea", "tan", "ate", "nat", "bat"]
result = group_anagrams(words)
for group in sorted(result, key=lambda x: x[0]):
    print(sorted(group))`,
        output: `['ate', 'eat', 'tea']\n['bat']\n['nat', 'tan']`,
        explanation: 'Sort each word as the canonical key. Words that are anagrams produce identical sorted keys. defaultdict(list) auto-creates a list for new keys. O(n × k log k) where k is max word length.',
      },
      {
        title: 'Subarray Sum Equals K (Prefix Sum + Hash Map)',
        language: 'python',
        code: `def subarray_sum(nums, k):
    count = 0
    prefix_sum = 0
    freq = {0: 1}   # prefix sum 0 seen once (empty subarray)
    for num in nums:
        prefix_sum += num
        # If (prefix_sum - k) exists, subarrays ending here sum to k
        count += freq.get(prefix_sum - k, 0)
        freq[prefix_sum] = freq.get(prefix_sum, 0) + 1
    return count

print(subarray_sum([1, 1, 1], 2))   # 2
print(subarray_sum([1, 2, 3], 3))   # 2`,
        output: `2\n2`,
        explanation: 'Track cumulative prefix sums. For each position, check if (prefix_sum - k) was seen before — that many subarrays ending here sum to k. O(n) time, O(n) space.',
      },
    ],
    commonMistakes: [
      'Using a mutable object (list) as a dict key — raises TypeError: unhashable type.',
      'Iterating and modifying a dict simultaneously — raises RuntimeError.',
      'Assuming Python dict preserves insertion order in versions < 3.7 (it does not).',
    ],
    bestPractices: [
      'Use defaultdict(list) or defaultdict(int) to avoid KeyError on first access.',
      'Use Counter for frequency counting instead of building a dict manually.',
      'Use a frozen set or tuple as a dict key when the key is a collection.',
    ],
    exercises: [
      'Implement a hash map from scratch using an array and chaining for collision resolution.',
      'Find the first non-repeating character in a string using a hash map.',
      'Given an array, find the longest subarray with equal numbers of 0s and 1s.',
    ],
    quizQuestions: [
      {
        question: 'What is the average-case time complexity of a Python dict lookup?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        answer: 2,
        explanation: 'The hash function computes an index directly. In the average case (no excessive collisions), lookup is O(1).',
      },
      {
        question: 'Why can a list not be used as a Python dict key?',
        options: ['Lists are too large', 'Lists are mutable and therefore not hashable', 'Lists are not ordered', 'Python syntax does not allow it'],
        answer: 1,
        explanation: 'Dict keys must be hashable. Lists are mutable — their contents can change, which would change their hash and break the hash table contract.',
      },
    ],
    interviewQuestions: [
      'Explain how a hash table handles collisions. What are the trade-offs between chaining and open addressing?',
      'What happens to a Python dict when it gets too full?',
      'Design a hash function for a 2D point (x, y). What properties make a good hash function?',
    ],
    summary: 'Hash tables enable O(1) average-case operations by mapping keys to indices via a hash function. Python\'s dict and set are hash tables. They are the go-to optimization for counting, grouping, and lookup problems.',
    nextTopic: 'recursion',
  },

  {
    id: 'recursion',
    title: 'Recursion',
    intro: 'Recursion is a technique where a function calls itself to solve smaller subproblems until a base case is reached.',
    whatIsIt: 'A recursive function has two parts: a base case (the simplest version of the problem, solved directly) and a recursive case (breaks the problem into a smaller subproblem and calls itself). The call stack tracks each function call\'s state until the base case returns.',
    whyImportant: 'Many problems have naturally recursive structure: trees (a tree\'s left subtree is a tree), graphs (DFS explores recursively), divide-and-conquer (split, recurse, merge). Recursion makes these problems concise and readable. Understanding recursion is also essential for understanding how computers manage function calls.',
    simpleExplanation: 'Russian nesting dolls: each doll contains a smaller one. Opening a doll means opening the next, until you reach the smallest (base case). Each step is the same operation applied to a smaller version.',
    detailedExplanation: 'Recursive call mechanics: each call pushes a new stack frame with its own local variables. When the base case returns, frames unwind in LIFO order. Python\'s recursion limit is 1000 (sys.setrecursionlimit). Common patterns: (1) Tree traversal — visit root, recurse left, recurse right. (2) Divide and conquer — split input in half, recurse, combine. (3) Backtracking — try an option, recurse, undo if it fails. (4) Memoization — cache results of recursive calls to avoid recomputation.',
    realWorldExample: 'File system traversal: to list all files in a directory, list files in this directory, then recursively list files in each subdirectory. The directory structure is inherently recursive (directories contain directories).',
    technicalDetails: 'Tail recursion: a recursive call is the last operation in a function. Tail-call optimization (TCO) converts this to iteration, using O(1) stack space. Python does NOT implement TCO — even tail-recursive Python functions use O(n) stack space. Convert to iteration for production Python code with large n.',
    formula: 'Recurrence relation for recursive algorithms:\nT(n) = aT(n/b) + f(n)\nMaster theorem gives closed-form solutions',
    codeExamples: [
      {
        title: 'Fibonacci: Naive vs Memoized',
        language: 'python',
        code: `import time
from functools import lru_cache

# Naive: O(2^n) — exponential!
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)

# Memoized: O(n) — each subproblem solved once
@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1:
        return n
    return fib_memo(n-1) + fib_memo(n-2)

start = time.time()
print(fib_naive(35))
print(f"Naive: {(time.time()-start):.3f}s")

start = time.time()
print(fib_memo(35))
print(f"Memo:  {(time.time()-start):.6f}s")`,
        output: `9227465\nNaive: 3.241s\n9227465\nMemo:  0.000021s`,
        explanation: 'Naive Fibonacci recomputes the same subproblems exponentially. Memoization caches results — fib(35) requires only 35 unique computations instead of 2^35 ≈ 34 billion.',
      },
      {
        title: 'Power Set (Backtracking)',
        language: 'python',
        code: `def power_set(nums):
    result = []
    def backtrack(start, current):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()   # undo (backtrack)
    backtrack(0, [])
    return result

print(power_set([1, 2, 3]))`,
        output: `[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]`,
        explanation: 'At each position we choose to include or exclude each element. The "undo" step (current.pop()) is the hallmark of backtracking — try a path, recurse, then restore state.',
      },
    ],
    commonMistakes: [
      'Missing base case → infinite recursion → RecursionError: maximum recursion depth exceeded.',
      'Modifying a shared mutable structure without restoring it (forgetting the backtrack undo step).',
      'Not converting to iterative when recursion depth approaches 1000 in Python.',
    ],
    bestPractices: [
      'Always write and verify the base case before the recursive case.',
      'Trace the recursion tree on paper for n=3 before coding for general n.',
      'Use @lru_cache or functools.cache for expensive overlapping recursive subproblems.',
    ],
    exercises: [
      'Write a recursive function to compute the sum of digits of a number (e.g., 1234 → 10).',
      'Generate all permutations of a list using recursion and backtracking.',
      'Implement merge sort recursively and analyze its time and space complexity.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of naive recursive Fibonacci (no memoization)?',
        options: ['O(n)', 'O(n log n)', 'O(2ⁿ)', 'O(n²)'],
        answer: 2,
        explanation: 'Each call branches into two recursive calls. The call tree has ~2ⁿ nodes — exponential time complexity.',
      },
      {
        question: 'What does Python\'s @lru_cache decorator do for recursive functions?',
        options: ['It increases the recursion limit', 'It memoizes (caches) previous return values', 'It converts recursion to iteration', 'It parallelizes recursive calls'],
        answer: 1,
        explanation: '@lru_cache caches the return value for each unique set of arguments. This converts exponential recursive algorithms to linear by eliminating redundant recomputation.',
      },
    ],
    interviewQuestions: [
      'Explain how the call stack works during recursion with a concrete example.',
      'What is tail recursion and why does it matter (or not) in Python?',
      'How do you convert a recursive algorithm to iterative? Walk through an example.',
    ],
    summary: 'Recursion solves problems by reducing them to smaller versions of themselves. Always define base cases first. Use memoization (@lru_cache) for overlapping subproblems. Convert deep recursion to iteration in Python to avoid the 1000-frame limit.',
    nextTopic: 'binary-search',
  },

  {
    id: 'binary-search',
    title: 'Binary Search',
    intro: 'Binary search finds a target in a sorted array in O(log n) by repeatedly halving the search space.',
    whatIsIt: 'Binary search works on sorted arrays. Compare the target with the middle element. If they match, done. If target is smaller, search the left half. If larger, search the right half. Each comparison eliminates half the remaining elements.',
    whyImportant: 'Binary search is one of the most practically useful algorithms. O(log n) vs O(n) means finding a name among 1 billion sorted records takes 30 comparisons instead of 500 million. It also generalizes to "search on answer" problems.',
    simpleExplanation: 'Think of a number guessing game (1-100). You guess 50. "Too high!" Now you know it\'s 1-49. Guess 25. "Too low!" Now 26-49. Each guess eliminates half. That\'s binary search.',
    detailedExplanation: 'Three implementations: (1) Standard: find exact target. Returns -1 if not found. (2) Left bound: find leftmost occurrence. (3) Right bound: find rightmost occurrence. Common pitfalls: mid = (lo + hi) // 2 is fine in Python (arbitrary precision), but in C/Java use lo + (hi - lo) // 2 to prevent integer overflow. Always verify with edge cases: empty array, single element, target at bounds.',
    realWorldExample: 'Git bisect uses binary search to find the commit that introduced a bug. Given a "good" commit and a "bad" commit, it tests the midpoint, then narrows the range by half each step. O(log n) commits tested instead of O(n) linear scan.',
    formula: 'mid = lo + (hi - lo) // 2   ← overflow-safe\nSearch space halves each step → O(log₂ n) iterations',
    codeExamples: [
      {
        title: 'Binary Search Variants',
        language: 'python',
        code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def left_bound(arr, target):
    """First occurrence index or -1."""
    lo, hi = 0, len(arr) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            result = mid
            hi = mid - 1   # continue searching left
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result

arr = [1, 2, 2, 2, 3, 4, 5]
print(binary_search(arr, 2))   # any index of 2 (e.g. 2)
print(left_bound(arr, 2))      # 1 (first 2)
print(binary_search(arr, 6))   # -1`,
        output: `2\n1\n-1`,
        explanation: 'Standard binary search returns any matching index. Left-bound variant keeps narrowing toward the left when a match is found — always searches the left half after finding target.',
      },
      {
        title: 'Search on Answer: Minimum Capacity',
        language: 'python',
        code: `def ship_within_days(weights, days):
    """Minimum capacity ship to ship all weights in 'days' days."""
    def can_ship(capacity):
        day_count, load = 1, 0
        for w in weights:
            if load + w > capacity:
                day_count += 1
                load = 0
            load += w
        return day_count <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(mid):
            hi = mid         # try smaller
        else:
            lo = mid + 1     # need larger
    return lo

print(ship_within_days([1,2,3,4,5,6,7,8,9,10], 5))  # 15`,
        output: `15`,
        explanation: '"Search on answer" pattern: binary search on the answer space (capacities from max(weights) to sum(weights)), checking feasibility at each midpoint. O(n log(sum)) — far better than trying every capacity.',
      },
    ],
    commonMistakes: [
      'lo <= hi vs lo < hi: use <= for find-exact, use < for find-boundary.',
      'Not updating lo = mid + 1 (only mid) — causes infinite loop when lo == hi.',
      'Applying binary search to an unsorted array — the algorithm requires sorted order.',
    ],
    bestPractices: [
      'Memorize the two templates: (1) lo<=hi for exact search, (2) lo<hi for boundary search.',
      'Verify termination: after the loop, what does lo/hi represent? Check invariant.',
      'Consider "binary search on answer" whenever the problem asks for minimum/maximum of a value with a monotone feasibility condition.',
    ],
    exercises: [
      'Find the square root of a non-negative integer using binary search (floor result).',
      'Given a sorted rotated array (e.g., [4,5,6,7,0,1,2]), find a target in O(log n).',
      'Find the peak element in an array where nums[i] ≠ nums[i+1] using binary search.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        answer: 1,
        explanation: 'Each comparison halves the search space. Starting with n elements, we need at most log₂(n) comparisons to reduce to 1 element.',
      },
      {
        question: 'Binary search requires the array to be:',
        options: ['Unsorted', 'Sorted', 'Unique elements only', 'Stored in a linked list'],
        answer: 1,
        explanation: 'Binary search relies on the sorted property to decide which half to discard. On an unsorted array, discarding half the elements is not valid.',
      },
    ],
    interviewQuestions: [
      'Explain the difference between the left-bound and right-bound binary search variants.',
      'What is "binary search on answer" and when do you apply it?',
      'Why is mid = lo + (hi - lo) // 2 safer than mid = (lo + hi) // 2 in some languages?',
    ],
    summary: 'Binary search achieves O(log n) by halving the search space each step. Master three templates: exact search, left bound, right bound. Then extend to "binary search on answer" for optimization problems — one of the most powerful algorithmic patterns.',
    nextTopic: 'sorting-algorithms',
  },

  {
    id: 'sorting-algorithms',
    title: 'Sorting Algorithms',
    intro: 'Sorting arranges elements in order and is foundational to database indexing, searching, and algorithm design.',
    whatIsIt: 'Sorting algorithms rearrange a collection into a defined order (ascending, descending, or by key). They differ in time complexity, space complexity, stability (equal elements maintain relative order), and adaptivity (faster on nearly-sorted data).',
    whyImportant: 'Sorted data enables binary search (O(log n) instead of O(n)), efficient deduplication, and merge operations. Database indices are sorted. File systems sort directories. Virtually every list users see is sorted.',
    simpleExplanation: 'Sorting is like organizing a deck of cards. There are many methods: pick the smallest each time (selection sort), compare adjacent pairs (bubble sort), insert each card into the right position (insertion sort). The best methods (merge sort, quick sort) use a clever "divide and conquer" approach.',
    detailedExplanation: 'Comparison-based sorting lower bound: Ω(n log n) — no comparison sort can do better in general. Non-comparison sorts (counting, radix) break this by exploiting data structure. Python\'s sorted() and list.sort() use Timsort — a hybrid merge/insertion sort that is O(n log n) worst case and O(n) for nearly-sorted data. Stable sort preserves equal elements\' relative order — important when sorting by multiple keys.',
    realWorldExample: 'E-commerce product listings sort by price, rating, or relevance. Each requires a stable sort — sorting by price first, then by rating must keep equal-price items in rating order. Timsort\'s stability makes this reliable.',
    formula: `Complexity Summary:\nBubble/Selection/Insertion: O(n²) worst, O(1) space\nMerge Sort: O(n log n) all cases, O(n) space\nQuick Sort: O(n log n) avg, O(n²) worst, O(log n) space\nHeap Sort: O(n log n) all cases, O(1) space\nCounting/Radix: O(n+k) / O(nk), O(n+k) space`,
    codeExamples: [
      {
        title: 'Sorting Algorithm Comparison',
        language: 'python',
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(l, r):
    result = []
    i = j = 0
    while i < len(l) and j < len(r):
        if l[i] <= r[j]:
            result.append(l[i]); i += 1
        else:
            result.append(r[j]); j += 1
    return result + l[i:] + r[j:]

data1 = [64, 34, 25, 12, 22, 11, 90]
data2 = data1.copy()
bubble_sort(data1)
print("Bubble:", data1)
print("Merge:", merge_sort(data2))`,
        output: `Bubble: [11, 12, 22, 25, 34, 64, 90]\nMerge: [11, 12, 22, 25, 34, 64, 90]`,
        explanation: 'Bubble sort: O(n²) — nested loops compare adjacent pairs. Merge sort: O(n log n) — divide in half, sort each half, merge. Both produce the same result; merge sort is drastically faster for large inputs.',
      },
    ],
    commonMistakes: [
      'Implementing bubble sort for production — always use Python\'s built-in sorted() (Timsort).',
      'Forgetting that sort(key=...) is often cleaner than implementing a custom comparator.',
      'Using an unstable sort when relative order of equal elements matters.',
    ],
    bestPractices: [
      'In Python, always use sorted() or list.sort() for production code (Timsort is highly optimized).',
      'Use key= argument for custom sort: sorted(students, key=lambda s: s.gpa, reverse=True).',
      'Know when to use counting sort / radix sort: integers in a known range, O(n) instead of O(n log n).',
    ],
    exercises: [
      'Implement quick sort with random pivot selection and analyze its average-case complexity.',
      'Sort an array of strings by length, then alphabetically for equal-length strings.',
      'Implement counting sort for an array of integers in range [0, k] and verify O(n+k) complexity.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of merge sort in all cases?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
        answer: 1,
        explanation: 'Merge sort always divides the array into halves (log n levels) and merges in linear time per level. All cases: O(n log n).',
      },
      {
        question: 'Which Python sorting algorithm is used by sorted() and list.sort()?',
        options: ['Quicksort', 'Heapsort', 'Timsort', 'Mergesort'],
        answer: 2,
        explanation: 'Python uses Timsort — a hybrid of merge sort and insertion sort. It is O(n log n) worst case and O(n) for nearly-sorted data.',
      },
    ],
    interviewQuestions: [
      'What is a stable sort and why does it matter?',
      'When would you choose heap sort over merge sort?',
      'Explain why O(n log n) is the lower bound for comparison-based sorting.',
    ],
    summary: 'Sorting is foundational — know O(n²) sorts (bubble, selection, insertion) for understanding, O(n log n) sorts (merge, quick, heap) for implementation, and Python\'s Timsort for production. Stability and space complexity determine the right choice for each use case.',
    nextTopic: 'trees',
  },
]
