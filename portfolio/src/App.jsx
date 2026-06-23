import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { projects } from './data'
import { withBase } from './basePath'
import ProjectDetail from './ProjectDetail'
import ViewerPage from './ViewerPage'
import './App.css'

const ModelViewer = lazy(() => import('./ModelViewer'))

const DISCIPLINE_LABELS = { cad: 'CAD', printing: '3D Printing', metalwork: 'Metalwork', restoration: 'Restoration', woodworking: 'Woodworking' }
const DISCIPLINES = ['cad', 'printing', 'metalwork', 'restoration', 'woodworking']

function PlaceholderImage({ accent }) {
  return (
    <div
      className="card-image"
      style={{ background: `linear-gradient(135deg, ${accent}cc 0%, ${accent}33 100%)` }}
      aria-hidden="true"
    >
      <span className="image-placeholder">Photo coming soon</span>
    </div>
  )
}

function DisciplineCard({ projectId, discipline, data, accent }) {
  const { description, tags, model, cameraPull = 1, modelRotation, images = [] } = data
  const coverImage = images[0]
  // Prefer a real photo when one exists; otherwise fall back to the 3D model
  // (CAD/Metalwork) or a "Photo coming soon" placeholder.
  const showModel = model && discipline !== 'printing'
  return (
    <div className="project-card">
      {coverImage ? (
        <div className="card-image card-image--photo">
          <img src={withBase(coverImage)} alt={`${DISCIPLINE_LABELS[discipline]} preview`} loading="lazy" />
        </div>
      ) : showModel ? (
        <div className="card-image card-image--model">
          <Suspense fallback={<PlaceholderImage accent={accent} />}>
            <ModelViewer url={model} accent={accent} static cameraPull={cameraPull} modelRotation={modelRotation} />
          </Suspense>
        </div>
      ) : (
        <PlaceholderImage accent={accent} />
      )}
      <div className="card-body">
        <span className="discipline-badge">{DISCIPLINE_LABELS[discipline]}</span>
        <p>{description}</p>
        <div className="card-footer">
          <div className="tags">
            {tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <Link to={`/project/${projectId}/${discipline}`} className="more-link">
            More info →
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProjectSection({ project }) {
  const { id, title, summary, accent } = project
  const disciplines = DISCIPLINES.filter(d => project[d])

  return (
    <section id={id} className="portfolio-section">
      <div className="section-header">
        <h2>{title}</h2>
        {summary && <p className="section-subtitle">{summary}</p>}
      </div>
      <div className="project-grid">
        {disciplines.map(d => (
          <DisciplineCard key={d} projectId={id} discipline={d} data={project[d]} accent={accent} />
        ))}
      </div>
    </section>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="nav-inner">
        <Link to="/" className="site-name">K. Ellis</Link>
        <ul>
          <li><Link to="/about">About</Link></li>
          <li className="nav-dropdown">
            <span className="nav-dropdown-trigger">Projects</span>
            <ul className="nav-dropdown-menu">
              {projects.map(p => (
                <li key={p.id}><Link to="/" state={{ scrollTo: p.id }}>{p.title}</Link></li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  )
}

function Home() {
  const location = useLocation()

  // HashRouter owns the URL hash, so in-page anchors can't use it. Instead, links
  // navigate to "/" with a `scrollTo` state and we scroll to that section here.
  useEffect(() => {
    const id = location.state?.scrollTo
    if (!id) return
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(t)
  }, [location])

  return (
    <>
      <SiteHeader />
      <main>
        <section id="about" className="hero-section">
          <div className="hero-content">
            <h1>CAD, 3D Printing<br />&amp; Metalwork</h1>
            <h2>This site is always a work in progres.</h2>
            <p className="hero-lead">
              Hands-on maker with experience in woodworking, metalwork, and 3D printing.
              Focused on functional parts — restoration components, custom parts, and
              one-off pieces.
            </p>
            <div className="hero-skills">
              {['FreeCAD', 'OrcaSlicer / Cura', 'FDM Printing', 'Metalwork', 'MGB Restoration'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {projects.map(p => (
          <ProjectSection key={p.id} project={p} />
        ))}
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <p>K. Ellis &mdash; CAD, 3D Printing &amp; Metalwork Portfolio</p>
        </div>
      </footer>
    </>
  )
}

function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="about-section">
          <div className="about-content">
            <h1>About</h1>
            <p>
              I'm Keith Ellis — by trade a software engineer, but at heart I've always been
              a maker, one whose materials happen to be wood, metal, and electronics as much
              as code.
            </p>
            <p>
              I got my hands dirty early: working with wood and metal at 13, and restoring
              my first car at 17. Decades of tinkering later, the philosophy is simple — if
              it runs on gas or electricity, rolls on wheels, turns an engine, or can be built
              out of wood, I'm confident I can handle it.
            </p>
            <p>
              This site is where I document that work — the CAD, 3D printing, and metalwork
              behind the parts and projects I build.
            </p>
            <div className="hero-skills">
              {['Software Engineering', 'Woodworking', 'Metalwork', 'Electronics', '3D Printing', 'Car Restoration'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="about-contact">
              <h2>Contact</h2>
              <p>
                <a href="mailto:kellis5137@murena.io">kellis5137@murena.io</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <p>K. Ellis &mdash; CAD, 3D Printing &amp; Metalwork Portfolio</p>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/project/:projectId/:discipline" element={<ProjectDetail />} />
        <Route path="/project/:projectId/:discipline/3d" element={<ViewerPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </HashRouter>
  )
}
