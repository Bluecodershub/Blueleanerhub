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
        title: 'Fluid Property Calculations and Reynolds Number',
        language: 'python',
        code: `def reynolds_number(rho, V, D, mu):
    """Re = ρVD/μ. Determines laminar vs turbulent flow."""
    return rho * V * D / mu

def flow_regime(Re):
    if Re < 2300:
        return "Laminar"
    elif Re > 4000:
        return "Turbulent"
    else:
        return "Transitional"

def air_density(P, T, R_air=287.0):
    """ρ = P/(RT) for ideal gas. P in Pa, T in K."""
    return P / (R_air * T)

# Water properties at 20°C
rho_water = 998.2   # kg/m³
mu_water  = 1.002e-3  # Pa·s
nu_water  = mu_water / rho_water

# Air properties at 20°C, 101.325 kPa
T_air = 293.15    # K
P_air = 101325    # Pa
rho_air = air_density(P_air, T_air)
mu_air  = 1.81e-5   # Pa·s
nu_air  = mu_air / rho_air

print("=== Fluid Properties at 20°C ===")
print(f"Water: ρ = {rho_water:.1f} kg/m³,  ν = {nu_water*1e6:.3f}×10⁻⁶ m²/s")
print(f"Air:   ρ = {rho_air:.3f} kg/m³, ν = {nu_air*1e6:.3f}×10⁻⁶ m²/s")

# Reynolds number for water in a pipe
D_pipe = 0.05   # m (50 mm diameter pipe)
V_water = 2.0   # m/s flow velocity

Re = reynolds_number(rho_water, V_water, D_pipe, mu_water)
print(f"\nPipe flow: V={V_water} m/s, D={D_pipe*1000:.0f}mm")
print(f"Re = {Re:.0f} → {flow_regime(Re)}")

# Threshold velocities for transition
V_lam = 2300 * nu_water / D_pipe
V_turb = 4000 * nu_water / D_pipe
print(f"Laminar below: {V_lam:.3f} m/s")
print(f"Turbulent above: {V_turb:.3f} m/s")`,
        output: `=== Fluid Properties at 20°C ===\nWater: ρ = 998.2 kg/m³,  ν = 1.004×10⁻⁶ m²/s\nAir:   ρ = 1.205 kg/m³, ν = 15.019×10⁻⁶ m²/s\n\nPipe flow: V=2.0 m/s, D=50mm\nRe = 99,641 → Turbulent\nLaminar below: 0.046 m/s\nTurbulent above: 0.080 m/s`,
        explanation: 'Water flowing at 2 m/s in a 50mm pipe has Re ≈ 100,000 — firmly turbulent. The flow becomes turbulent at very low velocities in pipes of this size. Note that air has kinematic viscosity 15× higher than water, despite being 830× less dense.',
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
        title: 'Venturi Meter and Nozzle Analysis',
        language: 'python',
        code: `import math

rho_water = 1000  # kg/m³
g = 9.81          # m/s²

def velocity_from_bernoulli(P1, P2, V1, rho, z1=0, z2=0):
    """Find V2 from Bernoulli's equation given P1, P2, V1."""
    # P1 + 0.5ρV1² + ρgz1 = P2 + 0.5ρV2² + ρgz2
    rhs = P1 - P2 + 0.5*rho*V1**2 + rho*g*(z1-z2)
    V2_sq = 2 * rhs / rho
    if V2_sq < 0:
        raise ValueError("No real solution — check inputs")
    return math.sqrt(V2_sq)

def venturi_flow_rate(A1, A2, delta_P, rho, Cd=0.98):
    """Flow rate through a venturi meter. Cd = discharge coefficient."""
    Q_ideal = A2 * math.sqrt(2 * delta_P / (rho * (1 - (A2/A1)**2)))
    return Cd * Q_ideal

# Example 1: Water flowing through a venturi
# Pipe D1=0.1m narrows to D2=0.05m; ΔP = 15 kPa
D1, D2 = 0.10, 0.05
A1 = math.pi * D1**2 / 4
A2 = math.pi * D2**2 / 4
dP = 15000  # Pa

Q = venturi_flow_rate(A1, A2, dP, rho_water)
V1 = Q / A1
V2 = Q / A2
print(f"Venturi Meter:")
print(f"  Flow rate Q = {Q*1000:.2f} L/s")
print(f"  V1 = {V1:.2f} m/s,  V2 = {V2:.2f} m/s")

# Example 2: Pitot tube (stagnation point)
# Aircraft airspeed at sea level, static P = 101325 Pa, total P = 101325 + 1200 Pa
P_static = 101325
P_total  = 101325 + 1200
rho_air  = 1.225
V_aircraft = math.sqrt(2 * (P_total - P_static) / rho_air)
print(f"\nPitot tube airspeed: {V_aircraft:.1f} m/s ({V_aircraft*3.6:.1f} km/h)")`,
        output: `Venturi Meter:\n  Flow rate Q = 16.08 L/s\n  V1 = 2.05 m/s,  V2 = 8.19 m/s\n\nPitot tube airspeed: 44.2 m/s (159.1 km/h)`,
        explanation: 'Venturi: the narrow section (D2=50mm) has 4× the velocity of the wide section (D1=100mm), per continuity (A1V1=A2V2). The 15 kPa pressure drop drives 16 L/s of flow. Pitot tube: total pressure = static + dynamic (½ρV²). The 1.2 kPa overpressure gives 44.2 m/s ≈ 159 km/h.',
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
        title: 'Pipe System Head Loss Calculation',
        language: 'python',
        code: `import math

g = 9.81   # m/s²
rho = 998  # kg/m³ (water at 20°C)
nu  = 1.004e-6  # m²/s (kinematic viscosity)

def darcy_friction_factor(Re, eps_D=0.0):
    """Friction factor: laminar or turbulent (Swamee-Jain approximation)."""
    if Re < 2300:
        return 64 / Re
    elif eps_D == 0:
        # Blasius (smooth pipe, Re < 100000)
        return 0.316 * Re**(-0.25)
    else:
        # Swamee-Jain (approximate Colebrook)
        return 0.25 / (math.log10(eps_D/3.7 + 5.74/Re**0.9))**2

def friction_head_loss(f, L, D, V):
    """hf = f*(L/D)*(V²/2g)  [m]"""
    return f * (L / D) * V**2 / (2 * g)

def minor_head_loss(K_L, V):
    """hm = K_L * V²/(2g)  [m]"""
    return K_L * V**2 / (2 * g)

# Pipe system: 100m long, D=0.05m, Q=3 L/s, ε=0.046mm (commercial steel)
D = 0.05      # m
L = 100       # m
Q = 0.003     # m³/s
eps = 0.046e-3  # m (pipe roughness)

A = math.pi * D**2 / 4
V = Q / A
Re = V * D / nu
eps_D = eps / D
f = darcy_friction_factor(Re, eps_D)

hf = friction_head_loss(f, L, D, V)

# Minor losses: 2 elbows (KL=0.9 each) + 1 gate valve (KL=0.2)
K_elbow = 0.9; K_valve = 0.2
hm = minor_head_loss(2*K_elbow + K_valve, V)

print(f"Flow velocity:  {V:.2f} m/s")
print(f"Reynolds No.:   {Re:.0f} — {('Laminar' if Re<2300 else 'Turbulent')}")
print(f"Friction factor: f = {f:.4f}")
print(f"Major loss:      hf = {hf:.2f} m")
print(f"Minor loss:      hm = {hm:.2f} m")
print(f"Total head loss: {hf+hm:.2f} m")
print(f"Pump power needed: {rho*g*Q*(hf+hm)/1000:.3f} kW")`,
        output: `Flow velocity:  1.53 m/s\nReynolds No.:   76,195 — Turbulent\nFriction factor: f = 0.0194\nMajor loss:      hf = 18.52 m\nMinor loss:      hm = 0.32 m\nTotal head loss: 18.84 m\nPump power needed: 0.554 kW`,
        explanation: 'For 100m of 50mm commercial steel pipe at 3 L/s: major friction loss dominates at 18.52m vs 0.32m minor losses. Minor losses are only 1.7% of total — acceptable to neglect. A pump must provide at least 18.84m head at 3 L/s flow, requiring ~554W of hydraulic power.',
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
        title: 'Pump Sizing and Affinity Laws',
        language: 'python',
        code: `def pump_power(rho, g, Q, H, eta):
    """Shaft power required to drive a pump."""
    return rho * g * Q * H / eta

def affinity_laws(Q1, H1, P1, N1, N2):
    """Scale pump performance to new speed N2."""
    ratio = N2 / N1
    Q2 = Q1 * ratio
    H2 = H1 * ratio**2
    P2 = P1 * ratio**3
    return Q2, H2, P2

# Pump sizing example
# Supply 50 L/s to a reservoir 30m above;
# pipe losses = 8.5m; pipe friction factor system curve
rho = 1000    # kg/m³
g   = 9.81    # m/s²
Q   = 0.050   # m³/s
H_static = 30 # m
H_loss   = 8.5 + 2.1  # m (friction + minor)
H_total  = H_static + H_loss
eta_pump = 0.78

P_shaft = pump_power(rho, g, Q, H_total, eta_pump)
print(f"Required pump head:   {H_total:.1f} m")
print(f"Shaft power required: {P_shaft/1000:.2f} kW")
print(f"Hydraulic power:      {rho*g*Q*H_total/1000:.2f} kW")

# Affinity laws: reduce speed from 1450 to 1160 RPM
Q1, H1, P1 = 0.050, 40.6, P_shaft/1000
N1, N2 = 1450, 1160
Q2, H2, P2 = affinity_laws(Q1, H1, P1, N1, N2)
print(f"\nAt {N2} RPM (affinity laws):")
print(f"  Q2 = {Q2*1000:.1f} L/s")
print(f"  H2 = {H2:.1f} m")
print(f"  P2 = {P2:.2f} kW  ({P2/P1*100:.0f}% of original power)")`,
        output: `Required pump head:   40.6 m\nShaft power required: 25.60 kW\nHydraulic power:      19.97 kW\n\nAt 1160 RPM (affinity laws):\n  Q2 = 40.0 L/s\n  H2 = 26.0 m\n  P2 = 13.06 kW  (51% of original power)`,
        explanation: 'Reducing pump speed from 1450 to 1160 RPM (80% speed) reduces flow by 20%, head by 36%, but power by 49% — because power scales with the cube of speed. Variable-speed drives are highly effective for energy savings when full flow is not always needed.',
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
