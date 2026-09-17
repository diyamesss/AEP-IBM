import styles from './WAMPage.module.scss'
import wamHero from './assets/WAM.png'
import ibmImg from './assets/IBM.jpg'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import PortfolioIntroduction from '../../../components/shared/PortfolioIntroduction/PortfolioIntroduction'
import PortfolioSuccessStory from '../../../components/shared/PortfolioSuccessStory/PortfolioSuccessStory'
import PortfolioDashboard from '../../../components/shared/PortfolioDashboard/PortfolioDashboard'
import { PORTFOLIO_SHOWCASE } from '../../../data/portfolio-showcase'

const videos = import.meta.glob('./assets/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })

const PORTFOLIO_SLUG = 'wam'
const PORTFOLIO_NAME = 'WAM'
const SHOWCASE = PORTFOLIO_SHOWCASE[PORTFOLIO_SLUG]

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
  { id: 'analytics', label: `${PORTFOLIO_NAME} by the Numbers` },
  { id: 'highlights', label: 'Highlights' },
]

/* ── Sliding-pill section nav ─────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function WAMPage() {
  const videoFiles = Object.values(videos) as string[]

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

      {/* Section nav pill */}
      <div className={styles.segWrap}>
        <nav className={styles.segControl} role="navigation" aria-label="WAM page sections">
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

      {/* About WAM */}
      <PortfolioIntroduction portfolioName={PORTFOLIO_NAME} showcase={SHOWCASE} />

      {/* From Challenge to Impact */}
      <PortfolioSuccessStory successStory={SHOWCASE} />

      {/* WAM by the Numbers — live monday.com analytics */}
      <PortfolioDashboard portfolioSlug={PORTFOLIO_SLUG} portfolioName={PORTFOLIO_NAME} />

      {/* Highlights */}
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
