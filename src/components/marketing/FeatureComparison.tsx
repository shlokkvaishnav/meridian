'use client';

import { CheckCircle, X } from 'lucide-react';

interface Feature {
  name: string;
  hobby: boolean | string;
  pro: boolean | string;
  team: boolean | string;
}

const features: Feature[] = [
  { name: 'Repositories', hobby: '3', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Data History', hobby: '30 days', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Core Metrics', hobby: true, pro: true, team: true },
  { name: 'DORA Metrics', hobby: false, pro: true, team: true },
  { name: 'AI Insights', hobby: false, pro: true, team: true },
  { name: 'Burnout Detection', hobby: false, pro: true, team: true },
  { name: 'Team Analytics', hobby: false, pro: true, team: true },
  { name: 'Custom Reports', hobby: false, pro: false, team: true },
  { name: 'SAML SSO', hobby: false, pro: false, team: true },
  { name: 'Audit Logs', hobby: false, pro: false, team: true },
  { name: 'Priority Support', hobby: false, pro: true, team: true },
  { name: 'Dedicated Success Manager', hobby: false, pro: false, team: true },
  { name: 'SLA Guarantee', hobby: false, pro: false, team: true },
];

export function FeatureComparison() {
  const renderFeature = (value: boolean | string) => {
    if (value === true) {
      return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-slate-600" />;
    }
    return <span className="text-sm text-slate-300 font-medium">{value}</span>;
  };

  return (
    <div className="mt-12 overflow-x-auto">
      <div className="glass-card p-6 min-w-[600px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Feature</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Hobby</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-violet-400">Pro</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Team</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={feature.name}
                className={`border-b border-white/[0.03] ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
              >
                <td className="py-3 px-4 text-sm text-slate-300">{feature.name}</td>
                <td className="py-3 px-4 text-center">{renderFeature(feature.hobby)}</td>
                <td className="py-3 px-4 text-center">{renderFeature(feature.pro)}</td>
                <td className="py-3 px-4 text-center">{renderFeature(feature.team)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
