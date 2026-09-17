import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import styles from './GridOperationsPage.module.scss'
import gridOperationsHero from './assets/GridOperations.png'
import ibmImg from './assets/IBM.jpg'
import PortfolioIntroduction from '../../../components/shared/PortfolioIntroduction/PortfolioIntroduction'
import PortfolioSuccessStory from '../../../components/shared/PortfolioSuccessStory/PortfolioSuccessStory'
import PortfolioDashboard from '../../../components/shared/PortfolioDashboard/PortfolioDashboard'
import { PORTFOLIO_SHOWCASE } from '../../../data/portfolio-showcase'

const videos = import.meta.glob('./assets/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })

const PORTFOLIO_SLUG = 'grid-operations'
const PORTFOLIO_NAME = 'Grid Operations'
const SHOWCASE = PORTFOLIO_SHOWCASE[PORTFOLIO_SLUG]

const NICHE_SKILLS = ['ArcGIS', 'Powerclerk']

const NAV_LINKS = [
  { id: 'analytics', label: `${PORTFOLIO_NAME} by the Numbers` },
  { id: 'highlights', label: 'Highlights' },
]

function useSlidingPill(refs: React.RefObject<HTMLButtonElement | null>[], activeIndex: number) {
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({})
  const [pillReady, setPillReady] = useState(false)
  function measure(idx: number) {
    const btn = refs[idx]?.current; if (!btn) return
    const parent = btn.parentElement; if (!parent) return
    const pr = parent.getBoundingClientRect(); const br = btn.getBoundingClientRect()
    setPillStyle({ left: br.left - pr.left, width: br.width })
  }
  useLayoutEffect(() => { measure(activeIndex); const id = requestAnimationFrame(() => setPillReady(true)); return () => cancelAnimationFrame(id) }, []) // eslint-disable-line
  useEffect(() => { if (pillReady) measure(activeIndex) }, [activeIndex]) // eslint-disable-line
  useEffect(() => { function onResize() { measure(activeIndex) }; window.addEventListener('resize', onResize, { passive: true }); return () => window.removeEventListener('resize', onResize) }, [activeIndex]) // eslint-disable-line
  return { pillStyle, pillReady }
}

export default function GridOperationsPage() {
  const videoFiles = Object.values(videos) as string[]
  const [activePillIdx, setActivePillIdx] = useState(0)
  const navBtnRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]
  const { pillStyle, pillReady } = useSlidingPill(navBtnRefs, activePillIdx)
  function handleNavClick(idx: number, sectionId: string) { setActivePillIdx(idx); document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <div className={styles.page} id="top">
      <div className={styles.hero}>
        <img src={gridOperationsHero} alt="Grid Operations" className={styles.heroImg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>IBM · AEP</div>
          <h1 className={styles.pageTitle}>{PORTFOLIO_NAME}</h1>
          <p className={styles.heroSub}>Real-time grid monitoring &amp; control</p>
        </div>
      </div>
      <div className={styles.segWrap}>
        <nav className={styles.segControl} role="navigation" aria-label="Page sections">
          <span className={`${styles.segPill}${pillReady ? ` ${styles.segPillAnimated}` : ''}`} style={pillStyle} aria-hidden="true" />
          {NAV_LINKS.map((link, idx) => (
            <button key={link.id} ref={navBtnRefs[idx]} className={`${styles.segBtn}${activePillIdx === idx ? ` ${styles.segBtnActive}` : ''}`} aria-pressed={activePillIdx === idx} onClick={() => handleNavClick(idx, link.id)}>{link.label}</button>
          ))}
        </nav>
      </div>
      <PortfolioIntroduction portfolioName={PORTFOLIO_NAME} showcase={SHOWCASE} />
      <PortfolioSuccessStory successStory={SHOWCASE} />
      <PortfolioDashboard portfolioSlug={PORTFOLIO_SLUG} portfolioName={PORTFOLIO_NAME} />
      <section id="highlights" className={styles.highlightsSection} aria-labelledby="highlights-heading">
        <div className={styles.highlightsInner}>
          <div className={styles.highlightsHeaderRow}>
            <h2 id="highlights-heading" className={styles.highlightsTitle}>Highlights</h2>
            <button className={styles.backToTop} onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}>Back to top ↑</button>
          </div>
          <div className={styles.highlightsGrid}>
            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Main challenges</h3>
                <p className={styles.hlCardText}>Team is currently facing challenges when talking about finding ArcGIS and Powerclerk resources.</p>
              </div>
              <img src={ibmImg} alt="IBM" className={styles.hlCardImg} />
            </div>
            <div className={styles.hlCardGrey}>
              <h3 className={styles.hlCardTitleDark}>Niche Skills</h3>
              <ul className={styles.nicheList}>{NICHE_SKILLS.map((skill, i) => <li key={i} className={styles.nicheItem}>{skill}</li>)}</ul>
            </div>
            <div className={styles.hlCardRed}>
              <div className={styles.hlCardContent}>
                <h3 className={styles.hlCardTitle}>Mitigation</h3>
                <p className={styles.hlCardText}>Reskilling and upskilling matrix</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Proactive hiring &amp; onboarding</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Identify resources across geographies</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Working to strengthen demand management</p>
                <hr className={styles.hlDivider} />
                <p className={styles.hlCardText}>Leverage associate program in Mexico</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {videoFiles.length > 0 && <div className={styles.content}>{videoFiles.map((src, i) => <video key={i} src={src} controls className={styles.video} />)}</div>}
    </div>
  )
}
