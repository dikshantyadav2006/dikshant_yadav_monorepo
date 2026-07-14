import { useRef, useCallback, useEffect } from 'react'

const MAX_ARTIFACTS = 5
const MIN_SPACING_PX = 150
const SPAWN_COOLDOWN_MS =3000
const TOTAL_DURATION = 11000

const ARTIFACT_POOL = [
  { type: 'link', label: 'Selected Work', href: '/projects', variant: 'magnetic-line' },
  { type: 'link', label: 'About Me', href: '/about', variant: 'editorial' },
  { type: 'link', label: 'Case Study', href: '/case-study', variant: 'circle-line' },
  { type: 'link', label: 'Contact', href: '#contact', variant: 'arrow' },
  { type: 'link', label: 'View Projects', href: '/projects', variant: 'underline' },
  { type: 'link', label: 'Resume', href: '/resume.pdf', variant: 'coordinate' },
  { type: 'link', label: 'Blog', href: '/blog', variant: 'editorial' },
  { type: 'link', label: 'Experience', href: '/experience', variant: 'magnetic-line' },

  { type: 'project', label: 'Portfolio v3', thumbnail: 'https://res.cloudinary.com/dczvhue59/image/upload/f_auto,q_auto/v1782389448/1000188258_caqvbu.png', href: '/projects/portfolio' },
  { type: 'project', label: 'Design System', thumbnail: 'https://res.cloudinary.com/dczvhue59/image/upload/f_auto,q_auto/v1782389448/1000188258_caqvbu.png', href: '/projects/design-system' },
  { type: 'project', label: 'E-Commerce App', thumbnail: 'https://res.cloudinary.com/dczvhue59/image/upload/f_auto,q_auto/v1782389448/1000188258_caqvbu.png', href: '/projects/ecommerce' },

  { type: 'status', label: 'Available for Work', icon: '📎' },
  { type: 'status', label: 'Open to Collaborate', icon: '📎' },
  { type: 'status', label: 'Based in India', icon: '📍' },

  { type: 'tech', label: 'React + Next.js' },
  { type: 'tech', label: 'TypeScript' },
  { type: 'tech', label: 'Node.js + Express' },
  { type: 'tech', label: 'Tailwind CSS' },
  { type: 'tech', label: 'PostgreSQL' },

  { type: 'achievement', label: 'Built 20+ Projects', number: '20+' },
  { type: 'achievement', label: '3+ Years Experience', number: '3+' },
  { type: 'achievement', label: '10+ Happy Clients', number: '10+' },
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickArtifactEntry() {
  const r = Math.random()
  if (r < 0.35) return pickRandom(ARTIFACT_POOL.filter(a => a.type === 'link'))
  if (r < 0.50) return pickRandom(ARTIFACT_POOL.filter(a => a.type === 'project'))
  if (r < 0.65) return pickRandom(ARTIFACT_POOL.filter(a => a.type === 'status'))
  if (r < 0.82) return pickRandom(ARTIFACT_POOL.filter(a => a.type === 'tech'))
  return pickRandom(ARTIFACT_POOL.filter(a => a.type === 'achievement'))
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function createArtifactData(cursorXPct, cursorYPct, heroWidth, heroHeight) {
  const fromRight = cursorXPct < 50

  const entryX = fromRight ? heroWidth + 30 : -250
  const exitX = fromRight ? -250 : heroWidth + 30
  const startX = entryX
  const startY = (cursorYPct / 100) * heroHeight + (Math.random() - 0.5) * 60
  const endY = startY + (Math.random() - 0.5) * 40

  const template = pickArtifactEntry()
  const clickable = template.type === 'link' || template.type === 'project'

  return {
    id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...template,
    clickable,
    side: fromRight ? 'right' : 'left',
    startX,
    startY,
    exitX,
    endY,
    duration: TOTAL_DURATION,
    rotation: (Math.random() - 0.5) * 3,
    createdAt: Date.now(),
  }
}

const useArtifactSystem = () => {
  const artifactsRef = useRef([])
  const subscribersRef = useRef(new Set())
  const lastSpawnRef = useRef(0)
  const lastPositionsRef = useRef([])
  const containerSizeRef = useRef({ width: 0, height: 0 })

  const notify = useCallback(() => {
    subscribersRef.current.forEach(fn => fn([...artifactsRef.current]))
  }, [])

  const setContainerSize = useCallback((w, h) => {
    containerSizeRef.current = { width: w, height: h }
  }, [])

  const spawn = useCallback((cursorXPct, cursorYPct) => {
    const now = Date.now()
    if (now - lastSpawnRef.current < SPAWN_COOLDOWN_MS) return
    if (artifactsRef.current.length >= MAX_ARTIFACTS) return

    const { width, height } = containerSizeRef.current
    if (width === 0 || height === 0) return

    const candidate = { x: cursorXPct * width, y: cursorYPct * height }
    const tooClose = lastPositionsRef.current.some(p => distanceBetween(p, candidate) < MIN_SPACING_PX)
    if (tooClose) return

    const artifact = createArtifactData(cursorXPct, cursorYPct, width, height)
    artifactsRef.current = [...artifactsRef.current, artifact]
    lastPositionsRef.current = [...lastPositionsRef.current, candidate]
    lastSpawnRef.current = now
    notify()
  }, [notify])

  const removeArtifact = useCallback((id) => {
    artifactsRef.current = artifactsRef.current.filter(a => a.id !== id)
    lastPositionsRef.current = lastPositionsRef.current.slice(-MAX_ARTIFACTS)
    notify()
  }, [notify])

  const subscribe = useCallback((fn) => {
    subscribersRef.current.add(fn)
    return () => subscribersRef.current.delete(fn)
  }, [])

  useEffect(() => {
    return () => {
      artifactsRef.current = []
      subscribersRef.current.clear()
    }
  }, [])

  return { spawn, removeArtifact, subscribe, setContainerSize }
}

export default useArtifactSystem
