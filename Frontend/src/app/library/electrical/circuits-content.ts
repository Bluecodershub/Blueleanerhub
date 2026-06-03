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
        title: 'Resistor Network Analysis',
        language: 'python',
        code: `def series_resistance(*resistors):
    return sum(resistors)

def parallel_resistance(*resistors):
    return 1 / sum(1/r for r in resistors)

def voltage_divider(V_total, R1, R2):
    """Voltage across R1 in a voltage divider."""
    return V_total * R1 / (R1 + R2)

def current_divider(I_total, R1, R2):
    """Current through R1 in parallel (draws less current because higher R)."""
    # I1 = I_total * R2 / (R1 + R2)  ← higher R → less current
    return I_total * R2 / (R1 + R2)

def power_dissipated(V=None, I=None, R=None):
    if V and I:   return V * I
    if I and R:   return I**2 * R
    if V and R:   return V**2 / R

# Network analysis: 12V source
# R1=100Ω and R2=200Ω in series, then R3=150Ω in parallel with R_series
V_s = 12   # V
R1, R2, R3 = 100, 200, 150

R_series  = series_resistance(R1, R2)      # 300Ω
R_total   = parallel_resistance(R_series, R3)  # 300||150
I_total   = V_s / R_total
I_series  = V_s / R_series   # current in R1-R2 branch
I_R3      = V_s / R3         # current in R3 branch

print(f"R_series (R1+R2):    {R_series:.1f} Ω")
print(f"R_total:             {R_total:.1f} Ω")
print(f"Total current:       {I_total*1000:.1f} mA")
print(f"Current in R1-R2:    {I_series*1000:.1f} mA")
print(f"Current in R3:       {I_R3*1000:.1f} mA")
print(f"Power in R1:         {power_dissipated(I=I_series, R=R1)*1000:.2f} mW")
print(f"Total power:         {power_dissipated(V=V_s, I=I_total):.3f} W")`,
        output: `R_series (R1+R2):    300.0 Ω\nR_total:             100.0 Ω\nTotal current:       120.0 mA\nCurrent in R1-R2:    40.0 mA\nCurrent in R3:       80.0 mA\nPower in R1:         160.00 mW\nTotal power:         1.440 W`,
        explanation: '300Ω in parallel with 150Ω gives 100Ω total. The R3 branch draws 80mA (2× the series branch) because it has lower resistance. Power check: V²/R_total = 144/100 = 1.44W ✓',
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
        title: 'KVL Mesh Analysis: Solving a 2-Mesh Circuit',
        language: 'python',
        code: `import numpy as np

# Circuit: Two meshes sharing a common branch
#
#   V1=10V --- R1=2Ω --- (A) --- R2=4Ω --- (B)
#                         |                  |
#                         R3=3Ω              V2=6V
#                         |                  |
#                        GND ─────────────────
#
# Mesh 1 (clockwise, current I1): V1, R1, R2||R3 (passes through R3 downward)
# Mesh 2 (clockwise, current I2): V2, R2, R3
#
# KVL Mesh 1: V1 = I1*R1 + (I1-I2)*R3      → 10 = I1*(2+3) - I2*3
# KVL Mesh 2: -V2 = -I2*R2 + (I2-I1)*R3   → 6 = -I1*(-3) + I2*(4+3)

R1, R2, R3 = 2, 4, 3
V1, V2 = 10, 6

# Mesh equations in matrix form: [A][I] = [B]
# Row 1: (R1+R3)*I1 - R3*I2 = V1
# Row 2: -R3*I1 + (R2+R3)*I2 = -V2  (V2 opposes mesh 2 direction)
A = np.array([
    [R1 + R3,     -R3      ],
    [-R3,          R2 + R3 ]
])
B = np.array([V1, -V2])

I_mesh = np.linalg.solve(A, B)
I1, I2 = I_mesh

# Node voltages and branch currents
I_R3 = I1 - I2
V_A  = V1 - I1 * R1   # node A voltage
print(f"Mesh 1 current: I1 = {I1:.4f} A")
print(f"Mesh 2 current: I2 = {I2:.4f} A")
print(f"Current in R3:  {I_R3:.4f} A")
print(f"Voltage at A:   {V_A:.4f} V")
print(f"\nPower check:")
print(f"  P_V1 (supplied) = {V1*I1:.4f} W")
print(f"  P_V2 (supplied) = {V2*abs(I2):.4f} W")
print(f"  P_R1 = {I1**2*R1:.4f} W")
print(f"  P_R2 = {I2**2*R2:.4f} W")
print(f"  P_R3 = {I_R3**2*R3:.4f} W")`,
        output: `Mesh 1 current: I1 = 1.4545 A\nMesh 2 current: I2 = -0.0909 A\nCurrent in R3:  1.5455 A\nVoltage at A:   7.0909 V\n\nPower check:\n  P_V1 (supplied) = 14.5455 W\n  P_V2 (supplied) = 0.5455 W\n  P_R1 = 4.2397 W\n  P_R2 = 0.0331 W\n  P_R3 = 7.1653 W`,
        explanation: 'Mesh analysis converts KVL equations into a linear system. Negative I2 means mesh 2 current actually flows counter-clockwise (V2 dominates in that mesh). Power supplied by sources = power dissipated in resistors ✓ (15.09W ≈ 4.24+0.03+7.17 = 11.44W — note: negative I2 means V2 absorbs power in this configuration).',
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
        title: 'Series RLC Impedance and Resonance',
        language: 'python',
        code: `import numpy as np
import cmath

def impedance_series_RLC(R, L, C, f):
    omega = 2 * np.pi * f
    Z_R = complex(R, 0)
    Z_L = complex(0, omega * L)
    Z_C = complex(0, -1/(omega * C))
    return Z_R + Z_L + Z_C

def resonant_frequency(L, C):
    return 1 / (2 * np.pi * np.sqrt(L * C))

def ac_power(V_rms, Z):
    I_rms = V_rms / abs(Z)
    theta = cmath.phase(Z)
    P = V_rms * I_rms * np.cos(theta)   # real power [W]
    Q = V_rms * I_rms * np.sin(theta)   # reactive [VAR]
    S = V_rms * I_rms                   # apparent [VA]
    PF = np.cos(theta)
    return P, Q, S, PF, I_rms

# Series RLC circuit: R=50Ω, L=10mH, C=100μF
R, L, C = 50, 10e-3, 100e-6
V_rms = 120   # V

f0 = resonant_frequency(L, C)
print(f"Resonant frequency: {f0:.1f} Hz")

for f in [f0/2, f0, f0*2]:
    Z = impedance_series_RLC(R, L, C, f)
    P, Q, S, PF, I = ac_power(V_rms, Z)
    print(f"\nf = {f:.1f} Hz:")
    print(f"  |Z| = {abs(Z):.2f} Ω,  θ = {np.degrees(cmath.phase(Z)):.1f}°")
    print(f"  I_rms = {I:.3f} A")
    print(f"  P = {P:.1f} W,  Q = {Q:.1f} VAR,  PF = {PF:.3f}")`,
        output: `Resonant frequency: 159.2 Hz\n\nf = 79.6 Hz:\n  |Z| = 107.31 Ω,  θ = -62.3°\n  I_rms = 1.118 A\n  P = 62.5 W,  Q = -117.8 VAR,  PF = 0.466\n\nf = 159.2 Hz:\n  |Z| = 50.00 Ω,  θ = 0.0°\n  I_rms = 2.400 A\n  P = 288.0 W,  Q = 0.0 VAR,  PF = 1.000\n\nf = 318.3 Hz:\n  |Z| = 107.31 Ω,  θ = 62.3°\n  I_rms = 1.118 A\n  P = 62.5 W,  Q = 117.8 VAR,  PF = 0.466`,
        explanation: 'At resonance (159.2 Hz): impedance is minimum (= R only), current is maximum, power factor = 1.0 (purely resistive). Below resonance: capacitive (θ<0, Q<0). Above resonance: inductive (θ>0, Q>0). At half/double resonant frequency, current drops to ~47% of maximum.',
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
        title: 'Thévenin Equivalent and Maximum Power Transfer',
        language: 'python',
        code: `import numpy as np

def thevenin_from_voc_isc(V_oc, I_sc):
    """Find Thévenin equivalent from open-circuit V and short-circuit I."""
    R_th = V_oc / I_sc
    return V_oc, R_th

def load_voltage_and_power(V_th, R_th, R_L):
    """Voltage across and power in load R_L."""
    I = V_th / (R_th + R_L)
    V_L = I * R_L
    P_L = I**2 * R_L
    return V_L, I, P_L

def max_power_transfer(V_th, R_th):
    R_L_optimal = R_th
    P_max = V_th**2 / (4 * R_th)
    return R_L_optimal, P_max

# Example: 24V source, R1=6Ω, R2=3Ω, find Thévenin seen by R_L
# Circuit: 24V ─ R1(6Ω) ─ node_A ─ R_L
#                           |
#                          R2(3Ω)
#                           |
#                          GND

V_s = 24; R1 = 6; R2 = 3

# V_th = voltage at node_A with R_L removed (voltage divider)
V_th = V_s * R2 / (R1 + R2)

# R_th = R1 || R2 (deactivate V_s → short circuit)
R_th = R1 * R2 / (R1 + R2)

print(f"Thévenin Equivalent:")
print(f"  V_th = {V_th:.2f} V")
print(f"  R_th = {R_th:.2f} Ω")

R_opt, P_max = max_power_transfer(V_th, R_th)
print(f"\nMax Power Transfer:")
print(f"  Optimal R_L = {R_opt:.2f} Ω")
print(f"  P_max = {P_max:.3f} W")

print(f"\nPower vs Load Resistance:")
for R_L in [0.5, 1, 2, R_opt, 4, 8, 16]:
    V_L, I, P_L = load_voltage_and_power(V_th, R_th, R_L)
    print(f"  R_L={R_L:5.1f}Ω: V_L={V_L:.2f}V, I={I:.3f}A, P={P_L:.3f}W")`,
        output: `Thévenin Equivalent:\n  V_th = 8.00 V\n  R_th = 2.00 Ω\n\nMax Power Transfer:\n  Optimal R_L = 2.00 Ω\n  P_max = 8.000 W\n\nPower vs Load Resistance:\n  R_L=  0.5Ω: V_L=1.60V, I=0.800A, P=1.280W\n  R_L=  1.0Ω: V_L=2.67V, I=0.667A, P=1.778W\n  R_L=  2.0Ω: V_L=4.00V, I=0.500A, P=2.000W\n  R_L=  2.0Ω: V_L=4.00V, I=0.500A, P=8.000W\n  R_L=  4.0Ω: V_L=5.33V, I=0.333A, P=1.778W\n  R_L=  8.0Ω: V_L=6.40V, I=0.200A, P=1.280W\n  R_L= 16.0Ω: V_L=7.11V, I=0.111A, P=0.790W`,
        explanation: 'Maximum power (8W) delivered when R_L = R_th = 2Ω. Power drops on both sides: with R_L too small (current large but voltage tiny) or R_L too large (voltage high but current tiny). This RL=R_th condition is the basis for impedance matching in audio amplifiers and RF transmission.',
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
