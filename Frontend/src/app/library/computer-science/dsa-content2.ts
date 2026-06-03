import type { TopicLesson } from '../_shared/types'

export const dsaLessons2: TopicLesson[] = [
  {
    id: 'trees',
    title: 'Trees',
    intro: 'A tree is a hierarchical, non-linear data structure where each node has at most one parent and zero or more children.',
    whatIsIt: 'A tree is a connected acyclic graph. It has a root node (no parent), internal nodes (at least one child), and leaf nodes (no children). The depth of a node is the number of edges from root to that node. The height of the tree is the maximum depth of any node.',
    whyImportant: 'Trees model hierarchical data naturally: file systems, HTML DOM, XML, JSON, organization charts. Binary search trees enable O(log n) search. Heaps enable O(log n) priority queue operations. Tries enable O(m) string prefix search. Nearly every operating system and database uses tree structures internally.',
    simpleExplanation: 'A family tree is a perfect analogy. One ancestor (root) at the top. Each person can have multiple children. People with no children are leaves. Trees represent hierarchy — parent-child relationships.',
    detailedExplanation: 'Key tree properties: (1) A tree with n nodes has exactly n-1 edges. (2) Every node (except root) has exactly one parent. (3) There is exactly one path between any two nodes. Types: Binary tree (max 2 children), BST (left < root < right), AVL/Red-Black (self-balancing BSTs), Heap (max/min value at root), Trie (character-level prefix tree), Segment tree (range queries).',
    realWorldExample: 'File systems are trees: root directory ("/") contains subdirectories, which contain files. Navigating a file path traverses the tree. grep -r searches the tree depth-first.',
    technicalDetails: 'Tree traversals: (1) Inorder (L→Root→R): gives sorted order for BSTs. (2) Preorder (Root→L→R): copies tree structure, serialization. (3) Postorder (L→R→Root): deletes a tree, computes directory sizes. (4) Level-order (BFS): processes nodes by level, finds shortest path in unweighted trees.',
    syntaxBlock: `class TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\n# Build: 1\n#       / \\\n#      2   3\nroot = TreeNode(1)\nroot.left = TreeNode(2)\nroot.right = TreeNode(3)`,
    codeExamples: [
      {
        title: 'Tree Traversals',
        language: 'python',
        code: `class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = self.right = None

def inorder(root):
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

def preorder(root):
    return [root.val] + preorder(root.left) + preorder(root.right) if root else []

def postorder(root):
    return postorder(root.left) + postorder(root.right) + [root.val] if root else []

from collections import deque
def level_order(root):
    if not root: return []
    q, result = deque([root]), []
    while q:
        node = q.popleft()
        result.append(node.val)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    return result

# Build tree:    4
#              /   \\
#             2     6
#            / \\   / \\
#           1   3 5   7
root = TreeNode(4)
root.left = TreeNode(2); root.right = TreeNode(6)
root.left.left = TreeNode(1); root.left.right = TreeNode(3)
root.right.left = TreeNode(5); root.right.right = TreeNode(7)

print("Inorder:   ", inorder(root))
print("Preorder:  ", preorder(root))
print("Postorder: ", postorder(root))
print("Level:     ", level_order(root))`,
        output: `Inorder:    [1, 2, 3, 4, 5, 6, 7]\nPreorder:   [4, 2, 1, 3, 6, 5, 7]\nPostorder:  [1, 3, 2, 5, 7, 6, 4]\nLevel:      [4, 2, 6, 1, 3, 5, 7]`,
        explanation: 'Inorder on a BST gives sorted order. Preorder preserves tree structure. Postorder processes children before parent. Level-order uses BFS.',
      },
    ],
    commonMistakes: [
      'Not handling None leaf nodes — always check "if root" before accessing root.left or root.val.',
      'Confusing height and depth: height is max depth from a node to a leaf.',
      'Returning from both recursive branches without combining results (maximum depth pattern).',
    ],
    bestPractices: [
      'Use level-order (BFS) for problems about "minimum depth", "level-by-level" processing.',
      'Use inorder for BST problems (gives sorted sequence).',
      'Always test on: empty tree, single node, left-skewed, right-skewed, balanced.',
    ],
    exercises: [
      'Find the maximum depth (height) of a binary tree using recursive DFS.',
      'Check if a binary tree is symmetric (mirror of itself) recursively.',
      'Serialize and deserialize a binary tree to/from a string.',
    ],
    quizQuestions: [
      {
        question: 'Which traversal of a BST gives elements in sorted (ascending) order?',
        options: ['Preorder', 'Postorder', 'Inorder', 'Level-order'],
        answer: 2,
        explanation: 'Inorder traversal visits left subtree (smaller values), then root, then right subtree (larger values) — this produces ascending sorted order for a BST.',
      },
      {
        question: 'A tree with n nodes has how many edges?',
        options: ['n', 'n+1', 'n-1', '2n'],
        answer: 2,
        explanation: 'Every node except the root has exactly one parent edge. n nodes → n-1 edges.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a binary tree and a binary search tree?',
      'Describe the four tree traversal methods and a use case for each.',
      'How do you find the Lowest Common Ancestor (LCA) of two nodes in a BST?',
    ],
    summary: 'Trees represent hierarchical data. Master all four traversals (inorder, preorder, postorder, level-order) and their use cases. Most tree problems involve recursion — think "solve for root, recurse for children".',
    nextTopic: 'binary-search-trees',
  },

  {
    id: 'binary-search-trees',
    title: 'Binary Search Trees',
    intro: 'A BST maintains the invariant: left subtree values < root < right subtree values, enabling O(log n) search, insert, and delete on balanced trees.',
    whatIsIt: 'A Binary Search Tree is a binary tree where for every node: all values in its left subtree are strictly less than the node\'s value, and all values in its right subtree are strictly greater. This property enables efficient searching by eliminating half the tree at each level.',
    whyImportant: 'BSTs power sorted data storage with efficient lookup, insertion, and deletion — O(log n) when balanced. They underlie database indices (B-trees are generalized BSTs) and are the foundation for self-balancing trees (AVL, Red-Black) used in Java\'s TreeMap and C++\'s std::map.',
    simpleExplanation: 'Think of 20 Questions for numbers. "Is it less than 50? Yes. Less than 25? No. Less than 37? Yes..." Each answer cuts possibilities in half. A BST is the data structure that makes this strategy work for arbitrary sorted data.',
    detailedExplanation: 'Operations on a BST: Search O(h), Insert O(h), Delete O(h), Min/Max O(h), Predecessor/Successor O(h), where h = tree height. For a balanced BST, h = O(log n). For a degenerate (sorted input) BST, h = O(n), making it as slow as a linked list. This is why self-balancing trees (AVL, Red-Black) are used in production.',
    realWorldExample: 'Python\'s sortedcontainers library uses a BST-like structure to maintain sorted sets and dicts with O(log n) operations. Java\'s TreeMap is a Red-Black tree — a self-balancing BST. These are used for range queries and ordered iteration.',
    formula: 'BST invariant:\nFor node v: max(left subtree) < v.val < min(right subtree)\nHeight of balanced BST: h = O(log n)\nHeight of degenerate BST: h = O(n)',
    codeExamples: [
      {
        title: 'BST Insert, Search, and Validate',
        language: 'python',
        code: `class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = self.right = None

def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, target):
    if not root or root.val == target:
        return root
    if target < root.val:
        return search(root.left, target)
    return search(root.right, target)

def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root:
        return True
    if not (lo < root.val < hi):
        return False
    return (is_valid_bst(root.left, lo, root.val) and
            is_valid_bst(root.right, root.val, hi))

root = None
for v in [5, 3, 7, 1, 4]:
    root = insert(root, v)

print(search(root, 4).val)       # 4
print(search(root, 6))           # None
print(is_valid_bst(root))        # True`,
        output: `4\nNone\nTrue`,
        explanation: 'Insert recurses left or right based on comparison. Search follows the same path. Validation passes min/max bounds down the tree — a subtle approach that catches the "right subtree has a value < root\'s ancestor" violation.',
      },
    ],
    commonMistakes: [
      'Validating BST by only checking parent-child relationship — must check all ancestors.',
      'Degenerate BST (inserting sorted data) — consider shuffling or using a self-balancing tree.',
      'BST delete is complex — handle 3 cases: leaf, one child, two children (in-order successor).',
    ],
    bestPractices: [
      'Validate BST by passing (min, max) bounds through recursion, not just parent-child comparison.',
      'Use inorder traversal to convert BST to sorted array or to validate BST in O(n).',
      'For production, use sortedcontainers.SortedList (Python) or std::set (C++) instead of manual BST.',
    ],
    exercises: [
      'Find the kth smallest element in a BST in O(h) time without extra space.',
      'Convert a sorted array to a balanced BST.',
      'Delete a node from a BST handling all three cases: leaf, one child, two children.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of BST search on a balanced tree with n nodes?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        answer: 1,
        explanation: 'A balanced BST has height O(log n). Each comparison eliminates half the remaining nodes, so search takes O(log n) comparisons.',
      },
      {
        question: 'What happens to BST performance when elements are inserted in sorted order?',
        options: ['Improves to O(1)', 'Stays O(log n)', 'Degrades to O(n)', 'Causes an error'],
        answer: 2,
        explanation: 'Inserting sorted elements creates a degenerate (right-skewed) tree of height n. All operations degrade to O(n) — equivalent to a linked list.',
      },
    ],
    interviewQuestions: [
      'Why is checking only the immediate parent insufficient to validate a BST?',
      'How do you find the inorder successor of a given node in a BST?',
      'What is the difference between a BST and a balanced BST, and why does it matter?',
    ],
    summary: 'BSTs provide O(log n) operations when balanced. The BST invariant must hold for all ancestors, not just parent-child pairs. For production, use self-balancing variants (AVL, Red-Black) or language-provided sorted containers.',
    nextTopic: 'heaps',
  },

  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    intro: 'A heap is a complete binary tree satisfying the heap property — enabling O(log n) insert and O(1) peek at the min or max.',
    whatIsIt: 'A heap is a complete binary tree (filled level by level, left-to-right) where every parent is ≤ its children (min-heap) or ≥ its children (max-heap). It is typically stored as an array — children of index i are at 2i+1 and 2i+2. A priority queue is an ADT that heaps implement.',
    whyImportant: 'Heaps power priority queues — essential for Dijkstra\'s shortest path, Prim\'s MST, heap sort, task schedulers, and top-K problems. Python\'s heapq module provides a min-heap. O(log n) insert/delete with O(1) min access is unmatched for priority-based processing.',
    simpleExplanation: 'An ER waiting room is a priority queue. The most critical patient is always seen first, regardless of arrival time. Adding a new patient re-sorts the queue by severity — O(log n) instead of O(n) because of the heap structure.',
    detailedExplanation: 'Heap operations: Insert O(log n) — add at end, bubble up (sift up). Extract-min O(log n) — remove root, move last element to root, bubble down (sift down). Peek O(1) — root is always the min. Build heap from array: O(n) using sift-down from leaves to root (not O(n log n)). Python heapq is a min-heap — negate values for max-heap.',
    realWorldExample: 'Operating system process schedulers use priority queues. Processes with higher priority preempt lower-priority ones. The heap enables O(log n) insertion of new processes and O(log n) extraction of the highest-priority runnable process.',
    formula: 'For node at index i (0-indexed):\n  Parent: (i-1)//2\n  Left child: 2i+1\n  Right child: 2i+2\nInsert: O(log n)\nExtract-min: O(log n)\nPeek min: O(1)\nBuild heap: O(n)',
    codeExamples: [
      {
        title: 'Python heapq: Min-Heap and Top-K Pattern',
        language: 'python',
        code: `import heapq

# Basic min-heap operations
h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
print(h[0])              # 1 (peek min) — O(1)
print(heapq.heappop(h))  # 1 (extract min) — O(log n)
print(h[0])              # 3

# Max-heap: negate values
max_h = []
for val in [5, 1, 3]:
    heapq.heappush(max_h, -val)
print(-heapq.heappop(max_h))  # 5 (max)

# Top-K largest elements: O(n log k)
def top_k(nums, k):
    return heapq.nlargest(k, nums)

nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
print(top_k(nums, 3))    # [9, 6, 5]`,
        output: `1\n1\n3\n5\n[9, 6, 5]`,
        explanation: 'Python\'s heapq maintains a min-heap. For max-heap, negate all values. heapq.nlargest(k, nums) uses a min-heap of size k — O(n log k) time, O(k) space.',
      },
      {
        title: 'K Closest Points to Origin',
        language: 'python',
        code: `import heapq

def k_closest(points, k):
    # Max-heap of size k — O(n log k)
    heap = []
    for x, y in points:
        dist = -(x*x + y*y)   # negate for max-heap
        if len(heap) < k:
            heapq.heappush(heap, (dist, x, y))
        elif dist > heap[0][0]:
            heapq.heapreplace(heap, (dist, x, y))
    return [(x, y) for _, x, y in heap]

points = [[1,3],[-2,2],[5,8],[0,1]]
print(k_closest(points, 2))`,
        output: `[(0, 1), (-2, 2)]`,
        explanation: 'Maintain a max-heap of size k (using negated distances). For each point, if it\'s closer than the farthest in our heap, replace. Result: k closest points. O(n log k) vs O(n log n) sort-all approach.',
      },
    ],
    commonMistakes: [
      'Treating heapq as a max-heap — Python\'s heapq is always a min-heap. Negate for max.',
      'Accessing heap[1] for second-smallest — heap[1] is not necessarily the second smallest (heap property only guarantees the root).',
      'Modifying heap elements directly — always use heappush/heappop to maintain heap invariant.',
    ],
    bestPractices: [
      'Use heapq.nlargest(k, data) and heapq.nsmallest(k, data) for simple top-K queries.',
      'For k << n, a heap-based solution O(n log k) beats full sort O(n log n).',
      'Store tuples in the heap: (priority, data) — heapq compares element by element.',
    ],
    exercises: [
      'Merge k sorted lists into one sorted list using a heap.',
      'Find the median of a data stream using two heaps (max-heap for lower half, min-heap for upper half).',
      'Implement heap sort in-place using max-heapify.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of extracting the minimum from a min-heap?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 1,
        explanation: 'Extract-min removes the root (O(1) access), moves the last element to the root, then sifts down — O(log n) comparisons to restore heap property.',
      },
      {
        question: 'How do you implement a max-heap using Python\'s heapq module?',
        options: ['heapq.maxheap()', 'Set reverse=True in heappush', 'Negate all values before pushing', 'Use sorted() instead'],
        answer: 2,
        explanation: 'Python\'s heapq only provides a min-heap. By pushing -value and popping -result, you simulate a max-heap.',
      },
    ],
    interviewQuestions: [
      'Why is building a heap from an array O(n) and not O(n log n)?',
      'Describe the two-heap approach for finding the running median.',
      'What is the time complexity of finding the kth largest element using a heap?',
    ],
    summary: 'Heaps provide O(log n) insert/extract and O(1) peek. Python\'s heapq is a min-heap — negate for max. Master the top-K pattern (heap of size k) and the two-heap median pattern. These appear constantly in interviews.',
    nextTopic: 'graphs',
  },

  {
    id: 'graphs',
    title: 'Graphs',
    intro: 'Graphs are the most general data structure — they model any network of relationships between entities.',
    whatIsIt: 'A graph G = (V, E) consists of vertices (nodes) V and edges E connecting them. Edges can be directed (one-way) or undirected (two-way), weighted (have a cost) or unweighted. Graphs model social networks, road maps, web links, dependency chains, and electrical circuits.',
    whyImportant: 'Every major network problem is a graph problem: shortest path (GPS), network flow (bandwidth), connectivity (social features), cycle detection (dependency resolution), topological sort (build systems). Graph algorithms are among the most powerful and widely applied in computer science.',
    simpleExplanation: 'A graph is a map. Cities are nodes. Roads are edges. Edge weight = distance. "Find shortest route" = shortest path in a weighted graph. "Are cities connected?" = graph connectivity. Social networks: people are nodes, friendships are edges.',
    detailedExplanation: 'Graph representations: (1) Adjacency list — dict mapping node → list of neighbors. Space O(V+E). Efficient for sparse graphs. (2) Adjacency matrix — 2D array. Space O(V²). Efficient for dense graphs and edge-weight lookup. Graph types: Directed Acyclic Graph (DAG) — used for dependency resolution. Bipartite graph — nodes split into two groups, edges only cross groups. Connected graph — path exists between every pair of nodes.',
    realWorldExample: 'Google PageRank models the web as a directed graph. Pages are nodes; hyperlinks are directed edges. PageRank iteratively computes node importance based on incoming edges — more important pages linking to you raises your rank.',
    technicalDetails: 'Degree: number of edges incident to a vertex. In-degree/out-degree for directed graphs. Tree is a special graph: connected, undirected, acyclic, exactly n-1 edges. Forest: disconnected set of trees. Complete graph K_n: every vertex connected to every other. Density = E / (V × (V-1)).',
    syntaxBlock: `# Adjacency list (most common for interviews)\ngraph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D'],\n    'C': ['A'],\n    'D': ['B']\n}\n\n# Weighted graph\nweighted = {\n    'A': [('B', 4), ('C', 2)],\n    'B': [('D', 3)],\n    'C': [('B', 1), ('D', 5)]\n}`,
    codeExamples: [
      {
        title: 'Graph BFS and DFS',
        language: 'python',
        code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    path = []
    while queue:
        node = queue.popleft()
        path.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return path

def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    path = [start]
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            path += dfs(graph, neighbor, visited)
    return path

graph = {0:[1,2], 1:[0,3,4], 2:[0,4], 3:[1], 4:[1,2]}
print("BFS:", bfs(graph, 0))
print("DFS:", dfs(graph, 0))`,
        output: `BFS: [0, 1, 2, 3, 4]\nDFS: [0, 1, 3, 4, 2]`,
        explanation: 'BFS uses a queue — explores level by level. DFS uses recursion (or explicit stack) — goes deep before backtracking. BFS finds shortest paths in unweighted graphs; DFS is better for cycle detection and topological sort.',
      },
    ],
    commonMistakes: [
      'Not using a visited set — leads to infinite loops on cyclic graphs.',
      'Assuming a graph is connected — always handle disconnected graphs with outer loops.',
      'Confusing directed and undirected — in directed graphs, A→B does not imply B→A.',
    ],
    bestPractices: [
      'Default to adjacency list for sparse graphs (most real-world graphs).',
      'Mark visited when enqueueing (BFS) or when visiting (DFS) — not at dequeue time.',
      'For disconnected graphs, iterate over all nodes as potential starts.',
    ],
    exercises: [
      'Count the number of connected components in an undirected graph.',
      'Detect whether a directed graph has a cycle.',
      'Find all nodes reachable from a given source node.',
    ],
    quizQuestions: [
      {
        question: 'Which graph representation is most memory-efficient for sparse graphs?',
        options: ['Adjacency matrix', 'Adjacency list', 'Edge list', 'Incidence matrix'],
        answer: 1,
        explanation: 'Adjacency list uses O(V+E) space — only stores actual edges. Adjacency matrix uses O(V²) regardless of edge count — wasteful for sparse graphs.',
      },
      {
        question: 'BFS traversal finds the shortest path in which type of graph?',
        options: ['Weighted directed graphs', 'Unweighted graphs', 'Negative-weight graphs', 'Complete graphs'],
        answer: 1,
        explanation: 'BFS explores level by level, so the first time it reaches a node is via the fewest edges — shortest path in unweighted graphs.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a tree and a graph?',
      'When would you use an adjacency matrix over an adjacency list?',
      'How do you detect a cycle in an undirected graph using BFS?',
    ],
    summary: 'Graphs model any network of relationships. Master adjacency list representation, BFS (shortest path, level traversal), and DFS (cycle detection, connected components, topological sort). Always use a visited set to handle cycles.',
    nextTopic: 'dynamic-programming',
  },

  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    intro: 'Dynamic Programming (DP) solves optimization and counting problems by breaking them into overlapping subproblems and caching results.',
    whatIsIt: 'DP applies when a problem has two properties: (1) Optimal substructure — the optimal solution can be built from optimal solutions to subproblems. (2) Overlapping subproblems — the same subproblems are solved repeatedly. DP solves each subproblem once and stores the result.',
    whyImportant: 'DP transforms exponential-time naive solutions into polynomial-time solutions. It solves the hardest category of interview problems: longest subsequences, knapsack, edit distance, coin change, path counting. DP is the final boss of algorithm interviews.',
    simpleExplanation: 'Imagine calculating the 40th Fibonacci number. Naive recursion recomputes fib(38) many times. DP writes down fib(2), fib(3), ..., fib(38), fib(39) in order — each computed once, used immediately. That\'s the "memo" in memoization.',
    detailedExplanation: 'Two DP approaches: (1) Top-down (memoization) — recursive + cache. Start from the original problem, recurse to subproblems, cache results. (2) Bottom-up (tabulation) — iterative. Solve smallest subproblems first, build up to the answer. Bottom-up typically has better constants (no recursion overhead) and avoids stack overflow. DP problem types: linear DP (1D), grid DP (2D), interval DP, tree DP, bitmask DP.',
    realWorldExample: 'Auto-correct and spell-checkers use Edit Distance (Levenshtein) DP to find the minimum operations to transform one word into another. GPS systems use DP-based shortest path (Bellman-Ford) to find optimal routes with traffic constraints.',
    formula: 'DP recurrence for Fibonacci:\ndp[n] = dp[n-1] + dp[n-2], dp[0]=0, dp[1]=1\n\nDP recurrence for Coin Change:\ndp[amount] = min(dp[amount - coin] + 1) for each coin\n\nDP recurrence for Longest Common Subsequence:\ndp[i][j] = dp[i-1][j-1]+1 if s1[i]==s2[j]\n           max(dp[i-1][j], dp[i][j-1]) otherwise',
    codeExamples: [
      {
        title: 'Coin Change: Classic Bottom-Up DP',
        language: 'python',
        code: `def coin_change(coins, amount):
    # dp[i] = min coins to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0   # base case: 0 coins to make $0
    for amt in range(1, amount + 1):
        for coin in coins:
            if coin <= amt:
                dp[amt] = min(dp[amt], dp[amt - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print(coin_change([1, 5, 6, 9], 11))   # 2 (5+6)
print(coin_change([2], 3))              # -1 (impossible)`,
        output: `2\n-1`,
        explanation: 'Build dp[0..amount] from the bottom up. For each amount, try every coin — if using that coin + optimal solution for (amount-coin) is better, update dp[amount]. O(amount × len(coins)) time.',
      },
      {
        title: 'Longest Common Subsequence (LCS)',
        language: 'python',
        code: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(lcs("ABCBDAB", "BDCAB"))   # 4 (BDAB or BCAB)
print(lcs("AGGTAB", "GXTXAYB"))  # 4 (GTAB)`,
        output: `4\n4`,
        explanation: '2D DP table where dp[i][j] = LCS of s1[:i] and s2[:j]. If characters match, extend the previous LCS. Otherwise, take the best of skipping from either string. O(m×n) time and space.',
      },
    ],
    commonMistakes: [
      'Trying to apply DP to every problem — first check for greedy or simpler approaches.',
      'Wrong base cases: dp[0] and dp[1] must be set correctly before the loop.',
      'Not recognizing overlapping subproblems — drawing the recursion tree helps identify them.',
    ],
    bestPractices: [
      'Start with recursive + memoization (top-down) — easier to think about. Convert to bottom-up for production.',
      'Draw the DP table for a small example before writing code.',
      'Identify the "state" (what changes between subproblems) and the "transition" (how subproblems relate).',
    ],
    exercises: [
      'Solve the 0/1 Knapsack problem: given weights and values, maximize value within a weight limit.',
      'Find the length of the Longest Increasing Subsequence (LIS) in O(n log n).',
      'Determine the number of unique paths in an m×n grid moving only right or down.',
    ],
    quizQuestions: [
      {
        question: 'What two properties must a problem have for DP to apply?',
        options: ['Sorted input and unique elements', 'Optimal substructure and overlapping subproblems', 'Linear structure and greedy choice', 'Graph structure and BFS solvability'],
        answer: 1,
        explanation: 'DP requires: (1) optimal substructure — optimal solution uses optimal sub-solutions, and (2) overlapping subproblems — same subproblems are recomputed in naive recursion.',
      },
      {
        question: 'What is the space-optimized approach for Fibonacci DP?',
        options: ['Store all n values in an array', 'Use only two variables (prev and curr)', 'Use a hash map', 'Recursion with memoization'],
        answer: 1,
        explanation: 'Since fib(n) only depends on fib(n-1) and fib(n-2), you only need two variables — reducing space from O(n) to O(1).',
      },
    ],
    interviewQuestions: [
      'What is the difference between memoization and tabulation?',
      'How do you identify if a problem can be solved with DP?',
      'Walk through the state and transition for the Longest Increasing Subsequence problem.',
    ],
    summary: 'DP transforms exponential recursive solutions into polynomial ones by caching subproblem results. Start with memoization (top-down) to build intuition, then convert to tabulation (bottom-up) for efficiency. The key is identifying the state and the recurrence relation.',
    nextTopic: 'greedy-algorithms',
  },

  {
    id: 'greedy-algorithms',
    title: 'Greedy Algorithms',
    intro: 'Greedy algorithms make the locally optimal choice at each step, hoping it leads to the globally optimal solution.',
    whatIsIt: 'A greedy algorithm always picks the best available option at each decision point without looking ahead. Unlike DP, it never reconsiders past choices. Greedy works when the problem has the "greedy choice property" — a locally optimal choice leads to a globally optimal solution.',
    whyImportant: 'Greedy algorithms are simpler and faster than DP. When applicable, they give O(n log n) or O(n) solutions to problems that naive approaches solve in exponential time. Common applications: Huffman coding, Dijkstra\'s shortest path, interval scheduling, and minimum spanning trees.',
    simpleExplanation: 'Greedy is like making change: to give $0.36, use the largest coin that fits: quarter (25¢), then dime (10¢), then penny (1¢). You never go back and reconsider. This works for US coins but fails for some other denomination sets — the greedy choice must be proven correct for each problem.',
    detailedExplanation: 'Greedy correctness proof techniques: (1) Exchange argument — show that swapping a non-greedy choice for the greedy choice never makes things worse. (2) Greedy stays ahead — show that after each step, the greedy solution is at least as good as any other partial solution. Many problems that look greedy actually require DP (coin change with arbitrary denominations).',
    realWorldExample: 'Huffman coding assigns shorter binary codes to more frequent characters — greedy: always merge the two lowest-frequency nodes. This achieves optimal compression. Used in JPEG, ZIP, and most compression algorithms.',
    codeExamples: [
      {
        title: 'Interval Scheduling & Jump Game',
        language: 'python',
        code: `def min_meeting_rooms(intervals):
    """Minimum rooms for non-overlapping scheduling."""
    starts = sorted(i[0] for i in intervals)
    ends = sorted(i[1] for i in intervals)
    rooms = end_ptr = 0
    for start in starts:
        if start < ends[end_ptr]:
            rooms += 1
        else:
            end_ptr += 1
    return rooms

def can_jump(nums):
    """Can you reach the last index? Greedy: track max reachable."""
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True

print(min_meeting_rooms([[0,30],[5,10],[15,20]]))  # 2
print(can_jump([2,3,1,1,4]))   # True
print(can_jump([3,2,1,0,4]))   # False`,
        output: `2\nTrue\nFalse`,
        explanation: 'Meeting rooms: sort starts and ends separately. Track if a new meeting starts before any existing one ends. Jump game: greedily track the farthest reachable index — if current index exceeds it, we\'re stuck.',
      },
    ],
    commonMistakes: [
      'Applying greedy to coin change with non-standard denominations — greedy fails there.',
      'Not proving the greedy choice property — assumptions of optimality can be wrong.',
      'Sorting by wrong key — interval problems typically require sorting by end time, not start time.',
    ],
    bestPractices: [
      'Sort first — most greedy algorithms require a sorted input (by start, end, or value/weight ratio).',
      'Prove greedy correctness with an exchange argument before coding.',
      'If greedy gives wrong answers on small examples, switch to DP.',
    ],
    exercises: [
      'Find the minimum number of intervals to remove to make all remaining intervals non-overlapping.',
      'Implement Huffman encoding: build the tree and generate codes for each character.',
      'Assign cookies to children: each child needs at least g[i] greed factor; maximize satisfied children.',
    ],
    quizQuestions: [
      {
        question: 'Which property must a problem have for a greedy algorithm to yield an optimal solution?',
        options: ['Overlapping subproblems', 'Greedy choice property', 'Divide and conquer structure', 'O(n²) baseline complexity'],
        answer: 1,
        explanation: 'The greedy choice property states that a locally optimal choice at each step leads to a globally optimal solution.',
      },
      {
        question: 'Greedy coin change fails for which coin set to make 6 cents?',
        options: ['[1, 5, 10]', '[1, 3, 4]', '[1, 2, 5]', '[1, 5, 25]'],
        answer: 1,
        explanation: 'For coins [1,3,4] and target 6: greedy picks 4+1+1 (3 coins); optimal is 3+3 (2 coins). Greedy fails here.',
      },
    ],
    interviewQuestions: [
      'How do you prove that a greedy algorithm gives the optimal solution?',
      'Give an example of a problem where greedy fails and DP is needed.',
      'Explain Dijkstra\'s greedy approach for shortest paths and why it works.',
    ],
    summary: 'Greedy algorithms are elegant and efficient — when they work. Always verify the greedy choice property for your specific problem. Most greedy solutions involve sorting plus a single scan. When greedy fails, DP is usually the answer.',
    nextTopic: 'backtracking',
  },

  {
    id: 'backtracking',
    title: 'Backtracking',
    intro: 'Backtracking explores all possible solutions by building candidates incrementally and abandoning paths that cannot lead to a valid solution.',
    whatIsIt: 'Backtracking is a systematic DFS-based approach that tries partial solutions, extends them, and backtracks when a dead end is reached. It is essentially pruned brute-force — the key optimization is detecting invalid states early (constraint checking) to prune entire branches.',
    whyImportant: 'Backtracking solves problems that require exhaustive search with constraints: N-Queens, Sudoku, permutations, combinations, word search in a matrix, and many optimization problems. It is often the only correct approach for constraint-satisfaction problems.',
    simpleExplanation: 'Backtracking is solving a maze. At every fork, try one path. If you hit a dead end, back up to the last fork and try the other path. Keep backtracking until you find the exit or exhaust all paths.',
    detailedExplanation: 'Backtracking template: (1) Choose — pick a candidate. (2) Explore — recurse with the candidate applied. (3) Unchoose (backtrack) — remove the candidate and try the next. The "undo" step is critical — it restores the state for the next branch to explore. Pruning: add conditions before recursing to skip branches that can\'t lead to solutions.',
    realWorldExample: 'Sudoku solvers use backtracking: place a digit in the current empty cell, check if it violates row/col/box constraints, recurse to the next cell. If stuck (no valid digit), backtrack to the previous cell and try the next digit.',
    codeExamples: [
      {
        title: 'N-Queens Problem',
        language: 'python',
        code: `def solve_n_queens(n):
    solutions = []
    board = [-1] * n   # board[row] = column of queen in that row

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(c - col) == abs(r - row):
                return False   # same col or diagonal
        return True

    def backtrack(row):
        if row == n:
            solutions.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row] = col   # choose
                backtrack(row + 1) # explore
                board[row] = -1    # unchoose

    backtrack(0)
    return len(solutions)

print(solve_n_queens(4))   # 2
print(solve_n_queens(8))   # 92`,
        output: `2\n92`,
        explanation: 'Place one queen per row. For each row, try every column. Check safety: no two queens share a row (enforced), column, or diagonal. Backtrack when no safe column exists in the current row.',
      },
    ],
    commonMistakes: [
      'Forgetting the "unchoose" step — the board/state must be fully restored before trying the next candidate.',
      'Not pruning — checking constraints too late makes backtracking as slow as pure brute force.',
      'Returning from all branches when you need only one solution — add early return after first success.',
    ],
    bestPractices: [
      'Use the choose/explore/unchoose template consistently.',
      'Prune early: check constraints at the start of each recursive call before recursing deeper.',
      'For performance, maintain auxiliary structures (row_set, col_set, diag_set) for O(1) constraint checks.',
    ],
    exercises: [
      'Generate all valid combinations of k numbers from 1 to n.',
      'Solve a 9×9 Sudoku puzzle using backtracking.',
      'Find all paths from top-left to bottom-right in a grid with obstacles.',
    ],
    quizQuestions: [
      {
        question: 'What is the key step that distinguishes backtracking from regular DFS?',
        options: ['Using a queue instead of stack', 'Undoing the choice after recursion returns', 'Visiting nodes in sorted order', 'Using memoization'],
        answer: 1,
        explanation: 'The "unchoose" (undo) step restores state after a recursive call returns, allowing the algorithm to try the next candidate from a clean state.',
      },
      {
        question: 'What is pruning in backtracking?',
        options: ['Removing duplicate solutions', 'Cutting branches that cannot lead to valid solutions', 'Sorting candidates before trying them', 'Caching subproblem results'],
        answer: 1,
        explanation: 'Pruning eliminates branches early by detecting invalid states before recursing deeper — dramatically reducing the number of nodes explored.',
      },
    ],
    interviewQuestions: [
      'What is the difference between backtracking and dynamic programming?',
      'How would you use backtracking to generate all permutations of a string?',
      'Explain how pruning improves backtracking efficiency in the N-Queens problem.',
    ],
    summary: 'Backtracking = DFS + undo. It exhaustively explores solution spaces with early pruning for efficiency. The choose/explore/unchoose template is universal. Master it for N-Queens, Sudoku, permutations, and combinations.',
    nextTopic: 'dsa-projects',
  },

  {
    id: 'dsa-projects',
    title: 'DSA Projects',
    intro: 'Apply DSA concepts to build real systems: LRU cache, task scheduler, text autocomplete, and graph-based route finder.',
    whatIsIt: 'DSA projects combine multiple data structures and algorithms to solve a practical problem. They demonstrate that you can move from "I know the theory" to "I can build something useful."',
    whyImportant: 'Interviewers increasingly ask system-design questions that embed DSA: "Design an LRU cache", "Design a rate limiter", "Design autocomplete." These require knowing which structure to use, not just how it works in isolation.',
    simpleExplanation: 'Each project uses a specific combination: LRU Cache = hash map + doubly linked list. Autocomplete = Trie + DFS. Task scheduler = priority queue + frequency count. These combinations unlock real system capabilities.',
    detailedExplanation: 'Project 1: LRU Cache — fixed-size cache evicting least-recently-used items. Uses: OrderedDict (Python) = hash map + doubly linked list under the hood. O(1) get and put. Project 2: Word Autocomplete — insert words into a Trie, search for all words sharing a prefix. Project 3: Task Scheduler — given CPU tasks with cooldown, find the minimum time using max-heap of frequencies.',
    realWorldExample: 'CPU caches (L1/L2/L3) use LRU eviction. Browsers use LRU for recently visited pages. Redis can be configured as an LRU cache. Autocomplete is a Trie in every search engine and IDE.',
    codeExamples: [
      {
        title: 'LRU Cache Implementation',
        language: 'python',
        code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)   # most recently used
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # evict LRU

cache = LRUCache(2)
cache.put(1, 1); cache.put(2, 2)
print(cache.get(1))     # 1 (1 is now MRU)
cache.put(3, 3)         # evicts key 2 (LRU)
print(cache.get(2))     # -1 (evicted)
print(cache.get(3))     # 3`,
        output: `1\n-1\n3`,
        explanation: 'OrderedDict maintains insertion order. move_to_end() marks a key as most recently used in O(1). popitem(last=False) removes the least recently used in O(1). The entire cache operates in O(1) per operation.',
      },
      {
        title: 'Trie for Autocomplete',
        language: 'python',
        code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def autocomplete(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return []
            node = node.children[ch]
        results = []
        self._dfs(node, prefix, results)
        return results

    def _dfs(self, node, path, results):
        if node.is_end:
            results.append(path)
        for ch, child in node.children.items():
            self._dfs(child, path + ch, results)

t = Trie()
for w in ["apple", "app", "apply", "apt", "bat"]:
    t.insert(w)
print(t.autocomplete("app"))`,
        output: `['app', 'apple', 'apply']`,
        explanation: 'Trie stores characters at each node. Insert: walk/create nodes per character. Autocomplete: traverse to the prefix end, then DFS to collect all words below. O(m) insert and O(m + results) search where m = word length.',
      },
    ],
    commonMistakes: [
      'LRU Cache: using a plain dict + list instead of OrderedDict — results in O(n) put.',
      'Trie: not marking is_end — confusing prefixes with complete words.',
      'Task Scheduler: counting idle slots incorrectly — always think about the most frequent task first.',
    ],
    bestPractices: [
      'For LRU: Python\'s collections.OrderedDict gives O(1) LRU in ~5 lines. From scratch: doubly linked list + hash map.',
      'For Trie: use defaultdict(TrieNode) to avoid explicit key existence checks.',
      'Test your projects with edge cases: empty input, capacity=1, prefix not found.',
    ],
    exercises: [
      'Implement LRU Cache from scratch using a doubly linked list and hash map (no OrderedDict).',
      'Extend the Trie to support delete(word) and startsWith(prefix) methods.',
      'Design a rate limiter that allows at most 5 requests per second using a sliding window.',
    ],
    quizQuestions: [
      {
        question: 'What data structure combination implements an O(1) LRU Cache?',
        options: ['Array + stack', 'Hash map + doubly linked list', 'BST + queue', 'Heap + hash set'],
        answer: 1,
        explanation: 'Hash map gives O(1) key lookup; doubly linked list enables O(1) insertion/deletion at any position (given a pointer). Together: O(1) get and put.',
      },
      {
        question: 'What is the time complexity of Trie insertion for a word of length m?',
        options: ['O(1)', 'O(log n)', 'O(m)', 'O(m × alphabet_size)'],
        answer: 2,
        explanation: 'Insert traverses or creates exactly m nodes — one per character. O(m) regardless of dictionary size.',
      },
    ],
    interviewQuestions: [
      'Design an LRU cache with O(1) get and put. Explain your data structure choice.',
      'How would you implement autocomplete for a search bar using a Trie?',
      'What trade-offs would you consider when choosing between a Trie and a hash map for a dictionary?',
    ],
    summary: 'DSA projects bridge theory and practice. LRU cache = hash map + linked list. Autocomplete = Trie + DFS. Each project is a miniature system design question — understanding the underlying data structures makes the solution obvious.',
    nextTopic: 'dsa-exercises',
  },

  {
    id: 'dsa-exercises',
    title: 'DSA Exercises',
    intro: 'Curated practice problems covering every major DSA topic — with solutions and complexity analysis.',
    whatIsIt: 'Hands-on problem sets that reinforce DSA concepts. Each exercise targets a specific pattern or data structure, with a worked solution demonstrating optimal approach and complexity analysis.',
    whyImportant: 'Reading about algorithms builds intuition; solving problems builds skill. The only way to prepare for technical interviews is to practice writing correct, efficient code under time pressure.',
    simpleExplanation: 'These exercises are your DSA gym. Repetition with good form builds the muscle memory to recognize patterns quickly in interviews.',
    detailedExplanation: 'Exercises are grouped by difficulty and topic. Work through each before reading the solution. Analyze your solution\'s time and space complexity. Compare with the provided solution. Aim to solve easy problems in <15 minutes, medium in <30 minutes.',
    realWorldExample: 'Top software engineers typically practice 200-400 problems before major interviews. Quality matters more than quantity — deeply understanding 50 core problems beats barely skimming 500.',
    codeExamples: [
      {
        title: 'Exercise 1: Merge Intervals',
        language: 'python',
        code: `def merge(intervals):
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:          # overlapping
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

print(merge([[1,3],[2,6],[8,10],[15,18]]))
print(merge([[1,4],[4,5]]))`        ,
        output: `[[1, 6], [8, 10], [15, 18]]\n[[1, 5]]`,
        explanation: 'Sort by start time. Merge overlapping intervals by extending the last interval\'s end. O(n log n) for sort, O(n) for merge pass.',
      },
      {
        title: 'Exercise 2: Word Search in Grid',
        language: 'python',
        code: `def exist(board, word):
    rows, cols = len(board), len(board[0])
    def dfs(r, c, idx):
        if idx == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols):
            return False
        if board[r][c] != word[idx]:
            return False
        tmp, board[r][c] = board[r][c], '#'  # mark visited
        found = any(dfs(r+dr, c+dc, idx+1)
                    for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)])
        board[r][c] = tmp                     # restore
        return found
    return any(dfs(r, c, 0)
               for r in range(rows) for c in range(cols))

board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
print(exist(board, "ABCCED"))   # True
print(exist(board, "SEE"))      # True
print(exist(board, "ABCB"))     # False`,
        output: `True\nTrue\nFalse`,
        explanation: 'Backtracking DFS: for each cell, try matching the word character by character in all 4 directions. Mark visited by temporarily replacing with \'#\'. Restore after each attempt. O(rows × cols × 4^word_length).',
      },
    ],
    commonMistakes: [
      'Interval merging: forgetting to sort by start time first.',
      'Grid DFS: not restoring the cell after backtracking — subsequent paths see a corrupted grid.',
      'Not handling empty input for all solutions.',
    ],
    bestPractices: [
      'Time yourself — intervals should take <20 minutes at interview pace.',
      'After solving, look for patterns: interval merge = sort + greedy, grid search = DFS + backtrack.',
      'Practice explaining your approach out loud before and while coding.',
    ],
    exercises: [
      'Maximum sum subarray (Kadane\'s algorithm) — find the contiguous subarray with the largest sum.',
      'Number of islands — count connected components of \'1\'s in a 2D grid using DFS/BFS.',
      'Longest palindromic substring — expand from center or DP approach.',
    ],
    quizQuestions: [
      {
        question: 'Kadane\'s algorithm for maximum subarray sum runs in:',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        answer: 2,
        explanation: 'Kadane\'s makes a single pass: track current subarray sum and global maximum. One loop = O(n).',
      },
      {
        question: 'The word search grid problem uses which technique?',
        options: ['Binary search', 'Sliding window', 'Backtracking DFS', 'Dynamic programming'],
        answer: 2,
        explanation: 'DFS with backtracking: explore each direction, mark visited, undo the marking when returning.',
      },
    ],
    interviewQuestions: [
      'Walk me through your approach to Merge Intervals before writing any code.',
      'What is Kadane\'s algorithm and what problem does it solve?',
      'How do you approach a graph problem on a 2D grid?',
    ],
    summary: 'Practice is the only way to internalize DSA patterns. Target 2-3 problems per topic, focusing on understanding the pattern behind the solution. Time complexity and clean code matter as much as correctness in interviews.',
    nextTopic: 'dsa-interview-questions',
  },

  {
    id: 'dsa-interview-questions',
    title: 'DSA Interview Questions',
    intro: 'The most commonly asked DSA interview questions at top tech companies — with detailed answers and code.',
    whatIsIt: 'A curated collection of high-frequency interview questions covering arrays, strings, linked lists, trees, graphs, and DP — the topics most likely to appear at Google, Amazon, Meta, Microsoft, and similar companies.',
    whyImportant: 'Knowing what questions to expect removes surprise. These patterns appear repeatedly across different problem statements. Internalizing them lets you recognize a new problem as "this is a sliding window problem" or "this is a two-pointer problem" within seconds.',
    simpleExplanation: 'Think of this as a cheat sheet of the 20 most important algorithm patterns, each illustrated with a canonical problem and solution.',
    detailedExplanation: 'Critical patterns every candidate must know: Two Pointers, Sliding Window, Fast/Slow Pointer, BFS/DFS, Binary Search, Divide and Conquer, Dynamic Programming, Backtracking, Greedy, Monotonic Stack, Heap/Priority Queue, Union-Find, Trie, Topological Sort, Segment Tree. Each pattern solves a class of problems.',
    realWorldExample: 'In a real Google interview, a candidate who immediately recognizes "find the longest substring with at most k distinct characters" as a sliding window problem will solve it in 10 minutes. One who doesn\'t will struggle for 45 minutes.',
    codeExamples: [
      {
        title: 'Top 5 Patterns with Canonical Problems',
        language: 'python',
        code: `# 1. TWO POINTERS — Valid palindrome
def is_palindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    l, r = 0, len(s)-1
    while l < r:
        if s[l] != s[r]: return False
        l += 1; r -= 1
    return True

# 2. SLIDING WINDOW — Minimum window substring
from collections import Counter
def min_window(s, t):
    need = Counter(t)
    missing = len(t)
    best = ""
    j = 0
    for i, c in enumerate(s):
        if need[c] > 0: missing -= 1
        need[c] -= 1
        if missing == 0:
            while need[s[j]] < 0: need[s[j]] += 1; j += 1
            if not best or i-j+1 < len(best): best = s[j:i+1]
            need[s[j]] += 1; missing += 1; j += 1
    return best

# 3. FAST/SLOW POINTER — Middle of linked list
class Node:
    def __init__(self, v): self.val=v; self.next=None
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

print(is_palindrome("A man a plan a canal Panama"))  # True
print(min_window("ADOBECODEBANC", "ABC"))            # "BANC"`,
        output: `True\nBANC`,
        explanation: 'Two pointers converge from both ends for palindrome. Sliding window with a missing-count tracks the minimum valid window. Fast/slow pointer finds the middle in one pass.',
      },
      {
        title: 'Union-Find for Connected Components',
        language: 'python',
        code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        self.components -= 1

uf = UnionFind(5)
uf.union(0, 1); uf.union(2, 3); uf.union(1, 2)
print(uf.components)   # 2 (group 0-1-2-3 and isolated 4)`,
        output: `2`,
        explanation: 'Union-Find with path compression and union by rank. find() is near-O(1) amortized. union() merges two components. components tracks the count. Used for Kruskal\'s MST, number of islands, and network connectivity.',
      },
    ],
    commonMistakes: [
      'Not recognizing the pattern — spend time studying pattern categories, not just individual problems.',
      'Forgetting to handle edge cases in interview pressure — always check: empty input, single element, all-equal.',
      'Over-engineering — simple O(n log n) solutions often beat complex O(n) ones in interview contexts.',
    ],
    bestPractices: [
      'For each problem, state the approach and complexity before coding.',
      'Think through 2-3 approaches before choosing — show the interviewer your thought process.',
      'After solving, identify which pattern this problem belongs to — builds a mental pattern library.',
    ],
    exercises: [
      'Course Schedule (detect cycle in directed graph using topological sort).',
      'Trapping Rain Water (two-pointer or monotonic stack — both O(n)).',
      'Serialize and deserialize a binary tree.',
    ],
    quizQuestions: [
      {
        question: 'Which pattern is most appropriate for "find the longest subarray with sum ≤ k"?',
        options: ['Two pointers', 'Sliding window', 'Binary search', 'DP'],
        answer: 1,
        explanation: 'This is a variable-size sliding window problem: expand right, shrink left when sum exceeds k — O(n) solution.',
      },
      {
        question: 'Union-Find with path compression has what amortized time complexity per operation?',
        options: ['O(log n)', 'O(n)', 'Near O(1) (inverse Ackermann)', 'O(n log n)'],
        answer: 2,
        explanation: 'With path compression + union by rank, Union-Find operations are O(α(n)) — the inverse Ackermann function, practically constant for all real inputs.',
      },
    ],
    interviewQuestions: [
      'Walk me through all the algorithmic patterns you know and a canonical problem for each.',
      'How do you decide between a greedy and a DP approach?',
      'Design an algorithm to find the shortest path in a weighted graph with no negative weights.',
    ],
    summary: 'DSA interview success comes from pattern recognition. Master the 10-15 core patterns: two pointers, sliding window, BFS/DFS, binary search, DP, backtracking, greedy, heap, trie, union-find. Each pattern solves a family of problems — internalize the pattern, not just individual solutions.',
    nextTopic: undefined,
  },
]
