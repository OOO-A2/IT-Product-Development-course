import { useState } from 'react';
import { Search, Save, Calendar, ExternalLink, FileText, Clock, Edit, Check, X } from 'lucide-react';
import type { Grade, Student, Team, PeerReview } from '../../types/types';
import { mockGrades, mockReviews, mockStudents, mockTeams } from '../../data/mock';

export default function InstructorPeerReview() {
  // Mock data
  const [teams] = useState<Team[]>(mockTeams);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>(mockReviews);
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [students] = useState<Student[]>(mockStudents);

  const [selectedSprint, setSelectedSprint] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrades, setEditingGrades] = useState<{ [key: string]: boolean }>({});
  const [editingReportLinks, setEditingReportLinks] = useState<{ [key: string]: boolean }>({});
  const [reportLinks, setReportLinks] = useState<{ [key: string]: string }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const sprints = [1, 2, 3, 4, 5];

  // Get peer reviews for current sprint
  const currentSprintReviews = peerReviews.filter(review => review.sprint === selectedSprint);

  const getTeamReviewGrade = (teamId: string, sprint: number): number => {
    const teamStudents = students.filter(student => student.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const teamGrades = teamStudents.map(student =>
      grades.find(g => g.studentId === student.id && g.sprint === sprint && g.assignment === 'R')?.score ?? 0
    );

    return Math.round(teamGrades.reduce((acc, score) => acc + score, 0) / teamGrades.length);
  };

  const updateTeamReviewGrade = (teamId: string, sprint: number, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    const teamStudents = students.filter(student => student.teamId === teamId);

    setGrades(prev => {
      const updated = [...prev];

      teamStudents.forEach(student => {
        const existingIndex = updated.findIndex(
          g => g.studentId === student.id && g.sprint === sprint && g.assignment === 'R'
        );

        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        } else {
          updated.push({ studentId: student.id, sprint, assignment: 'R', score: validScore });
        }
      });

      return updated;
    });

    setUnsavedChanges(true);
  };

  const updateReportLink = (reviewedTeamId: string, sprint: number, link: string) => {
    setReportLinks(prev => ({
      ...prev,
      [`${reviewedTeamId}-${sprint}`]: link
    }));

    // Update the peer review with the assigned work description
    const reviewToUpdate = peerReviews.find(review => 
      review.reviewedTeamId === reviewedTeamId && review.sprint === sprint
    );

    if (reviewToUpdate) {
      setPeerReviews(prev => prev.map(review =>
        review.id === reviewToUpdate.id
          ? { ...review, assignedWork: link ? `Review assignment report: ${link}` : undefined }
          : review
      ));
    }

    setUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving peer reviews and grades:', { peerReviews, grades, reportLinks });
    setUnsavedChanges(false);
    alert('Peer review data saved successfully!');
  };

  const downloadReview = (reviewLink: string) => {
    window.open(reviewLink, '_blank');
  };

  const filteredReviews = currentSprintReviews.filter(review => {
    const reviewingTeam = teams.find(t => t.id === review.reviewingTeamId);
    const reviewedTeam = teams.find(t => t.id === review.reviewedTeamId);

    return reviewingTeam?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewedTeam?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getReportLink = (reviewedTeamId: string, sprint: number): string => {
    return reportLinks[`${reviewedTeamId}-${sprint}`] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Peer Review Management</h1>
                <p className="text-sm text-gray-500">Manage team reviews and grades</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
              )}
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

            {/* Status Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentSprintReviews.filter(r => r.status === 'submitted').length}</span> of{' '}
                <span className="font-medium">{currentSprintReviews.length}</span> reviews submitted
              </div>
            </div>
          </div>
        </div>

        {/* Peer Review Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewing Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewed Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewing team Assignment Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Document & Suggested Grades
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Grade (R)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map(review => {
                  const reviewingTeam = teams.find(t => t.id === review.reviewingTeamId);
                  const reviewedTeam = teams.find(t => t.id === review.reviewedTeamId);
                  const currentGrade = getTeamReviewGrade(review.reviewingTeamId, selectedSprint);
                  const isEditing = editingGrades[review.id];
                  const isEditingReportLink = editingReportLinks[review.id];
                  const currentReportLink = getReportLink(review.reviewedTeamId, selectedSprint);

                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      {/* Reviewing Team */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${reviewingTeam?.color} mr-3`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reviewingTeam?.name}</div>
                            <div className="text-sm text-gray-500">
                              {students.filter(s => s.teamId === review.reviewingTeamId).length} members
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reviewed Team */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${reviewedTeam?.color} mr-3`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reviewedTeam?.name}</div>
                            <div className="text-sm text-gray-500">
                              {students.filter(s => s.teamId === review.reviewedTeamId).length} members
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assignment Report Link */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {isEditingReportLink ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={currentReportLink}
                                onChange={(e) => updateReportLink(review.reviewedTeamId, selectedSprint, e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                              />
                              <button
                                onClick={() => setEditingReportLinks(prev => ({ ...prev, [review.id]: false }))}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReportLinks(prev => ({ ...prev, [review.id]: false }));
                                  setReportLinks(prev => ({
                                    ...prev,
                                    [`${review.reviewedTeamId}-${selectedSprint}`]: ''
                                  }));
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {currentReportLink ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => window.open(currentReportLink, '_blank')}
                                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>View Report</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingReportLinks(prev => ({ ...prev, [review.id]: true }))}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingReportLinks(prev => ({ ...prev, [review.id]: true }))}
                                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Add Report Link</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Review Document & Suggested Grades */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {/* Review Document */}
                          <div className="flex items-center space-x-2">
                            {review.reviewLink ? (
                              <>
                                <FileText className="w-4 h-4 text-green-600" />
                                <button
                                  onClick={() => downloadReview(review.reviewLink!)}
                                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <span>View Review Document</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                                <div className="text-xs text-gray-500">
                                  {review.submittedAt?.toLocaleDateString()}
                                </div>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Not submitted</span>
                              </>
                            )}
                          </div>

                          {/* Suggested Grades */}
                          {review.suggestedGrades && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="text-xs font-medium text-blue-900 mb-1">Suggested Grades:</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-blue-800">
                                  <strong>Assignment (A):</strong> {review.suggestedGrades.assignment}/100
                                </div>
                                {review.suggestedGrades.iteration !== undefined && (
                                  <div className="text-blue-800">
                                    <strong>Iteration (I):</strong> {review.suggestedGrades.iteration}/100
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Review Grade */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={currentGrade}
                              onChange={(e) => updateTeamReviewGrade(review.reviewingTeamId, selectedSprint, Number(e.target.value))}
                              onBlur={() => setEditingGrades(prev => ({ ...prev, [review.id]: false }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                  setEditingGrades(prev => ({ ...prev, [review.id]: false }));
                                }
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingGrades(prev => ({ ...prev, [review.id]: true }))}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                              currentGrade >= 90 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              currentGrade >= 80 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              currentGrade >= 70 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                              currentGrade >= 60 ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                              currentGrade > 0 ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                              'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {currentGrade || 'Add Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm mt-6">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No peer reviews found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}