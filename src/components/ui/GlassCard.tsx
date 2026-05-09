import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`
        backdrop-blur-xl bg-white/[0.03] border border-white/[0.1]
        rounded-2xl p-6 transition-all duration-300
        shadow-lg hover:shadow-xl hover:border-white/[0.2]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
