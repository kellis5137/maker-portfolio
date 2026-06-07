import { Suspense, lazy } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { projects } from './data'
import { withBase } from './basePath'
import './ProjectDetail.css'

const ModelViewer = lazy(() => import('./ModelViewer'))

const DISCIPLINE_LABELS = { cad: 'CAD Work', printing: '3D Printing', metalwork: 'Metalwork', restoration: 'Restoration', woodworking: 'Woodworking' }

function ModelHero({ model, accent, projectId, discipline, cameraPull = 1, modelRotation }) {
  const navigate = useNavigate()
  return (
    <div
      className="detail-model-hero"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/project/${projectId}/${discipline}/3d`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/project/${projectId}/${discipline}/3d`)}
      aria-label="Click to view interactive 360° model"
    >
      <Suspense fallback={
        <div className="detail-model-fallback" style={{ background: `linear-gradient(135deg, ${accent}99, ${accent}33)` }} />
      }>
        <ModelViewer url={model} accent={accent} height={380} static cameraPull={cameraPull} modelRotation={modelRotation} />
      </Suspense>
      <div className="model-360-overlay">
        <span className="model-360-icon">↻</span>
        <span>Click for 360° view</span>
      </div>
    </div>
  )
}

function GalleryModelItem({ src, label, accent }) {
  const navigate = useNavigate()
  return (
    <div
      className="gallery-model-item"
      role="button"
      tabIndex={0}
      onClick={() => navigate('/viewer', { state: { url: src, title: label, accent } })}
      onKeyDown={e => e.key === 'Enter' && navigate('/viewer', { state: { url: src, title: label, accent } })}
      aria-label={`Click to view ${label} in 360°`}
    >
      <div className="gallery-model-canvas">
        <Suspense fallback={<div className="gallery-model-loading" style={{ background: `linear-gradient(135deg, ${accent}44, ${accent}11)` }} />}>
          <ModelViewer url={src} accent={accent} height={180} static />
        </Suspense>
        <div className="gallery-360-overlay">
          <span className="gallery-360-icon">↻</span>
          <span>360° view</span>
        </div>
      </div>
      {label && <span className="gallery-item-label">{label}</span>}
    </div>
  )
}

function PhotoSlot({ label }) {
  return (
    <div className="photo-slot">
      <div className="photo-slot-icon">+</div>
      {label && <span className="photo-slot-label">{label}</span>}
    </div>
  )
}

const PLACEHOLDER_LABELS = ['Overview', 'Detail view', 'In context / installed', 'Additional']

export default function ProjectDetail() {
  const { projectId, discipline } = useParams()
  const navigate = useNavigate()

  const project = projects.find(p => p.id === projectId)
  const disciplineData = project?.[discipline]

  if (!project || !disciplineData) {
    return (
      <div className="detail-not-found">
        <p>Project not found.</p>
        <Link to="/">← Back to portfolio</Link>
      </div>
    )
  }

  const { title, accent } = project
  const { longDescription, tags, model, specs, process, images = [], gallery = [], cameraPull, modelRotation } = disciplineData

  // The 3D models are CAD drawings, so the 3D Printing pages show photos instead
  // of the models. When there's no model to show as the hero, use the first photo.
  const isPrinting = discipline === 'printing'
  const heroModel = isPrinting ? null : model
  const heroImage = !heroModel && images.length > 0 ? images[0] : null
  const gridImages = heroImage ? images.slice(1) : images
  const visibleGallery = isPrinting ? [] : gallery

  const filledSlots = images.length + visibleGallery.length
  const placeholdersNeeded = Math.max(0, 4 - filledSlots)

  return (
    <div className="detail-page">
      <nav className="detail-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="detail-breadcrumb">
          <a href={`/#${projectId}`}>{title}</a>
          {' / '}{DISCIPLINE_LABELS[discipline]}
        </span>
      </nav>

      <header className="detail-hero">
        {heroModel ? (
          <ModelHero model={heroModel} accent={accent} projectId={projectId} discipline={discipline} cameraPull={cameraPull} modelRotation={modelRotation} />
        ) : heroImage ? (
          <div className="detail-photo-hero">
            <img src={withBase(heroImage)} alt={`${title} — ${DISCIPLINE_LABELS[discipline]}`} />
          </div>
        ) : (
          <div
            className="detail-model-fallback"
            style={{ height: '380px', background: `linear-gradient(135deg, ${accent}99, ${accent}33)` }}
          >
            <span className="photo-coming">Photos coming soon</span>
          </div>
        )}
      </header>

      <div className="detail-body">
        <div className="detail-main">
          <div className="detail-tags">
            {tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <h1>{title}</h1>
          <p className="detail-description">{longDescription}</p>

          {process && process.length > 0 && (
            <section className="detail-section">
              <h2>Process</h2>
              <ol className="detail-process">
                {process.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          <section className="detail-section">
            <h2>{visibleGallery.length > 0 ? 'Design Iterations' : 'Photos'}</h2>
            <div className="photo-grid">
              {gridImages.map((src, i) => (
                <img key={`img-${i}`} src={withBase(src)} alt={`${title} — photo ${i + 1}`} className="photo-item" loading="lazy" />
              ))}
              {visibleGallery.map((item, i) =>
                item.type === 'model' ? (
                  <GalleryModelItem key={`gal-${i}`} src={item.src} label={item.label} accent={accent} />
                ) : (
                  <img key={`gal-${i}`} src={withBase(item.src)} alt={item.label} className="photo-item" loading="lazy" />
                )
              )}
              {PLACEHOLDER_LABELS.slice(0, placeholdersNeeded).map(label => (
                <PhotoSlot key={label} label={label} />
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-sidebar">
          {specs && Object.keys(specs).length > 0 && (
            <div className="detail-specs">
              <h3>Specs</h3>
              <dl>
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="spec-row">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
