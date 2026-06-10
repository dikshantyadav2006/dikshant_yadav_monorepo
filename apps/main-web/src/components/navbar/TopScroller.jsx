import React from 'react'
import { motion, useScroll} from 'framer-motion'

const TopScroller = () => {
      
    const { scrollYProgress } = useScroll();
    
  return (
    <motion.div className='fixed top-0 left-0 w-full h-1.5 bg-[--dark-color] dark:bg-[--light-color] origin-left pointer-events-none ' 
    style={{ scaleX: scrollYProgress }}
    >
    </motion.div>
  )
}

export default TopScroller