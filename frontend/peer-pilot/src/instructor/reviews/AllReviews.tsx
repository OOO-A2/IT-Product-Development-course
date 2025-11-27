import { useEffect, useState } from 'react';
import { Search, Save, Calendar, ExternalLink, FileText, Clock, Edit, Check, X, Download } from 'lucide-react';
import { type Grade, type Student, type Team, type PeerReview, assignments, assignmentNames } from '../../types/types';
import { mockGrades, mockReviews, mockStudents, mockTeams } from '../../data/mock';
import { useSearchParams } from 'react-router-dom';
import { getGradeColor100 } from '../../utils/utils';

export default function InstructorPeerReview() {
  // Mock data
  const [teams] = useState<Team[]>(mockTeams);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>(mockReviews);
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [students] = useState<Student[]>(mockStudents);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrades, setEditingGrades] = useState<{ [key: string]: boolean }>({});
  const [editingReportLinks, setEditingReportLinks] = useState<{ [key: string]: boolean }>({});
  const [reportLinks, setReportLinks] = useState<{ [key: string]: string }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSprint, setSelectedSprint] = useState<number>(() => {
    return Number(searchParams.get('sprint')) || 1;
  });

  // Update URL when team selection changes
  useEffect(() => {
    if (selectedSprint === 1) {
      searchParams.delete('sprint');
    } else {
      searchParams.set('sprint', String(selectedSprint));
    }
    setSearchParams(searchParams);
  }, [selectedSprint, searchParams]);

  const sprints = [1, 2, 3, 4, 5];

  // Get peer reviews for current sprint
  const currentSprintReviews = peerReviews.filter(review => review.sprint === selectedSprint);

  // Get team grade for a specific assignment type
  const getTeamAssignmentGrade = (teamId: string, sprint: number, assignment: string): number => {
    const teamStudents = students.filter(student => student.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const teamGrades = teamStudents.map(student =>
      grades.find(g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment)?.score ?? 0
    );

    return Math.round(teamGrades.reduce((acc, score) => acc + score, 0) / teamGrades.length);
  };

  // Update team assignment grade
  const updateTeamAssignmentGrade = (teamId: string, sprint: number, assignment: string, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    const teamStudents = students.filter(student => student.teamId === teamId);

    setGrades(prev => {
      const updated = [...prev];

      teamStudents.forEach(student => {
        const existingIndex = updated.findIndex(
          g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment
        );

        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        } else {
          updated.push({ studentId: student.id, sprint, assignment, score: validScore });
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

  // Download detailed review with comments (mock function)
  const downloadDetailedReview = (reviewId: string) => {
    const review = peerReviews.find(r => r.id === reviewId);
    if (review) {
      const fakeDetailedReviewLink = `https://drive.google.com/file/d/detailed-${reviewId}/view`;
      window.open(fakeDetailedReviewLink, '_blank');
      alert(`Downloading detailed review with comments for ${review.reviewingTeamId}`);
    }
  };

  // Download all files for current sprint
  const downloadAllFiles = () => {
    const filesToDownload = currentSprintReviews.flatMap(review => {
      const files = [];

      if (review.reviewLink) {
        files.push({
          name: `summary-review-${review.reviewingTeamId}-sprint-${selectedSprint}.pdf`,
          url: review.reviewLink
        });
      }

      // Add detailed review (mock)
      files.push({
        name: `detailed-review-${review.reviewingTeamId}-sprint-${selectedSprint}.pdf`,
        url: `https://drive.google.com/file/d/detailed-${review.id}/view`
      });

      return files;
    });

    // Simulate batch download
    console.log('Downloading all files:', filesToDownload);
    alert(`Preparing to download ${filesToDownload.length} files for Sprint ${selectedSprint}`);

    // In real implementation, this would trigger batch download
    filesToDownload.forEach(file => {
      window.open(file.url, '_blank');
    });
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
              <button
                onClick={downloadAllFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All Sprint Files</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              {unsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
              )}
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
                    Download Review Documents & Suggested Grades
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={5}>
                    Reviewing Team Grades
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map(review => {
                  const reviewingTeam = teams.find(t => t.id === review.reviewingTeamId);
                  const reviewedTeam = teams.find(t => t.id === review.reviewedTeamId);
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

                      {/* Review Documents & Suggested Grades */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-3">
                          {/* Review Documents */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {review.reviewLink ? (
                                <>
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() => downloadReview(review.reviewLink!)}
                                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <span>Summary Review</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => downloadDetailedReview(review.id)}
                                      className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                                    >
                                      <span>Review with Comments</span>
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </div>
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
                          </div>

                          {/* Suggested Grades */}
                          {review.suggestedGrades && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="text-xs font-medium text-blue-900 mb-2">Suggested Grades:</div>
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

                      {/* Team Grades - All 5 assignment types */}
                      {assignments.map(assignment => {
                        if (assignment === 'E') return
                        const currentGrade = getTeamAssignmentGrade(review.reviewingTeamId, selectedSprint, assignment);
                        const isEditing = editingGrades[`${review.id}-${assignment}`];

                        return (
                          <td key={`${review.id}-${assignment}`} className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="text-xs font-medium text-gray-500">
                                {assignmentNames[assignment]}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <input type="number" min="0" max="100"
                                    value={currentGrade}
                                    onChange={(e) => updateTeamAssignmentGrade(review.reviewingTeamId, selectedSprint, assignment, Number(e.target.value))}
                                    onBlur={() => setEditingGrades(prev => ({ ...prev, [`${review.id}-${assignment}`]: false }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === 'Escape') {
                                        setEditingGrades(prev => ({ ...prev, [`${review.id}-${assignment}`]: false }));
                                      }
                                    }}
                                    autoFocus
                                    className="w-16 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-sm"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingGrades(prev => ({ ...prev, [`${review.id}-${assignment}`]: true }))}
                                  className={`w-16 px-2 py-1 rounded font-medium transition-colors text-sm ${getGradeColor100(currentGrade)}`}
                                >
                                  {currentGrade || '-'}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
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