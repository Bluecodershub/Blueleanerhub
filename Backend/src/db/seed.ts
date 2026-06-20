import mongoose from 'mongoose';
import { Domain, Specialization, Course, Hackathon, Quiz, Space } from './models';
import { config } from '../config';

const ENGINEERING_DOMAINS = [
  { name: 'Computer Science', slug: 'computer-science', icon: '💻' },
  { name: 'Mechanical Engineering', slug: 'mechanical', icon: '⚙️' },
  { name: 'Electrical Engineering', slug: 'electrical', icon: '⚡' },
  { name: 'Civil Engineering', slug: 'civil', icon: '🏗️' },
  { name: 'Robotics Engineering', slug: 'robotics', icon: '🤖' },
  { name: 'Electronics Engineering', slug: 'electronics', icon: '📡' },
  { name: 'Automotive Engineering', slug: 'automotive', icon: '🚗' },
];

const MANAGEMENT_DOMAINS = [
  { name: 'Management & Business', slug: 'management', icon: '📊' },
  { name: 'Finance & FinTech', slug: 'finance', icon: '💰' },
  { name: 'Product Management', slug: 'product-management', icon: '🎯' },
];

const COURSE_CATALOG = [
  {
    domainSlug: 'computer-science',
    specialization: {
      name: 'Software Engineering',
      slug: 'software-engineering',
      description: 'Programming, architecture, data structures, web systems, and delivery workflows.',
    },
    courses: [
      {
        title: 'Software Engineering Foundations',
        slug: 'software-engineering-foundations',
        description: 'Build strong programming fundamentals, use Git confidently, and ship a complete API-backed project.',
        difficulty: 'BEGINNER' as const,
        estimatedHours: 42,
        tags: ['Computer Science', 'Programming', 'Projects'],
      },
      {
        title: 'Data Structures and Algorithms',
        slug: 'data-structures-and-algorithms',
        description: 'Practice arrays, trees, graphs, dynamic programming, and interview-grade problem solving.',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 56,
        tags: ['Algorithms', 'DSA', 'Interview Preparation'],
      },
      {
        title: 'Full-Stack Web Development',
        slug: 'full-stack-web-development',
        description: 'Create accessible interfaces, typed APIs, secure authentication, and production-ready deployments.',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 64,
        tags: ['Web Development', 'React', 'Node.js'],
      },
    ],
  },
  {
    domainSlug: 'mechanical',
    specialization: {
      name: 'Mechanical Product Design',
      slug: 'mechanical-product-design',
      description: 'Engineering design, materials, manufacturing planning, and simulation workflows.',
    },
    courses: [
      {
        title: 'Mechanical Design Essentials',
        slug: 'mechanical-design-essentials',
        description: 'Apply design thinking, material selection, CAD planning, and simulation to a product brief.',
        difficulty: 'BEGINNER' as const,
        estimatedHours: 36,
        tags: ['Mechanical', 'CAD', 'Simulation'],
      },
    ],
  },
  {
    domainSlug: 'electrical',
    specialization: {
      name: 'Embedded Systems',
      slug: 'embedded-systems',
      description: 'Circuits, microcontrollers, interfaces, firmware, and hardware debugging.',
    },
    courses: [
      {
        title: 'Embedded Systems Fundamentals',
        slug: 'embedded-systems-fundamentals',
        description: 'Work with GPIO, serial communication, sensors, and real-time firmware patterns.',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 40,
        tags: ['Electrical', 'Embedded', 'Microcontrollers'],
      },
    ],
  },
  {
    domainSlug: 'civil',
    specialization: {
      name: 'Sustainable Infrastructure',
      slug: 'sustainable-infrastructure',
      description: 'Structural planning, materials, geotechnical decisions, and environmental impact.',
    },
    courses: [
      {
        title: 'Sustainable Infrastructure Design',
        slug: 'sustainable-infrastructure-design',
        description: 'Evaluate structural systems, construction constraints, and lower-impact material choices.',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 38,
        tags: ['Civil', 'Structures', 'Sustainability'],
      },
    ],
  },
  {
    domainSlug: 'management',
    specialization: {
      name: 'Business Analytics',
      slug: 'business-analytics',
      description: 'Decision frameworks, operating metrics, dashboards, and analytical communication.',
    },
    courses: [
      {
        title: 'Business Analytics for Managers',
        slug: 'business-analytics-for-managers',
        description: 'Use metrics, experiments, and decision models to evaluate product and business performance.',
        difficulty: 'BEGINNER' as const,
        estimatedHours: 30,
        tags: ['Management', 'Analytics', 'Decision Making'],
      },
    ],
  },
];

const SPACES = [
  { name: 'Web Development', category: 'web-dev', description: 'HTML, CSS, JavaScript, React, Node.js challenges', icon: '🌐' },
  { name: 'Data Structures & Algorithms', category: 'dsa', description: 'Classic DSA problems, competitive coding', icon: '🧮' },
  { name: 'Machine Learning', category: 'machine-learning', description: 'ML models, neural networks, data science', icon: '🧠' },
  { name: 'System Design', category: 'system-design', description: 'Large-scale system architecture challenges', icon: '🏛️' },
  { name: 'DevOps & Cloud', category: 'devops', description: 'Docker, Kubernetes, CI/CD pipelines', icon: '☁️' },
  { name: 'Circuit Design', category: 'circuit-design', description: 'Electronics circuit challenges', icon: '🔌' },
];

