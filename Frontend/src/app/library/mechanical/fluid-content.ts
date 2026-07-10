import type { TopicLesson } from '../_shared/types'

export const fluidLessons: TopicLesson[] = [
  {
    id: 'fluid-properties',
    title: 'Fluid Properties',
    intro: 'Understanding fluid properties — density, viscosity, pressure, and compressibility — is the foundation of all fluid mechanics analysis.',
    whatIsIt: 'A fluid is a substance that deforms continuously under any applied shear stress. Both liquids and gases are fluids. Key properties: Density (ρ, kg/m³), Dynamic viscosity (μ, Pa·s), Kinematic viscosity (ν = μ/ρ, m²/s), Pressure (P, Pa), Bulk modulus (K, measure of compressibility), Surface tension (σ, N/m).',
    whyImportant: 'Every fluid mechanics calculation — pipe flow, airfoil lift, pump sizing, weather prediction — requires accurate fluid properties. Density determines hydrostatic pressure and inertial forces. Viscosity determines friction losses. Understanding these properties is the prerequisite for all fluid engineering.',
    simpleExplanation: 'Honey is thick (high viscosity) — it resists flow. Water is thin (low viscosity). Gases are compressible (density changes with pressure); liquids are nearly incompressible. These differences completely change how we analyze fluid behavior in pipes, pumps, and airfoils.',
    detailedExplanation: 'Viscosity causes the "no-slip condition" — fluid velocity is zero at solid walls. This creates velocity gradients and shear stress. Newton\'s Law of Viscosity: τ = μ(du/dy). Fluids that obey this are Newtonian (water, air, oil). Non-Newtonian fluids (blood, ketchup, polymer solutions) have viscosity that changes with shear rate. Kinematic viscosity ν = μ/ρ appears in dimensionless numbers (Reynolds number: Re = ρVD/μ = VD/ν).',
    realWorldExample: 'Motor oil viscosity is specified by SAE grades (e.g., 5W-30). At cold temperatures, low viscosity (5W) allows easy engine start. At operating temperature, higher viscosity (30) maintains adequate lubrication film thickness. Multi-grade oils use viscosity modifiers to achieve this temperature-dependent behavior.',
    formula: 'Newton\'s Law of Viscosity:\nτ = μ · (du/dy)   [Pa]\nwhere τ = shear stress, μ = dynamic viscosity, du/dy = velocity gradient\n\nKinematic viscosity: ν = μ/ρ   [m²/s]\n\nDensity of ideal gas: ρ = P/(RT)   [kg/m³]\nwhere R = specific gas constant\n\nReynolds Number: Re = ρVD/μ = VD/ν\nRe < 2300: laminar flow\nRe > 4000: turbulent flow',
    codeExamples: [
      {
        title: 'Worked Example — Reynolds Number & Transition Velocities',
        language: 'SI units',
        kind: 'worked-example',
        code: `FLUID PROPERTIES (20 °C, 1 atm)
─────────────────────────────────
Water:  ρ = 998.2  kg/m³,   μ = 1.002 × 10⁻³ Pa·s
        ν = μ/ρ    = 1.004 × 10⁻⁶ m²/s
Air:    ρ = P/(RT) = 101 325 / (287 · 293.15) = 1.204 kg/m³
        μ = 1.81  × 10⁻⁵ Pa·s
        ν = 1.503 × 10⁻⁵ m²/s     (~15× water)

PROBLEM
────────
Water flows at V = 2.0 m/s through a D = 50 mm smooth pipe.
(a) Classify the flow regime.
(b) Find the transition velocities for the same pipe.

REYNOLDS NUMBER
    Re = ρ V D / μ
       = (998.2)(2.0)(0.050) / (1.002 × 10⁻³)
       = 99 621
    Re ≈ 1.0 × 10⁵   ⇒   TURBULENT   (Re > 4000)

TRANSITION VELOCITIES  (V = Re · ν / D)
    V_laminar-limit    = 2300 · 1.004e-6 / 0.050 ≈ 0.046 m/s
    V_turbulent-onset  = 4000 · 1.004e-6 / 0.050 ≈ 0.080 m/s
    2300 < Re < 4000 is the transitional zone.

TAKEAWAY
    Domestic water lines (typ. V ≈ 1–3 m/s) are always turbulent.
    Laminar water flow in a 50 mm pipe would require V < 5 cm/s.`,
        output: `Re ≈ 99 600  (Turbulent)
V_laminar   < 0.046 m/s
V_turbulent > 0.080 m/s`,
        explanation: 'Re = ρVD/μ is a dimensionless ratio of inertial to viscous forces. Below 2300 viscous forces dominate (laminar); above 4000 inertial forces win (turbulent). Because water has such low kinematic viscosity, any practical piping velocity puts water into the turbulent regime — laminar water flow only shows up in capillary and micro-channel systems.',
      },
    ],
    commonMistakes: [
      'Confusing dynamic viscosity μ and kinematic viscosity ν = μ/ρ — check units: Pa·s vs m²/s.',
      'Using °C instead of K in ideal gas density calculations.',
      'Assuming all fluids are Newtonian — blood, concrete, and many polymers are non-Newtonian.',
    ],
    bestPractices: [
      'Look up actual fluid properties from tables — do not rely on approximations for engineering calculations.',
      'Calculate Re before choosing a friction factor model — laminar and turbulent use different equations.',
      'For gases, check if Ma < 0.3 (incompressible assumption) before using incompressible flow equations.',
    ],
    exercises: [
      'Calculate the Reynolds number for oil (ρ=900 kg/m³, μ=0.1 Pa·s) flowing at 0.5 m/s in a 25mm pipe. Is it laminar or turbulent?',
      'Air at 80°C and 200 kPa flows at 30 m/s over a flat plate of length 0.5 m. Calculate Re_L.',
      'What is the shear stress in water flowing with du/dy = 1000 s⁻¹? (μ_water = 1×10⁻³ Pa·s)',
    ],
    quizQuestions: [
      {
        question: 'Flow in a pipe is typically laminar when the Reynolds number is:',
        options: ['Re > 4000', 'Re < 2300', '2300 < Re < 4000', 'Re > 10000'],
        answer: 1,
        explanation: 'For pipe flow, Re < 2300 is laminar. Between 2300 and 4000 is the transition zone. Above 4000 is fully turbulent.',
      },
      {
        question: 'Kinematic viscosity ν is related to dynamic viscosity μ by:',
        options: ['ν = μ·ρ', 'ν = μ/ρ', 'ν = ρ/μ', 'ν = μ + ρ'],
        answer: 1,
        explanation: 'ν = μ/ρ. Kinematic viscosity is the dynamic viscosity divided by density. It appears in the Reynolds number as Re = VD/ν.',
      },
    ],
    interviewQuestions: [
      'What is the physical meaning of viscosity? How does it affect engineering system design?',
      'Why does the Reynolds number determine whether flow is laminar or turbulent?',
      'Explain the no-slip condition and its consequences for velocity profiles in pipe flow.',
    ],
    summary: 'Fluid properties — density, viscosity, and compressibility — determine how fluids behave in engineering systems. The Reynolds number (Re = ρVD/μ) classifies flow as laminar (Re<2300) or turbulent (Re>4000). Always use absolute temperature for gas property calculations.',
    nextTopic: 'bernoulli-equation',
  },

  {
    id: 'bernoulli-equation',
    title: "Bernoulli's Equation",
    intro: "Bernoulli's equation relates pressure, velocity, and elevation along a streamline in steady, incompressible, inviscid flow.",
    whatIsIt: "Bernoulli's equation is a statement of energy conservation for ideal fluid flow along a streamline: P + ½ρV² + ρgz = constant. The three terms represent pressure energy, kinetic energy, and potential energy per unit volume. Where velocity increases, pressure decreases, and vice versa.",
    whyImportant: "Bernoulli's principle explains lift on aircraft wings, the operation of carburetors and venturi meters, the spray from a garden hose nozzle, and how atomizers work. It is the most widely applied equation in fluid mechanics — though its simplifying assumptions (inviscid, incompressible, steady, along a streamline) must always be checked.",
    simpleExplanation: "Squeeze a garden hose nozzle — the water speeds up and comes out as a high-velocity jet. Where the nozzle narrows, velocity increases (continuity equation) and pressure drops (Bernoulli's equation). The total energy stays the same — it just redistributes between pressure and kinetic energy.",
    detailedExplanation: "Bernoulli's equation is derived from Newton's second law along a streamline or from the steady-flow energy equation with no heat transfer, no work, and no friction. Limitations: (1) Must be inviscid (no viscosity) — approximately valid far from walls. (2) Incompressible — valid for liquids and low-speed gases (Ma < 0.3). (3) Steady flow — not for unsteady pulsating flows. (4) Along a streamline — pressures at different streamlines cannot be compared without further analysis.",
    realWorldExample: "Venturi meter — used to measure flow rate in pipelines. A constriction accelerates the flow, reducing pressure. Measuring the pressure difference between the wide section and narrow section gives the flow velocity via Bernoulli's equation. Simple, reliable, no moving parts.",
    formula: "Bernoulli's Equation (along streamline):\nP₁ + ½ρV₁² + ρgz₁ = P₂ + ½ρV₂² + ρgz₂ = const\n\nFor horizontal flow (z₁=z₂):\nP₁ + ½ρV₁² = P₂ + ½ρV₂²\n\nContinuity Equation (incompressible):\nA₁V₁ = A₂V₂  (Q = AV = constant)\n\nVenturi flow rate:\nQ = A₂√(2ΔP / (ρ(1-(A₂/A₁)²)))",
    codeExamples: [
      {
        title: 'Worked Example — Venturi Meter + Pitot-Static Tube',
        language: 'SI units',
        kind: 'worked-example',
        code: `PROBLEM 1 — Venturi flow meter (water)
──────────────────────────────────────
Given:  D₁ = 100 mm (upstream),  D₂ = 50 mm (throat)
        ρ = 1000 kg/m³,          ΔP = 15 kPa
        Discharge coefficient  C_d = 0.98

Step 1  Areas
    A₁ = π/4 · (0.10)² = 7.854 × 10⁻³ m²
    A₂ = π/4 · (0.05)² = 1.963 × 10⁻³ m²
    Area ratio (A₂/A₁)² = (0.25)² = 0.0625

Step 2  Ideal flow rate (Bernoulli + Continuity)
    Q_ideal = A₂ · √{ 2 ΔP / [ ρ (1 − (A₂/A₁)²) ] }
            = 1.963e-3 · √{ 2·15000 / [ 1000·(1 − 0.0625) ] }
            = 1.963e-3 · √{ 30 000 / 937.5 }
            = 1.963e-3 · 5.657
            = 0.01111 m³/s

Step 3  Actual flow
    Q = C_d · Q_ideal = 0.98 · 0.01111 = 0.01089 m³/s
      ≈ 10.89 L/s

Step 4  Velocities
    V₁ = Q/A₁ = 0.01089 / 7.854e-3 = 1.39 m/s
    V₂ = Q/A₂ = 0.01089 / 1.963e-3 = 5.55 m/s   ( 4× V₁, as continuity demands )

PROBLEM 2 — Pitot-static tube (aircraft, sea level)
────────────────────────────────────────────────────
Given:  P_static = 101 325 Pa,  P_total = 102 525 Pa
        Dynamic pressure  q = P_total − P_static = 1200 Pa
        ρ_air = 1.225 kg/m³

By Bernoulli at a stagnation point:
    V = √(2 q / ρ)
      = √(2 · 1200 / 1.225)
      = √1959.2
      = 44.3 m/s
      ≈ 159 km/h`,
        output: `Venturi:      Q ≈ 10.89 L/s   V₁ = 1.39 m/s   V₂ = 5.55 m/s
Pitot tube:   V ≈ 44.3 m/s (~ 159 km/h)`,
        explanation: 'The venturi uses the pressure drop caused by acceleration (V₂ = 4V₁ because area shrinks by 4). C_d ≈ 0.98 accounts for small viscous losses. The pitot tube converts kinetic energy to a stagnation pressure rise — solving Bernoulli backwards gives airspeed from a differential pressure gauge.',
      },
    ],
    commonMistakes: [
      'Applying Bernoulli\'s equation across different streamlines — only valid along ONE streamline.',
      'Using Bernoulli\'s for high-speed compressible flow (Ma > 0.3) — must use compressible flow equations.',
      'Ignoring the continuity equation — A₁V₁ = A₂V₂ must be used along with Bernoulli\'s.',
    ],
    bestPractices: [
      'Always apply continuity first (find V₁ and V₂), then Bernoulli (find P₁ − P₂).',
      'Check assumptions: steady, incompressible, inviscid, along a streamline.',
      'For real flows with friction losses, use the modified Bernoulli with a head-loss term: hf = friction loss.',
    ],
    exercises: [
      'Water flows from a large reservoir through a horizontal pipe (D=0.03m) at 5 m/s. The pipe narrows to D=0.02m. Find the pressure difference.',
      'A pitot-static tube reads a pressure difference of 500 Pa in air (ρ=1.2 kg/m³). Find the airspeed.',
      'Water drains from a tank 3m above the pipe outlet. Calculate exit velocity (neglect losses).',
    ],
    quizQuestions: [
      {
        question: "In Bernoulli's equation, when flow velocity increases, pressure:",
        options: ['Increases', 'Stays constant', 'Decreases', 'Depends on fluid type'],
        answer: 2,
        explanation: "Bernoulli's equation: P + ½ρV² = const. If V increases, ½ρV² increases, so P must decrease to maintain the constant sum.",
      },
      {
        question: "Bernoulli's equation is NOT valid for:",
        options: ['Steady flow', 'Incompressible flow', 'Viscous (real) flow with friction', 'Flow along a streamline'],
        answer: 2,
        explanation: "Bernoulli's equation assumes inviscid (frictionless) flow. Viscous friction converts mechanical energy to heat, violating the conservation principle the equation is based on. Use the modified Bernoulli with head-loss terms for real flows.",
      },
    ],
    interviewQuestions: [
      "Derive Bernoulli's equation from the work-energy theorem applied to a fluid particle.",
      "Explain how an aircraft wing generates lift using Bernoulli's principle.",
      "What are the limitations of Bernoulli's equation and how do you account for friction losses in pipe flow?",
    ],
    summary: "Bernoulli's equation (P + ½ρV² + ρgz = const) is energy conservation for ideal fluid flow. Speed up → pressure drops. Use with the continuity equation (AV = const) to solve nozzle, venturi, and pipe flow problems. Always check the assumptions: steady, incompressible, inviscid, streamline.",
    nextTopic: 'pipe-flow',
  },

  {
    id: 'pipe-flow',
    title: 'Pipe Flow & Head Losses',
    intro: 'Real pipe flow involves friction and minor losses that reduce pressure along the flow path — quantified by the Darcy-Weisbach equation.',
    whatIsIt: 'In real pipe systems, viscous friction between the fluid and the pipe wall converts kinetic energy to heat (entropy generation). The pressure drop due to friction is the major loss. Additional pressure drops occur at valves, bends, expansions, and contractions — these are minor losses. The Darcy-Weisbach equation relates pressure drop to flow velocity, pipe dimensions, and the Darcy friction factor f.',
    whyImportant: 'Every piping system — water supply networks, oil pipelines, HVAC, chemical plants — must account for head losses to size pumps correctly and ensure adequate flow rates. Underestimating losses leads to insufficient flow; overestimating leads to oversized, expensive pumps.',
    simpleExplanation: 'Pressure in a pipe is like water in a tilted tube. Friction is like resistance that drains pressure as the fluid moves along. By the time water reaches the far end of a long pipe, some pressure has been "used up" overcoming friction. A pump adds pressure to compensate.',
    detailedExplanation: 'Darcy-Weisbach equation: hf = f(L/D)(V²/2g). The Darcy friction factor f depends on Re and pipe roughness ε/D: (1) Laminar flow (Re<2300): f = 64/Re. (2) Turbulent smooth pipe: Blasius equation f = 0.316 Re⁻⁰·²⁵ (valid Re < 100,000). (3) Turbulent rough pipe: Colebrook-White or Moody chart. Minor losses: hm = K_L(V²/2g). K_L values: elbow ~0.3-1.5, gate valve (open) ~0.2, ball valve (open) ~0.05, sudden expansion ~(1−A₁/A₂)².',
    realWorldExample: 'A municipal water distribution system must overcome: (1) elevation head (pump water to hilltop neighborhoods), (2) friction head loss in km of pipes, (3) minor losses at valves and fittings. Hydraulic engineers use pipe network analysis to size pumps and pipes for each zone.',
    formula: 'Darcy-Weisbach:\nhf = f · (L/D) · V²/(2g)   [m of head]\nΔP = f · (L/D) · ρV²/2    [Pa]\n\nFriction factor:\nLaminar: f = 64/Re\nTurbulent (Blasius): f = 0.316/Re^0.25  (Re < 10⁵)\nColebrook-White:\n1/√f = -2 log(ε/(3.7D) + 2.51/(Re√f))\n\nMinor loss:\nhm = K_L · V²/(2g)',
    codeExamples: [
      {
        title: 'Worked Example — Head Loss & Pump Power (Commercial Steel Pipe)',
        language: 'SI units',
        kind: 'worked-example',
        code: `PIPE SYSTEM
────────────
Fluid:  Water at 20 °C   (ρ = 998 kg/m³,  ν = 1.004×10⁻⁶ m²/s)
Pipe:   D = 50 mm,  L = 100 m,  ε = 0.046 mm  (commercial steel)
Flow:   Q = 3 L/s = 3 × 10⁻³ m³/s
Fittings: 2 × 90° elbow  (K_L = 0.9 each),  1 × gate valve  (K_L = 0.2)
g = 9.81 m/s²

STEP 1 — Velocity
    A = π/4 · D² = π/4 · (0.05)² = 1.963 × 10⁻³ m²
    V = Q / A = 3e-3 / 1.963e-3 = 1.53 m/s

STEP 2 — Reynolds number
    Re = V D / ν = 1.53 · 0.05 / 1.004e-6 ≈ 76 090   ( turbulent )

STEP 3 — Relative roughness & friction factor (Swamee-Jain)
    ε/D = 0.046 / 50 = 9.2 × 10⁻⁴
    f = 0.25 / [ log₁₀( ε/(3.7D) + 5.74/Re^0.9 ) ]²
      ≈ 0.0227    ( Moody chart, turbulent rough region )

STEP 4 — Major (friction) head loss  (Darcy-Weisbach)
    h_f = f · (L/D) · V² / (2g)
        = 0.0227 · (100/0.05) · (1.53)² / (2·9.81)
        = 0.0227 · 2000 · 0.1193
        ≈ 5.40 m of water

STEP 5 — Minor (fitting) head loss
    ΣK_L = 2·0.9 + 0.2 = 2.0
    h_m = ΣK_L · V² / (2g)
        = 2.0 · (1.53)² / (2·9.81)
        ≈ 0.24 m

STEP 6 — Total head & hydraulic pump power
    H_total = h_f + h_m = 5.40 + 0.24 = 5.64 m
    P_hyd   = ρ g Q H  = 998 · 9.81 · 3e-3 · 5.64
            ≈ 166 W   (before pump efficiency)

MINOR-LOSS SHARE
    h_m / (h_f + h_m) = 0.24 / 5.64 ≈ 4.3 %`,
        output: `Re ≈ 76 090   (Turbulent)
f  ≈ 0.0227
Major loss  h_f ≈ 5.40 m
Minor loss  h_m ≈ 0.24 m   (~4.3 % of total)
Total H     = 5.64 m
Pump power  ≈ 0.166 kW  (hydraulic; divide by η_pump for shaft)`,
        explanation: 'For long pipes the Darcy-Weisbach term (h_f) dominates because it scales with L/D. Minor losses matter more for short pipes with many fittings (e.g. HVAC coils). Note that h_f scales with V² — cutting the pipe diameter in half at fixed Q makes V four times larger and h_f rises by roughly a factor of 30, which is why upsizing pipe is often cheaper than upsizing the pump.',
      },
    ],
    commonMistakes: [
      'Using Blasius formula outside its valid range (Re > 10⁵) — use Colebrook-White or Swamee-Jain instead.',
      'Expressing head loss in Pa instead of meters of head — be consistent with units.',
      'Neglecting minor losses in long pipelines — they are small but important at high flow rates.',
    ],
    bestPractices: [
      'Always calculate Reynolds number first to choose the correct friction factor formula.',
      'For pipe network analysis, iterate between assumed flow distribution and calculated head losses.',
      'Add a safety factor (10-20%) to pump head requirements to account for aging pipes (increased roughness).',
    ],
    exercises: [
      'Water flows at 2 m/s in a 100m long smooth pipe (D=0.03m). Calculate friction head loss and pressure drop.',
      'A pump must supply 10 L/s through 200m of 0.06m pipe (ε/D = 0.001). Find required pump head.',
      'Compare friction factors for Re=1000, Re=10,000, and Re=100,000 in a smooth pipe.',
    ],
    quizQuestions: [
      {
        question: 'In laminar pipe flow, the Darcy friction factor is:',
        options: ['0.316/Re^0.25', '64/Re', 'Constant at 0.02', 'Depends only on roughness'],
        answer: 1,
        explanation: 'For laminar flow (Re<2300), f = 64/Re — derived analytically from the Hagen-Poiseuille equation. It is independent of pipe roughness.',
      },
      {
        question: 'Head loss due to pipe friction scales with velocity as:',
        options: ['V', 'V²', '√V', '1/V'],
        answer: 1,
        explanation: 'hf = f(L/D)V²/(2g). Head loss scales with V². Doubling flow velocity quadruples friction head loss.',
      },
    ],
    interviewQuestions: [
      'Explain the Darcy-Weisbach equation and its component terms.',
      'How does pipe roughness affect friction losses at different Reynolds numbers?',
      'In a parallel pipe system, what is the relationship between flow rates and head losses in each branch?',
    ],
    summary: 'Real pipe flow loses pressure to friction (major losses, Darcy-Weisbach) and fittings (minor losses, K_L factors). Friction factor depends on Re and roughness: laminar f=64/Re, turbulent uses Colebrook-White or the Moody chart. Head loss scales with V², so small velocity increases cause large pressure drops.',
    nextTopic: 'pumps-turbines',
  },

  {
    id: 'pumps-turbines',
    title: 'Pumps & Turbines',
    intro: 'Pumps add energy to fluids; turbines extract energy from fluids — both are analyzed using head, power, and efficiency.',
    whatIsIt: 'A pump is a device that adds mechanical energy to a fluid, increasing its pressure, velocity, or elevation. A turbine extracts energy from a fluid (water, steam, air), converting it to mechanical work. Both are characterized by: head (H, m), flow rate (Q, m³/s), power (P, W), and efficiency (η = actual/ideal).',
    whyImportant: 'Pumps and turbines are among the most common and critical machines in industry: water supply, oil pipelines, power generation, chemical processing, aerospace propulsion. Selecting the right pump (centrifugal vs positive displacement) and sizing it to the system curve ensures efficient, reliable operation.',
    simpleExplanation: 'A pump is like a mechanical heart — it adds pressure to push fluid through a circuit. A turbine is the reverse — fluid pressure spins a wheel to extract energy. The efficiency tells you what fraction of input energy becomes useful output; the rest becomes heat.',
    detailedExplanation: 'Pump classifications: (1) Centrifugal pumps — most common, use rotating impeller, suitable for high flow / moderate head, performance described by pump curve (H vs Q). (2) Positive displacement pumps — gear, piston, peristaltic — suitable for high-pressure / low-flow, constant flow regardless of back-pressure. Turbine types: (1) Reaction (Francis, Kaplan) — pressure drops across rotor. (2) Impulse (Pelton) — pressure converts to velocity in nozzle, rotor captures kinetic energy.',
    realWorldExample: 'Hoover Dam uses Francis turbines (reaction turbines). Water at high head (180m) flows through spiral casings, through wicket gates, past the rotating runner, and exits axially. Each turbine generates up to 130 MW. The generator efficiency is ~92%, runner efficiency ~94%, giving overall ~86%.',
    formula: 'Pump hydraulic power:\nP_hydraulic = ρ·g·Q·H   [W]\n\nPump efficiency:\nη_pump = P_hydraulic / P_shaft = (ρgQH) / (τω)\n\nSpecific speed (dimensionless):\nNs = N·Q^0.5 / H^0.75\nLow Ns → centrifugal, High Ns → axial/propeller\n\nAffinity Laws (same pump, different speed):\nQ₂/Q₁ = N₂/N₁\nH₂/H₁ = (N₂/N₁)²\nP₂/P₁ = (N₂/N₁)³',
    codeExamples: [
      {
        title: 'Worked Example — Pump Sizing + Affinity Laws (Speed Change)',
        language: 'SI units',
        kind: 'worked-example',
        code: `DUTY POINT
───────────
Deliver Q = 50 L/s to a reservoir H_static = 30 m above suction.
Pipe & fitting losses at design flow:  h_f = 8.5 m,  h_m = 2.1 m
Water: ρ = 1000 kg/m³,  g = 9.81 m/s²
Assume overall pump efficiency η_p = 0.78

STEP 1 — Total dynamic head (TDH)
    H = H_static + h_f + h_m = 30 + 8.5 + 2.1 = 40.6 m

STEP 2 — Hydraulic power (energy delivered to water)
    P_hyd = ρ g Q H
          = 1000 · 9.81 · 0.050 · 40.6
          = 19 914 W
          ≈ 19.9 kW

STEP 3 — Shaft power (motor rating)
    P_shaft = P_hyd / η_p
            = 19.9 / 0.78
            ≈ 25.5 kW   → specify a 30 kW motor (next-standard-size)

────────────────────────────────────────────────────────────
AFFINITY LAWS  — same pump, slow it down from 1450 to 1160 RPM
    Speed ratio  k = N₂/N₁ = 1160/1450 = 0.80  (80 %)

        Q₂ = Q₁ · k     = 50 · 0.80        = 40.0 L/s
        H₂ = H₁ · k²    = 40.6 · (0.80)²   ≈ 26.0 m
        P₂ = P₁ · k³    = 25.5 · (0.80)³   ≈ 13.1 kW

ENERGY IMPACT
    80 % speed  →  20 % less flow, 36 % less head, but ~49 % less power.
    This cubic power law is why VFDs pay back so quickly in
    variable-demand systems (HVAC secondary loops, wastewater lift stations).`,
        output: `TDH = 40.6 m
Hydraulic power  ≈ 19.9 kW
Shaft power       ≈ 25.5 kW (spec 30 kW motor)

At 80 % speed:  Q = 40 L/s,  H ≈ 26 m,  P ≈ 13.1 kW   (≈ 51 % of design)`,
        explanation: 'Total dynamic head sums the static lift plus all losses, giving what the pump must overcome. Shaft power = hydraulic / η — always oversize the motor to the next standard frame. The affinity laws (Q ∝ N, H ∝ N², P ∝ N³) mean a variable-frequency drive turning the pump down 20% cuts power almost in half — this is the single biggest energy-saving lever in fluid systems.',
      },
    ],
    commonMistakes: [
      'Selecting pump based on head only — always check the Q-H curve at the required flow rate.',
      'Ignoring efficiency — the shaft power is always higher than hydraulic power.',
      'Applying affinity laws to different pumps or different impeller types — they apply to the SAME pump at different speeds.',
    ],
    bestPractices: [
      'Plot the system curve (H_static + K×Q²) and pump curve on the same axes — the intersection is the operating point.',
      'Select pump with its best efficiency point (BEP) near the operating point.',
      'Use variable-speed drives for systems with widely varying flow demand — the cube-law saves enormous energy.',
    ],
    exercises: [
      'A centrifugal pump delivers 30 L/s at 25m head with 75% efficiency. Calculate shaft power and motor rating.',
      'A pump runs at 1200 RPM with Q=20 L/s and H=15m. What head will it produce at 1800 RPM? What flow rate?',
      'Define the specific speed of a pump and use it to determine whether to use a centrifugal or axial flow pump for Q=200 L/s at H=5m.',
    ],
    quizQuestions: [
      {
        question: 'According to pump affinity laws, if pump speed doubles, power changes by a factor of:',
        options: ['2', '4', '8', '1.41'],
        answer: 2,
        explanation: 'Power scales with the CUBE of speed: P₂/P₁ = (N₂/N₁)³. Doubling speed → 2³ = 8 times the power.',
      },
      {
        question: 'Centrifugal pumps are most suitable for:',
        options: ['Very high pressure, low flow', 'High flow, moderate head', 'Precise metering', 'High viscosity fluids'],
        answer: 1,
        explanation: 'Centrifugal pumps excel at high flow rates with moderate head. Positive displacement pumps are better for high pressure, precise metering, or viscous fluids.',
      },
    ],
    interviewQuestions: [
      'Explain the pump affinity laws and their practical significance for energy management.',
      'What is cavitation in pumps and how do you prevent it?',
      'Describe the system curve and pump curve, and explain how to find the operating point.',
    ],
    summary: 'Pumps add energy (head) to fluids; turbines extract it. Pump power = ρgQH/η. Affinity laws scale performance with speed: Q∝N, H∝N², P∝N³. Always select a pump whose efficiency peak (BEP) matches the required operating point. Variable-speed drives exploit the N³ power law for significant energy savings.',
    nextTopic: undefined,
  },
]
