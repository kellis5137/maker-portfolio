import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { projects } from './data'
import ProjectDetail from './ProjectDetail'
import ViewerPage from './ViewerPage'
import './App.css'

const ModelViewer = lazy(() => import('./ModelViewer'))

const DISCIPLINE_LABELS = { cad: 'CAD', printing: '3D Printing', metalwork: 'Metalwork' }
const DISCIPLINES = ['cad', 'printing', 'metalwork']

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
  const { description, tags, model, cameraPull = 1, modelRotation } = data
  // 3D Printing cards show a "Photo coming soon" placeholder until real photos are added
  const showModel = model && discipline !== 'printing'
  return (
    <div className="project-card">
      {showModel ? (
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
          <li><a href="/#about">About</a></li>
          <li className="nav-dropdown">
            <span className="nav-dropdown-trigger">Projects</span>
            <ul className="nav-dropdown-menu">
              {projects.map(p => (
                <li key={p.id}><a href={`/#${p.id}`}>{p.title}</a></li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  )
}

function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section id="about" className="hero-section">
          <div className="hero-content">
            <h1>CAD, 3D Printing<br />&amp; Metalwork</h1>
            <p className="hero-lead">
              Hands-on maker with experience in FreeCAD mechanical design, FDM printing,
              and metal fabrication. Focused on functional parts — restoration components,
              custom brackets, and one-off pieces that actually fit.
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

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:projectId/:discipline" element={<ProjectDetail />} />
        <Route path="/project/:projectId/:discipline/3d" element={<ViewerPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </HashRouter>
  )
}