const SAMPLE_HACKATHONS = [
  {
    name: 'BlueLearner AI Innovation Cup 2026',
    description: 'Build the most innovative AI-powered learning tool that helps students master engineering concepts faster.',
    theme: 'AI in Education',
    organizerType: 'PLATFORM' as const,
    organizerName: 'BlueLearner',
    tags: ['AI', 'Machine Learning', 'EdTech', 'Python'],
    difficulty: 'Intermediate' as const,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-07'),
    registrationDeadline: new Date('2026-05-30'),
    status: 'PUBLISHED' as const,
    maxParticipants: 500,
    prizePool: '$10,000',
    prizes: [
      { rank: '1st Place', reward: '$5,000 + Internship PPO' },
      { rank: '2nd Place', reward: '$3,000 + Swag Kit' },
      { rank: '3rd Place', reward: '$2,000' },
    ],
    judgingCriteria: ['Innovation & Creativity', 'Technical Execution', 'Impact Potential', 'Presentation Quality'],
    rules: 'Teams of 2-4. All code must be original. Use of open-source libraries is permitted. Submit a working demo + GitHub repository.',
    createdBy: new mongoose.Types.ObjectId(),
  },
  {
    name: 'GreenTech Civil Engineering Challenge',
    description: 'Design sustainable, eco-friendly infrastructure solutions for Indian cities using modern civil engineering techniques.',
    theme: 'Sustainable Infrastructure',
    organizerType: 'PLATFORM' as const,
    organizerName: 'BlueLearner',
    tags: ['Civil Engineering', 'Sustainability', 'BIM', 'Green Tech'],
    difficulty: 'Pro' as const,
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-14'),
    registrationDeadline: new Date('2026-06-25'),
    status: 'PUBLISHED' as const,
    maxParticipants: 200,
    prizePool: '$4,000',
    prizes: [
      { rank: '1st Place', reward: '$2,000 + Certificate' },
      { rank: '2nd Place', reward: '$1,200' },
      { rank: '3rd Place', reward: '$800' },
    ],
    judgingCriteria: ['Structural Integrity', 'Environmental Impact', 'Cost Efficiency', 'Feasibility'],
    rules: 'Individual or team (up to 3). Submit design drawings + calculations + presentation.',
    createdBy: new mongoose.Types.ObjectId(),
  },
];

const SAMPLE_QUIZ = {
  title: 'Daily Warm-Up: Data Structures Basics',
  description: 'Test your fundamental knowledge of data structures',
  questions: [
    {
      id: 'q1',
      question: 'Which data structure uses LIFO (Last In First Out) ordering?',
      options: ['Queue', 'Stack', 'Deque', 'Priority Queue'],
      correctIndex: 1,
    },
    {
      id: 'q2',
      question: 'What is the time complexity of searching in a balanced Binary Search Tree?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctIndex: 2,
    },
    {
      id: 'q3',
      question: 'Which traversal visits nodes in Left → Root → Right order?',
      options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
      correctIndex: 1,
    },
    {
      id: 'q4',
      question: 'A hash table gives O(1) average time for which operations?',
      options: ['Insert only', 'Search only', 'Delete only', 'Insert, Search, and Delete'],
      correctIndex: 3,
    },
    {
      id: 'q5',
      question: 'Which sorting algorithm has the best worst-case time complexity?',
      options: ['Quick Sort', 'Bubble Sort', 'Merge Sort', 'Insertion Sort'],
      correctIndex: 2,
    },
  ],
  difficulty: 'EASY' as const,
  category: 'Computer Science',
};

async function seed() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') {
    console.error('❌ Seeding is not allowed in production.');
    process.exit(1);
  }

  const mongoUri = config.database.url || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluelearnerhub';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  console.log('🌱 Seeding domains...');
  for (const d of [...ENGINEERING_DOMAINS, ...MANAGEMENT_DOMAINS]) {
    await Domain.findOneAndUpdate(
      { slug: d.slug },
      { name: d.name, slug: d.slug, icon: d.icon, isPublished: true },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${ENGINEERING_DOMAINS.length + MANAGEMENT_DOMAINS.length} domains`);

  console.log('Seeding specializations and courses...');
  let specializationCount = 0;
  let courseCount = 0;
  for (const catalogEntry of COURSE_CATALOG) {
    const domain = await Domain.findOne({ slug: catalogEntry.domainSlug });
    if (!domain) continue;

    const specialization = await Specialization.findOneAndUpdate(
      { domainId: domain._id, slug: catalogEntry.specialization.slug },
      {
        domainId: domain._id,
        ...catalogEntry.specialization,
        isPublished: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    specializationCount += 1;

    for (const course of catalogEntry.courses) {
      await Course.findOneAndUpdate(
        { slug: course.slug },
        {
          ...course,
          specializationId: specialization._id,
          isPublished: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      courseCount += 1;
    }
  }
  console.log(`Seeded ${specializationCount} specializations and ${courseCount} courses`);

  console.log('🌱 Seeding spaces...');
  for (const s of SPACES) {
    await Space.findOneAndUpdate(
      { category: s.category },
      { name: s.name, category: s.category, description: s.description, icon: s.icon, isActive: true },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${SPACES.length} spaces`);

  console.log('🌱 Seeding hackathons...');
  for (const h of SAMPLE_HACKATHONS) {
    await Hackathon.findOneAndUpdate(
      { name: h.name },
      h,
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${SAMPLE_HACKATHONS.length} hackathons`);

  console.log('🌱 Seeding sample quiz...');
  await Quiz.findOneAndUpdate(
    { title: SAMPLE_QUIZ.title },
    { ...SAMPLE_QUIZ, createdBy: new mongoose.Types.ObjectId() },
    { upsert: true }
  );
  console.log('✅ Seeded sample quiz');

  console.log('\n🎉 All seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
