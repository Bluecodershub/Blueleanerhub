import type { TopicLesson } from '../_shared/types'

export const manufacturingLessons: TopicLesson[] = [
  {
    id: 'casting-processes',
    title: 'Casting Processes',
    intro: 'Casting is the oldest manufacturing process — molten metal is poured into a shaped cavity and solidifies into the desired form, enabling complex shapes impossible to machine.',
    whatIsIt: 'Casting pours molten metal into a mould, which solidifies into the final shape. Types: Sand casting (expendable mould, most common), Die casting (permanent metal mould, high pressure, for Al/Zn), Investment casting (lost-wax, high precision), Centrifugal casting (rotating mould for pipes). Key parameters: pouring temperature, solidification rate, shrinkage allowance, draft angle, parting line, riser design. Defects: porosity, shrinkage cavities, cold shuts, misruns, hot tears.',
    whyImportant: 'Casting produces ~90% of all metal components — engine blocks, pump housings, turbine blades, manhole covers. It is the most economical process for complex shapes with internal cavities. Foundry engineers must control solidification to prevent defects that cause field failures. Casting knowledge is essential for GATE ME and manufacturing engineering roles.',
    simpleExplanation: 'Casting is like making ice cubes — you pour liquid into a mould and wait for it to solidify. The difference is that metal shrinks as it cools, so the mould must be slightly larger (shrinkage allowance). Risers are extra reservoirs of liquid metal that feed the part as it shrinks, preventing cavities. Getting the solidification sequence right determines whether the casting has defects.',
    detailedExplanation: 'Chvorinov\'s Rule: solidification time t = C × (V/A)² — larger volume-to-surface-area ratios solidify slower. This governs riser design: the riser must solidify after the casting. Directional solidification: solidification should proceed from thin sections (cool first) to thick sections toward the riser. Draft angles (1–3°) allow pattern removal from sand without damaging the mould cavity. Shrinkage allowance: cast iron contracts ~1%, steel ~2%, aluminium ~1.5% — patterns are made oversized. Machining allowance: extra material added for machined surfaces.',
    realWorldExample: 'Automobile engine blocks (grey cast iron, ASTM A48) are sand cast: a pattern (wood or resin) creates the mould cavity. Cores (sand + binder) create internal water jacket passages. The mould has 4+ risers to feed solidification of thick sections. X-ray inspection checks for internal porosity. A defective casting is detected at this stage rather than after machining (expensive rework). Modern engine blocks achieve dimensional accuracy of ±0.5mm.',
    formula: 'Chvorinov\'s Rule:\nt_solidification = C × (V/SA)²\n\nwhere V = casting volume, SA = surface area\nC = mould constant (depends on mould material, metal)\n\nShrinkage allowance:\nPattern dimension = Part dimension × (1 + shrinkage_fraction)\n  Cast iron:   +1.0%\n  Steel:       +2.0%\n  Aluminium:   +1.5%\n\nPouring time:\nt_pour = W / (C_sprue × ρ × A_sprue × √(2gH))\nW = weight of metal, H = effective head of metal',
    codeExamples: [
      {
        title: 'Worked Example — Riser Sizing by Chvorinov\'s Rule (Plate Casting)',
        language: 'foundry design',
        kind: 'worked-example',
        code: `CASTING GEOMETRY
────────────────
Plate: 200 mm × 100 mm × 20 mm  =  20 cm × 10 cm × 2 cm

    V_casting  = 20 · 10 · 2                      = 400 cm³
    SA_casting = 2·(20·10 + 20·2 + 10·2)          = 520 cm²
    Modulus  M_c = V/SA = 400 / 520               = 0.769 cm

Rule of thumb:   M_riser ≥ 1.20 · M_casting

TRY:  Blind cylindrical top riser,  D = H = 8 cm
    V_r  = π/4·D²·H = π/4·(8)²·8               = 402.1 cm³
    SA_r = 2·(π/4·D²)  + π·D·H  =  50.27 + 201.06 = 251.3 cm²
        (top open? NO — blind riser, both ends counted)
    M_r  = V_r / SA_r = 402.1 / 251.3          = 1.60 cm

Actually for a blind top riser only the cylindrical surface + one end
loses heat (the bottom mates with the casting), so:
    SA_r' = π/4·D² + π·D·H = 25.13 + 201.06     = 226.2 cm²
    M_r'  = 402.1 / 226.2                       = 1.78 cm

Check margin:  M_r' / M_c = 1.78 / 0.769 = 2.31  ⇒  231 % of casting modulus.

RISER SIZE STUDY  (Chvorinov's t ∝ M²)
┌────────────┬───────────┬───────────────────────┬────────────┐
│ D = H (cm) │ Modulus M │  t_riser / t_casting  │ Adequate?  │
├────────────┼───────────┼───────────────────────┼────────────┤
│      4     │   0.667   │    0.75               │    No      │
│      6     │   1.000   │    1.69               │    Yes     │
│      7     │   1.167   │    2.30               │    Yes     │
│      8     │   1.333   │    3.01               │    Yes  ★  │
│     10     │   1.667   │    4.69               │    Yes     │
└────────────┴───────────┴───────────────────────┴────────────┘

PATTERN ALLOWANCES  (for a steel casting)
    Shrinkage:  2 % on all dimensions
    Machining:  +3 mm on machined faces

    Nominal 100 mm  →  pattern = 100 · 1.02 + 3   = 105.0 mm
    Nominal 250 mm  →  pattern = 250 · 1.02 + 3   = 258.0 mm
    Nominal 500 mm  →  pattern = 500 · 1.02 + 3   = 513.0 mm`,
        output: `Casting modulus M_c = 0.769 cm
Chosen riser  8 × 8 cm  →  M_r ≈ 1.33 cm  ( > 1.2 · M_c )
Solidifies 3.0× slower than the casting  ⇒  feeds shrinkage successfully.

Steel-casting pattern for a 500 mm feature = 513 mm (2 % shrink + 3 mm stock).`,
        explanation: 'Chvorinov\'s rule (t ∝ M², where M = V/SA) says the last thing to freeze is the piece with the biggest modulus. Risers must beat the casting on modulus by a comfortable margin (20 % is a foundry rule of thumb; 3× on time here is safe). A D=4 cm riser would freeze BEFORE the casting and cut off feed — the plate would develop shrinkage porosity. Pattern allowances stack multiplicatively (shrinkage) and additively (machining stock).',
      },
    ],
    commonMistakes: [
      'Placing the riser at the wrong location — risers must be on thick sections that solidify last, not thin sections.',
      'Ignoring directional solidification — freezing must progress from thin to thick toward the riser, not randomly.',
      'Omitting draft angles on patterns — prevents removal of pattern from packed sand, damaging the mould cavity.',
    ],
    bestPractices: [
      'Apply Chvorinov\'s Rule to verify riser adequacy — riser modulus must exceed casting modulus by at least 20%.',
      'Use feeding rules: one riser cannot feed more than a certain radius (Caine\'s method for riser count).',
      'For critical castings, use simulation software (MAGMASOFT, PROCAST) to predict shrinkage defects before tooling.',
    ],
    exercises: [
      'A cylindrical casting (D=150mm, H=300mm) is made in grey cast iron. Design a top riser (open cylinder) such that its modulus is 1.2× the casting modulus.',
      'Calculate the pattern dimensions for a 400mm × 200mm × 50mm aluminium casting with 3mm machining allowance.',
      'Compare the solidification time of a sphere (R=5cm) vs a cube (side=10cm) of equal volume using Chvorinov\'s Rule.',
    ],
    quizQuestions: [
      {
        question: 'According to Chvorinov\'s Rule, which shape solidifies fastest?',
        options: [
          'A sphere with V/SA = 3.0 cm',
          'A cylinder with V/SA = 2.5 cm',
          'A plate with V/SA = 0.8 cm',
          'A cube with V/SA = 1.5 cm',
        ],
        answer: 2,
        explanation: 'Chvorinov\'s Rule: t ∝ (V/SA)². Lower V/SA ratio = faster cooling = shorter solidification time. The plate with V/SA = 0.8 has the smallest ratio — it has the most surface area relative to volume and loses heat fastest.',
      },
      {
        question: 'The purpose of a riser in casting is to:',
        options: [
          'Allow gases to escape during pouring',
          'Feed liquid metal to compensate for solidification shrinkage',
          'Control pouring temperature',
          'Create internal cavities in the casting',
        ],
        answer: 1,
        explanation: 'Metals shrink 1–2% by volume as they solidify. Without a riser, this volume contraction creates internal voids (shrinkage porosity). The riser provides a reservoir of liquid metal that feeds the casting as it contracts. The riser must solidify last (higher V/SA than the casting).',
      },
    ],
    interviewQuestions: [
      'What is Chvorinov\'s Rule and how is it used in riser design?',
      'Explain the different types of casting defects and their causes.',
      'Compare sand casting and die casting — when would you choose each?',
    ],
    summary: 'Casting solidifies molten metal in shaped moulds to produce near-net-shape components. Chvorinov\'s Rule governs solidification time — riser modulus must exceed casting modulus to prevent shrinkage porosity. Pattern dimensions include shrinkage allowance (1–2% by material) and machining allowance. Draft angles enable pattern removal. Directional solidification from thin sections toward the riser produces sound castings.',
    nextTopic: 'machining-processes',
  },

  {
    id: 'machining-processes',
    title: 'Machining & Metal Cutting',
    intro: 'Machining removes material to achieve precise dimensions and surface finish — understanding cutting mechanics, tool geometry, and process parameters is fundamental to manufacturing engineering.',
    whatIsIt: 'Metal cutting removes material through shear deformation using a harder tool. Primary processes: turning (lathe, rotates workpiece), milling (rotary cutter, workpiece feeds), drilling (axial holes), grinding (abrasive wheel). Key parameters: cutting speed (V, m/min), feed (f, mm/rev), depth of cut (d, mm). Material Removal Rate MRR = V × f × d. Tool life governed by Taylor\'s equation: VT^n = C. Surface finish Ra improves with lower feed and larger tool nose radius.',
    whyImportant: 'Every precision component — shafts, gears, engine parts, surgical implants — is machined. Selecting wrong cutting parameters causes premature tool failure (cost), poor surface finish (quality rejection), or workpiece damage (scrap). Taylor\'s tool life equation and MRR calculations are standard GATE ME topics. Machinability data enables process planning and cost estimation.',
    simpleExplanation: 'Machining is like sharpening a pencil — you use a harder material (the cutter) to scrape away the softer material (the workpiece). Too fast or too deep and the cutter wears out or breaks. Too slow and the job takes forever. Taylor\'s equation is the tool life formula that finds the sweet spot — the cutting speed that balances productivity and tool cost.',
    detailedExplanation: 'Orthogonal cutting (2D model): chip forms when compressive stress exceeds shear yield strength along the shear plane. Chip thickness ratio r = t₁/t₂ (uncut / chip thickness). Shear plane angle φ = arctan(r·cosα/(1-r·sinα)), where α is rake angle. Merchant\'s minimum energy criterion: 2φ + β - α = π/2 (β = friction angle). Specific cutting energy u = Fc/(MRR). Tool failure modes: flank wear (abrasion, measured VB), crater wear (diffusion, on rake face), built-up edge (BUE, at low speeds in ductile materials). Taylor\'s extended equation: VT^n × f^a × d^b = C (considers feed and depth effects).',
    realWorldExample: 'CNC turning of an automotive crankshaft (forged steel, 42CrMo4): carbide inserts with V = 250 m/min, f = 0.3 mm/rev, d = 3mm. MRR = 250,000 x 0.3 x 3 = 225,000 mm3/min. Taylor\'s n = 0.25 for carbide-steel. If V_ref = 300 m/min gives T_ref = 20 min, then at V = 250 m/min: T = 20 x (300/250)^(1/0.25) = 41.5 min. Each insert can machine multiple crankshafts before replacement, while a damaged crankshaft can cost thousands in scrap.',
    formula: 'Material Removal Rate:\nMRR = V x f x d   (mm3/min or cm3/min)\nV in mm/min, f in mm/rev, d in mm\n\nTaylor Tool Life Equation:\nV x T^n = C\nT = (C/V)^(1/n)\n\nMinimum-cost tool life:\nT_opt = (C_t/C_m + t_c) x (1/n - 1)\nV_opt = C / T_opt^n\n\nShear plane angle (Merchant):\nphi = 45 deg + alpha/2 - beta/2\nalpha = rake angle, beta = friction angle = arctan(mu)',
    codeExamples: [
      {
        title: 'Worked Example — Taylor Tool Life, Cost-Optimum Speed, and Turning Cycle Time',
        language: 'metal cutting',
        kind: 'worked-example',
        code: `TAYLOR'S TOOL LIFE       VT^n = C     ⇒     T = (C/V)^(1/n)

┌───────────────┬─────────┬───────┬────────────────────────────────┐
│ Tool material │   C     │   n   │  Comment                       │
├───────────────┼─────────┼───────┼────────────────────────────────┤
│ HSS           │   80    │ 0.125 │ economical, low-speed          │
│ Carbide (P20) │  300    │ 0.25  │ typical steel finishing/roughing│
│ Ceramic       │  600    │ 0.40  │ high V, low interruption       │
└───────────────┴─────────┴───────┴────────────────────────────────┘

TOOL LIFE vs CUTTING SPEED  (mild steel workpiece)
┌────────────┬──────────┬──────────────┬──────────┐
│ V (m/min)  │  HSS     │ Carbide      │ Ceramic  │
├────────────┼──────────┼──────────────┼──────────┤
│      50    │  42.9 m  │   1 296 m    │  498.8 m │
│      80    │   1.0 m  │     197.8 m  │  154.0 m │
│     100    │  <1 min  │      81.0 m  │   88.2 m │
│     150    │  ✗       │      16.0 m  │   32.0 m │
│     200    │  ✗       │       5.1 m  │   15.6 m │
│     250    │  ✗       │       2.1 m  │    8.9 m │
│     300    │  ✗       │       1.0 m  │    5.7 m │
└────────────┴──────────┴──────────────┴──────────┘

MINIMUM-COST CUTTING SPEED  (Carbide P20 on mild steel)
    Tool-change time  T_c = 2 min
    Cost per edge     C_t = ₹50
    Machine + labour  C_m = ₹5/min

    T_opt = (C_t/C_m + T_c) · (1/n − 1)
          = (50/5 + 2) · (1/0.25 − 1)
          = 12 · 3
          = 36 min

    V_opt = C / T_opt^n
          = 300 / (36)^0.25
          ≈ 122.5 m/min

TURNING CYCLE — Ø 80 × 300 mm bar,  V = 200 m/min
    Spindle speed:  N = 1000 · V / (π D) = 1000·200 / (π·80) = 796 rpm
    Feed:           f = 0.20 mm/rev
    Depth of cut:   d = 2.5 mm
    MRR = 1000·V · f · d = 200 000 · 0.2 · 2.5 = 100 000 mm³/min = 100 cm³/min
    Machining time = L / (f · N) = 300 / (0.2 · 796) = 1.88 min`,
        output: `V_optimum (carbide, mild steel) ≈ 122.5 m/min, T ≈ 36 min per edge
Ø 80 × 300 mm bar at 200 m/min: N ≈ 796 rpm, MRR = 100 cm³/min, t ≈ 1.88 min`,
        explanation: 'Taylor\'s VT^n = C is empirical — n captures how sensitive tool life is to cutting speed. HSS (n = 0.125) collapses fast; ceramic (n = 0.4) is speed-tolerant. The Gilbert cost-minimum tool life T_opt = (C_t/C_m + T_c)·(1/n − 1) balances tool cost against machine idle-time during tool changes. Double V and T drops by (½)^(1/n) — for carbide that\'s 1/16.',
      },
    ],
    commonMistakes: [
      'Confusing cutting speed (V, peripheral velocity m/min) with spindle speed (N, rpm) — V = π×D×N/1000.',
      'Using Taylor\'s n for one tool-material pair on another — n for HSS (~0.125) vs carbide (~0.25) are very different.',
      'Maximising MRR without checking tool life — very high speeds reduce tool life exponentially (T ∝ V^(1/n)).',
    ],
    bestPractices: [
      'Start with the cutting speed recommended by the tool manufacturer data sheet — Taylor\'s equation refines this with measured tool life data.',
      'Monitor tool wear continuously — flank wear VB = 0.3mm is the standard ISO tool life criterion.',
      'Use cutting fluid appropriately — flood cooling for steel, mist for cast iron, dry for most aluminium (chip adhesion with coolant).',
    ],
    exercises: [
      'A carbide tool with n=0.25 cuts at V=120 m/min with tool life T=35 min. Find: (a) C value, (b) tool life at V=200 m/min.',
      'In a turning operation (D=60mm, L=200mm, f=0.25mm/rev, d=3mm, V=150 m/min), find MRR in cm³/min and machining time.',
      'Compare the optimum cutting speed for minimum time vs minimum cost. Which is always higher and why?',
    ],
    quizQuestions: [
      {
        question: 'In Taylor\'s equation VT^n = C, if cutting speed doubles, tool life changes by a factor of:',
        options: ['2^n', '(1/2)^(1/n)', '2^(1/n)', 'n/2'],
        answer: 1,
        explanation: 'From VT^n = C: T = (C/V)^(1/n). Doubling V: T_new = (C/2V)^(1/n) = T_old × (1/2)^(1/n). For carbide (n=0.25): tool life drops by (1/2)^4 = 1/16 — doubling speed reduces tool life to 1/16th! This is why high-speed machining requires rigid, vibration-free machine tools.',
      },
      {
        question: 'Material Removal Rate (MRR) in turning is given by:',
        options: ['π × D × N', 'V × f × d', 'f × d × L', 'V / (f × d)'],
        answer: 1,
        explanation: 'MRR = V × f × d (mm³/min), where V is cutting speed (mm/min), f is feed (mm/rev × rpm gives mm/min), and d is depth of cut (mm). MRR measures productive cutting efficiency. Higher MRR = shorter cycle time but also higher cutting forces and tool wear.',
      },
    ],
    interviewQuestions: [
      'Explain the significance of Taylor\'s exponent n in tool life analysis.',
      'What is the difference between orthogonal and oblique cutting?',
      'How do you determine the optimal cutting speed for minimum cost?',
    ],
    summary: 'Machining removes material through controlled shear using harder tools. MRR = V × f × d governs productivity. Taylor\'s equation VT^n = C governs tool life — n ranges from 0.1 (HSS) to 0.4 (ceramic). Optimal cutting speed balances MRR against tool replacement cost. Carbide tools (n ≈ 0.25) enable 10× higher cutting speeds than HSS, revolutionising manufacturing productivity. Always verify spindle speed N = 1000V/(πD) when switching between speed and RPM.',
    nextTopic: undefined,
  },
]
