import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        window.dispatchEvent(new CustomEvent('page-mounted'));
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
