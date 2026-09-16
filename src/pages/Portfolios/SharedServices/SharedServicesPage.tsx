import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import styles from './SharedServicesPage.module.scss'
import sharedServicesHero from './assets/SharedServices.png'
import ibmImg from './assets/IBM.jpg'
import geographicDistributionImg from './assets/GeographicDistribution.png'
import coreFlexImg from './assets/CoreFlex.png'
import resourceChurnImg from './assets/ResourceChurn.png'
import onboardingImg from './assets/Onboarding.png'
import offboardingImg from './assets/Offboarding.png'
import demandManagementImg from './assets/DemandManagement.png'
import { ResourceChurnTable } from '../../../components/shared/ResourceChurnChart/ResourceChurnChart'
import PortfolioIntroduction from '../../../components/shared/PortfolioIntroduction/PortfolioIntroduction'
import PortfolioSuccessStory from '../../../components/shared/PortfolioSuccessStory/PortfolioSuccessStory'
import { PORTFOLIO_SHOWCASE } from '../../../data/portfolio-showcase'

const videos = import.meta.glob('./assets/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })

const PORTFOLIO_NAME = 'Shared Services'
const SHOWCASE = PORTFOLIO_SHOWCASE['shared-services']
const LAST_UPDATE = 'Last update 03/20/2026'

interface ChartCard {
  id: string
  label: string
  description: string
  supplement?: React.ReactNode
  lastUpdate: string
  chart: React.ReactNode
  fullWidth?: boolean
}

const CHART_CARDS: ChartCard[] = [
  {
    id: 'geographic-distribution',
    label: 'Geographic Distribution',
    description: 'This chart shows visualization on how many people we have assigned by country. This helps leadership to get insights and make some projection of what is coming next in terms of resources.',
    lastUpdate: LAST_UPDATE,
    chart: <img src={geographicDistributionImg} alt="Geographic Distribution chart" className={styles.chartImg} />,
  },
  {
    id: 'core-flex-distribution',
    label: 'Core-Flex Distribution',
    description: 'This chart shows visualization on how people are distributed between Core and Flex. This helps leadership to get insights and make some projections of what is coming next in terms of core and flex resources.',
    lastUpdate: LAST_UPDATE,
    chart: <img src={coreFlexImg} alt="Core-Flex Distribution chart" className={styles.chartImg} />,
  },
  {
    id: 'resource-churn',
    label: 'Resource Churn (last 3 months)',
    description: 'This chart shows visualization on the progress for people churn in the past 3 months. This helps leadership to get insights of what portfolios we have more churn and make some projection of what is coming next.',
    supplement: <ResourceChurnTable />,
    lastUpdate: LAST_UPDATE,
    chart: <img src={resourceChurnImg} alt="Resource Churn chart" className={styles.chartImg} />,
  },
  {
    id: 'monthly-onboarding',
    label: 'Monthly Onboarding of Resources (last 3 months)',
    description: 'This chart shows visualization on how resource is increasing month by month. This helps leadership to get insights and make some projections of what is coming next in terms of resource count.',
    lastUpdate: LAST_UPDATE,
    chart: <img src={onboardingImg} alt="Monthly Onboarding chart" className={styles.chartImg} />,
  },
  {
    id: 'monthly-offboarding',
    label: 'Monthly Offboarding of Resources (last 3 months)',
    description: 'This chart shows the resource offboarding activities happened for the past three months. Data will help leadership to know and plan accordingly based on the reduction of resource count per month.',
    lastUpdate: LAST_UPDATE,
    chart: <img src={offboardingImg} alt="Monthly Offboarding chart" className={styles.chartImg} />,
  },
  {
    id: 'demand-management',
    label: 'Demand Management',
    description: 'This chart shows visualization on how demand is distributed between 30-60-90 day forecast. This helps leadership to get insights and make some projections of what is coming next in terms of demand.',
    lastUpdate: LAST_UPDATE,
    chart: <img src={demandManagementImg} alt="Demand Management chart" className={styles.chartImg} />,
  },
]

const NICHE_SKILLS = [
  'PeopleSoft Finance',
  'Workday',
]

const NAV_LINKS = [
  { id: 'analytics', label: `${PORTFOLIO_NAME} by the Numbers` },
  { id: 'highlights', label: 'Highlights' },
]

function ChartCardPanel({ card }: { card: ChartCard }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article id={card.id} className={styles.chartCard} aria-labelledby={`card-title-${card.id}`}>
      <header className={styles.cardHeader}>
        <h3 id={`card-title-${card.id}`} className={styles.cardTitle}>{card.label}</h3>
        <p className={styles.cardDesc}>{card.description}</p>
        {card.supplement && (
          <>
            <button className={styles.supplementToggle} aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>
              {expanded ? 'Hide definitions ↑' : 'View definitions ↓'}
            </button>
            {expanded && <div className={styles.cardSupplement}>{card.supplement}</div>}
          </>
        )}
        <p className={styles.cardLastUpdate}>{card.lastUpdate}</p>
      </header>
      <div className={styles.cardChartArea}>{card.chart}</div>
    </article>
  )
}

