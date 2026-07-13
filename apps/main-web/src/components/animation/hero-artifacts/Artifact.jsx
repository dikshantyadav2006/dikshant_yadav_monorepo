import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { LinkLabel, ProjectCard, StatusNote, TechArtifact, Achievement } from './ArtifactTypes'

const RESUME_DELAY = 1500

const Artifact = ({ data, onRemove }) => {
  const wrapperRef = useRef(null)
  const innerRef = useRef(null)
  const [hovering, setHovering] = useState(false)
  const resumeTimeoutRef = useRef(null)
  const hoveringRef = useRef(false)

  const positions = useMemo(() => {
    const midX1 = data.startX + (data.exitX - data.startX) * 0.12
    const midX2 = data.startX + (data.exitX - data.startX) * 0.80
    return { midX1, midX2 }
  }, [data.startX, data.exitX])

  const keyframeName = useMemo(() => `drift-${data.id}`, [data.id])

  const styleTag = useMemo(() => {
    const css = `
@keyframes ${keyframeName} {
  0% {
    transform: translate(${data.startX}px, ${data.startY}px);
    opacity: 0;
  }
  12% {
    transform: translate(${positions.midX1}px, ${data.startY}px);
    opacity: 0.85;
  }
  82% {
    transform: translate(${positions.midX2}px, ${data.endY}px);
    opacity: 0.85;
  }
  100% {
    transform: translate(${data.exitX}px, ${data.endY}px);
    opacity: 0;
  }
}`
    return css
  }, [data, positions, keyframeName])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = styleTag
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [styleTag])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.style.animation = `${keyframeName} ${data.duration}ms linear forwards`

    const handleEnd = () => onRemove(data.id)
    el.addEventListener('animationend', handleEnd)
    return () => el.removeEventListener('animationend', handleEnd)
  }, [data.id, data.duration, keyframeName, onRemove])

  const onEnter = useCallback(() => {
    hoveringRef.current = true
    setHovering(true)
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
    const el = wrapperRef.current
    if (el) el.style.animationPlayState = 'paused'
  }, [])

  const onLeave = useCallback(() => {
    hoveringRef.current = false
    setHovering(false)
    resumeTimeoutRef.current = setTimeout(() => {
      if (hoveringRef.current) return
      const el = wrapperRef.current
      if (el) el.style.animationPlayState = 'running'
      resumeTimeoutRef.current = null
    }, RESUME_DELAY)
  }, [])

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!data.clickable || !data.href) return
    if (data.href.startsWith('#')) {
      const target = document.querySelector(data.href)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.open(data.href, '_blank')
    }
  }, [data.clickable, data.href])

  const renderContent = () => {
    switch (data.type) {
      case 'link':
        return <LinkLabel label={data.label} variant={data.variant} hovering={hovering} />
      case 'project':
        return <ProjectCard label={data.label} thumbnail={data.thumbnail} hovering={hovering} />
      case 'status':
        return <StatusNote label={data.label} icon={data.icon} />
      case 'tech':
        return <TechArtifact label={data.label} />
      case 'achievement':
        return <Achievement label={data.label} number={data.number} />
      default:
        return null
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="absolute top-0 left-0 z-[8]"
      style={{ willChange: 'transform, opacity', pointerEvents: 'none' }}
    >
      <div
        ref={innerRef}
        className="transition-opacity duration-300 ease-linear"
        style={{
          pointerEvents: 'auto',
          cursor: data.clickable ? 'pointer' : 'default',
          opacity: hovering ? 1 : 0.85,
          transform: hovering && data.clickable ? 'scale(1.03)' : 'scale(1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '300ms',
          transitionTimingFunction: 'linear',
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={handleClick}
      >
        {renderContent()}
      </div>
    </div>
  )
}

export default Artifact
