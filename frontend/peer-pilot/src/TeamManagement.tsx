import React, { useState } from 'react';
import { Plus, User, Shield, Lock, Edit2, Check, Users } from 'lucide-react';
import { type Project, type Student, type Team, type UserRole } from './types/types';
import { mockProjects, mockStudent } from './data/mock';


interface TeamManagementProps {
  role: UserRole;
}

export default function TeamManagement({ role }: TeamManagementProps) {
  const [student] = useState<Student>(mockStudent);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // Form State for Instructor
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectMaxTeams, setNewProjectMaxTeams] = useState(4);
  const [newProjectMaxStudents, setNewProjectMaxStudents] = useState(3);

  // Edit State for Reps
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  // --- Actions ---

  // 1. Instructor adds new project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      maxTeams: newProjectMaxTeams,
      maxStudentsPerTeam: newProjectMaxStudents,
      teams: Array.from({ length: newProjectMaxTeams }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `Team ${i + 1}`,
        students: [],
        isLocked: false,
      })),
    };

    setProjects([...projects, newProject]);
    setNewProjectName('');
    console.log([...projects, newProject])
  };

  // 2. Student chooses a free slot
  const handleJoinTeam = (projectId: string, teamId: string, asRep: boolean) => {
    if (projects.some(p => p.teams.some(t => t.isLocked && t.students.some(s => s.id === student.id)))) return;
    setProjects(projects.map(p => {
      if (projectId !== p.id) return p;
      return {
        ...p,
        teams: p.teams.map(t => {
          t.students = [...(t.students.filter(s => s.id !== student.id))] // Remove a student from all teams
          if (t.id !== teamId) return t;
          if (t.students.length >= p.maxStudentsPerTeam) return t; // Full
          if (t.isLocked) return t; // Locked by instructor

          // Check if rep slot is taken if trying to join as rep
          const hasRep = t.students.some(m => m.isRep);
          if (asRep && hasRep) return t;

          return {
            ...t,
            students: [
              ...t.students,
              { ...student, isRep: asRep }
            ]
          };
        })
      };
    }));
  };

  // 3. Representative changes team name
  const handleRenameTeam = (projectId: string, teamId: string) => {
    setProjects(projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        teams: p.teams.map(t => {
          if (t.id !== teamId) return t;
          return { ...t, name: tempTeamName };
        })
      };
    }));
    setEditingTeamId(null);
  };

  // 4. Instructor accepts (locks) a team
  const handleToggleLock = (projectId: string, teamId: string) => {
    setProjects(projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        teams: p.teams.map(t => {
          if (t.id !== teamId) return t;
          return { ...t, isLocked: !t.isLocked };
        })
      };
    }));
  };

  const teamHasRepr = (team: Team) => {
    return team.students.some(m => m.isRep);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">

      {/* Header & Role Switcher */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">Course Team Management</h1>
          <p className="text-gray-500">Select projects and form your teams</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">

        {/* Instructor: Add Project Panel */}
        {role === 'instructor' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Create New Project
            </h2>
            <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" required value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Course management system"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Teams</label>
                <input type="number" min="1" max="20" value={newProjectMaxTeams}
                  onChange={(e) => setNewProjectMaxTeams(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students per Team</label>
                <input type="number" min="1" max="10" value={newProjectMaxStudents}
                  onChange={(e) => setNewProjectMaxStudents(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button type="submit" className="md:col-start-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Add Project
              </button>
            </form>
          </section>
        )}

        {/* Project List */}
        {projects.map((project) => (
          <div key={project.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Max {project.maxStudentsPerTeam} students per team
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.teams.map((team) => {
                const isFull = team.students.length >= project.maxStudentsPerTeam;
                const hasRep = team.students.some(m => m.isRep);
                const amIMember = team.students.some(m => m.id === '');
                const amIRep = team.students.some(m => m.isRep);

                return (
                  <div key={team.id} className={`
                    relative rounded-xl border-2 transition-all p-5 flex flex-col gap-4
                    ${team.isLocked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm hover:border-indigo-300'}
                  `}>

                    {/* Team Header */}
                    <div className="flex justify-between items-start">
                      {editingTeamId === team.id ? (
                        <div className="flex gap-2 w-full">
                          <input autoFocus type="text" value={tempTeamName}
                            onChange={(e) => setTempTeamName(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          />
                          <button
                            onClick={() => handleRenameTeam(project.id, team.id)}
                            className="bg-green-600 text-white p-1 rounded"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                          {amIRep && !team.isLocked && (
                            <button onClick={() => {
                              setEditingTeamId(team.id);
                              setTempTeamName(team.name);
                            }}
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Instructor Controls */}
                      {role === 'instructor' && (
                        <button
                          onClick={() => handleToggleLock(project.id, team.id)}
                          className={`p-1.5 rounded-md ${team.isLocked ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          title={team.isLocked ? "Unlock Team" : "Approve & Lock Team"}
                        >
                          {team.isLocked ? <Lock size={16} /> : <>Confirm</>}
                        </button>
                      )}

                      {/* Locked Badge for Students */}
                      {role === 'student' && team.isLocked && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                          <Lock size={12} /> APPROVED
                        </span>
                      )}
                    </div>

                    {/* Slots Visualizer */}
                    <div className="space-y-2">
                      {/* 1. Representative Slot */}
                      <div className={`
                        flex items-center justify-between p-2 rounded border 
                        ${hasRep ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-dashed border-gray-300'}
                      `}>
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${hasRep ? 'text-indigo-600' : 'text-gray-400'}`} />
                          <span className={`text-sm ${hasRep ? 'font-medium text-indigo-900' : 'text-gray-400 italic'}`}>
                            {hasRep ? team.students.find(m => m.isRep)?.name : "Representative slot"}
                          </span>
                        </div>

                        {role === 'student' && !hasRep && !team.isLocked && !isFull && !amIMember && (
                          <button
                            onClick={() => handleJoinTeam(project.id, team.id, true)}
                            className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded font-semibold transition-colors"
                          >
                            Join as Rep
                          </button>
                        )}
                      </div>

                      {/* 2. Regular Member Slots */}
                      <div className="space-y-2">
                        {team.students.filter(m => !m.isRep).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{member.name}</span>
                          </div>
                        ))}

                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, project.maxStudentsPerTeam - team.students.length - (teamHasRepr(team) ? 0 : 1)) }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-2 border border-dashed border-gray-200 rounded">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-300" />
                              <span className="text-sm text-gray-400 italic">Student Slot</span>
                            </div>
                            {role === 'student' && !team.isLocked && !amIMember && (
                              <button
                                onClick={() => handleJoinTeam(project.id, team.id, false)}
                                className="text-xs text-gray-500 hover:text-indigo-600 font-medium underline"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Status */}
                    <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {team.students.length} / {project.maxStudentsPerTeam}
                      </span>
                      {team.isLocked && <span className="text-green-600">Team Finalized</span>}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No projects added</p>
          </div>
        )}

      </main>
    </div>
  );
}
