import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import User from '../src/models/User.js';
import Hackathon from '../src/models/Hackathon.js';
import Team from '../src/models/Team.js';
import Connection from '../src/models/Connection.js';
import Conversation from '../src/models/Conversation.js';
import Message from '../src/models/Message.js';
import Notification from '../src/models/Notification.js';
import Task from '../src/models/Task.js';
import ProjectActivity from '../src/models/ProjectActivity.js';
import Bookmark from '../src/models/Bookmark.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate';

const demoUsers = [
  {
    fullName: 'Alex Rivera',
    username: 'alexrivera',
    email: 'admin@hackmate.dev',
    password: 'Password@123',
    role: 'admin',
    roleTitle: 'Full-Stack Architect & AI Researcher',
    college: 'Stanford University',
    department: 'Computer Science',
    degree: 'B.S.',
    yearOfStudy: 'Senior',
    location: 'San Francisco, CA',
    timeZone: 'America/Los_Angeles',
    bio: 'Passionate full-stack developer and AI researcher. Winner of CalHacks 2024. Building autonomous AI agents and scalable distributed systems.',
    skills: ['React', 'Node.js', 'Python', 'PyTorch', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
    programmingLanguages: ['Python', 'TypeScript', 'JavaScript', 'Go'],
    frameworksAndTools: ['Next.js', 'FastAPI', 'Tailwind CSS', 'Docker', 'Git'],
    interests: ['AI & Machine Learning', 'Distributed Systems', 'Web3', 'Open Source'],
    preferredHackathonCategories: ['AI & Machine Learning', 'Developer Tools', 'FinTech'],
    experienceLevel: 'Expert',
    previousHackathons: [
      { name: 'CalHacks 11.0', year: 2024, prize: '1st Place Overall', description: 'Built an autonomous debugging assistant' },
      { name: 'TreeHacks 2023', year: 2023, prize: 'Best Healthcare Track', description: 'AI radiology triaging engine' },
    ],
    preferredRoles: ['Full-Stack', 'AI/ML Engineer', 'Team Lead'],
    availability: 'Full-time',
    collaborationMode: 'Hybrid',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/alexrivera-dev',
    linkedinUrl: 'https://linkedin.com/in/alexrivera-ai',
    portfolioUrl: 'https://alexrivera.dev',
  },
  {
    fullName: 'Sophia Chen',
    username: 'sophiachen',
    email: 'sophia@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'UI/UX Product Designer & Frontend Dev',
    college: 'UC Berkeley',
    department: 'Design & Human-Computer Interaction',
    degree: 'B.A.',
    yearOfStudy: 'Junior',
    location: 'Berkeley, CA',
    timeZone: 'America/Los_Angeles',
    bio: 'Figma wizard turned React front-end crafter. Obsessed with micro-interactions, accessibility, and high-conversion SaaS design.',
    skills: ['Figma', 'React', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'UI/UX Design', 'User Research'],
    programmingLanguages: ['JavaScript', 'TypeScript', 'HTML/CSS'],
    frameworksAndTools: ['Figma', 'Storybook', 'Next.js', 'Vite', 'Tailwind'],
    interests: ['Design Systems', 'EdTech', 'Social Impact', 'Accessibility'],
    preferredHackathonCategories: ['EdTech', 'HealthTech', 'Open Innovation'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'HackDavis 2024', year: 2024, prize: 'Best UI/UX Award', description: 'Interactive sign-language learning web app' },
    ],
    preferredRoles: ['UI/UX Designer', 'Frontend'],
    availability: 'Flexible',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/sophiachen-design',
    linkedinUrl: 'https://linkedin.com/in/sophiachen-design',
    portfolioUrl: 'https://sophiachen.design',
  },
  {
    fullName: 'Marcus Vance',
    username: 'marcusvance',
    email: 'marcus@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Backend Engineer & Cloud Architect',
    college: 'Carnegie Mellon University',
    department: 'Electrical & Computer Engineering',
    degree: 'M.S.',
    yearOfStudy: 'Graduate',
    location: 'Pittsburgh, PA',
    timeZone: 'America/New_York',
    bio: 'High-throughput backend systems builder. Kubernetes, Redis, Kafka, and PostgreSQL fanatic. Looking to ship bulletproof infrastructure at upcoming hackathons.',
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS', 'gRPC'],
    programmingLanguages: ['Go', 'Rust', 'Python', 'SQL'],
    frameworksAndTools: ['Express', 'Echo', 'Docker', 'Kubernetes', 'Terraform'],
    interests: ['High-Performance Computing', 'Cloud Native', 'FinTech', 'Cybersecurity'],
    preferredHackathonCategories: ['FinTech', 'Developer Tools', 'Cybersecurity'],
    experienceLevel: 'Expert',
    previousHackathons: [
      { name: 'PennApps XXIV', year: 2023, prize: 'Best Infrastructure Hack', description: 'Ultra-low-latency real-time telemetry pipeline' },
    ],
    preferredRoles: ['Backend', 'Cloud', 'DevOps'],
    availability: 'Weekends only',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/marcusvance',
    linkedinUrl: 'https://linkedin.com/in/marcusvance',
  },
  {
    fullName: 'Priya Sharma',
    username: 'priyasharma',
    email: 'priya@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Machine Learning Engineer & NLP Specialist',
    college: 'MIT',
    department: 'EECS',
    degree: 'M.Eng.',
    yearOfStudy: 'Graduate',
    location: 'Cambridge, MA',
    timeZone: 'America/New_York',
    bio: 'Specializing in LLM fine-tuning, RAG pipelines, and multi-modal AI agents. LangChain and HuggingFace contributor.',
    skills: ['Python', 'PyTorch', 'Transformers', 'LangChain', 'FastAPI', 'Vector Databases', 'OpenAI API'],
    programmingLanguages: ['Python', 'C++', 'Julia'],
    frameworksAndTools: ['PyTorch', 'Hugging Face', 'Qdrant', 'Pinecone', 'Docker'],
    interests: ['Generative AI', 'NLP', 'Bioinformatics', 'Knowledge Graphs'],
    preferredHackathonCategories: ['AI & Machine Learning', 'HealthTech', 'Open Innovation'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'MIT HackMIT 2024', year: 2024, prize: 'Grand Prize Winner', description: 'Clinical document summarization with provenance verification' },
    ],
    preferredRoles: ['AI/ML Engineer', 'Data Science'],
    availability: 'Part-time',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/priyasharma-ml',
    linkedinUrl: 'https://linkedin.com/in/priyasharma-nlp',
  },
  {
    fullName: 'Liam O’Connor',
    username: 'liamoconnor',
    email: 'liam@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Smart Contract & Web3 Engineer',
    college: 'University of Waterloo',
    department: 'Software Engineering',
    degree: 'B.S.E.',
    yearOfStudy: 'Junior',
    location: 'Toronto, Canada',
    timeZone: 'America/Toronto',
    bio: 'Solidity, Rust, EVM mechanics, and zero-knowledge proofs. Built decentralized escrow and verifiable credentials protocols.',
    skills: ['Solidity', 'Rust', 'Ethers.js', 'Hardhat', 'React', 'TypeScript', 'Web3.js'],
    programmingLanguages: ['Solidity', 'Rust', 'TypeScript', 'JavaScript'],
    frameworksAndTools: ['Foundry', 'Hardhat', 'Next.js', 'Wagmi'],
    interests: ['DeFi', 'ZK Proofs', 'Smart Contracts', 'Decentralized Identity'],
    preferredHackathonCategories: ['Web3', 'FinTech', 'Cybersecurity'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'ETHGlobal San Francisco', year: 2023, prize: 'Finalist & Top 10', description: 'ZK-based anonymous proof of attendance' },
    ],
    preferredRoles: ['Blockchain', 'Full-Stack'],
    availability: 'Flexible',
    collaborationMode: 'Hybrid',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/liamoconnor-web3',
    linkedinUrl: 'https://linkedin.com/in/liamoconnor-dev',
  },
  {
    fullName: 'Elena Rostova',
    username: 'elenarostova',
    email: 'elena@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Mobile App Developer & Flutter Specialist',
    college: 'Georgia Tech',
    department: 'Interactive Computing',
    degree: 'B.S.',
    yearOfStudy: 'Sophomore',
    location: 'Atlanta, GA',
    timeZone: 'America/New_York',
    bio: 'Creating buttery smooth cross-platform mobile apps in Flutter and React Native. Keen eye for motion and tactile feedback.',
    skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'Swift', 'REST APIs', 'GraphQL'],
    programmingLanguages: ['Dart', 'JavaScript', 'Swift', 'Kotlin'],
    frameworksAndTools: ['Flutter', 'React Native', 'Firebase', 'Xcode', 'Android Studio'],
    interests: ['Mobile Dev', 'Health & Fitness', 'Wearables', 'AR/VR'],
    preferredHackathonCategories: ['HealthTech', 'EdTech', 'Social Impact'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'HackGT XI', year: 2024, prize: 'Best Mobile Experience', description: 'Gamified physical rehabilitation tracker' },
    ],
    preferredRoles: ['Mobile Developer', 'Frontend'],
    availability: 'Flexible',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/elenarostova',
    linkedinUrl: 'https://linkedin.com/in/elenarostova',
  },
  {
    fullName: 'Devon Patel',
    username: 'devonpatel',
    email: 'devon@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Full-Stack Developer & Product Hacker',
    college: 'University of Texas at Austin',
    department: 'Computer Science',
    degree: 'B.S.',
    yearOfStudy: 'Senior',
    location: 'Austin, TX',
    timeZone: 'America/Chicago',
    bio: 'Fast hacker who loves shipping end-to-end MVPs in 36 hours. Experienced in Next.js, Node, PostgreSQL, and Stripe integrations.',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Stripe API'],
    programmingLanguages: ['TypeScript', 'JavaScript', 'Python'],
    frameworksAndTools: ['Next.js', 'Express', 'Tailwind', 'Supabase', 'Vercel'],
    interests: ['SaaS', 'FinTech', 'E-commerce', 'Automation'],
    preferredHackathonCategories: ['FinTech', 'Open Innovation', 'Developer Tools'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'HackTX 2023', year: 2023, prize: '2nd Place Overall', description: 'Automated invoice factoring platform for freelancers' },
    ],
    preferredRoles: ['Full-Stack', 'Team Lead'],
    availability: 'Full-time',
    collaborationMode: 'In-person',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/devonpatel',
    linkedinUrl: 'https://linkedin.com/in/devonpatel-tech',
  },
  {
    fullName: 'Aisha Al-Mansoor',
    username: 'aishaalmansoor',
    email: 'aisha@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Cybersecurity Analyst & Ethical Hacker',
    college: 'Purdue University',
    department: 'Cybersecurity & Network Engineering',
    degree: 'B.S.',
    yearOfStudy: 'Senior',
    location: 'West Lafayette, IN',
    timeZone: 'America/Indiana/Indianapolis',
    bio: 'Bug bounty hunter and CTF player. Experienced in penetration testing, smart contract security audits, and zero-trust systems.',
    skills: ['Penetration Testing', 'Network Security', 'Python', 'Wireshark', 'Cryptography', 'Linux', 'Security Audits'],
    programmingLanguages: ['Python', 'Bash', 'C', 'Go'],
    frameworksAndTools: ['Burp Suite', 'Metasploit', 'Docker', 'Ghidra', 'Kali Linux'],
    interests: ['Offensive Security', 'Privacy-Preserving Tech', 'Zero-Trust', 'Crypto'],
    preferredHackathonCategories: ['Cybersecurity', 'FinTech', 'Web3'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'DefCon CTF Qualifier', year: 2024, prize: 'Top 25 Team', description: 'Binary exploitation & reverse engineering' },
    ],
    preferredRoles: ['Cybersecurity', 'Backend'],
    availability: 'Part-time',
    collaborationMode: 'Remote',
    lookingForTeam: false,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/aisha-sec',
    linkedinUrl: 'https://linkedin.com/in/aishaalmansoor',
  },
  {
    fullName: 'Kenji Sato',
    username: 'kenjisato',
    email: 'kenji@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Embedded Systems & IoT Engineer',
    college: 'University of Washington',
    department: 'Robotics & Mechatronics',
    degree: 'B.S.',
    yearOfStudy: 'Junior',
    location: 'Seattle, WA',
    timeZone: 'America/Los_Angeles',
    bio: 'Bridging physical hardware and cloud software. Arduino, ESP32, Raspberry Pi, MQTT, and computer vision on edge devices.',
    skills: ['C++', 'Python', 'ESP32', 'Raspberry Pi', 'MQTT', 'Computer Vision', 'OpenCV', 'Circuit Design'],
    programmingLanguages: ['C', 'C++', 'Python'],
    frameworksAndTools: ['PlatformIO', 'ROS2', 'OpenCV', 'Eagle CAD', 'Linux'],
    interests: ['Robotics', 'Smart Cities', 'Environmental IoT', 'Wearables'],
    preferredHackathonCategories: ['IoT & Hardware', 'Sustainability', 'Social Impact'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'DubHacks 2024', year: 2024, prize: 'Best Hardware Hack', description: 'Smart solar-powered wildfire early detector' },
    ],
    preferredRoles: ['IoT', 'Hardware Engineer', 'Backend'],
    availability: 'Flexible',
    collaborationMode: 'Hybrid',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/kenjisato-iot',
    linkedinUrl: 'https://linkedin.com/in/kenjisato',
  },
  {
    fullName: 'Chloe Dupont',
    username: 'chloedupont',
    email: 'chloe@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Product Manager & Presentation Lead',
    college: 'NYU Stern School of Business',
    department: 'Business & Technology',
    degree: 'B.S.',
    yearOfStudy: 'Senior',
    location: 'New York, NY',
    timeZone: 'America/New_York',
    bio: 'Product strategist and pitch lead. I turn complex technical architectures into compelling investor pitches and user-friendly product narratives.',
    skills: ['Product Strategy', 'Pitch Deck Design', 'Market Analysis', 'Figma', 'Agile / Scrum', 'Public Speaking'],
    programmingLanguages: ['SQL', 'Basic Python'],
    frameworksAndTools: ['Figma', 'Notion', 'Miro', 'Jira', 'Pitch'],
    interests: ['FinTech', 'Venture Capital', 'Product Discovery', 'Design Thinking'],
    preferredHackathonCategories: ['FinTech', 'EdTech', 'Social Impact'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'NYU HackNY', year: 2024, prize: 'Best Pitch & Business Viability', description: 'Pitched micro-scholarships micro-saving engine' },
    ],
    preferredRoles: ['Business & Pitch', 'Product Manager'],
    availability: 'Full-time',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/chloedupont',
    linkedinUrl: 'https://linkedin.com/in/chloedupont-pm',
  },
  {
    fullName: 'Zackariah Morris',
    username: 'zackmorris',
    email: 'zack@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Data Engineer & Analytics Specialist',
    college: 'University of Illinois Urbana-Champaign',
    department: 'Statistics & Computer Science',
    degree: 'B.S.',
    yearOfStudy: 'Junior',
    location: 'Urbana, IL',
    timeZone: 'America/Chicago',
    bio: 'Building scalable data pipelines, data warehouses, and interactive analytical dashboards. Big data, Spark, DBT, and Snowflake enthusiast.',
    skills: ['Python', 'SQL', 'Snowflake', 'Apache Spark', 'dbt', 'Pandas', 'Tableau', 'Airflow'],
    programmingLanguages: ['Python', 'SQL', 'Scala'],
    frameworksAndTools: ['Apache Airflow', 'dbt', 'BigQuery', 'Docker', 'Streamlit'],
    interests: ['Big Data', 'Sports Analytics', 'Climate Data', 'Data Visualization'],
    preferredHackathonCategories: ['Data Science', 'Sustainability', 'FinTech'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'HackIllinois 2024', year: 2024, prize: 'Best Data Visualization', description: 'Real-time city transit anomaly detector' },
    ],
    preferredRoles: ['Data Science', 'Backend'],
    availability: 'Weekends only',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/zackmorris-data',
    linkedinUrl: 'https://linkedin.com/in/zackariahmorris',
  },
  {
    fullName: 'Maya Lin',
    username: 'mayalin',
    email: 'maya@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Frontend Developer & 3D Web Creative',
    college: 'Columbia University',
    department: 'Computer Science & Visual Arts',
    degree: 'B.A.',
    yearOfStudy: 'Senior',
    location: 'New York, NY',
    timeZone: 'America/New_York',
    bio: 'Specializing in Three.js, WebGL, and React Three Fiber to create immersive 3D web experiences that leave hackathon judges in awe.',
    skills: ['Three.js', 'React', 'React Three Fiber', 'GLSL Shaders', 'WebGL', 'Tailwind CSS', 'Blender'],
    programmingLanguages: ['JavaScript', 'TypeScript', 'GLSL'],
    frameworksAndTools: ['Next.js', 'Three.js', 'Blender', 'GSAP', 'Vite'],
    interests: ['Creative Coding', 'Metaverse / 3D', 'Data Storytelling', 'Game Dev'],
    preferredHackathonCategories: ['Open Innovation', 'Gaming & XR', 'EdTech'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'HackNYU 2024', year: 2024, prize: 'Best Visual Design', description: '3D interactive ocean plastic visualization simulator' },
    ],
    preferredRoles: ['Frontend', 'Creative Technologist'],
    availability: 'Flexible',
    collaborationMode: 'Hybrid',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/mayalin-3d',
    linkedinUrl: 'https://linkedin.com/in/mayalin-creative',
  },
  {
    fullName: 'Carlos Mendes',
    username: 'carlosmendes',
    email: 'carlos@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'DevOps & Site Reliability Engineer',
    college: 'University of Michigan',
    department: 'Computer Science',
    degree: 'B.S.E.',
    yearOfStudy: 'Junior',
    location: 'Ann Arbor, MI',
    timeZone: 'America/Detroit',
    bio: 'Continuous integration, container security, zero-downtime deployments, and cloud monitoring. I make sure hackathon demos never crash.',
    skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana', 'Linux', 'AWS'],
    programmingLanguages: ['Go', 'Python', 'Bash'],
    frameworksAndTools: ['Terraform', 'ArgoCD', 'Docker', 'Ansible', 'Helm'],
    interests: ['Cloud Architecture', 'SRE', 'Observability', 'Chaos Engineering'],
    preferredHackathonCategories: ['Developer Tools', 'Cybersecurity', 'Cloud'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'MHacks 16', year: 2023, prize: 'Best Cloud Deployment Award', description: 'Automated fault-tolerant edge cluster' },
    ],
    preferredRoles: ['Cloud', 'DevOps', 'Backend'],
    availability: 'Part-time',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/carlosmendes-ops',
    linkedinUrl: 'https://linkedin.com/in/carlosmendes',
  },
  {
    fullName: 'Ananya Roy',
    username: 'ananyaroy',
    email: 'ananya@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'HealthTech AI Researcher & Bioinformatician',
    college: 'Johns Hopkins University',
    department: 'Biomedical Engineering',
    degree: 'B.S.',
    yearOfStudy: 'Senior',
    location: 'Baltimore, MD',
    timeZone: 'America/New_York',
    bio: 'Passionate about leveraging deep learning for genomic variant detection and remote patient monitoring.',
    skills: ['Python', 'Bioinformatics', 'TensorFlow', 'scikit-learn', 'R', 'FastAPI', 'Pandas'],
    programmingLanguages: ['Python', 'R', 'C++'],
    frameworksAndTools: ['Biopython', 'TensorFlow', 'Streamlit', 'Docker'],
    interests: ['HealthTech', 'Precision Medicine', 'Bioinformatics', 'AI Ethics'],
    preferredHackathonCategories: ['HealthTech', 'AI & Machine Learning', 'Social Impact'],
    experienceLevel: 'Advanced',
    previousHackathons: [
      { name: 'HopHacks 2024', year: 2024, prize: '1st Place Health Track', description: 'Non-invasive arrhythmia detection model' },
    ],
    preferredRoles: ['AI/ML Engineer', 'Data Science'],
    availability: 'Flexible',
    collaborationMode: 'Remote',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/ananyaroy-bio',
    linkedinUrl: 'https://linkedin.com/in/ananyaroy-bme',
  },
  {
    fullName: 'Jordan Taylor',
    username: 'jordantaylor',
    email: 'jordan@hackmate.dev',
    password: 'Password@123',
    role: 'user',
    roleTitle: 'Full-Stack Developer & ClimateTech Advocate',
    college: 'University of Washington',
    department: 'Informatics',
    degree: 'B.S.',
    yearOfStudy: 'Junior',
    location: 'Seattle, WA',
    timeZone: 'America/Los_Angeles',
    bio: 'Building web applications aimed at carbon footprint accounting and renewable energy grid forecasting.',
    skills: ['Vue.js', 'Node.js', 'Python', 'Mapbox GL', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    programmingLanguages: ['JavaScript', 'Python', 'SQL'],
    frameworksAndTools: ['Nuxt.js', 'Express', 'Tailwind', 'Mapbox', 'PostgreSQL'],
    interests: ['ClimateTech', 'Geospatial Analytics', 'Clean Energy', 'Civic Tech'],
    preferredHackathonCategories: ['Sustainability', 'Open Innovation', 'IoT & Hardware'],
    experienceLevel: 'Intermediate',
    previousHackathons: [
      { name: 'Hack the Planet 2024', year: 2024, prize: 'Best Environmental Solution', description: 'Neighborhood solar panel rooftop efficiency indexer' },
    ],
    preferredRoles: ['Full-Stack', 'Frontend'],
    availability: 'Part-time',
    collaborationMode: 'Hybrid',
    lookingForTeam: true,
    communicationLanguage: 'English',
    avatarUrl: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/jordantaylor',
    linkedinUrl: 'https://linkedin.com/in/jordantaylor-dev',
  },
];

