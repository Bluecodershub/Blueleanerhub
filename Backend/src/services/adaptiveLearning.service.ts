import mongoose from 'mongoose';
import {
  Assessment,
  SkillScores,
  LearningPath,
  MentorInteraction,
  User,
  CourseContent,
  RoadmapNodeProgress
} from '../db';
import { aiService } from './ai.service';
import logger from '../utils/logger';

// ─── DOMAIN-SPECIFIC ADAPTIVE QUESTION BANK ─────────────────────────────────
// High-fidelity pre-cached assessment questions for standard engineering domains.
// Serves as high-speed instant fallback or core pool for adaptive routing.
const QUESTION_BANK: Record<string, Array<{
  id: string;
  type: 'MCQ' | 'DEBUG' | 'LOGIC' | 'CONCEPT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  question: string;
  options?: string[];
  starterCode?: string;
  correctAnswer: string; // Option index (for MCQ) or keyword/correct code
}>> = {
  'Software Engineering': [
    {
      id: 'sw_easy_1',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which of the following data structures operates on a Last-In, First-Out (LIFO) basis?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correctAnswer: '1'
    },
    {
      id: 'sw_easy_2',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What does HTTP status code 404 indicate?',
      options: ['Internal Server Error', 'Unauthorized access', 'Resource not found', 'Bad request syntax'],
      correctAnswer: '2'
    },
    {
      id: 'sw_easy_3',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which sorting algorithm has the best average-case time complexity of O(n log n)?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correctAnswer: '2'
    },
    {
      id: 'sw_easy_4',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'In Object-Oriented Programming, what does "encapsulation" mean?',
      options: ['Hiding data and methods inside a class', 'A class inheriting from another', 'Multiple classes having the same method name', 'Creating abstract blueprints'],
      correctAnswer: '0'
    },
    {
      id: 'sw_easy_5',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctAnswer: '2'
    },
    {
      id: 'sw_medium_1',
      type: 'DEBUG',
      difficulty: 'MEDIUM',
      question: 'Identify the bug in this JavaScript array filtering function. It is supposed to return active users, but it is returning empty or wrong arrays. What is the correction?',
      starterCode: 'function getActiveUsers(users) {\n  return users.filter(u => {\n    u.status = "active";\n  });\n}',
      correctAnswer: 'The filter callback arrow function lacks a return statement or needs to remove the curly braces to perform an implicit return (e.g. u => u.status === "active"). Also, it incorrectly uses assignment (=) instead of comparison (===).'
    },
    {
      id: 'sw_medium_2',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'What is the difference between synchronous and asynchronous programming in Node.js, and when would you use Promises over callbacks?',
      correctAnswer: 'Synchronous code blocks execution until the operation completes. Async code allows the event loop to continue while waiting. Use Promises (or async/await) over callbacks to avoid callback hell, enable cleaner error handling with .catch(), and allow parallel operations with Promise.all().'
    },
    {
      id: 'sw_medium_3',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      question: 'In a RESTful API, which HTTP method should be used for a partial update of a resource?',
      options: ['PUT', 'POST', 'PATCH', 'DELETE'],
      correctAnswer: '2'
    },
    {
      id: 'sw_medium_4',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'Explain the difference between SQL JOINs: INNER JOIN vs LEFT JOIN, with a practical example.',
      correctAnswer: 'INNER JOIN returns only rows where there is a match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (null if no match). Example: Users LEFT JOIN Orders returns all users even those with no orders; INNER JOIN would exclude users with no orders.'
    },
    {
      id: 'sw_hard_1',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Explain the fundamental differences between horizontal and vertical scaling in distributed database architectures, and when you would choose one over the other.',
      correctAnswer: 'Vertical scaling (scaling up) increases the capacity of a single machine (CPU, RAM). Horizontal scaling (scaling out) adds more machines to the resource pool. Choose vertical for simplicity and low latency when limits aren\'t reached; choose horizontal for high availability, fault tolerance, and massive read/write volumes via partitioning/sharding.'
    },
    {
      id: 'sw_hard_2',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'What are SOLID principles in software engineering? Explain any two with a practical example.',
      correctAnswer: 'SOLID: Single Responsibility (a class should have one reason to change), Open/Closed (open for extension, closed for modification), Liskov Substitution (subtypes must be substitutable for base types), Interface Segregation (many specific interfaces better than one general), Dependency Inversion (depend on abstractions, not concretions).'
    },
    {
      id: 'sw_hard_3',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the CAP theorem and explain which two properties a distributed system like MongoDB prioritizes.',
      correctAnswer: 'CAP theorem states a distributed system cannot simultaneously guarantee all three: Consistency, Availability, Partition Tolerance. MongoDB prioritizes Consistency and Partition Tolerance (CP) in its default configuration.'
    },
    {
      id: 'sw_expert_1',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'You need to find a single duplicate number in an unsorted array of N+1 integers where each integer is between 1 and N. Design an O(1) extra space complexity algorithm. What mathematical or pointer-based approach do you use?',
      correctAnswer: 'Floyd\'s Cycle Detection (Tortoise and Hare pointer algorithm) or mathematical sum subtraction (N*(N+1)/2).'
    },
    {
      id: 'sw_expert_2',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'Design a rate limiter for a distributed API gateway serving 100K requests/second. What algorithm and data structures would you use to handle race conditions across multiple server instances?',
      correctAnswer: 'Use Token Bucket or Sliding Window Counter algorithm. Store state in Redis with atomic INCR and TTL operations. For distributed race conditions, use Redis Lua scripts or MULTI/EXEC transactions to ensure atomicity. Implement exponential backoff on the client side for 429 responses.'
    }
  ],
  'Mechanical Engineering': [
    {
      id: 'me_easy_1',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which law of thermodynamics states that energy cannot be created or destroyed, only transformed?',
      options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'],
      correctAnswer: '1'
    },
    {
      id: 'me_easy_2',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which of the following is a commonly used standard material for structural steel in civil and mechanical engineering?',
      options: ['ASTM A36', 'Grade 304 Aluminium', 'PVC Polymer', 'Boron Carbide'],
      correctAnswer: '0'
    },
    {
      id: 'me_medium_1',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'What is stress concentration (stress raiser) in structural design, and what are two common methods to mitigate it in mechanical parts?',
      correctAnswer: 'Stress concentration is a location in a body where stress is significantly higher than neighboring areas, usually caused by sharp corners, holes, or sudden changes in cross-section. Mitigation: Add generous fillets/radii to sharp internal corners, or introduce relief notches/grooves near geometric changes.'
    },
    {
      id: 'me_hard_1',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the physical significance of the Reynolds number (Re) in fluid dynamics, and how it differentiates laminar flow from turbulent flow in pipe systems.',
      correctAnswer: 'Reynolds number is the ratio of inertial forces to viscous forces. In pipe flow, Re < 2300 generally indicates laminar flow (smooth, parallel fluid layers), whereas Re > 4000 indicates turbulent flow (chaotic, eddying motion).'
    },
    {
      id: 'me_expert_1',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'A beam is subject to pure bending. Derive or explain how the bending stress varies across the cross-section of the beam, and identify the location of maximum tensile stress.',
      correctAnswer: 'Bending stress varies linearly with distance from the neutral axis (neutral plane has zero stress). The maximum tensile stress occurs at the outermost fiber on the side of the beam facing the bending center (tension side).'
    },
    {
      id: 'me_easy_3',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What does the term "Young\'s Modulus" represent in material mechanics?',
      options: ['The ratio of stress to strain in the elastic region', 'The maximum stress a material can withstand', 'The energy stored during plastic deformation', 'The ratio of lateral to axial strain'],
      correctAnswer: '0'
    },
    {
      id: 'me_medium_2',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'Explain the difference between a Rankine cycle and a Brayton cycle in thermal engineering.',
      correctAnswer: 'Rankine cycle uses a phase-change working fluid (steam) and is used in steam power plants. Brayton cycle uses gas (air/combustion products) and is used in gas turbines. Both are heat engine cycles but differ in working fluid state and application.'
    },
    {
      id: 'me_hard_2',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the significance of the "factor of safety" in mechanical design, and how it is calculated when material yield strength is known.',
      correctAnswer: 'Factor of Safety (FoS) = (Ultimate/Yield strength) / (Applied stress). It accounts for uncertainties in loads, material properties, and manufacturing defects. A FoS of 2.0 means the part can handle twice the expected load before failure.'
    },
    {
      id: 'me_expert_2',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'A cantilever beam of length L with a point load P at the free end: derive the expression for maximum deflection and identify where maximum bending moment occurs.',
      correctAnswer: 'Maximum deflection at free end: δ_max = PL³/(3EI). Maximum bending moment occurs at the fixed support: M_max = P × L. This follows from integration of the Euler-Bernoulli beam equation with fixed boundary conditions.'
    }
  ],
  'Electronics Engineering': [
    {
      id: 'ee_easy_1',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What is the primary function of a diode in an electronic circuit?',
      options: ['Amplify voltage signals', 'Store electrical charge', 'Allow current to flow in one direction only', 'Regulate resistance'],
      correctAnswer: '2'
    },
    {
      id: 'ee_easy_2',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which component stores energy in the form of an electric field?',
      options: ['Resistor', 'Inductor', 'Capacitor', 'Transistor'],
      correctAnswer: '2'
    },
    {
      id: 'ee_medium_1',
      type: 'DEBUG',
      difficulty: 'MEDIUM',
      question: 'A student designs an LED driver circuit with a 5V supply and a red LED (forward voltage 2V, max current 20mA). They connect the LED directly to the 5V supply without a resistor. Why does the LED burn out immediately, and what resistor value should they have used?',
      starterCode: 'LED connected directly to 5V power supply rails.',
      correctAnswer: 'Without a current-limiting resistor, the current exceeds the maximum 20mA rating, leading to thermal runaway. Resistor = (V_supply - V_led) / I_led = (5V - 2V) / 0.02A = 150 Ohms.'
    },
    {
      id: 'ee_hard_1',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Explain the working principle and benefits of Pulse Width Modulation (PWM) in microcontroller-based motor speed control.',
      correctAnswer: 'PWM controls speed by rapidly switching the voltage ON and OFF. The ratio of ON time to total cycle time is the duty cycle, which determines the average voltage delivered. Benefits: extremely high power efficiency (minimal heat generation compared to linear voltage regulators).'
    },
    {
      id: 'ee_expert_1',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'Explain why a phase-locked loop (PLL) is critical in high-frequency transceiver circuits, and outline its three main structural feedback blocks.',
      correctAnswer: 'PLL stabilizes high-frequency carrier signals and synchronizes clocks. Key blocks: Phase Detector (PD), Low Pass Filter (LPF), and Voltage Controlled Oscillator (VCO).'
    },
    {
      id: 'ee_easy_3',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What is the unit of electrical resistance?',
      options: ['Volt', 'Ampere', 'Ohm', 'Farad'],
      correctAnswer: '2'
    },
    {
      id: 'ee_medium_2',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'Explain the difference between a MOSFET and a BJT transistor and give an application where each is preferred.',
      correctAnswer: 'MOSFET is voltage-controlled (gate drives channel), has very high input impedance, and is preferred in CMOS digital logic and switching power supplies. BJT is current-controlled (base drives collector), has lower input impedance, and is preferred in audio amplifiers and precision analog circuits where linearity is needed.'
    },
    {
      id: 'ee_hard_2',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the Nyquist-Shannon sampling theorem and explain what aliasing is.',
      correctAnswer: 'The Nyquist theorem states that a signal must be sampled at least twice its highest frequency component (fs ≥ 2*f_max) to be reconstructed without error. Aliasing occurs when sampling rate is too low — high-frequency components are misrepresented as lower frequencies in the digitized signal.'
    },
    {
      id: 'ee_expert_2',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'Design an operational amplifier circuit that implements a proportional-integral (PI) controller. Describe the component roles and derive the transfer function.',
      correctAnswer: 'PI controller uses an op-amp with a resistor (R1) in series with a capacitor (C) in the feedback path. Transfer function: H(s) = (1 + 1/R1Cs) = (R1Cs + 1)/(R1Cs). The resistor provides proportional action; the capacitor provides integral action. Eliminates steady-state error in closed-loop control.'
    }
  ],
  'Civil Engineering': [
    {
      id: 'ce_easy_1',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which test is commonly performed to determine the workability and consistency of fresh concrete?',
      options: ['Slump test', 'Tensile strength test', 'Proctor compaction test', 'Standard penetration test'],
      correctAnswer: '0'
    },
    {
      id: 'ce_easy_2',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'What is the standard water-cement ratio range for producing durable concrete in normal conditions?',
      options: ['0.8 – 1.2', '0.4 – 0.6', '0.1 – 0.2', '1.5 – 2.0'],
      correctAnswer: '1'
    },
    {
      id: 'ce_medium_1',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'Explain the difference between a load-bearing wall and a partition wall in residential structure design, and what structural precautions are required when modifying them.',
      correctAnswer: 'Load-bearing walls support gravity loads from slabs and roofs above; partition walls only divide space. Precautions: load-bearing walls must never be demolished without inserting structural lintels or transfer beams designed by structural engineers.'
    },
    {
      id: 'ce_hard_1',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the shear failure mechanism in concrete beams, and explain how stirrups (shear reinforcement) help prevent diagonal tension cracks.',
      correctAnswer: 'Shear failure is brittle and caused by diagonal tension stresses. Stirrups are placed vertically or diagonally across potential crack planes to intercept diagonal cracks, carrying tensile forces and providing confinement to core concrete.'
    },
    {
      id: 'ce_expert_1',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'Define the term "Ultimate Limit State (ULS)" versus "Serviceability Limit State (SLS)" in limit state design. Give two safety factors applied in concrete design codes.',
      correctAnswer: 'ULS ensures structural safety under extreme loads (collapse prevention). SLS ensures user comfort and operational integrity (limits deflection, cracking, vibration). concrete load safety factor (1.5 for live loads, 1.2 for dead loads).'
    },
    {
      id: 'ce_easy_3',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'In soil mechanics, what does the "bearing capacity" of a soil refer to?',
      options: ['Maximum load a pile can carry', 'Maximum load per unit area a soil can support without failure', 'Water content of soil', 'Permeability of soil layers'],
      correctAnswer: '1'
    },
    {
      id: 'ce_medium_2',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'Explain the purpose of reinforcement in Reinforced Concrete (RC) and the role of tension and compression zones in a simply supported beam.',
      correctAnswer: 'Concrete is strong in compression but weak in tension. Steel reinforcement (rebar) is placed in the tension zone (bottom of beam) to resist tensile stresses. The top zone handles compression via concrete. The neutral axis separates tension and compression zones.'
    },
    {
      id: 'ce_hard_2',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Describe the Mohr-Coulomb failure criterion in soil mechanics and its two parameters.',
      correctAnswer: 'Mohr-Coulomb criterion: τ_f = c + σ\'tan(φ), where τ_f = shear strength at failure, c = cohesion intercept, σ\' = effective normal stress, φ = angle of internal friction. c represents the shear strength at zero normal stress (clay has high c); φ represents friction (sand has high φ).'
    },
    {
      id: 'ce_expert_2',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'A retaining wall retains a saturated soil with specific weight γ_sat = 20 kN/m³ and water table at the surface. Using Rankine\'s theory, what is the active earth pressure at depth H? How does pore water pressure affect the total lateral pressure?',
      correctAnswer: 'Active earth pressure: Pa = Ka × γ\'× H, where Ka = (1-sinφ)/(1+sinφ) and γ\' = γ_sat - γ_water (submerged unit weight). Total lateral pressure = active earth pressure + pore water pressure (u = γ_w × H). Saturated conditions significantly increase total lateral pressure compared to dry conditions.'
    }
  ],
  'Robotics Engineering': [
    {
      id: 're_easy_1',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'In robotics, what does the acronym "IMU" stand for, which is critical for navigation and stabilization?',
      options: ['Integrated Motion Unit', 'Inertial Measurement Unit', 'Intelligent Mobile Utility', 'Internal Master Unit'],
      correctAnswer: '1'
    },
    {
      id: 're_easy_2',
      type: 'MCQ',
      difficulty: 'EASY',
      question: 'Which communication protocol is most commonly used to connect sensors to microcontrollers in embedded robotics systems over short distances?',
      options: ['Ethernet', 'Bluetooth 5.0', 'I2C / SPI', 'LoRaWAN'],
      correctAnswer: '2'
    },
    {
      id: 're_medium_1',
      type: 'CONCEPT',
      difficulty: 'MEDIUM',
      question: 'What is the mathematical difference between Forward Kinematics (FK) and Inverse Kinematics (IK) in jointed robotic arms?',
      correctAnswer: 'Forward Kinematics calculates the end-effector\'s Cartesian position given the joint angles. Inverse Kinematics calculates the required joint angles to achieve a target end-effector Cartesian position.'
    },
    {
      id: 're_hard_1',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Explain the PID control loop feedback mechanism and how tuning the proportional (P), integral (I), and derivative (D) gains affects robot joint overshoot and steady-state error.',
      correctAnswer: 'P reduces rise time but increases overshoot. I eliminates steady-state error but increases oscillation risk. D increases damping, reducing overshoot and settling time.'
    },
    {
      id: 're_expert_1',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'What is SLAM (Simultaneous Localization and Mapping)? Name two common filters or optimization methods used to solve SLAM in autonomous warehouse robots.',
      correctAnswer: 'SLAM is the computational problem of constructing a map of an unknown environment while tracking agent location. Algorithms: Extended Kalman Filters (EKF-SLAM), Particle Filters (FastSLAM), or Graph-based optimization (g2o).'
    },
    {
      id: 're_medium_2',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      question: 'In the ROS 2 framework, what is the primary purpose of a "node"?',
      options: ['A physical robot component', 'An executable process that performs computation and communicates via topics/services', 'A configuration file for the robot', 'A database for sensor logs'],
      correctAnswer: '1'
    },
    {
      id: 're_hard_2',
      type: 'CONCEPT',
      difficulty: 'HARD',
      question: 'Explain the difference between reactive and deliberative robot architectures, and give one use case where each is preferred.',
      correctAnswer: 'Reactive architectures respond directly to sensor inputs (no internal model); best for fast obstacle avoidance. Deliberative architectures plan ahead using internal world models; best for complex path planning in structured environments like warehouses.'
    },
    {
      id: 're_expert_2',
      type: 'LOGIC',
      difficulty: 'EXPERT',
      question: 'Describe how a Kalman Filter works at a high level and why it is particularly useful in robot localization under noisy sensor conditions.',
      correctAnswer: 'Kalman Filter is a recursive Bayesian estimator that combines predictions from a motion model with measurements from sensors, weighted by their covariance uncertainties. It minimizes mean squared estimation error and is optimal for linear Gaussian systems, making it ideal for GPS+IMU fusion in robotics.'
    }
  ]
};

