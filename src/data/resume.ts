// Single source of truth for all site content. Everything here is taken from
// the resume (Resume.pdf) — do not add achievements or metrics that are not in it.

export const identity = {
  name: 'Ansh Kumar',
  role: 'Software Development Engineer in Test',
  location: 'Noida, India',
  email: 'anshkumar123216@gmail.com',
  linkedin: 'https://linkedin.com/in/anshkumar-sdet/',
  github: 'https://github.com/codeansh20',
  // BASE_URL so the path works at '/' locally and '/ansh-portfolio/' on GitHub Pages
  resumeFile: `${import.meta.env.BASE_URL}Ansh_Kumar_Resume.pdf`,
  summary:
    'SDET with 2.5+ years designing scalable UI and API test automation frameworks. I build the systems that keep 25,000+ test cases honest — flaky-test detection, smart regression selection, and CI pipelines teams can actually trust.',
}

export const heroSpecs = [
  { label: 'scales suites to 25,000+ cases in production CI/CD', ms: 212 },
  { label: 'reduces flaky test executions by ~35%', ms: 148 },
  { label: 'cuts mean-time-to-debug by ~40%', ms: 131 },
  { label: 'shrinks HTML report size by 60–80%', ms: 96 },
  { label: 'ships AI-driven smart regression selection', ms: 177 },
]

export const about = {
  philosophy: [
    'A test suite is a product. It has users — every engineer waiting on a pipeline — and its reliability is a feature you have to engineer deliberately, not hope for.',
    'Most of my work lives in the gap between “the tests exist” and “the team trusts the tests.” That means hunting flakiness with execution-trend analysis instead of retries-and-prayers, separating assertions from page methods so frameworks stay maintainable at 20+ modules, and turning raw Allure output into dashboards that cut release triage from hours to minutes.',
    'Lately that also means AI-assisted engineering: smart regression frameworks that pick the impacted tests dynamically, and AI-driven alerting that tells the team what broke before they ask.',
  ],
}

export type LogLine = { text: string; tag?: string }

export type Role = {
  company: string
  title: string
  location: string
  period: string
  status: 'RUNNING' | 'PASSED'
  summary: string
  log: LogLine[]
}

export const experience: Role[] = [
  {
    company: 'Brevo',
    title: 'Software Development Engineer in Test',
    location: 'Noida, India',
    period: 'Mar 2025 — Present',
    status: 'RUNNING',
    summary:
      'Reliability engineering for a test estate of 25,000+ cases across UI, API, and email delivery.',
    log: [
      {
        tag: 'platform',
        text: 'Engineered a full-stack test analytics and reporting platform — centralized execution storage, interactive dashboards, virtual scrolling — cutting HTML report size by 60–80% and rendering 25,000+ case suites smoothly.',
      },
      {
        tag: 'reliability',
        text: 'Built intelligent flaky-test detection and auto-recovery from execution trend analysis, reducing false-positive alerts by ~35% and stabilizing CI/CD builds.',
      },
      {
        tag: 'framework',
        text: 'Led the redesign of the Page Object Model architecture, separating assertions from page methods — increasing reuse across 20+ test modules and cutting maintenance time for new contributors.',
      },
      {
        tag: 'framework',
        text: 'Owned API framework utilities — JSON parsing, retry logic, test control, structured logging — reducing flaky occurrences by ~35% and mean-time-to-debug by ~40%.',
      },
      {
        tag: 'coverage',
        text: 'Automated end-to-end Phone UI workflows across line management, voicemail configuration, and call history — full user journeys, configuration flows, and data interactions.',
      },
      {
        tag: 'coverage',
        text: 'Automated 50+ end-to-end email delivery scenarios: DKIM validation, link encryption, campaign lifecycle, credit validation, and free-account edge cases across staging and production.',
      },
      {
        tag: 'deep-tech',
        text: 'Built React-aware automation utilities and custom DragEvent handlers for SVG/canvas interactions in Chrome and Firefox — covering scenarios Selenium Actions cannot.',
      },
      {
        tag: 'triage',
        text: 'Developed execution-history trend dashboards with recurring-failure analysis, 5xx tracking, Allure UX improvements, and AI-driven Slack alerts — release triage went from hours to minutes.',
      },
      {
        tag: 'ai',
        text: 'Co-built an AI-driven smart regression framework that dynamically selects impacted test cases, optimizing CI execution time and pipeline efficiency.',
      },
    ],
  },
  {
    company: 'Crio.Do',
    title: 'QA Automation Engineer',
    location: 'Bengaluru, India',
    period: 'Jan 2024 — Mar 2025',
    status: 'PASSED',
    summary: 'API automation and framework foundations for faster release validation.',
    log: [
      {
        tag: 'api',
        text: 'Designed and maintained scalable REST API automation suites with Java, REST Assured, and TestNG — cutting regression execution time by 50%.',
      },
      {
        tag: 'framework',
        text: 'Built a scalable POM framework with reusable page classes and action abstractions — zero duplication, and 3 QA engineers contributing tests within their first week.',
      },
      {
        tag: 'process',
        text: 'Partnered with developers in Agile sprint reviews to triage defects and close coverage gaps — improving release quality scores across three consecutive quarters.',
      },
      {
        tag: 'tooling',
        text: 'Developed data-driven validation utilities and reusable framework components for execution consistency and debugging efficiency.',
      },
    ],
  },
]

