'use client';

import { Card, CardTitle } from '@/components/ui/card';
import IncidentPieChart from './IncidentPieChart';
import CrimeTrendChart from './CrimeTrendChart';
import HotspotBarChart from './HotspotBarChart';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function AnalyticsGrid({ data }: any) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className='grid gap-6 lg:grid-cols-3'
    >
      <motion.div variants={item}>
        <Card className="h-full bg-slate-900/40 border-white/5 hover:border-blue-500/20 transition-all">
          <CardTitle className="text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Department Footfall
          </CardTitle>
          <div className='mt-6'>
            <IncidentPieChart data={data.distribution} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="h-full bg-slate-900/40 border-white/5 hover:border-indigo-500/20 transition-all">
          <CardTitle className="text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            Weekly Footfall Trends
          </CardTitle>
          <div className='mt-6'>
            <CrimeTrendChart data={data.trends} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="h-full bg-slate-900/40 border-white/5 hover:border-red-500/20 transition-all">
          <CardTitle className="text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            Active Aisle Dwells (s)
          </CardTitle>
          <div className='mt-6'>
            <HotspotBarChart data={data.hotspots} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
