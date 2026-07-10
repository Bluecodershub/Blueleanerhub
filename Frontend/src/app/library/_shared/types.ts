// ─── Shared types for all library lesson pages ───────────────────────────────

// `kind` lets non-CS domains render domain-native examples (worked engineering
// calculations, SPICE nets, spreadsheet-style analysis) instead of a code block.
// Existing CS content omits `kind` and continues to render as code.
export type ExampleKind =
  | 'code'
  | 'calculation'      // Step-by-step math / formula work (civil, mech, elec, mgmt)
  | 'worked-example'   // Narrative worked problem (multi-step engineering solution)
  | 'diagram'          // ASCII / text diagram (P-V, phasor, free-body, network)
  | 'spreadsheet'      // Tabular / column-aligned analysis (finance, ratios)
  | 'spice'            // SPICE netlist / circuit description
  | 'gcode'            // G-code / M-code for CAM

export interface CodeExample {
  title: string
  language: string          // For code: 'python' | 'sql' | 'c' | ...  For non-code: descriptive tag e.g. 'SI-units', 'IS-456', 'SPICE'.
  code: string              // Body content (code, calculation steps, netlist, or diagram).
  output?: string
  explanation: string
  kind?: ExampleKind        // Default 'code' if omitted, so existing CS lessons need no change.
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number          // index into options
  explanation: string
}

export interface TopicLesson {
  id: string
  title: string
  intro: string
  whatIsIt: string
  whyImportant: string
  simpleExplanation: string
  detailedExplanation: string
  realWorldExample: string
  technicalDetails?: string
  formula?: string
  syntaxBlock?: string
  codeExamples: CodeExample[]
  commonMistakes?: string[]
  bestPractices?: string[]
  exercises: string[]
  quizQuestions: QuizQuestion[]
  interviewQuestions: string[]
  summary: string
  nextTopic?: string
}

export interface LessonTopic {
  id: string
  name: string
  description: string
  icon?: string
  lessons: TopicLesson[]
}
