import { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, ExternalLink, Download, Trash2, AlertCircle } from 'lucide-react';
import type { Student, Team, PeerReview } from '../types/types.tsx';

interface ReviewAssignmentsProps {
  student: Student;
  team: Team;
  reviewAssignments: PeerReview[];
  onUpdateReview: (reviewId: string, updates: Partial<PeerReview>) => void;
  onDeleteReview: (reviewId: string) => void;
}

export default function ReviewAssignments({ team, reviewAssignments, onUpdateReview, onDeleteReview }: ReviewAssignmentsProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [suggestedGrades, setSuggestedGrades] = useState<{ [key: string]: { iteration: number; assignment: number } }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleFileUpload = async (reviewId: string, file: File) => {
    console.log(file)
    if (!validateGrades(reviewId)) {
      return;
    }

    setUploadingId(reviewId);

    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fakeDriveLink = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;

    // Update the review with grades and link
    onUpdateReview(reviewId, {
      summaryPDFLink: fakeDriveLink,
      status: 'submitted',
      submittedAt: new Date(),
      suggestedGrades: suggestedGrades[reviewId]
    });

    setUploadingId(null);
    alert(`Review submitted successfully!\nGoogle Drive link: ${fakeDriveLink}`);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? You will need to resubmit it.')) {
      onDeleteReview(reviewId);
      setSuggestedGrades(prev => {
        const newGrades = { ...prev };
        delete newGrades[reviewId];
        return newGrades;
      });
    }
  };

  const downloadWorkToReview = (assignment: PeerReview) => {
    // In real implementation, this would download the actual work
    alert(`Downloading work from Team ${assignment.reviewedTeamId.replace('t', '')} for Sprint ${assignment.sprint}`);

    window.open(assignment.reviewedTeamReportLink, '_blank');
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

  const getReviewGrade = (assignment: PeerReview): number => {
    // In real implementation, this would come from the backend
    // For now, return mock grade based on status
    return assignment.status === 'graded' ? (assignment.reviewGrade || 85) : 0;
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
        {reviewAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(assignment.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sprint {assignment.sprint} - Team Review
                    </h3>
                    {assignment.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {assignment.dueDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {assignment.status !== 'graded' && <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                    {getStatusText(assignment.status)}
                  </span>} 
                  {assignment.status === 'graded' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Grade: {getReviewGrade(assignment)}/100
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
                      <strong>Reviewing Team:</strong> Team {assignment.reviewedTeamId.replace('t', '')}
                    </p>
                    <button
                      onClick={() => downloadWorkToReview(assignment)}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Work to Review</span>
                    </button>
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
                        value={suggestedGrades[assignment.id]?.assignment ?? ''}
                        onChange={(e) => handleGradeChange(assignment.id, 'assignment', Number(e.target.value))}
                        disabled={assignment.status === 'submitted' || assignment.status === 'graded'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Iteration Grade (I) *
                      </label>
                      <input type="number" min="0" max="100"
                        value={suggestedGrades[assignment.id]?.iteration ?? ''}
                        onChange={(e) => handleGradeChange(assignment.id, 'iteration', Number(e.target.value))}
                        disabled={assignment.status === 'submitted' || assignment.status === 'graded'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0-100"
                      />
                    </div>
                    {errors[assignment.id] && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[assignment.id]}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      * Suggested grades are required before submission
                    </p>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Submit Report with Comments and Summary review</h4>

                  {assignment.commentsPDFLink ? (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-800">Comments submitted</span>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(assignment.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => window.open(assignment.summaryPDFLink!, '_blank')}
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

                        <input type="file" id={`file-comments-upload-${assignment.id}`} accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(assignment.id, file);
                            }
                          }}
                          className="hidden"
                          disabled={uploadingId === assignment.id}
                        />

                        <label htmlFor={`file-comments-upload-${assignment.id}`}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingId === assignment.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            }`}
                        >
                          {uploadingId === assignment.id ? (
                            <><Clock className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span></>
                          ) : (<><Upload className="w-4 h-4" />
                            <span>Upload PDF</span></>
                          )}
                        </label>

                        <p className="text-xs text-gray-500 mt-2">
                          Max file size: 10MB • PDF format only
                        </p>
                      </div>
                    </div>
                  )}
                  <br/>
                  {assignment.summaryPDFLink ? (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-800">Summary submitted</span>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(assignment.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => window.open(assignment.summaryPDFLink!, '_blank')}
                          className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View summary PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        {assignment.suggestedGrades && (
                          <div className="text-sm text-gray-600 pt-2 border-t border-green-200">
                            <p><strong>Suggested Grades:</strong></p>
                            <p>Assignment: {assignment.suggestedGrades.assignment}/100</p>
                            {assignment.suggestedGrades.iteration !== undefined && (
                              <p>Iteration: {assignment.suggestedGrades.iteration}/100</p>
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
                          id={`file-upload-${assignment.id}`}
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(assignment.id, file);
                            }
                          }}
                          className="hidden"
                          disabled={uploadingId === assignment.id}
                        />

                        <label
                          htmlFor={`file-upload-${assignment.id}`}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingId === assignment.id || !suggestedGrades[assignment.id]?.assignment || !suggestedGrades[assignment.id]?.iteration
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            }`}
                        >
                          {uploadingId === assignment.id ? (
                            <><Clock className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span></>
                          ) : (<><Upload className="w-4 h-4" />
                            <span>Upload PDF</span></>
                          )}
                        </label>

                        <p className="text-xs text-gray-500 mt-2">
                          Max file size: 10MB • PDF format only
                        </p>
                        {(!suggestedGrades[assignment.id]?.assignment || !suggestedGrades[assignment.id]?.iteration) && (
                          <p className="text-xs text-red-500 mt-1">
                            Please provide suggested grades first
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviewAssignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No review assignments at this time</p>
        </div>
      )}
    </div>
  );
}