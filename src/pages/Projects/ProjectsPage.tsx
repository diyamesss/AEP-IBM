import { useState } from 'react'
import styles from './ProjectsPage.module.scss'
import projectsImg from './assets/Projects.png'
import resourcesByProjectImg from './assets/ResourcesByProject.png'
import onshoreAndOffshoreImg from './assets/OnshoreAndOffshore.png'
import proactiveCountImg from './assets/ProactiveCount.png'
import reasonChurnImg from './assets/ReasonChurn.png'
import averageFulfillmentImg from './assets/AverageFulfillment.png'
import monthlyOnboardingImg from './assets/MonthlyOnboarding.png'
import monthlyOffboardingImg from './assets/MonthlyOffboarding.png'
import monthlyResourceCountImg from './assets/MonthlyResourceCount.png'
import demandManagementImg from './assets/DemandManagement.png'

/* ── Chart card data ─────────────────────────────────────────────────────── */
interface ChartCard {
  id: string
  label: string
  description: string
  subLabel?: string
  lastUpdate: string
  img: string
  imgAlt: string
  category: string
}

const LAST_UPDATE = 'Last update 01/20/2026'

const CHART_CARDS: ChartCard[] = [
  {
    id: 'resources-by-project',
    label: 'Resources by Project',
    description: 'Visualization of how many people are assigned by project. Helps leadership get insights and make projections on what is coming next in terms of resources.',
    lastUpdate: LAST_UPDATE,
    img: resourcesByProjectImg,
    imgAlt: 'Resources by Project chart',
    category: 'Allocation',
  },
  {
    id: 'onshore-offshore',
    label: 'Onshore and Offshore Distribution',
    description: 'How people are distributed between onshore and offshore locations. Helps leadership get insights to better manage resource distribution and financials.',
    lastUpdate: LAST_UPDATE,
    img: onshoreAndOffshoreImg,
    imgAlt: 'Onshore and Offshore Distribution chart',
    category: 'Distribution',
  },
  {
    id: 'proactive-count',
    label: 'Proactive Count of Resource by Projects',
    description: 'Number of people being onboarded within different projects, with a focus on proactive resource allocation for anticipated future demands.',
    lastUpdate: LAST_UPDATE,
    img: proactiveCountImg,
    imgAlt: 'Proactive Count of Resource by Projects chart',
    category: 'Onboarding',
  },
  {
    id: 'resource-churn',
    label: 'Resource Churn By Reason (last 3 months)',
    description: 'Resource churn within different projects, categorized by specific reasons for resource departure — a tool for leadership to understand causes and patterns.',
    lastUpdate: LAST_UPDATE,
    img: reasonChurnImg,
    imgAlt: 'Resource Churn By Reason chart',
    category: 'Churn',
  },
  {
    id: 'avg-fulfillment',
    label: 'Average Fulfillment Time (last 6 months)',
    description: 'Comprehensive view of fulfillment times and lead times by project, empowering leadership to make informed decisions regarding project management.',
    subLabel: 'In days',
    lastUpdate: LAST_UPDATE,
    img: averageFulfillmentImg,
    imgAlt: 'Average Fulfillment Time chart',
    category: 'Performance',
  },
  {
    id: 'monthly-onboarding',
    label: 'Monthly Onboarding of Resources (last 3 months)',
    description: 'How resource count is increasing month by month. Helps leadership get insights and make projections of what is coming next in terms of resource count.',
    lastUpdate: LAST_UPDATE,
    img: monthlyOnboardingImg,
    imgAlt: 'Monthly Onboarding of Resources chart',
    category: 'Movements',
  },
  {
    id: 'monthly-offboarding',
    label: 'Monthly Offboarding of Resources (last 3 months)',
    description: 'Resource offboarding activities over the past months across different projects. Helps leadership plan based on reduction of resource count in each project.',
    lastUpdate: LAST_UPDATE,
    img: monthlyOffboardingImg,
    imgAlt: 'Monthly Offboarding of Resources chart',
    category: 'Movements',
  },
  {
    id: 'monthly-resource-count',
    label: 'Monthly Resource Count (last 3 months)',
    description: 'How resource count is changing month by month. Helps leadership get insights and make projections of what is coming next in terms of resource count.',
    lastUpdate: LAST_UPDATE,
    img: monthlyResourceCountImg,
    imgAlt: 'Monthly Resource Count chart',
    category: 'Trends',
  },
  {
    id: 'demand-management',
    label: 'Demand Management 30-60-90 day Forecast',
    description: 'How demand is distributed between 30-60-90 day forecast. Helps leadership get insights and make projections of what is coming next in terms of demand.',
    lastUpdate: LAST_UPDATE,
    img: demandManagementImg,
    imgAlt: 'Demand Management Forecast chart',
    category: 'Forecast',
  },
]

