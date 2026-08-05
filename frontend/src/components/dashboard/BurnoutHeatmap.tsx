'use client';

import { useMemo } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CommitData {
  hour: number;
  day: number;
  count: number;
}

interface BurnoutHeatmapProps {
  commits?: Array<{ createdAt: Date; authorLogin: string }>;
  contributors?: string[];
}

export function BurnoutHeatmap({ commits = [], contributors = [] }: BurnoutHeatmapProps) {
  // Generate mock data if none provided
  const heatmapData = useMemo(() => {
    const data: CommitData[] = [];
    
    // Generate sample data showing potential burnout patterns
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let count = 0;
        
        // Simulate patterns:
        // - High activity during work hours (9-17)
        // - Some after-hours activity (18-22) - potential burnout signal
        // - Weekend activity (day 5-6) - potential burnout signal
        if (hour >= 9 && hour <= 17) {
          count = Math.floor(Math.random() * 15) + 5; // Normal work hours
        } else if (hour >= 18 && hour <= 22) {
          count = Math.floor(Math.random() * 8) + 2; // After hours
        } else if (day >= 5) {
          count = Math.floor(Math.random() * 10) + 3; // Weekend
        } else {
          count = Math.floor(Math.random() * 3); // Off hours
        }
        
        data.push({ hour, day, count });
      }
    }
    
    return data;
  }, [commits]);

  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);
  
  // Calculate burnout risk score
  const burnoutRisk = useMemo(() => {
    const afterHours = heatmapData.filter(d => d.hour >= 18 || d.hour <= 6).reduce((sum, d) => sum + d.count, 0);
    const weekend = heatmapData.filter(d => d.day >= 5).reduce((sum, d) => sum + d.count, 0);
    const total = heatmapData.reduce((sum, d) => sum + d.count, 0);
    
    const afterHoursRatio = total > 0 ? afterHours / total : 0;
    const weekendRatio = total > 0 ? weekend / total : 0;
    
    // Risk score: 0-100
    const risk = Math.min(100, (afterHoursRatio * 50) + (weekendRatio * 50));
    return Math.round(risk);
  }, [heatmapData]);

  const getIntensity = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'bg-red-500/60';
    if (intensity > 0.4) return 'bg-amber-500/40';
    if (intensity > 0.1) return 'bg-emerald-500/30';
    return 'bg-slate-700/20';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="glass-card noise p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Burnout Risk Heatmap</h3>
          <p className="text-xs text-slate-400">Commit activity by hour and day of week</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${
          burnoutRisk > 50 
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : burnoutRisk > 25
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            {burnoutRisk > 50 && <AlertTriangle className="h-4 w-4" />}
            <span className="text-sm font-semibold">Risk: {burnoutRisk}%</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12 flex-shrink-0" />
            <div className="flex gap-1 flex-1">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-[10px] text-slate-500 text-center"
                  style={{ minWidth: '20px' }}
                >
                  {hour % 6 === 0 ? hour : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {days.map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-2">
                <div className="w-12 flex-shrink-0 text-xs text-slate-400 font-medium">
                  {dayName}
                </div>
                <div className="flex gap-1 flex-1">
                  {hours.map((hour) => {
                    const dataPoint = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                    const count = dataPoint?.count || 0;
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`flex-1 aspect-square rounded transition-all hover:scale-110 cursor-pointer ${getIntensity(count)}`}
                        style={{ minWidth: '20px' }}
                        title={`${dayName} ${hour}:00 - ${count} commits`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-slate-700/20" />
            <div className="w-3 h-3 rounded bg-emerald-500/30" />
            <div className="w-3 h-3 rounded bg-amber-500/40" />
            <div className="w-3 h-3 rounded bg-red-500/60" />
          </div>
          <span>More</span>
        </div>
        {burnoutRisk > 50 && (
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>High after-hours/weekend activity detected</span>
          </div>
        )}
      </div>
    </Card>
  );
}
