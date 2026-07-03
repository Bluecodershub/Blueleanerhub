import type { TopicLesson } from '../_shared/types'

export const cadCamLessons: TopicLesson[] = [
  {
    id: 'parametric-cad-modeling',
    title: 'Parametric CAD Modeling',
    intro: 'Parametric CAD builds a 3D model from dimensions, constraints, features, and design intent so changes update predictably.',
    whatIsIt: 'Parametric CAD uses sketches, dimensions, geometric constraints, datum planes, and feature history. A bracket is not just a shape: it is a base plate thickness, hole pattern, web height, fillet radius, and material assignment connected by rules.',
    whyImportant: 'Engineering products change constantly. A correct CAD model lets teams resize parts, update drawings, calculate mass properties, and pass accurate geometry to CAM, FEA, and manufacturing without remodeling from scratch.',
    simpleExplanation: 'Think of parametric CAD as a spreadsheet behind a 3D model. Change the plate thickness from 10 mm to 12 mm and every dependent feature updates if the model was constrained correctly.',
    detailedExplanation: 'A robust CAD model starts with datums, then stable sketches, then features such as extrude, revolve, cut, pattern, mirror, shell, chamfer, and fillet. Good models avoid referencing temporary edges when a datum or master sketch is more stable. Engineering drawings add tolerances, surface finish, material, heat treatment, and inspection requirements. CAD geometry is only useful when it carries design intent.',
    realWorldExample: 'A motor mounting bracket may have a rectangular base, four bolt holes on a bolt circle, a vertical rib, and fillets at stress concentrations. If the motor frame changes, the bolt-circle diameter and rib height can update from parameters while the drawing and mass estimate remain consistent.',
    formula: 'Mass = volume x density\nCylinder hole volume = pi x (d/2)^2 x thickness\nBolt circle coordinate:\nx = R cos(theta)\ny = R sin(theta)',
    codeExamples: [
      {
        title: 'Bracket Mass Properties and Bolt Circle Coordinates',
        language: 'python',
        code: `import math

def cylinder_volume(diameter_mm, height_mm):
    radius = diameter_mm / 2
    return math.pi * radius**2 * height_mm

# Parametric bracket dimensions
base_length = 120  # mm
base_width = 80    # mm
base_thickness = 12
web_length = 90
web_thickness = 10
web_height = 45

hole_diameter = 10
hole_count = 4
bolt_circle_radius = 45
aluminium_density = 2.70e-6  # kg/mm^3

base_volume = base_length * base_width * base_thickness
web_volume = web_length * web_thickness * web_height
hole_volume = hole_count * cylinder_volume(hole_diameter, base_thickness)
net_volume = base_volume + web_volume - hole_volume
mass = net_volume * aluminium_density

print(f"Gross volume: {base_volume + web_volume:.1f} mm^3")
print(f"Hole volume removed: {hole_volume:.1f} mm^3")
print(f"Net volume: {net_volume:.1f} mm^3")
print(f"Estimated mass: {mass:.3f} kg")

print("\\nBolt hole centers:")
for angle_deg in [45, 135, 225, 315]:
    angle_rad = math.radians(angle_deg)
    x = bolt_circle_radius * math.cos(angle_rad)
    y = bolt_circle_radius * math.sin(angle_rad)
    print(f"  {angle_deg:3d} deg: x={x:6.2f} mm, y={y:6.2f} mm")`,
        output: `Gross volume: 155700.0 mm^3\nHole volume removed: 3769.9 mm^3\nNet volume: 151930.1 mm^3\nEstimated mass: 0.410 kg\n\nBolt hole centers:\n   45 deg: x= 31.82 mm, y= 31.82 mm\n  135 deg: x=-31.82 mm, y= 31.82 mm\n  225 deg: x=-31.82 mm, y=-31.82 mm\n  315 deg: x= 31.82 mm, y=-31.82 mm`,
        explanation: 'This is a real CAD-style calculation: dimensions drive volume, mass, and hole positions. The four holes are placed on a 45 mm radius bolt circle. The mass estimate uses aluminium density in kg/mm^3, so the unit conversion is explicit.',
      },
    ],
    commonMistakes: [
      'Fully defining shape but not design intent: dimensions update, but the model breaks after a small change.',
      'Using decorative fillets before functional features; early fillets often make later edits unstable.',
      'Forgetting units when exporting to CAM or FEA; mm vs inch mistakes can scrap parts.',
    ],
    bestPractices: [
      'Start from stable datums and master sketches.',
      'Name key dimensions such as plate_thickness, bolt_circle_radius, and rib_height.',
      'Create drawings only after checking material, mass, tolerances, and hole callouts.',
    ],
    exercises: [
      'Increase base thickness from 12 mm to 16 mm and recalculate mass.',
      'Change the bolt circle radius to 60 mm and list the new hole coordinates.',
      'Explain why a bolt-hole pattern should reference the part origin or datum axes, not random projected edges.',
    ],
    quizQuestions: [
      {
        question: 'Which CAD practice best preserves design intent?',
        options: ['Leaving sketches under-defined', 'Referencing stable datums and named parameters', 'Adding all fillets first', 'Exporting STL before drawings'],
        answer: 1,
        explanation: 'Stable datums and named parameters make future edits predictable and reduce broken feature history.',
      },
    ],
    interviewQuestions: [
      'How do you model a part so it can be resized without breaking?',
      'What information must a manufacturing drawing include beyond the 3D model?',
    ],
    summary: 'Parametric CAD is engineering geometry plus design intent. Correct models use stable references, named dimensions, and material properties so downstream drawings, analysis, and CAM remain reliable.',
    nextTopic: 'cam-process-planning',
  },
  {
    id: 'cam-process-planning',
    title: 'CAM Process Planning',
    intro: 'CAM converts CAD geometry into machining operations, cutting parameters, toolpaths, and machine-readable NC code.',
    whatIsIt: 'Computer-Aided Manufacturing plans how a CNC machine cuts a part: stock setup, work coordinate system, tool selection, spindle speed, feed rate, depth of cut, step-over, entry moves, retracts, and post-processed G-code.',
    whyImportant: 'A correct CAD model can still produce a bad part if CAM is wrong. Incorrect feeds, speeds, clearances, or work offsets can break tools, gouge fixtures, overheat material, or miss tolerance.',
    simpleExplanation: 'CAD says what the part should be. CAM decides how the cutter moves to make it safely and efficiently.',
    detailedExplanation: 'CAM planning starts with material, machine rigidity, tool geometry, and tolerance. Cutting speed sets spindle RPM. Chip load sets feed rate. Step-over and depth of cut control load. Roughing removes stock quickly; finishing leaves accurate surfaces. The postprocessor converts toolpaths into G-code for a specific controller such as Fanuc, Haas, Siemens, or Mach3.',
    realWorldExample: 'For an aluminium pocket, a 16 mm four-flute carbide end mill may rough at 180 m/min cutting speed and 0.06 mm/tooth chip load. A CAM setup calculates spindle RPM, feed rate, number of step-over passes, cycle time, and a safe G-code starting block.',
    formula: 'Spindle speed: N = 1000 Vc / (pi D)\nFeed rate: F = N x z x fz\nPocket passes = ceil(width / step_over)\nCycle time = total_toolpath_length / feed_rate',
    codeExamples: [
      {
        title: 'CNC Feed, Speed, and Pocket Time',
        language: 'python',
        code: `import math

def spindle_speed_rpm(cutting_speed_m_min, tool_diameter_mm):
    return 1000 * cutting_speed_m_min / (math.pi * tool_diameter_mm)

def feed_rate_mm_min(rpm, flute_count, chip_load_mm_tooth):
    return rpm * flute_count * chip_load_mm_tooth

def pocket_roughing_time(length_mm, width_mm, stepover_mm, feed_mm_min):
    passes = math.ceil(width_mm / stepover_mm)
    total_toolpath = passes * length_mm
    time_min = total_toolpath / feed_mm_min
    return passes, total_toolpath, time_min

Vc = 180          # m/min, aluminium with carbide tool
D = 16            # mm end mill diameter
z = 4             # flutes
fz = 0.06         # mm/tooth chip load
pocket_length = 220
pocket_width = 40
stepover = 6

rpm = spindle_speed_rpm(Vc, D)
feed = feed_rate_mm_min(rpm, z, fz)
passes, path_length, time_min = pocket_roughing_time(
    pocket_length, pocket_width, stepover, feed
)

print(f"Spindle speed: {rpm:.0f} rpm")
print(f"Feed rate: {feed:.0f} mm/min")
print(f"Roughing passes: {passes}")
print(f"Toolpath length: {path_length:.0f} mm")
print(f"Cutting time: {time_min:.2f} min")

print("\\nStarter G-code:")
print(f\"G90 G54 G17\")
print(f\"S{rpm:.0f} M03\")
print(f\"G01 F{feed:.0f}\")`,
        output: `Spindle speed: 3581 rpm\nFeed rate: 859 mm/min\nRoughing passes: 7\nToolpath length: 1540 mm\nCutting time: 1.79 min\n\nStarter G-code:\nG90 G54 G17\nS3581 M03\nG01 F859`,
        explanation: 'The spindle speed comes from surface speed and cutter diameter. Feed rate comes from RPM, flute count, and chip load. The pocket needs 7 roughing passes because 40 mm width divided by 6 mm step-over rounds up to 7.',
      },
    ],
    commonMistakes: [
      'Using feed per tooth as feed per revolution or feed per minute.',
      'Forgetting that the postprocessor must match the CNC controller.',
      'Leaving no finishing allowance after roughing.',
    ],
    bestPractices: [
      'Verify work offset, tool length offset, safe Z, and stock dimensions before running code.',
      'Simulate toolpaths for collisions and gouges before posting G-code.',
      'Use conservative first-run feeds, then optimize after checking chips, sound, tool wear, and surface finish.',
    ],
    exercises: [
      'Recalculate RPM and feed for a 10 mm end mill at the same cutting speed and chip load.',
      'If stepover is reduced to 4 mm, how many roughing passes and how much cutting time are required?',
      'Explain why finishing passes usually use smaller step-over and lighter depth of cut than roughing passes.',
    ],
    quizQuestions: [
      {
        question: 'Feed rate in milling is calculated from:',
        options: ['RPM, flute count, and chip load', 'Only tool diameter', 'Only material density', 'Coolant pressure and tool length'],
        answer: 0,
        explanation: 'Milling feed rate is F = N x z x fz, where N is RPM, z is flute count, and fz is chip load per tooth.',
      },
    ],
    interviewQuestions: [
      'How do you choose feeds and speeds for a new material and cutter?',
      'What checks do you perform before running posted G-code on a CNC machine?',
    ],
    summary: 'CAM turns CAD geometry into controlled cutter motion. Correct RPM, feed, step-over, work offsets, simulation, and controller-specific G-code are what make the part safe to machine.',
    nextTopic: undefined,
  },
]
