import type { TopicLesson } from '../_shared/types'

export const pythonLessons: TopicLesson[] = [
  {
    id: 'what-is-python',
    title: 'What is Python?',
    intro: 'Python is a high-level, general-purpose programming language known for its readable syntax and wide applicability — from web servers to artificial intelligence. Created by Guido van Rossum and first released in 1991, it has grown into one of the most popular languages in the world.',
    whatIsIt: 'Python is an interpreted, dynamically typed programming language that emphasizes code readability and expressive syntax over verbosity.',
    whyImportant: 'Python powers everything from Instagram and YouTube backends to NASA data analysis pipelines, making it the most versatile language a learner can start with.',
    simpleExplanation: 'Think of Python as plain English instructions for a computer. Instead of writing complex code filled with semicolons and curly braces, you write short, readable lines that almost read like a sentence.',
    detailedExplanation: `Python was designed with a philosophy called "The Zen of Python" — a set of guiding principles that prioritize readability, simplicity, and explicitness. Unlike C or Java, Python does not require you to declare variable types, manage memory, or write boilerplate code to get started.

Python code is executed by an interpreter rather than compiled to machine code directly. This means you can run code line by line in an interactive shell, which makes learning and experimenting extremely fast.

Python supports multiple programming paradigms: procedural programming (step-by-step instructions), object-oriented programming (using classes and objects), and functional programming (using functions as first-class values). This versatility allows beginners to start simple and gradually adopt more advanced patterns.

The Python Standard Library is enormous — it includes modules for file I/O, networking, math, databases, testing, and much more, all bundled with every Python installation. The PyPI package registry adds hundreds of thousands more packages for specialized tasks.`,
    realWorldExample: 'When you use Netflix recommendations, Instagram filters, Google Search, or a COVID-19 data dashboard, there is a high chance Python code is running somewhere in that pipeline.',
    technicalDetails: `Python uses a reference-counting garbage collector to manage memory automatically. Every Python object has a reference count; when it reaches zero, the object is deallocated. Python also has a cyclic garbage collector to handle circular references.

The CPython interpreter (the standard implementation) compiles Python source code into bytecode (.pyc files) and then executes the bytecode on the Python Virtual Machine (PVM). Alternative implementations include PyPy (JIT-compiled, faster), Jython (runs on the JVM), and MicroPython (for microcontrollers).`,
    codeExamples: [
      {
        title: 'Your First Python Program',
        language: 'python',
        code: `# This is a comment — Python ignores it
print("Hello, World!")

# Variables (no type declaration needed)
name = "BlueLearnerHub"
year = 2024
rating = 4.9

print(f"Welcome to {name}!")
print(f"Year: {year}, Rating: {rating}")

# Python reads almost like English
if rating > 4.5:
    print("Excellent platform!")`,
        output: `Hello, World!
Welcome to BlueLearnerHub!
Year: 2024, Rating: 4.9
Excellent platform!`,
        explanation: `Line 1: A comment — Python ignores anything after #
Line 2: print() sends text to the terminal
Line 5-7: Variables are created just by assigning a value — no 'int' or 'string' keyword needed
Line 9: An f-string lets you embed variable values directly inside a string using {}
Line 13-14: if-statement uses plain English words and indentation instead of curly braces`,
      },
    ],
    commonMistakes: [
      'Confusing Python 2 and Python 3 — always use Python 3 (Python 2 is end-of-life)',
      'Forgetting that Python uses indentation (spaces/tabs) to define code blocks — mixing them causes IndentationError',
      'Trying to run a .py file without having Python installed on the system',
    ],
    bestPractices: [
      'Use Python 3.10 or newer for the latest features and security patches',
      'Follow PEP 8 style guidelines — use 4 spaces for indentation, not tabs',
      'Use virtual environments (venv) to isolate project dependencies',
    ],
    exercises: [
      'Write a program that prints your name, age, and favorite programming language using three separate print() statements.',
      'Create variables for a rectangle\'s width and height, calculate its area, and print the result.',
      'Write a program that asks "Is Python easy?" and uses an if-statement to print "Yes!" if a variable called easy is set to True.',
    ],
    quizQuestions: [
      {
        question: 'Who created Python?',
        options: ['James Gosling', 'Guido van Rossum', 'Dennis Ritchie', 'Linus Torvalds'],
        answer: 1,
        explanation: 'Guido van Rossum created Python. It was first released in 1991.',
      },
      {
        question: 'Which of the following best describes Python?',
        options: ['Compiled, statically typed', 'Interpreted, dynamically typed', 'Compiled, dynamically typed', 'Interpreted, statically typed'],
        answer: 1,
        explanation: 'Python is interpreted (run line by line) and dynamically typed (types are checked at runtime, not compile time).',
      },
    ],
    interviewQuestions: [
      'What is the difference between Python 2 and Python 3?',
      'Explain what "interpreted language" means and how it differs from a compiled language.',
      'What is the Python Global Interpreter Lock (GIL) and why does it matter for concurrency?',
    ],
    summary: 'Python is a readable, interpreted, dynamically typed language used across web development, data science, automation, and AI. Its clean syntax and massive ecosystem make it the best first programming language.',
    nextTopic: 'Python Introduction',
  },

  {
    id: 'python-introduction',
    title: 'Python Introduction',
    intro: 'Before writing Python code, you need to understand how to install it, run programs, and use the interactive shell. This topic walks you through everything required to get Python working on your machine.',
    whatIsIt: 'Python introduction covers the installation process, running Python interactively vs from files, and the structure of a Python program.',
    whyImportant: 'Setting up Python correctly is the foundation of everything you will build — a broken environment causes endless frustration.',
    simpleExplanation: 'Installing Python is like setting up a kitchen before cooking — once the tools are in place, you can start creating.',
    detailedExplanation: `Python can be downloaded from python.org. During installation on Windows, make sure to check "Add Python to PATH" — this allows you to type 'python' in any terminal and have it work. On macOS and Linux, Python 3 may already be installed, but it is best to check the version with 'python3 --version'.

After installation, you can run Python in two ways. The first is the interactive REPL (Read-Eval-Print Loop): type 'python' in your terminal and you get a prompt (>>>) where you can type expressions and immediately see results. This is great for experimenting. The second way is running a .py script file: write your code in a file, save it, and run it with 'python filename.py'.

For serious development, use an IDE (Integrated Development Environment). VS Code with the Python extension is the most popular free option. PyCharm is another excellent choice, especially for larger projects. Both provide syntax highlighting, code completion, debugging, and virtual environment management.

A virtual environment (venv) is an isolated Python environment for each project. This prevents package version conflicts between projects. Create one with 'python -m venv venv', activate it, and then install packages with pip.`,
    realWorldExample: 'Every professional Python developer uses virtual environments. A data scientist working on two projects — one using TensorFlow 2.10 and another using 2.15 — uses separate venvs to avoid conflicts.',
    syntaxBlock: `# Check Python version
python --version

# Run a script
python my_script.py

# Create a virtual environment
python -m venv venv

# Activate (Windows)
venv\\Scripts\\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install a package
pip install requests`,
    codeExamples: [
      {
        title: 'Interactive Shell vs Script File',
        language: 'python',
        code: `# In the interactive shell (>>>), type expressions and see results immediately
>>> 2 + 2
4
>>> "hello".upper()
'HELLO'
>>> type(42)
<class 'int'>

# In a .py file, use print() to display output
# save as hello.py, then run: python hello.py
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to Python.")`,
        output: `Enter your name: Alice
Hello, Alice! Welcome to Python.`,
        explanation: `The >>> prompt is the interactive REPL. Expressions are evaluated and printed automatically.
In a script file, you need print() to show output. input() reads text from the user.`,
      },
    ],
    exercises: [
      'Install Python 3 and verify the installation by running "python --version" in your terminal.',
      'Open the Python REPL and calculate: (5 + 3) * 2 - 1. Verify the answer is 15.',
      'Create a file called hello.py, write a print statement, and run it from the terminal.',
    ],
    quizQuestions: [
      {
        question: 'What does REPL stand for?',
        options: ['Run Execute Print Loop', 'Read-Eval-Print Loop', 'Real-time Execution and Print Layer', 'Recursive Execution Processing Language'],
        answer: 1,
        explanation: 'REPL stands for Read-Eval-Print Loop — it reads your input, evaluates it, prints the result, and loops back.',
      },
      {
        question: 'What is the purpose of a virtual environment?',
        options: ['To run Python in a browser', 'To speed up Python execution', 'To isolate project-specific packages from other projects', 'To compile Python to machine code'],
        answer: 2,
        explanation: 'Virtual environments keep each project\'s dependencies isolated, preventing version conflicts between projects.',
      },
    ],
    interviewQuestions: [
      'What is pip and how do you use it to manage packages?',
      'What is the difference between running Python interactively and running a script file?',
      'Why should you use virtual environments in Python projects?',
    ],
    summary: 'Getting Python running requires installing it, optionally setting up an IDE, creating virtual environments per project, and understanding the difference between interactive REPL usage and script execution.',
    nextTopic: 'Python Getting Started',
  },

  {
    id: 'python-getting-started',
    title: 'Python Getting Started',
    intro: 'This topic covers the very first things you need to know to write real Python programs: the structure of Python code, how to use pip to install packages, and how to organize a simple project.',
    whatIsIt: 'Getting started with Python means understanding how to write, organize, and run Python code in a real project structure.',
    whyImportant: 'Knowing the right project structure from day one prevents the messy code habits that slow developers down later.',
    simpleExplanation: 'Think of a Python project like a recipe folder — each recipe (file) handles one thing, ingredients (imports) come from a pantry (packages), and instructions (functions) are organized neatly.',
    detailedExplanation: `A Python source file ends in .py. Every Python program begins executing from the top of the file and runs down unless flow-control statements (if, loops, functions) change the direction.

The most important line you'll see in Python files is: if __name__ == '__main__':. This guard means "run this code only when this file is executed directly, not when it is imported by another file." It lets you write reusable modules that also have runnable examples.

Importing is how Python code uses other code — either from the standard library, installed packages, or your own files. You write 'import math' to use Python's built-in math module, or 'from math import sqrt' to import just one function.

Comments make code readable. Single-line comments start with #. Multi-line comments use triple quotes (though technically they are strings that are never assigned). Docstrings are triple-quoted strings at the top of functions, classes, or modules — they document what the code does and are accessible via help().`,
    realWorldExample: 'The Django web framework uses the __name__ guard in its manage.py file so it can be both imported as a module and run directly as a command-line tool.',
    syntaxBlock: `import module_name
from module_name import function_name
from module_name import function1, function2

if __name__ == '__main__':
    # Code here only runs when file is executed directly
    main()`,
    codeExamples: [
      {
        title: 'A Well-Structured Python Program',
        language: 'python',
        code: `"""
calculator.py — A simple calculator module.
This docstring describes the module.
"""
import math  # Standard library import

def add(a, b):
    """Return the sum of a and b."""
    return a + b

def circle_area(radius):
    """Return the area of a circle given its radius."""
    return math.pi * radius ** 2

def main():
    # Entry point of the program
    result = add(10, 25)
    print(f"10 + 25 = {result}")

    area = circle_area(7)
    print(f"Circle area (r=7): {area:.2f}")

if __name__ == '__main__':
    main()`,
        output: `10 + 25 = 35
Circle area (r=7): 153.94`,
        explanation: `Line 1-4: Module-level docstring describing what the file does
Line 5: Import the standard math module to use math.pi
Lines 7-8: A function with a docstring — accessible via help(add)
Line 16: main() is the entry point — called only when this file runs directly
Line 19: The __name__ guard prevents main() from running when this file is imported`,
      },
    ],
    commonMistakes: [
      'Forgetting the __name__ guard — causes side effects when your module is imported',
      'Circular imports — file A imports file B which imports file A, causing an ImportError',
      'Using relative imports incorrectly when files are in different directories',
    ],
    bestPractices: [
      'Always add a module docstring at the top of each .py file',
      'Use the if __name__ == "__main__": guard in every script that can also be imported',
      'Keep imports at the top of the file, separated into standard library, third-party, and local',
    ],
    exercises: [
      'Create a greetings.py file with a greet(name) function and a main() function that calls it, protected by __name__ guard.',
      'Write a module that imports the random standard library and uses it to generate three random numbers between 1 and 100.',
      'Install the requests library using pip and write a script that imports it (just import requests; print(requests.__version__)).',
    ],
    quizQuestions: [
      {
        question: 'What does if __name__ == "__main__": do?',
        options: ['Checks if the variable __name__ has been set', 'Runs code only when the file is executed directly, not when imported', 'Defines the main function in Python', 'Checks if the program is running as root/admin'],
        answer: 1,
        explanation: 'When a Python file is run directly, __name__ equals "__main__". When imported, __name__ is the module name. This guard separates executable code from reusable code.',
      },
      {
        question: 'What is a docstring in Python?',
        options: ['A comment starting with #', 'A string literal used as documentation for modules, classes, or functions', 'A special Python keyword for writing docs', 'An external documentation file'],
        answer: 1,
        explanation: 'Docstrings are triple-quoted strings placed at the top of a module, class, or function. They are accessible with help() and tools like Sphinx use them to auto-generate documentation.',
      },
    ],
    interviewQuestions: [
      'Explain the purpose of if __name__ == "__main__": and give a practical use case.',
      'What is the difference between "import math" and "from math import sqrt"?',
      'How do you structure a Python project with multiple files that import from each other?',
    ],
    summary: 'A well-structured Python file uses docstrings, organized imports, clearly defined functions, and a __name__ guard. Understanding this structure from the beginning makes your code professional and reusable.',
    nextTopic: 'Python Syntax',
  },

  {
    id: 'python-syntax',
    title: 'Python Syntax',
    intro: 'Python syntax is the set of rules that define how Python programs must be written. Unlike most languages, Python uses indentation — not curly braces — to define code blocks, making programs visually clean and structured.',
    whatIsIt: 'Python syntax is the grammar of the language — the rules for writing statements, expressions, blocks, and identifiers correctly.',
    whyImportant: 'Understanding syntax prevents the most common beginner errors (IndentationError, SyntaxError) and helps you read Python code written by others.',
    simpleExplanation: 'Python syntax is like the grammar of a language — just as you cannot write a sentence without following grammar rules, you cannot write Python code without following syntax rules.',
    detailedExplanation: `Python uses newlines to end statements, unlike languages like Java or C that require semicolons. You can use semicolons to put multiple statements on one line, but this is strongly discouraged and considered bad style.

Indentation is the core of Python syntax. A block of code (everything inside a function, loop, or conditional) must be indented consistently. The standard is 4 spaces per level. Python raises an IndentationError if the indentation is inconsistent, and a SyntaxError if the code structure is wrong.

Python identifiers (variable names, function names, class names) must start with a letter or underscore, followed by letters, digits, or underscores. They are case-sensitive: 'name', 'Name', and 'NAME' are three different variables. Conventionally, variables and functions use snake_case (my_variable), classes use PascalCase (MyClass), and constants use ALL_CAPS (MAX_SIZE).

Python has reserved keywords that cannot be used as identifiers: False, None, True, and, as, assert, async, await, break, class, continue, def, del, elif, else, except, finally, for, from, global, if, import, in, is, lambda, nonlocal, not, or, pass, raise, return, try, while, with, yield.`,
    realWorldExample: 'Python\'s syntax requirement for consistent indentation means that all Python code worldwide looks visually similar, making open-source collaboration easier — any Python developer can read code written by another.',
    syntaxBlock: `# Statement ends at newline (no semicolon needed)
x = 10
y = 20

# Indentation defines blocks (4 spaces standard)
if x < y:
    print("x is smaller")  # inside the if block
    print("still inside")  # also inside
print("outside the block")  # back at top level

# Line continuation with backslash
total = 1 + 2 + 3 + \
        4 + 5 + 6

# Implicit continuation inside brackets
result = (1 + 2 +
          3 + 4)`,
    codeExamples: [
      {
        title: 'Syntax Rules in Action',
        language: 'python',
        code: `# Correct indentation
def check_score(score):
    if score >= 90:
        grade = "A"
        print(f"Score {score} -> Grade: {grade}")
    elif score >= 80:
        grade = "B"
        print(f"Score {score} -> Grade: {grade}")
    else:
        grade = "C or below"
        print(f"Score {score} -> Grade: {grade}")

# Case sensitivity
Name = "Alice"
name = "Bob"
NAME = "CHARLIE"
print(Name, name, NAME)  # Three different variables

# Multiple assignment on one line
a, b, c = 1, 2, 3
print(a, b, c)`,
        output: `Score 95 -> Grade: A
Alice Bob CHARLIE
1 2 3`,
        explanation: `The check_score function uses consistent 4-space indentation for each block level.
elif and else must align with their if — they are part of the same structure.
Name, name, and NAME are three completely separate variables — Python is case-sensitive.
Multiple assignment (a, b, c = 1, 2, 3) assigns three values at once using tuple unpacking.`,
      },
    ],
    commonMistakes: [
      'Mixing tabs and spaces for indentation — always use spaces (4 spaces per level)',
      'Using a Python keyword as a variable name (e.g., list = [1,2,3] shadows the built-in list)',
      'Forgetting the colon (:) at the end of if, for, while, def, and class statements',
    ],
    bestPractices: [
      'Configure your editor to insert 4 spaces when you press Tab',
      'Follow PEP 8 naming conventions: snake_case for variables/functions, PascalCase for classes',
      'Use parentheses for line continuation instead of backslashes — cleaner and safer',
    ],
    exercises: [
      'Write a function called greet(name, formal=False) that prints "Hello, {name}" or "Good day, {name}" based on the formal flag. Test both cases.',
      'Find 3 syntax errors in this code: def add(a,b) return a+b; print(add(5  10))',
      'Write a small program demonstrating case sensitivity: create variables myAge, myage, and MYAGE with values 25, 30, 35 and print all three.',
    ],
    quizQuestions: [
      {
        question: 'What character is required at the end of if, for, while, def, and class statements in Python?',
        options: ['Semicolon (;)', 'Colon (:)', 'Curly brace ({)', 'Parenthesis (()'],
        answer: 1,
        explanation: 'Python requires a colon (:) at the end of compound statements to indicate the start of an indented block.',
      },
      {
        question: 'Which naming convention does PEP 8 recommend for Python function names?',
        options: ['camelCase', 'PascalCase', 'snake_case', 'ALL_CAPS'],
        answer: 2,
        explanation: 'PEP 8 recommends snake_case for function and variable names (e.g., calculate_area), PascalCase for classes, and ALL_CAPS for constants.',
      },
    ],
    interviewQuestions: [
      'Why does Python use indentation instead of curly braces to define code blocks?',
      'What happens if you mix tabs and spaces in Python code?',
      'Explain the difference between a SyntaxError and an IndentationError in Python.',
    ],
    summary: 'Python syntax uses indentation for code blocks, colons to start blocks, case-sensitive identifiers, and newlines to end statements. Following PEP 8 style guidelines keeps code readable and consistent.',
    nextTopic: 'Python Comments',
  },

  {
    id: 'python-comments',
    title: 'Python Comments',
    intro: 'Comments are lines of text in your code that Python ignores when running the program. They exist purely for humans — to explain what the code does, why a decision was made, or to temporarily disable code during debugging.',
    whatIsIt: 'A comment is non-executable text in source code used to document logic, explain intent, or disable code temporarily.',
    whyImportant: 'Well-commented code is maintainable code. Six months from now, comments remind you (and your team) why you wrote code a certain way.',
    simpleExplanation: 'Comments are like sticky notes on your code — they don\'t change how the code runs, but they leave helpful reminders for anyone reading it.',
    detailedExplanation: `Python has one syntax for single-line comments: the hash symbol (#). Everything after # on a line is ignored by the interpreter. Comments can appear on their own line or at the end of a code line (inline comments).

Python does not have a dedicated multi-line comment syntax. Developers use multiple # lines for longer explanations. You will also see triple-quoted strings ("""...""" or '''...''') used as multi-line comments — while they technically work (Python evaluates the string but discards it), they are not true comments. The proper use of triple-quoted strings is for docstrings (documentation strings), not comments.

Good comments explain WHY something is done, not WHAT it does. Code already shows what it does — comments add context. For example, 'i += 1' is obvious; what needs a comment is why you skip index 0, or why you multiply by 1.2 for a tax rate.

Comments are also used to temporarily disable code during debugging. Instead of deleting code you might want to restore, you comment it out. Most editors allow you to toggle comments with Ctrl+/ (Cmd+/ on Mac).`,
    realWorldExample: 'The Python CPython source code uses comments extensively to reference PEP documents ("# See PEP 572 for details") and to explain non-obvious optimizations in the interpreter implementation.',
    syntaxBlock: `# Single-line comment
x = 5  # Inline comment

# Multi-line comment using multiple # lines
# This is line 1
# This is line 2

"""
This is a docstring, not a comment.
Used at the top of modules, classes, and functions.
"""`,
    codeExamples: [
      {
        title: 'Good vs Bad Comments',
        language: 'python',
        code: `# BAD comment — states the obvious, adds no value
x = x + 1  # add 1 to x

# GOOD comment — explains WHY
retry_count += 1  # Increment before checking so 0 retries = first attempt

# BAD comment — restating what the code does
# Loop through the list
for item in items:
    process(item)

# GOOD comment — explains a non-obvious business rule
# Price increases by 8% above 1000 units due to supplier surcharge
if quantity > 1000:
    unit_price *= 1.08

# Docstring for a function (triple quotes)
def calculate_tax(income, rate=0.20):
    """
    Calculate income tax.

    Args:
        income: Gross income in USD
        rate: Tax rate as a decimal (default 20%)

    Returns:
        Tax amount in USD
    """
    return income * rate`,
        output: '',
        explanation: `Good comments explain decisions and context — the WHY behind the code.
Bad comments just restate what is already obvious from reading the code itself.
Docstrings (triple-quoted strings directly under def/class) are the official way to document functions and classes — they power Python\'s help() system.`,
      },
    ],
    commonMistakes: [
      'Writing comments that just restate the code ("x = x + 1 # adds 1 to x")',
      'Leaving outdated comments that no longer match the code — misleading comments are worse than no comments',
      'Using triple-quoted strings as multi-line comments in function bodies (use # for comments, """ only for docstrings)',
    ],
    bestPractices: [
      'Write comments that explain WHY, not WHAT',
      'Keep comments up-to-date when you change the code',
      'Use docstrings (""") for all public functions, classes, and modules',
    ],
    exercises: [
      'Take this function — def d(l): return sum(l)/len(l) — add a proper docstring and rename it to be self-explanatory, removing the need for comments.',
      'Write a 20-line program that uses at least 3 meaningful inline comments explaining non-obvious decisions.',
      'Read a 10-line function and write a proper docstring for it describing its purpose, parameters, and return value.',
    ],
    quizQuestions: [
      {
        question: 'What is the correct symbol for a single-line comment in Python?',
        options: ['//', '/* */', '#', '--'],
        answer: 2,
        explanation: 'Python uses # for single-line comments. Everything after # on that line is ignored by the interpreter.',
      },
      {
        question: 'What is the main purpose of a docstring in Python?',
        options: ['To comment out blocks of code', 'To document modules, functions, and classes for the help() system', 'To write multi-line comments without using #', 'To define string constants'],
        answer: 1,
        explanation: 'Docstrings are formal documentation strings used by tools like help(), IDEs, and documentation generators. They belong at the top of modules, classes, and functions.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a comment and a docstring in Python?',
      'How does Python\'s help() function use docstrings?',
      'Describe the difference between commenting-out code and using version control for the same purpose.',
    ],
    summary: 'Python uses # for comments and triple-quoted strings for docstrings. Great comments explain why code works a certain way, not what it does. Keep comments accurate and up-to-date.',
    nextTopic: 'Python Variables',
  },

  {
    id: 'python-variables',
    title: 'Python Variables',
    intro: 'Variables are named containers that store data values. In Python, you create a variable simply by assigning a value to a name — no type declaration is needed. Python determines the type automatically based on the value assigned.',
    whatIsIt: 'A variable is a symbolic name that refers to a value stored in memory. In Python, variables are references (pointers) to objects, not boxes that hold values directly.',
    whyImportant: 'Variables are how programs remember information between steps. Without variables, every calculation would need to be repeated from scratch.',
    simpleExplanation: 'A variable is like a labeled box. You put something inside the box, stick a label on it, and then use that label whenever you need what\'s inside.',
    detailedExplanation: `In Python, the assignment operator = does not mean "equals" in the mathematical sense. It means "bind the name on the left to the value on the right." When you write x = 5, Python creates an integer object with value 5 in memory and makes x point to that object.

This reference-based model has an important implication: when you do y = x, you are making y point to the same object as x, not creating a copy of x. For immutable types (int, float, str, tuple), this distinction is invisible. For mutable types (list, dict), it matters greatly — changing a list through one variable name changes it for all names pointing to that list.

Python variables are dynamically typed, meaning a variable can hold different types at different times. x = 5 makes x an int; x = "hello" reassigns x to a str. The variable itself has no type — only the object it points to has a type.

Variable naming rules: must start with a letter or underscore, followed by letters, digits, or underscores. Case-sensitive. Cannot use reserved keywords. Conventions: use descriptive names (student_age not sa), use snake_case, avoid single-letter names except in loops (i, j) or mathematical formulas.`,
    realWorldExample: 'In an e-commerce application, variables like cart_total, discount_percentage, and user_email store and update customer-specific data throughout the checkout process.',
    syntaxBlock: `variable_name = value         # Assignment
x, y, z = 1, 2, 3            # Multiple assignment
a = b = c = 0                 # Chain assignment
del variable_name             # Delete a variable`,
    codeExamples: [
      {
        title: 'Variables — Assignment, Types, and Scope',
        language: 'python',
        code: `# Simple assignment
age = 25
name = "Alice"
is_student = True
gpa = 3.85

# Python knows the type automatically
print(type(age))       # <class 'int'>
print(type(name))      # <class 'str'>
print(type(is_student)) # <class 'bool'>

# Multiple assignment (unpacking)
x, y, z = 10, 20, 30
print(x, y, z)

# Swap values (Python-specific trick)
x, y = y, x
print(x, y)  # 20, 10 — swapped!

# Dynamic typing — variable can change type
score = 95        # int
score = "A"       # now a str — perfectly valid
print(score)

# Delete a variable
temp = 42
del temp
# print(temp)  # Would raise NameError`,
        output: `<class 'int'>
<class 'str'>
<class 'bool'>
10 20 30
20 10
A`,
        explanation: `type() returns the data type of any variable — useful for debugging.
Multiple assignment lets you assign several variables in one line using tuple unpacking.
The swap trick (x, y = y, x) works without a temporary variable — Python evaluates the right side first.
Dynamic typing means the same variable name can hold different types at different times.
del removes the variable binding — the name no longer refers to any object.`,
      },
    ],
    commonMistakes: [
      'Using a variable before assigning it — causes NameError',
      'Shadowing built-in names: writing list = [1,2,3] or str = "hello" overwrites Python\'s built-in types',
      'Assuming y = x creates a copy — for mutable objects (lists, dicts), y and x point to the same object',
    ],
    bestPractices: [
      'Use descriptive names: student_count not sc, is_valid not flag',
      'Avoid single-letter names except in short loops or math formulas',
      'Use ALL_CAPS for constants (MAX_RETRIES = 3, PI = 3.14159)',
    ],
    exercises: [
      'Create variables for your name, age, height (in meters), and whether you are a student. Print each using an f-string.',
      'Demonstrate Python\'s swap trick: assign x=100 and y=200, swap them without a temp variable, and print the result.',
      'Show dynamic typing: assign a variable the value 42, print its type, then reassign it to the string "forty-two" and print its type again.',
    ],
    quizQuestions: [
      {
        question: 'What happens when you write y = x in Python where x is a list?',
        options: ['y becomes an independent copy of x', 'y and x point to the same list object', 'Python raises a TypeError', 'y becomes a frozen copy of x'],
        answer: 1,
        explanation: 'In Python, assignment creates a reference, not a copy. y = x makes both y and x point to the same list. To get a copy, use y = x.copy() or y = x[:].',
      },
      {
        question: 'Which variable name is NOT valid in Python?',
        options: ['_my_var', 'myVar2', '2myvar', '__dunder__'],
        answer: 2,
        explanation: 'Variable names cannot start with a digit. "2myvar" is invalid. All others are valid Python identifiers.',
      },
    ],
    interviewQuestions: [
      'Explain the difference between mutable and immutable objects in Python and how it relates to variable assignment.',
      'What is dynamic typing and how does it differ from static typing in languages like Java?',
      'What is variable shadowing and why is it considered a bad practice?',
    ],
    summary: 'Python variables are references to objects. Assignment binds a name to an object. Python is dynamically typed — variables can hold any type and change type at runtime. Always use descriptive, snake_case names.',
    nextTopic: 'Python Data Types',
  },

  {
    id: 'python-data-types',
    title: 'Python Data Types',
    intro: 'Python has several built-in data types that represent different kinds of values — numbers, text, collections, booleans, and more. Understanding each type and when to use it is essential to writing effective Python code.',
    whatIsIt: 'A data type defines the kind of value a variable holds and what operations can be performed on it.',
    whyImportant: 'Choosing the wrong data type leads to bugs and performance issues — knowing when to use a list vs a set vs a dict separates good Python from great Python.',
    simpleExplanation: 'Data types are like different containers: a glass for liquids (string for text), a jar for many items (list for collections), a lock box for unique items (set), and a labeled folder system (dict for key-value pairs).',
    detailedExplanation: `Python\'s core data types are organized into categories:

Numeric types: int (integers of any size), float (decimal numbers), complex (a + bj). Python integers have unlimited precision — you can work with numbers with thousands of digits.

Sequence types: str (immutable text), list (mutable ordered collection), tuple (immutable ordered collection), range (immutable sequence of numbers).

Mapping type: dict (key-value pairs, ordered since Python 3.7).

Set types: set (unordered unique items, mutable), frozenset (unordered unique items, immutable).

Boolean: bool — a subclass of int where True equals 1 and False equals 0.

None type: NoneType — the single value None, representing absence of value.

You can check an object's type with type(), or check if it's an instance of a type with isinstance(). The isinstance() approach is preferred in production code because it respects inheritance.`,
    realWorldExample: 'A user database uses strings for names and emails, integers for IDs and ages, floats for salaries, booleans for is_active flags, lists for user roles, and dicts for structured profile data.',
    codeExamples: [
      {
        title: 'Python Built-in Data Types Overview',
        language: 'python',
        code: `# Numeric types
integer_val = 42
big_int = 10 ** 100     # Python handles arbitrarily large integers
float_val = 3.14159
complex_val = 3 + 4j

# Sequence types
text = "Hello, Python"         # str — immutable
numbers = [1, 2, 3, 4, 5]     # list — mutable
coords = (10.5, 20.3)          # tuple — immutable
countdown = range(5, 0, -1)    # range

# Mapping type
student = {
    "name": "Alice",
    "grade": "A",
    "score": 95
}

# Set types
unique_ids = {101, 102, 103, 102}  # {101, 102, 103} — duplicates removed

# Boolean
is_active = True
is_admin = False

# None
result = None  # No value assigned yet

# Type checking
print(type(integer_val))  # <class 'int'>
print(type(text))          # <class 'str'>
print(isinstance(42, int)) # True
print(isinstance(42, (int, float)))  # True — checks multiple types`,
        output: `<class 'int'>
<class 'str'>
True
True`,
        explanation: `Python integers have unlimited precision — 10**100 is calculated exactly.
Strings, tuples, and ranges are immutable — you cannot change them in place.
Lists, dicts, and sets are mutable — you can add, remove, and modify items.
isinstance() is preferred over type() because it handles subclasses correctly.
Sets automatically remove duplicates — {101, 102, 103, 102} becomes {101, 102, 103}.`,
      },
    ],
    commonMistakes: [
      'Using a list when uniqueness is required — use a set instead',
      'Using a list of tuples instead of a dict when key-value lookup is needed',
      'Comparing with type() instead of isinstance() — misses subclasses',
    ],
    bestPractices: [
      'Use tuples for fixed data that should not change (coordinates, RGB colors, database records)',
      'Use sets for membership testing and deduplication — O(1) lookup vs O(n) for lists',
      'Use type annotations (x: int = 5) to document expected types without enforcing them at runtime',
    ],
    exercises: [
      'Create one variable of each core Python type and print both the value and its type.',
      'Create a set from a list [1, 2, 2, 3, 3, 3, 4] and observe that duplicates are removed.',
      'Create a dict representing a book with keys: title, author, year, pages. Access each value and print them.',
    ],
    quizQuestions: [
      {
        question: 'Which Python data type automatically removes duplicate values?',
        options: ['list', 'tuple', 'set', 'dict'],
        answer: 2,
        explanation: 'A set only stores unique values. Adding a duplicate to a set has no effect. This makes sets ideal for deduplication and fast membership testing.',
      },
      {
        question: 'What is the value of True + True + False in Python?',
        options: ['TypeError', '2', 'True', '"TrueTrue"'],
        answer: 1,
        explanation: 'In Python, bool is a subclass of int. True equals 1 and False equals 0. So True + True + False = 1 + 1 + 0 = 2.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a list and a tuple in Python? When would you choose one over the other?',
      'Explain the difference between mutable and immutable types with examples.',
      'What is the time complexity of membership testing (x in collection) for a list, set, and dict in Python?',
    ],
    summary: 'Python has numeric (int, float, complex), sequence (str, list, tuple, range), mapping (dict), set, bool, and NoneType data types. Choose the right type for the job: sets for uniqueness, dicts for key-value lookup, tuples for immutable sequences.',
    nextTopic: 'Python Numbers',
  },

  {
    id: 'python-numbers',
    title: 'Python Numbers',
    intro: 'Python supports three numeric types: integers (whole numbers of unlimited size), floats (decimal numbers), and complex numbers. Python also provides a rich set of arithmetic operators and a math module for advanced calculations.',
    whatIsIt: 'Python numbers are the int, float, and complex types, plus the arithmetic operators and built-in functions that work on them.',
    whyImportant: 'Every calculation in programming uses numeric types — from loop counters to financial calculations, engineering formulas to machine learning models.',
    simpleExplanation: 'Think of int as counting numbers (1, 2, 3...), float as measuring numbers (3.14, 2.71...), and complex as coordinates on a 2D mathematical plane.',
    detailedExplanation: `Python integers (int) have unlimited precision. You can compute factorial(1000) or work with RSA encryption keys without overflow. This is unlike C/Java where integers have fixed sizes (32-bit, 64-bit).

Python floats (float) are 64-bit double-precision IEEE 754 numbers. They can represent values from approximately 5×10⁻³²⁴ to 1.8×10³⁰⁸ with about 15-17 significant decimal digits of precision. This limited precision causes the classic floating-point issue: 0.1 + 0.2 does not equal exactly 0.3. For financial calculations requiring exact decimal arithmetic, use the decimal module.

Arithmetic operators: + (add), - (subtract), * (multiply), / (divide, always returns float), // (floor divide, returns int), % (modulo/remainder), ** (exponentiation). The division operator / always returns a float even for whole-number results (10/2 = 5.0). Use // for integer division (10//2 = 5).

The math module provides: math.sqrt(), math.floor(), math.ceil(), math.abs(), math.log(), math.sin(), math.cos(), math.pi, math.e, math.factorial(), math.gcd().`,
    realWorldExample: 'A banking system uses Python\'s decimal module (not float) to store monetary values, preventing the floating-point rounding errors that would cause balance discrepancies of fractions of cents across millions of transactions.',
    formula: `Floor division: a // b = ⌊a ÷ b⌋
Modulo: a % b = a - (a // b) * b
Exponentiation: a ** b = a^b
Absolute value: abs(a)`,
    codeExamples: [
      {
        title: 'Numbers and Arithmetic',
        language: 'python',
        code: `import math
from decimal import Decimal

# Integer arithmetic (unlimited precision)
print(2 ** 64)          # 18446744073709551616
print(math.factorial(20))  # 2432902008176640000

# Float precision issue
print(0.1 + 0.2)        # 0.30000000000000004
print(0.1 + 0.2 == 0.3) # False !

# Use Decimal for precise arithmetic
a = Decimal("0.1")
b = Decimal("0.2")
print(a + b)            # 0.3 (exact)
print(a + b == Decimal("0.3"))  # True

# Arithmetic operators
print(17 / 5)   # 3.4   (true division)
print(17 // 5)  # 3     (floor division)
print(17 % 5)   # 2     (remainder)
print(2 ** 10)  # 1024  (power)

# Useful built-ins
print(abs(-42))         # 42
print(round(3.7))       # 4
print(round(3.14159, 2)) # 3.14
print(divmod(17, 5))    # (3, 2) — quotient and remainder

# Math module
print(math.sqrt(144))   # 12.0
print(math.ceil(4.1))   # 5
print(math.floor(4.9))  # 4`,
        output: `18446744073709551616
2432902008176640000
0.30000000000000004
False
0.3
True
3.4
3
2
1024
42
4
3.14
(3, 2)
12.0
5
4`,
        explanation: `Python integers are unlimited in size — 2**64 is computed exactly.
The floating-point precision issue (0.1 + 0.2 ≠ 0.3) is a fundamental IEEE 754 limitation, not a Python bug.
The Decimal module provides exact decimal arithmetic for financial calculations.
// is floor division (rounds down), % gives the remainder.
divmod(a, b) efficiently returns both the quotient and remainder in one call.`,
      },
    ],
    commonMistakes: [
      'Using == to compare floats — always use abs(a - b) < epsilon for float comparison',
      'Using float for currency calculations — use the decimal module instead',
      'Forgetting that / always returns float in Python 3 (10/2 = 5.0, not 5)',
    ],
    bestPractices: [
      'Use the decimal module for financial calculations',
      'Use the fractions module for exact rational arithmetic',
      'When comparing floats, use math.isclose(a, b) instead of a == b',
    ],
    exercises: [
      'Calculate the compound interest on $1000 at 5% annual rate for 10 years using the formula A = P(1 + r)^t.',
      'Write a function that converts Celsius to Fahrenheit (F = C * 9/5 + 32) and test it for 0°C, 100°C, and -40°C.',
      'Demonstrate the floating-point issue by showing 0.1 + 0.2 != 0.3, then fix it using the decimal module.',
    ],
    quizQuestions: [
      {
        question: 'What is the result of 10 / 3 in Python 3?',
        options: ['3', '3.0', '3.3333333333333335', 'TypeError'],
        answer: 2,
        explanation: 'In Python 3, / always performs true division and returns a float. 10 / 3 = 3.3333333333333335. For integer division, use //.',
      },
      {
        question: 'Which module should you use for precise decimal arithmetic in financial applications?',
        options: ['math', 'fractions', 'decimal', 'numbers'],
        answer: 2,
        explanation: 'The decimal module provides arbitrary-precision decimal arithmetic that avoids floating-point rounding errors, making it suitable for financial calculations.',
      },
    ],
    interviewQuestions: [
      'Why does 0.1 + 0.2 not equal 0.3 in Python (and most languages)? How do you handle this?',
      'What is the difference between / and // operators in Python?',
      'When would you use Python\'s decimal module over the built-in float type?',
    ],
    summary: 'Python has int (unlimited precision), float (64-bit IEEE 754), and complex numbers. Use // for floor division, % for modulo, ** for powers. Use the decimal module for exact financial arithmetic and math.isclose() for float comparison.',
    nextTopic: 'Python Casting',
  },

  {
    id: 'python-casting',
    title: 'Python Casting',
    intro: 'Type casting (or type conversion) is the process of converting a value from one data type to another. Python provides built-in functions to convert between types explicitly, and also performs some conversions automatically in certain contexts.',
    whatIsIt: 'Casting is converting a value from one type to another using Python\'s built-in type constructor functions: int(), float(), str(), bool(), list(), tuple(), set(), dict().',
    whyImportant: 'User input always arrives as a string. Converting it to the correct type (int, float) before calculations is a fundamental operation in every real program.',
    simpleExplanation: 'Casting is like converting currencies — a number can be in "int dollars" or "float dollars", and you use the conversion function to get the right format for the job.',
    detailedExplanation: `Python distinguishes between implicit conversion (coercion) and explicit conversion (casting).

Implicit conversion happens automatically in expressions: when you add an int and a float, Python automatically converts the int to a float before adding. When you use True or False in arithmetic, Python treats them as 1 and 0 automatically.

Explicit casting requires calling a type function. int("42") converts the string "42" to the integer 42. float("3.14") converts the string "3.14" to the float 3.14. str(42) converts the integer 42 to the string "42". bool(0) is False; bool(1) or any non-zero value is True. bool("") is False; bool("anything") is True.

int() truncates floats (rounds toward zero) — int(3.9) gives 3, not 4. For rounding, use round(). For floor/ceiling, use math.floor()/math.ceil().

Conversion can raise exceptions: int("hello") raises ValueError because "hello" cannot be parsed as an integer. Always validate input before casting, or use try/except to handle conversion errors gracefully.`,
    realWorldExample: 'When a web form sends a user\'s age as a text string "25", you cast it with int("25") before doing any age validation logic. Without casting, age > 18 would compare a string to an integer and give wrong results.',
    syntaxBlock: `int(value)      # Convert to integer
float(value)    # Convert to float
str(value)      # Convert to string
bool(value)     # Convert to boolean
list(value)     # Convert to list
tuple(value)    # Convert to tuple
set(value)      # Convert to set`,
    codeExamples: [
      {
        title: 'Type Casting Examples',
        language: 'python',
        code: `# String to number (common with user input)
age_str = "25"
age = int(age_str)
height_str = "1.75"
height = float(height_str)

print(f"Age: {age}, Type: {type(age)}")
print(f"Height: {height}, Type: {type(height)}")

# Float to int (truncates, does NOT round)
print(int(3.9))   # 3
print(int(-3.9))  # -3 (toward zero)
print(round(3.9)) # 4 (rounds to nearest)

# Number to string (for concatenation)
score = 95
message = "Your score: " + str(score) + " points"
print(message)

# Boolean casting — falsy values
print(bool(0))     # False
print(bool(0.0))   # False
print(bool(""))    # False
print(bool([]))    # False
print(bool(None))  # False
print(bool(42))    # True
print(bool("hi"))  # True

# Safe casting with try/except
def safe_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

print(safe_int("42"))     # 42
print(safe_int("hello"))  # None`,
        output: `Age: 25, Type: <class 'int'>
Height: 1.75, Type: <class 'float'>
3
-3
4
Your score: 95 points
False
False
False
False
False
True
True
42
None`,
        explanation: `User input (like "25") is always a string — cast it with int() before arithmetic.
int() truncates floats toward zero — int(3.9) = 3, not 4. Use round() for rounding.
Falsy values in Python: 0, 0.0, "", [], {}, set(), None. Everything else is truthy.
Always wrap user-provided casting in try/except to handle bad input gracefully.`,
      },
    ],
    commonMistakes: [
      'Forgetting that user input (input()) is always a string — must cast before arithmetic',
      'Using int() on a string like "3.14" — this raises ValueError; use float() first',
      'Expecting int(3.9) to round up to 4 — it truncates to 3. Use round() instead.',
    ],
    bestPractices: [
      'Always validate and cast user input before using it in calculations',
      'Use try/except around any casting that might receive invalid input',
      'Prefer str.isdigit() or str.isnumeric() to check if a string can be safely cast to int',
    ],
    exercises: [
      'Write a program that asks the user for two numbers (as input), casts them to float, and prints their sum, difference, product, and quotient.',
      'Demonstrate that int(3.7) = 3 (truncation) and round(3.7) = 4 (rounding). Show both for 3.5 as well.',
      'Write a safe_float() function that returns None if the string cannot be converted to float.',
    ],
    quizQuestions: [
      {
        question: 'What is the result of int(3.9) in Python?',
        options: ['4', '3', '3.9', 'ValueError'],
        answer: 1,
        explanation: 'int() truncates toward zero — it removes the decimal part without rounding. int(3.9) = 3. Use round(3.9) to get 4.',
      },
      {
        question: 'Which of the following is a falsy value in Python?',
        options: ['"False"', '0.001', '[]', '(0,)'],
        answer: 2,
        explanation: 'An empty list [] is falsy in Python. A non-empty string like "False" is truthy. 0.001 is non-zero (truthy). A tuple with one element (0,) is non-empty (truthy).',
      },
    ],
    interviewQuestions: [
      'What is the difference between implicit and explicit type conversion in Python?',
      'Why does int("3.14") raise a ValueError? How would you handle converting the string "3.14" to an integer?',
      'List five values that are falsy in Python and explain why this matters for conditional logic.',
    ],
    summary: 'Use int(), float(), str(), bool() and other type functions for explicit casting. int() truncates floats; use round() for rounding. Falsy values include 0, empty sequences, None. Always guard user-input casting with try/except.',
    nextTopic: 'Python Strings',
  },

  {
    id: 'python-strings',
    title: 'Python Strings',
    intro: 'Strings are sequences of characters used to store and manipulate text. Python strings are immutable, support a huge library of methods, and offer multiple ways to format and interpolate values — making text processing one of Python\'s strongest features.',
    whatIsIt: 'A Python string (str) is an immutable ordered sequence of Unicode characters, supporting indexing, slicing, and a rich set of built-in methods.',
    whyImportant: 'Text processing is everywhere — user input, file content, API responses, HTML, JSON — all arrive as strings that must be parsed, cleaned, and formatted.',
    simpleExplanation: 'A string is like a bead necklace where each bead is a character. You can look at any bead by its position, take a section of the necklace (slice), but you cannot change individual beads — you have to make a new necklace.',
    detailedExplanation: `Strings can be created with single quotes ('hello'), double quotes ("hello"), or triple quotes ("""hello"""). Triple-quoted strings preserve newlines and are used for docstrings and multi-line text.

Strings are indexed from 0. s[0] is the first character, s[-1] is the last. Slicing extracts a substring: s[start:end:step]. s[2:5] gives characters at indices 2, 3, 4. s[::-1] reverses the string. s[:3] gives the first three characters.

Python provides dozens of string methods: upper(), lower(), strip(), lstrip(), rstrip(), split(), join(), replace(), startswith(), endswith(), find(), count(), isdigit(), isalpha(), isspace(), title(), capitalize(), center(), ljust(), rjust().

For string formatting (creating strings with variable values), Python offers three approaches: % formatting (old style), .format() method, and f-strings (modern, recommended). F-strings (f"Hello, {name}!") are the most readable and performant. They support any Python expression inside {}: f"{2 + 2}", f"{name.upper()}", f"{price:.2f}".

Strings are immutable — every method returns a new string. Repeated string concatenation in a loop (s += "x") creates many intermediate strings and is slow. Use "".join(list_of_parts) for efficient string building.`,
    realWorldExample: 'A data pipeline that processes CSV files uses split(",") to parse rows, strip() to clean whitespace, lower() to normalize field names, and f-strings to format SQL queries or log messages.',
    syntaxBlock: `s = "Hello, World"
s[0]          # 'H'
s[-1]         # 'd'
s[0:5]        # 'Hello'
s[::2]        # 'Hlo ol'
s[::-1]       # 'dlroW ,olleH'
len(s)        # 12
f"{s.lower()}"  # 'hello, world'`,
    codeExamples: [
      {
        title: 'String Operations and Methods',
        language: 'python',
        code: `# Creation
s1 = 'single quotes'
s2 = "double quotes"
s3 = """triple
quoted
string"""

# Indexing and slicing
word = "Python"
print(word[0])      # P
print(word[-1])     # n
print(word[2:5])    # tho
print(word[::-1])   # nohtyP

# Common methods
text = "  Hello, World!  "
print(text.strip())          # 'Hello, World!'
print(text.lower())          # '  hello, world!  '
print(text.replace("World", "Python"))
print("hello world".title()) # 'Hello World'

# Splitting and joining
csv = "Alice,Bob,Charlie"
names = csv.split(",")       # ['Alice', 'Bob', 'Charlie']
print(names)
print(" | ".join(names))     # 'Alice | Bob | Charlie'

# F-string formatting
name = "Alice"
score = 98.5
print(f"Student: {name}, Score: {score:.1f}")
print(f"Upper: {name.upper()}, Next: {score + 1.5:.0f}")

# Check methods
print("12345".isdigit())     # True
print("hello".isalpha())     # True
print("hello world".startswith("hello"))  # True`,
        output: `P
n
tho
nohtyP
Hello, World!
  hello, world!
  Hello, Python!
Hello World
['Alice', 'Bob', 'Charlie']
Alice | Bob | Charlie
Student: Alice, Score: 98.5
Upper: ALICE, Next: 100
True
True
True`,
        explanation: `Negative indices count from the end: [-1] is the last character.
Slicing [start:end] excludes the end index. [2:5] gives positions 2, 3, 4.
[::-1] reverses using a step of -1.
strip() removes leading and trailing whitespace (use lstrip/rstrip for one side).
split() turns a string into a list; join() turns a list back into a string — they are inverse operations.
F-strings support format specs: :.2f for 2 decimal places, :d for integers, :10s for width-10 string.`,
      },
    ],
    commonMistakes: [
      'Trying to modify a string in place (s[0] = "H") — strings are immutable, this raises TypeError',
      'Using + in a loop to build strings — use a list and "".join() for O(n) instead of O(n²)',
      'Forgetting that split() without arguments splits on any whitespace and removes empty strings',
    ],
    bestPractices: [
      'Use f-strings for all string formatting in modern Python (Python 3.6+)',
      'Use "".join(parts) to efficiently concatenate many strings',
      'Use raw strings r"..." for regular expressions and file paths on Windows',
    ],
    exercises: [
      'Write a function that takes a full name string (e.g., "alice smith") and returns it in title case with all extra spaces removed.',
      'Write a function that counts how many times a given character appears in a string without using the built-in count() method.',
      'Create an f-string that formats a table row: given name (str), age (int), and score (float), print a row padded to fixed column widths.',
    ],
    quizQuestions: [
      {
        question: 'What does "hello"[::-1] return?',
        options: ['"hello"', '"olleh"', '"olle"', 'IndexError'],
        answer: 1,
        explanation: 'Slicing with step -1 iterates the string backwards. "hello"[::-1] returns "olleh" — a reversed copy of the string.',
      },
      {
        question: 'Which is the most efficient way to concatenate 1000 strings in Python?',
        options: ['Using + in a loop', 'Using += in a loop', '"".join(list_of_strings)', 'Using str.format()'],
        answer: 2,
        explanation: '"".join() is O(n) and the most efficient method. Using + or += in a loop creates a new string object every iteration — O(n²) total.',
      },
    ],
    interviewQuestions: [
      'Why are Python strings immutable, and what are the performance implications of repeated string concatenation?',
      'Explain the difference between str.split() and str.split(" ") (with a space argument).',
      'How do you format a float to exactly 2 decimal places in an f-string?',
    ],
    summary: 'Python strings are immutable Unicode sequences. Use indexing and slicing to access parts. Use the rich method library (strip, split, replace, join, upper, lower) for text processing. Use f-strings for formatting.',
    nextTopic: 'Python Booleans',
  },

  {
    id: 'python-booleans',
    title: 'Python Booleans',
    intro: 'Booleans represent truth values — True or False. They are fundamental to controlling program flow. In Python, bool is a subclass of int, and every object has a boolean interpretation (truthy or falsy).',
    whatIsIt: 'A Python boolean (bool) is a data type with exactly two values: True and False, used in conditional logic, comparisons, and logical operations.',
    whyImportant: 'Every decision in a program — every if, while, and filter — ultimately reduces to a boolean evaluation.',
    simpleExplanation: 'Booleans are like a light switch — it is either on (True) or off (False). Your program makes decisions based on which state the switch is in.',
    detailedExplanation: `In Python, bool is a subclass of int. True equals 1 and False equals 0. This means booleans can be used in arithmetic: True + True = 2, sum([True, False, True, True]) = 3 (counts True values).

Comparison operators return booleans: == (equal), != (not equal), < (less than), > (greater than), <= (less or equal), >= (greater or equal). Identity operators: is (same object), is not. Membership operators: in, not in.

Logical operators combine boolean expressions: and (both True), or (at least one True), not (inverts). Python's logical operators use short-circuit evaluation: in x and y, if x is False, y is never evaluated. In x or y, if x is True, y is never evaluated.

Every Python object has a truth value (truthy or falsy). Falsy objects: False, None, 0, 0.0, 0j, "" (empty string), [] (empty list), {} (empty dict), () (empty tuple), set() (empty set). Everything else is truthy. The bool() function converts any object to its truth value.

Python does not use && and || like Java or JavaScript — it uses and and or. The ternary expression is: value_if_true if condition else value_if_false.`,
    realWorldExample: 'A login system uses boolean checks: is_authenticated and has_permission and not is_banned to decide whether to allow access to a protected resource.',
    codeExamples: [
      {
        title: 'Booleans, Comparisons, and Logic',
        language: 'python',
        code: `# Boolean values
t = True
f = False
print(type(True))   # <class 'bool'>
print(True + True)  # 2  (bool is a subclass of int)

# Comparison operators
print(5 > 3)       # True
print(5 == 5)      # True
print(5 != 3)      # True
print("a" < "b")   # True (alphabetical)

# Logical operators
print(True and False)  # False
print(True or False)   # True
print(not True)        # False

# Short-circuit evaluation
def risky():
    print("risky() called")
    return True

print(False and risky())  # risky() is NEVER called
print(True or risky())    # risky() is NEVER called

# Truthy and falsy
for val in [0, 1, "", "hello", [], [1,2], None, {}, {1:2}]:
    print(f"bool({repr(val):15}) = {bool(val)}")

# Ternary expression
age = 20
status = "adult" if age >= 18 else "minor"
print(status)`,
        output: `<class 'bool'>
2
True
True
True
True
False
True
False
False
False
bool(0              ) = False
bool(1              ) = True
bool(''             ) = False
bool('hello'        ) = True
bool([]             ) = False
bool([1, 2]         ) = True
bool(None           ) = False
bool({}             ) = False
bool({1: 2}         ) = True
adult`,
        explanation: `bool is a subclass of int: True=1, False=0. This allows counting with sum([True, False, True]).
Short-circuit evaluation is critical for performance and safety — use it to guard against None checks: if obj and obj.method().
Falsy values include: 0, None, empty containers, empty string.
The ternary expression is "value_if_true if condition else value_if_false" — useful for simple one-line conditionals.`,
      },
    ],
    commonMistakes: [
      'Using == True or == False in conditions — just write if is_valid: not if is_valid == True:',
      'Confusing is with == for comparison — use == for value equality, is only for None/True/False checks',
      'Not understanding short-circuit evaluation — assuming both sides of and/or are always evaluated',
    ],
    bestPractices: [
      'Write boolean conditions directly: if items: not if len(items) > 0:',
      'Use is None (not == None) to check for None',
      'Name boolean variables with is_, has_, can_, should_ prefixes for clarity',
    ],
    exercises: [
      'Write a function is_valid_age(age) that returns True only if age is an integer between 0 and 150.',
      'Use short-circuit evaluation to safely access data["key"] without a KeyError — write it as a one-liner.',
      'Count how many numbers in [3, 7, 2, 9, 5, 1, 8, 4] are greater than 5 using sum() and a generator expression.',
    ],
    quizQuestions: [
      {
        question: 'What does "False or 0 or [] or {} or None or 42" evaluate to?',
        options: ['False', 'None', '42', '0'],
        answer: 2,
        explanation: 'or returns the first truthy value or the last value if none are truthy. All of False, 0, [], {}, None are falsy. 42 is truthy, so it is returned.',
      },
      {
        question: 'What is the result of not not "hello"?',
        options: ['"hello"', 'True', 'False', 'None'],
        answer: 1,
        explanation: '"hello" is truthy. not "hello" = False. not False = True. So not not "hello" = True.',
      },
    ],
    interviewQuestions: [
      'Explain short-circuit evaluation in Python and give a practical example where it prevents an error.',
      'What is the difference between == and is in Python? When should you use each?',
      'Given a list of integers, write a one-liner to count how many are even.',
    ],
    summary: 'Python booleans are True and False, subclasses of int. Logical operators and, or, not use short-circuit evaluation. Every object has a truth value — falsy values are 0, None, empty containers, and empty strings.',
    nextTopic: 'Python Operators',
  },

  {
    id: 'python-operators',
    title: 'Python Operators',
    intro: 'Operators are symbols that perform operations on values (operands). Python provides a comprehensive set of operators for arithmetic, comparison, logical operations, bitwise manipulation, assignment, and identity/membership testing.',
    whatIsIt: 'A Python operator is a symbol or keyword that tells Python to perform a specific computation between one or more values.',
    whyImportant: 'Operators are the building blocks of every expression in Python — from simple addition to complex conditional logic.',
    simpleExplanation: 'Operators are like verbs in mathematics and logic — they describe what action to perform on the numbers or values around them.',
    detailedExplanation: `Python operators are grouped by category:

Arithmetic: + - * / // % ** (power). Division / always returns float. // is floor division. % is modulo. ** is exponentiation.

Comparison: == != < > <= >= — always return bool. Python supports chaining: 0 < x < 10 works as expected.

Assignment: = += -= *= /= //= %= **= &= |= ^= >>= <<= — shorthand for x = x + 1 is x += 1.

Logical: and or not — operate on truthiness, not just booleans. Return an actual value, not always True/False.

Bitwise: & (AND), | (OR), ^ (XOR), ~ (NOT), << (left shift), >> (right shift) — operate on integer bit patterns.

Identity: is, is not — check if two variables point to the same object in memory.

Membership: in, not in — check if a value exists in a sequence or collection.

Operator precedence (high to low): ** | * / // % | + - | comparison operators | not | and | or. Use parentheses to override precedence and improve readability.`,
    realWorldExample: 'A game engine uses arithmetic operators for physics (velocity += acceleration * dt), bitwise operators for flag management (state |= JUMPING_FLAG), and comparison operators for collision detection (distance < hit_radius).',
    codeExamples: [
      {
        title: 'All Python Operators',
        language: 'python',
        code: `# Arithmetic
print(7 + 3, 7 - 3, 7 * 3, 7 / 3)   # 10 4 21 2.333...
print(7 // 3, 7 % 3, 2 ** 8)          # 2 1 256

# Comparison (chaining works!)
x = 5
print(1 < x < 10)   # True (between 1 and 10)
print(x == 5 != 10) # True

# Augmented assignment
counter = 0
counter += 1     # Same as counter = counter + 1
counter *= 3     # Same as counter = counter * 3
print(counter)   # 3

# Logical operators return VALUES, not just True/False
print(0 or "default")        # "default" (returns first truthy)
print("hello" and "world")   # "world" (returns last if all truthy)
print(None or [] or 0 or 42) # 42

# Bitwise (work on binary representation)
a, b = 0b1010, 0b1100   # 10, 12 in binary
print(bin(a & b))   # 0b1000 (AND)
print(bin(a | b))   # 0b1110 (OR)
print(bin(a ^ b))   # 0b0110 (XOR)
print(a << 1)       # 20 (left shift = multiply by 2)
print(a >> 1)       # 5  (right shift = divide by 2)

# Identity vs equality
a = [1, 2, 3]
b = [1, 2, 3]
c = a
print(a == b)   # True  (same value)
print(a is b)   # False (different objects)
print(a is c)   # True  (same object)

# Membership
fruits = ["apple", "banana", "cherry"]
print("apple" in fruits)    # True
print("grape" not in fruits) # True`,
        output: `10 4 21 2.3333333333333335
2 1 256
True
True
3
default
world
42
0b1000
0b1110
0b0110
20
5
True
False
True
True
True`,
        explanation: `Logical and/or return VALUES not just True/False — "a or b" returns a if a is truthy, else b. Useful for default values.
Bitwise operators work on the binary representation of integers. & = AND, | = OR, ^ = XOR, << = left shift.
is tests object identity (same memory address), not value equality. Always use == for value comparison.
Chained comparisons (1 < x < 10) are Pythonic and more readable than x > 1 and x < 10.`,
      },
    ],
    commonMistakes: [
      'Using = instead of == in comparisons (x = 5 assigns, x == 5 compares)',
      'Forgetting operator precedence: 2 + 3 * 4 = 14, not 20 — use parentheses',
      'Using is for value equality — is checks identity (memory address), not value',
    ],
    bestPractices: [
      'Use parentheses to make complex expressions unambiguous even when not required',
      'Use augmented assignment operators (+=, -=) for clarity',
      'Reserve is/is not for None checks only: if x is None:',
    ],
    exercises: [
      'Write a one-liner using logical operators that returns x if 0 < x < 100 else returns the clamped value (0 or 100).',
      'Use bitwise operators to check if an integer is odd (hint: n & 1 == 1 if odd).',
      'Demonstrate operator precedence by computing 2 + 3 ** 2 * 4 - 1 and then verify with parentheses.',
    ],
    quizQuestions: [
      {
        question: 'What is the result of 2 + 3 ** 2?',
        options: ['25', '11', '13', '36'],
        answer: 1,
        explanation: '** (exponentiation) has higher precedence than +. So 3 ** 2 = 9 is evaluated first, then 2 + 9 = 11.',
      },
      {
        question: 'What does "None or [] or 0 or False or 5" evaluate to?',
        options: ['None', 'False', '5', '0'],
        answer: 2,
        explanation: 'or returns the first truthy value. None, [], 0, and False are all falsy. 5 is the first truthy value, so it is returned.',
      },
    ],
    interviewQuestions: [
      'Explain the difference between is and == operators in Python. Give an example where they give different results.',
      'What does "x = a or b" do when a is falsy? Describe a practical use case for this pattern.',
      'Explain Python\'s operator precedence with an example of a bug caused by incorrect assumptions.',
    ],
    summary: 'Python provides arithmetic, comparison, logical, bitwise, assignment, identity, and membership operators. Key gotchas: / always returns float, logical operators return values not just booleans, is checks identity not equality.',
    nextTopic: 'Python Lists',
  },

  {
    id: 'python-lists',
    title: 'Python Lists',
    intro: 'Lists are Python\'s most versatile data structure — ordered, mutable collections that can hold items of any type. They support indexing, slicing, sorting, filtering, and a rich set of methods for adding, removing, and rearranging items.',
    whatIsIt: 'A Python list is an ordered, mutable sequence that can contain any mixture of data types, allowing dynamic addition and removal of elements.',
    whyImportant: 'Lists are the backbone of data processing in Python — storing query results, managing task queues, building sequences — nearly every real program uses lists.',
    simpleExplanation: 'A list is like a numbered shelf where each slot can hold any kind of object. You can add new shelves at the end, remove any shelf, and rearrange items in any order.',
    detailedExplanation: `Lists are created with square brackets [] or the list() constructor. They are zero-indexed and support negative indexing. Slicing works exactly as with strings.

List methods: append(item) adds to end, insert(i, item) inserts at position i, extend(iterable) adds all items from another iterable, remove(item) removes first occurrence, pop(i) removes and returns item at index i (default last), clear() removes all items, index(item) finds position, count(item) counts occurrences, sort() sorts in-place, sorted(list) returns new sorted list, reverse() reverses in-place, copy() returns shallow copy.

List comprehensions provide a concise way to build lists: [expression for item in iterable if condition]. They replace most map() and filter() calls and are more Pythonic. Examples: [x*2 for x in range(10)], [x for x in names if len(x) > 4].

Nested lists (lists of lists) create 2D structures like matrices. Access nested elements with double indexing: matrix[row][col].

For performance: append() is O(1) amortized, insert(0, x) is O(n) — use collections.deque for efficient front insertion. Membership test x in list is O(n) — use a set for O(1) lookups.`,
    realWorldExample: 'A social media feed is stored as a list of post objects, sorted by timestamp. New posts are appended, old ones are removed with pop(), and the list is filtered to show only posts matching user interests.',
    codeExamples: [
      {
        title: 'List Operations and List Comprehensions',
        language: 'python',
        code: `# Creation and access
nums = [10, 20, 30, 40, 50]
print(nums[0], nums[-1])   # 10 50
print(nums[1:4])           # [20, 30, 40]

# Mutation methods
fruits = ["apple", "banana"]
fruits.append("cherry")       # add to end
fruits.insert(1, "blueberry") # insert at index 1
fruits.extend(["date", "elderberry"])
print(fruits)

# Removing items
fruits.remove("banana")    # removes first "banana"
popped = fruits.pop()      # removes and returns last
print(f"Removed: {popped}")
print(fruits)

# Sorting
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()             # sorts in-place
print(numbers)

words = ["banana", "apple", "cherry"]
words.sort(key=len)        # sort by length
print(words)

# List comprehensions — the Pythonic way
squares    = [x ** 2 for x in range(1, 6)]
evens      = [x for x in range(20) if x % 2 == 0]
upper_long = [s.upper() for s in words if len(s) > 5]

print(squares)
print(evens)
print(upper_long)

# 2D list (matrix)
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(matrix[1][2])  # Row 1, Col 2 = 6`,
        output: `10 50
[20, 30, 40]
['apple', 'blueberry', 'banana', 'cherry', 'date', 'elderberry']
Removed: elderberry
['apple', 'blueberry', 'cherry', 'date']
[1, 1, 2, 3, 4, 5, 6, 9]
['apple', 'banana', 'cherry']
[1, 4, 9, 16, 25]
[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
['BANANA', 'CHERRY']
6`,
        explanation: `append() adds to the end — O(1). insert(0, x) shifts everything right — O(n).
remove() removes the FIRST occurrence. pop() removes and returns the last item (or item at given index).
sort() modifies the list IN-PLACE; sorted() creates a NEW sorted list without modifying the original.
List comprehensions [expr for x in iterable if condition] replace verbose for-loops and are faster.
2D lists are lists of lists. matrix[1][2] accesses row 1 (0-indexed), column 2.`,
      },
    ],
    commonMistakes: [
      'Confusing sort() (in-place, returns None) with sorted() (returns new list)',
      'Shallow copy issue: b = a creates another reference to the same list, not a copy — use b = a.copy()',
      'Using a list when you need O(1) lookups — use a set or dict instead',
    ],
    bestPractices: [
      'Use list comprehensions instead of map/filter for clarity',
      'Use enumerate() instead of range(len()) when you need both index and value',
      'Use sorted() when you need to preserve the original list',
    ],
    exercises: [
      'Write a list comprehension that generates all perfect squares less than 200.',
      'Write a function flatten(nested) that takes a list of lists and returns a single flat list using a list comprehension.',
      'Given a list of integers, use list comprehensions to separate it into two lists: evens and odds.',
    ],
    quizQuestions: [
      {
        question: 'What is the difference between list.sort() and sorted(list)?',
        options: ['No difference — both return a new sorted list', 'sort() modifies the list in-place and returns None; sorted() returns a new sorted list', 'sort() is for strings, sorted() is for numbers', 'sorted() modifies in-place; sort() returns a new list'],
        answer: 1,
        explanation: 'list.sort() sorts the list in-place and returns None. sorted(list) creates a new sorted list and leaves the original unchanged.',
      },
      {
        question: 'What does nums[1:4] return for nums = [10, 20, 30, 40, 50]?',
        options: ['[10, 20, 30]', '[20, 30, 40]', '[20, 30, 40, 50]', '[10, 20, 30, 40]'],
        answer: 1,
        explanation: 'Slicing [1:4] returns elements at indices 1, 2, and 3 — not including index 4. That is [20, 30, 40].',
      },
    ],
    interviewQuestions: [
      'What is the time complexity of list operations: append, insert at index 0, pop from end, membership test?',
      'Explain the difference between a shallow copy and a deep copy of a Python list.',
      'When would you use a deque instead of a list? What operations does it optimize?',
    ],
    summary: 'Python lists are ordered, mutable sequences. Use append/insert/extend to add, remove/pop to delete, sort/sorted to order. List comprehensions provide a concise, readable, and fast way to build lists from other iterables.',
    nextTopic: 'Python Tuples',
  },

  {
    id: 'python-tuples',
    title: 'Python Tuples',
    intro: 'Tuples are ordered, immutable sequences. Once created, their elements cannot be changed. This immutability makes them ideal for fixed data, function return values, dictionary keys, and named records.',
    whatIsIt: 'A Python tuple is an immutable ordered sequence, identical to a list except its contents cannot be modified after creation.',
    whyImportant: 'Tuples convey intent — if you see a tuple, you know the data is fixed. They are also hashable (usable as dict keys or set members) and slightly faster than lists.',
    simpleExplanation: 'A tuple is like a sealed envelope. You can look at what\'s inside and pass it around, but you cannot change the contents.',
    detailedExplanation: `Tuples are created with parentheses () or just commas (the parentheses are optional). A single-element tuple requires a trailing comma: (42,) not (42) — the latter is just parentheses around 42.

Tuples support all read operations: indexing, slicing, len(), count(), index(), in membership testing, iteration. They do NOT support mutation: no append, remove, insert, sort.

The key uses of tuples are: returning multiple values from functions (Python functions can return tuples), unpacking (a, b = function_that_returns_two_values()), as dictionary keys (since they are hashable), and representing fixed records like (x, y) coordinates, (r, g, b) colors, or database rows.

Named tuples (from the collections module) give each field a name, making tuple fields accessible as attributes: point.x rather than point[0]. Python 3.7+ also offers dataclasses for structured data with more features.

Tuple unpacking is very powerful: first, *rest = (1, 2, 3, 4, 5) binds 1 to first and [2, 3, 4, 5] to rest. This pattern is used extensively in Python for clean variable assignment.`,
    realWorldExample: 'A database query returns each row as a tuple (id, name, email, created_at). The fixed structure of a tuple signals that these fields are a single record and should not be individually modified.',
    codeExamples: [
      {
        title: 'Tuples — Creation, Unpacking, and Use Cases',
        language: 'python',
        code: `# Creating tuples
empty = ()
single = (42,)    # trailing comma needed for single item!
coords = (10.5, 20.3)
rgb = (255, 128, 0)
mixed = (1, "hello", True, None)

# Accessing (same as list)
print(coords[0])    # 10.5
print(rgb[-1])      # 0

# Unpacking
x, y = coords
print(f"x={x}, y={y}")

r, g, b = rgb
print(f"R={r}, G={g}, B={b}")

# Extended unpacking (Python 3+)
first, *middle, last = (1, 2, 3, 4, 5)
print(first, middle, last)  # 1 [2, 3, 4] 5

# Functions can return multiple values (as tuples)
def min_max(numbers):
    return min(numbers), max(numbers)  # returns tuple

lo, hi = min_max([3, 1, 7, 2, 9])
print(f"Min: {lo}, Max: {hi}")

# Tuple as dict key (lists cannot be dict keys)
locations = {
    (40.7128, -74.0060): "New York",
    (51.5074, -0.1278): "London",
}
print(locations[(40.7128, -74.0060)])

# Named tuple
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)          # Access by name
distance = (p.x**2 + p.y**2) ** 0.5
print(f"Distance from origin: {distance}")`,
        output: `10.5
0
x=10.5, y=20.3
R=255, G=128, B=0
1 [2, 3, 4] 5
Min: 1, Max: 9
New York
3 4
Distance from origin: 5.0`,
        explanation: `A single-element tuple REQUIRES a trailing comma: (42,). (42) is just 42 in parentheses.
Unpacking assigns tuple elements to individual variables — cleaner than accessing by index.
Extended unpacking with * captures a variable number of elements into a list.
Tuples are hashable, so they can be dict keys or set members — lists cannot.
namedtuple gives tuple fields meaningful names, making code more readable.`,
      },
    ],
    commonMistakes: [
      'Forgetting the trailing comma for single-element tuples: (42) is just int 42, not a tuple',
      'Trying to modify a tuple element — tuples are immutable, this raises TypeError',
      'Assuming tuple packing always requires parentheses — commas create tuples, parentheses just improve readability',
    ],
    bestPractices: [
      'Return multiple values from functions as tuples (natural Python style)',
      'Use named tuples or dataclasses for structured data with more than 3 fields',
      'Use tuples (not lists) for fixed data like coordinates, colors, and database primary keys',
    ],
    exercises: [
      'Write a function statistics(numbers) that returns the mean, median, and standard deviation as a named tuple.',
      'Use extended unpacking to split a list into its first element, middle elements, and last element.',
      'Create a set of tuples representing (city, country) pairs and demonstrate that you cannot add a list of the same pairs.',
    ],
    quizQuestions: [
      {
        question: 'What is the result of type((42))?',
        options: ['tuple', 'int', 'TypeError', 'list'],
        answer: 1,
        explanation: '(42) is just 42 with parentheses — the parentheses are grouping, not tuple creation. To create a single-element tuple, use (42,) with a trailing comma.',
      },
      {
        question: 'Why can tuples be used as dictionary keys, but lists cannot?',
        options: ['Tuples are ordered, lists are not', 'Tuples are immutable and hashable; lists are mutable and not hashable', 'Tuples are faster than lists', 'Python syntax requires it'],
        answer: 1,
        explanation: 'Dictionary keys must be hashable (have a stable hash value). Tuples are immutable, so their hash never changes. Lists are mutable — their hash could change, making them unsafe as keys.',
      },
    ],
    interviewQuestions: [
      'What is the practical difference between a tuple and a list? When would you choose each?',
      'Explain Python\'s tuple unpacking and give three practical examples.',
      'What is a named tuple and when is it preferable over a regular dict or class?',
    ],
    summary: 'Tuples are immutable ordered sequences. Use them for fixed records, function return values, dictionary keys, and wherever data should not change. Single-element tuples need a trailing comma. namedtuple adds field names.',
    nextTopic: 'Python Sets',
  },

  {
    id: 'python-sets',
    title: 'Python Sets',
    intro: 'Sets are unordered collections of unique, hashable elements. They are optimized for fast membership testing, deduplication, and mathematical set operations like union, intersection, and difference.',
    whatIsIt: 'A Python set is an unordered, mutable collection of unique, hashable elements — no duplicates, no guaranteed order, and O(1) membership testing.',
    whyImportant: 'Sets solve deduplication and membership problems with O(1) performance, whereas lists require O(n) scans for the same operations.',
    simpleExplanation: 'A set is like a bag of unique marbles — you can add new marbles, but if you try to add a duplicate, nothing happens. And you can quickly check if a specific marble is in the bag.',
    detailedExplanation: `Sets are created with curly braces {1, 2, 3} or the set() constructor. Importantly, {} creates an empty dict, not an empty set — use set() for an empty set.

Key operations: add(item) adds one element, update(iterable) adds multiple, remove(item) raises KeyError if missing, discard(item) silently does nothing if missing, pop() removes and returns an arbitrary element.

Mathematical set operations: | union (elements in either), & intersection (elements in both), - difference (in A but not B), ^ symmetric difference (in A or B but not both). These also have method equivalents: union(), intersection(), difference(), symmetric_difference().

Set comprehensions: {expression for item in iterable if condition}

frozenset is an immutable version of set — it can be used as a dictionary key or added to another set.

Common uses: removing duplicates from a list (list(set(my_list))), fast membership checks (if user_id in admin_set:), finding common elements between two collections, finding unique elements.`,
    realWorldExample: 'A recommendation engine finds users with common interests: common_interests = user1_interests & user2_interests. The intersection operation is O(min(len(A), len(B))) with sets versus O(n×m) with nested list loops.',
    codeExamples: [
      {
        title: 'Set Operations',
        language: 'python',
        code: `# Creating sets
empty_set = set()          # NOT {} which creates an empty dict
numbers = {1, 2, 3, 4, 5}
fruits = set(["apple", "banana", "cherry", "apple"])  # deduplication
print(fruits)  # 3 unique items

# Mutation
numbers.add(6)
numbers.discard(10)  # no error if not found
numbers.remove(1)    # raises KeyError if not found

# Set operations
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print(a | b)   # Union: {1,2,3,4,5,6,7,8}
print(a & b)   # Intersection: {4, 5}
print(a - b)   # Difference: {1, 2, 3}
print(a ^ b)   # Symmetric difference: {1,2,3,6,7,8}

# Subset / superset checks
small = {1, 2}
print(small.issubset(a))   # True: {1,2} ⊆ {1,2,3,4,5}
print(a.issuperset(small)) # True

# Deduplication
words = ["the", "cat", "sat", "on", "the", "mat", "on"]
unique_words = sorted(set(words))
print(unique_words)

# Fast membership testing
admin_ids = {1001, 1002, 1003, 1004}
user_id = 1003
if user_id in admin_ids:   # O(1) — much faster than list search
    print("User is an admin")

# Set comprehension
squares_of_evens = {x**2 for x in range(10) if x % 2 == 0}
print(squares_of_evens)`,
        output: `{'cherry', 'apple', 'banana'}
{1, 2, 3, 4, 5, 6, 7, 8}
{4, 5}
{1, 2, 3}
{1, 2, 3, 6, 7, 8}
True
True
['cat', 'mat', 'on', 'sat', 'the']
User is an admin
{0, 64, 4, 36, 16}`,
        explanation: `set() with a list automatically deduplicates — "apple" appears twice in the input but only once in the set.
discard() is safer than remove() when you are not sure if the element exists.
Set operations (|, &, -, ^) mirror mathematical set theory.
sorted(set(list)) is the clean Python way to get unique sorted elements.
Membership testing with in is O(1) for sets, O(n) for lists.`,
      },
    ],
    commonMistakes: [
      'Using {} for an empty set — {} creates an empty dict. Use set() instead',
      'Trying to add mutable items (lists, dicts) to a set — only hashable types can be set members',
      'Assuming sets are ordered — they are not; do not rely on iteration order',
    ],
    bestPractices: [
      'Use sets for fast membership testing instead of lists when the collection is large',
      'Use set operations (union, intersection, difference) instead of nested loops',
      'Deduplicate a list with list(set(my_list)) but remember it does not preserve order',
    ],
    exercises: [
      'Given two lists of student names (morning_class and evening_class), find: students in both classes, students only in morning, students in either class.',
      'Write a function that removes duplicates from a list while preserving order (hint: use a set to track seen items).',
      'Create a set of all vowels and use membership testing to count vowels in a given string.',
    ],
    quizQuestions: [
      {
        question: 'What is the time complexity of x in my_set for a Python set?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        answer: 2,
        explanation: 'Sets use hash tables internally. Membership testing is O(1) on average — the hash of x is computed and the bucket is checked directly, regardless of the set size.',
      },
      {
        question: 'What does the ^ operator do on Python sets?',
        options: ['Union of two sets', 'Intersection of two sets', 'Elements in either set but not both (symmetric difference)', 'Power/exponentiation of set elements'],
        answer: 2,
        explanation: 'The ^ operator computes the symmetric difference: elements that are in A or B but NOT in both. It is equivalent to (A | B) - (A & B).',
      },
    ],
    interviewQuestions: [
      'Explain the internal data structure of Python sets and why membership testing is O(1).',
      'What is the difference between discard() and remove() on a set?',
      'How would you find elements that appear in list A but not in list B, efficiently?',
    ],
    summary: 'Sets are unordered collections of unique hashable elements with O(1) lookup. Use {} to create sets (but set() for empty), use |, &, -, ^ for set algebra. Perfect for deduplication, membership testing, and finding common/unique elements.',
    nextTopic: 'Python Dictionaries',
  },

  {
    id: 'python-dictionaries',
    title: 'Python Dictionaries',
    intro: 'Dictionaries are Python\'s key-value store — one of the most powerful and frequently used data structures. They map unique keys to values, providing O(1) lookup by key. Since Python 3.7, dictionaries maintain insertion order.',
    whatIsIt: 'A Python dictionary (dict) is an ordered (Python 3.7+), mutable collection of key-value pairs, implemented as a hash table for O(1) average-case get, set, and delete.',
    whyImportant: 'Dictionaries are how Python programs represent structured data — user profiles, configuration settings, JSON responses, database records, frequency counts, and graph adjacency lists.',
    simpleExplanation: 'A dictionary is like a real dictionary — you look up a word (key) to find its definition (value). Finding the definition is instant because you know exactly which page to turn to.',
    detailedExplanation: `Dictionaries are created with {} containing key: value pairs, or with dict(). Keys must be immutable and hashable (strings, numbers, tuples). Values can be any Python object.

Core operations: d[key] = value (insert/update), d[key] (get, raises KeyError if missing), d.get(key, default) (safe get, returns default if missing), del d[key] (delete), key in d (membership test O(1)).

Dictionary methods: keys() — returns view of keys, values() — view of values, items() — view of (key, value) tuples, update(other_dict) — merges another dict, pop(key, default) — removes and returns value, setdefault(key, default) — inserts default if key missing and returns value, copy() — shallow copy.

Dictionary comprehensions: {key_expr: val_expr for item in iterable if condition}

Merging dicts: In Python 3.9+, use d1 | d2 (merge) or d1 |= d2 (update in-place). In earlier versions, use {**d1, **d2} or d1.update(d2).

Common patterns: frequency counter (use collections.Counter), default values (use collections.defaultdict), nested dicts for structured data, dict as switch/dispatch table.`,
    realWorldExample: 'A REST API returns JSON (which maps directly to Python dicts). When a user logs in, the server creates a dict with keys like "user_id", "username", "roles", "session_token", and sends it back as a JSON response.',
    codeExamples: [
      {
        title: 'Dictionary Operations and Patterns',
        language: 'python',
        code: `from collections import defaultdict, Counter

# Creation
student = {"name": "Alice", "grade": "A", "score": 95}
empty = {}

# Access
print(student["name"])              # "Alice"
print(student.get("age", "N/A"))    # "N/A" (key missing, no error)

# Add and update
student["age"] = 20
student["score"] = 98  # update existing key
print(student)

# Remove
del student["grade"]
removed = student.pop("age", None)  # safe pop
print(f"Removed age: {removed}")

# Iteration
for key, value in student.items():
    print(f"  {key}: {value}")

# Dictionary comprehension
words = ["apple", "banana", "cherry", "date"]
word_lengths = {word: len(word) for word in words}
print(word_lengths)

# Frequency counter
sentence = "the cat sat on the mat the cat"
freq = Counter(sentence.split())
print(freq.most_common(3))

# Default dict (never raises KeyError)
graph = defaultdict(list)
graph["A"].append("B")
graph["A"].append("C")
graph["B"].append("D")
print(dict(graph))

# Merging dicts (Python 3.9+)
defaults = {"color": "blue", "size": 12}
overrides = {"color": "red", "font": "mono"}
merged = defaults | overrides  # override wins
print(merged)`,
        output: `Alice
N/A
{'name': 'Alice', 'grade': 'A', 'score': 98, 'age': 20}
Removed age: 20
  name: Alice
  score: 98
{'apple': 5, 'banana': 6, 'cherry': 6, 'date': 4}
[('the', 3), ('cat', 2), ('sat', 1)]
{'A': ['B', 'C'], 'B': ['D']}
{'color': 'red', 'size': 12, 'font': 'mono'}`,
        explanation: `d.get(key, default) is safer than d[key] — never raises KeyError.
Use dict.items() to iterate key-value pairs simultaneously.
Dictionary comprehensions {k: v for ...} build dicts efficiently in one expression.
Counter automatically counts occurrences; most_common(n) returns top-n items.
defaultdict(list) eliminates "if key not in dict: dict[key] = []" boilerplate.
The | merge operator (Python 3.9+) creates a new dict with the right side overriding the left.`,
      },
    ],
    commonMistakes: [
      'Using d[key] when key might be missing — use d.get(key) or handle KeyError',
      'Modifying a dict while iterating over it — copy the keys first: for k in list(d.keys()):',
      'Assuming dicts are unordered in Python 3.7+ — they maintain insertion order',
    ],
    bestPractices: [
      'Use d.get(key, default) for safe access when key existence is uncertain',
      'Use defaultdict(list) or defaultdict(int) to avoid "key not found" boilerplate',
      'Use Counter from collections for frequency counting instead of manual loops',
    ],
    exercises: [
      'Write a function word_frequency(text) that returns a dict mapping each word to how many times it appears in the text.',
      'Build an inverted index: given a list of sentences, create a dict mapping each word to the list of sentence indices where it appears.',
      'Write a function group_by(items, key_func) that groups items into a dict of lists based on a key function.',
    ],
    quizQuestions: [
      {
        question: 'What does d.get("key", "default") return if "key" is not in dictionary d?',
        options: ['Raises KeyError', 'Returns None', 'Returns "default"', 'Returns False'],
        answer: 2,
        explanation: 'd.get(key, default) returns the second argument ("default") when the key is not found — no exception is raised. If no default is given, it returns None.',
      },
      {
        question: 'Which of these is a valid dictionary key?',
        options: ['[1, 2, 3]', '{"a": 1}', '(1, 2, 3)', '{1, 2, 3}'],
        answer: 2,
        explanation: 'Dictionary keys must be hashable. Lists, dicts, and sets are mutable and not hashable. Tuples (if they contain only hashable elements) are immutable and hashable.',
      },
    ],
    interviewQuestions: [
      'Explain how Python dictionaries work internally. What is a hash table and how does it achieve O(1) lookup?',
      'What is the difference between dict.update() and the | merge operator in Python 3.9+?',
      'When would you use collections.defaultdict and collections.Counter? Give concrete examples.',
    ],
    summary: 'Dictionaries are ordered key-value hash maps with O(1) average lookup. Use .get() for safe access, .items() for iteration, comprehensions for building dicts. Use Counter and defaultdict from collections for common patterns.',
    nextTopic: 'Python If...Else',
  },

  {
    id: 'python-if-else',
    title: 'Python If...Else',
    intro: 'Conditional statements let programs make decisions. The if-elif-else structure evaluates boolean expressions and executes different code blocks depending on which condition is True. This is the fundamental control flow mechanism in Python.',
    whatIsIt: 'The if-elif-else statement evaluates conditions in order and executes the first block whose condition is True, or the else block if no condition matches.',
    whyImportant: 'Without conditionals, programs cannot respond to different inputs or make decisions — every real program uses conditional logic.',
    simpleExplanation: 'An if-else is like a fork in the road. You check a condition (is it raining?), and depending on the answer, you take different paths (bring an umbrella, or don\'t).',
    detailedExplanation: `Python\'s conditional syntax uses if, elif (else if), and else. Each condition is followed by a colon and an indented block. Only the first matching block is executed — Python does not fall through to other blocks like C\'s switch.

The ternary expression provides a one-line if-else: value = a if condition else b. This is concise for simple assignments but should not be nested for readability.

Python has no switch statement (pre-3.10). A long chain of elif is the traditional replacement. Python 3.10+ introduced structural pattern matching (match-case) which is more powerful than a simple switch.

Conditions can use any expression that evaluates to truthy/falsy. Common patterns: if obj: (checks if obj is not None/empty), if not items: (checks if items is empty), if isinstance(x, int): (type check).

Nested if statements are valid but deeply nested code is hard to read. Prefer early returns (guard clauses) to reduce nesting.`,
    realWorldExample: 'An authentication system uses nested conditionals: first checks if the user exists, then if their password hash matches, then if their account is active, then if they have the required permissions — each check in its own if block.',
    syntaxBlock: `if condition1:
    # block 1
elif condition2:
    # block 2
elif condition3:
    # block 3
else:
    # default block

# Ternary
result = "yes" if condition else "no"`,
    codeExamples: [
      {
        title: 'Conditionals and Guard Clauses',
        language: 'python',
        code: `# Basic if-elif-else
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

print(grade(95))  # A
print(grade(72))  # C
print(grade(55))  # F

# Ternary expression
age = 20
status = "adult" if age >= 18 else "minor"
print(status)

# Guard clauses (early return to reduce nesting)
def process_user(user):
    if user is None:
        return "No user"
    if not user.get("active"):
        return "Inactive user"
    if not user.get("verified"):
        return "Unverified user"
    # Main logic — only reached if all checks pass
    return f"Processing: {user['name']}"

print(process_user(None))
print(process_user({"active": False}))
print(process_user({"active": True, "verified": True, "name": "Alice"}))

# Match-case (Python 3.10+)
def http_status(code):
    match code:
        case 200: return "OK"
        case 404: return "Not Found"
        case 500: return "Server Error"
        case _: return "Unknown"

print(http_status(404))`,
        output: `A
C
F
adult
No user
Inactive user
Processing: Alice
Not Found`,
        explanation: `Grade function: Python evaluates conditions top to bottom, stops at the first True.
Ternary: "adult" if age >= 18 else "minor" — concise one-line conditional assignment.
Guard clauses pattern: check failure cases first with early returns, reducing nesting depth.
match-case (Python 3.10+) is cleaner than many elif chains for multiple discrete values.`,
      },
    ],
    commonMistakes: [
      'Using = instead of == in conditions — = assigns, == compares',
      'Deeply nested if-else — refactor using guard clauses (early returns) to flatten the logic',
      'Checking against multiple values with x == a or x == b instead of x in (a, b)',
    ],
    bestPractices: [
      'Use guard clauses (early returns) to avoid deeply nested if-else chains',
      'Use x in (a, b, c) instead of x == a or x == b or x == c',
      'Put the most likely condition first in if-elif chains for performance',
    ],
    exercises: [
      'Write a function fizzbuzz(n) that prints "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, and the number otherwise.',
      'Rewrite this nested if-else using guard clauses: if user: if user.active: if user.age >= 18: return "allowed".',
      'Write a function classify_triangle(a, b, c) that returns "equilateral", "isosceles", "scalene", or "invalid" based on side lengths.',
    ],
    quizQuestions: [
      {
        question: 'What is the Pythonic way to check if x equals 1, 2, or 3?',
        options: ['if x == 1 or 2 or 3:', 'if x == 1 or x == 2 or x == 3:', 'if x in (1, 2, 3):', 'if x in [1, 2, 3]:'],
        answer: 2,
        explanation: 'if x in (1, 2, 3): is the most Pythonic. Note that "if x == 1 or 2 or 3:" is a bug — it always evaluates to True because "or 2" is truthy.',
      },
      {
        question: 'What will print(1 if 0 else 2 if False else 3) output?',
        options: ['1', '2', '3', 'None'],
        answer: 2,
        explanation: '0 is falsy, so the first ternary picks the else branch (2 if False else 3). False is falsy, so the second ternary picks 3.',
      },
    ],
    interviewQuestions: [
      'What is the guard clause pattern and why does it make code more readable?',
      'Explain Python\'s match-case statement introduced in Python 3.10 and compare it to if-elif chains.',
      'Why does "if x == 1 or 2 or 3:" not work as expected, and what is the correct alternative?',
    ],
    summary: 'Python uses if-elif-else for conditional logic. Use guard clauses (early returns) to reduce nesting. The ternary expression handles simple one-line conditions. Use x in (a, b, c) for multi-value equality checks. Python 3.10 adds match-case for structural matching.',
    nextTopic: 'Python While Loops',
  },
]
