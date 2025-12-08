import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, TrendingUp, Save, Loader } from 'lucide-react';
import { assignments, type AssignmentLetter, type Grade, type Student, type Team } from '../../types/types';
import { getGradeColor100, getGradeColor500 } from '../../utils/utils';

// API endpoints (adjust based on your backend)
const API_BASE_URL = 'http://localhost:8000';
const STUDENTS_ENDPOINT = `${API_BASE_URL}/students`;
const TEAMS_ENDPOINT = `${API_BASE_URL}/teams`;
const GRADES_ENDPOINT = `${API_BASE_URL}/grades`;

export default function AllStudentsDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const sprints = [1, 2, 3, 4];

  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Fetch data from backend on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [studentsRes, teamsRes, gradesRes] = await Promise.all([
        fetch(STUDENTS_ENDPOINT),
        fetch(TEAMS_ENDPOINT),
        fetch(GRADES_ENDPOINT)
      ]);

      if (!studentsRes.ok || !teamsRes.ok || !gradesRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const studentsData: Student[] = await studentsRes.json();
      const teamsData: Team[] = await teamsRes.json();
      const gradesData: Grade[] = await gradesRes.json();

      setStudents(studentsData);
      setTeams(teamsData);
      setGrades(gradesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by team
  const filteredStudents = !students ? [] : selectedTeam === 'all'
    ? students
    : students.filter(student => student.teamId === selectedTeam);

  // Calculate team total grade for a student in a sprint
  const calculateTeamTotalGrade = (studentId: string, sprint: number): number => {
    const student = students.find(s => s.id === studentId);
    if (!student?.teamId) return 0;

    const teamStudents = students.filter(s => s.teamId === student.teamId);
    if (teamStudents.length === 0) return 0;

    // Calculate average of team assignments for the student
    const studentTeamGrades = assignments.map(assignment => {
      if (assignment === 'E') return 0;
      const grade = grades.find(
        g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
      );
      return grade?.score ?? 0;
    });

    return Math.round(studentTeamGrades.reduce((acc, score) => acc + score, 0));
  };

  // Get individual extra grade
  const getIndividualExtraGrade = (studentId: string, sprint: number): number => {
    const grade = grades.find(
      g => g.studentId === studentId && g.sprint === sprint && g.assignment === 'E'
    );
    return grade?.score ?? 0;
  };

  // Calculate sprint sum (team total + individual extra)
  const calculateSprintSum = (studentId: string, sprint: number): number => {
    const teamTotal = calculateTeamTotalGrade(studentId, sprint);
    const individualExtra = getIndividualExtraGrade(studentId, sprint);
    return teamTotal + individualExtra;
  };

  // Calculate total overall sum
  const calculateTotalSum = (studentId: string): number => {
    const sprintSums = sprints.map(sprint => calculateSprintSum(studentId, sprint));
    return sprintSums.reduce((acc, sum) => acc + sum, 0);
  };

  // Update student grade locally and mark for saving
  const updateStudentGrade = (studentId: string, sprint: number, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));

    setGrades(prev => {
      const existingIndex = prev.findIndex(
        g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        return updated;
      } else {
        return [...prev, { studentId, sprint, assignment, score: validScore }];
      }
    });

    setUnsavedChanges(true);
  };

  // Save all changes to backend
  const handleSave = async () => {
    if (saving || !unsavedChanges) return;

    setSaving(true);
    setError(null);

    try {
      // Send updated grades to backend
      const response = await fetch(GRADES_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades }),
      });

      if (!response.ok) {
        throw new Error('Failed to save grades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save grades');
      console.error('Error saving grades:', err);
      alert('Failed to save grades. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Grades Overview</h1>
              <p className="text-sm text-gray-500">
                View team grades, individual extra grades, and totals per sprint
              </p>
            </div>
            <div className="flex items-center space-x-3 mx-5">
              <button 
                onClick={handleSave} 
                disabled={!unsavedChanges || saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              {unsavedChanges && !saving && (
                <span className="text text-orange-600 font-medium">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Team:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* Student Info Column */}
                <th rowSpan={2} className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r">
                  Student
                </th>

                {/* Sprint Headers */}
                {sprints.map(sprint => (
                  <th
                    key={sprint}
                    className="px-4 py-3 text-center border-l border-gray-200"
                    colSpan={3}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Sprint {sprint}
                      </span>
                    </div>
                  </th>
                ))}

                {/* Overall Columns */}
                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                  Total
                </th>
              </tr>

              {/* Grade Type Subheaders */}
              <tr>
                {/* Sprint subheaders */}
                {sprints.flatMap(sprint => [
                  <th key={`${sprint}-team`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                    Team
                  </th>,
                  <th key={`${sprint}-extra`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                    Extra
                  </th>,
                  <th key={`${sprint}-sum`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 bg-gray-100">
                    Sum
                  </th>
                ])}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => {
                const team = teams.find(t => t.id === student.teamId);
                const totalSum = calculateTotalSum(student.id);

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    {/* Student Info */}
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.name}
                            </p>
                            {team && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${team.color}`}>
                                {team.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sprint Grades */}
                    {sprints.flatMap(sprint => {
                      const teamGrade = calculateTeamTotalGrade(student.id, sprint);
                      const extraGrade = getIndividualExtraGrade(student.id, sprint);
                      const sprintSum = calculateSprintSum(student.id, sprint);
                      const cellId = `extra-${student.id}-${sprint}`;
                      const isEditing = editingCell === cellId;

                      return [
                        // Team Grade
                        <td key={`${student.id}-${sprint}-team`} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-100">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getGradeColor100(teamGrade)}`}>
                            {teamGrade || '-'}
                          </span>
                        </td>,

                        // Extra Grade
                        <td key={`${student.id}-${sprint}-extra`} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-100">
                          {isEditing ? (
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={extraGrade}
                              onChange={(e) => updateStudentGrade(student.id, sprint, 'E', Number(e.target.value))}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                              autoFocus
                              className="w-12 px-1 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-sm"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellId)}
                              className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getGradeColor100(extraGrade)}`}
                            >
                              {extraGrade || '-'}
                            </button>
                          )}
                        </td>,

                        // Sum
                        <td key={`${student.id}-${sprint}-sum`} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${getGradeColor500(sprintSum)}`}>
                            {sprintSum || '-'}
                          </span>
                        </td>
                      ];
                    })}

                    {/* Total Sum */}
                    <td className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-100">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor500(totalSum)}`}>
                        {totalSum || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found for the selected team</p>
          </div>
        )}
      </div>
    </div>
  );
}