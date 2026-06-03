import type { TopicLesson } from '../_shared/types'

export const structureLessons: TopicLesson[] = [
  {
    id: 'structural-loads',
    title: 'Structural Loads & Load Combinations',
    intro: 'Before designing any structure, engineers must identify and quantify all forces acting on it — from dead loads and live loads to wind, earthquake, and thermal effects.',
    whatIsIt: 'Structural loads are forces and pressures that a building or structure must safely resist. Types: Dead loads (DL) — permanent weight of the structure itself (concrete, steel, finishes). Live loads (LL) — variable occupancy and usage loads (people, furniture, vehicles). Environmental loads — wind, seismic, snow, thermal. Load combinations per IS 456/IS 875: 1.5(DL+LL), 1.2(DL+LL+WL), etc.',
    whyImportant: 'Underestimating loads leads to structural failure. Overestimating leads to overdesign and wasted material cost. Accurate load analysis is the first and most critical step in structural design. All subsequent beam, column, and foundation design depends on getting loads right.',
    simpleExplanation: 'Before you build anything, you need to know what forces will act on it. A floor slab must carry its own weight (dead load) plus people and furniture (live load) plus possible earthquake shaking. A structural engineer\'s first job is to add up all these forces and find the worst combination.',
    detailedExplanation: 'Dead load calculation: unit weight × volume. For RCC slab: 25 kN/m³ × thickness. IS 875 Part 1 gives floor finish and partition loads. IS 875 Part 2 gives live loads by building type (residential 2 kN/m², offices 3-4 kN/m², parking 5 kN/m²). IS 875 Part 3 gives wind loads. IS 1893 gives seismic design loads. Load combinations ensure the structure is safe for the most severe realistic combination of simultaneous loads.',
    realWorldExample: 'Design of a residential floor slab (IS 456): Dead load = 25×0.15 = 3.75 kN/m² (slab) + 1.0 (floor finish) + 1.5 (partition allowance) = 6.25 kN/m². Live load = 2.0 kN/m² (IS 875). Factored load = 1.5×(6.25+2.0) = 12.375 kN/m². This drives the reinforcement design.',
    formula: 'Dead Load (DL) = Unit Weight × Volume\nFor RCC: γ = 25 kN/m³\nFor steel: γ = 78.5 kN/m³\n\nIS 456 Load Combinations:\nFd = 1.5(DL + LL)         — Gravity only\nFd = 1.2(DL + LL ± WL)    — With wind\nFd = 1.5(DL ± WL)         — Wind governs\nFd = 1.2(DL + LL ± EL)    — With earthquake',
    codeExamples: [
      {
        title: 'Load Calculation for a Residential Floor Slab',
        language: 'python',
        code: `# IS 875 load calculation for residential building
def slab_dead_load(thickness_m, unit_wt=25):
    """RCC slab self-weight. unit_wt in kN/m³."""
    return unit_wt * thickness_m

def factored_load_gravity(DL, LL, gamma_DL=1.5, gamma_LL=1.5):
    """IS 456 factored load: 1.5(DL + LL)"""
    return gamma_DL * DL + gamma_LL * LL

def factored_load_wind(DL, LL, WL):
    """IS 456 factored load: 1.2(DL + LL + WL)"""
    return 1.2 * (DL + LL + WL)

# Residential floor slab: 150mm thick, 4m × 5m panel
slab_thickness = 0.15   # m
floor_area = 4 * 5      # m²

DL_slab    = slab_dead_load(slab_thickness)  # kN/m²
DL_finish  = 1.0    # floor finish (IS 875 Part 1)
DL_partition = 1.5  # partition allowance
DL_total   = DL_slab + DL_finish + DL_partition

LL = 2.0   # residential live load (IS 875 Part 2, Table 1)

Fd_gravity = factored_load_gravity(DL_total, LL)

print(f"=== Floor Slab Load Analysis ===")
print(f"Slab self-weight:    {DL_slab:.2f} kN/m²")
print(f"Floor finish:        {DL_finish:.2f} kN/m²")
print(f"Partition allowance: {DL_partition:.2f} kN/m²")
print(f"Total Dead Load:     {DL_total:.2f} kN/m²")
print(f"Live Load:           {LL:.2f} kN/m²")
print(f"\nFactored Load 1.5(DL+LL): {Fd_gravity:.3f} kN/m²")
print(f"Total factored force on panel: {Fd_gravity*floor_area:.1f} kN")`,
        output: `=== Floor Slab Load Analysis ===\nSlab self-weight:    3.75 kN/m²\nFloor finish:        1.00 kN/m²\nPartition allowance: 1.50 kN/m²\nTotal Dead Load:     6.25 kN/m²\nLive Load:           2.00 kN/m²\n\nFactored Load 1.5(DL+LL): 12.375 kN/m²\nTotal factored force on panel: 247.5 kN`,
        explanation: 'The 4×5m slab panel carries 247.5 kN of factored load — this drives the bending moment and shear force design. The factor 1.5 provides safety against uncertainty in load estimation and material strength.',
      },
    ],
    commonMistakes: [
      'Omitting partition loads in residential buildings — IS 875 requires an allowance even before layouts are fixed.',
      'Using service loads (unfactored) directly in IS 456 design — must apply load factors for limit state design.',
      'Applying the same live load to all floors — IS 875 specifies different values for different occupancies.',
    ],
    bestPractices: [
      'Check IS 875 Part 2 Table 1 for the correct live load based on building use and floor level.',
      'For tall buildings, wind and seismic loads often govern over gravity — don\'t underestimate them.',
      'Always apply the most critical load combination — run all required IS combinations and pick the worst.',
    ],
    exercises: [
      'Calculate the dead load per unit area of a 200mm RCC flat slab with 50mm screed, 10mm tiles, and suspended ceiling of 0.5 kN/m².',
      'An office floor (3 kN/m² LL) has a 175mm slab. Compute the factored UDL for design.',
      'Explain the difference between characteristic loads and design loads in IS 456 limit state design.',
    ],
    quizQuestions: [
      {
        question: 'The self-weight of RCC is taken as:',
        options: ['15 kN/m³', '20 kN/m³', '25 kN/m³', '30 kN/m³'],
        answer: 2,
        explanation: 'Reinforced cement concrete (RCC) has a unit weight of 25 kN/m³ as per IS 875 Part 1. Plain concrete is 24 kN/m³.',
      },
      {
        question: 'As per IS 875 Part 2, the residential floor live load is:',
        options: ['1.0 kN/m²', '2.0 kN/m²', '3.5 kN/m²', '5.0 kN/m²'],
        answer: 1,
        explanation: 'IS 875 Part 2, Table 1 specifies 2.0 kN/m² for residential floors. Office floors are 3.0-4.0 kN/m², parking is 5.0 kN/m².',
      },
    ],
    interviewQuestions: [
      'What are the different types of loads acting on a building structure? Give examples of each.',
      'Explain limit state design and how load factors ensure structural safety.',
      'Why is wind load analysis more critical for tall buildings than for low-rise structures?',
    ],
    summary: 'Structural analysis begins with identifying all loads: dead (permanent), live (variable), and environmental (wind, seismic). IS 875 and IS 1893 specify characteristic loads for Indian conditions. IS 456 load factors (1.5 for DL+LL) convert service loads to design loads. Accurate load estimation is the foundation of safe and economical design.',
    nextTopic: 'bending-moment-shear-force',
  },

  {
    id: 'bending-moment-shear-force',
    title: 'Bending Moment & Shear Force Diagrams',
    intro: 'Bending moment (BM) and shear force (SF) diagrams are the fundamental tools for understanding how beams respond to loading.',
    whatIsIt: 'A beam under transverse loading develops internal shear forces (V) and bending moments (M) at every cross-section. A Shear Force Diagram (SFD) plots V along the beam length. A Bending Moment Diagram (BMD) plots M along the beam length. These diagrams identify the critical sections for design — where bending and shear are maximum.',
    whyImportant: 'Beam design is driven by maximum bending moment and maximum shear force. Reinforcement in RCC beams, flange size in steel beams, and bearing capacity at supports are all derived from the BMD and SFD. Without these diagrams, structural design is impossible.',
    simpleExplanation: 'When you place a book on your hand held at both ends, it bends. The material on top gets compressed; the bottom gets stretched. The more you load it, the more it bends. Bending moment is the "tendency to bend" at each section. Shear force is the "tendency to slide" — the net vertical force on one side of a cross-section.',
    detailedExplanation: 'Sign convention (IS/sagging positive): Sagging bending moment (beam concave upward) is positive. Hogging (concave downward) is negative. Positive shear: forces to the left of the section act upward (or right side downward). Relationships: dV/dx = −w(x) (distributed load is rate of change of shear). dM/dx = V (shear is rate of change of moment). Point of maximum moment: where V = 0 (shear changes sign). Standard cases memorized: Simply supported beam with UDL, concentrated load, etc.',
    realWorldExample: 'A bridge girder spanning 20m carries its own weight (UDL) plus truck loads (concentrated loads). The BMD determines the maximum moment at midspan — this drives the depth and flange design of the steel girder. The SFD shows maximum shear near supports — this determines the web plate thickness and stiffener spacing.',
    formula: 'Relationships:\ndV/dx = −w(x)  [distributed load w in kN/m]\ndM/dx = V\n\nSimply Supported Beam, UDL w (kN/m), span L:\n  R_A = R_B = wL/2\n  V(x) = wL/2 - wx\n  M(x) = (wL/2)x - wx²/2\n  M_max = wL²/8  at x=L/2\n  V_max = wL/2  at supports\n\nSS Beam, Point Load P at midspan:\n  M_max = PL/4',
    codeExamples: [
      {
        title: 'BMD and SFD for Simply Supported Beam with UDL',
        language: 'python',
        code: `import numpy as np

def ss_beam_udl(w, L, num_points=100):
    """
    Simply supported beam with UDL w (kN/m) over span L (m).
    Returns x, V (shear), M (moment) arrays.
    """
    x = np.linspace(0, L, num_points)
    R = w * L / 2          # reaction at each support
    V = R - w * x          # shear force (kN)
    M = R * x - w * x**2 / 2  # bending moment (kN·m)
    return x, V, M

def ss_beam_point_load(P, a, L, num_points=100):
    """Simply supported beam with point load P at distance a from A."""
    b = L - a
    R_A = P * b / L
    R_B = P * a / L
    x = np.linspace(0, L, num_points)
    V = np.where(x < a, R_A, R_A - P)
    M = np.where(x <= a, R_A * x, R_A * x - P * (x - a))
    return x, V, M

# Example: 6m span, UDL = 15 kN/m
w = 15    # kN/m
L = 6     # m
x, V, M = ss_beam_udl(w, L)

print(f"Simply Supported Beam: w={w} kN/m, L={L}m")
print(f"Support reactions:    R_A = R_B = {w*L/2:.1f} kN")
print(f"Maximum shear force:  {w*L/2:.1f} kN  (at supports)")
print(f"Maximum bending moment: {w*L**2/8:.2f} kN·m  (at midspan)")

# Point load example
P = 40  # kN at midspan
x2, V2, M2 = ss_beam_point_load(P, L/2, L)
print(f"\nPoint Load P={P}kN at midspan:")
print(f"Maximum shear force:    {P/2:.1f} kN")
print(f"Maximum bending moment: {P*L/4:.2f} kN·m")

# Combined loading
M_max_combined = w*L**2/8 + P*L/4
print(f"\nCombined (superposition): M_max = {M_max_combined:.2f} kN·m")`,
        output: `Simply Supported Beam: w=15 kN/m, L=6m\nSupport reactions:    R_A = R_B = 45.0 kN\nMaximum shear force:  45.0 kN  (at supports)\nMaximum bending moment: 67.50 kN·m  (at midspan)\n\nPoint Load P=40kN at midspan:\nMaximum shear force:    20.0 kN\nMaximum bending moment: 60.00 kN·m\n\nCombined (superposition): M_max = 127.50 kN·m`,
        explanation: 'For UDL: maximum moment = wL²/8 at midspan, maximum shear = wL/2 at supports. For midspan point load: M_max = PL/4, V_max = P/2. Superposition applies for linear systems: combined M_max = 127.5 kN·m drives beam design.',
      },
    ],
    commonMistakes: [
      'Using wrong sign convention — establish and consistently use sagging positive or hogging positive.',
      'Forgetting that M is maximum where V = 0 (or changes sign) — not necessarily at midspan for asymmetric loading.',
      'Applying superposition to nonlinear systems — valid only for linear elastic structures.',
    ],
    bestPractices: [
      'Always draw FBD (free body diagram) and find reactions first before drawing SFD/BMD.',
      'Use the mathematical relationships: V = integral of −w, M = integral of V.',
      'Verify BMD by checking moment equilibrium at any section.',
    ],
    exercises: [
      'Draw SFD and BMD for a simply supported 8m beam with UDL of 10 kN/m and a concentrated load of 20 kN at 3m from left support.',
      'A cantilever 4m long carries a UDL of 5 kN/m. Find maximum shear force, maximum bending moment, and their locations.',
      'Verify the relationship M = wL²/8 for a simply supported beam with UDL by direct integration.',
    ],
    quizQuestions: [
      {
        question: 'For a simply supported beam with UDL w over span L, maximum bending moment is:',
        options: ['wL/2', 'wL²/4', 'wL²/8', 'wL²/2'],
        answer: 2,
        explanation: 'M_max = wL²/8 at midspan for a simply supported beam with UDL. This is a fundamental result every structural engineer must know.',
      },
      {
        question: 'The bending moment is maximum where the shear force is:',
        options: ['Maximum', 'Minimum', 'Zero', 'Equal to the reaction'],
        answer: 2,
        explanation: 'dM/dx = V. Maximum M occurs where dM/dx = 0, i.e., where V = 0. This is where shear changes sign.',
      },
    ],
    interviewQuestions: [
      'Explain the relationship between load intensity, shear force, and bending moment.',
      'For a cantilever with a point load at the free end, where does maximum moment and maximum shear occur?',
      'How does superposition apply to BMD calculation?',
    ],
    summary: 'SFD and BMD are derived from equilibrium at every cross-section. Key results: SS beam UDL → M_max = wL²/8 at midspan; SS beam central point load → M_max = PL/4. Maximum moment occurs where shear = 0. These diagrams are the foundation of all beam design.',
    nextTopic: undefined,
  },
]