// General fallback quiz if a custom domain is selected
const GENERAL_QUESTIONS = [
  {
    id: 'gen_easy_1',
    type: 'MCQ' as const,
    difficulty: 'EASY' as const,
    question: 'In modern product engineering, what is the primary purpose of creating a Minimum Viable Product (MVP)?',
    options: [
      'To build a highly optimized production-scale backend architecture',
      'To test product hypotheses with minimal resources and gather immediate user feedback',
      'To maximize marketing and sales budgets before product launch',
      'To replace high-end engineering models with draft wireframes'
    ],
    correctAnswer: '1'
  },
  {
    id: 'gen_medium_1',
    type: 'CONCEPT' as const,
    difficulty: 'MEDIUM' as const,
    question: 'Describe what the Agile framework is and how continuous integration/continuous deployment (CI/CD) benefits software project management.',
    correctAnswer: 'Agile is an iterative project management approach focusing on collaboration, customer feedback, and small rapid releases. CI/CD automates testing and deployment, reducing manual errors, accelerating feedback loops, and ensuring main branch stability.'
  },
  {
    id: 'gen_hard_1',
    type: 'CONCEPT' as const,
    difficulty: 'HARD' as const,
    question: 'What are the main tradeoffs between monolithic architectures and microservices architectures in scalable enterprise engineering?',
    correctAnswer: 'Monolith is simple to build, test, and deploy but suffers from scaling limits, long build times, and high coupling. Microservices offer decoupling, independent scaling, and fault isolation, but introduce high complexity in network traffic, data consistency, and DevOps.'
  }
];

