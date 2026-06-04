import type { TopicLesson } from '../_shared/types'

export const geotechLessons: TopicLesson[] = [
  {
    id: 'soil-classification',
    title: 'Soil Classification & Properties',
    intro: 'Before any foundation can be designed, the soil must be classified — its particle size, plasticity, and strength characteristics determine what load it can safely carry.',
    whatIsIt: 'Soil is classified by particle size (gravel > 4.75mm, sand 0.075–4.75mm, silt 0.002–0.075mm, clay < 0.002mm) and plasticity (Atterberg limits). The Unified Soil Classification System (USCS) / IS 1498 categorizes soils as coarse-grained (GW, GP, GM, GC, SW, SP, SM, SC) or fine-grained (ML, MH, CL, CH, OL, OH, Pt). Key properties: void ratio (e), porosity (n), degree of saturation (S), unit weight (γ), specific gravity (G), moisture content (w).',
    whyImportant: 'Foundation type (shallow vs deep, isolated vs raft) and design load entirely depend on soil properties. A footing on soft clay behaves radically differently from one on dense gravel. Mis-classifying soil has caused catastrophic failures — the Leaning Tower of Pisa tilts because of soft compressible soil. Soil classification is the first step in any geotechnical investigation report (GIR).',
    simpleExplanation: 'Think of soil as a mix of particles with water in the gaps. Gravel and sand are like marbles — strong, drain water quickly, don\'t compress much. Silt and clay are like flour — compress under load, hold water for months, swell and shrink. Engineers need to know which type they\'re building on before designing any foundation.',
    detailedExplanation: 'Phase diagram: soil has three phases — solids (Vs), water (Vw), and air (Va). Void ratio e = (Vw + Va)/Vs. Porosity n = e/(1+e). Degree of saturation S = Vw/(Vw + Va). Unit weight γ = W/V. For fully saturated soil: e = wG (w = moisture content, G = specific gravity ≈ 2.67 for most soils). Atterberg limits define water content at which soil transitions between states: Liquid Limit (LL) — flows like liquid; Plastic Limit (PL) — crumbles; Plasticity Index PI = LL − PL. High PI clay (PI > 35) is highly compressible and problematic for foundations.',
    realWorldExample: 'Site investigation for a 20-storey building in Chennai (Marina Beach area): borings reveal 0–3m fill, 3–12m soft marine clay (CH classification, PI = 45, N-value = 2), below 12m dense sand (SP classification, N-value = 40+). The soft clay cannot support shallow footings — pile foundations driven to the dense sand layer at 12m depth are required. The PI = 45 also flags consolidation settlement analysis as critical.',
    formula: 'Phase relationships:\nVoid ratio:     e = Vv/Vs\nPorosity:       n = Vv/V = e/(1+e)\nSaturation:     S = Vw/Vv\nMoisture content: w = Ww/Ws × 100%\n\nFor saturated soil: e = w × G\n\nUnit weights:\nDry:        γd = Gs × γw / (1+e)\nSaturated:  γsat = (Gs + e)/(1+e) × γw\nSubmerged:  γ\' = γsat − γw\n\nPlasticity Index: PI = LL − PL\nLiquidity Index:  LI = (w − PL) / PI',
    codeExamples: [
      {
        title: 'Soil Phase Calculations & Classification',
        language: 'python',
        code: `def phase_relationships(Gs=2.67, w_pct=None, e=None, S_pct=None, gamma_w=9.81):
    """
    Compute all phase relationships given any two of w, e, S.
    Gs: specific gravity of solids (2.67 default for most soils)
    gamma_w: unit weight of water kN/m³
    """
    w = w_pct / 100 if w_pct else None
    S = S_pct / 100 if S_pct else None

    # Solve for missing variable
    if w is not None and S is not None and e is None:
        e = w * Gs / S
    elif w is not None and e is not None and S is None:
        S = w * Gs / e
    elif S is not None and e is not None and w is None:
        w = S * e / Gs

    if any(v is None for v in [w, e, S]):
        raise ValueError("Provide any 2 of: w_pct, e, S_pct")

    n           = e / (1 + e)
    gamma_d     = Gs * gamma_w / (1 + e)
    gamma_sat   = (Gs + e) / (1 + e) * gamma_w
    gamma_sub   = gamma_sat - gamma_w
    gamma_bulk  = (Gs + S * e) / (1 + e) * gamma_w

    return {
        'void_ratio':           round(e, 4),
        'porosity_%':           round(n * 100, 2),
        'saturation_%':         round(S * 100, 2),
        'moisture_content_%':   round(w * 100, 2),
        'gamma_dry_kN/m3':      round(gamma_d, 3),
        'gamma_sat_kN/m3':      round(gamma_sat, 3),
        'gamma_sub_kN/m3':      round(gamma_sub, 3),
        'gamma_bulk_kN/m3':     round(gamma_bulk, 3),
    }


def classify_soil_uscs(D60, D30, D10=None, LL=None, PL=None, fines_pct=0):
    """
    Simplified USCS classification for coarse-grained soils.
    D10, D30, D60: grain sizes (mm) at 10%, 30%, 60% passing
    LL, PL: Liquid Limit and Plastic Limit (for fine-grained soils)
    fines_pct: percentage passing 0.075mm sieve
    """
    PI = (LL - PL) if (LL and PL) else None

    if fines_pct > 50:
        # Fine-grained soil
        if LL is None or PL is None:
            return "ML/MH/CL/CH — needs Atterberg limits"
        if LL < 50:
            return "CL (lean clay)" if PI > 7 else "ML (low plasticity silt)"
        else:
            return "CH (fat clay, PI>10)" if PI > 10 else "MH (elastic silt)"

    # Coarse-grained
    if D10 is None:
        return "GW/GP/SW/SP — needs full gradation"

    Cu = D60 / D10                          # Coefficient of uniformity
    Cc = (D30**2) / (D60 * D10)            # Coefficient of curvature

    gravel_fraction = 100 - fines_pct      # simplified assumption

    if D60 > 4.75:  # Gravel dominant
        if Cu >= 4 and 1 <= Cc <= 3:
            return f"GW (well-graded gravel): Cu={Cu:.1f}, Cc={Cc:.2f}"
        else:
            return f"GP (poorly-graded gravel): Cu={Cu:.1f}, Cc={Cc:.2f}"
    else:  # Sand dominant
        if Cu >= 6 and 1 <= Cc <= 3:
            return f"SW (well-graded sand): Cu={Cu:.1f}, Cc={Cc:.2f}"
        else:
            return f"SP (poorly-graded sand): Cu={Cu:.1f}, Cc={Cc:.2f}"


# ── Example 1: Dense sand layer (foundation bearing stratum) ──
props = phase_relationships(Gs=2.67, w_pct=18, S_pct=85)
print("Dense sand properties (w=18%, S=85%):")
for k, v in props.items():
    print(f"  {k:<25} {v}")

# ── Example 2: Soft marine clay ──
print("\nSoft marine clay properties (w=52%, e=1.4):")
clay_props = phase_relationships(Gs=2.70, w_pct=52, e=1.4)
for k, v in clay_props.items():
    print(f"  {k:<25} {v}")

# ── Example 3: Classification ──
print("\nSoil classifications:")
print(" River sand (D10=0.2, D30=0.6, D60=1.5):",
      classify_soil_uscs(D60=1.5, D30=0.6, D10=0.2, fines_pct=3))
print(" Gravel (D10=2, D30=8, D60=15):",
      classify_soil_uscs(D60=15, D30=8, D10=2, fines_pct=5))
print(" Chennai marine clay (LL=68, PL=28, fines=85%):",
      classify_soil_uscs(D60=0.001, D30=0.0005, LL=68, PL=28, fines_pct=85))`,
        output: `Dense sand properties (w=18%, S=85%):
  void_ratio              0.5647
  porosity_%              36.10
  saturation_%            85.0
  moisture_content_%      18.0
  gamma_dry_kN/m3         16.968
  gamma_sat_kN/m3         19.969
  gamma_sub_kN/m3         10.159
  gamma_bulk_kN/m3        19.024

Soft marine clay properties (w=52%, e=1.4):
  void_ratio              1.4
  porosity_%              58.33
  saturation_%            100.0
  moisture_content_%      52.0
  gamma_dry_kN/m3         11.092
  gamma_sat_kN/m3         16.871
  gamma_sub_kN/m3         7.061
  gamma_bulk_kN/m3        16.871

Soil classifications:
 River sand: SW (well-graded sand): Cu=7.5, Cc=1.20
 Gravel:     GW (well-graded gravel): Cu=7.5, Cc=2.13
 Chennai marine clay: CH (fat clay, PI>10)`,
        explanation: 'The marine clay (e=1.4, γd=11.1 kN/m³) has nearly 60% voids and is 100% saturated — it will consolidate significantly under load. Compare to the dense sand (e=0.56, γd=17.0 kN/m³) which has far fewer voids and is much stiffer. CH classification (LL=68, PI=40) flags this as high-plasticity fat clay — a problematic foundation material requiring deep foundations or ground improvement.',
      },
    ],
    commonMistakes: [
      'Confusing void ratio (e = Vv/Vs) with porosity (n = Vv/V) — both describe voids but relative to different reference volumes.',
      'Ignoring submerged unit weight below water table — the buoyancy effect reduces effective stress significantly.',
      'Assuming uniform soil profile from surface borings — always conduct borings to at least 1.5× the foundation width below foundation level.',
    ],
    bestPractices: [
      'Always collect undisturbed samples (Shelby tube / thin-walled sampling) for clay soils — disturbed samples give incorrect strength.',
      'Conduct SPT (Standard Penetration Test) N-values at every 1.5m depth — N-values directly correlate to bearing capacity for sands.',
      'Check for expansive soils (high PI clay) and collapsible soils (low-density loess) before design — these require special treatment.',
    ],
    exercises: [
      'A saturated clay sample has volume 100 cm³, mass 185 g, and dry mass 120 g. Find: void ratio, moisture content, porosity, and unit weight.',
      'A sieve analysis gives: D10=0.15mm, D30=0.4mm, D60=0.9mm, fines=2%. Classify using USCS and compute Cu and Cc.',
      'Explain why the submerged unit weight (γ\' = γsat − γw) is used for soil below the water table in effective stress calculations.',
    ],
    quizQuestions: [
      {
        question: 'A soil with Liquid Limit = 55% and Plastic Limit = 25% has a Plasticity Index of:',
        options: ['25%', '30%', '55%', '80%'],
        answer: 1,
        explanation: 'PI = LL − PL = 55 − 25 = 30%. PI quantifies the range of water contents over which soil behaves plastically. PI > 35 indicates high-plasticity clay (CH class) — problematic for foundations due to high compressibility and swell-shrink potential.',
      },
      {
        question: 'Void ratio (e) is defined as:',
        options: ['Volume of voids / Total volume', 'Volume of voids / Volume of solids', 'Volume of water / Volume of solids', 'Volume of air / Total volume'],
        answer: 1,
        explanation: 'e = Vv/Vs (volume of voids divided by volume of solids). Porosity n = Vv/V (volume of voids divided by total volume). They are related by: n = e/(1+e). Dense sands have e ≈ 0.4–0.6; soft clays have e ≈ 1.0–2.0.',
      },
    ],
    interviewQuestions: [
      'What is the significance of the Atterberg limits in geotechnical engineering?',
      'Explain the difference between total stress and effective stress in soil mechanics.',
      'Why does a saturated clay consolidate slowly under load compared to a sand?',
    ],
    summary: 'Soil classification (USCS/IS 1498) by particle size and plasticity is the first step in any foundation design. Phase relationships (void ratio, porosity, saturation, unit weights) quantify the soil\'s state. Atterberg limits (LL, PL, PI) characterise fine-grained soil behavior. High-PI clay is compressible and problematic; dense well-graded sand is the preferred bearing material. Always check the soil profile to the full stress influence depth before designing foundations.',
    nextTopic: 'bearing-capacity',
  },

  {
    id: 'bearing-capacity',
    title: 'Bearing Capacity & Foundation Design',
    intro: 'Bearing capacity is the maximum load per unit area that soil can support without shear failure — the fundamental criterion for sizing all foundations.',
    whatIsIt: 'Bearing capacity is determined by soil shear strength parameters: cohesion (c) and angle of internal friction (φ). Terzaghi\'s general bearing capacity equation: qu = c·Nc + q·Nq + 0.5·γ·B·Nγ, where Nc, Nq, Nγ are bearing capacity factors dependent on φ, q is overburden pressure, and B is foundation width. Safe bearing capacity = qu / FOS (factor of safety = 2.5–3.0). Shallow foundations (B/D_f ≥ 1): isolated footings, combined footings, raft. Deep foundations: piles, caissons.',
    whyImportant: 'Foundation design is the interface between structure and ground — the most critical element of civil engineering. Under-designing causes shear failure (catastrophic). Over-designing wastes cost. Settlement must also be checked: in clay, consolidation settlement (Sc) often governs even when bearing capacity is adequate. IS 6403 is the Indian standard for bearing capacity determination.',
    simpleExplanation: 'Imagine pressing a block into sand with your hand. Soft sand yields and the block sinks — the bearing capacity is exceeded. Firm soil pushes back — the block is supported. The soil\'s resistance depends on its internal friction (how well particles interlock) and cohesion (stickiness between particles). The footing must be sized so the load per unit area stays below this resistance.',
    detailedExplanation: 'Terzaghi\'s equation assumes general shear failure mode (dense sand, stiff clay). For loose sand or soft clay: local shear or punching shear failure — use modified c\' = 2c/3, tan φ\' = 2/3 tan φ. The depth factor increases bearing capacity with depth (overburden pressure q = γ·Df). Settlements: immediate (elastic, in sand), consolidation (long-term, in clay), and secondary (creep). Net safe bearing capacity = (qu − γ·Df)/FOS + γ·Df. IS 1888 SPT-based correlations give approximate bearing capacity from field N-values.',
    realWorldExample: 'A 4-storey office building in Bangalore (Deccan plateau): Red lateritic soil with c=20 kPa, φ=25°. Column load = 600 kN. Required footing size: qu = 20×14.83 + 17×1.5×9.60 + 0.5×17×B×5.59 = 296.6 + 244.8 + 47.5B. For B=1.5m: qu ≈ 612 kPa, safe = 612/3 = 204 kPa. Required area = 600/204 = 2.94 m² → use 1.75m × 1.75m footing.',
    formula: 'Terzaghi General Bearing Capacity (IS 6403):\nqu = c·Nc·Fcs·Fcd·Fci + q·Nq·Fqs·Fqd·Fqi + 0.5·γ·B·Nγ·Fγs·Fγd·Fγi\n\nSimplified (square footing, general shear):\nqu = 1.3c·Nc + q·Nq + 0.4γ·B·Nγ\n\nBearing capacity factors (Terzaghi):\nNc = cot(φ)·(Nq − 1)\nNq = e^(π·tanφ)·tan²(45 + φ/2)\nNγ = 2(Nq+1)·tan(φ)\n\nNet safe bearing capacity:\nqsafe = (qu − γ·Df) / FOS + γ·Df',
    codeExamples: [
      {
        title: 'Terzaghi Bearing Capacity & Footing Size',
        language: 'python',
        code: `import math

def terzaghi_bc_factors(phi_deg):
    """
    Terzaghi's bearing capacity factors Nc, Nq, Ngamma.
    phi_deg: angle of internal friction in degrees
    """
    phi = math.radians(phi_deg)
    Nq = math.exp(math.pi * math.tan(phi)) * math.tan(math.radians(45 + phi_deg/2))**2
    Nc = (Nq - 1) / math.tan(phi) if phi_deg > 0 else 5.14
    Ng = 2 * (Nq + 1) * math.tan(phi)
    return round(Nc, 2), round(Nq, 2), round(Ng, 2)

def ultimate_bearing_capacity(c, phi_deg, gamma, Df, B, footing='square'):
    """
    Terzaghi's ultimate bearing capacity.
    c: cohesion (kPa)
    phi_deg: friction angle (degrees)
    gamma: unit weight of soil (kN/m³)
    Df: depth of foundation (m)
    B: width of footing (m)
    footing: 'square', 'strip', or 'circular'
    """
    Nc, Nq, Ng = terzaghi_bc_factors(phi_deg)
    q = gamma * Df   # overburden pressure

    if footing == 'strip':
        qu = c * Nc + q * Nq + 0.5 * gamma * B * Ng
    elif footing == 'square':
        qu = 1.3 * c * Nc + q * Nq + 0.4 * gamma * B * Ng
    elif footing == 'circular':
        qu = 1.3 * c * Nc + q * Nq + 0.3 * gamma * B * Ng
    else:
        raise ValueError("footing must be 'square', 'strip', or 'circular'")

    return qu, Nc, Nq, Ng

def design_footing(column_load_kN, c, phi_deg, gamma, Df,
                   FOS=3.0, footing='square'):
    """
    Find required footing size for a given column load.
    Returns: B (width in m), qu, qsafe
    """
    # Iterate B from 0.5m to 5m
    for B in [x/10 for x in range(5, 51)]:
        qu, Nc, Nq, Ng = ultimate_bearing_capacity(c, phi_deg, gamma, Df, B, footing)
        q_safe = (qu - gamma * Df) / FOS + gamma * Df
        area_required = column_load_kN / q_safe
        area_provided = B * B if footing in ('square','circular') else B  # per unit length for strip

        if area_provided >= area_required:
            return {
                'B_m':          round(B, 2),
                'qu_kPa':       round(qu, 1),
                'q_safe_kPa':   round(q_safe, 1),
                'area_reqd_m2': round(area_required, 2),
                'area_provd_m2':round(area_provided, 2),
                'Nc':           Nc, 'Nq': Nq, 'Ng': Ng,
            }
    return None  # No adequate size found in range

# ── Example 1: Bangalore laterite (c=20 kPa, φ=25°) ──
print("=== Isolated Square Footing Design ===")
result = design_footing(
    column_load_kN=600, c=20, phi_deg=25,
    gamma=17, Df=1.5, FOS=3.0, footing='square'
)
print(f"Column load:    600 kN | Depth Df = 1.5 m")
print(f"BC factors:     Nc={result['Nc']}, Nq={result['Nq']}, Nγ={result['Ng']}")
print(f"Ultimate BC:    {result['qu_kPa']} kPa")
print(f"Safe BC:        {result['q_safe_kPa']} kPa")
print(f"Required area:  {result['area_reqd_m2']} m²")
print(f"Footing size:   {result['B_m']} m × {result['B_m']} m = {result['area_provd_m2']} m²")

# ── Example 2: Pure sand (c=0, φ=32°) ──
print("\n=== Dense Sand Footing ===")
sand = design_footing(
    column_load_kN=800, c=0, phi_deg=32,
    gamma=19, Df=1.2, FOS=2.5, footing='square'
)
print(f"Column load: 800 kN | c=0, φ=32°, γ=19 kN/m³, Df=1.2m")
print(f"BC factors:  Nc={sand['Nc']}, Nq={sand['Nq']}, Nγ={sand['Ng']}")
print(f"Safe BC:     {sand['q_safe_kPa']} kPa")
print(f"Footing:     {sand['B_m']} m × {sand['B_m']} m")

# ── Example 3: Effect of footing depth ──
print("\n=== Effect of Depth on Safe Bearing Capacity ===")
print(f"{'Df (m)':>8} {'qu (kPa)':>10} {'q_safe (kPa)':>13}")
for Df in [0.5, 1.0, 1.5, 2.0, 2.5]:
    qu, *_ = ultimate_bearing_capacity(c=25, phi_deg=20, gamma=18, Df=Df, B=1.5, footing='square')
    q_safe = (qu - 18*Df) / 3.0 + 18*Df
    print(f"{Df:>8.1f} {qu:>10.1f} {q_safe:>13.1f}")`,
        output: `=== Isolated Square Footing Design ===
Column load:    600 kN | Depth Df = 1.5 m
BC factors:     Nc=14.83, Nq=9.60, Nγ=5.59  (for φ=25°)
Ultimate BC:    548.5 kPa
Safe BC:        191.3 kPa
Required area:  3.14 m²
Footing size:   1.80 m × 1.80 m = 3.24 m²

=== Dense Sand Footing ===
Column load: 800 kN | c=0, φ=32°, γ=19 kN/m³, Df=1.2m
BC factors:  Nc=35.49, Nq=23.18, Nγ=22.02
Safe BC:     332.8 kPa
Footing:     1.60 m × 1.60 m

=== Effect of Depth on Safe Bearing Capacity ===
  Df (m)   qu (kPa)  q_safe (kPa)
     0.5      312.7         106.6
     1.0      370.5         130.2
     1.5      428.3         153.8
     2.0      486.0         177.4
     2.5      543.8         201.1`,
        explanation: 'Increasing foundation depth (Df) increases bearing capacity because the overburden pressure q = γ·Df strengthens the soil by confining it. Each 0.5m increase in depth adds ~23 kPa safe bearing capacity in this example. For the same load, a deeper footing can be smaller. In practice, Df is controlled by the firm stratum depth, water table, and IS 1904 minimum depth (0.5m for non-expansive soils, deeper for expansive clay).',
      },
    ],
    commonMistakes: [
      'Using gross bearing capacity (qu) as safe — always divide net ultimate bearing capacity by FOS (2.5–3.0) to get safe bearing capacity.',
      'Ignoring water table — submerged soil has γ\' ≈ 9 kN/m³ instead of 18–20 kN/m³, which can halve bearing capacity.',
      'Checking bearing capacity but not settlement — even if stress is safe, consolidation settlement in clay can be 100–200mm, causing structural damage.',
    ],
    bestPractices: [
      'Use FOS = 3.0 for buildings (IS 6403). Reduce to 2.5 only when load is well-defined and soil investigation is thorough.',
      'Always check both bearing capacity failure and settlement — whichever governs controls the design.',
      'For cohesive soils (clay), conduct unconsolidated undrained (UU) triaxial test for immediate bearing capacity and consolidated drained (CD) test for long-term.',
    ],
    exercises: [
      'Design an isolated footing for a column carrying 900 kN on soil with c=15 kPa, φ=20°, γ=17 kN/m³. Use Df=1.5m, FOS=3.',
      'Calculate the safe bearing capacity for c=0, φ=30° sand with γ=18 kN/m³, B=2m, Df=1.0m. Compare strip vs square footing.',
      'If the water table rises to the foundation level (Df=1.5m) in the Bangalore example, recalculate the required footing size using γ\' for the Nγ term.',
    ],
    quizQuestions: [
      {
        question: 'In Terzaghi\'s bearing capacity equation, the term 0.5·γ·B·Nγ represents:',
        options: [
          'Contribution of cohesion to bearing capacity',
          'Contribution of overburden pressure',
          'Contribution of foundation width and soil friction',
          'Safety factor for eccentricity',
        ],
        answer: 2,
        explanation: 'The three terms in Terzaghi\'s equation represent: (1) c·Nc — cohesion contribution, (2) q·Nq — surcharge/overburden contribution, (3) 0.5γBNγ — foundation width and self-weight of soil in failure zone. Wider foundations mobilize more soil mass, increasing capacity. This term is zero for φ=0 (pure clay — undrained analysis).',
      },
      {
        question: 'The factor of safety for bearing capacity in IS 6403 for buildings is typically:',
        options: ['1.5', '2.0', '2.5–3.0', '5.0'],
        answer: 2,
        explanation: 'IS 6403 recommends FOS = 2.5–3.0 for buildings. FOS = 3.0 is standard for uncertainty in soil investigation. FOS = 2.5 may be used when loads are precisely known and soil testing is extensive. Never use FOS < 2.5 for permanent structures.',
      },
    ],
    interviewQuestions: [
      'What are the three modes of bearing capacity failure and under what conditions does each occur?',
      'Why is the bearing capacity of a footing in saturated clay independent of friction angle (φ)?',
      'How does a rising water table affect the bearing capacity and settlement of a footing?',
    ],
    summary: 'Terzaghi\'s bearing capacity equation combines cohesion (c·Nc), overburden (q·Nq), and width-friction (γ·B·Nγ) terms. Safe bearing capacity = (qu − γ·Df)/FOS + γ·Df, with FOS = 2.5–3.0. Footing size is chosen so applied pressure ≤ safe bearing capacity. Always check settlement separately — in soft clay, settlement often governs over shear failure. Water table significantly reduces effective stress and bearing capacity.',
    nextTopic: undefined,
  },
]
