import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './EngagementsPage.module.scss'
import portfolioImg from '../Portfolios/assets/Portfolio.png'
import projectsImg  from '../Projects/assets/Projects.png'

/* ── Portfolio card data ─────────────────────────────────────────────────── */
const PORTFOLIO_ITEMS = [
  {
    label: 'WAM',
    path: '/portfolios/wam',
    desc: 'Work & Asset Management solutions',
    img: new URL('../Portfolios/WAM/assets/WAM.png', import.meta.url).href,
  },
  {
    label: 'Energy Delivery',
    path: '/portfolios/energy-delivery',
    desc: 'Reliable energy transmission & distribution',
    img: new URL('../Portfolios/EnergyDelivery/assets/EnergyDelivery.png', import.meta.url).href,
  },
  {
    label: 'Grid Operations',
    path: '/portfolios/grid-operations',
    desc: 'Real-time grid monitoring & control',
    img: new URL('../Portfolios/GridOperations/assets/GridOperations.png', import.meta.url).href,
  },
  {
    label: 'Generation & Commercial Ops',
    path: '/portfolios/generation-commercial',
    desc: 'Power generation & commercial optimization',
    img: new URL('../Portfolios/GenerationCommercial/assets/GenerationCommercial.png', import.meta.url).href,
  },
  {
    label: 'Shared Services',
    path: '/portfolios/shared-services',
    desc: 'Enterprise-wide shared capabilities',
    img: new URL('../Portfolios/SharedServices/assets/SharedServices.png', import.meta.url).href,
  },
  {
    label: 'ICOE',
    path: '/portfolios/icoe',
    desc: 'Innovation Center of Excellence',
    img: new URL('../Portfolios/ICOE/assets/ICOE.png', import.meta.url).href,
  },
  {
    label: 'Automation COE',
    path: '/portfolios/automation-coe',
    desc: 'Intelligent automation & RPA initiatives',
    img: new URL('../Portfolios/AutomationCOE/assets/AutomationCOE.png', import.meta.url).href,
  },
  {
    label: 'Digital Emerging Technology',
    path: '/portfolios/digital-emerging',
    desc: 'Next-gen digital & emerging tech programs',
    img: new URL('../Portfolios/DigitalEmerging/assets/DigitalEmerging.png', import.meta.url).href,
  },
  {
    label: 'Data Platforms',
    path: '/portfolios/data-platforms',
    desc: 'Data infrastructure & analytics platforms',
    img: new URL('../Portfolios/DataPlatforms/assets/DataPlatforms.png', import.meta.url).href,
  },
  {
    label: 'Security',
    path: '/portfolios/security',
    desc: 'Cybersecurity & risk management',
    img: new URL('../Portfolios/Security/assets/Security.png', import.meta.url).href,
  },
  {
    label: 'Customer',
    path: '/portfolios/customer',
    desc: 'Customer experience & engagement',
    img: new URL('../Portfolios/Customer/assets/Customer.png', import.meta.url).href,
  },
]