/* ── Sliding-pill hook ─────────────────────────────────────────────────── */
function useSlidingPill(
  refs: React.RefObject<HTMLButtonElement | null>[],
  activeIndex: number
) {
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({})
  const [pillReady, setPillReady] = useState(false)

  function measure(idx: number) {
    const btn = refs[idx]?.current
    if (!btn) return
    const parent = btn.parentElement
    if (!parent) return
    const pr = parent.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setPillStyle({ left: br.left - pr.left, width: br.width })
  }

  useLayoutEffect(() => {
    measure(activeIndex)
    const id = requestAnimationFrame(() => setPillReady(true))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pillReady) measure(activeIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  useEffect(() => {
    function onResize() { measure(activeIndex) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  return { pillStyle, pillReady }
}

/* ── Active-section hook — drives chart pill via IntersectionObserver ─────── */
function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '')
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [ids])
  return activeId
}

export default function SharedServicesPage() {
  const videoFiles = Object.values(videos) as string[]
  const chartIds = CHART_CARDS.map(c => c.id)

  const [activePillIdx, setActivePillIdx] = useState(0)
  const navBtnRefs = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ]
  const { pillStyle, pillReady } = useSlidingPill(navBtnRefs, activePillIdx)

  function handleNavClick(idx: number, sectionId: string) {
    setActivePillIdx(idx)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeChartId = useActiveSection(chartIds)
  const activeChartIdx = chartIds.indexOf(activeChartId)
  const chartBtnRef0 = useRef<HTMLButtonElement>(null)
  const chartBtnRef1 = useRef<HTMLButtonElement>(null)
  const chartBtnRef2 = useRef<HTMLButtonElement>(null)
  const chartBtnRef3 = useRef<HTMLButtonElement>(null)
  const chartBtnRef4 = useRef<HTMLButtonElement>(null)
  const chartBtnRef5 = useRef<HTMLButtonElement>(null)
  const chartBtnRefs = [chartBtnRef0, chartBtnRef1, chartBtnRef2, chartBtnRef3, chartBtnRef4, chartBtnRef5]
  const { pillStyle: chartPillStyle, pillReady: chartPillReady } =
    useSlidingPill(chartBtnRefs, activeChartIdx < 0 ? 0 : activeChartIdx)

  return (
    <div className={styles.page} id="top">

      <div className={styles.hero}>
        <img src={sharedServicesHero} alt="Shared Services" className={styles.heroImg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>IBM · AEP</div>
          <h1 className={styles.pageTitle}>{PORTFOLIO_NAME}</h1>
          <p className={styles.heroSub}>Enterprise-wide shared capabilities</p>
        </div>
      </div>

      {/* ── Sliding-pill section nav — directly below hero ── */}
      <div className={styles.segWrap}>
        <nav
          className={styles.segControl}
          role="navigation"
          aria-label="Page sections"
        >
          <span
            className={`${styles.segPill}${pillReady ? ` ${styles.segPillAnimated}` : ''}`}
            style={pillStyle}
            aria-hidden="true"
          />
          {NAV_LINKS.map((link, idx) => (
            <button
              key={link.id}
              ref={navBtnRefs[idx]}
              className={`${styles.segBtn}${activePillIdx === idx ? ` ${styles.segBtnActive}` : ''}`}
              aria-pressed={activePillIdx === idx}
              onClick={() => handleNavClick(idx, link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <PortfolioIntroduction portfolioName={PORTFOLIO_NAME} showcase={SHOWCASE} />
      <PortfolioSuccessStory successStory={SHOWCASE} />

      <section id="analytics" className={styles.analyticsSection} aria-labelledby="analytics-heading">
        <div className={styles.analyticsInner}>
          <div className={styles.analyticsHeadingRow}>
            <span className={styles.analyticsEyebrow}>Analytics</span>
            <h2 id="analytics-heading" className={styles.analyticsHeading}>{PORTFOLIO_NAME} by the Numbers</h2>
            <p className={styles.analyticsSubheading}>Key workforce metrics and resource distribution insights for the {PORTFOLIO_NAME} portfolio.</p>
          </div>
          <div className={styles.chartNavWrap} role="tablist" aria-label="Charts">
            <div className={styles.chartNavTrack}>
              <span
                className={`${styles.chartNavPill}${chartPillReady ? ` ${styles.chartNavPillAnimated}` : ''}`}
                style={chartPillStyle}
                aria-hidden="true"
              />
              {CHART_CARDS.map((card, idx) => (
                <button
                  key={card.id}
                  ref={chartBtnRefs[idx]}
                  role="tab"
                  aria-selected={activeChartId === card.id}
                  className={`${styles.chartNavBtn}${activeChartId === card.id ? ` ${styles.chartNavBtnActive}` : ''}`}
                  onClick={() => document.getElementById(card.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  {card.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.cardGrid}>
            {CHART_CARDS.map(card => <ChartCardPanel key={card.id} card={card} />)}
          </div>
        </div>
      </section>

      <section id="highlights" className={styles.highlightsSection} aria-labelledby="highlights-heading">
        <div className={styles.highlightsInner}>
          <div className={styles.highlightsHeaderRow}>
            <h2 id="highlights-heading" className={styles.highlightsTitle}>Highlights</h2>
            <button className={styles.backToTop} onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}>
              Back to top ↑
            </button>
          </div>
          <div className={styles.highlightsGrid}>
            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Main challenges</h3>
                <p className={styles.hlCardText}>Limited resource availability from specific locations and securing Workday resources and specialized skills;</p>
              </div>
              <img src={ibmImg} alt="IBM" className={styles.hlCardImg} />
            </div>
            <div className={styles.hlCardGrey}>
              <h3 className={styles.hlCardTitleDark}>Niche Skills</h3>
              <ul className={styles.nicheList}>
                {NICHE_SKILLS.map((skill, i) => <li key={i} className={styles.nicheItem}>{skill}</li>)}
              </ul>
            </div>
            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Mitigation</h3>
                <p className={styles.hlCardText}>Optimizing resource allocation by prioritizing critical tasks and cross-training opportunities.</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Invest in upskiling existing team members.</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Explore a hybrid model of onshore-offshore resource allocation to balance expertise.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoFiles.length > 0 && (
        <div className={styles.content}>
          {videoFiles.map((src, i) => <video key={i} src={src} controls className={styles.video} />)}
        </div>
      )}
    </div>
  )
}