const HIGHLIGHTS = [
  {
    id: 'allocation',
    title: 'Project Allocation',
    description: 'Structured visibility into how resources are distributed across active projects and portfolios.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 3v18"/>
      </svg>
    ),
    gradient: 'teal',
  },
  {
    id: 'distribution',
    title: 'Onshore & Offshore',
    description: 'Clear breakdown of resource distribution between onshore and offshore locations for better financial planning.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    gradient: 'lavender',
  },
  {
    id: 'movements',
    title: 'Resource Movements',
    description: 'Track onboarding, offboarding, and churn across projects to understand workforce dynamics over time.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M17 1l4 4-4 4"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="M7 23l-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    gradient: 'sky',
  },
  {
    id: 'fulfillment',
    title: 'Fulfillment Performance',
    description: 'Monitor average fulfillment and lead times per project to drive more efficient resourcing decisions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    gradient: 'mint',
  },
  {
    id: 'trends',
    title: 'Workforce Trends',
    description: 'Month-by-month resource count trends give leadership the context needed for strategic workforce planning.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    gradient: 'orange',
  },
  {
    id: 'demand',
    title: 'Demand Forecasts',
    description: 'Forward-looking 30-60-90 day demand forecasts support proactive headcount planning and pipeline management.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    gradient: 'rose',
  },
]

/* ── Individual chart card ────────────────────────────────────────────────── */
function ChartCardPanel({ card }: { card: ChartCard }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      id={card.id}
      className={styles.chartCard}
      aria-labelledby={`card-title-${card.id}`}
    >
      {/* Image area */}
      <div className={styles.cardImgWrap}>
        <img
          src={card.img}
          alt={card.imgAlt}
          className={styles.cardImg}
        />
      </div>

      {/* Content area */}
      <div className={styles.cardBody}>
        <span className={styles.cardCategory}>{card.category}</span>
        <h3 id={`card-title-${card.id}`} className={styles.cardTitle}>
          {card.label}
        </h3>
        {card.subLabel && (
          <p className={styles.cardSubLabel}>{card.subLabel}</p>
        )}
        <p className={`${styles.cardDesc} ${expanded ? styles.cardDescExpanded : ''}`}>
          {card.description}
        </p>
        {card.description.length > 100 && (
          <button
            className={styles.expandToggle}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
        <p className={styles.cardLastUpdate}>{card.lastUpdate}</p>
      </div>
    </article>
  )
}

export default function ProjectsPage() {
  return (
    <div className={styles.page} id="top">

      {/* ── Hero ── */}
      <div className={styles.hero} role="region" aria-label="Projects">
        <img src={projectsImg} alt="Projects" className={styles.heroImg} />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>IBM · AEP</div>
          <h1 className={styles.heroHeading}>Projects</h1>
          <p className={styles.heroSub}>
            A centralized hub for project and resource insights, enabling structured visibility
            into allocation, distribution, resource movements, fulfillment performance, and demand forecasts.
          </p>
        </div>
      </div>

      {/* ── Intro / stats ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introLabel}>Resource Intelligence</div>
          <h2 className={styles.introHeading}>Project &amp; Resource Visibility</h2>
          <p className={styles.introSub}>
            Empowering leadership with the data-driven insights needed to manage resources,
            optimise project allocations, and plan ahead with confidence.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>9</span>
              <span className={styles.statLabel}>Chart Views</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>30–90</span>
              <span className={styles.statLabel}>Day Forecast</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100+</span>
              <span className={styles.statLabel}>Active Resources</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights — icon card grid ── */}
      <section className={styles.highlights} aria-labelledby="highlights-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>What's Inside</div>
          <h2 id="highlights-heading" className={styles.sectionTitle}>Dashboard Highlights</h2>
          <p className={styles.sectionBody}>
            Each view surfaces a specific lens on project and workforce data,
            giving leadership clear, actionable intelligence at a glance.
          </p>
        </div>
        <div className={styles.highlightCards}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.id} className={styles.highlightCard}>
              <div className={`${styles.highlightIcon} ${styles[h.gradient]}`}>{h.icon}</div>
              <h3 className={styles.highlightTitle}>{h.title}</h3>
              <p className={styles.highlightBody}>{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Charts section ── */}
      <section id="analytics" className={styles.analyticsSection} aria-labelledby="analytics-heading">
        <div className={styles.analyticsInner}>

          {/* Section heading */}
          <div className={styles.analyticsHeadingRow}>
            <span className={styles.analyticsEyebrow}>Analytics</span>
            <h2 id="analytics-heading" className={styles.analyticsHeading}>
              Projects by the Numbers
            </h2>
            <p className={styles.analyticsSubheading}>
              Key workforce metrics and resource distribution insights across all active projects.
            </p>
          </div>

          {/* Chart subnav */}
          <nav className={styles.chartNav} aria-label="Jump to chart">
            {CHART_CARDS.map(card => (
              <button
                key={card.id}
                className={styles.chartNavItem}
                onClick={() => document.getElementById(card.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {card.label}
              </button>
            ))}
          </nav>

          {/* 2-column card grid */}
          <div className={styles.cardGrid}>
            {CHART_CARDS.map(card => (
              <ChartCardPanel key={card.id} card={card} />
            ))}
          </div>

          {/* Back to top */}
          <div className={styles.backToTopRow}>
            <button
              className={styles.backToTop}
              onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