type Tab = 'portfolio' | 'projects'

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function EngagementsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio')

  /* ── Sliding-pill geometry ───────────────────────────────────────────────
     Measure the active button's bounds relative to the track container and
     drive the pill via inline style. pillReady gates the CSS transition so
     the pill snaps on first render instead of sliding in from zero.        */
  const portfolioBtnRef = useRef<HTMLButtonElement>(null)
  const projectsBtnRef  = useRef<HTMLButtonElement>(null)
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({})
  const [pillReady, setPillReady] = useState(false)

  function measurePill(ref: React.RefObject<HTMLButtonElement | null>) {
    const btn = ref.current
    if (!btn) return
    const parent = btn.parentElement
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    const btnRect    = btn.getBoundingClientRect()
    setPillStyle({
      left:  btnRect.left - parentRect.left,
      width: btnRect.width,
    })
  }

  /* Snap to Portfolio on mount, then enable the CSS transition */
  useLayoutEffect(() => {
    measurePill(portfolioBtnRef)
    const id = requestAnimationFrame(() => setPillReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  /* Slide pill whenever the active tab changes */
  useEffect(() => {
    measurePill(activeTab === 'portfolio' ? portfolioBtnRef : projectsBtnRef)
  }, [activeTab])

  /* Re-measure on resize so the pill stays aligned */
  useEffect(() => {
    function handleResize() {
      measurePill(activeTab === 'portfolio' ? portfolioBtnRef : projectsBtnRef)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab])

  function switchTab(tab: Tab) {
    if (tab === activeTab) return
    setActiveTab(tab)
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero} role="region" aria-label="Engagements">
        <img src={portfolioImg} alt="" className={styles.heroImg} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>IBM · AEP</div>
          <h1 className={styles.heroHeading}>Engagements</h1>
          <p className={styles.heroSub}>
            Explore the domains where IBM and AEP collaborate to drive innovation,
            efficiency, and impact across the enterprise.
          </p>
        </div>
      </div>

      {/* ── Sliding-pill switcher ── */}
      <div className={styles.tabSwitcherWrap}>
        <div
          className={styles.segControl}
          role="tablist"
          aria-label="Engagements sections"
        >
          {/* Pill — no transition on mount to prevent slide-from-0 */}
          <span
            className={`${styles.segPill}${pillReady ? ` ${styles.segPillAnimated}` : ''}`}
            style={pillStyle}
            aria-hidden="true"
          />

          <button
            ref={portfolioBtnRef}
            role="tab"
            aria-selected={activeTab === 'portfolio'}
            className={`${styles.segBtn}${activeTab === 'portfolio' ? ` ${styles.segBtnActive}` : ''}`}
            onClick={() => switchTab('portfolio')}
          >
            Portfolio
          </button>

          <button
            ref={projectsBtnRef}
            role="tab"
            aria-selected={activeTab === 'projects'}
            className={`${styles.segBtn}${activeTab === 'projects' ? ` ${styles.segBtnActive}` : ''}`}
            onClick={() => switchTab('projects')}
          >
            Projects
          </button>
        </div>
      </div>

      {/* ── Content panels ── */}
      <div className={styles.contentArea}>

        {/* ── PORTFOLIO panel ── */}
        <section
          role="tabpanel"
          aria-label="Portfolio"
          className={`${styles.panel}${activeTab === 'portfolio' ? ` ${styles.panelVisible}` : ''}`}
          aria-hidden={activeTab !== 'portfolio'}
        >
          <div className={styles.cardsSection}>
            <div className={styles.inner}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Portfolios</h2>
                <p className={styles.sectionSub}>Select a portfolio to explore its projects and initiatives</p>
              </div>
              <div className={styles.grid}>
                {PORTFOLIO_ITEMS.map(item => (
                  <Link key={item.path} to={item.path} className={styles.card}>
                    <div className={styles.cardImg}>
                      <img src={item.img} alt={item.label} />
                    </div>
                    <div className={styles.cardOverlay} aria-hidden="true" />
                    <div className={styles.cardBody}>
                      <span className={styles.cardLabel}>{item.label}</span>
                      <span className={styles.cardDesc}>{item.desc}</span>
                    </div>
                    <svg
                      className={styles.cardArrow}
                      viewBox="0 0 16 16" width="14" height="14"
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECTS panel ── */}
        <section
          role="tabpanel"
          aria-label="Projects"
          className={`${styles.panel}${activeTab === 'projects' ? ` ${styles.panelVisible}` : ''}`}
          aria-hidden={activeTab !== 'projects'}
        >
          <div className={styles.projectsSection}>
            <div className={styles.inner}>
              <div className={styles.projectsHeader}>
                <h2 className={styles.sectionTitle}>Projects</h2>
                <p className={styles.sectionSub}>
                  A centralized hub for project and resource insights — allocation, distribution,
                  workforce trends, and demand forecasts.
                </p>
              </div>

              {/* Hero thumbnail — clicking goes to the full Projects page */}
              <Link to="/projects" className={styles.projectsThumb}>
                <img src={projectsImg} alt="Projects" className={styles.projectsThumbImg} />
                <div className={styles.projectsThumbOverlay} aria-hidden="true" />
                <div className={styles.projectsThumbContent}>
                  <div className={styles.projectsThumbBadge}>IBM · AEP</div>
                  <span className={styles.projectsThumbTitle}>Projects</span>
                  <span className={styles.projectsThumbSub}>
                    Resource intelligence &amp; project visibility
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
