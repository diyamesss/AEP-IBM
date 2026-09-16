import { useState, useEffect } from 'react'
import styles from './WAMPage.module.scss'
import wamHero from './assets/WAM.png'
import ibmImg from './assets/IBM.jpg'
import geographicDistributionImg from './assets/GeographicDistribution.png'
import coreFlexImg from './assets/CoreFlex.png'
import onboardingImg from './assets/Onboarding.png'
import offboardingImg from './assets/Offboarding.png'
import demandManagementImg from './assets/DemandManagement.png'
import { ResourceChurnTable } from '../../../components/shared/ResourceChurnChart/ResourceChurnChart'
import resourceChurnImg from './assets/ResourceChurn.png'
import PortfolioIntroduction from '../../../components/shared/PortfolioIntroduction/PortfolioIntroduction'
import PortfolioSuccessStory from '../../../components/shared/PortfolioSuccessStory/PortfolioSuccessStory'
import { PORTFOLIO_SHOWCASE } from '../../../data/portfolio-showcase'

const videos = import.meta.glob('./assets/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })

const PORTFOLIO_NAME = 'WAM'
const SHOWCASE = PORTFOLIO_SHOWCASE['wam']
const LAST_UPDATE = 'Last update 03/20/2026'

/* ── Chart cards data ────────────────────────────────────────────────────── */
interface ChartCard {
  id: string
  label: string
  description: string
  supplement?: React.ReactNode
  lastUpdate: string
  chart: React.ReactNode
  /** When true the card spans both grid columns */
  fullWidth?: boolean
}

const WAM_CHART_CARDS: ChartCard[] = [
  {
    id: 'geographic-distribution',
    label: 'Geographic Distribution',
    description:
      'Visualisation of how many people are assigned by country. Helps leadership gain insights and make projections of what is coming next in terms of resources.',
    lastUpdate: LAST_UPDATE,
    chart: (
      <img
        src={geographicDistributionImg}
        alt="Geographic Distribution chart"
        className={styles.chartImg}
      />
    ),
  },
  {
    id: 'core-flex-distribution',
    label: 'Core-Flex Distribution',
    description:
      'Visualisation of how people are distributed between Core and Flex. Helps leadership gain insights and make projections of what is coming next in terms of core and flex resources.',
    lastUpdate: LAST_UPDATE,
    chart: (
      <img
        src={coreFlexImg}
        alt="Core-Flex Distribution chart"
        className={styles.chartImg}
      />
    ),
  },
  {
    id: 'resource-churn',
    label: 'Resource Churn (last 3 months)',
    description:
      'Visualisation of people churn progress over the past 3 months. Helps leadership identify which portfolios have higher churn and project what is coming next.',
    supplement: <ResourceChurnTable />,
    lastUpdate: LAST_UPDATE,
    fullWidth: true,
    chart: (
      <img
        src={resourceChurnImg}
        alt="Resource Churn chart"
        className={styles.chartImg}
      />
    ),
  },
  {
    id: 'monthly-onboarding',
    label: 'Monthly Onboarding of Resources',
    description:
      'Visualisation of how resource count is increasing month by month. Helps leadership gain insights and make projections of what is coming next in terms of resource count.',
    lastUpdate: LAST_UPDATE,
    chart: (
      <img
        src={onboardingImg}
        alt="Monthly Onboarding chart"
        className={styles.chartImg}
      />
    ),
  },
  {
    id: 'monthly-offboarding',
    label: 'Monthly Offboarding of Resources',
    description:
      'Tracks resource offboarding activities over the past three months. Helps leadership plan based on the reduction of resource count per month.',
    lastUpdate: LAST_UPDATE,
    chart: (
      <img
        src={offboardingImg}
        alt="Monthly Offboarding chart"
        className={styles.chartImg}
      />
    ),
  },
  {
    id: 'demand-management',
    label: 'Demand Management',
    description:
      'Visualisation of how demand is distributed across a 30-60-90 day forecast. Helps leadership gain insights and make projections of what is coming next in terms of demand.',
    lastUpdate: LAST_UPDATE,
    fullWidth: true,
    chart: (
      <img
        src={demandManagementImg}
        alt="Demand Management chart"
        className={styles.chartImg}
      />
    ),
  },
]

const NICHE_SKILLS = [
  'Maximo Admin and Application Developer',
  'MAS 9.0 Features and Know How',
  'Open Shift Admin, Development',
  'React NodeJS',
  'Eggplant Test Automation',
  'Dynatrace',
  'Splunk',
]

const NAV_LINKS = [
  { id: 'analytics',  label: `${PORTFOLIO_NAME} by the Numbers` },
  { id: 'highlights', label: 'Highlights' },
]

/* ── Individual chart card ─────────────────────────────────────────────── */
function ChartCardPanel({ card }: { card: ChartCard }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      id={card.id}
      className={`${styles.chartCard}${card.fullWidth ? ` ${styles.chartCardFull}` : ''}`}
      aria-labelledby={`card-title-${card.id}`}
    >
      <header className={styles.cardHeader}>
        <h3 id={`card-title-${card.id}`} className={styles.cardTitle}>{card.label}</h3>
        <p className={styles.cardDesc}>{card.description}</p>
        {card.supplement && (
          <>
            <button
              className={styles.supplementToggle}
              aria-expanded={expanded}
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? 'Hide definitions ↑' : 'View definitions ↓'}
            </button>
            {expanded && (
              <div className={styles.cardSupplement}>{card.supplement}</div>
            )}
          </>
        )}
        <p className={styles.cardLastUpdate}>{card.lastUpdate}</p>
      </header>

      <div className={styles.cardChartArea}>
        {card.chart}
      </div>
    </article>
  )
}

