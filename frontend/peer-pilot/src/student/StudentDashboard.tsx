import { useState, useEffect, useCallback } from 'react';
import { Users, Award, FileCheck, Menu, X, RefreshCw, AlertCircle } from 'lucide-react';
import TeamMembers from './TeamMembers.tsx';
import MyGrades from './MyGrades';
import ReviewAssignments from './ReviewAssignments';
import type { Student, Team, Grade, PeerReview } from '../types/types.tsx';
import { studentApi } from '../api/studentApi';

interface StudentDashboardProps {
  studentId: string;
}

export default function StudentDashboard({ studentId }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'grades' | 'reviews'>('grades');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [student, setStudent] = useState<Student | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamStudents, setTeamStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);

  const tabs = [
    { id: 'grades' as const, name: 'My Grades', icon: Award },
    { id: 'reviews' as const, name: 'Review Assignments', icon: FileCheck },
    { id: 'team' as const, name: 'Team Members', icon: Users },
  ];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all necessary data in parallel
      const [dashboardData, studentGrades] = await Promise.all([
        studentApi.fetchStudentDashboard(studentId),
        studentApi.fetchStudentGrades(studentId),
      ]);

      const team = dashboardData.teams.filter(t => t.id === dashboardData.student.teamId)[0];
      const [peerReviewsData] = await Promise.all([team ? studentApi.fetchPeerReviews(team.id) : Promise.resolve([])]);

      setStudent(dashboardData.student);
      setTeam(team);
      setTeamStudents(dashboardData.students);
      setGrades(studentGrades);
      setPeerReviews(peerReviewsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, activeTab]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await studentApi.deletePeerReview(reviewId);

      // Remove from local state
      setPeerReviews(prev => prev.filter(review => review.id !== reviewId));

      console.log(`Review ${reviewId} deleted successfully`);
    } catch (err) {
      alert('Failed to delete review. Please try again.');
      console.error('Error deleting review:', err);
    }
  };

  const handleUpdateReview = async (reviewId: string, updates: Partial<PeerReview>) => {
    try {
      const existingReview = peerReviews.find(r => r.id === reviewId);
      if (!existingReview) {
        throw new Error('Review not found');
      }

      const updatedReview = {
        ...existingReview,
        ...updates,
      };

      const result = await studentApi.submitPeerReview(updatedReview);

      // Update local state
      setPeerReviews(prev =>
        prev.map(review => review.id === reviewId ? result : review)
      );

      console.log('Review updated successfully:', reviewId);
      return result;
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div className="text-red-600 font-semibold mb-4">Error Loading Dashboard</div>
          <p className="text-gray-600 mb-6">{error || 'Student data not found'}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                  Welcome back, {student.name} • {team?.name || 'No team assigned'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="hidden md:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left font-medium ${activeTab === tab.id
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
        {activeTab === 'team' && team && (
          <TeamMembers
            team={team}
            students={teamStudents}
          />
        )}

        {activeTab === 'grades' && student && (
          <MyGrades
            student={student}
            grades={grades}
          />
        )}

        {activeTab === 'reviews' && team && student && (
          <ReviewAssignments
            student={student}
            team={team}
            reviews={peerReviews}
            onDeleteReview={handleDeleteReview}
            onUpdateReview={handleUpdateReview}
          />
        )}
      </div>
    </div>
  );
}