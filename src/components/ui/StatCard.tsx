import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  trend?: { value: number; isPositive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, subtext, trend }) => {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          {subtext && <p className="text-gray-500 text-xs">{subtext}</p>}
          {trend && (
            <div className={`text-xs font-semibold mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="p-3 rounded-lg bg-white/[0.05] border border-white/[0.1]"
        >
          {icon}
        </motion.div>
      </div>
    </GlassCard>
  );
};
