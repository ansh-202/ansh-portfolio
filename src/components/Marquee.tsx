const ROW_A = [
  'SELENIUM WEBDRIVER',
  'PLAYWRIGHT',
  '25,000+ TEST CASES',
  'REST ASSURED',
  'TESTNG',
  'CI/CD',
  'JENKINS',
  'GITHUB ACTIONS',
]
const ROW_B = [
  'FLAKY-TEST DETECTION',
  'SMART REGRESSION',
  'PAGE OBJECT MODEL',
  'PARALLEL EXECUTION',
  'CROSS-BROWSER',
  'AI-ASSISTED',
  'DATA-DRIVEN',
  'E2E',
]

function Row({ items, reverse, duration }: { items: string[]; reverse?: boolean; duration: string }) {
  const content = [...items, ...items]
  return (
    <div className="overflow-hidden py-3">
      <div
        className={`marquee-track ${reverse ? 'reverse' : ''}`}
        style={{ ['--marquee-duration' as string]: duration }}
      >
        {content.map((item, i) => (
          <span
            key={i}
            className={`shrink-0 flex items-center font-display font-extrabold tracking-tight text-2xl sm:text-4xl ${
              reverse ? 'text-ghost' : i % 2 ? 'text-fog/90' : 'text-ghost'
            }`}
          >
            {item}
            <span className="mx-5 sm:mx-7 text-pass text-base sm:text-xl font-mono">✓</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Two counter-scrolling type strips — the suite running past you. */
export default function Marquee() {
  return (
    <div aria-hidden className="relative border-y border-line bg-ink/70 -rotate-[0.6deg] scale-[1.01]">
      <Row items={ROW_A} duration="34s" />
      <div className="rule-dotted" />
      <Row items={ROW_B} reverse duration="40s" />
    </div>
  )
}
