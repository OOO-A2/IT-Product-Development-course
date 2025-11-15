import { Mail, Users } from 'lucide-react';
import type { Student, Team } from '../types/types.tsx';

interface TeamMembersProps {
  team: Team;
  students: Student[];
}

export default function TeamMembers({ team, students }: TeamMembersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${team.color}`} />
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {students.length} members
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Your teammates for all sprints and assignments
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {students.map((student, index) => (
          <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {student.name}
                    {index === 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{student.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}