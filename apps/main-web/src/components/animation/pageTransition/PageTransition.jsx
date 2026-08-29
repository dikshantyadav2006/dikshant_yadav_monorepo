import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="w-full"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
