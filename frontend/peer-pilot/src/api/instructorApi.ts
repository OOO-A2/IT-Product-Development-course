import type { ApiPeerReview, Grade, ReportLinkUpdate, Student, Team } from "../types/types";
import { API_BASE_URL } from "./studentApi";

export const apiService = {
    // Fetch all teams
    async fetchTeams(): Promise<Team[]> {
        const response = await fetch(`${API_BASE_URL}/teams`);
        if (!response.ok) throw new Error('Failed to fetch teams');
        const result: Team[] = await response.json();
        return result;
    },

    // Fetch all students
    async fetchStudents(): Promise<Student[]> {
        const response = await fetch(`${API_BASE_URL}/students`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const result: Student[] = await response.json();
        return result;
    },

    // Fetch grades
    async fetchGrades(): Promise<Grade[]> {
        const response = await fetch(`${API_BASE_URL}/grades`);
        if (!response.ok) throw new Error('Failed to fetch grades');
        const result: Grade[] = await response.json();
        return result;
    },

    // Save grades (batch update)
    async saveGrades(grades: Grade[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/grades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(grades),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save grades');
        }
    },

    // Get all peer reviews for a sprint
    async getPeerReviews(sprint: number): Promise<ApiPeerReview[]> {
        const response = await fetch(`${API_BASE_URL}/peer-reviews?sprint=${sprint}`);
        if (!response.ok) throw new Error('Failed to fetch peer reviews');
        return response.json();
    },


    // Update report link
    async updateReportLink(update: ReportLinkUpdate): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/peer-reviews/report-link`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
        });
        if (!response.ok) throw new Error('Failed to update report link');
    },

    // Download review PDF
    async downloadReviewPdf(reviewId: string, type: 'summary' | 'detailed'): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/peer-reviews/${reviewId}/download/${type}`, {
            headers: { 'Accept': 'application/pdf' },
        });

        if (!response.ok) throw new Error('Failed to download PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `peer-review-${type}-${reviewId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Download all files for sprint
    async downloadAllFiles(sprint: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/sprints/${sprint}/download-all`, {
            headers: { 'Accept': 'application/zip' },
        });

        if (!response.ok) throw new Error('Failed to download files');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint-${sprint}-peer-reviews.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Save all changes
    async saveChanges(gradeUpdates: Grade[], reportLinkUpdates: ReportLinkUpdate[]): Promise<void> {
        // Save grades
        if (gradeUpdates.length > 0) {
            await this.saveGrades(gradeUpdates);
        }

        // Save report links
        for (const update of reportLinkUpdates) {
            await this.updateReportLink(update);
        }
    }


};