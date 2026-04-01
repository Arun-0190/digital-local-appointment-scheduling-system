import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function StatCard({ title, value, icon, trend, trendValue, color = "primary" }) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-accent bg-accent/10",
    danger: "text-coral bg-coral/10",
    warning: "text-amber-500 bg-amber-500/10",
  };

  return (
    <GlassCard className="!p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.primary}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-accent bg-accent/10' : 'text-coral bg-coral/10'
          }`}>
            <span className="material-symbols-outlined text-xs">
              {trend === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-textSecondary mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-headline font-extrabold text-textPrimary tracking-tight">
          {value}
        </p>
      </div>
    </GlassCard>
  );
}
