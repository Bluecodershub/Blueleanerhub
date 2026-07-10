import type { TopicLesson } from '../_shared/types'

// ─── Web-development curriculum — rewritten from first principles by the
// subject faculty. Voice: instructor-in-the-room. Every code sample, dataset,
// and paragraph is original to this platform.
export const webdevLessons: TopicLesson[] = [
  {
    id: 'html-fundamentals',
    title: 'HTML Fundamentals',
    intro:
      'HTML is where every web page starts and where every debugging session eventually ends up. Get the structure right and the browser, the search engine, and the screen reader all agree on what your content is; get it wrong and you spend the rest of your career fighting CSS.',
    whatIsIt:
      'HTML annotates content with tags that describe meaning: headings h1–h6, paragraphs, anchors, images, lists, tables, forms, and the semantic block elements header, nav, main, section, article, aside, figure, footer. The browser parses this markup into a tree of nodes — the Document Object Model — that CSS reads to render and that JavaScript reads to mutate. Every serious interaction on a page eventually resolves to a change in that tree.',
    whyImportant:
      'HTML is the single artefact your users, search crawlers, screen readers, and JavaScript all read simultaneously. A page that uses a <div> where a <nav> was called for is invisible to landmark navigation; a page that skips heading levels reads like a poorly indexed book to a blind user; a page with unlabelled form controls fails an accessibility audit and, under recent RBI accessibility guidance, may not be allowed to ship to production for a regulated fintech. Beyond the ethics, senior engineers debug faster because they can predict, from the markup alone, what the DOM will look like once the CSS runs.',
    simpleExplanation:
      'Think of HTML as the reinforced concrete of a building. CSS is the paint, tiling, and lighting. JavaScript is the electrical and plumbing. You can repaint later; you can rewire later; but the load-bearing structure is decided in the markup, and everything downstream depends on getting it right.',
    detailedExplanation:
      'The <!DOCTYPE html> line at the top of every modern page tells the browser to use standards mode; forget it and Internet Explorer legacy behaviours resurface in the strangest layout bugs. Inside <head> live the metadata that never render — charset, viewport, title, description, Open Graph and Twitter Card fragments — that decide how your link previews at Twitter, WhatsApp, and Google look. Inside <body> live the elements that render, split into block-level (divs, headings, paragraphs, lists) that occupy full width by default, and inline (span, anchor, strong, em, img) that flow within text. The right semantic wrapper matters more than the class name: <article> for self-contained content that would still make sense syndicated elsewhere, <section> for a heading-bounded thematic group inside a page, <aside> for content tangential to the main flow, <nav> for the primary navigation landmarks the assistive technology will offer to skip to.',
    realWorldExample:
      'Open the source of any long-form article on The Hindu or The Ken. You will find <article> wrapping the piece, an <h1> holding the title, a <time datetime="2026-07-08"> tag beside the byline that lets Google render "8 hours ago" in its result card, <figure> wrapping every hero photo with a matching <figcaption>, and <blockquote> around every pulled quote. That structured markup is what powers rich search results, AMP-style summaries, and the "Reader Mode" every modern browser offers.',
    formula:
      'Skeleton every page shares:\n\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Page title</title>\n    <meta name="description" content="Short summary for search cards.">\n  </head>\n  <body>\n    <header>\n      <nav aria-label="Primary">…</nav>\n    </header>\n    <main>\n      <article>…</article>\n    </main>\n    <footer>…</footer>\n  </body>\n</html>',
    codeExamples: [
      {
        title: 'A semantic long-form article, ready for search and screen-readers',
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description"
        content="How the Konkan Railway crosses two hundred bridges and ninety-one tunnels in five hundred kilometres.">
  <title>Konkan Railway — a bridge and a tunnel every kilometre</title>
</head>
<body>
  <header>
    <nav aria-label="Primary">
      <a href="/">Home</a>
      <a href="/rail">Rail</a>
      <a href="/travel">Travel</a>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>Konkan Railway — a bridge and a tunnel every kilometre</h1>
        <p>By <strong>Anjali Ravi</strong> ·
          <time datetime="2026-07-08">8 July 2026</time>
        </p>
      </header>

      <section>
        <h2>Why the alignment was so hard</h2>
        <p>
          Between Roha and Thokur the coastline drops sharply into the sea.
          Any straight line through the Sahyadris crosses ravines, tidal
          creeks and unstable laterite. The final alignment settled on
          <em>two thousand bridges</em> and
          <em>ninety-one tunnels</em>, one of them —
          Karbude — the longest in Indian Railways at 6.5&nbsp;km.
        </p>

        <figure>
          <img src="/media/karbude-portal.avif"
               alt="South portal of the Karbude tunnel, viewed from the track."
               width="900" height="600" loading="lazy">
          <figcaption>The south portal of the Karbude tunnel.</figcaption>
        </figure>
      </section>

      <section>
        <h2>Terms you will meet in the piece</h2>
        <dl>
          <dt>Portal</dt>
          <dd>The mouth of a tunnel where it meets daylight.</dd>

          <dt>Ballastless track</dt>
          <dd>Rails fastened directly to concrete instead of resting on stone
              ballast — used inside long tunnels for stability.</dd>

          <dt>Cant deficiency</dt>
          <dd>The lateral acceleration a curve imposes on a train because the
              outer rail is not raised quite enough for the design speed.</dd>
        </dl>
      </section>

      <aside aria-label="Editor's note">
        <p>A companion piece on the monsoon slope failures of 2018 is
           <a href="/rail/konkan-slope-2018">available here</a>.</p>
      </aside>
    </article>
  </main>

  <footer>
    <p>© 2026 Sahyadri Post. All rights reserved.</p>
  </footer>
</body>
</html>`,
        output: `Browsers render:
 • A sticky top navigation.
 • An article with title, byline, machine-readable date.
 • A section carrying a captioned figure.
 • A definition list — the right semantic pattern for terms.
 • A sidebar-style aside labelled "Editor's note".
 • A footer with copyright.

Accessibility tree offered to a screen reader:
 landmark: banner
 landmark: navigation ("Primary")
 landmark: main
   landmark: article
     landmark: complementary ("Editor's note")
 landmark: contentinfo`,
        explanation:
          'Notice a few small choices. The <time datetime="…"> element gives machines an ISO date they can index; humans see the friendly form. <figure> paired with <figcaption> is the correct way to caption an image — a paragraph beside a floated image is not the same thing to a screen reader. The definition-list pattern (dl / dt / dd) fits glossary content in a way <ul> never can, because the pairing between term and definition is semantic. Every landmark you see in the accessibility tree came from a semantic tag, not from a class name.',
      },
    ],
    commonMistakes: [
      'Reaching for <div> and <span> before considering a semantic tag. Every landmark you miss is a screen-reader user who cannot skip to the region they need.',
      'Skipping the viewport meta tag. Mobile browsers then render at nine hundred and eighty pixels and every user has to pinch-zoom.',
      'Using <br><br> to fake vertical spacing. Structure and presentation should be separate; use CSS margins.',
      'Nesting block elements inside <a> in HTML4-era ways. HTML5 permits it inside an anchor for whole-card links, but keep the wrapped block a single semantic unit.',
    ],
    bestPractices: [
      'Choose the tag before you choose the class. If your first instinct is <div class="article">, use <article>. If it is <div class="nav">, use <nav>.',
      'Exactly one <h1> per page describing the topic. Every subsequent heading level is a step down the outline — never skip levels.',
      'Every image needs alt text. Descriptive for informative images, empty (alt="") for purely decorative ones so the screen reader can skip them.',
      'Every form control needs a matching <label for="…">. The label is not only for accessibility; it also enlarges the click target on mobile devices.',
    ],
    exercises: [
      'Build a semantic single-page CV using <header>, <main>, one <section> per group (Education, Experience, Projects), <ul> for skills, and a <footer> with contact links.',
      'Rewrite a jQuery-era navigation bar made entirely of divs and anchors into a proper <nav> > <ul> > <li> > <a> structure. Keep the current styles by attaching them to the new tags.',
      'Author a contact form with a labelled email input, a phone input with proper inputmode, a textarea, a select, and a submit button. Every field must have a visible label associated by "for".',
    ],
    quizQuestions: [
      {
        question:
          'Which element best expresses a self-contained blog post that could be syndicated to another site?',
        options: ['<div class="post">', '<section>', '<article>', '<main>'],
        answer: 2,
        explanation:
          '<article> is defined as an independent, self-contained composition — a blog post, a news story, a forum comment. <section> is a thematic group within a document; <main> marks the primary content of the whole page and there is exactly one per page.',
      },
      {
        question:
          'Without the viewport meta tag, what happens on a mobile browser?',
        options: [
          'Search engines refuse to index the page.',
          'The browser assumes a ~980-pixel viewport and shows a zoomed-out desktop layout.',
          'JavaScript fails to execute.',
          'Stylesheets are not applied.',
        ],
        answer: 1,
        explanation:
          'The viewport meta tag tells the mobile browser to treat the CSS pixel width as the device width. Without it the browser falls back to a legacy ~980-pixel virtual viewport and the page appears tiny.',
      },
    ],
    interviewQuestions: [
      'When would you choose <section> over <article>, or vice versa?',
      'Explain the document outline algorithm and why heading order matters for accessibility and SEO.',
      'How does semantic markup change the experience for a user browsing with a screen reader?',
    ],
    summary:
      'HTML is the semantic contract between your content and everyone who reads it — browsers, search engines, screen readers, and downstream JavaScript. Use the most specific semantic element available; keep one h1 per page; every image gets alt text; every form control gets a label. Get the markup right first, and every downstream decision becomes easier.',
    nextTopic: 'css-styling',
  },

  {
    id: 'css-styling',
    title: 'CSS Styling & Layout',
    intro:
      'CSS turns semantic markup into a finished interface. Modern CSS — custom properties, Flexbox, Grid, container queries — has almost nothing in common with the float-hacks and clearfix rituals of a decade ago. Learn the modern layout primitives well and you write far less CSS to solve much harder layout problems.',
    whatIsIt:
      'CSS is a rules language: selectors pick elements, declarations apply properties. Every rule you write competes with every other rule that could match the same element, and the cascade decides who wins. The box model (content, padding, border, margin) governs how each element consumes space. Flexbox is the one-dimensional layout primitive — a row or a column of items with alignment along one axis. CSS Grid is the two-dimensional primitive — rows and columns simultaneously. Custom properties (CSS variables) turn design tokens into real, live values you can override at any level of the DOM.',
    whyImportant:
      'A design system without shared tokens becomes an inconsistent mess within a few sprints. A layout system without Grid becomes a chain of media queries fighting each other. Every serious frontend today — the PhonePe merchant dashboard, the Swiggy restaurant onboarding, the CRED credit-card wall — is built on custom properties for tokens, Grid for the page skeleton, and Flexbox for the internal alignment of each card. Knowing which of the three to reach for is what turns a candidate into a hire.',
    simpleExplanation:
      'CSS is like a house style guide backed by an editor. You write the rules — "every button in the primary action colour is 44 pixels tall" — and every button on the site obeys, forever. The cascade is the editor: when two rules disagree, the more specific one wins, or the later one wins, or the one shouting !important wins, in that order of last resort.',
    detailedExplanation:
      'Specificity is scored, roughly, as inline (1000) beats id (100) beats class or attribute or pseudo-class (10) beats element or pseudo-element (1). !important overrides everything except another !important further down. Flexbox: display: flex on the container turns its children into flex items along the main axis; justify-content aligns them along that axis, align-items along the cross axis. Grid: display: grid plus grid-template-columns / grid-template-rows lays out both axes at once, and repeat(auto-fit, minmax(minSize, 1fr)) gives you a responsive column count without a single media query. Container queries — @container (min-width: …) — let a component adapt to the width of its parent rather than the viewport, which is the layout primitive frontend engineers have been asking for since 2013.',
    realWorldExample:
      'The PhonePe merchant dashboard uses a CSS Grid page skeleton — a sidebar column, a main column, a right-hand insights column that folds under on tablet. Inside each card is Flexbox — an icon on the left, a stack of numbers and copy in the middle, an action button on the right. All the colour, radius, and spacing values live as custom properties on :root; switching to dark mode is a single override on [data-theme="dark"]. The whole page ships as under 20 KB of hand-written CSS.',
    formula:
      'Box model:\n total_width = content_width + padding_left + padding_right + border_left + border_right\nRule of thumb: set box-sizing: border-box everywhere so declared width includes padding + border.\n\nCentre anything with Flexbox:\n .box { display: flex; justify-content: center; align-items: center; }\n\nResponsive columns without a media query:\n .grid {\n   display: grid;\n   grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n   gap: 1.25rem;\n }\n\nSpecificity, roughly:\n inline > id > class / attribute / pseudo-class > element / pseudo-element',
    codeExamples: [
      {
        title: 'A fintech-style merchant dashboard: tokens, Grid, and Flexbox',
        language: 'css',
        code: `/* ── Design tokens: one place, one truth ──────────────────── */
:root {
  --brand:            #4b1fd4;
  --brand-ink:        #f4f2ff;
  --surface:          #ffffff;
  --surface-2:        #f4f5f8;
  --ink:              #101223;
  --ink-mute:         #545872;
  --border:           #e5e7ef;
  --radius:           14px;
  --shadow-1:         0 1px 3px rgb(15 17 34 / 0.08);
  --shadow-2:         0 8px 24px rgb(15 17 34 / 0.12);
  --gap:              20px;
}

[data-theme="dark"] {
  --surface:          #101223;
  --surface-2:        #191c33;
  --ink:              #f2f3fa;
  --ink-mute:         #9598b5;
  --border:           #232645;
  --brand-ink:        #f7f5ff;
}

/* ── Reset ────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--ink);
  background: var(--surface-2);
  line-height: 1.5;
}

/* ── Page skeleton: CSS Grid ──────────────────────────────── */
.app {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  grid-template-areas:
    "side  main  insights";
  min-height: 100vh;
}

.sidebar   { grid-area: side;     background: var(--surface); }
.main      { grid-area: main;     padding: 24px; }
.insights  { grid-area: insights; padding: 24px; background: var(--surface); }

@media (max-width: 960px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-areas:
      "side"
      "main"
      "insights";
  }
}

/* ── KPI card grid: no media query needed ─────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--gap);
  margin-bottom: 28px;
}

/* ── One KPI card: Flexbox inside ─────────────────────────── */
.kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-1);
  transition: box-shadow .2s ease, transform .2s ease;
}
.kpi:hover {
  box-shadow: var(--shadow-2);
  transform: translateY(-2px);
}

.kpi__icon {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: color-mix(in oklab, var(--brand) 12%, var(--surface));
  color: var(--brand);
  flex: none;
}

.kpi__body { display: flex; flex-direction: column; gap: 2px; }
.kpi__label { font-size: 12px; color: var(--ink-mute); letter-spacing: .02em; }
.kpi__value { font-size: 22px; font-weight: 700; }
.kpi__trend { font-size: 12px; color: #17916b; }
.kpi__trend[data-dir="down"] { color: #c22e5c; }

/* ── Primary action button ────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--brand);
  color: var(--brand-ink);
  font-weight: 600;
  border: 0;
  cursor: pointer;
  transition: filter .15s ease;
}
.btn-primary:hover { filter: brightness(1.08); }
.btn-primary:focus-visible {
  outline: 3px solid color-mix(in oklab, var(--brand) 55%, white);
  outline-offset: 2px;
}`,
        output: `Live behaviour of the layout:
 • Desktop: three-column dashboard.
 • Tablet (≤ 960px): stacks to sidebar → main → insights.
 • KPI grid rearranges 4 → 3 → 2 → 1 as the viewport narrows,
   without a single media query, thanks to auto-fit + minmax.
 • Every card lifts on hover with a soft shadow transition.
 • Toggling [data-theme="dark"] on <body> retheme the whole
   dashboard because everything reads from custom properties.`,
        explanation:
          'Two ideas earn their weight here. First, custom properties are alive — you can override them on any element, and the cascade takes care of the rest. That is the whole story of dark mode: define the tokens once, override them under a selector. Second, auto-fit with minmax(260px, 1fr) is the responsive-column primitive that made media queries mostly optional. The browser fits as many 260-pixel-wide columns as the container allows, then stretches each to 1fr. There is no arithmetic for us to get wrong.',
      },
    ],
    commonMistakes: [
      'Sizing type in pixels. Use rem for anything a user might scale — a visually impaired user who has bumped their browser default from 16 to 20 pixels should see your typography respect them.',
      'Forgetting box-sizing: border-box. The default content-box makes width calculations counter-intuitive; the moment a padding is added, layouts drift by two pixels everywhere.',
      'Using position: absolute for page layout. Reach for it only when the element must sit outside the flow — an overlay, a tooltip, a dismiss button in the top-right of a modal.',
      'Fighting the cascade with !important. Almost every use of !important is a design system leaking through — track the root cause and lift the selector, do not paper over it.',
    ],
    bestPractices: [
      'Define a design-token block at :root with colour, spacing, radius, and font-family. Every component reads from it.',
      'Write mobile-first CSS: base styles are the mobile layout, larger screens are progressive enhancements via min-width media queries.',
      'Grid for two-dimensional layout of the page, Flexbox for one-dimensional alignment within a card. Reach for container queries when a component must react to its parent, not to the viewport.',
      'Name classes by intent — .kpi, .kpi__value, .btn-primary — not by appearance. .blue-box is a promise you cannot keep.',
    ],
    exercises: [
      'Convert an existing three-column pricing table to CSS Grid. Collapse it to one column below 720px with a single media query.',
      'Centre a modal both horizontally and vertically using nothing but Flexbox on a full-viewport overlay.',
      'Add a container query to a card component that switches between horizontal and vertical layout based on the container width, not the viewport.',
    ],
    quizQuestions: [
      {
        question:
          'In a Flexbox container with flex-direction: row, which property aligns items on the cross axis?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-self'],
        answer: 1,
        explanation:
          'justify-content is the main axis; align-items is the cross axis. In a row, the main axis is horizontal and the cross axis is vertical.',
      },
      {
        question: 'Setting box-sizing: border-box changes:',
        options: [
          'The element loses its border.',
          'Padding and border are included inside the declared width.',
          'The margin is included inside the declared width.',
          'The element becomes block-level.',
        ],
        answer: 1,
        explanation:
          'border-box treats padding and border as part of the width. A 300px element with 20px padding stays exactly 300px wide, not 340px, which is what the older content-box default would produce.',
      },
    ],
    interviewQuestions: [
      'Walk me through the cascade. How is specificity calculated, and where does source order fit in?',
      'When would you pick CSS Grid over Flexbox, and vice versa? Give a real example of each.',
      'How do CSS custom properties differ from Sass variables, and why does the difference matter for theming?',
    ],
    summary:
      'CSS controls presentation via selectors, the cascade, and the box model. Custom properties give you design tokens that work at run time. Flexbox handles one-dimensional alignment; Grid handles two-dimensional layout; container queries handle component-scoped responsiveness. Apply box-sizing: border-box globally, write mobile-first, name classes by intent, and treat !important as a code smell.',
    nextTopic: 'javascript-fundamentals',
  },

  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    intro:
      'JavaScript is the only language that runs natively in every browser on Earth. It is also the language of Node.js on the server, of React Native on the phone, and — through V8 — of Electron on the desktop. Learn it well and you can build almost anything a user will ever see.',
    whatIsIt:
      'JavaScript is dynamically typed, prototype-based, and single-threaded. Variables come in three flavours — const (block-scoped, binding cannot be reassigned), let (block-scoped, reassignable), and var (function-scoped, avoid). Primitive types are string, number, boolean, null, undefined, symbol, and bigint; everything else is an object. Functions are first-class values — you can store them, pass them, and return them. Concurrency happens through the event loop: synchronous code runs on the call stack, Web APIs (setTimeout, fetch, addEventListener) run outside, and their callbacks are queued as microtasks (Promises) or macrotasks (timers) to be picked up when the stack empties.',
    whyImportant:
      'Almost every user-facing product in India ships JavaScript. The Zomato order tracker, the BookMyShow seat picker, the CoinDCX trade console — each is thousands of lines of client-side logic. On the server, Node.js runs a large share of Razorpay, Zerodha, and Meesho backends. Interviews reward candidates who can predict the output of an event-loop puzzle, explain a closure without hand-waving, and reason about the difference between a microtask and a macrotask.',
    simpleExplanation:
      'If HTML is the stage and CSS is the costume department, JavaScript is the play\'s director — it decides what happens when the user pulls a curtain, taps a button, or drags the ETA slider on a delivery-tracker screen. The DOM is the ensemble of actors; JavaScript tells them when to enter, exit, and change costume in response to events.',
    detailedExplanation:
      'A closure is a function together with the variables it captured from its lexical scope. That is how a click handler can still see the row id it was created next to, even after the outer function has returned. Prototypal inheritance means every object has a hidden [[Prototype]] link, and class is a nice wrapper around that pattern. The event loop guarantees a fixed order: run all synchronous code, then drain the microtask queue completely, then the browser renders, then a single macrotask is picked up. That is why a Promise callback runs before a setTimeout(fn, 0) that was scheduled a line earlier — microtasks jump the queue. ES2015 and later gave the language destructuring, spread and rest, template literals, arrow functions, optional chaining, nullish coalescing, and top-level await, all of which are now the default idiom rather than the exception.',
    realWorldExample:
      'The Zomato live order tracker is a great case study. When the delivery partner\'s device pings its location, the server pushes an event over a WebSocket. Client-side JavaScript receives the message, updates a piece of state, and asks the map to re-render the pin along the polyline. The ETA badge counts down every second using setInterval. The "Add tip" bottom sheet is a controlled component whose amount lives in local state until you tap "Send". All of it runs on the single-threaded event loop, and none of it blocks the rest of the app.',
    formula:
      'Event-loop order in one line:\n\n sync code → drain all microtasks → browser paints → run one macrotask → repeat\n\nClosure pattern for a private counter:\n\n function makeCounter(start = 0) {\n   let count = start;                     // captured\n   return {\n     inc: () => ++count,\n     dec: () => --count,\n     value: () => count,\n   };\n }\n\nRules of thumb:\n • const by default, let when you must reassign, never var.\n • Only ever compare with ===. Trust nothing about ==.\n • A Promise that has no .catch is a future incident.',
    codeExamples: [
      {
        title:
          'Closures, higher-order arrays, async/await, and event delegation — one file',
        language: 'javascript',
        code: `// ─── 1. Closure-based order tracker ─────────────────────────────
function createOrderTracker(initialStatus = 'placed') {
  let status = initialStatus;                 // private state
  const listeners = new Set();

  function notify() {
    for (const fn of listeners) fn(status);
  }

  return {
    advance() {
      const flow = ['placed', 'accepted', 'preparing', 'picked', 'delivered'];
      const next = flow[Math.min(flow.indexOf(status) + 1, flow.length - 1)];
      if (next !== status) { status = next; notify(); }
      return status;
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    status()    { return status; },
  };
}

const tracker = createOrderTracker();
const unsub   = tracker.onChange(s => console.log('status →', s));
console.log(tracker.advance()); // status → accepted
console.log(tracker.advance()); // status → preparing
unsub();                        // stop listening
console.log(tracker.advance()); // (no log, we unsubscribed)

// ─── 2. Higher-order array manipulation ─────────────────────────
const deliveries = [
  { partner: 'Aarti',  city: 'Mumbai',    minutes: 24, tip: 20 },
  { partner: 'Vinay',  city: 'Bengaluru', minutes: 41, tip:  0 },
  { partner: 'Rukmini',city: 'Chennai',   minutes: 18, tip: 40 },
  { partner: 'Salim',  city: 'Delhi',     minutes: 33, tip: 10 },
];

const onTime   = deliveries.filter(d => d.minutes <= 30);
const tipTotal = deliveries.reduce((sum, d) => sum + d.tip, 0);
const summary  = deliveries.map(d => \`\${d.partner}: \${d.minutes}m\`);

console.log('On-time partners:', onTime.map(d => d.partner)); // ['Aarti','Rukmini']
console.log('Total tips (₹) :', tipTotal);                    // 70
console.log('Summary        :', summary);

// ─── 3. Async fetching with parallelism and honest error handling ─
async function loadDashboard(riderId, { signal } = {}) {
  const base = 'https://api.example.in/v1';
  try {
    const [profile, orders, ratings] = await Promise.all([
      fetch(\`\${base}/riders/\${riderId}\`,            { signal }).then(assertOk),
      fetch(\`\${base}/riders/\${riderId}/orders\`,     { signal }).then(assertOk),
      fetch(\`\${base}/riders/\${riderId}/ratings\`,    { signal }).then(assertOk),
    ]);
    return { profile, orders, ratings };
  } catch (err) {
    if (err.name === 'AbortError') return null;      // user navigated away
    console.error('dashboard failed:', err.message);
    throw err;
  }
}
async function assertOk(res) {
  if (!res.ok) throw new Error(\`HTTP \${res.status} \${res.statusText}\`);
  return res.json();
}

// ─── 4. Event delegation on a growing list ──────────────────────
document
  .getElementById('order-list')
  .addEventListener('click', (event) => {
    const row = event.target.closest('li[data-order-id]');
    if (!row) return;                                // click missed a row
    const id = row.dataset.orderId;
    // open a details drawer for this order — one listener does it all.
    openDrawer(id);
  });`,
        output: `Console output for section 1 & 2:
status → accepted
accepted
status → preparing
preparing
preparing
On-time partners: ['Aarti','Rukmini']
Total tips (₹) : 70
Summary        : ['Aarti: 24m','Vinay: 41m','Rukmini: 18m','Salim: 33m']

Section 3 in practice:
 • Three requests fire in parallel; slowest one bounds the wait.
 • AbortController.signal cancels all three if the page unmounts.
 • Non-2xx responses become caught rejections, not silent errors.

Section 4 in practice:
 • One listener handles every row, including rows added later.
 • event.target.closest() walks up until it finds the row match.`,
        explanation:
          'The tracker in section 1 captures its status through closure — the returned object shares access, but no external code can touch the variable directly. Section 3 shows the async pattern that actually scales: parallelise independent requests with Promise.all, guard each with a status check, and let an AbortController tear the whole thing down if the user navigates away before the responses land. Section 4 is event delegation — one listener at the top of a growing list is a fixed cost, whereas one listener per row grows unboundedly and leaks when rows are removed.',
      },
    ],
    commonMistakes: [
      'Using var in loops or in conditionals. Its function-scoped hoisting produces subtle bugs; let and const are almost always what you meant.',
      'Ignoring an unhandled Promise rejection. In Node it will crash the process on modern versions; in the browser it becomes a silent user-visible failure.',
      'Mutating React state directly with array.push or object.prop = value. Return a new object or array; the diff will not see your mutation.',
      'Running heavy work synchronously on the main thread. A 300 ms JSON parse freezes the UI. Move it to a Web Worker or split it with requestIdleCallback.',
    ],
    bestPractices: [
      'const first, let next, never var. It is a habit you will not regret.',
      'Reach for optional chaining (obj?.a?.b) and nullish coalescing (name ?? "Guest") rather than long ternaries against null.',
      'Never mix data fetching with DOM writes in the same function. Separate compute from paint; it makes both easier to test.',
      'Prefer event delegation on parent containers for any list-shaped UI. Fewer listeners, less memory, and it survives dynamic children.',
    ],
    exercises: [
      'Write a debounce(fn, ms) that returns a debounced version of fn. Verify it on a search input where every keystroke would otherwise hit the network.',
      'Build a small fetchWithRetry(url, { retries = 3, backoff = 300 }) that retries on 5xx with exponential backoff and abandons on 4xx.',
      'Implement memoize(fn) using a Map keyed by JSON.stringify(args). Benchmark it on a slow recursive Fibonacci and confirm the timings.',
    ],
    quizQuestions: [
      {
        question:
          'What will the following program log?  const f = (x) => x * 2; const g = f; f = null; console.log(g(4));',
        options: ['null', '8', 'TypeError: f is not a function', 'SyntaxError: Assignment to constant variable'],
        answer: 3,
        explanation:
          'The binding f was declared const, so f = null is a SyntaxError at parse time. The line g(4) is never reached because the source never runs.',
      },
      {
        question:
          'Consider this sequence:  setTimeout(fn, 0);  Promise.resolve().then(fn2);  console.log("sync");  Which output prints first?',
        options: ['fn', 'fn2', '"sync"', 'They print at the same time'],
        answer: 2,
        explanation:
          'Synchronous code runs first, so "sync" prints immediately. Then all microtasks drain, so fn2 (a Promise continuation) runs next. Finally the timer callback fn — a macrotask — is picked up.',
      },
    ],
    interviewQuestions: [
      'Give me a closure that you would actually build in production, and explain what problem it solves.',
      'Walk through the event loop. Where do microtasks fit in and how do they differ from macrotasks?',
      'Explain the difference between == and === with one example each.',
    ],
    summary:
      'JavaScript is dynamically typed, single-threaded, and concurrent through the event loop. Master closures, the microtask–macrotask distinction, Promise and async/await, and the array higher-order methods, and you have covered the vocabulary most day-to-day work uses. Keep data-fetching, state, and rendering in separate functions and your code will keep working when the requirements shift.',
    nextTopic: 'react-fundamentals',
  },

  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    intro:
      'React\'s central idea is a small one: the UI is a pure function of state. Every button click, every network response, every URL change is a state update; the UI redraws itself from the new state. Once you internalise that model, most of a large frontend fits into your head.',
    whatIsIt:
      'A React component is a function that takes props and returns JSX. JSX is compiled to createElement calls; those calls build a virtual DOM tree; React reconciles the virtual tree against the actual DOM and applies the minimal set of mutations. State (useState) persists a value across renders of the same component instance. Effects (useEffect) synchronise the component with something outside React — a timer, a subscription, a DOM API, a network request. Data flows down through props; changes flow up through callback props.',
    whyImportant:
      'React powers the frontends of BookMyShow, Zomato, Ola, Meesho, Cred, and a very large share of every Series B startup in India. Its component model lets a team of twenty engineers work on one product without stepping on each other, because each component is a black box with a props API. Interviewers reward candidates who understand the reconciliation model, the rules of Hooks, and when useMemo actually helps.',
    simpleExplanation:
      'Think of a React app as a tree of small pure functions, each responsible for one piece of the screen. When something changes — a state variable, a piece of URL, a value pushed from the server — the affected function reruns and returns fresh JSX. React figures out the minimum set of real DOM edits needed to match, so you never write "find this node and change its text" by hand.',
    detailedExplanation:
      'Two rules keep Hooks predictable: only call them at the top level of a component (not inside loops or conditions), and only call them from React functions (components or other Hooks). useState returns a tuple — the current value and a setter that queues a re-render. useEffect(fn, deps) runs fn after commit; an empty deps array [] runs it once on mount; a filled array reruns it whenever any dep changes; omitting the array reruns it on every render (usually a mistake). useMemo caches an expensive derived value between renders when its inputs are unchanged; useCallback does the same for a function identity, which matters when you pass that function to a memoised child. The key prop on a list item helps React match items across renders — use a stable unique id, never the array index.',
    realWorldExample:
      'A BookMyShow seat-picker screen is a good exemplar. A parent SeatMap holds the selected-seat set in state. Each Seat is a small pure component that receives its status (available, taken, mine) and an onToggle callback via props. Tapping a seat calls the callback, which updates the parent set, which triggers a re-render — only the affected Seat components rerender because their props changed. Fetching the layout happens in useEffect keyed on the show id. When the user navigates away, the effect\'s cleanup cancels the request. That is the entire mental model in one screen.',
    formula:
      'Anatomy of a modern component:\n\n function Widget({ title, onSubmit }) {\n   const [text, setText] = useState("");\n   useEffect(() => {\n     document.title = title;\n     return () => { document.title = "App"; };\n   }, [title]);\n   return (\n     <form onSubmit={e => { e.preventDefault(); onSubmit(text); }}>\n       <input value={text} onChange={e => setText(e.target.value)} />\n     </form>\n   );\n }\n\nList rendering rule:\n {items.map(item => <Row key={item.id} data={item} />)}\n // Never use the array index as key.',
    codeExamples: [
      {
        title: 'A custom hook, memoised derived state, and clean fetch cancellation',
        language: 'jsx',
        code: `import { useState, useEffect, useMemo, useCallback } from 'react';

// ── Custom hook: cancellable data fetching ─────────────────────
function useResource(url) {
  const [state, setState] = useState({
    data: null, error: null, loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((err) => {
        if (err.name === 'AbortError') return;         // unmounted, ignore
        setState({ data: null, error: err.message, loading: false });
      });

    return () => controller.abort();                   // cleanup on unmount / url change
  }, [url]);

  return state;
}

// ── Component: filterable movie browser ───────────────────────
function MovieBrowser() {
  const [query,    setQuery]    = useState('');
  const [language, setLanguage] = useState('all');

  const { data: movies, loading, error } = useResource('/api/movies');

  const visible = useMemo(() => {
    if (!movies) return [];
    const q = query.trim().toLowerCase();
    return movies.filter((m) => {
      const okLang = language === 'all' || m.language === language;
      const okName = q === '' || m.title.toLowerCase().includes(q);
      return okLang && okName;
    });
  }, [movies, query, language]);

  const handleBook = useCallback((movie) => {
    // navigate to seat picker; parent will not re-render because the
    // identity of this callback is stable across renders.
    window.location.assign(\`/show/\${movie.id}\`);
  }, []);

  if (loading) return <div className="skeleton" aria-label="Loading movies…" />;
  if (error)   return <div role="alert">Could not load movies: {error}</div>;

  return (
    <section className="movies">
      <div className="filters">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles"
          aria-label="Search titles"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Language"
        >
          <option value="all">All languages</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="en">English</option>
        </select>
      </div>

      <p className="count">{visible.length} showing</p>

      <ul className="grid">
        {visible.map((m) => (
          <MovieCard key={m.id} movie={m} onBook={handleBook} />
        ))}
      </ul>
    </section>
  );
}

// ── Pure presentational component ─────────────────────────────
function MovieCard({ movie, onBook }) {
  return (
    <li className="card">
      <img src={movie.poster} alt={movie.title} loading="lazy" width="220" height="330" />
      <h3>{movie.title}</h3>
      <p className="cert">
        {movie.language.toUpperCase()} · {movie.certification}
      </p>
      <button onClick={() => onBook(movie)}>Book</button>
    </li>
  );
}

export default MovieBrowser;`,
        output: `Behaviour on the screen:
 • A search box and a language dropdown at the top.
 • "24 showing" updates as the user types.
 • Cards render lazily as they scroll into view.

Behaviour under the hood:
 • Initial mount → useResource fires, AbortController set up.
 • User types quickly → filtered list recomputes only when
   query, language, or the source list changes (useMemo).
 • User leaves the page mid-request → controller.abort() runs
   in the effect cleanup, and no setState-after-unmount warning.`,
        explanation:
          'The useResource hook is a good example of a well-scoped abstraction: it turns "load some JSON, honour cancellation" into a boring function you never look inside again. AbortController is the right tool for cancellation — it stops the network work, not just the state update. useMemo does not make anything faster on its own; it prevents an expensive recomputation whose inputs did not change, and useCallback gives you a stable function identity so a memoised child does not rerender for reference-inequality reasons.',
      },
    ],
    commonMistakes: [
      'Building one 800-line component. Split at the boundary where responsibility changes — a filter bar and a list are two components, not one.',
      'Using the array index as a key. The moment the list reorders or an item is inserted, keyed state (like a text input\'s value) attaches to the wrong row.',
      'Reading stale state inside an async callback. Either derive from a functional setter (setCount(c => c + 1)) or store the latest value in a ref.',
      'Omitting dependencies in useEffect. The linter warns for a reason; a missing dep means the effect never resyncs when the world it depends on changes.',
    ],
    bestPractices: [
      'Extract every reusable stateful pattern into a custom hook. useLocalStorage, useDebounced, useResource — they become the building blocks the rest of the codebase composes.',
      'Lift state up only to the lowest common ancestor. Any higher and unrelated components rerender for changes that do not concern them.',
      'Keep components pure. Same props in, same output — no writes to the outside world during render, only in effects.',
      'Reach for React DevTools\' Profiler before you reach for memo, useMemo, or useCallback. Optimise measured problems, not imagined ones.',
    ],
    exercises: [
      'Write a useLocalStorage(key, initial) hook that persists a value to localStorage and reads it back on mount. Handle JSON serialisation and window "storage" events.',
      'Build a paginated data table whose sort and page state are lifted into a custom useSortablePage hook.',
      'Implement optimistic UI for a "like" button: bump the count immediately, roll back on API failure, and show a toast.',
    ],
    quizQuestions: [
      {
        question:
          'When does useEffect(fn, []) — with an empty dependency array — run?',
        options: [
          'On every render.',
          'Once, after the first render.',
          'Only when state changes.',
          'Never.',
        ],
        answer: 1,
        explanation:
          'An empty dependency array tells React that the effect depends on nothing, so it runs exactly once after the initial mount (and its cleanup runs on unmount).',
      },
      {
        question:
          'What problem does the key prop solve in a React list?',
        options: [
          'It caches JSX between renders.',
          'It tells React which items are the same between renders.',
          'It prevents list items from ever rerendering.',
          'It associates CSS classes with list items.',
        ],
        answer: 1,
        explanation:
          'Keys are React\'s identity signal: "this item in the new render is the same as this item in the old render". Without stable keys, React reuses the wrong DOM node when items reorder and keyed state — like a focused input — attaches to the wrong row.',
      },
    ],
    interviewQuestions: [
      'Explain reconciliation. What does React actually do between one render and the next?',
      'Contrast controlled and uncontrolled form components. When is each appropriate?',
      'When would you reach for useRef instead of useState?',
    ],
    summary:
      'React models a UI as a pure function of state. Data flows down through props, changes flow up through callback props, and React reconciles the virtual DOM into the minimal set of real mutations. useState holds local state, useEffect synchronises with the outside world, useMemo and useCallback exist for measured performance problems. Extract shared logic into custom hooks, keep components pure, and use stable ids as list keys.',
    nextTopic: 'nodejs-backend',
  },

  {
    id: 'nodejs-backend',
    title: 'Node.js & REST APIs',
    intro:
      'Node.js is JavaScript running on the server, single-threaded but massively concurrent through non-blocking I/O. Express — small, opinion-free, still the default — turns Node into a comfortable HTTP framework in about fifteen lines. Together they are how a very large share of Indian fintech and consumer backends is built.',
    whatIsIt:
      'Node is a V8-based JavaScript runtime with an event-loop concurrency model borrowed from browsers. Every I/O call — a database query, a file read, a downstream HTTP request — is non-blocking; the main thread never waits, it just registers a callback and moves on. Express layers routing and middleware on top. A REST API represents domain concepts as resource URLs (/api/users, /api/users/:id) and uses HTTP verbs (GET, POST, PUT, PATCH, DELETE) to indicate intent. JSON is the wire format almost everywhere; Zod, Joi, or express-validator handles input validation; jsonwebtoken plus bcrypt handles a boring, secure authentication path.',
    whyImportant:
      'Node powers the API tier at Razorpay, Meesho, Zerodha Kite, PhonePe merchants, and many more. Understanding the event loop is not optional; understanding middleware ordering is not optional; understanding why you store passwords with bcrypt and never with SHA-256 is not optional. Every backend interview at these companies opens on REST API design, JWT authentication, and a live debugging question about a request pipeline that has gone wrong.',
    simpleExplanation:
      'Node is like a single very fast chef running a busy kitchen: they never stop to wait for a pot to boil, they just set a timer and move to the next dish. Express is the menu that tells them which recipe to run for each incoming order. A REST API is a shared vocabulary — the client says "GET /orders/42" and every backend engineer knows exactly what that means, no meeting required.',
    detailedExplanation:
      'Middleware are (req, res, next) functions arranged in a pipeline. Each one may inspect the request, mutate it, respond, or hand off to the next. Order matters: logging first, body parsing next, then authentication, then business logic, then error handling at the tail with an (err, req, res, next) signature. JWT authentication is stateless: the server signs a token containing (typically) the user id and an expiry; the client sends it in the Authorization header on every request; middleware verifies and attaches the decoded claims to req.user. Passwords are stored as bcrypt hashes with a per-user salt — cost 12 today is roughly 300 ms, which slows brute-force attempts without irritating the login flow. All input crosses a validator before it touches the database; every downstream call is wrapped in a try/catch that surfaces a proper status code, never a stack trace.',
    realWorldExample:
      'A payments gateway like Razorpay speaks REST fluently. POST /v1/orders creates an order (returns 201 with the created object). POST /v1/payments/:id/capture captures an authorised payment (200 with the updated resource). GET /v1/payments?count=25 pages through history. Every request carries an Authorization header with the merchant\'s API key. On the server, middleware runs in order: request-id assignment, structured logging, rate limiting, key validation, JSON parsing, per-endpoint schema validation, the actual handler, and a global error handler that maps thrown errors to consistent JSON error bodies. The whole flow is a handful of Express middleware factories composed at boot.',
    formula:
      'REST resource conventions:\n GET    /api/orders          → list\n POST   /api/orders          → create\n GET    /api/orders/:id      → read one\n PUT    /api/orders/:id      → replace\n PATCH  /api/orders/:id      → partial update\n DELETE /api/orders/:id      → delete\n\nHTTP status codes worth memorising:\n 200 OK · 201 Created · 202 Accepted · 204 No Content\n 400 Bad Request · 401 Unauthorized · 403 Forbidden\n 404 Not Found · 409 Conflict · 422 Unprocessable · 429 Too Many Requests\n 500 Internal Server Error · 502 Bad Gateway · 503 Service Unavailable',
    codeExamples: [
      {
        title: 'A production-shaped Express API with JWT auth, validation, and clean error handling',
        language: 'javascript',
        code: `import express      from 'express';
import jwt          from 'jsonwebtoken';
import bcrypt       from 'bcrypt';
import { z }        from 'zod';
import { randomUUID } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');

const app = express();
app.use(express.json({ limit: '100kb' }));

// ── Structured request logging (very short version) ────────────
app.use((req, _res, next) => {
  req.id = randomUUID();
  const started = process.hrtime.bigint();
  next();
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  console.info(JSON.stringify({ id: req.id, m: req.method, u: req.url, ms }));
});

// ── Auth middleware: verify Bearer token, attach claims ────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// ── Body-validation middleware factory ─────────────────────────
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: 'validation_failed',
      details: result.error.issues.map(i => ({ path: i.path, msg: i.message })),
    });
  }
  req.body = result.data;   // coerced + trimmed data
  next();
};

// ── In-memory stores (swap for MongoDB / Postgres later) ───────
const users = new Map();    // email → user
const posts = new Map();    // id    → post

// ── Auth: registration ─────────────────────────────────────────
const RegisterBody = z.object({
  email:    z.string().email(),
  password: z.string().min(10),
  name:     z.string().trim().min(2).max(80),
});

app.post('/api/auth/register', validate(RegisterBody), async (req, res) => {
  const { email, password, name } = req.body;
  if (users.has(email)) {
    return res.status(409).json({ error: 'email_in_use' });
  }
  const passwordHash = await bcrypt.hash(password, 12); // ~300ms
  const user = { id: randomUUID(), email, name, passwordHash };
  users.set(email, user);
  const token = jwt.sign(
    { id: user.id, email, name },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.status(201).json({
    token,
    user: { id: user.id, email, name },
  });
});

// ── Auth: login ────────────────────────────────────────────────
const LoginBody = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

app.post('/api/auth/login', validate(LoginBody), async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  const ok = user && await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const token = jwt.sign(
    { id: user.id, email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.json({ token, user: { id: user.id, email, name: user.name } });
});

// ── Posts: protected CRUD ──────────────────────────────────────
const CreatePost = z.object({
  title:   z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(4000),
});

app.get('/api/posts', requireAuth, (req, res) => {
  const mine = [...posts.values()].filter(p => p.authorId === req.user.id);
  res.json(mine);
});

app.post('/api/posts', requireAuth, validate(CreatePost), (req, res) => {
  const post = {
    id:         randomUUID(),
    title:      req.body.title,
    content:    req.body.content,
    authorId:   req.user.id,
    authorName: req.user.name,
    createdAt:  new Date().toISOString(),
  };
  posts.set(post.id, post);
  res.status(201).json(post);
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post)                       return res.status(404).json({ error: 'not_found' });
  if (post.authorId !== req.user.id)
                                   return res.status(403).json({ error: 'not_owner' });
  posts.delete(req.params.id);
  res.status(204).end();
});

// ── Global error handler — must have 4 params ──────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(JSON.stringify({ id: req.id, err: err.message, stack: err.stack }));
  res.status(500).json({ error: 'internal_error' });
});

app.listen(3000, () => console.info('API up on http://localhost:3000'));`,
        output: `POST /api/auth/register  { email, password, name }
  → 201 { token, user }

POST /api/auth/login     { email, password }
  → 200 { token, user }
  → 401 { error: "invalid_credentials" }  (wrong password, same shape)

POST /api/posts          (Bearer token)  { title, content }
  → 201 { id, title, content, authorId, createdAt }
  → 422 { error: "validation_failed", details: [ … ] }

DELETE /api/posts/:id    (Bearer token belonging to a different user)
  → 403 { error: "not_owner" }

GET /api/posts           (no token)
  → 401 { error: "missing_token" }`,
        explanation:
          'A handful of small habits are load-bearing here. The JWT secret is loaded from the environment and the process refuses to start without it — no accidental "changeme-in-prod" ever ships. Zod schemas parse and coerce the body in one step; the moment validation fails, a 422 is returned with a shape a client can render into field-level errors. bcrypt.compare runs in constant time to defeat timing attacks that would otherwise let an attacker figure out which emails are registered. The 403 vs 404 split is deliberate: 404 means "does not exist", 403 means "exists but not yours" — never leak the difference to an attacker probing.',
      },
    ],
    commonMistakes: [
      'Committing JWT secrets, database URIs, or API keys to source control. Environment variables exist for a reason; there are pre-commit hooks and secret scanners for a reason.',
      'Concatenating user input into a database query. Every ORM has parameterised queries; every raw SQL client does too. Use them.',
      'Returning 200 with a JSON body that says "success": false. Use the status code the protocol already gave you; middleware and clients rely on it.',
      'Forgetting to await inside a route handler, so an async error bypasses try/catch and vanishes into an unhandledRejection.',
    ],
    bestPractices: [
      'One resource per route file. routes/orders.js, routes/users.js, routes/index.js mounts them. It scales to a codebase you can still reason about at fifty routes.',
      'Every secret lives in process.env, loaded once at boot, validated with Zod. Fail fast if a required variable is missing.',
      'Return one error shape everywhere: { error: string, details?: object }. Clients build one error toast, not ten.',
      'Log request id, method, URL, status, and duration for every request in JSON. Grepping through pretty-printed strings does not scale to production.',
    ],
    exercises: [
      'Add pagination to GET /api/posts using ?page=1&per_page=20 and return total count plus a "next" link header.',
      'Write a rateLimit(max, windowMs) middleware backed by an in-memory Map and confirm it returns 429 when exceeded.',
      'Split the JWT flow into short-lived access tokens (15 min) and long-lived refresh tokens (30 days) stored in httpOnly cookies. Implement POST /api/auth/refresh.',
    ],
    quizQuestions: [
      {
        question: 'Which status code fits "the resource was created"?',
        options: ['200 OK', '201 Created', '202 Accepted', '204 No Content'],
        answer: 1,
        explanation:
          '201 Created is the precise semantic — the response body carries the new resource and a Location header may point to its URL. 200 is for successful reads; 202 for async work accepted but not done; 204 for a successful mutation with no body.',
      },
      {
        question: 'Where should JWTs be stored on the client?',
        options: [
          'localStorage, easy to reach from JavaScript.',
          'sessionStorage, cleared when the tab closes.',
          'httpOnly cookies, unreadable to JavaScript.',
          'URL query parameters, convenient to forward.',
        ],
        answer: 2,
        explanation:
          'httpOnly cookies cannot be read by page-level JavaScript, which contains the blast radius of an XSS incident. localStorage is trivially exfiltrated by an injected script. URLs are logged everywhere — server logs, browser history, analytics.',
      },
    ],
    interviewQuestions: [
      'Explain how Express middleware executes and what happens when a middleware forgets to call next() or send a response.',
      'What is the difference between authentication and authorisation? Design an endpoint that requires both.',
      'How would you design a rate limiter for a public API that must handle a hundred thousand keys?',
    ],
    summary:
      'Node.js is non-blocking JavaScript on the server. Express turns it into an ergonomic HTTP framework in which middleware, order and all, does most of the work. Design REST APIs around resource URLs and HTTP verbs, validate every input at the boundary, store passwords with bcrypt, sign JWTs with an env-loaded secret, and return consistent error shapes so clients can be written once.',
    nextTopic: undefined,
  },
]
