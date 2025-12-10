import { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, ExternalLink, Download, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import type { Student, Team, PeerReview } from '../types/types.tsx';
import { API_BASE_URL } from '../api/studentApi.ts';

interface ReviewAssignmentsProps {
  student: Student;
  team: Team;
  reviews: PeerReview[];
  onUpdateReview: (reviewId: string, updates: Partial<PeerReview>) => Promise<any>;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

export default function ReviewAssignments({ team, reviews: reviews, onUpdateReview, onDeleteReview }: ReviewAssignmentsProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [suggestedGrades, setSuggestedGrades] = useState<{ [key: string]: { iteration: number; assignment: number } }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleGradeChange = (reviewId: string, field: 'iteration' | 'assignment', value: number) => {
    const validValue = Math.max(0, Math.min(100, value));
    setSuggestedGrades(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        [field]: validValue
      }
    }));

    // Clear error when user starts typing
    if (errors[reviewId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[reviewId];
        return newErrors;
      });
    }
  };

  const validateGrades = (reviewId: string): boolean => {
    const grades = suggestedGrades[reviewId];
    if (!grades || grades.assignment === undefined) {
      setErrors(prev => ({ ...prev, [reviewId]: 'Assignment grade is required' }));
      return false;
    }
    if (grades.assignment < 0 || grades.assignment > 100) {
      setErrors(prev => ({ ...prev, [reviewId]: 'Assignment grade must be between 0-100' }));
      return false;
    }
    if (grades.iteration !== undefined && (grades.iteration < 0 || grades.iteration > 100)) {
      setErrors(prev => ({ ...prev, [reviewId]: 'Iteration grade must be between 0-100' }));
      return false;
    }
    return true;
  };

  const handleFileUpload = async (reviewId: string, fileType: 'comments' | 'summary', file: File) => {
    console.log(`Uploading ${fileType} for review ${reviewId}:`, file);

    if (fileType === 'summary' && !validateGrades(reviewId)) {
      return;
    }

    setUploadingId(reviewId);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('reviewId', reviewId);
      formData.append('fileType', fileType);
      formData.append('file', file);

      // Append suggested grades for summary upload
      if (fileType === 'summary' && suggestedGrades[reviewId]) {
        formData.append('suggestedGrades', JSON.stringify(suggestedGrades[reviewId]));
      }

      // Send the file to backend API
      const response = await fetch(API_BASE_URL + '/reviews/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      const updates: Partial<PeerReview> = {
        status: 'submitted',
        submittedAt: new Date(),
      };

      if (fileType === 'summary') {
        updates.summaryPDFLink = data.fileUrl; // URL from backend
        updates.suggestedGrades = suggestedGrades[reviewId];
      } else {
        updates.commentsPDFLink = data.fileUrl; // URL from backend
      }

      // Call the parent component's update function
      await onUpdateReview(reviewId, updates);

      // Clear suggested grades for this review
      setSuggestedGrades(prev => {
        const newGrades = { ...prev };
        delete newGrades[reviewId];
        return newGrades;
      });

      alert(`${fileType === 'summary' ? 'Review summary' : 'Comments'} submitted successfully!\nFile uploaded to: ${data.fileUrl}`);

    } catch (error) {
      alert(`Failed to submit ${fileType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`Error submitting ${fileType}:`, error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review? You will need to resubmit it.')) {
      return;
    }

    setIsDeleting(reviewId);
    try {
      await onDeleteReview(reviewId);

      // Clear suggested grades for this review
      setSuggestedGrades(prev => {
        const newGrades = { ...prev };
        delete newGrades[reviewId];
        return newGrades;
      });
    } catch (error) {
      alert('Failed to delete review. Please try again.');
      console.error('Error deleting review:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusIcon = (status: PeerReview['status']) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: PeerReview['status']) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: PeerReview['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const viewWorkToReview = (assignment: PeerReview) => {
    if (assignment.reviewedTeamReportLink) {
      // Open Google Drive link in a new tab
      window.open(assignment.reviewedTeamReportLink, '_blank', 'noopener,noreferrer');
    } else {
      alert(`No work available to view for Team ${assignment.reviewedTeamId || 'unknown'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Review Assignments</h2>
        <p className="text-sm text-gray-600">
          Upload your peer review documents for assigned teams. All team members see the same review assignments. <br />
          Only one team member needs to submit the review document.
        </p>
      </div>

      {/* Review Assignments List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(review.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sprint {review.sprint} - Team Review
                    </h3>
                    {review.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(review.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                    {getStatusText(review.status)}
                  </span>
                  {review.status === 'graded' && review.reviewGrade && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Grade: {review.reviewGrade}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assignment Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700">
                      <strong>Your Team:</strong> {team.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Reviewing Team:</strong> Team {review.reviewedTeamId || 'Unknown'}
                    </p>
                    {review.reviewedTeamReportLink && (
                      <button
                        onClick={() => viewWorkToReview(review)}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Work to Review</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggested Grades */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Grades</h4>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Grade (A) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={suggestedGrades[review.id]?.assignment ?? ''}
                        onChange={(e) => handleGradeChange(review.id, 'assignment', Number(e.target.value))}
                        disabled={review.status != 'pending'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Iteration Grade (I) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={suggestedGrades[review.id]?.iteration ?? ''}
                        onChange={(e) => handleGradeChange(review.id, 'iteration', Number(e.target.value))}
                        disabled={review.status != 'pending'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0-100 (optional)"
                      />
                    </div>
                    {errors[review.id] && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[review.id]}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      * Grades are required before submission
                    </p>
                  </div>
                </div>

                {/* File Upload Sections */}
                <div className="space-y-4">
                  {/* Comments Upload */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submit Report with Comments</h4>
                    {review.commentsPDFLink ? (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-800">Comments submitted</span>
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeleting === review.id}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Delete review"
                          >
                            {isDeleting === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => window.open(review.commentsPDFLink!, '_blank')}
                            className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View comments PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Upload report with your <b>comments</b>
                          </p>

                          <input
                            type="file"
                            id={`file-comments-upload-${review.id}`}
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(review.id, 'comments', file);
                              }
                            }}
                            className="hidden"
                            disabled={uploadingId === review.id}
                          />

                          <label
                            htmlFor={`file-comments-upload-${review.id}`}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingId === review.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              }`}
                          >
                            {uploadingId === review.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Comments PDF</span>
                              </>
                            )}
                          </label>

                          <p className="text-xs text-gray-500 mt-2">
                            Max file size: 10MB • PDF format only
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Upload */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submit Review Summary</h4>
                    {review.summaryPDFLink ? (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-800">Summary submitted</span>
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeleting === review.id}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Delete review"
                          >
                            {isDeleting === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => window.open(review.summaryPDFLink!, '_blank')}
                            className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View summary PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          {review.suggestedGrades && (
                            <div className="text-sm text-gray-600 pt-2 border-t border-green-200">
                              <p><strong>Suggested Grades:</strong></p>
                              <p>Assignment: {review.suggestedGrades.assignment}/100</p>
                              {review.suggestedGrades.iteration !== undefined && (
                                <p>Iteration: {review.suggestedGrades.iteration}/100</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Upload your review <b>summary</b>
                          </p>

                          <input
                            type="file"
                            id={`file-upload-${review.id}`}
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(review.id, 'summary', file);
                              }
                            }}
                            className="hidden"
                            disabled={uploadingId === review.id || !suggestedGrades[review.id]?.assignment || !suggestedGrades[review.id]?.iteration}
                          />

                          <label
                            htmlFor={`file-upload-${review.id}`}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingId === review.id || !suggestedGrades[review.id]?.assignment || !suggestedGrades[review.id]?.iteration
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              }`}
                          >
                            {uploadingId === review.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Summary PDF</span>
                              </>
                            )}
                          </label>

                          <p className="text-xs text-gray-500 mt-2">
                            Max file size: 10MB • PDF format only
                          </p>
                          {(!suggestedGrades[review.id]?.assignment || !suggestedGrades[review.id]?.iteration) && (
                            <p className="text-xs text-red-500 mt-1">
                              Please provide assignment grade first
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No review assignments at this time</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for new assignments</p>
        </div>
      )}
    </div>
  );
}