export const skillGroups = [
  {
    name: 'Languages',
    code: 'LANG',
    items: ['Java', 'JavaScript / TypeScript', 'SQL', 'OOP design'],
  },
  {
    name: 'UI Automation',
    code: 'UI',
    items: ['Selenium WebDriver', 'Playwright', 'Page Object Model', 'Cross-browser testing', 'Parallel execution'],
  },
  {
    name: 'API Automation',
    code: 'API',
    items: ['REST Assured', 'Postman', 'UniRest', 'Contract testing', 'Microservices testing'],
  },
  {
    name: 'Frameworks & Build',
    code: 'FWK',
    items: ['TestNG', 'Maven', 'Apache POI', 'Data-driven testing', 'Allure Reports'],
  },
  {
    name: 'CI/CD & Infra',
    code: 'OPS',
    items: ['Jenkins', 'GitHub Actions', 'Git', 'Docker (basics)', 'Jira'],
  },
  {
    name: 'AI & Methodology',
    code: 'AI',
    items: ['AI-driven test selection', 'GenAI-assisted development', 'Agile / Scrum', 'Regression & E2E strategy', 'Integration testing'],
  },
]

export type Project = {
  id: string
  name: string
  problem: string
  approach: string
  impact: string[]
  stack: string[]
}

export const projects: Project[] = [
  {
    id: 'PRJ-01',
    name: 'Test Analytics & Reporting Platform',
    problem:
      'At 25,000+ test cases, standard HTML reports became too heavy to render and too noisy to triage — release decisions were waiting on reports that barely loaded.',
    approach:
      'Built a full-stack platform with centralized execution storage, interactive dashboards, and virtual scrolling, plus execution-history trends, recurring-failure analysis, 5xx error tracking, and AI-driven Slack alert integration.',
    impact: [
      'HTML report size reduced 60–80%',
      'Smooth rendering for 25,000+ case suites',
      'Release triage time: hours → minutes',
    ],
    stack: ['Java', 'TestNG', 'JavaScript', 'Allure', 'Jenkins'],
  },
  {
    id: 'PRJ-02',
    name: 'Flaky-Test Detection & Auto-Recovery',
    problem:
      'Flaky tests were burning CI time and trust — false-positive alerts made real failures easy to ignore.',
    approach:
      'Built detection logic on execution trend analysis rather than blind retries: identify instability patterns across runs, auto-recover known-flaky executions, and keep the signal clean.',
    impact: [
      'False-positive alerts down ~35%',
      'Improved CI/CD pipeline reliability and build stability',
    ],
    stack: ['Java', 'TestNG', 'Jenkins', 'Trend analysis'],
  },
  {
    id: 'PRJ-03',
    name: 'AI-Driven Smart Regression Framework',
    problem:
      'Running the full regression suite on every change made CI slow and expensive — most executed tests were untouched by the change under test.',
    approach:
      'Co-built a smart regression framework with cross-functional teams that dynamically selects impacted test cases per change, so CI runs what matters.',
    impact: ['Optimized CI execution time', 'Improved overall pipeline efficiency'],
    stack: ['Java', 'AI-assisted selection', 'CI/CD'],
  },
  {
    id: 'PRJ-04',
    name: 'React-Aware SVG/Canvas Automation Utilities',
    problem:
      'Drag-and-drop over SVG and canvas in a React app is invisible to Selenium Actions — entire user journeys were unautomatable.',
    approach:
      'Wrote React-aware utilities with custom DragEvent handlers that drive SVG/canvas interactions natively, verified across Chrome and Firefox.',
    impact: ['Complete automation coverage for scenarios Selenium Actions cannot handle'],
    stack: ['JavaScript', 'Selenium', 'React internals', 'Chrome + Firefox'],
  },
]

export const insightTopics = [
  'Flaky-test detection: trend analysis beats retries',
  'Designing POMs that survive 20+ modules',
  'Smart regression: letting AI pick the test set',
  'Making Allure reports usable at 25k cases',
  'Automating what Selenium Actions can’t: React SVG/canvas',
]

export const education = {
  degree: 'B.Tech, Information Technology',
  school: 'MMMUT, Gorakhpur',
  period: 'Dec 2020 — May 2024',
  note: 'CGPA 8.03',
}
