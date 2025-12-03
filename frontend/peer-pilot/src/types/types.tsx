export interface Student {
  id: string
  name: string
  email: string
  teamId: string
  isRep?: boolean
}

export interface Grade {
  studentId: string
  sprint: number
  assignment: AssignmentLetter
  score: number
}

export interface Team {
  id: string
  name: string
  color?: string
  students: Student[]
  isLocked: boolean // Instructor approval status
}

export interface PeerReview {
  id: string;
  sprint: number;
  reviewingTeamId: string;
  reviewedTeamId: string;
  reviewedTeamReportLink?: string,
  summaryPDFLink?: string,
  commentsPDFLink?: string,
  status: 'pending' | 'submitted' | 'graded';
  submittedAt: Date | null;
  dueDate?: Date;
  assignedWork?: string;
  suggestedGrades?: {
    assignment: number;
    iteration?: number;
  };
  reviewGrade?: number;
}

export interface StudentDashboardProps {
  student: Student;
  teams: Team[];
  students: Student[];
  grades: Grade[];
  reviewAssignments: PeerReview[];
}

export type AssignmentLetter = 'A' | 'R' | 'I' | 'C' | 'ET' | 'E'

export type Assignments = Array<AssignmentLetter>

export const assignments: Assignments = ['A', 'R', 'I', 'C', 'ET', 'E'];

export const assignmentNames = {
  A: 'Assignment',
  R: 'Peer review',
  I: 'Implementation',
  C: 'Communication',
  ET: 'Team extra', // For team grades
  E: 'Extra',
};

export interface TeamGrade {
  teamId: string;
  sprint: number;
  assignment: AssignmentLetter;
  score: number;
  comments?: string;
}

export type UserRole = 'instructor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string;
}

export interface Project {
  id: string;
  name: string;
  maxTeams: number;
  maxStudentsPerTeam: number;
  teams: Team[];
}
