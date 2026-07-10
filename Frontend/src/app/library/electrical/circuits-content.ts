import type { TopicLesson } from '../_shared/types'

export const circuitLessons: TopicLesson[] = [
  {
    id: 'circuit-fundamentals',
    title: 'Circuit Fundamentals',
    intro: 'Electric circuits are networks of components that allow controlled flow of electric charge — the foundation of all electronics.',
    whatIsIt: 'A circuit is a closed conducting path through which electric current flows. It consists of: a source (battery, power supply), conductors (wires), and loads (resistors, capacitors, LEDs). Key quantities: Voltage (V, volts) — potential energy difference driving current. Current (I, amperes) — rate of charge flow. Resistance (R, ohms) — opposition to current flow. Power (P, watts) — rate of energy consumption.',
    whyImportant: 'Circuit analysis is the foundation of electrical and electronics engineering. Every device — smartphones, power grids, medical equipment, vehicles — is a collection of circuits. Understanding how to analyze voltage, current, and power in circuits enables design of reliable, efficient electronic systems.',
    simpleExplanation: 'A circuit is like a water system. Voltage is water pressure. Current is water flow rate. Resistance is the pipe\'s restriction to flow. Ohm\'s Law: V = IR. More resistance → less current for the same voltage. Power = V × I = the rate at which energy is consumed.',
    detailedExplanation: 'Fundamental quantities: Electric charge Q (coulombs, C). Current I = dQ/dt (amperes = C/s). Voltage V (volts = J/C). Resistance R (ohms, Ω). Ohm\'s Law: V = IR. Power: P = VI = I²R = V²/R. Energy: E = Pt (joules). Component types: Resistors (dissipate energy), Capacitors (store energy in electric field), Inductors (store energy in magnetic field), Voltage sources (maintain voltage regardless of current), Current sources (maintain current regardless of voltage).',
    realWorldExample: 'A 60W incandescent bulb at 120V draws I = P/V = 60/120 = 0.5A of current. Its hot-filament resistance is R = V/I = 120/0.5 = 240Ω. A 10Ω resistor in the same circuit would dissipate P = I²R = 0.25 × 10 = 2.5W of power.',
    formula: 'Ohm\'s Law: V = IR\nPower: P = VI = I²R = V²/R\nEnergy: E = Pt  [Joules]\n\nSeries: R_eq = R₁ + R₂ + ... + Rₙ\nParallel: 1/R_eq = 1/R₁ + 1/R₂ + ... + 1/Rₙ\n\nCurrent divider: I₁ = I_total × R₂/(R₁+R₂)\nVoltage divider: V₁ = V_total × R₁/(R₁+R₂)',
    codeExamples: [
      {
        title: 'Worked Example — Resistor Network with Series-Parallel Reduction',
        language: 'circuit analysis',
        kind: 'worked-example',
        code: `CIRCUIT
────────
                     ┌──[ R1=100Ω ]──[ R2=200Ω ]──┐
        + V_s=12V ── │                             │ ── −
                     └──────────[ R3=150Ω ]────────┘

Two parallel branches across the 12 V source:
    Branch A:  R1 in series with R2         (upper path)
    Branch B:  R3 alone                     (lower path)

STEP 1 — Reduce Branch A
    R_series = R1 + R2 = 100 + 200 = 300 Ω

STEP 2 — Combine branches in parallel
    1/R_total = 1/300 + 1/150 = 1/300 + 2/300 = 3/300
    R_total   = 100 Ω

STEP 3 — Total current from the source (Ohm's law)
    I_total = V_s / R_total = 12 / 100 = 0.120 A = 120 mA

STEP 4 — Branch currents (parallel branches see the same 12 V)
    I_A  (through R1, R2) = 12 / 300 = 40 mA
    I_B  (through R3)     = 12 / 150 = 80 mA
    Check:  I_A + I_B = 40 + 80 = 120 mA  ✓  (KCL at source)

STEP 5 — Voltages inside Branch A (voltage divider)
    V_R1 = 12 · R1/(R1+R2) = 12 · 100/300 = 4.0 V
    V_R2 = 12 − V_R1 = 8.0 V

STEP 6 — Power balance
    P_R1     = I_A² · R1 = (0.04)² · 100 = 0.160 W = 160 mW
    P_R2     = I_A² · R2 = (0.04)² · 200 = 0.320 W = 320 mW
    P_R3     = I_B² · R3 = (0.08)² · 150 = 0.960 W = 960 mW
    P_supply = V_s · I_total = 12 · 0.120 = 1.440 W
    Check:  P_R1 + P_R2 + P_R3 = 0.16 + 0.32 + 0.96 = 1.44 W  ✓`,
        output: `R_total   = 100 Ω
I_total   = 120 mA  (I_A = 40 mA,  I_B = 80 mA)
P_supply  = 1.44 W  (matches Σ resistor dissipations)`,
        explanation: 'Two rules do all the work: (1) resistors in series ADD, (2) resistors in parallel COMBINE AS RECIPROCALS. The lower-resistance branch (R3 = 150 Ω) draws double the current of the higher-resistance branch (R1+R2 = 300 Ω) — current always prefers the easier path. Energy conservation is your best sanity check: source power must equal the sum of the resistor dissipations.',
      },
    ],
    commonMistakes: [
      'Using Ohm\'s law V=IR for non-ohmic components like diodes (non-linear V-I relationship).',
      'Forgetting that parallel resistance is LESS than the smallest individual resistor.',
      'Confusing current direction with electron flow direction (conventional current flows from + to −).',
    ],
    bestPractices: [
      'Always label all node voltages and branch currents before applying circuit laws.',
      'For power: use P = I²R when current is known, P = V²/R when voltage is known — avoids errors.',
      'Check: sum of all power consumed = sum of all power supplied (energy conservation).',
    ],
    exercises: [
      'Three resistors 10Ω, 20Ω, and 30Ω are connected in parallel across a 6V source. Find total current and power.',
      'A voltage divider uses R1=1kΩ and R2=4kΩ across 5V. Find V_R2 and the current drawn.',
      'Two 60W bulbs are connected in series across 120V. Calculate each bulb\'s voltage, current, and power.',
    ],
    quizQuestions: [
      {
        question: 'Three resistors R₁=10Ω, R₂=10Ω, R₃=10Ω are in parallel. Total resistance is:',
        options: ['30Ω', '10Ω', '3.33Ω', '1Ω'],
        answer: 2,
        explanation: '1/R_total = 1/10+1/10+1/10 = 3/10, so R_total = 10/3 = 3.33Ω. Parallel combination is always less than the smallest resistor.',
      },
      {
        question: 'Power dissipated in a 100Ω resistor carrying 0.2A is:',
        options: ['20W', '4W', '0.2W', '2W'],
        answer: 1,
        explanation: 'P = I²R = (0.2)² × 100 = 0.04 × 100 = 4W.',
      },
    ],
    interviewQuestions: [
      'Derive the voltage divider formula from Ohm\'s Law.',
      'What is the difference between a voltage source and a current source in circuit analysis?',
      'Explain why short circuits are dangerous and how fuses protect against them.',
    ],
    summary: 'Circuit fundamentals: V=IR (Ohm\'s Law), P=VI. Series resistors add; parallel resistors combine as reciprocals. Voltage dividers distribute voltage proportionally; current dividers distribute current inversely proportional to resistance. These basics underpin all circuit analysis.',
    nextTopic: 'kirchhoffs-laws',
  },

  {
    id: 'kirchhoffs-laws',
    title: "Kirchhoff's Laws",
    intro: "Kirchhoff's Current Law (KCL) and Voltage Law (KVL) are the two fundamental laws for analyzing any circuit, however complex.",
    whatIsIt: "KCL (Kirchhoff's Current Law): The sum of all currents entering a node equals the sum of all currents leaving it. Conservation of charge: ΣI_in = ΣI_out. KVL (Kirchhoff's Voltage Law): The sum of all voltages around any closed loop is zero. Conservation of energy: ΣV = 0 around any loop.",
    whyImportant: "KCL and KVL are the cornerstone of circuit analysis. They allow systematic solution of any circuit — no matter how many nodes, loops, or components. Mesh analysis (uses KVL), nodal analysis (uses KCL), and all circuit simulation software (SPICE) are built on these two laws.",
    simpleExplanation: 'KCL: "What flows in must flow out" at every junction. Like a city intersection: cars arriving = cars leaving. KVL: "What goes up must come down" around any loop. Like a hiking trail that returns to start — total elevation change is zero.',
    detailedExplanation: 'Nodal Analysis: Apply KCL at each non-reference node, express currents in terms of node voltages V₁, V₂, ..., solve the system of equations. Works well when few nodes are present. Mesh Analysis: Apply KVL around each independent mesh (loop), express voltages in terms of mesh currents I₁, I₂, ..., solve. Works well when few meshes are present. Superposition: analyze each independent source separately, then add results. Thevenin/Norton: simplify any linear network to a single source and single resistance.',
    realWorldExample: 'SPICE circuit simulator (used in all professional IC design) numerically implements KCL at every node as a system of equations, then solves it for all node voltages. This powers the design of every microchip, from simple logic gates to billion-transistor CPUs.',
    formula: 'KCL at node: ΣI_entering = ΣI_leaving\n  OR: Σ(V_node - V_adjacent) / R = 0\n\nKVL around loop: ΣV = 0\n  (voltage rises: +V_source, voltage drops: -IR)\n\nMesh analysis:\n[R matrix][I mesh] = [V source]\n\nNodal analysis:\n[G matrix][V node] = [I source]',
    codeExamples: [
      {
        title: 'Worked Example — KVL Mesh Analysis (Two-Mesh Circuit)',
        language: 'mesh analysis',
        kind: 'worked-example',
        code: `CIRCUIT
────────
      + V1=10V −         + V2=6V −
        │                    │
        ├─[ R1=2Ω ]─A─[ R2=4Ω ]─B
        │            │            │
        │           R3=3Ω         │
        │            │            │
        └────────────┴────────────┘ (ground)

Assume mesh currents I₁ (left mesh) and I₂ (right mesh), both CW.
R3 is the shared branch — current through it = (I₁ − I₂).

KVL — Mesh 1  (source V1 pumps current):
    +V1 − I₁·R1 − (I₁ − I₂)·R3 = 0
    10 − 2 I₁ − 3 (I₁ − I₂)     = 0
    (R1 + R3) I₁ − R3 I₂        = V1
    5 I₁ − 3 I₂ = 10                                     ...(1)

KVL — Mesh 2  (V2 opposes CW direction):
    − V2 − I₂·R2 − (I₂ − I₁)·R3 = 0
    − R3 I₁ + (R2 + R3) I₂       = − V2
    − 3 I₁ + 7 I₂ = − 6                                  ...(2)

MATRIX FORM
    ⎡  5  −3 ⎤ ⎡ I₁ ⎤   ⎡  10 ⎤
    ⎣ −3   7 ⎦ ⎣ I₂ ⎦ = ⎣ −6 ⎦

    Δ  = 5·7 − (−3)·(−3) = 35 − 9 = 26
    I₁ = ( 10·7 − (−3)·(−6) ) / 26 = (70 − 18)/26 = 52/26 = 2.000 A
    Wait — check:  cross-check by Cramer with the original equations.
    I₁ = |  10  −3 |   / 26 = (10·7 − (−3)·(−6))/26 = 52/26 = 2.000 A ✗ recompute
        |  −6   7 |
    I₂ = |  5   10 |   / 26 = (5·(−6) − 10·(−3))/26 = 0/26 = 0.000 A
        | −3   −6 |

Recomputing Cramer carefully (this is a common trap — pay attention to signs):
    I₁ = det[[10,−3],[−6,7]] / 26 = (10·7 − (−3)·(−6)) / 26 = (70 − 18)/26 = 52/26 ≈ 2.000 A
    I₂ = det[[5,10],[−3,−6]] / 26 = (5·(−6) − 10·(−3)) / 26 = (−30 + 30)/26 = 0 A

Hmm — for this particular (V1, V2) pair the second mesh happens to sit at zero.
BRANCH CURRENT (through R3):
    I_R3 = I₁ − I₂ = 2.000 − 0 = 2.000 A  (downward)

NODE VOLTAGE at A:
    V_A = V1 − I₁·R1 = 10 − 2·2 = 6 V

POWER BALANCE (sanity check)
    P_V1 supplied   = V1·I₁         = 10·2       = 20 W
    P_V2 supplied   = V2·(−I₂)      = 6·0        =  0 W
    P_R1 dissipated = I₁²·R1        = 4·2        =  8 W
    P_R2 dissipated = I₂²·R2        = 0          =  0 W
    P_R3 dissipated = I_R3²·R3      = 4·3        = 12 W
    Σ supplied = 20 W  ≡  Σ dissipated (8 + 0 + 12) = 20 W  ✓`,
        output: `I₁ = 2.00 A,  I₂ = 0.00 A,  I_R3 = 2.00 A
V_A = 6 V
Power supplied by sources = 20 W  =  Power dissipated in resistors  ✓`,
        explanation: 'Mesh analysis reduces any planar circuit to a small linear system in the mesh currents. Assume CW for every mesh and let signs speak for themselves — a negative answer just means the true current flows CCW. Once you have the mesh currents, every branch current is a simple algebraic sum, and every node voltage falls out of Ohm\'s law along a single traversal. Always finish with a power balance: if it fails, the sign of one of your KVL terms is wrong.',
      },
    ],
    commonMistakes: [
      'KVL sign error: voltage rises when traversing from − to + terminal of a source; drops when traversing a resistor in the direction of current.',
      'Choosing overlapping meshes — each mesh must be an independent (planar) loop.',
      'Forgetting to account for shared branches in mesh analysis — the branch current is the algebraic sum of adjacent mesh currents.',
    ],
    bestPractices: [
      'Label all mesh currents clockwise by convention — negative results simply mean actual current is counter-clockwise.',
      'For nodal analysis: choose the most connected node as the reference (ground).',
      'Verify solution using power balance: ΣP_sources = ΣP_resistors.',
    ],
    exercises: [
      'Apply KCL at node A in a circuit with three branches: 2A entering from source, 0.5A leaving to R1, unknown current to R2.',
      'Use KVL to find the current in a series circuit: 12V source, 2Ω, 4Ω, 6Ω resistors.',
      'Solve a two-mesh circuit using matrix form: V1=20V, R1=5Ω, R2=10Ω, R3=15Ω (shared branch), V2=0.',
    ],
    quizQuestions: [
      {
        question: "Kirchhoff's Current Law is based on conservation of:",
        options: ['Energy', 'Charge', 'Momentum', 'Voltage'],
        answer: 1,
        explanation: 'KCL states that the algebraic sum of currents at a node is zero — based on charge conservation. Charge cannot accumulate at a node.',
      },
      {
        question: "KVL states that the sum of voltages around any closed loop is:",
        options: ['Equal to the source voltage', 'Proportional to total resistance', 'Zero', 'Equal to total current'],
        answer: 2,
        explanation: 'KVL is based on energy conservation. Traversing a complete loop returns to the same potential — net voltage change must be zero.',
      },
    ],
    interviewQuestions: [
      "Derive KCL from the principle of conservation of charge.",
      'What is nodal analysis and when is it preferred over mesh analysis?',
      "Explain Thevenin's theorem and describe how to find V_th and R_th for any linear network.",
    ],
    summary: "KCL (ΣI=0 at nodes) and KVL (ΣV=0 around loops) are the fundamental laws of circuit analysis. Mesh analysis applies KVL systematically; nodal analysis applies KCL. Every circuit simulation tool implements these as a linear system of equations. Mastering these tools enables analysis of arbitrarily complex circuits.",
    nextTopic: 'ac-circuits',
  },

  {
    id: 'ac-circuits',
    title: 'AC Circuits & Phasors',
    intro: 'AC circuits carry sinusoidal voltages and currents — analyzed using phasors and impedance, generalizing DC resistance to reactive components.',
    whatIsIt: 'Alternating current (AC) periodically reverses direction, described by v(t) = V_m sin(ωt + φ). Frequency f (Hz), angular frequency ω = 2πf (rad/s), period T = 1/f. Phasor representation: convert sinusoids to complex numbers (V = V_m ∠φ°). Impedance Z (Ω) generalizes resistance to include reactance: Z = R + jX. Resistors: Z_R = R. Capacitors: Z_C = 1/(jωC). Inductors: Z_L = jωL.',
    whyImportant: 'Power grids worldwide operate at AC (50Hz or 60Hz). Motors, transformers, and most large power equipment require AC. AC analysis with phasors is fundamental to power systems, signal processing, filter design, and RF/microwave engineering.',
    simpleExplanation: 'DC circuits have constant voltage and current. AC circuits have voltage and current that oscillate like a sine wave. A capacitor charges and discharges with each cycle — it "blocks" DC but passes AC. An inductor resists changes in current — it opposes AC but passes DC. Phasors are a mathematical shortcut that replaces time-domain differential equations with simple complex-number algebra.',
    detailedExplanation: 'Key AC concepts: RMS (root-mean-square) value: V_rms = V_m/√2. Most AC meters read RMS — 120V AC means V_rms=120V, V_m=170V. Impedance magnitude |Z| and phase angle θ = arctan(X/R). Power in AC circuits: Apparent power S = V_rms × I_rms [VA]. Real power P = S·cosθ [W]. Reactive power Q = S·sinθ [VAR]. Power factor = cosθ = P/S. Resonance in series RLC: ω₀ = 1/√(LC), Z minimum, current maximum.',
    realWorldExample: 'Industrial motor loads are highly inductive (lagging power factor ~0.7-0.85). Power companies charge industrial customers for low power factor because it increases current (and thus transmission losses) without delivering useful work. Power factor correction capacitors are installed to bring PF close to 1.0, reducing electricity bills.',
    formula: 'Impedances:\nZ_R = R          (no phase shift)\nZ_C = 1/(jωC) = -j/(ωC)  (current leads voltage by 90°)\nZ_L = jωL         (current lags voltage by 90°)\n\nOhm\'s Law for AC:\nV = Z × I  (complex numbers)\n\nPower:\nS = V_rms × I_rms* = P + jQ\nP = |I|²R = V²_rms/R  [W]\nQ = |I|²X  [VAR]\nPower factor = P/S = cos(θ)',
    codeExamples: [
      {
        title: 'Worked Example — Series RLC Impedance, Resonance & Power',
        language: 'phasor analysis',
        kind: 'worked-example',
        code: `CIRCUIT   Series RLC   R = 50 Ω,  L = 10 mH,  C = 100 µF
Source    V_rms = 120 V

STEP 1 — Component impedances (phasor form)
    Z_R = R                     = 50    ∠  0°
    Z_L = j ω L
    Z_C = 1 / (j ω C) = − j / (ω C)

STEP 2 — Resonant frequency  (Z_L cancels Z_C)
    ω₀ = 1 / √(L C) = 1 / √(0.01 · 0.0001) = 1000 rad/s
    f₀ = ω₀ / (2 π) ≈ 159.2 Hz

FREQUENCY SWEEP  (V_rms = 120 V)
┌──────────┬─────────┬───────────┬────────────┬──────────┬──────────┬──────────┬──────────┐
│  f (Hz)  │  ω L    │  1/(ω C)  │  X = ωL−1/ωC│ |Z| (Ω)  │  θ       │ I_rms (A)│    PF    │
├──────────┼─────────┼───────────┼────────────┼──────────┼──────────┼──────────┼──────────┤
│  79.6    │  5.0    │  20.0     │  −15.0     │  52.2    │ −16.7°   │  2.30    │  0.958   │
│ 159.2 ★  │ 10.0    │  10.0     │    0.0     │  50.0    │   0.0°   │  2.40    │  1.000   │
│ 318.3    │ 20.0    │   5.0     │  +15.0     │  52.2    │ +16.7°   │  2.30    │  0.958   │
└──────────┴─────────┴───────────┴────────────┴──────────┴──────────┴──────────┴──────────┘
    ( θ < 0  ⇒  capacitive,  I leads V.
      θ > 0  ⇒  inductive,   I lags  V.
      θ = 0  ⇒  purely resistive at resonance. )

STEP 3 — Power at resonance (f₀ = 159.2 Hz)
    I_rms  = V_rms / |Z| = 120 / 50 = 2.40 A
    P (real)      = V·I·cos θ  = 120·2.40·1.000 = 288 W
    Q (reactive)  = V·I·sin θ  = 0    (perfectly balanced L and C)
    S (apparent)  = V·I        = 288 VA
    Power factor  = cos θ      = 1.000  (unity)

STEP 4 — Away from resonance (f = f₀/2 or 2 f₀)
    |Z| rises,  I falls,  P falls,  |Q| grows, PF worsens.
    The current is 47 % lower and reactive power appears — power grid
    operators dislike this because it inflates I without delivering P.

PHASOR-DIAGRAM SKETCH (below resonance, capacitive)
        Voltage phasor V     ────►
        Current phasor I  ↗   (leads V by |θ|)
        V_R along I,   V_L 90° ahead, V_C 90° behind of I.`,
        output: `f₀ ≈ 159.2 Hz  (resonance)
At f₀: |Z| = 50 Ω, I = 2.40 A, P = 288 W, PF = 1.00
Off resonance: |Z| grows, PF drops, and reactive power appears.`,
        explanation: 'A series RLC has a single "sweet spot" at ω₀ = 1/√(LC) where Z_L and Z_C annihilate each other and impedance shrinks to just R. Below resonance the capacitor dominates (leading current); above resonance the inductor does (lagging current). Real motor loads sit above the natural resonance of their own reactive circuit — that\'s why plants install PF-correction capacitors to push cos θ back toward 1 and reduce billed apparent power.',
      },
    ],
    commonMistakes: [
      'Using peak voltage (V_m) where RMS is needed — P = V_rms²/R, not V_m²/R.',
      'Adding impedances using magnitudes instead of complex numbers: |Z_total| ≠ |Z₁| + |Z₂| in general.',
      'Forgetting the j in phasors — Z_L = jωL, not just ωL.',
    ],
    bestPractices: [
      'Always work with phasors (complex numbers) for AC steady-state analysis — never go back to time domain unless needed.',
      'Express results in polar form (magnitude ∠ angle) for physical interpretation.',
      'For power analysis: use RMS values, not peak values.',
    ],
    exercises: [
      'A 60Hz AC circuit has R=100Ω, L=50mH. Calculate impedance magnitude and phase angle.',
      'An RC circuit (R=1kΩ, C=1μF) has V_in=10V at 1kHz. Find V_out across C (low-pass filter output).',
      'A motor draws 5A from 240V at a power factor of 0.8 lagging. Find real power, reactive power, and apparent power.',
    ],
    quizQuestions: [
      {
        question: 'The impedance of a capacitor increases when frequency:',
        options: ['Increases', 'Decreases', 'Stays the same', 'Doubles'],
        answer: 1,
        explanation: 'Z_C = 1/(ωC) = 1/(2πfC). As frequency decreases, Z_C increases. At DC (f=0), Z_C = ∞ (open circuit). At high frequency, Z_C → 0 (short circuit).',
      },
      {
        question: 'At resonance in a series RLC circuit, the impedance is:',
        options: ['Zero', 'Equal to R only', 'Equal to jωL', 'Maximum'],
        answer: 1,
        explanation: 'At resonance, Z_L = jωL and Z_C = -j/(ωC) are equal in magnitude and cancel. Z_total = R + j(ωL - 1/ωC) = R. Impedance is minimum (purely resistive).',
      },
    ],
    interviewQuestions: [
      'Explain the concept of impedance and how it generalizes resistance to AC circuits.',
      'What is power factor and why does a low power factor increase electricity costs?',
      'How does a transformer work and what role does it play in AC power transmission?',
    ],
    summary: 'AC circuits use phasors (complex numbers) to analyze sinusoidal steady state. Impedance Z = R + jX generalizes resistance. At resonance, Z = R minimum and PF = 1. Real power P = V_rms I_rms cosθ; reactive power Q is stored/returned by reactive components. Power factor correction improves efficiency.',
    nextTopic: 'thevenin-norton',
  },

  {
    id: 'thevenin-norton',
    title: "Thévenin & Norton Theorems",
    intro: "Thévenin's and Norton's theorems simplify any linear circuit into a single equivalent source and resistance — powerful tools for circuit design and analysis.",
    whatIsIt: "Thévenin's theorem: any linear two-terminal network can be replaced by a single voltage source V_th in series with a resistance R_th. Norton's theorem: equivalently, a single current source I_N in parallel with R_N. The two are related: V_th = I_N × R_N, R_th = R_N. This simplification makes it easy to analyze what happens when different loads are connected to a complex source network.",
    whyImportant: 'Thévenin equivalents are used everywhere in electronics: amplifier design (input/output impedance matching), battery modeling (V_oc and R_internal), sensor signal conditioning, and maximum power transfer design. Without Thévenin\'s theorem, every load change would require re-analyzing the entire circuit.',
    simpleExplanation: 'A car battery is not just 12V — it has internal resistance. When you draw current, voltage drops. The battery is a Thévenin equivalent: V_th = 12V (open-circuit voltage), R_th = 0.1Ω (internal resistance). Under load: V_terminal = 12 − I × 0.1. This model predicts behavior under any load without redesigning the battery.',
    detailedExplanation: 'Finding Thévenin equivalent: (1) Remove the load resistor R_L. (2) Find V_th = open-circuit voltage across the terminals. (3) Find R_th: deactivate all independent sources (replace V sources with short circuits, I sources with open circuits), then find equivalent resistance from terminals. Maximum power transfer theorem: maximum power is delivered to load R_L when R_L = R_th. P_max = V_th²/(4R_th).',
    realWorldExample: 'USB port has Thévenin equivalent: V_th ≈ 5V (no load voltage), R_th ≈ 0.5Ω (source impedance). When charging a phone drawing 1A: V_port = 5 − 1×0.5 = 4.5V. Fast chargers lower R_th to deliver more power without voltage sag. The phone\'s charging circuit sees the USB port as a Thévenin source.',
    formula: 'Thévenin equivalent:\nV_th = open-circuit voltage\nR_th = resistance with all sources deactivated\n\nNorton equivalent:\nI_N = short-circuit current = V_th / R_th\nR_N = R_th\n\nMax Power Transfer:\nR_L = R_th  →  P_max = V_th² / (4·R_th)',
    codeExamples: [
      {
        title: 'Worked Example — Thévenin Equivalent & Maximum Power Transfer',
        language: 'circuit theorems',
        kind: 'worked-example',
        code: `CIRCUIT
────────
                 R1 = 6 Ω
    +24 V ──[////]──┬──── A   (load terminal)
                    │
                   [//]  R2 = 3 Ω
                    │
                    ↓
                    ⏚

STEP 1 — Open-circuit voltage V_th at terminals A–ground
    (Load removed → no current through R1, no drop across R1
     but the R1–R2 divider still sets V_A when a "virtual" load is absent...
     actually with load OPEN, no current at all flows; V_A = V_R2 by KVL on
     the R1–R2 series pair driven by 24 V.)

    V_th = V_s · R2 / (R1 + R2)
         = 24  · 3   / (6 + 3)
         = 24  · 3/9
         = 8.00 V

STEP 2 — Thévenin resistance R_th (deactivate 24 V source → short it)
    Looking back from terminals A–gnd, R1 and R2 appear in PARALLEL:
    R_th = (R1·R2)/(R1+R2) = (6·3)/(6+3) = 18/9 = 2.00 Ω

STEP 3 — Cross-check with short-circuit current
    I_sc = V_th / R_th = 8 / 2 = 4.00 A
    ( Independently: short the terminals, then I_sc = V_s / R1 with R2 bypassed
      by the short — actually 24/6 = 4 A ✓ )

STEP 4 — Load-side analysis
    Any load R_L sees:  V_L = V_th · R_L/(R_th + R_L),   I = V_th/(R_th + R_L),
                        P_L = I² R_L

MAX POWER TRANSFER   (∂P_L/∂R_L = 0)
    Optimal R_L = R_th = 2.00 Ω
    P_L,max     = V_th² / (4 R_th) = 8² / (4·2) = 8.00 W

┌────────┬──────────┬──────────┬──────────┐
│ R_L Ω  │  I (A)   │ V_L (V)  │  P_L (W) │
├────────┼──────────┼──────────┼──────────┤
│  0.5   │  3.20    │  1.60    │   5.12   │
│  1.0   │  2.667   │  2.67    │   7.11   │
│  2.0★  │  2.000   │  4.00    │   8.00   │
│  4.0   │  1.333   │  5.33    │   7.11   │
│  8.0   │  0.800   │  6.40    │   5.12   │
│ 16.0   │  0.444   │  7.11    │   3.16   │
└────────┴──────────┴──────────┴──────────┘

EFFICIENCY NOTE
   At R_L = R_th, load power = source power / 2  ⇒  efficiency = 50 %.
   Fine for signal-matching (audio out, RF antenna), unacceptable for
   power delivery where you want R_L ≫ R_th to keep efficiency high.`,
        output: `V_th = 8.00 V,  R_th = 2.00 Ω,  I_sc = 4.00 A
Max power to load:  8.00 W, at R_L = R_th = 2.00 Ω  (efficiency = 50 %)`,
        explanation: 'Thévenin equivalents replace an arbitrarily complex linear source with a simple V_th–R_th pair — analysis of any load then reduces to a single voltage divider. Max power transfer occurs at R_L = R_th but sacrifices efficiency (50 % into the load, 50 % dissipated internally). Signal chains match impedance; power grids deliberately mismatch so R_L ≫ R_th and efficiency ≫ 50 %.',
      },
    ],
    commonMistakes: [
      'Finding R_th with sources still active — must deactivate (zero) all independent sources first.',
      'Confusing V_th (open-circuit voltage) with V_source — V_th is the Thévenin voltage, which may differ from V_source due to internal drops.',
      'Applying max power transfer blindly — in power systems, max power transfer (50% efficiency) is undesirable; high efficiency requires R_L >> R_th.',
    ],
    bestPractices: [
      'Always verify: V_th/R_th = I_sc (short-circuit current) — this cross-checks your calculation.',
      'For AC circuits, use complex impedances Z_th instead of R_th.',
      'Distinguish power systems (maximize efficiency: R_L >> R_th) from signal systems (match impedance for max power transfer).',
    ],
    exercises: [
      'Find the Thévenin equivalent of a circuit: 10V source with R1=4Ω in series, and R2=6Ω in parallel with the terminals.',
      'A battery has V_oc=12V and R_internal=0.5Ω. What is the maximum current it can deliver and the maximum power to a load?',
      'Transform the Norton equivalent (I_N=3A, R_N=4Ω) to its Thévenin equivalent.',
    ],
    quizQuestions: [
      {
        question: 'To find R_th (Thévenin resistance), you must:',
        options: ['Connect all sources', 'Short all voltage sources and open all current sources', 'Open all voltage sources and short all current sources', 'Connect R_L first'],
        answer: 1,
        explanation: 'Deactivate independent sources: replace voltage sources with short circuits (V=0 → wire), replace current sources with open circuits (I=0 → break). Then find resistance from terminals.',
      },
      {
        question: 'Maximum power is transferred to a load when R_L equals:',
        options: ['0', '∞', 'R_th', '2×R_th'],
        answer: 2,
        explanation: 'P_L = V_th²×R_L/(R_th+R_L)². Taking dP_L/dR_L = 0 gives R_L = R_th for maximum power.',
      },
    ],
    interviewQuestions: [
      "Describe the step-by-step procedure to find Thévenin equivalent of any linear circuit.",
      'Why is maximum power transfer condition (R_L = R_th) inefficient for power systems?',
      "How are Thévenin's theorem and Norton's theorem related? Describe the source transformation.",
    ],
    summary: "Thévenin's theorem reduces any linear network to V_th + R_th. Norton's theorem uses I_N || R_N. The two are equivalent: V_th = I_N × R_N. Maximum power delivered to load when R_L = R_th. These theorems are essential for load analysis, amplifier design, and understanding source limitations.",
    nextTopic: undefined,
  },
]
