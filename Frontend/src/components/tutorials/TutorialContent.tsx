'use client'

import CodePlayground from '@/components/tutorials/CodePlayground'
import { TryItYourself } from '@/components/tutorials/TryItYourself'
import { CheckCircle2 } from 'lucide-react'

export function PythonBasicsContent() {
  return (
    <div className="space-y-12">
      {/* Introduction */}
      <section>
        <h2>Python Introduction</h2>
        <p>
          Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.
          Python is used for:
        </p>
        <ul>
          <li>Web development (server-side)</li>
          <li>Software development</li>
          <li>Mathematics</li>
          <li>System scripting</li>
        </ul>
      </section>

      {/* What can Python do? */}
      <section>
        <h3>What can Python do?</h3>
        <ul>
          <li>Python can be used on a server to create web applications.</li>
          <li>Python can be used alongside software to create workflows.</li>
          <li>Python can connect to database systems. It can also read and modify files.</li>
          <li>Python can be used to handle big data and perform complex mathematics.</li>
          <li>Python can be used for rapid prototyping, or for production-ready software development.</li>
        </ul>
      </section>

      {/* Why Python? */}
      <section>
        <h3>Why Python?</h3>
        <ul>
          <li>Python works on different platforms (Windows, Mac, Linux, Raspberry Pi, etc.).</li>
          <li>Python has a simple syntax similar to the English language.</li>
          <li>Python has syntax that allows developers to write programs with fewer lines than some other programming languages.</li>
          <li>Python runs on an interpreter system, meaning that code can be executed as soon as it is written.</li>
          <li>Python can be treated procedurally, object-orientedly or functionally.</li>
        </ul>
      </section>

      {/* Interactive Example */}
      <TryItYourself
        title="Python Syntax"
        language="python"
        code={`# This is a comment
print("Hello, World!")

# Variables
name = "BlueLearnerHub"
version = 2.0
is_active = True

print(f"Welcome to {name} version {version}")`}
      />

      {/* Good to know */}
      <section className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-xl">
        <h3 className="!mt-0">Good to know</h3>
        <p>
          The most recent major version of Python is Python 3, which we shall be using in this tutorial.
          However, Python 2, although being updated with only security patches, is still quite popular.
        </p>
      </section>

      {/* Python Install */}
      <section>
        <h3>Python Install</h3>
        <p>
          Many PCs and Macs will have Python already installed.
          To check if you have Python installed on a Windows PC, search in the start bar for Python or run the following on the Command Line (cmd.exe):
        </p>
        <CodePlayground language="bash" initialCode={`C:\\Users\\Your Name>python --version`} />
        <p>
          To check if you have Python installed on Linux or Mac, then on linux open the command line or on Mac open the Terminal and type:
        </p>
        <CodePlayground language="bash" initialCode={`python --version`} />
      </section>

      {/* Python Quickstart */}
      <section>
        <h3>Python Quickstart</h3>
        <p>
          Python is an interpreted programming language, this means that as a developer you write Python (.py) files
          in a text editor and then put those files into the python interpreter to be executed.
        </p>
        <p>Let's write our first Python file, called helloworld.py:</p>
        <CodePlayground language="python" initialCode={`print("Hello, World!")`} />
      </section>

      {/* Interactive Exercise */}
      <TryItYourself
        title="Your First Exercise"
        language="python"
        code={`# Exercise: Fix the code below
# Change the value of message to "Hello, BlueLearnerHub!"

message = "___"
print(message)`}
      />

      {/* Syntax */}
      <section>
        <h2>Python Syntax</h2>
        <p>
          In Python, indentation is very important. Indentation refers to the spaces at the beginning of a code line.
          Where in other programming languages the indentation in code is for readability only, the indentation in Python
          is very important.
        </p>
        <CodePlayground language="python" initialCode={`if 5 > 2:
  print("Five is greater than two!")`} />
        <p>If you skip the indentation, Python will give you an error:</p>
        <CodePlayground language="python" initialCode={`if 5 > 2:
print("Five is greater than two!")`} />
      </section>

      {/* Variables */}
      <section>
        <h2>Python Variables</h2>
        <p>
          Variables are containers for storing data values. Python has no command for declaring a variable.
          A variable is created the moment you first assign a value to it.
        </p>
        <CodePlayground language="python" initialCode={`x = 5
y = "Hello, World!"

print(x)
print(y)`} />
      </section>

      {/* Summary */}
      <section className="bg-emerald-500/10 border-l-4 border-emerald-500 p-6 rounded-r-xl">
        <h3 className="!mt-0">🎉 Congratulations!</h3>
        <p>You have completed the Python Introduction tutorial. In this tutorial you learned:</p>
        <ul>
          <li>What Python is and why it's popular</li>
          <li>How to set up Python on your computer</li>
          <li>How to write your first Python program</li>
          <li>Python syntax and indentation rules</li>
          <li>Creating and using variables</li>
        </ul>
        <div className="mt-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="font-medium text-emerald-700">Lesson completed!</span>
        </div>
      </section>
    </div>
  )
}

