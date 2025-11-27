import { Calendar, TrendingUp } from 'lucide-react';
import { type Student, type Grade, assignments, type AssignmentLetter, assignmentNames } from '../types/types.tsx';
import { getGradeColor100, getGradeColor500 } from '../utils/utils.ts';

interface MyGradesProps {
  student: Student;
  grades: Grade[];
}

export default function MyGrades({ student, grades }: MyGradesProps) {
  const sprints = [1, 2, 3, 4, 5];

  const getGrade = (sprint: number, assignment: AssignmentLetter): number => {
    const grade = grades.find(
      g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment
    );
    return grade?.score ?? 0;
  };

  const calculateSprintSum = (sprint: number): number => {
    const scores = assignments.map(a => getGrade(sprint, a));
    return scores.reduce((acc, score) => acc + score, 0);
  };

  const calculateOverallSum = (): number => {
    const sprintSums = sprints.map(sprint => calculateSprintSum(sprint));
    return sprintSums.filter(avg => avg > 0).reduce((acc, avg) => acc + avg, 0)
  };

  const overallSum = calculateOverallSum();

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Overall Performance</h2>
            <p className="text-blue-100 text-sm">Sum across all sprints</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{overallSum}</div>
            <div className="text-blue-100 text-sm">/ {500*sprints.length}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2 text-blue-100">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Based on {sprints.length} sprints</span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Grades</h2>
          <p className="text-sm text-gray-500">Scores for all assignments across sprints</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sprint
                </th>
                {assignments.map(assignment => (
                  <th key={assignment} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {assignment}
                    <div className="text-xs font-normal text-gray-400 normal-case">
                      {assignmentNames[assignment]}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sprints.map(sprint => {
                const sprintSum = calculateSprintSum(sprint);
                
                return (
                  <tr key={sprint} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">Sprint {sprint}</span>
                      </div>
                    </td>
                    
                    {assignments.map(assignment => {
                      const score = getGrade(sprint, assignment);
                      
                      return (
                        <td key={assignment} className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor100(score)}`}>
                            {score || '-'}
                          </span>
                        </td>
                      );
                    })}
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor500(sprintSum)}`}>
                        {sprintSum || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}