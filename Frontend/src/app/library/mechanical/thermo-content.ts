import type { TopicLesson } from '../_shared/types'

export const thermoLessons: TopicLesson[] = [
  {
    id: 'what-is-thermodynamics',
    title: 'What is Thermodynamics?',
    intro: 'Thermodynamics is the branch of physics and engineering that studies energy, heat, work, and how they transform between systems.',
    whatIsIt: 'Thermodynamics deals with the relationships between heat, work, temperature, and energy. It governs everything from steam engines to refrigerators, jet turbines to the human body. The discipline is founded on four laws that cannot be derived from more fundamental principles — they are empirical facts confirmed by universal observation.',
    whyImportant: 'Every energy-converting device — power plants, engines, HVAC systems, rockets — is designed and limited by thermodynamic laws. Engineers who understand thermodynamics can predict maximum possible efficiency, diagnose energy losses, and design better systems. It is the bedrock of mechanical and chemical engineering.',
    simpleExplanation: 'Think of thermodynamics as the "accounting" of energy. Energy can change form (heat → work, chemical → thermal) but the books must always balance. The laws of thermodynamics set the rules of the game — including the hard limits that even perfect machines cannot exceed.',
    detailedExplanation: 'Thermodynamics operates at two levels: (1) Classical (macroscopic) thermodynamics — uses bulk properties (temperature, pressure, volume) without worrying about individual molecules. (2) Statistical thermodynamics — explains bulk behavior from molecular motion and probability. Classical thermodynamics is sufficient for most engineering applications. Key macroscopic state variables: Temperature (T), Pressure (P), Volume (V), Internal Energy (U), Enthalpy (H), Entropy (S), Gibbs Free Energy (G).',
    realWorldExample: 'A coal power plant burns coal to produce steam (thermal energy). The steam drives a turbine (mechanical energy), which drives a generator (electrical energy). The Carnot efficiency limit tells engineers the maximum fraction of heat that can become work — typically 30-45% for practical steam plants. The rest must be rejected as waste heat.',
    technicalDetails: 'Thermodynamic systems are classified by their boundaries: (1) Closed system — fixed mass, energy can cross boundary (a sealed piston-cylinder). (2) Open system (control volume) — mass and energy can cross (a turbine, compressor, or nozzle). (3) Isolated system — nothing crosses the boundary (idealized universe). State functions (U, H, S, G) depend only on the current state, not the path taken. Process functions (Q, W) depend on the path.',
    codeExamples: [
      {
        title: 'Worked Example — Ideal Gas Law (Sealed Air Tank)',
        language: 'SI units',
        kind: 'worked-example',
        code: `PROBLEM
────────
A sealed rigid tank holds 1 mol of air at 300 K in a volume of 0.025 m³.
(a) Find the pressure inside the tank.
(b) What volume would 2 mol of the same gas occupy at 25 °C and 1 atm?

GIVEN
────────
n₁ = 1.00 mol        T₁ = 300 K         V₁ = 0.025 m³
n₂ = 2.00 mol        T₂ = 298.15 K      P₂ = 101 325 Pa
R  = 8.314 J/(mol·K)

GOVERNING EQUATION
────────────────────
        P V = n R T          (Ideal Gas Law)

SOLUTION (a)
─────────────
    P₁ = n₁ R T₁ / V₁
       = (1.00)(8.314)(300) / 0.025
       = 99 768 Pa
       ≈ 99.77 kPa

SOLUTION (b)
─────────────
    V₂ = n₂ R T₂ / P₂
       = (2.00)(8.314)(298.15) / 101 325
       = 0.04893 m³
       = 48.93 L`,
        output: `(a) P₁ ≈ 99.77 kPa
(b) V₂ ≈ 48.93 L`,
        explanation: 'The ideal gas law PV = nRT ties four state variables together — fix any three and the fourth is determined. R = 8.314 J/(mol·K). At 25 °C and 1 atm, one mole of an ideal gas occupies 24.46 L (the familiar molar volume). Real gases deviate at high pressure and near liquefaction.',
      },
    ],
    commonMistakes: [
      'Mixing up open and closed systems — turbines are open systems (mass flows through), pistons are closed.',
      'Using Celsius instead of Kelvin in gas law calculations — always convert to Kelvin (K = °C + 273.15).',
      'Confusing state functions (U, H, S) with process functions (Q, W).',
    ],
    bestPractices: [
      'Always identify the system boundary first before applying any thermodynamic law.',
      'Use absolute temperature (Kelvin) and absolute pressure in all thermodynamic equations.',
      'Draw a clear system diagram showing energy flows (heat in, heat out, work in, work out).',
    ],
    exercises: [
      'A rigid tank contains 0.5 kg of nitrogen at 200 kPa and 27°C. Calculate the volume of the tank (M_N₂ = 28 g/mol).',
      'If the pressure of an ideal gas doubles while temperature stays constant, what happens to the volume?',
      'Classify each as open, closed, or isolated system: (a) car engine, (b) pressure cooker, (c) thermos bottle.',
    ],
    quizQuestions: [
      {
        question: 'Which temperature scale must be used in thermodynamic equations?',
        options: ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine or Kelvin'],
        answer: 3,
        explanation: 'Absolute temperature scales (Kelvin or Rankine) must be used. Using Celsius or Fahrenheit gives wrong results because 0°C does not represent zero thermal energy.',
      },
      {
        question: 'A system that exchanges energy but not mass with its surroundings is called:',
        options: ['Open system', 'Closed system', 'Isolated system', 'Control volume'],
        answer: 1,
        explanation: 'A closed system has fixed mass — energy (heat and work) can cross the boundary but mass cannot. An open system allows both mass and energy transfer.',
      },
    ],
    interviewQuestions: [
      'What is the difference between a state function and a process function? Give examples.',
      'Why can a thermodynamic system never achieve absolute zero temperature?',
      'Explain the difference between microscopic and macroscopic thermodynamics.',
    ],
    summary: 'Thermodynamics is the science of energy conversion governed by four universal laws. All engineering energy systems — engines, turbines, refrigerators — are analyzed and limited by these laws. Always work in Kelvin and identify system boundaries clearly.',
    nextTopic: 'zeroth-law',
  },

  {
    id: 'zeroth-law',
    title: 'Zeroth Law of Thermodynamics',
    intro: 'The Zeroth Law establishes the concept of temperature and makes thermometers possible.',
    whatIsIt: 'The Zeroth Law states: if two systems are each in thermal equilibrium with a third system, then they are in thermal equilibrium with each other. Mathematically: if T_A = T_C and T_B = T_C, then T_A = T_B. This law establishes temperature as a measurable, transitive property.',
    whyImportant: 'Without the Zeroth Law, temperature would have no objective meaning. It is the logical foundation for all temperature measurement — a thermometer is a "third system" that reaches equilibrium with any body it touches, letting us compare temperatures indirectly.',
    simpleExplanation: 'If coffee and a spoon are both the same temperature as a thermometer reading 85°C, then the coffee and spoon are the same temperature. You don\'t need to put the coffee and spoon in direct contact to know this — the thermometer acts as a go-between.',
    detailedExplanation: 'Thermal equilibrium means no net heat flows between two systems in contact. At equilibrium, both systems are at the same temperature. The Zeroth Law was formalized after the First and Second Laws were established, hence the name "Zeroth" — it is more fundamental. It defines the equivalence relation between temperatures and makes thermometry a valid science.',
    realWorldExample: 'Industrial quality control: a steel billet coming out of a furnace is measured with a pyrometer (infrared thermometer). The pyrometer equilibrates radiatively with the billet surface and reports the temperature — it never touches the billet. The Zeroth Law guarantees that the pyrometer reading equals the billet surface temperature.',
    formula: 'If T_A = T_ref AND T_B = T_ref THEN T_A = T_B\n\nTemperature scales:\n°C → K:  T(K) = T(°C) + 273.15\n°F → °C: T(°C) = (T(°F) − 32) × 5/9\n°F → R:  T(R) = T(°F) + 459.67',
    codeExamples: [
      {
        title: 'Reference Table — Four Temperature Scales',
        language: 'reference table',
        kind: 'spreadsheet',
        code: `Reference Point         °C          K         °F         R
──────────────────────────────────────────────────────────────
Absolute zero         −273.15       0.00     −459.67       0.00
Water freezing (1 atm)   0.00     273.15       32.00     491.67
Normal body temp        37.00     310.15       98.60     558.27
Water boiling  (1 atm) 100.00     373.15      212.00     671.67
Aluminium melts        660.32     933.47     1220.58    1673.14
Iron melts            1538.00    1811.15     2800.40    3260.07

CONVERSION RULES
────────────────
  °C → K  :   T(K)  = T(°C) + 273.15
  K  → °C :   T(°C) = T(K)  − 273.15
  °F → °C :   T(°C) = (T(°F) − 32) × 5/9
  °C → °F :   T(°F) = T(°C) × 9/5 + 32
  °F → R  :   T(R)  = T(°F) + 459.67`,
        output: `All four scales agree that "absolute zero" is the same physical point.
Only K and R are absolute — use them in every thermodynamic equation.`,
        explanation: 'Four temperature scales: Celsius (°C), Kelvin (K), Fahrenheit (°F), Rankine (R). Kelvin and Rankine are absolute (their zero point corresponds to zero thermal energy). Celsius and Fahrenheit are relative and cannot appear in ratios like the Carnot efficiency η = 1 − T_cold/T_hot.',
      },
    ],
    commonMistakes: [
      'Forgetting to convert Celsius to Kelvin before using in ideal gas or efficiency calculations.',
      'Confusing "thermal equilibrium" (same T, no heat flow) with "mechanical equilibrium" (same P).',
    ],
    bestPractices: [
      'Always convert to Kelvin at the start of any thermodynamic calculation.',
      'Thermal equilibrium implies equal temperature — use it to set up equations.',
    ],
    exercises: [
      'Convert 500°F to Celsius and Kelvin.',
      'A body A is at 350 K, body B is at 77°C. Are they in thermal equilibrium? Explain.',
      'A thermocouple reads 1200°F in a furnace. Convert to °C, K, and Rankine.',
    ],
    quizQuestions: [
      {
        question: 'The Zeroth Law of Thermodynamics is the basis for:',
        options: ['Work calculation', 'Entropy definition', 'Temperature measurement', 'Enthalpy conservation'],
        answer: 2,
        explanation: 'The Zeroth Law establishes that temperature is a valid, transitive property — making thermometers and temperature measurement scientifically valid.',
      },
      {
        question: 'Convert 25°C to Kelvin:',
        options: ['248.15 K', '298.15 K', '273.15 K', '25 K'],
        answer: 1,
        explanation: 'K = °C + 273.15 = 25 + 273.15 = 298.15 K.',
      },
    ],
    interviewQuestions: [
      'Why is the Zeroth Law called "zeroth" and not "fourth"?',
      'Two bodies are in contact and no heat flows. What can you conclude?',
    ],
    summary: 'The Zeroth Law defines temperature and makes measurement possible. Any two bodies in equilibrium with a third body are in equilibrium with each other — this transitivity allows thermometers to function. Always use Kelvin in thermodynamic equations.',
    nextTopic: 'first-law',
  },

  {
    id: 'first-law',
    title: 'First Law of Thermodynamics',
    intro: 'The First Law is the law of energy conservation: energy cannot be created or destroyed, only converted between forms.',
    whatIsIt: 'The First Law states that the change in internal energy of a closed system equals the heat added to the system minus the work done by the system: ΔU = Q − W. Energy is conserved across all processes. For open systems (control volumes), the steady-state energy equation includes mass flow, enthalpy, kinetic energy, and potential energy terms.',
    whyImportant: 'Every energy balance in engineering — boiler design, engine analysis, building HVAC — uses the First Law. It tells you exactly where energy goes and prevents you from designing a "perpetual motion machine of the first kind" (impossible device that creates energy from nothing).',
    simpleExplanation: 'If you add 100 J of heat to a gas in a piston, and the gas does 30 J of work expanding the piston, then the gas\'s internal energy (its "thermal savings account") increased by 70 J. Energy in minus energy out equals energy stored.',
    detailedExplanation: 'Sign conventions (engineering): Q is positive when heat enters the system. W is positive when work is done BY the system. So ΔU = Q − W. For a cycle, ΔU = 0, so Q_net = W_net. For open systems at steady state: Q̇ − Ẇ = ṁ[(h₂ − h₁) + ½(V₂² − V₁²) + g(z₂ − z₁)]. Specific heat relations: Q = mcΔT. For ideal gas: ΔU = mcᵥΔT, ΔH = mcₚΔT.',
    realWorldExample: 'Steam turbine analysis: steam enters at h₁ = 3200 kJ/kg and exits at h₂ = 2400 kJ/kg. The turbine is adiabatic (Q ≈ 0). By First Law: w_turbine = h₁ − h₂ = 800 kJ/kg. This is the specific work output — multiply by mass flow rate (kg/s) to get power (kW).',
    formula: 'Closed system: ΔU = Q − W\nWhere: Q = heat added to system (+)\n        W = work done by system (+)\n        ΔU = change in internal energy\n\nFor ideal gases:\nΔU = mcᵥΔT  (constant volume heat capacity)\nΔH = mcₚΔT  (constant pressure heat capacity)\n\nFor a cycle: Q_net = W_net  (ΔU_cycle = 0)',
    codeExamples: [
      {
        title: 'Worked Example — First Law Energy Balance (Three Cases)',
        language: 'SI units',
        kind: 'worked-example',
        code: `CASE 1 — Simple closed system
─────────────────────────────
Given:  Heat added Q = +500 J,  Work done by system W = +200 J
Find:   ΔU
Solve:  ΔU = Q − W = 500 − 200 = +300 J     (internal energy rises)

CASE 2 — Constant-volume heating of air
────────────────────────────────────────
Given:  m = 0.5 kg air,  c_v = 718 J/(kg·K),  ΔT = +50 K
Find:   Q and ΔU
Solve:  At constant volume the piston doesn't move, so W = 0.
        Q  = m · c_v · ΔT = 0.5 × 718 × 50 = 17 950 J
        ΔU = Q − W        = 17 950 − 0     = 17 950 J

CASE 3 — Isothermal expansion of an ideal gas
──────────────────────────────────────────────
Given:  n = 1.0 mol,  T = 400 K,  V₁ = 0.010 m³,  V₂ = 0.030 m³
Find:   W (work done BY the gas) and Q
Solve:  Isothermal  ⇒  ΔU = 0  ⇒  Q = W
        W = n R T ln(V₂/V₁)
          = (1.0)(8.314)(400) · ln(0.030/0.010)
          = 3327.6 · ln(3)
          = 3327.6 · 1.0986
          = 3653.5 J
        Q = +3653.5 J   (all heat added becomes expansion work)`,
        output: `Case 1:  ΔU = +300 J
Case 2:  Q = 17 950 J,  ΔU = 17 950 J    (W = 0)
Case 3:  W = +3653.5 J,  Q = +3653.5 J   (ΔU = 0)`,
        explanation: 'Case 1 shows the sign convention: heat IN is positive, work BY system is positive. Case 2 — constant volume kills the pdV integral, so every joule of heat becomes internal energy. Case 3 — isothermal means T (and therefore U for an ideal gas) is fixed, so every joule of heat leaves again as expansion work.',
      },
    ],
    commonMistakes: [
      'Wrong sign on work: W is positive when the system does work (expansion), negative when work is done ON the system (compression).',
      'Applying closed-system First Law to a turbine or nozzle — these are open systems requiring the steady-flow energy equation.',
      'Using cᵥ for constant-pressure processes and cₚ for constant-volume processes — they are not interchangeable.',
    ],
    bestPractices: [
      'Draw an energy diagram: arrows into the system are positive, arrows out are negative.',
      'For open systems (turbines, pumps, nozzles), use enthalpy h = u + Pv, not internal energy u.',
      'Check units: energy in J or kJ, power in W or kW, specific quantities in J/kg.',
    ],
    exercises: [
      'A gas absorbs 2000 J of heat and expands doing 800 J of work. Find the change in internal energy.',
      'In a constant-pressure process, 1 kg of air (cₚ = 1005 J/kg·K) is heated from 300 K to 600 K. Find Q and W (air is ideal gas).',
      'A steam turbine receives steam at h₁ = 3400 kJ/kg with flow rate 10 kg/s and exhausts at h₂ = 2600 kJ/kg. Calculate turbine power (assume adiabatic).',
    ],
    quizQuestions: [
      {
        question: 'A gas is compressed and 300 J of work is done ON the gas. No heat is transferred. What is ΔU?',
        options: ['-300 J', '+300 J', '0 J', 'Cannot determine'],
        answer: 1,
        explanation: 'Work done ON the system is negative W in the equation ΔU = Q − W. So ΔU = 0 − (−300) = +300 J. Internal energy increases.',
      },
      {
        question: 'For a complete thermodynamic cycle, what is ΔU?',
        options: ['Q_net', 'W_net', '0', 'Q_net − W_net'],
        answer: 2,
        explanation: 'A complete cycle returns to its initial state. Since U is a state function, ΔU = 0 for any complete cycle.',
      },
    ],
    interviewQuestions: [
      'What is the difference between internal energy and enthalpy? When do you use each?',
      'Derive the steady-flow energy equation for a turbine. What simplifications are typically made?',
      'Why does a gas cool during expansion (adiabatic process)?',
    ],
    summary: 'The First Law is energy conservation: ΔU = Q − W. Energy cannot be created or destroyed — only converted. For closed systems use internal energy; for open systems use enthalpy. Every engineering energy balance is an application of the First Law.',
    nextTopic: 'second-law',
  },

  {
    id: 'second-law',
    title: 'Second Law of Thermodynamics',
    intro: 'The Second Law defines the direction of natural processes and sets the maximum possible efficiency of any heat engine.',
    whatIsIt: 'The Second Law states that heat flows spontaneously from hot to cold, never the reverse, and that no heat engine can convert all heat into work. Equivalently: the entropy of an isolated system always increases (or stays constant in reversible processes). It distinguishes possible from impossible processes.',
    whyImportant: 'The Second Law is why you can\'t build a 100% efficient engine, why your coffee cools down (never warms up on its own), and why perpetual motion machines are impossible. It defines quality of energy — work is high-quality (ordered) energy; waste heat is low-quality (disordered) energy.',
    simpleExplanation: 'Ice never melts in your freezer by itself, and heat never flows from cold to hot without doing work. You can stir cream into coffee, but you can\'t un-stir it. These are all consequences of the Second Law: natural processes are irreversible and move toward greater disorder (entropy).',
    detailedExplanation: 'Two classic statements: (1) Kelvin-Planck: it is impossible to construct a device that operates in a cycle and produces no effect other than the transfer of heat from a single reservoir and the performance of an equivalent amount of work. (2) Clausius: it is impossible to construct a device that operates in a cycle and produces no effect other than the transfer of heat from a lower-temperature body to a higher-temperature body. Both are equivalent — violating one violates the other.',
    realWorldExample: 'A refrigerator moves heat from cold food (low T) to the warm room (high T). This violates the Clausius statement IF done without work — so the refrigerator must consume electrical work (compressor) to achieve this. The minimum work required is governed by the Carnot coefficient of performance (COP).',
    formula: 'Entropy change:\ndS = δQ_rev / T  (for reversible heat transfer)\nΔS_universe = ΔS_system + ΔS_surroundings ≥ 0\n\nFor irreversible processes: ΔS_universe > 0\nFor reversible processes: ΔS_universe = 0\nImpossible: ΔS_universe < 0',
    codeExamples: [
      {
        title: 'Worked Example — Entropy Balance (Two Cases)',
        language: 'SI units',
        kind: 'worked-example',
        code: `CASE 1 — Isothermal expansion of air
────────────────────────────────────
Given:  m = 1.0 kg air,  T = 400 K = const,  V₂/V₁ = 2
        c_v = 718 J/(kg·K),  c_p = 1005 J/(kg·K)
        R_specific = c_p − c_v = 287 J/(kg·K)

Since T is constant, only the volume term of ΔS survives:
    ΔS_sys = m · R · ln(V₂/V₁)
           = (1.0)(287)(ln 2)
           = (1.0)(287)(0.6931)
           = 198.9 J/K

CASE 2 — Heat flowing from hot to cold (universe check)
───────────────────────────────────────────────────────
Given:  Q = 200 J flows from T_hot = 500 K to T_cold = 300 K

Hot reservoir LOSES entropy:
    ΔS_hot   = −Q / T_hot   = −200/500  = −0.4000 J/K

Cold reservoir GAINS entropy:
    ΔS_cold  = +Q / T_cold  = +200/300  = +0.6667 J/K

Universe:
    ΔS_univ  = ΔS_hot + ΔS_cold
             = −0.4000 + 0.6667
             = +0.2667 J/K   ( > 0  ⇒  process is possible/natural )`,
        output: `Case 1:  ΔS_sys = +198.9 J/K
Case 2:  ΔS_universe = +0.2667 J/K   (Second Law satisfied)`,
        explanation: 'Case 1: for an isothermal process, ΔU = 0 for an ideal gas, so all entropy change comes from the volume term ΔS = mR ln(V₂/V₁). Case 2: the cold reservoir gains more entropy than the hot reservoir loses because 200/300 > 200/500. This asymmetry — heat leaving a low T is a bigger entropy loss than heat leaving a high T — is what makes heat flow hot→cold thermodynamically favorable.',
      },
    ],
    commonMistakes: [
      'Thinking entropy always increases everywhere — it can decrease locally (in a refrigerator or living organism) as long as the surroundings gain MORE entropy.',
      'Confusing the Second Law with energy conservation — the Second Law is about energy QUALITY (direction), not quantity.',
      'Assuming a reversible process is possible in practice — all real processes are irreversible.',
    ],
    bestPractices: [
      'Always calculate entropy change of the UNIVERSE (system + surroundings) to determine if a process is possible.',
      'Use ΔS ≥ Q/T (Clausius inequality) with equality for reversible processes.',
      'High-quality energy (work, electricity) → low-quality energy (heat) is natural and easy. The reverse always requires work input.',
    ],
    exercises: [
      '200 J of heat flows reversibly from a body at 400 K to a body at 200 K. Calculate ΔS of each body and ΔS_universe.',
      'Ice melts (ΔH_fusion = 334 kJ/kg) at 0°C. Calculate the entropy change of 1 kg of ice.',
      'Why does entropy decrease when water freezes into ice? Does this violate the Second Law?',
    ],
    quizQuestions: [
      {
        question: 'The Second Law of Thermodynamics states that the entropy of an isolated system:',
        options: ['Always decreases', 'Always stays constant', 'Always increases or stays constant', 'Can increase or decrease depending on temperature'],
        answer: 2,
        explanation: 'Entropy of an isolated system always increases for irreversible processes and stays constant for reversible ones. It never spontaneously decreases — that is the Second Law.',
      },
      {
        question: 'A heat engine that converts ALL heat to work with no heat rejection would violate:',
        options: ['Zeroth Law', 'First Law', 'Kelvin-Planck statement of the Second Law', 'Third Law'],
        answer: 2,
        explanation: 'The Kelvin-Planck statement prohibits any device that operates in a cycle and converts a single heat reservoir\'s energy entirely into work.',
      },
    ],
    interviewQuestions: [
      'Explain the two equivalent statements of the Second Law.',
      'Why can\'t a heat engine achieve 100% efficiency even in theory (except for an engine with T_cold = 0)?',
      'What is the physical meaning of entropy at the molecular level?',
    ],
    summary: 'The Second Law defines the arrow of time: processes spontaneously move toward greater entropy. Heat flows hot→cold, not cold→hot, without work. No heat engine can be 100% efficient. Entropy is a measure of disorder — the universe tends toward maximum disorder.',
    nextTopic: 'carnot-cycle',
  },

  {
    id: 'carnot-cycle',
    title: 'Carnot Cycle & Efficiency',
    intro: 'The Carnot cycle is the ideal reversible heat engine cycle that sets the absolute maximum efficiency between two temperature reservoirs.',
    whatIsIt: 'The Carnot cycle consists of four reversible processes: (1) Isothermal expansion at T_H (absorbs Q_H), (2) Adiabatic expansion (T drops from T_H to T_L), (3) Isothermal compression at T_L (rejects Q_L), (4) Adiabatic compression (T rises from T_L to T_H). Carnot efficiency depends only on the source and sink temperatures.',
    whyImportant: 'The Carnot efficiency η = 1 − T_L/T_H is the UPPER BOUND for any heat engine operating between the same two temperatures. No real engine can exceed it. This gives engineers a performance benchmark: how close is our engine to the Carnot limit?',
    simpleExplanation: 'Imagine a heat engine as a "waterfall of energy." Heat at high temperature is like water at high elevation. Only some of it can be converted to work (like turning a watermill). The rest must flow to the cold reservoir (lower elevation). The higher the temperature ratio T_H/T_L, the more work you can extract.',
    detailedExplanation: 'Carnot efficiency: η_Carnot = 1 − T_L/T_H = W_net/Q_H. To maximize efficiency: increase T_H (higher steam temperature in power plants) or decrease T_L (use colder cooling water). The Carnot COP for refrigerators: COP = T_L/(T_H − T_L). The Carnot COP for heat pumps: COP_HP = T_H/(T_H − T_L). Real engines have friction, heat losses, and irreversibilities, so they always fall short of Carnot efficiency.',
    realWorldExample: 'A modern coal power plant uses steam at T_H ≈ 600°C (873 K) and rejects heat to cooling water at T_L ≈ 30°C (303 K). Carnot efficiency = 1 − 303/873 = 65.3%. Actual efficiency is about 40-45% due to irreversibilities. This gap represents the improvement potential.',
    formula: 'Carnot Thermal Efficiency:\nη_Carnot = 1 − T_L/T_H   (temperatures in Kelvin)\nη_Carnot = W_net / Q_H\n\nCarnot COP (Refrigerator):\nCOP_R = T_L / (T_H − T_L) = Q_L / W_net\n\nCarnot COP (Heat Pump):\nCOP_HP = T_H / (T_H − T_L) = Q_H / W_net\n\nNote: COP_HP = COP_R + 1',
    codeExamples: [
      {
        title: 'Worked Example — Carnot Benchmarks (Power Plant & Refrigerator)',
        language: 'SI units',
        kind: 'worked-example',
        code: `CASE 1 — Coal-fired power plant
──────────────────────────────
Given:  T_H = 600 °C = 873 K   (superheated steam)
        T_L = 30 °C = 303 K    (cooling-tower water)
        η_actual = 42 %        (typical modern plant)

Carnot (ideal) efficiency:
    η_C = 1 − T_L/T_H
        = 1 − 303/873
        = 1 − 0.3471
        = 0.6529
        ≈ 65.3 %

Second-law (relative) efficiency:
    η_II = η_actual / η_C
         = 0.42 / 0.6529
         = 0.643
         ≈ 64.3 % of the Carnot ceiling

CASE 2 — Domestic refrigerator (freezer −18 °C, room 25 °C)
────────────────────────────────────────────────────────────
Given:  T_L = 255.15 K,   T_H = 298.15 K

Carnot COP for a refrigerator:
    COP_R = T_L / (T_H − T_L)
          = 255.15 / (298.15 − 255.15)
          = 255.15 / 43.00
          = 5.93

Minimum work to remove 1 kJ of heat from the freezer:
    W_min = Q_L / COP_R
          = 1 / 5.93
          = 0.169 kJ`,
        output: `Power plant:   η_Carnot = 65.3 %,  η_II ≈ 64.3 % of ceiling
Refrigerator:  COP_max ≈ 5.93,  W_min ≈ 0.17 kJ per kJ removed`,
        explanation: 'A 42% real plant captures ~64% of the thermodynamic ceiling — the remaining 36% is lost to friction, finite-time heat transfer, and turbine irreversibilities. A refrigerator COP of ~5.9 means an ideal compressor spends just 0.17 kJ of work to move 1 kJ of heat uphill; real domestic units run at COP 2–4.',
      },
    ],
    commonMistakes: [
      'Using Celsius instead of Kelvin in the Carnot formula — gives completely wrong results.',
      'Confusing efficiency (for heat engines) with COP (for refrigerators/heat pumps).',
      'Assuming the Carnot cycle is practically achievable — it requires infinitely slow, frictionless processes.',
    ],
    bestPractices: [
      'Always convert to Kelvin before applying η = 1 − T_L/T_H.',
      'Use Carnot efficiency as a benchmark — real efficiency / Carnot efficiency = second-law efficiency.',
      'For heat pumps and refrigerators, use COP — efficiency > 1 is possible and normal.',
    ],
    exercises: [
      'A steam turbine operates between 500°C and 40°C. Calculate Carnot efficiency and state whether a 45% efficient real turbine is thermodynamically feasible.',
      'An air conditioner cools a room at 20°C by rejecting heat to outside air at 38°C. Calculate the maximum COP.',
      'A Carnot engine produces 500 kW of power by operating between 800 K and 300 K. Calculate Q_H and Q_L rates.',
    ],
    quizQuestions: [
      {
        question: 'A Carnot engine operates between 600 K and 300 K. What is its efficiency?',
        options: ['25%', '50%', '75%', '100%'],
        answer: 1,
        explanation: 'η = 1 − T_L/T_H = 1 − 300/600 = 0.50 = 50%.',
      },
      {
        question: 'Which change improves Carnot efficiency the most?',
        options: ['Increasing T_L by 50 K', 'Increasing T_H by 50 K', 'Decreasing T_L by 50 K', 'Both B and C equally'],
        answer: 2,
        explanation: 'Decreasing T_L (cold reservoir temperature) increases η = 1 − T_L/T_H more than increasing T_H by the same amount, because T_L appears in the numerator. However, both improve efficiency.',
      },
    ],
    interviewQuestions: [
      'Describe the four processes of the Carnot cycle on a P-V diagram.',
      'Why is the Carnot cycle the most efficient cycle between two fixed temperature reservoirs?',
      'A real engine achieves 70% of Carnot efficiency. What does this mean and what causes the gap?',
    ],
    summary: 'Carnot efficiency η = 1 − T_L/T_H is the upper bound for any heat engine. Increasing T_H or decreasing T_L improves the maximum possible efficiency. All real engines fall short due to friction, heat leaks, and finite-speed processes. The Carnot COP for refrigerators and heat pumps defines their best possible performance.',
    nextTopic: 'thermodynamic-processes',
  },

  {
    id: 'thermodynamic-processes',
    title: 'Thermodynamic Processes',
    intro: 'Thermodynamic processes describe how a system changes from one state to another — each with distinct relationships between P, V, T, Q, and W.',
    whatIsIt: 'A thermodynamic process is the path by which a system changes state. Four fundamental processes for ideal gases: (1) Isothermal (constant T), (2) Isobaric (constant P), (3) Isochoric/Isovolumetric (constant V), (4) Adiabatic (no heat transfer, Q=0). Each has a unique work and heat expression.',
    whyImportant: 'Real engineering processes approximate these ideal cases. Compression in a compressor is approximately adiabatic. Boiling in a boiler is isobaric. Combustion in a rigid vessel is approximately isochoric. Understanding ideal processes lets engineers predict work, heat, and efficiency before building physical systems.',
    simpleExplanation: 'Think of blowing up a balloon under different constraints: (1) In a water bath (isothermal) — temperature stays fixed. (2) Holding the outlet area constant (isobaric) — pressure stays constant. (3) Sealed rigid container (isochoric) — volume stays fixed. (4) Insulated container (adiabatic) — no heat escapes.',
    detailedExplanation: 'All four processes obey PVⁿ = constant (polytropic process), where n is the polytropic index: n=1 → isothermal, n=0 → isobaric, n=∞ → isochoric, n=γ → adiabatic (γ = cₚ/cᵥ). For air: γ ≈ 1.4. Work done by system during a process: W = ∫P dV. For each process: isothermal W = nRT ln(V₂/V₁); isobaric W = P(V₂−V₁); isochoric W = 0; adiabatic W = (P₁V₁ − P₂V₂)/(γ−1).',
    realWorldExample: 'In a diesel engine: (1) Compression stroke: adiabatic compression of air (T rises to ~800°C, igniting injected fuel). (2) Power stroke: approximately isobaric combustion then adiabatic expansion. (3) Exhaust/intake: approximately isobaric. The adiabatic compression ratio determines engine efficiency.',
    formula: 'Process summary for ideal gas:\n──────────────────────────────────────\nIsothermal (T=const):  W = nRT ln(V₂/V₁),  ΔU = 0,  Q = W\nIsobaric (P=const):    W = P(V₂-V₁),  Q = mcₚΔT,  ΔU = mcᵥΔT\nIsochoric (V=const):   W = 0,  Q = mcᵥΔT,  ΔU = Q\nAdiabatic (Q=0):       W = (P₁V₁-P₂V₂)/(γ-1),  ΔU = -W\nPolytropic:            PVⁿ = const',
    codeExamples: [
      {
        title: 'Worked Example — Work Output for All Four Processes (Same Expansion)',
        language: 'SI units',
        kind: 'worked-example',
        code: `Common start state:   P₁ = 100 kPa,  V₁ = 0.10 m³,  T₁ = 300 K
Common end state:     V₂ = 0.20 m³   (volume doubles)
Working fluid: air,   R = 0.287 kJ/(kg·K),  γ = 1.4

Mass in the piston:
    m = P₁V₁ / (R T₁) = (100)(0.10) / (0.287)(300) = 0.116 kg

┌──────────────┬───────────────────────────────┬──────────────┐
│  Process     │  Work formula                 │  W (kJ)      │
├──────────────┼───────────────────────────────┼──────────────┤
│ Isothermal   │  W = mRT ln(V₂/V₁)            │              │
│              │    = 0.116·0.287·300·ln 2     │   ≈  6.93    │
├──────────────┼───────────────────────────────┼──────────────┤
│ Isobaric     │  W = P(V₂ − V₁)               │              │
│              │    = 100·(0.20 − 0.10)        │   =  10.00   │
├──────────────┼───────────────────────────────┼──────────────┤
│ Isochoric    │  W = 0   (dV = 0)             │   =  0.00    │
├──────────────┼───────────────────────────────┼──────────────┤
│ Adiabatic    │  P₂ = P₁(V₁/V₂)^γ             │              │
│              │     = 100·(0.5)^1.4 = 37.89   │              │
│              │  W = (P₁V₁ − P₂V₂)/(γ − 1)    │              │
│              │    = (10 − 37.89·0.20)/0.4    │   ≈  6.05    │
└──────────────┴───────────────────────────────┴──────────────┘

RANKING BY WORK OUTPUT (doubling V from same start):
    Isobaric  (10.00 kJ)  >  Isothermal (6.93 kJ)
                          >  Adiabatic  (6.05 kJ)
                          >  Isochoric  (0.00 kJ)`,
        output: `Isothermal:  6.93 kJ
Isobaric:   10.00 kJ
Isochoric:   0.00 kJ
Adiabatic:   6.05 kJ   (P drops from 100 → 37.89 kPa)`,
        explanation: 'Isobaric wins because pressure stays at 100 kPa throughout — the P-V diagram is a full rectangle. Isothermal drops as 1/V (Boyle). Adiabatic drops faster (1/V^γ) so it produces less work but its temperature falls — that cooling is the source of the "adiabatic drop" seen in gas dynamics. Isochoric does zero boundary work; all heat goes to internal energy.',
      },
    ],
    commonMistakes: [
      'Confusing adiabatic (Q=0) with isothermal (T=const) — they are very different. Adiabatic expansion COOLS the gas.',
      'Using the wrong work formula — each process has its own expression.',
      'Forgetting that W = 0 for isochoric processes — no volume change means no boundary work.',
    ],
    bestPractices: [
      'Memorize the constraints: iso = same: isoThermal→T, isoBARic→P (bar=pressure), isoChoric→V (chore=volume work).',
      'For adiabatic processes: PVᵞ = const; for isothermal: PV = const (Boyle\'s law).',
      'Sketch P-V diagrams — the area under the curve is always the boundary work.',
    ],
    exercises: [
      'Air at 500 kPa and 400 K undergoes adiabatic expansion to 100 kPa. Find T₂ and work done per kg (γ = 1.4).',
      'In an isobaric process, 2 kg of air is heated from 300 K to 600 K at 200 kPa. Find Q, W, and ΔU.',
      'A piston-cylinder contains gas at 300 kPa and 0.05 m³. It compresses isothermally to 0.02 m³. Find W.',
    ],
    quizQuestions: [
      {
        question: 'In an isochoric process, the work done by the gas is:',
        options: ['nRT', 'P(V₂−V₁)', 'Zero', 'Negative'],
        answer: 2,
        explanation: 'Isochoric means constant volume. W = ∫P dV = 0 because dV = 0. All energy transfer happens as heat.',
      },
      {
        question: 'Which process is represented by PVᵞ = constant?',
        options: ['Isothermal', 'Isobaric', 'Adiabatic', 'Isochoric'],
        answer: 2,
        explanation: 'An adiabatic reversible (isentropic) process satisfies PVᵞ = constant, where γ = cₚ/cᵥ.',
      },
    ],
    interviewQuestions: [
      'Derive the work expression for adiabatic expansion of an ideal gas.',
      'On a P-V diagram, which process produces more work: isothermal or adiabatic expansion between the same initial and final volumes?',
      'What is the polytropic process and how do the four fundamental processes fit into it?',
    ],
    summary: 'Four fundamental processes: isothermal (T constant), isobaric (P constant), isochoric (V constant, W=0), adiabatic (Q=0). Each has a unique work-heat relationship. Real processes are polytropic (PVⁿ = const) with n between 1 and γ. The P-V diagram area under the process curve equals boundary work.',
    nextTopic: 'entropy',
  },

  {
    id: 'entropy',
    title: 'Entropy',
    intro: 'Entropy is the thermodynamic measure of disorder and energy unavailability — the most subtle and powerful concept in all of physics.',
    whatIsIt: 'Entropy (S) is a state function that quantifies the "spread" of energy among available molecular configurations. For a reversible process: dS = δQ_rev/T. Entropy increases in any spontaneous process and reaches maximum at equilibrium. At the molecular level (Boltzmann): S = k_B ln(Ω), where Ω is the number of microstates.',
    whyImportant: 'Entropy determines the direction of all natural processes. It explains why certain processes are irreversible, why heat engines can\'t be 100% efficient, and why mixing is easy but unmixing is impossible. In engineering: entropy generation (Sgen > 0) always represents lost work potential — minimizing irreversibilities means maximizing efficiency.',
    simpleExplanation: 'Entropy is the tendency of energy to spread out. A hot object in a cold room: energy spreads from the hot object to the room (entropy increases). A drop of ink in water: molecules spread until evenly distributed (maximum entropy). Disorder is favored because there are far more disordered arrangements than ordered ones.',
    detailedExplanation: 'Entropy change calculations: (1) Phase change: ΔS = Q/T = mL/T (L = latent heat). (2) Heating/cooling: ΔS = mc ln(T₂/T₁). (3) Mixing ideal gases: always positive. (4) Isothermal expansion: ΔS = nR ln(V₂/V₁). Isentropic (constant entropy) processes are reversible adiabatic — PVᵞ = const for ideal gas. Isentropic efficiency compares real devices to isentropic ideal: η_isentropic = actual work / isentropic work.',
    realWorldExample: 'Exergy analysis of a power plant: entropy generation in the boiler, turbine, and condenser each represent lost work potential. A turbine with isentropic efficiency 85% means 15% of available work is destroyed by irreversibilities (friction, heat transfer across temperature differences, mixing). Identifying entropy sources guides efficiency improvements.',
    formula: 'Entropy change:\ndS = δQ_rev / T\n\nFor ideal gas:\nΔS = m[cv ln(T2/T1) + R ln(v2/v1)]\n   = m[cp ln(T2/T1) - R ln(P2/P1)]\n\nBoltzmann equation:\nS = k_B × ln(Ω)\nwhere k_B = 1.38×10⁻²³ J/K\n\nClausius inequality:\n∮ δQ/T ≤ 0 (= for reversible cycle)',
    codeExamples: [
      {
        title: 'Worked Example — Real Turbine vs Isentropic Ideal (Entropy Generation)',
        language: 'SI units',
        kind: 'worked-example',
        code: `Air turbine — inlet & outlet states
────────────────────────────────────
Given:  T₁ = 900 K,   P₁ = 1000 kPa
        P₂ = 200 kPa
        c_p = 1.005 kJ/(kg·K),  R = 0.287 kJ/(kg·K),  γ = 1.4
        Isentropic efficiency  η_s = 0.87  (85–90 % typical)

STEP 1 — Isentropic (reference) exit temperature
    T₂s = T₁ · (P₂/P₁)^((γ−1)/γ)
        = 900 · (200/1000)^(0.4/1.4)
        = 900 · (0.2)^0.2857
        = 900 · 0.6313
        ≈ 568.2 K

STEP 2 — Isentropic (ideal) specific work
    w_s = c_p · (T₁ − T₂s)
        = 1.005 · (900 − 568.2)
        ≈ 333.4 kJ/kg

STEP 3 — Actual work (turbine falls short of ideal)
    w_act = η_s · w_s = 0.87 · 333.4 ≈ 290.1 kJ/kg

STEP 4 — Actual exit temperature (from energy balance)
    T₂_act = T₁ − w_act/c_p
           = 900 − 290.1/1.005
           ≈ 611.4 K       ( > T₂s: gas leaves hotter )

STEP 5 — Entropy generated per kg
    Δs = c_p · ln(T₂_act/T₁) − R · ln(P₂/P₁)
       = 1.005 · ln(611.4/900) − 0.287 · ln(0.2)
       = 1.005 · (−0.3866) − 0.287 · (−1.6094)
       = −0.3886 + 0.4619
       ≈ +0.0733 kJ/(kg·K)   ( > 0 ⇒ irreversibility )`,
        output: `T₂ (isentropic ideal):   568.2 K
w  (isentropic ideal):   333.4 kJ/kg
T₂ (real turbine):       611.4 K
w  (real turbine):       290.1 kJ/kg
Entropy generated:       +0.0733 kJ/(kg·K)`,
        explanation: 'The real turbine leaves the exhaust ~43 K hotter than an isentropic one and delivers ~43 kJ/kg less work — that 43 kJ/kg is the "lost work" corresponding to Δs · T₀ (Gouy-Stodola). Because Δs > 0, the process is irreversible; if it were reversible the process would trace a vertical line on a T-s diagram.',
      },
    ],
    commonMistakes: [
      'Thinking entropy only increases — it decreases in subsystems (refrigerators cool air, decreasing air entropy) as long as the surroundings increase more.',
      'Confusing isentropic (constant entropy) with adiabatic (Q=0) — isentropic requires BOTH Q=0 AND reversibility.',
      'Using ΔS = Q/T for irreversible processes — this formula only applies to reversible heat transfer.',
    ],
    bestPractices: [
      'For real devices, calculate isentropic (ideal) performance first, then apply isentropic efficiency.',
      'Entropy generation > 0 always means irreversibility and lost work — minimize it to maximize efficiency.',
      'The T-S diagram (temperature-entropy) is as important as the P-V diagram for analyzing cycles.',
    ],
    exercises: [
      'Calculate the entropy change when 1 kg of water at 100°C vaporizes to steam at 100°C (L = 2257 kJ/kg).',
      'Air is compressed adiabatically from 100 kPa, 300 K to 500 kPa. If the actual temperature after compression is 510 K, find the isentropic efficiency and entropy generation.',
      'Why is the entropy of a crystal at absolute zero equal to zero? (Third Law)',
    ],
    quizQuestions: [
      {
        question: 'An isentropic process is one where:',
        options: ['Temperature is constant', 'Pressure is constant', 'No heat is transferred', 'Entropy is constant (reversible and adiabatic)'],
        answer: 3,
        explanation: 'Isentropic means constant entropy — this requires the process to be both adiabatic (Q=0) AND reversible. Real adiabatic processes are not isentropic because they generate entropy through irreversibilities.',
      },
      {
        question: 'What does a high isentropic efficiency for a turbine indicate?',
        options: ['High heat rejection', 'Low entropy generation — close to reversible ideal', 'High pressure ratio', 'Low work output'],
        answer: 1,
        explanation: 'Isentropic efficiency = actual work / ideal (isentropic) work. High value means the real turbine is close to the reversible ideal — minimal entropy generation and losses.',
      },
    ],
    interviewQuestions: [
      'Explain the physical meaning of entropy using Boltzmann\'s statistical definition.',
      'What is the difference between entropy change (ΔS) and entropy generation (Sgen)?',
      'How does the concept of entropy relate to the "quality" of energy?',
    ],
    summary: 'Entropy measures energy unavailability and disorder. It always increases in natural processes (Second Law). Engineers minimize entropy generation to maximize work output. Isentropic efficiency quantifies how close a real device is to its reversible ideal. The T-S diagram and entropy analysis are essential tools for cycle optimization.',
    nextTopic: 'thermodynamic-cycles',
  },

  {
    id: 'thermodynamic-cycles',
    title: 'Thermodynamic Cycles',
    intro: 'Thermodynamic cycles are sequences of processes that return a working fluid to its initial state, enabling continuous power or refrigeration output.',
    whatIsIt: 'A thermodynamic cycle is a series of thermodynamic processes forming a closed loop on a P-V or T-S diagram. Work-producing cycles (power cycles) operate clockwise on a P-V diagram. Refrigeration cycles operate counterclockwise. Common cycles: Rankine (steam power plants), Otto (gasoline engines), Diesel (diesel engines), Brayton (gas turbines), Vapor-Compression (refrigeration).',
    whyImportant: 'All practical power and refrigeration equipment operates on cycles. Understanding cycle efficiency, work ratios, and back-work ratios enables engineers to design better engines and refrigerators. Cycle analysis using enthalpies from steam tables is the foundation of power plant engineering.',
    simpleExplanation: 'A thermodynamic cycle is like a merry-go-round for energy. The working fluid (steam, air, refrigerant) repeatedly goes around a loop: absorbing heat, doing work, rejecting heat, being compressed. Each loop delivers net work output (for power cycles) or net refrigeration effect.',
    detailedExplanation: 'Rankine cycle (steam power plants): 1→2 Pump (isentropic compression of liquid), 2→3 Boiler (isobaric heat addition, liquid → superheated steam), 3→4 Turbine (isentropic expansion, work output), 4→1 Condenser (isobaric heat rejection, steam → liquid). Otto cycle (gasoline engines): 1-2 isentropic compression, 2-3 isochoric heat addition, 3-4 isentropic expansion, 4-1 isochoric heat rejection. Thermal efficiency: η_Otto = 1 − 1/r^(γ−1) where r = compression ratio.',
    realWorldExample: 'A nuclear power plant uses the Rankine cycle with water/steam. Uranium fission heats water to steam (boiler stage). Steam drives turbines (expansion stage). Turbine exhaust condenses in the condenser (rejection stage). Pumps return water to the reactor. Typical thermal efficiency: 33%.',
    formula: 'Rankine Cycle Efficiency:\nη = W_net / Q_in = (W_turbine - W_pump) / Q_boiler\n\nOtto Cycle Efficiency:\nη_Otto = 1 - 1/r^(γ-1)\nwhere r = V_max/V_min (compression ratio)\n\nDiesel Cycle Efficiency:\nη_Diesel = 1 - (1/r^(γ-1)) × (r_c^γ - 1)/(γ(r_c - 1))\nwhere r_c = cutoff ratio',
    codeExamples: [
      {
        title: 'Reference Table — Otto & Diesel Efficiency vs Compression Ratio',
        language: 'cycle analysis (γ = 1.4)',
        kind: 'spreadsheet',
        code: `Air-standard formulas
    η_Otto     = 1 − 1/r^(γ−1)
    η_Diesel   = 1 − (1/r^(γ−1)) · (rc^γ − 1) / (γ · (rc − 1))
    Here γ = 1.4 (air) and cut-off ratio rc = 2.0 for the Diesel column.

┌──────────────────┬──────────────┬────────────────────┐
│ Compression r    │  η_Otto      │  η_Diesel (rc = 2) │
├──────────────────┼──────────────┼────────────────────┤
│        4         │   42.6 %     │    32.8 %          │
│        6         │   51.2 %     │    42.8 %          │
│        8         │   56.5 %     │    49.0 %          │
│       10         │   60.2 %     │    53.4 %          │
│       12         │   63.0 %     │    56.7 %          │
│       14         │   65.2 %     │    59.3 %          │
│       16         │   67.0 %     │    61.4 %          │
│       18         │   68.5 %     │    63.2 %          │
│       20         │   69.8 %     │    64.7 %          │
└──────────────────┴──────────────┴────────────────────┘

TYPICAL PRODUCTION ENGINES
──────────────────────────
    Gasoline   r ≈ 9    →  air-std ≈ 58 %,  actual ≈ 30 %
    Diesel     r ≈ 18   →  air-std ≈ 63 %,  actual ≈ 40 %
    Reasons for the gap: heat-loss to cylinder walls, friction,
    finite-time combustion, throttling, incomplete expansion.`,
        output: `Higher r ⇒ higher efficiency, with diminishing returns.
Diesel beats Otto in real hardware because Diesel can run at r ≈ 18
without knock — gasoline is knock-limited to r ≈ 9–12.`,
        explanation: 'For the same compression ratio, Otto is more efficient than Diesel — but knock limits gasoline engines to r ≈ 12. Diesel engines run un-throttled, use compression ignition, and tolerate r = 18–22, so they overtake Otto in practice. Modern turbocharged/downsized SI engines use direct injection and higher octane to push r into the 12–14 window.',
      },
    ],
    commonMistakes: [
      'Mixing up Rankine cycle components — the pump compresses liquid, not vapor. Compression of vapor is the compressor in the Brayton cycle.',
      'Ignoring pump work in Rankine cycle — it\'s small but must be subtracted from turbine work for net work.',
      'Applying Otto efficiency to a Diesel engine — they use different equations.',
    ],
    bestPractices: [
      'Always draw the cycle on a P-V AND T-S diagram — the diagrams show which processes add heat and which reject heat.',
      'Use steam tables or refrigerant property tables for Rankine/vapor-compression cycles — ideal gas law doesn\'t apply.',
      'Identify: Q_in, Q_out, W_turbine, W_pump to compute η = (Q_in − Q_out)/Q_in.',
    ],
    exercises: [
      'An Otto cycle has a compression ratio of 10. Air enters at 100 kPa and 300 K. Calculate ideal thermal efficiency and pressure at end of compression.',
      'A Rankine cycle uses steam: turbine inlet h₁ = 3200 kJ/kg, condenser exit h₂ = 191 kJ/kg (saturated liquid), pump exit h₃ = 193 kJ/kg. Calculate efficiency.',
      'Compare the efficiency of Otto (r=10) and Diesel (r=18, rc=2) cycles. Why does Diesel require higher r?',
    ],
    quizQuestions: [
      {
        question: 'The efficiency of an ideal Otto cycle depends only on:',
        options: ['Fuel type and heat input', 'Compression ratio and γ', 'Engine displacement', 'Operating temperature'],
        answer: 1,
        explanation: 'η_Otto = 1 − 1/r^(γ−1). Only the compression ratio r and the specific heat ratio γ determine Otto cycle efficiency.',
      },
      {
        question: 'In the Rankine cycle, heat is added to the working fluid in which component?',
        options: ['Turbine', 'Condenser', 'Pump', 'Boiler'],
        answer: 3,
        explanation: 'The boiler (steam generator) adds heat at constant pressure, converting feedwater to superheated steam. This is the Q_in of the Rankine cycle.',
      },
    ],
    interviewQuestions: [
      'Describe the four components of the Rankine cycle and the thermodynamic process in each.',
      'Why do diesel engines generally have higher efficiency than gasoline engines?',
      'What is the back-work ratio of a Rankine cycle, and why is it much lower than for a Brayton cycle?',
    ],
    summary: 'Thermodynamic cycles power all heat engines and refrigeration systems. Otto (gasoline), Diesel, Rankine (steam), and Brayton (gas turbine) cycles each have characteristic efficiencies based on their compression ratios, working fluids, and operating conditions. Real cycles fall short of ideal due to irreversibilities in each component.',
    nextTopic: 'heat-transfer-intro',
  },

  {
    id: 'heat-transfer-intro',
    title: 'Heat Transfer Fundamentals',
    intro: 'Heat transfer is the study of thermal energy movement due to temperature differences — governing three mechanisms: conduction, convection, and radiation.',
    whatIsIt: 'Heat transfer quantifies the rate at which thermal energy flows between systems or regions at different temperatures. Three mechanisms: (1) Conduction — energy transfer through a solid or stationary fluid by molecular collisions. (2) Convection — energy transfer by bulk fluid motion (natural or forced). (3) Radiation — energy transfer by electromagnetic waves (no medium needed).',
    whyImportant: 'Heat transfer governs the design of virtually all thermal systems: heat exchangers, IC engine cooling, building insulation, electronics cooling, nuclear reactor safety, and aerospace thermal protection. Understanding heat transfer rates allows engineers to size equipment correctly and prevent thermal failures.',
    simpleExplanation: 'Touch a metal spoon in hot soup — your hand warms up (conduction through the spoon). The rising steam heats your face (convection of hot air). The glowing heating element radiates energy to the room (radiation). All three mechanisms occur simultaneously in most real situations.',
    detailedExplanation: 'Fourier\'s Law (conduction): q = −kA(dT/dx). Higher thermal conductivity k → faster conduction. Newton\'s Law of Cooling (convection): q = hA(T_s − T_∞). h is the convective heat transfer coefficient (W/m²·K). Stefan-Boltzmann Law (radiation): q = εσA(T_s⁴ − T_surr⁴). ε = emissivity (0-1), σ = 5.67×10⁻⁸ W/(m²·K⁴). Overall heat transfer often involves thermal resistance networks — analogous to electrical resistances in series/parallel.',
    realWorldExample: 'A CPU chip generates up to 150W of heat in an area smaller than your thumbnail. Engineers use forced convection (fans blowing air over a heat sink) to maintain junction temperatures below 100°C. The thermal resistance from chip to ambient air is the key design parameter.',
    formula: 'Conduction (Fourier):    q = -kA dT/dx\nPlane wall:              q = kA(T1-T2)/L\n\nConvection (Newton):     q = h·A·(Ts - T∞)\n\nRadiation (Stefan-Bol.): q = ε·σ·A·(Ts⁴ - Tsurr⁴)\nσ = 5.67×10⁻⁸ W/(m²·K⁴)\n\nThermal resistance:\nR_cond = L/(kA)\nR_conv = 1/(hA)',
    codeExamples: [
      {
        title: 'Thermal Resistance Network — Composite Wall',
        language: 'thermal circuit (K/W)',
        kind: 'worked-example',
        code: `Composite wall — inside 20 °C, outside −10 °C
──────────────────────────────────────────────
Analogy:  Ohm's law for heat  →  Q = ΔT / ΣR
Series-resistance network per m² of wall:

    (inside air)  ─Rconv,in─ [Plaster] ─R1─ [Brick] ─R2─ [Insulation] ─R3─ (outside air) ─Rconv,out─

Given per unit area (A = 1 m²):
    h_in  = 10  W/(m²·K)      L_plaster    = 0.02 m,  k = 0.7  W/(m·K)
    h_out = 25  W/(m²·K)      L_brick      = 0.10 m,  k = 0.9  W/(m·K)
                              L_insulation = 0.05 m,  k = 0.04 W/(m·K)

RESISTANCE OF EACH LAYER
     R = 1/(h·A)     for convection
     R = L/(k·A)     for conduction

┌─────────────┬──────────────────────┬──────────┬─────────┐
│ Layer       │ Formula              │  R (K/W) │  Share  │
├─────────────┼──────────────────────┼──────────┼─────────┤
│ Conv (in)   │ 1/(10·1)             │  0.1000  │   6.5 % │
│ Plaster     │ 0.02/(0.7·1)         │  0.0286  │   1.9 % │
│ Brick       │ 0.10/(0.9·1)         │  0.1111  │   7.3 % │
│ Insulation  │ 0.05/(0.04·1)        │  1.2500  │  81.7 % │
│ Conv (out)  │ 1/(25·1)             │  0.0400  │   2.6 % │
├─────────────┼──────────────────────┼──────────┼─────────┤
│ TOTAL       │  ΣR                  │  1.5297  │  100 %  │
└─────────────┴──────────────────────┴──────────┴─────────┘

HEAT LOSS PER UNIT AREA
    q = ΔT / ΣR
      = (20 − (−10)) / 1.5297
      = 30 / 1.5297
      = 19.6 W/m²`,
        output: `q ≈ 19.6 W/m² of wall
Bottleneck: the 5 cm insulation layer (82 % of ΣR)`,
        explanation: 'The insulation layer alone accounts for 82% of the total thermal resistance, so it — not the brick — sets the heat loss. The engineering rule: always improve the largest resistance first. Doubling insulation thickness roughly doubles ΣR and halves q; doubling brick thickness barely moves the needle.',
      },
    ],
    commonMistakes: [
      'Mixing units: use Kelvin for radiation calculations (T⁴ terms), but ΔT in °C or K gives the same number for differences.',
      'Forgetting convection resistance on both surfaces — it is significant when h is low.',
      'Using conduction formula for fluids in motion — convection is the correct mechanism.',
    ],
    bestPractices: [
      'Draw the thermal resistance network first — it makes series/parallel resistances obvious.',
      'Identify the dominant (largest) resistance — improvements there give the biggest efficiency gains.',
      'For radiation, use absolute Kelvin temperature — T⁴ is extremely sensitive to temperature level.',
    ],
    exercises: [
      'A 0.3 m thick steel wall (k = 50 W/m·K) has T₁ = 200°C and T₂ = 50°C. Calculate heat flux through 1 m² of wall.',
      'A copper sphere (ε = 0.03) at 1000 K radiates to surroundings at 300 K. Calculate radiation heat loss per unit area.',
      'A heat exchanger wall separates hot gas (T=800°C, h=200 W/m²K) from cooling water (T=30°C, h=5000 W/m²K). Calculate overall heat transfer coefficient U.',
    ],
    quizQuestions: [
      {
        question: 'Which mode of heat transfer does NOT require a medium?',
        options: ['Conduction', 'Convection', 'Radiation', 'All require a medium'],
        answer: 2,
        explanation: 'Radiation transfers energy via electromagnetic waves and can propagate through vacuum (e.g., solar energy reaching Earth).',
      },
      {
        question: 'Thermal resistances in series are combined by:',
        options: ['Taking the minimum', 'Adding them together', 'Taking the reciprocal sum', 'Multiplying'],
        answer: 1,
        explanation: 'Like electrical resistances in series, thermal resistances in series add directly: R_total = R₁ + R₂ + ... + Rₙ.',
      },
    ],
    interviewQuestions: [
      'Describe Fourier\'s Law and how it governs the design of building insulation.',
      'What is the overall heat transfer coefficient U and how is it calculated for a composite wall?',
      'How does natural convection differ from forced convection in terms of the heat transfer coefficient h?',
    ],
    summary: 'Heat transfer occurs via conduction (q = −kA dT/dx), convection (q = hAΔT), and radiation (q = εσAT⁴). Thermal resistance networks model multi-layer heat flow, analogous to electrical circuits. The largest resistance dominates — target it for maximum efficiency improvement.',
    nextTopic: undefined,
  },
]
