import ScrollVelocity from './bits/ScrollVelocity'

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

const tick = <span className="mx-5 sm:mx-7 text-pass text-base sm:text-xl font-mono">✓</span>
const row = (items: string[]) => (
  <span className="inline-flex items-center">
    {items.map((item) => (
      <span key={item} className="inline-flex items-center">
        {item}
        {tick}
      </span>
    ))}
  </span>
)

/** Two counter-running type strips — the suite running past you. Driven by
 *  React Bits ScrollVelocity: scrolling speeds the suite up and skews it. */
export default function Marquee() {
  return (
    <div aria-hidden className="relative border-y border-line bg-ink/70 -rotate-[0.6deg] scale-[1.01] py-3">
      <ScrollVelocity
        texts={[row(ROW_A), row(ROW_B)]}
        velocity={40}
        numCopies={3}
        damping={50}
        stiffness={400}
        skewWithVelocity={6}
        outlineAlternate
        fadeEdges
        className="font-display font-extrabold tracking-tight text-fog/90"
        scrollerClassName="!text-2xl sm:!text-4xl !leading-tight py-1.5 !drop-shadow-none"
      />
    </div>
  )
}
