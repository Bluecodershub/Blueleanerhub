import type { TopicLesson } from '../_shared/types'

export const webdevLessons: TopicLesson[] = [
  {
    id: 'html-fundamentals',
    title: 'HTML Fundamentals',
    intro: 'HTML (HyperText Markup Language) is the skeleton of every webpage — it defines content structure and meaning through elements and attributes.',
    whatIsIt: 'HTML uses tags to annotate content: headings (<h1>–<h6>), paragraphs (<p>), links (<a>), images (<img>), lists, tables, forms, and semantic elements (<header>, <nav>, <main>, <section>, <article>, <footer>). The browser parses HTML into a Document Object Model (DOM) tree that CSS and JavaScript manipulate.',
    whyImportant: 'Every webpage starts with HTML. Search engines read HTML semantics to rank content. Screen readers use landmark elements for accessibility. Correct HTML structure is required before styling or scripting can work. A developer who understands DOM structure debugs CSS and JS far faster.',
    simpleExplanation: 'Think of HTML as the blueprint of a building — it defines where the walls, doors, and windows are. CSS is the paint and decoration. JavaScript is the electricity. You cannot paint or wire a building that has no structure, so HTML always comes first.',
    detailedExplanation: 'HTML5 semantic elements give content meaning: <article> wraps self-contained content, <section> groups related content, <aside> holds tangential content, <nav> wraps navigation links. The DOCTYPE declaration tells the browser to use standards mode. The <head> contains metadata (charset, viewport, title, meta descriptions, Open Graph tags). Block-level elements (div, p, h1, ul) take up full width. Inline elements (span, a, strong, img) flow within text. The difference matters for CSS layout.',
    realWorldExample: 'A blog post at Medium.com uses: <article> wrapping the post, <h1> for the title, <p> for paragraphs, <figure> + <img> + <figcaption> for images, <blockquote> for citations, <time datetime="2024-01-15"> for publish date. Search engines extract structured data from these semantic tags for rich search results.',
    formula: 'Basic HTML document:\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Page Title</title>\n  </head>\n  <body>\n    <header>\n      <nav>...</nav>\n    </header>\n    <main>\n      <article>...</article>\n    </main>\n    <footer>...</footer>\n  </body>\n</html>',
    codeExamples: [
      {
        title: 'Semantic HTML Blog Post',
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn HTML fundamentals with practical examples">
  <title>Understanding HTML Semantics</title>
</head>
<body>
  <header>
    <nav aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>Understanding HTML Semantics</h1>
        <p>Published by <strong>Jane Dev</strong> on
          <time datetime="2024-06-01">June 1, 2024</time>
        </p>
      </header>

      <section>
        <h2>Why Semantics Matter</h2>
        <p>Semantic HTML improves accessibility, SEO, and maintainability.
           A screen reader announces a <code>&lt;nav&gt;</code> as navigation,
           helping users jump to the right section immediately.</p>

        <figure>
          <img src="dom-tree.png"
               alt="Diagram showing HTML DOM tree structure"
               width="600" height="400">
          <figcaption>Figure 1: The DOM tree parsed from HTML</figcaption>
        </figure>
      </section>

      <section>
        <h2>Common Semantic Elements</h2>
        <dl>
          <dt><code>&lt;article&gt;</code></dt>
          <dd>Self-contained content that could stand alone (blog post, news item)</dd>

          <dt><code>&lt;section&gt;</code></dt>
          <dd>Thematic grouping of content with a heading</dd>

          <dt><code>&lt;aside&gt;</code></dt>
          <dd>Content tangentially related to main content (sidebar)</dd>
        </dl>
      </section>
    </article>
  </main>

  <footer>
    <p>&copy; 2024 Tech Blog. All rights reserved.</p>
  </footer>
</body>
</html>`,
        output: `Browser renders structured page with:
- Navigation bar at top
- Article with heading, author, date
- Section with image and caption
- Definition list for semantic elements
- Footer at bottom

Accessibility tree exposes:
- landmark: navigation
- landmark: main
- landmark: article
- landmark: contentinfo (footer)`,
        explanation: 'Each element communicates purpose — not just style. The <time> tag with datetime attribute allows machines to parse dates. The <figure>+<figcaption> pair associates images with descriptions. The <dl>/<dt>/<dd> pattern is the correct semantic choice for term-definition pairs (not bullet lists).',
      },
    ],
    commonMistakes: [
      'Using <div> and <span> for everything — miss out on semantic meaning, accessibility, and SEO benefits.',
      'Skipping the viewport meta tag — mobile browsers will render at desktop width and require pinch-zoom.',
      'Using <br> tags to create spacing instead of CSS margin/padding — structure and presentation should be separate.',
      'Nesting block elements inside inline elements (e.g., <a><div>...</div></a>) — technically invalid in HTML4 though allowed in HTML5 for anchor tags.',
    ],
    bestPractices: [
      'Start with semantic structure before adding CSS class names — if you need <div class="article">, use <article> instead.',
      'Every page must have exactly one <h1> — the main topic. Headings must be hierarchical (h1 → h2 → h3), not skipped for size.',
      'Always include alt text on images — empty alt="" for decorative images, descriptive text for informational images.',
      'Use <label for="id"> to associate form labels with inputs — crucial for screen reader and click-target usability.',
    ],
    exercises: [
      'Build a semantic resume page using <header>, <main>, <section> for education/experience, <ul> for skills, and <footer> for contact info.',
      'Convert a <div>-heavy navigation bar to use proper <nav>, <ul>, <li>, <a> structure.',
      'Create a contact form with <label>, <input type="email">, <textarea>, <select>, and <button type="submit"> with proper associations.',
    ],
    quizQuestions: [
      {
        question: 'Which element is the correct choice for wrapping a standalone blog post?',
        options: ['<div class="post">', '<section>', '<article>', '<main>'],
        answer: 2,
        explanation: '<article> represents self-contained content that could be syndicated independently. <section> groups related content within a page. <main> marks the primary content of the document (only one per page).',
      },
      {
        question: 'The viewport meta tag is required for:',
        options: ['Search engine indexing', 'Responsive design on mobile', 'JavaScript execution', 'Stylesheet loading'],
        answer: 1,
        explanation: 'Without <meta name="viewport" content="width=device-width, initial-scale=1.0">, mobile browsers render at ~980px desktop width and show a zoomed-out page. The viewport tag tells the browser to match screen width and use 1:1 pixel ratio.',
      },
    ],
    interviewQuestions: [
      'What is the difference between <section>, <article>, and <div>?',
      'Explain the document outline algorithm and why heading hierarchy matters.',
      'How does semantic HTML improve accessibility for screen reader users?',
    ],
    summary: 'HTML provides document structure through semantic elements that communicate meaning to browsers, search engines, and assistive technologies. Use the most specific semantic element available rather than generic divs. Every page needs a DOCTYPE, charset, viewport meta, and a logical heading hierarchy from h1 downward.',
    nextTopic: 'css-styling',
  },

  {
    id: 'css-styling',
    title: 'CSS Styling & Layout',
    intro: 'CSS (Cascading Style Sheets) controls the visual presentation of HTML — colors, typography, spacing, and layout using Flexbox and Grid.',
    whatIsIt: 'CSS applies styles via selectors that match HTML elements. The cascade determines which rule wins when multiple rules target the same element — specificity, source order, and !important determine priority. The box model (content + padding + border + margin) defines how every element occupies space. Modern layout: Flexbox for 1D (row or column), CSS Grid for 2D (rows and columns simultaneously).',
    whyImportant: 'CSS transforms raw HTML into polished interfaces. Flexbox and Grid have replaced float-based layouts, enabling responsive designs with far less code. CSS custom properties (variables) enable design systems. Without solid CSS fundamentals, developers struggle to implement designs accurately and debug layout issues.',
    simpleExplanation: 'CSS is like interior design for a building. HTML built the walls — CSS decides the paint color, furniture arrangement, and lighting. The cascade is like HOA rules: the most specific rule wins. If two rules conflict, the more specific one (targeting an ID vs a class) overrides the other.',
    detailedExplanation: 'Specificity score: inline styles (1000) > ID selectors (100) > class/attribute/pseudo-class (10) > element/pseudo-element (1). Flexbox properties: display:flex on container, then flex-direction, justify-content (main axis), align-items (cross axis), flex-grow/shrink/basis on children. CSS Grid: grid-template-columns/rows define tracks, grid-column/row place items. Responsive design: min-width media queries follow mobile-first approach. CSS custom properties: --color-primary: #3b82f6 on :root, used as color: var(--color-primary).',
    realWorldExample: 'GitHub\'s repository page uses CSS Grid for the file list table (columns for icon, filename, last commit, date), Flexbox for the top navbar (logo left, links right), and CSS custom properties for theming (light/dark mode). Their layout was impossible with floats — Grid and Flex reduced their layout CSS by ~60%.',
    formula: 'Box Model:\nTotal width = content + padding-left + padding-right + border-left + border-right\nUse: box-sizing: border-box (padding/border included in width)\n\nFlex centering:\n.container { display: flex; justify-content: center; align-items: center; }\n\nResponsive grid:\n.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }',
    codeExamples: [
      {
        title: 'Responsive Card Grid with Flexbox Navigation',
        language: 'css',
        code: `/* ── Design tokens ── */
:root {
  --color-primary:    #3b82f6;
  --color-surface:    #ffffff;
  --color-surface-2:  #f8fafc;
  --color-text:       #0f172a;
  --color-text-muted: #64748b;
  --radius:           0.75rem;
  --shadow-sm:        0 1px 3px rgb(0 0 0 / 0.08);
  --shadow-md:        0 4px 16px rgb(0 0 0 / 0.12);
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Navigation bar (Flexbox) ── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  background: var(--color-surface);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
  text-decoration: none;
}

.navbar__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.navbar__links a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.navbar__links a:hover { color: var(--color-primary); }

/* ── Card grid (CSS Grid, auto-responsive) ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Card component ── */
.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.card__body {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
}

.card__description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  flex: 1;
}

.card__button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.2rem;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  text-decoration: none;
  align-self: flex-start;
  transition: opacity 0.2s;
}
.card__button:hover { opacity: 0.88; }

/* ── Responsive breakpoints ── */
@media (max-width: 640px) {
  .navbar__links { display: none; }   /* hide links, show hamburger instead */
  .cards-grid { grid-template-columns: 1fr; padding: 1rem; }
}`,
        output: `Renders:
- Sticky navbar: logo left, nav links right (Flexbox)
- Card grid: 1 col on mobile → 2 on tablet → 3+ on desktop (auto-fit)
- Cards: image, title, description, CTA button
- Hover: card lifts with shadow + 2px translateY
- Design tokens: change one --color-primary value to retheme entire UI`,
        explanation: 'CSS custom properties (--color-primary etc.) create a single source of truth for the design system. auto-fit with minmax() creates a truly responsive grid with zero media queries — the browser calculates the optimal column count. Flexbox column on the card (flex-direction: column) with flex:1 on the description pushes the button to the bottom in every card, regardless of text length.',
      },
    ],
    commonMistakes: [
      'Using px for font sizes — em/rem respect user browser font size preferences and are better for accessibility.',
      'Forgetting box-sizing: border-box — the default content-box makes width calculations counter-intuitive.',
      'Using absolute positioning for general layout — use Flexbox or Grid, reserve absolute/fixed for overlays and tooltips.',
      'Over-using !important — it breaks the cascade and makes CSS unmaintainable. Use higher specificity instead.',
    ],
    bestPractices: [
      'Define a :root {} block with all design tokens (colors, spacing, radius, fonts) before any component CSS.',
      'Write mobile-first CSS: base styles for mobile, then min-width media queries for larger screens.',
      'Use CSS Grid for 2D layouts (rows and columns). Use Flexbox for 1D alignment (nav bars, card footers, button groups).',
      'Name CSS classes by component and modifier: .card, .card--featured, .card__title (BEM-like) rather than visual names like .blue-box.',
    ],
    exercises: [
      'Build a 3-column pricing table that collapses to 1 column on mobile using CSS Grid and a single media query.',
      'Center a div both horizontally and vertically on the full screen using Flexbox on the body element.',
      'Create a sticky header that changes background on scroll using CSS position: sticky and a JavaScript class toggle.',
    ],
    quizQuestions: [
      {
        question: 'Which CSS property controls alignment along the cross axis in a flex container?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-self'],
        answer: 1,
        explanation: 'align-items controls alignment on the cross axis (perpendicular to flex-direction). justify-content controls the main axis. align-self overrides align-items for individual flex children.',
      },
      {
        question: 'Using box-sizing: border-box means:',
        options: [
          'The element has no border',
          'Padding and border are included in the declared width',
          'The margin is included in the declared width',
          'The element becomes a block-level element',
        ],
        answer: 1,
        explanation: 'border-box includes padding and border in the width value. A 300px element with 20px padding stays at 300px total. The default content-box would make it 300px + 40px padding = 340px total — unexpected behavior.',
      },
    ],
    interviewQuestions: [
      'Explain the CSS cascade and how specificity is calculated.',
      'When would you use CSS Grid vs Flexbox?',
      'How do CSS custom properties differ from Sass/LESS variables?',
    ],
    summary: 'CSS controls presentation through selectors, the cascade (specificity rules), and the box model. Flexbox solves 1D alignment problems; CSS Grid solves 2D layouts. CSS custom properties enable consistent design systems. Always apply box-sizing: border-box globally and write mobile-first CSS with min-width media queries.',
    nextTopic: 'javascript-fundamentals',
  },

  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    intro: 'JavaScript is the only programming language that runs natively in browsers, enabling dynamic behavior, DOM manipulation, and asynchronous data fetching.',
    whatIsIt: 'JavaScript is a dynamically typed, prototype-based scripting language. Variables: let (block-scoped, reassignable), const (block-scoped, immutable binding), var (function-scoped, avoid). Data types: string, number, boolean, null, undefined, symbol, bigint, and object. Functions are first-class values — stored in variables, passed as arguments, returned from other functions. The event loop processes one task at a time from the call stack, while Web APIs handle async work.',
    whyImportant: 'JavaScript powers interactivity on 97% of websites. It is the only language that runs in all browsers without a plugin. Node.js brought JS to servers. React, Vue, and Angular are JS frameworks. Understanding the event loop, closures, and prototypes separates junior from senior developers and is heavily tested in technical interviews.',
    simpleExplanation: 'JavaScript is the script that makes a webpage interactive — like the stage directions in a play. HTML is the stage set, CSS is the costumes, and JavaScript tells actors when to move. When you click "Add to Cart" and a number updates without reloading the page, that is JavaScript manipulating the DOM in response to your event.',
    detailedExplanation: 'Closures: a function retains access to its enclosing scope even after that scope exits. Used in module patterns, memoization, and event handlers. Prototypal inheritance: every object has a [[Prototype]] chain. class syntax is syntactic sugar over this. The event loop: synchronous code runs on the call stack; async operations (setTimeout, fetch, addEventListener callbacks) execute via the microtask queue (Promises) and macrotask queue (setTimeout, setInterval). Promises and async/await manage asynchronous code. Destructuring, spread/rest, template literals, and arrow functions are ES6+ features used universally.',
    realWorldExample: 'Google Maps uses JavaScript to: fetch map tiles via the Maps API (async/await + fetch), update the URL with new coordinates (history.pushState), respond to drag events on the map canvas (addEventListener), calculate and render routes using graph algorithms, and animate smooth zoom transitions using requestAnimationFrame.',
    formula: 'Event loop order:\n1. Execute synchronous code (call stack)\n2. Process all microtasks (Promise callbacks)\n3. Render (browser repaints)\n4. Process one macrotask (setTimeout callback)\n5. Repeat\n\nClosure pattern:\nfunction counter() {\n  let count = 0\n  return () => ++count  // captures count via closure\n}\nconst increment = counter()\nincrement() // 1, increment() // 2',
    codeExamples: [
      {
        title: 'DOM Manipulation, Events, and Fetch',
        language: 'javascript',
        code: `// ── 1. Closures and module pattern ──
function createCounter(initial = 0) {
  let count = initial  // private — not accessible outside

  return {
    increment() { return ++count },
    decrement() { return --count },
    reset()     { count = initial; return count },
    value()     { return count },
  }
}

const counter = createCounter(10)
console.log(counter.increment())  // 11
console.log(counter.increment())  // 12
console.log(counter.decrement())  // 11
console.log(counter.value())      // 11
// counter.count is undefined — encapsulated!

// ── 2. Array higher-order functions ──
const students = [
  { name: 'Alice', score: 92, grade: 'A' },
  { name: 'Bob',   score: 74, grade: 'B' },
  { name: 'Carol', score: 88, grade: 'A' },
  { name: 'Dave',  score: 61, grade: 'C' },
]

const aStudents = students
  .filter(s => s.grade === 'A')
  .map(s => s.name)
console.log(aStudents)  // ['Alice', 'Carol']

const average = students.reduce((sum, s) => sum + s.score, 0) / students.length
console.log(average.toFixed(1))  // 78.8

// ── 3. DOM manipulation ──
function buildStudentList(data) {
  const ul = document.createElement('ul')
  ul.className = 'student-list'

  data.forEach(student => {
    const li = document.createElement('li')
    li.innerHTML = \`
      <span class="name">\${student.name}</span>
      <span class="score grade-\${student.grade}">\${student.score}</span>
    \`
    ul.appendChild(li)
  })

  return ul
}

document.getElementById('app').appendChild(buildStudentList(students))

// ── 4. Async/Await with error handling ──
async function fetchUserProfile(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`)

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
    }

    const user = await response.json()

    // Parallel requests
    const [posts, followers] = await Promise.all([
      fetch(\`https://api.example.com/users/\${userId}/posts\`).then(r => r.json()),
      fetch(\`https://api.example.com/users/\${userId}/followers\`).then(r => r.json()),
    ])

    return { user, posts, followers }
  } catch (error) {
    console.error('Failed to fetch profile:', error.message)
    return null
  }
}

// ── 5. Event delegation ──
document.getElementById('student-list').addEventListener('click', (event) => {
  const item = event.target.closest('li[data-id]')
  if (!item) return  // click didn't land on a list item

  const studentId = item.dataset.id
  fetchUserProfile(studentId).then(profile => {
    if (profile) showProfileModal(profile)
  })
})`,
        output: `Counter with closure:
11
12
11
11

Filtered A-grade students: ['Alice', 'Carol']
Average score: 78.8

DOM: appends <ul> with 4 <li> items to #app
Each item shows name + color-coded score badge

Event delegation: single listener handles all
list item clicks — efficient, works for dynamic items`,
        explanation: 'Closure encapsulates count as private state — the returned object methods share access to the same count variable through closure, but external code cannot reach it directly. Array methods (filter, map, reduce) compose cleanly in pipeline style. Event delegation attaches one listener to the parent rather than N listeners to N children — critical for performance with dynamic lists. Promise.all() parallelizes independent async requests.',
      },
    ],
    commonMistakes: [
      'Using var inside loops — var is function-scoped, causing closure bugs. Use let or const.',
      'Not handling Promise rejections — unhandled rejections crash Node.js processes and produce console warnings in browsers.',
      'Mutating state directly (arr.push, obj.prop = x) inside React state — always return new objects/arrays.',
      'Blocking the main thread with synchronous heavy computation — use Web Workers for CPU-intensive tasks.',
    ],
    bestPractices: [
      'Prefer const by default, let when reassignment is needed, never var.',
      'Use optional chaining (user?.address?.city) and nullish coalescing (name ?? "Anonymous") to safely handle null/undefined.',
      'Separate data fetching from rendering logic — a function that fetches data should not also manipulate the DOM.',
      'Use event delegation for lists and tables — one listener on the parent rather than one per child element.',
    ],
    exercises: [
      'Implement a debounce function that delays invoking a callback until N milliseconds after the last call — use it on a search input.',
      'Build a simple Promise-based API client with retry logic: if the request fails, retry up to 3 times with exponential backoff.',
      'Create a generic memoize function using a Map as cache, then benchmark it with a slow recursive Fibonacci function.',
    ],
    quizQuestions: [
      {
        question: 'What will console.log output? const fn = (x) => x * 2; const double = fn; fn = null; console.log(double(5))',
        options: ['null', '10', 'TypeError: fn is not a function', 'TypeError: Assignment to constant variable'],
        answer: 3,
        explanation: 'const prevents reassignment of the binding. fn = null throws "Assignment to constant variable" at compile time. The code never runs, so double(5) is never evaluated.',
      },
      {
        question: 'Which executes first after: setTimeout(fn, 0); Promise.resolve().then(fn2); console.log("sync");',
        options: ['fn', 'fn2', '"sync"', 'All execute simultaneously'],
        answer: 2,
        explanation: 'Execution order: (1) "sync" — synchronous. (2) fn2 — Promise microtask queue runs before macrotasks. (3) fn — setTimeout is a macrotask, runs after all microtasks clear.',
      },
    ],
    interviewQuestions: [
      'Explain how closures work and give a practical use case.',
      'What is the event loop and how does it handle async operations?',
      'What is the difference between == and === in JavaScript?',
    ],
    summary: 'JavaScript enables dynamic web pages through DOM manipulation, event handling, and async data fetching. Key concepts: closures (private state via lexical scope), the event loop (microtask then macrotask), Promises/async-await (async control flow), and array HOFs (filter/map/reduce). Always use const/let, handle all Promise rejections, and separate fetching from rendering.',
    nextTopic: 'react-fundamentals',
  },

  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    intro: 'React is a JavaScript library for building component-based user interfaces where the UI is a pure function of state.',
    whatIsIt: 'React uses a virtual DOM — a JavaScript representation of the actual DOM. When state changes, React computes a diff (reconciliation) and applies only the minimal real DOM updates. Components are functions (or classes) that accept props and return JSX. State (useState) persists data across renders. Effects (useEffect) synchronize with external systems (APIs, subscriptions, timers). The component tree flows data downward via props and upward via callback props.',
    whyImportant: 'React is used by Meta, Netflix, Airbnb, Twitter, and thousands of companies. Understanding React\'s mental model (UI = f(state)) and hooks enables building complex applications with predictable behavior. React\'s component model enables large teams to work on isolated pieces. React Native extends the same model to iOS and Android apps.',
    simpleExplanation: 'React is like LEGO bricks for UIs. Each component is one brick with a specific shape (props) and internal state. You compose complex UIs from small reusable components. When a brick\'s state changes, only that brick and its children redraw — not the entire page. This makes UIs fast and maintainable.',
    detailedExplanation: 'Rules of Hooks: only call hooks at the top level (not inside loops/conditions), only call from React functions. useState returns [value, setter] — calling setter triggers re-render with new value. useEffect(fn, deps) runs fn after render; deps array controls when it re-runs (empty = once on mount, [x] = when x changes, omitted = every render). useMemo and useCallback memoize expensive computations and function references. The key prop in lists helps React identify which items changed — must be stable unique IDs, not array indices.',
    realWorldExample: 'Airbnb\'s search page: a <SearchFilters> component holds filter state (price range, dates, amenities). When a filter changes, setState triggers re-render of <ListingGrid> with filtered results. Each <ListingCard> is a pure component that renders from props. useEffect fetches results from the API when filter state changes. This component tree replaces 5,000+ lines of jQuery DOM manipulation with ~300 lines of declarative React.',
    formula: 'Component anatomy:\nfunction MyComponent({ title, count, onIncrement }) {\n  const [localState, setLocalState] = useState(0)\n\n  useEffect(() => {\n    document.title = title\n    return () => { document.title = "App" }  // cleanup\n  }, [title])\n\n  return <button onClick={onIncrement}>{title}: {count}</button>\n}\n\nKey rule for lists:\n{items.map(item => <Row key={item.id} data={item} />)}',
    codeExamples: [
      {
        title: 'Custom Hooks, State, and Effects',
        language: 'jsx',
        code: `import { useState, useEffect, useCallback, useMemo } from 'react'

// ── Custom hook: data fetching ──
function useFetch(url) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false   // prevent state update after unmount

    setLoading(true)
    setError(null)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json()
      })
      .then(json => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }   // cleanup on re-run or unmount
  }, [url])

  return { data, loading, error }
}

// ── Component: filterable product list ──
function ProductList() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('all')

  const { data: products, loading, error } = useFetch('/api/products')

  // Derived state — memoized to avoid recomputing every render
  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchesQuery    = p.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || p.category === category
      return matchesQuery && matchesCategory
    })
  }, [products, query, category])

  // Stable callback reference — won't cause child re-renders
  const handleAddToCart = useCallback((product) => {
    console.log('Adding to cart:', product.name)
    // dispatch to cart state...
  }, [])

  if (loading) return <div className="spinner" aria-label="Loading products..." />
  if (error)   return <div className="error">Error: {error}</div>

  return (
    <div className="product-page">
      <div className="filters">
        <input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      <p className="result-count">{filtered.length} products found</p>

      <ul className="product-grid">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </ul>
    </div>
  )
}

// ── Pure presentational component ──
function ProductCard({ product, onAddToCart }) {
  return (
    <li className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p className="price">\${product.price.toFixed(2)}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </li>
  )
}

export default ProductList`,
        output: `Renders:
- Search input + category dropdown
- "24 products found" (updates live as user types)
- Grid of product cards with image, name, price, button

useFetch hook behavior:
- loading=true → shows spinner
- fetch completes → loading=false, data populated
- user searches "phone" → filtered recomputes → 3 results shown
- component unmounts → cleanup sets cancelled=true, prevents setState on dead component`,
        explanation: 'Custom hook useFetch encapsulates loading/error/data state — reusable across any component. The cleanup function (return () => cancelled=true) prevents React warning "Can\'t perform setState on unmounted component" when the component unmounts before the fetch resolves. useMemo computes filtered only when products, query, or category change — not every render. useCallback stabilizes the handleAddToCart reference so ProductCard doesn\'t re-render when ProductList re-renders for unrelated reasons.',
      },
    ],
    commonMistakes: [
      'Putting everything in one giant component — split at logical boundaries (each piece of UI that could change independently).',
      'Using array index as key — causes bugs when list items reorder or insert. Always use stable unique IDs.',
      'Reading stale state in async callbacks — capture the value in the closure or use a ref for the latest value.',
      'Missing useEffect dependencies — omitting deps causes the effect to not re-run when it should, leading to stale data bugs.',
    ],
    bestPractices: [
      'Extract reusable logic into custom hooks (useFetch, useLocalStorage, useWindowSize) to keep components focused on rendering.',
      'Lift state up to the lowest common ancestor of components that need to share it.',
      'Keep components pure: given the same props, always render the same output and produce no side effects during render.',
      'Use React DevTools Profiler to identify unnecessary re-renders before optimizing with memo/useMemo/useCallback.',
    ],
    exercises: [
      'Build a useLocalStorage hook that syncs state to localStorage and initializes from it — handle JSON serialization and storage events.',
      'Create a <DataTable> component with client-side sorting and pagination — extract the sort/page logic into a custom hook.',
      'Implement an optimistic UI pattern: when a user likes a post, immediately update the count in the UI and rollback if the API call fails.',
    ],
    quizQuestions: [
      {
        question: 'When does useEffect with an empty dependency array [] run?',
        options: [
          'Every render',
          'Once after the first render only',
          'Every render where state changed',
          'Never',
        ],
        answer: 1,
        explanation: 'An empty deps array [] means the effect has no dependencies, so it runs exactly once after the initial render (componentDidMount equivalent). Return a cleanup function to run on unmount. No deps array at all runs after every render.',
      },
      {
        question: 'What problem does the key prop solve in React lists?',
        options: [
          'Improves render speed by caching JSX',
          'Tells React which list items are the same across renders',
          'Prevents re-rendering of list items',
          'Associates CSS classes with list items',
        ],
        answer: 1,
        explanation: 'React uses key to match elements between renders. Without stable keys, React may reuse the wrong DOM node when items reorder — causing state bugs (e.g., a text input retaining the wrong value). Keys must be unique among siblings and stable (not random values generated at render time).',
      },
    ],
    interviewQuestions: [
      'Explain how React\'s reconciliation algorithm works.',
      'What is the difference between controlled and uncontrolled components?',
      'When would you use useRef instead of useState?',
    ],
    summary: 'React builds UIs as trees of pure components where UI = f(state). useState manages local component state, useEffect synchronizes side effects with the component lifecycle, useMemo/useCallback optimize performance by memoizing values and callbacks. Extract reusable stateful logic into custom hooks. Always use stable unique IDs as list keys.',
    nextTopic: 'nodejs-backend',
  },

  {
    id: 'nodejs-backend',
    title: 'Node.js & REST APIs',
    intro: 'Node.js runs JavaScript on the server, enabling full-stack JavaScript development. Express.js makes it trivial to build REST APIs consumed by frontend applications.',
    whatIsIt: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine with a non-blocking, event-driven I/O model. Express.js is a minimal web framework providing routing, middleware, and request/response handling. REST APIs use HTTP verbs (GET/POST/PUT/PATCH/DELETE) and URLs to represent resources. JSON is the standard data format. Middleware functions process requests in a pipeline — authentication, logging, validation, rate limiting.',
    whyImportant: 'Node.js is the most popular server-side JavaScript environment. The npm ecosystem has over 2 million packages. Express powers APIs for LinkedIn, Netflix, and Uber. Understanding REST API design, authentication with JWT, and database integration is essential for full-stack development and is tested in every backend interview.',
    simpleExplanation: 'Node.js is like a restaurant kitchen — it can handle many orders simultaneously without waiting for one dish to finish before starting the next (non-blocking I/O). Express is the menu system that routes "order #42 for table 7" to the right cook. REST APIs are the standard language between your frontend waiter and the backend kitchen.',
    detailedExplanation: 'Node.js event loop: I/O operations (database queries, file reads, HTTP requests) are handled by libuv\'s thread pool. Callbacks/Promises are queued when operations complete — the main thread is never blocked. Express middleware: app.use(fn) adds a middleware fn(req, res, next) to the pipeline. next() passes to the next middleware. Middleware order matters. JWT authentication: client includes Authorization: Bearer <token> header. Middleware verifies and decodes the token, attaches user to req object. Input validation: never trust user input — validate and sanitize using a library like Zod or express-validator.',
    realWorldExample: 'Stripe\'s payment API uses REST: POST /v1/payment_intents creates a payment, GET /v1/payment_intents/:id retrieves it. Each request includes Authorization: Bearer sk_live_xxx. Stripe\'s Node.js server validates the amount/currency, creates a database record, communicates with card networks (async I/O), and returns a JSON response — all without blocking other requests.',
    formula: 'REST resource naming:\nGET    /api/users          → list all users\nPOST   /api/users          → create user\nGET    /api/users/:id      → get specific user\nPUT    /api/users/:id      → replace user\nPATCH  /api/users/:id      → partial update\nDELETE /api/users/:id      → delete user\n\nHTTP Status codes:\n200 OK, 201 Created, 400 Bad Request,\n401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error',
    codeExamples: [
      {
        title: 'Express REST API with JWT Auth and Middleware',
        language: 'javascript',
        code: `import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const app = express()
app.use(express.json())

// ── In-memory store (use a database in production) ──
const users = new Map()
const JWT_SECRET = process.env.JWT_SECRET  // never hardcode!

// ── Middleware: JWT authentication ──
function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)  // attaches decoded payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Middleware: input validation ──
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    req.body = value  // use validated + coerced values
    next()
  }
}

// ── Auth routes ──
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name required' })
  }
  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const hash = await bcrypt.hash(password, 12)  // 12 rounds = ~300ms
  const user = { id: crypto.randomUUID(), email, name, passwordHash: hash }
  users.set(email, user)

  const token = jwt.sign({ id: user.id, email, name }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: user.id, email, name } })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = users.get(email)

  // Constant-time comparison to prevent timing attacks
  const match = user && await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

// ── Protected resource routes ──
const posts = new Map()

app.get('/api/posts', authenticate, (req, res) => {
  const userPosts = [...posts.values()].filter(p => p.authorId === req.user.id)
  res.json(userPosts)
})

app.post('/api/posts', authenticate, (req, res) => {
  const { title, content } = req.body
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'title and content required' })
  }

  const post = {
    id:        crypto.randomUUID(),
    title:     title.trim(),
    content:   content.trim(),
    authorId:  req.user.id,
    authorName: req.user.name,
    createdAt: new Date().toISOString(),
  }
  posts.set(post.id, post)
  res.status(201).json(post)
})

app.delete('/api/posts/:id', authenticate, (req, res) => {
  const post = posts.get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Not your post' })
  }

  posts.delete(req.params.id)
  res.status(204).send()  // 204 No Content
})

// ── Global error handler (must have 4 params) ──
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(3000, () => console.log('API running on http://localhost:3000'))`,
        output: `POST /api/auth/register { email, password, name }
→ 201 { token: "eyJhbG...", user: { id, email, name } }

POST /api/auth/login { email, password }
→ 200 { token: "eyJhbG...", user: { id, email, name } }

POST /api/posts (with Bearer token)
→ 201 { id, title, content, authorId, createdAt }

DELETE /api/posts/abc123 (wrong user's token)
→ 403 { error: "Not your post" }

GET /api/posts (no token)
→ 401 { error: "Missing token" }`,
        explanation: 'The authenticate middleware verifies the JWT on every protected route — eliminating duplicated auth logic. bcrypt.compare() uses constant-time comparison, preventing timing attacks where an attacker measures response time to guess if an email exists. The 403/404 distinction is important: 404 when the resource doesn\'t exist, 403 when it exists but the user lacks permission. The global error handler (4-parameter function) catches any errors thrown in route handlers.',
      },
    ],
    commonMistakes: [
      'Storing JWT secret in source code — always use environment variables, never commit secrets.',
      'Not validating user input before using it in database queries — leads to injection vulnerabilities.',
      'Returning 200 for all responses including errors — use correct HTTP status codes so clients can handle errors properly.',
      'Not handling async errors in Express — wrap async route handlers with try/catch or use an async error wrapper.',
    ],
    bestPractices: [
      'Structure routes by resource in separate files — routes/users.js, routes/posts.js — and mount them in app.js.',
      'Use environment variables for all secrets, database URLs, and config — never hardcode them.',
      'Return consistent error response shapes: { error: string, code?: string } so clients can handle them uniformly.',
      'Log request method, URL, status code, and duration for every request — essential for debugging production issues.',
    ],
    exercises: [
      'Add pagination to GET /api/posts using query params ?page=1&limit=10 — return total count and hasMore in the response.',
      'Implement a rate limiter middleware that allows max 100 requests per minute per IP using an in-memory Map.',
      'Add refresh token support: short-lived access tokens (15min) + long-lived refresh tokens (30 days) stored in httpOnly cookies.',
    ],
    quizQuestions: [
      {
        question: 'Which HTTP status code should a REST API return when creating a resource successfully?',
        options: ['200 OK', '201 Created', '202 Accepted', '204 No Content'],
        answer: 1,
        explanation: '201 Created indicates a new resource was created. The response body should include the created resource and a Location header pointing to its URL. 200 is for successful reads/updates. 204 is for successful deletions (no body to return).',
      },
      {
        question: 'JWT tokens should be stored on the client in:',
        options: [
          'localStorage — easy to access from JavaScript',
          'sessionStorage — cleared when tab closes',
          'httpOnly cookies — inaccessible to JavaScript',
          'URL query parameters — convenient to pass around',
        ],
        answer: 2,
        explanation: 'httpOnly cookies cannot be read by JavaScript, protecting against XSS attacks. localStorage and sessionStorage are accessible to any JavaScript on the page — a single XSS vulnerability can steal all tokens. URL query parameters log in server access logs and browser history — never put tokens there.',
      },
    ],
    interviewQuestions: [
      'What is middleware in Express and how does the request pipeline work?',
      'Explain the difference between authentication and authorization.',
      'How would you design a rate limiting system for a public API?',
    ],
    summary: 'Node.js\'s non-blocking event loop handles thousands of concurrent connections without spawning threads. Express middleware chains process requests through authentication, validation, and business logic before sending a response. REST APIs use HTTP verbs and status codes to represent CRUD operations on resources. Always validate input, use environment variables for secrets, and handle all async errors.',
    nextTopic: undefined,
  },
]
