 'use client';
 
 import Image from 'next/image';
 import { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Plus, Users, UserPlus, X } from 'lucide-react';
 
 interface Contributor {
   login: string;
   avatarUrl: string | null;
   teamId?: string | null;
 }
 
 interface Team {
   id: string;
   name: string;
   members: Contributor[];
 }
 
 interface TeamManagementProps {
   initialTeams: Team[];
   contributors: Contributor[]; // All contributors to select from
 }
 
 export default function TeamManagement({ initialTeams, contributors }: TeamManagementProps) {
   const [teams, setTeams] = useState<Team[]>(initialTeams);
   const [isCreating, setIsCreating] = useState(false);
   const [newTeamName, setNewTeamName] = useState('');
 
   // Mock server action for now (would be real server action or API call)
   const createTeam = async () => {
     if (!newTeamName.trim()) return;
     
     // Optimistic update
     const newTeam = {
       id: `temp-${Date.now()}`,
       name: newTeamName,
       members: []
     };
     
     setTeams([...teams, newTeam]);
     setNewTeamName('');
     setIsCreating(false);
     
     // In real impl, would call API: POST /api/teams
   };
 
   const assignMember = (teamId: string, login: string) => {
     // Logic to call API and update local state
     console.log(`Assigning ${login} to team ${teamId}`);
   };
 
   return (
     <Card className="col-span-2">
       <CardHeader className="flex flex-row items-center justify-between">
         <div>
           <CardTitle>Team Management</CardTitle>
           <CardDescription>Group contributors into squads for better insights.</CardDescription>
         </div>
         <button 
           onClick={() => setIsCreating(true)}
           className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
         >
           <Plus className="h-4 w-4" />
           New Team
         </button>
       </CardHeader>
       <CardContent>
         {isCreating && (
           <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex gap-3 items-center">
             <input 
               type="text" 
               placeholder="Team Name (e.g. Core Platform)"
               value={newTeamName}
               onChange={(e) => setNewTeamName(e.target.value)}
               className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 w-full"
             />
             <button onClick={createTeam} className="text-sm bg-violet-600 text-white px-3 py-2 rounded hover:bg-violet-700">Save</button>
             <button onClick={() => setIsCreating(false)} className="text-sm text-slate-400 hover:text-white px-2">Cancel</button>
           </div>
         )}
 
         <div className="grid gap-6 md:grid-cols-2">
           {teams.length === 0 ? (
             <div className="col-span-2 text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
               <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
               <p>No teams created yet.</p>
             </div>
           ) : (
             teams.map(team => (
               <div key={team.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="font-medium text-white flex items-center gap-2">
                     <Users className="h-4 w-4 text-violet-400" />
                     {team.name}
                   </h3>
                   <span className="text-xs text-slate-500">{team.members.length} members</span>
                 </div>
                 
                 <div className="space-y-2">
                   {team.members.length > 0 ? (
                     team.members.map(member => (
                       <div key={member.login} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 p-1.5 rounded">
                         <Image
                           src={member.avatarUrl || '/avatar-placeholder.png'}
                           className="h-5 w-5 rounded-full"
                           alt={member.login}
                           width={20}
                           height={20}
                         />
                         <span>{member.login}</span>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-slate-600 italic">No members assigned</p>
                   )}
                   
                   <button className="w-full mt-2 py-1.5 border border-dashed border-slate-700 text-xs text-slate-500 hover:text-white hover:border-slate-500 rounded flex items-center justify-center gap-1 transition-colors">
                     <UserPlus className="h-3 w-3" />
                     Add Member
                   </button>
                 </div>
               </div>
             ))
           )}
         </div>
       </CardContent>
     </Card>
   );
 }
