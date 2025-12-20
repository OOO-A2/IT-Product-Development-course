import type { Grade, Student, Team } from "../types/types";


function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("access_token");

  // Normalize HeadersInit into a plain object
  const baseHeaders: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        baseHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers) {
        baseHeaders[key] = value;
      }
    } else {
      Object.assign(baseHeaders, options.headers);
    }
  }

  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers: baseHeaders,
  });
}

// api/studentApi.ts
export const API_BASE_URL = 'http://localhost:8000';

export const studentApi = {
  // Fetch student dashboard data
  async fetchStudentDashboard(studentId: string): Promise<{
    student: Student;
    teams: Team[];
    students: Student[];
    grades: Grade[];
    reviewAssignments: any[];
  }> {
    const response = await authFetch(`${API_BASE_URL}/dashboard/students/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch student dashboard');
    return response.json();
  },

  // Fetch grades for a student
  async fetchStudentGrades(studentId: string): Promise<any[]> {
    const response = await authFetch(`${API_BASE_URL}/grades?student_id=${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch grades');
    return response.json();
  },

  // Fetch peer reviews for a team
  async fetchPeerReviews(teamId: string): Promise<any[]> {
    const response = await authFetch(`${API_BASE_URL}/peer-reviews?reviewing_team_id=${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch peer reviews');
    return response.json();
  },

  async uploadFile(reviewId: string, fileType: 'comments' | 'summary', file: File, suggestedGrades: {[key: string]: { iteration: number; assignment: number }}): Promise<{fileUrl: string}> {
    const formData = new FormData();
    formData.append('reviewId', reviewId);
    formData.append('fileType', fileType);
    formData.append('file', file);

    // Append suggested grades for summary upload
    if (fileType === 'summary' && suggestedGrades[reviewId]) {
      formData.append('suggestedGrades', JSON.stringify(suggestedGrades[reviewId]));
    }

    // Send the file to backend API
    const response = await authFetch(API_BASE_URL + '/peer-reviews/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    return await response.json();
  },



  // Create/update a peer review
  async submitPeerReview(reviewData: any): Promise<any> {
    const method = reviewData.id ? 'PUT' : 'POST';
    const url = reviewData.id
      ? `${API_BASE_URL}/peer-reviews/${reviewData.id}`
      : `${API_BASE_URL}/peer-reviews/`;

    const response = await authFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit peer review');
    }

    return response.json();
  },

  // Delete a peer review
  async deleteReviewFile(
    reviewId: string,
    fileType: 'comments' | 'summary',
  ): Promise<void> {
    const response = await authFetch(
      `${API_BASE_URL}/peer-reviews/${reviewId}/file/${fileType}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
        errorData.message ||
        `Delete failed with status ${response.status}`,
      );
    }
  },

  // Fetch team members
  async fetchTeamMembers(teamId: string): Promise<any[]> {
    const response = await authFetch(`${API_BASE_URL}/students?team_id=${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },

  // Fetch team details
  async fetchTeam(teamId: string): Promise<any> {
    const response = await authFetch(`${API_BASE_URL}/teams/${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch team');
    return response.json();
  },
};