/* ── Active-nav hook — tracks which chart card is in view ───────────────── */
function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [ids])

  return activeId
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function WAMPage() {
  const videoFiles = Object.values(videos) as string[]
  const chartIds = WAM_CHART_CARDS.map(c => c.id)
  const activeChartId = useActiveSection(chartIds)

  return (
    <div className={styles.page} id="top">

      {/* Hero */}
      <div className={styles.hero}>
        <img src={wamHero} alt="WAM" className={styles.heroImg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>IBM · AEP</div>
          <h1 className={styles.pageTitle}>{PORTFOLIO_NAME}</h1>
          <p className={styles.heroSub}>Work &amp; Asset Management solutions</p>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className={styles.navBar} aria-label="Page sections">
        {NAV_LINKS.map(link => (
          <button
            key={link.id}
            className={styles.navLink}
            onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* ── About WAM ── */}
      <PortfolioIntroduction portfolioName={PORTFOLIO_NAME} showcase={SHOWCASE} />

      {/* ── From Challenge to Impact ── */}
      <PortfolioSuccessStory successStory={SHOWCASE} />

      {/* ── WAM by the Numbers — card grid ── */}
      <section id="analytics" className={styles.analyticsSection} aria-labelledby="analytics-heading">
        <div className={styles.analyticsInner}>
          <div className={styles.analyticsHeadingRow}>
            <span className={styles.analyticsEyebrow}>Analytics</span>
            <h2 id="analytics-heading" className={styles.analyticsHeading}>
              {PORTFOLIO_NAME} by the Numbers
            </h2>
            <p className={styles.analyticsSubheading}>
              Key workforce metrics and resource distribution insights for the WAM portfolio.
            </p>
          </div>

          {/* Subnav — jump to individual chart, active pill tracks scroll position */}
          <nav className={styles.chartNav} aria-label="Chart sections">
            {WAM_CHART_CARDS.map(card => (
              <button
                key={card.id}
                className={`${styles.chartNavItem}${activeChartId === card.id ? ` ${styles.chartNavItemActive}` : ''}`}
                aria-current={activeChartId === card.id ? 'true' : undefined}
                onClick={() => {
                  document.getElementById(card.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {card.label}
              </button>
            ))}
          </nav>

          {/* Card grid */}
          <div className={styles.cardGrid}>
            {WAM_CHART_CARDS.map(card => (
              <ChartCardPanel key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section id="highlights" className={styles.highlightsSection} aria-labelledby="highlights-heading">
        <div className={styles.highlightsInner}>
          <div className={styles.highlightsHeaderRow}>
            <h2 id="highlights-heading" className={styles.highlightsTitle}>Highlights</h2>
            <button
              className={styles.backToTop}
              onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Back to top ↑
            </button>
          </div>

          <div className={styles.highlightsGrid}>
            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Main challenges</h3>
                <p className={styles.hlCardText}>
                  In preparation for MAS, the team has undergone necessary training; however, hands-on experience remains limited.
                  The admin team is encountering challenges during the initial installation on the Sandbox environment.
                  Additionally, the team is facing difficulties in identifying the technical changes introduced by the latest iFix,
                  based on the release notes provided by IBM Product team.
                </p>
              </div>
              <img src={ibmImg} alt="IBM" className={styles.hlCardImg} />
            </div>

            <div className={styles.hlCardGrey}>
              <h3 className={styles.hlCardTitleDark}>Niche Skills</h3>
              <ul className={styles.nicheList}>
                {NICHE_SKILLS.map((skill, i) => (
                  <li key={i} className={styles.nicheItem}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Mitigation</h3>
                <p className={styles.hlCardText}>
                  For the first time MAS installation, the team is receiving support from IBM Maximo Service Line.
                  To enhance skills, the team is also undergoing MAS-specific training.
                </p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>
                  Regarding iFix, the team is collaborating with IBM Product team to identify any gaps and is planning
                  to address them in future releases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining video assets */}
      {videoFiles.length > 0 && (
        <div className={styles.content}>
          {videoFiles.map((src, i) => (
            <video key={i} src={src} controls className={styles.video} />
          ))}
        </div>
      )}

    </div>
  )
}