export function JavaScriptBasicsContent() {
  return (
    <div className="space-y-12">
      <section>
        <h2>JavaScript Introduction</h2>
        <p>
          JavaScript is the world's most popular programming language. JavaScript is the language of the Web.
          JavaScript was originally developed in just 10 days in 1995 by Brendan Eich at Netscape.
        </p>
      </section>

      <TryItYourself
        title="JavaScript Can Change HTML Content"
        language="javascript"
        code={`document.getElementById("demo").innerHTML = "Hello JavaScript!";`}
      />

      <section>
        <h3>What can JavaScript do?</h3>
        <ul>
          <li>JavaScript can change HTML content</li>
          <li>JavaScript can change HTML attribute values</li>
          <li>JavaScript can change CSS styles</li>
          <li>JavaScript can hide/show HTML elements</li>
        </ul>
      </section>

      <CodePlayground language="javascript" initialCode={`// Variables
let name = "BlueLearnerHub";
let version = 2.0;
let isActive = true;

// Function
function greet(user) {
  return \`Welcome to \${user}!\`;
}

console.log(greet(name));`} />

      <TryItYourself
        title="Interactive JavaScript"
        language="javascript"
        code={`// Try changing the values
let a = 5;
let b = 10;
console.log("Sum:", a + b);

// Conditional
if (a < b) {
  console.log("a is less than b");
}`}
      />
    </div>
  )
}

export function HTMLBasicsContent() {
  return (
    <div className="space-y-12">
      <section>
        <h2>HTML Introduction</h2>
        <p>
          HTML stands for Hyper Text Markup Language. HTML is the standard markup language for creating Web pages.
          HTML describes the structure of a Web page. HTML consists of a series of elements.
        </p>
      </section>

      <TryItYourself
        title="A Simple HTML Document"
        language="html"
        code={`<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>`}
      />

      <section>
        <h3>What is an HTML Element?</h3>
        <p>An HTML element is defined by a start tag, some content, and an end tag:</p>
        <CodePlayground language="html" initialCode={`<tagname>Content goes here...</tagname>`} />
      </section>

      <section>
        <h3>Web Browsers</h3>
        <p>
          The purpose of a web browser (Chrome, Edge, Firefox, Safari) is to read HTML documents and display them correctly.
          A browser does not display the HTML tags, but uses them to determine how to display the document.
        </p>
      </section>
    </div>
  )
}

export function CSSBasicsContent() {
  return (
    <div className="space-y-12">
      <section>
        <h2>CSS Introduction</h2>
        <p>
          CSS stands for Cascading Style Sheets. CSS saves a lot of work. It can control the layout of multiple
          web pages all at once.
        </p>
      </section>

      <TryItYourself
        title="CSS Example"
        language="css"
        code={`body {
  background-color: lightblue;
}

h1 {
  color: white;
  text-align: center;
}

p {
  font-family: verdana;
  font-size: 20px;
}`}
      />

      <section>
        <h3>Why Use CSS?</h3>
        <ul>
          <li>CSS is used to define styles for your web pages, including the design, layout and variations in display for different screens and devices.</li>
          <li>CSS saves a lot of work. It can control the layout of all web pages from a single file.</li>
        </ul>
      </section>
    </div>
  )
}

export function SQLBasicsContent() {
  return (
    <div className="space-y-12">
      <section>
        <h2>SQL Introduction</h2>
        <p>
          SQL is a standard language for storing, manipulating, and retrieving data in databases.
          SQL was developed at IBM in the 1970s.
        </p>
      </section>

      <CodePlayground language="sql"
        initialCode={`-- Select all records
SELECT * FROM users;

-- Select with condition
SELECT * FROM users 
WHERE active = true;

-- Insert data
INSERT INTO users (name, email) 
VALUES ('John', 'john@example.com');

-- Update data
UPDATE users 
SET name = 'Jane' 
WHERE id = 1;

-- Delete data
DELETE FROM users 
WHERE id = 1;`}
      />

      <section>
        <h3>Common SQL Commands</h3>
        <ul>
          <li><strong>SELECT</strong> - extracts data from a database</li>
          <li><strong>UPDATE</strong> - updates data in a database</li>
          <li><strong>DELETE</strong> - deletes data from a database</li>
          <li><strong>INSERT INTO</strong> - inserts new data into a database</li>
          <li><strong>CREATE DATABASE</strong> - creates a new database</li>
          <li><strong>ALTER DATABASE</strong> - modifies a database</li>
        </ul>
      </section>
    </div>
  )
}