export class AdaptiveLearningService {
  /**
   * Initializes or fetches the assessment flow for a user.
   */
  static async getOrCreateAssessment(userId: string, domain: string): Promise<any> {
    let assessment = await Assessment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain,
      status: 'IN_PROGRESS'
    });

    if (!assessment) {
      // Pick initial set of questions based on domain
      const pool = QUESTION_BANK[domain] || GENERAL_QUESTIONS;
      const initialQuestion = pool.find(q => q.difficulty === 'EASY') || pool[0];

      assessment = await Assessment.create({
        userId: new mongoose.Types.ObjectId(userId),
        domain,
        status: 'IN_PROGRESS',
        currentStep: 0,
        totalQuestions: 5,
        questions: [{
          questionId: initialQuestion.id,
          type: initialQuestion.type,
          difficulty: initialQuestion.difficulty,
          question: initialQuestion.question,
          options: initialQuestion.options,
          starterCode: initialQuestion.starterCode,
          correctAnswer: initialQuestion.correctAnswer
        }]
      });
    }

    return assessment;
  }

  /**
   * Submits an answer, evaluates it, and generates the next adaptive question.
   */
  static async submitAnswer(
    userId: string,
    assessmentId: string,
    userAnswer: string,
    confidenceRating: number
  ): Promise<any> {
    const assessment = await Assessment.findOne({
      _id: new mongoose.Types.ObjectId(assessmentId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!assessment) throw new Error('Assessment not found');
    if (assessment.status === 'COMPLETED') return assessment;

    const currentStep = assessment.currentStep;
    const currentQ = assessment.questions[currentStep];

    // Evaluate answer correctness (simple comparison or keyword search)
    let isCorrect = false;
    if (currentQ.options && currentQ.options.length > 0) {
      isCorrect = currentQ.correctAnswer.trim() === userAnswer.trim();
    } else {
      // Keyword/heuristic check for open questions
      const words = currentQ.correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const matches = words.filter(w => userAnswer.toLowerCase().includes(w));
      isCorrect = matches.length >= Math.min(2, words.length);
    }

    // Record user answer details
    currentQ.userAnswer = userAnswer;
    currentQ.confidenceRating = confidenceRating;
    currentQ.isCorrect = isCorrect;

    // Check if assessment completed
    const nextStep = currentStep + 1;
    if (nextStep >= assessment.totalQuestions) {
      assessment.status = 'COMPLETED';
      assessment.completedAt = new Date();

      // Score only against questions that were actually answered to avoid
      // dividing by totalQuestions when the array is shorter (edge case).
      const answeredQuestions = assessment.questions.filter(q => q.userAnswer !== undefined);
      const correctCount = answeredQuestions.filter(q => q.isCorrect).length;
      const denominator = answeredQuestions.length || assessment.totalQuestions;
      assessment.overallScore = Math.round((correctCount / denominator) * 100);
      await assessment.save();
      return assessment;
    }

    // Otherwise, adaptively route next question based on performance!
    const pool = QUESTION_BANK[assessment.domain] || GENERAL_QUESTIONS;
    let targetDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' = 'EASY';

    if (isCorrect) {
      // Step up difficulty
      if (currentQ.difficulty === 'EASY') targetDifficulty = 'MEDIUM';
      else if (currentQ.difficulty === 'MEDIUM') targetDifficulty = 'HARD';
      else targetDifficulty = 'EXPERT';
    } else {
      // Maintain or step down
      if (currentQ.difficulty === 'EXPERT') targetDifficulty = 'HARD';
      else if (currentQ.difficulty === 'HARD') targetDifficulty = 'MEDIUM';
      else targetDifficulty = 'EASY';
    }

    // Pick question from pool that hasn't been asked yet
    const askedIds = new Set(assessment.questions.map(q => q.questionId));
    let nextQ = pool.find(q => q.difficulty === targetDifficulty && !askedIds.has(q.id));

    // Fallback if no matching difficulty question is available
    if (!nextQ) {
      nextQ = pool.find(q => !askedIds.has(q.id));
    }

    // Fallback: If pool exhausted, generate a dynamic question via Gemini/Local LLM!
    if (!nextQ) {
      try {
        const dynamicPrompt = `
          Generate a technical quiz question for the domain: ${assessment.domain}.
          Difficulty level: ${targetDifficulty}.
          Make it a professional engineering topic.
          Respond strictly in JSON format matching this schema:
          {
            "id": "dynamic_${Date.now()}",
            "type": "MCQ",
            "question": "The question content here?",
            "options": ["Concrete answer choice", "Concrete distractor", "Concrete distractor", "Concrete distractor"],
            "correctAnswer": "index_of_correct_option_0_to_3"
          }
          Do not use placeholder labels such as "Option A" or "Choice 1".
        `;
        const aiResponse = await aiService.generate(dynamicPrompt);
        const parsed = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
        const options = Array.isArray(parsed.options)
          ? parsed.options.map((option: unknown) => String(option).trim()).filter(Boolean)
          : [];
        const correctAnswer = Number(parsed.correctAnswer);
        const hasPlaceholderOption = options.some((option: string) => /^option\s+[a-d]$/i.test(option));
        if (
          typeof parsed.question !== 'string' ||
          !parsed.question.trim() ||
          options.length !== 4 ||
          hasPlaceholderOption ||
          !Number.isInteger(correctAnswer) ||
          correctAnswer < 0 ||
          correctAnswer > 3
        ) {
          throw new Error('AI generated an invalid adaptive question');
        }
        nextQ = {
          id: parsed.id || `dyn_${Date.now()}`,
          type: parsed.type || 'MCQ',
          difficulty: targetDifficulty,
          question: parsed.question.trim(),
          options,
          correctAnswer: String(correctAnswer)
        };
      } catch (err) {
        logger.error('Dynamic AI question generation failed, falling back to static general question', err);
        // Absolute fallback to a general question
        nextQ = GENERAL_QUESTIONS.find(q => !askedIds.has(q.id)) || GENERAL_QUESTIONS[0];
      }
    }

    if (!nextQ) {
      throw new Error('No adaptive assessment question is available');
    }

    // Add the next question to the assessment
    assessment.questions.push({
      questionId: nextQ.id,
      type: nextQ.type,
      difficulty: nextQ.difficulty,
      question: nextQ.question,
      options: nextQ.options,
      starterCode: nextQ.starterCode,
      correctAnswer: nextQ.correctAnswer
    });

    assessment.currentStep = nextStep;
    await assessment.save();

    return assessment;
  }

  /**
   * Finalizes assessment, runs the AI Skill Analyzer to compute placement level and skills,
   * and builds the initial custom Roadmap nodes and tree.
   */
  static async finalizeAssessment(userId: string, domain: string): Promise<any> {
    const assessment = await Assessment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain,
      status: 'COMPLETED'
    });

    if (!assessment) throw new Error('No completed assessment found for this user and domain');

    // Run AI Skill Analyzer logic
    const avgConfidence = assessment.questions.reduce((sum, q) => sum + (q.confidenceRating || 5), 0) / assessment.totalQuestions;

    // Calculate level (0-10) based on correct answers and difficulty factors
    // Easy correct = 1pt, Medium = 2pts, Hard = 3pts, Expert = 4pts
    let weightedScore = 0;
    let maxPossible = 0;
    assessment.questions.forEach(q => {
      const weight = q.difficulty === 'EASY' ? 1 : q.difficulty === 'MEDIUM' ? 2 : q.difficulty === 'HARD' ? 3 : 4;
      maxPossible += weight;
      if (q.isCorrect) weightedScore += weight;
    });

    const levelRatio = weightedScore / maxPossible;
    const computedLevel = Math.max(1, Math.min(10, Math.round(levelRatio * 10 + (avgConfidence - 5) * 0.2)));

    // Generate specific sub-skills scores based on domain
    let subSkills: Array<{ name: string; score: number; level: number }> = [];
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let estimatedLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' = 'BEGINNER';
    let skillGaps: string[] = [];

    if (computedLevel >= 8) estimatedLevel = 'EXPERT';
    else if (computedLevel >= 6) estimatedLevel = 'ADVANCED';
    else if (computedLevel >= 4) estimatedLevel = 'INTERMEDIATE';
    else estimatedLevel = 'BEGINNER';

    if (domain === 'Software Engineering') {
      subSkills = [
        { name: 'Core Coding & Syntax', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Data Structures & Algorithms', score: Math.round(levelRatio * 90), level: Math.max(1, computedLevel - 1) },
        { name: 'System Design & Scaling', score: Math.round(levelRatio * 75), level: Math.max(1, computedLevel - 2) },
        { name: 'Development Tools & Git', score: Math.round(levelRatio * 95), level: computedLevel }
      ];
      strengths = ['Code logical reasoning', 'Tool configuration'];
      weaknesses = ['High-scale distributed networks', 'Asymmetric complex data structures'];
      skillGaps = ['System Design Patterns', 'Distributed Sharding & Caching'];
    } else if (domain === 'Mechanical Engineering') {
      subSkills = [
        { name: 'Thermodynamics & Heat Transfer', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Statics & Strength of Materials', score: Math.round(levelRatio * 90), level: Math.max(1, computedLevel - 1) },
        { name: 'Fluid Mechanics & CFD', score: Math.round(levelRatio * 75), level: Math.max(1, computedLevel - 2) },
        { name: 'CAD & Manufacturing Processes', score: Math.round(levelRatio * 85), level: computedLevel }
      ];
      strengths = ['Thermodynamic cycle analysis', 'Static structural calculations'];
      weaknesses = ['Advanced computational fluid dynamics', 'Fatigue & fracture mechanics'];
      skillGaps = ['Finite Element Analysis (FEA)', 'Composite material design'];
    } else if (domain === 'Electronics Engineering') {
      subSkills = [
        { name: 'Circuit Analysis & Design', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Embedded Systems & Microcontrollers', score: Math.round(levelRatio * 90), level: Math.max(1, computedLevel - 1) },
        { name: 'Signals & Systems', score: Math.round(levelRatio * 80), level: Math.max(1, computedLevel - 2) },
        { name: 'PCB Design & Communication Protocols', score: Math.round(levelRatio * 85), level: computedLevel }
      ];
      strengths = ['Analog circuit fundamentals', 'Microcontroller peripheral configuration'];
      weaknesses = ['High-frequency RF design', 'Digital signal processing algorithms'];
      skillGaps = ['Mixed-signal PCB layout', 'FPGA & VHDL programming'];
    } else if (domain === 'Civil Engineering') {
      subSkills = [
        { name: 'Structural Analysis & Design', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Concrete & Steel Technology', score: Math.round(levelRatio * 90), level: Math.max(1, computedLevel - 1) },
        { name: 'Geotechnical Engineering', score: Math.round(levelRatio * 75), level: Math.max(1, computedLevel - 2) },
        { name: 'Surveying & Construction Management', score: Math.round(levelRatio * 80), level: computedLevel }
      ];
      strengths = ['Reinforced concrete design', 'Load path analysis'];
      weaknesses = ['Seismic and dynamic load analysis', 'Advanced soil mechanics'];
      skillGaps = ['BIM & Revit modelling', 'Limit state design for seismic zones'];
    } else if (domain === 'Robotics Engineering') {
      subSkills = [
        { name: 'Control Loops & PID', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Kinematics & Modeling', score: Math.round(levelRatio * 80), level: Math.max(1, computedLevel - 1) },
        { name: 'Localization & SLAM', score: Math.round(levelRatio * 70), level: Math.max(1, computedLevel - 2) },
        { name: 'Sensors & ROS integration', score: Math.round(levelRatio * 90), level: computedLevel }
      ];
      strengths = ['Feedback controllers tuning', 'Hardware sensor feeds'];
      weaknesses = ['Complex dynamic reverse kinematics', 'Unmapped visual SLAM solvers'];
      skillGaps = ['Non-linear mechanical models', 'ROS2 multi-node networks'];
    } else {
      subSkills = [
        { name: 'Domain Foundations', score: Math.round(levelRatio * 100), level: computedLevel },
        { name: 'Applied Math & Logic', score: Math.round(levelRatio * 85), level: Math.max(1, computedLevel - 1) },
        { name: 'Professional Tools', score: Math.round(levelRatio * 75), level: Math.max(1, computedLevel - 2) }
      ];
      strengths = ['Logical thinking', 'Standard engineering equations'];
      weaknesses = ['Advanced simulation software', 'Iterative failure safety margins'];
      skillGaps = ['Complex design systems', 'Industry validation tools'];
    }

    // Call Gemini/AI model to refine scores and insights (async background or immediate await)
    try {
      const refinementPrompt = `
        Analyze these quiz results for an engineering student in ${domain}:
        - Level Ratio: ${levelRatio}
        - Computed Level (0-10): ${computedLevel}
        - Core Domain Strengths: ${strengths.join(', ')}
        - Core Domain Weaknesses: ${weaknesses.join(', ')}
        
        Provide highly customized strengths, weaknesses, and skill gaps in exact JSON format:
        {
          "strengths": ["Custom strength 1", "Custom strength 2"],
          "weaknesses": ["Custom weakness 1", "Custom weakness 2"],
          "skillGaps": ["Custom skill gap 1", "Custom skill gap 2"]
        }
      `;
      const aiResponse = await aiService.generate(refinementPrompt);
      const parsed = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
      if (parsed.strengths) strengths = parsed.strengths;
      if (parsed.weaknesses) weaknesses = parsed.weaknesses;
      if (parsed.skillGaps) skillGaps = parsed.skillGaps;
    } catch (err) {
      logger.error('AI refinement of scores failed, using static defaults', err);
    }

    // Create or Update Skill Scores
    const finalScores = await SkillScores.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), domain },
      {
        overallLevel: computedLevel,
        skills: subSkills,
        strengths,
        weaknesses,
        estimatedLevel,
        skillGaps,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update main User document
    await User.findByIdAndUpdate(userId, {
      domain,
      level: computedLevel,
      skills: subSkills.map(s => ({ name: s.name, level: s.level })),
      updatedAt: new Date()
    });

    // ─── ROADMAP GENERATOR ──────────────────────────────────────────────────
    // Build a structured, highly responsive roadmap styled for our skill tree.
    const nodes = [
      {
        nodeId: 'node_1_foundations',
        title: `${domain} Foundations`,
        description: `Master basic math, core concepts, and introductory syntax for ${domain}.`,
        category: 'Foundations',
        status: 'UNLOCKED' as 'LOCKED' | 'UNLOCKED' | 'COMPLETED',
        xpAwarded: 500,
        estimatedWeeks: 3,
        skillsRequired: [],
        skillsUnlocked: [subSkills[0].name],
        recommendedProjects: [
          {
            title: `Introductory ${domain} Shell`,
            description: `Build a clean, baseline application demonstrating syntax rules.`,
            difficulty: 'BEGINNER'
          }
        ],
        recommendedHackathons: []
      },
      {
        nodeId: 'node_2_core',
        title: `Core Engineering & Tools`,
        description: `Dive deep into standard methodologies, frameworks, and data structures.`,
        category: 'Core',
        status: 'LOCKED' as 'LOCKED' | 'UNLOCKED' | 'COMPLETED',
        xpAwarded: 1000,
        estimatedWeeks: 4,
        skillsRequired: [subSkills[0].name],
        skillsUnlocked: [subSkills[1].name],
        recommendedProjects: [
          {
            title: `Mid-level Dynamic ${domain} System`,
            description: `A responsive design utilizing core models and data pipelines.`,
            difficulty: 'INTERMEDIATE'
          }
        ],
        recommendedHackathons: [
          {
            title: 'BlueLearner Sprint hackathon',
            theme: 'Rapid MVP Prototyping'
          }
        ]
      },
      {
        nodeId: 'node_3_advanced',
        title: `Advanced Architecture & Scaling`,
        description: `Implement optimization, error handling, performance profiling, and distributed designs.`,
        category: 'Advanced',
        status: 'LOCKED' as 'LOCKED' | 'UNLOCKED' | 'COMPLETED',
        xpAwarded: 1500,
        estimatedWeeks: 5,
        skillsRequired: [subSkills[1].name],
        skillsUnlocked: [subSkills.length > 2 ? subSkills[2].name : 'System Tuning'],
        recommendedProjects: [
          {
            title: `Enterprise Scaled ${domain} Suite`,
            description: `A production-grade environment optimized for high volumes.`,
            difficulty: 'ADVANCED'
          }
        ],
        recommendedHackathons: [
          {
            title: 'National Tech-Builders Arena',
            theme: 'Scalability & System Tuning'
          }
        ]
      },
      {
        nodeId: 'node_4_capstone',
        title: `${domain} Capstone Integration`,
        description: `Synthesize everything to create a fully optimized, real-world industry ready solution.`,
        category: 'Capstone',
        status: 'LOCKED' as 'LOCKED' | 'UNLOCKED' | 'COMPLETED',
        xpAwarded: 2500,
        estimatedWeeks: 6,
        skillsRequired: [subSkills.length > 2 ? subSkills[2].name : 'System Tuning'],
        skillsUnlocked: ['Full Mastery Badge'],
        recommendedProjects: [
          {
            title: 'Industry Grade Capstone Pipeline',
            description: 'A massive deployment project reviewed by our senior AI architect.',
            difficulty: 'EXPERT'
          }
        ],
        recommendedHackathons: [
          {
            title: 'BlueLearner Grand Championship',
            theme: 'Industry-scale AI Integrations'
          }
        ]
      }
    ];

    // If computed level places them higher, auto-unlock initial nodes!
    if (computedLevel >= 6) {
      nodes[0].status = 'COMPLETED';
      nodes[1].status = 'COMPLETED';
      nodes[2].status = 'UNLOCKED';
    } else if (computedLevel >= 4) {
      nodes[0].status = 'COMPLETED';
      nodes[1].status = 'UNLOCKED';
    }

    const learningPath = await LearningPath.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), domain },
      {
        nodes,
        progressPercent: Math.round((nodes.filter(n => n.status === 'COMPLETED').length / nodes.length) * 100),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return {
      scores: finalScores,
      roadmap: learningPath
    };
  }

  /**
   * Generates a streaming domain-specific AI mentor chat response.
   */
  static async chatWithMentorStream(
    userId: string,
    mentorDomain: 'Software' | 'Mechanical' | 'Electronics' | 'Civil' | 'Robotics',
    message: string
  ): Promise<any> {
    // Record user message
    let interaction = await MentorInteraction.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      mentorDomain
    });

    if (!interaction) {
      interaction = await MentorInteraction.create({
        userId: new mongoose.Types.ObjectId(userId),
        mentorDomain,
        chatHistory: []
      });
    }

    interaction.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });

    // Keep only the last 100 messages to prevent unbounded document growth
    const MAX_HISTORY = 100;
    if (interaction.chatHistory.length > MAX_HISTORY) {
      interaction.chatHistory = interaction.chatHistory.slice(-MAX_HISTORY);
    }
    await interaction.save();

    // Fetch user details for context enrichment
    const user = await User.findById(userId).lean();

    // Fetch streaming assistant response from central aiService
    const systemPrompts = {
      Software: 'You are the Senior Software Architecture Mentor. Give exact code fixes, clean SOLID models, and scaling tips.',
      Mechanical: 'You are the CAD & Thermodynamics Design Lead. Guide students through stress limits, thermal dynamics, and materials.',
      Electronics: 'You are the Embedded Circuits & IoT Tutor. Guide students with circuit designs, resistance maths, and microcontroller registers.',
      Civil: 'You are the Structural Civil Engineering Mentor. Explain load transfers, concrete limit states, and shear stirrups.',
      Robotics: 'You are the Robotics & Autonomous Systems Advisor. Cover kinematic matrices, PID loops, and SLAM equations.'
    };

    const personaMapping = {
      Software: 'technical' as const,
      Mechanical: 'tutor' as const,
      Electronics: 'tutor' as const,
      Civil: 'technical' as const,
      Robotics: 'technical' as const
    };

    const context = {
      userName: user?.fullName || 'Learner',
      domain: user?.domain || mentorDomain,
      level: user?.level || 1,
      path: `/student/mentors/${mentorDomain}`
    };

    const prompt = `
      ${systemPrompts[mentorDomain]}
      User Query: ${message}
    `;

    const stream = await aiService.chatAssistantStream(
      prompt,
      context,
      personaMapping[mentorDomain]
    );

    return {
      stream,
      interaction
    };
  }

  /**
   * Saves the assistant's final response to the history cache.
   */
  static async saveMentorResponse(
    userId: string,
    mentorDomain: string,
    responseContent: string
  ): Promise<void> {
    await MentorInteraction.updateOne(
      { userId: new mongoose.Types.ObjectId(userId), mentorDomain },
      {
        $push: {
          chatHistory: {
            role: 'assistant',
            content: responseContent,
            timestamp: new Date()
          }
        },
        $set: { lastActiveAt: new Date() }
      }
    );
  }

  /**
   * Generates or retrieves AI-powered lesson content for a specific roadmap node.
   * Content is cached in MongoDB after first generation to avoid repeated AI calls.
   */
  static async generateNodeContent(
    userId: string,
    nodeId: string,
    domain: string,
    nodeTitle: string,
    userLevel: string = 'BEGINNER'
  ): Promise<any> {
    // Check cache first — avoid re-generating if already created for this user+node
    const existing = await CourseContent.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      nodeId
    }).lean();

    if (existing) {
      // Increment view count without blocking
      CourseContent.updateOne(
        { userId: new mongoose.Types.ObjectId(userId), nodeId },
        { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } }
      ).catch(() => {});
      return existing;
    }

    // Generate with the configured inbuilt AI provider
    const prompt = `
You are an expert ${domain} professor at the world's best engineering university.
Generate a comprehensive, engaging lesson for a ${userLevel} level student on the topic: "${nodeTitle}".

The content must be:
- Educational, practical, and detailed like a W3Schools/GeeksForGeeks tutorial
- Include real-world examples and code/formulas where applicable
- Structured in clearly defined sections
- Include mini-quiz questions to reinforce learning
- Use concrete quiz answer text; never use placeholders like "Option A" or "Choice 1"

Respond STRICTLY in the following JSON format (no extra text):
{
  "estimatedMinutes": 35,
  "sections": [
    {
      "type": "intro",
      "title": "What is ${nodeTitle}?",
      "content": "Full introduction text here..."
    },
    {
      "type": "concept",
      "title": "Core Concept Name",
      "content": "Detailed explanation..."
    },
    {
      "type": "code",
      "title": "Practical Example",
      "content": "Explanation of the code",
      "language": "python",
      "explanation": "What this code demonstrates..."
    },
    {
      "type": "quiz",
      "title": "Check Your Understanding",
      "content": "Quick knowledge check",
      "quiz": [
        {
          "question": "Quiz question here?",
          "options": ["Concrete answer choice", "Concrete distractor", "Concrete distractor", "Concrete distractor"],
          "correctIndex": 1,
          "explanation": "Explanation why this is correct..."
        }
      ]
    },
    {
      "type": "summary",
      "title": "Key Takeaways",
      "content": "Summary of what was learned..."
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "furtherReading": [
    { "title": "Reference 1", "description": "What this covers..." },
    { "title": "Reference 2", "description": "What this covers..." }
  ],
  "practiceExercises": [
    {
      "title": "Exercise Title",
      "description": "What the student should implement/solve...",
      "starterCode": "// starter code if applicable",
      "language": "python",
      "difficulty": "EASY"
    }
  ]
}`;

    let contentData: any = null;

    try {
      const aiResponse = await aiService.generate(prompt);
      const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      contentData = JSON.parse(cleaned);
    } catch (err) {
      logger.error('AI course content generation failed', err);
      throw new Error('AI course content generation failed. Please retry when the AI service is available.');
    }

    const sections = Array.isArray(contentData.sections) ? contentData.sections : [];
    const hasPlaceholderQuizOption = sections.some((section: any) =>
      Array.isArray(section.quiz) &&
      section.quiz.some((quiz: any) =>
        Array.isArray(quiz.options) &&
        quiz.options.some((option: unknown) => /^option\s+[a-d]$/i.test(String(option).trim()))
      )
    );
    if (!sections.length || hasPlaceholderQuizOption) {
      throw new Error('AI course content response failed validation.');
    }

    // Save to DB
    const saved = await CourseContent.create({
      userId: new mongoose.Types.ObjectId(userId),
      nodeId,
      domain,
      nodeTitle,
      estimatedMinutes: contentData.estimatedMinutes || 30,
      level: userLevel,
      sections: contentData.sections || [],
      keyTakeaways: contentData.keyTakeaways || [],
      furtherReading: contentData.furtherReading || [],
      practiceExercises: contentData.practiceExercises || [],
      viewCount: 1,
      lastViewedAt: new Date()
    });

    return saved;
  }

  /**
   * Updates the progress status of a roadmap node for a user.
   * Automatically unlocks dependent nodes and awards XP upon completion.
   */
  static async updateNodeProgress(
    userId: string,
    domain: string,
    nodeId: string,
    status: 'IN_PROGRESS' | 'COMPLETED',
    xpToAward: number = 0
  ): Promise<any> {
    const update: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'COMPLETED') {
      update.completedAt = new Date();
      update.xpAwarded = xpToAward;
    }

    const progress = await RoadmapNodeProgress.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), domain, nodeId },
      update,
      { upsert: true, new: true }
    );

    // Update the LearningPath embedded node status
    await LearningPath.updateOne(
      { userId: new mongoose.Types.ObjectId(userId), domain, 'nodes.nodeId': nodeId },
      { $set: { 'nodes.$.status': status, updatedAt: new Date() } }
    );

    if (status === 'COMPLETED') {
      // Update overall progress percent
      const path = await LearningPath.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        domain
      });
      if (path) {
        const completedCount = path.nodes.filter(n => n.status === 'COMPLETED').length;
        const progressPercent = Math.round((completedCount / path.nodes.length) * 100);
        await LearningPath.updateOne(
          { userId: new mongoose.Types.ObjectId(userId), domain },
          { progressPercent }
        );

        // Unlock the next node (nodes are ordered sequentially)
        const completedIdx = path.nodes.findIndex(n => n.nodeId === nodeId);
        if (completedIdx >= 0 && completedIdx + 1 < path.nodes.length) {
          const nextNodeId = path.nodes[completedIdx + 1].nodeId;
          await LearningPath.updateOne(
            { userId: new mongoose.Types.ObjectId(userId), domain, 'nodes.nodeId': nextNodeId },
            { $set: { 'nodes.$.status': 'UNLOCKED' } }
          );
          await RoadmapNodeProgress.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId), domain, nodeId: nextNodeId },
            { status: 'UNLOCKED', updatedAt: new Date() },
            { upsert: true }
          );
        }
      }

      // Award XP to user
      if (xpToAward > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPoints: xpToAward }
        });
      }
    }

    return progress;
  }
}
