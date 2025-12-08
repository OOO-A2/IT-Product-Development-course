import type { Grade, Student, Team } from "../types/types";

// api/studentApi.ts
const API_BASE_URL = 'http://localhost:8000';

export const studentApi = {
  // Fetch student dashboard data
  async fetchStudentDashboard(studentId: string): Promise<{
    student: Student;
    teams: Team[];
    students: Student[];
    grades: Grade[];
    reviewAssignments: any[];
  }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/students/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch student dashboard');
    return response.json();
  },

  // Fetch grades for a student
  async fetchStudentGrades(studentId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/grades?student_id=${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch grades');
    return response.json();
  },

  // Fetch peer reviews for a team
  async fetchPeerReviews(teamId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/peer-reviews?reviewing_team_id=${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch peer reviews');
    return response.json();
  },

  // Create/update a peer review
  async submitPeerReview(reviewData: any): Promise<any> {
    const method = reviewData.id ? 'PUT' : 'POST';
    const url = reviewData.id 
      ? `${API_BASE_URL}/peer-reviews/${reviewData.id}`
      : `${API_BASE_URL}/peer-reviews/`;

    const response = await fetch(url, {
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
  async deletePeerReview(reviewId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/peer-reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete peer review');
    }
  },

  // Fetch team members
  async fetchTeamMembers(teamId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/students?team_id=${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },

  // Fetch team details
  async fetchTeam(teamId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch team');
    return response.json();
  },
};