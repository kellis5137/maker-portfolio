import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useProgress, Html } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { useLoader } from '@react-three/fiber'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
        {Math.round(progress)}%
      </span>
    </Html>
  )
}

// Root-absolute model paths (e.g. "/models/x.stl") must respect the deployed
// base path (e.g. "/maker-portfolio/") so they resolve correctly on GitHub Pages.
function resolveUrl(url) {
  if (typeof url === 'string' && url.startsWith('/')) {
    return import.meta.env.BASE_URL.replace(/\/$/, '') + url
  }
  return url
}

function Model({ url, rotation = [0, 0, 0] }) {
  const geometry = useLoader(STLLoader, resolveUrl(url))
  geometry.computeVertexNormals()
  geometry.center()

  // Normalize to a 2-unit bounding box so all models start at a consistent scale
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const maxDim = Math.max(
    box.max.x - box.min.x,
    box.max.y - box.min.y,
    box.max.z - box.min.z,
  )
  const scale = maxDim > 0 ? 2 / maxDim : 1

  return (
    <mesh geometry={geometry} scale={scale} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color="#a0a8b8" roughness={0.4} metalness={0.15} />
    </mesh>
  )
}

// static=true  : frozen render for card/detail thumbnails, no interaction
// fillViewport  : fills parent container height (used in the dedicated viewer page)
// height        : explicit px height otherwise
// cameraPull    : multiplier > 1 pulls camera further back (default 1 = tight fit)
export default function ModelViewer({ url, accent = '#2a4a6a', height = 160, static: isStatic = false, fillViewport = false, cameraPull = 1, modelRotation = [0, 0, 0] }) {
  const containerStyle = fillViewport
    ? { width: '100%', height: '100%', background: `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)`, cursor: 'grab' }
    : { height: `${height}px`, background: `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)`, cursor: isStatic ? 'default' : 'grab' }

  return (
    <div style={containerStyle}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        frameloop={isStatic ? 'demand' : 'always'}
      >
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.6} adjustCamera={cameraPull} shadows={false}>
            <Model url={url} rotation={modelRotation} />
          </Stage>
          {!isStatic && (
            <OrbitControls
              autoRotate
              autoRotateSpeed={1.2}
              enablePan={false}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
