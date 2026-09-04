/**
 * Deterministic seed data for the Wellfound clone.
 *
 * Everything here is fictional. Company names, salaries and recruiters are made
 * up; the shape mirrors the real product (Indian startup market, INR bands,
 * PM/engineering/design roles) so the UI has something believable to render.
 *
 * Run with `npm run db:seed` (or `npm run db:reset` to wipe first).
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@wellfound.dev';
const DEMO_PASSWORD = 'password123';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function logoFor(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

const companies = [
  {
    name: 'Lumen Health',
    tagline: 'Preventive care for the next billion',
    industry: 'Healthtech',
    size: '51-200',
    fundingStage: 'SERIES_A',
    location: 'Bengaluru',
    foundedYear: 2020,
    description:
      'Lumen Health builds a preventive-care platform that combines at-home diagnostics with a care-team app. We serve 400k patients across 14 cities.',
  },
  {
    name: 'Kite Payments',
    tagline: 'Payment rails for Indian SMBs',
    industry: 'Fintech',
    size: '201-500',
    fundingStage: 'SERIES_B',
    location: 'Bengaluru',
    foundedYear: 2018,
    description:
      'Kite gives small businesses a single API for collections, payouts and reconciliation. We process about 9 million transactions a month.',
  },
  {
    name: 'Terra Logistics',
    tagline: 'Freight visibility, end to end',
    industry: 'Logistics',
    size: '201-500',
    fundingStage: 'SERIES_B',
    location: 'Gurgaon',
    foundedYear: 2017,
    description:
      'Terra tracks long-haul freight in real time and gives shippers an honest ETA. Used by 300+ enterprise shippers.',
  },
  {
    name: 'Sable Analytics',
    tagline: 'Product analytics without the warehouse bill',
    industry: 'Developer Tools',
    size: '11-50',
    fundingStage: 'SEED',
    location: 'Bengaluru',
    foundedYear: 2022,
    description:
      'Sable is a warehouse-native analytics layer. Point it at your existing Postgres or Snowflake and get product metrics in minutes.',
  },
  {
    name: 'Nimbus Learning',
    tagline: 'Upskilling for working engineers',
    industry: 'Edtech',
    size: '51-200',
    fundingStage: 'SERIES_A',
    location: 'Pune',
    foundedYear: 2019,
    description:
      'Nimbus runs cohort-based programs for mid-career engineers, with live projects reviewed by practising staff engineers.',
  },
  {
    name: 'Orchard Retail',
    tagline: 'Operating system for D2C brands',
    industry: 'E-commerce',
    size: '51-200',
    fundingStage: 'SERIES_A',
    location: 'Mumbai',
    foundedYear: 2020,
    description:
      'Orchard unifies inventory, orders and returns for direct-to-consumer brands selling across five marketplaces.',
  },
  {
    name: 'Vayu Energy',
    tagline: 'Rooftop solar, financed and managed',
    industry: 'Climate',
    size: '11-50',
    fundingStage: 'SEED',
    location: 'Hyderabad',
    foundedYear: 2021,
    description:
      'Vayu finances, installs and remotely monitors commercial rooftop solar. 62 MW under management.',
  },
  {
    name: 'Cobalt Security',
    tagline: 'Continuous cloud posture management',
    industry: 'Security',
    size: '11-50',
    fundingStage: 'PRE_SEED',
    location: 'Remote',
    foundedYear: 2023,
    description:
      'Cobalt watches your AWS and GCP footprint and tells you which misconfiguration actually matters today.',
  },
  {
    name: 'Meridian HR',
    tagline: 'Hiring workflows that do not sprawl',
    industry: 'HR Tech',
    size: '51-200',
    fundingStage: 'SERIES_A',
    location: 'Noida',
    foundedYear: 2019,
    description:
      'Meridian is an applicant tracking system built for 50-500 person companies that have outgrown spreadsheets.',
  },
  {
    name: 'Frame Studio',
    tagline: 'Design tooling for product teams',
    industry: 'Design Tools',
    size: '11-50',
    fundingStage: 'SEED',
    location: 'Remote',
    foundedYear: 2022,
    description:
      'Frame keeps design systems and shipped code in sync, so the component library is never quietly out of date.',
  },
  {
    name: 'Harbor Insurance',
    tagline: 'Group health cover for startups',
    industry: 'Insurtech',
    size: '201-500',
    fundingStage: 'SERIES_B',
    location: 'Chennai',
    foundedYear: 2016,
    description:
      'Harbor sells and services group health insurance for 4,000+ startups, with claims handled in-house.',
  },
  {
    name: 'Peak Foods',
    tagline: 'Cloud kitchens with honest margins',
    industry: 'Food Tech',
    size: '501-1000',
    fundingStage: 'SERIES_C',
    location: 'Delhi',
    foundedYear: 2015,
    description:
      'Peak operates 90 cloud kitchens across 11 cities and licenses its kitchen-ops software to other operators.',
  },
  {
    name: 'Quanta Labs',
    tagline: 'ML infrastructure for regulated industries',
    industry: 'AI/ML',
    size: '11-50',
    fundingStage: 'SEED',
    location: 'Bengaluru',
    foundedYear: 2022,
    description:
      'Quanta runs model training and evaluation pipelines inside your own VPC, with the audit trail compliance teams ask for.',
  },
  {
    name: 'Jetty Travel',
    tagline: 'Business travel without the agency',
    industry: 'Travel',
    size: '51-200',
    fundingStage: 'SERIES_A',
    location: 'Jaipur',
    foundedYear: 2018,
    description:
      'Jetty handles booking, policy and expense for mid-market business travel in one place.',
  },
  {
    name: 'Alloy Manufacturing',
    tagline: 'Software for the factory floor',
    industry: 'Industrial',
    size: '201-500',
    fundingStage: 'SERIES_B',
    location: 'Kolkata',
    foundedYear: 2017,
    description:
      'Alloy digitises production planning and quality control for mid-size manufacturers.',
  },
  {
    name: 'Willow Care',
    tagline: 'Mental health support that scales',
    industry: 'Healthtech',
    size: '11-50',
    fundingStage: 'SEED',
    location: 'Mysuru',
    foundedYear: 2021,
    description:
      'Willow pairs licensed therapists with a structured self-guided program, offered through employers.',
  },
];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

interface JobSeed {
  company: string;
  title: string;
  roleType: string;
  locationType: string;
  cities: string[];
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  equityMin?: number;
  equityMax?: number;
  skills: string[];
  postedDaysAgo: number;
  recruiterName: string;
  recruiterTitle: string;
  description: string;
  requirements: string[];
}

const jobs: JobSeed[] = [
  {
    company: 'Lumen Health',
    title: 'Associate Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Bengaluru'],
    salaryMin: 1800000,
    salaryMax: 2600000,
    experienceMin: 1,
    experienceMax: 3,
    equityMin: 0.02,
    equityMax: 0.08,
    skills: ['Product Management', 'SQL', 'User Research', 'Figma'],
    postedDaysAgo: 1,
    recruiterName: 'Ananya Rao',
    recruiterTitle: 'Head of Talent',
    description:
      'You will own the patient-facing booking flow end to end: diagnostics scheduling, reminders and report delivery. This is a hands-on APM role reporting to the Director of Product, with direct exposure to clinicians and operations.',
    requirements: [
      '1-3 years in a product, consulting or analytics role',
      'Comfortable writing your own SQL against a production replica',
      'Have shipped at least one consumer-facing flow you can walk us through',
      'Bonus: exposure to healthcare or regulated consumer products',
    ],
  },
  {
    company: 'Kite Payments',
    title: 'Product Manager, Payments',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Bengaluru'],
    salaryMin: 3200000,
    salaryMax: 4800000,
    experienceMin: 4,
    experienceMax: 8,
    equityMin: 0.05,
    equityMax: 0.15,
    skills: ['Product Management', 'Payments', 'API Design', 'SQL'],
    postedDaysAgo: 3,
    recruiterName: 'Vikram Shetty',
    recruiterTitle: 'Director of Product',
    description:
      'Own the collections product line: UPI, cards and net banking. You will work with a team of nine engineers and be accountable for authorisation rates and settlement latency.',
    requirements: [
      '4+ years of product management, at least 2 in fintech or payments',
      'Fluent in the mechanics of UPI and card rails',
      'Track record of moving a hard metric like auth rate or chargeback ratio',
    ],
  },
  {
    company: 'Sable Analytics',
    title: 'Associate Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Bengaluru', 'Remote'],
    salaryMin: 1600000,
    salaryMax: 2400000,
    experienceMin: 0,
    experienceMax: 2,
    equityMin: 0.05,
    equityMax: 0.2,
    skills: ['Product Management', 'SQL', 'Analytics', 'Developer Tools'],
    postedDaysAgo: 2,
    recruiterName: 'Priya Menon',
    recruiterTitle: 'Co-founder',
    description:
      'First APM hire at a seven-person company. You will spend half your time talking to data teams and half writing specs and QA-ing releases. Expect unusual ownership and unusual ambiguity.',
    requirements: [
      '0-2 years experience; strong analytical background',
      'You can read a query plan and hold your own with engineers',
      'Willing to do unglamorous work: support tickets, docs, onboarding calls',
    ],
  },
  {
    company: 'Meridian HR',
    title: 'Assistant Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Noida', 'New Delhi'],
    salaryMin: 1400000,
    salaryMax: 2000000,
    experienceMin: 1,
    experienceMax: 3,
    skills: ['Product Management', 'User Research', 'Jira'],
    postedDaysAgo: 5,
    recruiterName: 'Rohit Bansal',
    recruiterTitle: 'Talent Partner',
    description:
      'Support the core ATS product team on candidate experience: application forms, scheduling and offer workflows.',
    requirements: [
      '1-3 years in product, business analysis or customer success',
      'Comfortable running user interviews and synthesising notes',
      'Strong written communication - we work async across two offices',
    ],
  },
  {
    company: 'Orchard Retail',
    title: 'Senior Product Manager, Fulfilment',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Mumbai'],
    salaryMin: 4000000,
    salaryMax: 5500000,
    experienceMin: 6,
    experienceMax: 10,
    equityMin: 0.08,
    equityMax: 0.2,
    skills: ['Product Management', 'Supply Chain', 'SQL', 'Roadmapping'],
    postedDaysAgo: 7,
    recruiterName: 'Sneha Iyer',
    recruiterTitle: 'VP Product',
    description:
      'Own inventory sync and returns across five marketplace integrations. This area drives most of our support load, so the mandate is to make it boring.',
    requirements: [
      '6+ years product management with at least 2 in commerce or logistics',
      'Comfortable owning a domain with heavy operational and edge-case load',
      'Experience with marketplace integrations is a strong plus',
    ],
  },
  {
    company: 'Peak Foods',
    title: 'Product Manager, Kitchen Ops',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Delhi', 'Gurgaon'],
    salaryMin: 2800000,
    salaryMax: 4000000,
    experienceMin: 3,
    experienceMax: 6,
    skills: ['Product Management', 'Operations', 'SQL'],
    postedDaysAgo: 4,
    recruiterName: 'Kabir Malhotra',
    recruiterTitle: 'Senior Recruiter',
    description:
      'Build the tooling our kitchen managers use every shift: prep planning, wastage tracking and rider handoff. You will spend your first month working out of actual kitchens.',
    requirements: [
      '3+ years product management, ideally on internal or ops tooling',
      'Willing to travel to kitchen sites regularly',
      'Bias toward simple interfaces used by non-technical staff',
    ],
  },
  {
    company: 'Quanta Labs',
    title: 'Product Manager, ML Platform',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Bengaluru', 'Remote'],
    salaryMin: 3500000,
    salaryMax: 5000000,
    experienceMin: 4,
    experienceMax: 8,
    equityMin: 0.1,
    equityMax: 0.3,
    skills: ['Product Management', 'Machine Learning', 'Python', 'Developer Tools'],
    postedDaysAgo: 6,
    recruiterName: 'Dr. Neha Krishnan',
    recruiterTitle: 'CTO',
    description:
      'Define the roadmap for our in-VPC training and evaluation platform. Our users are ML engineers at banks and hospitals, so compliance is a feature, not a tax.',
    requirements: [
      '4+ years product management on technical or infrastructure products',
      'You can read Python and reason about model training pipelines',
      'Experience selling into regulated industries is a plus',
    ],
  },
  {
    company: 'Terra Logistics',
    title: 'Senior Backend Engineer',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Gurgaon'],
    salaryMin: 3500000,
    salaryMax: 5000000,
    experienceMin: 5,
    experienceMax: 9,
    skills: ['Node.js', 'PostgreSQL', 'Kafka', 'TypeScript'],
    postedDaysAgo: 2,
    recruiterName: 'Aditya Kumar',
    recruiterTitle: 'Engineering Manager',
    description:
      'Work on the ingestion pipeline that takes GPS pings from 40,000 trucks and turns them into ETAs shippers actually trust.',
    requirements: [
      '5+ years backend engineering in a production environment',
      'Deep familiarity with event streaming, ideally Kafka',
      'Comfortable owning on-call for services you build',
    ],
  },
  {
    company: 'Kite Payments',
    title: 'Frontend Engineer',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Bengaluru'],
    salaryMin: 2400000,
    salaryMax: 3600000,
    experienceMin: 3,
    experienceMax: 6,
    skills: ['React', 'TypeScript', 'Next.js', 'CSS'],
    postedDaysAgo: 8,
    recruiterName: 'Vikram Shetty',
    recruiterTitle: 'Director of Product',
    description:
      'Build the merchant dashboard: reconciliation views, settlement reports and the onboarding flow. Heavy data density, so performance matters.',
    requirements: [
      '3+ years building production React applications',
      'Strong TypeScript; you reach for types before tests',
      'Care about accessibility and keyboard navigation',
    ],
  },
  {
    company: 'Frame Studio',
    title: 'Product Designer',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Remote'],
    salaryMin: 2200000,
    salaryMax: 3400000,
    experienceMin: 3,
    experienceMax: 7,
    equityMin: 0.1,
    equityMax: 0.25,
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    postedDaysAgo: 3,
    recruiterName: 'Maya Sharma',
    recruiterTitle: 'Co-founder',
    description:
      'Design the tool designers use. You will own the component-mapping experience, which is the heart of the product and currently its ugliest part.',
    requirements: [
      '3+ years designing complex software, not marketing sites',
      'You have built or maintained a real design system',
      'Portfolio showing your reasoning, not just final screens',
    ],
  },
  {
    company: 'Nimbus Learning',
    title: 'Product Manager, Learner Experience',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Pune'],
    salaryMin: 2600000,
    salaryMax: 3800000,
    experienceMin: 3,
    experienceMax: 6,
    skills: ['Product Management', 'User Research', 'Analytics'],
    postedDaysAgo: 10,
    recruiterName: 'Farhan Qureshi',
    recruiterTitle: 'Head of Product',
    description:
      'Own completion rate. Everything from cohort onboarding to project review turnaround is in scope, and you will have the analytics to prove what moved.',
    requirements: [
      '3+ years product management with a consumer or prosumer product',
      'Genuinely comfortable with retention and funnel analysis',
      'Interest in education outcomes, not just engagement metrics',
    ],
  },
  {
    company: 'Vayu Energy',
    title: 'Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Hyderabad'],
    salaryMin: 2200000,
    salaryMax: 3200000,
    experienceMin: 2,
    experienceMax: 5,
    equityMin: 0.05,
    equityMax: 0.15,
    skills: ['Product Management', 'IoT', 'Analytics'],
    postedDaysAgo: 12,
    recruiterName: 'Lakshmi Reddy',
    recruiterTitle: 'Founder',
    description:
      'Own the monitoring product that tells our operations team which of 900 rooftop installations is underperforming and why.',
    requirements: [
      '2+ years product management or technical program management',
      'Comfortable with sensor data and its many failure modes',
      'Willing to visit installation sites',
    ],
  },
  {
    company: 'Cobalt Security',
    title: 'Founding Product Manager',
    roleType: 'COFOUNDER',
    locationType: 'REMOTE',
    cities: ['Remote'],
    salaryMin: 1800000,
    salaryMax: 3000000,
    experienceMin: 4,
    experienceMax: 10,
    equityMin: 1.0,
    equityMax: 4.0,
    skills: ['Product Management', 'Cloud Security', 'AWS'],
    postedDaysAgo: 15,
    recruiterName: 'Arjun Nair',
    recruiterTitle: 'Founder',
    description:
      'Join as the founding PM with meaningful equity. You will define what we build after the initial AWS posture scanner, and you will also write the docs and run the demos.',
    requirements: [
      '4+ years in product, ideally with security or infrastructure exposure',
      'Prepared to take a below-market salary for real equity',
      'Comfortable being the second-loudest voice on product strategy',
    ],
  },
  {
    company: 'Harbor Insurance',
    title: 'Product Manager, Claims',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Chennai'],
    salaryMin: 2400000,
    salaryMax: 3600000,
    experienceMin: 3,
    experienceMax: 7,
    skills: ['Product Management', 'Insurance', 'Process Design'],
    postedDaysAgo: 9,
    recruiterName: 'Divya Raman',
    recruiterTitle: 'Talent Lead',
    description:
      'Reduce claim turnaround from 11 days to under 5. You will own the internal claims console and the member-facing status experience.',
    requirements: [
      '3+ years product management, ideally in insurance or fintech',
      'Strong process-design instincts; much of this is workflow, not UI',
      'Empathy for members dealing with a claim at a bad moment',
    ],
  },
  {
    company: 'Jetty Travel',
    title: 'Associate Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Jaipur'],
    salaryMin: 1500000,
    salaryMax: 2200000,
    experienceMin: 1,
    experienceMax: 3,
    skills: ['Product Management', 'SQL', 'Travel'],
    postedDaysAgo: 14,
    recruiterName: 'Ishaan Gupta',
    recruiterTitle: 'Product Lead',
    description:
      'Own the expense-reporting flow that travellers use after a trip. Small surface, high usage, lots of measurable wins available.',
    requirements: [
      '1-3 years in product or a highly analytical operations role',
      'Comfortable with spreadsheets and SQL',
      'Detail-oriented: this domain is full of edge cases',
    ],
  },
  {
    company: 'Alloy Manufacturing',
    title: 'Product Manager, Quality',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Kolkata'],
    salaryMin: 2000000,
    salaryMax: 3000000,
    experienceMin: 3,
    experienceMax: 6,
    skills: ['Product Management', 'Manufacturing', 'Analytics'],
    postedDaysAgo: 18,
    recruiterName: 'Sourav Das',
    recruiterTitle: 'Head of Product',
    description:
      'Digitise quality inspection on the shop floor. Today it is paper checklists; you will replace them with something operators actually prefer.',
    requirements: [
      '3+ years product management, ideally B2B or industrial',
      'Willing to spend real time on factory floors',
      'Patience for long enterprise sales cycles',
    ],
  },
  {
    company: 'Willow Care',
    title: 'Product Manager',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Mysuru', 'Remote'],
    salaryMin: 2000000,
    salaryMax: 3000000,
    experienceMin: 2,
    experienceMax: 5,
    equityMin: 0.05,
    equityMax: 0.2,
    skills: ['Product Management', 'Healthcare', 'User Research'],
    postedDaysAgo: 11,
    recruiterName: 'Tara Joseph',
    recruiterTitle: 'Co-founder',
    description:
      'Own the self-guided program experience. This is sensitive product work where the wrong nudge does real harm, so research rigour matters more than velocity.',
    requirements: [
      '2+ years product management on a consumer product',
      'Experience with sensitive or health-adjacent domains preferred',
      'Strong qualitative research skills',
    ],
  },
  {
    company: 'Sable Analytics',
    title: 'Full Stack Engineer',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Remote', 'Bengaluru'],
    salaryMin: 2400000,
    salaryMax: 3800000,
    experienceMin: 3,
    experienceMax: 7,
    equityMin: 0.08,
    equityMax: 0.25,
    skills: ['TypeScript', 'React', 'PostgreSQL', 'Node.js'],
    postedDaysAgo: 5,
    recruiterName: 'Priya Menon',
    recruiterTitle: 'Co-founder',
    description:
      'Third engineering hire. You will work across the query engine and the dashboard UI, and you will talk to customers directly.',
    requirements: [
      '3+ years full-stack experience with TypeScript',
      'Comfortable writing non-trivial SQL',
      'Happy without a dedicated QA or design partner',
    ],
  },
  {
    company: 'Lumen Health',
    title: 'Data Analyst',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Bengaluru'],
    salaryMin: 1400000,
    salaryMax: 2200000,
    experienceMin: 1,
    experienceMax: 4,
    skills: ['SQL', 'Python', 'Analytics', 'Dashboards'],
    postedDaysAgo: 6,
    recruiterName: 'Ananya Rao',
    recruiterTitle: 'Head of Talent',
    description:
      'Support the clinical operations team with reporting on diagnostic turnaround, no-show rates and care-team utilisation.',
    requirements: [
      '1-4 years in an analytics role',
      'Strong SQL; Python for analysis is a plus',
      'Can present findings to a non-technical audience',
    ],
  },
  {
    company: 'Meridian HR',
    title: 'Product Management Intern',
    roleType: 'INTERNSHIP',
    locationType: 'HYBRID',
    cities: ['Noida'],
    salaryMin: 300000,
    salaryMax: 480000,
    experienceMin: 0,
    experienceMax: 1,
    skills: ['Product Management', 'User Research'],
    postedDaysAgo: 4,
    recruiterName: 'Rohit Bansal',
    recruiterTitle: 'Talent Partner',
    description:
      'Six-month internship with a real roadmap slice: you will own the interview-scheduling improvements end to end, with a mentor.',
    requirements: [
      'Final-year student or recent graduate',
      'Some evidence you can ship - a side project, a club, an internship',
      'Available full time for six months',
    ],
  },
  {
    company: 'Orchard Retail',
    title: 'Growth Product Manager (Contract)',
    roleType: 'CONTRACT',
    locationType: 'REMOTE',
    cities: ['Remote', 'Mumbai'],
    salaryMin: 1800000,
    salaryMax: 2800000,
    experienceMin: 4,
    experienceMax: 8,
    skills: ['Growth', 'Product Management', 'Experimentation', 'SQL'],
    postedDaysAgo: 20,
    recruiterName: 'Sneha Iyer',
    recruiterTitle: 'VP Product',
    description:
      'Six-month contract to build our experimentation practice: instrumentation, a test backlog and the discipline to call losers early.',
    requirements: [
      '4+ years growth or product management',
      'You have run a real A/B testing program, not just read about one',
      'Available at least 30 hours a week',
    ],
  },
  {
    company: 'Terra Logistics',
    title: 'Product Manager, Shipper Experience',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Gurgaon', 'New Delhi'],
    salaryMin: 3000000,
    salaryMax: 4200000,
    experienceMin: 4,
    experienceMax: 8,
    skills: ['Product Management', 'Logistics', 'SQL', 'API Design'],
    postedDaysAgo: 13,
    recruiterName: 'Aditya Kumar',
    recruiterTitle: 'Engineering Manager',
    description:
      'Own everything the shipper sees: the tracking portal, alerting and the API our largest customers integrate against.',
    requirements: [
      '4+ years product management in B2B software',
      'Comfortable designing APIs alongside engineers',
      'Logistics or supply-chain background is a plus, not a requirement',
    ],
  },
  {
    company: 'Nimbus Learning',
    title: 'Backend Engineer',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Pune'],
    salaryMin: 2000000,
    salaryMax: 3200000,
    experienceMin: 2,
    experienceMax: 6,
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    postedDaysAgo: 16,
    recruiterName: 'Farhan Qureshi',
    recruiterTitle: 'Head of Product',
    description:
      'Build the cohort and project-review systems that keep 40 concurrent programs running.',
    requirements: [
      '2+ years Python backend experience',
      'Familiar with Django or a similar batteries-included framework',
      'Care about test coverage on scheduling logic',
    ],
  },
  {
    company: 'Peak Foods',
    title: 'Senior Data Scientist',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Delhi'],
    salaryMin: 3200000,
    salaryMax: 4600000,
    experienceMin: 4,
    experienceMax: 9,
    skills: ['Python', 'Machine Learning', 'SQL', 'Forecasting'],
    postedDaysAgo: 22,
    recruiterName: 'Kabir Malhotra',
    recruiterTitle: 'Senior Recruiter',
    description:
      'Own demand forecasting across 90 kitchens. Getting this right cuts wastage; getting it wrong strands inventory.',
    requirements: [
      '4+ years applied data science with production models',
      'Strong time-series forecasting background',
      'Can explain model behaviour to kitchen operators',
    ],
  },
  {
    company: 'Frame Studio',
    title: 'Frontend Engineer',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Remote'],
    salaryMin: 2200000,
    salaryMax: 3600000,
    experienceMin: 3,
    experienceMax: 7,
    equityMin: 0.08,
    equityMax: 0.2,
    skills: ['React', 'TypeScript', 'Canvas', 'Design Systems'],
    postedDaysAgo: 7,
    recruiterName: 'Maya Sharma',
    recruiterTitle: 'Co-founder',
    description:
      'Work on the canvas editor. Lots of interesting rendering and interaction problems, and a very high bar for polish.',
    requirements: [
      '3+ years frontend engineering with React',
      'Interest in rendering performance and interaction design',
      'Bonus: canvas, WebGL or editor experience',
    ],
  },
  {
    company: 'Quanta Labs',
    title: 'ML Engineer',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Bengaluru', 'Remote'],
    salaryMin: 3000000,
    salaryMax: 4500000,
    experienceMin: 3,
    experienceMax: 7,
    equityMin: 0.08,
    equityMax: 0.2,
    skills: ['Python', 'PyTorch', 'Kubernetes', 'Machine Learning'],
    postedDaysAgo: 9,
    recruiterName: 'Dr. Neha Krishnan',
    recruiterTitle: 'CTO',
    description:
      'Build the training orchestration layer that runs inside customer VPCs, with no egress and full audit logging.',
    requirements: [
      '3+ years ML or infrastructure engineering',
      'Solid Kubernetes fundamentals',
      'Comfortable debugging in environments you cannot SSH into',
    ],
  },
  {
    company: 'Harbor Insurance',
    title: 'Business Analyst',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Chennai'],
    salaryMin: 1200000,
    salaryMax: 1800000,
    experienceMin: 1,
    experienceMax: 4,
    skills: ['SQL', 'Excel', 'Analytics', 'Process Design'],
    postedDaysAgo: 17,
    recruiterName: 'Divya Raman',
    recruiterTitle: 'Talent Lead',
    description:
      'Analyse claims patterns and support pricing decisions for group health policies.',
    requirements: [
      '1-4 years in analysis, consulting or insurance operations',
      'Strong Excel and SQL',
      'Comfortable presenting to underwriters',
    ],
  },
  {
    company: 'Vayu Energy',
    title: 'Operations Manager',
    roleType: 'FULL_TIME',
    locationType: 'ONSITE',
    cities: ['Hyderabad'],
    salaryMin: 1400000,
    salaryMax: 2200000,
    experienceMin: 2,
    experienceMax: 6,
    skills: ['Operations', 'Project Management', 'Analytics'],
    postedDaysAgo: 25,
    recruiterName: 'Lakshmi Reddy',
    recruiterTitle: 'Founder',
    description:
      'Own installation timelines across Telangana and Andhra Pradesh, coordinating vendors, inspections and grid approvals.',
    requirements: [
      '2+ years in operations or project management',
      'Comfortable managing external vendors',
      'Willing to travel roughly 40% of the time',
    ],
  },
  {
    company: 'Jetty Travel',
    title: 'Customer Success Manager',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Jaipur', 'Gurgaon'],
    salaryMin: 1000000,
    salaryMax: 1600000,
    experienceMin: 2,
    experienceMax: 5,
    skills: ['Customer Success', 'Account Management', 'Travel'],
    postedDaysAgo: 19,
    recruiterName: 'Ishaan Gupta',
    recruiterTitle: 'Product Lead',
    description:
      'Own a book of 30 mid-market accounts: onboarding, policy configuration and renewal.',
    requirements: [
      '2+ years in customer success or account management for B2B SaaS',
      'Comfortable with quarterly business reviews',
      'Travel-industry experience is a plus',
    ],
  },
  {
    company: 'Cobalt Security',
    title: 'Security Engineer',
    roleType: 'FULL_TIME',
    locationType: 'REMOTE',
    cities: ['Remote'],
    salaryMin: 2600000,
    salaryMax: 4000000,
    experienceMin: 3,
    experienceMax: 8,
    equityMin: 0.15,
    equityMax: 0.5,
    skills: ['AWS', 'Cloud Security', 'Python', 'Terraform'],
    postedDaysAgo: 21,
    recruiterName: 'Arjun Nair',
    recruiterTitle: 'Founder',
    description:
      'Write the detections that make our scanner useful, and cut the false-positive rate that makes competitors unusable.',
    requirements: [
      '3+ years in cloud security or infrastructure engineering',
      'Deep AWS IAM knowledge',
      'You have opinions about which CVEs actually matter',
    ],
  },
  {
    company: 'Alloy Manufacturing',
    title: 'Frontend Engineer',
    roleType: 'FULL_TIME',
    locationType: 'HYBRID',
    cities: ['Kolkata'],
    salaryMin: 1600000,
    salaryMax: 2600000,
    experienceMin: 2,
    experienceMax: 5,
    skills: ['React', 'TypeScript', 'CSS'],
    postedDaysAgo: 24,
    recruiterName: 'Sourav Das',
    recruiterTitle: 'Head of Product',
    description:
      'Build shop-floor interfaces that work on cheap tablets with gloves on and patchy wifi.',
    requirements: [
      '2+ years React experience',
      'Care about performance on low-end devices',
      'Offline-first experience is a plus',
    ],
  },
  {
    company: 'Willow Care',
    title: 'Content Designer (Part-time)',
    roleType: 'PART_TIME',
    locationType: 'REMOTE',
    cities: ['Remote'],
    salaryMin: 600000,
    salaryMax: 1000000,
    experienceMin: 2,
    experienceMax: 6,
    skills: ['Content Design', 'UX Writing', 'Healthcare'],
    postedDaysAgo: 26,
    recruiterName: 'Tara Joseph',
    recruiterTitle: 'Co-founder',
    description:
      'Write the words in a mental-health product, where tone carries clinical weight. Roughly 20 hours a week.',
    requirements: [
      '2+ years UX writing or content design',
      'Experience with health, finance or another sensitive domain',
      'Comfortable working with clinical reviewers',
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Clearing existing data...');

  // Order matters: children before parents, since SQLite enforces the FKs.
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.hiddenJob.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.jobLocation.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.profileSkill.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.cultureProfile.deleteMany();
  await prisma.jobPreference.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating companies...');
  const companyByName = new Map<string, string>();
  for (const company of companies) {
    const created = await prisma.company.create({
      data: {
        ...company,
        slug: slugify(company.name),
        logoUrl: logoFor(company.name),
        websiteUrl: `https://${slugify(company.name)}.example.com`,
      },
    });
    companyByName.set(company.name, created.id);
  }

  console.log('Creating skills...');
  const allSkillNames = Array.from(
    new Set([
      ...jobs.flatMap((job) => job.skills),
      'Roadmapping',
      'Stakeholder Management',
      'A/B Testing',
      'Wireframing',
    ]),
  );
  const skillByName = new Map<string, string>();
  for (const name of allSkillNames) {
    const created = await prisma.skill.create({
      data: { name, slug: slugify(name) },
    });
    skillByName.set(name, created.id);
  }

  console.log(`Creating ${jobs.length} jobs...`);
  const jobIdByTitle = new Map<string, string>();
  for (const job of jobs) {
    const companyId = companyByName.get(job.company);
    if (!companyId) throw new Error(`Unknown company: ${job.company}`);

    const created = await prisma.job.create({
      data: {
        companyId,
        title: job.title,
        // Company name keeps the slug unique when two firms post the same title.
        slug: slugify(`${job.title}-${job.company}`),
        description: job.description,
        requirements: JSON.stringify(job.requirements),
        roleType: job.roleType,
        locationType: job.locationType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: 'INR',
        equityMin: job.equityMin ?? null,
        equityMax: job.equityMax ?? null,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        recruiterName: job.recruiterName,
        recruiterTitle: job.recruiterTitle,
        applicantCount: 3 + ((job.title.length * 7) % 60),
        postedAt: daysAgo(job.postedDaysAgo),
        locations: {
          create: job.cities.map((city) => ({
            city,
            country: city === 'Remote' ? 'Worldwide' : 'India',
          })),
        },
        skills: {
          create: job.skills.map((name) => ({
            skillId: skillByName.get(name)!,
          })),
        },
      },
    });

    jobIdByTitle.set(`${job.company}:${job.title}`, created.id);
  }

  console.log('Creating demo candidate...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: 'Mohit Gautam',
      passwordHash,
      avatarUrl: logoFor('Mohit Gautam'),
      profile: {
        create: {
          headline: 'Associate Product Manager | Fintech & Marketplaces',
          primaryRole: 'Product Manager',
          openToRoles: JSON.stringify([
            'Product Manager',
            'Associate Product Manager',
            'Product Analyst',
          ]),
          bio: 'APM with two years across payments and marketplace products. I like problems where the metric is unambiguous and the operational reality is messy. Currently looking for a PM role in Bengaluru or remote.',
          location: 'Bengaluru, India',
          yearsOfExperience: 2,
          websiteUrl: 'https://example.com/mohit',
          linkedinUrl: 'https://linkedin.com/in/example',
          githubUrl: 'https://github.com/example',
          resumeFileName: 'mohit-gautam-resume.pdf',
          achievements:
            'Cut checkout drop-off by 18% in two quarters. Ran the migration of 12k merchants onto a new settlement flow with no downtime.',
          preference: {
            create: {
              searchStatus: 'READY_TO_INTERVIEW',
              desiredRoleTypes: JSON.stringify(['FULL_TIME', 'CONTRACT']),
              desiredRoles: JSON.stringify([
                'Product Manager',
                'Associate Product Manager',
              ]),
              desiredLocations: JSON.stringify([
                'Bengaluru',
                'Remote',
                'Hyderabad',
              ]),
              desiredCompanySizes: JSON.stringify(['11-50', '51-200', '201-500']),
              workAuthorization: 'CITIZEN',
              openToRemote: true,
              willingToRelocate: false,
              desiredSalaryMin: 2400000,
              currency: 'INR',
            },
          },
          culture: {
            create: {
              lookingFor:
                'A team small enough that I talk to users directly, working on a product where the success metric is not vanity.',
              workEnvironment: 'HYBRID',
              importantFactors: JSON.stringify([
                'Mentorship',
                'Ownership',
                'Product-led culture',
              ]),
              remotePolicyImportance: 4,
              quietOfficeImportance: 3,
              marketsInterested: JSON.stringify([
                'Fintech',
                'Healthtech',
                'Developer Tools',
              ]),
              marketsExcluded: JSON.stringify(['Gambling', 'Tobacco']),
            },
          },
          experiences: {
            create: [
              {
                company: 'Kite Payments',
                title: 'Associate Product Manager',
                location: 'Bengaluru, India',
                description:
                  'Own the merchant onboarding funnel. Cut time-to-first-transaction from 6 days to 38 hours by rebuilding KYC document collection and adding an async review queue.',
                startDate: new Date('2024-03-01'),
                isCurrent: true,
              },
              {
                company: 'Orchard Retail',
                title: 'Business Analyst',
                location: 'Mumbai, India',
                description:
                  'Reporting and analysis for the fulfilment team. Built the returns dashboard that became the basis for the returns product roadmap.',
                startDate: new Date('2022-07-01'),
                endDate: new Date('2024-02-28'),
                isCurrent: false,
              },
            ],
          },
          educations: {
            create: [
              {
                school: 'Delhi Technological University',
                degree: 'B.Tech',
                fieldOfStudy: 'Computer Science',
                startYear: 2018,
                endYear: 2022,
                description: 'Product club lead; final-year project on demand forecasting.',
              },
            ],
          },
        },
      },
    },
    include: { profile: true },
  });

  const profileId = demoUser.profile!.id;

  console.log('Attaching candidate skills...');
  const candidateSkills: [string, number][] = [
    ['Product Management', 2],
    ['SQL', 3],
    ['User Research', 2],
    ['Analytics', 3],
    ['Figma', 1],
    ['A/B Testing', 2],
    ['Stakeholder Management', 2],
  ];
  await prisma.profileSkill.createMany({
    data: candidateSkills.map(([name, years]) => ({
      profileId,
      skillId: skillByName.get(name)!,
      yearsOfExperience: years,
    })),
  });

  console.log('Creating saved jobs, hidden jobs and saved searches...');
  const savedTitles = [
    'Lumen Health:Associate Product Manager',
    'Sable Analytics:Associate Product Manager',
    'Quanta Labs:Product Manager, ML Platform',
    'Kite Payments:Product Manager, Payments',
    'Willow Care:Product Manager',
    'Frame Studio:Product Designer',
    'Nimbus Learning:Product Manager, Learner Experience',
  ];
  await prisma.savedJob.createMany({
    data: savedTitles.map((key) => ({
      userId: demoUser.id,
      jobId: jobIdByTitle.get(key)!,
    })),
  });

  await prisma.hiddenJob.createMany({
    data: [
      'Peak Foods:Senior Data Scientist',
      'Alloy Manufacturing:Frontend Engineer',
    ].map((key) => ({ userId: demoUser.id, jobId: jobIdByTitle.get(key)! })),
  });

  await prisma.savedSearch.create({
    data: {
      userId: demoUser.id,
      name: 'PM roles - Bengaluru & remote',
      alertEnabled: true,
      filters: JSON.stringify({
        q: '"associate product manager" "product manager"',
        locations: ['Bengaluru', 'Remote'],
        roleTypes: ['FULL_TIME'],
        sort: 'recommended',
      }),
    },
  });

  console.log('Creating applications with timelines...');
  const applicationSeeds: {
    key: string;
    status: string;
    daysAgo: number;
    coverLetter: string;
    timeline: { status: string; note: string; daysAgo: number }[];
  }[] = [
    {
      key: 'Meridian HR:Assistant Product Manager',
      status: 'INTERVIEWING',
      daysAgo: 9,
      coverLetter:
        'I spent 18 months on the fulfilment side at Orchard before moving into product, so candidate-experience workflows are familiar territory. Happy to walk through the returns dashboard I built.',
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', daysAgo: 9 },
        { status: 'IN_REVIEW', note: 'Viewed by Rohit Bansal', daysAgo: 8 },
        { status: 'INTERVIEWING', note: 'Round 1 scheduled for Thursday', daysAgo: 4 },
      ],
    },
    {
      key: 'Terra Logistics:Product Manager, Shipper Experience',
      status: 'IN_REVIEW',
      daysAgo: 6,
      coverLetter:
        'The API-facing half of this role is what interests me most - I owned the merchant-facing endpoints at Kite and worked directly with integration partners.',
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', daysAgo: 6 },
        { status: 'IN_REVIEW', note: 'Application under review', daysAgo: 5 },
      ],
    },
    {
      key: 'Vayu Energy:Product Manager',
      status: 'APPLIED',
      daysAgo: 2,
      coverLetter:
        'I have not worked with sensor data before, but the monitoring problem reads a lot like reconciliation: noisy inputs, and an operator who needs one clear answer.',
      timeline: [{ status: 'APPLIED', note: 'Application submitted', daysAgo: 2 }],
    },
    {
      key: 'Jetty Travel:Associate Product Manager',
      status: 'REJECTED',
      daysAgo: 21,
      coverLetter:
        'Expense reporting is exactly the kind of high-usage, small-surface problem I enjoy.',
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', daysAgo: 21 },
        { status: 'IN_REVIEW', note: 'Application under review', daysAgo: 19 },
        {
          status: 'REJECTED',
          note: 'Moving forward with candidates based in Jaipur',
          daysAgo: 14,
        },
      ],
    },
    {
      key: 'Harbor Insurance:Product Manager, Claims',
      status: 'OFFER',
      daysAgo: 30,
      coverLetter:
        'Reducing claim turnaround is a process problem before it is a software problem, which is the part I find interesting.',
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', daysAgo: 30 },
        { status: 'IN_REVIEW', note: 'Shortlisted', daysAgo: 28 },
        { status: 'INTERVIEWING', note: 'Completed 3 rounds', daysAgo: 18 },
        { status: 'OFFER', note: 'Offer extended - respond by end of month', daysAgo: 7 },
      ],
    },
    {
      key: 'Orchard Retail:Growth Product Manager (Contract)',
      status: 'WITHDRAWN',
      daysAgo: 25,
      coverLetter: 'Interested in the experimentation mandate specifically.',
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', daysAgo: 25 },
        { status: 'WITHDRAWN', note: 'Withdrawn by candidate', daysAgo: 20 },
      ],
    },
  ];

  for (const seed of applicationSeeds) {
    const jobId = jobIdByTitle.get(seed.key);
    if (!jobId) throw new Error(`Unknown job: ${seed.key}`);

    const isTerminal = ['HIRED', 'REJECTED', 'WITHDRAWN'].includes(seed.status);
    const lastActivity = seed.timeline[seed.timeline.length - 1].daysAgo;

    await prisma.application.create({
      data: {
        userId: demoUser.id,
        jobId,
        status: seed.status,
        coverLetter: seed.coverLetter,
        resumeFileName: 'mohit-gautam-resume.pdf',
        appliedAt: daysAgo(seed.daysAgo),
        withdrawnAt: seed.status === 'WITHDRAWN' ? daysAgo(20) : null,
        // Expiry runs 14 days from the last activity, not from submission.
        expiresAt: isTerminal ? null : daysAgo(lastActivity - 14),
        events: {
          create: seed.timeline.map((event) => ({
            status: event.status,
            note: event.note,
            createdAt: daysAgo(event.daysAgo),
          })),
        },
      },
    });
  }

  const jobCount = await prisma.job.count();
  const appCount = await prisma.application.count();

  console.log('\nSeed complete.');
  console.log(`  Companies:    ${companies.length}`);
  console.log(`  Jobs:         ${jobCount}`);
  console.log(`  Applications: ${appCount}`);
  console.log(`\n  Demo login:  ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
