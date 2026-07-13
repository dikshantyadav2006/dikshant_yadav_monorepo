import { useRef, useEffect, useCallback, useState } from 'react'
import useArtifactSystem from './useArtifactSystem'
import Artifact from './Artifact'

const ArtifactSpawner = ({ isDesktop }) => {
  const containerRef = useRef(null)
  const { spawn, removeArtifact, subscribe, setContainerSize } = useArtifactSystem()
  const [artifacts, setArtifacts] = useState([])

  useEffect(() => {
    return subscribe(setArtifacts)
  }, [subscribe])

  useEffect(() => {
    if (!isDesktop) return
    const el = containerRef.current
    if (!el) return

    const updateSize = () => {
      setContainerSize(el.offsetWidth, el.offsetHeight)
    }
    updateSize()

    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDesktop, setContainerSize])

  const handleMouseMove = useCallback((e) => {
    if (!isDesktop) return
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100

    spawn(xPct, yPct)
  }, [isDesktop, spawn])

  if (!isDesktop) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[8] pointer-events-auto"
      onMouseMove={handleMouseMove}
    >
      {artifacts.map(a => (
        <Artifact key={a.id} data={a} onRemove={removeArtifact} />
      ))}
    </div>
  )
}

export default ArtifactSpawner
