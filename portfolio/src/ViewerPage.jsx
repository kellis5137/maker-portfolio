import { Suspense, lazy } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { projects } from './data'
import './ViewerPage.css'

const ModelViewer = lazy(() => import('./ModelViewer'))

export default function ViewerPage() {
  const { projectId, discipline } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Gallery items pass model info via router state; project hero uses param lookup
  const stateModel = location.state
  const projectEntry = !stateModel && projectId && discipline
    ? projects.find(p => p.id === projectId)
    : null
  const disciplineData = projectEntry?.[discipline]

  const url = stateModel?.url ?? disciplineData?.model
  const title = stateModel?.title ?? projectEntry?.title
  const accent = stateModel?.accent ?? projectEntry?.accent ?? '#2a4a6a'
  const cameraPull = disciplineData?.cameraPull ?? 1
  const modelRotation = disciplineData?.modelRotation ?? [0, 0, 0]

  if (!url) {
    return (
      <div className="viewer-error">
        <button className="viewer-back" onClick={() => navigate(-1)}>← Back</button>
        <p>No 3D model available.</p>
      </div>
    )
  }

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <button className="viewer-back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1 className="viewer-title">{title}</h1>
        <div className="viewer-header-spacer" aria-hidden="true" />
      </header>

      <div className="viewer-canvas-area">
        <Suspense fallback={
          <div
            className="viewer-loading"
            style={{ background: `linear-gradient(135deg, ${accent}44, ${accent}11)` }}
          >
            <span>Loading model…</span>
          </div>
        }>
          <ModelViewer url={url} accent={accent} fillViewport cameraPull={cameraPull} modelRotation={modelRotation} />
        </Suspense>
      </div>

      <p className="viewer-hint">Drag to rotate &nbsp;·&nbsp; Scroll to zoom</p>
    </div>
  )
}
