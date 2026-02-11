 'use client';

 import { 
   LineChart, 
   Line, 
   XAxis, 
   YAxis, 
   CartesianGrid, 
   Tooltip, 
   ResponsiveContainer,
   Legend
 } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 interface VelocityChartProps {
   data: {
     date: string;
     cycleTimeP50: number | null;
     mergeRate: number | null;
   }[];
 }
 
 export function VelocityChart({ data }: VelocityChartProps) {
   return (
     <Card className="col-span-2">
       <CardHeader>
         <CardTitle>Engineering Velocity (30 Days)</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data}>
               <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
               <XAxis 
                 dataKey="date" 
                 tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 stroke="#888888"
                 fontSize={12}
               />
               <YAxis yAxisId="left" stroke="#888888" fontSize={12} label={{ value: 'Cycle Time (m)', angle: -90, position: 'insideLeft' }} />
               <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} label={{ value: 'Merge Rate', angle: 90, position: 'insideRight' }} />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                 labelStyle={{ color: '#9ca3af' }}
               />
               <Legend />
               <Line 
                 yAxisId="left"
                 type="monotone" 
                 dataKey="cycleTimeP50" 
                 name="Cycle Time (P50)" 
                 stroke="#3b82f6" 
                 strokeWidth={2}
                 dot={false}
               />
               <Line 
                 yAxisId="right"
                 type="monotone" 
                 dataKey="mergeRate" 
                 name="Merge Rate" 
                 stroke="#10b981" 
                 strokeWidth={2}
                 dot={false}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }
