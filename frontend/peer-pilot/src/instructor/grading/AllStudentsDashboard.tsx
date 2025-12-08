import { useState } from 'react';
import { Users, Mail, Calendar, TrendingUp, Save } from 'lucide-react';
import { mockGrades, mockStudents, mockTeams } from '../../data/mock';
import { assignments, type AssignmentLetter, type Grade } from '../../types/types';
import { getGradeColor100 } from '../../utils/utils';

export default function AllStudentsDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const sprints = [1, 2, 3, 4];

  const [students, teams] = [mockStudents, mockTeams]

  // Filter students by team
  const filteredStudents = selectedTeam === 'all'
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
      if (assignment === 'E') return 0
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

  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

  const handleSave = () => {
    // Send grades to backend
    setUnsavedChanges(false);
    alert('Grades saved successfully!');
  };

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
              <button onClick={handleSave} disabled={!unsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              {unsavedChanges && (<span className="text text-orange-600 font-medium">Unsaved changes</span>)}
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
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getGradeColor100(teamGrade, 400)}`}>
                            {teamGrade || '-'}
                          </span>
                        </td>,


                        // Extra Grade
                        <td key={`${student.id}-${sprint}-extra`} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-100">
                          {isEditing ? (
                            <input type="number" min="0" max="100" value={extraGrade}
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
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${getGradeColor500(sprintSum, 500)}`}>
                            {sprintSum || '-'}
                          </span>
                        </td>
                      ];
                    })}

                    {/* Total Sum */}
                    <td className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-100">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor500(totalSum, 2000)}`}>
                        {totalSum || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found for the selected team</p>
          </div>
        )}
      </div>
    </div>
  );
}