import React, { useEffect, useState } from 'react';
import { Plus, User, Shield, Lock, Edit2, Check, Users } from 'lucide-react';
import { type Project, type Student, type Team, type UserRole } from './types/types';
import { API_BASE_URL } from './api/studentApi';

interface TeamManagementProps {
  role: UserRole;
}

interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: 'instructor' | 'student';
  studentId?: number | null;
  teamId?: number | null;
}

function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');

  const baseHeaders: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        baseHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers) {
        baseHeaders[key] = value;
      }
    } else {
      Object.assign(baseHeaders, options.headers);
    }
  }

  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Если не POST/PUT/PATCH с телом, Content-Type не обязателен
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: baseHeaders,
  });
}

export default function TeamManagement({ role }: TeamManagementProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form State for Instructor
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectMaxTeams, setNewProjectMaxTeams] = useState(4);
  const [newProjectMaxStudents, setNewProjectMaxStudents] = useState(3);

  // Edit State for Reps
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------- helpers to загрузить данные с бэка ---------

  const loadCurrentStudent = async (): Promise<Student | null> => {
    if (role !== 'student') {
      setStudent(null);
      return null;
    }

    const meResp = await authFetch('/auth/me');
    if (!meResp.ok) {
      const text = await meResp.text();
      throw new Error(`Failed to load current user: ${meResp.status} ${text}`);
    }
    const me: MeResponse = await meResp.json();
    if (me.role !== 'student' || !me.studentId) {
      throw new Error('Current user is not linked to a student entity');
    }

    const studResp = await authFetch(`/students/${me.studentId}`);
    if (!studResp.ok) {
      const text = await studResp.text();
      throw new Error(`Failed to load student: ${studResp.status} ${text}`);
    }

    const s = await studResp.json();
    const mappedStudent: Student = {
      id: String(s.id),
      name: s.name,
      email: s.email,
      teamId: s.teamId ? String(s.teamId) : '',
      isRep: !!s.isRep,
    };
    setStudent(mappedStudent);
    return mappedStudent;
  };

  const mapProjectsFromApi = (apiProjects: any[]): Project[] => {
    return apiProjects.map((p) => ({
      id: String(p.id),
      name: p.name,
      maxTeams: p.maxTeams ?? p.max_teams,
      maxStudentsPerTeam: p.maxStudentsPerTeam ?? p.max_students_per_team,
      teams: (p.teams ?? []).map(
        (t: any): Team => ({
          id: String(t.id),
          name: t.name,
          color: t.color ?? undefined,
          isLocked: t.isLocked ?? t.is_locked ?? false,
          students: (t.students ?? []).map(
            (st: any): Student => ({
              id: String(st.id),
              name: st.name,
              email: st.email,
              teamId: st.teamId ? String(st.teamId) : st.team_id ? String(st.team_id) : '',
              isRep: !!(st.isRep ?? st.is_rep),
            })
          ),
        })
      ),
    }));
  };

  const loadProjects = async () => {
    const resp = await authFetch('/projects');
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Failed to load projects: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    setProjects(mapProjectsFromApi(data));
  };

  const reloadAll = async () => {
    if (role === 'student') {
      await loadCurrentStudent();
    }
    await loadProjects();
  };

  // on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await reloadAll();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  // --------- Actions ---------

  // 1. Instructor adds new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      const resp = await authFetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          maxTeams: newProjectMaxTeams,
          maxStudentsPerTeam: newProjectMaxStudents,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to create project: ${resp.status} ${text}`);
      }

      // После создания – просто перезагружаем список проектов,
      // чтобы в нём появились сгенерированные Team 1..N
      await loadProjects();
      setNewProjectName('');
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to create project');
    }
  };

  // 2. Student chooses a free slot
  const handleJoinTeam = async (projectId: string, teamId: string, asRep: boolean) => {
    if (!student) return;

    // Ровно та же проверка, что и была, только по реальному student.id
    const alreadyInLockedTeam = projects.some((p) =>
      p.teams.some(
        (t) => t.isLocked && t.students.some((s) => s.id === student.id)
      )
    );
    if (alreadyInLockedTeam) return;

    try {
      await authFetch(`/projects/${projectId}/join-team?team_id=${teamId}&as_rep=${asRep}`, {
        method: 'POST',
      });

      // После успешного join – обновляем и проекты, и своего студента
      await reloadAll();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to join team');
    }
  };

  // 3. Representative changes team name
  const handleRenameTeam = async (teamId: string) => {
    try {
      const resp = await authFetch(`/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempTeamName }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to rename team: ${resp.status} ${text}`);
      }

      setEditingTeamId(null);
      await loadProjects();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to rename team');
    }
  };

  // 4. Instructor accepts (locks) a team
  const handleToggleLock = async (projectId: string, teamId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const team = project?.teams.find((t) => t.id === teamId);
    if (!team) return;

    try {
      const resp = await authFetch(`/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !team.isLocked }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to update team lock: ${resp.status} ${text}`);
      }

      await loadProjects();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to update team lock');
    }
  };

  const teamHasRepr = (team: Team) => team.students.some((m) => m.isRep);

  // --------- UI ---------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p>Loading team management...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={reloadAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
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
            <form
              onSubmit={handleAddProject}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Course management system"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Teams
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newProjectMaxTeams}
                  onChange={(e) => setNewProjectMaxTeams(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Students per Team
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newProjectMaxStudents}
                  onChange={(e) => setNewProjectMaxStudents(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="md:col-start-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
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
                const isFull =
                  team.students.length >= project.maxStudentsPerTeam;
                const hasRep = teamHasRepr(team);
                const amIMember =
                  !!student && team.students.some((m) => m.id === student.id);
                const amIRep =
                  !!student &&
                  team.students.some((m) => m.id === student.id && m.isRep);

                return (
                  <div
                    key={team.id}
                    className={`
                    relative rounded-xl border-2 transition-all p-5 flex flex-col gap-4
                    ${
                      team.isLocked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 shadow-sm hover:border-indigo-300'
                    }
                  `}
                  >
                    {/* Team Header */}
                    <div className="flex justify-between items-start">
                      {editingTeamId === team.id ? (
                        <div className="flex gap-2 w-full">
                          <input
                            autoFocus
                            type="text"
                            value={tempTeamName}
                            onChange={(e) => setTempTeamName(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameTeam(team.id)}
                            className="bg-green-600 text-white p-1 rounded"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-800">
                            {team.name}
                          </h3>
                          {amIRep && !team.isLocked && (
                            <button
                              type="button"
                              onClick={() => {
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
                          type="button"
                          onClick={() => handleToggleLock(project.id, team.id)}
                          className={`p-1.5 rounded-md ${
                            team.isLocked
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={
                            team.isLocked ? 'Unlock Team' : 'Approve & Lock Team'
                          }
                        >
                          {team.isLocked ? (
                            <Lock size={16} />
                          ) : (
                            <>Confirm</>
                          )}
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
                      <div
                        className={`
                        flex items-center justify-between p-2 rounded border 
                        ${
                          hasRep
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-gray-50 border-dashed border-gray-300'
                        }
                      `}
                      >
                        <div className="flex items-center gap-2">
                          <Shield
                            className={`w-4 h-4 ${
                              hasRep ? 'text-indigo-600' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              hasRep
                                ? 'font-medium text-indigo-900'
                                : 'text-gray-400 italic'
                            }`}
                          >
                            {hasRep
                              ? team.students.find((m) => m.isRep)?.name
                              : 'Representative slot'}
                          </span>
                        </div>

                        {role === 'student' &&
                          !hasRep &&
                          !team.isLocked &&
                          !isFull &&
                          !amIMember &&
                          student && (
                            <button
                              type="button"
                              onClick={() =>
                                handleJoinTeam(project.id, team.id, true)
                              }
                              className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded font-semibold transition-colors"
                            >
                              Join as Rep
                            </button>
                          )}
                      </div>

                      {/* 2. Regular Member Slots */}
                      <div className="space-y-2">
                        {team.students
                          .filter((m) => !m.isRep)
                          .map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
                            >
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {member.name}
                              </span>
                            </div>
                          ))}

                        {/* Empty Slots */}
                        {Array.from({
                          length: Math.max(
                            0,
                            project.maxStudentsPerTeam -
                              team.students.length -
                              (teamHasRepr(team) ? 0 : 1)
                          ),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 border border-dashed border-gray-200 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-300" />
                              <span className="text-sm text-gray-400 italic">
                                Student Slot
                              </span>
                            </div>
                            {role === 'student' &&
                              !team.isLocked &&
                              !amIMember &&
                              student && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleJoinTeam(project.id, team.id, false)
                                  }
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
                        <Users size={12} /> {team.students.length} /{' '}
                        {project.maxStudentsPerTeam}
                      </span>
                      {team.isLocked && (
                        <span className="text-green-600">Team Finalized</span>
                      )}
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
