import { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import type { Student, Team, PeerReview } from '../types/types.tsx';

interface ReviewAssignmentsProps {
    student: Student;
    team: Team;
    reviewAssignments: PeerReview[];
}

export default function ReviewAssignments({ team, reviewAssignments }: ReviewAssignmentsProps) {
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const handleFileUpload = async (reviewId: string, file: File) => {
        setUploadingId(reviewId);

        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In real implementation, you would upload to your backend
        const fakeDriveLink = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;

        // Update the review assignment with the new link
        console.log('Uploading file:', file.name, 'for review:', reviewId);
        console.log('Generated link:', fakeDriveLink);

        setUploadingId(null);
        alert(`File uploaded successfully!\nGoogle Drive link: ${fakeDriveLink}`);
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
            default:
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

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Review Assignments</h2>
                <p className="text-sm text-gray-600">
                    Upload your peer review documents for assigned teams. All team members see the same review assignments. <br></br>
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
                                        {assignment.dueDate && <p className="text-sm text-gray-500">
                                            Due: {assignment.dueDate?.toLocaleDateString()}
                                        </p>}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                                    {getStatusText(assignment.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Assignment Details */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Assignment Details</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Your Team:</strong> {team.name}
                                        </p>
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Reviewing Team:</strong> Team {assignment.reviewedTeamId.replace('t', '')}
                                        </p>
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Work to Review:</strong> {assignment.reviewLink}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Grade:</strong> {0}
                                        </p>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submit Review</h4>

                                    {assignment.reviewLink ? (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                <span className="text-sm font-medium text-green-800">Review Submitted</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(assignment.reviewLink!, '_blank')}
                                                className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-800"
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span>View submitted document</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Upload your review
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
                                                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingId === assignment.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                                        }`}
                                                >
                                                    {uploadingId === assignment.id ? (
                                                        <>
                                                            <Clock className="w-4 h-4 animate-spin" />
                                                            <span>Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            <span>Upload PDF</span>
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