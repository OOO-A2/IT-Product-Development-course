import { Calendar, TrendingUp } from 'lucide-react';
import GradeInput from './GradeInput';
import type { Team, TeamGrade } from '../../types/types';

interface SprintGradingCardProps {
  team: Team;
  sprint: number;
  grades: TeamGrade[];
  onGradeUpdate: (teamId: string, sprint: number, assignment: 'A' | 'R' | 'I' | 'C', score: number) => void;
  assignmentNames: { [key: string]: string };
  isCurrentSprint: boolean;
}

export default function SprintGradingCard({
  team,
  sprint,
  grades,
  onGradeUpdate,
  assignmentNames,
  isCurrentSprint
}: SprintGradingCardProps) {
  const assignments: Array<'A' | 'R' | 'I' | 'C'> = ['A', 'R', 'I', 'C'];

  const calculateSprintAverage = (): number => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round(sum / grades.length);
  };

  const sprintAverage = calculateSprintAverage();

  const getGrade = (assignment: 'A' | 'R' | 'I' | 'C'): number => {
    const grade = grades.find(g => g.assignment === assignment);
    return grade?.score ?? 0;
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${
      isCurrentSprint ? 'ring-2 ring-blue-200 bg-blue-50' : 'bg-white'
    }`}>
      {/* Sprint Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h4 className="font-semibold text-gray-900">Sprint {sprint}</h4>
            {isCurrentSprint && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                Current
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-semibold ${
              sprintAverage >= 90 ? 'text-green-600' :
              sprintAverage >= 80 ? 'text-blue-600' :
              sprintAverage >= 70 ? 'text-yellow-600' :
              sprintAverage >= 60 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              Average: {sprintAverage}/100
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Grades */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assignments.map(assignment => (
            <div key={assignment} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {assignment} - {assignmentNames[assignment]}
                </div>
                <GradeInput
                  value={getGrade(assignment)}
                  onChange={(score) => onGradeUpdate(team.id, sprint, assignment, score)}
                />
                <div className="text-xs text-gray-500 mt-2">
                  Team Score
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}