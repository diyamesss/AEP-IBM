import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import styles from './App.module.scss'
import NavTabs from './components/layout/NavTabs/NavTabs'
import Footer from './components/layout/Footer/Footer'
import { ContentProvider } from './context/ContentContext'
import ScrollToTop from './components/ScrollToTop'

const HomePage                = lazy(() => import('./pages/Home/HomePage'))
const EngagementsPage         = lazy(() => import('./pages/Engagements/EngagementsPage'))
const PortfoliosPage          = lazy(() => import('./pages/Portfolios/PortfoliosPage'))
const ProjectsPage            = lazy(() => import('./pages/Projects/ProjectsPage'))
const IbmHolidaysPage         = lazy(() => import('./pages/IbmHolidays/IbmHolidaysPage'))
const PartnershipPage         = lazy(() => import('./pages/Partnership/PartnershipPage'))
const IbmCicsPage             = lazy(() => import('./pages/IbmCics/IbmCicsPage'))
const SearchPage              = lazy(() => import('./pages/Search/SearchPage'))

// Portfolio sub-pages
const WAMPage                 = lazy(() => import('./pages/Portfolios/WAM/WAMPage'))
const EnergyDeliveryPage      = lazy(() => import('./pages/Portfolios/EnergyDelivery/EnergyDeliveryPage'))
const GridOperationsPage      = lazy(() => import('./pages/Portfolios/GridOperations/GridOperationsPage'))
const GenerationCommercialPage= lazy(() => import('./pages/Portfolios/GenerationCommercial/GenerationCommercialPage'))
const SharedServicesPage      = lazy(() => import('./pages/Portfolios/SharedServices/SharedServicesPage'))
const ICOEPage                = lazy(() => import('./pages/Portfolios/ICOE/ICOEPage'))
const AutomationCOEPage       = lazy(() => import('./pages/Portfolios/AutomationCOE/AutomationCOEPage'))
const DigitalEmergingPage     = lazy(() => import('./pages/Portfolios/DigitalEmerging/DigitalEmergingPage'))
const DataPlatformsPage       = lazy(() => import('./pages/Portfolios/DataPlatforms/DataPlatformsPage'))
const SecurityPage            = lazy(() => import('./pages/Portfolios/Security/SecurityPage'))
const CustomerPage            = lazy(() => import('./pages/Portfolios/Customer/CustomerPage'))

function LoadingBar() {
  return (
    <div className={styles.loadingBar} aria-label="Loading page" role="status">
      <div className={styles.loadingProgress} />
    </div>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <HashRouter>
        <ScrollToTop />
        <NavTabs />
        <main id="main-content" className={styles.mainContent}>
          <Suspense fallback={<LoadingBar />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              {/* Engagements page — Portfolio view with sliding-pill nav */}
              <Route path="/portfolios" element={<EngagementsPage />} />
              {/* Keep legacy standalone pages accessible but point index to unified page */}
              <Route path="/portfolios/wam" element={<WAMPage />} />
              <Route path="/portfolios/energy-delivery" element={<EnergyDeliveryPage />} />
              <Route path="/portfolios/grid-operations" element={<GridOperationsPage />} />
              <Route path="/portfolios/generation-commercial" element={<GenerationCommercialPage />} />
              <Route path="/portfolios/shared-services" element={<SharedServicesPage />} />
              <Route path="/portfolios/icoe" element={<ICOEPage />} />
              <Route path="/portfolios/automation-coe" element={<AutomationCOEPage />} />
              <Route path="/portfolios/digital-emerging" element={<DigitalEmergingPage />} />
              <Route path="/portfolios/data-platforms" element={<DataPlatformsPage />} />
              <Route path="/portfolios/security" element={<SecurityPage />} />
              <Route path="/portfolios/customer" element={<CustomerPage />} />
              {/* Projects page — standalone, intact, navigated to from Engagements pill */}
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/ibm-holidays" element={<IbmHolidaysPage />} />
              <Route path="/partnership" element={<PartnershipPage />} />
              <Route path="/ibm-cics" element={<IbmCicsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </HashRouter>
    </ContentProvider>
  )
}
