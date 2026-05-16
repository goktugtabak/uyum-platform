import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function RouteTransition({ children }: Props) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  // Re-mount on pathname change so framer animates the fresh tree
  const [pathKey, setPathKey] = useState(location.pathname)
  useEffect(() => setPathKey(location.pathname), [location.pathname])

  if (reduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      key={pathKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
