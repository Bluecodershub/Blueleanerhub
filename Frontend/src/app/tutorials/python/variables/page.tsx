'use client'

import { LearningLayout } from '@/components/tutorials/LearningLayout'
import { TryItYourself } from '@/components/tutorials/TryItYourself'
import CodePlayground from '@/components/tutorials/CodePlayground'


const lessons = [
  { id: 'introduction', title: 'Python Introduction', completed: true, active: false },
  { id: 'syntax', title: 'Python Syntax', completed: true, active: false },
  { id: 'variables', title: 'Python Variables', completed: false, active: true },
  { id: 'datatypes', title: 'Data Types', completed: false, active: false },
  { id: 'numbers', title: 'Python Numbers', completed: false, active: false },
  { id: 'casting', title: 'Type Casting', completed: false, active: false },
  { id: 'strings', title: 'Python Strings', completed: false, active: false },
  { id: 'booleans', title: 'Booleans', completed: false, active: false },
  { id: 'operators', title: 'Operators', completed: false, active: false },
  { id: 'lists', title: 'Python Lists', completed: false, active: false },
]

export default function PythonBasicsLesson() {
  return (
    <LearningLayout
      sidebarTitle="Python"
      lessons={lessons}
      progress={20}
      currentLessonTitle="Python Variables"
      prevLesson="/tutorials/python/syntax"
      nextLesson="/tutorials/python/datatypes"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <section>
          <h2>Python Variables</h2>
          <p>
            Variables are containers for storing data values. Unlike other programming languages, 
            Python has no command for declaring a variable. A variable is created the moment 
            you first assign a value to it.
          </p>
        </section>

        {/* Creating Variables */}
        <section>
          <h3>Creating Variables</h3>
          <p>
            Python has no command for declaring a variable. A variable is created when you 
            assign a value to it:
          </p>
          <CodePlayground 
            language="python"
            initialCode={`# Creating variables
x = 5
y = "Hello, World!"
z = 3.14

# Print variables
print(x)
print(y)
print(z)

# Check types
print(type(x))
print(type(y))
print(type(z))`}
          />
        </section>

        {/* Variable Names */}
        <section>
          <h3>Variable Names</h3>
          <p>A variable can have a short name (like x and y) or a more descriptive name:</p>
          <ul>
            <li>A variable name must start with a letter or the underscore character</li>
            <li>A variable name cannot start with a number</li>
            <li>A variable name can only contain alpha-numeric characters and underscores (A-z, 0-9, and _)</li>
            <li>Variable names are case-sensitive (age, Age and AGE are three different variables)</li>
          </ul>
          <CodePlayground
            language="python"
            initialCode={`# Legal variable names
myvar = "John"
my_var = "John"
_my_var = "John"
myVar = "John"
MYVAR = "John"
myvar2 = "John"

print(myvar, my_var, _my_var, myVar, MYVAR, myvar2)`}
          />
        </section>

        {/* Multi Words */}
        <section>
          <h3>Multi Words Variable Names</h3>
          <p>Variable names with more than one word can be difficult to read. There are several techniques you can use:</p>
          <CodePlayground
            language="python"
            initialCode={`# Camel Case - each word, except the first, starts with a capital letter
myVariableName = "John"

# Pascal Case - each word starts with a capital letter
MyVariableName = "John"

# Snake Case - each word is separated by an underscore character
my_variable_name = "John"

print("CamelCase:", myVariableName)
print("PascalCase:", MyVariableName)
print("snake_case:", my_variable_name)`}
          />
        </section>

        {/* Assign Multiple Values */}
        <section>
          <h3>Assign Multiple Values</h3>
          <p>Python allows you to assign values to multiple variables in one line:</p>
          <CodePlayground
            language="python"
            initialCode={`# Multiple variables, single line
x, y, z = "Orange", "Banana", "Cherry"
print(x)
print(y)
print(z)

# One value to multiple variables
x = y = z = "Apple"
print(x)
print(y)
print(z)`}
          />
        </section>

        {/* Output Variables */}
        <section>
          <h3>Output Variables</h3>
          <p>The Python print() function is often used to output variables:</p>
          <CodePlayground
            language="python"
            initialCode={`x = "awesome"
y = "BlueLearnerHub"

# Using commas (adds spaces)
print("Python is", x)
print("I love", y)

# Using f-strings (recommended)
print(f"Python is {x}")
print(f"I love {y}")

# Using format()
print("Python is {}".format(x))
print("I love {} and {}".format(x, y))`}
          />
        </section>

        {/* Global Variables */}
        <section>
          <h3>Global Variables</h3>
          <p>Variables that are created outside of a function are known as global variables. 
          Global variables can be used by everyone, both inside of functions and outside:</p>
          <CodePlayground
            language="python"
            initialCode={`# Create a global variable
global_var = "awesome"

def my_function():
    print("Inside function:", global_var)
    
my_function()
print("Outside function:", global_var)

# Use 'global' keyword to modify global variable
def modify_global():
    global global_var
    global_var = "modified"
    
modify_global()
print("After modification:", global_var)`}
          />
        </section>

        {/* Exercise */}
        <TryItYourself
          title="Exercise: Create Variables"
          language="python"
          code={`# Task: Create the following variables:
# 1. A variable called 'name' with your name
# 2. A variable called 'age' with your age
# 3. A variable called 'is_learning' set to True
# 4. Print all three variables

name = "Your Name"
age = 25
is_learning = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Is Learning: {is_learning}")`}
        />

        {/* Summary */}
        <section className="bg-emerald-500/10 border-l-4 border-emerald-500 p-6 rounded-r-xl">
          <h3 className="!mt-0">📚 Summary</h3>
          <ul>
            <li>Variables are containers for storing data values</li>
            <li>Python has no command for declaring a variable</li>
            <li>Variable names are case-sensitive</li>
            <li>Use descriptive names: my_variable_name (snake_case)</li>
            <li>You can assign multiple variables in one line</li>
            <li>Variables created outside functions are global</li>
          </ul>
        </section>
      </div>
    </LearningLayout>
  )
}
