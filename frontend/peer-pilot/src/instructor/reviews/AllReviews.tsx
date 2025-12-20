import { useEffect, useState, useCallback } from 'react';
import { Search, Save, Calendar, ExternalLink, FileText, Clock, Edit, Check, X, Download, RefreshCw } from 'lucide-react';
import { type Grade, type Student, type Team, type PeerReview, assignments, assignmentNames, type AssignmentLetter, type ApiPeerReview, type ReportLinkUpdate } from '../../types/types';
import { getGradeColor100 } from '../../utils/utils';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../api/instructorApi';

interface ReviewWithTeams extends PeerReview {
  reviewingTeam: Team;
  reviewedTeam: Team;
}

export default function InstructorPeerReview() {
  // State for data from backend
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [peerReviews, setPeerReviews] = useState<ReviewWithTeams[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Local editing state
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrades, setEditingGrades] = useState<{ [key: string]: boolean }>({});
  const [editingReportLinks, setEditingReportLinks] = useState<{ [key: string]: boolean }>({});
  const [reportLinks, setReportLinks] = useState<{ [key: string]: string }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Track changes for batch saving
  const [pendingGradeUpdates, setPendingGradeUpdates] = useState<Grade[]>([]);
  const [pendingReportLinkUpdates, setPendingReportLinkUpdates] = useState<ReportLinkUpdate[]>([]);

  // URL state for sprint filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSprint, setSelectedSprint] = useState<number>(() => {
    return Number(searchParams.get('sprint')) || 1;
  });

  // Update URL when sprint changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (selectedSprint === 1) {
      newParams.delete('sprint');
    } else {
      newParams.set('sprint', String(selectedSprint));
    }

    setSearchParams(newParams, { replace: true });
  }, [selectedSprint, setSearchParams, searchParams]);

  const sprints = [1, 2, 3, 4, 5, 6, 7, 8];

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [teamsData, studentsData, gradesData, reviewsData] = await Promise.all([
        apiService.fetchTeams(),
        apiService.fetchStudents(),
        apiService.fetchGrades(),
        apiService.getPeerReviews(selectedSprint),
      ]);

      setStudents(studentsData || []);
      setGrades(gradesData || []);

      // Add teams to review by team ids
      reviewsData.forEach(r => {
        r.reviewingTeam = teamsData.find(t => t.id === r.reviewingTeamId) as Team
        r.reviewedTeam = teamsData.find(t => t.id === r.reviewedTeamId) as Team
      })

      setPeerReviews(reviewsData || []);

      // Initialize report links from existing data
      const initialReportLinks: { [key: string]: string } = {};
      reviewsData.forEach((review: ApiPeerReview) => {
        const key = `${review.reviewedTeamId}-${selectedSprint}`;

        if (review.reviewedTeamReportLink) {
          // нормальный путь — берём из отдельного поля
          initialReportLinks[key] = review.reviewedTeamReportLink;
        } else if (review.assignedWork) {
          // fallback на старое поведение, если где-то остались старые данные
          const match = review.assignedWork.match(/https?:\/\/[^\s]+/);
          if (match) {
            initialReportLinks[key] = match[0];
          }
        }
      });

      setReportLinks(initialReportLinks);

      // Reset pending changes
      setPendingGradeUpdates([]);
      setPendingReportLinkUpdates([]);
      setUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSprint]);

  // Fetch data when sprint changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate team average for an assignment
  const getTeamAssignmentGrade = (teamId: string, assignment: AssignmentLetter): number => {
    if (assignment === 'E') return 0;

    const teamStudents = students.filter(student => student.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const teamGrades = teamStudents.map(student => {
      const grade = grades.find(
        g => g.studentId === student.id && g.sprint === selectedSprint && g.assignment === assignment
      );
      return grade?.score || 0;
    });

    const average = teamGrades.reduce((acc, score) => acc + score, 0) / teamGrades.length;
    return Math.round(average);
  };

  // Update team assignment grade
  const updateTeamAssignmentGrade = (teamId: string, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    const teamStudents = students.filter(student => student.teamId === teamId);

    const updatedGrades: Grade[] = teamStudents.map(student => {
      const existingGrade = grades.find(
        g => g.studentId === student.id &&
          g.sprint === selectedSprint &&
          g.assignment === assignment
      );

      return {
        studentId: student.id,
        sprint: selectedSprint,
        assignment,
        score: validScore,
        ...(existingGrade?.id && { id: existingGrade.id }),
      };
    });

    // Update local state
    setGrades(prev => {
      const newGrades = [...prev];
      updatedGrades.forEach(updatedGrade => {
        const existingIndex = newGrades.findIndex(
          g => g.studentId === updatedGrade.studentId &&
            g.sprint === updatedGrade.sprint &&
            g.assignment === updatedGrade.assignment
        );

        if (existingIndex >= 0) {
          newGrades[existingIndex] = updatedGrade;
        } else {
          newGrades.push(updatedGrade);
        }
      });
      return newGrades;
    });

    // Track pending updates (remove duplicates)
    setPendingGradeUpdates(prev => {
      const newUpdates = prev.filter(
        g => !(g.sprint === selectedSprint && g.assignment === assignment)
      );
      return [...newUpdates, ...updatedGrades];
    });

    setUnsavedChanges(true);
  };

  // Update report link
  const updateReportLink = (reviewingTeamId: string, reviewedTeamId: string, link: string) => {
    const key = `${reviewedTeamId}-${selectedSprint}`;
    setReportLinks(prev => ({ ...prev, [key]: link }));

    const update: ReportLinkUpdate = {
      reviewingTeamId,
      reviewedTeamId,
      sprint: selectedSprint,
      reportLink: link
    };

    // Track pending updates
    setPendingReportLinkUpdates(prev => {
      const existingIndex = prev.findIndex(
        u => u.reviewingTeamId === reviewingTeamId &&
          u.reviewedTeamId === reviewedTeamId &&
          u.sprint === selectedSprint
      );

      if (existingIndex >= 0) {
        const newUpdates = [...prev];
        newUpdates[existingIndex] = update;
        return newUpdates;
      }
      return [...prev, update];
    });

    setUnsavedChanges(true);
  };

  // Save all changes
  const handleSave = async () => {
    if (pendingGradeUpdates.length === 0 && pendingReportLinkUpdates.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      await apiService.saveChanges(pendingGradeUpdates, pendingReportLinkUpdates);

      // Clear pending changes
      setPendingGradeUpdates([]);
      setPendingReportLinkUpdates([]);
      setUnsavedChanges(false);

      // Refresh data to ensure consistency
      await fetchData();

      alert('Changes saved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
      alert(`Error saving changes: ${errorMessage}`);
      console.error('Error saving changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Download review PDF
  const handleDownloadPdf = async (reviewId: string, type: 'summary' | 'detailed') => {
    try {
      await apiService.downloadReviewPdf(reviewId, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      alert(`Error downloading PDF: ${errorMessage}`);
      console.error('Error downloading PDF:', err);
    }
  };

  // Download all files for sprint
  const handleDownloadAllFiles = async () => {
    try {
      await apiService.downloadAllFiles(selectedSprint);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download files';
      alert(`Error downloading files: ${errorMessage}`);
      console.error('Error downloading files:', err);
    }
  };

  // Filter reviews based on search query
  const filteredReviews = peerReviews
    .filter(review => {
      return review.reviewingTeam?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewedTeam?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Get report link for a reviewed team
  const getReportLink = (reviewedTeamId: string): string => {
    return reportLinks[`${reviewedTeamId}-${selectedSprint}`] || '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading peer reviews...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md">
          <div className="text-red-600 font-semibold mb-4">Error Loading Data</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
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
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleDownloadAllFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All Sprint Files</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!unsavedChanges || isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              {unsavedChanges && (
                <span className="text-orange-600 font-medium">
                  {pendingGradeUpdates.length + pendingReportLinkUpdates.length} unsaved change{(pendingGradeUpdates.length + pendingReportLinkUpdates.length) !== 1 ? 's' : ''}
                </span>
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
                <span className="font-medium">{peerReviews.filter(r => r.status === 'submitted').length}</span> of{' '}
                <span className="font-medium">{peerReviews.length}</span> reviews submitted
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
                  const isEditingReportLink = editingReportLinks[review.id];
                  const currentReportLink = getReportLink(review.reviewedTeamId);

                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      {/* Reviewing Team */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${review.reviewingTeam.color} mr-3`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{review.reviewingTeam.name}</div>
                            <div className="text-sm text-gray-500">
                              {students.filter(s => s.teamId === review.reviewingTeamId).length} members
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reviewed Team */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${review.reviewedTeam.color} mr-3`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{review.reviewedTeam.name}</div>
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
                                onChange={(e) => updateReportLink(review.reviewingTeamId, review.reviewedTeamId, e.target.value)}
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
                                  updateReportLink(review.reviewingTeamId, review.reviewedTeamId, '');
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
                              {review.summaryPDFLink ? (
                                <>
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() => handleDownloadPdf(review.id, 'summary')}
                                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <span>Summary Review (PDF)</span>
                                      <Download className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadPdf(review.id, 'detailed')}
                                      className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                                    >
                                      <span>Review with Comments (PDF)</span>
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : 'Not submitted'}
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

                      {/* Team Grades - A, R, I, C (excluding E) */}
                      {assignments.filter(assignment => assignment !== 'E').map(assignment => {
                        const currentGrade = getTeamAssignmentGrade(review.reviewingTeamId, assignment);
                        const cellId = `${review.id}-${assignment}`;
                        const isEditing = editingGrades[cellId];

                        return (
                          <td key={cellId} className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="text-xs font-medium text-gray-500">
                                {assignmentNames[assignment]}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={currentGrade}
                                    onChange={(e) => updateTeamAssignmentGrade(review.reviewingTeamId, assignment, Number(e.target.value))}
                                    onBlur={() => setEditingGrades(prev => ({ ...prev, [cellId]: false }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === 'Escape') {
                                        setEditingGrades(prev => ({ ...prev, [cellId]: false }));
                                      }
                                    }}
                                    autoFocus
                                    className="w-16 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-sm"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingGrades(prev => ({ ...prev, [cellId]: true }))}
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