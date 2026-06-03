import type { TopicLesson } from '../_shared/types'

export const pythonLessons2: TopicLesson[] = [
  {
    id: 'python-while-loops',
    title: 'Python While Loops',
    intro: 'A while loop repeats a block of code as long as a condition remains True. It is used when you do not know in advance how many iterations are needed — such as reading input until the user types "quit", or processing data until a queue is empty.',
    whatIsIt: 'A while loop is a control-flow statement that executes a block repeatedly as long as its condition evaluates to True.',
    whyImportant: 'Many real programs need to keep running until a condition is met — network retries, game loops, reading data streams — all use while loops.',
    simpleExplanation: 'A while loop is like a vending machine: keep asking "Got coins? Enough? No? Ask again." Only when the condition flips to False does it stop.',
    detailedExplanation: `The while loop syntax: "while condition:" followed by an indented block. The condition is checked before every iteration. If the condition is False from the start, the body never executes.

break exits the loop immediately, regardless of the condition. continue skips the rest of the current iteration and goes back to the condition check. else on a while loop executes once when the condition becomes False — but NOT if the loop was exited via break.

Infinite loops (while True:) are intentional in server programs and game loops that should run forever. They always contain a break or return somewhere inside. A loop without a way to exit is a bug that freezes the program.

The loop variable must change inside the loop — otherwise the condition never becomes False. Common pattern: start a counter at 0, increment with += 1, check against a limit.`,
    realWorldExample: 'A web scraper uses a while loop to keep fetching the next page of results (while next_page_url: ...) until there are no more pages to load.',
    syntaxBlock: `while condition:
    # body
    # must modify something that affects condition

while True:       # infinite loop
    action()
    if done:
        break

for ... else:     # else runs if loop completes without break
    pass
else:
    print("loop finished normally")`,
    codeExamples: [
      {
        title: 'While Loop Patterns',
        language: 'python',
        code: `# Basic counter loop
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1

# Input validation loop
def get_positive_number():
    while True:
        try:
            n = int(input("Enter a positive number: "))
            if n > 0:
                return n
            print("Must be positive, try again.")
        except ValueError:
            print("Not a number, try again.")

# Binary search (while-based)
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

arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))   # 3
print(binary_search(arr, 6))   # -1

# while-else
n = 10
while n > 0:
    n -= 3
else:
    print(f"Loop ended, n = {n}")  # runs because no break`,
        output: `Count: 0
Count: 1
Count: 2
Count: 3
Count: 4
3
-1
Loop ended, n = -2`,
        explanation: `count += 1 inside the loop prevents an infinite loop by changing what the condition checks.
while True with a conditional break is the standard pattern for input validation and server loops.
Binary search uses while lo <= hi — shrinking the search window each iteration.
The else clause on while runs when the condition becomes False, not on break — useful for search loops.`,
      },
    ],
    commonMistakes: [
      'Forgetting to update the loop variable — causes an infinite loop that freezes the program',
      'Off-by-one errors: while count < n vs while count <= n',
      'Using while when a for loop is more appropriate — if you know the number of iterations, use for',
    ],
    bestPractices: [
      'Prefer for loops when iterating a known sequence — while is for "keep going until" logic',
      'Add a maximum iteration limit to retry loops to prevent infinite hangs',
      'Keep the loop body focused — extract complex logic into helper functions',
    ],
    exercises: [
      'Write a while loop that prints all powers of 2 that are less than 1000.',
      'Implement a number-guessing game: pick a random number 1-100, use a while loop to accept guesses until correct, counting attempts.',
      'Use a while loop to reverse a string character by character (without using [::-1]).',
    ],
    quizQuestions: [
      {
        question: 'When does the else clause of a while loop execute?',
        options: ['Always, when the loop ends', 'Only when the loop ends via break', 'When the condition is False and no break was hit', 'Never — while loops do not have else'],
        answer: 2,
        explanation: 'The else clause runs when the while condition becomes False naturally. If the loop exits via break, the else block is skipped.',
      },
      {
        question: 'What is wrong with: while count < 10: print(count)?',
        options: ['Missing colon', 'print() has wrong syntax', 'count is never incremented — infinite loop', 'while cannot use <'],
        answer: 2,
        explanation: 'If count is never incremented inside the loop, the condition (count < 10) will always be True and the loop runs forever.',
      },
    ],
    interviewQuestions: [
      'When should you use a while loop instead of a for loop?',
      'Explain the while-else construct and give a practical use case.',
      'How would you implement a retry mechanism with exponential backoff using a while loop?',
    ],
    summary: 'While loops repeat while a condition is True. Always ensure the condition can become False. Use break to exit early, continue to skip iterations, and the else clause to detect natural loop completion vs break.',
    nextTopic: 'Python For Loops',
  },

  {
    id: 'python-for-loops',
    title: 'Python For Loops',
    intro: 'Python\'s for loop iterates over any iterable — lists, strings, tuples, dicts, files, generators, and more. It is one of the most-used constructs in Python and far more powerful than the C-style index-based for loop.',
    whatIsIt: 'A Python for loop iterates over each item in an iterable, binding each item to a loop variable and executing the loop body once per item.',
    whyImportant: 'For loops are how you process every item in a collection — reading CSV rows, processing API responses, building aggregations, and transforming data.',
    simpleExplanation: 'A for loop is like a conveyor belt: each item slides by one at a time, you do something with it, and then the next item comes.',
    detailedExplanation: `Python's for loop works with any iterable — any object that implements the iterator protocol. This includes lists, tuples, strings, sets, dicts, files, range(), enumerate(), zip(), map(), filter(), and generator expressions.

range(stop), range(start, stop), range(start, stop, step) generate integer sequences without creating a list in memory.

enumerate(iterable) yields (index, value) pairs — use it instead of range(len(iterable)) when you need both index and value.

zip(a, b) combines two iterables into pairs — use it to iterate over two related sequences in parallel.

Nested for loops iterate over 2D structures like matrices or lists of lists. Be careful with O(n²) complexity.

for-else: the else block runs if the loop completes without hitting break. Useful for search loops: if you find what you were looking for, break; if the loop finishes without finding it, else runs.

List, dict, and set comprehensions are powered by for loops under the hood and are the preferred way to transform iterables.`,
    realWorldExample: 'A data analyst iterates over a CSV file row by row (for row in csv_reader:), processes each row, and builds a summary dict — all using a single for loop.',
    codeExamples: [
      {
        title: 'For Loop Patterns',
        language: 'python',
        code: `# Basic iteration
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit.upper())

# range() — generate integers
for i in range(5):          # 0,1,2,3,4
    print(i, end=" ")
print()

for i in range(2, 10, 2):  # 2,4,6,8
    print(i, end=" ")
print()

# enumerate — index + value
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")

# zip — iterate two lists together
names  = ["Alice", "Bob", "Charlie"]
scores = [92, 87, 95]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# Iterating dict
student = {"name": "Alice", "age": 20, "gpa": 3.9}
for key, value in student.items():
    print(f"  {key}: {value}")

# for-else (search pattern)
def find_first_even(numbers):
    for n in numbers:
        if n % 2 == 0:
            print(f"Found even: {n}")
            break
    else:
        print("No even number found")

find_first_even([1, 3, 5, 7, 8])
find_first_even([1, 3, 5, 7, 9])

# Nested loops — multiplication table
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i*j:3}", end="")
    print()`,
        output: `APPLE
BANANA
CHERRY
0 1 2 3 4
2 4 6 8
1. apple
2. banana
3. cherry
Alice: 92
Bob: 87
Charlie: 95
  name: Alice
  age: 20
  gpa: 3.9
Found even: 8
No even number found
  1  2  3
  2  4  6
  3  6  9`,
        explanation: `range() generates numbers on demand — memory-efficient even for range(10**9).
enumerate(fruits, start=1) yields (1, "apple"), (2, "banana") — avoid range(len()) for index+value.
zip(names, scores) pairs corresponding elements — stops at the shortest iterable.
dict.items() yields (key, value) tuples — the standard way to iterate a dict.
for-else: else runs only if no break was hit — clean pattern for "did I find it?" searches.`,
      },
    ],
    commonMistakes: [
      'Modifying a list while iterating over it — iterate over a copy: for item in items[:]:',
      'Using range(len(items)) when enumerate(items) is cleaner and more Pythonic',
      'Nested loops causing O(n²) complexity — consider dict lookups or sets for better performance',
    ],
    bestPractices: [
      'Use enumerate() instead of range(len()) for index + value iteration',
      'Use zip() to iterate two related sequences — cleaner than index-based access',
      'Use comprehensions for simple transformations instead of a for loop + append',
    ],
    exercises: [
      'Use zip() to create a dict from two parallel lists of keys and values in one line.',
      'Write a nested loop that prints a 10×10 multiplication table.',
      'Use for-else to search a list for the first prime number, printing "None found" if no prime exists.',
    ],
    quizQuestions: [
      {
        question: 'What does enumerate(["a","b","c"], start=1) yield?',
        options: ['(0,"a"),(1,"b"),(2,"c")', '(1,"a"),(2,"b"),(3,"c")', '["a","b","c"]', '"a","b","c"'],
        answer: 1,
        explanation: 'enumerate() yields (index, value) pairs. With start=1, indices begin at 1 instead of 0.',
      },
      {
        question: 'What does zip([1,2,3], ["a","b"]) produce?',
        options: ['[(1,"a"),(2,"b"),(3,None)]', '[(1,"a"),(2,"b")]', 'ValueError', '[(1,"a"),(2,"b"),(3,"")]'],
        answer: 1,
        explanation: 'zip() stops at the shortest iterable. With lists of lengths 3 and 2, only 2 pairs are produced.',
      },
    ],
    interviewQuestions: [
      'What is the difference between range() and list() in terms of memory efficiency?',
      'Explain the for-else construct with a practical example.',
      'How would you flatten a list of lists [[1,2],[3,4],[5,6]] into [1,2,3,4,5,6] using a for loop and then using a comprehension?',
    ],
    summary: 'Python for loops iterate over any iterable. Use range() for counted loops, enumerate() for index+value, zip() for parallel iteration, and items() for dicts. The for-else pattern elegantly handles search results.',
    nextTopic: 'Python Functions',
  },

  {
    id: 'python-functions',
    title: 'Python Functions',
    intro: 'Functions are named, reusable blocks of code that perform a specific task. They are the fundamental unit of code organization in Python, enabling reuse, testing, and abstraction. Python functions are first-class objects — they can be passed as arguments, returned from other functions, and stored in variables.',
    whatIsIt: 'A Python function is a named block of code defined with def, that takes optional parameters and optionally returns a value.',
    whyImportant: 'Functions eliminate code duplication, make programs testable, and allow large programs to be broken into manageable pieces.',
    simpleExplanation: 'A function is like a recipe card. You write it once with placeholder ingredient names (parameters), then use it as many times as you want with different actual ingredients (arguments).',
    detailedExplanation: `Functions are defined with def name(parameters): followed by an indented body. The return statement sends a value back to the caller. A function without return implicitly returns None.

Parameters: positional (required), keyword (name=value), default (def f(x, y=10)), *args (variable positional), **kwargs (variable keyword). Order must be: positional, default, *args, keyword-only, **kwargs.

Python functions are first-class objects: they can be assigned to variables, passed as arguments to other functions (callbacks, decorators, map/filter), returned from functions (closures, factories), and stored in dicts.

Docstrings document function behavior and are accessible via help() and IDEs.

Type hints (def greet(name: str) -> str:) annotate parameter and return types without enforcing them at runtime — they improve IDE support and are checked by tools like mypy.

Scope: variables defined inside a function are local. To modify a global variable inside a function, declare it with global. To modify an enclosing function's variable, use nonlocal.`,
    realWorldExample: 'A web framework routes HTTP requests to handler functions: @app.route("/users/<id>") def get_user(id): return fetch_user(id). The function is the unit that maps a URL to behavior.',
    syntaxBlock: `def function_name(param1, param2, default_param=value, *args, **kwargs):
    """Docstring."""
    # body
    return result

# Type hints
def greet(name: str, formal: bool = False) -> str:
    return f"Good day, {name}" if formal else f"Hello, {name}"`,
    codeExamples: [
      {
        title: 'Functions — All Parameter Types',
        language: 'python',
        code: `# Basic function with docstring and type hints
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Return Body Mass Index given weight and height."""
    return weight_kg / (height_m ** 2)

print(f"BMI: {calculate_bmi(70, 1.75):.1f}")

# Default parameters
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

print(greet("Alice"))              # uses default greeting
print(greet("Bob", "Good day"))    # override default

# *args — variable positional arguments
def total(*numbers):
    return sum(numbers)

print(total(1, 2, 3))          # 6
print(total(10, 20, 30, 40))   # 100

# **kwargs — variable keyword arguments
def build_profile(**fields):
    return {k: v for k, v in fields.items()}

profile = build_profile(name="Alice", role="admin", active=True)
print(profile)

# Functions as first-class objects
def apply(func, values):
    return [func(v) for v in values]

result = apply(str.upper, ["hello", "world"])
print(result)

# Closure — function remembering its enclosing scope
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # captures 'factor' from outer scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))   # 10, 15`,
        output: `BMI: 22.9
Hello, Alice!
Good day, Bob!
6
100
{'name': 'Alice', 'role': 'admin', 'active': True}
['HELLO', 'WORLD']
10 15`,
        explanation: `Type hints (weight_kg: float) improve IDE auto-complete and documentation but do not enforce types at runtime.
Default parameters must come after non-default parameters in the definition.
*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict.
Functions are first-class objects — apply(str.upper, ...) passes a method as an argument.
A closure (make_multiplier) captures variables from the enclosing scope after the outer function returns.`,
      },
    ],
    commonMistakes: [
      'Using a mutable default argument (def f(x, items=[])): shared across all calls — use None and create inside',
      'Forgetting that functions without return return None — assigning result = f() when f has no return gives None',
      'Modifying global variables from inside a function without the global keyword',
    ],
    bestPractices: [
      'Each function should do one thing and do it well (Single Responsibility Principle)',
      'Use None as default for mutable parameters: def f(items=None): items = items or []',
      'Add type hints and docstrings to all public functions',
    ],
    exercises: [
      'Write a function is_palindrome(s) that returns True if string s is the same forwards and backwards, ignoring case and spaces.',
      'Write a function memoize(func) that caches results of func — a simple decorator pattern.',
      'Write a variadic function stats(*numbers) that returns a dict with min, max, mean, and count.',
    ],
    quizQuestions: [
      {
        question: 'What does a Python function return if it has no return statement?',
        options: ['0', 'False', 'None', 'Raises an error'],
        answer: 2,
        explanation: 'A function without an explicit return statement implicitly returns None.',
      },
      {
        question: 'What is wrong with: def append_to(item, target=[])?',
        options: ['lists cannot be default arguments', 'The default list is shared across all calls — a mutable default bug', 'target should be *target', 'No issue with this code'],
        answer: 1,
        explanation: 'Default mutable arguments are created once and shared across all calls. If append_to modifies target, those changes persist into the next call. Use target=None and create a new list inside.',
      },
    ],
    interviewQuestions: [
      'Explain the mutable default argument bug in Python. How do you fix it?',
      'What is a closure in Python? Give a practical example.',
      'What is the difference between *args and **kwargs? When would you use each?',
    ],
    summary: 'Functions are Python\'s primary unit of reuse. Use default parameters, *args, **kwargs for flexibility. Functions are first-class objects. Closures capture enclosing scope. Always use None (not mutable objects) as default arguments.',
    nextTopic: 'Python Lambda',
  },

  {
    id: 'python-lambda',
    title: 'Python Lambda',
    intro: 'Lambda expressions create small anonymous functions in a single line. They are concise function literals used inline where a full def would be verbose — most commonly as arguments to higher-order functions like sorted(), map(), and filter().',
    whatIsIt: 'A lambda is an anonymous, single-expression function defined with the lambda keyword, taking any number of parameters and returning the expression value.',
    whyImportant: 'Lambdas make code more concise when passing simple transformations to functions like sorted, map, and filter — avoiding the need to define a named function for a one-off operation.',
    simpleExplanation: 'A lambda is a disposable, no-name function: write it, use it once, move on — like a sticky note vs writing a full document.',
    detailedExplanation: `Syntax: lambda parameters: expression. The body must be a single expression — no statements (no if-else blocks, for loops, or assignments). The result of the expression is automatically returned.

Lambdas are most useful as arguments to functions that take a callable: sorted(items, key=lambda x: x[1]), min(records, key=lambda r: r["score"]), filter(lambda x: x > 0, numbers), map(lambda x: x*2, numbers).

However, PEP 8 discourages assigning lambdas to variables (f = lambda x: x*2) — just write def f(x): return x*2. If you need to name a function, use def.

Lambdas can capture variables from the enclosing scope (like closures), but be careful with loop variables — use default argument tricks: lambda x, i=i: x+i to capture the current value of i.

For simple transforms, list comprehensions and generator expressions are often cleaner than map/filter with lambdas.`,
    realWorldExample: 'Sorting a list of employee dicts by salary: employees.sort(key=lambda emp: emp["salary"], reverse=True) — a lambda provides the sort key without needing a named function.',
    syntaxBlock: `lambda params: expression

# Equivalent to:
def name(params):
    return expression`,
    codeExamples: [
      {
        title: 'Lambda in Practice',
        language: 'python',
        code: `# Lambda as sort key
students = [
    {"name": "Alice", "gpa": 3.9},
    {"name": "Bob",   "gpa": 3.5},
    {"name": "Charlie", "gpa": 3.7},
]
students.sort(key=lambda s: s["gpa"], reverse=True)
for s in students:
    print(f"{s['name']}: {s['gpa']}")

# Lambda with map() — but comprehension is often cleaner
numbers = [1, 2, 3, 4, 5]
doubled_lambda = list(map(lambda x: x * 2, numbers))
doubled_comp   = [x * 2 for x in numbers]  # preferred
print(doubled_comp)

# Lambda with filter()
evens_lambda = list(filter(lambda x: x % 2 == 0, numbers))
evens_comp   = [x for x in numbers if x % 2 == 0]  # preferred
print(evens_comp)

# Lambda in sorted with multiple keys
data = [(3, "banana"), (1, "apple"), (2, "cherry"), (1, "apricot")]
# Sort by first element, then by second element
sorted_data = sorted(data, key=lambda t: (t[0], t[1]))
print(sorted_data)

# Lambda in a higher-order function
def transform(func, data):
    return [func(x) for x in data]

result = transform(lambda x: x.title(), ["hello world", "foo bar"])
print(result)`,
        output: `Alice: 3.9
Charlie: 3.7
Bob: 3.5
[2, 4, 6, 8, 10]
[2, 4]
[(1, 'apple'), (1, 'apricot'), (2, 'cherry'), (3, 'banana')]
['Hello World', 'Foo Bar']`,
        explanation: `Lambda as a sort key: sorted(key=lambda s: s["gpa"]) applies the lambda to each element to get its sort value.
map() with lambda applies a function to every item. A list comprehension does the same thing more readably.
filter() with lambda keeps only items where the lambda returns True.
Multi-key sort: return a tuple from the lambda — Python compares tuples element-by-element.`,
      },
    ],
    commonMistakes: [
      'Assigning a lambda to a variable (f = lambda x: x*2) — use def instead',
      'Writing complex multi-line logic in a lambda — lambdas are for simple single expressions only',
      'Lambda closure bug in loops: lambda i: i uses the final loop value, not the current one',
    ],
    bestPractices: [
      'Use lambda only as an inline argument to sort/map/filter — not for named functions',
      'Prefer list comprehensions over map/filter+lambda for simple transforms',
      'Use operator.itemgetter, operator.attrgetter instead of lambda for attribute/key access',
    ],
    exercises: [
      'Sort a list of tuples (name, age, score) by score descending, then by name ascending — use a single sorted() with a lambda.',
      'Use filter() with a lambda to extract all words longer than 5 characters from a sentence.',
      'Rewrite this lambda as a proper function: f = lambda x, y: x if x > y else y.',
    ],
    quizQuestions: [
      {
        question: 'What is the output of (lambda x, y: x + y)(3, 4)?',
        options: ['7', 'lambda', 'TypeError', '<function>'],
        answer: 0,
        explanation: '(lambda x, y: x + y) creates an anonymous function. Calling it immediately with (3, 4) passes x=3, y=4, returning 3+4=7.',
      },
      {
        question: 'Which is the preferred Pythonic way to double every number in a list?',
        options: ['list(map(lambda x: x*2, nums))', '[x*2 for x in nums]', 'filter(lambda x: x*2, nums)', 'reduce(lambda a,b: a+b, nums)'],
        answer: 1,
        explanation: '[x*2 for x in nums] is the Pythonic list comprehension. It is more readable than map+lambda and is generally preferred in Python code.',
      },
    ],
    interviewQuestions: [
      'What is a lambda function in Python? When should you use lambda vs def?',
      'What is the lambda variable capture problem in loops, and how do you fix it?',
      'Compare map/filter with lambda vs list/generator comprehensions — when would you prefer each?',
    ],
    summary: 'Lambdas are single-expression anonymous functions best used as inline arguments to sort/map/filter. For anything more complex or reusable, use def. Prefer list comprehensions over map/filter+lambda for clarity.',
    nextTopic: 'Python Arrays',
  },

  {
    id: 'python-arrays',
    title: 'Python Arrays',
    intro: 'Python\'s built-in list is used for most array-like tasks. For high-performance numerical arrays, the array module provides a typed, compact array, while NumPy\'s ndarray offers the full power of multidimensional, vectorized arrays used in data science.',
    whatIsIt: 'A Python array is a contiguous block of typed memory elements. The built-in array module provides typed 1D arrays; NumPy provides n-dimensional vectorized arrays.',
    whyImportant: 'When processing millions of numerical values, typed arrays use far less memory and compute much faster than Python lists thanks to contiguous memory and C-level operations.',
    simpleExplanation: 'A Python list is a mixed grocery bag — any item type, flexible. An array is a row of identical numbered bins — all the same type, faster to access, more memory-efficient.',
    detailedExplanation: `Python lists can hold mixed types but store pointers to objects, using more memory. The array module creates typed arrays (typecode 'i' for int, 'd' for double, 'b' for byte) that store actual values contiguously.

For scientific computing, NumPy arrays (ndarray) are the standard. NumPy arrays: are typed and contiguous, support element-wise operations without loops (vectorization), support broadcasting (operating on arrays of different shapes), and include hundreds of mathematical functions.

NumPy array creation: np.array([1,2,3]), np.zeros(shape), np.ones(shape), np.arange(start, stop, step), np.linspace(start, stop, n), np.random.rand(shape).

Indexing: arr[0], arr[-1], arr[1:4], arr[::2], arr[arr > 5] (boolean indexing), arr[[0,2,4]] (fancy indexing).

The key performance difference: a Python loop over 1 million numbers takes ~0.1 seconds; NumPy vectorized operation takes ~0.001 seconds (100x faster) because it executes compiled C code.`,
    realWorldExample: 'A machine learning model training process uses NumPy arrays to hold a dataset of 100,000 samples × 200 features. Matrix multiplications for forward/backward passes run in milliseconds using NumPy\'s BLAS-backed operations.',
    codeExamples: [
      {
        title: 'array module and NumPy arrays',
        language: 'python',
        code: `import array
import numpy as np

# Built-in array module — typed, compact
int_arr = array.array('i', [1, 2, 3, 4, 5])  # 'i' = signed int
print(int_arr)
print(int_arr[2])   # access by index
int_arr.append(6)
print(int_arr.tolist())

# NumPy ndarray — the scientific standard
a = np.array([1, 2, 3, 4, 5])
print(a.dtype)      # int64
print(a.shape)      # (5,)

# Vectorized operations (no loops needed!)
print(a * 2)         # [2 4 6 8 10]
print(a ** 2)        # [1 4 9 16 25]
print(a + a)         # [2 4 6 8 10]

# 2D array (matrix)
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])
print(matrix.shape)  # (3, 3)
print(matrix[1, 2])  # 6 (row 1, col 2)
print(matrix[:, 1])  # [2 5 8] (all rows, col 1)

# Useful array creation
zeros  = np.zeros((3, 4))    # 3x4 matrix of zeros
eye    = np.eye(3)           # 3x3 identity matrix
rng    = np.arange(0, 10, 2) # [0 2 4 6 8]

# Boolean indexing
big = a[a > 3]   # [4 5] — elements > 3
print(big)

# Statistics
print(a.mean(), a.std(), a.sum())`,
        output: `array('i', [1, 2, 3, 4, 5])
3
[1, 2, 3, 4, 5, 6]
int64
(5,)
[ 2  4  6  8 10]
[ 1  4  9 16 25]
[ 2  4  6  8 10]
(3, 3)
6
[2 5 8]
[4 5]
3.0 1.4142135623730951 15`,
        explanation: `array.array('i', ...) creates a typed compact array — all elements must be the same type ('i' = int).
NumPy arrays support vectorized math: a * 2 multiplies every element at C speed, no Python loop needed.
2D arrays use [row, col] indexing. matrix[:, 1] means "all rows, column 1".
Boolean indexing a[a > 3] creates a new array of only elements satisfying the condition.`,
      },
    ],
    commonMistakes: [
      'Using a Python list when you need NumPy performance — lists are 5-100x slower for numerical operations',
      'Forgetting that NumPy slices return VIEWS (not copies) — modifying a slice modifies the original',
      'Mixing Python lists and NumPy arrays in operations — convert with np.array() first',
    ],
    bestPractices: [
      'Use NumPy arrays for any numerical computation involving many elements',
      'Prefer vectorized NumPy operations over Python loops for performance',
      'Use arr.copy() to get an independent copy of a NumPy array slice',
    ],
    exercises: [
      'Create a NumPy array of 100 evenly spaced values between 0 and 2π, compute sin of each, and find the index of the maximum value.',
      'Create a 5×5 matrix, compute its transpose and matrix multiplication with itself using NumPy.',
      'Filter a 1D NumPy array to keep only values in the range [10, 50] using boolean indexing.',
    ],
    quizQuestions: [
      {
        question: 'What is the key advantage of NumPy arrays over Python lists for numerical computation?',
        options: ['NumPy arrays can hold mixed types', 'NumPy arrays support vectorized C-speed operations and contiguous memory', 'NumPy arrays have built-in sort()', 'NumPy arrays are always sorted'],
        answer: 1,
        explanation: 'NumPy arrays store typed values contiguously in memory and operations are implemented in C/Fortran. This gives 10-100x speedups over Python loops on lists.',
      },
      {
        question: 'What does np.zeros((3, 4)) create?',
        options: ['A 1D array of 12 zeros', 'A 3×4 matrix of zeros', 'A list of 3 zeros and 4 zeros', 'A 3D array'],
        answer: 1,
        explanation: 'np.zeros(shape) creates an array of zeros with the given shape. (3, 4) means 3 rows and 4 columns — a 3×4 matrix.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a Python list and a NumPy array? When would you use each?',
      'Explain NumPy broadcasting — what does it allow and why is it useful?',
      'What is the difference between a NumPy view and a copy? Why does it matter?',
    ],
    summary: 'Python lists are flexible mixed-type sequences. The array module provides typed compact arrays. NumPy ndarray adds vectorized operations, broadcasting, and C-speed math. Use NumPy for all numerical work involving more than a few hundred values.',
    nextTopic: 'Python Classes and Objects',
  },

  {
    id: 'python-classes',
    title: 'Python Classes and Objects',
    intro: 'Object-oriented programming (OOP) in Python is built around classes and objects. A class is a blueprint for creating objects that bundle data (attributes) and behavior (methods) together. OOP enables you to model real-world entities as code structures.',
    whatIsIt: 'A class is a user-defined blueprint that defines attributes and methods. An object (instance) is a specific realization of that blueprint with its own attribute values.',
    whyImportant: 'OOP organizes complex programs by grouping related data and functions into self-contained objects — enabling code reuse, maintainability, and real-world modeling.',
    simpleExplanation: 'A class is like a cookie cutter — it defines the shape. Each cookie (object) you make with it is independent, with its own particular filling (attribute values).',
    detailedExplanation: `A class is defined with the class keyword. The __init__ method is the constructor — called when a new object is created. self is a reference to the specific instance being operated on.

Instance attributes are set in __init__ (self.name = name). Class attributes are shared across all instances (defined outside __init__).

Methods are functions inside the class that take self as the first argument. Class methods use @classmethod and take cls. Static methods use @staticmethod and take neither self nor cls.

Python supports special (dunder/magic) methods: __str__ (string representation), __repr__ (developer repr), __len__, __eq__, __lt__, __add__, __getitem__ — these let your objects work with built-in Python operations.

Properties (@property) let you define computed attributes with getter/setter/deleter logic while keeping the attribute-access syntax.

Object comparisons: objects are equal (==) only if __eq__ says so. By default, == tests identity (same as is). Always implement __eq__ when value-equality matters for your class.`,
    realWorldExample: 'A bank application models accounts as objects: BankAccount class has attributes balance and owner, methods deposit() and withdraw(), and validation logic inside each method to prevent overdrafts.',
    codeExamples: [
      {
        title: 'Classes, Methods, Properties, and Dunder Methods',
        language: 'python',
        code: `class BankAccount:
    """A simple bank account model."""

    # Class attribute (shared by all instances)
    interest_rate = 0.05

    def __init__(self, owner: str, balance: float = 0):
        # Instance attributes (unique per object)
        self.owner = owner
        self._balance = balance      # leading _ = convention for "private"

    # Property: access like an attribute but with logic
    @property
    def balance(self):
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount

    def apply_interest(self) -> None:
        self._balance *= (1 + self.interest_rate)

    # Dunder methods
    def __str__(self) -> str:
        return f"Account[{self.owner}]: \${self._balance:.2f}"

    def __repr__(self) -> str:
        return f"BankAccount('{self.owner}', {self._balance})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, BankAccount):
            return NotImplemented
        return self.owner == other.owner and self._balance == other._balance


# Creating objects
alice = BankAccount("Alice", 1000)
bob   = BankAccount("Bob")

alice.deposit(500)
alice.withdraw(200)
alice.apply_interest()

print(alice)               # calls __str__
print(repr(alice))         # calls __repr__
print(alice.balance)       # calls the @property
print(BankAccount.interest_rate)  # class attribute`,
        output: `Account[Alice]: $1365.00
BankAccount('Alice', 1365.0)
1365.0
0.05`,
        explanation: `__init__ is the constructor — it runs automatically when you create an object.
self refers to the specific instance — each object has its own copy of instance attributes.
@property turns a method into an attribute-style access: alice.balance instead of alice.get_balance().
__str__ controls what print(obj) shows. __repr__ controls what the REPL shows.
_balance with a leading underscore is a convention for "intended private" — Python doesn't enforce access control.`,
      },
    ],
    commonMistakes: [
      'Forgetting self in method signatures — causes TypeError: takes 0 positional arguments but 1 was given',
      'Confusing class attributes with instance attributes — class attributes are shared, instance are per-object',
      'Not implementing __eq__ when objects should be equal by value',
    ],
    bestPractices: [
      'Prefix "private" attributes with _ (single underscore) as a convention',
      'Implement __str__ for user-facing string representation and __repr__ for debugging',
      'Use @property instead of getter/setter methods for Pythonic attribute access',
    ],
    exercises: [
      'Build a Student class with name, grades (list), and methods: add_grade(g), average(), and letter_grade() returning A/B/C/D/F.',
      'Implement a Vector2D class with x, y attributes and __add__, __mul__ (scalar), __abs__ (magnitude), and __str__ methods.',
      'Create a temperature class that stores in Celsius and provides Fahrenheit and Kelvin as @property values.',
    ],
    quizQuestions: [
      {
        question: 'What is the purpose of the __init__ method?',
        options: ['It is called when the program starts', 'It is the constructor — initializes a new object\'s attributes', 'It imports required modules', 'It defines class-level variables'],
        answer: 1,
        explanation: '__init__ is Python\'s constructor method. It is automatically called when you create a new instance (obj = MyClass()), and is used to initialize the object\'s attributes.',
      },
      {
        question: 'What does @property allow you to do?',
        options: ['Mark a method as private', 'Access a method like an attribute without parentheses', 'Create a class method', 'Prevent method overriding'],
        answer: 1,
        explanation: '@property turns a method into an attribute-style access. obj.balance instead of obj.balance() — the method runs but the caller uses attribute syntax.',
      },
    ],
    interviewQuestions: [
      'Explain the four pillars of OOP (encapsulation, inheritance, polymorphism, abstraction) with Python examples.',
      'What is the difference between a class method, an instance method, and a static method?',
      'Explain Python\'s dunder (magic) methods. Name five and describe their use cases.',
    ],
    summary: 'Classes bundle data (attributes) and behavior (methods) into objects. __init__ initializes instances. self refers to the current instance. Use @property for computed attributes and dunder methods to integrate with Python\'s built-in operations.',
    nextTopic: 'Python Inheritance',
  },

  {
    id: 'python-inheritance',
    title: 'Python Inheritance',
    intro: 'Inheritance lets a class (subclass) reuse and extend the behavior of another class (base class). It models "is-a" relationships: a Dog is an Animal, a Circle is a Shape. Python supports single, multiple, and multilevel inheritance.',
    whatIsIt: 'Inheritance is an OOP mechanism where a subclass automatically gets all the attributes and methods of its parent class, and can add or override them.',
    whyImportant: 'Inheritance eliminates code duplication by sharing common behavior in a base class while allowing specialized subclasses to customize only what differs.',
    simpleExplanation: 'Inheritance is like a family: children inherit traits from parents. A child has everything the parent has plus their own unique qualities.',
    detailedExplanation: `Define a subclass by listing the parent in parentheses: class Dog(Animal):. The subclass inherits all methods and attributes of Animal. Use super() to call the parent class\'s __init__ or methods.

Method overriding: define a method in the subclass with the same name as in the parent. The subclass version takes precedence. Call super().method() to also run the parent's version.

Multiple inheritance: class C(A, B): inherits from both A and B. Python uses MRO (Method Resolution Order, C3 linearization) to determine which parent's method runs when both define the same method. View MRO with MyClass.__mro__ or MyClass.mro().

Abstract base classes (from abc module): define interfaces that subclasses must implement. An abstract method decorated with @abstractmethod cannot be instantiated directly — subclasses must implement it. This enforces a contract.

isinstance(obj, Class) checks if obj is an instance of Class or any of its subclasses. issubclass(ChildClass, ParentClass) checks the class hierarchy.`,
    realWorldExample: 'Django\'s Model class is the base class for all database models. Every model you define (class User(models.Model):) inherits database save(), delete(), filter() methods from the parent — you only define the specific fields.',
    codeExamples: [
      {
        title: 'Inheritance, super(), and Abstract Classes',
        language: 'python',
        code: `from abc import ABC, abstractmethod
import math

# Abstract base class
class Shape(ABC):
    def __init__(self, color="black"):
        self.color = color

    @abstractmethod
    def area(self) -> float:
        """Must be implemented by subclasses."""

    @abstractmethod
    def perimeter(self) -> float:
        """Must be implemented by subclasses."""

    def describe(self) -> str:
        return (f"{type(self).__name__} | Color: {self.color} | "
                f"Area: {self.area():.2f} | Perimeter: {self.perimeter():.2f}")

class Circle(Shape):
    def __init__(self, radius: float, color="black"):
        super().__init__(color)      # call parent __init__
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width, height, color="black"):
        super().__init__(color)
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

# Polymorphic usage
shapes = [Circle(5, "red"), Rectangle(4, 6, "blue"), Circle(3)]
for shape in shapes:
    print(shape.describe())

# Type checks
print(isinstance(shapes[0], Circle))  # True
print(isinstance(shapes[0], Shape))   # True (parent class!)
print(issubclass(Rectangle, Shape))   # True`,
        output: `Circle | Color: red | Area: 78.54 | Perimeter: 31.42
Rectangle | Color: blue | Area: 24.00 | Perimeter: 20.00
Circle | Color: black | Area: 28.27 | Perimeter: 18.85
True
True
True`,
        explanation: `ABC makes Shape abstract — you cannot create Shape() directly, only subclasses.
@abstractmethod forces every subclass to implement area() and perimeter() — a compile-time contract.
super().__init__(color) calls the parent class constructor — always do this in subclasses.
Polymorphism: shape.describe() calls the right area() for each object's actual type.
isinstance(obj, ParentClass) returns True even for subclass instances.`,
      },
    ],
    commonMistakes: [
      'Forgetting to call super().__init__() in a subclass — parent attributes will not be initialized',
      'Diamond inheritance problems with multiple inheritance — understand MRO to avoid unexpected behavior',
      'Overriding a method but forgetting to call super() when the parent version must also run',
    ],
    bestPractices: [
      'Prefer composition over inheritance for "has-a" relationships (a Car has-a Engine, not is-a Engine)',
      'Always call super().__init__() unless you have a specific reason not to',
      'Use abstract base classes to define clear interfaces for your class hierarchy',
    ],
    exercises: [
      'Create an Animal base class with name and sound attributes, and a speak() method. Create Dog, Cat, and Cow subclasses that override speak().',
      'Build a shape hierarchy with a base Shape class and Triangle, Square, Circle subclasses, all implementing area() and perimeter().',
      'Implement a simple Employee hierarchy: Employee (base) → Manager and Developer, where Manager adds manage_count and Developer adds programming_language.',
    ],
    quizQuestions: [
      {
        question: 'What does super().__init__() do in a subclass?',
        options: ['Creates a superclass instance', 'Calls the parent class\'s __init__ to initialize inherited attributes', 'Replaces the parent\'s constructor', 'Imports the parent class'],
        answer: 1,
        explanation: 'super().__init__() calls the parent class\'s constructor, ensuring that inherited attributes are properly initialized before the subclass adds its own.',
      },
      {
        question: 'What happens if you try to instantiate an abstract class with an unimplemented abstract method?',
        options: ['Nothing — Python ignores it', 'TypeError is raised', 'The abstract method returns None', 'A warning is printed'],
        answer: 1,
        explanation: 'Attempting to instantiate a class with unimplemented abstract methods raises a TypeError: "Can\'t instantiate abstract class X with abstract methods y".',
      },
    ],
    interviewQuestions: [
      'Explain Python\'s Method Resolution Order (MRO) in the context of multiple inheritance.',
      'What is the difference between @abstractmethod and a regular method override?',
      'When should you use composition instead of inheritance?',
    ],
    summary: 'Inheritance lets subclasses reuse and extend parent class behavior. Use super() to call parent methods. Abstract base classes enforce interface contracts. Prefer composition over inheritance for "has-a" relationships.',
    nextTopic: 'Python Iterators',
  },

  {
    id: 'python-scope',
    title: 'Python Scope',
    intro: 'Scope determines where in your code a variable is accessible. Python uses the LEGB rule to look up names: Local, Enclosing, Global, Built-in. Understanding scope prevents bugs from accidental variable shadowing and global state mutation.',
    whatIsIt: 'Scope is the region of code where a variable name is visible and accessible. Python uses LEGB (Local → Enclosing → Global → Built-in) as its name lookup order.',
    whyImportant: 'Scope bugs — using the wrong variable or accidentally modifying a global — are among the most confusing Python bugs. Understanding LEGB prevents them.',
    simpleExplanation: 'Scope is like a set of nested boxes. Python first looks in the innermost box (local function), then the next box out (enclosing function), then the outer box (module level), then the warehouse (Python built-ins).',
    detailedExplanation: `LEGB rule: when Python resolves a name, it searches these scopes in order — stopping at the first match:
L — Local: variables defined in the current function.
E — Enclosing: variables in any enclosing function (for nested functions/closures).
G — Global: module-level variables.
B — Built-in: Python's built-in names (len, print, int, etc.).

The global keyword declares that an assignment inside a function should affect the global variable, not create a local one. The nonlocal keyword does the same for the enclosing function's scope.

Without global or nonlocal, assignment inside a function always creates a local variable, even if a global with the same name exists. This can cause an UnboundLocalError if you read the variable before assigning it.

Best practice: avoid global state. Pass data as function parameters and return results. Use global only for module-level constants or simple flags.`,
    realWorldExample: 'A game uses a global score variable. Without the global keyword inside the update_score() function, the assignment would create a local variable and the global score would never change — a classic silent bug.',
    codeExamples: [
      {
        title: 'LEGB Scope and global/nonlocal',
        language: 'python',
        code: `# LEGB demonstration
x = "global"          # G — module-level

def outer():
    x = "enclosing"   # E — enclosing scope

    def inner():
        x = "local"   # L — local scope
        print(x)      # finds local first

    inner()
    print(x)          # finds enclosing

outer()
print(x)              # finds global

# global keyword
count = 0

def increment():
    global count      # refer to global count
    count += 1

increment()
increment()
print(count)   # 2

# nonlocal keyword
def make_counter():
    n = 0
    def counter():
        nonlocal n    # refer to enclosing n
        n += 1
        return n
    return counter

c = make_counter()
print(c(), c(), c())  # 1 2 3

# UnboundLocalError trap
total = 100
def bad_function():
    # total += 1  # ERROR: reads total before local assignment
    pass          # Python sees assignment -> treats total as local

# Common pattern: use function params instead of globals
def process(data, max_items=100):
    result = []
    for item in data[:max_items]:
        result.append(item * 2)
    return result`,
        output: `local
enclosing
global
2
1 2 3`,
        explanation: `Python looks up names in L→E→G→B order — always finding the most local version first.
global count tells Python to use the module-level count, not create a local one.
nonlocal n tells Python to use the enclosing function's n instead of creating a new local.
The UnboundLocalError trap: if Python sees any assignment to a name in a function, it treats ALL references to that name as local — even reads before the assignment.`,
      },
    ],
    commonMistakes: [
      'Reading a variable before assigning it in the same function (UnboundLocalError)',
      'Overusing global variables — they create tight coupling and make testing difficult',
      'Shadowing a built-in name: list = [1,2,3] makes list() unusable in that scope',
    ],
    bestPractices: [
      'Avoid global mutable state — pass data through function parameters',
      'Never shadow built-in names (list, str, dict, id, type)',
      'Use closures or class attributes instead of nonlocal for complex state management',
    ],
    exercises: [
      'Predict and verify the output of a nested function with three levels: a global x="A", enclosing x="B", local x="C" — what does each print?',
      'Write a make_accumulator() factory that uses nonlocal to maintain a running total.',
      'Demonstrate the UnboundLocalError: try to read then increment a global inside a function without the global keyword.',
    ],
    quizQuestions: [
      {
        question: 'What order does Python use to look up a variable name?',
        options: ['Global → Local → Built-in', 'Local → Enclosing → Global → Built-in', 'Built-in → Global → Enclosing → Local', 'Local → Global → Enclosing → Built-in'],
        answer: 1,
        explanation: 'Python uses the LEGB rule: Local → Enclosing → Global → Built-in. It always starts with the most local scope and works outward.',
      },
      {
        question: 'What does the nonlocal keyword do?',
        options: ['Makes a variable globally accessible', 'Refers to a variable in the enclosing (outer) function\'s scope', 'Prevents a variable from being modified', 'Imports a variable from another module'],
        answer: 1,
        explanation: 'nonlocal tells Python that an assignment in a nested function should modify the variable in the nearest enclosing function scope, not create a new local variable.',
      },
    ],
    interviewQuestions: [
      'Explain the LEGB rule in Python with an example.',
      'What is an UnboundLocalError and what causes it?',
      'Why is global mutable state generally considered bad practice in Python?',
    ],
    summary: 'Python resolves names using LEGB: Local → Enclosing → Global → Built-in. Use global and nonlocal sparingly to modify outer scope variables. Prefer passing values as function parameters to avoid global state.',
    nextTopic: 'Python Modules',
  },

  {
    id: 'python-modules',
    title: 'Python Modules',
    intro: 'A module is a Python file containing functions, classes, and variables that can be imported and reused across programs. Python\'s Standard Library provides hundreds of modules for common tasks, and PyPI hosts over 400,000 third-party packages.',
    whatIsIt: 'A Python module is any .py file. A package is a directory containing modules and an __init__.py file. Together they provide Python\'s code organization and reuse system.',
    whyImportant: 'Modules prevent reinventing the wheel — Python\'s battery-included philosophy means most tasks have a standard library solution.',
    simpleExplanation: 'A module is like a toolbox — you don\'t carry every tool everywhere, but you know which toolbox has the screwdriver (import the module when you need it).',
    detailedExplanation: `Import forms: import module (use as module.func), from module import func (use as func directly), from module import func as alias (rename), from module import * (imports all public names — generally discouraged). Import the module, not individual symbols, to keep namespace clean.

Python module search order: 1) sys.modules cache, 2) built-in modules, 3) frozen modules, 4) sys.path directories (which includes the current directory, PYTHONPATH, and site-packages).

Key Standard Library modules: os (OS operations), sys (interpreter info), pathlib (path handling), json (JSON encode/decode), datetime (dates/times), re (regex), math (math functions), random (random numbers), collections (specialized data structures), itertools (iterator combinators), functools (function tools), logging (structured logging), unittest (testing), csv (CSV files), sqlite3 (SQLite database), http.server (simple HTTP server).

Packages: a directory with an __init__.py. The __init__.py can be empty or import specific symbols to control what from package import * exports (__all__).

Relative imports (from . import sibling, from .. import parent) work within packages. Absolute imports are preferred in all other cases.`,
    realWorldExample: 'A data pipeline imports json for parsing API responses, pathlib for file path manipulation, logging for structured logging, datetime for timestamping records, and csv for writing results — all from the standard library, no installation needed.',
    codeExamples: [
      {
        title: 'Modules and Standard Library',
        language: 'python',
        code: `import os
import sys
import json
import math
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import random

# os module
print(os.getcwd())              # current directory
print(os.environ.get("PATH", "not set")[:30])  # env variable

# pathlib — modern path handling
p = Path("data") / "output" / "results.json"
print(p)                        # data/output/results.json
print(p.suffix)                 # .json
print(p.parent)                 # data/output

# datetime
now = datetime.now()
tomorrow = now + timedelta(days=1)
print(now.strftime("%Y-%m-%d %H:%M"))
print(tomorrow.date())

# json
data = {"name": "Alice", "scores": [90, 87, 95], "active": True}
json_str = json.dumps(data, indent=2)
print(json_str)
parsed = json.loads(json_str)
print(parsed["name"])

# collections.Counter
text = "the quick brown fox jumps over the lazy dog"
word_count = Counter(text.split())
print(word_count.most_common(3))

# random
print(random.randint(1, 100))
items = list(range(10))
random.shuffle(items)
print(items[:5])`,
        output: `D:/Bluelearnerhub
/usr/local/sbin:/usr/local/bin
data/output/results.json
.json
data/output
2026-06-03 14:22
2026-06-04
{
  "name": "Alice",
  "scores": [90, 87, 95],
  "active": true
}
Alice
[('the', 2), ('quick', 1), ('brown', 1)]
73
[4, 7, 2, 9, 0]`,
        explanation: `pathlib.Path uses / operator for path joining — cross-platform and cleaner than os.path.join().
datetime arithmetic uses timedelta objects — add/subtract days, hours, seconds.
json.dumps() converts Python dicts to JSON strings; json.loads() parses JSON strings back to dicts.
Counter() automatically counts occurrences; most_common(n) returns the top-n items.`,
      },
    ],
    commonMistakes: [
      'Naming a file the same as a standard library module (math.py, os.py) — shadows the standard module',
      'Using from module import * — pollutes namespace and makes it unclear where names come from',
      'Circular imports — module A imports module B which imports module A',
    ],
    bestPractices: [
      'Import entire modules (import math) rather than individual names when clarity matters',
      'Group imports: standard library, blank line, third-party, blank line, local imports',
      'Check PyPI before writing utility code — there is likely already a tested package',
    ],
    exercises: [
      'Write a module utilities.py with functions for reading/writing JSON files, and import it from another script.',
      'Use pathlib to walk a directory tree and print all .py files.',
      'Use datetime to calculate how many days until January 1st of next year.',
    ],
    quizQuestions: [
      {
        question: 'What is the difference between import math and from math import sqrt?',
        options: ['No difference', 'import math loads the whole module; from math import sqrt loads only sqrt — both are available', 'from math import sqrt is faster', 'import math runs all functions in math'],
        answer: 1,
        explanation: 'import math binds the name math in your namespace. from math import sqrt binds only sqrt. Both load the whole math module into memory, but from math import sqrt lets you use sqrt directly without math. prefix.',
      },
      {
        question: 'Why should you avoid naming your file "random.py"?',
        options: ['Python does not allow files with library names', 'It shadows Python\'s standard library random module, making import random load your file instead', 'random.py is reserved for testing', 'random is a keyword'],
        answer: 1,
        explanation: 'Python searches the current directory before the standard library. A file named random.py in your project will shadow Python\'s random module, causing import random to load your file.',
      },
    ],
    interviewQuestions: [
      'Explain Python\'s module search order (sys.path).',
      'What is the difference between a module and a package in Python?',
      'What problems does circular import cause and how do you resolve it?',
    ],
    summary: 'Modules are .py files; packages are directories with __init__.py. Use import or from...import to access code. Python\'s Standard Library covers most common tasks. Group imports by category (stdlib, third-party, local) following PEP 8.',
    nextTopic: 'Python Try Except',
  },

  {
    id: 'python-try-except',
    title: 'Python Try Except',
    intro: 'Exception handling lets programs deal with errors gracefully instead of crashing. Python\'s try-except-else-finally structure catches exceptions, executes cleanup code, and allows programs to recover from unexpected conditions.',
    whatIsIt: 'Exception handling is a control-flow mechanism that intercepts runtime errors (exceptions) and lets the program respond to them instead of crashing.',
    whyImportant: 'Production code faces bad inputs, network failures, missing files, and edge cases constantly. Exception handling is what separates reliable software from fragile scripts.',
    simpleExplanation: 'Exception handling is like wearing a seatbelt: you hope you never need it, but when something goes wrong, it prevents a catastrophic crash.',
    detailedExplanation: `Python uses a try-except block. The try block contains code that might raise an exception. If an exception occurs, Python looks for a matching except clause. If found, that handler runs and execution continues normally after the try block. If no handler matches, the exception propagates up the call stack.

except ValueError: catches only ValueError. except (TypeError, ValueError): catches either. except Exception as e: catches any exception and binds it to e — you can inspect e for details. A bare except: catches absolutely everything including KeyboardInterrupt and SystemExit — avoid it.

else block: runs only if the try block completed without any exception. Useful to put code that should run only on success but doesn't need protection from exceptions itself.

finally block: always runs — whether an exception occurred or not. Used for cleanup: closing files, releasing locks, closing network connections.

Raising exceptions: raise ValueError("message") raises an exception. raise (without arguments) re-raises the current exception. raise ExceptionType(msg) from original_exception chains exceptions.

Custom exceptions: define a class inheriting from Exception (or a subclass) for domain-specific errors.`,
    realWorldExample: 'A web API call uses try-except to handle: ConnectionError (network down), TimeoutError (too slow), json.JSONDecodeError (invalid response), and KeyError (missing expected field) — each with a specific error message and fallback behavior.',
    syntaxBlock: `try:
    risky_operation()
except SpecificError as e:
    handle_error(e)
except (TypeError, ValueError):
    handle_type_or_value_error()
else:
    # runs only if no exception
    success_logic()
finally:
    # always runs
    cleanup()`,
    codeExamples: [
      {
        title: 'Exception Handling Patterns',
        language: 'python',
        code: `import json

# Basic try-except
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return None
    else:
        return result   # only if no exception
    # finally would go here for cleanup

print(divide(10, 2))   # 5.0
print(divide(10, 0))   # None

# Catching multiple exception types
def safe_parse(text):
    try:
        data = json.loads(text)
        value = data["result"]
        return int(value)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
    except KeyError:
        print("Missing 'result' key")
    except (TypeError, ValueError) as e:
        print(f"Type error: {e}")
    return None

print(safe_parse('{"result": "42"}'))  # 42
print(safe_parse('not json'))          # Invalid JSON
print(safe_parse('{"other": 1}'))      # Missing key

# Custom exception
class InsufficientFundsError(Exception):
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(
            f"Cannot withdraw \${amount:.2f}: balance is \${balance:.2f}"
        )

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(amount, balance)
    return balance - amount

try:
    new_balance = withdraw(100, 150)
except InsufficientFundsError as e:
    print(e)

# finally for cleanup
def read_file(path):
    f = None
    try:
        f = open(path, "r")
        return f.read()
    except FileNotFoundError:
        return ""
    finally:
        if f:
            f.close()   # always closes, even if exception occurs`,
        output: `5.0
None
42
Invalid JSON: Expecting value: line 1 column 1 (char 0)
Missing 'result' key
Cannot withdraw $150.00: balance is $100.00`,
        explanation: `else runs only when the try block succeeds — cleaner than putting success code inside try.
Catching as e gives you the exception object to inspect or log.
Custom exceptions (class InsufficientFundsError(Exception)) communicate domain-specific errors clearly.
finally always runs — critical for releasing resources (files, DB connections, network sockets).
Use context managers (with statement) instead of try/finally for file handling — cleaner and safer.`,
      },
    ],
    commonMistakes: [
      'Using bare except: — catches SystemExit and KeyboardInterrupt, making it impossible to quit the program',
      'Catching Exception silently (pass) — swallows errors and makes debugging impossible',
      'Over-catching: catching a broad exception type when you mean to handle one specific case',
    ],
    bestPractices: [
      'Catch the most specific exception possible — not just Exception',
      'Always log or print exception details, never silently pass',
      'Use context managers (with open(...) as f:) instead of try/finally for resource management',
    ],
    exercises: [
      'Write a function safe_divide(a, b) that handles ZeroDivisionError and non-numeric inputs (TypeError, ValueError).',
      'Write a retry decorator that retries a function up to 3 times if it raises a specific exception.',
      'Create a custom exception hierarchy: AppError as base, then DatabaseError and NetworkError as subclasses.',
    ],
    quizQuestions: [
      {
        question: 'When does the else block in a try-except-else statement run?',
        options: ['Always', 'Only when an exception occurs', 'Only when no exception occurs in the try block', 'After the finally block'],
        answer: 2,
        explanation: 'The else block runs only when the try block completes without raising any exception. It is the "success path" for code that does not need exception protection.',
      },
      {
        question: 'What is wrong with "except: pass"?',
        options: ['Syntax error — pass is not valid here', 'It catches all exceptions including SystemExit, silently ignoring errors', 'It only catches ValueError', 'finally will not run'],
        answer: 1,
        explanation: 'A bare except catches everything — even KeyboardInterrupt (Ctrl+C) and SystemExit. Combined with pass, it silently swallows all errors, making bugs invisible.',
      },
    ],
    interviewQuestions: [
      'Explain the try-except-else-finally structure. What does each block do and when does it run?',
      'What is exception chaining in Python? How do you use raise...from?',
      'When should you raise a custom exception vs using a built-in exception type?',
    ],
    summary: 'Use try-except to catch specific exceptions, else for success-only logic, and finally for cleanup. Raise specific custom exceptions to communicate domain errors. Never use bare except or silently pass exceptions.',
    nextTopic: 'Python File Handling',
  },

  {
    id: 'python-file-handling',
    title: 'Python File Handling',
    intro: 'File handling lets Python programs read from and write to files on disk — text files, CSV data, JSON configs, binary images, and more. Python\'s built-in open() function and the with statement make file I/O safe and straightforward.',
    whatIsIt: 'File handling in Python uses open() to get a file object, read/write operations on that object, and close() or a with block to properly release the file resource.',
    whyImportant: 'Data persistence, configuration, logging, and data exchange all rely on files. Every production Python program reads or writes files.',
    simpleExplanation: 'Opening a file is like checking out a library book — you open it, read or write in it, then you must return it (close it) when done.',
    detailedExplanation: `open(path, mode) returns a file object. Mode: 'r' (read, default), 'w' (write, creates/overwrites), 'a' (append), 'x' (exclusive create, fails if exists), 'b' (binary mode — add to r/w/a), '+' (read+write). Combining: 'rb' reads binary, 'wb' writes binary.

Always use the with statement: with open(path) as f: — it automatically calls f.close() when the block exits, even if an exception occurs. Without with, a crash before close() can leave the file locked or data not flushed.

Text file methods: f.read() (whole file as string), f.readline() (one line), f.readlines() (all lines as list), f.write(text), f.writelines(list_of_strings). Iterating a file: for line in f: is memory-efficient, reading one line at a time.

For structured data: use csv module for CSV files, json module for JSON, pathlib for path operations. The pathlib.Path object has convenient methods: path.read_text(), path.write_text(), path.read_bytes(), path.exists(), path.glob("*.py").

Binary mode: use 'rb'/'wb' for images, PDFs, audio, and other non-text files. Text mode handles encoding/newline translation automatically; binary mode does not.`,
    realWorldExample: 'A log analyzer opens a 2GB log file and reads it line-by-line (for line in f:) to count error occurrences — this uses O(1) memory regardless of file size because only one line is in memory at a time.',
    codeExamples: [
      {
        title: 'Reading and Writing Files',
        language: 'python',
        code: `from pathlib import Path
import json, csv

# Writing a text file
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Line 1: Python file handling\\n")
    f.write("Line 2: with statement is best\\n")
    f.writelines(["Line 3: auto-close\\n", "Line 4: done\\n"])

# Reading the whole file
with open("notes.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)

# Reading line by line (memory-efficient)
with open("notes.txt") as f:
    for i, line in enumerate(f, 1):
        print(f"{i}: {line.rstrip()}")

# Appending to a file
with open("notes.txt", "a") as f:
    f.write("Line 5: appended\\n")

# JSON file
data = {"user": "Alice", "scores": [90, 87, 95]}
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

with open("data.json") as f:
    loaded = json.load(f)
print(loaded["user"])

# CSV file
students = [["Alice", 90], ["Bob", 87], ["Charlie", 95]]
with open("students.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Score"])    # header
    writer.writerows(students)

with open("students.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['Name']}: {row['Score']}")

# pathlib — modern approach
p = Path("notes.txt")
print(p.read_text(encoding="utf-8")[:30])
print(p.stat().st_size, "bytes")`,
        output: `Line 1: Python file handling
Line 2: with statement is best
Line 3: auto-close
Line 4: done

1: Line 1: Python file handling
2: Line 2: with statement is best
3: Line 3: auto-close
4: Line 4: done
Alice
Alice: 90
Bob: 87
Charlie: 95
Line 1: Python file handling
81 bytes`,
        explanation: `Always specify encoding="utf-8" for text files to avoid platform-dependent encoding issues.
The with statement ensures the file is closed even if an exception occurs — no resource leak.
for line in f: reads one line at a time — memory-efficient for large files.
json.dump() writes Python objects to JSON; json.load() reads JSON back to Python objects.
csv.DictReader maps each row to a dict with column headers as keys.
pathlib.Path.read_text() is a one-liner for reading entire small files.`,
      },
    ],
    commonMistakes: [
      'Not using with statement — forgetting to close files leaks file descriptors',
      'Opening text files without specifying encoding="utf-8" — causes encoding errors on some platforms',
      'Using w mode when a means append — w mode overwrites the entire file',
    ],
    bestPractices: [
      'Always use with open(...) as f: to ensure files are closed',
      'Always specify encoding="utf-8" for text files',
      'Use pathlib.Path instead of os.path for modern, readable path handling',
    ],
    exercises: [
      'Write a function that reads a log file and returns a dict counting how many times each log level (INFO, WARNING, ERROR) appears.',
      'Write a CSV reader that reads student records and returns only students who scored above a given threshold.',
      'Write a JSON config loader that merges defaults with user config: missing keys fall back to defaults.',
    ],
    quizQuestions: [
      {
        question: 'What is the advantage of using the with statement with open()?',
        options: ['It makes reading faster', 'It automatically closes the file when the block exits, even if an exception occurs', 'It opens multiple files at once', 'It locks the file for exclusive access'],
        answer: 1,
        explanation: 'with open() uses a context manager that calls file.close() automatically when the block exits — whether it exits normally or via an exception. This prevents resource leaks.',
      },
      {
        question: 'What mode should you use to add content to the end of an existing file without overwriting it?',
        options: ['"w"', '"r+"', '"a"', '"x"'],
        answer: 2,
        explanation: '"a" (append) mode opens the file and moves the write cursor to the end, so new writes add to the end without affecting existing content. "w" would overwrite everything.',
      },
    ],
    interviewQuestions: [
      'What is a context manager in Python? How does with open() work internally?',
      'How would you efficiently process a 10GB text file in Python without loading it all into memory?',
      'What is the difference between text mode and binary mode in Python file handling?',
    ],
    summary: 'Use with open(path, mode, encoding="utf-8") as f: for all file operations. Read with f.read(), f.readline(), or iterate f directly. Write with f.write(). Use json and csv modules for structured data. Use pathlib for modern path handling.',
    nextTopic: 'Python NumPy Basics',
  },

  {
    id: 'python-numpy',
    title: 'Python NumPy Basics',
    intro: 'NumPy (Numerical Python) is the foundational library for scientific computing in Python. It provides the ndarray, a fast n-dimensional array, along with hundreds of mathematical functions, linear algebra operations, and random number generation — all implemented in C for performance.',
    whatIsIt: 'NumPy is a Python library providing the ndarray (n-dimensional array) type and vectorized mathematical operations implemented in C, forming the base of the Python data science stack.',
    whyImportant: 'NumPy powers Pandas, SciPy, scikit-learn, TensorFlow, and PyTorch. It is the universal standard for numerical data in Python — impossible to do data science without it.',
    simpleExplanation: 'NumPy is what happens when you give Python the ability to do math as fast as C — by replacing Python loops with compiled, vectorized operations on arrays of numbers.',
    detailedExplanation: `NumPy\'s core data structure is the ndarray — typed, homogeneous, contiguous memory. Creating arrays: np.array(), np.zeros(), np.ones(), np.arange(), np.linspace(), np.random.rand().

Key properties: arr.shape (dimensions tuple), arr.dtype (data type), arr.ndim (number of dimensions), arr.size (total elements), arr.nbytes (memory usage).

Indexing and slicing: 1D like lists, 2D with [row, col], 3D with [depth, row, col]. Boolean indexing: arr[arr > 5] — returns elements satisfying the condition. Fancy indexing: arr[[0, 2, 4]] — returns elements at given indices.

Vectorized operations: + - * / ** work element-wise without loops. NumPy also provides: np.sum(), np.mean(), np.std(), np.min(), np.max(), np.sort(), np.unique(), np.cumsum().

Linear algebra: np.dot() (matrix multiplication), np.linalg.inv() (inverse), np.linalg.det() (determinant), np.linalg.eig() (eigenvalues), np.linalg.solve() (linear equations).

Broadcasting: operations between arrays of different shapes follow broadcasting rules — NumPy automatically expands dimensions to make shapes compatible.`,
    realWorldExample: 'A machine learning model computes 1000 dot products (forward pass) in milliseconds using np.dot(weights, X) — what would take seconds with Python loops takes microseconds with NumPy.',
    codeExamples: [
      {
        title: 'NumPy Core Operations',
        language: 'python',
        code: `import numpy as np

# Array creation
a = np.array([1, 2, 3, 4, 5])
z = np.zeros((3, 3))
e = np.eye(3)          # identity matrix
r = np.arange(0, 10, 2)
l = np.linspace(0, 1, 5)  # 5 evenly spaced points
rnd = np.random.rand(3, 3)  # 3x3 uniform random [0,1)

print("Shape:", a.shape, "Dtype:", a.dtype)
print("linspace:", l)

# Vectorized math (no loops!)
b = a * 2 + 1
c = np.sqrt(a.astype(float))
print(b)
print(np.round(c, 3))

# 2D array operations
m = np.array([[1, 2, 3],
              [4, 5, 6]])
print("Shape:", m.shape)
print("Row sum:", m.sum(axis=1))  # sum each row
print("Col mean:", m.mean(axis=0))  # mean each column
print("Transposed:\n", m.T)

# Matrix multiplication
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print("MatMul:\n", A @ B)  # @ operator = matrix multiply

# Boolean indexing
data = np.array([15, 32, 8, 47, 23, 56, 11])
print("Above 20:", data[data > 20])
print("Even:", data[data % 2 == 0])

# Statistics
print(f"Mean: {data.mean():.1f}, Std: {data.std():.1f}")
print(f"Min: {data.min()}, Max: {data.max()}")`,
        output: `Shape: (5,) Dtype: int64
linspace: [0.   0.25 0.5  0.75 1.  ]
[ 3  5  7  9 11]
[1.    1.414 1.732 2.    2.236]
Shape: (2, 3)
Row sum: [ 6 15]
Col mean: [2.5 3.5 4.5]
Transposed:
 [[1 4]
 [2 5]
 [3 6]]
MatMul:
 [[19 22]
 [43 50]]
Above 20: [32 47 23 56]
Even: [32  8 56]
Mean: 27.4, Std: 17.2
Min: 8, Max: 56`,
        explanation: `np.linspace(0, 1, 5) creates 5 evenly spaced points between 0 and 1 inclusive.
Vectorized operations (a * 2 + 1) apply to every element in C speed — no Python loop.
axis=0 means "along rows" (result has one value per column); axis=1 means "along columns" (one value per row).
The @ operator (Python 3.5+) performs matrix multiplication — same as np.dot(A, B) for 2D arrays.
Boolean indexing data[data > 20] returns a new array of elements satisfying the condition.`,
      },
    ],
    commonMistakes: [
      'Using nested Python loops instead of NumPy vectorized operations — 10-100x slower',
      'Forgetting that NumPy slices return views not copies — modifying a slice modifies the original',
      'Shape mismatches in broadcasting — always print arr.shape before operations to verify dimensions',
    ],
    bestPractices: [
      'Always use NumPy vectorized operations instead of Python loops for numerical arrays',
      'Use arr.copy() to create an independent copy before modifying',
      'Use np.random.default_rng() (NumPy 1.17+) for reproducible random number generation',
    ],
    exercises: [
      'Create a 10×10 matrix of random integers between 1-100, then find: sum of each row, mean of each column, and all values above 50.',
      'Implement matrix multiplication manually using nested loops, then compare its speed to NumPy @ operator on 100×100 matrices.',
      'Use NumPy to solve this system of linear equations: 2x + y = 5, x + 3y = 10 (hint: use np.linalg.solve).',
    ],
    quizQuestions: [
      {
        question: 'What does arr.sum(axis=0) compute for a 2D array?',
        options: ['Sum of all elements', 'Sum of each row', 'Sum of each column (collapses rows)', 'Sum along the diagonal'],
        answer: 2,
        explanation: 'axis=0 collapses along rows, giving the sum of each column. For a 2×3 array, arr.sum(axis=0) returns a 1D array of 3 values — one sum per column.',
      },
      {
        question: 'What is the result of np.arange(1, 10, 3)?',
        options: ['[1, 4, 7]', '[1, 3, 6, 9]', '[1, 2, 3, 4, 5, 6, 7, 8, 9]', '[3, 6, 9]'],
        answer: 0,
        explanation: 'np.arange(start, stop, step) generates [1, 4, 7] — starting at 1, stepping by 3, stopping before 10.',
      },
    ],
    interviewQuestions: [
      'Explain NumPy broadcasting with an example. What problem does it solve?',
      'What is the difference between a NumPy view and a copy? How do you check if an array is a view?',
      'How would you compute the cosine similarity between two vectors using NumPy?',
    ],
    summary: 'NumPy provides n-dimensional arrays with C-speed vectorized operations. Use arange/linspace/zeros/ones for creation, boolean indexing for filtering, axis parameter for dimension-specific reductions, and @ for matrix multiplication.',
    nextTopic: 'Python Pandas Basics',
  },

  {
    id: 'python-pandas',
    title: 'Python Pandas Basics',
    intro: 'Pandas is Python\'s most popular data analysis library. Built on NumPy, it provides the DataFrame (table) and Series (column) structures for reading, cleaning, transforming, aggregating, and analyzing structured data.',
    whatIsIt: 'Pandas is a Python library providing DataFrame (2D labeled table) and Series (1D labeled array) for data manipulation — the Excel of Python programming.',
    whyImportant: 'Data scientists and analysts use Pandas for 80% of data wrangling work — reading CSVs, cleaning data, grouping by categories, and computing statistics.',
    simpleExplanation: 'A Pandas DataFrame is a spreadsheet in Python: rows and columns with labels, operations for filtering/sorting/grouping, and methods for reading/writing CSV/Excel/JSON.',
    detailedExplanation: `Core structures: Series (1D labeled array, like a spreadsheet column) and DataFrame (2D labeled table of Series columns).

Creating DataFrames: pd.DataFrame(dict), pd.read_csv("file.csv"), pd.read_excel("file.xlsx"), pd.read_json("file.json").

Selecting data: df["col"] (single column Series), df[["col1","col2"]] (multiple columns), df.loc[row_label, col_label] (label-based), df.iloc[row_int, col_int] (integer position).

Filtering: df[df["age"] > 25] (boolean indexing), df.query("age > 25 and score > 90").

Data cleaning: df.dropna() (drop rows with NaN), df.fillna(value) (fill NaN), df.drop_duplicates(), df.rename(columns={...}), df.astype({"col": int}).

Operations: df.describe() (statistics summary), df.groupby("col").agg(func), df.sort_values("col"), df.merge(other, on="key"), df.pivot_table().

Applying functions: df["col"].apply(func), df.applymap(func) (element-wise).`,
    realWorldExample: 'A retail analyst reads a million-row sales CSV, groups by product category and region, computes average sale price and total revenue for each group, and exports the result to Excel — all in 10 lines of Pandas code.',
    codeExamples: [
      {
        title: 'Pandas DataFrame Operations',
        language: 'python',
        code: `import pandas as pd
import numpy as np

# Create a DataFrame
data = {
    "Name":   ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "Dept":   ["Eng",   "Mkt", "Eng",     "HR",    "Mkt"],
    "Score":  [92,      78,    88,         65,      91],
    "Salary": [85000,   60000, 80000,      55000,   70000],
}
df = pd.DataFrame(data)
print(df)

# Basic info
print(df.dtypes)
print(df.describe())

# Selecting
print(df["Name"])              # Series
print(df[["Name","Score"]])    # DataFrame

# Filtering
high = df[df["Score"] >= 88]
print(high[["Name","Score"]])

eng = df.query("Dept == 'Eng' and Score > 85")
print(eng)

# Aggregation by group
by_dept = df.groupby("Dept")["Score"].agg(["mean","min","max"])
print(by_dept)

# Sorting
top = df.sort_values("Score", ascending=False).head(3)
print(top[["Name","Score"]])

# Adding a column
df["Grade"] = df["Score"].apply(
    lambda s: "A" if s >= 90 else ("B" if s >= 80 else "C")
)
print(df[["Name","Score","Grade"]])

# Summary stats
print(f"Average score: {df['Score'].mean():.1f}")
print(f"Highest earner: {df.loc[df['Salary'].idxmax(), 'Name']}")`,
        output: `      Name Dept  Score  Salary
0    Alice  Eng     92   85000
1      Bob  Mkt     78   60000
2  Charlie  Eng     88   80000
3    Diana   HR     65   55000
4      Eve  Mkt     91   70000
     Name Score
0   Alice    92
2 Charlie    88
4     Eve    91
      Name Dept  Score  Salary
0    Alice  Eng     92   85000
         mean  min  max
Dept
Eng   90.0   88   92
HR    65.0   65   65
Mkt   84.5   78   91
   Name  Score
0 Alice     92
4   Eve     91
2 Charlie   88
     Name  Score Grade
0   Alice     92     A
1     Bob     78     C
2 Charlie     88     B
3   Diana     65     C
4     Eve     91     A
Average score: 82.8
Highest earner: Alice`,
        explanation: `df[condition] filters rows where condition is True — the boolean indexing from NumPy works on DataFrames.
query() lets you write filter conditions as SQL-like strings — more readable for complex conditions.
groupby().agg() applies multiple aggregation functions to grouped data simultaneously.
apply(lambda ...) applies a function to every row or column — the most flexible transformation method.
idxmax() returns the index label of the maximum value — useful for finding "which row has the biggest X".`,
      },
    ],
    commonMistakes: [
      'Using df["col"] to modify a slice — causes SettingWithCopyWarning; use .copy() or .loc[]',
      'Iterating over rows with a Python for loop — use vectorized operations (df["col"] * 2) instead',
      'Forgetting that most Pandas operations return a new DataFrame, not modify in-place',
    ],
    bestPractices: [
      'Use df.query() for complex filters — cleaner than chained boolean conditions',
      'Use vectorized operations instead of iterrows() — 10-100x faster',
      'Use df.dtypes and df.info() at the start of analysis to understand your data',
    ],
    exercises: [
      'Load a CSV file, find the top 5 rows by value in a numeric column, and save the result to a new CSV.',
      'Using a dataset with a date column, group by month and compute total/average of a numeric column.',
      'Perform a merge between two DataFrames on a common key column and analyze the result.',
    ],
    quizQuestions: [
      {
        question: 'What is the difference between df.loc[] and df.iloc[]?',
        options: ['loc is faster; iloc is slower', 'loc uses label-based indexing; iloc uses integer position-based indexing', 'loc works on columns; iloc on rows', 'They are identical'],
        answer: 1,
        explanation: 'df.loc[label] selects by row/column labels. df.iloc[0] selects by integer position. If your index is labeled (e.g., "a","b","c"), loc["a"] and iloc[0] both get the first row, but they differ when the index is not default integers.',
      },
      {
        question: 'What does df.groupby("Dept")["Score"].mean() return?',
        options: ['The mean of all scores', 'A Series with mean score for each unique Dept value', 'A list of score means', 'A DataFrame with all scores grouped'],
        answer: 1,
        explanation: 'groupby("Dept") splits the DataFrame by unique Dept values. .mean() computes the mean Score for each group. The result is a Series indexed by Dept values.',
      },
    ],
    interviewQuestions: [
      'Explain the difference between merge, join, and concat in Pandas.',
      'How do you handle missing values (NaN) in a Pandas DataFrame?',
      'When should you use apply() and when should you use vectorized operations?',
    ],
    summary: 'Pandas DataFrames are labeled 2D tables. Use loc/iloc for selection, boolean indexing for filtering, groupby for aggregation, apply for custom transforms. Prefer vectorized operations over row iteration for performance.',
    nextTopic: 'Python Projects',
  },

  {
    id: 'python-projects',
    title: 'Python Projects',
    intro: 'Building projects is the most effective way to solidify Python skills. Projects combine multiple concepts (functions, classes, file I/O, APIs, data structures) into something functional and portfolio-worthy.',
    whatIsIt: 'Python projects are complete programs that solve a real problem, demonstrating your ability to design, implement, and test a full solution.',
    whyImportant: 'Projects prove competence to employers, solidify understanding through application, and teach the practical skills that tutorials skip — debugging, structuring code, handling edge cases.',
    simpleExplanation: 'A project is the difference between knowing how to use individual LEGO bricks and building a complete structure — it tests whether you can combine pieces meaningfully.',
    detailedExplanation: `Project ideas by difficulty level:

Beginner (1-3 days): Calculator CLI, To-Do list (text file based), Password generator, Number guessing game, Unit converter, Caesar cipher encryptor.

Intermediate (1-2 weeks): Personal expense tracker (CSV), URL shortener, Weather app (API), Web scraper (BeautifulSoup), Flashcard quiz app, CSV data analysis dashboard.

Advanced (2-4 weeks): REST API with FastAPI, Data pipeline (CSV → cleaned → analyzed → visualized), Stock price tracker with historical charts, Simple recommendation engine, Chat app with sockets, Custom ORM (simplified).

Each project should include: requirements planning, clean code structure (functions/classes), error handling, a test file, a README, and optionally a GitHub repository.

Portfolio tip: pick projects that demonstrate data structures (not just scripts), error handling (not just happy path), and testing. Even one well-documented GitHub project with clean code is more valuable than twenty messy scripts.`,
    realWorldExample: 'A data analyst built a COVID-19 trends dashboard for their portfolio using Pandas (data cleaning), Matplotlib (charts), and a FastAPI server (hosting) — this project got them their first data science job.',
    codeExamples: [
      {
        title: 'Mini Project: Expense Tracker',
        language: 'python',
        code: `"""
expense_tracker.py — A simple personal expense tracker.
Stores expenses in a JSON file and shows a summary.
"""
import json
from pathlib import Path
from datetime import date
from collections import defaultdict

EXPENSES_FILE = Path("expenses.json")

def load_expenses():
    if not EXPENSES_FILE.exists():
        return []
    return json.loads(EXPENSES_FILE.read_text())

def save_expenses(expenses):
    EXPENSES_FILE.write_text(json.dumps(expenses, indent=2))

def add_expense(amount: float, category: str, note: str = ""):
    expenses = load_expenses()
    expenses.append({
        "date": str(date.today()),
        "amount": round(amount, 2),
        "category": category.lower(),
        "note": note,
    })
    save_expenses(expenses)
    print(f"Added: \${amount:.2f} in {category}")

def summary():
    expenses = load_expenses()
    if not expenses:
        print("No expenses recorded.")
        return

    totals = defaultdict(float)
    for e in expenses:
        totals[e["category"]] += e["amount"]

    total = sum(totals.values())
    print(f"\\n{'Category':<15} {'Amount':>10}")
    print("-" * 26)
    for cat, amt in sorted(totals.items(), key=lambda x: -x[1]):
        print(f"{cat.title():<15} \${amt:>9.2f}")
    print("-" * 26)
    print(f"{'TOTAL':<15} \${total:>9.2f}")

# Demo usage
add_expense(45.50, "food", "lunch and coffee")
add_expense(120.00, "utilities", "electricity")
add_expense(35.00, "food", "groceries")
add_expense(200.00, "rent", "monthly portion")
summary()`,
        output: `Added: $45.50 in food
Added: $120.00 in utilities
Added: $35.00 in food
Added: $200.00 in rent

Category           Amount
--------------------------
Rent            $  200.00
Utilities       $  120.00
Food            $   80.50
--------------------------
TOTAL           $  400.50`,
        explanation: `This project combines: JSON file I/O, pathlib for cross-platform file paths, dataclasses (dict here), defaultdict for grouping, f-string formatting for tabular output.
Notice the project structure: load/save helpers, business logic functions, a summary function.
Every production project needs: data persistence (JSON/CSV/DB), error handling, clean output formatting.`,
      },
    ],
    exercises: [
      'Build a password generator that creates secure passwords of configurable length using random.choices() with uppercase, lowercase, digits, and symbols.',
      'Build a contact book CLI: add, delete, search contacts stored in a JSON file.',
      'Build a simple quiz game: load questions from a JSON file, ask them in random order, track score, and save results.',
    ],
    quizQuestions: [
      {
        question: 'Which library would you use to build a REST API in Python?',
        options: ['NumPy', 'FastAPI or Flask', 'Pandas', 'BeautifulSoup'],
        answer: 1,
        explanation: 'FastAPI and Flask are Python web frameworks for building REST APIs. FastAPI is modern (async, type hints, auto docs); Flask is simpler and well-established.',
      },
      {
        question: 'What is the best way to store application data between program runs?',
        options: ['Global variables', 'A file (JSON, CSV, SQLite) or a database', 'In-memory lists', 'Environment variables'],
        answer: 1,
        explanation: 'Files and databases persist data between program runs. Global variables and in-memory data are lost when the program exits.',
      },
    ],
    interviewQuestions: [
      'Describe a Python project you built from scratch. What challenges did you encounter and how did you solve them?',
      'How do you structure a medium-sized Python project (multiple files/modules)?',
      'What testing approach do you use for Python projects? Explain unittest vs pytest.',
    ],
    summary: 'Projects cement Python skills by combining multiple concepts. Start simple (CLI tools), progress to intermediate (API clients, data pipelines), then advanced (web apps, ML projects). Always add error handling, tests, and documentation.',
    nextTopic: 'Python Exercises',
  },

  {
    id: 'python-exercises',
    title: 'Python Exercises',
    intro: 'Structured exercises progressively test and reinforce Python knowledge — from basic syntax through data structures, OOP, and algorithms. Regular practice with varied problems builds the pattern recognition that makes Python feel natural.',
    whatIsIt: 'Python exercises are programming challenges designed to practice specific concepts, ranging from beginner-level syntax to advanced algorithmic problems.',
    whyImportant: 'Reading about programming without practicing is like reading about swimming — understanding theory does not build muscle memory. Regular exercises do.',
    simpleExplanation: 'Exercises are like gym reps for your coding brain — each problem you solve makes the next one easier.',
    realWorldExample: 'Google\'s hiring process requires solving LeetCode-style problems in 45 minutes. Engineers at top companies routinely practice 100-300 problems before interviewing. Each solved problem builds pattern recognition — "this is a sliding window problem", "this needs a hash map" — that transfers to real coding work.',
    detailedExplanation: `Practice platforms: LeetCode (algorithms), HackerRank (Python-specific), Codewars (kata challenges), Exercism (mentor-reviewed), Project Euler (math+programming), Advent of Code (seasonal puzzles).

Beginner exercises focus on: string manipulation, list operations, basic arithmetic, conditionals, simple loops.

Intermediate exercises focus on: recursion, sorting/searching, file I/O, OOP design, error handling, dictionary patterns.

Advanced exercises focus on: graph algorithms, dynamic programming, design patterns, concurrency, system design.

Approach to exercises: read the problem twice, identify inputs/outputs/constraints, write pseudocode first, implement, test with edge cases (empty input, single item, maximum input), then optimize.

Edge cases to always consider: empty input, single element, negative numbers, None values, very large inputs, duplicate values.`,
    codeExamples: [
      {
        title: 'Practice Exercises with Solutions',
        language: 'python',
        code: `# Exercise 1: Reverse words in a sentence
def reverse_words(sentence):
    return " ".join(sentence.split()[::-1])

print(reverse_words("Hello World Python"))  # Python World Hello

# Exercise 2: Find the two numbers that sum to a target
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]

# Exercise 3: Flatten a nested list
def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

print(flatten([1, [2, [3, 4], 5], [6, 7]]))  # [1,2,3,4,5,6,7]

# Exercise 4: Count character frequency (without Counter)
def char_freq(s):
    freq = {}
    for ch in s.lower():
        if ch.isalpha():
            freq[ch] = freq.get(ch, 0) + 1
    return dict(sorted(freq.items(), key=lambda x: -x[1]))

print(char_freq("Hello World"))

# Exercise 5: Valid parentheses
def is_valid_parens(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0

print(is_valid_parens("({[]})"))  # True
print(is_valid_parens("([)]"))    # False`,
        output: `Python World Hello
[0, 1]
[1, 2, 3, 4, 5, 6, 7]
{'l': 3, 'o': 2, 'h': 1, 'e': 1, 'w': 1, 'r': 1, 'd': 1}
True
False`,
        explanation: `two_sum uses a hash map for O(n) solution — check if the complement exists in already-seen numbers.
flatten uses recursion — for each item, if it's a list recurse into it, else add to result.
char_freq uses dict.get(key, default) to count without KeyError.
Valid parentheses uses a stack — open brackets push, close brackets must match the top of stack.`,
      },
    ],
    exercises: [
      'Write a function that finds the longest common prefix among a list of strings.',
      'Implement binary search recursively and iteratively. Verify both return the same results.',
      'Write a function that checks if a number is a perfect square without using sqrt().',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of the two_sum hash map approach?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        answer: 2,
        explanation: 'The hash map approach iterates the array once (O(n)) and performs O(1) dictionary lookups, giving O(n) overall — much better than the O(n²) nested loop approach.',
      },
      {
        question: 'What data structure is best for the "valid parentheses" problem?',
        options: ['Queue', 'Stack', 'Dictionary', 'Set'],
        answer: 1,
        explanation: 'A stack is perfect for matching brackets — push opening brackets, pop and compare when encountering closing brackets. LIFO order matches the nesting structure.',
      },
    ],
    interviewQuestions: [
      'Describe your approach to solving an unfamiliar algorithm problem in an interview.',
      'Given a list of integers, find all pairs that sum to a target value. What is your most efficient approach?',
      'How would you reverse a linked list in Python?',
    ],
    summary: 'Regular practice on varied exercises builds algorithmic thinking and Python fluency. Focus on understanding time/space complexity, edge cases, and multiple solution approaches. Platforms like LeetCode and Exercism provide structured progression.',
    nextTopic: 'Python Quiz',
  },

  {
    id: 'python-quiz',
    title: 'Python Quiz',
    intro: 'Test your comprehensive Python knowledge with this topic-by-topic quiz covering syntax, data structures, OOP, modules, file handling, and core library features.',
    whatIsIt: 'A comprehensive quiz covering all major Python topics from basic syntax through advanced features, designed to identify knowledge gaps and reinforce learning.',
    whyImportant: 'Self-testing is one of the most effective learning strategies — retrieval practice strengthens memory and reveals what you actually understand vs what you only think you understand.',
    simpleExplanation: 'The quiz is your checkpoint — it reveals which Python concepts feel solid and which ones need another review round.',
    realWorldExample: 'Technical certifications (Python Institute PCEP/PCAP) and university placement exams use exactly this quiz format. Companies like TCS, Infosys, and Wipro test Python fundamentals in coding assessments before hiring.',
    detailedExplanation: `The quiz covers these topic areas:
1. Core syntax (variables, types, operators)
2. Control flow (loops, conditionals)
3. Data structures (list, tuple, set, dict)
4. Functions (parameters, closures, decorators)
5. OOP (classes, inheritance, dunder methods)
6. Modules and packages
7. Exception handling
8. File I/O
9. Standard library (collections, itertools, datetime)
10. NumPy/Pandas basics

Review strategy: for each wrong answer, go back and re-read that topic. Create your own example code for concepts you missed. Spaced repetition — quiz yourself again in 1 day, 3 days, 1 week.`,
    codeExamples: [
      {
        title: 'Python Quiz Practice Questions',
        language: 'python',
        code: `# Q1: What is the output?
x = [1, 2, 3]
y = x
y.append(4)
print(x)           # [1, 2, 3, 4] — x and y point to same list!

# Q2: What is the output?
def f(a, b=[]):
    b.append(a)
    return b
print(f(1))  # [1]
print(f(2))  # [1, 2] — mutable default bug!
print(f(3))  # [1, 2, 3]

# Q3: What does this return?
print(sorted([3, 1, 4], key=lambda x: -x))  # [4, 3, 1]

# Q4: What is the output?
result = {x: x**2 for x in range(5) if x % 2 == 0}
print(result)  # {0: 0, 2: 4, 4: 16}

# Q5: What does zip(*matrix) do?
matrix = [[1,2,3],[4,5,6],[7,8,9]]
transposed = list(zip(*matrix))
print(transposed)  # [(1,4,7),(2,5,8),(3,6,9)]

# Q6: Generator expression
gen = (x**2 for x in range(5))
print(sum(gen))    # 0+1+4+9+16 = 30
print(list(gen))   # [] — generator exhausted!

# Q7: What prints?
class A:
    x = 1
a = A()
a.x = 2
print(A.x, a.x)  # 1  2 — class and instance attributes!`,
        output: `[1, 2, 3, 4]
[1]
[1, 2]
[1, 2, 3]
[4, 3, 1]
{0: 0, 2: 4, 4: 16}
[(1, 4, 7), (2, 5, 8), (3, 6, 9)]
30
[]
1 2`,
        explanation: `Q1: Assignment creates a reference, not a copy. y = x makes both point to the same list.
Q2: Mutable default argument — the list is created once and reused across all calls.
Q5: zip(*matrix) transposes a 2D list — each zip() group pulls one element from each row.
Q6: A generator is a one-time iterator — once exhausted, it produces no more values.
Q7: Assigning to a.x creates an instance attribute that shadows the class attribute for that instance only.`,
      },
    ],
    exercises: [
      'Write a decorator @timer that prints how long a function takes to run.',
      'Implement a simple LRU cache using collections.OrderedDict.',
      'Write a context manager using __enter__ and __exit__ that measures and prints code block execution time.',
    ],
    quizQuestions: [
      {
        question: 'What is the output of print(list(map(lambda x: x**2, range(4))))?',
        options: ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 1, 2, 3]', 'TypeError'],
        answer: 0,
        explanation: 'range(4) generates 0, 1, 2, 3. map applies lambda x: x**2 to each. list() collects the results: [0, 1, 4, 9].',
      },
      {
        question: 'What does zip(*[[1,2],[3,4],[5,6]]) produce?',
        options: ['[[1,3,5],[2,4,6]]', '[(1,3,5),(2,4,6)]', '[(1,2),(3,4),(5,6)]', 'TypeError'],
        answer: 1,
        explanation: '* unpacks the list into zip([1,2],[3,4],[5,6]). zip groups first elements: (1,3,5), then second elements: (2,4,6). This is the Pythonic list transposition technique.',
      },
    ],
    interviewQuestions: [
      'What is a generator in Python and how does it differ from a list? When would you use each?',
      'Explain Python decorators with a practical example.',
      'What are Python\'s data model / dunder methods? Name five and describe what they do.',
    ],
    summary: 'This quiz covers all major Python topics. Use it to identify gaps — any wrong answer points to a topic worth reviewing. Study the explanation for each answer, write your own examples, and retest after a day.',
    nextTopic: 'Python Interview Questions',
  },

  {
    id: 'python-interview-questions',
    title: 'Python Interview Questions',
    intro: 'This topic covers the most important Python interview questions — from fundamental concepts to advanced patterns — that technical interviewers at companies of all sizes commonly ask.',
    whatIsIt: 'A comprehensive collection of Python interview questions with detailed answers, covering language internals, data structures, OOP, performance, and best practices.',
    whyImportant: 'Interview preparation goes beyond knowing Python — you must be able to explain concepts clearly, compare alternatives, and discuss trade-offs in a time-pressured setting.',
    simpleExplanation: 'Interview questions are like the exam version of your Python studies — they test not just what you know, but whether you can explain and apply it under pressure.',
    realWorldExample: 'Amazon, Google, and Meta Python interviews typically last 45-60 minutes per round, with 1-2 coding problems plus system design or behavioral questions. Candidates who can explain Python internals (GIL, generators, memory management) alongside writing clean code stand out from those who only know syntax.',
    detailedExplanation: `Python interviews test four categories:

1. Language fundamentals: typing system, memory management, GIL, mutable vs immutable, LEGB scope, dunder methods.
2. Data structures: choosing the right structure, time/space complexity, when to use list vs tuple vs set vs dict.
3. OOP and design: class hierarchy, composition vs inheritance, SOLID principles in Python.
4. Practical Python: context managers, generators, decorators, list comprehensions, functional tools, testing.

Preparation strategy: practice explaining concepts aloud, know the time complexity of common operations, be ready to write code by hand, and always discuss trade-offs (not just "how" but "why this approach").

Common follow-up patterns: "How would you make this more efficient?", "What if the input is very large?", "How would you test this function?", "What are the edge cases?"`,
    codeExamples: [
      {
        title: 'Key Python Concepts with Code',
        language: 'python',
        code: `# 1. Python GIL — affects threading not multiprocessing
import threading, multiprocessing

# GIL prevents true parallel CPU-bound threads
# Use multiprocessing for CPU-bound parallelism
# Use asyncio/threading for I/O-bound concurrency

# 2. Generators — lazy evaluation, memory-efficient
def fibonacci():
    a, b = 0, 1
    while True:
        yield a       # suspends here, resumes on next()
        a, b = b, a + b

fib = fibonacci()
print([next(fib) for _ in range(8)])  # [0,1,1,2,3,5,8,13]

# 3. Decorators — functions that wrap other functions
import functools, time

def timer(func):
    @functools.wraps(func)     # preserves func's __name__, __doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

slow_sum(1_000_000)

# 4. Context manager
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start
        print(f"Block took {self.elapsed:.4f}s")

with Timer():
    result = sum(range(500_000))

# 5. Memory-efficient pipeline with generators
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

def filter_errors(lines):
    return (l for l in lines if "ERROR" in l)

def parse_errors(lines):
    return (l.split("|") for l in lines)

# Compose: no data loaded until we iterate
# pipeline = parse_errors(filter_errors(read_large_file("app.log")))`,
        output: `[0, 1, 1, 2, 3, 5, 8, 13]
slow_sum took 0.0312s
Block took 0.0219s`,
        explanation: `Generators yield values lazily — fibonacci() never ends but never uses more than O(1) memory.
Decorators are function wrappers — @timer adds timing to any function without modifying its code.
@functools.wraps preserves the wrapped function's name and docstring — essential for debugging.
Context managers use __enter__/__exit__ — the with statement calls them automatically.
Generator pipelines compose processing steps without materializing intermediate lists in memory.`,
      },
    ],
    exercises: [
      'Implement a rate limiter decorator that allows at most N calls per second.',
      'Implement a thread-safe singleton class using Python\'s threading.Lock.',
      'Write a lazy data pipeline: generate 10 million random integers, filter primes, take the first 5 — without storing all 10M in memory.',
    ],
    quizQuestions: [
      {
        question: 'What is Python\'s Global Interpreter Lock (GIL)?',
        options: ['A variable that locks global state', 'A mutex in CPython that allows only one thread to execute Python bytecode at a time', 'A security feature preventing unauthorized imports', 'A lock around the global namespace'],
        answer: 1,
        explanation: 'The GIL is a mutex in CPython that prevents multiple threads from executing Python bytecode simultaneously. It simplifies memory management but limits CPU-bound thread parallelism. Use multiprocessing or asyncio for true parallelism.',
      },
      {
        question: 'What does @functools.wraps do inside a decorator?',
        options: ['Makes the decorator faster', 'Copies the wrapped function\'s __name__, __doc__, and other metadata to the wrapper', 'Enables the decorator to work with classes', 'Caches the wrapped function\'s return value'],
        answer: 1,
        explanation: 'Without @functools.wraps, a decorated function\'s __name__ and __doc__ become those of the wrapper function. @functools.wraps copies the original function\'s metadata to the wrapper, preserving the function\'s identity.',
      },
    ],
    interviewQuestions: [
      'Explain the Python GIL — what problem does it solve and what problem does it create?',
      'What are generators and how do they differ from regular functions? When would you use one?',
      'Describe Python\'s memory management. How does garbage collection work?',
      'What is a decorator? Implement a simple caching decorator from scratch.',
      'Explain the difference between @staticmethod and @classmethod.',
    ],
    summary: 'Python interviews test language internals (GIL, memory), data structures (complexity), OOP patterns, and practical tools (generators, decorators, context managers). Practice coding by hand, know complexity, and be ready to discuss trade-offs.',
    nextTopic: undefined,
  },
]
