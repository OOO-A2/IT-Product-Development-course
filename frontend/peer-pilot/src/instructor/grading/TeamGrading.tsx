import { useState } from 'react';
import { Search, Download, Save, Users, Calendar, Award } from 'lucide-react';
import TeamGradingView from './TeamGradingView';
import type { Team, TeamGrade, Student } from '../../types/types';

interface InstructorTeamGradingProps {
  teams: Team[];
  students: Student[];
  initialGrades: TeamGrade[];
}

export default function InstructorTeamGrading({ 
  teams, 
  students, 
  initialGrades 
}: InstructorTeamGradingProps) {
  const [grades, setGrades] = useState<TeamGrade[]>(initialGrades);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const sprints = [1, 2, 3, 4, 5];

  const filteredTeams = teams.filter(team => {
    const matchesTeam = selectedTeam === 'all' || team.id === selectedTeam;
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const updateTeamGrade = (teamId: string, sprint: number, assignment: 'A' | 'R' | 'I' | 'C', score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    
    setGrades(prev => {
      const existingIndex = prev.findIndex(
        g => g.teamId === teamId && g.sprint === sprint && g.assignment === assignment
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        return updated;
      } else {
        return [...prev, { teamId, sprint, assignment, score: validScore }];
      }
    });
    
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving team grades:', grades);
    setUnsavedChanges(false);
    alert('Team grades saved successfully!');
  };

  const handleExport = () => {
    console.log('Exporting team grades...');
    alert('Export functionality would download CSV/Excel file');
  };

  const calculateTeamAverage = (teamId: string, sprint: number): number => {
    const teamGrades = grades.filter(g => g.teamId === teamId && g.sprint === sprint);
    if (teamGrades.length === 0) return 0;
    
    const sum = teamGrades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round(sum / teamGrades.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Grading Dashboard</h1>
                <p className="text-sm text-gray-500">Grade assignments by team for each sprint</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
              )}
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Team Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Sprint Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                {sprints.map(sprint => (
                  <option key={sprint} value={sprint}>Sprint {sprint}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Grading Views */}
        <div className="space-y-6">
          {filteredTeams.map(team => {
            const teamStudents = students.filter(s => s.teamId === team.id);
            const teamGrades = grades.filter(g => g.teamId === team.id);
            const currentSprintAverage = calculateTeamAverage(team.id, selectedSprint);
            
            return (
              <TeamGradingView
                key={team.id}
                team={team}
                students={teamStudents}
                grades={teamGrades}
                sprint={selectedSprint}
                onGradeUpdate={updateTeamGrade}
                currentSprintAverage={currentSprintAverage}
              />
            );
          })}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No teams found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}