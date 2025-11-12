import { useState } from 'react';
import { Users, Award, FileCheck, Menu, X } from 'lucide-react';
import TeamMembers from './TeamMembers.tsx';
import MyGrades from './MyGrades';
import ReviewAssignments from './ReviewAssignments';
import type { StudentDashboardProps } from '../types/types.tsx';

export default function StudentDashboard({ 
  student, 
  teams, 
  students, 
  grades, 
  reviewAssignments 
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'grades' | 'reviews'>('grades');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentTeam = teams.find(team => team.id === student.teamId);
  const teamStudents = students.filter(s => s.teamId === student.teamId);

  const tabs = [
    { id: 'grades' as const, name: 'My Grades', icon: Award },
    { id: 'reviews' as const, name: 'Review Assignments', icon: FileCheck },
    { id: 'team' as const, name: 'Team Members', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {student.name} • {studentTeam?.name}
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-4 py-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'team' && (
          <TeamMembers 
            team={studentTeam!} 
            students={teamStudents} 
          />
        )}

        {activeTab === 'grades' && (
          <MyGrades 
            student={student}
            grades={grades}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewAssignments 
            student={student}
            team={studentTeam!}
            reviewAssignments={reviewAssignments}
          />
        )}
      </div>
    </div>
  );
}