const demoHackathons = [
  {
    title: 'Global AI Hackathon 2026',
    organizer: 'OpenAI & Google Cloud Community',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    description: 'The premier worldwide virtual hackathon celebrating next-generation multimodal autonomous agents, foundation model integrations, and generative computing. Hack with 5,000+ builders worldwide.',
    themes: ['AI & Machine Learning', 'Autonomous Agents', 'Developer Tools', 'Open Source'],
    eligibility: 'Open to developers, students, researchers, and creators worldwide. Solo or teams of up to 4.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    minTeamSize: 2,
    maxTeamSize: 4,
    format: 'Online',
    location: 'Virtual Worldwide',
    prizePool: '$75,000 USD',
    prizes: [
      { title: 'Grand Champion', amount: '$30,000', description: 'Overall best generative AI application' },
      { title: 'Best Autonomous Agent', amount: '$15,000', description: 'Most innovative multi-step reasoning agent' },
      { title: 'Community Choice', amount: '$10,000', description: 'Voted best project by hackathon participants' },
    ],
    requiredTechnologies: ['Python', 'OpenAI API / Gemini API', 'React or Next.js', 'Vector DBs'],
    officialUrl: 'https://example.com/global-ai-hackathon',
    contactEmail: 'organizers@globalai2026.org',
    status: 'upcoming',
    isVerified: true,
  },
  {
    title: 'CalHacks 12.0: Builders Summit',
    organizer: 'UC Berkeley Cal Hacks Team',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    description: 'The world’s largest collegiate hackathon hosted at UC Berkeley. Join 2,000 top collegiate hackers in California for 36 hours of non-stop coding, mentorship from top tier Silicon Valley VCs, and tech sponsor keynotes.',
    themes: ['Open Innovation', 'FinTech', 'HealthTech', 'Social Impact'],
    eligibility: 'Current university and college students worldwide. In-person attendance required.',
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    minTeamSize: 1,
    maxTeamSize: 4,
    format: 'In-person',
    location: 'San Francisco Bay Area, CA (Palace of Fine Arts)',
    prizePool: '$120,000 USD',
    prizes: [
      { title: '1st Place Overall', amount: '$40,000', description: 'Best overall hack judged by industry leaders' },
      { title: 'Best Hardware / IoT', amount: '$15,000', description: 'Top physical computing or sensor hack' },
      { title: 'Best Social Impact', amount: '$15,000', description: 'Hack addressing climate or educational inequity' },
    ],
    requiredTechnologies: ['Any Modern Stack'],
    officialUrl: 'https://calhacks.io',
    contactEmail: 'team@calhacks.io',
    status: 'upcoming',
    isVerified: true,
  },
  {
    title: 'HackTheClimate 2026',
    organizer: 'GreenTech Alliance & MIT Energy Initiative',
    bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    description: 'Dedicated to reversing climate change through software, hardware, and scalable data models. Tracks include Renewable Energy Optimization, Smart Supply Chains, and Carbon Capture Analytics.',
    themes: ['Sustainability', 'IoT & Hardware', 'Data Science', 'Clean Energy'],
    eligibility: 'Open to all innovators passionate about climate solutions.',
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    minTeamSize: 2,
    maxTeamSize: 5,
    format: 'Hybrid',
    location: 'Boston, MA & Virtual',
    prizePool: '$50,000 USD',
    prizes: [
      { title: 'Grand Sustainability Prize', amount: '$25,000', description: 'Largest measurable carbon reduction potential' },
      { title: 'Best Geospatial Hack', amount: '$12,500', description: 'Best satellite imagery or climate mapping analysis' },
    ],
    requiredTechnologies: ['Python', 'Satellite APIs', 'PostgreSQL / PostGIS', 'React'],
    officialUrl: 'https://hacktheclimate.org',
    contactEmail: 'contact@hacktheclimate.org',
    status: 'upcoming',
    isVerified: true,
  },
  {
    title: 'Web3 & ZK Innovation Sprint',
    organizer: 'Ethereum Foundation & Protocol Guild',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
    description: 'Build decentralized applications that respect user privacy using zero-knowledge cryptography, account abstraction, and decentralized identity.',
    themes: ['Web3', 'Cybersecurity', 'ZK Proofs', 'FinTech'],
    eligibility: 'Developers with knowledge of smart contracts or cryptography.',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Deadline in 24 hours!
    minTeamSize: 2,
    maxTeamSize: 4,
    format: 'Online',
    location: 'Virtual Worldwide',
    prizePool: '$60,000 USD',
    prizes: [
      { title: 'Best ZK Application', amount: '$25,000', description: 'Cleverest implementation of zero-knowledge privacy' },
      { title: 'Best UX in Web3', amount: '$15,000', description: 'Frictionless onboarding with account abstraction' },
    ],
    requiredTechnologies: ['Solidity', 'Rust', 'Ethers.js', 'Next.js'],
    officialUrl: 'https://zksprint.org',
    contactEmail: 'info@zksprint.org',
    status: 'upcoming',
    isVerified: true,
  },
];

