import type { TopicLesson } from '../_shared/types'

export const cadCamLessons: TopicLesson[] = [
  {
    id: 'parametric-cad-modeling',
    title: 'Parametric CAD Modeling',
    intro: 'Parametric CAD builds a 3D model from dimensions, constraints, features, and design intent so changes update predictably.',
    whatIsIt: 'Parametric CAD uses sketches, dimensions, geometric constraints, datum planes, and feature history. A bracket is not just a shape: it is a base plate thickness, hole pattern, web height, fillet radius, and material assignment connected by rules.',
    whyImportant: 'Engineering products change constantly. A correct CAD model lets teams resize parts, update drawings, calculate mass properties, and pass accurate geometry to CAM, FEA, and manufacturing without remodeling from scratch.',
    simpleExplanation: 'Think of parametric CAD as a spreadsheet behind a 3D model. Change the plate thickness from 10 mm to 12 mm and every dependent feature updates if the model was constrained correctly.',
    detailedExplanation: 'A robust CAD model starts with datums, then stable sketches, then features such as extrude, revolve, cut, pattern, mirror, shell, chamfer, and fillet. Good models avoid referencing temporary edges when a datum or master sketch is more stable. Engineering drawings add tolerances, surface finish, material, heat treatment, and inspection requirements. CAD geometry is only useful when it carries design intent.',
    realWorldExample: 'A motor mounting bracket may have a rectangular base, four bolt holes on a bolt circle, a vertical rib, and fillets at stress concentrations. If the motor frame changes, the bolt-circle diameter and rib height can update from parameters while the drawing and mass estimate remain consistent.',
    formula: 'Mass = volume x density\nCylinder hole volume = pi x (d/2)^2 x thickness\nBolt circle coordinate:\nx = R cos(theta)\ny = R sin(theta)',
    codeExamples: [
      {
        title: 'Worked Example — Bracket Mass Properties + Bolt-Circle Coordinates',
        language: 'CAD design table',
        kind: 'worked-example',
        code: `PARAMETRIC BRACKET  (aluminium, ρ = 2.70 g/cm³ = 2.70 × 10⁻⁶ kg/mm³)
────────────────────────────────────────────────────────────────────
Feature          Symbol         Value
Base plate       L × W × t      120 × 80 × 12 mm
Vertical web     l × t × h      90 × 10 × 45 mm
Through-hole     Ø × n          10 mm × 4  (on Ø 90 bolt circle)

VOLUME BUDGET
    V_base     = 120 · 80 · 12                    = 115 200 mm³
    V_web      = 90  · 10 · 45                    =  40 500 mm³
    V_gross    = V_base + V_web                   = 155 700 mm³
    V_hole     = π/4 · (10)² · 12                 ≈    942.5 mm³ (per hole)
    V_holes    = 4 · V_hole                       ≈   3770  mm³
    V_net      = V_gross − V_holes                = 151 930 mm³

ESTIMATED MASS
    m = ρ · V_net = 2.70e-6 · 151 930 ≈ 0.410 kg

BOLT-CIRCLE COORDINATES  (R = 45 mm, first hole at 45°, 4 holes)
┌────────────┬──────────────┬──────────────┐
│  Hole      │   X (mm)     │   Y (mm)     │
├────────────┼──────────────┼──────────────┤
│  45°       │   +31.82     │   +31.82     │
│ 135°       │   −31.82     │   +31.82     │
│ 225°       │   −31.82     │   −31.82     │
│ 315°       │   +31.82     │   −31.82     │
└────────────┴──────────────┴──────────────┘
    X = R cos θ,   Y = R sin θ

DESIGN-INTENT DIMENSIONS  (parametric — drive the whole model)
    plate_thickness  = 12 mm
    web_height       = 45 mm
    bolt_circle_R    = 45 mm
    hole_D           = 10 mm
    material         = "AL 6061-T6"    ρ = 2.70 g/cm³`,
        output: `V_gross = 155 700 mm³
V_net   = 151 930 mm³  (holes subtract 3 770 mm³)
Mass    ≈ 0.410 kg  (aluminium)
4 bolt-circle hole centers at (±31.82, ±31.82)`,
        explanation: 'A well-modeled part exposes a small set of named parameters (plate_thickness, bolt_circle_R, hole_D) that drive every downstream feature — drawings, mass estimate, CAM roughing extents. Changing "bolt_circle_R" from 45 to 60 mm should re-derive all four coordinates automatically; changing plate_thickness should re-flow the hole-through depth. This is the payoff for using stable datums and named dimensions.',
      },
    ],
    commonMistakes: [
      'Fully defining shape but not design intent: dimensions update, but the model breaks after a small change.',
      'Using decorative fillets before functional features; early fillets often make later edits unstable.',
      'Forgetting units when exporting to CAM or FEA; mm vs inch mistakes can scrap parts.',
    ],
    bestPractices: [
      'Start from stable datums and master sketches.',
      'Name key dimensions such as plate_thickness, bolt_circle_radius, and rib_height.',
      'Create drawings only after checking material, mass, tolerances, and hole callouts.',
    ],
    exercises: [
      'Increase base thickness from 12 mm to 16 mm and recalculate mass.',
      'Change the bolt circle radius to 60 mm and list the new hole coordinates.',
      'Explain why a bolt-hole pattern should reference the part origin or datum axes, not random projected edges.',
    ],
    quizQuestions: [
      {
        question: 'Which CAD practice best preserves design intent?',
        options: ['Leaving sketches under-defined', 'Referencing stable datums and named parameters', 'Adding all fillets first', 'Exporting STL before drawings'],
        answer: 1,
        explanation: 'Stable datums and named parameters make future edits predictable and reduce broken feature history.',
      },
    ],
    interviewQuestions: [
      'How do you model a part so it can be resized without breaking?',
      'What information must a manufacturing drawing include beyond the 3D model?',
    ],
    summary: 'Parametric CAD is engineering geometry plus design intent. Correct models use stable references, named dimensions, and material properties so downstream drawings, analysis, and CAM remain reliable.',
    nextTopic: 'cam-process-planning',
  },
  {
    id: 'cam-process-planning',
    title: 'CAM Process Planning',
    intro: 'CAM converts CAD geometry into machining operations, cutting parameters, toolpaths, and machine-readable NC code.',
    whatIsIt: 'Computer-Aided Manufacturing plans how a CNC machine cuts a part: stock setup, work coordinate system, tool selection, spindle speed, feed rate, depth of cut, step-over, entry moves, retracts, and post-processed G-code.',
    whyImportant: 'A correct CAD model can still produce a bad part if CAM is wrong. Incorrect feeds, speeds, clearances, or work offsets can break tools, gouge fixtures, overheat material, or miss tolerance.',
    simpleExplanation: 'CAD says what the part should be. CAM decides how the cutter moves to make it safely and efficiently.',
    detailedExplanation: 'CAM planning starts with material, machine rigidity, tool geometry, and tolerance. Cutting speed sets spindle RPM. Chip load sets feed rate. Step-over and depth of cut control load. Roughing removes stock quickly; finishing leaves accurate surfaces. The postprocessor converts toolpaths into G-code for a specific controller such as Fanuc, Haas, Siemens, or Mach3.',
    realWorldExample: 'For an aluminium pocket, a 16 mm four-flute carbide end mill may rough at 180 m/min cutting speed and 0.06 mm/tooth chip load. A CAM setup calculates spindle RPM, feed rate, number of step-over passes, cycle time, and a safe G-code starting block.',
    formula: 'Spindle speed: N = 1000 Vc / (pi D)\nFeed rate: F = N x z x fz\nPocket passes = ceil(width / step_over)\nCycle time = total_toolpath_length / feed_rate',
    codeExamples: [
      {
        title: 'Worked Example — Feed/Speed + Pocket Cycle Time + Starter G-Code',
        language: 'CAM + G-code',
        kind: 'worked-example',
        code: `POCKET ROUGHING — Aluminium block, 4-flute carbide end mill
────────────────────────────────────────────────────────────
Cutting speed  Vc = 180 m/min   (Al with carbide, aggressive)
Tool           D  = 16 mm,  z = 4 flutes
Chip load      fz = 0.06 mm/tooth
Pocket         L × W = 220 × 40 mm
Step-over      ae = 6 mm

STEP 1 — Spindle speed
    N = 1000 · Vc / (π · D)
      = 1000 · 180 / (π · 16)
      = 3581 rpm

STEP 2 — Feed rate
    F = N · z · fz
      = 3581 · 4 · 0.06
      ≈ 859 mm/min

STEP 3 — Number of roughing passes (X-stepovers)
    passes = ceil(W / ae) = ceil(40 / 6) = 7

STEP 4 — Total toolpath length & cycle time
    L_path = passes · L = 7 · 220 = 1540 mm
    t_cut  = L_path / F = 1540 / 859 ≈ 1.79 min

STARTER G-CODE  (Fanuc-style, absolute, Ø 16 mm end mill in T01)
    %
    O1001  (POCKET ROUGH — 220x40x?)
    G90 G54 G17 G21           ; abs, WCS 1, XY plane, mm
    G28 G91 Z0                 ; home Z
    G90 G00 X-8. Y-8.          ; rapid to pocket start-corner + step-in
    T01 M06                    ; load 16 mm 4-flute carbide
    S3581 M03                  ; spindle 3581 rpm CW
    G43 H01 Z25.               ; tool length offset
    G00 Z2.                    ; rapid to clearance
    G01 Z-2. F300.             ; plunge (slow)
    (— roughing raster loop —)
    G01 X212. F859.
    G01 Y-2.
    G01 X-8.
    G01 Y4.
    G01 X212.
    ...
    G00 Z25.
    M05                        ; spindle stop
    M30                        ; end program
    %`,
        output: `N ≈ 3581 rpm   F ≈ 859 mm/min
Roughing passes  = 7
Toolpath length  = 1540 mm
Cutting time     ≈ 1.79 min (does not include rapids or plunges)`,
        explanation: 'Feed and speed come from three inputs the operator can trust: manufacturer\'s Vc, cutter geometry, and per-tooth chip load. The pocket cycle time above is optimistic — it excludes rapids, tool-length probing, spindle warm-up, and any finishing pass. Rule of thumb: multiply pure cutting time by 1.3–1.5 to get real cycle time. Also always verify Z clearance, work offset, and start-corner in the CAM simulation before posting.',
      },
    ],
    commonMistakes: [
      'Using feed per tooth as feed per revolution or feed per minute.',
      'Forgetting that the postprocessor must match the CNC controller.',
      'Leaving no finishing allowance after roughing.',
    ],
    bestPractices: [
      'Verify work offset, tool length offset, safe Z, and stock dimensions before running code.',
      'Simulate toolpaths for collisions and gouges before posting G-code.',
      'Use conservative first-run feeds, then optimize after checking chips, sound, tool wear, and surface finish.',
    ],
    exercises: [
      'Recalculate RPM and feed for a 10 mm end mill at the same cutting speed and chip load.',
      'If stepover is reduced to 4 mm, how many roughing passes and how much cutting time are required?',
      'Explain why finishing passes usually use smaller step-over and lighter depth of cut than roughing passes.',
    ],
    quizQuestions: [
      {
        question: 'Feed rate in milling is calculated from:',
        options: ['RPM, flute count, and chip load', 'Only tool diameter', 'Only material density', 'Coolant pressure and tool length'],
        answer: 0,
        explanation: 'Milling feed rate is F = N x z x fz, where N is RPM, z is flute count, and fz is chip load per tooth.',
      },
    ],
    interviewQuestions: [
      'How do you choose feeds and speeds for a new material and cutter?',
      'What checks do you perform before running posted G-code on a CNC machine?',
    ],
    summary: 'CAM turns CAD geometry into controlled cutter motion. Correct RPM, feed, step-over, work offsets, simulation, and controller-specific G-code are what make the part safe to machine.',
    nextTopic: undefined,
  },
]
