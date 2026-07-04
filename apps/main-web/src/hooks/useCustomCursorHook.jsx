import { useEffect, useRef, useCallback, memo, useMemo } from 'react'
import { TargetCursor, MouseFollower } from '@animation'
// SplashCursor available at @animation/cursor/SplashCursor — uncomment import and JSX below to re-enable

/**
 * Cursor modes - MULTIPLE can be active simultaneously
 */
export const cursorModes = {
  SPLASH: 'splash',
  TARGET: 'target',
  FOLLOWER: 'follower'
}

/**
 * useCustomCursorHook - MULTI-CURSOR SET-BASED SYSTEM
 * 
 * Architecture (INDUSTRY-GRADE):
 * 1. MULTIPLE cursors can be active simultaneously (e.g., SPLASH + TARGET)
 * 2. activeModesRef stores Set of active modes (NEVER useState)
 * 3. React is EVENT DISPATCHER ONLY, not state manager
 * 4. Dark mode/navbar/any state change has ZERO effect on cursors
 * 5. Cursors NEVER mount/unmount after initial render
 * 6. Each cursor checks: activeModesRef.current.has(MY_MODE)
 * 7. Mobile detection happens ONCE, stored in ref
 * 8. Imperative API: addCursor, removeCursor, clearCursors
 * 
 * WHY NO GLITCHES:
 * - Set mutations don't trigger React re-renders (ref-based)
 * - React.memo prevents CursorRenderer re-render on parent state changes
 * - Each cursor checks enabled() internally (60fps polling)
 * - No conditional rendering = no mount/unmount = no animation restart
 * - addCursor/removeCursor are pure mutations, zero React overhead
 */
const useCustomCursorHook = () => {
  // MULTI-CURSOR: Set of active modes (allows SPLASH + TARGET simultaneously)
  const activeModesRef = useRef(new Set([cursorModes.FOLLOWER])) // Default: only light follower cursor
  const isMobileRef = useRef(false)

  // Detect mobile ONCE on mount
  useEffect(() => {
    isMobileRef.current =
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 1024
  }, [])

  /**
   * addCursor - Add a cursor to the active set
   * Example: addCursor('target') → SPLASH + TARGET both visible
   */
  const addCursor = useCallback((mode) => {
    if (isMobileRef.current) return
    activeModesRef.current.add(mode)
  }, [])

  /**
   * removeCursor - Remove a cursor from the active set
   * Example: removeCursor('splash') → Only TARGET visible
   */
  const removeCursor = useCallback((mode) => {
    if (isMobileRef.current) return
    activeModesRef.current.delete(mode)
  }, [])

  /**
   * clearCursors - Remove all cursors (all hidden)
   */
  const clearCursors = useCallback(() => {
    if (isMobileRef.current) return
    activeModesRef.current.clear()
  }, [])

  /**
   * CursorRenderer - ALL cursors render ONCE, check their own activation
   * Each cursor polls: activeModesRef.current.has(MY_MODE)
   * 
   * useMemo with empty deps: Component created ONCE, never recreated
   * This is CRITICAL - prevents re-creation on parent re-renders
   */
  const CursorRenderer = useMemo(() => {
    const MemoizedCursors = memo(() => {
      // Mobile: don't render anything
      if (isMobileRef.current) return null

      return (
        <>
          <TargetCursor enabled={() => activeModesRef.current.has(cursorModes.TARGET)} />
          <MouseFollower enabled={() => activeModesRef.current.has(cursorModes.FOLLOWER)} />
        </>
      )
    })
    
    MemoizedCursors.displayName = 'CursorRenderer'
    return MemoizedCursors
  }, []) // Empty deps = created once, never changes

  return {
    CursorRenderer,
    addCursor,
    removeCursor,
    clearCursors,
    cursorModes
  }
}

export default useCustomCursorHook
