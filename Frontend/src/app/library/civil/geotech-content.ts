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
        title: 'Worked Example — Soil Phase Relationships & USCS Classification',
        language: 'IS 1498 / USCS',
        kind: 'worked-example',
        code: `PHASE-RELATIONSHIP FUNDAMENTALS
────────────────────────────────
Volumes:   V = V_a + V_w + V_s    (air + water + solids)
Weights:   W = W_w + W_s          (weightless air)

    Void ratio      e = V_v / V_s
    Porosity        n = V_v / V     ⇒   n = e / (1 + e)
    Saturation      S = V_w / V_v
    Water content   w = W_w / W_s
    Fundamental identity:   S·e = w·Gs

Unit-weight family  (γ_w = 9.81 kN/m³)
    γ_d    = Gs · γ_w / (1 + e)                dry
    γ_sat  = (Gs + e) · γ_w / (1 + e)          saturated
    γ_sub  = γ_sat − γ_w                       submerged
    γ_bulk = (Gs + S·e) · γ_w / (1 + e)        bulk

────────────────────────────────────────────────
CASE 1 — Dense sand at bearing depth
    Given:  Gs = 2.67,   w = 18 %,   S = 85 %
    e = w · Gs / S = 0.18 · 2.67 / 0.85 = 0.5647
    n = 0.5647 / 1.5647       = 36.1 %
    γ_d    = 2.67 · 9.81 / 1.5647     ≈ 16.97 kN/m³
    γ_bulk = (2.67 + 0.85·0.5647) · 9.81 / 1.5647 ≈ 19.02 kN/m³
    γ_sat  = (2.67 + 0.5647) · 9.81 / 1.5647      ≈ 19.97 kN/m³

CASE 2 — Soft marine clay (saturated)
    Given:  Gs = 2.70,   w = 52 %,   S = 100 %  ⇒  e = w·Gs = 1.404
                                                 (use e = 1.4)
    n = 1.4/2.4      = 58.3 %
    γ_d   = 2.70 · 9.81 / 2.4     ≈ 11.09 kN/m³
    γ_sat = (2.70 + 1.4) · 9.81 / 2.4 ≈ 16.87 kN/m³
    γ_sub = 16.87 − 9.81           =  7.06 kN/m³

USCS CLASSIFICATION  (IS 1498)
    Coarse-grained if fines (<75 µm) ≤ 50 %
        Cu = D₆₀ / D₁₀            (uniformity)
        Cc = D₃₀² / (D₆₀·D₁₀)     (curvature)
        Well-graded sand:  Cu ≥ 6  AND  1 ≤ Cc ≤ 3

┌────────────────────────┬───────┬──────┬───────────────┐
│  Sample                │  Cu   │  Cc  │  Class        │
├────────────────────────┼───────┼──────┼───────────────┤
│ River sand D₁₀=0.2, D₃₀=0.6, D₆₀=1.5 │ 7.5 │ 1.20 │ SW (well-graded sand) │
│ Gravel D₁₀=2, D₃₀=8, D₆₀=15          │ 7.5 │ 2.13 │ GW (well-graded gravel) │
│ Chennai marine clay  LL=68, PL=28    │  —  │  —   │ CH (fat clay, PI=40)  │
└────────────────────────┴───────┴──────┴───────────────┘`,
        output: `Dense sand   e = 0.56,  γ_d ≈ 17.0 kN/m³,  γ_bulk ≈ 19.0 kN/m³
Marine clay  e = 1.40,  γ_d ≈ 11.1 kN/m³,  γ_sat ≈ 16.9 kN/m³
Classes:  river sand → SW,  gravel → GW,  Chennai clay → CH (fat clay)`,
        explanation: 'The identity S·e = w·Gs lets you close the phase diagram from any two of {w, e, S} — this is what geotech interviews test. Marine clay with e = 1.4 has ~58 % voids and 100 % saturation, so it will consolidate heavily under load and long-term. Dense sand has ~36 % voids and is a stiff bearing stratum. CH classification (LL = 68) flags the Chennai clay as high-plasticity — treat as an unfavourable foundation and choose piles or ground improvement.',
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
        title: 'Worked Example — Terzaghi Bearing Capacity & Footing Sizing',
        language: 'IS 6403 / Terzaghi',
        kind: 'worked-example',
        code: `BEARING-CAPACITY FACTORS  (Terzaghi, general shear)
──────────────────────────────────────────────────
    Nq = e^(π tan φ) · tan²(45 + φ/2)
    Nc = cot φ · (Nq − 1)                 (or 5.14 if φ = 0)
    Nγ = 2 (Nq + 1) · tan φ

┌────────┬──────────┬──────────┬──────────┐
│  φ°    │   N_c    │   N_q    │   N_γ    │
├────────┼──────────┼──────────┼──────────┤
│  20    │  14.83   │   6.40   │   3.64   │
│  25    │  20.72   │  10.66   │  10.88   │
│  30    │  30.14   │  18.40   │  22.40   │
│  32    │  35.49   │  23.18   │  30.22   │
│  35    │  46.12   │  33.30   │  48.03   │
└────────┴──────────┴──────────┴──────────┘

TERZAGHI EQUATION — SQUARE FOOTING
    q_u = 1.3 c N_c + q̄ N_q + 0.4 γ B N_γ           (q̄ = γ · D_f)

────────────────────────────────────────────────
CASE 1 — Bangalore laterite (c = 20 kPa, φ = 25°, γ = 17 kN/m³)
    Column load       P = 600 kN
    Depth of footing  D_f = 1.5 m,   FOS = 3.0

    Overburden        q̄ = 17 · 1.5 = 25.5 kPa
    Try  B = 1.80 m:
        q_u = 1.3·20·20.72 + 25.5·10.66 + 0.4·17·1.80·10.88
            = 538.7 + 271.8 + 133.2
            = 943.7 kPa   (rounded 944)   *note: revised factors*
    Net safe:
        q_safe = (q_u − q̄)/FOS + q̄
               = (944 − 25.5)/3 + 25.5
               ≈ 331 kPa
    Area required = P / q_safe = 600 / 331 ≈ 1.81 m²
    Provided       = 1.80 · 1.80 = 3.24 m²  ✓

CASE 2 — Dense sand  (c = 0,  φ = 32°,  γ = 19 kN/m³)
    P = 800 kN,  D_f = 1.2 m,  FOS = 2.5
    q̄ = 22.8 kPa
    Try B = 1.60 m:
        q_u = 0 + 22.8·23.18 + 0.4·19·1.6·30.22
            = 528.5 + 367.5
            ≈ 896 kPa
    q_safe = (896 − 22.8)/2.5 + 22.8 ≈ 372 kPa
    Area req = 800/372 ≈ 2.15 m² > 1.60² = 2.56 m² ✓

CASE 3 — Effect of embedment depth  (c = 25 kPa, φ = 20°, γ = 18 kN/m³, B = 1.5 m)
┌────────┬────────────┬────────────────┐
│ D_f m  │ q_u (kPa)  │ q_safe (kPa)   │
├────────┼────────────┼────────────────┤
│  0.5   │   312.7    │   106.6        │
│  1.0   │   370.5    │   130.2        │
│  1.5   │   428.3    │   153.8        │
│  2.0   │   486.0    │   177.4        │
│  2.5   │   543.8    │   201.1        │
└────────┴────────────┴────────────────┘
    Each +0.5 m of embedment ⇒ +≈ 24 kPa of safe bearing
    (from the q̄ N_q "surcharge" term).`,
        output: `Bangalore laterite   B = 1.80 m square,  q_safe ≈ 331 kPa
Dense sand           B = 1.60 m square,  q_safe ≈ 372 kPa
Depth study:  every 0.5 m of embedment adds ~24 kPa of safe capacity`,
        explanation: 'Terzaghi splits bearing capacity into three additive contributions: cohesion (c N_c), overburden (q̄ N_q), and self-weight (0.5 γ B N_γ). Squares and circles get shape factors (1.3 and 0.4 respectively). Always divide the NET ultimate capacity by FOS and add back the overburden — never divide gross q_u by FOS. Deeper footings gain capacity through the q̄ term; if a water table sits at foundation level, γ drops to γ′ ≈ 9 kN/m³ and the N_γ term nearly halves — always check the WT depth before committing to B.',
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
