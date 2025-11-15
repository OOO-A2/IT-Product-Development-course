import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Mail, Star } from 'lucide-react';
import SprintGradingCard from './SprintGradingCard';
import type { Team, Student, TeamGrade } from '../../types/types';

interface TeamGradingViewProps {
  team: Team;
  students: Student[];
  grades: TeamGrade[];
  sprint: number;
  onGradeUpdate: (teamId: string, sprint: number, assignment: 'A' | 'R' | 'I' | 'C', score: number) => void;
  currentSprintAverage: number;
}

export default function TeamGradingView({ 
  team, 
  students, 
  grades, 
  sprint, 
  onGradeUpdate,
  currentSprintAverage 
}: TeamGradingViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllSprints, setShowAllSprints] = useState(false);

  const sprints = [1, 2, 3, 4, 5];

  const assignmentNames = {
    A: 'Assignment',
    R: 'Peer Review',
    I: 'Implementation',
    C: 'Coordination'
  };

  const getSprintAverage = (sprintNum: number): number => {
    const sprintGrades = grades.filter(g => g.sprint === sprintNum);
    if (sprintGrades.length === 0) return 0;
    
    const sum = sprintGrades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round(sum / sprintGrades.length);
  };

  const calculateOverallAverage = (): number => {
    const sprintAverages = sprints.map(sprintNum => getSprintAverage(sprintNum));
    const validAverages = sprintAverages.filter(avg => avg > 0);
    return validAverages.length > 0 
      ? Math.round(validAverages.reduce((acc, avg) => acc + avg, 0) / validAverages.length)
      : 0;
  };

  const overallAverage = calculateOverallAverage();

  const displayedSprints = showAllSprints ? sprints : [sprint];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Team Header */}
      <div 
        className={`p-6 cursor-pointer transition-colors ${
          isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${team.color}`} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{students.length} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Overall: {overallAverage}/100</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Current Sprint: {currentSprintAverage}/100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map(student => (
                <div key={student.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Toggle */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Sprint Grades</h3>
              <button
                onClick={() => setShowAllSprints(!showAllSprints)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllSprints ? 'Show Current Sprint Only' : 'Show All Sprints'}
              </button>
            </div>
          </div>

          {/* Sprint Grading Cards */}
          <div className="px-6 pb-6 space-y-4">
            {displayedSprints.map(sprintNum => (
              <SprintGradingCard
                key={sprintNum}
                team={team}
                sprint={sprintNum}
                grades={grades.filter(g => g.sprint === sprintNum)}
                onGradeUpdate={onGradeUpdate}
                assignmentNames={assignmentNames}
                isCurrentSprint={sprintNum === sprint}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}