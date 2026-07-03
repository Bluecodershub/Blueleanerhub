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
        title: 'Casting Design Calculations',
        language: 'python',
        code: `import math

# ── Chvorinov's Rule: solidification time ──
def solidification_time(volume_cm3, surface_area_cm2, C=1.0):
    """
    Estimate relative solidification time using Chvorinov's Rule.
    t ∝ C × (V/SA)²
    C is a mould constant — use C=1 for relative comparisons.
    """
    modulus = volume_cm3 / surface_area_cm2
    return C * modulus**2

# ── Riser design: riser must solidify AFTER the casting ──
def check_riser_design(
        casting_V, casting_SA,
        riser_V, riser_SA, C=1.0):
    t_casting = solidification_time(casting_V, casting_SA, C)
    t_riser   = solidification_time(riser_V, riser_SA, C)
    margin    = (t_riser - t_casting) / t_casting * 100
    ok        = t_riser > t_casting
    return {
        'casting_modulus_cm':  round(casting_V/casting_SA, 3),
        'riser_modulus_cm':    round(riser_V/riser_SA, 3),
        't_casting (rel)':     round(t_casting, 4),
        't_riser (rel)':       round(t_riser, 4),
        'riser_solidifies_after': ok,
        'margin_%':            round(margin, 1),
    }

# ── Pattern dimensions with shrinkage and machining allowance ──
def pattern_dimensions(nominal_dim_mm, material='steel',
                        machining_allowance_mm=3.0):
    shrinkage = {'cast_iron': 0.010, 'steel': 0.020,
                 'aluminium': 0.015, 'bronze': 0.016}
    s = shrinkage.get(material, 0.020)
    shrinkage_add = nominal_dim_mm * s
    pattern_dim   = nominal_dim_mm + shrinkage_add + machining_allowance_mm
    return {
        'nominal_mm':         nominal_dim_mm,
        'shrinkage_mm':       round(shrinkage_add, 2),
        'machining_allow_mm': machining_allowance_mm,
        'pattern_dim_mm':     round(pattern_dim, 2),
    }

# ── Example 1: Plate casting ──
# Casting: 200mm × 100mm × 20mm plate
L, W, H = 20, 10, 2  # cm
V_cast  = L * W * H
SA_cast = 2*(L*W + L*H + W*H)

# Riser: blind cylindrical riser, D = H_riser = 8 cm
D_r = 8
V_riser  = math.pi * (D_r/2)**2 * D_r
SA_riser = 2 * math.pi * (D_r/2)**2 + math.pi * D_r * D_r  # closed/blind riser

result = check_riser_design(V_cast, SA_cast, V_riser, SA_riser)
print("=== Casting: 200×100×20mm Plate ===")
print(f"Casting volume: {V_cast} cm³  |  Surface area: {SA_cast} cm²")
print(f"Riser: D=H={D_r}cm blind cylinder")
for k, v in result.items():
    print(f"  {k:<30} {v}")

# ── Example 2: Pattern dimensions for steel casting ──
print("\n=== Pattern Dimensions (Steel Casting) ===")
for dim in [100, 250, 500]:
    p = pattern_dimensions(dim, 'steel', machining_allowance_mm=3)
    print(f"  Nominal {p['nominal_mm']:>4}mm → "
          f"Shrinkage +{p['shrinkage_mm']}mm + "
          f"Machining +{p['machining_allow_mm']}mm = "
          f"Pattern {p['pattern_dim_mm']}mm")

# ── Example 3: Compare solidification of different riser sizes ──
print("\n=== Riser Size vs Solidification Time ===")
print(f"{'Riser D (cm)':>14} {'Modulus':>10} {'t_riser/t_cast':>15} {'Adequate?':>10}")
for D in [4, 6, 7, 8, 10]:
    V_r  = math.pi * (D/2)**2 * D
    SA_r = 2 * math.pi * (D/2)**2 + math.pi * D * D
    ratio = solidification_time(V_r, SA_r) / solidification_time(V_cast, SA_cast)
    ok    = "Yes" if ratio > 1.0 else "No"
    print(f"{D:>14}    {V_r/SA_r:>10.3f} {ratio:>15.3f} {ok:>10}")`,
        output: `=== Casting: 200×100×20mm Plate ===
Casting volume: 400 cm³  |  Surface area: 520 cm²
Riser: D=H=8cm blind cylinder

  casting_modulus_cm             0.769
  riser_modulus_cm               1.333
  t_casting (rel)                0.5917
  t_riser (rel)                  1.7778
  riser_solidifies_after         True
  margin_%                       200.5

=== Pattern Dimensions (Steel Casting) ===
  Nominal  100mm → Shrinkage +2.0mm + Machining +3.0mm = Pattern 105.0mm
  Nominal  250mm → Shrinkage +5.0mm + Machining +3.0mm = Pattern 258.0mm
  Nominal  500mm → Shrinkage +10.0mm + Machining +3.0mm = Pattern 513.0mm

=== Riser Size vs Solidification Time ===
  Riser D (cm)    Modulus  t_riser/t_cast   Adequate?
             4      0.667           0.752         No
             6      1.000           1.691        Yes
             7      1.167           2.303        Yes
             8      1.333           3.007        Yes
            10      1.667           4.694        Yes`,
        explanation: 'Chvorinov\'s Rule shows that the riser modulus (V/SA = 1.333) is 73% larger than the casting modulus (0.769), giving 200% margin — the riser solidifies 3× slower, ensuring it feeds the casting throughout solidification. A D=4cm riser has lower modulus than the casting (inadequate — would solidify first, cutting off feed metal). D=6cm is the minimum adequate size. Pattern for a 500mm steel casting is 13mm larger (10mm shrink + 3mm machining) — critical for dimensional accuracy.',
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
        title: 'Taylor\'s Tool Life and Optimal Cutting Speed',
        language: 'python',
        code: `import math

# ── Taylor's Tool Life: VT^n = C ──
def tool_life(V, C, n):
    """Tool life T (minutes) given cutting speed V (m/min)."""
    return (C / V) ** (1/n)

def cutting_speed_for_life(T, C, n):
    """Cutting speed V to achieve tool life T minutes."""
    return C / (T ** n)

# ── Material Removal Rate ──
def mrr(V_mm_per_min, f_mm_per_rev, d_mm, rpm=None, D_mm=None):
    """
    MRR in mm³/min for turning.
    V: cutting speed in mm/min (= π × D × N)
    f: feed rate mm/rev
    d: depth of cut mm
    """
    return V_mm_per_min * f_mm_per_rev * d_mm

# ── Optimum speed for minimum cost per piece ──
def optimal_speed_min_cost(C, n, T_c, C_t, C_m):
    """
    V_opt for minimum machining cost per piece.
    C, n: Taylor's constants
    T_c: tool change time (min)
    C_t: tool cost per edge (₹)
    C_m: machine + operator cost per minute (₹/min)
    """
    T_opt = (C_t / C_m + T_c) * (1/n - 1)
    V_opt = C / (T_opt ** n)
    return V_opt, T_opt

# ── Example: HSS vs Carbide for mild steel ──
materials = {
    'HSS':           {'C': 80,  'n': 0.125},   # High-Speed Steel
    'Carbide (P20)': {'C': 300, 'n': 0.25},    # Cemented carbide
    'Ceramic':       {'C': 600, 'n': 0.40},    # Ceramic insert
}

print("=== Tool Life vs Cutting Speed ===")
speeds = [50, 80, 100, 150, 200, 250, 300]

print(f"{'Speed (m/min)':>14}", end='')
for name in materials:
    print(f"{name:>18}", end='')
print()

for V in speeds:
    print(f"{V:>14}", end='')
    for name, params in materials.items():
        T = tool_life(V, params['C'], params['n'])
        if T < 0.1:
            print(f"{'< 0.1 min':>18}", end='')
        else:
            print(f"{T:>17.1f}m", end='')
    print()

# ── Optimal cutting speed for minimum cost ──
print("\n=== Optimal Cutting Speed (Carbide P20, Mild Steel) ===")
C, n = 300, 0.25
T_c  = 2    # min per tool change
C_t  = 50   # Rs per cutting edge
C_m  = 5    # Rs/min (machine + operator)

V_opt, T_opt = optimal_speed_min_cost(C, n, T_c, C_t, C_m)
print(f"Tool change time:     {T_c} min")
print(f"Tool cost per edge:   Rs {C_t}")
print(f"Machine cost:         Rs {C_m}/min")
print(f"Optimum tool life:    {T_opt:.1f} min")
print(f"Optimum speed V_opt:  {V_opt:.1f} m/min")
print(f"Actual tool life at V_opt: {tool_life(V_opt, C, n):.1f} min ok")

# ── MRR and cycle time ──
print("\n=== Turning Operation: MRR & Cycle Time ===")
D_mm    = 80        # workpiece diameter mm
L_mm    = 300       # workpiece length mm
f       = 0.2       # mm/rev
d       = 2.5       # depth of cut mm
V_mpm   = 200       # cutting speed m/min = 200,000 mm/min

N_rpm   = V_mpm * 1000 / (math.pi * D_mm)   # spindle speed
MRR_val = mrr(V_mpm * 1000, f, d)
t_cycle = L_mm / (f * N_rpm)

print(f"Workpiece: D={D_mm}mm, L={L_mm}mm")
print(f"V={V_mpm} m/min, f={f} mm/rev, d={d} mm")
print(f"Spindle speed N:   {N_rpm:.0f} rpm")
print(f"MRR:               {MRR_val/1000:.0f} cm³/min")
print(f"Machining time:    {t_cycle:.2f} min")`,
        output: `=== Tool Life vs Cutting Speed ===
  Speed (m/min)               HSS  Carbide (P20)           Ceramic
            50           42.9m         1296.0m           498.8m
            80            1.0m          197.8m           154.0m
           100            0.2m           81.0m            88.2m
           150          < 0.1 min           16.0m            32.0m
           200          < 0.1 min            5.1m            15.6m
           250          < 0.1 min            2.1m             8.9m
           300          < 0.1 min            1.0m             5.7m

=== Optimal Cutting Speed (Carbide P20, Mild Steel) ===
Tool change time:     2 min
Tool cost per edge:   Rs 50
Machine cost:         Rs 5/min
Optimum tool life:    36.0 min
Optimum speed V_opt:  122.5 m/min
Actual tool life at V_opt: 36.0 min ok

=== Turning Operation: MRR & Cycle Time ===
Workpiece: D=80mm, L=300mm
V=200 m/min, f=0.2 mm/rev, d=2.5 mm
Spindle speed N:   796 rpm
MRR:               100 cm³/min
Machining time:    1.88 min`,
        explanation: 'The table is calculated directly from Taylor\'s equation VT^n = C. HSS tool life collapses at high cutting speed, while carbide and ceramic tools remain usable. For the cost inputs shown, the minimum-cost carbide speed is 122.5 m/min and the matching tool life is 36.0 min. Increasing machine cost pushes V_opt higher; increasing tool cost pushes V_opt lower.',
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