async function seedDatabase() {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to database successfully.');

    // Clear existing data
    console.log('[Seed] Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Hackathon.deleteMany({}),
      Team.deleteMany({}),
      Connection.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Task.deleteMany({}),
      ProjectActivity.deleteMany({}),
      Bookmark.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections cleared.');

    // 1. Create Users
    console.log('[Seed] Inserting 15 demo users...');
    const createdUsers = await User.create(demoUsers);
    console.log(`[Seed] Successfully created ${createdUsers.length} users.`);

    const [alex, sophia, marcus, priya, liam, elena, devon, aisha, kenji, chloe, zack, maya, carlos, ananya, jordan] = createdUsers;

    // 2. Create Hackathons
    console.log('[Seed] Inserting hackathon listings...');
    const hackathonsData = demoHackathons.map(h => ({
      ...h,
      createdBy: alex._id,
    }));
    const createdHackathons = await Hackathon.create(hackathonsData);
    console.log(`[Seed] Successfully created ${createdHackathons.length} hackathons.`);

    const [aiHackathon, calHacks, climateHackathon, web3Hackathon] = createdHackathons;

    // 3. Create Sample Teams with Open Positions and Skill Gaps
    console.log('[Seed] Creating demo teams...');
    const team1 = await Team.create({
      name: 'AgenticLabs',
      hackathon: aiHackathon._id,
      description: 'Building an autonomous multi-agent software engineering team that self-orchestrates bug fixing and continuous testing.',
      problemStatement: 'Modern developer backlogs are overwhelmed with minor defects. We want to build an AI agent ensemble that reads pull requests, reproduces bugs in sandbox containers, and writes verifiable unit tests.',
      techStack: ['Python', 'FastAPI', 'React', 'Docker', 'LangChain', 'Qdrant'],
      requiredSkills: ['Python', 'React', 'UI/UX Design', 'PyTorch'],
      desiredSize: 4,
      collaborationMode: 'Remote',
      availabilityRequirements: '15-20 hrs/week during hackathon sprint',
      leader: alex._id,
      members: [
        { user: alex._id, role: 'Team Lead & Backend AI', joinedAt: new Date() },
        { user: priya._id, role: 'NLP / Agent Architect', joinedAt: new Date() },
      ],
      openPositions: [
        {
          role: 'UI/UX Product Designer',
          requiredSkills: ['Figma', 'React', 'Tailwind CSS'],
          description: 'Design intuitive visual canvas for agent workflows and execution trees.',
          filled: false,
        },
        {
          role: 'Frontend Engineer',
          requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
          description: 'Implement real-time reactive streaming interface for agent outputs.',
          filled: false,
        },
      ],
      recruitmentStatus: 'open',
      visibility: 'public',
      inviteCode: 'AGENT77',
      repoUrl: 'https://github.com/agenticlabs/core',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    });

    const team2 = await Team.create({
      name: 'EcoGrid Dynamics',
      hackathon: climateHackathon._id,
      description: 'Decentralized neighborhood micro-grid load balancer utilizing edge IoT sensors and predictive weather modeling.',
      problemStatement: 'Grid strain during peak summer heat waves causes localized blackouts. We optimize energy distribution between rooftop solar homeowners and EV charging hubs.',
      techStack: ['Node.js', 'ESP32', 'PostgreSQL', 'React', 'MQTT'],
      requiredSkills: ['IoT', 'Hardware', 'Full-Stack', 'Data Science'],
      desiredSize: 4,
      collaborationMode: 'Hybrid',
      availabilityRequirements: '10-15 hrs/week',
      leader: jordan._id,
      members: [
        { user: jordan._id, role: 'Team Lead & Full-Stack', joinedAt: new Date() },
        { user: kenji._id, role: 'IoT & Firmware Specialist', joinedAt: new Date() },
      ],
      openPositions: [
        {
          role: 'Data Scientist',
          requiredSkills: ['Python', 'Time Series Forecasting', 'Pandas'],
          description: 'Build micro-climate solar generation prediction algorithms.',
          filled: false,
        },
        {
          role: 'Mobile / Frontend Dev',
          requiredSkills: ['React', 'Tailwind CSS', 'Charts'],
          description: 'Craft homeowner energy dashboard and real-time consumption telemetry.',
          filled: false,
        },
      ],
      recruitmentStatus: 'open',
      visibility: 'public',
      inviteCode: 'ECOGRID9',
      repoUrl: 'https://github.com/ecogrid/hub',
    });

    const team3 = await Team.create({
      name: 'ZKShield Protocols',
      hackathon: web3Hackathon._id,
      description: 'Zero-knowledge compliance and anti-fraud credentials for privacy-preserving fintech platforms.',
      problemStatement: 'Traditional KYC leaks sensitive personal data to third parties. We enable users to prove solvency and compliance without disclosing their identity or account balance.',
      techStack: ['Rust', 'Solidity', 'Next.js', 'Foundry'],
      requiredSkills: ['Solidity', 'Rust', 'Web3', 'UI/UX'],
      desiredSize: 3,
      collaborationMode: 'Remote',
      leader: liam._id,
      members: [
        { user: liam._id, role: 'Team Lead & Smart Contracts', joinedAt: new Date() },
        { user: aisha._id, role: 'Security Auditor & Cryptographer', joinedAt: new Date() },
      ],
      openPositions: [
        {
          role: 'Frontend Web3 Dev',
          requiredSkills: ['React', 'Ethers.js', 'Tailwind CSS'],
          description: 'Connect browser wallet and render zero-knowledge proof verification states.',
          filled: false,
        },
      ],
      recruitmentStatus: 'open',
      visibility: 'public',
      inviteCode: 'ZKSHIELD',
    });

    // 4. Create Conversations & Messages
    console.log('[Seed] Setting up conversations and real-time chat data...');
    // Direct chat between Alex and Sophia
    const conv1 = await Conversation.create({
      type: 'direct',
      participants: [alex._id, sophia._id],
      lastMessage: {
        text: 'Hey Sophia! Would love to have your UI/UX magic on our AgenticLabs team for the Global AI Hackathon!',
        sender: alex._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversation: conv1._id,
        sender: alex._id,
        content: 'Hi Sophia! I saw your recent design portfolio from HackDavis, absolutely stellar work on micro-interactions.',
        readBy: [alex._id, sophia._id],
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        conversation: conv1._id,
        sender: sophia._id,
        content: 'Hey Alex! Thank you so much! I saw you won CalHacks last year with the autonomous debugging agent. Very impressive!',
        readBy: [alex._id, sophia._id],
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        conversation: conv1._id,
        sender: alex._id,
        content: 'Hey Sophia! Would love to have your UI/UX magic on our AgenticLabs team for the Global AI Hackathon!',
        readBy: [alex._id],
        createdAt: new Date(Date.now() - 600000),
      },
    ]);

    // Team group conversation for AgenticLabs
    const teamConv1 = await Conversation.create({
      type: 'team',
      team: team1._id,
      participants: [alex._id, priya._id],
      lastMessage: {
        text: 'I pushed the initial LangChain agent loop to the repo. Ready for review!',
        sender: priya._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversation: teamConv1._id,
        sender: alex._id,
        content: 'Welcome to AgenticLabs everyone! Let us review the project problem statement and assign initial sprint tasks on the board.',
        readBy: [alex._id, priya._id],
      },
      {
        conversation: teamConv1._id,
        sender: priya._id,
        content: 'I pushed the initial LangChain agent loop to the repo. Ready for review!',
        readBy: [alex._id, priya._id],
      },
    ]);

    // 5. Create Connections & Teammate Requests
    console.log('[Seed] Generating teammate connection relationships...');
    await Connection.create([
      { requester: alex._id, recipient: sophia._id, status: 'accepted', message: 'Excited to connect and team up on AI and UX projects!' },
      { requester: marcus._id, recipient: alex._id, status: 'accepted', message: 'Hey Alex, big fan of your distributed systems work.' },
      { requester: devon._id, recipient: alex._id, status: 'pending', message: 'Hey! Want to team up for CalHacks next month?' },
      { requester: alex._id, recipient: kenji._id, status: 'pending', message: 'Love your DubHacks IoT project. Would love to collaborate!' },
      { requester: priya._id, recipient: sophia._id, status: 'accepted' },
      { requester: liam._id, recipient: carlos._id, status: 'accepted' },
    ]);

    // 6. Create Tasks for AgenticLabs Workspace Kanban Board
    console.log('[Seed] Populating team workspace Kanban tasks...');
    await Task.create([
      {
        team: team1._id,
        title: 'Architect Sandboxed Container Execution Environment',
        description: 'Set up Docker-in-Docker isolation so generated agent code can run safely without escaping the host.',
        status: 'done',
        priority: 'urgent',
        assignedTo: alex._id,
        createdBy: alex._id,
      },
      {
        team: team1._id,
        title: 'Implement Multi-step LLM Planning Loop with Provable Milestones',
        description: 'Connect Claude 3.5 Sonnet / Gemini 1.5 Pro to structured JSON output parsing for deterministic tool selection.',
        status: 'in_progress',
        priority: 'high',
        assignedTo: priya._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: alex._id,
      },
      {
        team: team1._id,
        title: 'Design Interactive Graph Visualization for Agent Reasoning Tree',
        description: 'Create an engaging visual canvas that lets hackathon judges watch agent decisions live in real-time.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: alex._id,
      },
      {
        team: team1._id,
        title: 'Prepare 3-minute Pitch Deck and Live Demo Script',
        description: 'Outline the problem, live benchmark metrics, market viability, and team background.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        createdBy: alex._id,
      },
    ]);

    // 7. Activity Log
    await ProjectActivity.create([
      { team: team1._id, user: alex._id, action: 'Team Created', details: 'Initialized repository and workspace.' },
      { team: team1._id, user: priya._id, action: 'Member Joined', details: 'Joined as NLP / Agent Architect.' },
      { team: team1._id, user: alex._id, action: 'Task Completed', details: 'Finished Container Execution Sandbox.' },
    ]);

    // 8. Notifications
    console.log('[Seed] Inserting sample notifications...');
    await Notification.create([
      {
        recipient: alex._id,
        sender: devon._id,
        type: 'teammate_request',
        title: 'New Teammate Request',
        message: 'Devon Patel sent you a teammate connection request for CalHacks.',
        data: { requesterId: devon._id },
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: sophia._id,
        type: 'request_accepted',
        title: 'Connection Accepted! 🎉',
        message: 'Sophia Chen accepted your teammate connection request.',
        data: { userId: sophia._id },
        isRead: true,
      },
      {
        recipient: alex._id,
        type: 'hackathon_deadline',
        title: 'Hackathon Deadline Approaching! ⏳',
        message: 'Registration for "Web3 & ZK Innovation Sprint" closes in less than 24 hours!',
        data: { hackathonId: web3Hackathon._id },
        isRead: false,
      },
    ]);

    // 9. Bookmarks
    console.log('[Seed] Creating demo bookmarks...');
    await Bookmark.create([
      { user: alex._id, itemType: 'user', itemId: sophia._id },
      { user: alex._id, itemType: 'hackathon', itemId: aiHackathon._id },
      { user: alex._id, itemType: 'hackathon', itemId: web3Hackathon._id },
      { user: alex._id, itemType: 'team', itemId: team2._id },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Default Admin Account:');
    console.log('  Email:    admin@hackmate.dev');
    console.log('  Password: Password@123');
    console.log('  Role:     admin');
    console.log('------------------------------------------------------');
    console.log('Demo Users (15 accounts available):');
    console.log('  sophia@hackmate.dev   / Password@123 (UI/UX)');
    console.log('  marcus@hackmate.dev   / Password@123 (Backend/Cloud)');
    console.log('  priya@hackmate.dev    / Password@123 (AI/ML)');
    console.log('  liam@hackmate.dev     / Password@123 (Web3)');
    console.log('  kenji@hackmate.dev    / Password@123 (IoT/Hardware)');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
