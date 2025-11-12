import { Calendar, TrendingUp } from 'lucide-react';
import type { Student, Grade } from '../types/types.tsx';

interface MyGradesProps {
  student: Student;
  grades: Grade[];
}

export default function MyGrades({ student, grades }: MyGradesProps) {
  const sprints = [1, 2, 3, 4, 5];
  const assignments: Array<'A' | 'R' | 'I' | 'C'> = ['A', 'R', 'I', 'C'];

  const assignmentNames = {
    A: 'Assignment',
    R: 'Peer Review',
    I: 'Implementation',
    C: 'Coordination'
  };

  const getGrade = (sprint: number, assignment: 'A' | 'R' | 'I' | 'C'): number => {
    const grade = grades.find(
      g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment
    );
    return grade?.score ?? 0;
  };

  const calculateSprintAverage = (sprint: number): number => {
    const scores = assignments.map(a => getGrade(sprint, a));
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return scores.length > 0 ? Math.round(sum / scores.length) : 0;
  };

  const calculateOverallAverage = (): number => {
    const sprintAverages = sprints.map(sprint => calculateSprintAverage(sprint));
    const validAverages = sprintAverages.filter(avg => avg > 0);
    return validAverages.length > 0 
      ? Math.round(validAverages.reduce((acc, avg) => acc + avg, 0) / validAverages.length)
      : 0;
  };

  const overallAverage = calculateOverallAverage();

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Overall Performance</h2>
            <p className="text-blue-100 text-sm">Average across all sprints</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{overallAverage}</div>
            <div className="text-blue-100 text-sm">/ 100</div>
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
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sprints.map(sprint => {
                const sprintAverage = calculateSprintAverage(sprint);
                
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            score >= 90 ? 'bg-green-100 text-green-800' :
                            score >= 80 ? 'bg-blue-100 text-blue-800' :
                            score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            score >= 60 ? 'bg-orange-100 text-orange-800' :
                            score > 0 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {score || '-'}
                          </span>
                        </td>
                      );
                    })}
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        sprintAverage >= 90 ? 'bg-green-100 text-green-800 border border-green-300' :
                        sprintAverage >= 80 ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        sprintAverage >= 70 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        sprintAverage >= 60 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        sprintAverage > 0 ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {sprintAverage || '-'}
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